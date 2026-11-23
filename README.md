# Aram Events — Local AI Website Studio

## Features
- Local email/password registration and login (no JWT). Passwords are stored as salted scrypt hashes in `backend/data/users.json`.
- In-memory sessions using an HttpOnly cookie; restarting the backend signs users out. No session secret is needed.
- No Razorpay, payment flow, API key, or JWT secret.
- Local Ollama model: `qwen2.5:0.5b`.
- AI-generated full HTML websites with varied design directions, flyer OCR (JPG/PNG/WEBP/PDF), template library and visual editor.
- Local AI chatbot powered by Ollama.
- Per-account website history, drafts, saved edits and published status in `backend/data/projects.json`.
- Mixed-theme 3D interface across the public landing, sign-in/register, workspace, generator, editor and template library.
- 3D animated atmosphere, glass panels, depth-based hover interactions and responsive navigation.
- Event bookings workspace with per-account booking records, guest details, ticket type/quantity, booking value, status, search, edit and delete.

## Requirements
- Node.js 20 or newer
- Ollama installed and running
- `ollama pull qwen2.5:0.5b`

## Run on Windows PowerShell
Open PowerShell in `backend` and run:

```powershell
Copy-Item .env.example .env -Force
$env:TEMP = 'E:\Temp'
$env:TMP = 'E:\Temp'
$env:npm_config_cache = 'E:\npm-cache'
npm install --cache 'E:\npm-cache'
npm start
```

Open `http://localhost:5000`. Create an account, then sign in.

## Bookings workspace
- Open `http://localhost:5000/bookings.html` after signing in, or use the **Bookings** item in the workspace navigation.
- Booking records are stored in `backend/data/bookings.json` and scoped to the signed-in account.
- API: `GET /api/bookings`, `POST /api/bookings`, `PUT /api/bookings/:id`, `DELETE /api/bookings/:id`. All booking endpoints require a signed-in session.
- The booking manager records reservations; it does not collect payments or issue payment confirmations.

## Important
This is a local development login, not production-grade identity management. Sessions are stored in memory and expire when the server restarts. Do not expose this development server directly to the public internet.

## New account workspace features
- Sign in and open the dashboard to see your account name, email, website count, drafts and published websites.
- AI-generated websites are saved to the signed-in account automatically.
- Open a saved project from the dashboard and use **Save** in the editor to update the account copy.
- Use the floating Aram Assistant button on the dashboard, generator and editor to chat with the local model.
- Project records are stored locally in `backend/data/projects.json`; keep this file backed up.
