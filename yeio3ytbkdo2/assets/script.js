document.addEventListener('DOMContentLoaded', function() {
    // Toggle advanced settings
    const toggleAdvanced = document.querySelector('.toggle-advanced');
    const advancedSettings = document.querySelector('.advanced-settings');
    
    toggleAdvanced.addEventListener('click', function() {
        if (advancedSettings.style.display === 'none') {
            advancedSettings.style.display = 'block';
            toggleAdvanced.innerHTML = '<i class="fas fa-cogs"></i> Hide Advanced Settings';
        } else {
            advancedSettings.style.display = 'none';
            toggleAdvanced.innerHTML = '<i class="fas fa-cogs"></i> Advanced Settings';
        }
    });
    
    // Art style selection
    const artStyleOptions = document.querySelectorAll('.art-style-option');
    artStyleOptions.forEach(option => {
        option.addEventListener('click', function() {
            artStyleOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Generate image elements
    const generateBtn = document.getElementById('generate-btn');
    const regenerateBtn = document.getElementById('regenerate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const promptInput = document.getElementById('prompt');
    const aspectRatio = document.getElementById('aspect-ratio');
    const model = document.getElementById('model');
    const seed = document.getElementById('seed');
    const enhance = document.getElementById('enhance');
    const negativePrompt = document.getElementById('negative-prompt');
    const placeholder = document.getElementById('placeholder');
    const loading = document.getElementById('loading');
    const imagePreview = document.getElementById('image-preview');
    const downloadBtn = document.getElementById('download-btn');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    // Password for turbo model
    const TURBO_PASSWORD = "rizqi123"; // Change this to your desired password
    let isPasswordVerified = false;
    let pendingGeneration = false;
    const passwordModal = document.getElementById('password-modal');
    const turboPasswordInput = document.getElementById('turbo-password');
    const submitPasswordBtn = document.getElementById('submit-password');
    const cancelPasswordBtn = document.getElementById('cancel-password');
    const passwordError = document.getElementById('password-error');
    
    // Store last used prompt for regeneration
    let lastPrompt = '';
    
    // Password verification functions
    function showPasswordModal() {
        passwordModal.style.display = 'flex';
        turboPasswordInput.focus();
    }
    
    function hidePasswordModal() {
        passwordModal.style.display = 'none';
        passwordError.style.display = 'none';
        turboPasswordInput.value = '';
    }
    
    function verifyPassword() {
        if (turboPasswordInput.value === TURBO_PASSWORD) {
            isPasswordVerified = true;
            hidePasswordModal();
            return true;
        } else {
            passwordError.style.display = 'block';
            return false;
        }
    }
    
    // Password modal event listeners
    submitPasswordBtn.addEventListener('click', function() {
        if (verifyPassword()) {
            // After successful verification, proceed with generation if that's what triggered it
            if (pendingGeneration) {
                pendingGeneration = false;
                generateImage();
            }
        }
    });
    
    cancelPasswordBtn.addEventListener('click', function() {
        hidePasswordModal();
        // Reset model selection if password was canceled
        model.value = 'stable-diffusion';
        isPasswordVerified = false;
        pendingGeneration = false;
    });
    
    turboPasswordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            if (verifyPassword()) {
                if (pendingGeneration) {
                    pendingGeneration = false;
                    generateImage();
                }
            }
        }
    });
    
    // Model change event listener
    model.addEventListener('change', function() {
        // Reset password verification when model changes
        if (this.value !== 'turbo') {
            isPasswordVerified = false;
        }
    });
    
    // Generate image function
    async function generateImage() {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            showNotification('Please enter a prompt to generate an image', 'error');
            return;
        }
        
        // Store the prompt for regeneration
        lastPrompt = prompt;
        
        // Show loading, hide placeholder
        placeholder.style.display = 'none';
        loading.style.display = 'flex';
        imagePreview.style.display = 'none';
        downloadBtn.style.display = 'none';
        regenerateBtn.style.display = 'none';
        
        // Get selected art style
        let artStyle = 'realistic';
        const selectedStyle = document.querySelector('.art-style-option.selected');
        if (selectedStyle) {
            artStyle = selectedStyle.dataset.style;
        }
        
        // Get aspect ratio dimensions with updated sizes
        let width, height;
        switch (aspectRatio.value) {
            case '1:1':
                width = 1024;
                height = 1024;
                break;
            case '4:3':
                width = 1024;
                height = 768;
                break;
            case '3:4':
                width = 768;
                height = 1024;
                break;
            case '16:9':
                width = 1365;
                height = 768;
                break;
            case '9:16':
                width = 768;
                height = 1365;
                break;
            case '3:2':
                width = 1024;
                height = 683;
                break;
            case '2:3':
                width = 683;
                height = 1024;
                break;
            default:
                width = 1024;
                height = 1024;
        }
        
        // Base quality keywords that will be added to all prompts
        const baseQualityKeywords = "8k, ultra HD, intricate details, professional photography, sharp focus, 64 megapixels, HDR, masterpiece, highly detailed, artstation trending";
        
        // Build prompt with style and quality keywords
        let fullPrompt = `${prompt}, ${baseQualityKeywords}`;
        switch (artStyle) {
            case 'realistic':
                fullPrompt += ', ultra realistic, photorealistic, cinematic lighting';
                break;
            case 'fantasy':
                fullPrompt += ', fantasy art, dreamlike, magical, ethereal, otherworldly';
                break;
            case 'anime':
                fullPrompt += ', anime style, studio ghibli, makoto shinkai, vibrant colors';
                break;
            case 'painting':
                fullPrompt += ', oil painting, brush strokes, artistic, impasto technique';
                break;
            case 'cyberpunk':
                fullPrompt += ', cyberpunk style, neon lights, futuristic, rainy cityscape';
                break;
            case 'watercolor':
                fullPrompt += ', watercolor painting, soft edges, artistic, delicate washes';
                break;
            case 'photography':
                fullPrompt += ', professional photography, DSLR, high quality, bokeh, shallow depth of field';
                break;
            case 'surrealism':
                fullPrompt += ', surrealism art, dreamlike, bizarre, Salvador Dali style, metaphysical';
                break;
            case 'fractal':
                fullPrompt += ', fractal art, mathematical patterns, psychedelic, mandala, intricate geometry';
                break;
        }
        
        // Add negative prompt if exists
        let fullNegativePrompt = negativePrompt.value.trim();
        
        try {
            // Construct API URL for Pollinations AI with new parameters
            let apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?`;
            apiUrl += `width=${width}&height=${height}&nologo=true`;
            apiUrl += `&enhance=${enhance.value}`;
            apiUrl += `&model=${model.value}`;
            
            // Use random seed for regeneration
            const useSeed = seed.value > 0 ? seed.value : Math.floor(Math.random() * 999999) + 1;
            apiUrl += `&seed=${useSeed}`;
            
            if (fullNegativePrompt) {
                apiUrl += `&negative_prompt=${encodeURIComponent(fullNegativePrompt)}`;
            }
            
            // Load image
            imagePreview.src = apiUrl;
            
            // When image loads
            imagePreview.onload = function() {
                loading.style.display = 'none';
                imagePreview.style.display = 'block';
                downloadBtn.style.display = 'inline-flex';
                regenerateBtn.style.display = 'inline-flex';
                showNotification('Image generated successfully!', 'success');
            };
            
            // Handle errors
            imagePreview.onerror = function() {
                loading.style.display = 'none';
                placeholder.style.display = 'flex';
                showNotification('Error generating image. Please try again with different settings.', 'error');
            };
        } catch (error) {
            console.error('Error:', error);
            loading.style.display = 'none';
            placeholder.style.display = 'flex';
            showNotification('An error occurred. Please try again.', 'error');
        }
    }
    
    // Generate button click
    generateBtn.addEventListener('click', function() {
        // Check if turbo model is selected and password not verified
        if (model.value === 'turbo' && !isPasswordVerified) {
            pendingGeneration = true;
            showPasswordModal();
            return;
        }
        generateImage();
    });
    
    // Regenerate button click
    regenerateBtn.addEventListener('click', function() {
        if (!lastPrompt) {
            showNotification('No previous prompt to regenerate from', 'error');
            return;
        }
        
        // Set the seed to 0 to get a different image
        seed.value = 0;
        generateImage();
    });
    
    // Reset button click
    resetBtn.addEventListener('click', function() {
        promptInput.value = '';
        negativePrompt.value = '';
        seed.value = 0;
        aspectRatio.value = '1:1';
        model.value = 'stable-diffusion';
        enhance.value = 'true';
        
        // Reset password verification
        isPasswordVerified = false;
        
        // Reset art style to realistic
        artStyleOptions.forEach(opt => opt.classList.remove('selected'));
        document.querySelector('.art-style-option[data-style="realistic"]').classList.add('selected');
        
        // Reset preview
        placeholder.style.display = 'flex';
        loading.style.display = 'none';
        imagePreview.style.display = 'none';
        downloadBtn.style.display = 'none';
        regenerateBtn.style.display = 'none';
        
        showNotification('Form has been reset', 'success');
    });
    
    // Download image
    downloadBtn.addEventListener('click', async function() {
        if (!imagePreview.src || imagePreview.src.includes('data:')) {
            showNotification('No image available to download', 'error');
            return;
        }
        
        try {
            // Fetch the image as a blob
            const response = await fetch(imagePreview.src);
            const blob = await response.blob();
            
            // Create a download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Set the filename
            const prompt = promptInput.value.trim().substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase();
            a.download = `rizqi-o-ai-${prompt || 'image'}-${Date.now()}.jpg`;
            
            // Trigger download
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showNotification('Image downloaded successfully!', 'success');
        } catch (error) {
            console.error('Download error:', error);
            showNotification('Failed to download image', 'error');
        }
    });
    
    // Notification system
    function showNotification(message, type) {
        notification.className = `notification ${type}`;
        notificationMessage.textContent = message;
        
        if (type === 'success') {
            notification.querySelector('i').className = 'fas fa-check-circle';
        } else if (type === 'error') {
            notification.querySelector('i').className = 'fas fa-exclamation-circle';
        } else {
            notification.querySelector('i').className = 'fas fa-info-circle';
        }
        
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});
