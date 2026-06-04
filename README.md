EcoScan: AI untuk Mengenali dan Mengelompokkan Sampah

# Deskripsi Proyek

EcoScan adalah aplikasi web berbasis AI/ML yang mengintegrasikan model Deep Learning ke dalam antarmuka interaktif untuk memilah sampah (organik, anorganik, dan B3) secara otomatis dan real-time. Proyek ini dikembangkan sebagai painkiller untuk masalah inefisiensi pengelolaan sampah, mendukung ekonomi sirkular melalui edukasi pemilahan yang otomatis.
Sistem ini dikembangkan oleh tim CC26-PSU138 sebagai Capstone Project dalam program Coding Camp 2026 powered by DBS Foundation.

# Prasyarat Lingkungan (Prerequisites)
Sebelum melakukan replikasi proyek secara lokal, pastikan perangkat keras Anda telah terinstal:
1. Node.js : Untuk menjalankan development server Vite dan mengeksekusi JavaScript di sisi klien/server.
2. Python 3.11 : Bahasa utama untuk menjalankan lingkungan server FastAPI dan model Artificial Intelligence.
3. PostgreSQL : Sistem manajemen basis data untuk menyimpan dan mengelola data aplikasi secara terstruktur.
4. Git : Untuk melakukan kloning repositori secara kolaboratif.

# Cara Replikasi & Instalasi Lokal
1. Kloning Repositori
Langkah pertama untuk menjalankan proyek ini adalah mengunduh source code menggunakan Git. Buka terminal dan jalankan perintah:
git clone (https://github.com/EcoScan-Klasifikasi-Sampah/EcoScan-Klasifikasi-Sampah.git)

2. Konfigurasi Back-End (FastAPI & TensorFlow)
Sistem server bertanggung jawab menangani RESTful API, logika bisnis, dan memproses inference model Deep Learning.
 a. Masuk ke direktori backend:
    cd backend
 b. Buat dan aktifkan virtual environment Python:
    python -m venv env
    Pengguna Windows: env\Scripts\activate
    Pengguna Mac/Linux: source env/bin/activate
 c. Instal seluruh library yang dibutuhkan (FastAPI, TensorFlow, psycopg2, dll.):
    pip install -r requirements.txt
 d. Jalankan server FastAPI:
    uvicorn main:app --reload
    API Server akan aktif dan dapat diakses melalui http://localhost:3000.
3. Konfigurasi Front-End (React.js & Vite)
Antarmuka pengguna (UI) dibangun agar interaktif dengan menggunakan React.js dan Vite. Komunikasi data HTTP Request dari klien ke server diimplementasikan secara langsung menggunakan fetch API bawaan JavaScript
a. Buka tab terminal baru dan arahkan ke direktori frontend:
   cd frontend
b. Instal dependencies Node.js:
   npm install
c. Jalankan development server:
   npm run dev
Aplikasi front-end siap diuji coba melalui browser pada tautan http://localhost:5173.

# Catatan Teknis Pengembang

Untuk meminimalisir dependensi eksternal, proses fetching data dan integrasi RESTful API pada front-end menggunakan fetch murni. Pastikan Anda telah mengatur Base URL di dalam file .env pada direktori frontend agar mengarah ke alamat server FastAPI yang tepat untuk menghindari kendala CORS atau failed to fetch.
