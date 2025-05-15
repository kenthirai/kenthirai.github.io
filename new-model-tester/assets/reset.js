// reset.js
document.addEventListener('DOMContentLoaded', function() {
    // Create footer container
    const footer = document.createElement('footer');
    footer.style.marginTop = '3rem';
    footer.style.paddingTop = '1rem';
    footer.style.textAlign = 'center';
    footer.style.color = '#636e72';
    footer.style.fontSize = '0.9rem';
    footer.style.borderTop = '1px solid rgba(99, 110, 114, 0.2)';
    footer.style.width = '100%';
    footer.style.maxWidth = '1200px';
    footer.style.marginLeft = 'auto';
    footer.style.marginRight = 'auto';

    // Create copyright text
    const copyrightText = document.createElement('div');
    copyrightText.innerHTML = `© ${new Date().getFullYear()} AI Image Generator`;
    copyrightText.style.marginBottom = '1rem';

    // Create reset button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.marginBottom = '1rem';

    // Create reset button
    const resetBtn = document.createElement('button');
    resetBtn.id = 'resetSettingsBtn';
    resetBtn.innerHTML = '<i class="fas fa-undo"></i> Reset All Settings';
    resetBtn.style.padding = '0.75rem 1.5rem';
    resetBtn.style.border = 'none';
    resetBtn.style.borderRadius = '8px';
    resetBtn.style.backgroundColor = '#EB3A6B';
    resetBtn.style.color = 'white';
    resetBtn.style.cursor = 'pointer';
    resetBtn.style.boxShadow = '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff';
    resetBtn.style.transition = 'all 0.3s ease';

    // Button hover effects
    resetBtn.addEventListener('mouseover', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff';
    });
    
    resetBtn.addEventListener('mouseout', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff';
    });

    // Reset functionality
    resetBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset ALL settings to default? This will also end your Turbo session.')) {
            // Clear all stored data including Turbo session
            localStorage.removeItem('aiImageGeneratorState');
            localStorage.removeItem('turboExpiration');
            localStorage.removeItem('turboPassword');
            
            // Reset form elements
            const elements = {
                prompt: document.getElementById('prompt'),
                imageSize: document.getElementById('imageSize'),
                model: document.getElementById('model'),
                quality: document.getElementById('quality'),
                seed: document.getElementById('seed'),
                enhance: document.getElementById('enhance'),
                nologo: document.getElementById('nologo'),
                private: document.getElementById('private'),
                advancedParams: document.getElementById('advancedParams'),
                advancedIcon: document.querySelector('.advanced-toggle i')
            };
            
            elements.prompt.value = '';
            elements.imageSize.value = '1024x1792';
            elements.model.value = 'flux';
            elements.quality.value = 'hd';
            elements.seed.value = '';
            elements.enhance.checked = true;
            elements.nologo.checked = true;
            elements.private.checked = false;
            elements.advancedParams.style.display = 'none';
            if (elements.advancedIcon) {
                elements.advancedIcon.className = 'toggle-icon fas fa-chevron-down';
            }
            
            // Reset image display
            const imgElements = {
                generatedImage: document.getElementById('generatedImage'),
                placeholder: document.getElementById('placeholder'),
                loading: document.getElementById('loading'),
                downloadBtn: document.getElementById('downloadBtn')
            };
            
            imgElements.generatedImage.style.display = 'none';
            imgElements.generatedImage.src = '';
            imgElements.placeholder.style.display = 'flex';
            imgElements.loading.style.display = 'none';
            imgElements.downloadBtn.style.display = 'none';
            
            // Reset Turbo model
            const countdownDisplay = document.getElementById('modelCountdown');
            if (countdownDisplay) {
                countdownDisplay.style.display = 'none';
                countdownDisplay.innerHTML = '';
            }
            
            // Reset slider
            resetSlide();
            
            // Close password modal if open
            const passwordModal = document.getElementById('passwordModal');
            if (passwordModal) {
                passwordModal.style.display = 'none';
            }
            
            showSuccessNotification('All settings and model preferences have been reset to default.');
        }
    });

    // Assemble footer
    buttonContainer.appendChild(resetBtn);
    footer.appendChild(copyrightText);
    footer.appendChild(buttonContainer);
    document.body.appendChild(footer);

    function resetSlide() {
        const slideThumb = document.getElementById('slideThumb');
        if (!slideThumb) return;
        
        const slideProgress = document.getElementById('slideProgress');
        const slideTrack = document.getElementById('slideTrack');
        
        slideThumb.style.transition = 'left 0.3s ease, background 0.3s ease';
        if (slideProgress) slideProgress.style.transition = 'width 0.3s ease';
        
        slideThumb.classList.remove('success');
        slideThumb.style.left = '5px';
        if (slideProgress) slideProgress.style.width = '0';
        if (slideTrack) slideTrack.textContent = "Slide to Generate";
        
        const icon = slideThumb.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-arrow-right';
        }
        
        setTimeout(() => {
            slideThumb.style.transition = '';
            if (slideProgress) slideProgress.style.transition = '';
        }, 300);
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
        
        if (!document.getElementById('notificationAnimations')) {
            const style = document.createElement('style');
            style.id = 'notificationAnimations';
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
    }
});