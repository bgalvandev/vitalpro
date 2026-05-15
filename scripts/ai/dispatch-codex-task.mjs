import { spawnSync } from 'node:child_process';

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      continue;
    }

    const [rawKey, inlineValue] = token.slice(2).split('=');
    const key = rawKey.trim();

    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = 'true';
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function normalizeCreatePr(value) {
  const normalized = String(value).toLowerCase();
  if (normalized === 'true' || normalized === 'false') {
    return normalized;
  }

  fail(`Invalid --create-pr value: ${value}. Use true or false.`);
}

const args = parseArgs(process.argv.slice(2));
const task = args.task;

if (!task || task.trim().length === 0) {
  fail('Missing required argument --task "<task description>".');
}

const baseRef = args['base-ref'] ?? 'main';
const model = args.model ?? 'gpt-5.5';
const effort = args.effort ?? 'medium';
const createPr = normalizeCreatePr(args['create-pr'] ?? 'true');

if (!['low', 'medium', 'high', 'xhigh'].includes(effort)) {
  fail(`Invalid --effort value: ${effort}. Use low, medium, high, or xhigh.`);
}

const commandArgs = [
  'workflow',
  'run',
  'ai-codex-dispatch.yml',
  '--ref',
  'main',
  '-f',
  `task=${task}`,
  '-f',
  `base_ref=${baseRef}`,
  '-f',
  `model=${model}`,
  '-f',
  `effort=${effort}`,
  '-f',
  `create_pr=${createPr}`,
];

const runResult = spawnSync('gh', commandArgs, { stdio: 'inherit' });
if (runResult.status !== 0) {
  process.exit(runResult.status ?? 1);
}

console.log('Dispatch submitted. Run `gh run list --workflow "AI Codex Dispatch" --limit 5` to inspect status.');
