import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { parse } from 'yaml';

const workspaceRoot = process.cwd();

async function listFilesRecursively(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(fullPath)));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function validateArazzoDocument(doc, filePath) {
  assertCondition(typeof doc === 'object' && doc !== null, `${filePath}: document must be an object`);
  assertCondition(typeof doc.arazzo === 'string', `${filePath}: missing arazzo version`);
  assertCondition(typeof doc.info?.title === 'string', `${filePath}: info.title is required`);
  assertCondition(typeof doc.info?.version === 'string', `${filePath}: info.version is required`);
  assertCondition(Array.isArray(doc.sourceDescriptions) && doc.sourceDescriptions.length > 0, `${filePath}: sourceDescriptions must contain at least one source`);
  assertCondition(Array.isArray(doc.workflows) && doc.workflows.length > 0, `${filePath}: workflows must contain at least one workflow`);
}

function validateOverlayAction(action, filePath, index) {
  assertCondition(typeof action === 'object' && action !== null, `${filePath}: action[${index}] must be an object`);
  assertCondition(typeof action.target === 'string' && action.target.length > 0, `${filePath}: action[${index}] must define a non-empty target`);
  assertCondition(
    Object.hasOwn(action, 'update') ||
      Object.hasOwn(action, 'remove') ||
      Object.hasOwn(action, 'copy'),
    `${filePath}: action[${index}] must define at least one modifier (update/remove/copy)`,
  );
}

function validateOverlayDocument(doc, filePath) {
  assertCondition(typeof doc === 'object' && doc !== null, `${filePath}: document must be an object`);
  assertCondition(typeof doc.overlay === 'string', `${filePath}: missing overlay version`);
  assertCondition(typeof doc.info?.title === 'string', `${filePath}: info.title is required`);
  assertCondition(typeof doc.info?.version === 'string', `${filePath}: info.version is required`);
  assertCondition(Array.isArray(doc.actions) && doc.actions.length > 0, `${filePath}: actions must contain at least one action`);
  doc.actions.forEach((action, index) => validateOverlayAction(action, filePath, index));
}

async function validateArazzoArtifacts() {
  const arazzoDir = path.join(workspaceRoot, 'contracts', 'arazzo');

  const arazzoFiles = (await listFilesRecursively(arazzoDir)).filter((filePath) =>
    filePath.endsWith('.arazzo.yaml') || filePath.endsWith('.arazzo.yml'),
  );

  assertCondition(arazzoFiles.length > 0, 'No Arazzo files found under contracts/arazzo/**');

  for (const filePath of arazzoFiles) {
    const raw = await fs.readFile(filePath, 'utf8');
    validateArazzoDocument(parse(raw), filePath);
  }
}

async function validateOverlayArtifacts() {
  const overlayDir = path.join(workspaceRoot, 'contracts', 'overlay');

  const overlayFiles = (await listFilesRecursively(overlayDir)).filter((filePath) =>
    filePath.endsWith('.overlay.yaml') || filePath.endsWith('.overlay.yml'),
  );

  assertCondition(overlayFiles.length > 0, 'No Overlay files found under contracts/overlay/**');

  for (const filePath of overlayFiles) {
    const raw = await fs.readFile(filePath, 'utf8');
    validateOverlayDocument(parse(raw), filePath);
  }
}

async function main() {
  await validateArazzoArtifacts();
  await validateOverlayArtifacts();
  console.log('Workflow artifacts validation passed.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
