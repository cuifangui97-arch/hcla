import type { GuestId } from "./day1-data";
import { kcCabinetItems } from "./ep08-kc-v165";

/** Runtime scene registry: EP05-EP07 from canonical V13, EP08 from V16.3, EP09-10 from the 10-day season. */
export type V13Scene = { id: string; phase: string; title: string; next?: string; required: boolean; clipIds: string[] };
export type V13Episode = { episode: number; title: string; scenes: V13Scene[] };
const scene = (episode: number, key: string, phase: string, title: string, next: string | undefined, clipIds: string[] = []): V13Scene => ({ id: `EP${String(episode).padStart(2,"0")}-${key}`, phase, title, next, required: true, clipIds });
const ep08RoomClipIds = [...kcCabinetItems.flatMap(item=>[item.clipId,`${item.clipId}_INTERVIEW`]),...["jy-01","jy-02","jy-03","jh-01","jh-02","jh-03","mh-01","mh-02","mh-03"].flatMap(id=>[`E08-03-ROOM-${id}`,`E08-03-INTERVIEW-${id}`])];
const flows: Record<number, V13Scene[]> = {
  5: [scene(5,"BREAKFAST","story","五人早餐","INTRO",["D05-BREAKFAST-CAM01"]),scene(5,"INTRO","story","对视规则","ROUND1_SELECTION",["D05-RULES-CAM01"]),scene(5,"ROUND1_SELECTION","decision","安排第一轮搭档","ROUND1_PLAY"),scene(5,"ROUND1_PLAY","activity","第一轮对视","ROUND2_SELECTION"),scene(5,"ROUND2_SELECTION","decision","安排第二轮搭档","ROUND2_PLAY"),scene(5,"ROUND2_PLAY","activity","第二轮对视","GROUP"),scene(5,"GROUP","activity","五人重聚","BONUS_SELECTION",["D05-GROUP-CAM01"]),scene(5,"BONUS_SELECTION","decision","选择下午追加任务","BONUS_PLAY"),scene(5,"BONUS_PLAY","activity","下午追加任务","KC05",["D05-BONUS-ANON","D05-BONUS-REPLAY","D05-BONUS-NOTES"]),scene(5,"KC05","activity","晚饭后主线","INTERVIEW",["KC05_ATTEMPT_EXPLANATION"]),scene(5,"INTERVIEW","interview","后采","SMS"),scene(5,"SMS","sms","心动短信","EDITING"),scene(5,"EDITING","edit","导演剪辑","BROADCAST"),scene(5,"BROADCAST","social","正片讨论","COMPLETE"),scene(5,"COMPLETE","complete","本期完成",undefined)],
  6: [scene(6,"INTRO","story","第二次选择·节目开场","ASSIGN",["D06_INTRO"]),scene(6,"ASSIGN","decision","两组约会与留守安排","DATE_A"),scene(6,"DATE_A","activity","第一组约会·真实地点互动","STAY_HOME",["D06_DATE_A_ARRIVAL","D06_DATE_A_INTERACTION","D06_DATE_A_RESULT"]),scene(6,"STAY_HOME","activity","留守嘉宾独立剧情","DATE_B",["D06_STAY_ZZ","D06_STAY_SXH","D06_STAY_ZJ","D06_STAY_ZZY","D06_STAY_ZH"]),scene(6,"DATE_B","activity","第二组约会·真实地点互动","DINNER",["D06_DATE_B_ARRIVAL","D06_DATE_B_INTERACTION","D06_DATE_B_RESULT"]),{...scene(6,"KITCHEN_BRIDGE","activity","晚餐准备·先问再帮忙","DINNER",["D06_KC_HELP_PUBLIC"]),required:false},scene(6,"DINNER","activity","五人晚餐·导演话题分支","INTERVIEW",["D06_DINNER_TOPIC_FUNNY","D06_DINNER_TOPIC_STAY","D06_DINNER_TOPIC_SURPRISE"]),scene(6,"INTERVIEW","interview","后采·任选两位","SMS",["D06_INTERVIEW_GUEST"]),scene(6,"SMS","sms","心动短信·五人同时投递","EDITING"),scene(6,"EDITING","edit","真实素材剪辑·恰好三段","BROADCAST"),scene(6,"BROADCAST","social","EP06正片与舆论","COMPLETE"),scene(6,"COMPLETE","complete","本期完成并解锁EP07",undefined)],
  7: [scene(7,"INTRO","story","早餐与节目任务","PROFILE_ORDER",["D07-BREAKFAST"]),scene(7,"PROFILE_ORDER","decision","安排五人资料介绍顺序","PROFILE_SHOW"),scene(7,"PROFILE_SHOW","story","五人音乐兴趣自述","ASSIGN",["D07-PROFILES"]),scene(7,"ASSIGN","decision","节奏组、旋律组与统筹分工","RHYTHM"),scene(7,"RHYTHM","activity","节奏组排练","MELODY",["D07-RHYTHM"]),scene(7,"MELODY","activity","旋律组排练","COORDINATE",["D07-MELODY"]),scene(7,"COORDINATE","activity","统筹者沟通与调整","REHEARSAL",["D07-COORDINATE"]),scene(7,"REHEARSAL","activity","五人合排与导演决定","SHOWCASE",["D07-REHEARSAL-ERROR","D07-REHEARSAL-FIX"]),scene(7,"SHOWCASE","activity","原创合作正式展示","EVENING",["D07-SHOWCASE-ALL"]),scene(7,"EVENING","activity","展示后的晚间交流","INTERVIEW",["D07-EVENING"]),scene(7,"INTERVIEW","interview","选择至少两位进行后采","SMS",["D07-INTERVIEW"]),scene(7,"SMS","sms","五人独立选择并发送短信","EDITING"),scene(7,"EDITING","edit","真实素材剪辑","BROADCAST"),scene(7,"BROADCAST","social","EP07正片与观众讨论","COMPLETE"),scene(7,"COMPLETE","complete","本期完成并解锁EP08",undefined)],
  8: [scene(8,"INTRO","story","五人早餐与来信","ORDER",["E08-01-ENSEMBLE-MORNING"]),scene(8,"ORDER","decision","安排五人回忆室顺序","ROOMS",["E08-02-ROOM-INSTRUCTIONS"]),scene(8,"ROOMS","activity","五人独立回忆室探索","LUNCH",ep08RoomClipIds),scene(8,"LUNCH","activity","午间交流","CHOICE_RULE",["E08-04-LUNCH"]),scene(8,"CHOICE_RULE","story","匿名互选规则","CHOICE_SUBMIT",["E08-05-CHOICE-RULES"]),scene(8,"CHOICE_SUBMIT","decision","五位嘉宾独立提交选择","CHOICE_RESULT",["E08-06-CHOICE-SUBMISSION"]),scene(8,"CHOICE_RESULT","activity","真实互选结果","CHOICE_ACTIVITY",["E08-07-MUTUAL-RESULT","E08-07-RAW-CHOICES"]),scene(8,"CHOICE_ACTIVITY","activity","依据互选结果的实际任务","DINNER",["E08-08-CHOICE-ACTIVITY-group-five","E08-08-CHOICE-ACTIVITY-trio-task","E08-08-CHOICE-ACTIVITY-fifth-facilitator"]),scene(8,"DINNER","activity","五人晚餐","INTERVIEW_SELECT",["E08-09-DINNER"]),scene(8,"INTERVIEW_SELECT","decision","安排后采","INTERVIEW"),scene(8,"INTERVIEW","interview","后采","SMS",["E08-10-INTERVIEW-ZZX","E08-10-INTERVIEW-SXH","E08-10-INTERVIEW-ZJ","E08-10-INTERVIEW-ZZY","E08-10-INTERVIEW-ZH"]),scene(8,"SMS","sms","五人心动短信","EDITING"),scene(8,"EDITING","edit","真实素材剪辑","BROADCAST"),scene(8,"BROADCAST","social","正片讨论","COMPLETE"),scene(8,"COMPLETE","complete","本期完成",undefined)],
  9: [scene(9,"NOMINATIONS","decision","匿名任务搭档申请","TASK",["D09-NOMINATIONS"]),scene(9,"TASK","activity","纸桥合作任务","REVEAL",["D09-PAPER-BRIDGE"]),scene(9,"REVEAL","decision","导演选择公布范围","KC09"),scene(9,"KC09","activity","选择原因说明","GROUP",["KC09_EXPLAIN_CHOICE"]),scene(9,"GROUP","activity","五人群像","INTERVIEW"),scene(9,"INTERVIEW","interview","后采","SMS"),scene(9,"SMS","sms","心动短信","EDITING"),scene(9,"EDITING","edit","导演剪辑","BROADCAST"),scene(9,"BROADCAST","social","正片讨论","COMPLETE"),scene(9,"COMPLETE","complete","本期完成",undefined)],
  10: [scene(10,"TRAVEL","story","旅行分组","SUNRISE",["D10-TRAVEL-CAM01"]),scene(10,"SUNRISE","activity","清晨观景","AFTERNOON",["D10-SUNRISE-CAM01"]),scene(10,"AFTERNOON","activity","三人下午探索","KC10",["D10-AFTERNOON-CAM01"]),scene(10,"KC10","activity","露台谈话","REUNION",["KC10_ACKNOWLEDGE_FEAR"]),scene(10,"REUNION","activity","五人晚间重聚","INTERVIEW"),scene(10,"INTERVIEW","interview","后采","SMS"),scene(10,"SMS","sms","心动短信","EDITING"),scene(10,"EDITING","edit","导演剪辑","BROADCAST"),scene(10,"BROADCAST","social","正片讨论","COMPLETE"),scene(10,"COMPLETE","complete","本期完成",undefined)],
  11: [scene(11,"GIFT_RULES","decision","礼物规则","GIFT",["D11-GIFT-RULES"]),scene(11,"GIFT","activity","开箱群像","QUESTIONS",["D11-GIFT-OPENING"]),scene(11,"QUESTIONS","decision","选择三道真心话","KC11",["D11-TRUTH-CARDS"]),scene(11,"KC11","activity","暂停后回来继续谈","INTERVIEW",["KC11_PAUSE_AND_RETURN"]),scene(11,"INTERVIEW","interview","后采","SMS"),scene(11,"SMS","sms","心动短信","EDITING"),scene(11,"EDITING","edit","导演剪辑","BROADCAST"),scene(11,"BROADCAST","social","正片讨论","COMPLETE"),scene(11,"COMPLETE","complete","本期完成",undefined)],
  12: [scene(12,"REQUESTS","decision","提交约会意向","MATCHING",["D12-REQUESTS"]),scene(12,"MATCHING","decision","自愿撮合","DATES"),scene(12,"DATES","activity","最后约会","SOLO",["D12-DATE-CAM01"]),scene(12,"SOLO","activity","未约会者个人活动","DINNER",["D12-SOLO-CAM01"]),scene(12,"DINNER","activity","最后公共晚餐","INTERVIEW"),scene(12,"INTERVIEW","interview","后采","SMS"),scene(12,"SMS","sms","心动短信","EDITING"),scene(12,"EDITING","edit","导演剪辑","BROADCAST"),scene(12,"BROADCAST","social","正片讨论","COMPLETE"),scene(12,"COMPLETE","complete","本期完成",undefined)],
  13: [scene(13,"REVEAL_ORDER","decision","X身份公开顺序","REVEAL",["D13-REVEAL-CAM01"]),scene(13,"REVEAL","activity","正式X公开与个人介绍","LETTER"),scene(13,"LETTER","activity","信件回收","KC13",["KC13_REPAIR_AGREEMENT"]),scene(13,"KC13","activity","棍铲关系修复对谈","GROUP"),scene(13,"GROUP","activity","五人群像","INTERVIEW"),scene(13,"INTERVIEW","interview","后采","SMS"),scene(13,"SMS","sms","心动短信","EDITING"),scene(13,"EDITING","edit","导演剪辑","BROADCAST"),scene(13,"BROADCAST","social","正片讨论","COMPLETE"),scene(13,"COMPLETE","complete","本期完成",undefined)],
  14: [scene(14,"INTERVIEWS","interview","终选前后采","CHOICES",["D14-INTERVIEW-CAM01"]),scene(14,"CHOICES","decision","终选卡","FINALE",["D14-FINAL-CHOICE"]),scene(14,"FINALE","activity","最终选择","FINAL_CUT"),scene(14,"FINAL_CUT","edit","终章剪辑","REPORT",["D14-FINAL-CUT"]),scene(14,"REPORT","complete","终章报告",undefined)],
};
// EP09 is the 10-day V16.4 canon. Keep the old 14-day registry entries
// unavailable to runtime routing while retaining their archived save data.
flows[9]=[
 scene(9,"INTRO","story","清晨集合与旅行任务卡","TRAVEL_ASSIGN",["E09_C01_DEPART"]),
 scene(9,"TRAVEL_ASSIGN","decision","两组旅行与独行分配","TRAVEL_PLAY",["E09_C02_ASSIGN"]),
 scene(9,"TRAVEL_PLAY","activity","十组旅行对白、日出与独行","RETURN",["E09_C03_PAIR","E09_C03_SOLO"]),
 scene(9,"RETURN","activity","归来早餐","GIFT_RULE",["E09_C06_REUNION"]),
 scene(9,"GIFT_RULE","decision","三种礼物机制","GIFT_PLAY",["E09_C07_GIFT_RULE"]),
 scene(9,"GIFT_PLAY","activity","五份礼物与拆礼反应","FINAL_DATE_RULE",["E09_C08_GIFT"]),
 scene(9,"FINAL_DATE_RULE","story","最后约会邀请规则","INVITES",["E09_C09_DATE_RULE"]),
 scene(9,"INVITES","decision","五人邀请及接受结果","FINAL_DATE_PLAY",["E09_C10_INVITES"]),
 scene(9,"FINAL_DATE_PLAY","activity","最后约会与独立活动","TRUTH",["E09_C11_DATE","E09_C11_SOLO"]),
 scene(9,"TRUTH","activity","晚餐与两道真心话","INTERVIEW",["E09_C12_TRUTH"]),
 scene(9,"INTERVIEW","interview","选择至少两位进行后采","SMS",["E09_C13_INTERVIEW"]),
 scene(9,"SMS","sms","五人匿名心动短信","EDITING"),
 scene(9,"EDITING","edit","EP09真实素材剪辑与播出","COMPLETE",["E09_C15_BROADCAST"]),
 scene(9,"COMPLETE","complete","本期完成并解锁EP10",undefined,["E09_C16_OUTRO"]),
];

export const canonicalV13Episodes: V13Episode[] = Object.entries(flows).map(([episode, scenes]) => ({ episode:Number(episode), title:["","","","","你在看谁","第二次选择","关于你，我还不知道","过去留下的东西","没说出口的话","这次换我走向你"][Number(episode)] ?? "", scenes }));
export const v13DeprecatedSceneAliases: Record<string,string> = {
  "D05-NIGHT-KC":"EP05-KC05", "D05-NIGHT-JY":"EP05-INTERVIEW", "D05-NIGHT-JH":"EP05-INTERVIEW",
  "D05-KC-NIGHT":"EP05-EDITING", "KC-NIGHT-05":"EP05-EDITING",
  "D06-KC-NIGHT":"EP06-EDITING", "KC-NIGHT-06":"EP06-EDITING", "D06-POST-SMS":"EP06-EDITING",
  "D07-KC-NIGHT":"EP07-EDITING", "D08-KC-NIGHT":"EP08-EDITING", "D09-KC-NIGHT":"EP09-EDITING",
  "D07-PROFILE":"EP07-PROFILE_SHOW", "D07-ROLES":"EP07-ASSIGN", "D07-PERFORMANCE":"EP07-SHOWCASE", "D07-EXCHANGE":"EP07-EVENING",
  "D10-KC-NIGHT":"EP10-EDITING", "D11-KC-NIGHT":"EP11-EDITING", "D12-KC-NIGHT":"EP12-EDITING",
  "D07-POST-SMS":"EP07-EDITING", "D08-POST-SMS":"EP08-EDITING", "D09-POST-SMS":"EP09-EDITING",
  "D10-POST-SMS":"EP10-EDITING", "D11-POST-SMS":"EP11-EDITING", "D12-POST-SMS":"EP12-EDITING",
  "D13-KC-NIGHT":"EP13-EDITING", "D14-KC-NIGHT":"EP14-FINAL_CUT",
  "D13-POST-SMS":"EP13-EDITING", "D14-POST-SMS":"EP14-FINAL_CUT",
};
export function v13SceneFor(episode:number, stage:string):V13Scene|undefined { return canonicalV13Episodes.find(row=>row.episode===episode)?.scenes.find(item=>item.id===`EP${String(episode).padStart(2,"0")}-${stage}`); }
export function resolveV13Stage(episode:number,state:Record<string,unknown>):string {
  const flow=canonicalV13Episodes.find(row=>row.episode===episode)?.scenes??[]; if(!flow.length)return "";
  const phase=String(state.phase??"");
  if(phase==="complete")return "COMPLETE";
  if(episode===6&&typeof state.ep06Stage==="string")return state.ep06Stage;
  if(episode===8){const stage=String(state.v16Phase??"");if(flow.some(item=>item.id===`EP08-${stage}`))return stage;if(state.broadcastId)return "BROADCAST";if(state.sent===true)return "EDITING";return "INTRO";}
  if(episode===7){
    if(state.broadcastId||phase==="social")return "BROADCAST";
    const done=new Set(Array.isArray(state.ep07CompletedSceneIds)?state.ep07CompletedSceneIds as string[]:[]);
    const clips=Array.isArray(state.ep07RecordedClips)?state.ep07RecordedClips as {id?:string}[]:[];
    const ids=new Set(clips.map(c=>String(c.id??"")));
    if(ids.has("D07-BREAKFAST"))done.add("D07-001");
    if(["ZZX","SXH","ZJ","ZZY","ZH"].every(id=>ids.has("D07-PROFILES-"+id)))done.add("D07-002");
    if(state.sent===true){
      if(!done.has("D07-001"))return "INTRO";
      if(!done.has("D07-002"))return Array.isArray(state.profileOrder)&&state.profileOrder.length===5?"PROFILE_SHOW":"PROFILE_ORDER";
      if(!state.rolePlan)return "ASSIGN";
      const performances=state.ep07GroupFirst==="MELODY_FIRST"?["MELODY","RHYTHM"]:["RHYTHM","MELODY"];
      for(const stage of [...performances,"COORDINATE","REHEARSAL","SHOWCASE","EVENING","INTERVIEW"]){const key=({RHYTHM:"D07-004",MELODY:"D07-005",COORDINATE:"D07-006",REHEARSAL:"D07-007",SHOWCASE:"D07-008",EVENING:"D07-009",INTERVIEW:"D07-010"} as Record<string,string>)[stage];if(!done.has(key))return stage;}
      return "EDITING";
    }
    if(typeof state.ep07Stage==="string")return state.ep07Stage;
  }
  if(state.broadcastId||phase==="social")return "BROADCAST";
  if(phase==="edit")return episode===14?"FINAL_CUT":"EDITING";
  if(["kcnight","postsms","postsmscene","nightfootage"].includes(phase.toLowerCase().replace(/[^a-z]/g,"")))return state.sent===true?(episode===14?"FINAL_CUT":"EDITING"):"SMS";
  if(state.sent===true)return episode===14?"FINAL_CUT":"EDITING";
  if(state.sent||phase==="sms")return "SMS";
  if(phase==="interview")return episode===14?"INTERVIEWS":"INTERVIEW";
  const current=String(state.v13SceneId??""); if(flow.some(item=>item.id===current))return current.slice(5);
  // Legacy generic night scenes are not part of V13. An already delivered SMS must
  // resume at the editor; no history or relationship data is touched.

  if(phase==="decision")return ({6:"PAIRING",7:"ROLES",8:"EXPLORE",9:"NOMINATIONS",11:"GIFT_RULES",12:"REQUESTS",13:"REVEAL_ORDER",14:"CHOICES"} as Record<number,string>)[episode]??"INTRO";
  if(phase==="activity")return ({6:"DATE1",7:"REHEARSAL",8:"EXPLORE",9:"TASK",10:"SUNRISE",11:"GIFT",12:"DATES",13:"REVEAL"} as Record<number,string>)[episode]??"INTRO";
  return flow[0].id.slice(5);
}
export function nextV13Stage(episode:number,stage:string):string|undefined { return v13SceneFor(episode,stage)?.next; }
export function isValidPairing(groups:GuestId[][]):boolean { const all=groups.flat(); return all.every(id=>["ZZX","SXH","ZJ","ZZY","ZH"].includes(id)) && new Set(all).size===all.length; }
export function migrateLegacyV13EpisodeState<T extends Record<string,unknown>>(episode:number,state:T):T {
  if(episode<5)return state;
  const frozen=state.smsFrozen&&typeof state.smsFrozen==="object"&&Object.keys(state.smsFrozen as object).length>0;
  const delivered=state.sent===true||Boolean(frozen)||state.ep05SmsCompleted===true;
  const normalizedPhase=String(state.phase??"").toLowerCase().replace(/[^a-z]/g,"");
  const legacyForcedPhase=["kcnight","postsms","postsmscene","nightfootage"].includes(normalizedPhase);
  const legacyScene=String(state.v13SceneId??state.currentSceneId??"");
  const oldForcedNight=legacyScene.includes("KC-NIGHT")||legacyScene.includes("POST-SMS")||legacyScene.includes("POST_SMS");
  if(!(oldForcedNight||legacyForcedPhase||state.phase==="sms"&&delivered))return state;
  const progress=state.interviewProgress&&typeof state.interviewProgress==="object"?state.interviewProgress as Record<string,{finished?:boolean}>:{};
  const interviews=Array.isArray(state.interviews)?state.interviews as string[]:[];
  const interviewsDone=interviews.length>0&&interviews.every(id=>progress[id]?.finished===true);
  const nextPhase=delivered?"edit":legacyForcedPhase||oldForcedNight?"sms":interviewsDone?"sms":"interview";
  const stage=episode===14&&delivered?"FINAL_CUT":nextPhase==="edit"?"EDITING":nextPhase.toUpperCase();
  return {...state,phase:nextPhase,auto:false,...(episode===14&&nextPhase==="sms"?{}:{v13SceneId:`EP${String(episode).padStart(2,"0")}-${stage}`}),v13Migration:{from:String(state.phase??legacyScene),to:nextPhase,completedAt:Date.now()}} as T;
}
