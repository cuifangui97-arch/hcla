import { describe, expect, it } from "vitest";
import { dayThreeDateDialogue, dayTwoShoppingDialogue, episode2Morning } from "./episodes-2-3";
import type { GuestId } from "./day1-data";

const cast: GuestId[] = ["ZZX", "SXH", "ZJ", "ZZY", "ZH"];

describe("EP02–EP03 authored branches", () => {
  it("provides a distinct playable shopping branch for all ten pairs", () => {
    for (let i = 0; i < cast.length; i += 1) {
      for (let j = i + 1; j < cast.length; j += 1) {
        const lines = dayTwoShoppingDialogue(cast[i], cast[j], "C");
        expect(lines.length, `${cast[i]} × ${cast[j]}`).toBeGreaterThanOrEqual(6);
        expect(lines.some((line) => line.speaker !== "STAGE"), `${cast[i]} × ${cast[j]}`).toBe(true);
      }
    }
  });

  it("keeps the EP01 JY cooking choice and breakfast broadcast as separate conditions", () => {
    expect(episode2Morning(true).map((line) => line.text).join("\n")).toContain("昨天那个调味料");
    expect(episode2Morning(false).map((line) => line.text).join("\n")).toContain("厨房东西放得还挺整齐");
  });

  it("uses mode-compatible relationship cues without claiming unassigned pairs are formal exes", () => {
    const jyA = dayThreeDateDialogue("ZJ", "ZZY", "唱片店", "A", false).map((line) => line.text).join("\n");
    const jyC = dayThreeDateDialogue("ZJ", "ZZY", "唱片店", "C", false).map((line) => line.text).join("\n");
    const jhB = dayThreeDateDialogue("ZJ", "ZH", "公园散步", "B", false).map((line) => line.text).join("\n");
    const jhC = dayThreeDateDialogue("ZJ", "ZH", "公园散步", "C", false).map((line) => line.text).join("\n");
    expect(jyA).toContain("有些话不是没聊过");
    expect(jyC).not.toContain("有些话不是没聊过");
    expect(jhB).toContain("以前我以为你知道");
    expect(jhC).toContain("可能以前说话没现在顺");
  });

  it("requires the EP02 sunrise memory for the EP03 sunrise callback", () => {
    const withoutMemory = dayThreeDateDialogue("ZZY", "ZH", "咖啡馆", "D", false).map((line) => line.text).join("\n");
    const withMemory = dayThreeDateDialogue("ZZY", "ZH", "咖啡馆", "D", true).map((line) => line.text).join("\n");
    expect(withoutMemory).toContain("你怎么突然想到这个？");
    expect(withMemory).toContain("你还记得？");
  });

  it("lets the selected date venue change authored dialogue and scene beats", () => {
    const cafe = dayThreeDateDialogue("ZJ", "ZZY", "咖啡馆", "C", false).map((line) => line.text).join("\n");
    const pottery = dayThreeDateDialogue("ZJ", "ZZY", "陶艺工作室", "C", false).map((line) => line.text).join("\n");
    expect(cafe).toContain("感觉挺适合聊天");
    expect(pottery).toContain("做点东西不容易冷场");
  });

  it("gives every non-GC EP03 date branch at least twelve lines and two action captions", () => {
    const pairs: [GuestId, GuestId][] = [["ZZX","ZJ"],["ZZX","ZZY"],["ZZX","ZH"],["SXH","ZJ"],["SXH","ZZY"],["SXH","ZH"]];
    for (const [a,b] of pairs) {
      const lines = dayThreeDateDialogue(a,b,"陶艺工作室","C",false);
      expect(lines.length, `${a} × ${b}`).toBeGreaterThanOrEqual(12);
      expect(lines.filter((line) => line.speaker === "STAGE").length, `${a} × ${b}`).toBeGreaterThanOrEqual(2);
    }
  });
});
