# Per-User Upload Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the process-global `uploadedFile` singleton with a per-upload UUID token so concurrent users each track their own file, and fix the client-side bug where re-selecting the same file after a check does nothing.

**Architecture:** The upload endpoint generates a UUID, stores file metadata in an in-memory `Map` keyed by that UUID, and returns the UUID to the client. The client stores the UUID and sends it in the Check request body. After Check finishes the server deletes the map entry, the client resets the file input and all upload state. A `setInterval` sweeper removes entries that expired without a Check being run.

**Tech Stack:** Node.js 22 (built-in `crypto.randomUUID()`), Express 4, Mocha/assert for tests.

---

## Files

| Action | File | Change |
|--------|------|--------|
| Modify | `GEDquality.js` | Replace global singleton with Map; update upload + check handlers; add cleanup + TTL sweeper |
| Modify | `public/gedquality-app.js` | Replace boolean flag with fileId; send fileId in check; add resetUploadState |
| Modify | `test/serverIntegrationTest.js` | Add static-analysis tests for new structure |

---

### Task 1: Add tests for server-side token structure

**Files:**
- Modify: `test/serverIntegrationTest.js`

- [ ] **Step 1: Add the new test cases**

Open `test/serverIntegrationTest.js` and append a new `describe` block at the bottom, before the closing `});` of the outer `describe`:

```js
    describe('Token-Based Upload Tracking', function() {
        it('should not use global uploadedFile singleton', function() {
            const serverPath = path.join(__dirname, '../GEDquality.js');
            const content = fs.readFileSync(serverPath, 'utf8');
            assert(!content.includes('let uploadedFile'),
                'Server must not use a global uploadedFile variable');
        });

        it('should declare an uploadedFiles Map', function() {
            const serverPath = path.join(__dirname, '../GEDquality.js');
            const content = fs.readFileSync(serverPath, 'utf8');
            assert(content.includes('const uploadedFiles = new Map()'),
                'Server must declare uploadedFiles as a Map');
        });

        it('should use crypto.randomUUID in upload handler', function() {
            const serverPath = path.join(__dirname, '../GEDquality.js');
            const content = fs.readFileSync(serverPath, 'utf8');
            assert(content.includes('crypto.randomUUID()'),
                'Upload handler must generate a UUID per upload');
        });

        it('should return fileId from upload endpoint', function() {
            const serverPath = path.join(__dirname, '../GEDquality.js');
            const content = fs.readFileSync(serverPath, 'utf8');
            assert(content.includes('fileId'),
                'Upload endpoint must return a fileId');
        });

        it('should read fileId from check request body', function() {
            const serverPath = path.join(__dirname, '../GEDquality.js');
            const content = fs.readFileSync(serverPath, 'utf8');
            assert(content.includes('req.body.fileId') || content.includes('const { fileId }'),
                'Check endpoint must read fileId from request body');
        });

        it('should set up TTL sweeper with setInterval', function() {
            const serverPath = path.join(__dirname, '../GEDquality.js');
            const content = fs.readFileSync(serverPath, 'utf8');
            assert(content.includes('setInterval'),
                'Server must set up a TTL sweeper for expired uploads');
        });
    });
```

- [ ] **Step 2: Run tests — expect new tests to fail**

```bash
npm test
```

Expected: the 4 new token-structure tests fail; the original 10 still pass.

---

### Task 2: Update the server — replace global with Map

**Files:**
- Modify: `GEDquality.js` lines 9–43 (require block through `let uploadedFile`)

- [ ] **Step 1: Add `crypto` require and replace the global**

Find this block at the top of `GEDquality.js`:

```js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const os = require('os');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
```

Replace with:

```js
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const os = require('os');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
```

- [ ] **Step 2: Replace the global singleton declaration**

Find:
```js
// Store uploaded file temporarily
let uploadedFile = null;
```

Replace with:
```js
const uploadedFiles = new Map(); // fileId → { path, originalName, size, expires }
```

- [ ] **Step 3: Run tests — expect no regressions yet**

```bash
npm test
```

Expected: new token tests still fail (handler not updated yet); original 10 still pass.

---

### Task 3: Update the upload endpoint to return a fileId

**Files:**
- Modify: `GEDquality.js` — `POST /api/upload-gedcom` handler

- [ ] **Step 1: Replace the handler body**

Find the upload handler (starts with `app.post('/api/upload-gedcom', uploadLimiter, upload.single('gedcom'), (req, res) => {`). Replace its entire `try` block body with:

```js
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const fixedFilename = fixFilenameEncoding(req.file.originalname);
        const fileId = crypto.randomUUID();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

        uploadedFiles.set(fileId, {
            path: req.file.path,
            originalName: fixedFilename,
            size: req.file.size,
            expires
        });

        res.json({
            success: true,
            fileId,
            fileName: fixedFilename,
            message: 'GEDCOM file uploaded successfully'
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload GEDCOM file'
        });
    }
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: `should use crypto.randomUUID`, `should return fileId`, `should declare an uploadedFiles Map`, `should not use global uploadedFile singleton` all pass now. `should read fileId from check request body` and `should set up TTL sweeper` still fail.

---

### Task 4: Update the check endpoint to use fileId

**Files:**
- Modify: `GEDquality.js` — `POST /api/check` handler

- [ ] **Step 1: Replace the check handler body**

Find `app.post('/api/check', uploadLimiter, async (req, res) => {`. Replace its entire `try` block with:

```js
    try {
        const { fileId } = req.body;

        if (!fileId) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a GEDCOM file first'
            });
        }

        const fileInfo = uploadedFiles.get(fileId);

        if (!fileInfo || Date.now() > fileInfo.expires) {
            if (fileInfo) cleanupUploadedFile(fileId);
            return res.status(400).json({
                success: false,
                error: 'Upload not found or expired. Please upload again.'
            });
        }

        // Process the GEDCOM file
        let gedModel;
        try {
            const gedReader = new GedReader();
            gedModel = gedReader.read(fileInfo.path);
        } catch (error) {
            console.error('Error processing GEDCOM file:', error);
            cleanupUploadedFile(fileId);
            return res.status(500).json({
                success: false,
                error: 'Failed to process GEDCOM file'
            });
        }

        // Run integrity checks
        let integrityReport;
        try {
            const checker = new GedcomIntegrityChecker(gedModel);
            integrityReport = checker.checkIntegrity();
        } catch (error) {
            console.error('Error running integrity checks:', error);
            cleanupUploadedFile(fileId);
            return res.status(500).json({
                success: false,
                error: 'Failed to run integrity checks'
            });
        }

        const results = formatResults(fileInfo.originalName, integrityReport);
        cleanupUploadedFile(fileId);

        res.json({
            success: true,
            results: results
        });

    } catch (error) {
        console.error('Error in check endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Processing failed'
        });
    }
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: `should read fileId from check request body` now passes. Only `should set up TTL sweeper` still fails.

---

### Task 5: Replace cleanupUploadedFile and add TTL sweeper

**Files:**
- Modify: `GEDquality.js` — `cleanupUploadedFile` function and sweeper

- [ ] **Step 1: Replace the cleanup function**

Find:
```js
// Helper function to clean up uploaded file
function cleanupUploadedFile() {
    try {
        if (uploadedFile && fs.existsSync(uploadedFile.path)) {
            fs.unlinkSync(uploadedFile.path);
        }
        // Reset the uploaded file
        uploadedFile = null;
    } catch (error) {
        console.error('Error cleaning up uploaded file:', error);
    }
}
```

Replace with:

```js
function cleanupUploadedFile(fileId) {
    const fileInfo = uploadedFiles.get(fileId);
    if (fileInfo) {
        try { fs.unlinkSync(fileInfo.path); } catch (_) {}
        uploadedFiles.delete(fileId);
    }
}

setInterval(() => {
    const now = Date.now();
    for (const [fileId, fileInfo] of uploadedFiles) {
        if (now > fileInfo.expires) {
            try { fs.unlinkSync(fileInfo.path); } catch (_) {}
            uploadedFiles.delete(fileId);
        }
    }
}, 5 * 60 * 1000);
```

- [ ] **Step 2: Run the full test suite**

```bash
npm test
```

Expected: all 16 tests pass (10 original + 6 new token-structure tests).

- [ ] **Step 3: Commit server changes**

```bash
git add GEDquality.js test/serverIntegrationTest.js
git commit -m "refactor: replace global uploadedFile singleton with per-upload UUID token map"
```

---

### Task 6: Update the client — store and send fileId

**Files:**
- Modify: `public/gedquality-app.js`

- [ ] **Step 1: Replace the upload tracking flag**

Find:
```js
    let uploadedGedcomFile = false;
```

Replace with:
```js
    let uploadedFileId = null;
```

- [ ] **Step 2: Update uploadGedcomFile to store fileId**

Find this block inside `uploadGedcomFile`:
```js
            if (result.success) {
                gedcomFileName.textContent = result.fileName;
                gedcomFileName.style.display = 'inline';
                uploadedGedcomFile = true;
                checkBtn.disabled = false;
                hideError();
```

Replace with:
```js
            if (result.success) {
                gedcomFileName.textContent = result.fileName;
                gedcomFileName.style.display = 'inline';
                uploadedFileId = result.fileId;
                checkBtn.disabled = false;
                hideError();
```

- [ ] **Step 3: Update the form submit guard**

Find:
```js
        if (!uploadedGedcomFile) {
            showError('Please upload a GEDCOM file first');
            return;
        }
```

Replace with:
```js
        if (!uploadedFileId) {
            showError('Please upload a GEDCOM file first');
            return;
        }
```

- [ ] **Step 4: Update checkIntegrity to send fileId**

Find the fetch call inside `checkIntegrity`:
```js
            const response = await fetch('/api/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
```

Replace with:
```js
            const response = await fetch('/api/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fileId: uploadedFileId })
            });
```

- [ ] **Step 5: Add resetUploadState and call it from finally**

Add this function inside the `DOMContentLoaded` callback, after `hideError`:

```js
    function resetUploadState() {
        uploadedFileId = null;
        gedcomFile.value = '';
        gedcomFileName.textContent = '';
        gedcomFileName.style.display = 'none';
        checkBtn.disabled = true;
    }
```

Find the `finally` block in `checkIntegrity`:
```js
        } finally {
            // Reset button state
            btnText.style.display = 'inline';
            btnSpinner.style.display = 'none';
            checkBtn.disabled = false;
        }
```

Replace with:
```js
        } finally {
            btnText.style.display = 'inline';
            btnSpinner.style.display = 'none';
            resetUploadState();
        }
```

- [ ] **Step 6: Run the full test suite**

```bash
npm test
```

Expected: all 16 tests pass.

- [ ] **Step 7: Commit client changes**

```bash
git add public/gedquality-app.js
git commit -m "fix: store fileId from upload and reset file input after each check"
```

---

### Task 7: Manual verification

- [ ] **Step 1: Start the server**

```bash
npm start
```

Open `http://localhost:3001` in a browser.

- [ ] **Step 2: Verify basic flow**

1. Upload a `.ged` file → confirm filename appears in UI
2. Click Check → confirm results appear
3. Confirm the filename display resets (file must be re-uploaded for next check)

- [ ] **Step 3: Verify second-upload fix**

1. Upload a `.ged` file, click Check, see results
2. Without refreshing, upload the **same file** again via the file picker
3. Confirm the filename appears and Check button enables (file input was cleared so `change` event fires)
4. Click Check → confirm results appear again

- [ ] **Step 4: Verify multi-user isolation (two tabs)**

1. Open two browser tabs to `http://localhost:3001`
2. Upload `file-A.ged` in tab 1 (do not click Check yet)
3. Upload `file-B.ged` in tab 2 (do not click Check yet)
4. Click Check in tab 1 → confirm results match file A
5. Click Check in tab 2 → confirm results match file B

- [ ] **Step 5: Commit verification note**

```bash
git commit --allow-empty -m "chore: manual verification complete for per-user upload tracking"
```
