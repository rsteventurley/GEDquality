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
    const btnText = document.querySelector('.btn-text');
    const btnSpinner = document.querySelector('.btn-spinner');
    const resultsArea = document.getElementById('resultsArea');
    const errorDiv = document.getElementById('error');
    const errorContent = document.getElementById('errorContent');

    // Modal elements
    const configModal = document.getElementById('configModal');
    const helpModal = document.getElementById('helpModal');
    const closeConfigModal = document.getElementById('closeConfigModal');
    const closeHelpModal = document.getElementById('closeHelpModal');
    const configOk = document.getElementById('configOk');
    const configCancel = document.getElementById('configCancel');
    const closeHelp = document.getElementById('closeHelp');
    const groundTruthDir = document.getElementById('groundTruthDir');
    const llmXmlDir = document.getElementById('llmXmlDir');
    const browseGroundTruth = document.getElementById('browseGroundTruth');
    const browseLlmXml = document.getElementById('browseLlmXml');

    // Configuration storage
    let currentConfig = {
        groundTruthDir: '',
        llmXmlDir: ''
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
        
        if (savedGroundTruth) {
            currentConfig.groundTruthDir = savedGroundTruth;
            groundTruthDir.value = savedGroundTruth;
        }
        
        if (savedLlmXml) {
            currentConfig.llmXmlDir = savedLlmXml;
            llmXmlDir.value = savedLlmXml;
        }
    }

    // Save configuration to cookies
    function saveConfiguration() {
        setCookie('groundTruthDir', currentConfig.groundTruthDir);
        setCookie('llmXmlDir', currentConfig.llmXmlDir);
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
            if (isNaN(pageNumber) || pageNumber < 1 || !Number.isInteger(parseFloat(page))) {
                errors.push('Page must be a positive integer');
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
        showModal(configModal);
    });

    configOk.addEventListener('click', function() {
        // Save configuration
        currentConfig.groundTruthDir = groundTruthDir.value.trim();
        currentConfig.llmXmlDir = llmXmlDir.value.trim();
        saveConfiguration();
        hideModal(configModal);
        
        // Show success message in results area
        const timestamp = new Date().toLocaleString();
        resultsArea.value = `Configuration Updated - ${timestamp}\n\nGround Truth Directory: ${currentConfig.groundTruthDir || 'Not set'}\nLLM XML Directory: ${currentConfig.llmXmlDir || 'Not set'}\n\nConfiguration saved successfully!`;
    });

    configCancel.addEventListener('click', function() {
        // Revert to saved values
        groundTruthDir.value = currentConfig.groundTruthDir;
        llmXmlDir.value = currentConfig.llmXmlDir;
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

    // Directory browse handlers (simulated - in a real app you'd use Electron or file API)
    browseGroundTruth.addEventListener('click', function() {
        const dir = prompt('Enter Ground Truth GEDCOM Directory path:', groundTruthDir.value);
        if (dir !== null) {
            groundTruthDir.value = dir;
        }
    });

    browseLlmXml.addEventListener('click', function() {
        const dir = prompt('Enter LLM XML Directory path:', llmXmlDir.value);
        if (dir !== null) {
            llmXmlDir.value = dir;
        }
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === configModal) {
            hideModal(configModal);
        }
        if (event.target === helpModal) {
            hideModal(helpModal);
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

    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Escape key closes modals
        if (event.key === 'Escape') {
            hideModal(configModal);
            hideModal(helpModal);
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
    updateFormValidation();
    
    // Welcome message
    resultsArea.value = `Welcome to LLMquality!\n\nThis application helps you assess the quality of Large Language Model outputs when processing genealogical data.\n\n1. Select a location, page number, and LLM\n2. Configure your directories (optional)\n3. Click 'Rate' to begin assessment\n\nClick 'Help' for detailed instructions.`;
    
    console.log('LLMquality application initialized successfully');
});
