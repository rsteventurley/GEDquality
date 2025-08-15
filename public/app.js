/**
 * LLMquality Client-Side JavaScript
 * Enhanced functionality for genealogical data processing application
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const form = document.getElementById('dataForm');
    const locationSelect = document.getElementById('location');
    const pageInput = document.getElementById('page');
    const llmSelect = document.getElementById('llm');
    const rateBtn = document.getElementById('rateBtn');
    const configBtn = document.getElementById('configBtn');
    const helpBtn = document.getElementById('helpBtn');
    const saveBtn = document.getElementById('saveBtn');
    const btnText = document.querySelector('.btn-text');
    const btnSpinner = document.querySelector('.btn-spinner');
    const resultsArea = document.getElementById('resultsArea');
    const errorDiv = document.getElementById('error');
    const errorContent = document.getElementById('errorContent');

    // Modal elements
    const configModal = document.getElementById('configModal');
    const helpModal = document.getElementById('helpModal');
    const saveFileModal = document.getElementById('saveFileModal');
    const overwriteModal = document.getElementById('overwriteModal');
    const closeConfigModal = document.getElementById('closeConfigModal');
    const closeHelpModal = document.getElementById('closeHelpModal');
    const closeSaveFileModal = document.getElementById('closeSaveFileModal');
    const closeOverwriteModal = document.getElementById('closeOverwriteModal');
    const configOk = document.getElementById('configOk');
    const configCancel = document.getElementById('configCancel');
    const closeHelp = document.getElementById('closeHelp');
    const groundTruthDir = document.getElementById('groundTruthDir');
    const llmXmlDir = document.getElementById('llmXmlDir');
    const outputDir = document.getElementById('outputDir');
    const fileName = document.getElementById('fileName');
    const saveFileOk = document.getElementById('saveFileOk');
    const saveFileCancel = document.getElementById('saveFileCancel');
    const overwriteYes = document.getElementById('overwriteYes');
    const overwriteNo = document.getElementById('overwriteNo');

    // Configuration storage
    let currentConfig = {
        groundTruthDir: '',
        llmXmlDir: '',
        outputDir: ''
    };

    // Cookie functions
    function setCookie(name, value, days = 30) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Load configuration from cookies
    function loadConfiguration() {
        const savedGroundTruth = getCookie('groundTruthDir');
        const savedLlmXml = getCookie('llmXmlDir');
        const savedOutput = getCookie('outputDir');
        
        if (savedGroundTruth) {
            currentConfig.groundTruthDir = savedGroundTruth;
            groundTruthDir.value = savedGroundTruth;
        }
        
        if (savedLlmXml) {
            currentConfig.llmXmlDir = savedLlmXml;
            llmXmlDir.value = savedLlmXml;
        }
        
        if (savedOutput) {
            currentConfig.outputDir = savedOutput;
            outputDir.value = savedOutput;
        }
    }

    // Save configuration to cookies
    function saveConfiguration() {
        setCookie('groundTruthDir', currentConfig.groundTruthDir);
        setCookie('llmXmlDir', currentConfig.llmXmlDir);
        setCookie('outputDir', currentConfig.outputDir);
    }

    // Load form values from cookies
    function loadFormValues() {
        const savedLocation = getCookie('selectedLocation');
        const savedPage = getCookie('selectedPage');
        const savedLlm = getCookie('selectedLlm');
        
        if (savedLocation) {
            locationSelect.value = savedLocation;
        }
        
        if (savedPage) {
            pageInput.value = savedPage;
        }
        
        if (savedLlm) {
            llmSelect.value = savedLlm;
        }
    }

    // Save form values to cookies
    function saveFormValues() {
        setCookie('selectedLocation', locationSelect.value);
        setCookie('selectedPage', pageInput.value);
        setCookie('selectedLlm', llmSelect.value);
    }

    // Form validation
    function validateForm() {
        const location = locationSelect.value.trim();
        const page = pageInput.value.trim();
        const llm = llmSelect.value.trim();
        
        let isValid = true;
        let errors = [];

        // Validate location
        if (!location) {
            errors.push('Please select a location');
            isValid = false;
        }

        // Validate page number
        if (!page) {
            errors.push('Please enter a page number');
            isValid = false;
        } else {
            const pageNumber = parseInt(page);
            if (isNaN(pageNumber) || pageNumber < 0 || !Number.isInteger(parseFloat(page))) {
                errors.push('Page must be a non-negative integer (0 or greater)');
                isValid = false;
            }
        }

        // Validate LLM selection
        if (!llm) {
            errors.push('Please select an LLM');
            isValid = false;
        }

        return { isValid, errors };
    }

    // Real-time validation
    function updateFormValidation() {
        const validation = validateForm();
        rateBtn.disabled = !validation.isValid;
        
        if (!validation.isValid) {
            rateBtn.style.opacity = '0.6';
            rateBtn.style.cursor = 'not-allowed';
        } else {
            rateBtn.style.opacity = '1';
            rateBtn.style.cursor = 'pointer';
        }
    }

    // Show error message
    function showError(message) {
        errorContent.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    // Hide error message
    function hideError() {
        errorDiv.style.display = 'none';
    }

    // Show loading state
    function showLoading() {
        btnText.textContent = 'Rating...';
        btnSpinner.style.display = 'inline-block';
        rateBtn.disabled = true;
        rateBtn.style.opacity = '0.8';
    }

    // Hide loading state
    function hideLoading() {
        btnText.textContent = 'Rate';
        btnSpinner.style.display = 'none';
        rateBtn.disabled = false;
        rateBtn.style.opacity = '1';
        updateFormValidation();
    }

    // Show modal
    function showModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Hide modal
    function hideModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideError();

        const validation = validateForm();
        if (!validation.isValid) {
            showError(validation.errors.join(', '));
            return;
        }

        const formData = {
            location: locationSelect.value,
            page: pageInput.value,
            llm: llmSelect.value,
            groundTruthDir: currentConfig.groundTruthDir,
            llmXmlDir: currentConfig.llmXmlDir
        };

        showLoading();

        try {
            const response = await fetch('/api/rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                resultsArea.value = result.results;
                resultsArea.scrollTop = 0;
            } else {
                throw new Error(result.error || 'An error occurred during processing');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Error: ' + error.message);
            resultsArea.value = `Error: ${error.message}\n\nPlease check your configuration and try again.`;
        } finally {
            hideLoading();
        }
    });

    // Configuration modal handlers
    configBtn.addEventListener('click', function() {
        // Load current values into modal
        groundTruthDir.value = currentConfig.groundTruthDir;
        llmXmlDir.value = currentConfig.llmXmlDir;
        outputDir.value = currentConfig.outputDir;
        showModal(configModal);
    });

    configOk.addEventListener('click', function() {
        // Save configuration
        currentConfig.groundTruthDir = groundTruthDir.value.trim();
        currentConfig.llmXmlDir = llmXmlDir.value.trim();
        currentConfig.outputDir = outputDir.value.trim();
        saveConfiguration();
        hideModal(configModal);
        
        // Show success message in results area
        const timestamp = new Date().toLocaleString();
        resultsArea.value = `Configuration Updated - ${timestamp}\n\nGround Truth Directory: ${currentConfig.groundTruthDir || 'Not set'}\nLLM XML Directory: ${currentConfig.llmXmlDir || 'Not set'}\nOutput Directory: ${currentConfig.outputDir || 'Not set'}\n\nConfiguration saved successfully!`;
    });

    configCancel.addEventListener('click', function() {
        // Revert to saved values
        groundTruthDir.value = currentConfig.groundTruthDir;
        llmXmlDir.value = currentConfig.llmXmlDir;
        outputDir.value = currentConfig.outputDir;
        hideModal(configModal);
    });

    closeConfigModal.addEventListener('click', function() {
        hideModal(configModal);
    });

    // Help modal handlers
    helpBtn.addEventListener('click', function() {
        showModal(helpModal);
    });

    closeHelp.addEventListener('click', function() {
        hideModal(helpModal);
    });

    closeHelpModal.addEventListener('click', function() {
        hideModal(helpModal);
    });

    // Save button handlers
    saveBtn.addEventListener('click', function() {
        if (!resultsArea.value.trim()) {
            showError('No results to save. Please run a rating analysis first.');
            return;
        }
        
        if (!currentConfig.outputDir) {
            showError('Output directory not configured. Please configure the output directory first.');
            return;
        }
        
        // Generate default filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        fileName.value = `llm-quality-results-${timestamp}.txt`;
        showModal(saveFileModal);
    });

    saveFileOk.addEventListener('click', async function() {
        const fileNameValue = fileName.value.trim();
        if (!fileNameValue) {
            showError('Please enter a file name.');
            return;
        }
        
        try {
            // Check if file exists
            const checkResponse = await fetch('/api/check-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName: fileNameValue,
                    outputDir: currentConfig.outputDir
                })
            });
            
            const checkResult = await checkResponse.json();
            
            if (checkResult.success && checkResult.exists) {
                // File exists, show overwrite confirmation
                hideModal(saveFileModal);
                document.getElementById('overwriteMessage').textContent = 
                    `The file "${fileNameValue}" already exists in "${currentConfig.outputDir}". Do you want to overwrite it?`;
                showModal(overwriteModal);
            } else {
                // File doesn't exist, save directly
                await saveFile(fileNameValue, false);
            }
        } catch (error) {
            showError('Error checking file: ' + error.message);
        }
    });

    saveFileCancel.addEventListener('click', function() {
        hideModal(saveFileModal);
    });

    closeSaveFileModal.addEventListener('click', function() {
        hideModal(saveFileModal);
    });

    // Overwrite confirmation handlers
    overwriteYes.addEventListener('click', async function() {
        const fileNameValue = fileName.value.trim();
        hideModal(overwriteModal);
        await saveFile(fileNameValue, true);
    });

    overwriteNo.addEventListener('click', function() {
        hideModal(overwriteModal);
        showModal(saveFileModal); // Go back to save dialog
    });

    closeOverwriteModal.addEventListener('click', function() {
        hideModal(overwriteModal);
        showModal(saveFileModal); // Go back to save dialog
    });

    // File save function
    async function saveFile(fileNameValue, overwrite) {
        try {
            const response = await fetch('/api/save-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName: fileNameValue,
                    content: resultsArea.value,
                    outputDir: currentConfig.outputDir,
                    overwrite: overwrite
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                hideModal(saveFileModal);
                const timestamp = new Date().toLocaleString();
                resultsArea.value += `\n\n=== FILE SAVED ===\nTimestamp: ${timestamp}\nFile: ${result.filePath}\nStatus: Successfully saved\n==================`;
                resultsArea.scrollTop = resultsArea.scrollHeight;
            } else {
                throw new Error(result.error || 'Failed to save file');
            }
        } catch (error) {
            showError('Error saving file: ' + error.message);
        }
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === configModal) {
            hideModal(configModal);
        }
        if (event.target === helpModal) {
            hideModal(helpModal);
        }
        if (event.target === saveFileModal) {
            hideModal(saveFileModal);
        }
        if (event.target === overwriteModal) {
            hideModal(overwriteModal);
        }
    });

    // Real-time validation listeners
    locationSelect.addEventListener('change', updateFormValidation);
    pageInput.addEventListener('input', updateFormValidation);
    llmSelect.addEventListener('change', updateFormValidation);

    // Page input validation
    pageInput.addEventListener('input', function() {
        const value = this.value;
        const isValid = value === '' || (Number.isInteger(parseFloat(value)) && parseInt(value) > 0);
        
        if (!isValid && value !== '') {
            this.style.borderColor = '#f56565';
        } else {
            this.style.borderColor = '#e2e8f0';
        }
        
        updateFormValidation();
    });

    // Form value change listeners
    locationSelect.addEventListener('change', saveFormValues);
    pageInput.addEventListener('input', saveFormValues);
    llmSelect.addEventListener('change', saveFormValues);

    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Escape key closes modals
        if (event.key === 'Escape') {
            hideModal(configModal);
            hideModal(helpModal);
            hideModal(saveFileModal);
            hideModal(overwriteModal);
        }
        
        // Ctrl/Cmd + Enter submits form
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            if (validateForm().isValid) {
                form.dispatchEvent(new Event('submit'));
            }
        }
    });

    // Initialize
    loadConfiguration();
    loadFormValues();
    updateFormValidation();
    
    // Welcome message
    resultsArea.value = `Welcome to LLMquality!\n\nThis application helps you assess the quality of Large Language Model outputs when processing genealogical data.\n\n1. Select a location, page number, and LLM\n2. Configure your directories (optional)\n3. Click 'Rate' to begin assessment\n\nClick 'Help' for detailed instructions.`;
    
    console.log('LLMquality application initialized successfully');
});
