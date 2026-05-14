# Per-User Upload Tracking — Design Spec

**Date:** 2026-05-14
**Status:** Approved

## Problem

`GEDquality.js` uses a process-global `let uploadedFile = null` to track the most recently uploaded GEDCOM file. When multiple users access the server concurrently, any upload overwrites the global, causing one user's Check to process another user's file. Additionally, after a Check completes the client does not reset the file input, so selecting the same file again silently fails to trigger a new upload.

## Approach

Token-based file tracking. The upload endpoint generates a UUID per upload and stores the file metadata in a server-side `Map`. The client receives the UUID (`fileId`) and passes it in the Check request body. After Check completes, the server deletes the map entry and the client resets to a clean upload state.

No new production dependencies are required (`crypto.randomUUID()` is built into Node 22).

## Server Changes — `GEDquality.js`

### State

Replace:
```js
let uploadedFile = null;
```
With:
```js
const uploadedFiles = new Map(); // fileId → { path, originalName, size, expires }
```

### Upload endpoint (`POST /api/upload-gedcom`)

1. Generate `const fileId = crypto.randomUUID()`
2. Store `uploadedFiles.set(fileId, { path: req.file.path, originalName: fixedFilename, size: req.file.size, expires: Date.now() + 10 * 60 * 1000 })`
3. Return `{ success: true, fileId, fileName: fixedFilename }`

### Check endpoint (`POST /api/check`)

1. Read `const { fileId } = req.body`
2. Look up `const fileInfo = uploadedFiles.get(fileId)`
3. If not found or `Date.now() > fileInfo.expires`, return 400 `{ error: 'Upload not found or expired. Please upload again.' }`
4. Proceed with integrity check using `fileInfo.path` and `fileInfo.originalName`
5. Call `cleanupUploadedFile(fileId)` after processing (success or error)

### Cleanup

```js
function cleanupUploadedFile(fileId) {
    const fileInfo = uploadedFiles.get(fileId);
    if (fileInfo) {
        try { fs.unlinkSync(fileInfo.path); } catch (_) {}
        uploadedFiles.delete(fileId);
    }
}
```

### TTL sweeper

```js
setInterval(() => {
    const now = Date.now();
    for (const [fileId, fileInfo] of uploadedFiles) {
        if (now > fileInfo.expires) {
            try { fs.unlinkSync(fileInfo.path); } catch (_) {}
            uploadedFiles.delete(fileId);
        }
    }
}, 5 * 60 * 1000); // runs every 5 minutes
```

## Client Changes — `public/gedquality-app.js`

### State

Replace:
```js
let uploadedGedcomFile = false;
```
With:
```js
let uploadedFileId = null;
```

### After upload (`uploadGedcomFile`)

Store the returned `fileId`:
```js
uploadedFileId = result.fileId;
```

Update the guard in the form submit handler:
```js
if (!uploadedFileId) {
    showError('Please upload a GEDCOM file first');
    return;
}
```

### Check request (`checkIntegrity`)

Include `fileId` in the POST body:
```js
body: JSON.stringify({ fileId: uploadedFileId })
```

### After check — reset upload state

Add a `resetUploadState()` helper and call it in `checkIntegrity`'s `finally` block:

```js
function resetUploadState() {
    uploadedFileId = null;
    gedcomFile.value = '';           // allows same file to be selected again
    gedcomFileName.textContent = '';
    gedcomFileName.style.display = 'none';
    checkBtn.disabled = true;
}
```

Calling this in `finally` ensures reset happens on success, error, and network failure — leaving the form ready for the next upload.

## Error Handling

| Scenario | Server response | Client display |
|----------|----------------|----------------|
| Check called with no fileId | 400 — Upload not found or expired | showError |
| fileId not in map (expired or consumed) | 400 — Upload not found or expired | showError |
| Second upload before first Check | Old fileId abandoned, cleaned up by TTL sweeper | No issue |
| Same file selected again after Check | `gedcomFile.value = ''` reset allows `change` event to fire | Works correctly |

## Testing

- Existing 10-unit test suite must continue to pass with no changes
- Manual: upload → check → upload same file again → check (verifies file input reset)
- Manual: two browser tabs simultaneously upload and check different files (verifies isolation)
