import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";
test.use({ channel: "msedge" });
mkdirSync("screenshots/interviews",{recursive:true});

test("interview playback pauses at the follow-up choice and preserves the selected branch",async({page})=>{
  await page.goto("/tests/fixtures/interview-harness.html");
  await page.getByRole("button",{name:"开始录制"}).click();
  for(let i=0;i<4;i++)await page.getByRole("button",{name:"下一条"}).click();
  await expect(page.getByRole("heading",{name:"导演追问"})).toBeVisible();
  await expect(page.getByRole("button",{name:"先选追问"})).toBeDisabled();
  const branch=page.getByRole("button",{name:"如果今天不用做任务，你会干什么？"});
  await branch.click();
  await page.getByRole("button",{name:"下一条"}).click();
  await expect(page.locator(".d1-chat-scroll")).toContainText("找个安静地方把东西都放整齐。");
  await page.getByRole("button",{name:"下一条"}).click();
  await expect(page.locator(".d1-chat-scroll")).toContainText("今天采购回来后大家聊了些什么？");
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:"screenshots/interviews/ep02-interview-followup.png"});
  for(let i=0;i<6;i++)await page.getByRole("button",{name:/下一条|完成本场后采/}).click();
  await expect(page.getByText("INTERVIEW_COMPLETE")).toBeVisible();
});
