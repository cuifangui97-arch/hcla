import { useEffect, useRef, useState } from "react";
import { ArrowRight, LockKeyhole, Send } from "lucide-react";
import type { Item, Runtime, UiValue, Work } from "../schema";
import type { SkinProps } from "../AppSkins";
import { GuestAvatar } from "../game/GuestAvatar";
import { SceneChatStream } from "./SceneChatStream";
import { deriveKcSmsOutcome, kcEmotionalReaction, kcNightEventId, kcNightClipId, kcSmsFlagsFromDeliveries, type KcNightPlace, type KcSmsOutcome } from "../game/kc-night";
import { KcNightExperience } from "./KcNightExperience";
import { selectSms, selectSmsBatch, smsSemanticEvents, smsUsageFromGameUi, type FrozenSms } from "../game/sms-corpus";
import { DirectorCutRoom, type CutClip, type CutDraft, type CutStyle } from "./DirectorCutRoom";
import { assignAnonymousCodes, createAnonymousChatScript, type AnonymousCode, type ChatTopic } from "../game/anonymous-chat";
import { interviewConditional, interviewFor, interviewLines, type InterviewProgress } from "../game/interviews";
import { InterviewExperience } from "./InterviewExperience";
import { episode2Breakfast, dayTwoShoppingDialogue, dayThreeDateDialogue, episode2Morning, guestLabel } from "../game/episodes-2-3";
import { assets, formalXPairs, guests, getXNoticeForInbox, readSavedRelationshipHistory, type GuestId, type SceneScript, type ScriptLine } from "../game/day1-data";
import "./day-one.css";

type EpisodeProps = SkinProps & { state: Runtime; work:Work; onAction?: (event:string,target:string)=>void };
const l = (speaker:ScriptLine["speaker"],text:string,mood?:string):ScriptLine=>({speaker,text,mood});
const S = (text:string):ScriptLine=>l("STAGE",text);

export type Ep23State = {
  episode: 2|3; step: string; line: number; choices: Record<string,string>; eventHistory: string[];
  shoppingPair: GuestId[]; tidyPair: GuestId[]; freeGuest: GuestId; freeViewed: string[]; freeCamera: string;
  chatMode: ""|"pair"|"group"|"question"; chatPair: GuestId[]; chatQuestion: string; chatAliases?: Partial<Record<GuestId,AnonymousCode>>;
  interviewGuests: GuestId[]; interviewIndex: number; interviewQuestion: string; interviewAnswers: Record<string,string>; interviewProgress?:Partial<Record<GuestId,InterviewProgress>>;
  datePairs: GuestId[][]; stayHome: GuestId; dateLocations: string[]; dateScene: number; focus: string; nightPair: string;
  smsTargets: Partial<Record<GuestId,GuestId>>; smsLocked: GuestId[]; smsSent: boolean;
  smsFrozen?: Partial<Record<GuestId,FrozenSms>>;
  zhuzhixinSentToSuxinhao: boolean; suxinhaoSentToZhuzhixin: boolean; kcSmsOutcome: KcSmsOutcome|""; kcEmotionalReaction: string;
  kcNightConversationViewed: boolean; kcNightConversationAired: boolean; kcNightPlace: KcNightPlace; kcNightProgress: Partial<Record<KcNightPlace,number>>;
  clips: string[]; cut: string; airedClips: string[]; clipOrder?: string[]; editStage?: 1|2|3; previewState?: { seenClipIds:string[]; entered:boolean }; broadcastId?:string; publishedAt?:number; socialVisited: string[]; completed: boolean;
  playbackStatus: Record<string,"playing"|"paused"|"complete">;
};
const fresh = (episode: 2|3): Ep23State => ({ episode, step: episode===2?"morning":"rules", line:0, choices:{}, eventHistory:[], shoppingPair:[], tidyPair:[], freeGuest:"" as GuestId, freeViewed:[], freeCamera:"", chatMode:"", chatPair:[], chatQuestion:"你会和分手的人重新开始吗？", chatAliases:{}, interviewGuests:[], interviewIndex:0, interviewQuestion:"Q1", interviewAnswers:{}, datePairs:[], stayHome:"" as GuestId, dateLocations:["咖啡馆","陶艺工作室"], dateScene:0, focus:"", nightPair:"", smsTargets:{}, smsLocked:[], smsSent:false, zhuzhixinSentToSuxinhao:false, suxinhaoSentToZhuzhixin:false, kcSmsOutcome:"", kcEmotionalReaction:"", kcNightConversationViewed:false, kcNightConversationAired:false, kcNightPlace:"客厅", kcNightProgress:{}, clips:[], cut:"", airedClips:[],clipOrder:[],editStage:1,previewState:{seenClipIds:[],entered:false},socialVisited:[], completed:false,playbackStatus:{} });
const parse = (v: UiValue|undefined): Ep23State|undefined => { if(typeof v!=="string")return; try { const x=JSON.parse(v) as Ep23State; return x && (x.episode===2||x.episode===3)?{...fresh(x.episode),...x,playbackStatus:x.playbackStatus??{}}:undefined; } catch { return; } };
const K = (a: GuestId,b: GuestId) => [a,b].sort().join("-");
const hashPair = (s:string) => {let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
const names = (ids: GuestId[]) => ids.map((id)=>guestLabel[id]).join(" × ");
const venueOptions = ["咖啡馆","陶艺工作室","唱片店","公园散步"];
const questions = ["你会和分手的人重新开始吗？","你觉得喜欢与习惯有什么区别？","如果有人记得你的生活习惯，你会开心吗？"];
const topicFor = (question:string):ChatTopic => question===questions[1]?"like-or-habit":question===questions[2]?"remember-habits":"restart";
const interviewAnswerByGuest: Record<GuestId,string> = { ZZX:"今天我先听大家把话说完，不想因为一个瞬间就替谁下结论。", SXH:"早上一起准备早餐挺自然的。我更在意大家有没有把自己的需要说出来。", ZJ:"住进来以后才发现，找东西和分工也能聊出不少内容。", ZZY:"我记住了几件小事，但还想多看看大家接下来怎么相处。", ZH:"今天相处比想象中放松一些，关系的事我会慢慢想。" };
const interviewQuestionsByEpisode:Record<2|3,string[]>={2:["今天有没有发现谁和你想象中不一样？","你会因为一个人的生活习惯想到过去吗？","你期待明天的第一次约会吗？"],3:["今天和谁在一起最自在？","有没有某个时刻想起过去？","你希望明天还能继续了解谁？","如果自己的X和别人约会，你会介意吗？"]};
const ids: GuestId[] = guests.map((g)=>g.id);

function useEp23(p: EpisodeProps, episode: 2|3) {
  const storageKey = `episode${episode}`;
  const saved = parse(p.gameUi?.[storageKey]);
  const state = saved?.episode===episode
    ? episode===2&&saved.smsSent&&saved.step==="kcNight"?{...saved,step:"edit",line:0}:saved
    : fresh(episode);
  const save = (next: Ep23State) => p.onGameUi?.(storageKey,JSON.stringify(next));
  const aliasSeed=String(p.state.variables.gameSeed??p.work.id);
  useEffect(()=>{if(state.step==="chat"&&state.chatMode&&Object.keys(state.chatAliases??{}).length!==5)save({...state,chatAliases:assignAnonymousCodes(aliasSeed)});},[episode,state.step,state.chatMode,state.chatAliases,aliasSeed]);
  useEffect(()=>{ if(!saved || saved.episode!==episode) save(fresh(episode)); },[episode]);
  // Old EP02 saves used the post-SMS KC night scene. Resume them at editing
  // without replaying or resending SMS; preserve all historical event data.
  useEffect(()=>{if(episode===2&&saved?.step==="kcNight"&&saved.smsSent)save({...saved,step:"edit",line:0});},[episode,saved?.step,saved?.smsSent]);
  return {state,save};
}

function TopHeader({label,title,sub}:{label:string;title:string;sub:string}) { return <header className="d1-header"><small>{label}</small><div><h1>{title}</h1><p>{sub}</p></div></header>; }
function ScriptPanel({p,state,save,scene,onFinished,anonymous=false,chatMode,chatAliases}:{p:EpisodeProps;state:Ep23State;save:(s:Ep23State)=>void;scene:SceneScript;onFinished:()=>void;anonymous?:boolean;chatMode?:Ep23State["chatMode"];chatAliases?:Partial<Record<GuestId,AnonymousCode>>}) {
  const auto=state.playbackStatus[scene.id]==="playing"; const line=scene.lines[Math.min(state.line,scene.lines.length-1)];
  const previousScene=useRef(scene.id);
  const setAuto=(playing:boolean)=>save({...state,playbackStatus:{...state.playbackStatus,[scene.id]:playing?"playing":"paused"}});
  useEffect(()=>{const previous=previousScene.current;if(previous!==scene.id){if(state.playbackStatus[previous]==="playing")save({...state,playbackStatus:{...state.playbackStatus,[previous]:"paused"}});previousScene.current=scene.id;}},[scene.id]);
  const asset=assets[scene.background as keyof typeof assets];
  const monitorBackground=asset?`linear-gradient(0deg,#16151bc2,#24212b48),url("${asset}")`:scene.background==="supermarket"?"linear-gradient(90deg,#ddd5c6 0 8%,#899183 8% 11%,#d9d3c6 11% 32%,#777c6d 32% 35%,#d5cec1 35% 61%,#818879 61% 64%,#d7cfc1 64%),linear-gradient(0deg,#534b41,#bbb2a2)":"linear-gradient(135deg,#e9d9ca,#a39c93 48%,#776f72)";
  useEffect(()=>{ if(!auto)return; const wait=Math.min(5000,Math.max(1600,1000+line.text.length*60+(line.speaker==="STAGE"?700:0))); const id=window.setTimeout(()=>advance(),wait);return()=>window.clearTimeout(id); },[auto,state.line,scene.id]);
  const advance=()=>{ if(state.line<scene.lines.length-1)save({...state,line:state.line+1,playbackStatus:{...state.playbackStatus,[scene.id]:auto?"playing":"paused"}});else onFinished(); };
  const anonName=(speaker:GuestId)=>`@${chatAliases?.[speaker]??assignAnonymousCodes(String(p.state.variables.gameSeed??p.work.id))[speaker]}`;
  const participants=chatMode==="pair"?state.chatPair:ids;
  return <div className="d1-camera-app"><TopHeader label={`TOP · CAM · EP.0${state.episode}`} title={scene.title} sub={`${scene.time} · ${scene.place} · ${scene.id}`}/><div className="d1-monitor" style={{backgroundImage:monitorBackground}}><div className="d1-monitor-top"><span><i/> REC · {scene.id}</span><time>{scene.time}</time></div><div className="d1-monitor-badge">{scene.place}<b>{scene.title}</b></div>{anonymous?chatMode==="question"?<div className="d1-anon-participants">5 份独立匿名回答</div>:<div className="d1-anon-participants">本轮参与：{participants.map(id=>anonName(id)).join(" · ")}</div>:<div className="d1-guests">{guests.map(g=><div className="d1-guest" key={g.id}><GuestAvatar id={g.id} className="d1-guest-photo"/><small>{g.name}</small></div>)}</div>}<div className="d1-monitor-bottom"><span>TOP节目组 · {anonymous?"身份映射加密":"公共机位"}</span><span>DAY {state.episode}</span></div></div><SceneChatStream sceneId={scene.id} rows={scene.lines} shownCount={state.line+1} auto={auto} label={anonymous?scene.title:"现场连续记录"} anonymous={anonymous} anonymousDisplayName={anonName} presentation={anonymous&&chatMode==="question"?"answers":"conversation"} speakerName={(speaker)=>guestLabel[speaker]}/><div className="d1-player-bar"><button onClick={()=>setAuto(!auto)}>{auto?"暂停":"自动播放"}</button><button onClick={advance}>{state.line===scene.lines.length-1?"进入下一场景":"下一条"}<ArrowRight size={15}/></button><button onClick={p.onBack}>返回桌面</button></div></div>;
}

function choosePair(selected:GuestId[],id:GuestId,limit=2) { return selected.includes(id)?selected.filter((x)=>x!==id):selected.length<limit?[...selected,id]:selected; }
export function normalizeDatePairs(datePairs:GuestId[][]):[GuestId[],GuestId[]] {
  const first=(datePairs[0]??[]).filter((id,index,list)=>ids.includes(id)&&list.indexOf(id)===index).slice(0,2);
  const remaining=ids.filter(id=>!first.includes(id));
  const second=(datePairs[1]??[]).filter((id,index,list)=>remaining.includes(id)&&list.indexOf(id)===index).slice(0,2);
  return [first,second];
}
function Mission({p,state,save}:{p:EpisodeProps;state:Ep23State;save:(s:Ep23State)=>void}) {
  const [assign,setAssign]=useState<Record<string,string>>(state.choices);
  const commit=(next:Partial<Ep23State>,step:string,app="camera")=>{save({...state,...next,step,line:0});p.onNavigate?.(app);};
  if(state.step==="shoppingSetup"){
    const setRole=(id:GuestId,role:string)=>setAssign({...assign,[id]:role});
    const counts=(role:string)=>Object.values(assign).filter(x=>x===role).length;
    const valid=ids.every(id=>assign[id])&&counts("采购")===2&&counts("整理")===2&&counts("自由")===1;
    return <div className="d1-flow-card"><TopHeader label="10:00 · DIRECTOR DECISION" title="小屋采购清单" sub="指定两人采购、两人整理、一人自由活动；五个人各占一个位置。"/><div className="d1-role-list">{guests.map(g=><section className="d1-role-row" key={g.id}><GuestAvatar id={g.id} className="d1-bubble-avatar"/><strong>{g.name}</strong><div>{["采购","整理","自由"].map(r=><button key={r} className={assign[g.id]===r?"selected":""} onClick={()=>setRole(g.id,r)}>{r}</button>)}</div></section>)}</div><p>采购：{ids.filter(id=>assign[id]==="采购").map(x=>guestLabel[x]).join("、")||"待指定"} 整理：{ids.filter(id=>assign[id]==="整理").map(x=>guestLabel[x]).join("、")||"待指定"}</p><button className="d1-primary" disabled={!valid} onClick={()=>{const buy=ids.filter(id=>assign[id]==="采购"),tidy=ids.filter(id=>assign[id]==="整理"),free=ids.find(id=>assign[id]==="自由")!;commit({choices:{...state.choices,...assign,ep2Shopping:buy.join("-"),ep2ShoppingAssignment:buy.join("-"),ep2Tidy:tidy.join("-"),ep2Free:free},shoppingPair:buy,tidyPair:tidy,freeGuest:free,eventHistory:[...state.eventHistory,"D02-003"]},"shopping");p.onAction?.("director:mission","D2");}}>确认任务安排</button></div>;
  }
  if(state.step==="chatSetup") return <div className="d1-flow-card"><TopHeader label="20:30 · ANONYMOUS ROOM" title="匿名聊天室规则" sub="匿名身份只在本场显示；同一轮代号固定，真实映射对嘉宾与观众保密。"/><div className="d1-cut-list">{[["pair","随机双人匿名聊天"],["group","五人匿名群聊"],["question","匿名提问箱"]].map(([id,label])=><button className={state.chatMode===id?"on":""} key={id} onClick={()=>{const seed=String(p.state.variables.gameSeed??p.work.id);const pair=ids.slice().sort((a,b)=>hashPair(`${seed}:${a}`)-hashPair(`${seed}:${b}`)).slice(0,2);save({...state,chatMode:id as Ep23State["chatMode"],chatAliases:Object.keys(state.chatAliases??{}).length===5?state.chatAliases:assignAnonymousCodes(seed),chatPair:id==="pair"?(state.chatPair.length===2?state.chatPair:pair):state.chatPair})}}><span>{label}</span><small>{id==="pair"?"仅两位嘉宾进入独立私聊，匿名代号轮流回应":id==="group"?"五位嘉宾围绕导演选定的话题连续交流":"五份互不串联的匿名书面回答"}</small></button>)}</div>{state.chatMode==="pair"&&<p className="inline-note">本轮只会显示两位匿名代号，不显示嘉宾姓名。</p>}{state.chatMode!==""&&<label className="d1-chat-topic">本轮话题<select value={state.chatQuestion||questions[0]} onChange={e=>save({...state,chatQuestion:e.target.value})}>{questions.map(q=><option key={q}>{q}</option>)}</select></label>}<button className="d1-primary" disabled={!state.chatMode||(state.chatMode==="pair"&&state.chatPair.length!==2)} onClick={()=>{const aliases=Object.keys(state.chatAliases??{}).length===5?state.chatAliases:assignAnonymousCodes(String(p.state.variables.gameSeed??p.work.id));commit({chatAliases:aliases,choices:{...state.choices,ep2AnonymousChatMode:state.chatMode},eventHistory:[...state.eventHistory,"D02-007"]},"chat");p.onAction?.("director:mission","D2")}}>开启匿名聊天室 <ArrowRight size={16}/></button></div>;
  if(state.step==="interviewSetup") return <InterviewSelector p={p} state={state} save={save} commit={commit}/>;
  if(state.step==="dateSetup"){
    const [first,second]=normalizeDatePairs(state.datePairs);const remaining=ids.filter(id=>!first.includes(id));
    const setFirst=(id:GuestId)=>{const nextFirst=choosePair(first,id);const nextRemaining=ids.filter(x=>!nextFirst.includes(x));save({...state,datePairs:[nextFirst,second.filter(x=>nextRemaining.includes(x))]});};
    const setSecond=(id:GuestId)=>save({...state,datePairs:[first,choosePair(second,id)]});
    const stay=ids.find(id=>!first.includes(id)&&!second.includes(id));
    const valid=first.length===2&&second.length===2&&first.every(id=>!second.includes(id))&&!!stay;
    return <div className="d1-flow-card"><TopHeader label="09:00 · DIRECTOR DATE PLAN" title="第一次正式约会" sub="安排两组双人约会和一位留守嘉宾；每人最多参加一场。"/><h3>第一组 · {first.length}/2</h3><div className="d1-role-list">{guests.map(g=><button key={g.id} className={first.includes(g.id)?"selected":""} onClick={()=>setFirst(g.id)} disabled={first.length===2&&!first.includes(g.id)}>{g.name}</button>)}</div>{first.length===2&&<><h3>第二组 · 从其余三人中选择两位</h3><div className="d1-role-list">{remaining.map(id=><button key={id} className={second.includes(id)?"selected":""} onClick={()=>setSecond(id)} disabled={second.length===2&&!second.includes(id)}>{guestLabel[id]}</button>)}</div></>}<div className="d1-date-location">{[0,1].map(i=><label key={i}>第{i+1}组地点<select value={state.dateLocations[i]} onChange={e=>{const next=[...state.dateLocations];next[i]=e.target.value;save({...state,dateLocations:next})}}>{venueOptions.map(x=><option key={x}>{x}</option>)}</select></label>)}</div>{stay&&<p>留守小屋：<b>{guestLabel[stay]}</b></p>}<button className="d1-primary" disabled={!valid} onClick={()=>commit({stayHome:stay!,choices:{...state.choices,ep3DatePairs:JSON.stringify([first,second]),ep3StayHome:stay!,ep3DateLocations:state.dateLocations.join("|")},eventHistory:[...state.eventHistory,"D03-002"]},"date1")}>确认约会安排并录制 <ArrowRight size={16}/></button></div>;
  }
  if(state.step==="focusSetup")return <div className="d1-flow-card"><TopHeader label="18:30 · DIRECTOR DECISION" title="晚间集合" sub="五人回到小屋，选择今晚的观察重点。"/><div className="d1-cut-list">{[["date1","追问第一组约会"],["date2","追问第二组约会"],["free","让大家自由聊天"],["truth","发布一个真心话问题"]].map(([id,label])=><button className={state.focus===id?"on":""} key={id} onClick={()=>save({...state,focus:id})}><span>{label}</span></button>)}</div><button className="d1-primary" disabled={!state.focus} onClick={()=>{const index=state.focus==="date2"?1:0;const pair=state.datePairs[index]??[];const key=pair.length===2?K(pair[0],pair[1]):"";const nightPair=state.focus==="free"||state.focus==="truth"?"GROUP":key==="SXH-ZZX"?"GC":key==="ZJ-ZZY"?"JY":key==="ZH-ZJ"?"JH":key==="ZH-ZZY"?"MH":"GROUP";commit({nightPair,eventHistory:[...state.eventHistory,"D03-006"]},"night")}}>确定观察重点</button></div>;
  return <div className="d1-flow-card"><TopHeader label={`EP.0${state.episode} · MISSION`} title="导演任务" sub="所有安排保存后与CAM、素材库、匿名短信及已播舆论同步。"/><p>当前拍摄阶段：{stageName[state.step]??state.step}</p><button className="d1-primary" onClick={()=>p.onNavigate?.("camera")}>回到监控 <ArrowRight size={17}/></button></div>;
}

function InterviewSelector({p:_p,state,save,commit}:{p:EpisodeProps;state:Ep23State;save:(s:Ep23State)=>void;commit:(next:Partial<Ep23State>,step:string,app?:string)=>void}) {
  return <div className="d1-flow-card"><TopHeader label={`21:30 · EP.0${state.episode} INTERVIEW`} title="导演选择后采嘉宾" sub={`只为实际选择并完成采访的嘉宾生成素材。已选：${state.interviewGuests.length}/2`}/><div className="d1-role-list">{guests.map(g=><button key={g.id} className={state.interviewGuests.includes(g.id)?"selected":""} disabled={state.interviewGuests.length===2&&!state.interviewGuests.includes(g.id)} onClick={()=>save({...state,interviewGuests:choosePair(state.interviewGuests,g.id)})}><GuestAvatar id={g.id} className="d1-bubble-avatar"/>{g.name} {state.interviewGuests.includes(g.id)?"已选择":"选择"}</button>)}</div><button className="d1-primary" disabled={state.interviewGuests.length!==2} onClick={()=>commit({eventHistory:[...state.eventHistory,`D0${state.episode}-008`]} ,"interview","mail")}>开始采访</button></div>;
}

const stageName:Record<string,string>={morning:"清晨厨房",breakfast:"早餐",shoppingSetup:"采购分工",shopping:"超市采购",tidy:"小屋整理",free:"下午自由活动",dinner:"晚餐群像",chatSetup:"匿名聊天室规则",chat:"匿名聊天室",interviewSetup:"后采选择",interview:"单人后采",rules:"约会规则公开",dateSetup:"导演安排约会",date1:"第一组约会",date2:"第二组约会",stay:"留守嘉宾",reunion:"晚间集合",focusSetup:"导演选择观察重点",night:"夜晚私人谈话",sms:"心动短信",edit:"剪辑室",social:"观众讨论",complete:"本期录制完成"};

function episodeOneAiredKitchen(p:EpisodeProps) {
  const raw=p.gameUi?.day1;
  if(typeof raw!=="string")return false;
  try { const d=JSON.parse(raw) as {eventStatus?:Record<string,{aired?:boolean}>;selectedClips?:string[]};return Boolean(d.eventStatus?.["CLIP_D01_TOMATO"]?.aired||d.eventStatus?.["D01-KITCHEN"]?.aired||d.selectedClips?.includes("CLIP_D01_TOMATO")); } catch { return false; }
}
function ep1KitchenPairWasJY(p:EpisodeProps){
  const raw=p.gameUi?.day1;if(typeof raw!=="string")return false;
  try{const d=JSON.parse(raw) as {roles?:Record<string,string>};return d.roles?.ZJ==="主厨"&&d.roles?.ZZY==="主厨";}catch{return false;}
}
function dinnerLines():ScriptLine[]{return [l("ZJ","你们想去哪儿？"),l("ZH","我都行。"),l("ZZY","你怎么也都行？"),l("ZH","那我想去看日出。"),l("ZJ","明天早上？"),l("ZH","也不一定非得明天。"),l("SXH","日出可能要起很早。"),l("ZZX","那确实挺早的。"),S("张泽禹把左航说的“日出”记进了导演组观察记录。")];}
function freeLines(camera:string,mode:string):ScriptLine[]{
  if(camera==="客厅")return [S("15:00 · 张极和左航把采购回来的东西分门别类。"),l("ZJ","航酱，这个放哪儿？"),l("ZH","你都拿进来了还不知道？"),l("ZJ","这不是在请教你。"),l("ZH","柜子第二层。"),l("ZJ","收到。")];
  if(camera==="厨房")return [S("15:00 · 朱志鑫试着准备饮料，苏新皓在旁边整理杯子。"),l("SXH","你是不是放多了？"),l("ZZX","我还没倒完。"),l("SXH","好好好。"),l("ZZX","你能不能让我自己弄。"),S("苏新皓停了一下，没有继续说。"),l("SXH","行，你来。")];
  return [S("15:00 · 阳台门开了一条缝，张泽禹和左航先后走出来。"),l("ZZY","昨天晚上还挺冷的。"),l("ZH","你不是穿了外套？"),l("ZZY","你观察这么仔细？"),l("ZH","昨天大家都在客厅。"),...(mode==="D"?[S("左航像是想起以前也在类似的傍晚等过一句解释，张泽禹没有追问。"),l("ZZY","我开玩笑的。"),l("ZH","我知道。")]:[S("左航望向院子，话题短暂停住。"),l("ZZY","我开玩笑的。"),l("ZH","我知道。")])];
}
function nightLines(state:Ep23State,mode:string):ScriptLine[]{
  const pair=state.nightPair;
  if(pair==="GC")return [S("20:00 · 客厅里只剩一盏落地灯。"),l("SXH","今天怎么样？"),l("ZZX","挺好的。"),l("SXH","嗯。"),l("ZZX","你呢？"),l("SXH","也还好。"),S("两个人都没有急着填满沉默。"),l("ZZX","那就好。")];
  if(pair==="JY")return [S("20:00 · 两个人在餐桌边收拾约会用品。"),l("ZJ","今天回来感觉像出门很久一样。"),l("ZZY","不就一天？"),l("ZJ","你不懂。"),l("ZZY","你也没说。"),S(mode==="A"||mode==="E"?"张泽禹没有追问，给他留出把话说完的时间。":"张泽禹看了他一眼，没有把玩笑接下去。"),l("ZJ","我想再想一会儿。"),l("ZZY","行。")];
  if(pair==="JH")return [S("20:00 · 左航把杯子放回柜子，张极靠在门边。"),l("ZJ","今天是不是挺累？"),l("ZH","还好。"),l("ZJ","你说还好，我就不知道该不该继续问。"),l("ZH","那就先别问。"),S(mode==="B"?"张极点点头，谨慎地退开半步。":mode==="E"?"两人都记得一些没有说清的事，但谁也没把它叫成一段关系。":"张极笑了一下，把话题转去明天的安排。"),l("ZJ","好，听你的。"),l("ZH","谢谢。")];
  if(pair==="GROUP")return [S("20:00 · 导演选择让五个人自由聊聊今天的约会。"),l("ZJ","今天回来感觉像出门很久一样。"),l("ZZY","不就一天？"),l("SXH","你们这组去哪儿了？"),l("ZH","走了一圈，后来坐下来聊了会儿。"),l("ZZX","听起来挺充实。"),S("大家把话题留在当天发生的事情上，没有替任何人解释心情。")];
  return [S("20:00 · 张泽禹把水杯递给左航。"),l("ZZY","你今天选的地方挺好。"),l("ZH","你喜欢就好。"),l("ZZY","你怎么知道我喜欢？"),l("ZH","猜的。"),S(mode==="D"?"两人想起同一段旧时光，谁都没有先提那件事。":"这句话听起来像普通的体贴，也可以是更特别的关心。"),l("ZZY","那你猜得还挺准。"),l("ZH","下次你来选。")];
}
function sceneFor(p:EpisodeProps,s:Ep23State):SceneScript {
  if(s.episode===2){
    if(s.step==="morning")return{id:"D02-001",title:"小屋清晨",time:"08:00",place:"厨房",background:"kitchen",lines:episode2Morning(ep1KitchenPairWasJY(p))};
    if(s.step==="breakfast")return{id:"D02-002",title:"早餐与生活习惯",time:"08:30",place:"餐厅",background:"diningRoom",lines:episode2Breakfast(episodeOneAiredKitchen(p))};
    if(s.step==="shopping")return{id:"D02-004",title:"小屋采购清单",time:"11:00",place:"超市",background:"supermarket",lines:dayTwoShoppingDialogue(s.shoppingPair[0],s.shoppingPair[1],String(p.state.variables.gameMode??"A"))};
    if(s.step==="tidy")return{id:"D02-004B",title:"小屋整理",time:"11:30",place:"小屋",background:"livingRoom",lines:[S(`${names(s.tidyPair)}留在小屋整理收纳。`),l(s.tidyPair[0],"清单先贴冰箱侧面，大家回来就看得到。"),l(s.tidyPair[1],"我把空出来的柜子分成厨房和日用品。"),l(s.tidyPair[0],"这盒常用的放下面，拿起来方便。"),l(s.tidyPair[1],"易碎的我放上层。"),S("两个人对照清单逐项收好，没有把采购物品堆在过道。"),l(s.tidyPair[0],"这样差不多了。"),l(s.tidyPair[1],"我去检查厨房台面。")]};
    if(s.step==="free")return{id:`D02-005-${s.freeCamera||"select"}`,title:s.freeCamera?`${s.freeCamera}自由活动`:"下午自由活动",time:"15:00",place:s.freeCamera||"小屋",background:s.freeCamera==="厨房"?"kitchen":s.freeCamera==="阳台"?"balcony":"livingRoom",lines:s.freeCamera?freeLines(s.freeCamera,String(p.state.variables.gameMode??"A")):[S("15:00 · 三个公共机位仍在录制。"),S("请选择一个机位开始观察。")]};
    if(s.step==="dinner")return{id:"D02-006",title:"晚餐与约会期待",time:"18:30",place:"餐厅",background:"diningRoom",lines:dinnerLines()};
    if(s.step==="chat"){const script=createAnonymousChatScript(s.chatMode||"group",topicFor(s.chatQuestion||questions[0]),s.chatPair,String(p.state.variables.gameMode??"A"));return{id:"D02-007",title:`${script.title} · ${script.topic==="restart"?questions[0]:script.topic==="like-or-habit"?questions[1]:questions[2]}`,time:"20:30",place:"匿名聊天室",background:"interviewRoom",lines:script.lines};}
    if(s.step==="interview")return interviewScene(s,String(p.state.variables.gameMode??"A"));
  }
  if(s.step==="rules")return{id:"D03-001",title:"约会规则公开",time:"08:30",place:"小屋客厅",background:"livingRoom",lines:[S("【今天将迎来首次正式约会。】"),S("【五位嘉宾中，四位参与双人约会，一位留在小屋。】"),S("【每位嘉宾仅能参加一场正式约会。】"),l("ZZX","这么快？"),l("SXH","第三天了。"),l("ZJ","我感觉才刚住进来。"),l("ZZY","昨天不还在讨论去哪儿吗？"),l("ZH","原来是真的要去了。")]};
  if(s.step==="date1"||s.step==="date2") {const i=s.step==="date1"?0:1;const pair=s.datePairs[i]??["ZZX","SXH"] as GuestId[];const prior=parse(p.gameUi?.episode2);return{id:`D03-00${i+3}`,title:`${names(pair)} · 第${i+1}组约会`,time:i===0?"10:30":"14:00",place:s.dateLocations[i]??"咖啡馆",background:"dateCard",lines:dayThreeDateDialogue(pair[0],pair[1],s.dateLocations[i]??"咖啡馆",String(p.state.variables.gameMode??"A"),prior?.choices.ep2SunriseHint==="true")};}
  if(s.step==="stay")return stayScene(s);
  if(s.step==="reunion")return{id:"D03-006",title:"五人重新集合",time:"18:30",place:"餐厅",background:"diningRoom",lines:[S("四位约会嘉宾陆续回到小屋，留守的人已经把晚餐摆上桌。"),l("ZJ","今天回来感觉像出门很久一样。"),l("ZZY","不就一天？"),l("ZJ","你不懂。"),l("SXH","哪有那么夸张。"),l("ZH","他可能是累了。"),l("ZZX","要不先吃饭吧。"),S("导演组记录了每个人回家后的第一反应。"),l("ZZY","吃饭的时候再慢慢说。"),l("ZH","好。"),l("ZJ","那我先坐下了。"),l("SXH","我把水拿过来。")]};
  if(s.step==="night")return{id:"D03-007",title:"约会后的私人谈话",time:"20:00",place:"小屋公共区域",background:"balcony",lines:[S(s.focus==="truth"?`导演发布真心话问题：${s.interviewQuestion||"有没有某个时刻想起过去？"}`:s.focus==="free"?"导演让五位嘉宾自由聊天，不替任何人指定答案。":"导演追问当天约会片段中的一个细节。"),...nightLines(s,String(p.state.variables.gameMode??"A"))]};
  return{id:`D0${s.episode}-scene`,title:stageName[s.step]??"拍摄现场",time:"20:00",place:"小屋",background:"livingRoom",lines:[S("导演组正在确认下一段拍摄安排。")]};
}
function interviewQuestion(s:Ep23State){
 const index=Math.max(0,Number((s.interviewQuestion||"Q1").slice(1))-1);return interviewQuestionsByEpisode[s.episode][index]??interviewQuestionsByEpisode[s.episode][0];
}
function interviewAnswer(s:Ep23State,g:GuestId,mode:string){
 if(s.episode===2)return interviewAnswerByGuest[g];
 const pair=s.datePairs.find(row=>row.includes(g));const partner=pair?.find(id=>id!==g);const formal=formalXPairs[mode]?.find(row=>row.includes(g));const former=formal?.find(id=>id!==g);const q=s.interviewQuestion||"Q1";
 if(q==="Q1")return partner?`和${guestLabel[partner]}刚开始有点拘谨，后面聊得还算自然。`:"我今天没有参加双人约会，更多是在观察大家回来之后的状态。";
 if(q==="Q2")return formal?"有时会想起过去，但我不想用回忆替今天下结论。":"我没有正式X，不过熟悉的生活习惯确实会让人想起一些事。";
 if(q==="Q3")return partner?`愿意继续了解${guestLabel[partner]}，但我不想先把答案说满。`:"我想先听听大家今天的感受，再决定怎么认识彼此。";
 if(former&&s.datePairs.some(row=>row.includes(former)))return "会有一点在意，但那是我的感受，不代表我能替对方做决定。";
 return formal?"我会有自己的感受，但不想把它变成对别人的要求。":"我没有正式X，这个问题对我来说只能先从旁观者角度回答。";
}
function interviewScene(s:Ep23State,mode:string):SceneScript {
  const g=s.interviewGuests[Math.min(s.interviewIndex,s.interviewGuests.length-1)]??"ZZX";
  return{id:`D0${s.episode}-008-${g}`,title:`${guestLabel[g]} · 单人后采`,time:"21:30",place:"采访室",background:"interviewRoom",lines:[S("导演："+interviewQuestion(s)),l(g,interviewAnswer(s,g,mode),"采访回答"),S("本次后采只记录导演选定的嘉宾。"),l(g,"今天有些细节我会记得。","停顿"),S("采访结束，工作人员关闭录音。")]};
}
function stayScene(s:Ep23State):SceneScript {
 const copy:Record<GuestId,ScriptLine[]>={ZZX:[S("16:00 · 朱志鑫留在小屋整理行李。"),l("ZZX","这个袋子还没拆。"),S("他从夹层里发现一张没有署名的旧便签。"),l("ZZX","先收好吧。"),S("朱志鑫把便签放回原处，继续整理。")],SXH:[S("16:00 · 苏新皓负责整理公共区域。"),l("SXH","杯子放这边就行。"),S("他在一只熟悉的杯子前停了一下。"),l("SXH","这个先别收起来。"),S("苏新皓把杯子留在桌角，转身继续整理。")],ZJ:[S("16:00 · 张极留在客厅听歌。"),l("ZJ","这首好像在哪儿听过。"),S("他把音量调低，点开下一首。"),l("ZJ","今天大家应该玩得挺开心。"),S("音乐继续播放，张极靠在沙发上发了会儿呆。")],ZZY:[S("16:00 · 张泽禹在厨房准备晚饭。"),l("ZZY","先把菜洗了。"),S("他拿起手机看了一眼，没有新消息。"),l("ZZY","我在等什么啊。"),S("张泽禹笑着把手机扣在台面上，继续切菜。")],ZH:[S("16:00 · 左航到阳台透气。"),l("ZH","今天挺安静的。"),S("他把日程记在备忘录里。"),l("ZH","等他们回来再问问。"),S("左航合上备忘录，望了一会儿院子。")]};
 return{id:"D03-005",title:`${guestLabel[s.stayHome]}留守小屋`,time:"16:00",place:s.stayHome==="ZH"?"阳台":s.stayHome==="ZZX"?"卧室":"客厅",background:s.stayHome==="ZH"?"balcony":"livingRoom",lines:copy[s.stayHome]};
}

function advanceStep(p:EpisodeProps,s:Ep23State,save:(n:Ep23State)=>void){
  const mark=(id:string)=>[...new Set([...s.eventHistory,id])];
  const completedScene=()=>({...s,playbackStatus:{...s.playbackStatus,[sceneFor(p,s).id]:"complete" as const}});
  const sceneSteps=s.episode===2?["morning","breakfast","shopping","tidy","free","dinner","chat","interview"]:["rules","date1","date2","stay","reunion","night","interview"];
  if(sceneSteps.includes(s.step) && (s.step!=="free"||s.freeCamera)) {
    const current=sceneFor(p,s);
    if(s.line<current.lines.length-1){save({...s,line:s.line+1});return;}
  }
  const go=(step:string,app="camera",extra:Partial<Ep23State>={})=>{save({...completedScene(),...extra,step,line:0,eventHistory:[...new Set([...mark(sceneFor(p,s).id),`D0${s.episode}-${step}`]) ]});p.onNavigate?.(app);};
  if(s.episode===2){
    if(s.step==="morning"){go("breakfast");return;}
    if(s.step==="breakfast"){go("shoppingSetup","reminders");return;}
    if(s.step==="shopping"){go("tidy");return;}
    if(s.step==="tidy"){go("free","camera",{freeCamera:"客厅",freeViewed:[]});return;}
    if(s.step==="free"){
      const freeHistory=mark(sceneFor(p,s).id);
      const viewed=[...new Set([...s.freeViewed,s.freeCamera])];
      if(viewed.length>=3)go("dinner","camera",{freeViewed:viewed,eventHistory:freeHistory});
      else save({...completedScene(),freeViewed:viewed,freeCamera:"",line:0,eventHistory:freeHistory});
      return;
    }
    if(s.step==="dinner"){save({...completedScene(),step:"chatSetup",line:0,eventHistory:mark("D02-006")});p.onNavigate?.("reminders");return;}
    if(s.step==="chat"){save({...completedScene(),step:"interviewSetup",line:0,choices:{...s.choices,ep2SunriseHint:"true"},eventHistory:mark("D02-007")});p.onNavigate?.("reminders");return;}
    if(s.step==="interview"){
      const guest=s.interviewGuests[s.interviewIndex];const answer=interviewAnswer(s,guest,String(p.state.variables.gameMode??"A"));const answers={...s.interviewAnswers,[guest]:answer};
      if(s.interviewIndex+1<s.interviewGuests.length)save({...completedScene(),interviewAnswers:answers,interviewIndex:s.interviewIndex+1,line:0,eventHistory:mark(sceneFor(p,s).id)});
      else{go("sms","messages",{interviewAnswers:answers});}
      return;
    }
  }else{
    if(s.step==="rules"){go("dateSetup","reminders");return;}
    if(s.step==="date1"){go("date2");return;}
    if(s.step==="date2"){go("stay");return;}
    if(s.step==="stay"){go("reunion");return;}
    if(s.step==="reunion"){save({...completedScene(),step:"focusSetup",line:0,eventHistory:mark("D03-006")});p.onNavigate?.("reminders");return;}
    if(s.step==="night"){save({...completedScene(),step:"interviewSetup",line:0});p.onNavigate?.("reminders");return;}
    if(s.step==="interview"){
      const guest=s.interviewGuests[s.interviewIndex];const answer=interviewAnswer(s,guest,String(p.state.variables.gameMode??"A"));const answers={...s.interviewAnswers,[guest]:answer};
      if(s.interviewIndex+1<s.interviewGuests.length)save({...completedScene(),interviewAnswers:answers,interviewIndex:s.interviewIndex+1,line:0,eventHistory:mark(sceneFor(p,s).id)});
      else{go("sms","messages",{interviewAnswers:answers});}
      return;
    }
  }
}

function Cam({p,state,save}:{p:EpisodeProps;state:Ep23State;save:(s:Ep23State)=>void}){
  if(state.completed||state.step==="complete")return <div className="d1-end-card"><div className="d1-end-mark">TOP · EP.0{state.episode}</div><h1>本期录制完成</h1><p>{state.episode===2?"EP.02 · 熟悉的人":"EP.03 · 第一次约会"}</p><div className="d1-end-rule"/><strong>已保存 · 已播片段 {state.airedClips.length} 段</strong><span className="d1-day2-lock"><LockKeyhole size={15}/>{state.episode===2?"下一期：第一次约会":"下一期：X介绍信｜敬请期待"}</span><small>原始关系模式、固定X、导演选择、短信历史和本期结果均已保留。</small></div>;
  if(state.step==="kcNight"&&state.episode===3) { const outcome=state.kcSmsOutcome||deriveKcSmsOutcome({zhuzhixinSentToSuxinhao:state.zhuzhixinSentToSuxinhao,suxinhaoSentToZhuzhixin:state.suxinhaoSentToZhuzhixin}); return <KcNightExperience episode={state.episode} outcome={outcome} place={state.kcNightPlace??"客厅"} progress={state.kcNightProgress??{}} viewed={state.kcNightConversationViewed} onPlace={place=>save({...state,kcNightPlace:place})} onProgress={(place,line)=>save({...state,kcNightProgress:{...state.kcNightProgress,[place]:line}})} onFinish={place=>{const event=kcNightEventId(state.episode);save({...state,step:"edit",line:0,kcNightPlace:place,kcNightConversationViewed:true,kcNightConversationAired:false, eventHistory:[...new Set([...state.eventHistory,event])]});p.onAction?.("director:record",event);p.onNavigate?.("bilibili");}} onBack={()=>p.onBack?.()}/>; }
  if(state.step==="shoppingSetup"||state.step==="chatSetup"||state.step==="interviewSetup"||state.step==="interview"||state.step==="dateSetup"||state.step==="focusSetup")return <div className="d1-gate"><TopHeader label={`EP.0${state.episode} · DIRECTOR DECISION`} title={stageName[state.step]} sub={state.step==="interview"?"后采已保存为独立采访场景，请从手机打开INTERVIEW查看并继续。":"请在导演任务App完成选择，随后回到CAM继续录制。"}/><button className="d1-primary" onClick={()=>p.onNavigate?.(state.step==="interview"?"mail":"reminders")}>{state.step==="interview"?"打开后采":"打开导演任务"} <ArrowRight size={17}/></button></div>;
  if(state.step==="free"&&!state.freeCamera){return <div className="d1-flow-card"><TopHeader label="15:00 · CAM SWITCHER" title="下午自由活动" sub="三处公共机位均有独立记录；逐个选择查看，历史不会清除。"/><div className="d1-night-switcher">{["客厅","厨房","阳台"].map(place=><button key={place} className={state.freeViewed.includes(place)?"on":""} onClick={()=>save({...state,freeCamera:place,line:0})}><small>CAM 0{["客厅","厨房","阳台"].indexOf(place)+1}</small>{place}<i>{state.freeViewed.includes(place)?"✓":"●"}</i></button>)}</div></div>;}
  if(state.step==="sms"||state.step==="edit"||state.step==="social")return <div className="d1-gate"><TopHeader label={`EP.0${state.episode} · ${stageName[state.step]}`} title={stageName[state.step]} sub="手机对应App已准备好，导演可以返回桌面后继续。"/><button className="d1-primary" onClick={()=>p.onNavigate?.(state.step==="sms"?"messages":state.step==="edit"?"bilibili":"weibo")}>打开{state.step==="sms"?"HEART SMS":state.step==="edit"?"剪辑室":"节目社区"} <ArrowRight size={17}/></button></div>;
  const scene=sceneFor(p,state);
  return <div className="episode-cam-stage">{state.step==="free"&&<div className="d1-night-switcher">{["客厅","厨房","阳台"].map((place,i)=><button key={place} className={state.freeCamera===place?"on":""} onClick={()=>save({...state,freeCamera:place,line:0})}><small>CAM 0{i+1}</small>{place}</button>)}</div>}<ScriptPanel p={p} state={state} save={save} scene={scene} anonymous={state.step==="chat"} chatMode={state.chatMode} chatAliases={state.chatAliases} onFinished={()=>advanceStep(p,state,save)}/></div>;
}

function Sms({p,state,save}:{p:EpisodeProps;state:Ep23State;save:(s:Ep23State)=>void}){
  const history=readSavedRelationshipHistory(p.state.variables.topSeasonHistory,String(p.state.variables.gameMode??"C"));
  const mode=history.relationshipMode;
  const day=`D${state.episode}`;
  if(state.step!=="sms"&&!state.smsSent)return <div className="d1-flow-card"><TopHeader label={`HEART SMS · EP.0${state.episode}`} title="本期短信时段尚未开始" sub="短信会在后采完成后开放；五位嘉宾独立锁定，再统一送达。"/><button className="d1-primary" onClick={()=>p.onNavigate?.("camera")}>继续本期录制 <ArrowRight size={17}/></button></div>;
  const items:Item[]=ids.flatMap(sender=>ids.filter(recipient=>recipient!==sender).map(recipient=>({id:`v17-route-${day}-${sender}-${recipient}`,title:`发送给${guestLabel[recipient]}`,body:"",richText:"",meta:{senderId:sender,recipient},time:"22:00",sender:guestLabel[sender],avatar:"",kind:"text" as const,media:"",hidden:false,unlock:"",password:"",folder:day,favorite:false,outgoing:true,read:false,likes:0,comments:[]})));
  const recipientsFor=(sender:GuestId)=>[...new Set(items.filter(x=>x.meta?.senderId===sender).map(x=>String(x.meta?.recipient) as GuestId))];
  const targetFor=(sender:GuestId):GuestId=>state.smsTargets[sender]??recipientsFor(sender)[0]??ids.find(x=>x!==sender)!;
  const outgoing=ids.map(sender=>items.find(i=>i.meta?.senderId===sender&&i.meta?.recipient===targetFor(sender))).filter((x):x is Item=>Boolean(x));
  const evidenceIds=state.eventHistory; const pairEvidence:{tag:string;pair:GuestId[]}[]=[];if(state.episode===2&&evidenceIds.includes("D02-004")&&state.shoppingPair.length===2)pairEvidence.push({tag:"shopping_together",pair:state.shoppingPair});if(state.episode===3)state.datePairs.forEach((pair,index)=>{if(pair.length===2&&evidenceIds.includes(index===0?"D03-003":"D03-004"))pairEvidence.push({tag:"first_date_paired",pair});});const occurredEvents=smsSemanticEvents({episode:state.episode,evidenceIds,pairEvidence});
  const frozenFor=(sender:GuestId,recipient:GuestId)=>selectSms({episode:state.episode,senderId:sender,recipientId:recipient,relationshipMode:mode,formalExPairs:history.formalExPairs,occurredEvents,previouslyUsedIds:smsUsageFromGameUi(p.gameUi,sender).ids,previouslyUsedTexts:smsUsageFromGameUi(p.gameUi,sender).texts,saveId:String(p.state.variables.gameSeed??p.work.id)});
  const lock=(sender:GuestId)=>save({...state,smsTargets:{...state.smsTargets,[sender]:targetFor(sender)},smsLocked:[...new Set([...state.smsLocked,sender])]});
  const send=()=>{const smsFrozen:Partial<Record<GuestId,FrozenSms>>={};const batch=selectSmsBatch(outgoing.map(item=>{const sender=String(item.meta?.senderId) as GuestId,recipient=String(item.meta?.recipient) as GuestId;const used=smsUsageFromGameUi(p.gameUi,sender);return {episode:state.episode,senderId:sender,recipientId:recipient,relationshipMode:mode,formalExPairs:history.formalExPairs,occurredEvents,previouslyUsedIds:used.ids,previouslyUsedTexts:used.texts,saveId:String(p.state.variables.gameSeed??p.work.id)}}));for(const message of batch)smsFrozen[message.senderId]=message;const flags=kcSmsFlagsFromDeliveries(outgoing.map(x=>({senderId:x.meta?.senderId as GuestId,recipientId:x.meta?.recipient as GuestId})));const outcome=deriveKcSmsOutcome(flags);p.onAction?.("heart:send",`D${state.episode}`);save({...state,...flags,smsFrozen,kcSmsOutcome:outcome,kcEmotionalReaction:kcEmotionalReaction(outcome),kcNightConversationViewed:false,kcNightConversationAired:false,kcNightPlace:"客厅",kcNightProgress:{},smsSent:true,step:state.episode===2?"edit":"kcNight",line:0,choices:{...state.choices,[`ep${state.episode}SmsHistory`]:outgoing.map(x=>`${x.meta?.senderId}>${x.meta?.recipient}:${x.id}`).join("|")},eventHistory:[...new Set([...state.eventHistory,`D0${state.episode}-009`])]});};
  if(state.smsSent)return <div className="d1-flow-card d1-sms-card"><TopHeader label={`22:00 · HEART SIGNAL · EP.0${state.episode}`} title="匿名短信已同时送达" sub="收件端隐藏发件人；X提示按本局已保存的正式关系判断。"/><div className="d1-inbox-list">{guests.map(g=>{const incoming=outgoing.filter(x=>x.meta?.recipient===g.id);return <article key={g.id}><header><b>{g.name} 的收件箱</b><small>匿名 · 22:00</small></header>{incoming.map(x=><div key={x.id} className="d1-anon-bubble"><small>来自匿名嘉宾</small><p>{state.smsFrozen?.[String(x.meta?.senderId) as GuestId]?.body??x.body.split("\n").slice(1).join("\n")}</p></div>)}<span className="d1-x-notice">{getXNoticeForInbox(g.id,outgoing.map(x=>({senderId:x.meta?.senderId as GuestId,recipientId:x.meta?.recipient as GuestId})),history)}</span></article>;})}</div><button className="d1-primary" onClick={()=>p.onNavigate?.(state.episode===2?"bilibili":"camera")}>{state.episode===2?"进入剪辑室":"查看深夜未公开素材"} <ArrowRight size={17}/></button></div>;
  return <div className="d1-flow-card d1-sms-card"><TopHeader label={`22:00 · HEART SIGNAL · EP.0${state.episode}`} title={`第${state.episode}晚心动短信`} sub="每人独立选择并锁定；五人全部锁定后统一发送。"/><div className="d1-lock-progress"><span>已锁定</span><b>{state.smsLocked.length}<small>/5</small></b><span>条 · 选择后不可改</span></div><div className="d1-lock-list">{guests.map(g=><article className={`d1-sms-choice ${state.smsLocked.includes(g.id)?"locked":""}`} key={g.id}><GuestAvatar id={g.id} className="d1-bubble-avatar"/><div className="d1-sms-choice-main"><strong>{g.name}</strong><label><span>收件嘉宾</span><select aria-label={`${g.name}选择收件人`} disabled={state.smsLocked.includes(g.id)} value={targetFor(g.id)} onChange={e=>save({...state,smsTargets:{...state.smsTargets,[g.id]:e.target.value as GuestId}})}>{guests.filter(x=>recipientsFor(g.id).includes(x.id)).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label><small>{frozenFor(g.id,targetFor(g.id)).body}</small></div><button disabled={state.smsLocked.includes(g.id)} onClick={()=>lock(g.id)}><LockKeyhole size={14}/>{state.smsLocked.includes(g.id)?"已锁定":"锁定"}</button></article>)}</div><button className="d1-primary" disabled={state.smsLocked.length!==5} onClick={send}><Send size={16}/>五条同时送达</button></div>;
}

function Editor({p,state,save}:{p:EpisodeProps;state:Ep23State;save:(s:Ep23State)=>void}){
 if(state.step!=="edit")return <div className="d1-flow-card"><TopHeader label={`EDIT · EP.0${state.episode}`} title="剪辑时段尚未开始" sub="完成短信发送后，剪辑室只开放本期实际录制的素材。"/><button className="d1-primary" onClick={()=>p.onNavigate?.(state.step==="sms"?"messages":"camera")}>继续本期录制 <ArrowRight size={17}/></button></div>;
 const options:{id:string;title:string;time:string;place:string;guests:GuestId[];summary:string}[]=state.episode===2?[
   {id:"D02-001",title:"清晨厨房",time:"08:00",place:"厨房",guests:["SXH","ZZX"],summary:"早晨的厨房里，两个人从准备早餐开始熟悉彼此的生活节奏。"},{id:"D02-002",title:"早餐细节",time:"08:30",place:"餐厅",guests:["SXH","ZZX","ZJ"],summary:"餐桌上的饮食习惯和随口接话，构成入住后的日常观察。"},{id:"D02-004",title:"超市采购",time:"11:00",place:"超市",guests:state.shoppingPair,summary:"采购清单、分工与临时决定都来自本局实际约会安排。"},{id:"D02-004B",title:"小屋整理",time:"13:00",place:"客厅",guests:state.tidyPair,summary:"整理公共空间时，嘉宾围绕物品摆放和生活习惯自然交流。"},...["客厅","厨房","阳台"].map(place=>({id:`D02-005-${place}`,title:`自由观察 · ${place}`,time:"15:00",place,guests:state.freeGuest?[state.freeGuest]:[],summary:`导演选择的${place}机位，内容仅来自本局实际记录。`})),{id:"D02-006",title:"晚餐群像",time:"18:30",place:"餐厅",guests:ids,summary:"五人共同完成晚餐后的群像交流。"},{id:"D02-007",title:"匿名聊天室",time:"20:30",place:"聊天室",guests:ids,summary:"本局匿名聊天室的连续对话记录；公开版不会显示匿名代号对应身份。"},...state.interviewGuests.map(id=>({id:`D02-008-${id}`,title:`${guestLabel[id]}后采`,time:"21:30",place:"采访室",guests:[id],summary:"导演本局选中的单人后采片段."}))
  ]:[{id:"D03-003",title:"第一组约会",time:"10:30",place:state.dateLocations[0]??"约会地点",guests:state.datePairs[0]??[],summary:"按本局实际安排拍摄的第一组约会。"},{id:"D03-004",title:"第二组约会",time:"14:00",place:state.dateLocations[1]??"约会地点",guests:state.datePairs[1]??[],summary:"按本局实际安排拍摄的第二组约会。"},{id:"D03-005",title:"留守小屋",time:"16:00",place:"合宿小屋",guests:state.stayHome?[state.stayHome]:[],summary:"未参加约会的嘉宾留守小屋，镜头记录其独处与日常。"},{id:"D03-006",title:"晚间集合",time:"18:30",place:"客厅",guests:ids,summary:"两组约会结束后，五人重新回到同一空间。"},{id:"D03-007",title:"私人谈话",time:"20:00",place:"阳台",guests:state.nightPair.split("-").filter(Boolean) as GuestId[],summary:"导演实际开放的私人谈话机位，保留当晚上下文。"},...state.interviewGuests.map(id=>({id:`D03-008-${id}`,title:`${guestLabel[id]}后采`,time:"21:30",place:"采访室",guests:[id],summary:"导演本局选中的单人后采片段."}))];
 const optionsWithNight=state.episode===3&&state.eventHistory.includes(kcNightEventId(state.episode))?[...options,{id:kcNightClipId(state.episode),title:"深夜未公开素材",time:"23:08",place:state.kcNightPlace,guests:["ZZX","SXH"] as GuestId[],summary:"短信投递后的克制反应与生活细节；本段不公开短信对象。"}]:options;
  const available=optionsWithNight.filter(option=>option.id===kcNightClipId(state.episode)?state.eventHistory.includes(kcNightEventId(state.episode)):state.eventHistory.includes(option.id));
 const records:CutClip[]=available.map(option=>{const source=p.items.find(item=>item.id===option.id&&item.folder===`D0${state.episode}`);const interviewGuest=option.id.startsWith(`D0${state.episode}-008-`)?option.id.slice(-3) as GuestId:undefined;const raw=interviewGuest?(state.interviewAnswers[interviewGuest]??option.summary).split(/\r?\n/).filter(Boolean):typeof source?.body==="string"?source.body.split(/\r?\n/).filter(Boolean).slice(0,4):[option.summary];const protectedClip=/正式X是|互为正式X|互为X|X关系确认|前任就是|前男友是|写给前任|X身份公开/.test(raw.join(" "));const text=protectedClip?["此素材包含当前剧集阶段受保护的关系身份线索，不能进入普通观众版。"]:raw;return {clipId:option.id,episodeId:`EP0${state.episode}`,sceneId:option.title,recordedAt:option.time,location:option.place,camera:`CAM-${option.place}`,guests:option.guests.map(id=>guestLabel[id]),summary:protectedClip?text[0]:option.summary,preview:text.length?text:[option.summary],watched:option.id===kcNightClipId(state.episode)?state.kcNightConversationViewed:state.playbackStatus[option.id]==="complete"||state.eventHistory.includes(option.id),spoiler:protectedClip,publicEligible:!protectedClip};});
 const legacyNightId=kcNightClipId(2);
 const validDraftIds=state.episode===2?state.clips.filter(id=>id!==legacyNightId):state.clips;
 const validOrder=state.episode===2?(state.clipOrder?.length?state.clipOrder:state.clips).filter(id=>id!==legacyNightId):(state.clipOrder?.length?state.clipOrder:state.clips);
 const stored:CutDraft={selectedClipIds:validDraftIds,clipOrder:validOrder,editingStyle:(state.cut as CutStyle)||"",previewState:state.previewState??{seenClipIds:[],entered:false},stage:state.editStage??1,broadcastId:state.broadcastId,publishedAt:state.publishedAt};
 const updateDraft=(next:CutDraft)=>{if(state.broadcastId)return;save({...state,clips:next.selectedClipIds,clipOrder:next.clipOrder,cut:next.editingStyle,editStage:next.stage,previewState:next.previewState,broadcastId:next.broadcastId,publishedAt:next.publishedAt});};
 return <DirectorCutRoom episode={state.episode} clips={records} draft={stored} onDraft={updateDraft} onPublish={payload=>{if(state.broadcastId||payload.selectedClipIds.length<3)return;save({...state,step:"social",line:0,kcNightConversationAired:state.episode===3&&payload.selectedClipIds.includes(kcNightClipId(state.episode)),clips:payload.selectedClipIds,clipOrder:payload.clipOrder,cut:payload.editingStyle,editStage:3,previewState:{...stored.previewState,entered:true},broadcastId:payload.broadcastId,publishedAt:payload.publishedAt,airedClips:payload.clipOrder,choices:{...state.choices,[`ep${state.episode}BroadcastClips`]:payload.clipOrder.join("|")},eventHistory:[...new Set([...state.eventHistory,`D0${state.episode}-010`])]});p.onAction?.("edit:publish",`${state.episode}:${payload.editingStyle}`);p.onNavigate?.("weibo");}}/>;
}

export function EpisodeSocialVisitTracker({p,appId}:{p:EpisodeProps;appId:string}){
 const episode=Number(p.state.variables.gameDay); const key=`episode${episode}`; const state=parse(p.gameUi?.[key]);
 const seasonState=typeof p.gameUi?.[key]==="string"?(()=>{try{return JSON.parse(p.gameUi[key] as string) as {phase?:string;visits?:string[];episode?:number}}catch{return undefined}})():undefined;
 useEffect(()=>{if(episode<4||episode>14||!seasonState||seasonState.episode!==episode||seasonState.phase!=="social"||!( ["weibo"].includes(appId)))return;
  const visits=[...new Set([...(seasonState.visits??[]),appId])];const completed=visits.includes("weibo");
  const parsed=JSON.parse(p.gameUi?.[key] as string) as Record<string,unknown>;
  const finale=completed&&episode===14;
  p.onGameUi?.(key,JSON.stringify({...parsed,visits,phase:finale?"finale":completed?"complete":"social"}));
  if(completed&&!finale)p.onAction?.("episode:complete",String(episode));
 },[appId,episode,seasonState?.phase,seasonState?.visits?.join("|")]);
 useEffect(()=>{ if(!state||state.step!=="social"||!([2,3].includes(episode))||!(["weibo"].includes(appId)))return;
  const visited=[...new Set([...state.socialVisited,appId])];
  if(visited.includes("weibo")){const next={...state,socialVisited:visited,step:"complete",completed:true};p.onGameUi?.(key,JSON.stringify(next));p.onAction?.("episode:complete",String(episode));}
  else p.onGameUi?.(key,JSON.stringify({...state,socialVisited:visited}));
 },[appId,episode,state?.step,state?.socialVisited.join("|")]);
 return null;
}

export function EpisodeTwoThree({p,appId}:{p:EpisodeProps;appId:string}){
 const episode=(Number(p.state.variables.gameDay)===3?3:2) as 2|3;
 const {state,save}=useEp23(p,episode);
 if(appId==="reminders")return <Mission p={p} state={state} save={save}/>;
 if(appId==="calendar")return <div className="d1-flow-card"><TopHeader label={`EP.0${episode} · DIRECTOR SCHEDULE`} title={episode===2?"熟悉的人":"第一次约会"} sub="节目日程与导演决策共用本季存档。"/><p>{episode===2?"08:00 清晨 · 08:30 早餐 · 10:00 采购 · 11:00 超市 · 15:00 自由活动 · 18:30 晚餐 · 20:30 匿名聊天室 · 21:30 后采 · 22:00 短信 · 23:00 剪辑":"08:30 规则 · 09:00 配对 · 10:30/14:00 约会 · 16:00 留守 · 18:30 集合 · 20:00 私谈 · 21:30 后采 · 22:00 短信 · 23:00 剪辑"}</p><button className="d1-primary" onClick={()=>p.onNavigate?.("camera")}>继续拍摄</button></div>;
 if(appId==="camera")return <Cam p={p} state={state} save={save}/>;
 if(appId==="messages")return <Sms p={p} state={state} save={save}/>;
 if(appId==="bilibili")return <Editor p={p} state={state} save={save}/>;
 if(appId==="mail"){
   if(state.step==="interviewSetup")return <InterviewSelector p={p} state={state} save={save} commit={(next,step,app="camera")=>{save({...state,...next,step,line:0});p.onNavigate?.(app)}}/>;
   if(state.step==="interview"){
     const guest=state.interviewGuests[Math.min(state.interviewIndex,state.interviewGuests.length-1)];
     const entry=guest?interviewFor(episode,guest):undefined;
     if(guest&&entry)return <InterviewExperience episode={episode} guest={guest} name={guestLabel[guest]} entry={entry} runtime={p.state} progress={state.interviewProgress?.[guest]??{line:0}} onProgress={next=>save({...state,interviewProgress:{...state.interviewProgress,[guest]:next}})} onComplete={()=>{const finished={line:0,...(state.interviewProgress?.[guest]??{}),finished:true,auto:false};const interviewAnswers={...state.interviewAnswers,[guest]:interviewLines(entry,finished,interviewConditional(entry,p.state,guest)).map(row=>row.speaker==="STAGE"?row.text:`${guestLabel[row.speaker]}：${row.text}`).join("\n")};const eventHistory=[...new Set([...state.eventHistory,`D0${episode}-008-${guest}`])];p.onAction?.("director:record",`D0${episode}-008-${guest}`);if(state.interviewIndex+1<state.interviewGuests.length)save({...state,interviewAnswers,eventHistory,interviewIndex:state.interviewIndex+1,interviewProgress:{...state.interviewProgress,[guest]:finished}});else{save({...state,interviewAnswers,eventHistory,step:"sms",line:0,interviewProgress:{...state.interviewProgress,[guest]:finished}});p.onNavigate?.("messages");}}}/>;
   }
   return <div className="d1-flow-card"><TopHeader label="INTERVIEW" title="后采暂不可用" sub="先完成本期前置拍摄流程。"/><button className="d1-primary" onClick={()=>p.onNavigate?.("camera")}>返回CAM</button></div>;
 }
 if(appId==="settings")return <div className="d1-flow-card"><TopHeader label="EPISODE STATUS" title={`EP.0${episode} · ${stageName[state.step]??state.step}`} sub={`关系模式 ${String(p.state.variables.gameMode??"A")} 已沿用EP.01存档。`}/><p>导演选择及本期素材已自动保存。回到桌面可点继续录制。</p><button className="d1-primary" onClick={()=>p.onNavigate?.("camera")}>继续录制</button></div>;
 return <Cam p={p} state={state} save={save}/>;
}
