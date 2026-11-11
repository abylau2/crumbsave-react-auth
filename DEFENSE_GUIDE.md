# CrumbSave React defense guide

This guide describes the code in this repository. It is intended for a live midterm defense, not as a claim about any deployment.

## How the app is built

`src/main.jsx` mounts one `App` inside `React.StrictMode` and `BrowserRouter`. `App.jsx` defines nested routes. `RootLayout` renders the shared `Header`, `Outlet`, `Suspense`, and `Footer`. Home composes `Hero`, `HowItWorks` and six API-loaded `BagCard` previews. `BagsPage` contains `CatalogControls`, cards, pagination and reusable state components. Detail, add, reservations, and 404 pages are separate components. A component receives data through props: for example, `BagCard` receives one `bag` and renders it without owning the catalog.

## State, events, and controlled forms

`BagsPage` keeps catalog preferences in URL query parameters using `useSearchParams`. Cards pass the current catalog URL to detail navigation. Filter changes reset the page number. `Header` owns its mobile-menu `open` state. `AddBagPage` owns `values`, `errors`, and `submission`. Every input's `value` comes from `values`; `onChange` writes the new value to React state. The browser input is not the source of truth. Submit calls `validateBag`, then `createBag`. The API validates a second time and saves the result.

React schedules state updates. Inside one event handler, reading `values` again immediately after `setValues` would still see the current render's snapshot. The form uses functional updates so editing one field does not erase the others. React may batch related state updates into one render.

## API to UI data flow

The single business data source is `src/services/service.js`. It seeds 120 records from 52 concepts in `fanConcepts.js` through `seedBags.js` when its localStorage key is absent. The API migrates the old generic seed catalog once while keeping created bags and reservation snapshots. Version 3 also updates seeded image paths for distinct variation crops without resetting inventory or reservations. `useBags` calls `getBags` and stores a request status: loading, error, or success. `BagsPage` derives the visible array with `filterAndSortBags` and then `paginate`. Featured sorting keeps repeated food images apart; price and discount sorting remain strictly numeric. It does not keep a second mutable list. Search, filters, sorting, and pagination operate on the same records that power details and reservations. Creating a bag writes through `createBag`; returning to the catalog route reads the new data from the API.

## Rendering and identity

A state or prop change asks React to render a new description of the UI. During reconciliation, React compares the new tree with the previous tree. The commit phase applies the necessary browser updates. `BagCard` is rendered with `key={bag.id}` and reservations with `key={item.id}`; these stable IDs identify items when order or filters change. Array positions would be unreliable because filtering and sorting reorder the list.

`BagDetailsPage` changes when the `:id` route parameter changes. Its loading effect depends on `id` and `revision`, resets the page state, and fetches the requested bag. This prevents the previous bag's detail or success message from being shown as if it belonged to the new ID. The filters stay in the catalog URL, while detail-local state intentionally resets for a different bag.

## Effects, cleanup, and races

Server data is now loaded with TanStack Query (`useBags`, `useBag`, `useReservations`), which replaced the hand-written `useEffect` + `AbortController` code. The library does the same job: it passes an `AbortSignal` to the request, cancels it when the key changes or the component unmounts, and ignores late responses, so a delayed result cannot overwrite a newer one. `BagDetailsPage` renders an inner component with `key={id}`, so reservation state cannot leak between bags. Remaining effects: `AuthProvider` subscribes to `onAuthStateChanged` and unsubscribes in cleanup; `RootLayout` cancels its animation frame; `Header` closes the mobile menu on navigation. These patterns also handle StrictMode's extra development setup/cleanup cycle. Ordinary filtering is synchronous derived work, so it is done with a pure function and `useMemo`, not an effect.

A stale closure is a function that still sees values from an older render. When the next state depends on the current state, this project uses functional setters, such as `setRevision((value) => value + 1)`. The API reads storage at the point where it commits a reservation. Two near-simultaneous reservation requests cannot both decrement the same bag: the later operation sees the first reservation and rejects a duplicate.

## Four key UI states

- **Loading:** `LoadingSkeleton` or route-specific skeletons appear during the 450 ms simulated request.
- **Error:** a failed request shows `ErrorState` with a working Retry button. The documented one-time failure flag makes this testable.
- **Empty:** no catalog matches shows `EmptyState` and Clear Filters; no reservations shows a separate empty state.
- **Success:** cards load, a created bag gets a dedicated success panel, and a successful reservation updates quantity and shows a confirmation link.

Sold-out items disable the reservation button. Invalid bag IDs and unknown routes have their own states.

## Live modifications an instructor may ask for

- **Add another filter:** add its field to `defaultFilters` and parsing in `utils/catalogParams.js`, add a labeled control there, then add a predicate in `filterAndSortBags` in `utils/catalog.js`. The existing `change` function resets pagination.
- **Add a controlled input:** add a key to `emptyForm` in `utils/validation.js`, render a labeled field in `AddBagPage.jsx`, and validate/normalize it there. Then extend the API schema if it belongs to a listing.
- **Display another API field:** add it in `seedBags.js` (the `reference` field is a current example) and in the `createBag` normalized data if users can edit it; then render it from the `bag` prop in `BagCard.jsx` or `BagDetailsPage.jsx`.
- **Add a reset action:** reset catalog parameters with `catalogParams(defaultFilters, params)` or `setValues(emptyForm)` for the form, as the current buttons do.
- **Modify sorting:** add an option in `CatalogControls.jsx` and a comparator branch in `filterAndSortBags`. End with `id` as a stable tie-breaker.
- **Change an effect dependency:** if a request must reload when a new value changes, include that value in the dependency array and verify cleanup aborts the old request.
- **Add a loading or error condition:** extend the request status branch in the page, or trigger `sessionStorage.setItem('crumbsave:fail-next', 'getBags')` before reload to inspect the existing error path.
- **Modify an event handler:** for example, edit `reserve` in `BagDetailsPage.jsx`; keep the pending guard, API call, success update, and error feedback together.

## What is intentionally simulated

Businesses and bag contents are fictional. A reservation is saved only in the current browser's localStorage; there is no shared inventory, user account, real payment, or physical pickup. This is the appropriate scope for the React midterm.

For all new routing features, see [ROUTING_HOMEWORK_GUIDE.md](ROUTING_HOMEWORK_GUIDE.md).
