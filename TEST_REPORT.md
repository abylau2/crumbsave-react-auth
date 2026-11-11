# Routing homework verification

Local checkout: `/Users/abylaibakkeldi/Desktop/CrumbSave`.

## Baseline

Before implementation, the working tree was clean on main. `npm test` passed all 11 original tests. `npm run build` passed. Existing node_modules were reused; no new dependencies were installed.

## Commands

| Command | Result |
|---|---|
| `npm test` | Passed: 21 tests, 0 failures |
| `npm run build` | Passed |
| `npm run build:pages` | Passed; 404 fallback and .nojekyll created |
| `npm run preview -- --port 4173` | Started the local production preview |
| `python3 tests/browser_smoke.py` | Passed using Python with Playwright and Google Chrome |
| `python3 tests/routing_browser.py` | Passed using Python with Playwright and Google Chrome |

On this Mac the browser tests use `/Users/abylaibakkeldi/Desktop/beyou/.venv/bin/python` because that environment has Playwright installed. This is a test dependency, not an application dependency.

## Requirement evidence

| Requirement | Implementation | Verification |
|---|---|---|
| Nested routing, layout, Outlet, navigation | App, RootLayout, Header | Production browser navigation; document marker survives navigation |
| Home, About, Login | Separate pages, six API-loaded Home cards, validated honest login preview | Browser routes and login validation |
| Services | service.js owns the unchanged API; old path re-exports | Original API and migration tests; service identity test |
| Catalog search, filters, sorting, pagination | BagsPage and existing reusable components/utilities | Node combined filtering and pagination; original browser smoke scenarios |
| URL state | catalogParams and useSearchParams | Direct URLs, malformed values, refresh, focus, Back/Forward and detail context |
| Dynamic details and seven or more fields | useParams, getBagById, existing details | Valid/missing IDs, direct Back fallback, fast navigation between IDs |
| Dashboard | Six API-derived KPIs, two breakdowns, category/district filters and links | Node exact calculations, browser API comparison, filtering, drill-down, retry and empty states |
| Four lazy pages | React.lazy and Suspense | Separate BagsPage, AboutPage, DashboardPage and LoginPage production chunks |
| Errors, missing records and 404 | Reusable states and NotFoundPage | Failure/retry, unknown routes, missing bags |
| Persistence and reservation rules | Existing service implementation and storage key preserved | Original migration tests and browser create/reserve/reload/duplicate checks |
| Responsive UI | Existing tokens and new routing.css | Eight routes at 375/768/1440 px; original smoke checks five additional viewport settings |
| Pages fallback | Existing 404 redirect and main URL restoration | Local server with real 404 responses: nested URLs, queries, hashes and refresh |

Screenshots were saved in the ignored `artifacts/` folder. Desktop Dashboard and mobile Login were visually inspected. No audit claims to cover every browser, assistive technology or possible network condition.

Login intentionally has no real authentication. API data remains local to one browser. GitHub Pages still returns an initial HTTP 404 for direct nested requests before its redirect loads the SPA; this is a hosting limitation, not server-side rewriting.

## Design review

The existing forest/ivory palette, DM Sans, Newsreader, spacing and image library were retained. Dashboard uses simple count bars rather than a chart library. Manual rubric review: AI Slop 1/10; Distinctiveness 8/10. These are design judgments, not automated accessibility certification.

## Public deployment

The original routing implementation was verified before the rename, after Pages build `f7fd83c` completed successfully. Source implementation: `c42144d`. The renamed deployment is checked separately below.

Public browser checks passed for Home, About, `/bags?category=Bakery&sort=price-asc&page=2`, `/bags/fan-001`, Dashboard, Login, and the Home How It Works hash. Each address was opened directly and refreshed. The catalog retained its Bakery filter and eight page-2 records. Dashboard displayed six KPIs. No JavaScript page errors were observed.

Repository: https://github.com/abylau2/crumbsave-react-routing

Application: https://abylau2.github.io/crumbsave-react-routing/

Implementation branch: `feat/routing-homework`. It was pushed and fast-forwarded to remote main without force. The production build was committed normally to gh-pages. No user data or image files were removed.

## Rename verification

The repository was renamed in place. GitHub repository ID remains `1428464444`. Vite Pages base, Router basename (derived from Vite), SPA fallback, package metadata, test URLs, documentation and local Git remote use the new name. A legacy-path image test covers saved listings and reservations without rewriting storage. All tests and both builds are rerun for the rename.

Renamed public deployment verified successfully after Pages build `18acb47` (source `5fcc7fd`). The new GitHub repository URL returned HTTP 200. The public application passed direct-open and refresh checks for Home, About, the Bakery/price-ascending/page-2 catalog URL, bag fan-001, Dashboard, Login and the How It Works hash. Query parameters and hashes were preserved; no JavaScript page errors were observed. All 21 Node tests, both production builds and both browser suites passed for the rename. Branch names and commit hashes were compared immediately before and after the in-place GitHub rename and were identical.

## Typography and copy refinement

Fraunces (roman and italic) and Instrument Sans are self-hosted with OFL license files. Nine routes, including 404, were checked at 375, 768 and 1440 px after fonts, data and images loaded. No horizontal overflow, JavaScript errors or failed font/image requests were observed. Screenshots were reviewed. `npm test` passed all 21 tests; `npm run build` and `npm run build:pages` passed. Both existing browser suites also passed against the isolated preview on port 4176. Images, product data, prices, service logic and routing files have no changes in this branch.
