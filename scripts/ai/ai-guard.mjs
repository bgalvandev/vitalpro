// Architecture guard for intra-module Clean Architecture boundaries.
//
// Nx's @nx/enforce-module-boundaries (eslint.config.mjs) enforces dependencies
// BETWEEN projects via tags (surface:core/health, scope:shared). This guard
// covers what tags cannot: the dependency direction BETWEEN layer folders inside
// a single project (interface -> application -> domain, infrastructure inward,
// domain free of external infra packages). Wired into `pnpm check`.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const workspaceRoot = process.cwd();
const sourceRoots = ['apps', 'libs'];
const codeExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs']);
const domainBlockedPackages = ['express', 'pg', 'prisma', '@prisma', 'axios', 'node-fetch', 'undici'];

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listFilesRecursively(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (
      entry.name === 'node_modules' ||
      entry.name === 'dist' ||
      entry.name === '.nx' ||
      entry.name === '.next' ||
      entry.name === 'coverage'
    ) {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(fullPath)));
      continue;
    }

    if (codeExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function layerFromNormalizedPath(normalized) {
  if (normalized.includes('/src/domain/')) return 'domain';
  if (normalized.includes('/src/application/')) return 'application';
  if (normalized.includes('/src/interface/')) return 'interface';
  if (normalized.includes('/src/infrastructure/')) return 'infrastructure';
  return null;
}

function getLayer(filePath) {
  return layerFromNormalizedPath(filePath.split(path.sep).join('/'));
}

function parseImports(content) {
  const matches = [];
  const staticImportPattern = /from\s+['"]([^'"]+)['"]/g;
  const dynamicImportPattern = /import\(\s*['"]([^'"]+)['"]\s*\)/g;

  for (const pattern of [staticImportPattern, dynamicImportPattern]) {
    let match = pattern.exec(content);
    while (match) {
      matches.push(match[1]);
      match = pattern.exec(content);
    }
  }

  return matches;
}

function resolveLayerFromImport(importPath, filePath) {
  if (!importPath.startsWith('.')) {
    return null;
  }

  const absoluteFilePath = path.resolve(path.dirname(filePath), importPath);
  return layerFromNormalizedPath(absoluteFilePath.split(path.sep).join('/'));
}

function validateFile(filePath, content, errors) {
  const layer = getLayer(filePath);
  const relativePath = path.relative(workspaceRoot, filePath);

  const imports = parseImports(content);

  for (const importPath of imports) {
    const importedLayer = resolveLayerFromImport(importPath, filePath);

    if (layer === 'interface' && importedLayer === 'infrastructure') {
      errors.push(`${relativePath}: interface layer must not import infrastructure (${importPath}).`);
    }

    if (layer === 'application' && importedLayer === 'interface') {
      errors.push(`${relativePath}: application layer must not import interface (${importPath}).`);
    }

    if (layer === 'domain' && importedLayer && importedLayer !== 'domain') {
      errors.push(`${relativePath}: domain layer must not import ${importedLayer} (${importPath}).`);
    }

    if (layer === 'domain' && !importPath.startsWith('.')) {
      if (domainBlockedPackages.some((pkg) => importPath === pkg || importPath.startsWith(`${pkg}/`))) {
        errors.push(`${relativePath}: domain layer must not import external infra package (${importPath}).`);
      }
    }
  }
}

async function main() {
  const errors = [];
  const files = [];

  for (const root of sourceRoots) {
    const rootPath = path.join(workspaceRoot, root);
    if (!(await exists(rootPath))) {
      continue;
    }

    files.push(...(await listFilesRecursively(rootPath)));
  }

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf8');
    validateFile(filePath, content, errors);
  }

  if (errors.length > 0) {
    console.error('AI guard failed:\n');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('AI guard passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
