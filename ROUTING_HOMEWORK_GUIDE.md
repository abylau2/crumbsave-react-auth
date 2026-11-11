# Routing homework: defense guide

## What changed

The midterm had one home page with the full catalog. Now Home shows six API-loaded bags. The full catalog is on `/bags`. About, Login and Dashboard are new pages. The 120 listings, images, reservations and storage key are unchanged.

## Router and layout

`src/main.jsx` starts `BrowserRouter`. It changes the visible page without downloading a new HTML document. `Link` is a navigation link; `NavLink` also marks the active destination.

`src/App.jsx` defines a parent route with `RootLayout`. All page routes are its children. `src/layouts/RootLayout.jsx` renders Header, main, `Outlet` and Footer. `Outlet` is the place where the current child page appears. This means the header and footer stay shared.

The layout scrolls on a pathname or hash change. A query-only change does not scroll the page or replace the search input. Hash links use the matching element ID.

## Dynamic details

`src/pages/BagDetailsPage.jsx` reads `id` with `useParams`. `/bags/fan-001` gives the ID `fan-001`. It calls `getBagById(id)` through the service. It does not depend on an already-loaded catalog.

The page shows title, business, category, description, reference, district, pickup window, quantity, original price, current price and discount. A missing ID has its own recovery screen.

Back uses browser history when a card supplied in-app navigation state. Otherwise it goes to `/bags`. All Bags always opens the catalog. Cards from the catalog also pass its query string, so both actions can preserve browsing context.

## URL filters

`src/pages/BagsPage.jsx` uses `useSearchParams`. It reads the URL as the source of truth. There is no second filter object in App state.

`src/utils/catalogParams.js` parses and validates the supported query values. Unknown categories, districts, prices and sort modes use defaults. Bad page numbers become page 1. After loading, a page above the last page is clamped and the URL is corrected with replace navigation.

Example: `/bags?category=Bakery&sort=price-asc&page=2`.

Changing a filter resets page to 1. Changing a page keeps the other filters. Typing search uses replace, so each letter does not add a history entry. Discrete filter and page changes add history entries. Refresh and Back/Forward work because the URL contains the state. Unrelated query parameters are kept.

## Service and data flow

`src/services/service.js` is the one implementation of the simulated API. The old `src/api/bagsApi.js` only re-exports it for compatibility. Pages and hooks use the services path.

Data moves through: service → `useBags` → page → reusable components. The service still uses a 450 ms delay, copies returned records, validates input and saves reservations and quantity together. The storage key remains `crumbsave:demo:v1`. Existing migrations still preserve custom bags and reservation snapshots. An intentional empty catalog stays empty.

## Dashboard

`src/pages/DashboardPage.jsx` calls `useBags`, which calls `getBags`. It never imports a static list of listings. Category and district choices filter the API records. `useMemo` recalculates the filtered data and statistics when inputs change.

`src/utils/dashboard.js` computes total, available and sold-out listings, average price, average discount and available units. Empty arrays return safe zero values. The page shows a separate empty state instead of KPI cards when there are no matching records.

Category and district breakdowns count records in the same filtered array. Bar widths depend on these counts. Clicking a category, district or available-listings metric opens the corresponding catalog URL. These are demo catalog statistics, not sales or revenue.

## Lazy loading

`React.lazy` in App loads Bags, About, Dashboard and Login only when needed. Each page has a separate production JavaScript chunk. `Suspense` in RootLayout shows a loading message while the route code loads. Header and Footer remain visible. API loading has a separate skeleton state.

## Cancellation and errors

The API accepts an `AbortSignal`. Loading effects create an AbortController and abort on cleanup. Detail loading depends on the ID. If the user moves from bag A to bag B, A's old request is cancelled and cannot replace B. Reservation requests are also aborted when leaving details. Retry changes a revision counter and starts a new request.

To test a one-time catalog error, run `sessionStorage.setItem('crumbsave:fail-next', 'getBags')`, reload the catalog and press Try again.

## Login

Login is a form preview. It checks email format and a minimum password length. Valid input shows that authentication is not available. It does not create an account, send a password or save one.

## GitHub Pages

The Pages build uses `/crumbsave-react-routing/` as its base. `BrowserRouter` uses that basename. `scripts/write-pages-fallback.mjs` writes `404.html`. A direct nested URL first receives a 404 response. That page redirects to the app with the original path, query and hash inside an encoded `__route` parameter. Before mounting React, main restores the original URL. The application then renders the requested route.

## Small changes to explain during defense

- Add a route in App and a link in Header.
- Add a statistic to dashboardStats, then display it in DashboardPage.
- Add a filter value in catalogParams and a control in CatalogControls; update the catalog predicate.
- Change page size in `src/utils/catalog.js`.
- Change copy on About without touching API data.
