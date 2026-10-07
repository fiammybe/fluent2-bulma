import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const options = new Map([
  ['--list', path.join(root, 'icons/default.json')],
  ['--icons-dir', path.join(root, 'node_modules/@fluentui/svg-icons/icons')],
  ['--out', path.join(root, 'public/fluent-icons.svg')],
]);

for (let index = 2; index < process.argv.length; index += 1) {
  const option = process.argv[index];
  if (
    !options.has(option) ||
    !process.argv[index + 1] ||
    process.argv[index + 1].startsWith('--')
  ) {
    throw new Error(
      `Usage: node scripts/build-icon-sprite.mjs [--list file] [--icons-dir dir] [--out file]`,
    );
  }
  options.set(option, path.resolve(process.cwd(), process.argv[++index]));
}

const iconList = JSON.parse(await readFile(options.get('--list'), 'utf8'));
if (
  !Array.isArray(iconList) ||
  iconList.length === 0 ||
  iconList.some((name) => typeof name !== 'string' || !/^[a-z0-9_]+$/.test(name))
) {
  throw new Error('The icon list must be a non-empty JSON array of lowercase icon names.');
}
if (new Set(iconList).size !== iconList.length) {
  throw new Error('The icon list must not contain duplicate names.');
}

const symbols = await Promise.all(
  iconList.map(async (name) => {
    const filename = path.join(options.get('--icons-dir'), `${name}.svg`);
    const svg = await readFile(filename, 'utf8');
    const rootMatch = svg.match(/^\s*<svg\b([^>]*)>([\s\S]*?)<\/svg>\s*$/);
    const viewBox = rootMatch?.[1].match(/\bviewBox="([^"]+)"/)?.[1];
    if (
      !rootMatch ||
      !/^\d+(?:\.\d+)?\s+\d+(?:\.\d+)?\s+\d+(?:\.\d+)?\s+\d+(?:\.\d+)?$/.test(viewBox ?? '')
    ) {
      throw new Error(`Invalid SVG root or viewBox in ${filename}`);
    }

    const content = rootMatch[2];
    const paths = [...content.matchAll(/<path\b([^>]*)\/>/g)].map((match) => {
      const data = match[1].match(/^\s*d="([^"]+)"\s*$/)?.[1];
      if (!data) throw new Error(`Unsupported path attributes in ${filename}`);
      return `    <path d="${data}"/>`;
    });
    if (!paths.length || content.replace(/<path\b[^>]*\/>/g, '').trim()) {
      throw new Error(`Unsupported SVG content in ${filename}; only path elements are accepted.`);
    }

    return `  <symbol id="${name}" viewBox="${viewBox}" fill="currentColor">\n${paths.join('\n')}\n  </symbol>`;
  }),
);

const output = `\
<svg xmlns="http://www.w3.org/2000/svg">
${symbols.join('\n')}
</svg>
`;
const outputPath = options.get('--out');
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, output);
console.log(`Generated ${iconList.length} icons in ${outputPath}`);
