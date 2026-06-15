let generatedImages = [];
let currentImage = null;
let manifestContent = null; 

// === FITUR TEMA ===
function changeTheme() {
    const theme = document.getElementById('theme').value;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('selectedTheme', theme);
}

window.onload = () => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if(savedTheme) {
        document.getElementById('theme').value = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

// === DATA UKURAN IKON & PENAMAAN FILE CUSTOM ===
// Penamaan icon 192 dan 512 disesuaikan langsung dengan permintaan Anda.
const baseIconSizes = [
    { size: 16, name: "Favicon", rel: "icon", type: "square", filename: "icon-16x16.png" },
    { size: 32, name: "Favicon", rel: "icon", type: "square", filename: "icon-32x32.png" },
    { size: 180, name: "Apple Touch", rel: "apple-touch-icon", type: "square", filename: "icon-180x180.png" },
    { size: 192, name: "Android PWA", rel: "icon", type: "square", filename: "icon-192.png" },
    { size: 512, name: "Android PWA", rel: "icon", type: "square", filename: "icon-512.png" }
];

// === LOGIKA BARU PWA INPUT ELEMENT TOGGLE ===
function togglePwaInput() {
    const usePwa = document.getElementById('pro-pwa').checked;
    const inputContainer = document.getElementById('pwa-input-container');
    inputContainer.style.display = usePwa ? 'block' : 'none';
    updateSettings();
}

// === UPDATE SETTINGS REALTIME ===
function updateSettings() {
    const paddingVal = document.getElementById('icon-padding').value;
    document.getElementById('padding-val').innerText = paddingVal;

    const radiusVal = document.getElementById('icon-radius').value;
    document.getElementById('radius-val').innerText = radiusVal;

    const isTransparent = document.getElementById('bg-transparent').checked;
    document.getElementById('bg-color').disabled = isTransparent;
    document.getElementById('bg-color').style.opacity = isTransparent ? '0.5' : '1';

    if(currentImage) generateIcons();
}

// === FITUR UPLOAD & DRAG DROP CORE ===
const dropZone = document.getElementById('drop-zone');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('dragover');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('dragover');
    }, false);
});

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file) processFile(file);
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) processFile(file);
}

function processFile(file) {
    if (!file.type.match('image.*')) {
        alert("Mohon unggah file format gambar (PNG/JPG/SVG).");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            document.getElementById('preview-img').src = img.src;
            document.getElementById('preview-img').style.display = 'block';
            
            currentImage = img;
            document.getElementById('settings-section').style.display = 'block';
            
            generateIcons();
        }
        img.src = e.target.result;
    }
    reader.readAsDataURL(file);
}

// === CORE RENDER LOGIC ===
function generateIcons() {
    if(!currentImage) return;

    const resultsSection = document.getElementById('results-section');
    const iconGrid = document.getElementById('icon-grid');
    
    const paddingPercent = parseInt(document.getElementById('icon-padding').value, 10);
    const radiusPercent = parseInt(document.getElementById('icon-radius').value, 10);
    const bgColor = document.getElementById('bg-color').value;
    const isTransparent = document.getElementById('bg-transparent').checked;
    
    const useShadow = document.getElementById('pro-shadow').checked;
    const useBanner = document.getElementById('pro-banner').checked;
    const usePwa = document.getElementById('pro-pwa').checked;
    const pwaAppName = document.getElementById('pwa-name').value || "My Progressive App";

    iconGrid.innerHTML = '';
    generatedImages = [];
    manifestContent = null;
    let htmlSnippet = `\n`;

    let currentSizes = [...baseIconSizes];
    
    if (useBanner) {
        currentSizes.push({ width: 1200, height: 630, name: "Banner Sosmed (Open Graph)", rel: "og:image", type: "banner", filename: "banner-1200x630.png" });
    }

    currentSizes.forEach(item => {
        const isBanner = item.type === "banner";
        const w = isBanner ? item.width : item.size;
        const h = isBanner ? item.height : item.size;
        
        // Memastikan penamaan sesuai target lokal
        const filename = item.filename;
        
        const card = document.createElement('div');
        card.className = isBanner ? 'icon-card banner-card' : 'icon-card';

        const title = document.createElement('strong');
        title.innerText = isBanner ? `${item.name}\n(1200x630)` : `${w}x${w}\n(${item.name})`;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        
        if(!isBanner && w > 100) { 
            canvas.style.width = '100px'; 
            canvas.style.height = '100px'; 
        }

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.save();
        ctx.beginPath();
        
        const radiusLimit = isBanner ? 5 : radiusPercent;
        const radius = (Math.min(w, h) * radiusLimit) / 100;
        
        if (ctx.roundRect) {
            ctx.roundRect(0, 0, w, h, radius);
        } else {
            ctx.rect(0, 0, w, h);
        }
        ctx.clip();

        if(!isTransparent) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, w, h);
        }

        if (useShadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = Math.min(w, h) * 0.08;
            ctx.shadowOffsetY = Math.min(w, h) * 0.04;
            ctx.shadowOffsetX = 0;
        }

        const minDimension = Math.min(w, h);
        const drawSize = minDimension * (1 - (paddingPercent / 100));
        
        const offsetX = (w - drawSize) / 2;
        const offsetY = (h - drawSize) / 2;

        ctx.drawImage(currentImage, offsetX, offsetY, drawSize, drawSize);

        ctx.restore(); 

        const dataURL = canvas.toDataURL('image/png');
        generatedImages.push({ name: filename, data: dataURL.split(',')[1] });
        
        if (isBanner) {
            htmlSnippet += `<meta property="og:image" content="/${filename}">\n`;
            htmlSnippet += `<meta property="twitter:image" content="/${filename}">\n`;
        } else {
            htmlSnippet += `<link rel="${item.rel}" sizes="${w}x${w}" href="/${filename}">\n`;
        }

        const downloadBtn = document.createElement('a');
        downloadBtn.className = 'btn-download';
        downloadBtn.innerText = 'Download';
        downloadBtn.download = filename;
        downloadBtn.href = dataURL;

        card.appendChild(title);
        card.appendChild(canvas);
        card.appendChild(downloadBtn);
        iconGrid.appendChild(card);
    });

    // PWA JSON Target file lokal yang diinginkan user
    if (usePwa) {
        htmlSnippet += `<link rel="manifest" href="/manifest.json">\n`;
        
        const manifestObj = {
            "name": pwaAppName,
            "short_name": pwaAppName.substring(0, 12),
            "start_url": "/",
            "display": "standalone",
            "background_color": isTransparent ? "#ffffff" : bgColor,
            "theme_color": isTransparent ? "#121212" : bgColor,
            "icons": [
                { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
                { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
            ]
        };
        manifestContent = JSON.stringify(manifestObj, null, 4);
        document.getElementById('manifest-code').value = manifestContent;
        document.getElementById('manifest-section').style.display = 'flex';
    } else {
        document.getElementById('manifest-section').style.display = 'none';
    }

    document.getElementById('html-code').value = htmlSnippet;
    resultsSection.style.display = 'flex';
}

// === DOWNLOAD ZIP ===
function downloadZip() {
    if (generatedImages.length === 0) return;
    
    const zip = new JSZip();
    generatedImages.forEach(img => {
        zip.file(img.name, img.data, {base64: true});
    });

    if(manifestContent) {
        zip.file("manifest.json", manifestContent);
    }

    zip.generateAsync({type:"blob"}).then(function(content) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = "icons-bundle.zip";
        a.click();
    });
}

// === COPY CODE UTILITY ===
function copyCode(targetId, btnSelector) {
    const codeArea = document.getElementById(targetId);
    codeArea.select();
    codeArea.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(codeArea.value);
    
    const btn = document.querySelector(btnSelector);
    const originalText = btn.innerText;
    btn.innerText = "✅ Tersalin!";
    setTimeout(() => { btn.innerText = originalText; }, 2000);
}