document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    // Toggle menu saat tombol ditekan
    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });
    }

    // Sembunyikan menu saat link diklik (khusus mobile)
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menu) menu.classList.add('hidden');
        });
    });
});
