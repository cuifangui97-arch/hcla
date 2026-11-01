import Dexie, { type Table } from "dexie";
import type { Work, Runtime } from "./schema";
class Database extends Dexie {
  works!: Table<Work, string>;
  saves!: Table<{ id: string; state: Runtime }, string>;
  constructor() {
    super("foundphone-studio");
    this.version(1).stores({ works: "id,updatedAt", saves: "id" });
  }
}
export const db = new Database();
db.version(2).stores({ works: "id,updatedAt", saves: "id", seasonSaves: "id,seasonId,updatedAt" });

export const TOP_SEASON_ID = "top-transit-love";
export const TOP_FREE_SAVE_ID = `${TOP_SEASON_ID}-ai-free`;
export const TOP_CLASSIC_SAVE_ID = TOP_SEASON_ID;
const ACTIVE_MODE_KEY = "top-transit-love-active-mode";
export function topSeasonSaveId(mode: "CLASSIC" | "AI_FREE") { return mode === "AI_FREE" ? TOP_FREE_SAVE_ID : TOP_CLASSIC_SAVE_ID; }
export function activeTopSeasonSaveId() { return topSeasonSaveId(typeof localStorage !== "undefined" && localStorage.getItem(ACTIVE_MODE_KEY) === "AI_FREE" ? "AI_FREE" : "CLASSIC"); }
export function topSeasonSaveIdForRuntime(runtime: Runtime) { const id=runtime.ui?.game?.seasonSaveId; if(id===TOP_FREE_SAVE_ID||id===TOP_CLASSIC_SAVE_ID)return id;const mode=runtime.ui?.game?.seasonGameMode;if(mode==="AI_FREE")return TOP_FREE_SAVE_ID;if(mode==="CLASSIC"||["A","B","C","D","E"].includes(String(runtime.variables.gameMode)))return TOP_CLASSIC_SAVE_ID;return activeTopSeasonSaveId(); }
export function setActiveTopSeasonMode(mode: "CLASSIC" | "AI_FREE") { if (typeof localStorage !== "undefined") localStorage.setItem(ACTIVE_MODE_KEY, mode); }
export const TOP_SAVE_SCHEMA_VERSION = 2;
export const topSeasonSaves = db.table("seasonSaves") as Table<TopSeasonSave, string>;

export type TopSeasonSave = {
  id: string;
  seasonId: typeof TOP_SEASON_ID;
  schemaVersion: number;
  gameMode: "CLASSIC" | "AI_FREE";
  createdAt: number;
  updatedAt: number;
  runtime: Runtime;
  history: TopRelationshipHistory;
  dynamic: TopDynamicState;
  episodeState: { available: number[]; completed: number[]; current: number };
};
export type TopRelationshipHistory = {
  relationshipMode: "A" | "B" | "C" | "D" | "E";
  randomSeed: string;
  formalExPairs: [string, string][];
  relationshipHistory: { pair: [string, string]; dated: string; breakupReason: string; sharedExperiences: string[] }[];
  hiddenSecrets: { id: string; value: string }[];
  pastUnconfirmedPairs: [string, string][];
};
export type TopDynamicState = {
  affection: Record<string, number>;
  trust: Record<string, number>;
  security: Record<string, number>;
  crush: Record<string, number>;
  misunderstandings: string[];
  reconciliationIntent: Record<string, boolean>;
  relationshipProgress: Record<string, string>;
  previousEpisodeChoices: Record<string, string>;
  eventHistory: string[];
  revealedSecrets: string[];
};

const episodeTitles = ["初次入住", "熟悉的人", "第一次约会", "写给X的信", "你在看谁", "第二次选择", "关于你，我还不知道", "过去留下的东西", "没说出口的话", "这次换我走向你"];
/** Release catalog. Availability is a content-release switch; player progress stays in the save. */
const episodeSceneCounts = [12,16,14,12,10,12,12,14,14,12];
export const episodeManifest = episodeTitles.map((title, index) => ({ episode: index + 1, available: true, title, sceneCount: episodeSceneCounts[index] }));
export function setEpisodeAvailability(save: TopSeasonSave, episode: number, available: boolean): TopSeasonSave {
  if (!Number.isInteger(episode) || episode < 1 || episode > 10) throw new Error("本季正式集数为EP.01—EP.10。");
  const nextAvailable = new Set(save.episodeState.available);
  if (available) nextAvailable.add(episode); else if (!save.episodeState.completed.includes(episode)) nextAvailable.delete(episode);
  nextAvailable.add(1);
  return { ...save, schemaVersion: save.schemaVersion + 1, updatedAt: Date.now(), episodeState: { ...save.episodeState, available: [...nextAvailable].sort((a,b)=>a-b) } };
}

export function evaluateCompatibleScene(input: {
  relationshipMode: TopRelationshipHistory["relationshipMode"];
  formalExPairs: [string, string][];
  currentRelationshipState: TopDynamicState;
  previousEpisodeChoices: Record<string, string>;
  eventHistory: string[];
  revealedSecrets: string[];
}, scene: { mode?: string; requiredEvents?: string[]; forbiddenSecrets?: string[]; choiceKey?: string; choiceValue?: string }): boolean {
  if (scene.mode && scene.mode !== input.relationshipMode) return false;
  const expected = canonicalPairs[input.relationshipMode].map(pairKey).sort().join("|");
  if (input.formalExPairs.map(pairKey).sort().join("|") !== expected) return false;
  if (scene.requiredEvents?.some((event) => !input.eventHistory.includes(event))) return false;
  if (scene.forbiddenSecrets?.some((secret) => input.revealedSecrets.includes(secret))) return false;
  if (scene.choiceKey && scene.choiceValue && input.previousEpisodeChoices[scene.choiceKey] !== scene.choiceValue) return false;
  return Object.values(input.currentRelationshipState.affection).every(Number.isFinite);
}

export function markEpisodeComplete(save: TopSeasonSave, episode: number): TopSeasonSave {
  if (!Number.isInteger(episode) || episode<1 || episode>10 || !save.episodeState.available.includes(episode)) throw new Error("该剧集不在当前EP01—EP10时间线内，不能标记完成。");
  const available=new Set(save.episodeState.available);if(episode<10)available.add(episode+1);
  return { ...save, updatedAt: Date.now(), episodeState: { ...save.episodeState, available:[...available].sort((a,b)=>a-b),completed: [...new Set([...save.episodeState.completed, episode])].sort((a,b)=>a-b), current: episode<10?episode+1:episode } };
}

export function validateAndMigrateTopSeasonSave(value: unknown, now = Date.now()): TopSeasonSave {
  if (!value || typeof value !== "object") throw new Error("文件不是有效的存档JSON对象。");
  const raw = value as Partial<TopSeasonSave>;
  if (raw.schemaVersion === TOP_SAVE_SCHEMA_VERSION) return validateTopSeasonSave(value);
  return migrateTopSeasonSaveVersion(value, now);
}

const ids = new Set(["ZZX", "SXH", "ZJ", "ZZY", "ZH"]);
const canonicalPairs: Record<TopRelationshipHistory["relationshipMode"], [string, string][]> = {
  A: [["ZZX", "SXH"], ["ZJ", "ZZY"]], B: [["ZZX", "SXH"], ["ZJ", "ZH"]],
  C: [["ZZX", "SXH"]], D: [["ZZX", "SXH"], ["ZZY", "ZH"]], E: [["ZZX", "SXH"], ["ZJ", "ZZY"]],
};
function pairKey(pair: [string, string]) { return [...pair].sort().join("-"); }
export function makeTopSeasonSave(runtime: Runtime, now = Date.now(), current?: TopSeasonSave): TopSeasonSave {
  const mode = runtime.variables.gameMode;
  if (typeof mode !== "string" || !(mode in canonicalPairs)) throw new Error("存档缺少有效的关系模式。");
  const relationshipMode = mode as TopRelationshipHistory["relationshipMode"];
  const randomSeed = String(runtime.variables.gameSeed || crypto.randomUUID());
  const seasonMode = runtime.ui?.game?.seasonGameMode === "AI_FREE" ? "AI_FREE" : "CLASSIC";
  let freeWorld: {formalExPairs?:[string,string][];relationshipHistory?:TopRelationshipHistory["relationshipHistory"]}|undefined;
  const rawWorld = runtime.ui?.game?.worldArchive;
  if (seasonMode === "AI_FREE" && typeof rawWorld === "string") { try { freeWorld = JSON.parse(rawWorld) as typeof freeWorld; } catch { throw new Error("自由模式世界档案无法解析；旧存档未修改。"); } }
  const formalExPairs = seasonMode === "AI_FREE" ? (freeWorld?.formalExPairs ?? []).map(pair=>[...pair] as [string,string]) : canonicalPairs[relationshipMode].map((pair) => [...pair] as [string, string]);
  const existing = runtime.ui?.game?.topSeasonHistory;
  let savedHistory: Partial<TopRelationshipHistory> = {};
  if (typeof existing === "string") { try { savedHistory = JSON.parse(existing) as Partial<TopRelationshipHistory>; } catch { /* rederive history from stable seed */ } }
  const experience = (pair: [string, string]) => `${pair[0]}-${pair[1]}:${randomSeed}`;
  const relationshipHistory = seasonMode === "AI_FREE" && freeWorld?.relationshipHistory ? structuredClone(freeWorld.relationshipHistory) : formalExPairs.map((pair) => (current?.history.relationshipHistory ?? savedHistory.relationshipHistory)?.find((row) => pairKey(row.pair) === pairKey(pair)) ?? {
    pair, dated: `season-history-${hashSeed(experience(pair)) % 4 + 1}`, breakupReason: `relationship-${hashSeed(experience(pair) + "reason") % 3 + 1}`,
    sharedExperiences: [`shared-${hashSeed(experience(pair) + "memory") % 5 + 1}`],
  });
  const history: TopRelationshipHistory = {
    relationshipMode, randomSeed, formalExPairs,
    relationshipHistory,
    hiddenSecrets: current?.history.hiddenSecrets ?? savedHistory.hiddenSecrets ?? [{ id: "x-room-letters", value: `secret-${hashSeed(randomSeed + "secret") % 5 + 1}` }],
    pastUnconfirmedPairs: relationshipMode === "E" ? [["ZJ", "ZH"]] : [],
  };
  const rawDynamic = runtime.ui?.game?.topSeasonDynamic;
  let dynamic: TopDynamicState | undefined;
  if (typeof rawDynamic === "string") { try { dynamic = JSON.parse(rawDynamic) as TopDynamicState; } catch { /* initialize missing dynamic state */ } }
  const episodes = runtime.ui?.game?.completedEpisodes;
  const completed = typeof episodes === "string" ? (() => { try { return (JSON.parse(episodes) as number[]).filter((x) => Number.isInteger(x) && x >= 1 && x <= 14); } catch { return []; } })() : [];
  const savedAvailable=current?.episodeState.available??[1,2,3];
  const runtimeDay=Math.max(1,Number(runtime.variables.gameDay??current?.episodeState.current??1)||1);
  const legacyEpisodeRows=Array.from({length:4},(_,index)=>index+11).flatMap(episode=>{
    const state=runtime.ui?.game?.[`episode${episode}`];
    return state===undefined?[]:[{episode,state:structuredClone(state)}];
  });
  const legacyCompleted=completed.filter(episode=>episode>10);
  const gameUi={...(runtime.ui?.game??{})};
  if(legacyEpisodeRows.length||legacyCompleted.length){
    const existingArchive=typeof gameUi.topSeasonLegacyArchive==="string"?gameUi.topSeasonLegacyArchive:undefined;
    if(!existingArchive)gameUi.topSeasonLegacyArchive=JSON.stringify({archivedAt:now,sourceTimeline:"V13/14-episode",episodes:legacyEpisodeRows,completed:legacyCompleted,gameDay:runtimeDay});
  }
  const safeRuntime={...runtime,ui:{...runtime.ui,game:gameUi}};
  return {
    id: TOP_SEASON_ID, seasonId: TOP_SEASON_ID, schemaVersion: Math.max(TOP_SAVE_SCHEMA_VERSION, current?.schemaVersion ?? TOP_SAVE_SCHEMA_VERSION), gameMode: seasonMode,
    createdAt: now, updatedAt: now, runtime: structuredClone(safeRuntime), history,
    dynamic: dynamic ?? current?.dynamic ?? { affection: {}, trust: {}, security: {}, crush: {}, misunderstandings: [], reconciliationIntent: {}, relationshipProgress: {}, previousEpisodeChoices: {}, eventHistory: [], revealedSecrets: [] },
    episodeState: { available: [...new Set([...savedAvailable.filter(episode=>episode>=1&&episode<=10), ...Array.from({length:Math.max(3,Math.min(10,runtimeDay))},(_,i)=>i+1)])].sort((a,b)=>a-b), completed: [...new Set([...completed, ...(current?.episodeState.completed ?? [])])], current: Math.min(10, runtimeDay) },
  };
}
function hashSeed(input: string) { let h = 2166136261; for (const c of input) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }

export function validateTopSeasonSave(value: unknown): TopSeasonSave {
  if (!value || typeof value !== "object") throw new Error("文件不是有效的存档JSON对象。");
  const save = value as Partial<TopSeasonSave>;
  if (!Number.isInteger(save.schemaVersion) || (save.schemaVersion as number) < TOP_SAVE_SCHEMA_VERSION) throw new Error(`不支持存档结构版本 ${String(save.schemaVersion)}；原存档未修改。`);
  if (save.seasonId !== TOP_SEASON_ID) throw new Error("存档不属于《TOP换乘恋爱》本季。");
  if (!save.runtime || !save.history || !save.dynamic || !save.episodeState) throw new Error("存档缺少运行进度、关系历史或分集状态。");
  const h = save.history;
  if (save.gameMode !== "CLASSIC" && save.gameMode !== "AI_FREE") throw new Error("存档缺少有效的CLASSIC或AI_FREE模式标记。");
  if (!h.relationshipMode || !(h.relationshipMode in canonicalPairs)) throw new Error("关系历史中的模式无效。");
  if (!h.randomSeed || !h.formalExPairs || !h.relationshipHistory || !h.hiddenSecrets || !h.pastUnconfirmedPairs) throw new Error("正式X、共同经历或隐藏秘密字段不完整。");
  const isValidPairs = (pairs: [string, string][]) => Array.isArray(pairs) && pairs.every((pair) => Array.isArray(pair) && pair.length === 2 && pair[0] !== pair[1] && pair.every((id) => ids.has(id)));
  if (!isValidPairs(h.formalExPairs) || (save.gameMode === "CLASSIC" && h.formalExPairs.map(pairKey).sort().join("|") !== canonicalPairs[h.relationshipMode].map(pairKey).sort().join("|"))) throw new Error(save.gameMode === "CLASSIC" ? "经典模式正式X关系与原模式设定不一致（棍铲必须始终互为X）。" : "自由模式正式X关系无效。");
  if (save.gameMode === "AI_FREE" && new Set(h.formalExPairs.flat()).size !== h.formalExPairs.length * 2) throw new Error("自由模式正式X映射不符合一对一约束。");
  if (save.gameMode === "AI_FREE") { const archive = save.runtime.ui?.game?.worldArchive; if (typeof archive !== "string") throw new Error("自由模式存档缺少世界档案。"); let world: {gameMode?:string;formalExPairs?:[string,string][]}; try { world = JSON.parse(archive) as typeof world; } catch { throw new Error("自由模式世界档案JSON无效。"); } if (world.gameMode !== "AI_FREE" || world.formalExPairs?.map(pairKey).sort().join("|") !== h.formalExPairs.map(pairKey).sort().join("|")) throw new Error("自由模式世界档案与固定正式X映射不一致。"); }
  if (!isValidPairs(h.pastUnconfirmedPairs) || !Array.isArray(h.relationshipHistory) || h.relationshipHistory.some((row) => !isValidPairs([row.pair]) || !row.dated || !row.breakupReason || !Array.isArray(row.sharedExperiences)) || !Array.isArray(h.hiddenSecrets) || h.hiddenSecrets.some((row) => !row.id || !row.value)) throw new Error("固定关系历史字段缺失或人物ID非法。");
  if (!Array.isArray(save.episodeState.available) || !save.episodeState.available.includes(1) || !Array.isArray(save.episodeState.completed) || save.episodeState.completed.some((ep) => !Number.isInteger(ep) || ep < 1 || ep > 14) || !Number.isInteger(save.episodeState.current)) throw new Error("已完成剧集清单或可用剧集状态无效。");
  const serialized = JSON.stringify(save);
  if (/["'](?:apiKey|api_key|openaiKey|token)["']\s*:/i.test(serialized) || /Bearer\s+[a-z0-9_-]{24,}/i.test(serialized)) throw new Error("存档中检测到疑似API Key；请移除后再导入。");
  if (save.runtime.variables.gameMode !== h.relationshipMode) throw new Error("运行进度中的关系模式与固定历史不一致。");
  return structuredClone(save as TopSeasonSave);
}

export function migrateTopSeasonSaveVersion(value: unknown, now = Date.now()): TopSeasonSave {
  if (!value || typeof value !== "object") throw new Error("无法迁移：原始存档不是对象，原文件未修改。");
  const raw = value as Partial<TopSeasonSave>;
  if (raw.seasonId !== TOP_SEASON_ID || !raw.runtime) throw new Error("无法安全迁移：季标识或运行状态缺失，原始存档已保留。");
  if (raw.schemaVersion === TOP_SAVE_SCHEMA_VERSION) return validateTopSeasonSave(value);
  if ((raw.schemaVersion ?? 0) > TOP_SAVE_SCHEMA_VERSION) throw new Error(`缺少从版本 ${String(raw.schemaVersion)} 到 ${TOP_SAVE_SCHEMA_VERSION} 的显式迁移程序；原始存档已保留。`);
  if (raw.schemaVersion === 1 && raw.runtime && raw.history && raw.dynamic && raw.episodeState) {
    const migrated = structuredClone(raw as TopSeasonSave);
    migrated.schemaVersion = TOP_SAVE_SCHEMA_VERSION;
    migrated.gameMode = "CLASSIC";
    migrated.runtime.ui = { ...migrated.runtime.ui, game: { ...migrated.runtime.ui?.game, seasonGameMode: "CLASSIC" } };
    migrated.updatedAt = now;
    return validateTopSeasonSave(migrated);
  }
  if (raw.schemaVersion !== 0) throw new Error(`缺少从版本 ${String(raw.schemaVersion)} 到 ${TOP_SAVE_SCHEMA_VERSION} 的显式迁移程序；原始存档已保留。`);
  return migrateTopSeasonSave(value, now);
}

export function migrateTopSeasonSave(value: unknown, now = Date.now()): TopSeasonSave {
  if (!value || typeof value !== "object") throw new Error("无法迁移：原始存档不是对象，原文件未修改。");
  const raw = value as Partial<TopSeasonSave>;
  if (raw.schemaVersion === TOP_SAVE_SCHEMA_VERSION) return validateTopSeasonSave(value);
  if (raw.schemaVersion !== 0 || raw.seasonId !== TOP_SEASON_ID || !raw.runtime) throw new Error("无法安全迁移此存档版本；原始存档已保留。");
  const migrated = makeTopSeasonSave(raw.runtime, now);
  migrated.createdAt = raw.createdAt ?? now;
  migrated.dynamic = raw.dynamic ?? migrated.dynamic;
  migrated.episodeState = raw.episodeState ?? migrated.episodeState;
  migrated.history = raw.history as TopRelationshipHistory ?? migrated.history;
  return validateTopSeasonSave(migrated);
}
