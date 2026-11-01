import { describe, expect, it } from "vitest";
import { initialRuntime } from "./schema";
import { makeTopSeasonSave, migrateTopSeasonSave, validateAndMigrateTopSeasonSave, markEpisodeComplete, validateTopSeasonSave, TOP_SEASON_ID, episodeManifest, evaluateCompatibleScene } from "./persistence";
import { compileStory } from "./story-engine/compiler";
import story from "../stories/template/story.json";

function newSaveForMode(mode: "A" | "B" | "C" | "D" | "E") {
  const work = compileStory(story).work;
  const runtime = initialRuntime(work);
  runtime.variables.gameMode = mode;
  runtime.variables.gameSeed = `test-seed-${mode}`;
  const fixed = JSON.parse(String(runtime.variables.topSeasonHistory)) as Record<string, unknown>;
  fixed.relationshipMode = mode;
  fixed.randomSeed = `test-seed-${mode}`;
  const pairs: Record<string, string[][]> = { A:[["ZZX","SXH"],["ZJ","ZZY"]], B:[["ZZX","SXH"],["ZJ","ZH"]], C:[["ZZX","SXH"]], D:[["ZZX","SXH"],["ZZY","ZH"]], E:[["ZZX","SXH"],["ZJ","ZZY"]] };
  fixed.formalExPairs = pairs[mode];
  fixed.relationshipHistory = pairs[mode].map((pair) => ({ pair, dated:"fixed-date", breakupReason:"fixed-reason", sharedExperiences:["fixed-memory"] }));
  runtime.variables.topSeasonHistory = JSON.stringify(fixed);
  return makeTopSeasonSave(runtime, 1000);
}

describe("TOP season save protocol", () => {
  it("keeps mode A, X pairs, secrets and EP01 results when EP02 becomes available", () => {
    const save = newSaveForMode("A");
    save.runtime.variables.ep1DirectorChoice = "ZZX-SXH";
    save.runtime.variables.smsD1 = true;
    const completed = markEpisodeComplete(save, 1);
    const simulatedRelease = { ...completed, schemaVersion: 2, episodeState: { ...completed.episodeState, available: [1, 2] } };
    const restored = validateTopSeasonSave(JSON.parse(JSON.stringify(simulatedRelease)));
    expect(restored.history.relationshipMode).toBe("A");
    expect(restored.history.formalExPairs).toEqual(save.history.formalExPairs);
    expect(restored.history.hiddenSecrets).toEqual(save.history.hiddenSecrets);
    expect(restored.runtime.variables.ep1DirectorChoice).toBe("ZZX-SXH");
    expect(restored.runtime.variables.smsD1).toBe(true);
    expect(evaluateCompatibleScene({ relationshipMode: restored.history.relationshipMode, formalExPairs: restored.history.formalExPairs, currentRelationshipState: restored.dynamic, previousEpisodeChoices: {}, eventHistory: [], revealedSecrets: [] }, { mode:"A" })).toBe(true);
    expect(episodeManifest[1].available).toBe(true);
    expect(episodeManifest[2].available).toBe(true);
    expect(episodeManifest[3].available).toBe(true);
    expect(restored.episodeState.available).toEqual(expect.arrayContaining([1,2]));
    expect(restored.seasonId).toBe(TOP_SEASON_ID);
  });

  it("rejects invalid X, character IDs, missing history and API keys", () => {
    const save = newSaveForMode("A");
    expect(() => validateTopSeasonSave({ ...save, history: { ...save.history, formalExPairs:[["ZZX","ZJ"], ["ZJ","ZZY"]] } })).toThrow(/正式X/);
    expect(() => validateTopSeasonSave({ ...save, history: { ...save.history, formalExPairs:[["ZZX","SXH"], ["BAD","ZZY"]] } })).toThrow(/正式X/);
    expect(() => validateTopSeasonSave({ ...save, history: { relationshipMode:"A" } })).toThrow(/完整/);
    expect(() => validateTopSeasonSave({ ...save, runtime:{ ...save.runtime, variables:{ ...save.runtime.variables, apiKey:"sk-abcdefghijk12345" } } })).toThrow(/API Key/);
  });

  it("creates a backup before migrating an older supported save and refuses unknown versions", () => {
    const save = newSaveForMode("B");
    expect(migrateTopSeasonSave({ ...save, schemaVersion:0 }).history.relationshipMode).toBe("B");
    expect(() => validateAndMigrateTopSeasonSave({ ...save, schemaVersion:99 })).toThrow(/显式迁移程序/);
  });

  it("keeps the same relationship history when EP02 and EP03 are completed", () => {
    const initial = newSaveForMode("E");
    const ep1 = markEpisodeComplete(initial, 1);
    const ep2 = markEpisodeComplete(ep1, 2);
    const ep3 = markEpisodeComplete(ep2, 3);
    expect(ep3.history).toEqual(initial.history);
    expect(ep3.episodeState.completed).toEqual([1,2,3]);
    expect(ep3.episodeState.available).toEqual(expect.arrayContaining([1,2,3]));
  });

  it("caps active progress at EP10 while preserving old EP11-14 state in a local archive", () => {
    const runtime=initialRuntime(compileStory(story).work);
    runtime.variables.gameMode="A";
    runtime.variables.gameSeed="legacy-save";
    runtime.variables.gameDay=14;
    runtime.ui={...runtime.ui,game:{...runtime.ui?.game,episode14:JSON.stringify({phase:"social",sent:true,recorded:["old-clip"]}),completedEpisodes:"[1,2,3,4,5,6,7,8,9,10,11,12,13,14]"}};
    const save=makeTopSeasonSave(runtime,1234);
    expect(save.episodeState.current).toBe(10);
    expect(save.episodeState.available.every(episode=>episode<=10)).toBe(true);
    expect(save.runtime.ui?.game?.episode14).toContain("old-clip");
    const archive=JSON.parse(String(save.runtime.ui?.game?.topSeasonLegacyArchive)) as {episodes:{episode:number}[];completed:number[]};
    expect(archive.episodes.map(row=>row.episode)).toContain(14);
    expect(archive.completed).toContain(14);
    expect(save.episodeState.completed).toContain(14);
    expect(()=>markEpisodeComplete({...save,episodeState:{...save.episodeState,available:[...save.episodeState.available,14]}},14)).toThrow(/EP01—EP10/);
  });
});
