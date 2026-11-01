import { describe, expect, it } from "vitest";
import { deriveKcSmsOutcome, kcEmotionalReaction, kcNightScript, kcSmsFlagsFromDeliveries, summarizeKcSmsHistory } from "./kc-night";

describe("KC post-SMS night branches", () => {
  it("derives all four outcomes from the actual delivered sender-recipient pairs", () => {
    expect(deriveKcSmsOutcome(kcSmsFlagsFromDeliveries([{ senderId: "ZZX", recipientId: "SXH" }, { senderId: "SXH", recipientId: "ZZX" }]))).toBe("mutual");
    expect(deriveKcSmsOutcome(kcSmsFlagsFromDeliveries([{ senderId: "SXH", recipientId: "ZZX" }]))).toBe("suxinhao_only");
    expect(deriveKcSmsOutcome(kcSmsFlagsFromDeliveries([{ senderId: "ZZX", recipientId: "SXH" }]))).toBe("zhuzhixin_only");
    expect(deriveKcSmsOutcome(kcSmsFlagsFromDeliveries([{ senderId: "ZZX", recipientId: "ZJ" }]))).toBe("neither");
  });

  it("keeps four distinct, private scripts without exposing X or SMS routing", () => {
    const outcomes = ["mutual", "suxinhao_only", "zhuzhixin_only", "neither"] as const;
    const scripts = outcomes.map((outcome) => kcNightScript(outcome, "客厅", 2).map((line) => line.text).join("\n"));
    expect(new Set(scripts).size).toBe(4);
    for (const script of scripts) {
      expect(script).not.toMatch(/我今天没有选你|我故意发给别人避嫌|你是我的X|短信发给了谁/);
    }
    expect(new Set(outcomes.map(kcEmotionalReaction)).size).toBe(4);
  });

  it("summarizes only stored nights and does not invent a motive", () => {
    const summary = summarizeKcSmsHistory([{ episode: 1, outcome: "mutual" }, { episode: 2, outcome: "neither" }, { episode: 4, outcome: "suxinhao_only" }]).join("\n");
    expect(summary).toContain("EP.01");
    expect(summary).toContain("EP.02");
    expect(summary).toContain("EP.04");
    expect(summary).toContain("不能证明当事人当时的动机");
    expect(summary).not.toContain("当时避嫌");
  });
});
