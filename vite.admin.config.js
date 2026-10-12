import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Standalone 1TAP admin frontend.
// Entry: admin.html -> src/admin.jsx -> src/AdminApp.jsx (admin routes only).
// Output: dist-admin/ (separate from the customer dist/ so neither build deletes the other).
// Customer build (vite.config.js -> index.html -> dist/) is unchanged.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist-admin',
    emptyOutDir: true,
    rollupOptions: {
      input: 'admin.html',
    },
  },
  server: {
    port: 5175,
  },
});
