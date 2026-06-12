import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // 1. Phải import cái này vào

export default defineConfig({
  plugins: [
    react(),
    VitePWA({ // 2. Chuyển VitePWA lên nằm trong mảng plugins
      registerType: 'autoUpdate',
      manifest: {
        name: 'Snack Shop',
        short_name: 'Snack Shop',
        description: 'Quản lý cửa hàng Snack Shop',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 5174,
    proxy: { // 3. Trong server bây giờ chỉ giữ lại port và proxy sạch sẽ như này
      '/api': 'http://localhost:5000',
      '/socket.io': { 
        target: 'http://localhost:5000', 
        ws: true 
      },
    },
  },
});