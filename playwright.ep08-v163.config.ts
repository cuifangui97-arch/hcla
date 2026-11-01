import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests", testMatch: "ep08-xroom-v163.spec.ts", timeout: 60000,
  expect: { timeout: 7000 }, workers: 1, reporter: "list",
  use: { baseURL: "http://127.0.0.1:4192", channel: "msedge", headless: true, viewport: { width: 412, height: 915 } },
  webServer: { command: "node node_modules/vite/bin/vite.js --config vite.runtime.config.ts --configLoader runner --host 127.0.0.1 --port 4192 --strictPort", url: "http://127.0.0.1:4192/tests/fixtures/ep08-xroom.html", reuseExistingServer: true, timeout: 120000 },
});
