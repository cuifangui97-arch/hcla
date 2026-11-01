import { test, expect } from "@playwright/test";

test.use({ channel: "msedge" });

test("AI_FREE custom X starts independently, validates API failures, and keeps the Classic slot", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "轻触解锁" }).click();
  await page.locator('[data-original-icon="settings"]').click();
  await expect(page.getByRole("heading", { name: "节目组设置" })).toBeVisible();
  await page.getByRole("button", { name: "新游戏" }).click();
  await page.getByRole("button", { name: "AI_FREE · 自由导演" }).click();
  await page.getByPlaceholder("OpenAI兼容 Base URL").fill("https://api.test.invalid/v1");
  await page.getByPlaceholder("Model").fill("test-model");
  await page.getByPlaceholder("API Key（仅内存）").fill("test-key-not-persisted");
  const relationSelects = page.locator(".free-pair-controls select");
  await relationSelects.nth(1).selectOption("ZJ");
  await page.getByRole("button", { name: "添加配对" }).click();
  await expect(page.locator(".free-pair-row")).toContainText("朱志鑫 ↔ 张极");
  await page.getByRole("button", { name: "确认并新建游戏" }).click();
  await page.getByRole("button", { name: "轻触解锁" }).click();
  await page.getByRole("button", { name: /继续录制/ }).click();
  await expect(page.getByRole("button", { name: "生成本期剧情" })).toBeVisible();
  await page.route("**/chat/completions", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "test failure" }) }));
  await page.getByRole("button", { name: "生成本期剧情" }).click();
  await expect(page.getByRole("alert")).toContainText("HTTP 503");
  const saves = await page.evaluate(async () => {
    const request = indexedDB.open("foundphone-studio");
    const database = await new Promise<IDBDatabase>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    return await new Promise<{ free: { gameMode: string; history: { formalExPairs: string[][] }; runtime: { ui?: { game?: Record<string, unknown> } } } | undefined; classic: unknown }>((resolve, reject) => {
      const tx = database.transaction("seasonSaves", "readonly"), store = tx.objectStore("seasonSaves"), free = store.get("top-transit-love-ai-free"), classic = store.get("top-transit-love");
      tx.oncomplete = () => { const result={ free: free.result, classic: classic.result }; database.close(); resolve(result); }; tx.onerror = () => reject(tx.error);
    });
  });
  expect(saves.free?.gameMode).toBe("AI_FREE");
  expect(saves.free?.history.formalExPairs).toEqual([["ZZX", "ZJ"]]);
  expect(JSON.stringify(saves.free?.runtime.ui?.game)).not.toContain("test-key-not-persisted");
  expect(saves.classic).toBeTruthy();
});
