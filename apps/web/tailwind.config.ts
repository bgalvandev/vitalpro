import { join } from 'path';
import type { Config } from 'tailwindcss';

/**
 * VitalPro Core — web design tokens.
 * Direction: a calm, precise appointment operations console for service
 * businesses across verticals. Teal/ink brand with content-driven status hues;
 * times are rendered
 * in a tabular mono face so the day schedule reads like an instrument panel
 * rather than a generic card list.
 */
const config: Config = {
  // Absolute glob so class detection is independent of the build CWD.
  content: [join(__dirname, 'src/**/*.{ts,tsx}')],
  theme: {
    extend: {
      colors: {
        ink: '#0F2A2E',
        brand: '#0E7C7B',
        surface: '#F6F5F1',
        card: '#FFFFFF',
        line: '#E4E1D8',
        muted: '#5C6B6A',
        scheduled: '#0E7C7B',
        completed: '#2F7D5B',
        cancelled: '#B23A48',
      },
      fontFamily: {
        data: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      borderRadius: {
        card: '0.875rem',
      },
    },
  },
  plugins: [],
};

export default config;
