import { useMemo, useState } from "react";
import { BookOpen, Check, ChevronRight, LockKeyhole, MailOpen, RotateCcw } from "lucide-react";
import type { GuestId } from "../game/day1-data";
import { ep04ClipIds, ep04LetterMaterials, ep04Reaction } from "../game/ep04-letter-data";
import "./ep04-letter-reading.css";

export type Ep04LetterProgress = Partial<Record<GuestId, { opened?: boolean; expanded?: boolean; read?: boolean; reactionViewed?: boolean; observationViewed?: boolean }>>;
const guestNames: Record<GuestId, string> = { ZZX: "朱志鑫", SXH: "苏新皓", ZJ: "张极", ZZY: "张泽禹", ZH: "左航" };

export function Ep04LetterReading({ mode, formalExPairs, progress, readingOrder, onProgress, onRecord, onComplete }: {
  mode: string; formalExPairs: [GuestId, GuestId][]; progress: Ep04LetterProgress; readingOrder?:GuestId[]; onProgress: (next: Ep04LetterProgress) => void;
  onRecord: (clipId: string, progress: Ep04LetterProgress) => void; onComplete: (progress:Ep04LetterProgress) => void;
}) {
  const baseMaterials = useMemo(() => ep04LetterMaterials(mode, formalExPairs), [mode, formalExPairs]);
  const materials = useMemo(() => {const order=new Map((readingOrder??[]).map((id,index)=>[id,index]));return [...baseMaterials].sort((a,b)=>(order.get(a.recipientId)??99)-(order.get(b.recipientId)??99));},[baseMaterials,readingOrder]);
  const [active, setActive] = useState<GuestId>(()=>materials.find(item=>!progress[item.recipientId]?.observationViewed)?.recipientId??materials[0].recipientId);
  const [showReaction, setShowReaction] = useState(false);
  const [showObservation, setShowObservation] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const material = materials.find((item) => item.recipientId === active)!;
  const status = progress[active] ?? {};
  const completed = materials.filter((item) => progress[item.recipientId]?.reactionViewed&&progress[item.recipientId]?.observationViewed).length;
  const sequenceComplete=(value:Ep04LetterProgress)=>materials.every(item=>value[item.recipientId]?.read&&value[item.recipientId]?.reactionViewed&&value[item.recipientId]?.observationViewed);
  const nextIndex=materials.findIndex(item=>!progress[item.recipientId]?.observationViewed);
  const nextProgress = (next: NonNullable<Ep04LetterProgress[GuestId]>) => ({ ...progress, [active]: { ...status, ...next } });
  const patch = (next: NonNullable<Ep04LetterProgress[GuestId]>) => onProgress(nextProgress(next));
  const open = () => { patch({ opened: true }); };
  const expand = () => { patch({ expanded: true }); };
  const markRead = () => { const updated = nextProgress({ read: true }); if (!status.read) onRecord(ep04ClipIds(active).body, updated); else onProgress(updated); setShowReaction(true); };
  const finishReaction = () => {
    const updated = nextProgress({ reactionViewed: true });
    if (!status.reactionViewed) onRecord(ep04ClipIds(active).reaction, updated); else onProgress(updated);
    setShowReaction(false); setShowObservation(true);
  };
  const finishSession = () => {if(sequenceComplete(progress))onComplete(progress);};

  return <section className="ep04-reading" aria-label="EP04介绍信阅读">
    <header className="ep04-reading-head"><small>CAM 02 · LETTER ROOM · 13:00</small><h2>写给X的信</h2><p>信件均为本季虚构平行世界原创内容。作者在EP10前不公开；无正式X者阅读节目组个人介绍卡。</p></header>
    <nav className="ep04-reader-tabs" aria-label="阅读嘉宾"><span>本轮阅读</span>{materials.map((item, index) => {
      const read = Boolean(progress[item.recipientId]?.read);
      const blocked=nextIndex>=0&&index>nextIndex;
      return <button key={item.recipientId} className={active === item.recipientId ? "active" : ""} disabled={blocked} onClick={() => { setActive(item.recipientId); setShowReaction(false); setShowObservation(false); setCollapsed(false); }} aria-current={active === item.recipientId ? "step" : undefined}>
        <b>{String(index + 1).padStart(2, "0")}</b><span>{guestNames[item.recipientId]}</span>{read && <Check size={13} aria-label="已读"/>}
      </button>;
    })}</nav>
    <div className="ep04-letter-stage">
      <div className="ep04-envelope" aria-hidden="true"><MailOpen size={26}/><span>TOP · PERSONAL LETTER</span><b>{guestNames[active]}</b></div>
      <div className="ep04-letter-card">
        <div className="ep04-letter-meta"><small>{material.label}</small><span>{status.read ? "已读 · 可重新查看" : "尚未阅读"}</span></div>
        <h3>{material.title}</h3>
        {!status.opened && <><p className="ep04-sealed-note">信封没有署名。请先拆封，再展开本轮完整内容。</p><button className="ep04-letter-primary" onClick={open}><MailOpen size={16}/>点击拆封</button></>}
        {status.opened && !status.expanded && <><p className="ep04-sealed-note">封面已打开。正文只在导演工作机上显示，播出与否由你在剪辑室决定。</p><button className="ep04-letter-primary" onClick={expand}><BookOpen size={16}/>展开信件</button></>}
        {status.expanded && !showReaction && collapsed && <button className="ep04-letter-collapsed" onClick={() => setCollapsed(false)}><BookOpen size={14}/>信件已收起 · 点击重新展开</button>}
        {status.expanded && !showReaction && !collapsed && <>
          <article className="ep04-letter-body" aria-label={`${guestNames[active]}阅读的信件全文`}>
            {material.body.split(/\r?\n\r?\n+/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </article>
          <div className="ep04-letter-actions"><button onClick={() => setCollapsed(true)}>收起信件</button><button onClick={() => setShowReaction(true)}><RotateCcw size={15}/>继续观看反应</button><button className="ep04-letter-primary" onClick={markRead}>{status.read ? "已读 · 查看反应" : "读完信件 · 查看反应"}<ChevronRight size={16}/></button></div>
        </>}
        {showReaction && !showObservation && <div className="ep04-reaction"><small>CAM 03 · READER REACTION</small><h3>{guestNames[active]}读信后的反应</h3>{ep04Reaction(active, mode).map((line, index) => <p key={index} className={line.includes("：“") ? "spoken" : "action"}>{line}</p>)}<button className="ep04-letter-primary" onClick={finishReaction}><Check size={16}/>{status.reactionViewed ? "反应已记录 · 查看观察镜头" : "收录本段反应素材"}</button><button className="ep04-reopen" onClick={() => setShowReaction(false)}>重新查看信件</button></div>}
        {showObservation && <div className="ep04-reaction ep04-observation"><small>CAM 04 · OTHER GUESTS</small><h3>其他嘉宾的观察反应</h3><p className="action">镜头从读信人移向桌边其余四位嘉宾。大家停下手边动作，等读信的人把信纸收好；没有人追问信件作者。</p><p className="ep04-observation-note">只记录现场安静与视线变化，不展示也不推断信件署名。</p><button className="ep04-letter-primary" onClick={() => { const updated = nextProgress({ observationViewed: true }); if(!status.observationViewed) onRecord(`EP04-LETTER-OBSERVERS-${active}`, updated); else onProgress(updated); setShowObservation(false);const next=materials.find(item=>item.recipientId!==active&&!updated[item.recipientId]?.observationViewed);if(next)setActive(next.recipientId); }}><Check size={16}/>{status.observationViewed ? "观察镜头已录" : "收录其他嘉宾观察反应"}</button><button className="ep04-reopen" onClick={() => setShowObservation(false)}>返回读信反应</button></div>}
      </div>
    </div>
    <footer className="ep04-reading-foot"><span><LockKeyhole size={13}/>姓名与正式X映射在EP10前封存</span><strong>已读 {materials.filter((item) => progress[item.recipientId]?.read).length}/5 · 反应素材 {completed}/5</strong></footer>
    {sequenceComplete(progress) && <button className="ep04-letter-primary ep04-next" onClick={finishSession}>五份读信流程均已完成 · 继续本期 <ChevronRight size={16}/></button>}
  </section>;
}
