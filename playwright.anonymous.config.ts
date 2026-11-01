import config from "./playwright.config";

export default {
  ...config,
  testMatch: ["anonymous-chat.spec.ts"],
  use: { ...config.use, baseURL: "http://127.0.0.1:4186", channel: "msedge" },
  // This focused test uses the already-running Vite dev server so the test-only
  // fixture stays out of the production build.
  webServer: undefined,
};
