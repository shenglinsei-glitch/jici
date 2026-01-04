import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // ⭐ GitHub Pages 子路径
  base: '/jici/',

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: '积词',
        short_name: '积词',

        // ⭐⭐ 核心：必须是 /jici/
        start_url: '/jici/',
        scope: '/jici/',

        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',

        icons: [
          {
            src: '/jici/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/jici/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
