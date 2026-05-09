import { createCoreApiApp } from './interface/http/create-core-api-app';

export function createStartupMessage(port: number): string {
  return `VitalPro Core API listening on port ${port}`;
}

export function parsePort(value: string | undefined): number {
  const defaultPort = 3000;
  if (!value) {
    return defaultPort;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return defaultPort;
  }

  return parsed;
}

export async function bootstrap(): Promise<void> {
  const app = createCoreApiApp();
  const port = parsePort(process.env.PORT);

  await new Promise<void>((resolve) => {
    app.listen(port, () => {
      console.log(createStartupMessage(port));
      resolve();
    });
  });
}

if (process.env.NODE_ENV !== 'test' && process.env.VITEST !== 'true') {
  bootstrap();
}
