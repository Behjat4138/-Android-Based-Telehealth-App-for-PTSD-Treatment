# PTSDCare

A trauma-informed Progressive Web App (PWA) that helps youth in KwaZulu-Natal, South Africa manage PTSD through mood tracking, clinically validated self-screening, guided breathing and meditation, an AI companion, and an interactive map of local mental health clinics.

Live demo: **https://ptsdcare-5b0fe.web.app**

---

## What this app does

PTSDCare gives young people (ages 14-25) a private, accessible mental health tool that works on any device. Users can log daily moods, complete PC-PTSD-5 or PCL-5 screening tests, chat with an AI companion, follow guided meditations, use grounding and breathing exercises, and find nearby clinics -- all in English or Zulu.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Create React App) |
| Auth & Database | Firebase Authentication + Firestore |
| Hosting | Firebase Hosting |
| AI Companion | Groq API (llama-3.1-8b-instant, free tier) |
| Map | Leaflet + OpenStreetMap (free, no key needed) |
| Charts | Chart.js + react-chartjs-2 |
| Fonts | Google Fonts (Fraunces + DM Sans) |

---

## Environment Variables

The app needs **one** API key to run the AI Companion. All other services (Firebase, Leaflet, Google Fonts) either use hardcoded config or require no key.

### Required: Groq API Key (free)

1. Go to [console.groq.com](https://console.groq.com) and create a free account (no credit card needed)
2. Click **API Keys** in the sidebar
3. Click **Create API Key** and copy it (starts with `gsk_...`)
4. Open `src/pages/AITherapist.js`
5. Find line 8 and replace the placeholder:

```js
const GROQ_KEY = "PASTE_YOUR_GROQ_KEY_HERE";
```

> **Note:** There is currently no `.env.example` file. The Groq key is hardcoded directly in `AITherapist.js`. If you are forking this repo, replace the key before pushing, or move it to a `.env` file (see Firebase note below).

### Firebase Config

The Firebase project config is hardcoded in `src/firebase.js`. This is acceptable for a client-side app since Firebase security rules control data access, but if you want to keep it out of version control, move the values to a `.env` file:

```
REACT_APP_FIREBASE_API_KEY=your_value
REACT_APP_FIREBASE_AUTH_DOMAIN=your_value
REACT_APP_FIREBASE_PROJECT_ID=your_value
REACT_APP_FIREBASE_STORAGE_BUCKET=your_value
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_value
REACT_APP_FIREBASE_APP_ID=your_value
```

Create a `.env.example` file in the project root with the same keys but empty values, so collaborators know what is needed.

---

## Code Structure

```
ptsdcare/
|-- public/
|   |-- index.html          # App entry point, PWA meta tags
|   |-- manifest.json       # PWA manifest (name, icons, theme)
|
|-- src/
|   |-- App.js              # Root component: auth state, global language state,
|   |                         and all page routing (no React Router -- uses page string state)
|   |-- App.css             # All styles for the entire app (single stylesheet)
|   |-- firebase.js         # Firebase config, exports `auth` and `db`
|   |-- index.js            # React entry point, renders App
|   |
|   |-- pages/
|       |-- LandingPage.js      # Public home page (grounding, breathing, crisis resources)
|       |-- Login.js            # Firebase email/password login with email validation
|       |-- Register.js         # Firebase account creation with email verification
|       |-- Dashboard.js        # Main menu after login, 7 feature cards, EN/ZU toggle
|       |-- MoodTracker.js      # Daily mood logging, emoji picker, chart, Firestore save
|       |-- Screening.js        # PC-PTSD-5 and PCL-5 embedded questionnaires + results
|       |-- ScreeningHistory.js # View and delete past screening results from Firestore
|       |-- CopingResources.js  # Conversational chooser: breathing, grounding, Amazon links
|       |-- AITherapist.js      # Chat interface powered by Groq API (Llama 3.1)
|       |-- Meditation.js       # Guided 2-minute meditation with animated orb + script
|       |-- ClinicMap.js        # Leaflet map with 12 KZN mental health clinics pre-loaded
```

### How routing works

There is no React Router. `App.js` holds a `page` string in state (e.g. `"mood"`, `"screening"`, `"ai"`). Each page component receives `setPage` as a prop and calls it to navigate. This keeps the bundle small and navigation instant.

### How language works

A `lang` state variable (`"en"` or `"zu"`) is held in `App.js` and passed as a prop to every page. Each page has a `LANG` object with English and Zulu strings. The toggle lives in the Dashboard top bar.

---

## External Cloud Services

This app uses **5** external services:

| # | Service | Provider | Purpose | Cost |
|---|---|---|---|---|
| 1 | Firebase Authentication | Google | User login and registration | Free tier |
| 2 | Firestore | Google Cloud | Stores mood entries and screening history | Free tier |
| 3 | Firebase Hosting | Google | Deploys and serves the app | Free tier |
| 4 | Groq API | Groq | Powers the AI Companion (Llama 3.1) | Free tier |
| 5 | OpenStreetMap + Leaflet | Community / Open Source | Map tiles for clinic finder | Free, no key |

Google Fonts (Fraunces + DM Sans) is also loaded from Google's CDN but requires no account or key.

---

## Running Locally

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/your-username/ptsdcare.git
cd ptsdcare

# 2. Install dependencies
npm install

# 3. Add your Groq API key (see Environment Variables section above)
# Open src/pages/AITherapist.js and paste your key on line 8

# 4. Start the development server
npm start
```

The app will open at `http://localhost:3000`.

> The AI Companion still works without a Groq key -- it will show a setup message instead of AI responses. All other features work with no configuration.

---

## Deploying to Firebase Hosting

```bash
# Install Firebase CLI (one time)
npm install -g firebase-tools

# Login
firebase login

# Build the production bundle
npm run build

# Deploy
firebase deploy
```

The app will be live at your Firebase Hosting URL (e.g. `https://ptsdcare-5b0fe.web.app`).

---

## Firestore Setup

Two collections are used. They are created automatically when the first document is saved -- no manual setup needed.

| Collection | Created by | Contains |
|---|---|---|
| `moods` | MoodTracker | `userId`, `date`, `mood`, `moodValue`, `note`, `createdAt` |
| `screenings` | Screening | `userId`, `testId`, `testTitle`, `score`, `level`, `answers`, `date` |

### Composite index (needed for mood chart)

The mood chart queries moods ordered by date. Firestore requires a composite index for this. If the chart fails silently, create the index:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project > Firestore Database > Indexes
3. Click **Add Index**
4. Collection: `moods`, Fields: `userId` (Ascending) + `date` (Ascending)

The app has a fallback that works without the index, but the chart may not sort correctly.

---

## Authentication Notes

- Users must verify their email before they can log in
- Fake or invalid email addresses (e.g. `test@test`) are rejected client-side before Firebase is called
- Password reset is available from the login screen

---

## Screening Tests

| Test | Items | Format | Positive threshold |
|---|---|---|---|
| PC-PTSD-5 | 5 | Yes / No | Score >= 3 |
| PCL-5 | 20 | 0-4 Likert scale | Score >= 33 (probable PTSD), >= 20 (moderate) |

Results are saved to Firestore and viewable in Screening History. Results are **not a clinical diagnosis** and the app makes this clear at every step.

---

## Language Support

The app supports **English** and **Zulu (isiZulu)**. The toggle is in the Dashboard top bar and applies to all pages globally. The AI Companion also responds in Zulu if the user writes in Zulu.

---

## Crisis Resources in the App

The following are shown throughout the app, especially on the landing page and in the AI Companion:

- **SA Suicide Crisis Line:** 0800 567 567
- **988 Suicide and Crisis Lifeline (US)**
- **Crisis Text Line:** Text HOME to 741741
- **NAMI Helpline:** 1-800-950-6264
- **RAINN:** 1-800-656-4673

---

## Known Limitations

- The Groq API key is currently hardcoded in `AITherapist.js`. For a production deployment, move it to a backend proxy so the key is not exposed in the browser bundle.
- The mood chart requires a Firestore composite index to sort correctly (see Firestore Setup above).
- The clinic map uses pre-loaded static data for 12 KZN clinics. It does not query live data.

---

## Project Info

**Course:** Health Informatics / Final Year Project
**Institution:** [Your institution]
**Student:** Behjat Riyaz
**Year:** 2025
