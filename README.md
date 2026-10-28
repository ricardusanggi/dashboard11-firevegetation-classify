# Fire Vegetation Classify Dashboard

Dashboard web untuk klasifikasi gambar vegetasi/lahan yang berpotensi rawan kebakaran (fire-prone vegetation) menggunakan deep learning (PyTorch/ResNet). Aplikasi mendukung training model, pengelolaan dataset, prediksi gambar, dan manajemen pengguna melalui panel admin.

## Fitur

- **Prediksi publik** — pengunjung dapat mengunggah gambar vegetasi dan mendapatkan hasil klasifikasi tanpa perlu login.
- **Dashboard user** — melihat riwayat prediksi, dataset, dan profil pengguna.
- **Panel admin**:
  - Manajemen dataset (upload, approve/reject, histori, merge dataset).
  - Training model (konfigurasi arsitektur, epoch, batch size, optimizer, augmentasi, opsi optimasi hyperparameter dengan PSO).
  - Manajemen model (upload model, aktivasi versi, rollback versi).
  - Manajemen user.
  - System tools (reset sistem, docker cleanup, monitoring).
- **Halaman publik** — menampilkan metrik model aktif (akurasi, info dataset, kelas yang dikenali) yang diambil otomatis dari model yang sedang aktif.

## Tech Stack

**Backend**
- FastAPI + Uvicorn
- SQLAlchemy (SQLite secara default)
- PyTorch / Torchvision untuk training & inferensi model klasifikasi gambar (ResNet, dll.)
- OpenCV, Pillow untuk pra-pemrosesan gambar
- PSO (Particle Swarm Optimization) via `mealpy` — opsional, untuk pencarian hyperparameter
- JWT (python-jose) untuk autentikasi, Passlib/bcrypt untuk hashing password
- slowapi untuk rate limiting

**Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS + DaisyUI
- React Router, Zustand (state management)
- Axios untuk komunikasi ke backend
- Recharts untuk visualisasi metrik training

## Struktur Project

```
.
├── backend/            # FastAPI app (API, training, prediksi, auth)
│   ├── app/
│   │   ├── routes/     # Endpoint API (auth, dataset, training, model, predict, admin, dll.)
│   │   ├── services/   # Logika bisnis
│   │   ├── learn/      # Pipeline training & inferensi ML
│   │   ├── models/     # Model database (SQLAlchemy)
│   │   └── utils/      # Helper (auth, file, model manager, dll.)
│   └── storage/        # Dataset, model, database, log (tidak di-commit, lihat .gitignore)
├── frontend/           # React + Vite SPA
│   └── src/
│       ├── pages/      # Halaman publik, user, admin
│       ├── components/ # Komponen UI & layout
│       ├── api/        # Wrapper axios ke backend
│       └── store/      # State management (zustand)
├── docker-compose.yml       # Jalankan backend + frontend (production-like)
└── docker-compose.dev.yml   # Mode development dengan hot-reload
```

## Menjalankan Aplikasi

### 1. Siapkan environment variables

Salin file contoh env lalu isi sesuai kebutuhan (nilai asli jangan di-commit ke git):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Variabel penting di `backend/.env`:
- `SECRET_KEY` — ganti dengan string random yang aman.
- `DATABASE_URL` — default SQLite, bisa diganti ke database lain.
- `ALLOWED_ORIGINS` — daftar origin frontend yang diizinkan (CORS).
- `DEFAULT_ADMIN_USERNAME` / `DEFAULT_ADMIN_PASSWORD` — akun admin pertama yang otomatis dibuat saat backend pertama kali jalan.
- `TRAIN_*`, `PSO_*`, `PREDICT_*` — konfigurasi default untuk training dan prediksi model.

### 2. Jalankan dengan Docker (disarankan)

```bash
docker compose up --build
```

- Frontend: http://localhost:3011
- Backend API: http://localhost:8011

Mode development (hot-reload):

```bash
docker compose -f docker-compose.dev.yml up
```

### 3. Jalankan manual (tanpa Docker)

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8011
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Catatan Keamanan

- File `.env` berisi secret (SECRET_KEY, password admin default, API key) dan **tidak** ikut di-commit ke repository — lihat `.gitignore`.
- Gunakan `backend/.env.example` dan `frontend/.env.example` sebagai acuan variabel yang dibutuhkan, lalu isi sendiri nilainya secara lokal.
- Ganti `SECRET_KEY` dan kredensial admin default sebelum deploy ke environment publik.
