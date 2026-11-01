import { useEffect, useMemo, useState } from "react";
import { assets, type GuestId } from "../game/day1-data";
import { ep04FreeActivityScenes, type Ep04FreeActivityProgress, type Ep04FreeSceneId, type Ep04FreeSceneProgress } from "../game/ep04-free-activity";
import { GuestAvatar } from "../game/GuestAvatar";
import { SceneChatStream } from "./SceneChatStream";
import "./ep04-free-activity.css";

const names: Record<GuestId,string> = { ZZX:"朱志鑫", SXH:"苏新皓", ZJ:"张极", ZZY:"张泽禹", ZH:"左航" };

export function Ep04FreeActivity({ mode, progress, activeScene, onProgress, onActiveScene, onFinish, onBack, archiveOnly=false }: {
  mode: string;
  progress: Ep04FreeActivityProgress;
  activeScene?: Ep04FreeSceneId;
  onProgress: (id: Ep04FreeSceneId, next: Ep04FreeSceneProgress) => void;
  onActiveScene: (id: Ep04FreeSceneId) => void;
  onFinish: () => void;
  onBack: () => void;
  archiveOnly?: boolean;
}) {
  const scenes = useMemo(() => ep04FreeActivityScenes(mode), [mode]);
  const [camera, setCamera] = useState<Ep04FreeSceneId>(activeScene ?? scenes[0].id);
  const [replaying, setReplaying] = useState(false);
  const [replayLine, setReplayLine] = useState(0);
  const scene = scenes.find(row => row.id === camera) ?? scenes[0];
  const saved = progress[scene.id] ?? { line:0, watched:false, complete:false, auto:false };
  const replayFinished = replaying && replayLine >= scene.lines.length;
  const shownCount = replaying ? Math.min(replayLine,scene.lines.length) : Math.min(saved.line,scene.lines.length);
  const hasWatched = scenes.some(row => Boolean(progress[row.id]?.watched));

  const selectCamera = (id: Ep04FreeSceneId) => {
    if (saved.auto) onProgress(scene.id,{...saved,auto:false});
    setCamera(id); onActiveScene(id); setReplaying(false); setReplayLine(0);
  };
  const advance = () => {
    if (replaying) { setReplayLine(value => Math.min(value + 1,scene.lines.length)); return; }
    if (saved.line >= scene.lines.length) return;
    const line = saved.line + 1;
    onProgress(scene.id,{...saved,line,watched:true,complete:line >= scene.lines.length,auto:saved.auto && line < scene.lines.length});
  };
  const toggleAuto = () => {
    if (replaying) { setReplaying(false); setReplayLine(0); return; }
    if (saved.complete) return;
    onProgress(scene.id,{...saved,auto:!saved.auto});
  };
  const startReplay = () => { onProgress(scene.id,{...saved,auto:false}); setReplayLine(0); setReplaying(true); };

  useEffect(() => {
    if (!replaying || replayFinished) return;
    const row=scene.lines[Math.min(replayLine,scene.lines.length-1)];
    const delay=Math.min(5000,Math.max(1500,1000+row.text.length*42+(row.speaker==="STAGE"?700:0)));
    const timer=window.setTimeout(()=>setReplayLine(value=>Math.min(value+1,scene.lines.length)),delay);
    return()=>window.clearTimeout(timer);
  },[replaying,replayFinished,replayLine,scene]);
  useEffect(() => {
    if (!saved.auto || replaying || saved.complete) return;
    const row=scene.lines[Math.min(saved.line,scene.lines.length-1)];
    const delay=Math.min(5000,Math.max(1500,1000+row.text.length*42+(row.speaker==="STAGE"?700:0)));
    const timer=window.setTimeout(advance,delay);
    return()=>window.clearTimeout(timer);
  },[saved.auto,saved.line,saved.complete,replaying,scene]);

  return <main className="ep04-freecam" aria-label="EP04下午自由活动节目监控">
    <header className="ep04-free-head"><div><small>EP.04 · FREE ACTIVITY · 15:30—16:15</small><h1>下午自由活动</h1><p>三段分时拍摄。切换机位会停止当前自动播放，各机位进度独立保存。</p></div><button onClick={onBack}>返回桌面</button></header>
    <nav className="ep04-free-cameras" aria-label="下午自由活动机位">{scenes.map((row,index)=>{const status=progress[row.id];return <button key={row.id} className={camera===row.id?"active":""} onClick={()=>selectCamera(row.id)}><small>{row.camera} · {row.time}</small><b>{row.title}</b><span>{row.participants.map(id=>names[id]).join(" × ")}</span><i>{status?.complete?"已录完":status?.watched?"录制中":"未观看"}</i></button>;})}</nav>
    <section className="ep04-free-screen">
      <div className="ep04-free-visual" style={{backgroundImage:`linear-gradient(0deg,#171319bb,#17131918),url('${assets[scene.background]}')`}}>
        <small>● REC · {scene.id} · {scene.camera}</small><b>{scene.location} · {scene.time}</b>
        <div className="ep04-free-cast">{scene.participants.map(id=><span key={id}><GuestAvatar id={id} className="season-avatar"/>{names[id]}</span>)}</div>
        <h2>{scene.title}</h2>
      </div>
      <SceneChatStream sceneId={scene.id} rows={scene.lines} shownCount={shownCount} auto={replaying||saved.auto} label={`${scene.camera} · ${scene.location} · ${scene.time}`} speakerName={id=>names[id]??id}/>
      <div className="ep04-free-tools"><span>{replaying?"素材回放 · 不重复结算":saved.complete?"本机位录制完成":"现场录制中"} · {shownCount}/{scene.lines.length}</span><div>{saved.complete&&!replaying&&<button onClick={startReplay}>回放素材</button>}<button onClick={toggleAuto} disabled={!replaying&&saved.complete}>{replaying?"停止回放":saved.auto?"暂停":"自动播放"}</button><button className="ep04-free-next" onClick={replayFinished?()=>{setReplaying(false);setReplayLine(0);}:advance} disabled={!replaying&&saved.complete}>{replaying?(replayFinished?"退出回放":"下一条"):(saved.complete?"本段已录完":"下一条对白")}</button></div></div>
      <div className="ep04-free-clips"><small>本机位已录入素材库</small>{scene.clips.map(clip=><span key={clip.id}><b>{clip.title}</b><em>{clip.id}</em><small>{clip.theme}</small></span>)}</div>
    </section>
    <footer className="ep04-free-footer"><p>{archiveOnly?"素材回放只供复看，不改变已完成阶段。":hasWatched?`已观看 ${scenes.filter(row=>progress[row.id]?.watched).length}/3 个机位；其余镜头可之后从素材库回看。`:"至少观看一段实际互动后，才能结束自由活动。"}</p>{archiveOnly?<button onClick={onBack}>返回节目进度</button>:<button onClick={onFinish} disabled={!hasWatched}>结束自由活动 · 进入后采</button>}</footer>
  </main>;
}
