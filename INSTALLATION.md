# Uexam - Platform Ujian Online

## 🎯 Fitur Lengkap

### Untuk Siswa
✅ **Login & Register**
- Sistem autentikasi dengan Firebase
- Username dan password untuk siswa
- Validasi input dan error handling

✅ **Dashboard Siswa**
- Melihat daftar ujian yang tersedia
- Statistik poin dan ujian selesai
- Riwayat ujian

✅ **Sistem Ujian**
- Interface ujian yang user-friendly
- Navigasi soal prev/next
- Progress bar ujian
- Timer real-time
- Proteksi anti-tab baru
- Soal dengan media (gambar)

✅ **Hasil & Leaderboard**
- Score dan persentase
- Leaderboard waktu pengerjaan
- Review jawaban dan penjelasan
- Status lulus/tidak lulus
- Download hasil

### Untuk Guru
✅ **Login Guru**
- Autentikasi khusus guru
- Dashboard terpisah dari siswa

✅ **Dashboard Guru**
- Statistik ujian dan pengerjaan
- Rata-rata score siswa
- Manajemen ujian

✅ **Manajemen Soal**
- Tambah soal pilihan ganda
- Upload media (gambar) dari perangkat
- Penjelasan untuk jawaban yang salah
- Hapus soal
- Daftar soal yang sudah dibuat

✅ **Manajemen Ujian**
- Buat ujian baru
- Edit informasi ujian
- Atur status ujian (aktif/tidak aktif)
- Lihat hasil ujian siswa
- Hapus progress ujian siswa

✅ **Hasil Ujian**
- Tabel hasil dengan ranking
- Filter berdasarkan persentase
- Hapus progress siswa
- Export data

### Keamanan
🔒 **Proteksi Anti-Tab**
- Deteksi perubahan tab
- Alert jika meninggalkan halaman ujian
- Prevent reload saat ujian berlangsung

🔒 **Autentikasi & Otorisasi**
- Firebase Authentication
- Role-based access control (siswa/guru)
- Protected routes dengan middleware

🔒 **Data Security**
- Firestore dengan rules
- Firebase Storage untuk media
- Encryption

### Responsive & Multi-Device
📱 **Kompatibilitas Perangkat**
- Desktop (1920px+)
- Tablet (768px+)
- Mobile (320px+)
- Support di berbagai browser

## 🛠️ Teknologi

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **State Management**: Zustand
- **Deployment**: Vercel
- **Database**: Firestore (NoSQL)

## 🚀 Setup & Instalasi

### 1. Clone Repository
```bash
git clone https://github.com/GENEXPHY/Uexam.git
cd Uexam
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Firebase
1. Buat project di [Firebase Console](https://console.firebase.google.com)
2. Aktifkan Authentication, Firestore, dan Storage
3. Copy konfigurasi Firebase

### 4. Setup Environment Variables
Buat file `.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka http://localhost:3000

## 📦 Build & Deploy

### Build untuk Production
```bash
npm run build
npm start
```

### Deploy ke Vercel

#### Option 1: Via Vercel CLI
```bash
npm install -g vercel
vercel
```

#### Option 2: Via GitHub Integration
1. Push ke GitHub
2. Buka https://vercel.com/new
3. Import repository GENEXPHY/Uexam
4. Setup environment variables di Vercel
5. Deploy

## 🗂️ Struktur Project

```
Uexam/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── student/
│   │   ├── dashboard/
│   │   ├── quiz/[id]/
│   │   └── results/[id]/
│   ├── teacher/
│   │   ├── dashboard/
│   │   ├── create-quiz/
│   │   ├── edit-quiz/[id]/
│   │   ├── questions/
│   │   └── quiz/[id]/results/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── lib/
│   ├── firebase.ts
│   ├── store.ts
│   └── types.ts
├── styles/
│   └── globals.css
├── middleware.ts
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 📱 Penggunaan

### Untuk Siswa
1. Daftar dengan username dan password
2. Login ke dashboard
3. Pilih ujian yang tersedia
4. Kerjakan soal
5. Lihat hasil dan penjelasan

### Untuk Guru
1. Login dengan username dan password khusus guru
2. Masuk ke dashboard guru
3. Tambah soal pilihan ganda dengan media
4. Buat ujian dan pilih soal
5. Lihat hasil siswa dan hapus progress

## 🔐 Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow create: if request.auth.uid != null;
    }
    match /quizzes/{quizId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth.uid == resource.data.createdBy;
    }
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth.uid == resource.data.createdBy;
    }
    match /attempts/{attemptId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🐛 Troubleshooting

### Issue: "Firebase config error"
- Pastikan .env.local sudah diisi dengan benar
- Restart development server

### Issue: "Cannot read property 'auth'"
- Pastikan Firebase sudah terinisialisasi
- Check konfigurasi di `lib/firebase.ts`

### Issue: "Quiz tidak ditemukan"
- Pastikan soal sudah ditambahkan ke ujian
- Check Firestore data

## 📄 Lisensi

MIT License - Bebas digunakan untuk tujuan komersial dan non-komersial

## 👤 Author

**GENEXPHY**
- GitHub: [@GENEXPHY](https://github.com/GENEXPHY)

## 📞 Support

Jika ada pertanyaan atau bug, silakan buka issue di GitHub atau hubungi developer.

---

**Made with ❤️ by GENEXPHY**
