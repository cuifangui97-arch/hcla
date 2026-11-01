import { useEffect } from "react";
import { SceneChatStream, sceneSpeakerName } from "./SceneChatStream";
import { GuestAvatar } from "../game/GuestAvatar";
import type { GuestId, ScriptLine } from "../game/day1-data";
import { guests } from "../game/day1-data";
import { ep05BonusScripts, ep05ClipIds, ep05GroupReaction, ep05EveningMainScenes, ep05Opening, ep05Breakfast, ep05PairLines, ep05PairScript, ep05Participated, ep05RowsToScript, type Ep05Line, type Ep05Round, type Ep05Stage } from "../game/ep05-eye-contact";
import { interviewFor, type InterviewProgress } from "../game/interviews";
import { InterviewExperience } from "./InterviewExperience";
import type { State } from "./EpisodeFourteen";
import type { Runtime } from "../schema";
import "./ep05-experience.css";

type Props={appId:string;state:State;runtime:Runtime;mode:string;formalExPairs:[GuestId,GuestId][];classic:boolean;save:(next:State)=>void;onNavigate?:(app:string)=>void;onBack:()=>void};
const names:Record<GuestId,string>={ZZX:"朱志鑫",SXH:"苏新皓",ZJ:"张极",ZZY:"张泽禹",ZH:"左航"};
const phaseFor:Record<Ep05Stage,string>={BREAKFAST:"story",INTRO:"story",ROUND1_SELECTION:"decision",ROUND1_PLAY:"activity",ROUND2_SELECTION:"decision",ROUND2_PLAY:"activity",GROUP_REACTION:"activity",BONUS_SELECTION:"decision",BONUS_PLAY:"activity",EVENING:"activity",INTERVIEW:"interview",SMS:"sms",EDITING:"edit",BROADCAST:"social",COMPLETE:"complete"};
const lineInterval=(line:Ep05Line)=>Math.min(5000,Math.max(1600,1000+line.text.length*42+(line.speaker==="STAGE"?550:0)));
function newRound(roundId:"round1"|"round2",pairIds:GuestId[]):Ep05Round{return {roundId,pairIds,preparationCompleted:false,timerStarted:false,timerFinished:false,taskOutcome:"",dialogueProgress:{ready:0,eye:0,after:0},completionStatus:"inProgress",generatedClipIds:[]};}
function observerLines(id:GuestId,rounds:Ep05Round[]):Ep05Line[]{
 const participated=ep05Participated(rounds,id); if(participated)return [];
 const script:Record<GuestId,[string,string][]>={
  ZZX:[["在旁边看两个人对视时，你注意到什么？","我注意到大家都在忍笑，计时器倒是一直很冷静。"],["你觉得谁的反应最有意思？","张极很容易被逗笑，左航看起来比较稳。"],["三十秒能看出一个人什么吗？","可能只能看出他当时紧不紧张，不能只凭这个认识一个人。"]],
  SXH:[["没有上场时，你会留意什么？","我会看计时和现场状态，免得有人不舒服。"],["谁的反应让你意外？","有人越认真越容易被一句话逗笑。"],["你觉得这个任务有用吗？","能看到大家怎么面对尴尬，但不能替他们下结论。"]],
  ZJ:[["你在旁边看任务是什么感觉？","比我想象中还想笑。"],["谁最能让别人破功？","我不说名字，反正不是我。"],["三十秒结束后你记得什么？","记得计时器终于停了。"]],
  ZZY:[["你今天主要观察到什么？","每个人处理紧张的方式都不一样。"],["有没有谁让你意外？","平时安静的人也可能特别能坚持。"],["你会因为这次任务重新认识谁吗？","不会只凭三十秒，但确实多看到一点反应。"]],
  ZH:[["你在旁边观察时觉得谁最有意思？","认真报时的人和假装不紧张的人都挺有意思。"],["你会把任务结果看得很重吗？","不会，完成任务是一回事，了解一个人得花更久。"],["今天最明显的现场反应是什么？","有人刚说尽量不笑，结果自己先笑。"]],
 };
 const rows:Ep05Line[]=[];script[id].forEach(([q,a],i)=>{rows.push({id:`EP05-OBSERVER-${id}-Q${i}`,speaker:"STAGE",text:q,mood:"interview-pd"},{id:`EP05-OBSERVER-${id}-A${i}`,speaker:id,text:a});});return rows;
}

export function EpisodeFiveExperience({appId,state,runtime,mode,formalExPairs,classic,save,onNavigate,onBack}:Props){
 const stage=state.ep05Stage??"INTRO";
 const rounds=state.ep05Rounds??[];
 const roundNumber=stage==="ROUND2_PLAY"?2:1;
 const activeRound=rounds[roundNumber-1];
 const segment=state.ep05ActiveSegment??"ready";
 const pairRows=activeRound?ep05PairLines(activeRound.pairIds,segment,roundNumber,mode):[];
 const playerRows:Ep05Line[]=stage==="BREAKFAST"?ep05RowsToScript(ep05Breakfast,"D05-001"):stage==="INTRO"?ep05RowsToScript(ep05Opening,"D05-002"):stage==="GROUP_REACTION"?ep05RowsToScript(ep05GroupReaction,"D05-007"):stage==="ROUND1_PLAY"||stage==="ROUND2_PLAY"?pairRows:stage==="BONUS_PLAY"?ep05RowsToScript([...(state.ep05BonusOption?ep05BonusScripts[state.ep05BonusOption]:[]),...(state.ep05BonusOption==="replay"?[{speaker:"STAGE" as const,text:`【导演选中的已录制片段：${state.ep05BonusClipId??"尚未选择"}。】`}]:[])],`D05-BONUS-${state.ep05BonusOption??"NONE"}`):[];
 const line=stage==="ROUND1_PLAY"||stage==="ROUND2_PLAY"?(activeRound?.dialogueProgress[segment]??0):stage==="BONUS_PLAY"?(state.ep05BonusLine??0):state.line;
 const current=playerRows[Math.min(line,Math.max(0,playerRows.length-1))];
 const patch=(changes:Partial<State>)=>save({...state,...changes});
 const setStage=(next:Ep05Stage,changes:Partial<State>={})=>patch({...changes,ep05Stage:next,phase:phaseFor[next],line:0,auto:false});
 const record=(ids:string[])=>[...new Set([...state.recorded,...ids.filter(Boolean)])];
 const segmentProgress=(index:number)=>{
  if(!activeRound)return;
  const nextRounds=[...rounds];nextRounds[roundNumber-1]={...activeRound,dialogueProgress:{...activeRound.dialogueProgress,[segment]:index}};
  patch({ep05Rounds:nextRounds,line:index});
 };
 const finishSegment=()=>{
  if(!activeRound)return;
  const clip=ep05ClipIds(activeRound.pairIds,roundNumber)[segment];
  let updated={...activeRound,generatedClipIds:[...new Set([...activeRound.generatedClipIds,clip])],dialogueProgress:{...activeRound.dialogueProgress,[segment]:playerRows.length-1}};
  const nextRounds=[...rounds];nextRounds[roundNumber-1]=updated;
  if(segment==="ready"){
   updated={...updated,preparationCompleted:true,timerStarted:true};nextRounds[roundNumber-1]=updated;
   patch({ep05Rounds:nextRounds,recorded:record([clip]),ep05ActiveSegment:"eye",line:0,auto:false});return;
  }
  if(segment==="eye"){
   updated={...updated,timerFinished:true,taskOutcome:ep05PairScript(activeRound.pairIds)?.outcome??""};nextRounds[roundNumber-1]=updated;
   patch({ep05Rounds:nextRounds,recorded:record([clip]),ep05ActiveSegment:"after",line:0,auto:false});return;
  }
  updated={...updated,completionStatus:"completed"};nextRounds[roundNumber-1]=updated;
  const nextStage=roundNumber===1?"ROUND2_SELECTION":"GROUP_REACTION";
  patch({ep05Rounds:nextRounds,recorded:record([clip]),phase:phaseFor[nextStage],ep05Stage:nextStage,ep05PairSelection:[],line:0,auto:false});
 };
 const advance=()=>{
  if(!playerRows.length)return;
  if(line<playerRows.length-1){if(stage==="ROUND1_PLAY"||stage==="ROUND2_PLAY")segmentProgress(line+1);else patch(stage==="BONUS_PLAY"?{ep05BonusLine:line+1}:{line:line+1});return;}
  if(stage==="ROUND1_PLAY"||stage==="ROUND2_PLAY")finishSegment();
  else if(stage==="BREAKFAST")setStage("INTRO",{recorded:record(["D05-001"])});
  else if(stage==="INTRO")setStage("ROUND1_SELECTION",{recorded:record(["D05-002"])});
  else if(stage==="GROUP_REACTION")setStage("BONUS_SELECTION",{recorded:record(["D05-007"])});
  else if(stage==="BONUS_PLAY"){
   const id=state.ep05BonusOption==="anonymousCards"?"D05-BONUS-ANON-CARDS":state.ep05BonusOption==="replay"?"D05-BONUS-REPLAY":"D05-BONUS-NOTE";
   patch({recorded:record([id]),phase:"activity",ep05Stage:"EVENING",ep05NightIndex:0,ep05NightLine:0,line:0,auto:false});
  }
 };
 useEffect(()=>{
  if(appId!=="camera"||!state.auto||!playerRows.length||!(stage==="BREAKFAST"||stage==="INTRO"||stage==="GROUP_REACTION"||stage==="ROUND1_PLAY"||stage==="ROUND2_PLAY"||stage==="BONUS_PLAY"))return;
  const delay=lineInterval(current??{speaker:"STAGE",text:""});const timer=window.setTimeout(advance,delay);return()=>window.clearTimeout(timer);
 },[appId,state.auto,stage,line,segment,roundNumber,playerRows.length]);

 if(appId==="camera"){
  if(stage==="EVENING"){
   const scenes=ep05EveningMainScenes(rounds,classic,formalExPairs);const index=Math.min(state.ep05NightIndex??0,scenes.length);const scene=scenes[index];
   if(!scene){return <div className="season-scroll"><header className="season-head"><small>EP05 · EVENING COMPLETE</small><h1>晚饭后主线已录制</h1><p>后采问题会区分实际上场嘉宾与观察者。</p></header><button className="season-primary" onClick={()=>setStage("INTERVIEW")}>进入后采 · 21:30</button><button onClick={onBack}>返回桌面</button></div>}
   const sceneLine=Math.min(state.ep05NightLine??0,scene.rows.length-1);const finishEvening=()=>{const nextIndex=index+1;patch({recorded:record([scene.clipId]),ep05NightIndex:nextIndex,ep05NightLine:0,phase:"activity",ep05Stage:"EVENING"});};
   return <main className="ep05-player"><div className="season-cam-visual" style={{backgroundImage:`linear-gradient(0deg,#15131ab8,#15131a30),url('/assets/backgrounds/${scene.location==="厨房"?"kitchen-day1.jpg":scene.location==="阳台"?"balcony-day1.jpg":"living-room-day1.jpg"}')`}}><small>● REC · EP.05 · {scene.camera}</small><b>{scene.time} · {scene.location}</b><div className="season-cast">{scene.participants.map(id=><span key={id}><GuestAvatar id={id} className="season-avatar"/>{names[id]}</span>)}</div><h2>晚饭后主线</h2></div><SceneChatStream sceneId={scene.id} rows={scene.rows} shownCount={sceneLine+1} auto={false} label={`${scene.time} · 晚间交流`} speakerName={sceneSpeakerName}/><div className="season-controls"><button onClick={()=>patch({ep05NightLine:Math.max(0,sceneLine-1)})} disabled={sceneLine===0}>上一条</button><button className="season-primary" onClick={()=>sceneLine<scene.rows.length-1?patch({ep05NightLine:sceneLine+1}):finishEvening()}>{sceneLine<scene.rows.length-1?"下一条":index+1<scenes.length?"结束本机位": "进入后采"}</button><button onClick={onBack}>返回桌面</button></div></main>;
  }
  if(stage==="INTERVIEW"||stage==="SMS"||stage==="EDITING"||stage==="BROADCAST"||stage==="COMPLETE"){
   if(stage==="INTERVIEW")return <div className="season-scroll"><header className="season-head"><small>EP05 · INTERVIEW</small><h1>后采准备</h1><p>只选择真实参与者或观察者；他们的回答会按当日经历区分。</p></header><button className="season-primary" onClick={()=>onNavigate?.("mail")}>打开后采</button><button onClick={onBack}>返回桌面</button></div>;
   if(stage==="SMS")return <div className="season-scroll"><header className="season-head"><small>EP05 · HEART SMS</small><h1>心动短信</h1><p>每人独立选择一位收件人，完成后统一投递。</p></header><button className="season-primary" onClick={()=>onNavigate?.("messages")}>继续短信</button><button onClick={onBack}>返回桌面</button></div>;
   if(stage==="EDITING")return <div className="season-scroll"><header className="season-head"><small>EP05 · EDIT</small><h1>本期素材已录制</h1><p>剪辑室仅显示实际录制完成的片段；短信与导演选择已保存。</p></header><button className="season-primary" onClick={()=>onNavigate?.("bilibili")}>进入剪辑室</button><button onClick={onBack}>返回桌面</button></div>;
   if(stage==="BROADCAST")return <div className="season-scroll"><header className="season-head"><small>EP05 · ON AIR</small><h1>正片已发布</h1><p>继续查看微博、豆瓣与Threads的播出反馈。</p></header><button className="season-primary" onClick={()=>onNavigate?.("weibo")}>查看播出反馈</button><button onClick={onBack}>返回桌面</button></div>;
   return <div className="season-scroll"><header className="season-head"><small>EP05 · COMPLETE</small><h1>EP05录制完成</h1><p>本期存档已保留。返回手机桌面继续EP06。</p></header><button className="season-primary" onClick={onBack}>返回工作手机</button></div>;
  }
  if(stage==="ROUND1_SELECTION"||stage==="ROUND2_SELECTION")return <div className="season-scroll"><header className="season-head"><small>EP05 · DIRECTOR DECISION</small><h1>{stage==="ROUND1_SELECTION"?"安排第一轮嘉宾":"安排第二轮嘉宾"}</h1><p>每轮只能选两人；同一人最多参加两轮。重复组合可选，但会明确标为第二次挑战。</p></header><button className="season-primary" onClick={()=>onNavigate?.("reminders")}>打开导演任务</button><button onClick={onBack}>返回桌面</button></div>;
  if(stage==="BONUS_SELECTION")return <div className="season-scroll"><header className="season-head"><small>EP05 · BONUS</small><h1>选择下午追加任务</h1><p>选项A匿名感想 · 选项B公开实际已录素材 · 选项C交换任务纸条。</p></header><button className="season-primary" onClick={()=>onNavigate?.("reminders")}>打开导演任务</button><button onClick={onBack}>返回桌面</button></div>;
  if(stage==="ROUND1_PLAY"||stage==="ROUND2_PLAY"){
   const round=activeRound;if(!round)return <div className="season-scroll"><h1>本轮记录缺失</h1><p>未改动存档。请回导演选择页核对当前搭档。</p><button onClick={()=>onNavigate?.("reminders")}>回导演任务</button></div>;
   const count=Math.min(playerRows.length,line+1);const visible=playerRows.slice(0,count);const timerValue=segment==="eye"?Math.max(0,...visible.map(row=>row.second??0)):segment==="after"?30:0;const clips=ep05ClipIds(round.pairIds,roundNumber);
   return <main className="ep05-player"><div className="season-cam-visual" style={{backgroundImage:"linear-gradient(0deg,#15131ab8,#15131a30),url('/assets/backgrounds/living-room-day1.jpg')"}}><small>● REC · EP.05 · CAM 01 · D05-00{roundNumber+3}</small><b>{roundNumber===1?"11:15":"11:35"} · 客厅 · {roundNumber===1?"第一轮":"第二轮"}</b><div className="season-cast">{round.pairIds.map(id=><span key={id}><GuestAvatar id={id} className="season-avatar"/>{names[id]}</span>)}</div><h2>{ep05PairScript(round.pairIds)?.label} · 30秒对视</h2></div>{segment==="eye"&&<div className="ep05-timer" aria-label={`30秒计时 ${timerValue}/30`}><div><b>{String(Math.floor(timerValue/60)).padStart(2,"0")}:{String(timerValue%60).padStart(2,"0")}</b><span>30秒倒计时</span></div><progress max={30} value={timerValue}/></div>}<SceneChatStream sceneId={`${clips[segment]}-${segment}`} rows={playerRows as ScriptLine[]} shownCount={count} auto={Boolean(state.auto)} label={`EP05 · ${segment==="ready"?"准备":segment==="eye"?"正式计时":"结束后交流"}`} speakerName={sceneSpeakerName}/><div className="season-controls"><button onClick={()=>patch({auto:!state.auto})}>{state.auto?"暂停":"自动播放"}</button><button disabled={line===0} onClick={()=>segmentProgress(Math.max(0,line-1))}>上一条</button><button className="season-primary" onClick={advance}>{line<playerRows.length-1?"下一条":segment==="ready"?"开始30秒计时":segment==="eye"?"公布本轮结果": "本轮完成"}</button><button onClick={onBack}>返回桌面</button></div></main>;
  }
  if(stage==="BREAKFAST"||stage==="INTRO"||stage==="GROUP_REACTION"||stage==="BONUS_PLAY")return <main className="ep05-player"><div className="season-cam-visual" style={{backgroundImage:`linear-gradient(0deg,#15131ab8,#15131a30),url('/assets/backgrounds/${stage==="BREAKFAST"?"kitchen-day1.jpg":"living-room-day1.jpg"}')`}}><small>● REC · EP.05 · CAM 01 · {stage==="BREAKFAST"?"D05-001":stage==="INTRO"?"D05-002":stage==="GROUP_REACTION"?"D05-007":"D05-BONUS"}</small><b>{stage==="BREAKFAST"?"09:30":stage==="INTRO"?"11:00":stage==="GROUP_REACTION"?"12:00":"16:00"} · {stage==="BREAKFAST"?"厨房":"客厅"}</b><div className="season-cast">{guests.map(g=><span key={g.id}><GuestAvatar id={g.id} className="season-avatar"/>{g.name}</span>)}</div><h2>{stage==="BREAKFAST"?"五人早餐":stage==="INTRO"?"你在看谁":stage==="GROUP_REACTION"?"五人讨论任务结果":"下午追加活动"}</h2></div><SceneChatStream sceneId={`EP05-${stage}`} rows={playerRows as ScriptLine[]} shownCount={Math.min(playerRows.length,line+1)} auto={Boolean(state.auto)} label="EP.05 · 连续现场" speakerName={sceneSpeakerName}/><div className="season-controls"><button onClick={()=>patch({auto:!state.auto})}>{state.auto?"暂停":"自动播放"}</button><button disabled={line===0} onClick={()=>patch({line:line-1,auto:false})}>上一条</button><button className="season-primary" onClick={advance}>{line<playerRows.length-1?"下一条":stage==="BREAKFAST"?"进入节目规则":stage==="INTRO"?"进入第一轮导演选择":stage==="GROUP_REACTION"?"选择下午追加任务":"结束追加任务"}</button><button onClick={onBack}>返回桌面</button></div></main>;
 }

 if(appId==="reminders"||appId==="calendar"){
  if(stage==="ROUND1_SELECTION"||stage==="ROUND2_SELECTION"){
   const roundNo=stage==="ROUND1_SELECTION"?1:2;const selection=state.ep05PairSelection??[];const count=(id:GuestId)=>rounds.filter(row=>row.pairIds.includes(id)&&row.completionStatus==="completed").length;const same=roundNo===2&&rounds[0]?.pairIds.length===2&&[...rounds[0].pairIds].sort().join("|")===[...selection].sort().join("|");
   const choose=(id:GuestId)=>{if(selection.includes(id)){patch({ep05PairSelection:selection.filter(x=>x!==id)});return;}if(selection.length<2&&count(id)<2)patch({ep05PairSelection:[...selection,id]});};
   const confirm=()=>{if(selection.length!==2)return;const round=newRound(roundNo===1?"round1":"round2",selection);const next=roundNo===1?[round]:[{...rounds[0],roundId:"round1" as const},round];const nextStage=roundNo===1?"ROUND1_PLAY":"ROUND2_PLAY";patch({ep05Rounds:next,ep05PairSelection:[],ep05ActiveSegment:"ready",phase:"activity",ep05Stage:nextStage,line:0,auto:false});onNavigate?.("camera");};
   return <div className="season-scroll"><header className="season-head"><small>DIRECTOR · EP.05 · ROUND {roundNo}</small><h1>{roundNo===1?"安排第一轮嘉宾":"安排第二轮嘉宾"}</h1><p>点击两位不同嘉宾。每人最多参加两轮；挑战结果在播放到结束前不显示。</p></header><div className="season-guest-picks">{guests.map(g=><button key={g.id} className={selection.includes(g.id)?"chosen":""} disabled={!selection.includes(g.id)&&count(g.id)>=2} onClick={()=>choose(g.id)}><GuestAvatar id={g.id} className="season-avatar"/><b>{g.name}</b><small>已参加 {count(g.id)}/2 轮</small></button>)}</div><p className="season-hint">当前选择：{selection.map(id=>names[id]).join(" × ")||"请选择两位"}</p>{same&&<p className="ep05-repeat-warning">这是同一组合的第二次挑战。确认后会生成独立回合和素材，不覆盖第一轮。</p>}<button className="season-primary" disabled={selection.length!==2} onClick={confirm}>确认并进入第{roundNo}轮 · {selection.length}/2</button><button onClick={onBack}>返回桌面</button></div>;
  }
  if(stage==="BONUS_SELECTION"){
   const selected=state.ep05BonusOption;const clipOptions=rounds.filter(x=>x.completionStatus==="completed").flatMap(round=>Object.values(ep05ClipIds(round.pairIds,round.roundId==="round1"?1:2))).filter(id=>state.recorded.includes(id));
   const start=()=>{if(!selected||selected==="replay"&&!clipOptions.includes(state.ep05BonusClipId??""))return;patch({ep05BonusLine:0,phase:"activity",ep05Stage:"BONUS_PLAY",auto:false});onNavigate?.("camera");};
   return <div className="season-scroll"><header className="season-head"><small>DIRECTOR · EP.05 · 16:00</small><h1>选择一项下午追加任务</h1><p>不同选择生成不同录制内容。公开花絮只能回放当天已经录制的片段。</p></header><div className="ep05-bonus-options">{[["anonymousCards","OPTION-A · 匿名感想"],["replay","OPTION-B · 公开任务花絮"],["notes","OPTION-C · 交换任务纸条"]].map(([id,title])=><button key={id} className={selected===id?"chosen":""} onClick={()=>patch({ep05BonusOption:id as State["ep05BonusOption"]})}>{title}</button>)}</div>{selected==="replay"&&<div className="ep05-clip-choices"><b>选择一段已录制的实际素材</b>{clipOptions.map(id=><button key={id} className={state.ep05BonusClipId===id?"chosen":""} onClick={()=>patch({ep05BonusClipId:id})}>{id}</button>)}</div>}<button className="season-primary" disabled={!selected||(selected==="replay"&&!state.ep05BonusClipId)} onClick={start}>确认追加任务并继续</button><button onClick={onBack}>返回桌面</button></div>;
  }
  if(stage==="INTERVIEW"){
   const selected=state.ep05InterviewGuests??[];const toggle=(id:GuestId)=>patch({ep05InterviewGuests:selected.includes(id)?selected.filter(x=>x!==id):selected.length<2?[...selected,id]:selected});
   return <div className="season-scroll"><header className="season-head"><small>DIRECTOR · EP.05 · 21:30</small><h1>安排后采对象</h1><p>最多选择两位。上场者会回答自己的任务体验；未上场者使用观察者问题。</p></header><div className="season-guest-picks">{guests.map(g=><button key={g.id} className={selected.includes(g.id)?"chosen":""} onClick={()=>toggle(g.id)}><GuestAvatar id={g.id} className="season-avatar"/><b>{g.name}</b><small>{ep05Participated(rounds,g.id)?"实际参与者":"观察者"}</small></button>)}</div><button className="season-primary" disabled={selected.length!==2} onClick={()=>{patch({ep05InterviewIndex:0,ep05InterviewStarted:true,phase:"interview",interviewIndex:0,interviewStarted:true});onNavigate?.("mail")}}>开始后采 · {selected.length}/2</button><button onClick={onBack}>返回桌面</button></div>;
  }
 }

 if(appId==="mail"&&stage==="INTERVIEW"){
  const interviewGuests=state.ep05InterviewGuests??[];const index=Math.min(state.ep05InterviewIndex??0,Math.max(0,interviewGuests.length-1));const active=interviewGuests[index];
  if(!active)return <div className="season-scroll"><header className="season-head"><small>EP05 · INTERVIEW</small><h1>尚未安排后采对象</h1></header><button className="season-primary" onClick={()=>onNavigate?.("reminders")}>返回导演任务</button></div>;
  const progress=(state.interviewProgress?.[active]??{line:0}) as InterviewProgress;
  const onProgress=(next:InterviewProgress)=>patch({interviewProgress:{...state.interviewProgress,[active]:next}});
  const finish=()=>{
   const clip=`EP05_INTERVIEW_${active}`;const nextRecorded=record([clip]);
   if(index+1<interviewGuests.length){patch({recorded:nextRecorded,ep05InterviewIndex:index+1,interviewIndex:index+1,interviewProgress:{...state.interviewProgress,[active]:{...progress,finished:true,auto:false}}});return;}
   patch({recorded:nextRecorded,ep05InterviewIndex:index+1,interviewIndex:index+1,ep05InterviewStarted:false,interviewStarted:false,ep05SmsCompleted:false,phase:"sms",ep05Stage:"SMS",interviewProgress:{...state.interviewProgress,[active]:{...progress,finished:true,auto:false}}});onNavigate?.("messages");
  };
  if(!ep05Participated(rounds,active)){
   const rows=observerLines(active,rounds);const cursor=Math.min(progress.line,rows.length-1);return <main className="ep05-player"><header className="season-head"><small>INTERVIEW · EP05</small><h1>{names[active]} · 观察者后采</h1><p>未参与对视，只回答现场观察，不声称自己完成了挑战。</p></header><SceneChatStream sceneId={`EP05-OBSERVER-${active}`} rows={rows as ScriptLine[]} shownCount={cursor+1} auto={false} label="后采 · 观察者问答" speakerName={sceneSpeakerName}/><div className="season-controls"><button onClick={()=>onProgress({...progress,line:Math.max(0,cursor-1)})} disabled={cursor===0}>上一条</button><button className="season-primary" onClick={()=>cursor<rows.length-1?onProgress({...progress,line:cursor+1}):finish()}>{cursor<rows.length-1?"下一条":index+1<interviewGuests.length?"完成本场后采":"完成后采并进入心动短信"}</button><button onClick={onBack}>返回桌面</button></div></main>;
  }
  const entry=interviewFor(5,active);if(entry)return <InterviewExperience episode={5} guest={active} name={names[active]} entry={entry} runtime={runtime} progress={progress} onProgress={onProgress} onComplete={finish}/>;
 }
 return null;
}
