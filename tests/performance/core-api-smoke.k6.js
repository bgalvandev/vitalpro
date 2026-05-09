import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  duration: '20s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

const baseUrl = __ENV.BASE_URL || 'http://127.0.0.1:3300';
const token = __ENV.TOKEN || 'local-test-token';

export default function () {
  const response = http.get(`${baseUrl}/api/v1/appointments/apt-001`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(response, {
    'status is 200': (res) => res.status === 200,
    'has id field': (res) => {
      const body = res.json();
      return typeof body.id === 'string';
    },
    'status enum is valid': (res) => {
      const body = res.json();
      return ['scheduled', 'completed', 'cancelled'].includes(body.status);
    },
  });
}
