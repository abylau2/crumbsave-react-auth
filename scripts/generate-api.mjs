// Publishes the public catalog as static JSON files, like a very small read-only API:
//   public/api/bags.json         -> the whole catalog
//   public/api/bags/<id>.json    -> one bag
// Runs automatically before dev and build (see "predev" / "prebuild" in package.json).
// Image paths are written without a leading slash; the app adds the site base path.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { seedBags } from '../src/data/seedBags.js';

const out = new URL('../public/api/', import.meta.url);
rmSync(out, { recursive: true, force: true });
mkdirSync(new URL('bags/', out), { recursive: true });

const clean = (bag) => ({ ...bag, image: bag.image.replace(/^\/+/, '') });
const bags = seedBags.map(clean);

writeFileSync(new URL('bags.json', out), JSON.stringify({ count: bags.length, bags }));
for (const bag of bags) writeFileSync(new URL(`bags/${bag.id}.json`, out), JSON.stringify({ bag }));
console.log(`API: wrote ${bags.length} bags to public/api/`);
