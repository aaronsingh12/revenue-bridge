import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Tunnel hosts.
 *
 * Vite rejects any request whose `Host` header it does not recognise — that is
 * DNS-rebinding protection, not a bug. A tunnel (ngrok, cloudflared, localtunnel)
 * delivers the page under its own hostname, so those domains have to be declared.
 *
 * A leading dot allows the domain AND every subdomain, which matters because a
 * free ngrok URL changes on every restart. Add more entries here if you use a
 * different tunnel provider.
 */
const TUNNEL_HOSTS = [
  '.ngrok-free.dev',
  '.ngrok-free.app',
  '.ngrok.io',
  '.ngrok.app',
  '.trycloudflare.com',
  '.loca.lt'
]

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: TUNNEL_HOSTS,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true }
    }
  },
  // `vite preview` (the built bundle) enforces the same check
  preview: {
    port: 4173,
    allowedHosts: TUNNEL_HOSTS
  }
})
