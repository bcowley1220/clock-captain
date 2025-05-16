import { sveltekit } from '@sveltejs/kit/vite';
import { VitePWA } from 'vite-plugin-pwa';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    sveltekit(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Clock Captain',
        short_name: 'ClockCap',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        icons: [
          { src: '/icons/192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
};

export default config;