import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

mkdirSync("screenshots/ep08-v165", { recursive: true });

test("the V16.5 original images load in the real browser; missing peach candy stays an explicit placeholder", async ({ page }) => {
  await page.goto("/tests/fixtures/ep08-xroom.html");
  const result = await page.evaluate(async () => {
    const paths = window.__ep08Assets;
    const responses = await Promise.all(paths.map(async src => {
      const response = await fetch(src);
      const image = new Image(); image.src = src;
      await image.decode();
      return { src, ok: response.ok, type: response.headers.get("content-type"), width: image.naturalWidth, height: image.naturalHeight };
    }));
    return responses;
  });
  expect(result).toHaveLength(20);
  expect(result.filter(row => !row.ok || !row.type?.startsWith("image/") || !row.width || !row.height)).toEqual([]);
  expect(result.filter(row => row.src.startsWith("/assets/ep08-kc/")).map(row => row.src)).toHaveLength(11);
  expect(result.filter(row => row.src.startsWith("/assets/cp-photos/")).map(row => row.src)).toHaveLength(9);
});

test("X Room shows V16.5 cabinet originals, independent dialogue and interview, and replays idempotently", async ({ page }) => {
  await page.goto("/tests/fixtures/ep08-xroom.html");
  await expect(page.getByTestId("save")).toBeAttached();
  await expect(page.getByRole("heading", { name: "朱志鑫的回忆空间" })).toBeVisible();
  await expect(page.locator(".ep08-gallery-card")).toHaveCount(6);
  const blindbox = page.locator(".ep08-gallery-card").filter({ hasText: "生日盲盒整套" });
  await blindbox.click();
  await expect(page.locator(".ep08-memory-view")).toBeVisible();
  await expect.poll(() => page.locator(".ep08-memory-image img").evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "放大查看一年一个" }).click();
  await expect(page.getByRole("dialog", { name: "一年一个放大查看" })).toBeVisible();
  await page.screenshot({ path: "screenshots/ep08-v165/xroom-photo-lightbox-mobile.png" });
  await page.getByRole("dialog").click({ position: { x: 20, y: 20 } });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.screenshot({ path: "screenshots/ep08-v165/memory-detail-mobile.png" });

  while (await page.getByRole("button", { name: "下一条", exact: true }).count()) await page.getByRole("button", { name: "下一条", exact: true }).click();
  await page.getByRole("button", { name: "完成并记录本段" }).click();
  await expect(page.locator(".ep08-memory-head")).toContainText("历史录像回看 · 不重复结算");
  await page.getByRole("button", { name: /对应后采/ }).click();
  await expect(page.locator(".ep08-memory-tabs")).toContainText("对应后采");
  await page.getByRole("button", { name: "下一条", exact: true }).click();
  await expect(page.locator(".d1-chat-scroll")).toContainText("你最不舍得动的是什么");
  while (await page.getByRole("button", { name: "下一条", exact: true }).count()) await page.getByRole("button", { name: "下一条", exact: true }).click();
  await page.getByRole("button", { name: "完成并记录本段" }).click();
  await expect(page.locator(".ep08-memory-tabs")).toContainText("对应后采 · 已录制");
  await page.getByRole("button", { name: "返回陈列室", exact: true }).click();
  await expect(blindbox).toContainText("已探索 · 历史录像");
  await expect(blindbox).toContainText("后采已看");
  await page.reload();
  await blindbox.click();
  await expect(page.locator(".ep08-memory-head")).toContainText("历史录像回看 · 不重复结算");
  while (await page.getByRole("button", { name: "下一条", exact: true }).count()) await page.getByRole("button", { name: "下一条", exact: true }).click();
  await page.getByRole("button", { name: "重看完成 · 历史录像" }).click();
  const saved = JSON.parse(await page.getByTestId("save").textContent() || "{}");
  expect(saved.roomViewedItemIds).toEqual(["ZZ_BLINDBOX"]);
  expect(saved.roomInterviewViewedItemIds).toEqual(["ZZ_BLINDBOX"]);
  expect(saved.ep08Clips.filter((clip: { clipId: string }) => clip.clipId.includes("ZZ_BLINDBOX"))).toHaveLength(2);
  expect(saved.storyBeatIds.filter((id: string) => id.includes("ZZ_BLINDBOX"))).toHaveLength(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("all five guests can complete an individual room and proceed without repeat registration", async ({ page }) => {
  await page.goto("/tests/fixtures/ep08-xroom.html");
  for (const guest of ["朱志鑫", "苏新皓", "张极", "张泽禹", "左航"]) {
    await expect(page.getByRole("heading", { name: `${guest}的回忆空间` })).toBeVisible();
    await expect(page.locator(".ep08-gallery-card").first()).toBeVisible();
    const passes=guest==="朱志鑫"||guest==="苏新皓"?2:1;
    for(let pass=0;pass<passes;pass++){
    await page.locator(".ep08-gallery-card").nth(pass).click();
    while (await page.getByRole("button", { name: "下一条", exact: true }).count()) await page.getByRole("button", { name: "下一条", exact: true }).click();
    const finish = page.getByRole("button", { name: /完成并记录本段|重看完成 · 历史录像/ });
    if (await finish.count()) await finish.click();
    await page.getByRole("button", { name: "返回陈列室", exact: true }).click();
    }
    await page.getByRole("button", { name: "完成本间并进入下一位" }).click();
  }
  await expect(page.getByRole("heading", { name: "午间交流" })).toBeVisible();
  const saved = JSON.parse(await page.getByTestId("save").textContent() || "{}");
  expect(saved.completedRoomIds).toHaveLength(5);
  expect(new Set(saved.storyBeatIds).size).toBe(saved.storyBeatIds.length);
  expect(saved.ep08Clips.filter((clip: { sceneId: string }) => clip.sceneId.includes("EP08-KC-")||clip.sceneId.includes("EP08-MEMORY-")).length).toBeGreaterThanOrEqual(7);
});
