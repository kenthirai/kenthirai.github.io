document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const elements = {
        promptInput: document.getElementById('prompt'),
        imageSizeSelect: document.getElementById('imageSize'),
        modelSelect: document.getElementById('model'),
        qualitySelect: document.getElementById('quality'),
        seedInput: document.getElementById('seed'),
        enhanceCheckbox: document.getElementById('enhance'),
        nologoCheckbox: document.getElementById('nologo'),
        privateCheckbox: document.getElementById('private'),
        slideContainer: document.getElementById('slideContainer'),
        slideThumb: document.getElementById('slideThumb'),
        slideProgress: document.getElementById('slideProgress'),
        slideTrack: document.getElementById('slideTrack'),
        generatedImage: document.getElementById('generatedImage'),
        placeholder: document.getElementById('placeholder'),
        loading: document.getElementById('loading'),
        errorMessage: document.getElementById('errorMessage'),
        errorText: document.getElementById('errorText'),
        advancedToggle: document.getElementById('advancedToggle'),
        advancedParams: document.getElementById('advancedParams'),
        downloadBtn: document.getElementById('downloadBtn'),
        historyBtn: document.getElementById('historyBtn'),
        imageContainer: document.querySelector('.image-container')
    };

    // State management
    const state = {
        isDragging: false,
        startX: 0,
        currentX: 0,
        thumbStartX: 0,
        containerWidth: elements.slideContainer.offsetWidth,
        thumbWidth: elements.slideThumb.offsetWidth,
        maxSlideDistance: elements.slideContainer.offsetWidth - elements.slideThumb.offsetWidth - 10,
        lastPrompt: '',
        currentImageUrl: null,
        zoomActive: false,
        zoomBtn: null
    };

    // Initialize from localStorage
    function initFromStorage() {
        const savedState = localStorage.getItem('aiImageGeneratorState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            
            if (parsedState.prompt) elements.promptInput.value = parsedState.prompt;
            if (parsedState.imageSize) elements.imageSizeSelect.value = parsedState.imageSize;
            if (parsedState.model) elements.modelSelect.value = parsedState.model;
            if (parsedState.quality) elements.qualitySelect.value = parsedState.quality;
            if (parsedState.seed) elements.seedInput.value = parsedState.seed;
            if (parsedState.enhance !== undefined) elements.enhanceCheckbox.checked = parsedState.enhance;
            if (parsedState.nologo !== undefined) elements.nologoCheckbox.checked = parsedState.nologo;
            if (parsedState.private !== undefined) elements.privateCheckbox.checked = parsedState.private;
            if (parsedState.advancedVisible !== undefined) {
                if (parsedState.advancedVisible) {
                    elements.advancedParams.style.display = 'block';
                    elements.advancedToggle.classList.add('active');
                }
            }
        } else {
            elements.modelSelect.value = 'grizk';
            elements.qualitySelect.value = 'premium';
            saveToStorage();
        }
    }

    function saveToStorage() {
        const currentState = {
            prompt: elements.promptInput.value,
            imageSize: elements.imageSizeSelect.value,
            model: elements.modelSelect.value,
            quality: elements.qualitySelect.value,
            seed: elements.seedInput.value,
            enhance: elements.enhanceCheckbox.checked,
            nologo: elements.nologoCheckbox.checked,
            private: elements.privateCheckbox.checked,
            advancedVisible: elements.advancedParams.style.display === 'block'
        };
        
        localStorage.setItem('aiImageGeneratorState', JSON.stringify(currentState));
    }

    // Toggle advanced options
    elements.advancedToggle.addEventListener('click', function() {
        const isHidden = elements.advancedParams.style.display !== 'block';
        elements.advancedParams.style.display = isHidden ? 'block' : 'none';
        this.classList.toggle('active', isHidden);
        saveToStorage();
    });

    // Slide to generate functionality
    elements.slideThumb.addEventListener('mousedown', startDrag);
    elements.slideThumb.addEventListener('touchstart', startDrag, { passive: false });

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });

    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    function startDrag(e) {
        state.isDragging = true;
        elements.slideContainer.classList.add('dragging');
        elements.slideThumb.classList.add('active');
        
        state.startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        state.thumbStartX = elements.slideThumb.offsetLeft;
        e.preventDefault();
    }

    function drag(e) {
        if (!state.isDragging) return;
        
        state.currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const distance = state.currentX - state.startX;
        let newPosition = state.thumbStartX + distance;
        
        newPosition = Math.max(5, Math.min(newPosition, state.maxSlideDistance));
        
        elements.slideThumb.style.left = `${newPosition}px`;
        elements.slideProgress.style.width = `${newPosition}px`;
        
        if (newPosition > state.maxSlideDistance * 0.5) {
            elements.slideTrack.textContent = "Release to Generate";
        } else {
            elements.slideTrack.textContent = "Slide to Generate";
        }
        
        e.preventDefault();
    }

    function endDrag() {
        if (!state.isDragging) return;
        state.isDragging = false;
        elements.slideContainer.classList.remove('dragging');
        elements.slideThumb.classList.remove('active');
        
        const finalPosition = parseInt(elements.slideThumb.style.left || '5');
        if (finalPosition >= state.maxSlideDistance * 0.8) {
            completeSlide();
        } else {
            resetSlide();
        }
    }

    function completeSlide() {
        elements.slideThumb.classList.add('success');
        elements.slideThumb.style.left = `${state.maxSlideDistance}px`;
        elements.slideProgress.style.width = '100%';
        elements.slideTrack.textContent = "Generating...";
        
        const icon = elements.slideThumb.querySelector('i');
        icon.className = 'fas fa-check';
        
        generateImage();
    }

    function resetSlide() {
        elements.slideThumb.style.transition = 'left 0.3s ease, background 0.3s ease';
        elements.slideProgress.style.transition = 'width 0.3s ease';
        
        elements.slideThumb.classList.remove('success');
        elements.slideThumb.style.left = '5px';
        elements.slideProgress.style.width = '0';
        elements.slideTrack.textContent = "Slide to Generate";
        
        const icon = elements.slideThumb.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-arrow-right';
        }
        
        state.isDragging = false;
        elements.slideContainer.classList.remove('dragging');
        elements.slideThumb.classList.remove('active');
        
        setTimeout(() => {
            elements.slideThumb.style.transition = '';
            elements.slideProgress.style.transition = '';
        }, 300);
    }

    // Generate image function
    async function generateImage() {
        const prompt = elements.promptInput.value.trim();
        
        if (!prompt) {
            showError('Please enter a prompt');
            resetSlide();
            return;
        }
        
        elements.placeholder.style.display = 'none';
        elements.loading.style.display = 'flex';
        elements.generatedImage.style.display = 'none';
        elements.errorMessage.style.display = 'none';
        elements.downloadBtn.style.display = 'none';
        
        const [width, height] = elements.imageSizeSelect.value.split('x');
        
        const params = {
            width: width,
            height: height,
            model: elements.modelSelect.value,
            quality: elements.qualitySelect.value,
            enhance: elements.enhanceCheckbox.checked ? 'true' : undefined,
            nologo: elements.nologoCheckbox.checked ? 'true' : undefined,
            private: elements.privateCheckbox.checked ? 'true' : undefined,
            sharpness: 95,
            texture_detail: 'ultra',
            hdr: 'true',
            anti_aliasing: 'high'
        };
        
        if (prompt === state.lastPrompt || !elements.seedInput.value.trim()) {
            const randomSeed = Math.floor(Math.random() * 1000000);
            params.seed = randomSeed;
            elements.seedInput.value = randomSeed;
        } else if (elements.seedInput.value.trim()) {
            params.seed = elements.seedInput.value.trim();
        }
        
        state.lastPrompt = prompt;
        
        let finalPrompt = prompt;
        if (elements.modelSelect.value === 'grizk') {
            finalPrompt = `A hyper-detailed hybrid 3D animation render combining Pixar's technical perfection with Ghibli's artistic charm: "${prompt}".

Render with these premium qualities:
1. Ultra HD Clarity - 16K resolution with crisp anti-aliasing
2. Cinematic Lighting - Ray-traced reflections with HDR environment maps
3. Material Perfection - PBR materials with 4K texture maps
4. Ghibli Artistic Touches - Visible painterly texture in backgrounds

Technical Specifications:
- Render engine: Cycles with 4096 samples
- Output: EXR 32-bit HDR
- Post-processing: ACES color grading`;
        }
        
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
        
        try {
            const imageUrl = await fetchImage(finalPrompt, params);
            state.currentImageUrl = imageUrl;
            
            elements.generatedImage.onload = function() {
                elements.loading.style.display = 'none';
                elements.generatedImage.style.display = 'block';
                elements.downloadBtn.style.display = 'flex';
                resetSlide();
                
                // Create and setup zoom button
                createZoomButton();
            };
            elements.generatedImage.src = imageUrl;
            
            if (window.addToHistory) {
                window.addToHistory(prompt, imageUrl, params);
            }
            
            saveToStorage();
        } catch (error) {
            console.error('Error generating image:', error);
            showError(error.message || 'Failed to generate image. Please try again.');
            elements.loading.style.display = 'none';
            elements.placeholder.style.display = 'flex';
            resetSlide();
        }
    }

    // Create zoom button
    function createZoomButton() {
        // Remove existing zoom button if any
        if (state.zoomBtn) {
            state.zoomBtn.remove();
        }

        // Create zoom button
        state.zoomBtn = document.createElement('button');
        state.zoomBtn.className = 'zoom-btn';
        state.zoomBtn.innerHTML = '<i class="fas fa-search-plus"></i>';
        state.zoomBtn.title = 'Zoom Image';
        
        // Position the button absolutely within image container
        elements.imageContainer.style.position = 'relative';
        state.zoomBtn.style.position = 'absolute';
        state.zoomBtn.style.top = '10px';
        state.zoomBtn.style.right = '10px';
        state.zoomBtn.style.zIndex = '10';
        state.zoomBtn.style.background = 'rgba(0,0,0,0.6)';
        state.zoomBtn.style.border = 'none';
        state.zoomBtn.style.borderRadius = '50%';
        state.zoomBtn.style.width = '36px';
        state.zoomBtn.style.height = '36px';
        state.zoomBtn.style.color = 'white';
        state.zoomBtn.style.cursor = 'pointer';
        state.zoomBtn.style.display = 'flex';
        state.zoomBtn.style.alignItems = 'center';
        state.zoomBtn.style.justifyContent = 'center';
        state.zoomBtn.style.transition = 'all 0.3s ease';
        
        state.zoomBtn.addEventListener('mouseenter', () => {
            state.zoomBtn.style.background = 'rgba(0,0,0,0.8)';
            state.zoomBtn.style.transform = 'scale(1.1)';
        });
        
        state.zoomBtn.addEventListener('mouseleave', () => {
            state.zoomBtn.style.background = 'rgba(0,0,0,0.6)';
            state.zoomBtn.style.transform = 'scale(1)';
        });
        
        // Add click handler to show zoom overlay
        state.zoomBtn.addEventListener('click', showZoomOverlay);
        
        elements.imageContainer.appendChild(state.zoomBtn);
    }

    // Show zoom overlay
    function showZoomOverlay() {
        if (!state.currentImageUrl) return;
        
        // Create overlay container
        const overlay = document.createElement('div');
        overlay.className = 'zoom-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
        overlay.style.zIndex = '1000';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.cursor = 'zoom-out';
        
        // Create zoomed image
        const zoomedImg = document.createElement('img');
        zoomedImg.src = state.currentImageUrl;
        zoomedImg.style.maxWidth = '90%';
        zoomedImg.style.maxHeight = '90%';
        zoomedImg.style.objectFit = 'contain';
        zoomedImg.style.borderRadius = '8px';
        zoomedImg.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'zoom-close-btn';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '20px';
        closeBtn.style.right = '20px';
        closeBtn.style.background = 'rgba(255,255,255,0.2)';
        closeBtn.style.border = 'none';
        closeBtn.style.borderRadius = '50%';
        closeBtn.style.width = '40px';
        closeBtn.style.height = '40px';
        closeBtn.style.color = 'white';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontSize = '1.2rem';
        closeBtn.style.display = 'flex';
        closeBtn.style.alignItems = 'center';
        closeBtn.style.justifyContent = 'center';
        closeBtn.style.transition = 'all 0.3s ease';
        
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255,255,255,0.3)';
            closeBtn.style.transform = 'rotate(90deg)';
        });
        
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(255,255,255,0.2)';
            closeBtn.style.transform = 'rotate(0deg)';
        });
        
        // Add elements to overlay
        overlay.appendChild(zoomedImg);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);
        
        // Set state
        state.zoomActive = true;
        document.body.style.overflow = 'hidden';
        
        // Close handlers
        function closeOverlay() {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = '';
                state.zoomActive = false;
            }, 300);
        }
        
        overlay.addEventListener('click', closeOverlay);
        closeBtn.addEventListener('click', closeOverlay);
        
        // Close with ESC key
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeOverlay();
                document.removeEventListener('keydown', escHandler);
            }
        });
        
        // Animate appearance
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
    }

    async function fetchImage(prompt, params = {}) {
        const queryParams = new URLSearchParams();
        
        Object.keys(params).forEach(key => {
            queryParams.append(key, params[key]);
        });
        
        const encodedPrompt = encodeURIComponent(prompt);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?${queryParams.toString()}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'image/*'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            const imageBlob = await response.blob();
            
            if (!imageBlob.type.startsWith('image/')) {
                throw new Error('Invalid image format received');
            }
            
            return URL.createObjectURL(imageBlob);
        } catch (error) {
            console.error('Fetch error:', error);
            throw new Error('Failed to download image. Please check your connection and try again.');
        }
    }

    function showError(message) {
        elements.errorText.textContent = message;
        elements.errorMessage.style.display = 'block';
        setTimeout(() => {
            elements.errorMessage.style.opacity = '1';
        }, 10);
    }

    elements.downloadBtn.addEventListener('click', function() {
        if (!state.currentImageUrl) return;
        
        const link = document.createElement('a');
        link.href = state.currentImageUrl;
        link.download = `ai-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Initialize from storage
    initFromStorage();

    // Save state on any change
    const saveEvents = ['input', 'change', 'click'];
    
    saveEvents.forEach(event => {
        elements.promptInput.addEventListener(event, saveToStorage);
        elements.imageSizeSelect.addEventListener(event, saveToStorage);
        elements.modelSelect.addEventListener(event, saveToStorage);
        elements.qualitySelect.addEventListener(event, saveToStorage);
        elements.seedInput.addEventListener(event, saveToStorage);
        elements.enhanceCheckbox.addEventListener(event, saveToStorage);
        elements.nologoCheckbox.addEventListener(event, saveToStorage);
        elements.privateCheckbox.addEventListener(event, saveToStorage);
    });

    // Add animation to loading text
    const loadingText = document.createElement('style');
    loadingText.textContent = `
        @keyframes pulse {
            0% { opacity: 0.8; transform: scale(0.98); }
            50% { opacity: 1; transform: scale(1.02); }
            100% { opacity: 0.8; transform: scale(0.98); }
        }
        .loading p {
            animation: pulse 1.5s infinite ease-in-out;
        }
        #errorMessage {
            transition: opacity 0.3s ease;
            opacity: 0;
        }
        .zoom-overlay {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .zoom-btn:hover {
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(loadingText);
});