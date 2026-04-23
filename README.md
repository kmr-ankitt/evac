# Evac — Rapid Crisis Response Platform
> Google Solution Challenge 2026 | Team Voxforge

## Live Demo
https://your-app.vercel.app

## Demo Login
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hotel.com | Admin123 |
| Security | security@hotel.com | Security123 |
| Medical | medical@hotel.com | Medical123 |
| Management | mgmt@hotel.com | Mgmt123 |

## Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, deployed on Vercel (free)
- **Backend**: Next.js API Routes (serverless)
- **Database**: Firebase Firestore + Realtime Database (Spark free plan)
- **Auth**: Firebase Authentication (free)
- **AI**: Google Gemini 1.5 Flash via @google/generative-ai (free)
- **Notifications**: Firebase Cloud Messaging (free)
- **Maps**: Google Maps JavaScript API

## Google AI Services Used
- Gemini 1.5 Flash — emergency triage classification, task generation, incident report writing

## Setup
1. Clone repo
2. Copy `.env.example` to `.env.local` and fill in your keys
3. `npm install && npm run dev`

---

## Vercel Deployment Steps
1. Push code to GitHub public repo
2. Go to vercel.com → New Project → Import GitHub repo
3. Framework: Next.js (auto-detected)
4. Add all env vars in Vercel dashboard → Settings → Environment Variables
5. Click Deploy — Vercel gives free URL: https://your-app.vercel.app
6. Re-deploy auto on every git push to main

## Firebase Free Tier Limits
- **Firestore**: 50K reads/day, 20K writes/day — more than enough for demo
- **Realtime DB**: 1GB storage, 10GB/month transfer — fine for prototype  
- **FCM**: completely free, no limits
- **Firebase Auth**: 10K users/month free
- **Firebase Hosting**: NOT needed — using Vercel instead

## Next.js Optimizations Included
- Image optimization enabled in `next.config.ts`.
- All Gemini calls route through server-side `/api` handlers so your API key is entirely hidden from the client.
- Built-in `loading.tsx` skeleton files and `error.tsx` boundaries to ensure robust routing.

---

## Firebase Security Rules

**Firestore Rules:**
*(Paste in Firebase Console → Firestore → Rules)*
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /staff/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }
    match /incidents/{id} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    match /tasks/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /logs/{id} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

**Realtime Database Rules:**
*(Paste in Firebase Console → Realtime Database → Rules)*
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

---

## Google Solution Challenge Submission Answers

**Problem:** 
Hotels and hospitals lack real-time unified coordination during emergencies, leading to delayed response and preventable harm.

**Solution:** 
Evac uses Gemini AI to classify emergencies, auto-generate role-based tasks, and push instant alerts — all coordinated through a live dashboard built on Firebase and Next.js.

**Google AI used:** 
Gemini 1.5 Flash (via @google/generative-ai) for emergency triage classification, auto task generation, and AI-written incident reports.

**Cloud deployed:** 
Yes — Next.js on Vercel, Firebase Firestore/Auth/FCM on Google Cloud.
