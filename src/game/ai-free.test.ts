import { describe, expect, it } from "vitest";
import { makeFreeWorld, validateAiFreeEpisode, validateAiFreeSms, validateFreePairs } from "./ai-free";
import { getXNoticeForInbox, readSavedRelationshipHistory, type GuestId } from "./day1-data";
import { initialRuntime } from "../schema";
import { compileStory } from "../story-engine/compiler";
import story from "../../stories/template/story.json";
import { makeTopSeasonSave, migrateTopSeasonSaveVersion, validateTopSeasonSave } from "../persistence";

const preferences={cpTendency:"自由发展",conflict:"自然",style:"细腻",pace:"慢热",ending:"开放",aiAgency:"medium" as const,directorIntervention:"medium" as const};
describe("AI_FREE relationship isolation",()=>{
 it("allows no X and custom exclusive pairs while enforcing bidirectional one-to-one mapping",()=>{
  expect(validateFreePairs([])).toEqual([]);
  expect(validateFreePairs([["ZJ","ZH"]])).toEqual([["ZJ","ZH"]]);
  expect(validateFreePairs([["ZZX","ZJ"]])).toEqual([["ZZX","ZJ"]]);
  expect(()=>validateFreePairs([["ZZX","ZJ"],["ZZX","ZZY"]])).toThrow(/最多只能有一位/);
  expect(()=>validateFreePairs([["ZZX","ZZX"]])).toThrow(/不同成员/);
 });
 it("builds a free season save without changing classic rules or leaking secrets into save data",()=>{
  const world=makeFreeWorld({formalExPairs:[["ZJ","ZH"]],preferences});
  const runtime=initialRuntime(compileStory(story).work);runtime.variables.gameMode="C";runtime.variables.topSeasonHistory=JSON.stringify({relationshipMode:"C",formalExPairs:world.formalExPairs});runtime.ui={...runtime.ui,game:{...runtime.ui?.game,seasonGameMode:"AI_FREE",worldArchive:JSON.stringify(world)}};
  const save=makeTopSeasonSave(runtime,1000);expect(save.gameMode).toBe("AI_FREE");expect(save.history.formalExPairs).toEqual([["ZJ","ZH"]]);expect(save.runtime.ui?.game?.worldArchive).toBeDefined();expect(JSON.stringify(save)).not.toMatch(/apiKey|Bearer /);
  expect(validateTopSeasonSave(save).history.formalExPairs).toEqual([["ZJ","ZH"]]);
  const classicGame={...runtime.ui?.game,seasonGameMode:"CLASSIC"} as Record<string,import("../schema").UiValue>;delete classicGame.worldArchive;const classic=makeTopSeasonSave({...runtime,ui:{...runtime.ui,game:classicGame}},1001);expect(classic.gameMode).toBe("CLASSIC");expect(classic.history.formalExPairs).toContainEqual(["ZZX","SXH"]);
 });
 it("uses the custom X mapping for SMS notices",()=>{
  const history=readSavedRelationshipHistory({relationshipMode:"C",formalExPairs:[["ZJ","ZH"]]});
  expect(getXNoticeForInbox("ZJ",[{senderId:"ZH",recipientId:"ZJ"}],history)).toContain("选择了你");
  expect(getXNoticeForInbox("ZZX",[],history)).toContain("没有参与");
 });
 it("validates five anonymous SMS against locked recipients and rejects identity leaks",()=>{
  const targets={ZZX:"ZJ",SXH:"ZH",ZJ:"ZZY",ZZY:"SXH",ZH:"ZZX"};
  const messages=Object.entries(targets).map(([senderId,recipientId])=>({senderId,recipientId,body:"今天一起做事时，我发现自己比想象中更放松。"}));
  expect(validateAiFreeSms({messages},targets)).toHaveLength(5);
  expect(()=>validateAiFreeSms({messages:messages.map((row,index)=>index===0?{...row,recipientId:"SXH"}:row)},targets)).toThrow(/锁定选择一致/);
  expect(()=>validateAiFreeSms({messages:messages.map((row,index)=>index===0?{...row,body:"朱志鑫今天说的话我记得。"}:row)},targets)).toThrow(/嘉宾姓名/);
 });
 it("migrates schema v1 saves into classic mode and validates generated episode rules",()=>{
  const runtime=initialRuntime(compileStory(story).work);runtime.variables.gameMode="A";runtime.variables.topSeasonHistory=JSON.stringify({relationshipMode:"A",formalExPairs:[["ZZX","SXH"],["ZJ","ZZY"]]});
  const save=makeTopSeasonSave(runtime,1000);const v1={...save,schemaVersion:1,gameMode:undefined,runtime:{...runtime,ui:{...runtime.ui,game:{...runtime.ui?.game,seasonGameMode:undefined}}}};
  expect(migrateTopSeasonSaveVersion(v1,1001).gameMode).toBe("CLASSIC");
  const world=makeFreeWorld({formalExPairs:[["ZJ","ZH"]],preferences});
  const safe={episodeId:"EP04",scenes:[{sceneId:"EP04-S01",title:"介绍信",location:"客厅",participants:["ZJ","ZH"],dialogue:[{speakerId:"ZJ",dialogue:"我读到了这段话。",action:"停顿",preconditions:[],stateEffects:[{pair:"ZH-ZJ",trust:1}],visibility:"episode",knowledgeConstraints:["只能依据已公开信件"]}]}]};
  expect(validateAiFreeEpisode(safe,4,world).episodeId).toBe("EP04");
  expect(()=>validateAiFreeEpisode({...safe,scenes:[{...safe.scenes[0],dialogue:[{...safe.scenes[0].dialogue[0],speakerId:"SXH" as GuestId}]}]},4,world)).toThrow(/不在本场/);
  expect(()=>validateAiFreeEpisode({...safe,scenes:[{...safe.scenes[0],dialogue:[{...safe.scenes[0].dialogue[0],dialogue:"你是我的X"}]}]},4,world)).toThrow(/EP10前/);
  const finale={...safe,episodeId:"EP10",xRevealPairs:[["ZJ","ZH"]] as [string,string][],scenes:[{...safe.scenes[0],sceneId:"EP10-X-REVEAL",title:"本局X身份公开"}]};expect(validateAiFreeEpisode(finale,10,world).xRevealPairs).toEqual([["ZJ","ZH"]]);
  expect(()=>validateAiFreeEpisode({...finale,xRevealPairs:[["ZZX","SXH"]]},10,world)).toThrow(/不一致/);
  expect(()=>validateAiFreeEpisode({...finale,episodeId:"EP13"},13,world)).toThrow(/仅开放EP01—EP10/);
 });
});
