import { describe, expect, it } from "vitest";
import { buildSocialBatch, corpusCountByPlatform, corpusPersonaLabel, eventsForAiredClips, personaFor, socialCorpusItems, socialEvents, socialSeedItems, validateSocialCorpus } from "./corpus";

describe("season social corpus", () => {
  it("loads and validates all 327 provided source items without duplicate ids or dangling replies", () => {
    expect(socialSeedItems).toHaveLength(327);
    expect(socialCorpusItems).toHaveLength(336);
    expect(socialEvents).toHaveLength(24);
    expect(validateSocialCorpus()).toEqual([]);
    expect(corpusCountByPlatform()).toEqual({ weibo: 108, douban: 126, threads: 102 });
  });

  it("does not publish a discussion before its required event is in the aired record", () => {
    expect(buildSocialBatch({ platform: "weibo", episode: 1, mode: "A", airedEventIds: [] }).posts).toHaveLength(0);
    const arrivalOnly = buildSocialBatch({ platform: "weibo", episode: 1, mode: "A", airedEventIds: ["ep01_arrival"] });
    expect(arrivalOnly.posts.length).toBeGreaterThan(0);
    expect(arrivalOnly.posts.every((post) => post.requiresAiredEventIds.every((id) => id === "ep01_arrival"))).toBe(true);
    expect(arrivalOnly.posts.some((post) => post.eventId === "ep01_kitchen")).toBe(false);
  });

  it("does not show the old generic EP04 letter corpus without selected exact letter footage", () => {
    const input = { platform: "douban" as const, episode: 4, mode: "C", airedEventIds: ["ep01_arrival", "ep01_kitchen", "ep02_breakfast", "ep02_shopping", "ep02_chat", "ep03_date", "ep04_letters"] };
    const first = buildSocialBatch(input);
    const again = buildSocialBatch(input);
    expect(first).toEqual(again);
    expect(first.posts.some((post) => post.eventId === "ep04_letters")).toBe(false);
    expect(eventsForAiredClips(4, ["scene-D04-S02-old-placeholder"])).toEqual([]);
    expect(eventsForAiredClips(4, ["EP04-LETTER-BODY-ZZX"])).toEqual(["ep04_letters"]);
    expect(Object.values(first.repliesByPost).flat().every((reply) => first.posts.some((post) => post.id === reply.replyTo))).toBe(true);
  });

  it("does not expose any mode-specific X reveal until EP13 is actually aired", () => {
    const beforeReveal = buildSocialBatch({ platform: "weibo", episode: 14, mode: "C", airedEventIds: ["ep14_final"] });
    expect(beforeReveal.posts.some((post) => post.xKnowledge === "x_revealed")).toBe(false);
    const afterReveal = buildSocialBatch({ platform: "weibo", episode: 14, mode: "A", airedEventIds: ["ep13_reveal", "ep14_final"] });
    expect(afterReveal.posts.filter((post) => post.xKnowledge === "x_revealed").every((post) => post.relationshipModes.includes("A"))).toBe(true);
    expect(afterReveal.posts.filter((post) => post.xKnowledge === "x_revealed").some((post) => post.relationshipModes.includes("C"))).toBe(false);
  });

  it("keeps all five EP13 X reveals isolated to the saved relationship mode", () => {
    const expected: Record<string, { include: string; exclude: string[] }> = {
      A: { include: "极禹正式X", exclude: ["极航正式X", "芒猴正式X"] },
      B: { include: "极航正式X", exclude: ["极禹正式X", "芒猴正式X"] },
      C: { include: "三个人都没有本季正式X", exclude: ["极禹正式X", "极航正式X", "芒猴正式X"] },
      D: { include: "芒猴正式X", exclude: ["极禹正式X", "极航正式X"] },
      E: { include: "正式X是棍铲与极禹", exclude: ["极航正式X", "芒猴正式X"] },
    };
    for (const [mode, condition] of Object.entries(expected)) {
      const batch = buildSocialBatch({ platform: "douban", episode: 13, mode, airedEventIds: ["ep13_reveal"] });
      const reveals = batch.posts.filter((post) => post.xKnowledge === "x_revealed");
      expect(reveals.length, `mode ${mode} should have a reveal`).toBeGreaterThan(0);
      expect(reveals.every((post) => post.relationshipModes.includes(mode))).toBe(true);
      expect(reveals.some((post) => post.text.includes(condition.include)), `mode ${mode} should contain ${condition.include}; found: ${reveals.map((post) => post.text).join(" | ")}`).toBe(true);
      expect(reveals.every((post) => condition.exclude.every((claim) => !post.text.includes(claim)))).toBe(true);
    }
  });

  it("retains the EP08 prop boundaries from the provided seed corpus", () => {
    const blindbox = socialSeedItems.filter((item) => item.eventId === "ep08_blindbox").map((item) => item.text).join(" ");
    const boarding = socialSeedItems.filter((item) => item.eventId === "ep08_boarding").map((item) => item.text).join(" ");
    const traineeSheet = socialSeedItems.filter((item) => item.eventId === "ep08_jh_sheet").map((item) => item.text).join(" ");
    const manghou = socialSeedItems.filter((item) => item.eventId === "ep08_mh_photo").map((item) => item.text).join(" ");
    expect(blindbox).toMatch(/整套.{0,12}每年.{0,4}拆一个/);
    expect(blindbox).not.toMatch(/苏新皓每年送一个|每年送一套/);
    expect(boarding).toMatch(/HRB/);
    expect(boarding).toMatch(/CZX/);
    expect(boarding).toMatch(/CKG/);
    expect(boarding).toMatch(/航班号/);
    expect(traineeSheet).toMatch(/看不清的字不要瞎认/);
    expect(manghou).toMatch(/不能证明恋爱|没法证明恋爱/);
  });

  it("uses a stable distinct voice and ASCII-only Threads handle per long-lived persona", () => {
    const post = socialSeedItems.find((item) => item.platform === "threads" && item.authorRole === "editorial_critic")!;
    expect(personaFor(post)).toEqual(personaFor(post));
    expect(corpusPersonaLabel(post)).toMatch(/^@[A-Za-z0-9_]+$/);
    expect(personaFor(post).fanIdentity).toBe("剪辑质疑观众");
  });

  it("maps only the selected Day 1 clips to public event IDs", () => {
    expect(eventsForAiredClips(1, ["CLIP-001"])).toEqual(["ep01_arrival"]);
    expect(eventsForAiredClips(1, ["CLIP_D01_TOMATO"])).toEqual(["ep01_kitchen"]);
  });

  it("does not let the retired generic EP08 scene trigger unrelated prop discussions", () => {
    expect(eventsForAiredClips(8, ["D08-S02"])).toEqual([]);
    expect(eventsForAiredClips(8, ["E08-03-ROOM-dried-rose"])).toEqual([]);
    expect(eventsForAiredClips(8, ["E08-03-ROOM-unsent-letter"])).toEqual([]);
    expect(eventsForAiredClips(8, ["E08-03-ROOM-ZZ_BLINDBOX"])).toEqual(["ep08_blindbox"]);
    expect(eventsForAiredClips(8, ["E08-03-ROOM-ZZ_SPORTS_2024"])).toEqual(["ep08_sports_2024"]);
    expect(eventsForAiredClips(8, ["E08-03-ROOM-gc-01"])).toEqual([]);
  });

  it("keeps retired EP08 rose and private-letter posts out of every newly generated batch",()=>{
    const batch=buildSocialBatch({platform:"weibo",episode:10,mode:"A",airedEventIds:["ep08_rose","ep08_letter"]});
    expect(batch.items.some(item=>item.eventId==="ep08_rose"||item.eventId==="ep08_letter")).toBe(false);
  });
});
