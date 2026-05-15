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

const args = parseArgs(process.argv.slice(2));
const prNumber = args['pr-number'];

if (!prNumber || !/^\d+$/.test(String(prNumber))) {
  fail('Missing or invalid --pr-number <number>.');
}

const model = args.model ?? 'gpt-5.5';
const effort = args.effort ?? 'high';
const reason = args.reason ?? 'Manual fix-ci dispatch from terminal.';

if (!['low', 'medium', 'high', 'xhigh'].includes(effort)) {
  fail(`Invalid --effort value: ${effort}. Use low, medium, high, or xhigh.`);
}

const commandArgs = [
  'workflow',
  'run',
  'ai-codex-fix-ci.yml',
  '--ref',
  'main',
  '-f',
  `pr_number=${prNumber}`,
  '-f',
  `reason=${reason}`,
  '-f',
  `model=${model}`,
  '-f',
  `effort=${effort}`,
];

const runResult = spawnSync('gh', commandArgs, { stdio: 'inherit' });
if (runResult.status !== 0) {
  process.exit(runResult.status ?? 1);
}

console.log('Fix-CI dispatch submitted. Run `gh run list --workflow "AI Codex Fix CI" --limit 5` to inspect status.');
