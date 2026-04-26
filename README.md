# Evac

Emergency coordination system for hotels, hospitals, and large facilities. Built for Google Solution Challenge 2026.

---

## What it does

When an emergency is declared, Evac:

1. Pushes browser notifications to all staff immediately via FCM
2. Calls Gemini to generate role-specific tasks (security, medical, management, admin) based on the incident type and location
3. Shows a live dashboard — staff status, event log, task board — all updating in real time via Firestore
4. Lets any staff member describe a situation in plain text and get an AI triage analysis back
5. Generates a formatted incident report from past incidents on demand

The idea: cut the time between "something is wrong" and "everyone knows what to do."

---

## Stack

- **Next.js 14** (App Router) — frontend + serverless API routes
- **Firebase** — Auth, Firestore (persistent data), Realtime Database (live incident state), FCM (push notifications)
- **Gemini 2.0 Flash** — task generation, triage analysis, report writing
- **Google Maps JS API** — incident location on dashboard
- **Vercel** — deployment

Everything runs on free tiers.

---

## Setup

**Prerequisites:** Node 18+, a Firebase project (Spark plan), Gemini API key, Vercel account.

```bash
git clone https://github.com/kmr-ankitt/evac.git
cd evac
npm install
cp .env.example .env.local
```

**Firestore rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /staff/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }
    match /incidents/{id} { allow read, create, update: if request.auth != null; }
    match /tasks/{id}     { allow read, write: if request.auth != null; }
    match /logs/{id}      { allow read, create: if request.auth != null; }
  }
}
```

**Realtime Database rules:**
```json
{
  "rules": {
    "activeIncident": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

Edit `public/firebase-messaging-sw.js` with your Firebase config (lines 10–14).

```bash
npm run dev
# http://localhost:3000
```

Then visit `/api/seed` once to create demo users, login as `admin@hotel.com` / `Admin123`, and click "Seed Demo" in the navbar.

---

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hotel.com | Admin123 |
| Security | security@hotel.com | Security123 |
| Medical | medical@hotel.com | Medical123 |
| Management | mgmt@hotel.com | Mgmt123 |

---

## API routes

| Route | What it does |
|-------|-------------|
| `POST /api/alert` | Sends FCM push to all staff |
| `POST /api/gemini/tasks` | Generates role-based task list from incident details |
| `POST /api/gemini/triage` | Analyzes a situation description, returns severity + action steps |
| `POST /api/gemini/report` | Writes a formal incident report from stored incident data |
| `GET /api/seed` | Creates demo users (run once) |
| `GET /api/seed-demo` | Populates a demo incident |

---

## Deploy

```bash
git push origin main
```

Import the repo on [vercel.com](https://vercel.com), add all env vars under Settings → Environment Variables, deploy. Then hit `/api/seed` on the production URL.

---

## Known limitations

This is a prototype. Before putting it in front of real emergencies:

- No rate limiting on API routes
- Only one active incident at a time — resolving it clears state for everyone
- No user registration; accounts must be seeded manually
- Push notifications require HTTPS (won't work on localhost)
- No task reassignment after AI generates them
- No SMS/email fallback if browser notifications fail
- No offline support

---

## Team

Team Voxforge — Google Solution Challenge 2026
