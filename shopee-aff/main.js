// --- Interaktivitas Pembelian ---
const purchaseButtons = document.querySelectorAll('.btn-purchase');
const notification = document.getElementById('notification');

purchaseButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Tampilkan notifikasi sesaat sebelum mengarahkan
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    });
});

// --- Newsletter Form Logic ---
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('emailInput').value;
        if (email) {
            // Dalam skenario nyata, kirim data ke server di sini
            showCustomAlert(`Terima kasih! Email ${email} telah terdaftar untuk promo terbaru.`);
            newsletterForm.reset();
        }
    });
}

// --- Testimonial Slider Otomatis (Improved) ---
const slider = document.getElementById('slider');
if (slider) {
    const autoScroll = () => {
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        if (slider.scrollLeft >= maxScroll - 10) {
            slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            slider.scrollBy({ left: slider.clientWidth / 2, behavior: 'smooth' });
        }
    };

    let slideInterval = setInterval(autoScroll, 5000);

    slider.addEventListener('mouseenter', () => clearInterval(slideInterval));
    slider.addEventListener('mouseleave', () => slideInterval = setInterval(autoScroll, 5000));
}

// --- Helper Function: Custom Alert ---
function showCustomAlert(msg) {
    const alertBox = document.createElement('div');
    alertBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 3000;
        text-align: center;
        border-top: 5px solid var(--shopee-orange);
    `;
    alertBox.innerHTML = `
        <i class="fa-solid fa-circle-check" style="font-size: 40px; color: var(--shopee-green); margin-bottom: 15px; display: block;"></i>
        <p style="margin-bottom: 20px; font-weight: 500;">${msg}</p>
        <button class="btn btn-primary" onclick="this.parentElement.remove()">Tutup</button>
    `;
    document.body.appendChild(alertBox);
}

// --- Smooth Scroll untuk semua tautan ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Tutup menu mobile jika sedang terbuka
            const navLinks = document.querySelector('.nav-links');
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const menuToggle = document.getElementById('mobile-menu');
                menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            }

            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// --- Mobile Menu Toggle ---
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu && navLinks) {
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Ubah ikon hamburger ke X saat aktif
        if (navLinks.classList.contains('active')) {
            mobileMenu.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        } else {
            mobileMenu.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
    });
}
