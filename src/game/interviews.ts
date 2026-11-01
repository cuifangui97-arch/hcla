import corpus from "./interviews.ep01-14.v1.json";
import type { Runtime } from "../schema";
import type { GuestId, ScriptLine } from "./day1-data";
import { readSavedRelationshipHistory } from "./day1-data";

export type InterviewTurn = { id?: string; speaker: "pd" | string; text: string };
export type InterviewBranch = { id: string; label: string; turns: { speaker: string; text: string }[] };
export type InterviewEntry = {
  interviewId: string; episode: number; characterId: string; characterName: string;
  canonicalTurns: InterviewTurn[]; directorFollowupChoices: InterviewBranch[];
  conditionalInsert?: { predicate: string; question: string; yes: string; no: string };
  requires: string[]; spoilerLevel: string;
};
export type InterviewProgress = { line: number; followupId?: string; started?: boolean; finished?: boolean; auto?: boolean };

export const interviewEntries = (corpus as { interviews: InterviewEntry[] }).interviews;
const idMap: Record<string, GuestId> = { zhuzhixin:"ZZX", suxinhao:"SXH", zhangji:"ZJ", zhangzeyu:"ZZY", zuohang:"ZH" };
export function interviewFor(episode: number, guest: GuestId) {
  const reverse = Object.entries(idMap).find(([,id])=>id===guest)?.[0];
  return interviewEntries.find(row=>row.episode===episode&&row.characterId===reverse);
}

/** Only known predicates in the delivered corpus are evaluated here; never eval corpus code. */
export function interviewConditional(entry: InterviewEntry, runtime: Runtime, guest: GuestId): { question:string; answer:string } | undefined {
  const conditional=entry.conditionalInsert;
  if(!conditional)return;
  const read=(key:string):Record<string,unknown>=>{
    const raw=runtime.ui?.game?.[key];
    if(typeof raw!=="string")return {};
    try{return JSON.parse(raw) as Record<string,unknown>}catch{return {}}
  };
  const state=read(`episode${entry.episode}`);
  const completedStage=(steps:string[])=>steps.includes(String(state.step??state.phase??""));
  const history=readSavedRelationshipHistory(runtime.variables.topSeasonHistory,String(runtime.variables.gameMode??"C"));
  let yes=false;
  switch(conditional.predicate){
    case 'ep02.events.includes("shopping_showcase")': yes=(Array.isArray(state.eventHistory)&&state.eventHistory.some(id=>id==="shopping_showcase"||id==="D02-004"))||completedStage(["tidy","free","dinner","chatSetup","chat","interviewSetup","interview","sms","kcNight","edit","social","complete"]); break;
    case 'ep02.roles.shopping.includes("zhangji")': yes=Array.isArray(state.shoppingPair)&&state.shoppingPair.includes("ZJ"); break;
    case 'ep03.datePairs.includes("zhuzhixin")': yes=Array.isArray(state.datePairs)&&state.datePairs.some((p)=>Array.isArray(p)&&p.includes("ZZX"))&&completedStage(["stay","reunion","focusSetup","night","interview","sms","kcNight","edit","social","complete"]); break;
    case 'ep06.datePairs.some(pair=>pair.includes("suxinhao"))': yes=Array.isArray(state.pair)&&state.pair.includes("SXH"); break;
    case 'ep08.propsViewed.includes("birthday-blindbox")': yes=(Array.isArray(state.viewed)&&(state.viewed.includes("birthday-blindbox")||state.viewed.includes("blindbox")))||Array.isArray(state.visited)&&state.visited.includes("birthday-blindbox"); break;
    case 'ep10.events.includes("MH_SUNRISE_TOGETHER")': yes=(Array.isArray(state.eventHistory)&&state.eventHistory.includes("MH_SUNRISE_TOGETHER"))||(Array.isArray(state.pair)&&state.pair.includes("ZZY")&&state.pair.includes("ZH")&&completedStage(["interview","sms","kcNight","edit","social","complete"])); break;
    case 'ep04.freeActivity.hasKitchenClip': yes=Array.isArray(state.recorded)&&state.recorded.some(id=>id==="D04_CLIP_KC_LETTER_PAUSE"||id==="D04_CLIP_KC_CUP"); break;
    case 'ep04.freeActivity.hasLivingClip': yes=Array.isArray(state.recorded)&&state.recorded.some(id=>id==="D04_CLIP_LIVING_REMOTE"||id==="D04_CLIP_LIVING_LETTER"); break;
    case 'ep04.freeActivity.hasBalconyClip': yes=Array.isArray(state.recorded)&&state.recorded.some(id=>id==="D04_CLIP_JH_BALCONY"||id==="D04_CLIP_JH_LETTER_REACTION"); break;
    case 'formalExMap.zhangji !== null': yes=history.formalExPairs.some(pair=>pair.includes("ZJ")); break;
    default: yes=false;
  }
  return {question:conditional.question,answer:yes?conditional.yes:conditional.no};
}

export function interviewLines(entry: InterviewEntry, progress: InterviewProgress, conditional?: {question:string;answer:string}): ScriptLine[] {
  const branch=entry.directorFollowupChoices.find(row=>row.id===progress.followupId);
  if(!branch)return entry.canonicalTurns.slice(0,4).map(turn=>({speaker:turn.speaker==="pd"?"STAGE":idMap[turn.speaker]??"STAGE",text:turn.text,mood:turn.speaker==="pd"?"interview-pd":undefined} as ScriptLine));
  const turns:InterviewTurn[]=[...entry.canonicalTurns.slice(0,4),...(branch?.turns??[]),...entry.canonicalTurns.slice(4)];
  if(conditional)turns.push({speaker:"pd",text:conditional.question},{speaker:entry.characterId,text:conditional.answer});
  return turns.map(turn=>({speaker:turn.speaker==="pd"?"STAGE":idMap[turn.speaker]??"STAGE",text:turn.text,mood:turn.speaker==="pd"?"interview-pd":undefined} as ScriptLine));
}
