/**
 * Rewrites `@/…` / `@/core/…` aliases and extensionless relative imports in the
 * non-`src` trees (tests, scripts, prisma) to explicit relative `.js`
 * specifiers, matching the NodeNext module resolution the package uses.
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("src");
const TREES = process.argv.slice(2);

if (TREES.length === 0) {
  console.error("usage: node tools/rewrite-imports.mjs <dir> [dir…]");
  process.exit(1);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return e.isFile() && p.endsWith(".ts") ? [p] : [];
  });
}

function resolveTarget(absNoExt) {
  if (fs.existsSync(`${absNoExt}.ts`)) return `${absNoExt}.js`;
  if (fs.existsSync(path.join(absNoExt, "index.ts"))) return path.join(absNoExt, "index.js");
  return null;
}

function toRelative(fromFile, absJs) {
  let rel = path.relative(path.dirname(fromFile), absJs).split(path.sep).join("/");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

const files = TREES.flatMap((t) => walk(path.resolve(t)));
const unresolved = [];
let rewritten = 0;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const next = src.replace(/(["'])((?:@\/|\.\.?\/)[^"']*)\1/g, (match, quote, spec) => {
    if (/\.(js|json|css|node)$/.test(spec)) return match;

    let absNoExt;
    if (spec.startsWith("@/core/")) absNoExt = path.join(SRC, spec.slice("@/core/".length));
    else if (spec.startsWith("@/")) absNoExt = path.join(SRC, spec.slice(2));
    else absNoExt = path.resolve(path.dirname(file), spec);

    const resolved = resolveTarget(absNoExt);
    if (!resolved) {
      unresolved.push(`${path.relative(".", file)}: ${spec}`);
      return match;
    }

    rewritten++;
    return `${quote}${toRelative(file, resolved)}${quote}`;
  });

  if (next !== src) fs.writeFileSync(file, next);
}

console.log(`rewrote ${rewritten} specifiers across ${files.length} files`);
if (unresolved.length) {
  console.log(`UNRESOLVED (${unresolved.length}):`);
  for (const u of unresolved) console.log("  " + u);
}
