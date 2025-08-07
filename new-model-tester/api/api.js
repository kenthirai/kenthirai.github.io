        // Copy API key functionality
        document.getElementById('copyKeyBtn').addEventListener('click', function() {
            const apiKey = document.getElementById('apiKeyDisplay').textContent;
            navigator.clipboard.writeText(apiKey).then(() => {
                this.classList.add('copied');
                this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    this.classList.remove('copied');
                    this.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            });
        });
        
        // Regenerate API key
        document.getElementById('regenerateKeyBtn').addEventListener('click', function() {
            if (confirm('Are you sure you want to regenerate your API key? This will invalidate your current key.')) {
                // In a real app, this would call your backend to regenerate the key
                const newKey = 'sk_live_' + Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18);
                document.getElementById('apiKeyDisplay').textContent = newKey;
                
                // Show success message
                this.innerHTML = '<i class="fas fa-check"></i> Regenerated!';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-sync-alt"></i> Regenerate';
                }, 2000);
            }
        });
        
        // Tab functionality
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                // Remove active class from all tabs in this endpoint
                const endpoint = tab.closest('.endpoint');
                endpoint.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                endpoint.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('.api-nav a').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Update active nav item
                document.querySelectorAll('.api-nav a').forEach(a => a.classList.remove('active'));
                this.classList.add('active');
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 20,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Initialize first tab as active
        document.querySelector('.tab').click();