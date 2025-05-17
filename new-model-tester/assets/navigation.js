document.addEventListener('DOMContentLoaded', function() {
    // CSS Variables Setup
    if (!document.documentElement.style.getPropertyValue('--primary')) {
        const cssVars = {
            '--primary': '#6c5ce7',
            '--primary-dark': '#5649c0',
            '--text': '#2d3436',
            '--text-light': '#636e72',
            '--bg': '#e0e5ec',
            '--card-bg': '#e0e5ec',
            '--shadow-light': '#ffffff',
            '--shadow-dark': '#a3b1c6'
        };
        Object.entries(cssVars).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
    }

    // Navigation Container
    const navContainer = document.createElement('nav');
    Object.assign(navContainer.style, {
        position: 'fixed',
        bottom: '0',
        left: '0',
        width: '100%',
        backgroundColor: 'var(--card-bg)',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        zIndex: '1000',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0',
        borderTop: '1px solid rgba(255,255,255,0.2)'
    });
    navContainer.id = 'bottomNavigation';

    // Navigation Items
    const navItems = [
        { icon: 'fas fa-home', text: 'Home', link: 'index.html', active: isCurrentPage('index.html') },
        { icon: 'fas fa-tags', text: 'Pricing', link: 'pricing.html', active: isCurrentPage('pricing.html') },
        { icon: 'fas fa-code', text: 'API', link: 'api.html', active: isCurrentPage('api.html') },
        { icon: 'fas fa-comment', text: 'Chat', link: '#', onClick: handleChatClick },
        { icon: 'fas fa-bars', text: 'Menu', link: '#', onClick: handleMenuClick }
    ];

    function isCurrentPage(page) {
        return window.location.pathname.endsWith(page);
    }

    function handleChatClick(e) {
        e.preventDefault();
        openChatModal();
    }

    function handleMenuClick(e) {
        e.preventDefault();
        toggleMenu(this);
    }

    navItems.forEach(item => {
        const navItem = createNavItem(item);
        navContainer.appendChild(navItem);
    });

    function createNavItem(item) {
        const navItem = document.createElement('a');
        navItem.href = item.link;
        navItem.className = 'nav-item';
        
        Object.assign(navItem.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: item.active ? 'var(--primary)' : 'var(--text-light)',
            fontSize: '12px',
            transition: 'all 0.3s ease',
            padding: '8px 12px',
            borderRadius: '8px'
        });

        if (item.active) {
            navItem.style.boxShadow = 'inset 3px 3px 5px var(--shadow-dark), inset -3px -3px 5px var(--shadow-light)';
        }

        const icon = document.createElement('i');
        icon.className = item.icon;
        Object.assign(icon.style, {
            fontSize: '20px',
            marginBottom: '4px',
            transition: 'all 0.3s ease'
        });

        const text = document.createElement('span');
        text.textContent = item.text;
        Object.assign(text.style, {
            fontSize: '0.75rem',
            fontWeight: '500'
        });

        if (item.onClick) {
            navItem.addEventListener('click', item.onClick);
        }

        navItem.addEventListener('mouseenter', () => !item.active && (() => {
            navItem.style.color = 'var(--primary)';
            icon.style.transform = 'translateY(-2px)';
        })());

        navItem.addEventListener('mouseleave', () => !item.active && (() => {
            navItem.style.color = 'var(--text-light)';
            icon.style.transform = 'translateY(0)';
        })());

        navItem.append(icon, text);
        return navItem;
    }

    document.body.appendChild(navContainer);
    document.body.style.paddingBottom = '72px';

    // Image Analysis Functions
    const ImageAnalyzer = {
        async fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        },

        async analyze(imageFile, question = "Describe this image in detail and suggest a good prompt for image generation.") {
            const messagesContainer = document.getElementById('chatMessages');
            if (!messagesContainer) return;

            try {
                // Show upload status
                const uploadMsg = this.createUploadMessage();
                messagesContainer.appendChild(uploadMsg);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                // Process image
                const base64Image = await this.fileToBase64(imageFile);
                const previewMsg = this.createPreviewMessage(base64Image);
                messagesContainer.appendChild(previewMsg);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                // API Request
                const response = await this.sendAnalysisRequest(base64Image, question);
                const analysis = response.choices[0].message.content;

                // Display results
                uploadMsg.remove();
                const analysisMsg = this.createAnalysisMessage(analysis);
                messagesContainer.appendChild(analysisMsg);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                this.setupPromptButton(analysis);
            } catch (error) {
                this.showErrorMessage(error.message);
                console.error("Image analysis error:", error);
            }
        },

        createUploadMessage() {
            const msg = document.createElement('div');
            msg.className = 'chat-message user';
            Object.assign(msg.style, {
                alignSelf: 'flex-end'
            });
            msg.innerHTML = `
                <div class="chat-bubble" style="background-color: var(--primary); color: white; border-radius: 12px 12px 0 12px;">
                    <i class="fas fa-spinner fa-spin"></i> Analyzing image...
                </div>
            `;
            return msg;
        },

        createPreviewMessage(imageData) {
            const msg = document.createElement('div');
            msg.className = 'chat-message user';
            Object.assign(msg.style, {
                alignSelf: 'flex-end',
                maxWidth: '80%'
            });
            msg.innerHTML = `
                <div style="background-color: var(--primary); border-radius: 12px 12px 0 12px; padding: 8px;">
                    <img src="${imageData}" style="max-width: 100%; max-height: 200px; border-radius: 8px; display: block;">
                </div>
            `;
            return msg;
        },

        async sendAnalysisRequest(imageData, question) {
            const url = "https://text.pollinations.ai/openai";
            const payload = {
                model: "openai",
                messages: [{
                    role: "user",
                    content: [
                        { type: "text", text: question },
                        { type: "image_url", image_url: { url: imageData } }
                    ]
                }],
                max_tokens: 500
            };

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }

            return await response.json();
        },

        createAnalysisMessage(content) {
            const msg = document.createElement('div');
            msg.className = 'chat-message ai';
            Object.assign(msg.style, {
                alignSelf: 'flex-start'
            });
            msg.innerHTML = `
                <div class="chat-bubble">
                    <strong>Image Analysis:</strong><br>
                    ${content}
                    <div style="margin-top: 8px;">
                        <button class="use-as-prompt-btn">
                            Use as Image Prompt
                        </button>
                    </div>
                </div>
            `;
            return msg;
        },

        setupPromptButton(content) {
            const textarea = document.querySelector('#chatModal textarea');
            if (!textarea) return;

            document.querySelector('.use-as-prompt-btn')?.addEventListener('click', () => {
                textarea.value = content;
                textarea.focus();
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
            });
        },

        showErrorMessage(message) {
            const messagesContainer = document.getElementById('chatMessages');
            if (!messagesContainer) return;

            const msg = document.createElement('div');
            msg.className = 'chat-message ai';
            Object.assign(msg.style, {
                alignSelf: 'flex-start'
            });
            msg.innerHTML = `
                <div class="chat-bubble" style="background-color: #ffebee; color: #c62828; border-radius: 12px 12px 12px 0;">
                    <i class="fas fa-exclamation-circle"></i> ${message}
                </div>
            `;
            messagesContainer.appendChild(msg);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    };

    // Chat Modal
    function openChatModal() {
        if (document.getElementById('chatModal')) return;

        const modal = document.createElement('div');
        modal.id = 'chatModal';
        Object.assign(modal.style, {
            position: 'fixed',
            bottom: '72px',
            right: '16px',
            width: '350px',
            maxHeight: '500px',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            boxShadow: '5px 5px 15px var(--shadow-dark), -5px -5px 15px var(--shadow-light)',
            zIndex: '1001',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden'
        });

        // Header
        const header = document.createElement('div');
        Object.assign(header.style, {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            fontWeight: '500'
        });

        const title = document.createElement('div');
        title.textContent = 'AI Assistant';

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        Object.assign(closeBtn.style, {
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
        });
        closeBtn.addEventListener('click', () => modal.remove());

        header.append(title, closeBtn);

        // Messages Container
        const messagesContainer = document.createElement('div');
        messagesContainer.id = 'chatMessages';
        Object.assign(messagesContainer.style, {
            flex: '1',
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        });

        // Welcome Message
        const welcomeMsg = document.createElement('div');
        welcomeMsg.className = 'chat-message ai';
        welcomeMsg.innerHTML = `
            <div class="chat-bubble">Hello! How can I help you today? You can type a message or upload an image for analysis.</div>
        `;
        messagesContainer.appendChild(welcomeMsg);

        // Input Area
        const inputContainer = document.createElement('div');
        Object.assign(inputContainer.style, {
            display: 'flex',
            padding: '12px',
            gap: '8px',
            borderTop: '1px solid rgba(0,0,0,0.1)',
            alignItems: 'flex-end'
        });

        // File Upload
        const fileUploadBtn = document.createElement('label');
        fileUploadBtn.innerHTML = '<i class="fas fa-paperclip"></i>';
        Object.assign(fileUploadBtn.style, {
            padding: '10px 12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'var(--primary)',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '4px',
            flexShrink: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        fileUploadBtn.addEventListener('mouseenter', () => {
            fileUploadBtn.style.backgroundColor = 'var(--primary-dark)';
        });

        fileUploadBtn.addEventListener('mouseleave', () => {
            fileUploadBtn.style.backgroundColor = 'var(--primary)';
        });

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', (e) => {
            if (e.target.files?.[0]) {
                ImageAnalyzer.analyze(e.target.files[0]);
            }
        });
        fileUploadBtn.appendChild(fileInput);

        // Text Input
        const textarea = document.createElement('textarea');
        textarea.placeholder = 'Type your message...';
        Object.assign(textarea.style, {
            flex: '1',
            padding: '10px 12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'var(--bg)',
            boxShadow: 'inset 3px 3px 5px var(--shadow-dark), inset -3px -3px 5px var(--shadow-light)',
            resize: 'none',
            minHeight: '40px',
            maxHeight: '120px',
            overflowY: 'auto'
        });

        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = `${this.scrollHeight}px`;
            if (parseInt(this.style.height) > 120) {
                modal.style.maxHeight = '600px';
            }
        });

        // Send Button
        const sendBtn = document.createElement('button');
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        Object.assign(sendBtn.style, {
            padding: '10px 12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'var(--primary)',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '4px',
            flexShrink: '0'
        });

        sendBtn.addEventListener('mouseenter', () => {
            sendBtn.style.backgroundColor = 'var(--primary-dark)';
        });

        sendBtn.addEventListener('mouseleave', () => {
            sendBtn.style.backgroundColor = 'var(--primary)';
        });

        // Message Handling
        function isImageGenerationRequest(message) {
            const triggers = [
                'generate image', 'buat gambar', 'create image',
                'generate picture', 'buat foto', 'create artwork', 'generate art'
            ];
            return triggers.some(trigger => message.toLowerCase().includes(trigger));
        }

        function redirectToImageGenerator(prompt) {
            const cleanPrompt = prompt.replace(
                /generate image|buat gambar|create image|generate picture|buat foto|create artwork|generate art/gi, 
                ''
            ).trim();
            
            if (isCurrentPage('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
                const promptInput = document.getElementById('prompt');
                const generateBtn = document.querySelector('.action-btn');
                if (promptInput && generateBtn) {
                    promptInput.value = cleanPrompt;
                    promptInput.dispatchEvent(new Event('input', { bubbles: true }));
                    setTimeout(() => generateBtn.click(), 500);
                }
            } else {
                window.location.href = `index.html?prompt=${encodeURIComponent(cleanPrompt)}`;
            }
        }

        function sendMessage() {
            const message = textarea.value.trim();
            if (!message) return;

            // User message
            const userMsg = document.createElement('div');
            userMsg.className = 'chat-message user';
            Object.assign(userMsg.style, {
                alignSelf: 'flex-end'
            });
            userMsg.innerHTML = `
                <div class="chat-bubble" style="background-color: var(--primary); color: white; border-radius: 12px 12px 0 12px;">
                    ${message}
                </div>
            `;
            messagesContainer.appendChild(userMsg);
            textarea.value = '';
            textarea.style.height = 'auto';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Handle image generation request
            if (isImageGenerationRequest(message)) {
                const aiResponse = document.createElement('div');
                aiResponse.className = 'chat-message ai';
                Object.assign(aiResponse.style, {
                    alignSelf: 'flex-start'
                });
                aiResponse.innerHTML = `
                    <div class="chat-bubble" style="background-color: var(--bg); border-radius: 12px 12px 12px 0;">
                        I'll redirect you to the image generator. Please wait...
                    </div>
                `;
                messagesContainer.appendChild(aiResponse);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                setTimeout(() => {
                    modal.remove();
                    redirectToImageGenerator(message);
                }, 1500);
                return;
            }

            // Normal chat message
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'chat-message ai';
            typingIndicator.innerHTML = `
                <div class="chat-bubble" style="display: flex; gap: 6px;">
                    <div class="typing-dot" style="width: 8px; height: 8px; background-color: var(--text-light); border-radius: 50%; animation: typing 1.4s infinite ease-in-out;"></div>
                    <div class="typing-dot" style="width: 8px; height: 8px; background-color: var(--text-light); border-radius: 50%; animation: typing 1.4s infinite ease-in-out 0.2s;"></div>
                    <div class="typing-dot" style="width: 8px; height: 8px; background-color: var(--text-light); border-radius: 50%; animation: typing 1.4s infinite ease-in-out 0.4s;"></div>
                </div>
            `;
            messagesContainer.appendChild(typingIndicator);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Stream chat response
            streamChatCompletion(
                [{ role: 'user', content: message }],
                { model: 'openai' },
                (chunk) => {
                    if (typingIndicator.parentNode) typingIndicator.remove();

                    let aiMessage = messagesContainer.lastElementChild;
                    if (!aiMessage?.classList?.contains('ai')) {
                        aiMessage = document.createElement('div');
                        aiMessage.className = 'chat-message ai';
                        Object.assign(aiMessage.style, {
                            alignSelf: 'flex-start'
                        });
                        aiMessage.innerHTML = '<div class="chat-bubble" style="background-color: var(--bg); border-radius: 12px 12px 12px 0;"></div>';
                        messagesContainer.appendChild(aiMessage);
                    }

                    const bubble = aiMessage.querySelector('.chat-bubble');
                    bubble.textContent += chunk;
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            );
        }

        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        sendBtn.addEventListener('click', sendMessage);

        // Assemble components
        inputContainer.append(fileUploadBtn, textarea, sendBtn);
        modal.append(header, messagesContainer, inputContainer);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .chat-message { max-width: 80%; margin-bottom: 8px; }
            .chat-bubble {
                padding: 10px 14px;
                background-color: var(--bg);
                border-radius: 12px 12px 12px 0;
                box-shadow: 2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light);
                word-wrap: break-word;
            }
            .user .chat-bubble {
                background-color: var(--primary);
                color: white;
                border-radius: 12px 12px 0 12px;
            }
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-4px); }
            }
            .use-as-prompt-btn {
                background: var(--primary);
                color: white;
                border: none;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 12px;
                cursor: pointer;
            }
            .use-as-prompt-btn:hover {
                background-color: var(--primary-dark) !important;
            }
        `;
        modal.appendChild(style);

        document.body.appendChild(modal);
        textarea.focus();

        // Handle initial prompt if in URL
        const urlParams = new URLSearchParams(window.location.search);
        const initialPrompt = urlParams.get('prompt');
        if (initialPrompt) {
            textarea.value = initialPrompt;
            setTimeout(() => {
                sendMessage();
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 500);
        }
    }

    // Chat Streaming Function
    async function streamChatCompletion(messages, options = {}, onChunkReceived) {
        const url = "https://text.pollinations.ai/openai";
        const payload = {
            model: options.model || "openai",
            messages: messages,
            seed: options.seed,
            stream: true,
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "text/event-stream",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n\n");
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const dataStr = line.substring(6).trim();
                        if (dataStr === "[DONE]") continue;
                        try {
                            const chunk = JSON.parse(dataStr);
                            const content = chunk?.choices?.[0]?.delta?.content;
                            if (content) onChunkReceived(content);
                        } catch (e) {
                            console.error("Failed to parse stream chunk:", dataStr, e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error during streaming chat completion:", error);
        }
    }

    // Menu Functionality
    function toggleMenu(button) {
        const existingMenu = document.getElementById('dropdownMenu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const menu = document.createElement('div');
        menu.id = 'dropdownMenu';
        Object.assign(menu.style, {
            position: 'fixed',
            bottom: '72px',
            right: '16px',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            boxShadow: '5px 5px 15px var(--shadow-dark), -5px -5px 15px var(--shadow-light)',
            padding: '0.75rem 0',
            zIndex: '1001',
            width: '220px',
            animation: 'fadeIn 0.2s ease-out',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden'
        });

        const menuItems = [
            { 
                icon: 'fas fa-cog', 
                text: 'Settings', 
                action: handleSettingsClick
            },
            { 
                icon: 'fas fa-moon', 
                text: 'Dark Mode', 
                action: toggleDarkMode,
                toggle: true
            }
        ];

        function handleSettingsClick() {
            if (isCurrentPage('index.html')) {
                const advancedToggle = document.getElementById('advancedToggle');
                const advancedParams = document.getElementById('advancedParams');
                if (advancedToggle && advancedParams) {
                    advancedParams.style.display = 'block';
                    advancedToggle.classList.add('active');
                    advancedParams.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                window.location.href = 'index.html';
                setTimeout(() => {
                    const advancedToggle = document.getElementById('advancedToggle');
                    if (advancedToggle) advancedToggle.click();
                }, 500);
            }
        }

        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            Object.assign(menuItem.style, {
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: 'var(--text)'
            });

            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.backgroundColor = 'rgba(108, 92, 231, 0.1)';
            });

            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.backgroundColor = 'transparent';
            });

            menuItem.addEventListener('click', () => {
                item.action();
                menu.remove();
            });

            const icon = document.createElement('i');
            icon.className = item.icon;
            Object.assign(icon.style, {
                marginRight: '12px',
                width: '20px',
                textAlign: 'center',
                color: 'var(--primary)'
            });

            const text = document.createElement('span');
            text.textContent = item.text;
            Object.assign(text.style, {
                fontSize: '0.85rem',
                fontWeight: '500'
            });

            if (item.toggle) {
                const toggle = document.createElement('div');
                toggle.className = 'dark-mode-toggle';
                Object.assign(toggle.style, {
                    marginLeft: 'auto',
                    width: '36px',
                    height: '20px',
                    backgroundColor: 'rgba(108, 92, 231, 0.2)',
                    borderRadius: '10px',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                });

                const toggleCircle = document.createElement('div');
                Object.assign(toggleCircle.style, {
                    position: 'absolute',
                    width: '16px',
                    height: '16px',
                    backgroundColor: 'var(--primary)',
                    borderRadius: '50%',
                    top: '2px',
                    left: '2px',
                    transition: 'all 0.3s ease'
                });

                toggle.appendChild(toggleCircle);
                menuItem.appendChild(toggle);
            }

            menuItem.append(icon, text);
            menu.appendChild(menuItem);
        });

        document.body.appendChild(menu);

        setTimeout(() => {
            document.addEventListener('click', closeMenuOnClickOutside);
        }, 10);

        function closeMenuOnClickOutside(e) {
            const menu = document.getElementById('dropdownMenu');
            const navItems = document.querySelectorAll('.nav-item');
            const isClickInside = Array.from(navItems).some(item => item.contains(e.target));
            
            if (menu && !menu.contains(e.target) && !isClickInside) {
                menu.remove();
                document.removeEventListener('click', closeMenuOnClickOutside);
            }
        }
    }

    // Dark Mode Functions
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        updateDarkModeToggle();
    }

    function updateDarkModeToggle() {
        const toggle = document.querySelector('.dark-mode-toggle');
        if (!toggle) return;

        const circle = toggle.firstChild;
        if (document.body.classList.contains('dark-mode')) {
            circle.style.transform = 'translateX(16px)';
            circle.style.backgroundColor = 'var(--primary-dark)';
            toggle.style.backgroundColor = 'rgba(108, 92, 231, 0.5)';
        } else {
            circle.style.transform = 'translateX(0)';
            circle.style.backgroundColor = 'var(--primary)';
            toggle.style.backgroundColor = 'rgba(108, 92, 231, 0.2)';
        }
    }

    // Initialize Dark Mode
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Global Styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .dark-mode {
            --bg: #2d3436;
            --card-bg: #2d3436;
            --text: #f5f6fa;
            --text-light: #dfe6e9;
            --shadow-dark: #1e272e;
            --shadow-light: #3d4a54;
        }
        
        #bottomNavigation.dark-mode {
            background-color: var(--card-bg);
            border-top: 1px solid rgba(0,0,0,0.2);
        }
        
        .menu-item:hover {
            background-color: rgba(108, 92, 231, 0.1) !important;
        }
    `;
    document.head.appendChild(style);

    updateDarkModeToggle();
});