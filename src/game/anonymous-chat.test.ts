import { describe, expect, it } from "vitest";
import { assignAnonymousCodes, anonymousCodes, createAnonymousChatScript, type ChatTopic } from "./anonymous-chat";
import type { GuestId } from "./day1-data";

const guests: GuestId[] = ["ZZX", "SXH", "ZJ", "ZZY", "ZH"];
const topics: ChatTopic[] = ["restart", "like-or-habit", "remember-habits"];

describe("EP02 anonymous room scripts", () => {
  it("persists five unique aliases deterministically per game seed", () => {
    const first = assignAnonymousCodes("save-seed-42");
    expect(assignAnonymousCodes("save-seed-42")).toEqual(first);
    expect(new Set(Object.values(first)).size).toBe(5);
    expect(new Set(Object.values(first))).toEqual(new Set(anonymousCodes));
  });

  it.each(topics)("writes a 15+ line linked group conversation for %s", (topic) => {
    const script = createAnonymousChatScript("group", topic, [], "C");
    const rows = script.lines.filter((row) => row.speaker !== "STAGE");
    expect(script.kind).toBe("group");
    expect(rows.length).toBeGreaterThanOrEqual(15);
    expect(new Set(rows.map((row) => row.speaker))).toEqual(new Set(guests));
    const seen = new Set<string>();
    for (const row of script.lines) {
      if (row.replyToId) expect(seen.has(row.replyToId), `${row.id} should reply to a prior message`).toBe(true);
      if (row.id) seen.add(row.id);
    }
  });

  it.each(topics)("writes a separate 15+ turn dialogue for two participants on %s", (topic) => {
    const pair: GuestId[] = ["ZJ", "ZH"];
    const script = createAnonymousChatScript("pair", topic, pair, "B");
    const rows = script.lines.filter((row) => row.speaker !== "STAGE");
    expect(script.kind).toBe("pair");
    expect(script.participants).toEqual(pair);
    expect(rows.length).toBeGreaterThanOrEqual(15);
    expect(new Set(rows.map((row) => row.speaker))).toEqual(new Set(pair));
    const seen = new Set<string>();
    for (const row of script.lines) {
      if (row.speaker !== "STAGE") expect(row.replyToId, row.id).toBeTruthy();
      if (row.replyToId) expect(seen.has(row.replyToId), `${row.id} should reply to a prior turn`).toBe(true);
      if (row.id) seen.add(row.id);
    }
  });

  it("renders the question box as separate, unlinked anonymous answers", () => {
    const script = createAnonymousChatScript("question", "remember-habits", [], "A");
    const answers = script.lines.filter((row) => row.mood === "匿名回答");
    expect(script.title).toBe("匿名提问箱");
    expect(answers).toHaveLength(5);
    expect(answers.every((row) => !row.replyToId)).toBe(true);
  });

  it("keeps mode-specific ex-history nuance private and never labels anyone as an X", () => {
    const modeA = createAnonymousChatScript("group", "restart", [], "A").lines.find((row) => row.id === "g-a-05")?.text;
    const modeD = createAnonymousChatScript("group", "restart", [], "D").lines.find((row) => row.id === "g-a-05")?.text;
    expect(modeA).not.toBe(modeD);
    for (const mode of ["A", "B", "C", "D", "E"]) {
      const text = createAnonymousChatScript("group", "restart", [], mode).lines.map((row) => row.text).join("\n");
      expect(text).not.toMatch(/正式X|朱志鑫|苏新皓|张极|张泽禹|左航/);
    }
  });

  it("uses distinct current-state wording only for a pair that is a formal X in that mode", () => {
    const gc = createAnonymousChatScript("pair", "restart", ["ZZX", "SXH"], "A");
    const nonX = createAnonymousChatScript("pair", "restart", ["ZZX", "ZJ"], "A");
    expect(gc.lines[2].text).toContain("旧问题有没有变化");
    expect(nonX.lines[2].text).not.toContain("旧问题有没有变化");
    const jiyuModeA = createAnonymousChatScript("pair", "restart", ["ZJ", "ZZY"], "A");
    const jiyuModeC = createAnonymousChatScript("pair", "restart", ["ZJ", "ZZY"], "C");
    expect(jiyuModeA.lines[2].text).toContain("旧问题有没有变化");
    expect(jiyuModeC.lines[2].text).not.toContain("旧问题有没有变化");
  });
});
