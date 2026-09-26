# MERN Cloud Disk — Agent Rules & Engineering Guidelines

> [!IMPORTANT]
> All AI agents (Antigravity, Claude, Cursor, Copilot) working on this repository **MUST** strictly follow the architectural guidelines, design principles, and engineering rules defined below.

---

## 1. Architectural Stack & Principles

- **Monorepo**: Turborepo (`apps/web` and `apps/server`) with npm workspaces.
- **Backend Stack**:
  - Node.js (TypeScript) + Express.js.
  - Database: MongoDB Atlas via Mongoose ORM.
  - Media Storage: Cloudinary (Buffer streaming via `cloudinary.uploader.upload_stream`).
  - Authentication: JWT Dual-Token architecture (15-min Access Token, 30-day Refresh Token with database-level rotation).
  - Transactional Emails: Nodemailer with Gmail SMTP (`service: 'gmail'`) with development fallback.
  - Structured Logging: Winston logger + Morgan HTTP telemetry stream.
  - Error Handling: `express-async-errors` with custom `AppError` and centralized `errorHandler`.
  - Semantic Status Codes: `http-status-codes` (`StatusCodes.OK`, `StatusCodes.CREATED`, `StatusCodes.NOT_FOUND`, etc.).
  - Layered Clean Architecture: `routes` -> `controllers` -> `services` -> `models` -> `utils`.
- **Frontend Stack**:
  - React 18 + Vite + TypeScript.
  - CSS Architecture: **Bulma CSS** (`bulma/css/bulma.min.css`) + customized modern CSS variables and dark-mode tokens.
  - State Management: **Zustand** ONLY (Strictly NO React Context for global domain state).
  - Data Fetching & Caching: **TanStack React Query v5** (`useQuery`, `useMutation`, and selective cache invalidation).
  - Notifications: **Zustand-powered Toaster** (`useToastStore`, `toast.success`, `toast.error`, `toast.info`).
  - Icons: `lucide-react`.
  - Date Formatting: Locked to `DD.MM.YYYY` via central `date.ts` utility (`fmtDate`, `fmtDateTime`).
  - Internationalization: Supported languages are **English (`en`)** and **Russian (`ru`)**. All user-facing strings must have corresponding translation keys in `i18n/translations.ts`.

---

## 2. API Response Specification (Strict Envelope)

All API responses **MUST** adhere to the standardized response envelope defined in `utils/responseHelper.ts`:

### Success Envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-09-26T12:00:00.000Z"
}
```

### Error Envelope:
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Item not found or access denied",
  "error": "Error stack / details (dev only)",
  "timestamp": "2026-09-26T12:00:00.000Z"
}
```

- Always prefix API endpoints with `/api/v1/*`.
- Never introduce hacky duplicate routes (e.g., `/api/v1/api/v1` or `/v1`); keep all endpoints standardized under `/api/v1/*`.

---

## 3. UI/UX & Interaction Design Standards

- **Google Drive & Yandex Disk Aesthetic**: High-craft SaaS tokens, clean card shadows, muted borders, subtle hover transitions.
- **Drag & Drop Standards**:
  - **Internal Drag Type**: Internal items (cards, table rows) must set `application/x-disk-item` in `dataTransfer`.
  - **Dropzone Overlay Isolation**: Full-screen OS file dropzone (`DropzoneOverlay`) must check `dataTransfer.types.includes('Files') && !dataTransfer.types.includes('application/x-disk-item')` so internal drag actions never false-trigger the upload overlay.
  - **Drop Targets**: Folder cards, table rows, and Breadcrumbs ("My Drive" root and ancestors) act as drop targets with `.drop-target-active` highlight.
  - **Cycle Prevention**: Backend strictly checks that folders cannot be moved into themselves or their own subfolders.
- **Toast Notifications**:
  - Every asynchronous operation (move, rename, trash, restore, delete, star, upload, link copy) must emit clear toast feedback.
  - Automatic error handling with API message extraction.
- **Loading State Feedback**:
  - Actions modifying items must show immediate visual feedback (`isDeleting` spinner overlay, row loading opacity, button spinner).
- **Multi-Selection**:
  - Checkbox selection ("galochka") on cards and table rows.
  - Floating bottom action bar with count display, batch delete, batch restore, and deselect actions.

---

## 4. Verification & Testing Standards

- All unit and integration tests must pass cleanly:
  ```bash
  npm run test
  ```
- Full production compilation across workspaces:
  ```bash
  npm run build
  ```
  Both `apps/web` and `apps/server` must compile with 0 TypeScript and Vite errors.
- Never use live third-party network calls in automated tests; mock Cloudinary, Nodemailer, and MongoDB appropriately.

---

## 5. Deployment

- Single-host deployment on Vercel or standalone Node.js.
- In production, Express automatically serves static React assets from `apps/web/dist` for non-API routes.
