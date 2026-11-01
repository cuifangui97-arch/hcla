import{expect,test,type Page}from"@playwright/test";
type S=Record<string,any>;
async function state(page:Page):Promise<S>{return JSON.parse((await page.getByTestId("state").textContent())??"{}")}
async function sendCount(page:Page){return await page.getByTestId("send-count").textContent()}
async function clickNext(page:Page){const before=await state(page);await page.locator(".ep06-controls .ep06-primary").click();await expect.poll(async()=>{const now=await state(page);return now.ep07Stage!==before.ep07Stage||now.ep07Line!==before.ep07Line||now.ep07InterviewIndex!==before.ep07InterviewIndex||JSON.stringify(now.ep07InterviewProgress)!==JSON.stringify(before.ep07InterviewProgress)}).toBe(true)}
async function finishStage(page:Page,stage:string){for(let i=0;i<100;i++){const current=await state(page);if(current.ep07Stage!==stage){console.log("stage finished",stage,"->",current.ep07Stage);return}await clickNext(page)}throw new Error("stage failed to finish: "+stage)}
async function playProfile(page:Page,index:number){for(let i=0;i<8;i++){const before=await state(page);if(before.ep07Stage!=="PROFILE_SHOW"||Number(before.profileIndex??0)>index)return;console.log("profile",index,"line",before.ep07Line);await clickNext(page)}throw new Error("profile not completed "+index)}

test("EP07 V15 runs all stages, stores real clips, preserves SMS once, and unlocks EP08",async({page})=>{
 test.setTimeout(360_000);page.setDefaultTimeout(5000);await page.goto("/tests/fixtures/ep07-harness.html");await page.evaluate(()=>localStorage.clear());await page.reload();
 console.log("loaded");
 await expect(page.locator(".ep06-visual")).toContainText("D07-INTRO");await page.screenshot({path:"test-results/ep07-v15-intro.png"});
 await finishStage(page,"INTRO");await page.getByRole("button",{name:"打开导演选择"}).click();
 const order=["ZH","ZJ","ZZY","SXH","ZZX"];const labels:Record<string,string>={ZH:"左航",ZJ:"张极",ZZY:"张泽禹",SXH:"苏新皓",ZZX:"朱志鑫"};
 for(const id of order)await page.locator(".ep07-picks").getByRole("button",{name:new RegExp(labels[id])}).click();
 await page.getByRole("button",{name:"确认介绍顺序"}).click();await page.getByRole("button",{name:"继续本期"}).click();
 for(let i=0;i<5;i++)await playProfile(page,i);
 let s=await state(page);expect(s.profileOrder).toEqual(order);expect(s.ep07CompletedSceneIds).toContain("D07-002");expect(s.ep07RecordedClips.filter((c:any)=>c.id.startsWith("D07-PROFILES-"))).toHaveLength(5);
 await expect(page.getByRole("heading",{name:"安排音乐合作分工"})).toBeVisible();
 await page.getByRole("button",{name:"先看12:10旋律组"}).click();
 const groups=page.locator(".ep07-role-card .ep07-picks");for(const n of ["张极","张泽禹"])await groups.nth(0).getByRole("button",{name:n,exact:true}).click();for(const n of ["朱志鑫","苏新皓"])await groups.nth(1).getByRole("button",{name:n,exact:true}).click();
 await expect(page.getByText("统筹者：左航")).toBeVisible();await page.getByRole("button",{name:"确认分工并开始排练"}).click();expect((await state(page)).ep07Stage).toBe("MELODY");
 await expect(page.locator(".ep06-visual")).toContainText("12:10");await finishStage(page,"MELODY");await expect(page.locator(".ep06-visual")).toContainText("11:20");await finishStage(page,"RHYTHM");await finishStage(page,"COORDINATE");
 s=await state(page);expect(s.ep07RecordedClips.some((c:any)=>c.id==="D07-MELODY-GC")).toBe(true);expect(s.ep07RecordedClips.some((c:any)=>c.id==="D07-RHYTHM-JY")).toBe(true);expect(s.ep07RecordedClips.some((c:any)=>c.id==="D07-COORD-ZH")).toBe(true);
 await page.getByRole("button",{name:"两版都试听"}).click();await finishStage(page,"REHEARSAL");s=await state(page);expect(s.ep07CompletedSceneIds).toContain("D07-007");expect(s.ep07RecordedClips.some((c:any)=>c.id==="D07-REHEARSAL-ERROR")).toBe(true);expect(s.ep07RecordedClips.some((c:any)=>c.id==="D07-REHEARSAL-FIX")).toBe(true);expect(s.ep07RelationshipEvents).toContain("KC_RESPECT_CREATIVE_CHOICE");
 await page.getByRole("button",{name:"统筹视角"}).click();await finishStage(page,"SHOWCASE");expect((await state(page)).ep07RecordedClips.some((c:any)=>c.id==="D07-SHOWCASE-FOCUS-COORDINATOR")).toBe(true);await finishStage(page,"EVENING");
 await expect(page.getByRole("heading",{name:"选择至少两位进行后采"})).toBeVisible();for(const n of ["朱志鑫","张极"])await page.locator(".ep07-picks").getByRole("button",{name:new RegExp(n)}).click();await page.getByRole("button",{name:/开始后采/}).click();
 for(let guestIndex=0;guestIndex<2;guestIndex++){
  for(let i=0;i<30;i++){const now=await state(page);if(now.ep07Stage!=="INTERVIEW")break;if(now.ep07InterviewProgress?.[now.ep07Interviews?.[now.ep07InterviewIndex??0]]?.follow==null&&now.ep07InterviewProgress?.[now.ep07Interviews?.[now.ep07InterviewIndex??0]]?.line>=7)await page.getByRole("button",{name:/追问B/}).click();await clickNext(page)}
 }
 s=await state(page);expect(s.ep07Stage).toBe("SMS");expect(s.ep07RecordedClips.filter((c:any)=>c.id.startsWith("D07-INTERVIEW-")).length).toBe(2);await page.screenshot({path:"test-results/ep07-v15-sms.png"});
 await page.getByRole("button",{name:"SMS"}).click();await page.getByRole("button",{name:"保留收件选择并发送一次"}).click();expect(await sendCount(page)).toBe("1");await page.reload();await page.getByRole("button",{name:"EDIT"}).click();
 await expect(page.getByRole("heading",{name:"导演剪辑室"})).toBeVisible();s=await state(page);expect(s.ep07Stage).toBe("EDITING");expect(s.ep07RecordedClips.length).toBeGreaterThanOrEqual(10);
 const assets=page.locator(".cut-asset");await expect(assets).toHaveCount(s.ep07RecordedClips.length);for(let i=0;i<3;i++)await assets.nth(i).getByRole("button",{name:"选入正片"}).click();await page.getByRole("button",{name:/选择剪辑重点/}).click();await page.getByRole("button",{name:/均衡群像/}).click();await page.getByRole("button",{name:/生成播出预览/}).click();await expect(page.getByText("播出前保密审核")).toBeVisible();await page.screenshot({path:"test-results/ep07-v15-cut-preview.png"});await page.getByRole("button",{name:/确认剪辑并播出/}).click();
 s=await state(page);expect(s.airedClips).toHaveLength(3);expect(s.ep07SocialPosts.every((p:any)=>s.airedClips.some((id:string)=>p.clipId===id))).toBe(true);const frozenBroadcast=s.broadcastId;
 for(const platform of ["weibo","forum","threads"]){if((await state(page)).ep07Stage==="COMPLETE")break;await page.getByRole("button",{name:platform==="weibo"?"微博":platform==="forum"?"豆瓣":"Threads"}).click();await page.getByRole("button",{name:"浏览并继续"}).click()}
 s=await state(page);expect(s.ep07Stage).toBe("COMPLETE");expect(s.broadcastId).toBe(frozenBroadcast);expect(await sendCount(page)).toBe("1");expect(s.phase).toBe("complete");await page.screenshot({path:"test-results/ep07-v15-complete.png"});
});

test("legacy delivered SMS is frozen while skipped V15 stages recover from saved choices",async({page})=>{
 const legacy={episode:7,phase:"edit",sent:true,sms:{ZZX:"SXH"},smsFrozen:{ZZX:{id:"old",senderId:"ZZX",recipientId:"SXH",body:"旧短信"}},rolePlan:{rhythmPair:["ZZX","SXH"],melodyPair:["ZJ","ZZY"],coordinator:"ZH"},ep07GroupFirst:"MELODY_FIRST",ep07CompletedSceneIds:["D07-001","D07-002"],profileOrder:["ZZX","SXH","ZJ","ZZY","ZH"]};
 await page.addInitScript(value=>localStorage.setItem("ep07V15Save",JSON.stringify({episode7:JSON.stringify(value)})),legacy);await page.goto("/tests/fixtures/ep07-harness.html");const s=await state(page);expect(s.sent).toBe(true);expect(s.smsFrozen.ZZX.body).toBe("旧短信");expect(s.ep07Stage).toBe("MELODY");await expect(page.locator(".ep06-visual")).toContainText("12:10");await page.screenshot({path:"test-results/ep07-v15-legacy-resume.png"});
});
