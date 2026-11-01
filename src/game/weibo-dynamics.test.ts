import { describe, expect, it } from "vitest";
import { buildWeiboDynamics, fingerprintBroadcast, makeSuperTopicPosts, type BroadcastClip } from "./weibo-dynamics";

const aired: BroadcastClip[] = [
  { clipId: "arrival", title: "苏新皓入住", summary: "朱志鑫与苏新皓在客厅打招呼。", cast: ["ZZX", "SXH"], speakers: ["ZZX", "SXH"], cpIds: ["GC"], eventType: "arrival", controversyTags: [], warmthTags: ["日常温度"], comedyTags: [], broadcastStatus: "aired", editFocus: "friendship", tags: ["warm", "arrival"], weight: 1 },
  { clipId: "kitchen", title: "入住第一餐", summary: "朱志鑫煎蛋，苏新皓准备沙拉。", cast: ["ZZX", "SXH", "ZJ", "ZZY", "ZH"], speakers: ["ZJ", "ZZY"], cpIds: ["GC", "JY", "JH", "MH", "ZX", "ZY", "ZH", "SZ", "SY", "SH"], eventType: "kitchen", controversyTags: [], warmthTags: ["日常温度"], comedyTags: [], broadcastStatus: "aired", editFocus: "friendship", tags: ["kitchen", "warm"], weight: 1 },
  { clipId: "night", title: "阳台透气", summary: "张极与张泽禹在阳台交谈。", cast: ["ZJ", "ZZY"], speakers: ["ZJ", "ZZY"], cpIds: ["JY"], eventType: "night", controversyTags: [], warmthTags: [], comedyTags: [], broadcastStatus: "aired", editFocus: "friendship", tags: ["life"], weight: 1 },
];

describe("broadcast-driven Weibo data", () => {
  it("returns no public topics before any clip is broadcast", () => {
    expect(buildWeiboDynamics({ clips: [], cut: "friendship" })).toEqual({ topics: [], cpBoard: [], superTopics: [] });
    expect(buildWeiboDynamics({ clips: aired.map((x) => ({ ...x, broadcastStatus: "unreleased" as const })), cut: "friendship" })).toEqual({ topics: [], cpBoard: [], superTopics: [] });
  });

  it("builds stable top-ten topics with three related posts and five distinct reactions each", () => {
    const one = buildWeiboDynamics({ clips: aired, cut: "friendship" });
    const two = buildWeiboDynamics({ clips: aired, cut: "friendship" });
    expect(one.topics.length).toBeGreaterThanOrEqual(10);
    expect(one.topics).toEqual(two.topics);
    for (const topic of one.topics.slice(0, 10)) {
      expect(topic.rank).toBeGreaterThan(0);
      expect(topic.clipIds.length).toBeGreaterThan(0);
      expect(topic.posts).toHaveLength(3);
      for (const post of topic.posts) {
        expect(aired.map((x) => x.clipId)).toContain(post.clipId);
        expect(post.replies).toHaveLength(5);
        expect(new Set(post.replies.map((x) => x.stance)).size).toBe(5);
      }
    }
    const theory = one.topics.find((x) => x.kind === "theory")!;
    expect(theory.posts.every((x) => x.body.includes("X") && /(不能|不可以|尚未公开)/.test(x.body))).toBe(true);
  });

  it("changes heat-board order under a different edit and marks public fan ships", () => {
    const friendship = buildWeiboDynamics({ clips: aired, cut: "friendship" });
    const romance = buildWeiboDynamics({ clips: aired, cut: "romance" });
    expect(friendship.topics.map((x) => x.id).join(",")).not.toBe(romance.topics.map((x) => x.id).join(","));
    expect(friendship.cpBoard[0].id).not.toBe(romance.cpBoard[0].id);
    expect(romance.cpBoard.find((x) => x.id === "ZX")?.formal).toBe(false);
  });

  it("provides five dynamic supertopics and filters each to clips shared by that ship", () => {
    const dynamics = buildWeiboDynamics({ clips: aired, cut: "friendship" });
    expect(dynamics.superTopics.map((x) => x.name)).toHaveLength(5);
    expect(makeSuperTopicPosts(dynamics, "GC", aired).every((post) => ["arrival", "kitchen"].includes(post.clipId))).toBe(true);
    expect(makeSuperTopicPosts(dynamics, "program", aired)).toHaveLength(3);
  });

  it("tracks broadcast and cut fingerprints deterministically", () => {
    expect(fingerprintBroadcast(aired, "friendship", {})).toBe(fingerprintBroadcast(aired, "friendship", {}));
    expect(fingerprintBroadcast(aired, "friendship", {})).not.toBe(fingerprintBroadcast(aired, "conflict", {}));
  });

  it("reports rising and falling positions against the last saved broadcast", () => {
    const current = buildWeiboDynamics({ clips: aired, cut: "friendship" });
    const previousTopicRanks = Object.fromEntries(current.topics.map((x) => [x.id, current.topics.length + 1 - x.rank]));
    const previousCpRanks = Object.fromEntries(current.cpBoard.map((x) => [x.id, current.cpBoard.length + 1 - x.rank]));
    const next = buildWeiboDynamics({ clips: aired, cut: "friendship", previousTopicRanks, previousCpRanks });
    expect(next.topics.some((x) => (x.movement ?? 0) > 0)).toBe(true);
    expect(next.topics.some((x) => (x.movement ?? 0) < 0)).toBe(true);
    expect(next.cpBoard.some((x) => (x.movement ?? 0) > 0)).toBe(true);
    expect(next.cpBoard.some((x) => (x.movement ?? 0) < 0)).toBe(true);
  });
});
