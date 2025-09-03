# Hypergrammy — Ready for Vercel

This folder is pre-configured for Vite + React + Tailwind and uses the correct entry path (`./src/main.jsx`).

## How to use (no Terminal required)
1. Put your full app code into `src/App.jsx` (replace the placeholder component).
2. Push/upload this folder to a GitHub repo.
3. On Vercel: **Import Project** from GitHub.
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: the folder that contains **this** `package.json` and `index.html`.
4. Click **Deploy**.

If you see a 404, double-check:
- `src/main.jsx` exists, and `index.html` uses `./src/main.jsx`.
- Vercel's Root Directory is this folder.
- The repo really has `package.json`, `index.html`, and `src/` at the same level.

Generated 2025-09-03