document.addEventListener('DOMContentLoaded', function() {
    createFloatingBanner();
});

function createFloatingBanner() {
    // Create banner container
    const banner = document.createElement('div');
    banner.id = 'floating-banner';
    
    // Banner content
    banner.innerHTML = `
        <div class="banner-content">
            <i class="fas fa-bullhorn"></i>
            <p>This is a prototype version. Stay tuned for updates and new features!</p>
        </div>
        <button id="close-banner-btn" class="close-banner-btn" title="Close banner">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add banner to the body
    document.body.appendChild(banner);
    
    // Close button functionality
    const closeBtn = document.getElementById('close-banner-btn');
    closeBtn.addEventListener('click', function() {
        // Slide down animation
        banner.style.transform = 'translateY(100%)';
        
        // Remove banner after animation completes
        setTimeout(() => {
            banner.remove();
        }, 300);
    });
}