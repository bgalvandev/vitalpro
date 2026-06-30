@AGENTS.md

## Claude Code Integration

This repository uses `AGENTS.md` as the single source of truth for engineering standards.

- Claude Code MUST follow all instructions imported from `AGENTS.md` in every session.
- This file MUST stay minimal to prevent duplicated or conflicting rules.
- Any Claude-specific additions here MUST NOT *silently* contradict `AGENTS.md`; to
  change a standard, update `AGENTS.md` in the same change (it is evolvable, not
  frozen — see its Precedence section).
