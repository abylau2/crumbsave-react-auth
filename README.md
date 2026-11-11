# CrumbSave

CrumbSave is my React project for the university course. It is a demo website where people can look at "surprise bags" with cheap leftover food in Almaty. The shops and the bags are not real, and you cannot pay or pick up anything.

Deployed site: https://abylau2.github.io/crumbsave-react-auth/

This is homework 6. I added Firebase login and data caching to my previous project (crumbsave-react-routing).

## What the app can do

- Look at the list of bags, search them, filter them, sort them and go through pages
- Open one bag and reserve it
- Add a new bag with a form
- See my reservations
- Sign up and log in with email and password, or with Google
- Profile page (only for logged in users) with email and UID
- Log out

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
| `/` | Home page |
| `/about` | About the project |
| `/bags` | Catalog with filters and pages |
| `/bags/:id` | One bag, reserve button |
| `/add` | Form for a new bag |
| `/reservations` | My reservations |
| `/dashboard` | Numbers about the bags |
| `/login` | Login |
| `/signup` | Sign up |
| `/profile` | Profile (protected) |
| `*` | 404 page |

## Project folders

```text
src/
  components/    small parts of the pages, ProtectedRoute
  context/       AuthContext
  hooks/         hooks for data and the cache
  lib/           TanStack Query client
  pages/         one file for each page
  services/      service.js (fake API with localStorage) and authService.js (Firebase)
  utils/         validation and helper functions
  firebase.js    Firebase setup
tests/           tests
```

The pages do not use `localStorage` or `fetch` by themselves. They use hooks, and the hooks use the services.

## Fake API

The catalog data is not on a real server. `src/services/service.js` is a fake API: it waits about 450 ms and saves the data in the browser `localStorage`. Because of this, the bags and reservations stay after a refresh, but only in the same browser.

## Tests

`npm test` runs the unit tests (search, filters, validation, auth errors, cache). There are also browser tests in the `tests` folder that use Python Playwright. I could not test real Google login in the automatic tests, so I tested it by hand on the deployed site.

## Deploy

The site is on GitHub Pages, from the `gh-pages` branch. The command `npm run build:pages` makes the build with the right base path `/crumbsave-react-auth/`. The Firebase variables are put in the build when it is made, so I build it on my computer where `.env.local` is. The file `404.html` helps when someone refreshes a page like `/bags/5`.

## Images

Images and their sources are listed in [IMAGE_CREDITS.md](IMAGE_CREDITS.md). The food bags are fictional and are not official offers from any brand.
