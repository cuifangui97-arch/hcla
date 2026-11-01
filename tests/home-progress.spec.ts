import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { initialRuntime, type Work } from "../src/schema";
import { makeTopSeasonSave, TOP_CLASSIC_SAVE_ID } from "../src/persistence";

function fixture(episode: number, phase: string, line = 0) {
  const work=JSON.parse(readFileSync(new URL("../public/work.json",import.meta.url),"utf8")) as Work;
  const runtime=initialRuntime(work);
  runtime.variables.gameMode="A";
  runtime.variables.gameSeed="home-progress-e2e-seed";
  runtime.variables.gameDay=episode;
  runtime.variables.seasonStarted=true;
  runtime.variables.completedEpisodes=episode>=5?"[1,2,3,4]":"[1,2,3]";
  runtime.variables.topSeasonHistory=JSON.stringify({relationshipMode:"A",randomSeed:"home-progress-e2e-seed",formalExPairs:[["ZZX","SXH"],["ZJ","ZZY"]],relationshipHistory:[],hiddenSecrets:[{id:"x-room-letters",value:"sealed"}],pastUnconfirmedPairs:[]});
  runtime.ui={...runtime.ui,game:{...runtime.ui?.game,seasonGameMode:"CLASSIC",seasonSaveId:TOP_CLASSIC_SAVE_ID,...(episode>=4?{episode4:JSON.stringify({episode:4,phase:episode>=5?"complete":phase,line,pair:[],choice:"",interviews:[],sms:{},locked:[],sent:false,clips:[],recorded:[],viewed:[],visits:[],likes:[],replies:{},ending:"",ep04Letters:{}})}:{})}};
  const save=makeTopSeasonSave(runtime,1);
  save.id=TOP_CLASSIC_SAVE_ID;
  return save;
}

async function seedSave(page: import("@playwright/test").Page, save: ReturnType<typeof fixture>) {
  await page.evaluate((record)=>new Promise<void>((resolve,reject)=>{
    localStorage.setItem("top-transit-love-active-mode","CLASSIC");
    const request=indexedDB.open("foundphone-studio");
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains("seasonSaves")){db.close();reject(new Error("应用存档库未初始化"));return;}
      const tx=db.transaction("seasonSaves","readwrite");
      tx.objectStore("seasonSaves").put(record);
      tx.oncomplete=()=>{db.close();resolve();};
      tx.onerror=()=>{db.close();reject(tx.error);};
    };
  }),save);
}

test("EP04 home card restores the saved scene after returning home and refreshing",async({page})=>{
  await page.goto("/");
  await expect(page.locator(".lock-screen")).toBeVisible();
  await seedSave(page,fixture(4,"story",0));
  await page.reload();
  await expect(page.locator(".lock-screen")).toBeVisible();
  await page.getByRole("button",{name:"轻触解锁"}).click();
  const card=page.locator(".home-continue");
  await expect(card).toContainText("EP.04 · 写给X的信");
  await expect(card).toContainText("当前进度：场景1/12");
  await card.click();
  await expect(page.locator(".season-cam")).toBeVisible();
  await expect(page.locator(".season-cam h2")).toHaveText("写给X的信");
  await expect(page.locator(".season-controls")).toBeVisible();
  await page.screenshot({path:"screenshots/home-progress/ep04-resumed.png"});
  await page.locator(".season-controls").getByRole("button",{name:"返回桌面"}).click();
  await expect(page.locator(".home-continue")).toContainText("场景1/12");
  await page.reload();
  await page.getByRole("button",{name:"轻触解锁"}).click();
  await expect(page.locator(".home-continue")).toContainText("EP.04 · 写给X的信");
  await expect(page.locator(".home-continue")).toContainText("场景1/12");
  await page.locator(".home-continue").click();
  await expect(page.locator(".season-cam h2")).toHaveText("写给X的信");
  await page.screenshot({path:"screenshots/home-progress/ep04-after-refresh.png"});
});

test("completed EP04 points to the opened EP05 while preserving the episode archive",async({page})=>{
  await page.goto("/");
  await expect(page.locator(".lock-screen")).toBeVisible();
  await seedSave(page,fixture(5,"complete"));
  await page.reload();
  await expect(page.locator(".lock-screen")).toBeVisible();
  await page.getByRole("button",{name:"轻触解锁"}).click();
  const card=page.locator(".home-continue");
  await expect(card).toContainText("EP.05 · 你在看谁");
  await expect(card).toContainText("EP.05 · 你在看谁");
  await expect(card).toContainText("尚未开始");
  await card.click();
  await expect(page.locator(".season-cam h2")).toHaveText("你在看谁");
});

test("legacy save with delivered EP04 messages resumes directly in the unlocked edit room",async({page})=>{
  await page.goto("/");
  await expect(page.locator(".lock-screen")).toBeVisible();
  const save=fixture(4,"story");
  save.runtime.ui!.game={...save.runtime.ui?.game,episode4:JSON.stringify({episode:4,phase:"sms",line:9,pair:["ZZX","SXH"],choice:"",interviews:["ZZX","SXH"],sms:{ZZX:"SXH",SXH:"ZZX",ZJ:"ZZY",ZZY:"ZJ",ZH:"ZZX"},locked:["ZZX","SXH","ZJ","ZZY","ZH"],sent:true,smsFrozen:{ZZX:{body:"frozen-sms-a"},SXH:{body:"frozen-sms-b"},ZJ:{body:"frozen-sms-c"},ZZY:{body:"frozen-sms-d"},ZH:{body:"frozen-sms-e"}},ep04SmsCompleted:true,ep04InterviewCompleted:true,ep04FreeActivityCompleted:true,readingOrder:["ZZX","SXH","ZJ","ZZY","ZH"],readingOrderConfirmed:true,allLettersRead:true,lettersReadCount:5,ep04LetterPhaseCompleted:true,recorded:["D04_CLIP_LIVING_REMOTE","D04_CLIP_LIVING_LETTER","D04_CLIP_KC_CUP"],viewed:["D04_CLIP_LIVING_REMOTE"],clips:[],visits:[],likes:[],replies:{}})};
  await seedSave(page,save);
  await page.reload();
  await page.getByRole("button",{name:"轻触解锁"}).click();
  const card=page.locator(".home-continue");
  await expect(card).toContainText("EP.04 · 写给X的信");
  await expect(card).toContainText("正片剪辑");
  await expect(card).toContainText("场景12/12");
  await card.click();
  await expect(page.locator(".cut-room")).toBeVisible();
  await expect(page.getByRole("heading",{name:"本期素材库"})).toBeVisible();
  await expect.poll(()=>page.locator(".cut-asset:not(.locked)").count()).toBeGreaterThan(2);
  await page.screenshot({path:"screenshots/home-progress/ep04-sms-legacy-resumed-edit.png"});
  await page.reload();
  await page.getByRole("button",{name:"轻触解锁"}).click();
  await expect(page.locator(".home-continue")).toContainText("正片剪辑");
  await page.locator(".home-continue").click();
  await expect(page.locator(".cut-room")).toBeVisible();
});

test("stuck legacy EP04 finishes the remaining letters once, follows EP04 stages, and unlocks EP05",async({page})=>{
  test.setTimeout(120000);
  await page.goto("/");
  await expect(page.locator(".lock-screen")).toBeVisible();
  const save=fixture(4,"story");
  save.runtime.ui!.game={...save.runtime.ui?.game,episode4:JSON.stringify({episode:4,phase:"decision",line:0,pair:["ZZX","SXH"],choice:"安排介绍信阅读顺序",interviews:[],sms:{},locked:[],sent:false,clips:[],recorded:[],viewed:[],visits:[],likes:[],replies:{},ending:"",ep04Letters:{ZZX:{opened:true,expanded:true,read:true,reactionViewed:true,observationViewed:true},SXH:{opened:true,expanded:true,read:true,reactionViewed:true,observationViewed:true}}})};
  await seedSave(page,save);
  await page.reload();
  await page.getByRole("button",{name:"轻触解锁"}).click();
  await page.locator(".home-continue").click();
  await expect(page.getByRole("heading",{name:"安排五人读信顺序"})).toBeVisible();
  await expect(page.getByText(/当前搭档/)).toHaveCount(0);
  await expect(page.locator(".season-order-list li")).toHaveCount(2);
  for(const name of ["张极","张泽禹","左航"]) await page.locator(".season-reading-order button").filter({hasText:name}).click();
  await expect(page.locator(".season-order-list li")).toHaveCount(5);
  await page.getByRole("button",{name:"确认五人顺序并进入读信"}).click();
  await page.getByRole("button",{name:"继续五位嘉宾读信"}).click();
  await expect(page.locator(".ep04-reading-foot strong")).toContainText("已读 2/5");
  for(let i=0;i<3;i++){
    if(await page.getByRole("button",{name:"点击拆封"}).isVisible()) await page.getByRole("button",{name:"点击拆封"}).click();
    if(await page.getByRole("button",{name:"展开信件"}).isVisible()) await page.getByRole("button",{name:"展开信件"}).click();
    const read=page.getByRole("button",{name:"读完信件 · 查看反应"});
    if(await read.isVisible()) await read.click();
    const reaction=page.getByRole("button",{name:"收录本段反应素材"});
    if(await reaction.isVisible()) await reaction.click();
    const observation=page.getByRole("button",{name:"收录其他嘉宾观察反应"});
    if(await observation.isVisible()) await observation.click();
  }
  await expect(page.getByRole("button",{name:/五份读信流程均已完成/})).toBeVisible();
  await page.getByRole("button",{name:/五份读信流程均已完成/}).click();
  await expect(page.locator(".ep04-free-cameras button")).toHaveCount(3);
  await expect(page.locator(".ep04-free-head h1")).toHaveText("下午自由活动");
  const nextLine=page.locator(".ep04-free-next");
  const finishScene=async()=>{for(let i=0;i<60;i++){if((await nextLine.innerText())==="本段已录完")return;await nextLine.click();}throw new Error("机位对白未能推进到结尾");};
  const advanceToText=async(text:string)=>{for(let i=0;i<60;i++){if((await page.locator(".d1-chat-scroll").innerText()).includes(text))return;await nextLine.click();}throw new Error(`未能推进到对白：${text}`);};
  await page.getByRole("button",{name:"自动播放"}).click();
  await expect(page.getByRole("button",{name:"暂停"})).toBeVisible();
  await expect.poll(()=>page.locator(".d1-transcript-meta").innerText(),{timeout:15000}).toMatch(/2\s*\//);
  await page.getByRole("button",{name:"暂停"}).click();
  await page.screenshot({path:"screenshots/home-progress/ep04-free-activity-living.png"});
  await finishScene();
  await expect.poll(()=>page.locator(".d1-chat-scroll").evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
  await page.getByRole("button",{name:/CAM 01/}).click();
  await page.getByRole("button",{name:"回放素材"}).click();
  await expect(page.locator(".d1-transcript-meta")).toContainText("0 /");
  await page.getByRole("button",{name:/CAM 02/}).click();
  await expect(page.locator(".ep04-free-visual")).toHaveCSS("background-image",/kitchen-day1\.jpg/);
  await page.getByRole("button",{name:"自动播放"}).click();
  await expect(page.getByRole("button",{name:"暂停"})).toBeVisible();
  await expect.poll(()=>page.locator(".d1-transcript-meta").innerText(),{timeout:10000}).not.toContain("0 /");
  await page.getByRole("button",{name:"暂停"}).click();
  await advanceToText("你今天怎么不问了？");
  await expect(page.locator(".d1-chat-scroll")).toContainText("你今天怎么不问了？");
  await page.getByRole("button",{name:"自动播放"}).click();
  await expect(page.getByRole("button",{name:"暂停"})).toBeVisible();
  await page.getByRole("button",{name:/CAM 03/}).click();
  await expect(page.getByRole("button",{name:"自动播放"})).toBeVisible();
  await expect(page.locator(".ep04-free-visual")).toHaveCSS("background-image",/balcony-day1\.jpg/);
  await advanceToText("航酱。");
  await expect(page.locator(".d1-chat-scroll")).toContainText("航酱。");
  await finishScene();
  await page.getByRole("button",{name:/CAM 02/}).click();
  await finishScene();
  await expect(page.getByRole("button",{name:"结束自由活动 · 进入后采"})).toBeEnabled();
  await page.getByRole("button",{name:"结束自由活动 · 进入后采"}).click();
  await expect(page.getByRole("heading",{name:"本期后采"})).toBeVisible();
  await page.getByRole("button",{name:/朱志鑫/}).click();
  await page.getByRole("button",{name:/苏新皓/}).click();
  await page.getByRole("button",{name:/开始后采/}).click();

  for(let interview=0;interview<2;interview++){
    if(await page.getByRole("button",{name:"开始录制"}).isVisible()) await page.getByRole("button",{name:"开始录制"}).click();
    for(let step=0;step<20;step++){
      const followup=page.locator(".interview-followups button").first();
      if(await followup.isVisible()) { await followup.click(); continue; }
      const next=page.getByRole("button",{name:/下一条|完成本场后采/});
      if(await next.isVisible()) { const label=await next.innerText(); await next.click(); if(label.includes("完成本场后采"))break; }
      if(await page.getByRole("button",{name:"开始录制"}).isVisible())break;
    }
    if(interview===0&&await page.getByRole("button",{name:"开始录制"}).isVisible())await page.getByRole("button",{name:"开始录制"}).click();
  }
  await expect(page.getByRole("heading",{name:"五人独立锁定短信"})).toBeVisible();
  const rows=page.locator(".season-sms-row");
  await expect(rows).toHaveCount(5);
  for(let i=0;i<5;i++){
    const row=rows.nth(i);const select=row.locator("select");await select.selectOption({index:1});await row.getByRole("button",{name:"锁定"}).click();
  }
  await page.getByRole("button",{name:"五条短信统一发送"}).click();
  await page.getByRole("button",{name:"进入剪辑室"}).click();
  const assets=page.locator(".cut-asset:not(.locked)");
  await expect.poll(()=>assets.count()).toBeGreaterThan(2);
  for(let i=0;i<3;i++)await assets.nth(i).getByRole("button",{name:"选入正片"}).click();
  await page.getByRole("button",{name:/选择剪辑重点/}).click();
  await page.getByRole("button",{name:/友情纪实/}).click();
  await page.getByRole("button",{name:/生成播出预览/}).click();
  await page.getByRole("button",{name:/确认剪辑并播出/}).click();
  await expect(page.locator(".home-continue")).toContainText("EP.05 · 你在看谁",{timeout:15000});
  await expect(page.locator(".home-continue")).toContainText("尚未开始");
  await page.screenshot({path:"screenshots/home-progress/ep04-legacy-loop-fixed-ep05.png"});
});
