import { expect, test, type Page } from "@playwright/test";

async function state(page:Page){return JSON.parse(await page.getByTestId("state").innerText()) as Record<string,any>}
async function finishScene(page:Page,expected:string){
 for(let step=0;step<80;step++){
  const saved=await state(page);if(saved.ep06Stage!==expected)return;
  const before=Number(saved.line??0);const next=page.locator(".ep06-controls .season-primary");await next.click();
  await page.waitForFunction(({expected,before})=>{const raw=document.querySelector('[data-testid="state"]')?.textContent??"{}";const current=JSON.parse(raw);return current.ep06Stage!==expected||Number(current.line??0)>before;},{expected,before},{timeout:3000});
 }
 throw new Error(`EP06 did not leave stage ${expected}`);
}

test("EP06 V14 plays every required scene, records real clips, preserves SMS and broadcasts once",async({page})=>{
 test.setTimeout(360_000);await page.goto("/tests/fixtures/ep06-harness.html");
 await expect(page.getByText("第二次选择",{exact:true})).toBeVisible();
 await page.screenshot({path:"test-results/ep06-v14-intro.png"});
 await finishScene(page,"INTRO");await expect(page.getByRole("heading",{name:"安排第二轮约会"})).toBeVisible();await page.getByRole("button",{name:"打开导演安排"}).click();
 const groups=page.locator(".ep06-assignment");
 for(const name of ["朱志鑫","苏新皓"])await groups.nth(0).getByRole("button",{name:new RegExp(name)}).click();
 for(const name of ["张极","张泽禹"])await groups.nth(1).getByRole("button",{name:new RegExp(name)}).click();
 await groups.nth(0).locator("select").selectOption("pottery");await groups.nth(1).locator("select").selectOption("bookstore");
 await page.getByRole("button",{name:"确认安排并开始实际录制"}).click();
 await expect(page.locator(".ep06-visual")).toContainText("第一组");
 for(let i=0;i<8;i++){await page.locator(".ep06-controls .season-primary").click();await expect.poll(async()=>Number((await state(page)).ep06DateALine)).toBe(i+1);}
 await expect(page.locator(".d1-bubble-row").first()).toBeVisible();await page.screenshot({path:"test-results/ep06-v14-date-a.png"});
 await finishScene(page,"DATE_A");await finishScene(page,"STAY_HOME");await finishScene(page,"DATE_B");await finishScene(page,"DINNER");
 const savedBeforeInterviews=await state(page);expect(savedBeforeInterviews.ep06RecordedClips.length).toBeGreaterThanOrEqual(8);expect(savedBeforeInterviews.ep06CompletedScenes).toContain("D06_STAY_HOME");expect(savedBeforeInterviews.ep06KCBeat).toBe(true);expect(savedBeforeInterviews.ep06RecordedClips.some((clip:any)=>clip.id==="KC06_ASK_BEFORE_HELP")).toBe(true);
 await page.getByRole("button",{name:"选择两位进行后采"}).click();
 await page.getByRole("button",{name:/朱志鑫/}).click();await page.getByRole("button",{name:/左航/}).click();await page.getByRole("button",{name:"确认采访名单"}).click();
 await expect(page.getByText("朱志鑫 · 后采")).toBeVisible();
 for(let i=0;i<25;i++){const s=await state(page);if(s.ep06InterviewIndex!==0)break;await page.locator(".ep06-controls .season-primary").click();}
 for(let i=0;i<25;i++){const app=await page.locator("body").innerText();if(app.includes("测试投递一次"))break;await page.locator(".ep06-controls .season-primary").click();}
 await expect(page.getByRole("button",{name:"测试投递一次并打开剪辑室"})).toBeVisible();
 const beforeSend=await state(page);expect(beforeSend.ep06CompletedScenes).toContain("D06_INTERVIEW");
 await page.getByRole("button",{name:"测试投递一次并打开剪辑室"}).click();
 await expect(page.getByRole("heading",{name:"导演剪辑室"})).toBeVisible();
 const assets=page.locator(".cut-asset");expect(await assets.count()).toBeGreaterThanOrEqual(8);
 await assets.nth(0).getByRole("button",{name:"选入正片"}).click();await assets.nth(1).getByRole("button",{name:"选入正片"}).click();await assets.nth(2).getByRole("button",{name:"选入正片"}).click();
 await expect(page.getByText("恰好选择 3 段")).toBeVisible();await page.getByRole("button",{name:/选择剪辑重点/}).click();
 await page.getByRole("button",{name:/温馨群像/}).click();await page.getByRole("button",{name:/生成播出预览/}).click();await page.screenshot({path:"test-results/ep06-v14-cut-preview.png"});
 await page.getByRole("button",{name:/确认剪辑并播出/}).click();await expect(page.getByRole("heading",{name:"微博 · 第二次选择"})).toBeVisible();
 const published=await state(page);expect(published.airedClips).toHaveLength(3);expect(published.ep06SocialBatch.clipIds).toEqual(published.airedClips);expect(published.sent).toBe(true);
 await page.getByRole("button",{name:"浏览微博并继续"}).click();
 const batchBefore=JSON.stringify(published.ep06SocialBatch);
 for(const [app,label,button] of [["forum","豆瓣","浏览豆瓣并继续"],["threads","Threads","浏览Threads并继续"]] as const){
  await page.evaluate((target)=>{(window as any).setApp(target)},app);await expect(page.getByRole("heading",{name:`${label} · 第二次选择`})).toBeVisible();
  await expect(page.locator(".ep06-feed article")).toHaveCount(3);await page.getByRole("button",{name:button}).click();
 }
 const afterSocial=await state(page);expect(afterSocial.ep06Stage).toBe("COMPLETE");expect(JSON.stringify(afterSocial.ep06SocialBatch)).toBe(batchBefore);expect(await page.getByTestId("episode-complete").innerText()).toBe("true");
 // The on-air pages are derived exclusively from the three frozen clip IDs.
 expect(published.airedClips.every((id:string)=>published.ep06RecordedClips.some((clip:any)=>clip.id===id))).toBe(true);
});

test("legacy EP06 save resumes missing V14 recording without resetting or resending SMS",async({page})=>{
 await page.goto("/tests/fixtures/ep06-harness.html?legacySent=1&app=bilibili");
 await expect(page.getByRole("heading",{name:"先补齐真实拍摄"})).toBeVisible();
 await page.screenshot({path:"test-results/ep06-v14-legacy-recovery.png"});
 const recovered=await state(page);
 expect(recovered.ep06Stage).toBe("ASSIGN");
 expect(recovered.sent).toBe(true);
 expect(recovered.smsFrozen.ZZX.body).toBe("原存档短信正文");
 expect(recovered.sms).toEqual({ZZX:"SXH",SXH:"ZZX"});
 expect(recovered.formalExPairs).toEqual([["ZZX","SXH"]]);
 expect(recovered.recorded).toContain("legacy-clip");
 await page.getByRole("button",{name:"补齐缺失的导演安排"}).click();
 await expect(page.getByRole("heading",{name:"安排两组约会与留守"})).toBeVisible();
 expect((await state(page)).ep06Stage).toBe("ASSIGN");
 expect((await state(page)).sent).toBe(true);
});
