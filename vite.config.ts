import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // 替换为你的 GitHub 仓库名
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
        // start_url 建议也跟随 base 路径
        start_url: '/jici/', 
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#53BEE8',
        icons: [
          {
            src: 'pwa-192.png', // 确保此文件在 public 文件夹下
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})