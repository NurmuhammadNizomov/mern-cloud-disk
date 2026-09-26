# ☁️ MERN Cloud Disk (Google Drive & Yandex Disk Clone)

> A modern, full-stack Cloud Storage web application built with **MERN Stack**, **Turborepo**, **Bulma CSS**, **Zustand**, and **TanStack React Query**. Features real-time percentage file uploads, nested folders, access permissions sharing, Cloudinary media storage, dual-token JWT auth, and multilingual support.

---

## ✨ Features

- 📁 **Folder & File Management**: Create nested folders, navigate breadcrumbs, rename, move, and organize assets effortlessly.
- ⚡ **Real-Time Percentage File Uploads**: Multi-file drag-and-drop upload zone with live percentage progress bar (0% - 100%) via Axios & Cloudinary stream.
- 👥 **Access Permissions & Sharing ("Dostup berish")**:
  - Share items with specific user emails (Roles: *Viewer* or *Editor*).
  - Generate shareable public links with 1-click clipboard copying.
  - Dedicated "Shared with me" section.
- 🔍 **Filtering & Sorting**:
  - Filter files by category: *All*, *Images*, *Documents*, *Videos*, *Audio*, *Archives*.
  - Sort by: *Date*, *Name*, *Size* (Ascending / Descending).
  - Grid View (interactive thumbnails) & List View (detailed table).
- 👁️ **File Previews**: Built-in modal preview for images, HTML5 video player, audio player, documents, and direct download links.
- 🌓 **Dark & Light Mode**: Seamless theme switcher persisted in local storage.
- 🌐 **Multilingual i18n**: Fully translated in 3 languages: **English (Default)**, **Русский**, and **O'zbekcha**.
- 🔐 **Dual-Token Authentication & Email Verification**:
  - 15-minute Access Token + 30-day Refresh Token with token rotation.
  - Email verification OTP with Nodemailer (Gmail SMTP integration).
  - 1-Click Demo account login for instant testing.
- 📊 **Winston & Morgan Logging**: Structured colored console logging and HTTP request telemetry.
- 🚀 **Single Deployment on Vercel**: Node.js Express server automatically serves the static built React frontend for client routes.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Monorepo** | Turborepo, npm workspaces |
| **Frontend** | React 18, Vite, TypeScript, Bulma CSS, Lucide Icons |
| **State & Data** | Zustand (Store), TanStack React Query v5 (Caching & Sync) |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose (MongoDB Atlas) |
| **Cloud Storage** | Cloudinary SDK (Direct Buffer Stream) |
| **Email Service** | Nodemailer (Gmail SMTP integration with dev fallback) |
| **Logging & Errors** | Winston, Morgan, http-status-codes, express-async-errors |
| **Testing** | Vitest, Supertest |

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js `v20+` or `v24+`
- MongoDB URI (MongoDB Atlas or local MongoDB)
- Cloudinary credentials

### 2. Installation
```bash
git clone https://github.com/NurmuhammadNizomov/mern-cloud-disk.git mern-cloud-disk
cd mern-cloud-disk
npm install
```

### 3. Environment Variables
Check `apps/server/.env` (pre-configured with MongoDB Atlas and Cloudinary):
```env
PORT=5050
MONGODB_URI=mongodb://...
JWT_SECRET=super_secret_google_drive_jwt_key_2026
CLOUDINARY_CLOUD_NAME=ddwrj1gxp
CLOUDINARY_API_KEY=976349474963553
CLOUDINARY_API_SECRET=JeCY5exbpXDmKR7HwUpN7O8rP40
CLIENT_URL=http://localhost:5174

# Nodemailer Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=nurmuhammadnizomov@gmail.com
SMTP_PASS=stod ulyd eohb zlcq
```

### 4. Database Seed
Initialize default demo user and sample folders:
```bash
cd apps/server && npm run seed
```
> **Demo Account**: `demo@disk.uz` / `password123`

### 5. Running in Development
From the root directory:
```bash
npm run dev
```
- Frontend: `http://localhost:5174`
- Backend API: `http://localhost:5050`
- API Health Check: `http://localhost:5050/health`

### 6. Running Tests
```bash
npm run test
```

### 7. Production Build
```bash
npm run build
npm start
```

---

## 📡 API Endpoints Overview (`/api/v1`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new account & send verification code |
| `POST` | `/api/v1/auth/verify-email` | Verify 6-digit email OTP |
| `POST` | `/api/v1/auth/login` | Login with email/password (returns Access & Refresh tokens) |
| `POST` | `/api/v1/auth/refresh-token` | Rotate and issue new Access & Refresh tokens |
| `GET`  | `/api/v1/auth/me` | Get current user profile and storage quota |
| `GET`  | `/api/v1/folders` | Get folders (with query filters) |
| `POST` | `/api/v1/folders` | Create a new folder with custom color |
| `PATCH`| `/api/v1/folders/:id/rename` | Rename folder |
| `PATCH`| `/api/v1/folders/:id/star` | Toggle star on folder |
| `PATCH`| `/api/v1/folders/:id/trash` | Move folder to trash |
| `POST` | `/api/v1/files/upload` | Upload multiple files to Cloudinary with progress |
| `GET`  | `/api/v1/files` | Get files with category filter, search, & sorting |
| `PATCH`| `/api/v1/files/:id/rename` | Rename file |
| `PATCH`| `/api/v1/files/:id/star` | Toggle star on file |
| `POST` | `/api/v1/share/:type/:id` | Share file or folder with user email |
| `POST` | `/api/v1/share/file/:id/public-link`| Toggle public access link |
| `GET`  | `/api/v1/share/public/:token` | View/download public file without login |

---

## 📄 License
MIT © 2026 Nurmuhammad Nizomov
