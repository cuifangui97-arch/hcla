import { describe, expect, it } from "vitest";
import { arrivalScenes, formalXPairs, getXNotice, guests, nightScenes, pairScenes, validDayOneClipSet } from "./day1-data";
import { originalIconFiles } from "../ios/originalIconFiles";
import iconManifest from "../../assets/app-icons/manifest.json";
import branchSource from "../../source_package/03_branch/branch_pack_v3.json";
import smsSource from "../../source_package/04_sms_social/sms_social_pack_v4.json";

describe("Day 1 authored episode data", () => {
  it("has exactly the five approved guests and five chronological arrival scenes", () => {
    expect(guests.map((g) => g.id)).toEqual(["ZZX", "SXH", "ZJ", "ZZY", "ZH"]);
    expect(arrivalScenes.map((s) => s.id)).toEqual(["D01-002", "D01-003", "D01-004", "D01-005", "D01-006"]);
    expect(arrivalScenes.every((s) => s.lines.length >= 5)).toBe(true);
    expect(new Set(arrivalScenes.map((s) => s.time)).size).toBe(5);
  });

  it("provides all ten two-person kitchen combinations and distinct authored scenes", () => {
    const expectedPairs = ["SXH-ZZX", "ZJ-ZZY", "ZJ-ZH", "ZZY-ZH", "SXH-ZJ", "SXH-ZZY", "SXH-ZH", "ZZX-ZJ", "ZZX-ZZY", "ZZX-ZH"];
    expect(Object.keys(pairScenes).sort()).toEqual(expectedPairs.sort());
    expect(new Set(Object.values(pairScenes).map((lines) => lines.map((x) => x.text).join("|"))).size).toBe(10);
    for (const key of ["SXH-ZJ", "SXH-ZZY", "SXH-ZH", "ZZX-ZJ", "ZZX-ZZY", "ZZX-ZH"]) expect(pairScenes[key].length).toBeGreaterThanOrEqual(8);
  });

  it("keeps the fixed X pair in all five V3 relation modes", () => {
    expect(Object.keys(formalXPairs)).toEqual(["A", "B", "C", "D", "E"]);
    for (const mode of ["A", "B", "C", "D", "E"] as const) {
      const pairs = formalXPairs[mode];
      expect(pairs).toContainEqual(["ZZX", "SXH"]);
      expect(pairs).toEqual(branchSource.rules.modes[mode].exPairs);
    }
  });

  it("shows the accurate private X notice to each recipient in every mode", () => {
    for (const mode of ["A", "B", "C", "D", "E"] as const) {
      const [zhuzhiXin, suXinHao] = formalXPairs[mode].find((pair) => pair.includes("ZZX"))!;
      expect(getXNotice(zhuzhiXin, [suXinHao], mode)).toBe("【你的X，选择了你】");
      expect(getXNotice(suXinHao, [], mode)).toBe("【你的X，没有选择你】");
    }
    expect(getXNotice("ZH", [], "C")).toBe("【本季你没有参与节目的正式X】");
  });

  it("has V4-authored D1 SMS options for every guest and every other recipient in each mode", () => {
    for (const mode of ["A", "B", "C", "D", "E"]) for (const sender of guests) {
      const choices = smsSource.sms.variants.filter((x) => x.mode === mode && x.sender === sender.id && x.requiredFlags.length === 0);
      const recipients = new Set(choices.map((x) => x.recipient));
      expect(recipients.has(sender.id)).toBe(false);
      expect(recipients.size).toBe(4);
      for (const other of guests.filter((x) => x.id !== sender.id)) expect(recipients.has(other.id)).toBe(true);
    }
  });

  it("offers three-clip edits only when they contain kitchen, arrival, and evening footage", () => {
    expect(validDayOneClipSet(["CLIP_D01_TOMATO", "CLIP-001", "CLIP-NIGHT-LIVING"])).toBe(true);
    expect(validDayOneClipSet(["CLIP_D01_TOMATO", "CLIP-001", "CLIP-002"])).toBe(false);
    expect(validDayOneClipSet(["CLIP_D01_TOMATO", "CLIP_D01_TOMATO", "CLIP-NIGHT-LIVING"])).toBe(false);
    expect(validDayOneClipSet(["CLIP-001", "CLIP-NIGHT-LIVING", "CLIP-INTERVIEW"])).toBe(false);
  });

  it("has three independently watchable night cameras with real scene lines", () => {
    expect(nightScenes.map((s) => s.id)).toEqual(["D01-009A", "D01-009B", "D01-009C"]);
    expect(nightScenes.every((s) => s.lines.length >= 5)).toBe(true);
  });

  it("includes published launcher art for every mapped app icon", () => {
    const manifest = iconManifest.results as Record<string, { file: string; sha256: string }>;
    for (const [id, file] of Object.entries(originalIconFiles)) {
      expect(manifest[id]?.file, id).toBe(file);
    }
  });
});
