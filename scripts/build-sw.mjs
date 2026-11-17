// Usage: node scripts/build-sw.mjs <build-folder>
// Reads the finished build, lists the files of the app shell and writes <build-folder>/sw.js
// from sw/sw.template.js. The version is a hash of those files, so every change of the app
// gives a different sw.js and browsers install it as an update.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const outDir = process.argv[2];
if (!outDir || !existsSync(outDir)) {
  console.error('Usage: node scripts/build-sw.mjs <build-folder>');
  process.exit(1);
}

const SKIP = [/^sw\.js$/, /^404\.html$/, /^\.nojekyll$/, /^_redirects$/, /^images\//, /^api\//, /\.map$/];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const all = walk(outDir).map((full) => relative(outDir, full).split('\\').join('/'));
// Fonts: keep only the files that the built CSS really uses (no licences, no unused fonts).
const css = all.filter((file) => file.endsWith('.css')).map((file) => readFileSync(join(outDir, file), 'utf8')).join('\n');
const usedFont = (file) => !file.startsWith('fonts/') || (file.endsWith('.woff2') && css.includes(file.split('/').pop()));
const files = all
  .filter((file) => !SKIP.some((pattern) => pattern.test(file)) && usedFont(file))
  .sort();
if (!files.includes('index.html') || !files.includes('offline.html')) {
  console.error('index.html and offline.html must exist in the build folder.');
  process.exit(1);
}

const template = readFileSync(new URL('../sw/sw.template.js', import.meta.url), 'utf8');
const hash = createHash('sha256');
hash.update(template);
for (const file of files) hash.update(file).update(readFileSync(join(outDir, file)));
const version = hash.digest('hex').slice(0, 10);

// index.html is stored under the folder URL ("./"), which is what the browser requests.
const list = files.map((file) => (file === 'index.html' ? './' : file));
for (const token of ['__VERSION__', '__PRECACHE__']) {
  if (template.split(token).length !== 2) throw new Error(`${token} must appear exactly once in sw/sw.template.js`);
}
const source = template.replace('__VERSION__', version).replace('__PRECACHE__', JSON.stringify(list, null, 2));
writeFileSync(join(outDir, 'sw.js'), source);
console.log(`Service worker: version ${version}, ${list.length} files pre-cached -> ${outDir}/sw.js`);
