
        // Initialize Lucide Icons
        lucide.createIcons();

        // Cart State
        let cart = [];
        let total = 0;

        function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.classList.toggle('hidden');
    modal.classList.toggle('flex');
}

        function addToCart(name, price) {
            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ name, price, quantity: 1 });
            }
            updateCartUI();
            showNotification(`${name} ditambahkan!`);
        }

        function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartFooter = document.getElementById('cart-footer');

    cartItems.innerHTML = '';
    total = 0;
    let totalItems = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = `<p class="text-center text-gray-500 py-10">Keranjang Anda masih kosong.</p>`;
        cartFooter.classList.add('hidden');
    } else {
        cartFooter.classList.remove('hidden');

        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            totalItems += item.quantity;

            cartItems.innerHTML += `
                <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg border mb-3">
                    <div class="w-2/3">
                        <h5 class="font-bold text-gray-800">${item.name}</h5>
                        <p class="text-sm text-gray-500">${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}</p>
                    </div>

                    <div class="flex items-center gap-2">
                        <button onclick="changeQty(${index}, -1)" class="bg-gray-200 px-2 py-1 rounded">-</button>
                        <span class="font-bold">${item.quantity}</span>
                        <button onclick="changeQty(${index}, 1)" class="bg-gray-200 px-2 py-1 rounded">+</button>
                    </div>
                </div>
            `;
        });
    }

const cartCount = document.getElementById('cart-count');
if (cartCount) {
    cartCount.innerText = totalItems;
}

// Tambahan untuk floating cart
const floatingCount = document.getElementById('cart-count-floating');
if (floatingCount) {
    floatingCount.innerText = totalItems;
}

cartTotal.innerText = `Rp ${total.toLocaleString('id-ID')}`;
lucide.createIcons();
syncProductUI(); 
}

        function changeQty(index, delta) {
    cart[index].quantity += delta;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateCartUI(); 
}

        function filterProducts() {
            const query = document.getElementById('productSearch').value.toLowerCase();
            const products = document.querySelectorAll('.product-card');
            
            products.forEach(product => {
                const name = (product.getAttribute('data-name') || '').toLowerCase();
                if (name.includes(query)) {
                    product.style.display = 'flex';
                } else {
                    product.style.display = 'none';
                }
            });
        }

        function showNotification(msg) {
            const notif = document.getElementById('notif-box');
            notif.innerText = msg;
            notif.classList.remove('hidden');
            setTimeout(() => {
                notif.classList.add('hidden');
            }, 2000);
        }

        function checkoutWhatsApp() {
    if (cart.length === 0) return;

    let message = "Halo Tunas Herbal, saya ingin memesan:\n\n";
    cart.forEach(item => {
        message += `- ${item.name} (${item.quantity}x)\n`;
    });

    message += `\n*Total: Rp ${total.toLocaleString('id-ID')}*\n\nMohon informasi pembayarannya. Terima kasih!`;

    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/6289637737721?text=${encodedMsg}`, '_blank');
}


// 🔥 TARUH DI SINI (SETELAH CHECKOUT FUNCTION)
function resetCart() {
    if (!confirm("Yakin mau menghapus semua belanjaan?")) return;

    cart = [];
    total = 0;

    document.querySelectorAll('.qty').forEach(el => {
        el.innerText = 0;
    });

    updateCartUI();
}
        
       function changeQtyDirect(btn, delta, name, price) {
    const container = btn.parentElement;

    // 🔥 animasi saat tambah
    if (delta > 0) {
        flyCartIcon(btn);
    }

    const qtyText = container.querySelector('.qty');
    let qty = parseInt(qtyText.innerText);

    qty += delta;
    if (qty < 0) qty = 0;

    qtyText.innerText = qty;

    const existingItemIndex = cart.findIndex(item => item.name === name);

    if (qty === 0) {
        if (existingItemIndex !== -1) {
            cart.splice(existingItemIndex, 1);
        }
    } else {
        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity = qty;
        } else {
            cart.push({ name, price, quantity: qty });
        }
    }

    updateCartUI();
}


function flyCartIcon(startElement) {
    const cartBtn = document.querySelector('[onclick="toggleCart()"]');
    const startRect = startElement.getBoundingClientRect();
    const cartRect = cartBtn.getBoundingClientRect();

    // Buat icon keranjang kecil
    const icon = document.createElement('div');
    icon.innerHTML = `<i data-lucide="shopping-cart"></i>`;
    document.body.appendChild(icon);

    // Posisi awal
    icon.style.position = 'fixed';
    icon.style.left = startRect.left + 'px';
    icon.style.top = startRect.top + 'px';
    icon.style.zIndex = 9999;
    icon.style.color = '#0d9488';
    icon.style.transform = 'scale(2.0)';
    icon.style.opacity = '1';

    // 🔥 lebih smooth & lebih lambat
    icon.style.transition = 'all 2.5s cubic-bezier(0.22, 1, 0.36, 1)';

    lucide.createIcons();

    // Gerak ke keranjang (lebih natural delay)
    setTimeout(() => {
        icon.style.left = cartRect.left + 'px';
        icon.style.top = cartRect.top + 'px';
        icon.style.transform = 'scale(0.3)';
        icon.style.opacity = '0.9';
    }, 50);

    // Efek bounce keranjang (lebih halus)
    setTimeout(() => {
        cartBtn.classList.add('scale-125');

        setTimeout(() => {
            cartBtn.classList.remove('scale-125');
        }, 180);

    }, 900);

    // Hapus icon (disesuaikan durasi animasi)
    setTimeout(() => {
        icon.remove();
    }, 1300);
}


function syncProductUI() {
    document.querySelectorAll('.product-card').forEach(card => {
        const name = card.querySelector('h4').innerText;
        const qtyElement = card.querySelector('.qty');

        const item = cart.find(i => i.name === name);

        qtyElement.innerText = item ? item.quantity : 0;
    });
}

function toggleMenu() {
    const drawer = document.getElementById('mobile-drawer');
    const panel = document.getElementById('drawer-panel');

    const isOpen = !drawer.classList.contains('hidden');

    if (isOpen) {
        panel.classList.add('-translate-x-full');
        setTimeout(() => {
            drawer.classList.add('hidden');
        }, 200);
    } else {
        drawer.classList.remove('hidden');
        setTimeout(() => {
            panel.classList.remove('-translate-x-full');
        }, 10);
    }
}
function formatRupiah(num) {
    return "Rp " + num.toLocaleString("id-ID");
}

function applyPromo() {
    document.querySelectorAll(".product-card").forEach(card => {
        const priceEl = card.querySelector(".real-price");
        if (!priceEl) return;

        // ambil harga asli (yang dijual)
        let original = priceEl.innerText.replace(/[^0-9]/g, "");
        original = parseInt(original);

        if (!original) return;

        // 🔥 harga "coret" (pura-pura naik 10%)
        const fakeBeforePrice = Math.floor(original * 1.1);

        const container = card.querySelector(".price-box");

        container.innerHTML = `
            <span class="promo-badge">DISKON 10%</span>

            <!-- harga palsu (dicoret) -->
            <div class="promo-price">
                ${formatRupiah(fakeBeforePrice)}
            </div>

            <!-- harga asli (yang dibayar) -->
            <div class="real-price text-teal-700 font-bold text-xl">
                ${formatRupiah(original)}
            </div>
        `;
    });
}

applyPromo();
function openProductModal(imgEl) {
    const card = imgEl.closest('.product-card');

    const img = imgEl.src;
    const title = card.querySelector('h4')?.innerText || '';
    const desc = card.getAttribute('data-long-desc') || '';

    document.getElementById('modal-img').src = img;
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-desc').innerText = desc;

    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}
function openCategoryModal() {
    const modal = document.getElementById('category-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeCategoryModal() {
    const modal = document.getElementById('category-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}
function filterCategory(category) {
    const products = document.querySelectorAll('.product-card');

    products.forEach(product => {
        const badge = product.querySelector('span')?.innerText || '';

        if (category === 'all' || badge === category) {
            product.style.display = 'flex';
        } else {
            product.style.display = 'none';
        }
    });

    closeCategoryModal();

    // 🔥 tambahan scroll ke produk
    setTimeout(() => {
        const section = document.getElementById('produk');
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, 200);
}
document.addEventListener("DOMContentLoaded", function () {
    resetHome();
});
function resetHome() {
    const products = document.querySelectorAll('.product-card');

    products.forEach(p => {
        p.style.display = 'none';
    });

    // optional: tutup modal kategori jika masih terbuka
    const modal = document.getElementById('category-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}
function openOngkirModal() {
    const modal = document.getElementById('ongkir-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeOngkirModal() {
    const modal = document.getElementById('ongkir-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}
function openAsliModal() {
    const modal = document.getElementById('asli-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeAsliModal() {
    const modal = document.getElementById('asli-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}
function openInfo(type) {
    const modal = document.getElementById('info-modal');

    const data = {
        about: {
            title: "Tentang Kami",
            desc: "Tunas Herbal adalah toko herbal terpercaya yang menyediakan produk kesehatan alami untuk keluarga Indonesia dengan kualitas terjamin."
        },
        product: {
            title: "Produk Terbaru",
            desc: "Kami selalu menghadirkan produk herbal dan madu terbaru yang berkualitas, aman, dan sudah melalui seleksi ketat."
        },
        terms: {
            title: "Syarat & Ketentuan",
            desc: "Dengan menggunakan layanan kami, Anda menyetujui syarat penggunaan, termasuk ketentuan pembelian, pengiriman, dan pengembalian."
        },
        privacy: {
            title: "Kebijakan Privasi",
            desc: "Kami menjaga data pelanggan dengan aman dan tidak membagikannya kepada pihak ketiga tanpa izin."
        }
    };

    document.getElementById('info-title').innerText = data[type].title;
    document.getElementById('info-desc').innerText = data[type].desc;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeInfo() {
    const modal = document.getElementById('info-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}
function scrollToPilihProduk() {
    const target = document.querySelector('.arrow-left')?.parentElement;

    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}
function openChatbot() {
    document.getElementById('chatbot-modal').classList.remove('hidden');
    document.getElementById('chatbot-modal').classList.add('flex');
}

function closeChatbot() {
    document.getElementById('chatbot-modal').classList.add('hidden');
    document.getElementById('chatbot-modal').classList.remove('flex');
}

function sendChat() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    addMessage("user", msg);
    input.value = "";

    setTimeout(() => {
        addMessage("bot", getBotReply(msg));
    }, 600);
}

function addMessage(type, text) {
    const box = document.getElementById('chat-box');

    const div = document.createElement('div');
    div.className = type === "user"
        ? "bg-teal-600 text-white p-2 rounded-lg ml-auto w-fit"
        : "bg-gray-200 p-2 rounded-lg w-fit";

    div.innerText = text;
    box.appendChild(div);

    box.scrollTop = box.scrollHeight;
}

function getBotReply(msg) {
    msg = msg.toLowerCase();

    // ===== LAMBUNG =====
    if (
        msg.includes("lambung") ||
        msg.includes("maag") ||
        msg.includes("asam lambung") ||
        msg.includes("perih") ||
        msg.includes("kembung")
    ) {
        return "Kalau kamu sedang mengalami masalah lambung seperti maag, perih, atau asam lambung naik, itu memang cukup mengganggu aktivitas sehari-hari 😔\n\n" +

        "Untuk membantu meredakan dan menenangkan lambung, kamu bisa mempertimbangkan beberapa produk berikut:\n\n" +

        "✔ Madu Lambung Asyifa – cocok untuk pemakaian harian\n" +
        "✔ Madu Lambung Zestmag – untuk lambung sensitif\n" +
        "✔ Madu Lambung Vitagerd – untuk kondisi yang lebih serius\n" +
        "✔ Madu Lambung Masambung – membantu meredakan perih & kembung\n" +
        "✔ Madu Lambung Freshmag – membantu menenangkan lambung\n" +
        "✔ Madu Lambung Aslamago – menjaga lambung tetap stabil\n\n" +

        "Kalau berkenan, boleh ceritakan keluhanmu lebih detail agar saya bisa bantu pilihkan yang paling sesuai 😊";
    }

    // ===== BATUK / FLU =====
if (
    msg.includes("batuk") ||
    msg.includes("flu") ||
    msg.includes("pilek") ||
    msg.includes("tenggorokan") ||
    msg.includes("radang")
) {
    return "Keluhan batuk, flu, atau tenggorokan memang cukup mengganggu aktivitas sehari-hari 😷\n\n" +

    "Agar rekomendasi lebih tepat, biasanya dibedakan berdasarkan jenis batuk yang dialami:\n\n" +

    "🔹 Batuk kering / tenggorokan gatal:\n" +
    "• Madu Batuk Asyifa Gurah – membantu meredakan batuk kering & melegakan tenggorokan\n" +
    "• Madu Batuk HLV – rasa lebih ringan, tidak pedas, cocok untuk anak & dewasa\n\n" +

    "🔹 Batuk berdahak / flu / pilek:\n" +
    "• Madu Batuk BATGUR – membantu mengencerkan dahak & meredakan batuk\n" +
    "• Madu Batuk Asyifa 9 in 1 – manfaat lengkap untuk batuk kering & berdahak (paling laris)\n\n" +

    "🔹 Batuk berat / butuh hasil lebih maksimal:\n" +
    "• Madu Batuk Gurah Fit – formulasi premium, sangat direkomendasikan untuk hasil maksimal\n\n" +

    "🔹 Batuk berkaitan dengan paru-paru / flek:\n" +
    "• Madu Batuk Parugo – difokuskan untuk membantu masalah paru-paru & flek\n\n" +

    "Kalau boleh tahu, kamu lagi mengalami batuk yang seperti apa? Biar saya bantu pilihkan yang paling cocok 😊";
}

    // ===== STAMINA =====
    if (
        msg.includes("stamina") ||
        msg.includes("lemas") ||
        msg.includes("capek") ||
        msg.includes("ngedrop") ||
        msg.includes("pria") ||
        msg.includes("vitalitas")
    ) {
        return "Kalau tubuh terasa lemas atau stamina menurun, itu biasanya karena aktivitas yang padat atau kondisi tubuh yang lagi drop 💪\n\n" +

        "Untuk membantu meningkatkan energi dan stamina, kamu bisa coba:\n\n" +

        "✔ Super Top Libido (STL) – membantu meningkatkan vitalitas pria\n" +
        "✔ Kopi JANTAN ORIGINAL – membantu menambah energi & stamina\n\n" +

        "Kalau mau, kamu bisa ceritakan kondisi yang dirasakan, nanti saya bantu arahkan yang paling cocok 👍";
    }

    // ===== PEGAL / SENDI =====
    if (
        msg.includes("pegal") ||
        msg.includes("sendi") ||
        msg.includes("asam urat") ||
        msg.includes("rematik")
    ) {
        return "Kalau sering mengalami pegal, nyeri sendi, atau asam urat, memang bisa mengganggu aktivitas sehari-hari 😣\n\n" +

        "Untuk membantu mengatasi hal tersebut, kamu bisa mempertimbangkan:\n\n" +

        "✔ Assamulin – membantu menjaga kesehatan otot & sendi\n\n" +

        "Kalau keluhannya lebih spesifik, boleh ceritakan ya biar saya bantu lebih tepat 😊";
    }

    // ===== IMUN =====
    if (
        msg.includes("imun") ||
        msg.includes("daya tahan") ||
        msg.includes("sering sakit")
    ) {
        return "Kalau daya tahan tubuh sedang menurun atau sering sakit, memang penting untuk dijaga dari dalam 💚\n\n" +

        "Beberapa produk yang bisa membantu meningkatkan imun tubuh:\n\n" +

        "✔ Madu Gholiban (500g / 1kg)\n" +
        "✔ Madu Angkak Darusyifa\n" +
        "✔ Susu Skygoat\n" +
        "✔ Susu Etawalin / Etawaku\n\n" +

        "Silakan dipilih sesuai kebutuhan, atau ceritakan kondisi kamu agar saya bantu rekomendasikan yang paling sesuai 😊";
    }
    

    // ===== TROMBOSIT =====
    if (
        msg.includes("trombosit") ||
        msg.includes("dbd") ||
        msg.includes("tipes") ||
        msg.includes("darah") ||
        msg.includes("platelet") ||
        msg.includes("angkak")
    ) {
        return "Kalau berkaitan dengan trombosit atau pemulihan kondisi tubuh seperti DBD atau tipes, memang perlu perhatian khusus ya 💉\n\n" +

        "Untuk membantu menjaga kesehatan darah, kamu bisa coba:\n\n" +

        "✔ Madu Angkak Darusyifa – membantu meningkatkan trombosit & pemulihan tubuh\n\n" +

        "Jika ada kondisi tambahan, silakan ceritakan agar saya bisa bantu lebih tepat 😊";
    }

    // ===== SUSU / TULANG =====
    if (
        msg.includes("tulang") ||
        msg.includes("susu") ||
        msg.includes("kalsium")
    ) {
        return "Kalau ingin menjaga kesehatan tulang, stamina, dan nutrisi tubuh, konsumsi susu herbal bisa jadi pilihan yang baik 🥛\n\n" +

        "Beberapa rekomendasi yang bisa kamu coba:\n\n" +

        "✔ Susu Skygoat\n" +
        "✔ Susu Etawalin\n" +
        "✔ Susu Etawaku\n" +
        "✔ HNI Etta Goatmilk\n\n" +

        "Silakan pilih sesuai kebutuhan, atau saya bisa bantu rekomendasikan yang paling cocok 😊";
    }

    // ===== MINYAK =====
if (
    msg.includes("minyak") ||
    msg.includes("kulit") ||
    msg.includes("rambut") ||
    msg.includes("jantung")
) {

    return "Untuk perawatan kesehatan, kulit, rambut, hingga jantung, kami memiliki beberapa jenis minyak herbal yang bisa disesuaikan dengan kebutuhan kamu 🌿\n\n" +

    "🔹 MINYAK ZAITUN (konsumsi & perawatan)\n" +
    "✔ Le Rice – kesehatan & perawatan tubuh\n" +
    "✔ Ath-Thoyyibah – zaitun murni kemasan ekonomis\n" +
    "✔ Al Arobi – kualitas premium, bisa diminum & luar\n" +
    "✔ Zevo Zaituna – kapsul praktis untuk konsumsi\n" +
    "✔ Aroma Therapy – hanya untuk pijat (tidak diminum)\n\n" +

    "🔹 MINYAK VCO (Virgin Coconut Oil)\n" +
    "✔ VICO Oil – bantu kolesterol & daya tahan tubuh\n" +
    "✔ VCO Classic UMS – versi besar & lebih hemat\n\n" +

    "🔹 MINYAK BUT-BUT (minyak pijat tradisional)\n" +
    "✔ Wahida – relaksasi & penghangat tubuh\n" +
    "✔ Herba Jawi 99 – pijat & pegal linu\n" +
    "✔ HNI Sinergi – versi lengkap & paling laris\n\n" +

    "👉 Semua produk bisa dipilih sesuai kebutuhan kamu (konsumsi atau pemakaian luar).";
}

    // ===== MADU UMUM =====
    if (
        msg.includes("madu") &&
        !msg.includes("lambung") &&
        !msg.includes("batuk")
    ) {
        return "Kalau kamu sedang mencari madu murni untuk konsumsi harian, kami punya beberapa pilihan terbaik 🍯\n\n" +

        "✔ Madu Gholiban 500g\n" +
        "✔ Madu Gholiban 1kg\n" +
        "✔ Madu Angkak Darusyifa\n\n" +

        "Semua madu kami asli tanpa campuran gula dan cocok untuk menjaga kesehatan tubuh 😊";
    }
    // ===== JANTUNG / KOLESTEROL =====
if (
    msg.includes("jantung") ||
    msg.includes("kolesterol") ||
    msg.includes("darah tinggi") ||
    msg.includes("hipertensi")
) {
    return "❤️ Untuk kesehatan jantung & kolesterol, kamu bisa coba Hiu Cardiocare Herbalindo.";
}

// ===== GINJAL =====
if (
    msg.includes("ginjal") ||
    msg.includes("kencing batu") ||
    msg.includes("kencing") ||
    msg.includes("batu kemih")
) {
    return "🟢 Untuk kesehatan ginjal & saluran kemih, kamu bisa coba Bantugin Herbalindo.";
}
// ===== PROSTAT =====
if (
    msg.includes("prostat") ||
    msg.includes("kencing tidak lancar") ||
    msg.includes("pria")
) {
    return "🧑‍⚕️ Untuk prostat & kencing, kamu bisa coba HIU PROS Herbalindo.";
}

// ===== SINUS / HIDUNG =====
if (
    msg.includes("sinus") ||
    msg.includes("pilek") ||
    msg.includes("hidung") ||
    msg.includes("flu")
) {
    return "🤧 Untuk sinus & hidung tersumbat, kamu bisa coba Gurah Fluba Herbalindo.";
}

// ===== TIDUR =====
if (
    msg.includes("tidur") ||
    msg.includes("insomnia") ||
    msg.includes("susah tidur")
) {
    return "🌙 Untuk membantu tidur lebih nyenyak, kamu bisa coba HIU TDR Herbalindo.";
}
// ===== KOLESTEROL =====
if (
    msg.includes("lemak") ||
    msg.includes("kolesterol") ||
    msg.includes("darah kental")
) {
    return "🩸 Untuk kolesterol & lemak darah, kamu bisa coba Koleshiu Herbalindo.";
}

// ===== WASIR =====
if (
    msg.includes("wasir") ||
    msg.includes("ambeien") ||
    msg.includes("sembelit")
) {
    return "🚽 Untuk wasir & pencernaan, kamu bisa coba Daun Ungu Herbalindo.";
}
// ===== PERADANGAN / IMUN =====
if (
    msg.includes("kanker") ||
    msg.includes("miom") ||
    msg.includes("radang") ||
    msg.includes("peradangan")
) {
    return "🛡️ Untuk dukungan imun & peradangan, kamu bisa coba Karsifit Herbalindo.";
}
// ===== GULA DARAH (MENGKUDU FIX) =====
if (
    msg.includes("mengkudu") ||
    msg.includes("gula") ||
    msg.includes("diabetes") ||
    msg.includes("kencing manis")
) {
    return "🌿 Untuk membantu menjaga gula darah, kamu bisa coba Mengkudu Herbalindo.";
}

// ===== Kanker) =====
if (
    msg.includes("kanker") ||
    msg.includes("tumor") ||
    msg.includes("miom") ||
    msg.includes("radang") ||
    msg.includes("peradangan")
) {
    return "🛡️ Untuk dukungan kesehatan terkait miom, tumor, kanker, dan peradangan, kamu bisa coba Karsifit Herbalindo.";
}    
// ===== SINUS =====
if (
    msg.includes("sinus") ||
    msg.includes("mual") ||
    msg.includes("muntah") ||
    msg.includes("batuk dan flu")
) {
    return "🤒 Untuk demam & gejala flu, kamu bisa coba Gurah Fluba Herbalindo.";
}
// ===== Kencing =====
if (
    msg.includes("ginjal") ||
    msg.includes("gangguan kencing") ||
    msg.includes("nyeri pinggang karena ginjal")
) {
    return "🦴 Untuk asam urat & rematik, kamu bisa coba Kumis Kucing Herbalindo.";
}


    // ===== DEFAULT =====
    return "Halo 😊 Silakan ceritakan keluhan atau kebutuhan kamu ya atau kamu bisa langsung mencari produk yang kamu mau di kolom pencarian produk.\n\nContoh:\n- Batuk / flu\n- Maag / lambung\n- Stamina\n- Pegal / sendi\n\nSaya siap bantu rekomendasikan produk yang paling sesuai 👍";
}
function scrollToBottom() {
    const footer = document.getElementById('kontak');
    if (footer) {
        footer.scrollIntoView({
            behavior: 'smooth',
            block: 'end'
        });
    }
}
function scrollToLayanan() {
    const target = document.getElementById('layanan');

    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}
// tampilkan tombol saat scroll
window.addEventListener("scroll", () => {
    const btn = document.getElementById("scrollTopBtn");

    if (window.scrollY > 300) {
        btn.classList.remove("opacity-0", "pointer-events-none");
        btn.classList.add("opacity-100");
    } else {
        btn.classList.add("opacity-0", "pointer-events-none");
        btn.classList.remove("opacity-100");
    }
});

// fungsi scroll ke atas (smooth)
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
window.addEventListener("scroll", () => {
    const btn = document.getElementById("scrollTopBtn");
    const homeBtn = document.getElementById("homeBtn");

    if (window.scrollY > 300) {
        // tombol panah atas
        btn.classList.remove("opacity-0", "pointer-events-none");
        btn.classList.add("opacity-100");

        // tombol 🚶
        homeBtn.classList.remove("opacity-0", "pointer-events-none");
        homeBtn.classList.add("opacity-100");
    } else {
        // tombol panah atas
        btn.classList.add("opacity-0", "pointer-events-none");
        btn.classList.remove("opacity-100");

        // tombol 🚶
        homeBtn.classList.add("opacity-0", "pointer-events-none");
        homeBtn.classList.remove("opacity-100");
    }
});
function handleOutsideClick(e) {
    const modalContent = document.querySelector('#category-modal > div');

    // kalau klik di luar box putih
    if (!modalContent.contains(e.target)) {
        closeCategoryModal();
    }
}
function showAllProducts() {
    const products = document.querySelectorAll('.product-card');

    products.forEach(product => {
        product.style.display = 'flex'; // atau 'block' sesuai layout kamu
        product.classList.add('fade-in', 'show'); // kalau kamu pakai animasi fade
    });
}
function animateLogo() {
    const logo = document.querySelector('.logo-anim');

    if (!logo) return;

    logo.classList.remove('active');

    // reset animasi supaya bisa diklik berkali-kali
    void logo.offsetWidth;

    logo.classList.add('active');
}
function handleEnter(e) {
    if (e.key === "Enter") {
        e.preventDefault();

        // jalankan filter dulu
        filterProducts();

        // delay biar hasil filter muncul dulu (biar smooth)
        setTimeout(() => {
            const section = document.getElementById('produk');
            if (section) {
                section.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 150);
    }
}
function openOngkirInfo() {
    const modal = document.getElementById('ongkir-info-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeOngkirInfo() {
    const modal = document.getElementById('ongkir-info-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}