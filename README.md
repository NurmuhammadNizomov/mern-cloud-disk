# ☁️ MERN Cloud Disk (Google Drive & Yandex Disk Clone)

> A modern, production-grade Cloud Storage web application built with **React 18**, **Node.js Express**, **Turborepo**, **Bulma CSS**, **Zustand**, and **TanStack React Query v5**. Features full internal Drag & Drop item moving, real-time percentage file uploads to Cloudinary, nested folders, granular access sharing, floating multi-selection actions, modern toast notifications, dual-token JWT auth, and dark/light modes.

---

## ✨ Key Features

- 📁 **Intuitive Folder & File Organization**:
  - Full hierarchical folder nesting with customizable folder color themes.
  - Interactive breadcrumb navigation with clickable ancestors and home root.
  - Rename, star/favorite, trash, restore, and permanent deletion capabilities.
- 🖐️ **Drag & Drop System (Google Drive Style)**:
  - **Internal Item Moving**: Drag file and folder cards or table rows and drop them directly onto any folder card, table row, or breadcrumb item (including "My Drive" root) to move them instantly.
  - Active drop-target highlights (`.drop-target-active`) and grab-cursor state feedback (`.is-dragging`).
  - **OS File Upload Dropzone**: Full-window drag overlay (`DropzoneOverlay`) with smart detection that ignores internal drags and triggers only for external OS files.
- ⚡ **Real-Time Percentage File Uploads**:
  - Multi-file upload queue with live byte transfer tracking and progress percentage (0% – 100%) via Cloudinary buffer streams.
  - Floating bottom-right upload manager widget displaying individual progress bars, upload statuses, and clear completed buttons.
- 🔔 **Modern Toast Notification System**:
  - Non-blocking, auto-dismissing toast notifications (`toast.success`, `toast.error`, `toast.info`, `toast.warning`) for file moves, uploads, renames, trash/restore actions, and link copies.
  - Fully integrated with dark/light themes, pause-on-hover, and smooth slide-in animations.
- ⏳ **Loading State Feedback**:
  - Per-item loading overlays (`.card-loading-overlay`) with animated spinners during single or batch deletion/restoration.
  - Table row opacity masking (`.row-loading-state`) to prevent duplicate action triggers.
- ☑️ **Multi-Selection & Batch Actions**:
  - Quick select via card/row checkboxes ("galochka").
  - Floating bottom action bar showing selected count, batch delete, batch restore, and deselect controls.
- 👥 **Access Permissions & Sharing**:
  - Direct sharing with specific user email addresses with designated roles: **Viewer** or **Editor**.
  - One-click shareable public link generation with instant clipboard copying.
  - Dedicated "Shared with me" section.
- 🔍 **Search, Filtering & View Modes**:
  - Instant client-side & server-side search query filtering.
  - Category filters: *All*, *Images*, *Documents*, *Videos*, *Audio*, *Archives*.
  - Sort by *Date*, *Name*, *Size* (Ascending / Descending).
  - Responsive toggle between **Grid View** (rich thumbnail previews) and **List View** (detailed metadata table).
- 👁️ **File Previews**: Built-in modal viewer for full-resolution images, HTML5 video and audio playback, documents, and download links.
- 📱 **Fully Responsive Layout**:
  - Mobile slide-out drawer navigation for smartphones and tablets.
  - Horizontally swipeable filter pills and adaptive card grids.
- 🌓 **Themes & Internationalization**:
  - Dark Mode and Light Mode with persistent `localStorage` synchronization.
  - Multilingual support for **English** and **Русский**.
- 🔐 **Dual-Token Authentication**:
  - 15-minute Access Token + 30-day Refresh Token with database-level rotation.
  - Email verification OTP with Nodemailer (Gmail SMTP integration with dev mock fallback).
  - 1-Click Demo Login for quick testing.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
|:---|:---|
| **Monorepo** | Turborepo, npm workspaces (`apps/web`, `apps/server`) |
| **Frontend** | React 18, Vite, TypeScript, Bulma CSS, Lucide Icons |
| **State & Data** | Zustand (Global UI State), TanStack React Query v5 (Data Caching & Invalidation) |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose ORM (MongoDB Atlas) |
| **Cloud Storage** | Cloudinary SDK (Direct Buffer Upload Stream) |
| **Email Service** | Nodemailer (Gmail SMTP with dev fallback) |
| **Logging & Telemetry** | Winston structured logger, Morgan HTTP request logging |
| **Validation & Error Handling** | Zod validation schemas, `http-status-codes`, custom `AppError` |
| **Testing** | Vitest, Supertest (100% green test suite) |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `20+` or `24+`
- MongoDB URI (MongoDB Atlas or local replica set)
- Cloudinary account credentials

### 2. Installation
```bash
git clone https://github.com/NurmuhammadNizomov/mern-cloud-disk.git mern-cloud-disk
cd mern-cloud-disk
npm install
```

### 3. Environment Variables
Create or verify `apps/server/.env`:
```env
PORT=5050
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cloud_disk?retryWrites=true&w=majority
JWT_SECRET=super_secret_google_drive_jwt_key_2026
JWT_REFRESH_SECRET=super_secret_jwt_refresh_key_2026
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5174

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Seed Database
Populate initial demo account and sample folder structure:
```bash
npm --workspace=apps/server run seed
```
> **Pre-configured Demo Account**: `demo@disk.uz` / `password123`

### 5. Run in Development
From the monorepo root:
```bash
npm run dev
```
- **Web App**: [http://localhost:5174](http://localhost:5174)
- **Backend API**: [http://localhost:5050](http://localhost:5050)
- **API Health**: [http://localhost:5050/health](http://localhost:5050/health)

### 6. Run Test Suite
```bash
npm run test
```
All integration and unit tests across server and client pass with zero third-party network dependencies.

### 7. Build for Production
```bash
npm run build
npm start
```

---

## 📡 REST API Specification (`/api/v1`)

### Authentication & User
| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/v1/auth/register` | Register new user and dispatch 6-digit OTP code |
| `POST` | `/api/v1/auth/verify-email` | Validate registration email OTP |
| `POST` | `/api/v1/auth/login` | Authenticate user; returns Access Token and Refresh Token |
| `POST` | `/api/v1/auth/refresh-token` | Rotate refresh token and issue new token pair |
| `POST` | `/api/v1/auth/logout` | Revoke active refresh token |
| `GET`  | `/api/v1/auth/me` | Fetch active profile and storage quota usage |

### Folders Management
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET`  | `/api/v1/folders` | Query user folders (supports `parentFolder`, `search`, `isStarred`, `isTrash`) |
| `POST` | `/api/v1/folders` | Create a new folder with custom color |
| `GET`  | `/api/v1/folders/:id/path` | Retrieve ancestor breadcrumb chain |
| `PATCH`| `/api/v1/folders/:id/rename` | Rename folder |
| `PATCH`| `/api/v1/folders/:id/move` | Move folder into another folder or root with cycle prevention |
| `PATCH`| `/api/v1/folders/:id/star` | Toggle starred status |
| `PATCH`| `/api/v1/folders/:id/trash` | Move folder to trash |
| `PATCH`| `/api/v1/folders/:id/restore`| Restore folder from trash |
| `DELETE`| `/api/v1/folders/:id` | Permanently delete folder |

### Files Management
| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/v1/files/upload` | Upload multiple files to Cloudinary with real-time stream |
| `GET`  | `/api/v1/files` | Query user files with category, search, and sorting |
| `PATCH`| `/api/v1/files/:id/rename` | Rename file |
| `PATCH`| `/api/v1/files/:id/move` | Move file to target folder or root |
| `PATCH`| `/api/v1/files/:id/star` | Toggle star on file |
| `PATCH`| `/api/v1/files/:id/trash` | Move file to trash |
| `PATCH`| `/api/v1/files/:id/restore`| Restore file from trash |
| `DELETE`| `/api/v1/files/:id` | Delete file permanently and clean up Cloudinary assets |

### Sharing & Collaboration
| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/v1/share/:type/:id` | Grant folder or file permissions (`viewer` or `editor`) by email |
| `POST` | `/api/v1/share/:type/:id/remove` | Revoke shared access from specified email |
| `POST` | `/api/v1/share/file/:id/public-link` | Enable or disable public sharing link |
| `GET`  | `/api/v1/share/shared-with-me` | Retrieve all items shared with active user |
| `GET`  | `/api/v1/share/public/:token` | Publicly preview or download asset without login |

---

## 📄 License

MIT © 2026 Nurmuhammad Nizomov
