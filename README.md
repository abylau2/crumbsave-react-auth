# CrumbSave

CrumbSave is my React project for the university course. It is a demo website where people can look at "surprise bags" with cheap leftover food in Almaty. The shops and the bags are not real, and you cannot pay or pick up anything.

Deployed site: https://abylau2.github.io/crumbsave-react-auth/

This is homework 7. I turned my homework 6 project (Firebase login and caching) into an installable PWA that also works offline. All features from the earlier homeworks are still there.

## What the app can do

- Look at the list of bags, search them, filter them, sort them and go through pages
- Open one bag and reserve it
- Add a new bag with a form
- See my reservations
- Sign up and log in with email and password, or with Google
- Profile page (only for logged in users) with email and UID
- Log out
- Install the app on a phone or computer, and use it without internet
- Small animations (cards appear one by one, hover effect, reserve button). They are turned off if the system has "reduce motion" on

The navigation bar changes: when you are logged out you see Login and Signup, when you are logged in you see Profile and Logout.

## How to run it

You need Node.js and npm.

```bash
npm install
npm run dev
```

Other commands:

```bash
npm run build    # build the project
npm test         # run the tests
```

## Environment variables and Firebase

The Firebase settings are in environment variables. They start with `VITE_`, because Vite only shows these to the app.

1. Make a project in the Firebase console and add a Web app.
2. In Authentication, turn on Email/Password and Google.
3. Copy `.env.example` to a new file called `.env.local` and write your values there:

```bash
cp .env.example .env.local
```

| Variable | Where to find it in Firebase |
|---|---|
| VITE_FIREBASE_API_KEY | apiKey |
| VITE_FIREBASE_AUTH_DOMAIN | authDomain |
| VITE_FIREBASE_PROJECT_ID | projectId |
| VITE_FIREBASE_STORAGE_BUCKET | storageBucket |
| VITE_FIREBASE_MESSAGING_SENDER_ID | messagingSenderId |
| VITE_FIREBASE_APP_ID | appId |

4. Restart `npm run dev`.

`.env.local` is in `.gitignore`, so it is not on GitHub. `.env.example` is on GitHub and shows which variables are needed. If the variables are missing, the app does not crash. The login pages just show a message that Firebase is not set up.

For the deployed site I also added `abylau2.github.io` in Firebase, Authentication, Settings, Authorized domains. Without this, Google login does not work.

## How login works

- `src/firebase.js` starts Firebase with the environment variables.
- `src/services/authService.js` has all the Firebase login functions (sign up, log in, Google, log out). Only this file talks to Firebase Auth.
- `src/context/AuthContext.jsx` has `AuthProvider` and the `useAuth` hook. It uses `onAuthStateChanged` to know if a user is logged in. It also keeps `loading` and `error`.
- The session stays after a page refresh. On the login page there is a "Keep me signed in" checkbox. If it is on, the login is saved in the browser. If it is off, the user is logged out when the tab is closed.
- `src/components/ProtectedRoute.jsx` sends a user who is not logged in to `/login`. After the login the user goes back to the page he wanted.

## Caching strategy

I used TanStack Query for the server data. All pages use the same cache, so when you go to another page the data is already there and you do not see the loading skeleton again.

Query keys (they are all in `src/hooks/queryKeys.js`):

| Data | Key |
|---|---|
| all bags | `['bags', 'list']` |
| one bag | `['bags', 'detail', id]` |
| reservations | `['reservations']` |

When data is cached and for how long:

- Bags and one bag are fresh for 60 seconds (`staleTime`). In this time the app uses the cache and does not send a new request.
- Reservations are fresh for 30 seconds.
- After that the data is old. The app shows the old data first and loads the new data in the background. This happens when the page opens again, when the browser window gets focus, and when the internet comes back.
- If nobody uses a cache entry, it is deleted after 5 minutes (`gcTime`).

When the cache is invalidated (cleared):

- After a new bag is created: the `['bags']` cache is invalidated, so the new bag shows in the home page, the catalog and the dashboard.
- After a bag is reserved: the bag in the cache is updated at once with the new quantity. Then `['bags']` and `['reservations']` are invalidated and loaded again.

Loading, error and empty states: every page shows a skeleton while loading, an error message with a "Try again" button if the request fails, and an empty message if there is no data.

Old requests: TanStack Query gives every request an `AbortSignal`. If the user goes to another bag or leaves the page, the old request is cancelled, so an old answer cannot replace a newer one.

The code for this is in `src/lib/queryClient.js` (times), `src/hooks/queries.js` (queries and mutations) and the hooks `useBags`, `useBag`, `useReservations`, `useBagMutations`.

## Pages

| Route | What it is |
|---|---|
| `/` | Home page. It has the About section: the About link in the header scrolls to it |
| `/about` | About the project |
| `/bags` | Catalog with filters and pages |
| `/bags/:id` | One bag, reserve button |
| `/add` | Form for a new bag |
| `/reservations` | My reservations |
| `/dashboard` | Numbers about the bags |
| `/login` | Login |
| `/signup` | Sign up |
| `/profile` | Profile (protected) |
| `/offline` | Offline page with Retry Connection (also pre-cached as `offline.html`) |
| `*` | 404 page |

## Project folders

```text
public/          manifest, icons, offline.html, fonts, images
sw/              service worker template
scripts/         build scripts (API files, service worker)
src/
  components/    small parts of the pages, ProtectedRoute
  context/       AuthContext
  hooks/         hooks for data and the cache
  lib/           TanStack Query client, connection status store
  pwa/           service worker registration and install button logic
  pages/         one file for each page
  services/      service.js (fake API with localStorage) and authService.js (Firebase)
  utils/         validation and helper functions
  firebase.js    Firebase setup
tests/           tests
```

The pages do not use `localStorage` or `fetch` by themselves. They use hooks, and the hooks use the services.

## Fake API

There is no real server, so the API has two parts:

- **Public catalog (over the network).** Before every build, `scripts/generate-api.mjs` writes the catalog as JSON files: `api/bags.json` (the list) and `api/bags/<id>.json` (one bag). The app loads them with `fetch`. This is the data that the service worker caches.
- **Personal data (in the browser).** `src/services/service.js` waits about 450 ms and keeps stock, reservations and the bags you add in `localStorage`. They stay after a refresh, but only in the same browser, and they work offline.

When the catalog is loaded, public fields (title, price, picture, ...) come from the JSON file and the quantity comes from `localStorage`. If the request fails, the app uses the saved copy and shows a message. It does not crash.

## PWA and offline mode

### Install

`public/manifest.webmanifest` has the name, short name, `start_url`, `scope`, `display: standalone`, theme and background colors and icons (192, 512 and a maskable one). The manifest is linked in `index.html`. All paths in it are relative, so it works under `/crumbsave-react-auth/`. In Chrome or Edge use the install icon in the address bar, or the "Install app" link in the menu.

### Service worker

I wrote it by hand (no Workbox). The template is `sw/sw.template.js`. After `vite build`, `scripts/build-sw.mjs` lists the built files and writes `sw.js` with a version that is a hash of those files. When any file changes, the version changes, and browsers install the new worker.

| Event | What it does |
| --- | --- |
| `install` | Downloads the app shell into the cache `crumbsave-precache-<version>`: index.html, built JS and CSS, fonts, icons, manifest and `offline.html`. It does **not** skip waiting. |
| `activate` | Deletes every `crumbsave-*` cache that is not current, then takes control of the open tabs. |
| `fetch` | Chooses a strategy (see below). Only same-origin `GET` requests are handled. |

### Caching strategies

| What | Strategy | Cache | Limit |
| --- | --- | --- | --- |
| Built JS, CSS, fonts, icons | Pre-cache, then cache-first | `crumbsave-precache-<version>` | whole shell, replaced on update |
| Images, icons, fonts seen later | **Cache-first** | `crumbsave-static-v1` | 80 files, oldest are deleted |
| `api/bags.json`, `api/bags/<id>.json` | **Network-first** (4 s timeout, then saved copy) | `crumbsave-api-v1` | 60 files, saved answers older than 7 days are not used |
| Page navigation to an app route (`/`, `/bags`, `/bags/5`, ...) | App shell from the cache | precache | |
| Page navigation to an unknown address, when the network fails | `offline.html` | precache | |

When a saved API answer is used, the worker adds the headers `x-crumbsave-source: cache` and `x-crumbsave-cached-at`. The app reads them and shows the banner "Showing saved data".

**Privacy.** The worker ignores requests to other domains, so Firebase and Google sign-in calls (tokens, login responses) are never stored. It also ignores requests with an `Authorization` header. Reservations and your own bags are in `localStorage`, not in a shared cache.

### Updates

1. The browser checks `sw.js` when the page loads, every hour and when the tab becomes visible.
2. A new worker installs in the background and waits.
3. The app shows "A new version of CrumbSave is ready" with **Update now** and **Later**.
4. **Update now** sends `SKIP_WAITING`. The new worker activates and deletes the old caches. The page reloads once.

Nobody has to clear browser storage by hand. Login and reservations are kept.

### Offline

- `/offline` is a page in the app, with a **Retry Connection** button.
- `offline.html` is the same message as a plain file with inline styles. It is pre-cached, so it opens with no network, even when the app cannot start.
- The header has an **Online / Offline** indicator. A banner appears when you are offline or when the data on screen is a saved copy.
- `navigator.onLine` is not enough, so **Retry Connection** makes a real request to the server. The same check runs when the browser says it is back online.
- Pages you opened and bags you loaded stay available offline. When the connection returns, the data is loaded again and the banner disappears.

### Mobile

The layout works from 320 px wide, in portrait and landscape. The menu turns into a burger button below 700 px. Buttons and form fields are at least 44 px high on touch screens, fields use 16 px text so iOS does not zoom, and there is no horizontal scroll on any page.

### How to test the PWA by hand

1. `npm run build && npm run preview` and open the address.
2. Chrome DevTools, **Application** tab: check **Manifest**, **Service Workers** and **Cache Storage**.
3. Visit `/bags` and one bag, then in the **Network** tab choose **Offline** and reload. The pages still open and the banner says you are offline.
4. Open `/anything-unknown` while offline. You see the offline page.
5. Go back online and press **Retry Connection**.

## Tests

`npm test` runs the unit tests (search, filters, validation, auth errors, cache, manifest, service worker build). There are also browser tests in the `tests` folder that use Python Playwright: `pwa_browser.py` (install, offline, cache limits, update flow) and `mobile_browser.py` (layouts from 320 px, touch size). Run `npm run build` first. I could not test real Google login in the automatic tests, so I tested it by hand on the deployed site.

## Deploy

The site is on GitHub Pages, from the `gh-pages` branch. The command `npm run build:pages` makes the API files, the build with the right base path `/crumbsave-react-auth/`, and the service worker. The Firebase variables are put in the build when it is made, so I build it on my computer where `.env.local` is. The file `404.html` helps when someone refreshes a page like `/bags/5`.

## Images

Images and their sources are listed in [IMAGE_CREDITS.md](IMAGE_CREDITS.md). The food bags are fictional and are not official offers from any brand.
