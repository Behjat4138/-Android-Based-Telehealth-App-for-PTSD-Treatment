# PTSDCare

A trauma-informed Progressive Web App (PWA) that helps youth in KwaZulu-Natal, South Africa manage PTSD symptoms through daily mood tracking, clinically validated self-screening, an AI companion, guided breathing and meditation exercises, and an interactive map of local mental health clinics -- available in English and Zulu.

Live app: **https://ptsdcare-5b0fe.web.app**

---

## Architecture

```
+------------------------------- BROWSER --------------------------------+
|                                                                        |
|   React 19 SPA (Create React App)                                      |
|                                                                        |
|   src/App.js          -- auth state, global lang state, page routing  |
|   src/firebase.js     -- Firebase SDK init                            |
|   src/App.css         -- all styles (single stylesheet)               |
|                                                                        |
|   src/pages/                                                           |
|   +------------------+  +------------------+  +--------------------+  |
|   | LandingPage      |  | Dashboard        |  | Login / Register   |  |
|   | (public home)    |  | (7 feature cards)|  | (Firebase Auth)    |  |
|   +------------------+  +------------------+  +--------------------+  |
|   +------------------+  +------------------+  +--------------------+  |
|   | MoodTracker      |  | Screening        |  | ScreeningHistory   |  |
|   | (emoji log+chart)|  | (PCL-5/PC-PTSD5) |  | (saved results)    |  |
|   +------------------+  +------------------+  +--------------------+  |
|   +------------------+  +------------------+  +--------------------+  |
|   | AITherapist      |  | CopingResources  |  | Meditation         |  |
|   | (Groq Llama 3.1) |  | (guided chooser) |  | (2-min guided)     |  |
|   +------------------+  +------------------+  +--------------------+  |
|   +------------------+                                                 |
|   | ClinicMap        |                                                 |
|   | (Leaflet/OSM)    |                                                 |
|   +------------------+                                                 |
|                                                                        |
+------------------------------------------------------------------------+
         |                    |                        |
         v                    v                        v
+----------------+   +------------------+   +--------------------+
| Firebase Auth  |   | Firestore DB     |   | Groq API           |
| (Google)       |   | (Google Cloud)   |   | llama-3.1-8b-inst. |
|                |   |                  |   | (free tier)        |
| - Email/pass   |   | /moods           |   +--------------------+
| - Email verify |   |   userId         |
| - Pwd reset    |   |   date, mood,    |       |
+----------------+   |   moodValue,note |       v
                     |                  |  +--------------------+
         |           | /screenings      |  | OpenStreetMap      |
         v           |   userId         |  | + Leaflet.js       |
+----------------+   |   testId, score  |  | (free, no key)     |
| Firebase       |   |   level, answers |  +--------------------+
| Hosting        |   |   date           |
| (deployment)   |   +------------------+
+----------------+
```

### How navigation works
No React Router. `App.js` holds a `page` string in state (`"mood"`, `"screening"`, `"ai"`, etc.). Every page component receives `setPage` as a prop and calls it to navigate. The `lang` string (`"en"` or `"zu"`) is also held in `App.js` and passed to every page.

---

## Prerequisites

| Tool | Minimum version | Check with |
|---|---|---|
| Node.js | 18.x | `node --version` |
| npm | 9.x | `npm --version` |
| Git | any | `git --version` |

A Firebase project and a Groq API key are required. Both are free with no credit card.

---

## Local Setup (under 15 minutes)

### Step 1 -- Clone the repo

```bash
git clone https://github.com/your-username/ptsdcare.git
cd ptsdcare
npm install
```

### Step 2 -- Get a free Groq API key

1. Go to [console.groq.com](https://console.groq.com) and create a free account
2. Click **API Keys** in the left sidebar
3. Click **Create API Key**, give it any name, copy the key (starts with `gsk_...`)

> Keys on the free plan do not expire. If a previous key stopped working, your old one was from a temporary trial -- just create a new one in the same console.

### Step 3 -- Add the Groq key

Open `src/pages/AITherapist.js` and find line 9:

```js
const GROQ_KEY = "PASTE_YOUR_GROQ_KEY_HERE";
```

Replace the placeholder with your key:

```js
const GROQ_KEY = "gsk_yourActualKeyHere";
```

Save the file.

### Step 4 -- Firebase config (already set up for this project)

The Firebase config for this project is already in `src/firebase.js`. No changes needed to run the existing project.

If you are setting up your own Firebase project (e.g. for a fork):
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a project > Add a web app > copy the config object
3. Replace the contents of `src/firebase.js` with your config
4. Enable **Authentication** (Email/Password provider)
5. Enable **Firestore Database** (start in test mode)

### Step 5 -- Start the app

```bash
npm start
```

The app opens at `http://localhost:3000`. The browser console may show a Firestore index warning on first mood chart load -- this is expected and handled automatically (see Known Limitations).

---

## Environment Variables

The app uses one variable that must be set manually in source code (see Step 3 above). There is no `.env` file required to run the project.

| Variable | Where to set it | What it does |
|---|---|---|
| `GROQ_KEY` | `src/pages/AITherapist.js` line 9 | Authenticates the AI Companion with Groq's free LLM API |

If you want to move the Firebase config to environment variables (recommended for forks):

Create a `.env` file in the project root:

```
REACT_APP_FIREBASE_API_KEY=your_value
REACT_APP_FIREBASE_AUTH_DOMAIN=your_value
REACT_APP_FIREBASE_PROJECT_ID=your_value
REACT_APP_FIREBASE_STORAGE_BUCKET=your_value
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_value
REACT_APP_FIREBASE_APP_ID=your_value
```

A `.env.example` file is included in the repo root with these keys (empty values) for reference.

---

## Test User Credentials

Use these to test the app without creating a new account:

| Role | Email | Password |
|---|---|---|
| Standard user | testuser@ptsdcare.app | TestUser123! |

> If these credentials do not work, register a new account at the live URL. Email verification is required -- use a real email address you can access.

**Account types:** There is only one user role. All authenticated users have access to all features. There is no admin panel.

---

## External Services

| Service | Provider | Purpose | Cost |
|---|---|---|---|
| Firebase Authentication | Google | Email/password login, verification, password reset | Free tier |
| Firestore | Google Cloud | Stores mood entries and screening history | Free tier |
| Firebase Hosting | Google | Serves the production build | Free tier |
| Groq API | Groq Inc. | Powers the AI Companion (Llama 3.1 8B) | Free tier |
| OpenStreetMap + Leaflet | Community / Open Source | Map tiles for clinic finder | Free, no key needed |
| Google Fonts | Google | Fraunces + DM Sans typography | Free, no key needed |

---

## Folder Structure

```
ptsdcare/
|-- public/
|   |-- index.html          # App shell, PWA meta tags
|   |-- manifest.json       # PWA manifest (name, icons, theme colour)
|
|-- src/
|   |-- App.js              # Root: auth state, lang state, all page routing
|   |-- App.css             # Complete stylesheet for all pages
|   |-- firebase.js         # Firebase SDK init, exports auth + db
|   |-- index.js            # React DOM entry point
|   |
|   |-- pages/
|       |-- LandingPage.js      # Public page: hero, grounding, breathing, crisis resources
|       |-- Login.js            # Email/password login with client-side email validation
|       |-- Register.js         # Account creation with Firebase email verification
|       |-- Dashboard.js        # Post-login home: 7 feature cards + EN/ZU language toggle
|       |-- MoodTracker.js      # Daily mood log: emoji picker, avatar cheer, chart, Firestore
|       |-- Screening.js        # PC-PTSD-5 + PCL-5 questionnaires, scoring, save to Firestore
|       |-- ScreeningHistory.js # View and delete past screening results from Firestore
|       |-- CopingResources.js  # Conversational chooser: breathing, grounding, Amazon links
|       |-- AITherapist.js      # Chat UI powered by Groq (Llama 3.1), EN/ZU
|       |-- Meditation.js       # Guided 2-min meditation: orb animation, script phases, timer
|       |-- ClinicMap.js        # Leaflet map with 12 pre-loaded KZN mental health clinics
|
|-- .env.example            # Template listing all environment variables (values empty)
|-- .gitignore              # Includes .env
|-- package.json
|-- firebase.json           # Firebase Hosting config
|-- .firebaserc             # Firebase project alias
```

---

## Deploying to Firebase Hosting

```bash
# Build production bundle
npm run build

# Deploy (requires Firebase CLI: npm install -g firebase-tools)
firebase login
firebase deploy
```

---

## Screening Tests Reference

| Test | Items | Format | Threshold |
|---|---|---|---|
| PC-PTSD-5 | 5 | Yes / No | Score >= 3 = positive screen |
| PCL-5 | 20 | 0-4 Likert | >= 33 probable PTSD, 20-32 moderate |

Results are saved to the `screenings` Firestore collection and viewable in Screening History. Results are not a clinical diagnosis -- the app states this clearly at every step.

---

## Known Limitations

**1. Groq API key is in client-side source code**
The `GROQ_KEY` constant in `AITherapist.js` is included in the browser bundle. For a production system this should be moved to a server-side proxy (e.g. Firebase Cloud Function) so the key is never exposed. For this academic demo the Groq free tier has no billing, so the risk is acceptable.

**2. No Firestore security rules**
The `moods` and `screenings` collections do not currently enforce `userId == auth.uid` in Firestore Rules. Any authenticated user could query another user's data if they knew their UID. Recommended rules are documented in the tech debt issues.

**3. Mood chart may not sort on first load**
The mood chart uses a simple Firestore query without `orderBy` (to avoid requiring a composite index). Data is sorted client-side. On accounts with many entries across multiple days, the chart will still render correctly -- just not from a server-side sorted query.

**4. Clinic map uses static data**
The 12 clinics shown in the KZN clinic finder are hardcoded. The map does not pull live data from any directory API. Clinic details (hours, phone numbers) may become outdated.

**5. AI Companion has no memory between sessions**
Each chat session starts fresh. The AI does not have access to the user's mood history or past conversations.

---

## Project Info

**Course:** Health Informatics
**Student:** Behjat Riyaz
**Year:** 2025
**Firebase project ID:** ptsdcare-5b0fe
