import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5273,
    headers: {
      'Content-Security-Policy': "connect-src 'self' https://*.ethers.org https://*.ethers.io wss://*.ethers.io http://localhost:5000"
    }
  }
})
