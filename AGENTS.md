# MERN Cloud Disk — Agent Rules & Engineering Guidelines

> [!IMPORTANT]
> All AI agents (Antigravity, Claude, Cursor, Copilot) working on this repository **MUST** strictly follow the architectural guidelines and design principles defined below.

---

## 1. Architectural Stack & Principles

- **Monorepo**: Turborepo (`apps/web` and `apps/server`) with `npm@11.16.0` workspaces.
- **Backend Stack**:
  - Node.js (TypeScript) + Express.js
  - Database: MongoDB via Mongoose ORM
  - Cloud Media Storage: Cloudinary (Buffer streaming via `cloudinary.uploader.upload_stream`)
  - Authentication: JWT Dual-Token architecture (15-min Access Token, 30-day Refresh Token rotation in DB)
  - Transactional Emails: Nodemailer with Gmail SMTP (`service: 'gmail'`) with dev fallback
  - Structured Logging: Winston + Morgan HTTP stream logger
  - Error Handling: `express-async-errors` with custom `AppError` and centralized `errorHandler`
  - Semantic Statuses: `http-status-codes` (`StatusCodes.OK`, `StatusCodes.CREATED`, `StatusCodes.NOT_FOUND`, etc.)
  - Architecture: Layered architecture (`routes` -> `controllers` -> `services` -> `models` -> `utils`)
- **Frontend Stack**:
  - React 18 + Vite + TypeScript
  - CSS Framework: **Bulma CSS** (`bulma/css/bulma.min.css`) + custom CSS variables
  - State Management: **Zustand** ONLY (Strictly NO React Context)
  - Data Fetching & Caching: **TanStack React Query v5** (`useQuery`, `useMutation`, query invalidation)
  - Icons: `lucide-react`
  - Real-time Upload: Axios `onUploadProgress` calculating exact byte transfer and percentage (0% - 100%)
  - Themes: Light & Dark mode support (`data-theme="dark"` / `"light"`) persisted in `localStorage`
  - i18n: Multilingual support (`en` as Default, `ru`, `uz`) persisted in `localStorage`

---

## 2. API Response Specification (Strict)

All API responses **MUST** adhere to the standardized response envelope defined in `utils/responseHelper.ts`:

### Success Response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Fayllar ro'yxati olindi",
  "data": { ... },
  "timestamp": "2026-09-26T12:00:00.000Z"
}
```

### Error Response:
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Element topilmadi",
  "error": "Error stack / details (dev only)",
  "timestamp": "2026-09-26T12:00:00.000Z"
}
```

- Always prefix API endpoints with `/api/v1/*`.
- Unmatched API endpoints must return 404 with standardized JSON error message.

---

## 3. UI/UX Guidelines (Google Drive & Yandex Disk Aesthetic)

- **Layout**:
  - Left navigation sidebar with "+ New" button, Drive, Media, Shared with me, Starred, Trash, and 15 GB storage meter.
  - Top header with search bar, Theme toggle (Sun/Moon), Language selector (EN, RU, UZ), View toggle (Grid/List), and User profile.
  - Drag-and-drop full-window overlay for quick uploading.
  - Floating bottom-right upload progress widget displaying active upload speed, individual files, and real-time percentage progress bar.
- **Sharing ("Dostup berish")**:
  - Share with email address with specific permissions: Viewer (`viewer`) or Editor (`editor`).
  - Toggle public link access with unique nano/hex share tokens.
- **Filter & Sort**:
  - Filter pills: All, Images, Documents, Videos, Audio, Archives.
  - Sorting: By Date, By Name, By Size (Ascending / Descending).

---

## 4. Testing & Verification

- Every feature must be tested before deployment.
- Tests are executed via:
  ```bash
  npm run test
  ```
- Build validation:
  ```bash
  npm run build
  ```
  Both `apps/web` and `apps/server` must compile with 0 errors.

---

## 5. Deployment (Vercel & Node.js)

- The project is configured for single-host deployment on Vercel or Node.js.
- In production, Express automatically serves the static built React application from `apps/web/dist` for non-API requests.
- `vercel.json` and `api/index.ts` are pre-configured for Vercel deployment.
