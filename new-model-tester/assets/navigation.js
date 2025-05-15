document.addEventListener('DOMContentLoaded', function() {
    // Create CSS variables if they don't exist
    if (!document.documentElement.style.getPropertyValue('--primary')) {
        document.documentElement.style.setProperty('--primary', '#6c5ce7');
        document.documentElement.style.setProperty('--primary-dark', '#5649c0');
        document.documentElement.style.setProperty('--text', '#2d3436');
        document.documentElement.style.setProperty('--text-light', '#636e72');
        document.documentElement.style.setProperty('--bg', '#e0e5ec');
        document.documentElement.style.setProperty('--card-bg', '#e0e5ec');
        document.documentElement.style.setProperty('--shadow-light', '#ffffff');
        document.documentElement.style.setProperty('--shadow-dark', '#a3b1c6');
    }

    // 1. Create Navigation Container
    const navContainer = document.createElement('nav');
    navContainer.id = 'bottomNavigation';
    navContainer.style.position = 'fixed';
    navContainer.style.bottom = '0';
    navContainer.style.left = '0';
    navContainer.style.width = '100%';
    navContainer.style.backgroundColor = 'var(--card-bg)';
    navContainer.style.boxShadow = '0 -2px 10px rgba(0,0,0,0.1)';
    navContainer.style.zIndex = '1000';
    navContainer.style.display = 'flex';
    navContainer.style.justifyContent = 'space-around';
    navContainer.style.padding = '12px 0';
    navContainer.style.borderTop = '1px solid rgba(255,255,255,0.2)';

    // 2. Navigation Items Configuration
    const navItems = [
        { 
            icon: 'fas fa-home', 
            text: 'Home', 
            link: 'index.html',
            active: window.location.pathname.endsWith('index.html')
        },
        { 
            icon: 'fas fa-tags', 
            text: 'Pricing', 
            link: 'pricing.html',
            active: window.location.pathname.endsWith('pricing.html')
        },
        { 
            icon: 'fas fa-code', 
            text: 'API', 
            link: 'api.html',
            active: window.location.pathname.endsWith('api.html')
        },
        { 
            icon: 'fas fa-comment', 
            text: 'Chat', 
            link: '#',
            onClick: function(e) {
                e.preventDefault();
                openChatModal();
            }
        },
        { 
            icon: 'fas fa-bars', 
            text: 'Menu', 
            link: '#',
            onClick: function(e) {
                e.preventDefault();
                toggleMenu(this);
            }
        }
    ];

    // 3. Create Navigation Items
    navItems.forEach(item => {
        const navItem = document.createElement('a');
        navItem.href = item.link;
        navItem.className = 'nav-item';
        navItem.style.display = 'flex';
        navItem.style.flexDirection = 'column';
        navItem.style.alignItems = 'center';
        navItem.style.textDecoration = 'none';
        navItem.style.color = item.active ? 'var(--primary)' : 'var(--text-light)';
        navItem.style.fontSize = '12px';
        navItem.style.transition = 'all 0.3s ease';
        navItem.style.padding = '8px 12px';
        navItem.style.borderRadius = '8px';

        // Add active indicator
        if (item.active) {
            navItem.style.boxShadow = 'inset 3px 3px 5px var(--shadow-dark), inset -3px -3px 5px var(--shadow-light)';
        }

        // Create icon
        const icon = document.createElement('i');
        icon.className = item.icon;
        icon.style.fontSize = '20px';
        icon.style.marginBottom = '4px';
        icon.style.transition = 'all 0.3s ease';

        // Create text
        const text = document.createElement('span');
        text.textContent = item.text;
        text.style.fontSize = '0.75rem';
        text.style.fontWeight = '500';

        // Add click handler if specified
        if (item.onClick) {
            navItem.addEventListener('click', item.onClick);
        }

        // Hover effects
        navItem.addEventListener('mouseenter', () => {
            if (!item.active) {
                navItem.style.color = 'var(--primary)';
                icon.style.transform = 'translateY(-2px)';
            }
        });

        navItem.addEventListener('mouseleave', () => {
            if (!item.active) {
                navItem.style.color = 'var(--text-light)';
                icon.style.transform = 'translateY(0)';
            }
        });

        // Append elements
        navItem.appendChild(icon);
        navItem.appendChild(text);
        navContainer.appendChild(navItem);
    });

    // 4. Add to body
    document.body.appendChild(navContainer);
    document.body.style.paddingBottom = '72px'; // Space for navigation

    // 5. Chat Modal Functionality
    function openChatModal() {
        const existingModal = document.getElementById('chatModal');
        if (existingModal) {
            existingModal.remove();
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'chatModal';
        modal.style.position = 'fixed';
        modal.style.bottom = '72px';
        modal.style.right = '16px';
        modal.style.width = '350px';
        modal.style.maxHeight = '500px';
        modal.style.backgroundColor = 'var(--card-bg)';
        modal.style.borderRadius = '12px';
        modal.style.boxShadow = '5px 5px 15px var(--shadow-dark), -5px -5px 15px var(--shadow-light)';
        modal.style.zIndex = '1001';
        modal.style.display = 'flex';
        modal.style.flexDirection = 'column';
        modal.style.border = '1px solid rgba(255,255,255,0.1)';
        modal.style.overflow = 'hidden';

        // Modal header
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.padding = '12px 16px';
        header.style.backgroundColor = 'var(--primary)';
        header.style.color = 'white';
        header.style.fontWeight = '500';

        const title = document.createElement('div');
        title.textContent = 'AI Assistant';
        header.appendChild(title);

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'white';
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', () => modal.remove());
        header.appendChild(closeBtn);

        // Chat messages container
        const messagesContainer = document.createElement('div');
        messagesContainer.id = 'chatMessages';
        messagesContainer.style.flex = '1';
        messagesContainer.style.padding = '16px';
        messagesContainer.style.overflowY = 'auto';
        messagesContainer.style.display = 'flex';
        messagesContainer.style.flexDirection = 'column';
        messagesContainer.style.gap = '12px';

        // Add welcome message
        const welcomeMsg = document.createElement('div');
        welcomeMsg.className = 'chat-message ai';
        welcomeMsg.innerHTML = `
            <div class="chat-bubble">Hello! How can I help you today?</div>
        `;
        messagesContainer.appendChild(welcomeMsg);

        // Input area
        const inputContainer = document.createElement('div');
        inputContainer.style.display = 'flex';
        inputContainer.style.padding = '12px';
        inputContainer.style.gap = '8px';
        inputContainer.style.borderTop = '1px solid rgba(0,0,0,0.1)';

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Type your message...';
        inputField.style.flex = '1';
        inputField.style.padding = '10px 12px';
        inputField.style.borderRadius = '8px';
        inputField.style.border = 'none';
        inputField.style.backgroundColor = 'var(--bg)';
        inputField.style.boxShadow = 'inset 3px 3px 5px var(--shadow-dark), inset -3px -3px 5px var(--shadow-light)';

        const sendBtn = document.createElement('button');
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        sendBtn.style.padding = '10px 12px';
        sendBtn.style.borderRadius = '8px';
        sendBtn.style.border = 'none';
        sendBtn.style.backgroundColor = 'var(--primary)';
        sendBtn.style.color = 'white';
        sendBtn.style.cursor = 'pointer';
        sendBtn.style.transition = 'all 0.2s ease';

        sendBtn.addEventListener('mouseenter', () => {
            sendBtn.style.backgroundColor = 'var(--primary-dark)';
        });

        sendBtn.addEventListener('mouseleave', () => {
            sendBtn.style.backgroundColor = 'var(--primary)';
        });

        // Send message function
        function sendMessage() {
            const message = inputField.value.trim();
            if (!message) return;

            // Add user message
            const userMsg = document.createElement('div');
            userMsg.className = 'chat-message user';
            userMsg.style.alignSelf = 'flex-end';
            userMsg.innerHTML = `
                <div class="chat-bubble" style="background-color: var(--primary); color: white; border-radius: 12px 12px 0 12px;">
                    ${message}
                </div>
            `;
            messagesContainer.appendChild(userMsg);
            inputField.value = '';

            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Add loading indicator
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

            // Call the chat API
            streamChatCompletion(
                [{ role: 'user', content: message }],
                { model: 'openai' },
                (chunk) => {
                    // Remove typing indicator if it exists
                    if (typingIndicator.parentNode) {
                        typingIndicator.remove();
                    }

                    // Get or create AI message container
                    let aiMessage = messagesContainer.lastElementChild;
                    if (!aiMessage || !aiMessage.classList.contains('ai')) {
                        aiMessage = document.createElement('div');
                        aiMessage.className = 'chat-message ai';
                        aiMessage.style.alignSelf = 'flex-start';
                        aiMessage.innerHTML = '<div class="chat-bubble" style="background-color: var(--bg); border-radius: 12px 12px 12px 0;"></div>';
                        messagesContainer.appendChild(aiMessage);
                    }

                    // Append chunk to message
                    const bubble = aiMessage.querySelector('.chat-bubble');
                    bubble.textContent += chunk;

                    // Scroll to bottom
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            );
        }

        // Event listeners
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        sendBtn.addEventListener('click', sendMessage);

        // Append elements
        inputContainer.appendChild(inputField);
        inputContainer.appendChild(sendBtn);

        modal.appendChild(header);
        modal.appendChild(messagesContainer);
        modal.appendChild(inputContainer);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .chat-message {
                max-width: 80%;
                margin-bottom: 8px;
            }
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
        `;
        modal.appendChild(style);

        document.body.appendChild(modal);
        inputField.focus();
    }

    // Chat API function
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
                throw new Error(
                    `HTTP error! status: ${response.status}, message: ${errorText}`
                );
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
                            if (content && onChunkReceived) {
                                onChunkReceived(content);
                            }
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

    // ... (keep existing toggleMenu, closeMenuOnClickOutside, navigateTo, 
    // toggleDarkMode, updateDarkModeToggle functions and dark mode initialization)

    // Menu Dropdown Functionality (keep existing implementation)
    function toggleMenu(button) {
        const existingMenu = document.getElementById('dropdownMenu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const menu = document.createElement('div');
        menu.id = 'dropdownMenu';
        menu.style.position = 'fixed';
        menu.style.bottom = '72px';
        menu.style.right = '16px';
        menu.style.backgroundColor = 'var(--card-bg)';
        menu.style.borderRadius = '12px';
        menu.style.boxShadow = '5px 5px 15px var(--shadow-dark), -5px -5px 15px var(--shadow-light)';
        menu.style.padding = '0.75rem 0';
        menu.style.zIndex = '1001';
        menu.style.width = '220px';
        menu.style.animation = 'fadeIn 0.2s ease-out';
        menu.style.border = '1px solid rgba(255,255,255,0.1)';
        menu.style.overflow = 'hidden';

        // Menu items
        const menuItems = [
            { 
                icon: 'fas fa-user', 
                text: 'Profile', 
                action: () => navigateTo('profile.html')
            },
            { 
                icon: 'fas fa-history', 
                text: 'History', 
                action: () => navigateTo('history.html')
            },
            { 
                icon: 'fas fa-cog', 
                text: 'Settings', 
                action: () => navigateTo('settings.html')
            },
            { 
                icon: 'fas fa-moon', 
                text: 'Dark Mode', 
                action: toggleDarkMode,
                toggle: true
            },
            { 
                icon: 'fas fa-sign-out-alt', 
                text: 'Sign Out', 
                action: () => navigateTo('logout.html'),
                danger: true
            }
        ];

        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.style.display = 'flex';
            menuItem.style.alignItems = 'center';
            menuItem.style.padding = '0.75rem 1.25rem';
            menuItem.style.cursor = 'pointer';
            menuItem.style.transition = 'all 0.2s ease';
            menuItem.style.color = item.danger ? '#ff7675' : 'var(--text)';
            
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
            icon.style.marginRight = '12px';
            icon.style.width = '20px';
            icon.style.textAlign = 'center';
            icon.style.color = item.danger ? '#ff7675' : 'var(--primary)';

            const text = document.createElement('span');
            text.textContent = item.text;
            text.style.fontSize = '0.85rem';
            text.style.fontWeight = '500';

            if (item.toggle) {
                const toggle = document.createElement('div');
                toggle.className = 'dark-mode-toggle';
                toggle.style.marginLeft = 'auto';
                toggle.style.width = '36px';
                toggle.style.height = '20px';
                toggle.style.backgroundColor = 'rgba(108, 92, 231, 0.2)';
                toggle.style.borderRadius = '10px';
                toggle.style.position = 'relative';
                toggle.style.transition = 'all 0.3s ease';

                const toggleCircle = document.createElement('div');
                toggleCircle.style.position = 'absolute';
                toggleCircle.style.width = '16px';
                toggleCircle.style.height = '16px';
                toggleCircle.style.backgroundColor = 'var(--primary)';
                toggleCircle.style.borderRadius = '50%';
                toggleCircle.style.top = '2px';
                toggleCircle.style.left = '2px';
                toggleCircle.style.transition = 'all 0.3s ease';

                toggle.appendChild(toggleCircle);
                menuItem.appendChild(toggle);
            }

            menuItem.appendChild(icon);
            menuItem.appendChild(text);
            menu.appendChild(menuItem);
        });

        document.body.appendChild(menu);

        setTimeout(() => {
            document.addEventListener('click', closeMenuOnClickOutside);
        }, 10);
    }

    function closeMenuOnClickOutside(e) {
        const menu = document.getElementById('dropdownMenu');
        const navItems = document.querySelectorAll('.nav-item');
        const isClickInside = Array.from(navItems).some(item => item.contains(e.target));
        
        if (menu && !menu.contains(e.target) && !isClickInside) {
            menu.remove();
            document.removeEventListener('click', closeMenuOnClickOutside);
        }
    }

    function navigateTo(url) {
        window.location.href = url;
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        updateDarkModeToggle();
    }

    function updateDarkModeToggle() {
        const toggle = document.querySelector('.dark-mode-toggle');
        if (toggle) {
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
    }

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Add global styles
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

    // Initialize dark mode toggle if needed
    updateDarkModeToggle();
});