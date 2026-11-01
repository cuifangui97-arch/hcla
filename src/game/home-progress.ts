import { episodeManifest } from "../persistence";
import type { Runtime, UiValue } from "../schema";
import { resolveEp04Phase } from "./ep04-progress";
import { canonicalV13Episodes, resolveV13Stage } from "./canonical-v13";

export type EpisodeManifestEntry = { episode: number; title: string; available: boolean; sceneCount?: number };
export type HomeProgress = {
  started: boolean;
  currentEpisode: number;
  completed: boolean;
  waitingForNext: boolean;
  nextEpisode?: number;
  title: string;
  sceneIndex: number;
  sceneCount: number;
  sceneLabel: string;
  dialogueIndex: number;
  dialogueCount?: number;
  resumeApp: string;
  legacyTimelineArchived?: boolean;
};

type EpisodeState = Record<string, unknown>;
const safeObject = (value: UiValue | undefined): EpisodeState | undefined => {
  if (typeof value !== "string") return undefined;
  try { const parsed = JSON.parse(value) as unknown; return parsed && typeof parsed === "object" ? parsed as EpisodeState : undefined; }
  catch { return undefined; }
};
const toEpisodeList = (value: unknown) => {
  if (Array.isArray(value)) return value.map(Number).filter(x => Number.isInteger(x) && x >= 1 && x <= 14);
  if (typeof value === "string") { try { return toEpisodeList(JSON.parse(value) as unknown); } catch { return []; } }
  return [] as number[];
};

const ep23Steps: Record<number, string[]> = {
  2: ["morning","breakfast","shoppingSetup","shopping","tidy","free","dinner","chatSetup","chat","interviewSetup","interview","sms","kcNight","edit","social","complete"],
  3: ["rules","dateSetup","date1","date2","stay","reunion","focusSetup","night","interview","sms","kcNight","edit","social","complete"],
};
const ep23Labels: Record<string,string> = { morning:"清晨厨房",breakfast:"早餐与生活习惯",shoppingSetup:"采购任务待安排",shopping:"超市采购",tidy:"小屋整理",free:"下午自由活动",dinner:"晚餐与约会期待",chatSetup:"匿名聊天室待设置",chat:"匿名聊天室",interviewSetup:"后采待安排",interview:"后采录制",rules:"约会规则",dateSetup:"约会配对待安排",date1:"第一组约会",date2:"第二组约会",stay:"留守小屋",reunion:"五人晚间集合",focusSetup:"导演观察重点待选",night:"约会后谈话",sms:"匿名短信",kcNight:"深夜未公开素材",edit:"正片剪辑",social:"观众讨论",complete:"本期完成" };
const dayOnePhases = ["intro","arrivals","roles","kitchen","dinner","night","interview","sms","kcNight","edit","social","complete"];
const dayOneLabels: Record<string,string> = {intro:"录制准备",arrivals:"五人入住",roles:"入住第一餐分工",kitchen:"厨房机位",dinner:"五人晚餐",night:"夜间观察",interview:"后采录制",sms:"心动短信",kcNight:"深夜未公开素材",edit:"正片剪辑",social:"观众讨论",complete:"本期完成"};
const seasonPhases = ["story","decision","activity","freeActivity","interview","sms","edit","social","finale","complete"];
const seasonLabels: Record<string,string> = {story:"本期开场",decision:"导演选择",activity:"节目任务",freeActivity:"下午自由活动",interview:"后采录制",sms:"心动短信",kcNight:"深夜观察",edit:"正片剪辑",social:"观众讨论",finale:"最终选择",complete:"本期完成"};
const ep05Stages = ["BREAKFAST","INTRO","ROUND1_SELECTION","ROUND1_PLAY","ROUND2_SELECTION","ROUND2_PLAY","GROUP_REACTION","BONUS_SELECTION","BONUS_PLAY","EVENING","INTERVIEW","SMS","EDITING","BROADCAST","COMPLETE"];
const ep05StageLabels:Record<string,string>={BREAKFAST:"五人早餐",INTRO:"对视任务规则",ROUND1_SELECTION:"安排第一轮嘉宾",ROUND1_PLAY:"第一轮对视任务",ROUND2_SELECTION:"安排第二轮嘉宾",ROUND2_PLAY:"第二轮对视任务",GROUP_REACTION:"任务结果讨论",BONUS_SELECTION:"下午追加任务",BONUS_PLAY:"下午追加活动",EVENING:"晚饭后主线",INTERVIEW:"后采录制",SMS:"心动短信",EDITING:"正片剪辑",BROADCAST:"观众讨论",COMPLETE:"本期完成"};
function resolveEp05Stage(state:EpisodeState){const explicit=String(state.ep05Stage??"");const phase=String(state.phase??"");const normalizedPhase=phase.toLowerCase().replace(/[^a-z]/g,"");if(phase==="complete")return "COMPLETE";if(state.broadcastId||phase==="social")return "BROADCAST";if(state.sent===true)return "EDITING";if(["kcnight","postsms","postsmscene","nightfootage"].includes(normalizedPhase))return "SMS";if(explicit==="NIGHT")return "EVENING";if(ep05Stages.includes(explicit))return explicit;if(phase==="edit")return "EDITING";if(phase==="sms")return "SMS";if(phase==="interview")return "INTERVIEW";const rounds=Array.isArray(state.ep05Rounds)?state.ep05Rounds as Record<string,unknown>[]:[];if(phase==="decision")return rounds.length===0?"ROUND1_SELECTION":rounds.length===1?"ROUND2_SELECTION":"BONUS_SELECTION";if(phase==="activity"){if(state.pair&&Array.isArray(state.pair)&&(state.pair as unknown[]).length===2&&rounds.length===0)return "ROUND1_PLAY";return rounds.length>=2?"GROUP_REACTION":rounds.length===1?"ROUND2_SELECTION":"INTRO";}return Number(state.line??0)>0?"INTRO":"BREAKFAST";}
const parseCurrentState = (runtime: Runtime, episode: number) => safeObject(runtime.ui?.game?.[`episode${episode}`]);
function isComplete(runtime: Runtime, episode: number, completed: Set<number>) {
  if (completed.has(episode)) return true;
  const state = episode === 1 ? safeObject(runtime.ui?.game?.day1) : parseCurrentState(runtime, episode);
  return Boolean(state && (episode === 1 ? state.phase === "complete" : episode <= 3 ? state.completed === true || state.step === "complete" : state.phase === "complete"));
}
function hasSavedProgress(runtime: Runtime, episode: number) {
  return Boolean(episode === 1 ? safeObject(runtime.ui?.game?.day1) : parseCurrentState(runtime, episode));
}
function resumeApp(runtime: Runtime, episode: number) {
  const state = episode === 1 ? safeObject(runtime.ui?.game?.day1) ?? {} : parseCurrentState(runtime, episode) ?? {};
  if(episode===8){const stage=String(state.v16Phase??(state.sent?"EDITING":"INTRO"));if(["ORDER","CHOICE_SUBMIT","INTERVIEW_SELECT"].includes(stage))return "reminders";if(stage==="SMS")return "messages";if(["EDITING","BROADCAST"].includes(stage))return stage==="BROADCAST"?(Array.isArray(state.visits)?(["weibo","forum","threads"].find(id=>!(state.visits as string[]).includes(id))??"weibo"):"weibo"):"bilibili";if(stage==="COMPLETE")return "settings";return "camera";}
  if(episode===5){const stage=resolveEp05Stage(state);if(["ROUND1_SELECTION","ROUND2_SELECTION","BONUS_SELECTION"].includes(stage))return "reminders";if(stage==="INTERVIEW")return state.ep05InterviewStarted?"mail":"reminders";if(stage==="SMS")return "messages";if(stage==="EDITING")return "bilibili";if(stage==="BROADCAST"){const visited=Array.isArray(state.visits)?state.visits:[];return (["weibo","forum","threads"].find(id=>!visited.includes(id))??"weibo");}return "camera";}
  if(episode===9){const legacyPhase=String(state.phase??"");const phase=String(state.v164Phase??(legacyPhase==="complete"?"COMPLETE":legacyPhase==="decision"?"TRAVEL_ASSIGN":legacyPhase==="sms"?"SMS":legacyPhase==="edit"?"EDITING":"INTRO"));if(phase==="COMPLETE")return "settings";if(phase==="BROADCAST"){const visited=Array.isArray(state.visits)?state.visits:[];return (["weibo","forum","threads"].find(id=>!visited.includes(id))??"weibo");}if(phase==="EDITING")return "bilibili";if(phase==="SMS")return "messages";if(["TRAVEL_ASSIGN","GIFT_RULE","INVITES","TRUTH"].includes(phase))return "reminders";return "camera";}
  if(episode>=6){const stage=resolveV13Stage(episode,state);if(stage==="EDITING"||stage==="FINAL_CUT")return "bilibili";if(stage==="SMS")return "messages";if(stage==="INTERVIEW"||stage==="INTERVIEWS")return "mail";if(episode===7&&stage==="PROFILE_ORDER"||episode===7&&stage==="ASSIGN")return "reminders";if(stage==="BROADCAST"){const visited=Array.isArray(state.visits)?state.visits:[];return (["weibo","forum","threads"].find(id=>!visited.includes(id))??"weibo");}}
  const step = episode===4?resolveEp04Phase(state):String(state.step ?? state.phase ?? "");
  if (["shoppingSetup","chatSetup","interviewSetup","dateSetup","focusSetup","decision"].includes(step)) return "reminders";
  if (step === "interview") return "mail";
  if (step === "sms") return "messages";
  if (step === "edit") return "bilibili";
  if (step === "social") {
    const visited = Array.isArray(state.socialVisited) ? state.socialVisited : Array.isArray(state.visits) ? state.visits : [];
    return (["weibo","forum","threads"].find(id => !visited.includes(id)) ?? "weibo");
  }
  return "camera";
}
function sceneProgress(runtime: Runtime, episode: number, state: EpisodeState | undefined) {
  if (!state) return { sceneIndex: 1, sceneCount: episode === 4 ? 12 : episode===5?15:1, sceneLabel: "尚未开始", dialogueIndex: 1 };
  if(episode===8){const stages=["INTRO","ORDER","ROOMS","LUNCH","CHOICE_RULE","CHOICE_SUBMIT","CHOICE_RESULT","CHOICE_ACTIVITY","DINNER","INTERVIEW_SELECT","INTERVIEW","SMS","EDITING","BROADCAST","COMPLETE"];const stage=String(state.v16Phase??(state.sent?"EDITING":"INTRO"));const index=Math.max(0,stages.indexOf(stage));const roomIndex=Number(state.roomIndex??0),line=stage==="ROOMS"?Number(state.v16Line??0):Number(state.v16Line??0);const labels:Record<string,string>={INTRO:"早餐与来信",ORDER:"安排回忆室顺序",ROOMS:`个人回忆空间 ${Math.min(5,roomIndex+1)}/5`,LUNCH:"午间交流",CHOICE_RULE:"匿名互选规则",CHOICE_SUBMIT:"安排五人选择",CHOICE_RESULT:"互选结果",CHOICE_ACTIVITY:"互选活动",DINNER:"晚餐",INTERVIEW_SELECT:"安排后采",INTERVIEW:"后采",SMS:"心动短信",EDITING:"剪辑室",BROADCAST:"播出反馈",COMPLETE:"本期完成"};return {sceneIndex:index+1,sceneCount:stages.length,sceneLabel:labels[stage]??stage,dialogueIndex:line+1};}
  if(episode===5){const stage=resolveEp05Stage(state);const index=Math.max(0,ep05Stages.indexOf(stage));let dialogueIndex=Number(state.line??0)+1;if(stage==="ROUND1_PLAY"||stage==="ROUND2_PLAY"){const roundIndex=stage==="ROUND2_PLAY"?1:0;const rounds=Array.isArray(state.ep05Rounds)?state.ep05Rounds as Record<string,unknown>[]:[];const active=rounds[roundIndex];const segment=String(state.ep05ActiveSegment??"ready");const progress=active?.dialogueProgress&&typeof active.dialogueProgress==="object"?active.dialogueProgress as Record<string,unknown>:{};dialogueIndex=active?Number(progress[segment]??0)+1:Number(state.line??0)+1;}else if(stage==="EVENING")dialogueIndex=Number(state.ep05NightLine??0)+1;else if(stage==="BONUS_PLAY")dialogueIndex=Number(state.ep05BonusLine??0)+1;return {sceneIndex:index+1,sceneCount:ep05Stages.length,sceneLabel:ep05StageLabels[stage]??"EP05录制",dialogueIndex};}
  if(episode===9){const flow=["INTRO","TRAVEL_ASSIGN","TRAVEL_PLAY","RETURN","GIFT_RULE","GIFT_PLAY","FINAL_DATE_RULE","INVITES","FINAL_DATE_PLAY","TRUTH","INTERVIEW","SMS","EDITING","COMPLETE"],legacyPhase=String(state.phase??""),phase=String(state.v164Phase??(legacyPhase==="decision"?"TRAVEL_ASSIGN":legacyPhase==="activity"?"TRAVEL_PLAY":legacyPhase==="sms"?"SMS":legacyPhase==="edit"?"EDITING":"INTRO")),normalized=phase==="BROADCAST"?"EDITING":phase,index=Math.max(0,flow.indexOf(normalized));return {sceneIndex:index+1,sceneCount:flow.length,sceneLabel:({INTRO:"清晨集合",TRAVEL_ASSIGN:"安排旅行分组",TRAVEL_PLAY:"旅行、日出与独行",RETURN:"归来早餐",GIFT_RULE:"选择礼物机制",GIFT_PLAY:"送礼与拆礼",FINAL_DATE_RULE:"最后约会规则",INVITES:"邀请与接受",FINAL_DATE_PLAY:"最后约会与个人活动",TRUTH:"晚餐与真心话",INTERVIEW:"五人后采",SMS:"心动短信",EDITING:"剪辑与播出",COMPLETE:"EP09完成"} as Record<string,string>)[normalized]??normalized,dialogueIndex:Number(state.travelLine??state.line??0)+1};}
  if (episode === 4) {
    const phase = resolveEp04Phase(state);
    const phaseIndex: Record<string,number> = { story:1, decision:2, activity:3, freeActivity:8, interview:9, sms:10, kcNight:11, edit:12, social:12, complete:12 };
    let sceneIndex = phaseIndex[phase] ?? 1;
    if (phase === "activity") {
      const letters = state.ep04Letters && typeof state.ep04Letters === "object" ? Object.values(state.ep04Letters as Record<string,Record<string,unknown>>) : [];
      const completedReaders = letters.filter(row => row?.reactionViewed && row?.observationViewed).length;
      sceneIndex = Math.min(7, 3 + completedReaders);
    }
    return { sceneIndex, sceneCount:12, sceneLabel:seasonLabels[phase] ?? "EP04录制", dialogueIndex:Number(state.line ?? 0) + 1 };
  }
  if (episode === 1) {
    const phase=String(state.phase??"intro"), index=Math.max(0,dayOnePhases.indexOf(phase));
    let dialogueIndex=Number(state.line??0)+1;
    if(phase==="arrivals")dialogueIndex=Number(state.arrivalLine??0)+1;
    if(phase==="kitchen")dialogueIndex=Number(state.kitchenLine??0)+1;
    if(phase==="dinner")dialogueIndex=Number(state.dinnerLine??0)+1;
    return {sceneIndex:index+1,sceneCount:dayOnePhases.length,sceneLabel:dayOneLabels[phase]??phase,dialogueIndex};
  }
  if (episode === 2 || episode === 3) {
    const phase=String(state.step??(episode===2?"morning":"rules")),steps=ep23Steps[episode],index=Math.max(0,steps.indexOf(phase));
    return {sceneIndex:index+1,sceneCount:steps.length,sceneLabel:ep23Labels[phase]??phase,dialogueIndex:Number(state.line??0)+1};
  }
  if (episode >= 6) {
    const flow=canonicalV13Episodes.find(row=>row.episode===episode)?.scenes??[];
    const stage=resolveV13Stage(episode,state);
    const index=Math.max(0,flow.findIndex(row=>row.id===`EP${String(episode).padStart(2,"0")}-${stage}`));
    const specificLine=episode===6?Number(state.ep06Stage==="DATE_A"?state.ep06DateALine:state.ep06Stage==="STAY_HOME"?state.ep06StayLine:state.ep06Stage==="DATE_B"?state.ep06DateBLine:state.ep06Stage==="DINNER"?state.ep06DinnerLine:state.ep06Stage==="KITCHEN_BRIDGE"?state.ep06BridgeLine:state.ep06Stage==="INTERVIEW"?state.ep06InterviewLine:state.line??0):episode===7?Number(state.ep07Stage==="PROFILE_SHOW"?state.profileIndex:state.ep07Stage==="INTERVIEW"?state.ep07InterviewProgress&&state.ep07Interviews&&((state.ep07InterviewProgress as Record<string,{line?:number}>)[(state.ep07Interviews as string[])[Number(state.ep07InterviewIndex??0)]]?.line??0):state.ep07Line??state.line??0):Number(state.line??0);
    return {sceneIndex:index+1,sceneCount:Math.max(1,flow.length),sceneLabel:flow[index]?.title??stage,dialogueIndex:specificLine+1};
  }
  const phase=String(state.phase??"story"),index=Math.max(0,seasonPhases.indexOf(phase));
  return {sceneIndex:index+1,sceneCount:Math.max(1,Number((episodeManifest.find(entry=>entry.episode===episode) as EpisodeManifestEntry|undefined)?.sceneCount??seasonPhases.length)),sceneLabel:seasonLabels[phase]??phase,dialogueIndex:Number(state.line??0)+1};
}

export function resolveHomeProgress(runtime: Runtime, manifest: EpisodeManifestEntry[] = episodeManifest): HomeProgress {
  const variables=runtime.variables as Record<string,unknown>, gameUi=runtime.ui?.game;
  const manifestByEpisode=new Map(manifest.map(entry=>[entry.episode,entry]));
  const released=new Set(manifest.filter(entry=>entry.available).map(entry=>entry.episode));
  released.add(1);
  const completed=new Set(toEpisodeList(variables.completedEpisodes));
  for(let episode=1;episode<=10;episode++)if(isComplete(runtime,episode,completed))completed.add(episode);
  const hasRealProgress=Array.from({length:10},(_,index)=>index+1).some(episode=>{
    if(episode===1){const state=safeObject(gameUi?.day1);return Boolean(state&&state.phase!=="intro");}
    return hasSavedProgress(runtime,episode);
  });
  // The engine's generic `start` event initializes gameDay=1 before the player starts recording.
  const started=Number(variables.gameDay??0)>1||completed.size>0||hasRealProgress;
  const title=(episode:number)=>manifestByEpisode.get(episode)?.title??`EP.${String(episode).padStart(2,"0")}`;
  if(!started)return {started:false,currentEpisode:1,completed:false,waitingForNext:false,title:title(1),...sceneProgress(runtime,1,undefined),resumeApp:"camera"};

  const savedGameDay=Number(variables.gameDay)||1;
  const hasLegacyEpisodes=Array.from({length:4},(_,index)=>index+11).some(episode=>hasSavedProgress(runtime,episode)||completed.has(episode));
  const timelineV16=String(gameUi?.seasonTimelineV16??"")==="16.1";
  if(savedGameDay>10&&hasLegacyEpisodes&&!timelineV16){
    return {started:true,currentEpisode:8,completed:false,waitingForNext:false,legacyTimelineArchived:true,title:title(8),...sceneProgress(runtime,8,parseCurrentState(runtime,8)),sceneLabel:"旧版EP08—EP14已归档 · 确认新版迁移",resumeApp:"camera"};
  }
  const gameDay=Math.max(1,Math.min(10,savedGameDay));
  const available=(episode:number)=>released.has(episode)||hasSavedProgress(runtime,episode);
  const laterSaved=Array.from({length:10},(_,index)=>index+1).filter(episode=>episode>gameDay&&available(episode)&&hasSavedProgress(runtime,episode)&&!completed.has(episode)).sort((a,b)=>b-a)[0];
  if(laterSaved){
    const state=laterSaved===1?safeObject(gameUi?.day1):parseCurrentState(runtime,laterSaved);
    return {started:true,currentEpisode:laterSaved,completed:false,waitingForNext:false,title:title(laterSaved),...sceneProgress(runtime,laterSaved,state),resumeApp:resumeApp(runtime,laterSaved)};
  }
  // A pre-10-episode save may still point gameDay at 11–14. Prefer its latest
  // active EP01–EP10 state over the clamped pointer, or Continue would jump to EP10.
  const activeSaved=Array.from({length:10},(_,index)=>index+1).filter(episode=>available(episode)&&hasSavedProgress(runtime,episode)&&!completed.has(episode)).sort((a,b)=>b-a)[0];
  if(activeSaved){
    const state=activeSaved===1?safeObject(gameUi?.day1):parseCurrentState(runtime,activeSaved);
    return {started:true,currentEpisode:activeSaved,completed:false,waitingForNext:false,title:title(activeSaved),...sceneProgress(runtime,activeSaved,state),resumeApp:resumeApp(runtime,activeSaved)};
  }
  let current=gameDay;
  if(completed.has(current))current++;
  if(current<=10&&available(current)&&!completed.has(current)){
    const state=current===1?safeObject(gameUi?.day1):parseCurrentState(runtime,current);
    return {started:true,currentEpisode:current,completed:false,waitingForNext:false,title:title(current),...sceneProgress(runtime,current,state),resumeApp:resumeApp(runtime,current)};
  }

  // Keep legacy EP11–14 records intact without treating them as playable in this season release.
  const lastCompleted=[...completed].filter(episode=>episode<=10).sort((a,b)=>b-a)[0]??Math.max(1,gameDay-1);
  const next=lastCompleted+1;
  if(next<=10&&available(next)){
    return {started:true,currentEpisode:next,completed:false,waitingForNext:false,nextEpisode:next,title:title(next),...sceneProgress(runtime,next,undefined),sceneLabel:"尚未开始",resumeApp:resumeApp(runtime,next)};
  }
  if(next<=10){
    return {started:true,currentEpisode:Math.min(10,lastCompleted),completed:true,waitingForNext:true,nextEpisode:next,title:title(Math.min(10,lastCompleted)),...sceneProgress(runtime,Math.min(10,lastCompleted),undefined),sceneLabel:`EP.${String(Math.min(10,lastCompleted)).padStart(2,"0")} 已完成 · 下一期敬请期待`,resumeApp:resumeApp(runtime,Math.min(10,lastCompleted))};
  }
  const finishedEpisode=Math.min(10,lastCompleted);
  return {started:true,currentEpisode:finishedEpisode,completed:true,waitingForNext:false,title:title(finishedEpisode),...sceneProgress(runtime,finishedEpisode,finishedEpisode===1?safeObject(gameUi?.day1):parseCurrentState(runtime,finishedEpisode)),resumeApp:resumeApp(runtime,finishedEpisode)};
}
