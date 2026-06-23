// Deterministic stand-in for core-api used only by the web e2e run. It returns
// a fixed appointments collection matching the published contract shape
// (contracts/openapi/core/appointments.openapi.yaml, operation listAppointments)
// so the web RSC pipeline can be exercised without a database.
import { createServer } from 'node:http';

const port = Number(process.env.PORT ?? 3101);

const appointmentsPayload = {
  items: [
    {
      id: 'apt-scheduled-1',
      status: 'scheduled',
      serviceName: 'Dental cleaning',
      clientName: 'Ada Lovelace',
      startsAt: '2026-06-22T09:00:00.000Z',
      durationMinutes: 30,
    },
    {
      id: 'apt-completed-1',
      status: 'completed',
      serviceName: 'Eye exam',
      clientName: 'Alan Turing',
      startsAt: '2026-06-22T10:30:00.000Z',
      durationMinutes: 45,
    },
  ],
  limit: 100,
};

const server = createServer((req, res) => {
  if (req.url?.startsWith('/health')) {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('ok');
    return;
  }

  if (req.method === 'GET' && req.url?.startsWith('/api/v1/appointments')) {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(appointmentsPayload));
    return;
  }

  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ message: 'Not found' }));
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`stub core-api listening on http://localhost:${port}`);
});
