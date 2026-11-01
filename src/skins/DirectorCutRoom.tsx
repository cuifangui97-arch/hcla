import { useState } from "react";
import { ArrowDown, ArrowUp, Clapperboard, Eye, LockKeyhole, Play, ShieldCheck, Video } from "lucide-react";
import "./director-cut-room.css";

export type CutStyle = "friendship" | "romance" | "conflict" | "ensemble";
export type CutClip = {
  clipId: string; episodeId: string; sceneId: string; recordedAt: string; location: string;
  camera: string; guests: string[]; summary: string; preview: string[]; watched: boolean;
  spoiler?: boolean; publicEligible?: boolean;
  sourceEventId?: string; participants?: string[]; dialogueSnapshot?: string[];
  occurred?: boolean; recorded?: boolean; viewedByDirector?: boolean; aired?: boolean; privacyMask?: string[];
};
export type CutDraft = { selectedClipIds: string[]; clipOrder: string[]; editingStyle: CutStyle | ""; previewState: { seenClipIds: string[]; entered: boolean }; stage: 1 | 2 | 3; broadcastId?: string; publishedAt?: number };
const styles: { id: CutStyle; title: string; note: string }[] = [
  { id: "friendship", title: "友情纪实", note: "保留生活感与完整上下文" },
  { id: "romance", title: "暧昧聚焦", note: "停留在真实照顾与眼神细节" },
  { id: "conflict", title: "修罗场反差", note: "呈现真实分歧及前后反应" },
  { id: "ensemble", title: "均衡群像", note: "让本期真实出场者都有位置" },
];

export function DirectorCutRoom({ episode, clips, draft, onDraft, onPublish, onReplay, exactCount, minCount }: {
  episode: number; clips: CutClip[]; draft: CutDraft; onDraft: (next: CutDraft) => void;
  onPublish: (payload: { selectedClipIds: string[]; clipOrder: string[]; editingStyle: CutStyle; broadcastId: string; publishedAt: number }) => void;
  onReplay?: (clipId: string) => void;
  exactCount?: number;
  minCount?: number;
}) {
  const [previewId, setPreviewId] = useState("");
  const usable = clips.filter(c => c.publicEligible !== false);
  const selected = new Set(draft.selectedClipIds);
  const ordered = draft.clipOrder.map(id => usable.find(c => c.clipId === id)).filter((c): c is CutClip => Boolean(c && selected.has(c.clipId)));
  const patch = (next: Partial<CutDraft>) => onDraft({ ...draft, ...next });
  const toggle = (id: string) => {
    if(!draft.selectedClipIds.includes(id)&&exactCount&&draft.selectedClipIds.length>=exactCount)return;
    const next = draft.selectedClipIds.includes(id) ? draft.selectedClipIds.filter(x => x !== id) : [...draft.selectedClipIds, id];
    patch({ selectedClipIds: next, clipOrder: [...draft.clipOrder.filter(x => next.includes(x)), ...next.filter(x => !draft.clipOrder.includes(x))] });
  };
  const move = (id: string, delta: number) => {
    const order = [...draft.clipOrder]; const from = order.indexOf(id); const to = from + delta;
    if (from < 0 || to < 0 || to >= order.length) return;
    [order[from], order[to]] = [order[to], order[from]]; patch({ clipOrder: order });
  };
  const openPreview = (clip: CutClip) => { setPreviewId(clip.clipId); patch({ previewState: { ...draft.previewState, seenClipIds: [...new Set([...draft.previewState.seenClipIds, clip.clipId])] } }); onReplay?.(clip.clipId); };
  const requiredCount = exactCount ?? minCount ?? 3;
  const canReview = (exactCount?ordered.length===exactCount:ordered.length>=requiredCount) && Boolean(draft.editingStyle);
  const hasRequiredCount = exactCount ? ordered.length===exactCount : ordered.length>=requiredCount;
  const publish = () => {
    if (!canReview || draft.broadcastId) return;
    const broadcastId = globalThis.crypto?.randomUUID?.() ?? `ep${episode}-${Date.now().toString(36)}`;
    const publishedAt = Date.now();
    patch({ broadcastId, publishedAt });
    onPublish({ selectedClipIds: ordered.map(c => c.clipId), clipOrder: ordered.map(c => c.clipId), editingStyle: draft.editingStyle as CutStyle, broadcastId, publishedAt });
  };
  const previewClip = usable.find(c => c.clipId === previewId);
  return <main className="cut-room" aria-label={`EP.${String(episode).padStart(2,"0")} 剪辑室`}>
    <header className="cut-head"><small><Clapperboard size={14}/> EDIT · EP.{String(episode).padStart(2,"0")}</small><h1>{draft.broadcastId ? "本期已播出" : "导演剪辑室"}</h1><p>素材只来自本局已录制的镜头。回看不会重复结算剧情或舆论。</p></header>
    <nav className="cut-steps" aria-label="剪辑步骤">{["素材选片","剪辑重点","播出预览"].map((x,i)=><button key={x} className={draft.stage===i+1?"active":""} onClick={()=>i===0?patch({stage:1}):i===1&&hasRequiredCount?patch({stage:2}):i===2&&canReview?patch({stage:3}):undefined} disabled={(i===1&&!hasRequiredCount)||(i===2&&!canReview)}><b>0{i+1}</b>{x}</button>)}</nav>
    {draft.stage===1&&<section className="cut-stage"><div className="cut-stage-title"><div><small>RECORDED FOOTAGE</small><h2>本期素材库</h2></div><span>{draft.selectedClipIds.length} 段已选 · {exactCount?`恰好选择 ${exactCount} 段`:`至少选择 ${requiredCount} 段`}</span></div>
      {!usable.length?<div className="cut-empty"><Video/><b>还没有可用录像</b><p>先完成本期拍摄。只有实际录制的镜头会出现在这里。</p></div>:<div className="cut-assets">{clips.map((clip,i)=>{const available=clip.publicEligible!==false;const chosen=selected.has(clip.clipId);return <article className={`cut-asset ${chosen?"chosen":""} ${!available?"locked":""}`} key={clip.clipId}>
        <div className={`cut-thumb tone-${i%4}`}><span>{clip.camera}</span><b>{clip.recordedAt}</b><button aria-label={`预览 ${clip.sceneId}`} disabled={!available} onClick={()=>openPreview(clip)}><Play size={17}/></button></div>
        <div className="cut-asset-main"><div className="cut-asset-title"><h3>{available?clip.sceneId:`${clip.episodeId} · 保密镜头`}</h3>{clip.spoiler&&<span className="cut-spoiler"><LockKeyhole size={12}/>{available?"含保密信息":"保密锁定"}</span>}</div><p>{clip.summary}</p><small>{clip.watched||draft.previewState.seenClipIds.includes(clip.clipId)?"导演已看过":"尚未回看"} · {available?clip.clipId:"内部素材"} · {clip.episodeId} · {clip.location} · 出场：{clip.guests.join("、")||"嘉宾"}</small><div className="cut-asset-actions"><button disabled={!available} onClick={()=>openPreview(clip)}><Eye size={14}/>{draft.previewState.seenClipIds.includes(clip.clipId)?"已回看 · 再看":"回看素材"}</button><button disabled={!available||(!chosen&&draft.selectedClipIds.length>=(exactCount??8))} className={chosen?"selected":""} onClick={()=>toggle(clip.clipId)}>{chosen?"取消选片":"选入正片"}</button></div></div>
      </article>})}</div>}
      <div className="cut-bottom-note">{exactCount?(draft.selectedClipIds.length<exactCount?`还差 ${exactCount-draft.selectedClipIds.length} 段，选择完成后才能进入剪辑重点。`:"已选足三段，可进入剪辑重点并调整播出顺序。"):(draft.selectedClipIds.length<requiredCount?`还差 ${requiredCount-draft.selectedClipIds.length} 段，选择完成后才能进入剪辑重点。`:"已满足最少选片数量；可继续增选，并在预览阶段调整播出顺序。")}</div>
      <button className="cut-primary" disabled={exactCount?draft.selectedClipIds.length!==exactCount:draft.selectedClipIds.length<requiredCount} onClick={()=>patch({stage:2})}>选择剪辑重点 <span>›</span></button>
    </section>}
    {draft.stage===2&&<section className="cut-stage"><div className="cut-stage-title"><div><small>EDITORIAL FOCUS</small><h2>决定本期讲述重点</h2></div><span>不改写素材事实</span></div><div className="cut-style-grid">{styles.map(style=><button key={style.id} className={draft.editingStyle===style.id?"chosen":""} onClick={()=>patch({editingStyle:style.id})}><span className={`cut-style-mark ${style.id}`}>{style.id==="friendship"?"日":style.id==="romance"?"心":style.id==="conflict"?"反":"群"}</span><b>{episode===9?({friendship:"日出纪实",romance:"最后约会",conflict:"礼物错位",ensemble:"群像伏笔"}[style.id]):episode===6?({friendship:"温馨群像",romance:"暧昧聚焦",conflict:"修罗场对比",ensemble:"熟悉的痕迹"}[style.id]):style.title}</b><small>{episode===9?({friendship:"保留清晨路线、天气和日出现场",romance:"聚焦实际接受的最后约会与个人活动",conflict:"呈现真实送礼机制与收礼差异",ensemble:"平衡本期实际拍摄的不同场景"}[style.id]):episode===6?({friendship:"生活实感与留守者贡献",romance:"只聚焦实际录制到的互动",conflict:"交叉剪辑真实组合，不虚构嫉妒",ensemble:"保留镜头里的长期默契"}[style.id]):style.note}</small>{draft.editingStyle===style.id&&<i>已选择</i>}</button>)}</div><div className="cut-style-explainer"><ShieldCheck size={16}/><span>剪辑风格会影响旁白、镜头侧重与观众解读，不会增加素材中没有发生的事件；EP10前保密信息不会进入普通观众版。</span></div><div className="cut-footer-actions"><button onClick={()=>patch({stage:1})}>返回选片</button><button className="cut-primary" disabled={!draft.editingStyle} onClick={()=>patch({stage:3,previewState:{...draft.previewState,entered:true}})}>生成播出预览 <span>›</span></button></div></section>}
    {draft.stage===3&&<section className="cut-stage"><div className="cut-stage-title"><div><small>BROADCAST PREVIEW</small><h2>正片播出预览</h2></div><span>{styles.find(x=>x.id===draft.editingStyle)?.title}</span></div><ol className="cut-preview-list">{ordered.map((clip,index)=><li key={clip.clipId}><div className={`cut-preview-art tone-${index%4}`}><span>0{index+1}</span><button onClick={()=>openPreview(clip)} aria-label={`播放 ${clip.sceneId}`}><Play size={17}/></button></div><div className="cut-preview-copy"><b>{clip.sceneId}</b><p>{clip.summary}</p><small>{clip.recordedAt} · {clip.location} · {clip.camera}</small></div><div className="cut-order"><button disabled={index===0||Boolean(draft.broadcastId)} onClick={()=>move(clip.clipId,-1)} aria-label="向前移动"><ArrowUp size={15}/></button><button disabled={index===ordered.length-1||Boolean(draft.broadcastId)} onClick={()=>move(clip.clipId,1)} aria-label="向后移动"><ArrowDown size={15}/></button></div></li>)}</ol>
      <div className="cut-audit"><ShieldCheck size={17}/><div><b>{draft.broadcastId?"已完成保密审核":"播出前保密审核"}</b><p>{ordered.some(c=>c.spoiler)?"所选镜头中包含受保护信息，已在普通观众版中遮蔽；导演版保留原始镜头。":"入选镜头未包含当前阶段禁止公开的X身份或短信对象。"} 舆论只依据上方入选片段更新。</p></div></div>
      {draft.broadcastId?<div className="cut-published">本期已发布 · {draft.publishedAt?new Date(draft.publishedAt).toLocaleString():""}<br/>重复打开或回看不会再次生成舆论批次。</div>:<div className="cut-footer-actions"><button onClick={()=>patch({stage:2})}>返回调整</button><button className="cut-primary" onClick={publish}><Clapperboard size={16}/>确认剪辑并播出</button></div>}
    </section>}
    {previewClip&&<div className="cut-modal" role="dialog" aria-modal="true" aria-label="素材预览" onClick={()=>setPreviewId("")}><article onClick={e=>e.stopPropagation()}><button className="cut-modal-close" onClick={()=>setPreviewId("")}>关闭</button><div className="cut-modal-screen"><span>{previewClip.camera} · {previewClip.recordedAt}</span><Video size={28}/><b>{previewClip.location}</b></div><h2>{previewClip.sceneId}</h2><p>{previewClip.summary}</p><div className="cut-transcript">{previewClip.preview.map((line,i)=><p key={i}>{line}</p>)}</div><small>{previewClip.guests.join("、")} · {previewClip.episodeId} · {previewClip.watched?"拍摄时已观看":"本次为导演首次回看"}</small></article></div>}
  </main>;
}
