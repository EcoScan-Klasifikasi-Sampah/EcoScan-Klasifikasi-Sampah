import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, SwitchCamera } from "lucide-react";

import "./App.css";
import WeeklyChallengeStreak from "./components/WeeklyChallengeStreak.jsx";



const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const CLASSIFY_URL = `${API_BASE_URL}/api/v1/classify`;
const HISTORY_URL = `${API_BASE_URL}/api/v1/history`;
const LOGIN_URL = `${API_BASE_URL}/api/v1/auth/login`;
const REGISTER_URL = `${API_BASE_URL}/api/v1/auth/register`;
const COMMUNITY_CHALLENGE_URL = `${API_BASE_URL}/api/v1/community/challenge`;
const COMMUNITY_POSTS_URL = `${API_BASE_URL}/api/v1/community/posts`;
const COMMUNITY_LEADERBOARD_URL = `${API_BASE_URL}/api/v1/community/leaderboard`;
const COMMUNITY_SEARCH_URL = `${API_BASE_URL}/api/v1/search`;
const WEEKLY_CHALLENGE_STATUS_URL = `${API_BASE_URL}/api/v1/challenges/weekly/status`;
const NOTIFICATIONS_URL = `${API_BASE_URL}/api/v1/notifications`;
const TRIVIA_URL = `${API_BASE_URL}/api/v1/trivia`;
const USER_URL = `${API_BASE_URL}/api/v1/users`;
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const HISTORY_PAGE_SIZE = 5;
const WEEKLY_CHALLENGE_TARGET = 10;

const textTranslations = {
  "Beranda": "Home",
  "Riwayat": "History",
  "Scan": "Scan",
  "Komunitas": "Community",
  "Akun": "Account",
  "Selamat datang kembali": "Welcome back",
  "Selamat Datang di Eco Scan": "Welcome to Eco Scan",
  "Scan Minggu Ini": "Scans This Week",
  "Poin Eco": "Eco Points",
  "Hari Streak": "Day Streak",
  "Mulai Scan Sampah": "Start Waste Scan",
  "Aksi Cepat": "Quick Actions",
  "Eco Trivia": "Eco Trivia",
  "Panduan edukasi sampah": "Waste education guide",
  "Pindai Sampah": "Scan Waste",
  "Scan Sampah": "Waste Scan",
  "Hasil Scan": "Scan Result",
  "Kamera": "Camera",
  "Upload": "Upload",
  "Arahkan kamera ke sampah, lalu tekan tombol scan.": "Point the camera at waste, then press scan.",
  "Unggah gambar sampah dari galeri untuk mulai scan.": "Upload a waste photo from your gallery to start scanning.",
  "Pilih gambar sampah dari galeri.": "Choose a waste image from your gallery.",
  "Ambil foto sampah langsung dari kamera.": "Capture waste directly from the camera.",
  "Hasil Klasifikasi": "Classification Result",
  "Jenis Sampah": "Waste Type",
  "Akurasi": "Accuracy",
  "Label Model": "Model Label",
  "Status": "Status",
  "Cara Pengolahan": "Handling Guide",
  "Langkah Pengolahan": "Processing Steps",
  "Tersimpan di Riwayat": "Saved to History",
  "Scan Ulang": "Scan Again",
  "Aktivitas scan terbaru": "Latest scan activity",
  "Belum ada riwayat scan.": "No scan history yet.",
  "Muat ulang": "Refresh",
  "Belajar dan bergerak bersama": "Learn and act together",
  "Feed": "Feed",
  "Tips": "Tips",
  "Leaderboard": "Leaderboard",
  "Tantangan Minggu Ini": "This Week's Challenge",
  "Buat Post": "Create Post",
  "Belum ada postingan yang cocok.": "No matching posts yet.",
  "Tips tidak ditemukan.": "No tips found.",
  "Cari tips, pengguna, atau topik...": "Search tips, users, or topics...",
  "Sedang mencari...": "Searching...",
  "Pencarian gagal. Menampilkan hasil lokal.": "Search failed. Showing local results.",
  "Hapus pencarian": "Clear search",
  "suka": "likes",
  "komentar": "comments",
  "Disukai": "Liked",
  "Like": "Like",
  "Komentar": "Comments",
  "Belum ada komentar.": "No comments yet.",
  "Balas": "Reply",
  "Batalkan balasan": "Cancel reply",
  "Tulis balasan...": "Write a reply...",
  "Tulis komentar...": "Write a comment...",
  "Kirim": "Send",
  "Edit Profil": "Edit Profile",
  "Ganti Password": "Change Password",
  "Notifikasi": "Notifications",
  "Belum dibaca": "Unread",
  "Bahasa": "Language",
  "Bahasa Indonesia": "Indonesian",
  "English": "English",
  "Aktif": "Active",
  "Pilih": "Choose",
  "Bantuan": "Help",
  "Logout": "Logout",
  "Pusat Bantuan": "Help Center",
  "Nama": "Name",
  "Email": "Email",
  "Simpan": "Save",
  "Simpan Foto": "Save Photo",
  "Pakai Avatar": "Use Avatar",
  "Foto profil maksimal 2MB": "Profile photo max 2MB",
  "Pilih Foto": "Choose Photo",
  "Belum ada file dipilih": "No file selected",
  "Password Lama": "Current Password",
  "Password Baru": "New Password",
  "Konfirmasi Password Baru": "Confirm New Password",
  "Konfirmasi Password": "Confirm Password",
  "Masuk": "Sign In",
  "Daftar": "Sign Up",
  "Memproses...": "Processing...",
  "Sudah punya akun?": "Already have an account?",
  "Belum punya akun?": "Don't have an account?",
  "Buat akun EcoScan dan mulai catat aksi hijaumu.": "Create an EcoScan account and start tracking your green actions.",
  "Ayo mulai langkah kecilmu untuk Bumi.": "Start your small step for the Earth.",
  "Total Scan": "Total Scans",
  "Poin": "Points",
  "Streak": "Streak",
  "Riwayat Scan": "Scan History",
  "Botol Plastik PET": "PET Plastic Bottle",
  "Sisa Makanan": "Food Waste",
  "Kertas Kemasan": "Packaging Paper",
  "Scan sampah": "Waste scan",
  "Bagaimana cara scan sampah?": "How do I scan waste?",
  "Buka menu Scan, unggah gambar atau ambil foto, lalu tunggu hasil klasifikasi AI.": "Open Scan, upload or capture a photo, then wait for the AI classification.",
  "Kenapa hasil scan tidak tersimpan?": "Why is my scan result not saved?",
  "Jika hasil scan belum tersimpan, coba periksa koneksi internet lalu ulangi proses scan.": "If your scan result has not been saved, check your internet connection and try scanning again.",
  "Kontak bantuan": "Support contact",
  "Kirim laporan ke support@ecoscan.my.id dengan screenshot masalah yang kamu temui.": "Send a report to support@ecoscan.my.id with a screenshot of the issue.",
  "Fakta Daur Ulang": "Recycling Facts",
  "Botol plastik PET sebaiknya dicuci, dikeringkan, lalu disetor ke bank sampah.": "PET plastic bottles should be washed, dried, then sent to a waste bank.",
  "Botol PET yang bersih lebih mudah diterima bank sampah karena tidak mencemari material lain.": "Clean PET bottles are easier for waste banks to accept because they do not contaminate other materials.",
  "Botol PET yang bersih lebih mudah diterima bank sampah karena tidak mencemari material lain. Lepaskan label bila memungkinkan, pipihkan botol untuk menghemat ruang, lalu kumpulkan berdasarkan jenis plastik.": "Clean PET bottles are easier for waste banks to accept because they do not contaminate other materials. Remove labels when possible, flatten bottles to save space, then sort by plastic type.",
  "Sampah Organik": "Organic Waste",
  "Sisa sayur dan buah bisa diolah menjadi kompos untuk mengurangi sampah rumah.": "Vegetable and fruit scraps can be composted to reduce household waste.",
  "Sampah organik seperti kulit buah, sisa sayur, ampas kopi, dan daun kering bisa masuk komposter.": "Organic waste such as fruit peels, vegetable scraps, coffee grounds, and dry leaves can go into a composter.",
  "Sampah organik seperti kulit buah, sisa sayur, ampas kopi, dan daun kering bisa masuk komposter. Hindari minyak berlebih dan daging mentah agar kompos tidak berbau tajam.": "Organic waste such as fruit peels, vegetable scraps, coffee grounds, and dry leaves can go into a composter. Avoid excess oil and raw meat so the compost does not smell strong.",
  "Pisahkan dari sumber": "Sort from the Source",
  "Gunakan wadah berbeda untuk organik, anorganik, B3, kertas, dan residu.": "Use different containers for organic, inorganic, hazardous, paper, and residual waste.",
  "Bersihkan kemasan": "Clean Packaging",
  "Bilas botol atau kaleng agar tidak berbau dan lebih mudah diterima bank sampah.": "Rinse bottles or cans so they do not smell and are easier for waste banks to accept.",
  "Olah sampah organik": "Process Organic Waste",
  "Sisa sayur, buah, dan daun kering bisa menjadi kompos untuk tanaman.": "Vegetable scraps, fruit peels, and dry leaves can become compost for plants.",
  "Scan 10 sampah plastik": "Scan 10 Plastic Waste Items",
  "Kumpulkan scan plastik bersih minggu ini dan bagikan tips pemilahanmu.": "Collect clean plastic scans this week and share your sorting tips.",
  "Tips memilah sampah dapur": "Kitchen Waste Sorting Tips",
  "Pisahkan kulit buah dan sisa sayur sejak awal. Wadah kecil di dekat meja masak bikin kebiasaan ini lebih gampang.": "Separate fruit peels and vegetable scraps from the start. A small bin near the cooking table makes the habit easier.",
  "Aku pakai wadah bekas es krim, ternyata praktis banget.": "I use an old ice cream container, and it is surprisingly practical.",
  "Tipsnya membantu buat mulai kompos di rumah.": "The tips help me start composting at home.",
  "Jadwal setor plastik minggu ini": "Plastic Drop-off Schedule This Week",
  "Cuci dan keringkan botol plastik sebelum disetor supaya nilainya lebih tinggi.": "Wash and dry plastic bottles before dropping them off so they have better value.",
  "Bank sampah dekat rumahku juga minta botol dipipihkan.": "The waste bank near my house also asks for bottles to be flattened.",
  "Mulai dari 3 kategori": "Start with 3 Categories",
  "Untuk pemula, pisahkan organik, anorganik, dan residu lebih dulu agar rutinitasnya mudah dijaga.": "For beginners, separate organic, inorganic, and residual waste first so the routine is easier to maintain.",
  "Keringkan plastik sebelum disetor": "Dry Plastic Before Drop-off",
  "Kemasan yang kering dan bersih memiliki nilai jual lebih baik di bank sampah.": "Dry and clean packaging has better value at waste banks.",
  "Simpan limbah B3 terpisah": "Store Hazardous Waste Separately",
  "Baterai, lampu, dan obat kedaluwarsa jangan dicampur dengan sampah rumah tangga.": "Batteries, lamps, and expired medicine should not be mixed with household waste.",
  "Pemilahan": "Sorting",
  "Daur ulang": "Recycling",
  "Keamanan": "Safety",
  "Anggota": "Member",
  "Panduan": "Guide",
  "Bank Sampah": "Waste Bank",
  "Eco Mentor": "Eco Mentor",
  "Eco Guardian": "Eco Guardian",
  "Eco Ranger": "Eco Ranger",
  "Eco Learner": "Eco Learner",
  "Eco Starter": "Eco Starter",
  "Postingan komunitas": "Community post",
  "Minggu ini": "This week",
  "Hari ini": "Today",
  "Kemarin": "Yesterday",
  "Baru saja": "Just now",
  "selesai": "completed",
  "poin": "points",
  "MODEL AI": "AI MODEL",
  "AKURASI": "ACCURACY",
  "ALASAN DIPAKAI": "WHY WE USE IT",
  "Kenapa Model Ini?": "Why This Model?",
  "MobileNetV2 Transfer Learning": "MobileNetV2 Transfer Learning",
  "Model ini membantu mengenali jenis sampah dari foto dengan cepat, sehingga pengguna bisa langsung memilah, menyetor, atau mengolah sampah sesuai kategori.": "This model helps identify waste types from photos quickly, so users can sort, drop off, or process waste according to its category.",
  "Ringan untuk aplikasi web, cepat membaca gambar, dan cukup stabil membedakan pola visual sampah agar hasil scan bisa langsung dipakai untuk memilah dengan tepat.": "Lightweight for web apps, quick at reading images, and stable enough to distinguish waste visual patterns so scan results can be used for sorting right away.",
  "Organik • Anorganik • B3 • Kertas • Residu": "Organic • Inorganic • Hazardous • Paper • Residual",
  "Organik • Organik • Anorganik • B3 • Kertas • Residu": "Organic • Organic • Inorganic • Hazardous • Paper • Residual",
  "Organik": "Organic",
  "Anorganik": "Inorganic",
  "Kertas": "Paper",
  "Residu": "Residual",
  "Pisahkan dari plastik, karet, logam, dan bahan non-organik lain.": "Separate it from plastic, rubber, metal, and other non-organic materials.",
  "Tiriskan sisa makanan agar komposter tidak terlalu basah.": "Drain food scraps so the composter does not get too wet.",
  "Potong kecil sisa sayur, buah, atau daun agar cepat terurai.": "Cut vegetable scraps, fruit, or leaves into smaller pieces so they decompose faster.",
  "Campur dengan bahan coklat seperti daun kering, kardus, atau serbuk kayu.": "Mix with brown materials such as dry leaves, cardboard, or sawdust.",
  "Aduk berkala dan simpan di tempat teduh sampai menjadi kompos.": "Stir regularly and keep it in a shaded place until it turns into compost.",
  "Kosongkan isi kemasan agar tidak mengotori material lain.": "Empty packaging contents so they do not contaminate other materials.",
  "Bilas dan keringkan botol, kaleng, atau plastik bernilai daur ulang.": "Rinse and dry bottles, cans, or recyclable plastic.",
  "Pisahkan berdasarkan bahan seperti plastik, kaca, logam, dan kemasan multilayer.": "Sort by material such as plastic, glass, metal, and multilayer packaging.",
  "Pipihkan botol atau kardus agar lebih hemat ruang.": "Flatten bottles or cardboard to save space.",
  "Setorkan ke bank sampah atau drop point daur ulang terdekat.": "Drop it off at the nearest waste bank or recycling point.",
  "Jangan dicampur dengan sampah rumah tangga biasa.": "Do not mix it with regular household waste.",
  "Simpan baterai, lampu, obat, atau bahan kimia dalam wadah tertutup.": "Store batteries, lamps, medicine, or chemicals in a closed container.",
  "Beri label jika limbah berbahaya agar tidak tertukar.": "Label hazardous waste so it does not get mixed up.",
  "Jauhkan dari panas, air, dan jangkauan anak-anak.": "Keep it away from heat, water, and children.",
  "Serahkan ke drop point limbah B3 atau fasilitas pengelolaan resmi.": "Take it to a hazardous-waste drop point or official handling facility.",
  "Pastikan kertas kering dan bebas minyak atau sisa makanan.": "Make sure paper is dry and free from oil or food residue.",
  "Pisahkan kertas putih, kardus, dan kemasan berlapis jika memungkinkan.": "Separate white paper, cardboard, and laminated packaging when possible.",
  "Lepaskan plastik, selotip, atau bahan non-kertas yang menempel.": "Remove attached plastic, tape, or non-paper materials.",
  "Pipihkan kardus agar mudah disimpan dan diangkut.": "Flatten cardboard so it is easier to store and transport.",
  "Kumpulkan dalam kondisi bersih lalu setor ke bank sampah atau pengepul.": "Keep it clean, then send it to a waste bank or collector.",
  "Pisahkan residu dari sampah yang masih bisa didaur ulang atau dikomposkan.": "Separate residual waste from items that can still be recycled or composted.",
  "Bungkus residu tajam atau kotor agar aman saat diangkut.": "Wrap sharp or dirty residual waste so it is safe to transport.",
  "Kurangi volume dengan menekan atau melipat jika aman dilakukan.": "Reduce volume by pressing or folding when safe.",
  "Gunakan tempat sampah tertutup untuk mencegah bau dan kontaminasi.": "Use a covered bin to prevent odor and contamination.",
  "Buang melalui layanan sampah resmi karena residu sulit diolah mandiri.": "Dispose of it through official waste service because residual waste is hard to process independently.",
  "Judul tips atau cerita": "Tip or story title",
  "Bagikan pengalaman, tips, atau info komunitas...": "Share experiences, tips, or community info...",
  "total scan": "total scans",
  "Label AI": "AI Label",
  "Ikuti panduan pemilahan lokal dan simpan hasilnya ke riwayat.": "Follow your local sorting guide and save the result to history.",
  "Balik kamera": "Switch camera",
  "Mulai scan": "Start scan",
  "Kamera aktif.": "Camera is active.",
  "Kamera tidak bisa diakses.": "Camera cannot be accessed.",
  "Scan berhasil disimpan ke riwayat.": "Scan saved to history.",
  "Scan gagal diproses.": "Scan failed to process.",
  "Riwayat berhasil diperbarui.": "History updated successfully.",
  "Postingan dibuat.": "Post created.",
  "Like tersimpan lokal sementara.": "Like saved locally for now.",
  "Komentar ditambahkan.": "Comment added.",
  "Balasan ditambahkan.": "Reply added.",
  "Tema light aktif.": "Light theme is active.",
  "Tema dark aktif.": "Dark theme is active.",
  "Berhasil masuk.": "Signed in successfully.",
  "Akun berhasil dibuat.": "Account created successfully.",
  "Berhasil logout.": "Signed out successfully.",
  "Profil berhasil diperbarui.": "Profile updated successfully.",
  "Profil tersimpan lokal, backend belum tersambung.": "Profile saved locally; backend is not connected yet.",
  "Password berhasil diperbarui.": "Password updated successfully.",
  "File yang dipilih harus berupa gambar.": "Selected file must be an image.",
  "Foto profil maksimal 2MB.": "Profile photo maximum is 2MB.",
  "Tutup": "Close",
  "Navigasi utama": "Main navigation",
  "Ganti tema": "Change theme",
  "Ganti foto profil": "Change profile photo",
  "Ganti Foto Profil": "Change Profile Photo",
  "Belum ada notifikasi.": "No notifications yet.",
  "Nadia membalas komentar kamu di Tips memilah sampah dapur.": "Nadia replied to your comment on Kitchen Waste Sorting Tips.",
  "Tantangan mingguan sudah 60% selesai.": "The weekly challenge is 60% complete.",
  "Kamu mendapat 20 poin dari scan terbaru.": "You earned 20 points from your latest scan.",
  "Sembunyikan password": "Hide password",
  "Tampilkan password": "Show password",
  "Konfirmasi password baru belum sama.": "New password confirmation does not match.",
};

const reverseTextTranslations = Object.fromEntries(
  Object.entries(textTranslations).map(([idText, enText]) => [enText, idText])
);

const processingGuides = {
  Organik: [
    "Pisahkan dari plastik, karet, logam, dan bahan non-organik lain.",
    "Tiriskan sisa makanan agar komposter tidak terlalu basah.",
    "Potong kecil sisa sayur, buah, atau daun agar cepat terurai.",
    "Campur dengan bahan coklat seperti daun kering, kardus, atau serbuk kayu.",
    "Aduk berkala dan simpan di tempat teduh sampai menjadi kompos.",
  ],
  Anorganik: [
    "Kosongkan isi kemasan agar tidak mengotori material lain.",
    "Bilas dan keringkan botol, kaleng, atau plastik bernilai daur ulang.",
    "Pisahkan berdasarkan bahan seperti plastik, kaca, logam, dan kemasan multilayer.",
    "Pipihkan botol atau kardus agar lebih hemat ruang.",
    "Setorkan ke bank sampah atau drop point daur ulang terdekat.",
  ],
  B3: [
    "Jangan dicampur dengan sampah rumah tangga biasa.",
    "Simpan baterai, lampu, obat, atau bahan kimia dalam wadah tertutup.",
    "Beri label jika limbah berbahaya agar tidak tertukar.",
    "Jauhkan dari panas, air, dan jangkauan anak-anak.",
    "Serahkan ke drop point limbah B3 atau fasilitas pengelolaan resmi.",
  ],
  Kertas: [
    "Pastikan kertas kering dan bebas minyak atau sisa makanan.",
    "Pisahkan kertas putih, kardus, dan kemasan berlapis jika memungkinkan.",
    "Lepaskan plastik, selotip, atau bahan non-kertas yang menempel.",
    "Pipihkan kardus agar mudah disimpan dan diangkut.",
    "Kumpulkan dalam kondisi bersih lalu setor ke bank sampah atau pengepul.",
  ],
  Residu: [
    "Pisahkan residu dari sampah yang masih bisa didaur ulang atau dikomposkan.",
    "Bungkus residu tajam atau kotor agar aman saat diangkut.",
    "Kurangi volume dengan menekan atau melipat jika aman dilakukan.",
    "Gunakan tempat sampah tertutup untuk mencegah bau dan kontaminasi.",
    "Buang melalui layanan sampah resmi karena residu sulit diolah mandiri.",
  ],
};


function createSvgThumb(type) {
  const svg =
    type === "plastic"
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#d9f7e6"/><stop offset="1" stop-color="#7ed7a3"/></linearGradient></defs><rect width="320" height="220" rx="28" fill="url(#g)"/><circle cx="250" cy="50" r="34" fill="#fff8ea" opacity=".65"/><path d="M141 46h38v20h-38z" fill="#2f80ed"/><path d="M132 66h56l-7 112c-1 15-12 25-28 25s-27-10-28-25z" fill="#dff4ff" stroke="#176dbd" stroke-width="8"/><path d="M140 101h41M139 129h43M137 157h45" stroke="#85c7ee" stroke-width="8" stroke-linecap="round"/><path d="M62 164c28-47 75-50 112-16 24 21 47 22 83 0" fill="none" stroke="#0b6b43" stroke-width="12" stroke-linecap="round"/><path d="M63 84h46v46H63z" fill="#18b86f" opacity=".22"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#fff3c4"/><stop offset="1" stop-color="#a4d96c"/></linearGradient></defs><rect width="320" height="220" rx="28" fill="url(#g)"/><circle cx="66" cy="52" r="38" fill="#ffffff" opacity=".55"/><path d="M83 160c26-54 70-85 139-78-8 67-50 105-119 100" fill="#24b46b"/><path d="M109 155c38-27 70-42 110-56" stroke="#0b6b43" stroke-width="9" stroke-linecap="round"/><path d="M66 169h188l-16 30H82z" fill="#8a653a"/><path d="M90 132c22-20 53-20 71 0-22 19-50 20-71 0z" fill="#0f8f55"/><path d="M212 130c-17-21-16-48 3-66 17 22 16 46-3 66z" fill="#2bc77a"/></svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createInitialComments(postId, items) {
  return items.map((item, index) => ({
    id: `${postId}-comment-${index + 1}`,
    author: item.author,
    body: item.body,
    createdAt: item.createdAt || "Baru saja",
    replies: item.replies || [],
  }));
}

const categoryMeta = {
  Organik: {
    tone: "green",
    icon: "leaf",
    advice: "Pisahkan dari sampah kering, lalu olah menjadi kompos rumah tangga.",
  },
  Anorganik: {
    tone: "blue",
    icon: "recycle",
    advice: "Bersihkan, keringkan, lalu bawa ke bank sampah atau pusat daur ulang.",
  },
  B3: {
    tone: "orange",
    icon: "spark",
    advice: "Jangan dicampur dengan sampah lain. Serahkan ke titik pengumpulan limbah B3.",
  },
  Kertas: {
    tone: "brown",
    icon: "gallery",
    advice: "Pastikan tidak basah atau berminyak agar mudah didaur ulang.",
  },
  Residu: {
    tone: "gray",
    icon: "x",
    advice: "Masukkan ke wadah residu karena sulit didaur ulang secara mandiri.",
  },
};

const navItems = [
  { id: "home", label: "Beranda", icon: "home" },
  { id: "history", label: "Riwayat", icon: "history" },
  { id: "scan", label: "Scan", icon: "scanner" },
  { id: "community", label: "Komunitas", icon: "people" },
  { id: "profile", label: "Akun", icon: "user" },
];

const triviaCards = [
  {
    id: "trivia-plastic",
    title: "Fakta Daur Ulang",
    text: "Botol plastik PET sebaiknya dicuci, dikeringkan, lalu disetor ke bank sampah.",
    details:
      "Botol PET yang bersih lebih mudah diterima bank sampah karena tidak mencemari material lain. Lepaskan label bila memungkinkan, pipihkan botol untuk menghemat ruang, lalu kumpulkan berdasarkan jenis plastik.",
    thumbnail: createSvgThumb("plastic"),
    alt: "Ilustrasi botol plastik untuk edukasi daur ulang",
  },
  {
    id: "trivia-organic",
    title: "Sampah Organik",
    text: "Sisa sayur dan buah bisa diolah menjadi kompos untuk mengurangi sampah rumah.",
    details:
      "Sampah organik seperti kulit buah, sisa sayur, ampas kopi, dan daun kering bisa masuk komposter. Hindari minyak berlebih dan daging mentah agar kompos tidak berbau tajam.",
    thumbnail: createSvgThumb("organic"),
    alt: "Ilustrasi kompos dan sampah organik",
  },
];

const educationCards = [
  {
    icon: "recycle",
    title: "Pisahkan dari sumber",
    text: "Gunakan wadah berbeda untuk organik, anorganik, B3, kertas, dan residu.",
  },
  {
    icon: "spark",
    title: "Bersihkan kemasan",
    text: "Bilas botol atau kaleng agar tidak berbau dan lebih mudah diterima bank sampah.",
  },
  {
    icon: "leaf",
    title: "Olah sampah organik",
    text: "Sisa sayur, buah, dan daun kering bisa menjadi kompos untuk tanaman.",
  },
];

const fallbackHistoryItems = [
  { name: "Botol Plastik PET", category: "Anorganik", confidence: 96, time: "Hari ini" },
  { name: "Sisa Makanan", category: "Organik", confidence: 91, time: "Kemarin" },
  { name: "Kertas Kemasan", category: "Kertas", confidence: 88, time: "2 hari lalu" },
];

const weeklyChallenge = {
  id: "weekly-plastic-10",
  title: "Scan 10 sampah plastik",
  description: "Kumpulkan scan plastik bersih minggu ini dan bagikan tips pemilahanmu.",
  current: 0,
  target: WEEKLY_CHALLENGE_TARGET,
  reward: 80,
  endsAt: "Minggu ini",
};

const communityPosts = [
  {
    id: "post-kitchen-waste",
    author: "Nadia",
    badge: "Eco Mentor",
    title: "Tips memilah sampah dapur",
    body: "Pisahkan kulit buah dan sisa sayur sejak awal. Wadah kecil di dekat meja masak bikin kebiasaan ini lebih gampang.",
    type: "post",
    likes: 128,
    isLiked: false,
    comments: createInitialComments("post-kitchen-waste", [
      { author: "Sari", body: "Aku pakai wadah bekas es krim, ternyata praktis banget." },
      { author: "Raka", body: "Tipsnya membantu buat mulai kompos di rumah." },
    ]),
    createdAt: "Hari ini",
  },
  {
    id: "post-plastic-schedule",
    author: "Bima",
    badge: "Bank Sampah",
    title: "Jadwal setor plastik minggu ini",
    body: "Cuci dan keringkan botol plastik sebelum disetor supaya nilainya lebih tinggi.",
    type: "post",
    likes: 87,
    isLiked: false,
    comments: createInitialComments("post-plastic-schedule", [
      { author: "Nadia", body: "Bank sampah dekat rumahku juga minta botol dipipihkan." },
    ]),
    createdAt: "Kemarin",
  },
];

const communityTips = [
  {
    id: "tip-three-bins",
    title: "Mulai dari 3 kategori",
    body: "Untuk pemula, pisahkan organik, anorganik, dan residu lebih dulu agar rutinitasnya mudah dijaga.",
    tag: "Pemilahan",
    author: "EcoScan",
    badge: "Panduan",
    type: "tip",
    likes: 42,
    isLiked: false,
    comments: [],
    createdAt: "Minggu ini",
  },
  {
    id: "tip-dry-plastic",
    title: "Keringkan plastik sebelum disetor",
    body: "Kemasan yang kering dan bersih memiliki nilai jual lebih baik di bank sampah.",
    tag: "Daur ulang",
    author: "EcoScan",
    badge: "Panduan",
    type: "tip",
    likes: 35,
    isLiked: false,
    comments: [],
    createdAt: "Minggu ini",
  },
  {
    id: "tip-b3",
    title: "Simpan limbah B3 terpisah",
    body: "Baterai, lampu, dan obat kedaluwarsa jangan dicampur dengan sampah rumah tangga.",
    tag: "Keamanan",
    author: "EcoScan",
    badge: "Panduan",
    type: "tip",
    likes: 51,
    isLiked: false,
    comments: [],
    createdAt: "Minggu ini",
  },
];

const leaderboardItems = [
  { rank: 1, name: "Raka", scans: 48, points: 320, level_title: "Eco Guardian", avatar_url: "" },
  { rank: 2, name: "Nadia", scans: 41, points: 286, level_title: "Eco Ranger", avatar_url: "" },
  { rank: 3, name: "Bima", scans: 36, points: 244, level_title: "Eco Ranger", avatar_url: "" },
  { rank: 4, name: "Sari", scans: 29, points: 198, level_title: "Eco Learner", avatar_url: "" },
];

const emptyUserStats = { total_scans: 0, points: 0, streak: 0, level: 1, level_title: "Eco Starter" };



function mapHistoryItem(item) {
  const confidence =
    typeof item.confidence === "number"
      ? item.confidence <= 1
        ? Math.round(item.confidence * 100)
        : Math.round(item.confidence)
      : 0;

  return {
    id: item.id,
    name: item.specific_class || item.predicted_class || item.filename || "Scan sampah",
    category: item.category || item.predicted_class || "Anorganik",
    confidence,
    time: formatRelativeTime(item.created_at),
  };
}

function normalizePost(item) {
  return {
    id: item.id || `post-${Date.now()}`,
    author: item.author || "Eco Warrior",
    badge: item.badge || "Anggota",
    title: item.title || "Postingan komunitas",
    body: item.body || item.text || "",
    tag: item.tag || "",
    type: item.type || "post",
    likes: Number(item.likes || 0),
    isLiked: Boolean(item.isLiked || item.is_liked),
    comments: Array.isArray(item.comments)
      ? item.comments.map((comment, index) => ({
          id: comment.id || `${item.id}-comment-${index}`,
          author: comment.author || "Anggota",
          body: comment.body || "",
          createdAt: comment.createdAt || comment.created_at || "Baru saja",
          replies: comment.replies || [],
        }))
      : [],
    createdAt: item.createdAt || item.created_at || "Baru saja",
  };
}

function normalizeSearchItems(data) {
  const groups = [];

  if (Array.isArray(data)) groups.push([data]);
  if (Array.isArray(data?.items)) groups.push([data.items]);
  if (Array.isArray(data?.results)) groups.push([data.results]);
  if (Array.isArray(data?.feed)) groups.push([data.feed, "post"]);
  if (Array.isArray(data?.feeds)) groups.push([data.feeds, "post"]);
  if (Array.isArray(data?.posts)) groups.push([data.posts, "post"]);
  if (Array.isArray(data?.tips)) groups.push([data.tips, "tip"]);

  const seen = new Set();
  const items = [];

  groups.forEach(([group, forcedType]) => {
    group.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const normalized = normalizePost(forcedType && !item.type ? { ...item, type: forcedType } : item);
      if (seen.has(normalized.id)) return;
      seen.add(normalized.id);
      items.push(normalized);
    });
  });

  return items;
}

function normalizeChallenge(item) {
  if (!item) {
    return weeklyChallenge;
  }

  return {
    id: item.id || weeklyChallenge.id,
    title: item.title || weeklyChallenge.title,
    description: item.description || weeklyChallenge.description,
    current: Number(item.current || item.current_progress || 0),
    target: Number(item.target || item.target_progress || WEEKLY_CHALLENGE_TARGET),
    reward: Number(item.reward || item.reward_points || weeklyChallenge.reward),
    endsAt: item.endsAt || item.ends_at || weeklyChallenge.endsAt,
  };
}

function normalizeWeeklyChallengeStatus(data) {
  const source = data?.status || data?.challenge || data || {};
  const totalScan = Number(source.total_scan ?? source.totalScan ?? source.total_scans ?? source.scans_this_week ?? 0);

  return {
    totalScan: Number.isFinite(totalScan) ? totalScan : 0,
  };
}

function normalizeNotification(item, index = 0) {
  const createdAt = item.createdAt || item.created_at || item.timestamp || item.time || "Baru saja";

  return {
    id: item.id || item.notification_id || `${createdAt}-${index}`,
    title: item.title || item.type || "Notifikasi",
    message: item.message || item.body || item.text || item.content || "",
    createdAt,
    read: Boolean(item.read || item.is_read || item.read_at),
  };
}

function sortNotificationsByNewest(items) {
  return [...items].sort((first, second) => {
    const firstTime = new Date(first.createdAt).getTime();
    const secondTime = new Date(second.createdAt).getTime();

    if (Number.isNaN(firstTime) && Number.isNaN(secondTime)) return 0;
    if (Number.isNaN(firstTime)) return 1;
    if (Number.isNaN(secondTime)) return -1;
    return secondTime - firstTime;
  });
}

function normalizeTrivia(item) {
  return {
    id: item.id || item.title,
    title: item.title,
    text: item.text || item.summary || "",
    details: item.details || item.body || item.text || "",
    thumbnail: item.thumbnail || createSvgThumb(item.type || "organic"),
    alt: item.alt || `Ilustrasi ${item.title}`,
  };
}

function formatRelativeTime(value) {
  if (!value) {
    return "Baru saja";
  }

  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) {
    return "Baru saja";
  }

  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Kemarin";
  return `${diffDays} hari lalu`;
}


function translateText(value, language) {
  if (language === "en") {
    return textTranslations[value] || value;
  }

  return reverseTextTranslations[value] || value;
}

function translateRelativeTime(value, language) {
  if (typeof value === "string" && (/^\d{4}-\d{2}-\d{2}/.test(value) || value.includes("T"))) {
    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime())) {
      return translateRelativeTime(formatRelativeTime(value), language);
    }
  }

  const translated = translateText(value, language);
  if (translated !== value) return translated;
  if (language !== "en" || typeof value !== "string") return value;

  const patterns = [
    [/^(\d+)\s+menit lalu$/i, "minute"],
    [/^(\d+)\s+jam lalu$/i, "hour"],
    [/^(\d+)\s+hari lalu$/i, "day"],
  ];

  for (const [pattern, unit] of patterns) {
    const match = value.match(pattern);
    if (match) {
      const amount = Number(match[1]);
      return `${amount} ${unit}${amount === 1 ? "" : "s"} ago`;
    }
  }

  return value;
}

function translateCommunityMetric(count, singularId, pluralEn, language) {
  if (language !== "en") return `${count} ${singularId}`;
  return `${count} ${count === 1 ? translateText(singularId, language).replace(/s$/, "") : pluralEn}`;
}

function useDomTranslation(language) {
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach((node) => {
      const raw = node.nodeValue;
      const trimmed = raw.trim();
      if (!trimmed) return;
      const translated = translateText(trimmed, language);
      if (translated !== trimmed) {
        node.nodeValue = raw.replace(trimmed, translated);
      }
    });

    root.querySelectorAll("input[placeholder], textarea[placeholder], [aria-label]").forEach((element) => {
      if (element.placeholder) {
        element.placeholder = translateText(element.placeholder, language);
      }
      const label = element.getAttribute("aria-label");
      if (label) {
        element.setAttribute("aria-label", translateText(label, language));
      }
    });
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.readAsDataURL(file);
  });
}

function getErrorMessage(err, fallback) {
  return err instanceof Error ? err.message : fallback;
}


function BrandLogo() {
  return (
    <div className="brand-logo" aria-label="Logo Eco Scan" role="img">
      <img src="/ecoscan-logo-transparent.png" alt="EcoScan" />
      <strong>EcoScan</strong>
    </div>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2>{title}</h2>
          <button type="button" aria-label="Tutup" onClick={onClose}>
            <Icon name="x" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function ToastStack({ items }) {
  if (!items.length) return null;

  return (
    <div className="toast-stack" aria-live="polite">
      {items.map((item) => (
        <article className={`toast-card ${item.type}`} key={item.id}>
          <span className="toast-icon">
            <Icon name={item.type === "error" ? "x" : item.type === "warning" ? "spark" : "leaf"} />
          </span>
          <p>{item.message}</p>
        </article>
      ))}
    </div>
  );
}

function NotificationList({ items, language = "id" }) {
  if (!items.length) {
    return <div className="status-card empty-card">{translateText("Belum ada notifikasi.", language)}</div>;
  }

  return (
    <div className="notification-list">
      {items.map((item) => (
        <article className={`notification-item ${item.read ? "" : "unread"}`} key={item.id}>
          <Icon name="bell" />
          <div>
            <strong>{translateText(item.title, language)}</strong>
            <p>{translateText(item.message, language)}</p>
            <span>{translateRelativeTime(item.createdAt, language)}</span>
          </div>
          {!item.read && <small>{translateText("Belum dibaca", language)}</small>}
        </article>
      ))}
    </div>
  );
}

function BottomNavigation({ activePage, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {navItems.map((item) => (
        <button
          className={`${activePage === item.id ? "active" : ""} ${
            item.id === "scan" ? "scan-nav" : ""
          }`}
          type="button"
          key={item.id}
          onClick={() => onNavigate(item.id)}
        >
          <Icon name={item.icon} />
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function TopBar({
  title,
  subtitle,
  compact = false,
  user = null,
  isLightTheme = true,
  language = "id",
  notifications = [],
  onNavigate = null,
  onLogout = null,
  onNotificationsClose = null,
  onThemeToggle = null,
}) {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleAccountClick = (page) => {
    setIsAccountMenuOpen(false);
    onNavigate?.(page);
  };

  const handleCloseNotifications = () => {
    setIsNotificationOpen(false);
    onNotificationsClose?.();
  };

  return (
    <header className={`top-bar ${compact ? "compact" : ""}`}>
      <div>
        <h1>{translateText(title, language)}</h1>
        {subtitle && <p>{translateText(subtitle, language)}</p>}
      </div>
      <div className="top-actions">
        <button type="button" aria-label="Notifikasi" onClick={() => setIsNotificationOpen(true)}>
          <Icon name="bell" />
        </button>
        {onThemeToggle && (
          <button className="theme-toggle" type="button" aria-label="Ganti tema" onClick={() => onThemeToggle((value) => !value)}>
            <Icon name={isLightTheme ? "moon" : "sun"} />
          </button>
        )}
        <div className="avatar-menu">
          <button
            className="avatar-button"
            type="button"
            aria-label="Akun"
            aria-expanded={isAccountMenuOpen}
            onClick={() => setIsAccountMenuOpen((value) => !value)}
          >
            <UserAvatar name={user?.name} src={user?.avatar_url} />
          </button>
          {isAccountMenuOpen && (
            <div className="account-menu">
              <button type="button" onClick={() => handleAccountClick("profile")}>
                <Icon name="user" />
                {translateText("Akun", language)}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  onLogout?.();
                }}
              >
                <Icon name="logout" />
                {translateText("Logout", language)}
              </button>
            </div>
          )}
        </div>
      </div>
      {isNotificationOpen && (
        <Modal title={translateText("Notifikasi", language)} onClose={handleCloseNotifications}>
          <NotificationList items={notifications} language={language} />
        </Modal>
      )}
    </header>
  );
}

function StatBlock({ value, label }) {
  return (
    <div className="stat-block">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function QuickAction({ icon, label, onClick }) {
  return (
    <button className="quick-action" type="button" onClick={onClick}>
      <span>
        <Icon name={icon} />
      </span>
      {label}
    </button>
  );
}

function Icon({ name }) {
  const common = {
    className: "icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="m3 10.5 9-7 9 7" />
          <path d="M5 10v10h14V10" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );
    case "history":
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "chevron-left":
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "scanner":
      return (
        <svg {...common}>
          <path d="M7 3H5a2 2 0 0 0-2 2v2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
          <path d="M8 8h8v8H8z" />
          <path d="M11 11h2v2h-2z" />
        </svg>
      );
    case "people":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
          <circle cx="12" cy="8" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
          <path d="M16 4.1a4 4 0 0 1 0 7.8" />
          <path d="M2 21v-2a4 4 0 0 1 3-3.9" />
          <path d="M8 4.1a4 4 0 0 0 0 7.8" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M14 4h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-4" />
        </svg>
      );
    case "flashlight":
      return (
        <svg {...common}>
          <path d="M9 2h6" />
          <path d="M10 2v5l-2 3v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V10l-2-3V2" />
          <path d="M10 10h4" />
          <path d="M12 14v4" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path d="M14.5 5 13 3H9L7.5 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case "gallery":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8" cy="10" r="1.5" />
          <path d="m21 16-5-5L5 19" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "eye-off":
      return (
        <svg {...common}>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.5 5.4A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a13.6 13.6 0 0 1-2.1 3.1" />
          <path d="M6.6 6.6C3.7 8.5 2 12 2 12s3.5 7 10 7a9.5 9.5 0 0 0 4.1-.9" />
        </svg>
      );
    case "sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.9 4.9 1.4 1.4" />
          <path d="m17.7 17.7 1.4 1.4" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m4.9 19.1 1.4-1.4" />
          <path d="m17.7 6.3 1.4-1.4" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5z" />
        </svg>
      );
    case "rotate":
      return (
        <svg {...common}>
          <path d="M21 12a9 9 0 0 1-15.5 6.2" />
          <path d="M3 12A9 9 0 0 1 18.5 5.8" />
          <path d="M18 2v4h-4" />
          <path d="M6 22v-4h4" />
        </svg>
      );
    case "switch-camera":
      return <SwitchCamera {...common} />;
    case "loader":
      return (
        <svg {...common}>
          <path d="M21 12a9 9 0 1 1-6.2-8.6" />
        </svg>
      );
    case "recycle":
      return (
        <svg {...common}>
          <path d="m7 19-2-3 2-3" />
          <path d="M5 16h8a4 4 0 0 0 3.4-6.1" />
          <path d="m17 5 2 3-2 3" />
          <path d="M19 8h-8a4 4 0 0 0-3.4 6.1" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 2v5" />
          <path d="M12 17v5" />
          <path d="m4.9 4.9 3.5 3.5" />
          <path d="m15.6 15.6 3.5 3.5" />
          <path d="M2 12h5" />
          <path d="M17 12h5" />
          <path d="m4.9 19.1 3.5-3.5" />
          <path d="m15.6 8.4 3.5-3.5" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path d="M4 20c8-2 14-8 16-16-8 1-14 4-17 10 0 3 1 5 1 6z" />
          <path d="M4 20c3-5 7-8 12-10" />
        </svg>
      );
    default:
      return null;
  }
}

function UserAvatar({ className = "", name = "E", src = "" }) {
  const initial = (name || "E").charAt(0).toUpperCase();
  return (
    <span className={`avatar ${src ? "has-photo" : ""} ${className}`}>
      {src ? <img src={src} alt={`Foto profil ${name}`} /> : initial}
    </span>
  );
}



function LoginPage({ isLightTheme, onAuthenticate, onThemeToggle }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");
    setIsSubmitting(true);

    if (isRegister && password !== confirmPassword) {
      setAuthError("Konfirmasi password belum sama.");
      setIsSubmitting(false);
      return;
    }

    try {
      await onAuthenticate({ email, name, password, mode });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Autentikasi gagal.";
      setAuthError(message === "Failed to fetch" ? `Gagal terhubung ke ${API_BASE_URL}.` : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(isRegister ? "login" : "register");
    setAuthError("");
    setConfirmPassword("");
  };

  return (
    <main className={`auth-page ${isLightTheme ? "light-theme" : "dark-theme"}`}>
      <section className="auth-card">
        <button className="auth-theme-toggle" type="button" aria-label="Ganti tema" onClick={() => onThemeToggle((value) => !value)}>
          <Icon name={isLightTheme ? "moon" : "sun"} />
        </button>
        <BrandLogo />
        <p>{isRegister ? "Buat akun EcoScan dan mulai catat aksi hijaumu." : "Ayo mulai langkah kecilmu untuk Bumi."}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="input-group">
              <Icon name="user" />
              <input
                type="text"
                placeholder="Nama"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
          )}
          <label className="input-group">
            <Icon name="mail" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="input-group">
            <Icon name="lock" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              onClick={() => setShowPassword((value) => !value)}
            >
              <Icon name={showPassword ? "eye" : "eye-off"} />
            </button>
          </label>

          {isRegister && (
            <label className="input-group">
              <Icon name="lock" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Konfirmasi Password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                onClick={() => setShowConfirmPassword((value) => !value)}
              >
                <Icon name={showConfirmPassword ? "eye" : "eye-off"} />
              </button>
            </label>
          )}

          {authError && <div className="status-card error-card auth-error">{authError}</div>}

          <button className="primary-action" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : isRegister ? "Daftar" : "Masuk"}
          </button>
        </form>

        <p className="signup-copy">
          {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button type="button" onClick={switchMode}>
            {isRegister ? "Masuk" : "Daftar"}
          </button>
        </p>
      </section>
    </main>
  );
}



function HomePage({ isLightTheme, language, notifications, onLogout, onNavigate, onNotificationsClose, onThemeToggle, stats, triviaItems, user }) {
  const firstName = user?.name?.split(" ")[0] || "Eco Warrior";
  const [selectedTrivia, setSelectedTrivia] = useState(null);
  const selectedTriviaTitle = selectedTrivia ? translateText(selectedTrivia.title, language) : "";
  const selectedTriviaDetails = selectedTrivia ? translateText(selectedTrivia.details, language) : "";

  return (
    <section className="page-content">
      <TopBar
        title={`Halo, ${firstName}!`}
        subtitle="Selamat datang kembali"
        user={user}
        isLightTheme={isLightTheme}
        language={language}
        notifications={notifications}
        onLogout={onLogout}
        onNavigate={onNavigate}
        onNotificationsClose={onNotificationsClose}
        onThemeToggle={onThemeToggle}
      />

      <section className="hero-card">
        <p>Selamat Datang di Eco Scan</p>
        <div className="hero-stats">
          <StatBlock value={stats.total_scans} label="Total Scan" />
          <StatBlock value={stats.points} label="Poin Eco" />
          <StatBlock value={stats.streak} label="Hari Streak" />
        </div>
      </section>

      <section className="model-card">
        <div className="model-card-head">
          <span>
            <Icon name="spark" />
          </span>
          <div>
            <small>MODEL AI</small>
            <h2>MobileNetV2 Transfer Learning</h2>
          </div>
        </div>
        <div className="model-metrics">
          <div>
            <small>AKURASI</small>
            <strong>93%</strong>
            <p className="model-class-list">Organik &bull; Anorganik &bull; B3 &bull; Kertas &bull; Residu</p>
          </div>
          <div>
            <small>Kenapa Model Ini?</small>
            <p>
              Ringan untuk aplikasi web, cepat membaca gambar, dan cukup stabil membedakan pola visual sampah agar
              hasil scan bisa langsung dipakai untuk memilah dengan tepat.
            </p>
          </div>
        </div>
      </section>

      <button className="scan-cta" type="button" onClick={() => onNavigate("scan")}>
        <Icon name="scanner" /> Mulai Scan Sampah
      </button>

      <section className="section-block">
        <div className="section-title">
          <h2>Aksi Cepat</h2>
        </div>
        <div className="quick-grid">
          <QuickAction icon="scanner" label="Scan" onClick={() => onNavigate("scan")} />
          <QuickAction icon="history" label="Riwayat" onClick={() => onNavigate("history")} />
          <QuickAction icon="people" label="Komunitas" onClick={() => onNavigate("community")} />
          <QuickAction icon="user" label="Akun" onClick={() => onNavigate("profile")} />
        </div>
      </section>

      <section className="section-block">
        <div className="section-title">
          <h2>Eco Trivia</h2>
        </div>
        <div className="trivia-grid">
          {triviaItems.map((card) => (
            <button className="trivia-card" key={card.id || card.title} type="button" onClick={() => setSelectedTrivia(card)}>
              <img className="trivia-thumb" src={card.thumbnail} alt={card.alt} />
              <div>
                <span>{card.title}</span>
                <strong>{card.text}</strong>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="education-stack" aria-label="Panduan edukasi sampah">
        {educationCards.map((item) => (
          <article className="education-card" key={item.title}>
            <span>
              <Icon name={item.icon} />
            </span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </section>

      {selectedTrivia && (
        <Modal title={selectedTriviaTitle} onClose={() => setSelectedTrivia(null)}>
          <img className="modal-media" src={selectedTrivia.thumbnail} alt={selectedTrivia.alt} />
          <p className="modal-copy">{selectedTriviaDetails}</p>
        </Modal>
      )}
    </section>
  );
}



function HistoryPage({ historyError, historyItems, isLightTheme, language, notifications, onLogout, onNavigate, onNotificationsClose, onRefresh, onThemeToggle, user }) {
  return (
    <section className="page-content">
      <TopBar
        title="Riwayat"
        subtitle="Aktivitas scan terbaru"
        user={user}
        isLightTheme={isLightTheme}
        language={language}
        notifications={notifications}
        onLogout={onLogout}
        onNavigate={onNavigate}
        onNotificationsClose={onNotificationsClose}
        onThemeToggle={onThemeToggle}
      />
      {historyError && (
        <div className="status-card error-card">
          {historyError}
          <button className="inline-action" type="button" onClick={onRefresh}>
            Muat ulang
          </button>
        </div>
      )}
      <HistoryList items={historyItems} language={language} />
    </section>
  );
}

function HistoryList({ items, language = "id" }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / HISTORY_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = items.slice((currentPage - 1) * HISTORY_PAGE_SIZE, currentPage * HISTORY_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  if (items.length === 0) {
    return <div className="status-card empty-card">Belum ada riwayat scan.</div>;
  }

  return (
    <>
      <div className="history-list">
        {visibleItems.map((item) => (
          <article className="history-item" key={item.id || `${item.name}-${item.time}`}>
            <div className="history-copy">
              <strong>{translateText(item.name, language)}</strong>
              <span>{translateRelativeTime(item.time, language)}</span>
            </div>
            <div className="history-meta">
              <span className={`category-badge ${categoryMeta[item.category]?.tone || "green"}`}>
                {translateText(item.category, language)}
              </span>
              <small>{item.confidence}%</small>
            </div>
          </article>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="history-pagination">
          <button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            <Icon name="chevron-left" />
          </button>
          <span>
            <strong>{currentPage}</strong>
            <small>/ {totalPages}</small>
          </span>
          <button type="button" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
            <Icon name="chevron-right" />
          </button>
        </div>
      )}
    </>
  );
}



function ScanPage({
  cameraFacing,
  cameraStream,
  confidenceValue,
  error,
  isLoading,
  isLightTheme,
  language = "id",
  onImageChange,
  onPrimaryScan,
  onReset,
  onSwitchCamera,
  notifications,
  onLogout,
  onNavigate,
  onNotificationsClose,
  onThemeToggle,
  prediction,
  predictionTone,
  previewUrl,
  scanMode,
  selectedFile,
  setScanMode,
  user,
  videoRef,
}) {
  const uploadInputRef = useRef(null);
  const resultCategory = prediction?.category || prediction?.predicted_class;
  const specificClass = prediction?.specific_class || prediction?.predicted_class;
  const advice =
    prediction?.handling_advice ||
    categoryMeta[resultCategory]?.advice ||
    "Ikuti panduan pemilahan lokal dan simpan hasilnya ke riwayat.";
  const guideSteps = processingGuides[resultCategory] || [];

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => null);
    }
  }, [cameraStream, videoRef]);

  return (
    <section className="page-content scan-page">
      <TopBar
        title={prediction ? "Hasil Scan" : "Scan Sampah"}
        compact
        user={user}
        isLightTheme={isLightTheme}
        language={language}
        notifications={notifications}
        onLogout={onLogout}
        onNavigate={onNavigate}
        onNotificationsClose={onNotificationsClose}
        onThemeToggle={onThemeToggle}
      />

      <div className="segmented-control">
        <button
          className={scanMode === "camera" ? "active" : ""}
          type="button"
          onClick={() => setScanMode("camera")}
        >
          Kamera
        </button>
        <button
          className={scanMode === "upload" ? "active" : ""}
          type="button"
          onClick={() => setScanMode("upload")}
        >
          Upload
        </button>
      </div>

      <label className={`scanner-frame ${previewUrl ? "has-preview" : ""}`}>
        {cameraStream && scanMode === "camera" && !previewUrl ? (
          <>
            <video ref={videoRef} playsInline muted />
            <button className="camera-switch-button" type="button" aria-label="Balik kamera" onClick={onSwitchCamera}>
              <Icon name="switch-camera" />
            </button>
          </>
        ) : previewUrl ? (
          <img src={previewUrl} alt="Preview sampah" />
        ) : (
          <div className="scanner-empty">
            <Icon name="scanner" />
            <strong>Pindai Sampah</strong>
            <small>
              {scanMode === "camera"
                ? "Ambil foto sampah langsung dari kamera."
                : "Pilih gambar sampah dari galeri."}
            </small>
          </div>
        )}
        <i className="corner top-left" />
        <i className="corner top-right" />
        <i className="corner bottom-left" />
        <i className="corner bottom-right" />
      </label>

      <p className="scan-helper">
        {selectedFile
          ? selectedFile.name
          : scanMode === "camera"
            ? "Arahkan kamera ke sampah, lalu tekan tombol scan."
            : "Unggah gambar sampah dari galeri untuk mulai scan."}
      </p>

      <div className="scan-actions" aria-label="Kontrol kamera">
        <input
          ref={uploadInputRef}
          className="camera-capture-input"
          accept="image/*"
          type="file"
          onChange={onImageChange}
        />
        <button className={`round-tool scan-status-tool ${prediction ? "detected" : "waiting"}`} type="button" aria-label="Status scan">
          {prediction ? <Icon name={categoryMeta[resultCategory]?.icon || "recycle"} /> : <span className="waiting-dots"><i /><i /><i /></span>}
        </button>
        <button
          className="capture-button"
          type="button"
          onClick={() => onPrimaryScan(uploadInputRef)}
          disabled={isLoading}
          aria-label="Mulai scan"
        >
          <Icon name={isLoading ? "loader" : "scanner"} />
        </button>
        <button className="round-tool" type="button" aria-label="Reset scan" onClick={onReset}>
          <Icon name="rotate" />
        </button>
      </div>

      {error && <div className="status-card error-card">{error}</div>}

      {prediction && (
        <section className="result-sheet">
          <div className="result-head">
            <span className={`category-badge ${predictionTone}`}>
              {resultCategory}
            </span>
            <strong>{confidenceValue.toFixed(2)}%</strong>
          </div>
          <div className="confidence-track">
            <span style={{ width: `${confidenceValue}%` }} />
          </div>
          <dl className="result-detail">
            <div>
              <dt>Label AI</dt>
              <dd>{specificClass}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>{confidenceValue.toFixed(2)}%</dd>
            </div>
          </dl>
          <div className="advice-box">
            <strong>Cara Pengolahan</strong>
            <p>{advice}</p>
          </div>
          {guideSteps.length > 0 && (
            <div className="processing-guide">
              <strong>Langkah Pengolahan</strong>
              <ol>
                {guideSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          )}
          <div className="result-actions">
            <button className="primary-action" type="button" disabled>
              Tersimpan di Riwayat
            </button>
            <button className="secondary-action" type="button" onClick={onReset}>
              Scan Ulang
            </button>
          </div>
        </section>
      )}
    </section>
  );
}



function CommunityPage({ challenge, isLightTheme, items, language, leaderboard, notifications, onAddComment, onCreatePost, onLogout, onNavigate, onNotificationsClose, onThemeToggle, onToggleLike, user }) {
  const [activeTab, setActiveTab] = useState("feed");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const normalizedSearch = debouncedSearchTerm.trim().toLowerCase();
  const visibleSearchItems = searchError && normalizedSearch ? items : searchResults;
  const sourceItems = normalizedSearch ? visibleSearchItems : items;
  const selectedPostData = selectedPost ? sourceItems.find((item) => item.id === selectedPost.id) || items.find((item) => item.id === selectedPost.id) || selectedPost : null;
  const locallyFilteredItems = sourceItems.filter((item) => {
    if (!normalizedSearch) return true;
    return [item.title, item.body, item.author, item.tag, item.badge]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch));
  });
  const filteredItems = normalizedSearch && !searchError ? sourceItems : locallyFilteredItems;
  const feedItems = filteredItems.filter((item) => item.type !== "tip");
  const tipItems = filteredItems.filter((item) => item.type === "tip");
  const filteredLeaderboard = leaderboard.filter((item) => {
    if (!normalizedSearch) return true;
    return [item.name, item.rank, item.scans, item.points]
      .filter((value) => value !== undefined && value !== null)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 500);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setSearchResults([]);
      setSearchError("");
      setIsSearching(false);
      return undefined;
    }

    const controller = new AbortController();
    const search = async () => {
      setIsSearching(true);
      setSearchError("");

      try {
        const url = new URL(COMMUNITY_SEARCH_URL);
        url.searchParams.set("q", debouncedSearchTerm);
        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.detail || "Pencarian gagal.");
        }

        setSearchResults(normalizeSearchItems(data));
      } catch (err) {
        if (err?.name === "AbortError") return;
        setSearchResults([]);
        setSearchError("Pencarian gagal. Menampilkan hasil lokal.");
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    };

    search();

    return () => controller.abort();
  }, [debouncedSearchTerm]);

  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSearchResults([]);
    setSearchError("");
    setIsSearching(false);
  };

  const handleTogglePostLike = (postId) => {
    setSearchResults((results) =>
      results.map((item) =>
        item.id === postId
          ? { ...item, isLiked: !item.isLiked, likes: Math.max(0, item.likes + (item.isLiked ? -1 : 1)) }
          : item
      )
    );
    onToggleLike(postId);
  };

  return (
    <section className="page-content">
      <TopBar
        title="Komunitas"
        subtitle="Belajar dan bergerak bersama"
        user={user}
        isLightTheme={isLightTheme}
        language={language}
        notifications={notifications}
        onLogout={onLogout}
        onNavigate={onNavigate}
        onNotificationsClose={onNotificationsClose}
        onThemeToggle={onThemeToggle}
      />

      <label className="search-box">
        <Icon name="search" />
        <input
          type="search"
          placeholder={translateText("Cari tips, pengguna, atau topik...", language)}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        {searchTerm && (
          <button
            aria-label={translateText("Hapus pencarian", language)}
            className="search-clear"
            type="button"
            onClick={handleClearSearch}
          >
            <Icon name="x" />
          </button>
        )}
      </label>

      <div className="tabs">
        <button
          className={activeTab === "feed" ? "active" : ""}
          type="button"
          onClick={() => setActiveTab("feed")}
        >
          Feed
        </button>
        <button
          className={activeTab === "tips" ? "active" : ""}
          type="button"
          onClick={() => setActiveTab("tips")}
        >
          Tips
        </button>
        <button
          className={activeTab === "leaderboard" ? "active" : ""}
          type="button"
          onClick={() => setActiveTab("leaderboard")}
        >
          Leaderboard
        </button>
      </div>

      {isSearching && <div className="status-card">{translateText("Sedang mencari...", language)}</div>}
      {searchError && normalizedSearch && <div className="status-card error-card">{translateText(searchError, language)}</div>}

      {activeTab === "feed" && (
        <CommunityFeed
          items={feedItems}
          language={language}
          onCreatePost={onCreatePost}
          onOpenPost={setSelectedPost}
          onToggleLike={handleTogglePostLike}
          user={user}
        />
      )}
      {activeTab === "tips" && (
        <CommunityTips items={tipItems} language={language} onOpenPost={setSelectedPost} onToggleLike={handleTogglePostLike} />
      )}
      {activeTab === "leaderboard" && <CommunityLeaderboard items={filteredLeaderboard} language={language} />}

      {selectedPostData && (
        <PostDetailModal
          language={language}
          onAddComment={onAddComment}
          onClose={() => setSelectedPost(null)}
          onToggleLike={handleTogglePostLike}
          post={selectedPostData}
        />
      )}
    </section>
  );
}

function CommunityFeed({ items, language = "id", onCreatePost, onOpenPost, onToggleLike, user }) {
  return (
    <>
      <WeeklyChallengeStreak userId={user?.id} />

      <CreatePostForm language={language} onCreatePost={onCreatePost} />

      <section className="post-list">
        {items.length === 0 && <div className="status-card empty-card">{translateText("Belum ada postingan yang cocok.", language)}</div>}
        {items.map((post) => (
          <PostCard key={post.id} language={language} onOpenPost={onOpenPost} onToggleLike={onToggleLike} post={post} />
        ))}
      </section>
    </>
  );
}

function CreatePostForm({ language = "id", onCreatePost }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onCreatePost({ title: title.trim(), body: body.trim() });
    setTitle("");
    setBody("");
  };

  return (
    <form className="create-post-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={translateText("Judul tips atau cerita", language)}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <textarea
        placeholder={translateText("Bagikan pengalaman, tips, atau info komunitas...", language)}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows="3"
      />
      <button className="primary-action" type="submit">
        {translateText("Buat Post", language)}
      </button>
    </form>
  );
}

function PostCard({ post, language = "id", onOpenPost, onToggleLike }) {
  return (
    <article className="post-card">
      <button className="post-main" type="button" onClick={() => onOpenPost(post)}>
        <div className="post-author">
          <div className="avatar small">{post.author[0]}</div>
          <div>
            <strong>{post.author}</strong>
            <span>
              {translateText(post.badge, language)} · {translateRelativeTime(post.createdAt, language)}
            </span>
          </div>
        </div>
        {post.tag && <span className="tip-tag">{translateText(post.tag, language)}</span>}
        <h3>{translateText(post.title, language)}</h3>
        <p>{translateText(post.body, language)}</p>
      </button>
      <div className="post-actions">
        <span>
          {translateCommunityMetric(post.likes, "suka", "likes", language)} · {translateCommunityMetric(post.comments.length, "komentar", "comments", language)}
        </span>
        <button type="button" onClick={() => onToggleLike(post.id)}>
          {translateText(post.isLiked ? "Disukai" : "Like", language)}
        </button>
      </div>
    </article>
  );
}

function CommunityTips({ items, language = "id", onOpenPost, onToggleLike }) {
  return (
    <section className="tips-list">
      {items.length === 0 && <div className="status-card empty-card">{translateText("Tips tidak ditemukan.", language)}</div>}
      {items.map((tip) => (
        <PostCard key={tip.id} language={language} onOpenPost={onOpenPost} onToggleLike={onToggleLike} post={tip} />
      ))}
    </section>
  );
}

function CommunityLeaderboard({ items, language = "id" }) {
  return (
    <section className="leaderboard-list">
      {items.map((item, index) => (
        <article className="leaderboard-item" key={item.id || item.name}>
          <strong className="rank-number">{item.rank || index + 1}</strong>
          <UserAvatar className="small" name={item.name} src={item.avatar_url} />
          <div>
            <h3>{item.name}</h3>
            <p>
              <span>{translateText(item.level_title || "Eco Starter", language)}</span>
              <small>{item.scans} {translateText("total scan", language)}</small>
            </p>
          </div>
          <strong>{item.points}</strong>
        </article>
      ))}
    </section>
  );
}

function PostDetailModal({ post, language = "id", onAddComment, onClose, onToggleLike }) {
  const [commentBody, setCommentBody] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!commentBody.trim()) return;
    onAddComment(post.id, commentBody.trim(), replyTo);
    setCommentBody("");
    setReplyTo(null);
  };

  return (
    <Modal title={translateText(post.title, language)} onClose={onClose}>
      <div className="post-author modal-author">
        <div className="avatar small">{post.author[0]}</div>
        <div>
          <strong>{post.author}</strong>
          <span>
            {translateText(post.badge, language)} · {translateRelativeTime(post.createdAt, language)}
          </span>
        </div>
      </div>
      <p className="modal-copy">{translateText(post.body, language)}</p>
      <div className="detail-actions">
        <button type="button" onClick={() => onToggleLike(post.id)}>
          {translateText(post.isLiked ? "Disukai" : "Like", language)} · {post.likes}
        </button>
        <span>{translateCommunityMetric(post.comments.length, "komentar", "comments", language)}</span>
      </div>

      <section className="comment-section">
        <h3>{translateText("Komentar", language)}</h3>
        <CommentList comments={post.comments} language={language} onReply={setReplyTo} />
        <form className="comment-form" onSubmit={handleSubmit}>
          {replyTo && (
            <button className="reply-context" type="button" onClick={() => setReplyTo(null)}>
              {translateText("Batalkan balasan", language)}
            </button>
          )}
          <textarea
            placeholder={translateText(replyTo ? "Tulis balasan..." : "Tulis komentar...", language)}
            value={commentBody}
            onChange={(event) => setCommentBody(event.target.value)}
            rows="3"
          />
          <button className="primary-action" type="submit">
            {translateText("Kirim", language)}
          </button>
        </form>
      </section>
    </Modal>
  );
}

function CommentList({ comments, language = "id", onReply }) {
  if (!comments.length) {
    return <p className="empty-copy">{translateText("Belum ada komentar.", language)}</p>;
  }

  return (
    <div className="comment-list">
      {comments.map((comment) => (
        <article className="comment-item" key={comment.id}>
          <div>
            <strong>{comment.author}</strong>
            <span>{translateRelativeTime(comment.createdAt, language)}</span>
          </div>
          <p>{translateText(comment.body, language)}</p>
          <button type="button" onClick={() => onReply(comment.id)}>
            {translateText("Balas", language)}
          </button>
          {(comment.replies || []).length > 0 && (
            <div className="reply-list">
              {comment.replies.map((reply) => (
                <article className="comment-item" key={reply.id}>
                  <div>
                    <strong>{reply.author}</strong>
                    <span>{translateRelativeTime(reply.createdAt, language)}</span>
                  </div>
                  <p>{translateText(reply.body, language)}</p>
                </article>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}



function ProfilePage({
  historyItems,
  isLightTheme,
  language,
  notifications,
  onChangePassword,
  onLanguageChange,
  onLogout,
  onNavigate,
  onNotificationsClose,
  onPhotoUpdate,
  onThemeToggle,
  onUpdateUser,
  stats,
  user,
}) {
  const displayName = user?.name || "Eco Warrior";
  const displayEmail = user?.email || "user@ecoscan.local";
  const [activePanel, setActivePanel] = useState(null);
  const unreadNotificationCount = notifications.filter((item) => !item.read).length;

  const handleCloseNotifications = () => {
    setActivePanel(null);
    onNotificationsClose?.();
  };

  return (
    <section className="page-content profile-page">
      <TopBar
        title="Akun"
        compact
        user={user}
        isLightTheme={isLightTheme}
        language={language}
        notifications={notifications}
        onLogout={onLogout}
        onNavigate={onNavigate}
        onNotificationsClose={onNotificationsClose}
        onThemeToggle={onThemeToggle}
      />

      <section className="profile-card">
        <div className="profile-avatar-wrap">
          <UserAvatar className="large" name={displayName} src={user?.avatar_url} />
          <button className="avatar-camera-button" type="button" aria-label="Ganti foto profil" onClick={() => setActivePanel("photo")}>
            <Icon name="camera" />
          </button>
        </div>
        <h1>{displayName}</h1>
        <p>{displayEmail}</p>
        <span className="profile-level">{translateText(stats.level_title, language)}</span>
      </section>

      <div className="profile-stats">
        <StatBlock value={stats.total_scans} label="Total Scan" />
        <StatBlock value={stats.points} label="Poin" />
        <StatBlock value={stats.streak} label="Streak" />
      </div>

      <section className="section-block">
        <div className="section-title">
          <h2>{translateText("Riwayat Scan", language)}</h2>
        </div>
        <HistoryList items={historyItems} language={language} />
      </section>

      <section className="settings-list">
        <button type="button" onClick={() => setActivePanel("edit")}>
          <span>{translateText("Edit Profil", language)}</span>
          <ChevronRight className="settings-chevron" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => setActivePanel("password")}>
          <span>{translateText("Ganti Password", language)}</span>
          <ChevronRight className="settings-chevron" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => setActivePanel("notifications")}>
          <span>{translateText("Notifikasi", language)}</span>
          <strong>{unreadNotificationCount}</strong>
        </button>
        <button type="button" onClick={() => setActivePanel("language")}>
          <span>{language === "en" ? "English" : "Bahasa Indonesia"}</span>
          <strong>{translateText("Aktif", language)}</strong>
        </button>
        <button type="button" onClick={() => setActivePanel("help")}>
          <span>{translateText("Bantuan", language)}</span>
          <ChevronRight className="settings-chevron" aria-hidden="true" />
        </button>
        <button className="logout-button" type="button" onClick={onLogout}>
          {translateText("Logout", language)}
        </button>
      </section>

      {activePanel === "edit" && (
        <EditProfileModal
          language={language}
          onClose={() => setActivePanel(null)}
          onSubmit={(updates) => {
            onUpdateUser(updates);
            setActivePanel(null);
          }}
          user={user}
        />
      )}
      {activePanel === "password" && (
        <ChangePasswordModal
          language={language}
          onClose={() => setActivePanel(null)}
          onSubmit={async (payload) => {
            await onChangePassword(payload);
            setActivePanel(null);
          }}
        />
      )}
      {activePanel === "photo" && (
        <ProfilePhotoModal
          language={language}
          onClose={() => setActivePanel(null)}
          onSubmit={async (avatarUrl) => {
            await onPhotoUpdate(avatarUrl);
            setActivePanel(null);
          }}
          user={user}
        />
      )}
      {activePanel === "notifications" && (
        <Modal title={translateText("Notifikasi", language)} onClose={handleCloseNotifications}>
          <NotificationList items={notifications} language={language} />
        </Modal>
      )}
      {activePanel === "language" && (
        <Modal title={translateText("Bahasa", language)} onClose={() => setActivePanel(null)}>
          <div className="option-list">
            <button
              className={language === "id" ? "active" : ""}
              type="button"
              onClick={() => {
                onLanguageChange("id");
                setActivePanel(null);
              }}
            >
              {translateText("Bahasa Indonesia", language)}
            </button>
            <button
              className={language === "en" ? "active" : ""}
              type="button"
              onClick={() => {
                onLanguageChange("en");
                setActivePanel(null);
              }}
            >
              English
            </button>
          </div>
        </Modal>
      )}
      {activePanel === "help" && (
        <Modal title={translateText("Pusat Bantuan", language)} onClose={() => setActivePanel(null)}>
          <div className="faq-list">
            <article>
              <h3>{translateText("Bagaimana cara scan sampah?", language)}</h3>
              <p>{translateText("Buka menu Scan, unggah gambar atau ambil foto, lalu tunggu hasil klasifikasi AI.", language)}</p>
            </article>
            <article>
              <h3>{translateText("Kenapa hasil scan tidak tersimpan?", language)}</h3>
              <p>{translateText("Jika hasil scan belum tersimpan, coba periksa koneksi internet lalu ulangi proses scan.", language)}</p>
            </article>
            <article>
              <h3>{translateText("Kontak bantuan", language)}</h3>
              <p>{translateText("Kirim laporan ke support@ecoscan.my.id dengan screenshot masalah yang kamu temui.", language)}</p>
            </article>
          </div>
        </Modal>
      )}
    </section>
  );
}

function EditProfileModal({ language = "id", onClose, onSubmit, user }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ name: name.trim(), email: email.trim() });
  };

  return (
    <Modal title={translateText("Edit Profil", language)} onClose={onClose}>
      <form className="profile-form" onSubmit={handleSubmit}>
        <label>
          {translateText("Nama", language)}
          <input type="text" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          {translateText("Email", language)}
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <button className="primary-action" type="submit">
          {translateText("Simpan", language)}
        </button>
      </form>
    </Modal>
  );
}

function PasswordField({ label, language = "id", value, onChange }) {
  const [isVisible, setIsVisible] = useState(false);
  const translatedLabel = translateText(label, language);
  const visibilityLabel = translateText(isVisible ? "Sembunyikan password" : "Tampilkan password", language);

  return (
    <label>
      {translatedLabel}
      <span className="password-field">
        <Icon name="lock" />
        <input
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          minLength={6}
          required
          placeholder={translatedLabel}
        />
        <button type="button" aria-label={visibilityLabel} onClick={() => setIsVisible((value) => !value)}>
          <Icon name={isVisible ? "eye" : "eye-off"} />
        </button>
      </span>
    </label>
  );
}

function ChangePasswordModal({ language = "id", onClose, onSubmit }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (newPassword !== confirmPassword) {
      setFormError("Konfirmasi password baru belum sama.");
      return;
    }

    await onSubmit({
      current_password: currentPassword,
      new_password: newPassword,
    });
  };

  return (
    <Modal title={translateText("Ganti Password", language)} onClose={onClose}>
      <form className="profile-form" onSubmit={handleSubmit}>
        <PasswordField label="Password Lama" language={language} value={currentPassword} onChange={setCurrentPassword} />
        <PasswordField label="Password Baru" language={language} value={newPassword} onChange={setNewPassword} />
        <PasswordField label="Konfirmasi Password Baru" language={language} value={confirmPassword} onChange={setConfirmPassword} />
        {formError && <div className="status-card error-card auth-error">{translateText(formError, language)}</div>}
        <button className="primary-action" type="submit">
          {translateText("Simpan", language)}
        </button>
      </form>
    </Modal>
  );
}

function ProfilePhotoModal({ language = "id", onClose, onSubmit, user }) {
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState(user?.avatar_url || "");
  const [error, setError] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    setError("");

    if (!file) {
      event.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("File yang dipilih harus berupa gambar.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setError("Foto profil maksimal 2MB.");
      event.target.value = "";
      return;
    }

    setFileName(file.name);
    setPreviewUrl(await fileToDataUrl(file));
    event.target.value = "";
  };

  return (
    <Modal title={translateText("Ganti Foto Profil", language)} onClose={onClose}>
      <form className="profile-form" onSubmit={(event) => {
        event.preventDefault();
        onSubmit(previewUrl);
      }}>
        <div className="photo-preview">
          <UserAvatar className="large" name={user?.name} src={previewUrl} />
          <p>{translateText("Foto profil maksimal 2MB", language)}</p>
        </div>
        <label className="photo-picker">
          <span>{translateText("Pilih Foto", language)}</span>
          <span className="photo-picker-control">
            <span className="photo-picker-button">
              <Icon name="camera" />
              {translateText("Pilih Foto", language)}
            </span>
            <span className="photo-file-name">{fileName || translateText("Belum ada file dipilih", language)}</span>
          </span>
          <input accept="image/*" type="file" onChange={handleFileChange} />
        </label>
        {error && <div className="status-card error-card auth-error">{translateText(error, language)}</div>}
        <div className="photo-actions">
          <button className="primary-action" type="submit">
            {translateText("Simpan Foto", language)}
          </button>
          <button className="secondary-action" type="button" onClick={() => onSubmit("")}>
            {translateText("Pakai Avatar", language)}
          </button>
        </div>
      </form>
    </Modal>
  );
}



function App() {
 const [currentUser, setCurrentUser] = useState(() => {
 const storedUser = localStorage.getItem("ecoscan_user");
 if (!storedUser) {
 return null;
 }

 try {
 return JSON.parse(storedUser);
 } catch {
 localStorage.removeItem("ecoscan_user");
 return null;
 }
 });
 const [activePage, setActivePage] = useState("home");
 const [scanMode, setScanMode] = useState("upload");
 const [selectedFile, setSelectedFile] = useState(null);
 const [previewUrl, setPreviewUrl] = useState("");
 const [prediction, setPrediction] = useState(null);
 const [error, setError] = useState("");
 const [isLoading, setIsLoading] = useState(false);
 const [toasts, setToasts] = useState([]);
 const [cameraStream, setCameraStream] = useState(null);
 const [cameraFacing, setCameraFacing] = useState("environment");
 const [historyItems, setHistoryItems] = useState(fallbackHistoryItems);
 const [historyError, setHistoryError] = useState("");
 const [userStats, setUserStats] = useState(emptyUserStats);
 const [challenge, setChallenge] = useState(weeklyChallenge);
 const [communityItems, setCommunityItems] = useState(() => [
 ...communityPosts.map(normalizePost),
 ...communityTips.map(normalizePost),
 ]);
 const [leaderboard, setLeaderboard] = useState(leaderboardItems);
 const [triviaItems, setTriviaItems] = useState(triviaCards);
 const [notifications, setNotifications] = useState([]);
 const [language, setLanguage] = useState(() => localStorage.getItem("ecoscan_language") || "id");
 const [isLightTheme, setIsLightTheme] = useState(() => {
 return localStorage.getItem("ecoscan_theme") !== "dark";
 });
 const videoRef = useRef(null);
 const previewUrlRef = useRef("");
 const cameraStreamRef = useRef(null);
 const isAuthenticated = Boolean(currentUser);
 useDomTranslation(language);

 const predictionTone = useMemo(() => {
 return categoryMeta[prediction?.category || prediction?.predicted_class]?.tone || "green";
 }, [prediction]);

 const confidenceValue =
 typeof prediction?.confidence === "number"
 ? Number(((prediction.confidence <= 1 ? prediction.confidence * 100 : prediction.confidence)).toFixed(2))
 : 0;

 const notify = (message, type = "info") => {
 setToasts((items) => {
 const toast = { id: `${Date.now()}-${Math.random()}`, message, type };
 return [toast, ...items].slice(0, 4);
 });
 };

 useEffect(() => {
 if (!toasts.length) return undefined;
 const timer = window.setTimeout(() => {
 setToasts((items) => items.slice(0, -1));
 }, 3400);
 return () => window.clearTimeout(timer);
 }, [toasts]);

 const stopCamera = () => {
 const stream = cameraStreamRef.current || cameraStream;
 if (stream) {
 stream.getTracks().forEach((track) => track.stop());
 }
 cameraStreamRef.current = null;
 setCameraStream(null);
 };

 const handleAuthenticate = async ({ email, name, password, mode }) => {
 const response = await fetch(mode === "register" ? REGISTER_URL : LOGIN_URL, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 },
 body: JSON.stringify({ email, name, password }),
 });
 const data = await response.json().catch(() => null);

 if (!response.ok) {
 throw new Error(data?.detail || "Autentikasi gagal.");
 }

 localStorage.setItem("ecoscan_user", JSON.stringify(data.user));
 setCurrentUser(data.user);
 setActivePage("home");
 notify(mode === "register" ? "Akun berhasil dibuat." : "Berhasil masuk.", "success");
 };

 const loadHistory = async (showToast = false) => {
 try {
 const url = new URL(HISTORY_URL);
 url.searchParams.set("limit", "50");
 if (currentUser?.id) {
 url.searchParams.set("user_id", currentUser.id);
 }
 const response = await fetch(url);
 const data = await response.json().catch(() => null);

 if (!response.ok) {
 throw new Error(data?.detail || "Riwayat belum bisa dimuat.");
 }

 const items = Array.isArray(data?.items) ? data.items.map(mapHistoryItem) : [];
 setHistoryItems(items);
 setHistoryError("");
 if (showToast) notify("Riwayat berhasil diperbarui.", "success");
 } catch (err) {
 const message = err instanceof Error ? err.message : "Riwayat belum bisa dimuat.";
 setHistoryError(message === "Failed to fetch" ? "Backend belum terhubung untuk riwayat." : message);
 if (showToast) notify("Riwayat gagal dimuat.", "error");
 }
 };

 const loadUserStats = async () => {
 if (!currentUser?.id) {
 setUserStats(emptyUserStats);
 return;
 }

 try {
 const response = await fetch(`${USER_URL}/${currentUser.id}/stats`);
 const data = await response.json().catch(() => null);
 if (!response.ok) throw new Error(data?.detail || "Statistik belum bisa dimuat.");
 const stats = data?.stats && typeof data.stats === "object" ? data.stats : data;
 setUserStats({ ...emptyUserStats, ...stats });
 } catch {
 setUserStats(emptyUserStats);
 }
 };

 const loadNotifications = async () => {
 if (!currentUser?.id) {
 setNotifications([]);
 return;
 }

 try {
 const url = new URL(NOTIFICATIONS_URL);
 url.searchParams.set("user_id", currentUser.id);
 const response = await fetch(url);
 const data = await response.json().catch(() => null);

 if (!response.ok) {
 throw new Error(data?.detail || "Notifikasi belum bisa dimuat.");
 }

 const sourceItems = Array.isArray(data?.items)
 ? data.items
 : Array.isArray(data?.notifications)
 ? data.notifications
 : Array.isArray(data)
 ? data
 : [];
 setNotifications(sortNotificationsByNewest(sourceItems.map(normalizeNotification)));
 } catch {
 setNotifications([]);
 }
 };

 const handleMarkNotificationsRead = async () => {
 if (!currentUser?.id) return;

 const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id);
 if (!unreadIds.length) return;

 setNotifications((items) => items.map((item) => (unreadIds.includes(item.id) ? { ...item, read: true } : item)));

 try {
 await fetch(`${NOTIFICATIONS_URL}/read`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 user_id: currentUser.id,
 notification_ids: unreadIds,
 }),
 });
 } catch {
 // Optimistic update tetap dipakai; data terbaru akan diambil ulang saat halaman dimuat.
 }
 };

 const loadWeeklyChallengeStatus = async () => {
 if (!currentUser?.id) {
 setChallenge((item) => ({ ...normalizeChallenge(item), current: 0, target: WEEKLY_CHALLENGE_TARGET }));
 return;
 }

 try {
 const url = new URL(WEEKLY_CHALLENGE_STATUS_URL);
 url.searchParams.set("user_id", currentUser.id);
 const response = await fetch(url);
 const data = await response.json().catch(() => null);

 if (!response.ok) {
 throw new Error(data?.detail || "Status tantangan mingguan belum bisa dimuat.");
 }

 const status = normalizeWeeklyChallengeStatus(data);
 setChallenge((item) => ({
 ...normalizeChallenge(item),
 current: status.totalScan,
 target: WEEKLY_CHALLENGE_TARGET,
 }));
 } catch {
 setChallenge((item) => ({ ...normalizeChallenge(item), target: WEEKLY_CHALLENGE_TARGET }));
 }
 };

 const loadCommunityData = async () => {
 try {
 const [challengeResponse, postsResponse, leaderboardResponse] = await Promise.all([
 fetch(COMMUNITY_CHALLENGE_URL),
 fetch(COMMUNITY_POSTS_URL),
 fetch(COMMUNITY_LEADERBOARD_URL),
 ]);

 if (challengeResponse.ok) {
 const data = await challengeResponse.json();
 setChallenge(normalizeChallenge(data.challenge));
 }

 await loadWeeklyChallengeStatus();

 if (postsResponse.ok) {
 const data = await postsResponse.json();
 const items = Array.isArray(data.items) ? data.items.map(normalizePost) : [];
 if (items.length) {
 setCommunityItems(items);
 }
 }

 if (leaderboardResponse.ok) {
 const data = await leaderboardResponse.json();
 if (Array.isArray(data.items) && data.items.length) {
 setLeaderboard(data.items);
 }
 }
 } catch {
 setCommunityItems((items) => (items.length ? items : [...communityPosts, ...communityTips].map(normalizePost)));
 await loadWeeklyChallengeStatus();
 }
 };

 const loadTrivia = async () => {
 try {
 const response = await fetch(TRIVIA_URL);
 const data = await response.json().catch(() => null);

 if (response.ok && Array.isArray(data?.items) && data.items.length) {
 setTriviaItems(data.items.map(normalizeTrivia));
 }
 } catch {
 setTriviaItems(triviaCards);
 }
 };

 useEffect(() => {
 if (isAuthenticated) {
 loadHistory();
 loadUserStats();
 loadNotifications();
 loadCommunityData();
 loadTrivia();
 }
 }, [isAuthenticated]);

 useEffect(() => {
 localStorage.setItem("ecoscan_language", language);
 }, [language]);

 useEffect(() => {
 localStorage.setItem("ecoscan_theme", isLightTheme ? "light" : "dark");
 }, [isLightTheme]);

 const handleThemeToggle = (updater) => {
 const nextValue = typeof updater === "function" ? updater(isLightTheme) : Boolean(updater);
 setIsLightTheme(nextValue);
 notify(nextValue ? "Tema light aktif." : "Tema dark aktif.", "info");
 };

 const handleLanguageChange = (nextLanguage) => {
 setLanguage(nextLanguage);
 notify(nextLanguage === "en" ? "Language changed to English." : "Bahasa diubah ke Indonesia.", "success");
 };

 const handleImageChange = (event) => {
 const file = event.target.files?.[0];

 setPrediction(null);
 setError("");

 if (!file) {
 setSelectedFile(null);
 setPreviewUrl("");
 event.target.value = "";
 return;
 }

 if (!file.type.startsWith("image/")) {
 setSelectedFile(null);
 setPreviewUrl("");
 setError("File yang dipilih harus berupa gambar.");
 notify("File yang dipilih harus berupa gambar.", "warning");
 event.target.value = "";
 return;
 }

 if (previewUrl) {
 URL.revokeObjectURL(previewUrl);
 }

 setSelectedFile(file);
 setPreviewUrl(URL.createObjectURL(file));
 stopCamera();
 notify("Gambar siap dipindai.", "info");
 event.target.value = "";
 };

 const handlePredict = async (fileToPredict = selectedFile) => {
 if (!fileToPredict) {
 setError("Pilih atau ambil gambar sampah terlebih dahulu.");
 return;
 }

 const formData = new FormData();
 formData.append("file", fileToPredict);
 if (currentUser?.id) {
 formData.append("user_id", currentUser.id);
 }

 setIsLoading(true);
 setPrediction(null);
 setError("");

 try {
 const response = await fetch(CLASSIFY_URL, {
 method: "POST",
 body: formData,
 });

 const data = await response.json().catch(() => null);

 if (!response.ok) {
 throw new Error(data?.detail || "Server gagal memproses gambar.");
 }

 setPrediction(data);
 await loadHistory();
 await loadUserStats();
 await loadWeeklyChallengeStatus();
 notify("Scan berhasil disimpan ke riwayat.", "success");
 } catch (err) {
 const message =
 err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.";

 setError(
 message === "Failed to fetch"
 ? `Gagal terhubung ke server AI. Pastikan FastAPI berjalan di ${API_BASE_URL}.`
 : message
 );
 notify("Scan gagal diproses.", "error");
 } finally {
 setIsLoading(false);
 }
 };

 const resetScan = () => {
 if (previewUrl) {
 URL.revokeObjectURL(previewUrl);
 }
 setSelectedFile(null);
 setPreviewUrl("");
 setPrediction(null);
 setError("");
 stopCamera();
 notify("Scan aktif sudah direset.", "info");
 };

 const startCamera = async (facing = cameraFacing) => {
 if (!navigator.mediaDevices?.getUserMedia) {
 setError("Browser belum mendukung kamera langsung.");
 notify("Browser belum mendukung kamera langsung.", "error");
 return;
 }

 try {
 stopCamera();
 const stream = await navigator.mediaDevices.getUserMedia({
 video: { facingMode: { ideal: facing } },
 audio: false,
 });
 cameraStreamRef.current = stream;
 setCameraStream(stream);
 setCameraFacing(facing);
 setPreviewUrl("");
 setSelectedFile(null);
 setPrediction(null);
 setError("");
 notify("Kamera aktif.", "success");
 } catch {
 setError("Kamera tidak bisa diakses. Periksa izin kamera browser.");
 notify("Kamera tidak bisa diakses.", "error");
 }
 };

 const captureCameraFrame = async () => {
 const video = videoRef.current;
 if (!video || !cameraStream) {
 notify("Kamera belum siap.", "warning");
 return;
 }

 const canvas = document.createElement("canvas");
 canvas.width = video.videoWidth || 640;
 canvas.height = video.videoHeight || 640;
 const context = canvas.getContext("2d");
 context.drawImage(video, 0, 0, canvas.width, canvas.height);
 const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
 if (!blob) {
 notify("Gagal mengambil gambar dari kamera.", "error");
 return;
 }

 const file = new File([blob], `camera-scan-${Date.now()}.jpg`, { type: "image/jpeg" });
 if (previewUrl) URL.revokeObjectURL(previewUrl);
 setSelectedFile(file);
 setPreviewUrl(URL.createObjectURL(file));
 stopCamera();
 };

 const handlePrimaryScan = (uploadInputRef) => {
 if (scanMode === "camera") {
 if (cameraStream) {
 captureCameraFrame();
 } else {
 startCamera(cameraFacing);
 }
 return;
 }

 uploadInputRef.current?.click();
 };

 const handleSwitchCamera = () => {
 const nextFacing = cameraFacing === "environment" ? "user" : "environment";
 startCamera(nextFacing);
 };

 useEffect(() => {
 if (selectedFile) {
 handlePredict(selectedFile);
 }
 }, [selectedFile]);

 useEffect(() => {
 previewUrlRef.current = previewUrl;
 }, [previewUrl]);

 useEffect(() => {
 cameraStreamRef.current = cameraStream;
 }, [cameraStream]);

 useEffect(() => {
 return () => {
 if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
 if (cameraStreamRef.current) {
 cameraStreamRef.current.getTracks().forEach((track) => track.stop());
 }
 };
 }, []);

 if (!isAuthenticated) {
 return (
 <>
 <LoginPage isLightTheme={isLightTheme} onAuthenticate={handleAuthenticate} onThemeToggle={handleThemeToggle} />
 <ToastStack items={toasts} />
 </>
 );
 }

 const handleLogout = () => {
 localStorage.removeItem("ecoscan_user");
 setCurrentUser(null);
 setActivePage("home");
 notify("Berhasil logout.", "info");
 };

 const handleUpdateUser = async (updates) => {
 const updatedUser = { ...currentUser, ...updates };
 setCurrentUser(updatedUser);
 localStorage.setItem("ecoscan_user", JSON.stringify(updatedUser));

 try {
 const response = await fetch(`${USER_URL}/${currentUser.id}`, {
 method: "PUT",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(updates),
 });
 const data = await response.json().catch(() => null);
 if (!response.ok) throw new Error(data?.detail || "Profil gagal diperbarui.");
 const syncedUser = { ...updatedUser, ...(data?.user || data || {}) };
 setCurrentUser(syncedUser);
 localStorage.setItem("ecoscan_user", JSON.stringify(syncedUser));
 notify("Profil berhasil diperbarui.", "success");
 } catch {
 // Data tetap tersimpan lokal saat backend profil belum tersambung.
 notify("Profil tersimpan lokal, backend belum tersambung.", "warning");
 }
 };

 const handlePhotoUpdate = async (avatarUrl) => {
 await handleUpdateUser({ avatar_url: avatarUrl });
 };

 const handleChangePassword = async (payload) => {
 const response = await fetch(`${USER_URL}/${currentUser.id}/password`, {
 method: "PUT",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(payload),
 });
 const data = await response.json().catch(() => null);
 if (!response.ok) {
 const message = data?.detail || "Password gagal diperbarui.";
 notify(message, "error");
 throw new Error(message);
 }
 notify(data?.message || "Password berhasil diperbarui.", "success");
 };

 const handleCreatePost = async ({ title, body }) => {
 const newPost = normalizePost({
 id: `local-post-${Date.now()}`,
 author: currentUser?.name || "Eco Warrior",
 badge: "Anggota",
 title,
 body,
 type: "post",
 likes: 0,
 comments: [],
 createdAt: "Baru saja",
 });

 setCommunityItems((items) => [newPost, ...items]);
 notify("Postingan dibuat.", "success");

 try {
 const response = await fetch(COMMUNITY_POSTS_URL, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 title,
 body,
 author: newPost.author,
 badge: newPost.badge,
 user_id: currentUser?.id,
 }),
 });
 const data = await response.json().catch(() => null);
 if (response.ok && data?.item) {
 const savedPost = normalizePost(data.item);
 setCommunityItems((items) => items.map((item) => (item.id === newPost.id ? savedPost : item)));
 }
 } catch {
 // Optimistic UI: postingan lokal tetap tampil.
 notify("Postingan tampil lokal, belum sinkron ke backend.", "warning");
 }
 };

 const handleToggleLike = async (postId) => {
 const target = communityItems.find((item) => item.id === postId);
 const nextLiked = !target?.isLiked;

 setCommunityItems((items) =>
 items.map((item) =>
 item.id === postId
 ? { ...item, isLiked: !item.isLiked, likes: Math.max(0, item.likes + (item.isLiked ? -1 : 1)) }
 : item
 )
 );

 try {
 await fetch(`${COMMUNITY_POSTS_URL}/${postId}/like`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ liked: nextLiked }),
 });
 } catch {
 // Like akan disinkronkan ulang saat data komunitas dimuat dari backend.
 notify("Like tersimpan lokal sementara.", "warning");
 }
 };

 const handleAddComment = async (postId, body, parentId = null) => {
 const newComment = {
 id: `local-comment-${Date.now()}`,
 author: currentUser?.name || "Eco Warrior",
 body,
 createdAt: "Baru saja",
 replies: [],
 };

 setCommunityItems((items) =>
 items.map((item) => {
 if (item.id !== postId) return item;
 if (!parentId) return { ...item, comments: [...item.comments, newComment] };

 return {
 ...item,
 comments: item.comments.map((comment) =>
 comment.id === parentId
 ? { ...comment, replies: [...(comment.replies || []), newComment] }
 : comment
 ),
 };
 })
 );
 notify(parentId ? "Balasan ditambahkan." : "Komentar ditambahkan.", "success");

 try {
 const response = await fetch(`${COMMUNITY_POSTS_URL}/${postId}/comments`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 body,
 author: newComment.author,
 parent_id: parentId,
 user_id: currentUser?.id,
 }),
 });
 if (response.ok) {
 loadCommunityData();
 }
 } catch {
 // Komentar lokal tetap digunakan jika backend belum tersedia.
 notify("Komentar tersimpan lokal sementara.", "warning");
 }
 };

 return (
 <div className={`app-shell ${isLightTheme ? "light-theme" : "dark-theme"}`}>
 <main className="phone-stage">
 {activePage === "home" && (
 <HomePage
 isLightTheme={isLightTheme}
 language={language}
 notifications={notifications}
 onLogout={handleLogout}
 onNavigate={setActivePage}
 onNotificationsClose={handleMarkNotificationsRead}
 onThemeToggle={handleThemeToggle}
 stats={userStats}
 triviaItems={triviaItems}
 user={currentUser}
 />
 )}
 {activePage === "history" && (
 <HistoryPage
 historyError={historyError}
 historyItems={historyItems}
 isLightTheme={isLightTheme}
 language={language}
 notifications={notifications}
 onLogout={handleLogout}
 onNavigate={setActivePage}
 onNotificationsClose={handleMarkNotificationsRead}
 onRefresh={() => loadHistory(true)}
 onThemeToggle={handleThemeToggle}
 user={currentUser}
 />
 )}
 {activePage === "scan" && (
 <ScanPage
 cameraFacing={cameraFacing}
 cameraStream={cameraStream}
 confidenceValue={confidenceValue}
 error={error}
 isLoading={isLoading}
 isLightTheme={isLightTheme}
 language={language}
 notifications={notifications}
 onImageChange={handleImageChange}
 onLogout={handleLogout}
 onNavigate={setActivePage}
 onNotificationsClose={handleMarkNotificationsRead}
 onPrimaryScan={handlePrimaryScan}
 onReset={resetScan}
 onSwitchCamera={handleSwitchCamera}
 onThemeToggle={handleThemeToggle}
 prediction={prediction}
 predictionTone={predictionTone}
 previewUrl={previewUrl}
 scanMode={scanMode}
 selectedFile={selectedFile}
 setScanMode={setScanMode}
 user={currentUser}
 videoRef={videoRef}
 />
 )}
 {activePage === "community" && (
 <CommunityPage
 challenge={challenge}
 isLightTheme={isLightTheme}
 items={communityItems}
 language={language}
 leaderboard={leaderboard}
 notifications={notifications}
 onAddComment={handleAddComment}
 onCreatePost={handleCreatePost}
 onLogout={handleLogout}
 onNavigate={setActivePage}
 onNotificationsClose={handleMarkNotificationsRead}
 onThemeToggle={handleThemeToggle}
 onToggleLike={handleToggleLike}
 user={currentUser}
 />
 )}
 {activePage === "profile" && (
 <ProfilePage
 historyItems={historyItems}
 isLightTheme={isLightTheme}
 language={language}
 notifications={notifications}
 onChangePassword={handleChangePassword}
 onLanguageChange={handleLanguageChange}
 onLogout={handleLogout}
 onNavigate={setActivePage}
 onNotificationsClose={handleMarkNotificationsRead}
 onPhotoUpdate={handlePhotoUpdate}
 onThemeToggle={handleThemeToggle}
 onUpdateUser={handleUpdateUser}
 stats={userStats}
 user={currentUser}
 />
 )}
 </main>

 <BottomNavigation activePage={activePage} onNavigate={setActivePage} />
 <ToastStack items={toasts} />
 </div>
 );
}

export default App;
