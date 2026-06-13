# Quick Start - Standalone Deployment

## 🚀 Cara Tercepat

### 1. Setup
```bash
# Clone atau download project
cd Uexam

# Install dependencies
npm install
```

### 2. Setup Firebase
Buat file `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_APP_URL=http://localhost:8080
```

### 3. Build & Run

**Option A - One Command**
```bash
npm run build:standalone && npm run start:local
```

**Option B - Development Mode**
```bash
npm run dev
```
Akses: http://localhost:3000

**Option C - Using Custom Server**
```bash
npm run build:standalone
node server.js
```
Akses: http://localhost:8080

---

## 📋 Available Commands

```bash
# Development
npm run dev                  # Start dev server (localhost:3000)

# Production
npm run build:standalone    # Build untuk standalone
npm run start:local         # Build + Run local server
npm run build               # Build untuk Vercel
npm start                   # Start production server

# Server
node server.js              # Run custom server
npx http-server dist/       # Run dengan http-server

# Others
npm run export              # Export static files
npm run lint                # Check code
```

---

## ✅ Selesai!

Buka browser ke:
- Development: **http://localhost:3000**
- Standalone: **http://localhost:8080**

Lalu login dengan akun siswa atau guru.

---

📖 Lihat `LOCALHOST_DEPLOYMENT.md` untuk detailed guide
