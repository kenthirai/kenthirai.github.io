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
        historyBtn: document.getElementById('historyBtn')
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
        currentImageUrl: null
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

    // Save to localStorage
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
        
        // Reset dragging state
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
        
        // Show loading state
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
                resetSlide(); // Reset slide button after image loads
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
            resetSlide(); // Reset slide button on error
        }
    }

    // Fetch image from API
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

    // Show error message
    function showError(message) {
        elements.errorText.textContent = message;
        elements.errorMessage.style.display = 'block';
        setTimeout(() => {
            elements.errorMessage.style.opacity = '1';
        }, 10);
    }

    // Download image
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
    `;
    document.head.appendChild(loadingText);
});