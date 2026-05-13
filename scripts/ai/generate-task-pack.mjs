import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const workspaceRoot = process.cwd();

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      continue;
    }

    const [key, inlineValue] = token.replace(/^--/, '').split('=');
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

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readOptionalFile(filePath) {
  if (!(await exists(filePath))) {
    return '';
  }

  return fs.readFile(filePath, 'utf8');
}

async function loadProjects() {
  const roots = ['apps', 'libs'];
  const results = [];

  for (const root of roots) {
    const rootPath = path.join(workspaceRoot, root);
    if (!(await exists(rootPath))) {
      continue;
    }

    const entries = await fs.readdir(rootPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const projectJsonPath = path.join(rootPath, entry.name, 'project.json');
      if (!(await exists(projectJsonPath))) {
        continue;
      }

      const raw = await fs.readFile(projectJsonPath, 'utf8');
      const data = JSON.parse(raw);
      results.push({
        name: data.name ?? `${root}-${entry.name}`,
        root: path.join(root, entry.name),
        tags: Array.isArray(data.tags) ? data.tags : [],
        targets: data.targets ? Object.keys(data.targets) : [],
      });
    }
  }

  return results.sort((left, right) => left.name.localeCompare(right.name));
}

async function loadGitChanges() {
  const gitDir = path.join(workspaceRoot, '.git');
  if (!(await exists(gitDir))) {
    return [];
  }

  const { execFile } = await import('node:child_process');

  return new Promise((resolve) => {
    execFile('git', ['status', '--short'], { cwd: workspaceRoot }, (error, stdout) => {
      if (error || !stdout.trim()) {
        resolve([]);
        return;
      }

      const files = stdout
        .split('\n')
        .filter(Boolean)
        .map((line) => line.replace(/^.. /, '').trim());

      resolve(files);
    });
  });
}

function clip(text, maxLines = 80) {
  const lines = text.split('\n');
  if (lines.length <= maxLines) {
    return text.trim();
  }

  return `${lines.slice(0, maxLines).join('\n')}\n...\n[truncated ${lines.length - maxLines} lines]`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const task = args.task ?? 'No task provided. Add --task "...".';
  const output = args.output ?? 'tmp/ai/task-pack.md';

  const [agentsMd, readmeMd, projects, gitChanges] = await Promise.all([
    readOptionalFile(path.join(workspaceRoot, 'AGENTS.md')),
    readOptionalFile(path.join(workspaceRoot, 'README.md')),
    loadProjects(),
    loadGitChanges(),
  ]);

  const projectRows = projects
    .map(
      (project) =>
        `- ${project.name} (${project.root}) | tags: ${project.tags.join(', ') || 'n/a'} | targets: ${project.targets.join(', ') || 'n/a'}`,
    )
    .join('\n');

  const changesRows = gitChanges.length > 0 ? gitChanges.map((filePath) => `- ${filePath}`).join('\n') : '- No local changes detected.';

  const content = `# AI Task Pack\n\nGenerated: ${new Date().toISOString()}\n\n## Task\n${task}\n\n## Repository Quality Commands\n- pnpm run ai:guard\n- pnpm run check\n- pnpm run affected -- --base=origin/main --head=HEAD\n- pnpm run api:advanced:check\n\n## Local Changes Snapshot\n${changesRows}\n\n## Workspace Projects\n${projectRows || '- No projects detected.'}\n\n## AGENTS.md (excerpt)\n\n\`\`\`md\n${clip(agentsMd, 120)}\n\`\`\`\n\n## README.md (excerpt)\n\n\`\`\`md\n${clip(readmeMd, 120)}\n\`\`\`\n`;

  const outputPath = path.join(workspaceRoot, output);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, content, 'utf8');

  console.log(`AI task pack generated at ${output}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
