import { expect, test } from "@playwright/test";

const pairSets=[
  ["朱志鑫","苏新皓"],["张极","张泽禹"],["张极","左航"],["张泽禹","左航"],
  ["朱志鑫","张极"],["朱志鑫","张泽禹"],["朱志鑫","左航"],["苏新皓","张极"],
  ["苏新皓","张泽禹"],["苏新皓","左航"],
];
const guestIndex:Record<string,number>={朱志鑫:0,苏新皓:1,张极:2,张泽禹:3,左航:4};
test("EP05 browser director workflow plays all ten pair scripts and records each outcome",async({page})=>{
  test.setTimeout(360_000);
  await page.goto("/tests/fixtures/ep05-harness.html");
  for(let index=0;index<pairSets.length;index++){
    const pair=pairSets[index];
    await page.evaluate((ids)=>{(window as unknown as {seedPair:(ids:number[])=>void}).seedPair(ids as never);},pair.map(name=>guestIndex[name]));
    for(const name of pair)await page.locator(".season-guest-picks button").nth(guestIndex[name]).click();
    await page.getByRole("button",{name:/确认并进入第1轮/}).click();
    await expect(page.locator(".season-cam-visual h2")).toContainText("30秒对视");
    if(index===0){for(let row=0;row<4;row++)await page.locator(".season-controls .season-primary").click();await page.screenshot({path:"test-results/ep05-eye-contact.png"});}
    for(const terminal of ["开始30秒计时","公布本轮结果","本轮完成"]){
      for(let step=0;step<35;step++){
        const button=page.locator(".season-controls .season-primary");
        if((await button.innerText()).includes(terminal))break;
        await button.click();
      }
      await page.locator(".season-controls .season-primary").click();
    }
    await expect(page.getByRole("heading",{name:"安排第二轮嘉宾"})).toBeVisible();
    const saved=JSON.parse(await page.getByTestId("state").innerText());
    expect(saved.ep05Rounds[0].completionStatus).toBe("completed");
    expect(saved.ep05Rounds[0].taskOutcome.length).toBeGreaterThan(0);
    expect(saved.recorded).toHaveLength(3);

  }
});
