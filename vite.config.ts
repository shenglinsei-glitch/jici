import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/jici/', 
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '积词',
        short_name: '积词',
        description: '本地单词学习与记录',
        start_url: '/jici/', 
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#53BEE8',
        icons: [
          {
            src: 'pwa-192x192.png', // ⭐ 必须和 public 下的文件名完全一致
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png', // ⭐ 必须和 public 下的文件名完全一致
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
        ],
      },
    }),
  ],
  // ... 其余保持不变
})