import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'

// https://vitejs.dev/config/

export default defineConfig({
  base: '/quest-g6-english-learning/',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/content/*.json',
          dest: 'content'
        }
      ]
    }),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,mp3,wav,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\.(?:mp3|wav)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:json)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'content-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      },
      includeAssets: ['vite.svg', 'pwa-icon.svg', 'pwa-192x192.svg', 'pwa-96x96.svg', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-96x96.png'],
      manifest: {
        name: 'Quest G6 - 外研社英语学习系统',
        short_name: 'Quest G6',
        description: '外研社（一年级起）4-6年级完整覆盖的英语学习系统，支持离线使用',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/quest-g6-english-learning/',
        start_url: '/quest-g6-english-learning/',
        categories: ['education', 'productivity'],
        lang: 'zh-CN',
        dir: 'ltr',
        icons: [
          {
            src: 'pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-96x96.svg',
            sizes: '96x96',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
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
          }
        ],
        shortcuts: [
          {
            name: '四年级课程',
            short_name: '四年级',
            description: '开始四年级英语学习',
            url: '/quest-g6-english-learning/grade4',
            icons: [{ src: 'vite.svg', sizes: '96x96' }]
          },
          {
            name: '五年级课程',
            short_name: '五年级',
            description: '开始五年级英语学习',
            url: '/quest-g6-english-learning/grade5',
            icons: [{ src: 'vite.svg', sizes: '96x96' }]
          }
        ],
        screenshots: [
          {
            src: 'screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: '应用主界面'
          },
          {
            src: 'screenshot-narrow.png',
            sizes: '750x1334',
            type: 'image/png',
            form_factor: 'narrow',
            label: '移动端界面'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@content': path.resolve(__dirname, './content')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    },
    assetsInlineLimit: 0, // 确保JSON文件不被内联
    copyPublicDir: true
  },
  publicDir: 'public' // 确保public目录被复制
})