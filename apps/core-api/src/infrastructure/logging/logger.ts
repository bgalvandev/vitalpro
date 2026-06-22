import { pino } from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

// Structured logger for the Core API (observability baseline in AGENTS.md).
// Production emits single-line JSON for log aggregators; development uses
// pino-pretty for human-readable, colorized output in the terminal.
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
});
