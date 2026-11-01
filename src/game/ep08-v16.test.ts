import { describe, expect, it } from "vitest";
import { formalXPairs, type GuestId } from "./day1-data";
import { ep08GuestOrder, ep08Items, ep08MutualPairs, ep08ItemInterviewRows, itemRoomLines, validateEp08ChoiceMap, type Ep08ChoiceMap } from "./ep08-v16";
import { kcCabinetItems } from "./ep08-kc-v165";
import { episodeManifest } from "../persistence";

const assetFiles = Object.keys(import.meta.glob("../../public/assets/{cp-photos,props,ep08-kc}/**/*"));
const choices = (targets: GuestId[]): Ep08ChoiceMap => Object.fromEntries(ep08GuestOrder.map((id, index) => [id, targets[index]])) as Ep08ChoiceMap;

describe("V16.5 X Room and anonymous mutual choice", () => {
  it("keeps two independent six-item KC cabinets and all other-pair photos", () => {
    const items = ep08Items();
    const photos = items.filter(item => item.kind === "photo");
    expect(photos).toHaveLength(9);
    expect(kcCabinetItems.filter(item => item.owner === "ZZX")).toHaveLength(6);
    expect(kcCabinetItems.filter(item => item.owner === "SXH")).toHaveLength(6);
    expect(kcCabinetItems.map(item => item.id)).not.toContain("ZZ_CORRIDOR");
    const available=kcCabinetItems.filter(item=>item.asset);
    expect(available).toHaveLength(11);
    for (const item of [...photos,...available]) expect(assetFiles.some(path => path.endsWith(item.asset!.replace(/^\//, "")))).toBe(true);
  });

  it("gives each displayed memory item a unique beat and its own interview; supplies no fabricated photo for a personal card", () => {
    const items=ep08Items();
    const memoryTexts=items.map(item=>itemRoomLines(item,formalXPairs.A,"A").map(row=>row.speaker+":"+row.text).join("\n"));
    const interviewTexts=items.map(item=>ep08ItemInterviewRows(item,formalXPairs.A,"A").map(row=>row.speaker+":"+row.text).join("\n"));
    expect(new Set(items.map(item=>item.id)).size).toBe(items.length);
    expect(new Set(memoryTexts).size).toBe(items.length);
    expect(new Set(interviewTexts).size).toBe(items.length);
    expect(items.filter(item=>item.asset)).toHaveLength(20);
    expect(items.find(item=>item.id==="ZZ_BLINDBOX")?.summary).not.toContain("苏新皓");
    expect(items.find(item=>item.id==="ZZ_BLINDBOX")?.lines.map(row=>row.text).join(" ")).toContain("每年生日拆一个");
    expect(items.find(item=>item.id==="ZZ_WATER_VOUCHER")?.lines.map(row=>row.text).join(" ")).toContain("2025过生日");
    expect(items.find(item=>item.id==="SX_FRIED_EGG")?.lines.map(row=>row.text).join(" ")).toContain("十个闹钟");
    expect(items.some(item=>item.id==="unsent-letter"||item.id==="dried-rose"||item.id==="gc-02")).toBe(false);
    expect(kcCabinetItems.every(item=>item.sceneId&&item.storyBeatId&&item.clipId&&item.interview.length>0)).toBe(true);
  });

  it("provides one playable memory room for each guest without fabricating exes in free mode", () => {
    const items = ep08Items();
    for (const id of ep08GuestOrder) expect(items.some(item => item.owner === id)).toBe(true);
    expect(items.filter(item => item.id.startsWith("personal-reflection-")).length).toBe(0);
    expect(items.some(item => item.id === "dried-rose" || item.id === "unsent-letter" || item.id === "birthday-blindbox")).toBe(false);
  });

  it("computes the valid 0, 1 and 2 mutual-pair outcomes from frozen choices", () => {
    const none = choices(["SXH", "ZJ", "ZZY", "ZH", "ZZX"]);
    const one = choices(["SXH", "ZZX", "ZZY", "ZH", "ZJ"]);
    const two = choices(["SXH", "ZZX", "ZZY", "ZJ", "ZJ"]);
    for (const map of [none, one, two]) expect(validateEp08ChoiceMap(map)).toBe(true);
    expect(ep08MutualPairs(none)).toHaveLength(0);
    expect(ep08MutualPairs(one)).toHaveLength(1);
    expect(ep08MutualPairs(two)).toHaveLength(2);
  });

  it("retains the five initial relationship-mode maps without re-randomizing them for EP08", () => {
    expect(Object.keys(formalXPairs).sort()).toEqual(["A", "B", "C", "D", "E"]);
    for (const mode of Object.keys(formalXPairs) as (keyof typeof formalXPairs)[]) {
      const xPairs = formalXPairs[mode];
      expect(xPairs).toContainEqual(["ZZX", "SXH"]);
      expect(new Set(xPairs.flat()).size).toBe(xPairs.length * 2);
    }
  });

  it("publishes exactly ten episodes and does not create an EP11 route", () => {
    expect(episodeManifest.map(row => row.episode)).toEqual([1,2,3,4,5,6,7,8,9,10]);
    expect(episodeManifest.at(-1)?.title).toBe("这次换我走向你");
  });
});
