// === VERSI KODE ===
// v1.0.0 - Inisialisasi awal, 5 Tema, Favicon generator, responsif UI.
// v1.0.1 - Pemisahan kode menjadi 3 file (HTML, CSS, JS) untuk struktur yang lebih baik.

// === FITUR TEMA ===
function changeTheme() {
    const theme = document.getElementById('theme').value;
    document.documentElement.setAttribute('data-theme', theme);
    // Simpan pilihan tema di LocalStorage
    localStorage.setItem('selectedTheme', theme);
}

// Load tema dari LocalStorage saat halaman dimuat
window.onload = () => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if(savedTheme) {
        document.getElementById('theme').value = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

// === FITUR GENERATOR ICON ===
// Ukuran standar untuk Favicon, Apple Touch Icon, dan Android PWA
const iconSizes = [
    { size: 16, name: "Favicon" },
    { size: 32, name: "Favicon" },
    { size: 180, name: "Apple Touch" },
    { size: 192, name: "Android PWA" },
    { size: 512, name: "Android PWA" }
];

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Tampilkan preview
            const preview = document.getElementById('preview-img');
            preview.src = img.src;
            preview.style.display = 'block';

            // Generate icon
            generateIcons(img);
        }
        img.src = e.target.result;
    }
    reader.readAsDataURL(file);
}

function generateIcons(image) {
    const resultsSection = document.getElementById('results-section');
    const iconGrid = document.getElementById('icon-grid');
    
    // Bersihkan hasil sebelumnya
    iconGrid.innerHTML = '';
    resultsSection.style.display = 'flex';

    // Looping dan buat canvas untuk setiap ukuran
    iconSizes.forEach(item => {
        const s = item.size;
        
        // Buat Elemen Card
        const card = document.createElement('div');
        card.className = 'icon-card';

        const title = document.createElement('strong');
        title.innerText = `${s}x${s}\n(${item.name})`;

        const canvas = document.createElement('canvas');
        canvas.width = s;
        canvas.height = s;
        
        // Styling agar canvas besar tidak merusak grid di UI
        if(s > 100) {
            canvas.style.width = '100px';
            canvas.style.height = '100px';
        }

        // Gambar ke Canvas
        const ctx = canvas.getContext('2d');
        // Menjaga kualitas saat resize
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(image, 0, 0, s, s);

        // Buat tombol download
        const downloadBtn = document.createElement('a');
        downloadBtn.className = 'btn-download';
        downloadBtn.innerText = 'Download';
        downloadBtn.download = `icon-${s}x${s}.png`;
        downloadBtn.href = canvas.toDataURL('image/png');

        // Gabungkan elemen ke dalam card
        card.appendChild(title);
        card.appendChild(canvas);
        card.appendChild(downloadBtn);
        iconGrid.appendChild(card);
    });
}
