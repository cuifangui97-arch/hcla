import { localIconPlugin } from "./scripts/local-icon-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig(({ command }) => ({
  base: "./",
  optimizeDeps: { entries: ["index.html"] },
  plugins: [
    localIconPlugin(command),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "TOP换乘恋爱 · 导演组观察计划",
        short_name: "TOP导演组",
        display: "standalone",
        background_color: "#f7f4f2",
        theme_color: "#f7f4f2",
        icons: [{ src: "icon.svg", sizes: "any", type: "image/svg+xml" }],
      },
      workbox: {
        clientsClaim: true,
        globPatterns: ["**/*.{js,css,html,svg,json,txt,png,jpg}"],
        globIgnores: ["assets/cp-photos/**/*", "assets/props/**/*"],
        runtimeCaching: [{
          urlPattern: /\/assets\/(?:cp-photos|props)\//,
          handler: "CacheFirst",
          options: { cacheName: "top-season-media", expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 180 } },
        }],
        maximumFileSizeToCacheInBytes: 12582912,
      },
    }),
  ],
}));
