# CrumbSave

**Public demo:** https://abylau2.github.io/crumbsave-react-auth/
**Source repository:** https://github.com/abylau2/crumbsave-react-auth

**Good food, another chance.** CrumbSave is an independently built React university project: a fictional surplus-food Surprise Bag marketplace for Almaty. Visitors can browse demo offers, create a demo listing, and save a demo reservation. No real shops, payments, or pickup bookings are involved.

## Features

- 120 fan-inspired seeded listings from 52 iconic food ideas: 20 per category across Bakery, Meals, Produce, Desserts, Groceries, and Drinks. These are unofficial references with fictional sellers.
- Search by title, business, description, district, or pop-culture source; category, district, price, and availability filters; deterministic sorting; 12 results per page.
- Individual `/bags/:id` details with a working reservation action, quantity decrement, and duplicate prevention.
- Controlled add-bag form with inline validation and an API-backed success state.
- Persistent reservations and listings in browser `localStorage`.
- Loading skeletons, error and retry, empty results, empty reservations, sold-out, success, invalid bag, and custom 404 states.
- Responsive layouts and mobile navigation.
- Firebase Authentication (Email/Password and Google), persistent sessions, a protected `/profile` page and navigation that reacts to the signed-in state.
- Server-data caching with TanStack Query: shared cache, expiration, automatic invalidation after create/reserve, and protection from outdated responses.

## Stack

React 19, Vite 6, JavaScript/JSX, React Router, Firebase Authentication, TanStack Query, Lucide React, standard CSS with custom properties, a simulated Promise API, and localStorage. The catalog still needs no backend; only authentication needs a (free) Firebase project.

## Run locally

Requires Node.js 18 or newer and npm.

```bash
npm install
npm run dev
```

Open the URL printed by Vite. To verify the production bundle:

```bash
npm run build
npm run preview
```

`npm test` runs focused Node tests for data quality, search, combined filtering, price boundaries, sorting, pagination, form validation, seeding, creation, reservations, transient failure, and cancellation. With Python Playwright and Google Chrome installed, start the production preview on port 4173 and run `python3 tests/browser_smoke.py` for an end-to-end smoke check.

## Routes

| Route | Purpose |
|---|---|
| `/` | Editorial home with six API-loaded featured bags |
| `/about` | Project concept and demo limitations |
| `/bags` | Full catalog with URL filters and pagination |
| `/dashboard` | API-based KPIs, breakdowns and interactive filters |
| `/login` | Email/password login and Google sign-in |
| `/signup` | Account creation with validation and Google sign-in |
| `/profile` | **Protected.** Shows the signed-in user's email and UID, with logout |
| `/bags/:id` | Bag details and demo reservation |
| `/add` | Controlled listing form |
| `/reservations` | Saved demo reservations |
| `*` | Custom 404 |

## Project structure

```text
src/
  services/service.js     asynchronous data and persistence boundary
  api/bagsApi.js          compatibility re-export
  layouts/RootLayout.jsx  shared Header, Outlet, Suspense and Footer
  data/fanConcepts.js     52 named food concepts and hand-written variants
  data/seedBags.js        deterministic 120-record demo catalog
  components/             reusable navigation, catalog, cards and states
  firebase.js             Firebase initialisation from VITE_ environment variables
  services/authService.js the only module that calls Firebase Auth
  context/AuthContext.jsx AuthProvider + useAuth (onAuthStateChanged, loading, errors)
  components/ProtectedRoute.jsx  ProtectedRoute and GuestRoute guards
  lib/queryClient.js      TanStack Query client and cache timings
  hooks/queryKeys.js      every cache key in one place
  hooks/queries.js        query and mutation definitions (keys, staleTime, invalidation)
  hooks/useBags.js, useBag.js, useReservations.js, useBagMutations.js   data hooks used by pages
  pages/                  route-level experiences
  utils/                  catalog and validation functions
  styles/                 tokens, global rules, layout, components, responsive
public/images/fan-food/   52 source images and 68 variation crops
public/fonts/             locally stored Instrument Sans and Fraunces fonts and OFL licenses
tests/                    focused unit and browser smoke tests
```

## Simulated API and persistence

All business data access goes through `src/services/service.js`: `getBags`, `getBagById`, `createBag`, `reserveBag`, and `getReservations`. Calls take about 450 ms and accept an optional `AbortSignal`. Returned values are copies so components cannot accidentally mutate storage. `reserveBag` reads the current state at commit time and writes the reduced quantity and reservation together. `createBag` validates fields again at the API boundary and uses a UUID for the new listing.

The first API read seeds `localStorage` with 120 meaningful records. The existing storage key is versioned internally. On migration from the original generic catalog, old `seed-` listings are replaced with new `fan-` listings while user-created `bag-` records and reservation snapshots remain. A later migration updates seeded variation image paths while preserving saved quantities and reservations. Reservations for retired seed listings are marked as archived, with their original details still visible. A stored empty array remains empty. Created bags, reduced quantities, and reservations survive refresh in the same browser. Browser storage can be cleared by the user, so this is a demo rather than a shared account system. To reset intentionally during development, run `localStorage.removeItem('crumbsave:demo:v1'); location.reload()` in DevTools. The API also exports `resetDemoData()` for tests.

To exercise the transient catalog error and retry state, open DevTools on the local app, run `sessionStorage.setItem('crumbsave:fail-next', 'getBags'); location.reload()`, then click **Try again**. This causes one request to reject and does not erase saved data.

## React architecture

`App.jsx` defines nested routes under `RootLayout`. The layout uses `Outlet` to show the current page between shared navigation and footer. Bags, About, Dashboard, Login, Signup and Profile use `React.lazy`; the layout provides a `Suspense` loading message.

`BagsPage` reads filters from `useSearchParams`. Search, category, district, price, availability, sorting and page are stored in the URL. Invalid values use defaults; out-of-range pages are clamped. Text changes use replace navigation. Other filter and page changes support Back/Forward. Detail cards pass catalog context so All Bags and Back restore the URL. `BagDetailsPage` reads its ID using `useParams` and fetches that record through the service.

`useBags` (and `useBag`, `useReservations`) read the shared TanStack Query cache and expose loading, error and success state. Pages derive visible data from that response. Dashboard computes six statistics and category/district counts in `utils/dashboard.js`; category and district filters recalculate both KPIs and bars. Empty datasets avoid division by zero. No numbers represent real revenue.

Pages never call the API or `localStorage` themselves: they use hooks in `src/hooks`, which use `src/services/service.js` (catalog data) and `src/services/authService.js` (Firebase Auth).

See [ROUTING_HOMEWORK_GUIDE.md](ROUTING_HOMEWORK_GUIDE.md) for simple explanations and [TEST_REPORT.md](TEST_REPORT.md) for actual verification commands.

## Deployment

`vercel.json` supplies the SPA rewrite for Vercel. `public/_redirects` supplies the same fallback for Netlify. Both work with the root Vite build. Connect this repository to either host, use `npm run build`, set the publish directory to `dist`, and verify a direct refresh on `/bags/fan-001` and `/reservations`. Firebase variables are needed only for sign-in (see below); without them the catalog works and the auth pages explain what is missing.

The public demo is deployed to GitHub Pages from the `gh-pages` branch. Because Vite bakes `VITE_` variables into the bundle **at build time**, run the build on a machine that has your `.env.local`. Also add the deployed host (`abylau2.github.io`) in Firebase console → Authentication → Settings → Authorized domains, or Google sign-in will fail with `auth/unauthorized-domain`. Run `npm run build:pages` to create `dist-pages` with the correct repository base path. `scripts/write-pages-fallback.mjs` writes a `404.html` redirect: GitHub Pages first responds with its missing-page status for a nested URL, then redirects to the root document, where `main.jsx` restores the route before React mounts. The final page works after refresh; Vercel or Netlify is still preferable because their rewrite rules serve nested routes directly without this intermediate redirect.

## Firebase Authentication setup

1. Create a project at the [Firebase console](https://console.firebase.google.com/) and add a **Web app** (`</>`). Copy its SDK config.
2. **Authentication → Sign-in method:** enable **Email/Password** and **Google**.
3. **Authentication → Settings → Authorized domains:** make sure `localhost` and your deployed host (`abylau2.github.io`) are listed.
4. Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Firebase config field |
|---|---|
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

5. Restart `npm run dev` (Vite reads env files only at startup).

`.env.local` is listed in `.gitignore`; `.env.example` is committed. Firebase web config values identify the project and are not secrets, but access is controlled by the Authorized domains list and Firebase security rules, not by hiding the config. If a variable is missing the app keeps working and the login/signup forms show a "Firebase is not configured" message instead of crashing.

### How authentication is built

- `src/firebase.js` initialises Firebase once from `import.meta.env.VITE_*`.
- `src/services/authService.js` wraps `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signInWithPopup(GoogleAuthProvider)`, `signOut` and `onAuthStateChanged`, and converts Firebase error codes into readable messages (`utils/authErrors.js`). Wrong password and unknown user give the same message.
- `AuthProvider` subscribes to `onAuthStateChanged` in an effect and unsubscribes on cleanup. `useAuth()` returns `{ user, loading, error, signup, login, loginWithGoogle, logout }`. `loading` is true until Firebase has restored or ruled out a saved session, so protected pages never flash the login form for a signed-in user.
- **Persistent sessions:** Firebase keeps the user signed in across refreshes. The login form has a "Keep me signed in" checkbox: checked uses `browserLocalPersistence`, unchecked uses `browserSessionPersistence` (signed out when the tab closes). Signup and the default are persistent.
- `ProtectedRoute` redirects unauthenticated visitors to `/login` and remembers the requested page, so login returns them there. `GuestRoute` sends signed-in users away from `/login` and `/signup`.
- The navigation bar shows **Login / Signup** when signed out and **Profile / Logout** when signed in.

## Caching strategy (TanStack Query)

Catalog data from the simulated API is cached in one shared TanStack Query cache (`src/lib/queryClient.js`). Home, Catalog, Dashboard, Bag details and Reservations read the same entries, so moving between pages reuses data instead of showing a loading skeleton again.

**Query keys** (`src/hooks/queryKeys.js`), from general to specific:

| Data | Key |
|---|---|
| All bags | `['bags', 'list']` |
| One bag | `['bags', 'detail', id]` |
| Reservations | `['reservations']` |

**Expiration / revalidation**

- `staleTime`: bags and bag details 60 s, reservations 30 s. Fresh data is served from the cache with no request.
- Stale data is shown immediately and re-fetched in the background when a component mounts again, when the browser window regains focus, or when the network reconnects.
- `gcTime`: entries that no component uses are removed after 5 minutes.
- Failed requests are not retried silently; the page shows the error state with **Try again**.

**When cached data is invalidated**

| Action | What is invalidated |
|---|---|
| Create a bag (`/add`) | `['bags']` — the catalog list and every bag detail, so the new bag appears in Home, Catalog and Dashboard |
| Reserve a bag | The bag's detail entry is updated with the new quantity immediately, then `['bags']` (quantities in lists and Dashboard) and `['reservations']` are invalidated and re-fetched |

**Loading, error and empty states:** every page handles the pending state (skeletons), the error state (message + retry), and empty results (empty catalog, empty reservations, a bag that does not exist).

**Outdated requests:** each request receives TanStack Query's `AbortSignal`; the simulated API cancels its timer when aborted. When the query key changes (for example from one bag ID to another) or a component unmounts, the old request is cancelled and a late response is never written over newer data. Reserve and Create are mutations, so they are not cancelled mid-commit; their buttons are disabled while pending and a ref guard blocks a second click in the same tick.

## Auth and cache tests

```bash
npm test                          # unit tests, including tests/auth.test.js and tests/cache.test.js
python3 tests/auth_browser.py     # browser check with mocked Firebase endpoints (Playwright + Chrome)
```

`tests/auth_browser.py` mocks Firebase's REST endpoints in the browser, so it verifies the app's own logic (redirects, navigation state, persistence after refresh, logout, cache reuse and invalidation) without a real Firebase project. Real Email/Password and Google sign-in must still be checked manually against your Firebase project.

## Images and fonts

The catalog has 52 concept images and 68 separate close-up crops for variations, so each seeded listing uses a distinct local file. These mostly depict scenes or food from the referenced films, series, manga, and games. The Beef Wellington image comes from Gordon Ramsay's official Hell's Kitchen site; Chaliapin Steak Don uses a real-life recreation because the available anime still did not show the dish clearly. Gojo's Kikufuku uses a product photograph of the actual sweet because the available anime frame shows it too small to recognize. These images are third-party copyrighted material; their use is not licensed for commercial publication. Known image sources and the attribution limits are documented in [IMAGE_CREDITS.md](IMAGE_CREDITS.md). The older 16 Unsplash photos remain available for archived reservations and for newly created bags. Instrument Sans and Fraunces are served locally with their OFL licenses in `public/fonts/`. The images do not represent real marketplace offers or official franchise partnerships. Image URLs include a version suffix so returning visitors receive updated assets.

## Limits

This is one browser's student demo. Listings are fictional and cannot be booked in real life. There is no shared backend, payment, food-safety guarantee, QR pickup ticket, or physical collection verification. `localStorage` persistence is limited to the current browser profile and origin.

## Routing acceptance tests

```bash
npm test
npm run build
npm run build:pages
npm run preview -- --port 4173
# In another terminal, using Python with Playwright installed:
python3 tests/browser_smoke.py
python3 tests/routing_browser.py
```

The routing test also starts a temporary server on port 4175. It serves the Pages build with actual 404 responses to test deep-link restoration. Browser tests use fresh browser contexts and do not reset your normal browser data.

## Repository history

This is homework 6 (Server Data, Caching and Firebase Authentication). It extends the routing project from `abylau2/crumbsave-react-routing`, which stays unchanged as the previous submission. The Pages build uses the base path `/crumbsave-react-auth/`; React Router reads it automatically. The localStorage key is unchanged, so saved listings and reservations keep working.
