import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // 1. 如果你的 GitHub 仓库地址是 https://xxx.github.io/Formula-Lab/
  // 那么这里必须改为 '/Formula-Lab/'。如果是根目录，则设为 '/'
  base: '/jici/', 

  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Formula Lab',
        short_name: 'Formula Lab',
        description: '计算公式实验中心',
        start_url: '/', // 保持与 base 一致
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#53BEE8',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      // 2. 保留新文件中的路径别名配置，防止代码中的 @ 引用失效
      '@': path.resolve(__dirname, './src'),
    },
  },
})