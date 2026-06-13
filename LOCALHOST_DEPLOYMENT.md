# Standalone Deployment Guide

## 🎯 Cara Deploy Uexam Secara Standalone (Localhost)

Uexam kini bisa dijalankan tanpa server eksternal! Berikut caranya:

## Method 1: Quick Start (Recommended)

### Langkah 1: Build Standalone
```bash
npm run build:standalone
```

### Langkah 2: Jalankan Aplikasi
```bash
npm run start:local
```

Buka browser ke: **http://localhost:8080**

---

## Method 2: Manual Setup

### Langkah 1: Install Dependencies
```bash
npm install
```

### Langkah 2: Setup Firebase

Buat file `.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_APP_URL=http://localhost:8080
```

### Langkah 3: Build Project
```bash
# Menggunakan config standalone
NEXT_CONFIG_FILE=next.config.standalone.js npm run build
```

### Langkah 4: Copy Output
```bash
mkdir -p dist
cp -r out/* dist/
cp -r public/* dist/
```

### Langkah 5: Jalankan Server Local
```bash
npx http-server dist/ -p 8080 -o
```

---

## Method 3: Development Mode (No Build)

```bash
npm run dev
```

Buka: **http://localhost:3000**

---

## 📦 Struktur Folder Hasil Build

```
dist/
├── index.html
├── _next/
│   ├── static/
│   │   ├── chunks/
│   │   ├── css/
│   │   └── media/
│   └── data/
├── auth/
│   ├── login/
│   ├── register/
│   └── index.html
├── student/
│   ├── dashboard/
│   ├── quiz/
│   ├── results/
│   └── index.html
├── teacher/
│   ├── dashboard/
│   ├── create-quiz/
│   ├── questions/
│   └── index.html
└── public/
    └── (static assets)
```

---

## 🔧 Configuration Details

### next.config.standalone.js
- `output: 'export'` - Generate static HTML
- `trailingSlash: true` - Add trailing slashes
- `unoptimized: true` - Disable image optimization
- `basePath: ''` - Use root path
- `assetPrefix: './'` - Use relative paths

---

## ⚙️ Requirements

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Firebase Account** (untuk authentication & database)
- **http-server** (untuk serve file static)

---

## 🚀 Alternative: Simple HTTP Server

Jika tidak ingin menggunakan `http-server`, bisa gunakan:

### Python 3
```bash
cd dist
python -m http.server 8080
```

Akses: http://localhost:8080

### Python 2
```bash
cd dist
python -m SimpleHTTPServer 8080
```

### Node.js Built-in
```bash
cd dist
node -e "require('http').createServer((req, res) => { require('fs').readFile('.' + (req.url === '/' ? '/index.html' : req.url), (e, d) => res.end(d)); }).listen(8080)"
```

### PHP
```bash
cd dist
php -S localhost:8080
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "CORS issue"
- Firebase harus disetup dengan benar
- Check `.env.local` configuration
- Pastikan domain sudah authorized di Firebase Console

### Error: "Files not found after build"
```bash
# Pastikan folder dist ada
mkdir -p dist

# Re-copy files
cp -r out/* dist/
cp -r public/* dist/

# Verify
ls -la dist/
```

### Halaman blank/error 404
- Pastikan semua `next-config` sudah benar
- Clear browser cache (Ctrl+Shift+Delete)
- Rebuild project dengan `npm run build:standalone`

---

## 📱 Akses dari Device Lain

### Dapatkan IP Lokal
```bash
# Linux/Mac
ifconfig

# Windows
ipconfig
```

### Jalankan Server
```bash
npx http-server dist/ -p 8080 --host 0.0.0.0
```

### Akses dari Device Lain
```
http://<your-ip>:8080

Contoh: http://192.168.1.100:8080
```

---

## 📝 Notes

- Database tetap menggunakan Firebase (online)
- Hanya UI yang di-serve locally
- Perlu internet untuk Firebase operations
- Cache browser akan mempercepat loading

---

## ✅ Checklist Deploy

- [ ] Node.js terinstall
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` sudah dikonfigurasi
- [ ] Firebase project sudah dibuat
- [ ] Build standalone berhasil (`npm run build:standalone`)
- [ ] Server berjalan tanpa error
- [ ] Bisa akses http://localhost:8080
- [ ] Login & Register berfungsi
- [ ] Ujian bisa dikerjakan
- [ ] Hasil tersimpan di Firebase

---

**Happy Coding! 🚀**
