import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

test.use({ channel: "msedge" });
const shotDir="screenshots/editor-room";
mkdirSync(shotDir,{recursive:true});

test("EP04 editor selects recorded clips, previews, orders, persists draft and publishes once",async({page})=>{
 await page.goto("/tests/fixtures/director-cut.html");
 await expect(page.getByRole("heading",{name:"导演剪辑室"})).toBeVisible();
 await expect(page.locator(".cut-asset")).toHaveCount(6);
 const protectedClip=page.locator(".cut-asset.locked");
 await expect(protectedClip).toContainText("EP04 · 保密镜头");
 await expect(protectedClip).not.toContainText("不得出现的X身份详情");
 await expect(protectedClip.getByRole("button",{name:"选入正片"})).toBeDisabled();
 await expect(page.getByRole("button",{name:/选择剪辑重点/})).toBeDisabled();
 for(const title of ["朱志鑫读信","苏新皓的反应","厨房里的停顿"]){
  const card=page.locator(".cut-asset").filter({hasText:title});
  await card.getByRole("button",{name:"选入正片"}).click();
 }
 await expect(page.getByRole("button",{name:/选择剪辑重点/})).toBeEnabled();
 await page.locator(".cut-asset").first().getByRole("button",{name:/回看素材/}).click();
 await expect(page.getByRole("dialog",{name:"素材预览"})).toContainText("测试对白");
 await page.getByRole("button",{name:"关闭"}).click();
 await page.getByRole("button",{name:/选择剪辑重点/}).click();
 await page.getByRole("button",{name:/友情纪实/}).click();
 await page.getByRole("button",{name:/生成播出预览/}).click();
 await expect(page.locator(".cut-preview-list li")).toHaveCount(3);
 await page.locator(".cut-order button[aria-label='向后移动']").first().click();
 await expect(page.locator(".cut-preview-list li").first()).toContainText("苏新皓的反应");
 await page.screenshot({path:`${shotDir}/ep04-cut-preview-mobile.png`});
 await page.reload();
 await expect(page.locator(".cut-preview-list li")).toHaveCount(3);
 await expect(page.locator(".cut-preview-list li").first()).toContainText("苏新皓的反应");
 await page.getByRole("button",{name:/确认剪辑并播出/}).click();
 await expect(page.locator(".cut-published")).toContainText("本期已发布");
 const broadcastId=await page.locator("body").evaluate(()=>JSON.parse(localStorage.getItem("cut-draft")||"{}").broadcastId);
 expect(typeof broadcastId).toBe("string");
 await page.reload();
 await expect(page.locator(".cut-published")).toContainText("重复打开或回看不会再次生成舆论批次");
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:`${shotDir}/ep04-cut-published-mobile.png`});
});
