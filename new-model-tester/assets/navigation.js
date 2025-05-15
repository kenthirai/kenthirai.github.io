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
            icon: 'fas fa-book', 
            text: 'Docs', 
            link: 'docs.html',
            active: window.location.pathname.endsWith('docs.html')
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

    // 5. Menu Dropdown Functionality
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
            
            // Hover effects
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

            // Create icon
            const icon = document.createElement('i');
            icon.className = item.icon;
            icon.style.marginRight = '12px';
            icon.style.width = '20px';
            icon.style.textAlign = 'center';
            icon.style.color = item.danger ? '#ff7675' : 'var(--primary)';

            // Create text
            const text = document.createElement('span');
            text.textContent = item.text;
            text.style.fontSize = '0.85rem';
            text.style.fontWeight = '500';

            // For toggle items
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

        // Close menu when clicking outside
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
        
        // Save preference to localStorage
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        
        // Update UI
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