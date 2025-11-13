import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'

// https://vitejs.dev/config/

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/quest-g6-english-learning/' : '/',
  server: {
    host: true, // 允许外部访问
    port: 5173,
    fs: {
      // 减少文件系统监控范围
      strict: false
    }
  },
  optimizeDeps: {
    // 预构建依赖以加速启动
    include: ['react', 'react-dom', 'lucide-react', 'clsx']
  },
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
      devOptions: {
        enabled: false, // 在开发环境中禁用PWA以加速启动
        type: 'module'
      },
      workbox: {
        // 预缓存所有必要文件
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp}',
          '**/*.{json,mp3,wav,woff2,woff,ttf,eot}',
          'manifest.webmanifest'
        ],
        // 运行时缓存策略
        runtimeCaching: [
          {
            urlPattern: /\.(?:mp3|wav)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 2000,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /\.(?:json)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'content-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 180
              }
            }
          },
          {
            urlPattern: /\.(?:woff2|woff|ttf|eot)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ],
        // 预缓存清单
        cleanupOutdatedCaches: true,
        // 最大缓存大小
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
      },
      includeAssets: [
        'vite.svg',
        'pwa-icon.svg',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'favicon.ico'
      ],
      manifest: {
        name: 'Quest G6 - 外研社英语学习系统',
        short_name: 'Quest G6',
        description: '外研社（一年级起）4-6年级完整覆盖的英语学习系统，支持完全离线使用，包含120个单元和1622个音频文件',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/quest-g6-english-learning/',
        start_url: '/quest-g6-english-learning/',
        icons: [
          {
            src: 'pwa-icon.svg',
            sizes: 'any',
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