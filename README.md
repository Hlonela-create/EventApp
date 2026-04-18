# EventHub — Complete Setup & Deployment Guide

---

## What's Inside

```
eventhub/
├── public/
│   ├── index.html          ← PWA shell with meta tags
│   ├── manifest.json       ← PWA install config (icons, name, theme)
│   └── service-worker.js   ← Offline caching + push notification handler
├── src/
│   ├── App.js              ← Firebase wrapper (data + upload wiring)
│   ├── EventApp.jsx        ← Your full UI (unchanged visually)
│   ├── firebase.js         ← Firebase SDK setup + upload helper
│   ├── useFirestore.js     ← Real-time Firestore hook + write helpers
│   ├── useUpload.js        ← Firebase Storage upload hook
│   ├── index.js            ← React entry point + PWA registration
│   └── serviceWorkerRegistration.js
├── .env.example            ← Environment variable template
├── vercel.json             ← Vercel deployment config
├── netlify.toml            ← Netlify deployment config
├── firestore.rules         ← Firestore + Storage security rules
└── package.json
```

---

## STEP 1 — Set Up Firebase (Free)

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"** → name it `eventhub` → Continue
3. Disable Google Analytics (optional) → **Create project**

### Enable Firestore
- Left sidebar → **Build → Firestore Database**
- Click **"Create database"**
- Choose **"Start in test mode"** → select your region → Enable

### Enable Storage
- Left sidebar → **Build → Storage**
- Click **"Get started"** → test mode → Done

### Enable Push Notifications (optional)
- Left sidebar → **Build → Cloud Messaging**
- Go to **Project Settings → Cloud Messaging**
- Under "Web Push certificates" → click **"Generate key pair"**
- Copy the **VAPID key**

### Get Your Config
- **Project Settings** (gear icon) → **General** → scroll to **"Your apps"**
- Click **"</> Web"** → name it `eventhub-web` → Register
- Copy the `firebaseConfig` object shown

---

## STEP 2 — Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase values:
   ```
   REACT_APP_FIREBASE_API_KEY=AIza...
   REACT_APP_FIREBASE_AUTH_DOMAIN=eventhub-xxx.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=eventhub-xxx
   REACT_APP_FIREBASE_STORAGE_BUCKET=eventhub-xxx.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=1:123:web:abc123
   REACT_APP_FIREBASE_VAPID_KEY=BK...yourVapidKey
   ```

> **Without Firebase**: The app still works fully using local in-memory data.
> Just don't create the `.env` file — it will run with seed data automatically.

---

## STEP 3 — Apply Security Rules

In Firebase Console:

**Firestore Rules** → Firestore → Rules tab → paste contents of `firestore.rules`

**Storage Rules** → Storage → Rules tab → paste:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 500 * 1024 * 1024;
    }
  }
}
```

---

## STEP 4 — Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm start
```

App opens at **http://localhost:3000**

---

## STEP 5 — Deploy to Vercel (Recommended — Free)

### Option A: Via CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts:
#   Project name: eventhub
#   Framework: Create React App
#   Build command: npm run build
#   Output dir: build
```

### Option B: Via GitHub (Recommended)
1. Push your project to a GitHub repo
2. Go to **https://vercel.com** → New Project → Import your repo
3. Add environment variables:
   - Go to **Settings → Environment Variables**
   - Add each `REACT_APP_*` variable from your `.env` file
4. Click **Deploy**
5. Your live URL will be: `https://eventhub-xxx.vercel.app`

---

## STEP 5b — Deploy to Netlify (Alternative)

```bash
# Build first
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

Or drag-and-drop the `build/` folder at **https://app.netlify.com/drop**

Add environment variables in **Site Settings → Environment Variables**.

---

## STEP 6 — PWA (Install on Phone)

Once deployed:

**On Android:**
- Open the live URL in Chrome
- Tap the **"Add to Home Screen"** banner or
- Chrome menu (⋮) → "Install app"

**On iOS:**
- Open in Safari
- Tap **Share → Add to Home Screen**

The app will install like a native app with your icon and splash screen.

---

## Admin Login

| Field         | Value      |
|---------------|------------|
| Force Number  | `00000001` |
| Password      | `admin123` |

**Admin can:**
- Upload images/videos (stored in Firebase Storage)
- Create/edit/delete events with real media
- Manage users, bases, announcements, news
- All changes reflect in real-time for all users

---

## Demo User Accounts

| Name          | Force #    | Password   | Base |
|---------------|------------|------------|------|
| Thabo Nkosi   | `13008976` | `OTP12345` | JHB  |
| Zanele Dlamini| `13009012` | `OTP67890` | CPT  |
| Sipho Mthembu | `13011234` | `OTP11111` | DBN  |

> First-login users (Thabo, Zanele) are prompted to set a new password on first sign-in.

---

## How Uploads Work

1. Admin opens **Edit Event** → clicks the upload zone
2. File is sent to **Firebase Storage** under `/events/` folder
3. A permanent CDN URL is returned and saved to Firestore
4. All users see the new image/video **instantly** (real-time)

**Supported formats:** JPG, PNG, GIF, WebP, MP4, MOV, WebM  
**Max file size:** 500 MB (configurable in Storage rules)

---

## Future: Add Subscriptions

The architecture is ready. When you want to add payments:

1. Add **Stripe** or **PayFast** (South Africa) SDK
2. Create a `subscriptions` Firestore collection
3. Add a `subscription` field to the `users` collection
4. Gate certain routes/features based on `user.subscription`

No structural changes needed — the foundation is already in place.

---

## Folder Structure (Full)

```
eventhub/
│
├── public/                     # Static assets served as-is
│   ├── index.html              # App shell + PWA meta
│   ├── manifest.json           # PWA manifest (icons, name, colors)
│   ├── service-worker.js       # Offline caching + push notifications
│   ├── favicon.ico             # Tab icon (replace with your logo)
│   ├── logo192.png             # PWA icon 192×192 (replace with your logo)
│   └── logo512.png             # PWA icon 512×512 (replace with your logo)
│
├── src/                        # All React source code
│   ├── index.js                # Entry point + service worker registration
│   ├── App.js                  # Firebase data wrapper
│   ├── EventApp.jsx            # Complete UI (all screens, unchanged)
│   ├── firebase.js             # Firebase SDK + upload + notifications
│   ├── useFirestore.js         # Real-time Firestore hooks
│   ├── useUpload.js            # Firebase Storage upload hook
│   └── serviceWorkerRegistration.js
│
├── .env.example                # Environment variable template
├── .env                        # Your actual keys (DO NOT commit to git)
├── .gitignore                  # Ignores node_modules, .env, build/
├── vercel.json                 # Vercel deployment config
├── netlify.toml                # Netlify deployment config
├── firestore.rules             # Firestore + Storage security rules
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

---

## Troubleshooting

**"Firebase: Error (app/no-app)"**  
→ Your `.env` file is missing or variables aren't prefixed with `REACT_APP_`

**Uploads not working**  
→ Check Firebase Storage rules allow writes  
→ Verify `REACT_APP_FIREBASE_STORAGE_BUCKET` is set correctly

**Push notifications not working**  
→ Requires HTTPS (works on Vercel/Netlify, not on plain HTTP localhost)  
→ Check `REACT_APP_FIREBASE_VAPID_KEY` is set

**PWA not installable**  
→ Must be served over HTTPS  
→ Chrome requires the manifest + service worker to be registered

**App works without Firebase**  
→ If no `.env` is present, the app runs entirely on local seed data  
→ This is intentional — useful for demos and development

---

*Built with React 18 · Firebase 10 · Deployed on Vercel*
