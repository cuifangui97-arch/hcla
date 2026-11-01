import { describe, expect, it } from "vitest";
import { formalXPairs, getXNoticeForInbox, getXNoticeFromHistory, readSavedRelationshipHistory, type GuestId } from "./day1-data";

const expectedPairs: Record<string, [GuestId, GuestId][]> = {
  A: [["ZZX", "SXH"], ["ZJ", "ZZY"]],
  B: [["ZZX", "SXH"], ["ZJ", "ZH"]],
  C: [["ZZX", "SXH"]],
  D: [["ZZX", "SXH"], ["ZZY", "ZH"]],
  E: [["ZZX", "SXH"], ["ZJ", "ZZY"]],
};

describe("saved X relationship notices", () => {
  it.each(Object.keys(expectedPairs))("uses the immutable mode %s map and actual senders", (mode) => {
    const history = readSavedRelationshipHistory({ relationshipMode: mode, formalExPairs: expectedPairs[mode] });
    expect(history.formalExPairs).toEqual(formalXPairs[mode]);

    for (const [a, b] of expectedPairs[mode]) {
      expect(getXNoticeFromHistory(a, [b], history)).toBe("【你的X，选择了你】");
      expect(getXNoticeFromHistory(a, ["ZZX", "SXH", "ZJ", "ZZY", "ZH"].filter((id) => id !== b) as GuestId[], history)).toBe("【你的X，没有选择你】");
      expect(getXNoticeFromHistory(a, [a], history)).toBe("【你的X，没有选择你】");
      expect(getXNoticeFromHistory(a, [], history)).toBe("【你的X，没有选择你】");
      expect(getXNoticeFromHistory(a, ["ZZX", "SXH", "ZJ", "ZZY", "ZH"].filter((id) => id !== a) as GuestId[], history)).toBe("【你的X，选择了你】");
      expect(getXNoticeFromHistory(b, [a], history)).toBe("【你的X，选择了你】");
    }

    const paired = new Set(expectedPairs[mode].flat());
    for (const guest of ["ZZX", "SXH", "ZJ", "ZZY", "ZH"] as GuestId[]) {
      if (!paired.has(guest)) expect(getXNoticeFromHistory(guest, ["ZZX", "SXH", "ZJ", "ZZY", "ZH"].filter((id) => id !== guest) as GuestId[], history)).toBe("【本季你没有参与节目的正式X】");
    }
  });

  it("prefers persisted pair history over a mismatched runtime fallback mode", () => {
    const history = readSavedRelationshipHistory(JSON.stringify({ relationshipMode: "A", formalExPairs: expectedPairs.A }), "B");
    expect(history.relationshipMode).toBe("A");
    expect(getXNoticeFromHistory("ZH", [], history)).toBe("【本季你没有参与节目的正式X】");
    expect(getXNoticeFromHistory("ZJ", ["ZH"], history)).toBe("【你的X，没有选择你】");
  });

  it("reads legacy formalExMap without mutating it", () => {
    const history = readSavedRelationshipHistory({ relationshipMode: "C", formalExMap: { ZZX: "SXH", SXH: "ZZX" } });
    expect(history.formalExPairs).toEqual([["ZZX", "SXH"]]);
    expect(getXNoticeFromHistory("ZZX", ["SXH"], history)).toBe("【你的X，选择了你】");
  });

  it("filters the whole sent batch to the recipient inbox before checking X choice", () => {
    const history = readSavedRelationshipHistory({ relationshipMode: "A", formalExPairs: expectedPairs.A });
    const deliveries = [
      { senderId: "ZJ" as GuestId, recipientId: "ZZY" as GuestId },
      { senderId: "ZJ" as GuestId, recipientId: "ZH" as GuestId },
      { senderId: "ZH" as GuestId, recipientId: "ZJ" as GuestId },
    ];
    expect(getXNoticeForInbox("ZZY", deliveries, history)).toBe("【你的X，选择了你】");
    expect(getXNoticeForInbox("ZH", deliveries, history)).toBe("【本季你没有参与节目的正式X】");
    expect(getXNoticeForInbox("ZJ", deliveries, history)).toBe("【你的X，没有选择你】");
  });
});
