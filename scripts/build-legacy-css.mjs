import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import { transform } from 'lightningcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const cssDirectory = path.join(projectRoot, '.next', 'static', 'chunks');
const outputPath = path.join(projectRoot, 'public', 'legacy-browser.css');
const legacyClass = 'legacy-browser';

function scopeSelector(selector) {
  const parsed = selectorParser().astSync(selector);

  parsed.each((current) => {
    const first = current.nodes.find((node) => node.type !== 'comment');
    if (!first) return;

    if (first.type === 'pseudo' && (first.value === ':root' || first.value === ':host')) {
      first.replaceWith(selectorParser.tag({ value: 'html' }));
      current.insertAfter(current.nodes[0], selectorParser.className({ value: legacyClass }));
      return;
    }

    if (first.type === 'tag' && first.value.toLowerCase() === 'html') {
      const alreadyScoped = current.nodes.some(
        (node) => node.type === 'class' && node.value === legacyClass,
      );
      if (!alreadyScoped) {
        current.insertAfter(first, selectorParser.className({ value: legacyClass }));
      }
      return;
    }

    if (first.type === 'class' && first.value === legacyClass) return;

    current.prepend(selectorParser.combinator({ value: ' ' }));
    current.prepend(selectorParser.className({ value: legacyClass }));
    current.prepend(selectorParser.tag({ value: 'html' }));
  });

  return parsed.toString();
}

function appendLegacyRules(node, target) {
  if (node.type === 'atrule') {
    if (node.name.toLowerCase() === 'layer') {
      node.each((child) => appendLegacyRules(child, target));
      return;
    }

    if (node.name.toLowerCase() === 'property' || node.name.toLowerCase() === 'font-face') {
      return;
    }

    if (node.name.toLowerCase().includes('keyframes')) {
      target.append(node.clone());
      return;
    }

    if (!node.nodes) {
      target.append(node.clone());
      return;
    }

    const clone = node.clone({ nodes: [] });
    target.append(clone);
    node.each((child) => appendLegacyRules(child, clone));
    return;
  }

  if (node.type !== 'rule') return;

  const clone = node.clone();
  clone.selector = scopeSelector(node.selector);
  target.append(clone);
}

async function main() {
  const cssFiles = (await fs.readdir(cssDirectory))
    .filter((file) => file.endsWith('.css'))
    .sort();

  if (cssFiles.length === 0) {
    throw new Error(`No compiled CSS files found in ${cssDirectory}.`);
  }

  const legacyRoot = postcss.root();

  for (const file of cssFiles) {
    const filename = path.join(cssDirectory, file);
    const source = await fs.readFile(filename);
    const compatibleCss = transform({
      filename,
      code: source,
      minify: true,
      targets: { chrome: 81 << 16 },
    }).code.toString();
    const parsedCss = postcss.parse(compatibleCss, { from: filename });

    parsedCss.each((node) => appendLegacyRules(node, legacyRoot));
  }

  await fs.writeFile(outputPath, legacyRoot.toString(), 'utf8');
  console.log(`Generated Chrome 81 stylesheet: ${outputPath}`);
}

main().catch((error) => {
  console.error('Failed to generate the legacy browser stylesheet:', error);
  process.exitCode = 1;
});
