/**
 * LLMquality Client-Side JavaScript
 * Handles form validation, submission, and UI interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('dataForm');
    const locationSelect = document.getElementById('location');
    const pageInput = document.getElementById('page');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.querySelector('.btn-text');
    const btnSpinner = document.querySelector('.btn-spinner');
    const resultsDiv = document.getElementById('results');
    const resultsContent = document.getElementById('resultsContent');
    const errorDiv = document.getElementById('error');
    const errorContent = document.getElementById('errorContent');

    // Form validation
    function validateForm() {
        const location = locationSelect.value.trim();
        const page = pageInput.value.trim();
        
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

        return { isValid, errors };
    }

    // Real-time validation
    function updateFormValidation() {
        const validation = validateForm();
        submitBtn.disabled = !validation.isValid;
        
        // Clear previous error states
        hideMessages();
        
        // Show validation errors if any
        if (!validation.isValid && (locationSelect.value || pageInput.value)) {
            // Only show errors if user has started interacting
            showError(validation.errors.join('<br>'));
        }
    }

    // Show loading state
    function showLoading() {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline';
        form.classList.add('loading');
    }

    // Hide loading state
    function hideLoading() {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnSpinner.style.display = 'none';
        form.classList.remove('loading');
    }

    // Show success message
    function showSuccess(data) {
        hideMessages();
        resultsContent.innerHTML = `
            <div class="result-item">
                <strong>✅ Success!</strong><br>
                ${data.message}
            </div>
            <div class="result-details">
                <h4>Processing Details:</h4>
                <ul>
                    <li><strong>Location:</strong> ${data.data.location}</li>
                    <li><strong>Page:</strong> ${data.data.page}</li>
                    <li><strong>Timestamp:</strong> ${new Date(data.data.timestamp).toLocaleString()}</li>
                </ul>
            </div>
        `;
        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }

    // Show error message
    function showError(message) {
        hideMessages();
        errorContent.innerHTML = message;
        errorDiv.style.display = 'block';
        errorDiv.scrollIntoView({ behavior: 'smooth' });
    }

    // Hide all messages
    function hideMessages() {
        resultsDiv.style.display = 'none';
        errorDiv.style.display = 'none';
    }

    // Event listeners
    locationSelect.addEventListener('change', updateFormValidation);
    pageInput.addEventListener('input', updateFormValidation);

    // Enhanced page input validation
    pageInput.addEventListener('keypress', function(e) {
        // Only allow digits
        if (!/[\d]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
            e.preventDefault();
        }
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const validation = validateForm();
        if (!validation.isValid) {
            showError(validation.errors.join('<br>'));
            return;
        }

        showLoading();
        hideMessages();

        try {
            const formData = new FormData(form);
            const data = {
                location: formData.get('location'),
                page: formData.get('page')
            };

            const response = await fetch('/api/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                showSuccess(result);
                console.log('Processing successful:', result);
            } else {
                showError(result.error || 'An error occurred while processing your request');
            }

        } catch (error) {
            console.error('Network error:', error);
            showError('Network error: Unable to connect to the server. Please try again.');
        } finally {
            hideLoading();
        }
    });

    // Reset form
    form.addEventListener('reset', function() {
        hideMessages();
        setTimeout(() => {
            updateFormValidation();
        }, 100);
    });

    // Initialize form validation
    updateFormValidation();

    console.log('🚀 LLMquality client initialized successfully');
});
