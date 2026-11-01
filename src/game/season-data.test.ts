import { describe, expect, it } from "vitest";
import { canonicalUnsentLetter, cpPhotos, kcPrivateLetterRowsV165, kcRepairRowsV165, kcRevealCardsV165, seasonEpisodes, seasonSceneLines, xRoomProps } from "./season-data";
const assetKeys=Object.keys(import.meta.glob("../../public/assets/{cp-photos,props,ep08-kc}/**/*"));

describe("EP04–EP14 season package",()=>{
  it("defines the remaining contiguous packages through the ten-episode finale",()=>{
    expect(seasonEpisodes.map(x=>x.episode)).toEqual(Array.from({length:7},(_,i)=>i+4));
    for(const entry of seasonEpisodes){
      const lines=seasonSceneLines(entry.episode,["ZZX","SXH"],"A","慢慢进行");
      if(entry.episode===4)expect(lines).toHaveLength(1);
      else if(entry.episode===8)expect(lines.length).toBeGreaterThanOrEqual(2);
      else if(entry.episode===9)expect(lines.length).toBeGreaterThanOrEqual(7);
      else if(entry.episode===10)expect(lines.length).toBeGreaterThanOrEqual(7);
      else expect(lines.length).toBeGreaterThanOrEqual(8);
      expect(lines.some(line=>line.speaker==="STAGE")).toBe(true);
    }
  });
  it("maps twelve real CP photos to existing project assets",()=>{
    expect(cpPhotos).toHaveLength(12);
    expect(new Set(cpPhotos.map(x=>x.cpId))).toEqual(new Set(["gunchan","jiyu","jihang","manghou"]));
    for(const photo of cpPhotos){
      expect(assetKeys.some(key=>key.endsWith(photo.assetPath.replace(/^(?:\.\/|\/)/,"")))).toBe(true);
      expect(photo.viewed).toBe(false);
      expect(photo.recorded).toBe(false);
      expect(photo.aired).toBe(false);
      expect(photo.linkedScenes.length).toBeGreaterThan(0);
    }
  });
  it("keeps each mode's formal X history and does not reveal it before EP10",()=>{
    const expected:Record<string,string[]>={A:["朱志鑫×苏新皓","张极×张泽禹"],B:["朱志鑫×苏新皓","张极×左航"],C:["朱志鑫×苏新皓"],D:["朱志鑫×苏新皓","张泽禹×左航"],E:["朱志鑫×苏新皓","张极×左航"]};
    for(const mode of "ABCDE"){
      const before=seasonSceneLines(8,["ZZX","SXH"],mode,"").map(x=>x.text).join(" ");
      expect(before).not.toMatch(/正式X映射：/);
      const reveal=seasonSceneLines(10,["ZZX","SXH"],mode,"", mode==="E"?[["ZZX","SXH"],["ZJ","ZH"]]:undefined).map(x=>x.text).join(" ");
      for(const pair of expected[mode])expect(reveal).toContain(pair);
      if(mode==="C")expect(reveal).not.toContain("张极×张泽禹");
    }
  });
  it("uses the saved E-mode X map and suppresses KC-only X Room history in a free world without KC history",()=>{
    const savedE: ["ZZX"|"SXH"|"ZJ"|"ZZY"|"ZH","ZZX"|"SXH"|"ZJ"|"ZZY"|"ZH"][]=[["ZZX","SXH"],["ZJ","ZH"]];
    const reveal=seasonSceneLines(10,["ZZX","SXH"],"E","",savedE).map(x=>x.text).join(" ");
    expect(reveal).toContain("张极×左航");
    expect(reveal).not.toContain("张极×张泽禹");
    const free=seasonSceneLines(8,["ZZX","SXH"],"C","",[["ZJ","ZH"]]).map(x=>x.text).join(" ");
    expect(free).not.toContain("玫瑰");
    expect(free).not.toContain("长走廊");
    expect(free).not.toContain("未寄出的信");
  });
  it("keeps EP04 limited to the anonymous letter-task opening before interactive reading",()=>{
    const opening=seasonSceneLines(4,["ZZX","SXH"],"C","").map(x=>x.text).join(" ");
    expect(opening).toContain("节目组制作的个人介绍卡");
    expect(opening).toContain("作者信息均封存");
    expect(opening).not.toMatch(/前任写给你|牵着手走路|玩笑讲到最后|这个人写得有点/);
  });
  it("gives EP06 mode-compatible X dialogue",()=>{
    expect(seasonSceneLines(6,["ZJ","ZH"],"B","唱片店").map(x=>x.text).join(" ")).toContain("今天我想把话说清楚一点");
    expect(seasonSceneLines(6,["ZJ","ZH"],"A","唱片店").map(x=>x.text).join(" ")).not.toContain("今天我想把话说清楚一点");
  });
  it("keeps the EP05 eye-contact debrief with the director-selected pair",()=>{
    const lines=seasonSceneLines(5,["ZJ","ZH"],"C","ask");
    const speakers=lines.filter(line=>line.speaker!=="STAGE").map(line=>line.speaker);
    expect(new Set(speakers)).toEqual(new Set(["ZJ","ZH"]));
    expect(lines.map(line=>line.text).join(" ")).not.toMatch(/苏新皓|朱志鑫/);
  });
  it("keeps the private letter outside EP08 and available as the EP10 full text",()=>{
    expect(xRoomProps.map(x=>x.id)).toEqual(["private-letter-ep10"]);
    expect(xRoomProps[0].episode).toBe(10);
    const letter=xRoomProps[0];
    expect(letter.body).toContain("我不是不想告诉你。");
    expect(letter.body).toContain("你不用急着给答案，我也不能拿沉默当答案。");
    for(const item of xRoomProps)expect(assetKeys.some(key=>key.endsWith(item.image.replace(/^(?:\.\/|\/)/,"")))).toBe(true);
    const letterRows=kcPrivateLetterRowsV165.map(row=>row.text).join(" ");
    const cards=kcRevealCardsV165.flatMap(card=>card.rows).map(row=>row.text).join(" ");
    expect(letterRows).toContain(letter.body);
    expect(cards).toContain("那幅画你一直挂着");
    expect(cards).toContain("那张水券也一样");
    expect(kcRevealCardsV165[0].items).toContain("《回答》初中拍立得");
  });
  it("provides four independent EP10 dual-cabinet cards, a full private letter, and one repair agreement",()=>{
    expect(kcRevealCardsV165.map(card=>card.id)).toEqual(["A","B","C","D"]);
    expect(new Set(kcRevealCardsV165.map(card=>card.rows.map(row=>row.text).join(" "))).size).toBe(4);
    expect(kcRevealCardsV165.find(card=>card.id==="C")?.assets).toContain(null);
    expect(kcPrivateLetterRowsV165.map(row=>row.text).join(" ")).toContain(canonicalUnsentLetter);
    expect(kcRepairRowsV165.map(row=>row.text).join(" ")).toContain("这次是两个都要做到。");
    const freeReveal=seasonSceneLines(10,["ZZX","SXH"],"AI_FREE","",[]).map(row=>row.text).join(" ");
    expect(freeReveal).toContain("本季没有正式X");
    expect(freeReveal).not.toContain("双柜对照");
    expect(freeReveal).not.toContain("生日盲盒");
  });
});
