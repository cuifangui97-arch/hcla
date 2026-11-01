import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";
test.use({ channel: "msedge" });
mkdirSync("screenshots/ep04-letters", { recursive: true });

test("EP04 letter text is revealed before reactions, records separately, and reaches all five guests", async ({ page }) => {
  await page.goto("/tests/fixtures/ep04-letters.html?mode=A");
  await expect(page.getByRole("heading", { name: "写给X的信" })).toBeVisible();
  await expect(page.locator(".ep04-reader-tabs button")).toHaveCount(5);
  await page.getByRole("button", { name: "点击拆封" }).click();
  await page.getByRole("button", { name: "展开信件" }).click();
  await expect(page.locator(".ep04-letter-body")).toContainText("但请不要因此觉得，他不需要被爱。");
  await expect(page.locator(".ep04-letter-body")).not.toContainText("苏新皓");
  await page.getByRole("button", { name: "收起信件" }).click();
  await expect(page.getByRole("button", { name: /信件已收起/ })).toBeVisible();
  await page.getByRole("button", { name: /信件已收起/ }).click();
  await page.getByRole("button", { name: "读完信件 · 查看反应" }).click();
  await expect(page.locator(".ep04-reaction")).toContainText("这个人写得有点……太了解了。");
  await page.getByRole("button", { name: "收录本段反应素材" }).click();
  await expect(page.locator(".ep04-observation")).toContainText("没有人追问信件作者");
  await page.getByRole("button", { name: "收录其他嘉宾观察反应" }).click();
  for (const name of ["苏新皓", "张极", "张泽禹", "左航"]) {
    await page.locator(".ep04-reader-tabs").getByRole("button", { name: new RegExp(name) }).click();
    await page.getByRole("button", { name: "点击拆封" }).click();
    await page.getByRole("button", { name: "展开信件" }).click();
    await expect(page.locator(".ep04-letter-body")).toBeVisible();
    await page.getByRole("button", { name: "读完信件 · 查看反应" }).click();
    await expect(page.locator(".ep04-reaction")).toBeVisible();
    await page.getByRole("button", { name: "收录本段反应素材" }).click();
    await page.getByRole("button", { name: "收录其他嘉宾观察反应" }).click();
  }
  await expect(page.getByText("已读 5/5 · 反应素材 5/5")).toBeVisible();
  await expect(page.getByRole("button", { name: /五份读信流程均已完成 · 继续本期/ })).toBeEnabled();
  await expect(page.getByTestId("recorded")).toHaveText("15");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "screenshots/ep04-letters/reader-mobile.png" });
});

test("EP04 uses mode-specific formal-X letters and personal cards", async ({ page }) => {
  await page.goto("/tests/fixtures/ep04-letters.html?mode=B&target=ZJ");
  await expect(page.locator(".ep04-letter-card h3")).toHaveText("写给张极的介绍信");
  await page.getByRole("button", { name: "点击拆封" }).click();
  await page.getByRole("button", { name: "展开信件" }).click();
  await expect(page.locator(".ep04-letter-body")).toContainText("他是一个很容易让气氛变好的人。");
  await page.goto("/tests/fixtures/ep04-letters.html?mode=B&target=ZZY");
  await expect(page.locator(".ep04-letter-meta")).toContainText("节目组个人介绍卡");
  await expect(page.locator(".ep04-letter-card h3")).toHaveText("节目组个人介绍卡 · 张泽禹");
  await page.goto("/tests/fixtures/ep04-letters.html?mode=C&target=ZJ");
  await expect(page.locator(".ep04-letter-meta")).toContainText("节目组个人介绍卡");
  await page.goto("/tests/fixtures/ep04-letters.html?mode=D&target=ZZY");
  await expect(page.locator(".ep04-letter-meta")).toContainText("来自X");
});
