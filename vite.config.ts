// vite.config.ts
// Builds the portal into dist/ (a plain static site for Render). In development (npm run dev) the page calls
// /admin and /admin-session on itself, and this proxy forwards them to the live API, so the sign-in cookie works
// on localhost exactly as it will on admin.thrifts.co.ke.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API = 'https://api.thrifts.co.ke';
const forward = { target: API, changeOrigin: true, headers: { Origin: 'https://admin.thrifts.co.ke' } };

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/admin-session': forward, '/admin': forward } },
});
