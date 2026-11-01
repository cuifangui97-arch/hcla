import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";

const screenshots = "screenshots/anonymous-chat";
mkdirSync(screenshots, { recursive: true });

test("EP02 anonymous chat modes, aliases, response chain, bottom-follow and question box", async ({ page }) => {
  test.setTimeout(30_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tests/fixtures/anonymous-chat.html");

  const viewport = page.locator(".d1-chat-scroll");
  const distanceFromBottom = () => viewport.evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight);
  await expect(page.locator(".d1-bubble-row")).toHaveCount(1);
  expect(await distanceFromBottom()).toBeLessThan(48); // one response is bottom-aligned

  const participantLabel = page.locator(".d1-anon-participants");
  const aliases = (await participantLabel.innerText()).match(/@[a-z]+/g) ?? [];
  expect(aliases).toHaveLength(5);
  expect(new Set(aliases).size).toBe(5);
  await expect(page.locator(".d1-chat-scroll")).not.toContainText(/朱志鑫|苏新皓|张极|张泽禹|左航/);

  const next = page.getByRole("button", { name: "下一条" });
  for (let i = 0; i < 12; i += 1) await next.click();
  await expect(page.locator(".d1-chat-scroll .d1-bubble-row")).toHaveCount(13);
  expect(await page.locator(".d1-anon-avatar").evaluateAll((nodes) => new Set(nodes.map((node) => [...node.classList].find((name) => name.startsWith("d1-anon-") && name !== "d1-anon-avatar"))).size)).toBe(5);
  expect(await page.locator(".d1-reply-reference").count()).toBeGreaterThan(0);
  expect(await viewport.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  expect(await distanceFromBottom()).toBeLessThan(48);
  await page.screenshot({ path: `${screenshots}/01-group-chat.png` });

  await page.mouse.move(190, 535);
  await page.mouse.wheel(0, -420);
  await expect(page.getByRole("button", { name: "回到最新" })).toBeVisible();
  const historyTop = await viewport.evaluate((el) => el.scrollTop);
  await next.click();
  expect(await viewport.evaluate((el) => el.scrollTop)).toBe(historyTop);
  await page.getByRole("button", { name: "回到最新" }).click();
  await expect.poll(distanceFromBottom).toBeLessThan(48);

  await page.getByRole("button", { name: "自动播放" }).click();
  await expect.poll(async () => Number(await page.getByTestId("chat-progress").innerText().then((x) => x.split("/")[0])), { timeout: 5000 }).toBeGreaterThan(14);
  await expect(page.getByRole("button", { name: "暂停" })).toBeVisible();
  expect(await distanceFromBottom()).toBeLessThan(48);
  await page.getByRole("button", { name: "暂停" }).click();
  const pausedAt = await page.getByTestId("chat-progress").innerText();
  await page.waitForTimeout(1900);
  await expect(page.getByTestId("chat-progress")).toHaveText(pausedAt);

  await page.getByRole("button", { name: "双人房" }).click();
  await expect(page.locator(".d1-anon-participants")).toContainText(/参与者：@\w+ · @\w+/);
  await expect(page.locator(".d1-bubble-name")).toHaveCount(1);
  expect(await page.locator(".d1-anon-participants").innerText()).not.toMatch(/朱志鑫|苏新皓|张极|张泽禹|左航/);

  await page.getByRole("button", { name: "提问箱" }).click();
  await expect(page.locator(".d1-anonymous-answer")).toHaveCount(1);
  await expect(page.locator(".d1-bubble-row")).toHaveCount(0);
  for (let i = 0; i < 5; i += 1) await next.click();
  await expect(page.locator(".d1-anonymous-answer")).toHaveCount(5);
  await page.screenshot({ path: `${screenshots}/02-question-box.png` });
});
