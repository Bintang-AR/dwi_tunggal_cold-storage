// ===============================
// CONFIG
// ===============================
const WA_NUMBER = '6282112712040';
const EMAIL_ADDR = 'cv.dwitunggalteknik018@gmail.com';

const selectedVariasi = {};
let uploadedFile = null;
let coverageAreas = [];

// ===============================
// PRODUK / PEMESANAN
// ===============================
function selectVariasi(el, produkId, variasi, label) {
  const list = el.closest('.variasi-list');

  list.querySelectorAll('.variasi-item').forEach(i => {
    i.classList.remove('selected');
  });

  el.classList.add('selected');

  selectedVariasi[produkId] = {
    variasi,
    label
  };
}

function buildMessage(card) {
  const kapasitas = card.dataset.kapasitas;
  const produkId = kapasitas.replace(/\s+/g, '').toLowerCase();

  const sel = selectedVariasi[produkId];

  if (!sel) {
    showToast('⚠️ Pilih variasi terlebih dahulu!', '#f59e0b');
    return null;
  }

  return `Halo CV Dwi Tunggal Teknik 👋

Saya tertarik dengan produk berikut:

📦 Produk: Cold Storage ${kapasitas}
🔧 Variasi: ${sel.label}

Mohon informasi lebih lanjut mengenai:
✅ Harga
✅ Spesifikasi Teknis
✅ Estimasi Instalasi
✅ Ketersediaan Unit

Nama Saya: [Isi Nama]
Lokasi: [Isi Kota]`;
}

function pesanWA(card) {
  const msg = buildMessage(card);
  if (!msg) return;

  window.open(
    `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,
    '_blank'
  );
}

function pesanEmail(card) {
  const kapasitas = card.dataset.kapasitas;
  const produkId = kapasitas.replace(/\s+/g, '').toLowerCase();

  const sel = selectedVariasi[produkId];

  if (!sel) {
    showToast('⚠️ Pilih variasi terlebih dahulu!', '#f59e0b');
    return;
  }

  const subject = `Permintaan Penawaran: ${sel.label}`;

  const body = `Halo Tim CV Dwi Tunggal Teknik,

Saya ingin mendapatkan penawaran untuk:

Produk: ${sel.label}

Nama: [Nama Anda]
Perusahaan: [Nama Perusahaan]
Telepon: [Nomor Telepon]
Lokasi Instalasi: [Kota]

Terima kasih.`;

  window.open(
    `mailto:${EMAIL_ADDR}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    '_blank'
  );
}

// ===============================
// FORM KONTAK
// ===============================
function kirimForm() {
  const nama = document.getElementById('nama').value.trim();
  const telepon = document.getElementById('telepon').value.trim();
  const kapasitas = document.getElementById('kapasitas').value;
  const lokasi = document.getElementById('lokasi').value.trim();
  const kebutuhan = document.getElementById('kebutuhan').value.trim();

  if (!nama || !telepon || !kapasitas || !lokasi) {
    showToast('⚠️ Isi semua field wajib!', '#f59e0b');
    return;
  }

  const msg = `Halo CV Dwi Tunggal Teknik 👋

FORM PERMINTAAN PENAWARAN

Nama: ${nama}
Telepon: ${telepon}
Kapasitas: ${kapasitas}
Lokasi: ${lokasi}

${kebutuhan ? 'Kebutuhan:\n' + kebutuhan : ''}`;

  window.open(
    `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,
    '_blank'
  );
}

// ===============================
// TOAST
// ===============================
function showToast(msg, color = '#1eb356') {
  const t = document.getElementById('toast');

  t.textContent = msg;
  t.style.background = color;
  t.classList.add('show');

  setTimeout(() => {
    t.classList.remove('show');
  }, 3000);
}

// ===============================
// NAVBAR
// ===============================
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');

  if (!nav) return;

  if (window.scrollY > 80) {
    nav.style.background = 'rgba(0,21,41,0.98)';
    nav.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)';
  } else {
    nav.style.background = 'rgba(0,21,41,0.92)';
    nav.style.boxShadow = 'none';
  }
});

// ===============================
// MOBILE NAV
// ===============================
const navToggle = document.getElementById('navToggle');

if (navToggle) {
  navToggle.addEventListener('click', function () {
    const links = document.getElementById('navLinks');

    links.classList.toggle('open');
    this.textContent = links.classList.contains('open') ? '✕' : '☰';
  });
}

// ===============================
// SCROLL REVEAL
// ===============================
const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => {
  observer.observe(el);
});

// ===============================
// ADMIN PANEL
// ===============================
function openAdmin() {
  document.getElementById('admin-panel').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAdmin() {
  document.getElementById('admin-panel').classList.remove('open');
  document.body.style.overflow = '';
}

async function loginAdmin() {
  const password = document.getElementById('adminPass').value;

  const res = await fetch('/api/admin_login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password })
  });

  const data = await res.json();

  if (data.success) {
    document.getElementById('adminLoginForm').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';

    loadCoverage();

    showToast('✅ Login berhasil!');
  } else {
    showToast('❌ Password salah!', '#ef4444');
  }
}

// ===============================
// COVERAGE
// ===============================
async function loadCoverage() {
  const res = await fetch('/api/get_coverage');
  coverageAreas = await res.json();

  renderAdminCoverage();
  updateCoverageList();
}

function renderAdminCoverage() {
  const chips = document.getElementById('adminCoverageChips');

  chips.innerHTML = coverageAreas.map(area => `
    <div class="chip">
      ${area.nama_kota}
      <span class="chip-remove" onclick="removeCoverage(${area.id})">×</span>
    </div>
  `).join('');
}

async function addCoverage() {
  const val = document.getElementById('newCoverageInput').value.trim();

  if (!val) return;

  await fetch('/api/add_coverage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nama: val
    })
  });

  document.getElementById('newCoverageInput').value = '';

  loadCoverage();

  showToast('✅ Area ditambahkan!');
}

async function removeCoverage(id) {
  await fetch('/api/delete_coverage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id
    })
  });

  loadCoverage();

  showToast('🗑️ Area dihapus!');
}

function updateCoverageList() {
  const list = document.getElementById('coverageList');

  if (!list) return;

  list.innerHTML = coverageAreas.map(area => `
    <li onclick="changeMap('${area.nama_kota}')">
      ${area.nama_kota}
    </li>
  `).join('');
}

function changeMap(kota) {
  document.getElementById('coverageMap').src =
    `https://www.google.com/maps?q=${encodeURIComponent(kota)}&output=embed`;
}

// ===============================
// TESTIMONI
// ===============================
function previewUpload(input) {
  uploadedFile = input.files[0];

  const preview = document.getElementById('uploadPreview');

  if (!uploadedFile) return;

  if (uploadedFile.type.startsWith('image/')) {
    preview.innerHTML = `
      <img
        src="${URL.createObjectURL(uploadedFile)}"
        style="width:100%;border-radius:8px;max-height:200px;object-fit:cover;"
      >
    `;
  } else {
    preview.innerHTML = `
      <video controls style="width:100%;border-radius:8px;">
        <source src="${URL.createObjectURL(uploadedFile)}">
      </video>
    `;
  }
}

async function addTestimoni() {
  const nama = document.getElementById('testiNama').value.trim();
  const perusahaan = document.getElementById('testiPerusahaan').value.trim();
  const text = document.getElementById('testiText').value.trim();

  if (!nama || !text || !uploadedFile) {
    showToast('⚠️ Lengkapi semua data!', '#f59e0b');
    return;
  }

  const formData = new FormData();

  formData.append('nama', nama);
  formData.append('perusahaan', perusahaan);
  formData.append('text', text);
  formData.append('file', uploadedFile);

  const res = await fetch('/api/save_testimoni', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();

  if (data.success) {
    showToast('✅ Testimoni berhasil ditambahkan!');

    document.getElementById('testiNama').value = '';
    document.getElementById('testiPerusahaan').value = '';
    document.getElementById('testiText').value = '';
    document.getElementById('uploadPreview').innerHTML = '';

    uploadedFile = null;

    loadTestimoni();
  } else {
    showToast('❌ Upload gagal!', '#ef4444');
  }
}

async function loadTestimoni() {
  const res = await fetch('/api/get_testimoni');
  const data = await res.json();

  const grid = document.getElementById('testiGrid');

  if (!grid) return;

  grid.innerHTML = data.map(item => `
    <div class="testi-media">
      ${
        item.file_type.startsWith('image')
          ? `<img src="${item.file_path}" alt="testimoni">`
          : `<video controls><source src="${item.file_path}"></video>`
      }

      <div class="testi-caption">
        ${item.text}
        <span>${item.nama}${item.perusahaan ? ' - ' + item.perusahaan : ''}</span>
      </div>
    </div>
  `).join('');
}

// ===============================
// INIT
// ===============================
window.addEventListener('DOMContentLoaded', () => {
  loadCoverage();
  loadTestimoni();
});

document.getElementById('admin-panel').addEventListener('click', function (e) {
  if (e.target === this) closeAdmin();
});