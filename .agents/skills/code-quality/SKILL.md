---
name: code-quality
description: Run and interpret the duplication and dead-code gates (jscpd + knip), and apply DRY/extraction the right way. Use before finishing a change, when `pnpm run check` fails on dead-code/dupes, or when you are about to copy-paste code.
allowed-tools: Bash(pnpm run dead-code), Bash(pnpm run dupes), Bash(pnpm exec knip*), Bash(pnpm exec jscpd*)
---

# Code Quality: duplication + dead code

Two gates run inside `pnpm run check` (and CI's `quality` job) and **block** on
failure:

| Script | Tool | Catches | Config |
|---|---|---|---|
| `pnpm run dead-code` | knip | unused files, exports, dependencies | `knip.json` |
| `pnpm run dupes` | jscpd | copy-pasted code (≥50 tokens / 5 lines) | `.jscpdrc.json` + script flags |

## Fixing knip findings (dead code)

- **Unused export** → remove the `export` keyword if it is only used in-file, or
  delete the symbol if nothing uses it. Do not keep "just in case" exports.
- **Unused file** → delete it, or (if it is a real entry the tool can't trace, e.g.
  a Next.js special file or a config) add it to the right `entry` array in
  `knip.json`.
- **Unused dependency** → remove it from `package.json`. If it is genuinely used but
  only via a config/preset/CLI/runtime-string knip cannot import-trace (e.g. an
  ESLint preset plugin), add it to `ignoreDependencies` in `knip.json` **with that
  justification in the PR** — never to silence a real removal.

The Nx layout matters: `apps/web` and `apps/web-e2e` have no `package.json`, so
their entries are declared under the root (`"."`) workspace in `knip.json`.

## Fixing jscpd findings (duplication)

The **threshold** is the maximum percentage of duplicated code jscpd tolerates
before failing (exit 1). It is set to `0` — zero tolerance: any clone of ≥50 tokens /
5 lines in non-test source fails the gate. Note the quirk: jscpd's *config-file*
`threshold` is advisory (it does not affect the exit code), so the gate is enforced
by the `--threshold 0` flag in the `dupes` script, and test files are excluded via
`--ignore`. When a clone is reported, extract the shared logic into the layer that
owns it:

- Shared pure rule → `domain`. Shared orchestration → `application`. Shared adapter
  helper → `infrastructure`. Shared UI → an `interface/components/` component.
- Do **not** create a generic `utils.ts`/`helpers.ts` dumping ground, and do not add
  an abstraction for a single future caller (AGENTS.md "Simplicity and
  Proportionality Standard"). Extract only what is duplicated *now*.

Some repetition is fine and should not be DRY-ed: test arrange/act blocks (already
ignored), and incidental similarity that isn't the same concept.

## Verification

- `pnpm run dead-code` exits 0 (knip).
- `pnpm run dupes` exits 0 (jscpd: "Found 0 clones").
- Any new `ignoreDependencies`/`entry`/`--ignore` addition is justified in the PR.

Related: [[frontend-architecture]], [[engineering-discipline]].
