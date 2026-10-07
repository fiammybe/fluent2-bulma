import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const viewBoxNumber = '\\d+(?:\\.\\d+)?';
const viewBoxPattern = new RegExp(
  `^${viewBoxNumber}\\s+${viewBoxNumber}\\s+${viewBoxNumber}\\s+${viewBoxNumber}$`,
);
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

const parsePath = (attributes, body, filename) => {
  const parsed = new Map();
  const attributePattern = /\s+([\w:-]+)="([^"]*)"/g;
  let lastIndex = 0;
  for (const match of attributes.matchAll(attributePattern)) {
    if (attributes.slice(lastIndex, match.index).trim()) {
      throw new Error(`Unsupported path attributes in ${filename}`);
    }
    const [, name, value] = match;
    if (!['d', 'fill-rule', 'clip-rule'].includes(name) || parsed.has(name)) {
      throw new Error(`Unsupported path attributes in ${filename}`);
    }
    parsed.set(name, value);
    lastIndex = match.index + match[0].length;
  }
  if (attributes.slice(lastIndex).trim() || !parsed.has('d')) {
    throw new Error(`Unsupported path attributes in ${filename}`);
  }
  if (body?.trim()) throw new Error(`Unsupported SVG content in ${filename}`);
  const pathData = parsed.get('d');
  const hasSupportedPathCharacters = /^[MmZzLlHhVvCcSsQqTtAaEe0-9+.,\s-]+$/.test(pathData);
  if (!hasSupportedPathCharacters || !/^[Mm](?=.*\d)/.test(pathData)) {
    throw new Error(
      `SVG path data must use supported characters and start with M or m in ${filename}`,
    );
  }
  for (const name of ['fill-rule', 'clip-rule']) {
    if (parsed.has(name) && !['nonzero', 'evenodd'].includes(parsed.get(name))) {
      throw new Error(`Invalid ${name} in ${filename}`);
    }
  }
  return `    <path ${[...parsed].map(([name, value]) => `${name}="${value}"`).join(' ')}/>`;
};

const symbols = await Promise.all(
  iconList.map(async (name) => {
    const filename = path.join(options.get('--icons-dir'), `${name}.svg`);
    const svg = await readFile(filename, 'utf8');
    const rootMatch = svg.match(/^\s*<svg\b([^>]*)>([\s\S]*?)<\/svg>\s*$/);
    const viewBox = rootMatch?.[1].match(/\bviewBox="([^"]+)"/)?.[1];
    if (!rootMatch || !viewBoxPattern.test(viewBox ?? '')) {
      throw new Error(`Invalid SVG root or viewBox in ${filename}`);
    }

    const content = rootMatch[2];
    const pathPattern = /<path\b([^>]*?)(?:\s*\/>|>([\s\S]*?)<\/path\s*>)/g;
    const matches = [...content.matchAll(pathPattern)];
    const paths = matches.map((match) => parsePath(match[1], match[2], filename));
    if (!paths.length || content.replace(pathPattern, '').trim()) {
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
