import { useEffect, useMemo } from "react";
import type { GuestId, ScriptLine } from "../game/day1-data";
import { interviewConditional, interviewLines, type InterviewEntry, type InterviewProgress } from "../game/interviews";
import type { Runtime } from "../schema";
import { SceneChatStream } from "./SceneChatStream";
import { GuestAvatar } from "../game/GuestAvatar";
import "./day-one.css";

export function InterviewExperience({ episode, guest, entry, runtime, progress, onProgress, onComplete, name }: {
  episode:number; guest:GuestId; entry:InterviewEntry; runtime:Runtime; progress:InterviewProgress;
  onProgress:(next:InterviewProgress)=>void; onComplete:()=>void; name:string;
}) {
  const conditional=useMemo(()=>interviewConditional(entry,runtime,guest),[entry,runtime,guest]);
  const rows=useMemo(()=>interviewLines(entry,progress,conditional),[entry,progress.followupId,conditional]) as ScriptLine[];
  const waiting=progress.line>=4&&!progress.followupId;
  useEffect(()=>{
    if(!progress.auto||waiting||progress.finished)return;
    const line=rows[Math.min(progress.line,rows.length-1)];
    const delay=Math.min(4800,Math.max(1500,1050+line.text.length*42+(line.speaker==="STAGE"?500:0)));
    const timer=window.setTimeout(()=>{
      if(progress.line<rows.length-1)onProgress({...progress,line:progress.line+1});
      else if(!progress.followupId)onProgress({...progress,line:4,auto:false});
      else onComplete();
    },delay);
    return()=>window.clearTimeout(timer);
  },[progress,rows,waiting,onProgress,onComplete]);
  const start=()=>onProgress({...progress,started:true});
  const advance=()=>{
    if(waiting)return;
    if(progress.line<rows.length-1)onProgress({...progress,line:progress.line+1,auto:false});
    else if(!progress.followupId)onProgress({...progress,line:4,auto:false});
    else onComplete();
  };
  const choose=(id:string)=>onProgress({...progress,followupId:id,line:4,auto:false});
  return <div className="interview-experience">
    <header className="season-head"><small>INTERVIEW · EP.{String(episode).padStart(2,"0")}</small><h1>{name} · 后采</h1><p>导演提问与嘉宾回答按原稿逐条录制，素材仅属于已选嘉宾。</p></header>
    {!progress.started?<div className="season-finish"><GuestAvatar id={guest} className="season-avatar"/><h2>准备开始后采</h2><p>本场共四轮问答，并包含一次导演追问选择。</p><button className="season-primary" onClick={start}>开始录制</button></div>:<>
      {waiting&&<section className="interview-followups"><h3>导演追问</h3><p>选择一种真实追问方向，回答将影响本场录制素材。</p>{entry.directorFollowupChoices.map(option=><button key={option.id} onClick={()=>choose(option.id)}>{option.label}</button>)}</section>}
      <SceneChatStream sceneId={entry.interviewId} rows={rows} shownCount={Math.min(rows.length,progress.line+1)} auto={false} label="后采现场 · 连续记录" speakerName={()=>name}/>
      <div className="season-controls"><button onClick={()=>onProgress({...progress,auto:!progress.auto})}>{progress.auto?"暂停":"自动播放"}</button><button onClick={advance} disabled={waiting}>{waiting?"先选追问":progress.line<rows.length-1||!progress.followupId?"下一条":"完成本场后采"}</button></div>
    </>}
  </div>;
}
