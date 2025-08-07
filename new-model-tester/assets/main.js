document.addEventListener('DOMContentLoaded', function() {
    // ====================== DOM Elements ======================
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
        imageContainer: document.querySelector('.image-container'),
        clearPromptBtn: document.getElementById('clearPromptBtn')
    };

    // ====================== State Management ======================
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
        zoomBtn: null,
        MAX_RETRIES: 2
    };

    // ====================== Initialization ======================
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
            elements.modelSelect.value = 'flux';
            elements.qualitySelect.value = 'hd';
            saveToStorage();
        }
        
        showModelSpecificGuidance();
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

    // ====================== UI Event Handlers ======================
    elements.advancedToggle.addEventListener('click', function() {
        const isHidden = elements.advancedParams.style.display !== 'block';
        elements.advancedParams.style.display = isHidden ? 'block' : 'none';
        this.classList.toggle('active', isHidden);
        saveToStorage();
    });

    elements.clearPromptBtn.addEventListener('click', function() {
        elements.promptInput.value = '';
        saveToStorage();
    });

    elements.modelSelect.addEventListener('change', function() {
        showModelSpecificGuidance();
        saveToStorage();
    });

    // ====================== Slide Generation ======================
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
        elements.slideTrack.textContent = newPosition > state.maxSlideDistance * 0.5 
            ? "Release to Generate" 
            : "Slide to Generate";
        
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
        elements.slideThumb.querySelector('i').className = 'fas fa-check';
        
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
        if (icon) icon.className = 'fas fa-arrow-right';
        
        setTimeout(() => {
            elements.slideThumb.style.transition = '';
            elements.slideProgress.style.transition = '';
        }, 300);
    }

    // ====================== Image Generation ======================
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
            enhance: elements.enhanceCheckbox.checked,
            nologo: elements.nologoCheckbox.checked,
            private: elements.privateCheckbox.checked,
            // Pastikan seed selalu baru dengan kombinasi timestamp dan random number
            seed: elements.seedInput.value.trim() || `${Date.now()}-${Math.floor(Math.random() * 1000000)}`
        };

        try {
            const imageUrl = await fetchImageWithRetry(prompt, params);
            state.currentImageUrl = imageUrl;
            
            elements.generatedImage.onload = function() {
                elements.loading.style.display = 'none';
                elements.generatedImage.style.display = 'block';
                elements.downloadBtn.style.display = 'flex';
                resetSlide();
                createZoomButton();
            };
            
            elements.generatedImage.onerror = function() {
                throw new Error('Failed to load generated image');
            };
            
            elements.generatedImage.src = imageUrl;
            saveToStorage();
            
            if (window.addToHistory) {
                window.addToHistory(prompt, imageUrl, params);
            }
            
        } catch (error) {
            console.error('Generation error:', error);
            showError(error.message || 'Failed to generate image. Please try again.');
            elements.loading.style.display = 'none';
            elements.placeholder.style.display = 'flex';
            resetSlide();
        }
    }

    async function fetchImageWithRetry(prompt, params, retryCount = 0) {
        try {
            return await fetchImage(prompt, params);
        } catch (error) {
            if (retryCount < state.MAX_RETRIES) {
                console.log(`Retrying (${retryCount + 1}/${state.MAX_RETRIES})...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                return fetchImageWithRetry(prompt, params, retryCount + 1);
            }
            throw error;
        }
    }

    async function fetchImage(prompt, params = {}) {
        const requestParams = {
            ...params,
            enhance: params.enhance ? 'true' : 'false',
            nologo: params.nologo ? 'true' : 'false',
            private: params.private ? 'true' : 'false'
        };

        const queryParams = new URLSearchParams();
        Object.entries(requestParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value);
            }
        });
        
        const encodedPrompt = encodeURIComponent(prompt);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?${queryParams.toString()}`;
        
        console.log('Fetching image from:', url);
        
        const response = await fetch(url, { headers: { 'Accept': 'image/*' } });
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        
        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) throw new Error('Invalid image format');
        
        return URL.createObjectURL(blob);
    }

    // ====================== UI Helpers ======================
    function showModelSpecificGuidance() {
        const existingGuidance = document.querySelector('.model-guidance');
        if (existingGuidance) existingGuidance.remove();
        
        const guidance = document.createElement('div');
        guidance.className = 'model-guidance';
        
        if (elements.modelSelect.value === 'turbo') {
            guidance.innerHTML = `
                <div class="guidance-message turbo-info">
                    <i class="fas fa-bolt"></i>
                    <strong>Turbo Model:</strong> Faster generation with slightly reduced quality.
                </div>
            `;
        } else if (elements.modelSelect.value === 'gptimage') {
            guidance.innerHTML = `
                <div class="guidance-message gptimage-info">
                    <i class="fas fa-brain"></i>
                    <strong>GPTImage Model:</strong> Advanced AI model for highly detailed and creative images.
                </div>
            `;
        }
        
        if (guidance.innerHTML) {
            document.querySelector('.container').insertBefore(guidance, document.querySelector('.input-group'));
        }
    }

    function showError(message) {
        elements.errorText.textContent = message;
        elements.errorMessage.style.display = 'block';
        setTimeout(() => elements.errorMessage.style.opacity = '1', 10);
        
        setTimeout(() => {
            elements.errorMessage.style.opacity = '0';
            setTimeout(() => elements.errorMessage.style.display = 'none', 300);
        }, 5000);
    }

    function createZoomButton() {
        if (state.zoomBtn) state.zoomBtn.remove();
        
        state.zoomBtn = document.createElement('button');
        state.zoomBtn.className = 'zoom-btn';
        state.zoomBtn.innerHTML = '<i class="fas fa-search-plus"></i>';
        state.zoomBtn.title = 'Zoom Image';
        
        Object.assign(state.zoomBtn.style, {
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: '10',
            background: 'rgba(0,0,0,0.6)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
        });
        
        state.zoomBtn.addEventListener('mouseenter', () => {
            state.zoomBtn.style.background = 'rgba(0,0,0,0.8)';
            state.zoomBtn.style.transform = 'scale(1.1)';
        });
        
        state.zoomBtn.addEventListener('mouseleave', () => {
            state.zoomBtn.style.background = 'rgba(0,0,0,0.6)';
            state.zoomBtn.style.transform = 'scale(1)';
        });
        
        state.zoomBtn.addEventListener('click', showZoomOverlay);
        elements.imageContainer.appendChild(state.zoomBtn);
    }

    function showZoomOverlay() {
        if (!state.currentImageUrl || state.zoomActive) return;
        state.zoomActive = true;
        
        const overlay = document.createElement('div');
        overlay.className = 'zoom-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: '1000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        });
        
        const zoomedImg = document.createElement('img');
        zoomedImg.src = state.currentImageUrl;
        Object.assign(zoomedImg.style, {
            maxWidth: '90%',
            maxHeight: '90%',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)'
        });
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'zoom-close-btn';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        Object.assign(closeBtn.style, {
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
        });
        
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255,255,255,0.3)';
            closeBtn.style.transform = 'rotate(90deg)';
        });
        
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(255,255,255,0.2)';
            closeBtn.style.transform = 'rotate(0deg)';
        });
        
        overlay.appendChild(zoomedImg);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => overlay.style.opacity = '1', 10);
        
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
        
        const escHandler = (e) => e.key === 'Escape' && closeOverlay();
        document.addEventListener('keydown', escHandler);
        overlay.addEventListener('transitionend', () => {
            if (overlay.style.opacity === '0') {
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    // ====================== Download Handler ======================
    elements.downloadBtn.addEventListener('click', function() {
        if (!state.currentImageUrl) return;
        
        const link = document.createElement('a');
        link.href = state.currentImageUrl;
        link.download = `ai-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // ====================== Initialization ======================
    initFromStorage();

    // Save state on changes
    ['input', 'change', 'click'].forEach(event => {
        elements.promptInput.addEventListener(event, saveToStorage);
        elements.imageSizeSelect.addEventListener(event, saveToStorage);
        elements.modelSelect.addEventListener(event, saveToStorage);
        elements.qualitySelect.addEventListener(event, saveToStorage);
        elements.seedInput.addEventListener(event, saveToStorage);
        elements.enhanceCheckbox.addEventListener(event, saveToStorage);
        elements.nologoCheckbox.addEventListener(event, saveToStorage);
        elements.privateCheckbox.addEventListener(event, saveToStorage);
    });

    // Add loading animation
    const loadingStyles = document.createElement('style');
    loadingStyles.textContent = `
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
        .model-guidance {
            margin-bottom: 1rem;
            padding: 0.75rem 1rem;
            border-radius: 6px;
            font-size: 0.9rem;
        }
        .turbo-info {
            background-color: rgba(13, 110, 253, 0.2);
            border-left: 4px solid #0d6efd;
            color: #0d6efd;
        }
        .gptimage-info {
            background-color: rgba(156, 39, 176, 0.2);
            border-left: 4px solid #9c27b0;
            color: #9c27b0;
        }
        .guidance-message i {
            margin-right: 0.5rem;
        }
    `;
    document.head.appendChild(loadingStyles);
});