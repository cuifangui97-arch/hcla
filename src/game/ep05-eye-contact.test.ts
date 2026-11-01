import { describe, expect, it } from "vitest";
import { ep05ClipIds, ep05EveningMainScenes, ep05PairLines, ep05PairScript, ep05Pairs, type Ep05Round } from "./ep05-eye-contact";

describe("EP05 director eye contact challenges", () => {
  it("has ten complete, distinct pair scripts with compatible result lines", () => {
    const pairs = ep05Pairs();
    expect(pairs).toHaveLength(10);
    expect(new Set(pairs.map(pair => pair.ids.slice().sort().join("|"))).size).toBe(10);
    for (const pair of pairs) {
      const script = ep05PairScript(pair.ids);
      expect(script).toBeTruthy();
      for (const segment of ["ready", "eye", "after"] as const) {
        const rows = ep05PairLines(pair.ids, segment, 1, "C");
        expect(rows.length).toBeGreaterThanOrEqual(5);
        expect(rows.every(row => row.id.startsWith(`D05-R1-${pair.code}-${segment}-`))).toBe(true);
      }
      expect(script?.outcome).toMatch(/先移开视线|双方完成30秒/);
    }
  });

  it("keeps the V13 evening beat single and does not add per-pair duplicate night-talks", () => {
    const pair = ["ZJ", "ZZY"] as const;
    const first = ep05ClipIds([...pair], 1);
    const second = ep05ClipIds([...pair], 2);
    expect(Object.values(first).some(id => Object.values(second).includes(id))).toBe(false);
    const rounds: Ep05Round[] = [{
      roundId: "round1", pairIds: [...pair], preparationCompleted: true, timerStarted: true,
      timerFinished: true, taskOutcome: "张极先移开视线", dialogueProgress: { ready: 12, eye: 14, after: 5 },
      completionStatus: "completed", generatedClipIds: Object.values(first),
    }];
    const night = ep05EveningMainScenes(rounds, false, []);
    expect(night).toHaveLength(1);
    expect(night[0].clipId).toBe("D05-KC-ATTEMPT-EXPLANATION");
    expect(night[0].rows.map(row => row.text).join(" ")).toContain("刚才规则读得挺快");
    const classic = ep05EveningMainScenes(rounds, true, [["ZZX","SXH"]]);
    expect(classic).toHaveLength(1);
    expect(classic[0].rows.map(row => row.text).join(" ")).toContain("我会试着告诉你我在想");
  });

  it("does not reveal formal X identities in public challenge dialogue", () => {
    for (const pair of ep05Pairs()) for (const segment of ["ready", "eye", "after"] as const) {
      const text = ep05PairLines(pair.ids, segment, 1, "A").map(row => row.text).join("\n");
      expect(text).not.toMatch(/正式X|互为X|你的前任|X身份公开/);
    }
  });
});
