import { expect, test } from "@playwright/test";
import fs from "node:fs";

async function saved(page:any){return JSON.parse((await page.locator("#ep10-state").textContent())||"{}");}
async function advanceTo(page:any,phase:string,max=120){for(let i=0;i<max;i++){const s=await saved(page);if(s.phase===phase)return;const app=await page.locator(".season-cam").count();if(!app)await page.getByRole("button",{name:"CAM"}).click();const button=page.locator(".season-controls .season-primary");await expect(button).toBeVisible();await button.click();}throw new Error(`EP10 did not reach ${phase}; save=${JSON.stringify(await saved(page))}`);}

test("EP10 publicly reveals the saved X map, records two selected dual-cabinet cards, reads the full letter, and records the repair agreement",async({page})=>{
 fs.mkdirSync("screenshots",{recursive:true});
 await page.goto("/tests/fixtures/ep10-v165.html");
 expect((await saved(page)).phase).toBe("story");
 await advanceTo(page,"kc-recall-select");
 await expect(page.getByRole("heading",{name:"从四张主题卡里选两张"})).toBeVisible();
 await expect(page.locator(".season-memory-card")).toHaveCount(4);
 await page.screenshot({path:"screenshots/ep10-v165-double-cabinet-cards.png",fullPage:true});
 const imageStates=await page.locator(".season-memory-card img").evaluateAll((imgs:HTMLImageElement[])=>imgs.map(img=>({src:img.getAttribute("src"),loaded:img.complete&&img.naturalWidth>0})));
 expect(imageStates.filter(row=>row.loaded).length).toBeGreaterThanOrEqual(10);
 await page.getByRole("button",{name:/主题卡 A/}).click();
 await page.getByRole("button",{name:/主题卡 D/}).click();
 await page.getByRole("button",{name:"确认两张并进入双柜对照"}).click();
 await page.getByRole("button",{name:"CAM"}).click();
 await advanceTo(page,"kc-letter");
 let state=await saved(page);
 expect(state.kcRevealCardPlayedIds).toEqual(["A","D"]);
 expect(state.recorded).toContain("KC10-TWOROOM-CARD-A");
 expect(state.recorded).toContain("KC10-TWOROOM-CARD-D");
 await expect(page.getByText("所以才要留着，明年还有一个。")).toHaveCount(0);
 await page.getByRole("button",{name:/上一条/}).click().catch(()=>{});
 await advanceTo(page,"kc-repair");
 state=await saved(page);
 expect(state.recorded).toContain("KC10_LETTER_READ");
 expect(state.scriptClips.find((clip:any)=>clip.clipId==="KC10_LETTER_READ").rows.map((row:any)=>row.text).join(" ")).toContain("我也不能拿沉默当答案");
 await advanceTo(page,"interview");
 state=await saved(page);
 expect(state.recorded).toContain("KC10_REPAIR_AGREEMENT");
 expect(state.scriptClips.find((clip:any)=>clip.clipId==="KC10_REPAIR_AGREEMENT").rows.map((row:any)=>row.text).join(" ")).toContain("这次是两个都要做到。");
 expect(state.kcRevealCardPlayedIds).toEqual(["A","D"]);
});
