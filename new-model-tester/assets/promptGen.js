// promptGen.js
document.addEventListener('DOMContentLoaded', async function() {
    // Create toggleable prompt assistant
    const promptToggle = document.createElement('div');
    promptToggle.className = 'prompt-toggle';
    promptToggle.innerHTML = `
        <div class="toggle-header">
            <i class="fas fa-wand-magic-sparkles"></i>
            <span>Prompt Assistant</span>
            <i class="toggle-chevron fas fa-chevron-down"></i>
        </div>
    `;
    
    const promptPanel = document.createElement('div');
    promptPanel.className = 'prompt-panel';
    promptPanel.style.display = 'none';
    promptPanel.innerHTML = `
        <div class="prompt-inputs">
            <div class="input-group">
                <label for="promptSubject"><i class="fas fa-bullseye"></i> Main Subject</label>
                <input type="text" id="promptSubject" placeholder="e.g. futuristic city">
            </div>
            
            <div class="input-group">
                <label for="promptDetails"><i class="fas fa-plus-circle"></i> Details</label>
                <input type="text" id="promptDetails" placeholder="e.g. neon lights, raining">
            </div>
            
            <div class="input-row">
                <div class="input-group">
                    <label for="promptStyle"><i class="fas fa-paint-brush"></i> Style</label>
                    <select id="promptStyle">
                        <option value="">Any style</option>
                        <option value="realistic">Realistic</option>
                        <option value="cyberpunk">Cyberpunk</option>
                        <option value="anime">Anime</option>
                    </select>
                </div>
                
                <div class="input-group">
                    <label for="promptModel"><i class="fas fa-robot"></i> Model</label>
                    <select id="promptModel" disabled>
                        <option value="">Loading...</option>
                    </select>
                </div>
            </div>
            
            <div class="seed-option">
                <input type="checkbox" id="randomSeed" checked>
                <label for="randomSeed">Use random seed</label>
            </div>
        </div>
        
        <div class="generate-controls">
            <button id="generatePromptBtn" class="generate-btn">
                <i class="fas fa-magic"></i> Generate Enhanced Prompt
            </button>
            <div class="progress-container">
                <div class="progress-bar" id="generateProgress"></div>
            </div>
        </div>
        
        <div class="result-container">
            <label>Generated Prompt:</label>
            <textarea id="generatedPromptResult" readonly placeholder="Your enhanced prompt will appear here"></textarea>
            <div class="result-actions">
                <button id="usePromptBtn" class="action-btn">
                    <i class="fas fa-check"></i> Use This Prompt
                </button>
                <button id="copyPromptBtn" class="action-btn">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
        </div>
    `;
    
    // Insert after the prompt textarea
    const promptContainer = document.querySelector('.input-group');
    promptContainer.insertBefore(promptToggle, promptContainer.children[2]);
    promptContainer.insertBefore(promptPanel, promptContainer.children[3]);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .prompt-toggle {
            background: rgba(108, 92, 231, 0.1);
            border-radius: 12px;
            padding: 0.75rem 1rem;
            margin: 1rem 0;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid rgba(108, 92, 231, 0.2);
        }
        
        .prompt-toggle:hover {
            background: rgba(108, 92, 231, 0.15);
        }
        
        .toggle-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 500;
            color: var(--primary);
        }
        
        .toggle-chevron {
            margin-left: auto;
            transition: transform 0.3s ease;
        }
        
        .prompt-toggle.active .toggle-chevron {
            transform: rotate(180deg);
        }
        
        .prompt-panel {
            display: none;
            background: rgba(108, 92, 231, 0.05);
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1rem;
            border: 1px dashed rgba(108, 92, 231, 0.3);
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .prompt-inputs {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 1rem;
        }
        
        .prompt-panel .input-group {
            margin-bottom: 0;
        }
        
        .prompt-panel label {
            font-size: 0.85rem;
            color: var(--text-light);
            margin-bottom: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .prompt-panel input,
        .prompt-panel select {
            width: 100%;
            padding: 0.65rem 1rem;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            font-size: 0.9rem;
            background-color: var(--card-bg);
            color: var(--text);
            transition: all 0.3s ease;
        }
        
        .prompt-panel input:focus,
        .prompt-panel select:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
        }
        
        .input-row {
            display: flex;
            gap: 0.75rem;
        }
        
        .input-row .input-group {
            flex: 1;
        }
        
        .seed-option {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0.5rem 0;
        }
        
        .seed-option input {
            width: auto;
        }
        
        .seed-option label {
            margin: 0;
            font-size: 0.85rem;
            color: var(--text-light);
        }
        
        .generate-controls {
            margin: 1rem 0;
        }
        
        .generate-btn {
            width: 100%;
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.75rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        }
        
        .generate-btn:hover {
            background: var(--primary-dark);
        }
        
        .generate-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        .progress-container {
            width: 100%;
            height: 6px;
            background: #f0f0f0;
            border-radius: 3px;
            margin-top: 0.5rem;
            overflow: hidden;
            display: none;
        }
        
        .progress-bar {
            height: 100%;
            width: 0;
            background: linear-gradient(90deg, var(--primary), var(--primary-dark));
            border-radius: 3px;
            transition: width 0.3s ease;
        }
        
        .result-container {
            display: none;
            flex-direction: column;
            gap: 0.5rem;
            margin-top: 1rem;
            animation: fadeIn 0.3s ease;
        }
        
        .result-container label {
            font-size: 0.85rem;
            color: var(--text-light);
        }
        
        #generatedPromptResult {
            width: 100%;
            min-height: 100px;
            padding: 0.75rem;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            resize: vertical;
            font-family: inherit;
            font-size: 0.9rem;
        }
        
        .result-actions {
            display: flex;
            gap: 0.75rem;
        }
        
        .action-btn {
            flex: 1;
            background: var(--bg);
            color: var(--text);
            border: 1px solid #e0e0e0;
            padding: 0.65rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.85rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        }
        
        .action-btn:hover {
            background: #f0f0f0;
        }
        
        .action-btn:active {
            transform: scale(0.98);
        }
        
        #usePromptBtn {
            background: var(--primary);
            color: white;
            border: none;
        }
        
        #usePromptBtn:hover {
            background: var(--primary-dark);
        }
        
        #copyPromptBtn.copied {
            background: var(--success);
            color: white;
            border-color: var(--success);
        }
        
        @media (max-width: 600px) {
            .input-row {
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .result-actions {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Toggle functionality
    promptToggle.addEventListener('click', function() {
        const isHidden = promptPanel.style.display !== 'block';
        promptPanel.style.display = isHidden ? 'block' : 'none';
        promptToggle.classList.toggle('active', isHidden);
    });
    
    // Load models from API
    async function loadModels() {
        try {
            const response = await fetch('https://text.pollinations.ai/models');
            if (!response.ok) throw new Error('Failed to load models');
            
            const models = await response.json();
            const modelSelect = document.getElementById('promptModel');
            modelSelect.innerHTML = '';
            
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Auto-select';
            modelSelect.appendChild(defaultOption);
            
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.name;
                modelSelect.appendChild(option);
            });
            
            modelSelect.disabled = false;
        } catch (error) {
            console.error('Error loading models:', error);
            const modelSelect = document.getElementById('promptModel');
            modelSelect.innerHTML = '<option value="">Default model</option>';
            modelSelect.disabled = false;
        }
    }
    
    // Initialize models dropdown
    loadModels();
    
    // Generate prompt function with progress simulation
    async function generatePrompt() {
        const subject = document.getElementById('promptSubject').value.trim();
        const details = document.getElementById('promptDetails').value.trim();
        const style = document.getElementById('promptStyle').value;
        const model = document.getElementById('promptModel').value || 'openai';
        const useRandomSeed = document.getElementById('randomSeed').checked;
        const generateBtn = document.getElementById('generatePromptBtn');
        const progressBar = document.getElementById('generateProgress');
        const progressContainer = document.querySelector('.progress-container');
        
        if (!subject && !details) {
            showError('Please enter at least a subject or details');
            return null;
        }
        
        // Reset and show progress
        generateBtn.disabled = true;
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        
        // Simulate progress (25%, 50%, 75% during the process)
        const updateProgress = (percent) => {
            progressBar.style.width = `${percent}%`;
        };
        
        updateProgress(10);
        
        try {
            const messages = [
                { 
                    role: "system", 
                    content: "You are a creative AI assistant that helps users generate detailed, imaginative prompts for AI image generation. " +
                             "Respond with a single, rich, descriptive prompt (1-2 sentences) that includes: " +
                             "1. Clear subject 2. Visual details 3. Style elements 4. Lighting/colors 5. Composition"
                },
                { 
                    role: "user", 
                    content: buildPromptRequest(subject, details, style)
                }
            ];
            
            updateProgress(30);
            
            const options = {
                model: model,
                private: document.getElementById('private').checked
            };
            
            // Add random seed if checkbox is checked
            if (useRandomSeed) {
                const randomSeed = Math.floor(Math.random() * 1000000);
                options.seed = randomSeed;
                
                // Update seed input if exists
                const seedInput = document.getElementById('seed');
                if (seedInput) {
                    seedInput.value = randomSeed;
                    if (typeof saveToStorage === 'function') {
                        saveToStorage();
                    }
                }
            }
            
            updateProgress(60);
            
            const response = await postChatCompletion(messages, options);
            updateProgress(90);
            
            return response.choices[0].message.content;
        } catch (error) {
            console.error('Error generating prompt:', error);
            showError('Failed to generate prompt. Please try again.');
            return null;
        } finally {
            updateProgress(100);
            setTimeout(() => {
                progressContainer.style.display = 'none';
                generateBtn.disabled = false;
            }, 500);
        }
    }
    
    // Build the prompt request
    function buildPromptRequest(subject, details, style) {
        let request = [];
        
        if (subject) request.push(`Main subject: ${subject}`);
        if (details) request.push(`Details: ${details}`);
        if (style) request.push(`Style: ${style}`);
        
        return request.length > 0 
            ? `Create an AI image prompt with these elements: ${request.join(', ')}. Make it visually rich and descriptive.`
            : "Create a creative AI image prompt with rich visual details";
    }
    
    // API call function
    async function postChatCompletion(messages, options = {}) {
        const url = "https://text.pollinations.ai/openai";
        const payload = {
            model: options.model || "openai",
            messages: messages,
            seed: options.seed,
            private: options.private,
            referrer: "AI-Image-Generator"
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return await response.json();
    }
    
    // Event listener for generate button
    document.getElementById('generatePromptBtn').addEventListener('click', async function() {
        const generatedPrompt = await generatePrompt();
        if (generatedPrompt) {
            const resultContainer = document.querySelector('.result-container');
            const resultTextarea = document.getElementById('generatedPromptResult');
            
            resultTextarea.value = generatedPrompt;
            resultContainer.style.display = 'flex';
            
            // Scroll to show the result
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
    
    // Use prompt button
    document.getElementById('usePromptBtn').addEventListener('click', function() {
        const generatedPrompt = document.getElementById('generatedPromptResult').value;
        if (generatedPrompt) {
            document.getElementById('prompt').value = generatedPrompt;
            
            // Save to localStorage if the function exists
            if (typeof saveToStorage === 'function') {
                saveToStorage();
            }
            
            // Show confirmation
            this.innerHTML = '<i class="fas fa-check"></i> Prompt Applied!';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Use This Prompt';
            }, 2000);
        }
    });
    
    // Copy prompt button
    document.getElementById('copyPromptBtn').addEventListener('click', function() {
        const promptText = document.getElementById('generatedPromptResult').value;
        if (!promptText) return;
        
        navigator.clipboard.writeText(promptText).then(() => {
            this.innerHTML = '<i class="fas fa-check"></i> Copied!';
            this.classList.add('copied');
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-copy"></i> Copy';
                this.classList.remove('copied');
            }, 2000);
        });
    });
    
    // Helper function to show errors
    function showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        if (errorMessage && errorText) {
            errorText.textContent = message;
            errorMessage.style.display = 'block';
            
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    }
});