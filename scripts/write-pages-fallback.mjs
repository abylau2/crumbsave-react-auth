import { writeFileSync } from 'node:fs';

const base = process.env.PAGES_BASE || '/crumbsave-react-auth/';
const fallback = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Opening CrumbSave…</title></head>
<body><script>
(function () {
  var base = ${JSON.stringify(base)};
  var path = location.pathname.startsWith(base) ? location.pathname.slice(base.length - 1) : '/';
  location.replace(base + '?__route=' + encodeURIComponent(path + location.search + location.hash));
})();
</script></body></html>`;
writeFileSync('dist-pages/404.html', fallback);
writeFileSync('dist-pages/.nojekyll', '');
