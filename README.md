# 🏢 BPQG — Business Proposal & Quotation Generator

Full-stack role-based platform: **Client → Proposal → AI Quotation → Meeting → Developer Assignment → Reports**

---

## 🗂️ Project Structure

```
bpqg/
├── backend/
│   ├── db/database.js         ← SQLite schema + seeding
│   ├── middleware/auth.js     ← JWT auth middleware
│   ├── routes/
│   │   ├── auth.js            ← Login / Logout / Me
│   │   ├── users.js           ← User management + logs
│   │   ├── proposals.js       ← Proposal CRUD
│   │   ├── quotations.js      ← AI pricing + PDF generation
│   │   ├── meetings.js        ← Meeting scheduling
│   │   ├── assignments.js     ← Developer assignments
│   │   └── reports.js         ← Work reports
│   ├── server.js              ← Express entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── context/AuthContext.js
│   │   ├── utils/api.js
│   │   ├── components/Layout.js
│   │   └── pages/
│   │       ├── LoginPage.js / RegisterPage.js
│   │       ├── client/       ← Dashboard, Proposals, Meetings
│   │       ├── admin/        ← Dashboard, Reviews, Meetings, Users, Reports, Logs
│   │       └── developer/    ← Dashboard, Work, Reports
│   ├── public/index.html
│   ├── capacitor.config.ts
│   └── package.json
│
├── render.yaml                ← One-click Render deploy config
└── package.json               ← Root monorepo scripts
```

---

## ⚙️ Local Development

### 1. Install all dependencies
```bash
npm run install:all
```

### 2. Create backend `.env`
```bash
cd backend
cp .env.example .env
# Edit .env and set a strong JWT_SECRET
```

### 3. Run both servers
```bash
npm run dev
# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

**Default Admin:** `admin@gmail.com` / `admin@123`

---

## 🚀 Deploy to Render (Free Tier)

### Option A — Automatic (render.yaml)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New → Blueprint**
3. Connect your GitHub repo — Render reads `render.yaml` automatically
4. Update the URLs in `render.yaml` after first deploy:
   - `FRONTEND_URL` in backend service → your frontend Render URL
   - `REACT_APP_API_URL` in frontend service → your backend Render URL
5. Redeploy both services

### Option B — Manual

#### Backend
1. Render → **New → Web Service**
2. Root Directory: `backend`
3. Build: `npm install` | Start: `node server.js`
4. Add env vars: `JWT_SECRET` (random string), `NODE_ENV=production`

#### Frontend
1. Render → **New → Static Site**
2. Root Directory: `frontend`
3. Build: `npm install && npm run build`
4. Publish: `build`
5. Add env var: `REACT_APP_API_URL=https://YOUR-BACKEND.onrender.com/api`
6. Add rewrite rule: `/* → /index.html`

---

## 📱 Build Android APK (Capacitor)

### Prerequisites
- Android Studio + JDK 17+ installed
- Backend deployed on Render (get the URL first)

### Steps

```bash
cd frontend

# 1. Update capacitor.config.ts — uncomment and set your Render URL:
#    url: 'https://your-app.onrender.com'

# 2. Build React app
npm run build

# 3. Add Android platform (first time only)
npx cap add android

# 4. Sync to Android
npx cap sync android

# 5. Open Android Studio
npx cap open android
```

In Android Studio:
- **Run ▶** → test on device/emulator
- **Build → Generate Signed Bundle/APK → APK** → export `.apk`

### 💡 APK points to your live Render URL
The APK will use the deployed web app — no separate API config needed if you set the `server.url` in `capacitor.config.ts`.

---

## 🔐 Roles

| Role | Can Do |
|------|--------|
| **Client** | Register, submit proposals, view quotations, select package, schedule meetings |
| **Admin** | Review proposals, generate AI quotations, manage meetings, assign developers, view reports & logs |
| **Developer** | View assignments, update status, submit daily/final work reports |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `users` | All users with roles |
| `proposals` | Proposals with full status lifecycle |
| `quotations` | 3-tier AI-generated quotations |
| `quotation_selections` | Client's selected tier |
| `meetings` | Bidirectional meeting scheduling |
| `assignments` | Developer-to-proposal assignments |
| `reports` | Daily/final work reports |
| `logs` | Login/logout session tracking |

---

## ⚠️ Production Checklist

- [ ] Set strong `JWT_SECRET` env variable (never use default)
- [ ] Set `FRONTEND_URL` in backend to actual Render URL
- [ ] Set `REACT_APP_API_URL` in frontend to actual backend URL
- [ ] Update `capacitor.config.ts` with live URL before building APK
- [ ] `.env` is in `.gitignore` — never commit it
- [ ] Change default admin password after first login

---

## 📦 Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Node.js, Express.js |
| Database | SQLite (sqlite3) |
| Auth | JWT + bcryptjs |
| PDF | PDFKit |
| Frontend | React 18, React Router v6 |
| Styling | Tailwind CSS |
| HTTP | Axios |
| Mobile | Capacitor v5 (Android APK) |
| Toasts | react-hot-toast |
