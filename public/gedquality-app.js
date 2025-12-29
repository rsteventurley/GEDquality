/**
 * GEDquality Frontend JavaScript
 * Handles file upload and integrity check UI
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const gedcomFile = document.getElementById('gedcomFile');
    const gedcomUploadBtn = document.getElementById('gedcomUploadBtn');
    const gedcomFileName = document.getElementById('gedcomFileName');
    const dataForm = document.getElementById('dataForm');
    const checkBtn = document.getElementById('checkBtn');
    const resultsArea = document.getElementById('resultsArea');
    const errorDiv = document.getElementById('error');
    const errorContent = document.getElementById('errorContent');
    const saveBtn = document.getElementById('saveBtn');
    const helpBtn = document.getElementById('helpBtn');

    // Modal elements
    const helpModal = document.getElementById('helpModal');
    const closeHelpModal = document.getElementById('closeHelpModal');
    const closeHelp = document.getElementById('closeHelp');
    const saveFileModal = document.getElementById('saveFileModal');
    const closeSaveFileModal = document.getElementById('closeSaveFileModal');
    const saveFileOk = document.getElementById('saveFileOk');
    const saveFileCancel = document.getElementById('saveFileCancel');
    const fileNameInput = document.getElementById('fileName');

    let uploadedGedcomFile = false;

    // File upload handlers
    gedcomUploadBtn.addEventListener('click', function() {
        gedcomFile.click();
    });

    gedcomFile.addEventListener('change', async function() {
        if (this.files.length > 0) {
            const file = this.files[0];
            await uploadGedcomFile(file);
        }
    });

    // Form submission
    dataForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!uploadedGedcomFile) {
            showError('Please upload a GEDCOM file first');
            return;
        }

        await checkIntegrity();
    });

    // Help button
    helpBtn.addEventListener('click', function() {
        helpModal.style.display = 'block';
    });

    closeHelpModal.addEventListener('click', function() {
        helpModal.style.display = 'none';
    });

    closeHelp.addEventListener('click', function() {
        helpModal.style.display = 'none';
    });

    // Save button
    saveBtn.addEventListener('click', function() {
        if (resultsArea.value) {
            saveFileModal.style.display = 'block';
            fileNameInput.value = 'integrity-report.txt';
            fileNameInput.select();
        }
    });

    closeSaveFileModal.addEventListener('click', function() {
        saveFileModal.style.display = 'none';
    });

    saveFileCancel.addEventListener('click', function() {
        saveFileModal.style.display = 'none';
    });

    saveFileOk.addEventListener('click', function() {
        const fileName = fileNameInput.value.trim();
        if (fileName) {
            downloadResults(fileName);
            saveFileModal.style.display = 'none';
        }
    });

    // Close modals on outside click
    window.addEventListener('click', function(event) {
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
        }
        if (event.target === saveFileModal) {
            saveFileModal.style.display = 'none';
        }
    });

    /**
     * Upload GEDCOM file
     */
    async function uploadGedcomFile(file) {
        const formData = new FormData();
        formData.append('gedcom', file);

        try {
            const response = await fetch('/api/upload-gedcom', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                gedcomFileName.textContent = result.fileName;
                gedcomFileName.style.display = 'inline';
                uploadedGedcomFile = true;
                checkBtn.disabled = false;
                hideError();
            } else {
                showError(result.error || 'Failed to upload GEDCOM file');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showError('Network error during file upload');
        }
    }

    /**
     * Check GEDCOM integrity
     */
    async function checkIntegrity() {
        // Show loading state
        const btnText = checkBtn.querySelector('.btn-text');
        const btnSpinner = checkBtn.querySelector('.btn-spinner');
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline';
        checkBtn.disabled = true;

        try {
            const response = await fetch('/api/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                resultsArea.value = result.results;
                hideError();
            } else {
                showError(result.error || 'Failed to check integrity');
            }
        } catch (error) {
            console.error('Check error:', error);
            showError('Network error during integrity check');
        } finally {
            // Reset button state
            btnText.style.display = 'inline';
            btnSpinner.style.display = 'none';
            checkBtn.disabled = false;
        }
    }

    /**
     * Download results as text file
     */
    function downloadResults(fileName) {
        const content = resultsArea.value;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Show error message
     */
    function showError(message) {
        errorContent.textContent = message;
        errorDiv.style.display = 'block';
        resultsArea.value = '';
    }

    /**
     * Hide error message
     */
    function hideError() {
        errorDiv.style.display = 'none';
        errorContent.textContent = '';
    }
});
