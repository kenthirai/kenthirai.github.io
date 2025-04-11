// Fungsi toggle mode gelap
const themeToggle = document.getElementById('themeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const htmlElement = document.documentElement;

// Cek preferensi sistem
if (prefersDarkScheme.matches && !localStorage.getItem('theme')) {
    htmlElement.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Toggle manual
themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        htmlElement.removeAttribute('data-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    } else {
        htmlElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    }
});

// Pertahankan pilihan tema
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    htmlElement.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
} else if (savedTheme === 'light') {
    htmlElement.removeAttribute('data-theme');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
}

// Fungsi copy code
document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', function() {
        const codeBlock = this.nextElementSibling;
        const textArea = document.createElement('textarea');
        textArea.value = codeBlock.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            // Feedback visual
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Copied!';
            this.style.background = 'rgba(76, 175, 80, 0.3)';
            
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.background = 'var(--copy-btn-bg)';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert('Gagal menyalin teks. Coba lagi atau salin manual.');
        } finally {
            document.body.removeChild(textArea);
        }
    });
});

// Back to Top Functionality
const backToTopButton = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Dynamic Year in Footer
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Fungsi Share Tutorial
document.addEventListener('DOMContentLoaded', function() {
    const currentUrl = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    const text = encodeURIComponent("Lihat tutorial lengkap pembuatan Generator Gambar AI dengan domain .my.id dan GitHub Pages");
    
    // Set link share untuk platform yang mendukung
    document.getElementById('shareTwitter').href = `https://twitter.com/intent/tweet?url=${currentUrl}&text=${text}`;
    document.getElementById('shareFacebook').href = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}&quote=${text}`;
    document.getElementById('shareLinkedIn').href = `https://www.linkedin.com/shareArticle?mini=true&url=${currentUrl}&title=${title}&summary=${text}`;
    document.getElementById('shareWhatsApp').href = `https://wa.me/?text=${text}%20${currentUrl}`;
    
    // Handle Instagram share
    document.getElementById('shareInstagram').addEventListener('click', function(e) {
        e.preventDefault();
        
        // Cek apakah di mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Untuk mobile, coba buka aplikasi Instagram
            window.open(`instagram://library?AssetPath=${currentUrl}`, '_blank');
            
            // Fallback ke browser jika aplikasi tidak terinstall
            setTimeout(() => {
                window.location.href = `https://www.instagram.com/`;
            }, 500);
        } else {
            // Untuk desktop, tampilkan petunjuk
            alert('Untuk berbagi ke Instagram:\n1. Screenshot halaman ini\n2. Buka aplikasi Instagram\n3. Buat postingan baru dan pilih screenshot');
        }
    });
    
    // Buka di popup untuk platform lain
    document.querySelectorAll('.share-tutorial-btn').forEach(btn => {
        if (btn.id !== 'shareInstagram') {
            btn.addEventListener('click', function(e) {
                if (this.href === '#') {
                    e.preventDefault();
                    return;
                }
                e.preventDefault();
                window.open(this.href, 'share-popup', 'width=600,height=600');
            });
        }
    });
    
    // Web Share API untuk mobile (jika didukung)
    if (navigator.share) {
        const webShareBtn = document.createElement('a');
        webShareBtn.className = 'share-tutorial-btn share-others';
        webShareBtn.innerHTML = '<i class="fas fa-share-alt"></i> Lainnya';
        
        webShareBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await navigator.share({
                    title: document.title,
                    text: 'Lihat tutorial lengkap pembuatan Generator Gambar AI',
                    url: window.location.href
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        });
        
        document.querySelector('.share-tutorial-buttons').appendChild(webShareBtn);
    }
});
