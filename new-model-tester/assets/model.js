// // model.js - Updated with Grizk Model
document.addEventListener('DOMContentLoaded', function() {
    const modelSelect = document.getElementById('model');
    const passwordModal = createPasswordModal();
    let correctPassword = '';
    let passwordExpiration = null;
    let expirationTimer = null;

    // Create countdown display
    const modelGroup = modelSelect.closest('.input-group');
    const countdownDisplay = document.createElement('div');
    countdownDisplay.id = 'modelCountdown';
    countdownDisplay.style.marginTop = '0.5rem';
    countdownDisplay.style.fontSize = '0.8rem';
    countdownDisplay.style.color = '#636e72';
    countdownDisplay.style.display = 'none';
    modelGroup.appendChild(countdownDisplay);

    // Check for existing Turbo session
    checkExistingTurboSession();

    function checkExistingTurboSession() {
        const savedExpiration = localStorage.getItem('turboExpiration');
        const savedPassword = localStorage.getItem('turboPassword');
        
        if (savedExpiration && savedPassword) {
            const now = new Date();
            const expiration = new Date(parseInt(savedExpiration));
            
            if (now < expiration) {
                // Still valid
                correctPassword = savedPassword;
                passwordExpiration = expiration;
                modelSelect.value = 'turbo';
                startExpirationTimer();
                updateModelCountdown();
                showSuccessNotification('Turbo session resumed. Time remaining: ' + formatTimeLeft(expiration - now));
            } else {
                // Expired - clear storage
                localStorage.removeItem('turboExpiration');
                localStorage.removeItem('turboPassword');
            }
        }
    }

    modelSelect.addEventListener('change', function() {
        if (this.value === 'turbo') {
            // Check if we have an existing valid session
            const savedExpiration = localStorage.getItem('turboExpiration');
            const savedPassword = localStorage.getItem('turboPassword');
            
            if (savedExpiration && savedPassword) {
                const now = new Date();
                const expiration = new Date(parseInt(savedExpiration));
                
                if (now < expiration) {
                    // Use existing session
                    correctPassword = savedPassword;
                    passwordExpiration = expiration;
                    startExpirationTimer();
                    updateModelCountdown();
                    showSuccessNotification('Turbo model activated! Time remaining: ' + formatTimeLeft(expiration - new Date()));
                    return;
                }
            }
            
            // No valid session - show password modal
            correctPassword = generatePassword();
            passwordExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);
            
            // Save to localStorage
            localStorage.setItem('turboExpiration', passwordExpiration.getTime());
            localStorage.setItem('turboPassword', correctPassword);
            
            showPasswordModal(correctPassword);
            startExpirationTimer();
            updateModelCountdown();
        } else if (this.value === 'grizk') {
            showSuccessNotification('Grizk model selected. this is a new model for testers');
            countdownDisplay.style.display = 'none';
            clearInterval(expirationTimer);
        } else {
            showSuccessNotification('Flux model selected. This is the standard model with content restrictions.');
            countdownDisplay.style.display = 'none';
            clearInterval(expirationTimer);
        }
    });

    function createPasswordModal() {
        const modal = document.createElement('div');
        modal.id = 'passwordModal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
        modal.style.zIndex = '1000';
        modal.style.display = 'none';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        
        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = '#e0e5ec';
        modalContent.style.padding = '2rem';
        modalContent.style.borderRadius = '12px';
        modalContent.style.boxShadow = '8px 8px 15px #a3b1c6, -8px -8px 15px #ffffff';
        modalContent.style.maxWidth = '500px';
        modalContent.style.width = '90%';
        modalContent.style.textAlign = 'center';
        
        const title = document.createElement('h2');
        title.textContent = 'Turbo Model Access';
        title.style.color = '#6c5ce7';
        title.style.marginBottom = '1rem';
        
        const warningMessage = document.createElement('div');
        warningMessage.style.backgroundColor = 'rgba(255, 165, 0, 0.2)';
        warningMessage.style.padding = '1rem';
        warningMessage.style.borderRadius = '8px';
        warningMessage.style.marginBottom = '1rem';
        warningMessage.style.textAlign = 'left';
        warningMessage.style.fontSize = '0.9rem';
        
        const warningIcon = document.createElement('i');
        warningIcon.className = 'fas fa-exclamation-triangle';
        warningIcon.style.color = '#ffa500';
        warningIcon.style.marginRight = '0.5rem';
        
        const warningText = document.createElement('span');
        warningText.innerHTML = '<strong>Warning:</strong> The Turbo model has fewer content restrictions and may generate inappropriate content. Use at your own discretion.';
        
        warningMessage.appendChild(warningIcon);
        warningMessage.appendChild(warningText);
        
        const instruction = document.createElement('p');
        instruction.textContent = 'Please enter the following password to use the Turbo model:';
        instruction.style.marginBottom = '1rem';
        
        const passwordDisplayContainer = document.createElement('div');
        passwordDisplayContainer.style.display = 'flex';
        passwordDisplayContainer.style.alignItems = 'center';
        passwordDisplayContainer.style.justifyContent = 'space-between';
        passwordDisplayContainer.style.marginBottom = '1rem';
        
        const passwordDisplay = document.createElement('div');
        passwordDisplay.id = 'passwordDisplay';
        passwordDisplay.style.padding = '1rem';
        passwordDisplay.style.backgroundColor = '#f5f5f5';
        passwordDisplay.style.borderRadius = '8px';
        passwordDisplay.style.fontWeight = 'bold';
        passwordDisplay.style.fontSize = '1.2rem';
        passwordDisplay.style.letterSpacing = '1px';
        passwordDisplay.style.flexGrow = '1';
        passwordDisplay.style.marginRight = '0.5rem';
        passwordDisplay.style.textAlign = 'center';
        
        const refreshBtn = document.createElement('button');
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        refreshBtn.title = 'Generate new password';
        refreshBtn.style.padding = '0.75rem';
        refreshBtn.style.border = 'none';
        refreshBtn.style.borderRadius = '8px';
        refreshBtn.style.backgroundColor = '#6c5ce7';
        refreshBtn.style.color = 'white';
        refreshBtn.style.cursor = 'pointer';
        refreshBtn.style.boxShadow = '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff';
        
        refreshBtn.addEventListener('click', function() {
            correctPassword = generatePassword();
            passwordDisplay.textContent = correctPassword;
            passwordExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);
            localStorage.setItem('turboExpiration', passwordExpiration.getTime());
            localStorage.setItem('turboPassword', correctPassword);
            updateExpirationDisplay();
            updateModelCountdown();
        });
        
        passwordDisplayContainer.appendChild(passwordDisplay);
        passwordDisplayContainer.appendChild(refreshBtn);
        
        const expirationDisplay = document.createElement('div');
        expirationDisplay.id = 'expirationDisplay';
        expirationDisplay.style.marginBottom = '1rem';
        expirationDisplay.style.fontSize = '0.9rem';
        expirationDisplay.style.color = '#636e72';
        
        const inputGroup = document.createElement('div');
        inputGroup.style.display = 'flex';
        inputGroup.style.alignItems = 'center';
        inputGroup.style.marginBottom = '1rem';
        
        const passwordInput = document.createElement('input');
        passwordInput.type = 'text';
        passwordInput.id = 'passwordInput';
        passwordInput.placeholder = 'Enter the password';
        passwordInput.style.width = '100%';
        passwordInput.style.padding = '0.75rem 1rem';
        passwordInput.style.border = 'none';
        passwordInput.style.borderRadius = '8px';
        passwordInput.style.fontSize = '1rem';
        passwordInput.style.backgroundColor = '#e0e5ec';
        passwordInput.style.boxShadow = 'inset 3px 3px 5px #a3b1c6, inset -3px -3px 5px #ffffff';
        passwordInput.style.marginRight = '0.5rem';
        
        const autofillBtn = document.createElement('button');
        autofillBtn.innerHTML = '<i class="fas fa-magic"></i>';
        autofillBtn.title = 'Autofill password';
        autofillBtn.style.padding = '0.75rem';
        autofillBtn.style.border = 'none';
        autofillBtn.style.borderRadius = '8px';
        autofillBtn.style.backgroundColor = '#00b894';
        autofillBtn.style.color = 'white';
        autofillBtn.style.cursor = 'pointer';
        autofillBtn.style.boxShadow = '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff';
        
        autofillBtn.addEventListener('click', function() {
            passwordInput.value = correctPassword;
            const errorMsg = document.getElementById('passwordError');
            errorMsg.style.display = 'none';
            passwordInput.style.boxShadow = 'inset 3px 3px 5px #a3b1c6, inset -3px -3px 5px #ffffff';
        });
        
        inputGroup.appendChild(passwordInput);
        inputGroup.appendChild(autofillBtn);
        
        const errorMsg = document.createElement('div');
        errorMsg.id = 'passwordError';
        errorMsg.style.color = '#ff7675';
        errorMsg.style.marginBottom = '1rem';
        errorMsg.style.fontSize = '0.9rem';
        errorMsg.style.display = 'none';
        
        const buttonGroup = document.createElement('div');
        buttonGroup.style.display = 'flex';
        buttonGroup.style.gap = '1rem';
        buttonGroup.style.justifyContent = 'center';
        
        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Submit';
        submitBtn.style.padding = '0.75rem 1.5rem';
        submitBtn.style.border = 'none';
        submitBtn.style.borderRadius = '8px';
        submitBtn.style.backgroundColor = '#6c5ce7';
        submitBtn.style.color = 'white';
        submitBtn.style.cursor = 'pointer';
        submitBtn.style.boxShadow = '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.padding = '0.75rem 1.5rem';
        cancelBtn.style.border = 'none';
        cancelBtn.style.borderRadius = '8px';
        cancelBtn.style.backgroundColor = '#636e72';
        cancelBtn.style.color = 'white';
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.style.boxShadow = '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff';
        
        submitBtn.addEventListener('click', function() {
            const enteredPassword = passwordInput.value.trim();
            if (enteredPassword === correctPassword) {
                hidePasswordModal();
                showSuccessNotification('Turbo model activated! Time remaining: ' + formatTimeLeft(passwordExpiration - new Date()));
            } else {
                errorMsg.textContent = 'Incorrect password. Please try again.';
                errorMsg.style.display = 'block';
                passwordInput.style.boxShadow = 'inset 3px 3px 5px #a3b1c6, inset -3px -3px 5px #ffffff, 0 0 0 3px rgba(255, 118, 117, 0.3)';
            }
        });
        
        cancelBtn.addEventListener('click', function() {
            modelSelect.value = 'flux';
            hidePasswordModal();
            showSuccessNotification('Flux model selected. This is the standard model with content restrictions.');
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modelSelect.value = 'flux';
                hidePasswordModal();
                showSuccessNotification('Flux model selected. This is the standard model with content restrictions.');
            }
        });
        
        buttonGroup.appendChild(submitBtn);
        buttonGroup.appendChild(cancelBtn);
        
        modalContent.appendChild(title);
        modalContent.appendChild(warningMessage);
        modalContent.appendChild(instruction);
        modalContent.appendChild(passwordDisplayContainer);
        modalContent.appendChild(expirationDisplay);
        modalContent.appendChild(inputGroup);
        modalContent.appendChild(errorMsg);
        modalContent.appendChild(buttonGroup);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        return modal;
    }
    
    function showPasswordModal(password) {
        const modal = document.getElementById('passwordModal');
        const passwordDisplay = document.getElementById('passwordDisplay');
        const passwordInput = document.getElementById('passwordInput');
        const errorMsg = document.getElementById('passwordError');
        
        passwordDisplay.textContent = password;
        passwordInput.value = '';
        errorMsg.style.display = 'none';
        passwordInput.style.boxShadow = 'inset 3px 3px 5px #a3b1c6, inset -3px -3px 5px #ffffff';
        
        updateExpirationDisplay();
        modal.style.display = 'flex';
        setTimeout(() => {
            passwordInput.focus();
        }, 100);
    }
    
    function hidePasswordModal() {
        const modal = document.getElementById('passwordModal');
        modal.style.display = 'none';
        clearInterval(expirationTimer);
    }
    
    function startExpirationTimer() {
        clearInterval(expirationTimer);
        expirationTimer = setInterval(function() {
            updateExpirationDisplay();
            updateModelCountdown();
        }, 1000);
    }
    
    function updateExpirationDisplay() {
        const expirationDisplay = document.getElementById('expirationDisplay');
        if (!expirationDisplay || !passwordExpiration) return;
        
        const now = new Date();
        const timeLeft = passwordExpiration - now;
        
        if (timeLeft <= 0) {
            expirationDisplay.innerHTML = '<i class="fas fa-clock" style="color:#ff7675"></i> Password expired! Generate a new one.';
            correctPassword = '';
            localStorage.removeItem('turboExpiration');
            localStorage.removeItem('turboPassword');
            clearInterval(expirationTimer);
            return;
        }
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        expirationDisplay.innerHTML = `<i class="fas fa-clock" style="color:#636e72"></i> Password expires in: ${hours}h ${minutes}m ${seconds}s`;
    }
    
    function updateModelCountdown() {
        if (modelSelect.value !== 'turbo' || !passwordExpiration) {
            countdownDisplay.style.display = 'none';
            return;
        }
        
        const now = new Date();
        const timeLeft = passwordExpiration - now;
        
        if (timeLeft <= 0) {
            countdownDisplay.innerHTML = '<i class="fas fa-clock" style="color:#ff7675"></i> Turbo access expired';
            countdownDisplay.style.color = '#ff7675';
            correctPassword = '';
            localStorage.removeItem('turboExpiration');
            localStorage.removeItem('turboPassword');
            return;
        }
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        countdownDisplay.innerHTML = `<i class="fas fa-clock" style="color:#6c5ce7"></i> Turbo access expires in: ${hours}h ${minutes}m`;
        countdownDisplay.style.display = 'block';
        countdownDisplay.style.color = '#636e72';
    }
    
    function showSuccessNotification(message) {
        const existingNotification = document.getElementById('successNotification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.id = 'successNotification';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = '#00b894';
        notification.style.color = 'white';
        notification.style.padding = '1rem 1.5rem';
        notification.style.borderRadius = '8px';
        notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        notification.style.zIndex = '1000';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '0.5rem';
        notification.style.animation = 'fadeIn 0.3s ease-in-out';
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-check-circle';
        
        const text = document.createElement('span');
        text.textContent = message;
        
        notification.appendChild(icon);
        notification.appendChild(text);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-in-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(20px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    function generatePassword() {
        const prefix = 'sicba';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let suffix = '';
        
        for (let i = 0; i < 5; i++) {
            suffix += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return prefix + suffix;
    }

    function formatTimeLeft(milliseconds) {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }
});