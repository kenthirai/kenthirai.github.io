/* main.js - Premium Interactive Logic */

document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;

    // Check for saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
        const mobileIcon = document.getElementById('theme-icon-mobile');
        if (mobileIcon) mobileIcon.classList.replace('fa-moon', 'fa-sun');
    }

    if (themeToggle) {
        const toggleAction = () => {
            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');
            
            // Save preference
            localStorage.setItem('theme', isLight ? 'light' : 'dark');

            // Switch icons (Desktop & Mobile)
            const icons = [themeIcon, document.getElementById('theme-icon-mobile')];
            icons.forEach(icon => {
                if (!icon) return;
                if (isLight) {
                    icon.classList.replace('fa-moon', 'fa-sun');
                } else {
                    icon.classList.replace('fa-sun', 'fa-moon');
                }
                
                anime({
                    targets: icon,
                    rotate: isLight ? '360deg' : '0deg',
                    scale: [1, 1.2, 1],
                    duration: 500,
                    easing: 'easeInOutBack'
                });
            });
        };

        themeToggle.addEventListener('click', toggleAction);
        
        const mobileToggle = document.getElementById('theme-toggle-mobile');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', toggleAction);
        }
    }

    // Mobile Menu Logic
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                anime({
                    targets: mobileMenu,
                    opacity: [0, 1],
                    translateY: [-20, 0],
                    easing: 'easeOutExpo',
                    duration: 600
                });
            } else {
                anime({
                    targets: mobileMenu,
                    opacity: [1, 0],
                    translateY: [0, -20],
                    easing: 'easeInExpo',
                    duration: 400,
                    complete: () => mobileMenu.classList.add('hidden')
                });
            }
        });

        // Close menu on link click
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) {
            nav.classList.add('py-2');
            nav.classList.remove('py-4');
        } else {
            nav.classList.add('py-4');
            nav.classList.remove('py-2');
        }
    });

    // Smooth Scroll Offset Adjustment
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = document.querySelector('nav').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Prompt Section Interactivity
    const btnCopyPrompt = document.getElementById('btn-copy-prompt');
    const promptText = document.getElementById('prompt-text');
    const btnLoadMorePrompt = document.getElementById('btn-load-more-prompt');
    const promptContainer = document.getElementById('prompt-container');
    const promptOverlay = document.getElementById('prompt-overlay');
    const loadMoreIcon = document.getElementById('load-more-icon');

    if (btnCopyPrompt && promptText) {
        btnCopyPrompt.addEventListener('click', () => {
            navigator.clipboard.writeText(promptText.innerText).then(() => {
                const originalText = btnCopyPrompt.innerHTML;
                btnCopyPrompt.innerHTML = '<i class="fa-solid fa-check"></i> <span>Tersalin!</span>';
                btnCopyPrompt.classList.add('bg-green-500/20', 'text-green-400', 'border-green-500/30');
                
                setTimeout(() => {
                    btnCopyPrompt.innerHTML = originalText;
                    btnCopyPrompt.classList.remove('bg-green-500/20', 'text-green-400', 'border-green-500/30');
                }, 2000);
            });
        });
    }

    if (btnLoadMorePrompt && promptContainer) {
        btnLoadMorePrompt.addEventListener('click', () => {
            const isExpanded = promptContainer.style.maxHeight && promptContainer.style.maxHeight !== '220px';
            
            if (!isExpanded) {
                // Expand
                promptContainer.style.maxHeight = promptContainer.scrollHeight + 'px';
                promptOverlay.style.opacity = '0';
                btnLoadMorePrompt.querySelector('span').innerText = 'Lihat Lebih Sedikit';
                loadMoreIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            } else {
                // Collapse
                promptContainer.style.maxHeight = '220px';
                promptOverlay.style.opacity = '1';
                btnLoadMorePrompt.querySelector('span').innerText = 'Lihat Selengkapnya';
                loadMoreIcon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                
                // Scroll back to container top if it's out of view
                const rect = promptContainer.getBoundingClientRect();
                if (rect.top < 0) {
                    window.scrollBy({ top: rect.top - 100, behavior: 'smooth' });
                }
            }
        });
    }
});

