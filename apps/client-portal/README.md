## Arealis Magnus – Client Portal

Dedicated frontend that mirrors the ingestion workflow for the Arealis Magnus platform.  
Source lives in `apps/client-portal`; it runs independently from the core dashboard.

---

### 1. Prerequisites

- Node.js 18+ (using v22.14.0 during development)
- npm (ships with Node)
- **All terminal work happens inside the conda env**  
  `conda activate "D:\foresightflow_venv"`

Install dependencies from the project root the first time:

```powershell
conda activate "D:\foresightflow_venv"
cd D:\Magnus-01\apps\client-portal
npm install
```

---

### 2. Local Development

```powershell
conda activate "D:\foresightflow_venv"
cd D:\Magnus-01\apps\client-portal
npm run dev
```

Visit `http://localhost:3000/ingest` to preview the UI.  
The root route redirects to `/ingest`.

---

### 3. Project Structure (Client Portal)

```
apps/client-portal
├─ src/
│  ├─ app/
│  │  ├─ ingest/           # Data ingestion experience
│  │  ├─ layout.tsx        # Global shell with header
│  │  └─ globals.css       # Theme tokens & base styles
│  └─ components/
│     ├─ layout/           # Header and shell helpers
│     └─ ui/               # Reusable primitives (buttons, cards…)
└─ README.md
```

The UI is intentionally hard-coded for now. Replace the placeholders with live API responses once backend endpoints are available.

---

### 4. Linting & Build

```powershell
npm run lint   # ESLint
npm run build  # Production build / sanity check
```

---

### 5. Firebase Hosting (Recommended Deployment)

1. Install tools locally: `npm install -g firebase-tools`
2. Authenticate: `firebase login`
3. Initialise hosting inside `apps/client-portal` if not done yet:
   ```powershell
   firebase init hosting
   ```
4. Deploy manually:
   ```powershell
   firebase deploy --only hosting
   ```

The CI workflow (`.github/workflows/client-portal.yml`) is wired to:

- Run lint → build on every push touching `apps/client-portal/**`
- Deploy to Firebase on pushes to `main` (requires secrets `FIREBASE_SERVICE_ACCOUNT` or `FIREBASE_TOKEN` + `FIREBASE_PROJECT_ID`)

Preview channels can be enabled by extending the workflow with `firebase hosting:channel:deploy`.

---

### 6. Environment Variables

Create a `.env.local` for client-specific toggles if needed.  
Hard-coded placeholders (session IDs, counters, etc.) live inside `src/app/ingest/page.tsx`.

---

### 7. Next steps

- Wire the upload + API forms to the ingest service once the backend endpoints are available.
- Replace static progress widgets with real-time updates (WebSockets or polling).
- Expand CI to cover component/unit tests when available.

---

### 8. Demo API Walkthrough

The ingest screen ships with a live demo call that echoes the Authorization header so you can verify compliance headers without wiring backend services yet.

1. Start the dev server (`npm run dev`) and browse to `http://localhost:3000/ingest`.
2. Click **Test Connection** inside the **Live Bank API Setup** card. The UI will show the endpoint, response code, and a masked header preview.
3. Open your browser DevTools → **Network** tab → select the `https://httpbin.org/anything/arealis-magnus-demo` request.
4. Inspect the **Request Headers** pane to confirm `Authorization: Bearer COMPLIANCE_DEMO_KEY_abc123xyz` is present.

The test endpoint is hosted by `https://httpbin.org/anything` and requires an active internet connection. Offline environments or restrictive firewalls will cause the connection check to surface an inline warning.
