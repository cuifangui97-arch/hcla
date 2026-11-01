import { mkdirSync } from "node:fs";
import { test, expect, type Locator, type Page } from "@playwright/test";

const shots = "screenshots/day1";
mkdirSync(shots, { recursive: true });

async function advanceDialogueUntil(page: Page, target: Locator, limit = 80) {
  const next = page.locator(".d1-player-bar button").filter({ hasText: /下一条|下一场景|完成/ }).first();
  for (let i = 0; i < limit; i += 1) {
    if (await target.isVisible().catch(() => false)) return;
    await expect(next).toBeVisible();
    await next.click();
  }
  await expect(target).toBeVisible();
}

async function chooseClip(page: Page, title: string) {
  const card = page.locator(".cut-asset").filter({ hasText: title });
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "选入正片" }).click();
}

test("Day 1 offline episode completes, publishes grounded social feeds and resumes after refresh", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator(".lock-screen")).toBeVisible();
  await page.screenshot({ path: `${shots}/01-lock-screen.png` });

  await page.getByRole("button", { name: "轻触解锁" }).click();
  await expect(page.locator(".home-continue")).toBeVisible();
  await expect(page.locator('[data-original-icon="photos"]')).toBeVisible();
  await expect(page.locator('[data-original-icon="weibo"]')).toBeVisible();
  await expect(page.locator('[data-original-icon="forum"]')).toBeVisible();
  await expect(page.locator('[data-original-icon="threads"]')).toBeVisible();
  await page.screenshot({ path: `${shots}/02-phone-home.png` });
  await page.getByRole("button", { name: /继续录制/ }).click();
  await expect(page.getByRole("button", { name: "开始录制" })).toBeVisible();
  await page.screenshot({ path: `${shots}/03-episode-intro.png` });
  await page.getByRole("button", { name: "开始录制" }).click();
  await expect(page.locator(".d1-monitor")).toBeVisible();
  await expect(page.locator(".d1-guest-photo")).toHaveCount(5);
  await expect(page.getByRole("img", { name: "朱志鑫头像" })).toBeVisible();
  await expect(page.locator(".d1-bubble, .d1-stage-caption").first()).toBeVisible();
  await page.locator(".d1-player-bar button").filter({ hasText: "下一条" }).click();
  await page.locator(".d1-player-bar button").filter({ hasText: "下一条" }).click();
  await expect.poll(() => page.locator(".d1-chat-scroll .d1-bubble-row, .d1-chat-scroll .d1-stage-caption").count()).toBeGreaterThanOrEqual(2);
  await page.reload();
  await page.getByRole("button", { name: "轻触解锁" }).click();
  await page.getByRole("button", { name: /继续录制/ }).click();
  await expect.poll(() => page.locator(".d1-chat-scroll .d1-bubble-row, .d1-chat-scroll .d1-stage-caption").count()).toBeGreaterThanOrEqual(2);
  await page.screenshot({ path: `${shots}/04-cam-arrivals.png` });
  await advanceDialogueUntil(page, page.getByRole("button", { name: "安排第一餐" }));
  await page.getByRole("button", { name: "安排第一餐" }).click();
  await expect(page.locator(".d1-role-list")).toBeVisible();
  await expect(page.locator(".d1-role-list .d1-role-row")).toHaveCount(5);
  await page.screenshot({ path: `${shots}/05-director-dinner-roles.png` });
  await page.getByRole("button", { name: "使用节目组建议分工" }).click();
  await page.getByRole("button", { name: /确认分工并切入厨房/ }).click();
  await expect(page.locator(".d1-kitchen-footer")).toContainText("朱志鑫 × 张极");
  await page.screenshot({ path: `${shots}/06-cam-kitchen.png` });
  await advanceDialogueUntil(page, page.locator(".d1-focus-pick"), 40);
  await page.getByRole("button", { name: "极禹航" }).click();
  await advanceDialogueUntil(page, page.locator(".d1-night-switcher"));
  await page.screenshot({ path: `${shots}/07-cam-night-cameras.png` });
  await advanceDialogueUntil(page, page.locator(".d1-interview-select"), 40);
  await page.screenshot({ path: `${shots}/08-interview-selection.png` });
  const interviewChoices = page.locator(".d1-interview-select button");
  await interviewChoices.nth(0).click();
  await interviewChoices.nth(1).click();
  await page.getByRole("button", { name: "开始采访" }).click();
  await expect(page.locator(".d1-interview-portrait")).toBeVisible();
  await expect(page.locator(".d1-interview-avatar")).toBeVisible();
  await page.screenshot({ path: `${shots}/09-interview-room.png` });
  await page.getByRole("button", { name: /保存回答并继续|切换下一位/ }).click();
  await page.getByRole("button", { name: /保存回答并继续|切换下一位/ }).click();
  await expect(page.locator(".d1-sms-card")).toBeVisible();
  await page.screenshot({ path: `${shots}/10-heart-sms-locking.png` });
  for (const guest of ["朱志鑫", "苏新皓", "张极", "张泽禹", "左航"]) {
    const recipient = page.getByLabel(`${guest}选择收件人`);
    await recipient.selectOption({ index: 1 });
    await page.getByRole("button", { name: `锁定${guest}的选择` }).click();
  }
  await page.getByRole("button", { name: "五条同时送达" }).click();
  await expect(page.locator(".d1-inbox-list article")).toHaveCount(5);
  await expect(page.locator(".d1-x-notice")).toHaveCount(5);
  await expect(page.locator(".d1-anon-bubble").first()).toContainText("来自匿名嘉宾");
  await page.screenshot({ path: `${shots}/11-anonymous-inboxes.png` });
  await page.getByRole("button", { name: /进入剪辑室/ }).click();
  await expect(page.locator(".cut-room")).toBeVisible();
  expect(await page.locator(".cut-asset").count()).toBeGreaterThanOrEqual(3);
  await chooseClip(page, "第一位入住者");
  await chooseClip(page, "入住第一餐");
  await chooseClip(page, "阳台透气");
  await page.getByRole("button", { name: /选择剪辑重点/ }).click();
  await page.getByRole("button", { name: /友情纪实/ }).click();
  await page.getByRole("button", { name: /生成播出预览/ }).click();
  await expect(page.locator(".cut-preview-list li")).toHaveCount(3);
  await page.locator(".cut-order button[aria-label='向后移动']").first().click();
  await expect(page.locator(".cut-preview-list li").nth(0)).toContainText("入住第一餐");
  await page.getByRole("button", { name: "回到调整" }).click();
  await page.getByRole("button", { name: /友情纪实/ }).click();
  await page.getByRole("button", { name: /生成播出预览/ }).click();
  await page.screenshot({ path: `${shots}/12-edit-room.png` });
  await page.getByRole("button", { name: "确认剪辑并播出" }).click();
  await expect(page.locator(".d1-social-weibo")).toBeVisible();
  await expect(page.locator(".d1-social-post").first()).toContainText("已播素材");
  await page.getByRole("button", { name: "热搜" }).click();
  await expect(page.locator(".wb-hot-row")).toHaveCount(12);
  await page.locator(".wb-hot-row").first().click();
  await expect(page.locator(".wb-post")).toHaveCount(3);
  await page.getByRole("button", { name: "查看博文与楼中楼 ›" }).first().click();
  await expect(page.locator(".d1-comment-thread")).toHaveCount(5);
  await page.getByRole("button", { name: "‹ 返回话题" }).click();
  await page.getByRole("button", { name: "‹ 返回热搜" }).click();
  await page.getByRole("button", { name: "超话" }).click();
  await expect(page.locator(".wb-super-card")).toHaveCount(5);
  await page.locator(".wb-super-card").filter({ hasText: "棍铲超话" }).click();
  await expect(page.locator(".wb-post")).toHaveCount(3);
  await page.getByRole("button", { name: "‹ 返回超话" }).click();
  await page.getByRole("button", { name: "CP榜" }).click();
  await expect(page.locator(".wb-cp-list > button").filter({ hasText: "节目主推CP" })).toHaveCount(4);
  await expect(page.locator(".wb-disclaimer")).toContainText("不是恋爱状态或X身份");
  await page.getByRole("button", { name: "推荐" }).click();
  await page.screenshot({ path: `${shots}/13-weibo-feed.png` });

  await page.getByRole("button", { name: "返回桌面" }).click();
  await page.getByRole("button", { name: "打开豆瓣" }).click();
  await expect(page.locator(".d1-social-forum")).toBeVisible();
  expect(await page.locator(".d1-social-post").count()).toBeGreaterThanOrEqual(3);
  await page.screenshot({ path: `${shots}/14-douban-feed.png` });
  await page.getByRole("button", { name: "返回桌面" }).click();
  await page.getByRole("button", { name: "打开Threads" }).click();
  await expect(page.locator(".d1-social-threads")).toBeVisible();
  await page.screenshot({ path: `${shots}/15-threads-feed.png` });
  await expect(page.locator(".d1-end-card")).toBeVisible();
  await page.screenshot({ path: `${shots}/16-episode-complete.png` });

  await page.reload();
  await page.getByRole("button", { name: "轻触解锁" }).click();
  await page.getByRole("button", { name: /继续录制/ }).click();
  await expect(page.locator(".d1-end-card")).toBeVisible();
  await expect(page.locator(".d1-day2-lock")).toContainText("DAY 2");
  await page.screenshot({ path: `${shots}/17-refresh-resume.png` });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: `${shots}/18-mobile-complete.png` });
});

test("chat transcript accumulates, auto playback pauses and resumes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "轻触解锁" }).click();
  await page.getByRole("button", { name: /继续录制/ }).click();
  await page.getByRole("button", { name: "开始录制" }).click();
  const next = page.locator(".d1-player-bar button").filter({ hasText: /下一条|下一场景/ });
  for (let i = 0; i < 25; i += 1) {
    if ((await page.locator(".d1-monitor-badge b").textContent())?.includes("张极入住")) break;
    await next.click();
  }
  for (let i = 0; i < 9; i += 1) await next.click();
  await expect(page.locator(".d1-chat-scroll .d1-bubble-row, .d1-chat-scroll .d1-stage-caption")).toHaveCount(10);
  await page.getByRole("button", { name: /自动播放/ }).click();
  await expect(page.getByRole("button", { name: /暂停/ })).toBeVisible();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /暂停/ }).click();
  const count = await page.locator(".d1-chat-scroll .d1-bubble-row, .d1-chat-scroll .d1-stage-caption").count();
  await page.waitForTimeout(1800);
  await expect(page.locator(".d1-chat-scroll .d1-bubble-row, .d1-chat-scroll .d1-stage-caption")).toHaveCount(count);
  await page.getByRole("button", { name: /自动播放/ }).click();
  await expect.poll(() => page.locator(".d1-chat-scroll .d1-bubble-row, .d1-chat-scroll .d1-stage-caption").count(), { timeout: 7000 }).toBeGreaterThan(count);
});
