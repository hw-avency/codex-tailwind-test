import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const cloudRunHost = 'codex-tailwind-test-988297901311.europe-west3.run.app';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [cloudRunHost],
  },
  preview: {
    allowedHosts: [cloudRunHost],
  },
});
