import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Film, Heart, LockKeyhole, RotateCcw, Video } from "lucide-react";
import type { Runtime, UiValue, Work, Item } from "../schema";
import { assets, arrivalScenes, dinnerLines, getXNoticeForInbox, guests, interviewAnswers, interviewQuestions, nightScenes, pairScenes, readSavedRelationshipHistory, type GuestId, type ScriptLine, type SceneScript } from "../game/day1-data";
import { associatedAudienceShips, buildWeiboDynamics, fingerprintBroadcast, makeSuperTopicPosts, type BroadcastClip, type WeiboDynamics, type WeiboPost } from "../game/weibo-dynamics";
import { buildSocialBatch, corpusItemTitle, corpusPersonaLabel, corpusReplies, eventsForDayOneClips } from "../game/social/corpus";
import type { SkinProps } from "../AppSkins";
import { GuestAvatar } from "../game/GuestAvatar";
import { SceneChatStream, sceneSpeakerName } from "./SceneChatStream";
import { deriveKcSmsOutcome, kcEmotionalReaction, kcSmsFlagsFromDeliveries, type KcNightPlace, type KcSmsOutcome } from "../game/kc-night";
import { KcNightExperience } from "./KcNightExperience";
import { episodeManifest } from "../persistence";
import { DirectorCutRoom, type CutClip, type CutDraft, type CutStyle } from "./DirectorCutRoom";
import { selectSmsBatch, smsSemanticEvents, smsUsageFromGameUi, type FrozenSms } from "../game/sms-corpus";
import "./day-one.css";

export type DayOnePhase = "intro" | "arrivals" | "roles" | "kitchen" | "dinner" | "night" | "interview" | "sms" | "kcNight" | "edit" | "social" | "complete";
export type DayOneState = {
  phase: DayOnePhase;
  seed: string;
  arrivalScene: number;
  arrivalLine: number;
  roles: Partial<Record<GuestId, "主厨" | "助手" | "餐桌">>;
  kitchenLine: number;
  dinnerLine: number;
  dinnerFocus: string;
  nightCamera: string;
  nightProgress: Record<string, number>;
  nightViewed: string[];
  playbackStatus: Record<string, "playing" | "paused" | "complete">;
  interviews: Record<string, { question: string; answer: string }>;
  interviewGuests: GuestId[];
  interviewGuest: string;
  smsLocked: GuestId[];
  smsIds: Partial<Record<GuestId, string>>;
  smsFrozen?: Partial<Record<GuestId, FrozenSms>>;
  smsSent: boolean;
  zhuzhixinSentToSuxinhao: boolean;
  suxinhaoSentToZhuzhixin: boolean;
  kcSmsOutcome: KcSmsOutcome | "";
  kcEmotionalReaction: string;
  kcNightConversationViewed: boolean;
  kcNightConversationAired: boolean;
  kcNightPlace: KcNightPlace;
  kcNightProgress: Partial<Record<KcNightPlace, number>>;
  selectedClips: string[];
  cut: string;
  clipOrder?: string[];
  editStage?: 1 | 2 | 3;
  previewState?: { seenClipIds: string[]; entered: boolean };
  broadcastId?: string;
  publishedAt?: number;
  socialVisited: string[];
  eventStatus: Record<string, { happened: boolean; recorded: boolean; watched: boolean; aired: boolean }>;
};

export const dayOneDefault = (): DayOneState => ({
  phase: "intro", seed: Math.random().toString(36).slice(2, 12), arrivalScene: 0, arrivalLine: 0,
  roles: {}, kitchenLine: 0, dinnerLine: 0, dinnerFocus: "ensemble", nightCamera: "D01-009A",
  nightProgress: {}, nightViewed: [], playbackStatus: {}, interviews: {}, interviewGuests: [], interviewGuest: "", smsLocked: [], smsIds: {}, smsSent: false,
  zhuzhixinSentToSuxinhao: false, suxinhaoSentToZhuzhixin: false, kcSmsOutcome: "", kcEmotionalReaction: "", kcNightConversationViewed: false, kcNightConversationAired: false, kcNightPlace: "客厅", kcNightProgress: {},
  selectedClips: [], cut: "", clipOrder: [], editStage: 1, previewState: { seenClipIds: [], entered: false }, socialVisited: [], eventStatus: {},
});
export function readDayOne(ui?: Record<string, UiValue>): DayOneState {
  const fallback = dayOneDefault();
  const raw = ui?.day1;
  if (typeof raw !== "string") return fallback;
  try { return { ...fallback, ...(JSON.parse(raw) as Partial<DayOneState>) }; }
  catch { return fallback; }
}

const asset = (key: string) => assets[key as keyof typeof assets] ?? assets.livingRoom;
const guest = (id: string) => guests.find((x) => x.id === id);
const nameOf = (id: string) => guest(id)?.name ?? id;
const idOf = (name: string) => guests.find((x) => x.name === name)?.id;
const imageStyle = (key: string, night = false) => ({ backgroundImage: `${night ? "linear-gradient(0deg,#0d1221a8,#10162448)," : "linear-gradient(0deg,#181914ad,#19191628),"}url("${asset(key)}")` });

type Props = SkinProps & { appId: string; state: Runtime; work: Work; onAction: (event: string, target: string) => void; onNewGame: () => void };
export function useDayOne(p: Props) {
  const state = readDayOne(p.gameUi);
  const save = (next: DayOneState) => p.onGameUi?.("day1", JSON.stringify(next));
  useEffect(() => {
    if (typeof p.gameUi?.day1 !== "string") save(state);
  }, [p.gameUi?.day1]);
  return { state, save };
}

function Header({ label, title, sub }: { label: string; title: string; sub: string }) {
  return <header className="d1-header"><small>{label}</small><div><h1>{title}</h1><p>{sub}</p></div></header>;
}
function GuestStrip({ ids, active }: { ids: string[]; active: string }) {
  return <div className="d1-guests">{ids.map((id) => { const g = guest(id); return g ? <div key={id} className={`d1-guest ${id === active ? "active" : ""}`}><GuestAvatar id={id as GuestId} className="d1-guest-photo"/><small>{g.name}</small></div> : null; })}</div>;
}
function RecordView({ scene, lineIndex, onNext, onBack, onNextScene, guestIds, camera, onCamera, replaying, onPlayPause, auto, onJumpLatest, archiveCount, onOpenArchive }: {
  scene: SceneScript; lineIndex: number; onNext: () => void; onBack?: () => void; onNextScene?: () => void; guestIds: string[]; camera: string; onCamera?: (id: string) => void; replaying?: boolean; onPlayPause?: () => void; auto?: boolean; onJumpLatest?: () => void; archiveCount?: number; onOpenArchive?: () => void;
}) {
  const row = scene.lines[Math.min(lineIndex, scene.lines.length - 1)];
  const finished = lineIndex >= scene.lines.length - 1;
  const cameraRows = nightScenes;
  return <div className="d1-camera-app">
    <Header label="TOP · DIRECTOR CAM" title="节目监控" sub={`${scene.time} · ${scene.place} · ${scene.id}`} />
    <div className="d1-camera-rail">{cameraRows.map((s, i) => <button key={s.id} className={camera === s.id ? "on" : ""} onClick={() => onCamera?.(s.id)}><small>CAM 0{i + 1}</small>{s.place}</button>)}</div>
    <div className="d1-monitor" style={imageStyle(scene.background, scene.id === "D01-009C")}>
      <div className="d1-monitor-top"><span><i/> REC · {scene.id}</span><time>{scene.time}</time></div>
      <div className="d1-monitor-badge">{scene.place}<b>{scene.title}</b></div>
      <GuestStrip ids={guestIds} active={row.speaker} />
      <div className="d1-monitor-bottom"><span>节目组工作手机 · 公共机位</span><span>DAY 1</span></div>
    </div>
      {archiveCount && onOpenArchive ? <button className="d1-library-link" onClick={onOpenArchive}><Film size={13}/>素材库 · {archiveCount} 段</button> : null}
    {replaying && <div className="d1-replay-banner"><RotateCcw size={14}/> 素材回放 · 只查看，不重复结算</div>}
    <SceneChatStream sceneId={scene.id} rows={scene.lines} shownCount={lineIndex + 1} auto={Boolean(auto)} label="现场连续记录" speakerName={sceneSpeakerName} onLatest={onJumpLatest}/>
    <div className="d1-player-bar">{onPlayPause && <button onClick={onPlayPause}>{auto ? "Ⅱ 暂停" : "▶ 自动播放"}</button>}<button onClick={onNext}>{finished ? (onNextScene ? "下一场景 ›" : "完成 ›") : "下一条 ›"}</button>{onBack && <button onClick={onBack}>返回桌面</button>}</div>
  </div>;
}

const roleChoices = ["主厨", "助手", "餐桌"] as const;
function RoleAssignment({ p, state, save }: { p: Props; state: DayOneState; save: (s: DayOneState) => void }) {
  const [draft, setDraft] = useState<Partial<Record<GuestId, "主厨" | "助手" | "餐桌">>>(state.roles);
  const counts = roleChoices.map((r) => Object.values(draft).filter((x) => x === r).length);
  const valid = counts[0] === 2 && counts[1] === 2 && counts[2] === 1 && guests.every((g) => draft[g.id]);
  const assign = (next: Partial<Record<GuestId, "主厨" | "助手" | "餐桌">>) => { setDraft(next); save({ ...state, roles: next }); };
  const choose = (id: GuestId, role: (typeof roleChoices)[number]) => {
    const next = { ...draft }; delete next[id];
    if (Object.values(next).filter((x) => x === role).length >= (role === "主厨" ? 2 : role === "助手" ? 2 : 1)) return;
    next[id] = role; assign(next);
  };
  const suggested = () => assign({ ZZX: "主厨", ZJ: "主厨", SXH: "助手", ZZY: "助手", ZH: "餐桌" });
  return <div className="d1-flow-card">
    <Header label="15:30 · DIRECTOR DECISION" title="入住第一餐" sub="五位嘉宾全员参与；角色不可重复。" />
    <div className="d1-role-counts">{roleChoices.map((r, i) => <span key={r} className={counts[i] === (i === 2 ? 1 : 2) ? "done" : ""}><b>{counts[i]}/{i === 2 ? 1 : 2}</b>{r}</span>)}</div>
    <div className="d1-role-list">{guests.map((g) => <section key={g.id} className="d1-role-row"><GuestAvatar id={g.id} className="d1-bubble-avatar"/><strong>{g.name}</strong><div>{roleChoices.map((role) => <button key={role} aria-pressed={draft[g.id] === role} className={draft[g.id] === role ? "selected" : ""} onClick={() => choose(g.id, role)}>{role}</button>)}</div></section>)}</div>
    <button className="d1-quiet-button" onClick={suggested}>使用节目组建议分工</button>
    <button className="d1-primary" disabled={!valid} onClick={() => { save({ ...state, phase: "kitchen", roles: draft, kitchenLine: 0, eventStatus: { ...state.eventStatus, "D01-007": { happened: true, recorded: true, watched: true, aired: false } } }); p.onAction("director:mission", "D1"); p.onNavigate?.("camera"); }}><Check size={17}/>确认分工并切入厨房</button>
  </div>;
}

const rolePair = (roles: DayOneState["roles"]) => (Object.keys(roles) as GuestId[]).filter((id) => roles[id] === "主厨").sort().join("-");
const pairKey = (key: string) => key.split("-").sort().join("-");

export function DayOneCamera({ p }: { p: Props }) {
  const { state, save } = useDayOne(p);
  const playbackKey = state.phase === "arrivals" ? `arrivals:${state.arrivalScene}` : state.phase === "night" ? `night:${state.nightCamera}` : state.phase;
  const [auto, setAuto] = useState(() => state.playbackStatus[playbackKey] === "playing");
  const autoRef = useRef(auto);
  const stopAuto = () => { autoRef.current = false; setAuto(false); };
  const toggleAuto = () => {
    autoRef.current = !autoRef.current;
    setAuto(autoRef.current);
    save({ ...state, playbackStatus: { ...state.playbackStatus, [playbackKey]: autoRef.current ? "playing" : "paused" } });
  };
  const [archive, setArchive] = useState(false);
  const [replayScene, setReplayScene] = useState(0);
  const mode = String(p.state.variables.gameMode || "A");
  const arrivalBase = arrivalScenes[Math.min(state.arrivalScene, arrivalScenes.length - 1)];
  const modeRecord = p.items.find((i) => i.folder === "D1" && i.meta?.kind === "mode" && i.meta?.mode === mode);
  const modeLines = state.arrivalScene === arrivalScenes.length - 1 && modeRecord ? modeRecord.body.split("\n").map((row) => {
    const [speaker, ...text] = row.split("：");
    return { speaker: idOf(speaker) ?? "STAGE", text: text.join("：") } as ScriptLine;
  }).filter((x) => x.text) : [];
  const arrival = modeLines.length ? { ...arrivalBase, lines: [...arrivalBase.lines, ...modeLines] } : arrivalBase;
  const selectedPair = pairKey(rolePair(state.roles));
  const pair = Object.entries(pairScenes).find(([key]) => pairKey(key) === selectedPair)?.[1] ?? [];
  const kitchenTraits: ScriptLine[] = [
    { speaker: "STAGE", text: "朱志鑫趁分工间隙把煎蛋翻面，火候掌握得很熟练。" },
    { speaker: "STAGE", text: "苏新皓把沙拉碗放在手边，先吃了几口沙拉。" },
  ];
  const participationLines: ScriptLine[] = (Object.keys(state.roles) as GuestId[]).filter((id) => state.roles[id] !== "主厨").map((id) => {
    const role = state.roles[id];
    const lines: Record<GuestId, Record<string, string>> = {
      ZZX: { 助手: "切好的葱放这边了，灶台需要我搭把手就叫我。", 餐桌: "盘子我摆好了，煎蛋出锅就能装。" },
      SXH: { 助手: "沙拉我拌好了，先放在这边，等会儿大家都可以吃。", 餐桌: "餐具和沙拉都上桌了，我再检查一下人数。" },
      ZJ: { 助手: "葱切好了，我把刀收回去，免得等下找不到。", 餐桌: "杯子我先摆好，大家坐下就不用再找。" },
      ZZY: { 助手: "盘子已经按人数备好，差什么我再拿。", 餐桌: "五个位置都摆好了，筷子我再点一遍。" },
      ZH: { 助手: "水果洗好放在这边，台面我也留出位置了。", 餐桌: "桌面空出来了，菜端出来不用再挪东西。" },
    };
    return { speaker: id, text: lines[id][role ?? "助手"] } as ScriptLine;
  });
  const kitchenScript = [...pair, ...participationLines, ...kitchenTraits];
  const sceneStatus = (id: string, patch: Partial<DayOneState["eventStatus"][string]>) => {
    const current = { happened: true, recorded: true, watched: true, aired: false };
    Object.assign(current, state.eventStatus[id], patch);
    return { ...state.eventStatus, [id]: current };
  };
  const stepArrival = () => {
    const nextIndex = state.arrivalLine + 1;
    const status = sceneStatus(arrival.id, { watched: true });
    if (nextIndex < arrival.lines.length) save({ ...state, arrivalLine: nextIndex, eventStatus: status, playbackStatus: { ...state.playbackStatus, [playbackKey]: autoRef.current ? "playing" : "paused" } });
    else if (state.arrivalScene < arrivalScenes.length - 1) save({ ...state, arrivalScene: state.arrivalScene + 1, arrivalLine: 0, eventStatus: status, playbackStatus: { ...state.playbackStatus, [playbackKey]: "complete", [`arrivals:${state.arrivalScene + 1}`]: autoRef.current ? "playing" : "paused" } });
    else {
      stopAuto();
      save({ ...state, phase: "roles", eventStatus: { ...status, "D01-006": { happened: true, recorded: true, watched: true, aired: false } }, playbackStatus: { ...state.playbackStatus, [playbackKey]: "complete" } });
      p.onAction("director:record", "D1"); p.onNavigate?.("reminders");
    }
  };
  const stepKitchen = () => {
    const n = state.kitchenLine + 1;
    if (n < kitchenScript.length) save({ ...state, kitchenLine: n, playbackStatus: { ...state.playbackStatus, [playbackKey]: autoRef.current ? "playing" : "paused" } });
    else {
      stopAuto();
      save({ ...state, phase: "dinner", dinnerLine: 0, eventStatus: { ...state.eventStatus, "D01-KITCHEN": { happened: true, recorded: true, watched: true, aired: false } }, playbackStatus: { ...state.playbackStatus, [playbackKey]: "complete", dinner: autoRef.current ? "playing" : "paused" } });
    }
  };
  const stepDinner = () => {
    const n = state.dinnerLine + 1;
    if (n < dinnerLines.length) save({ ...state, dinnerLine: n, playbackStatus: { ...state.playbackStatus, [playbackKey]: autoRef.current ? "playing" : "paused" } });
    else { stopAuto(); save({ ...state, phase: "night", nightCamera: "D01-009A", nightProgress: {}, nightViewed: [], eventStatus: { ...state.eventStatus, "D01-008": { happened: true, recorded: true, watched: true, aired: false } }, playbackStatus: { ...state.playbackStatus, [playbackKey]: "complete", "night:D01-009A": autoRef.current ? "playing" : "paused" } }); }
  };
  const selectedNight = nightScenes.find((s) => s.id === state.nightCamera) ?? nightScenes[0];
  const nightIndex = state.nightProgress[selectedNight.id] ?? 0;
  const finishNightScene = () => {
    stopAuto();
    const viewed = [...new Set([...state.nightViewed, selectedNight.id])];
    const status = { ...state.eventStatus, [selectedNight.id]: { happened: true, recorded: true, watched: true, aired: false } };
    if (viewed.length === nightScenes.length) {
      save({ ...state, phase: "interview", nightViewed: viewed, eventStatus: status, playbackStatus: { ...state.playbackStatus, [playbackKey]: "complete" } });
      p.onNavigate?.("mail");
    } else {
      const nextScene = nightScenes.find((s) => !viewed.includes(s.id));
      save({ ...state, nightViewed: viewed, nightCamera: nextScene?.id ?? state.nightCamera, eventStatus: status, playbackStatus: { ...state.playbackStatus, [playbackKey]: "complete", ...(nextScene ? { [`night:${nextScene.id}`]: "paused" as const } : {}) } });
    }
  };
  const stepNight = () => {
    const n = nightIndex + 1;
    if (n < selectedNight.lines.length) save({ ...state, nightProgress: { ...state.nightProgress, [selectedNight.id]: n }, playbackStatus: { ...state.playbackStatus, [playbackKey]: autoRef.current ? "playing" : "paused" } });
    else finishNightScene();
  };
  const currentArrival = arrival.lines[Math.min(state.arrivalLine, arrival.lines.length - 1)];
  const readDelay = (line?: ScriptLine) => Math.min(5000, Math.max(1500, 1100 + (line?.text.length ?? 0) * 75 + (line?.speaker === "STAGE" ? 700 : 0)));
  const autoLine = state.phase === "arrivals" ? currentArrival : state.phase === "kitchen" ? kitchenScript[state.kitchenLine] : state.phase === "dinner" ? dinnerLines[state.dinnerLine] : state.phase === "night" ? selectedNight.lines[nightIndex] : undefined;
  const autoStep = state.phase === "arrivals" ? stepArrival : state.phase === "kitchen" ? stepKitchen : state.phase === "dinner" ? stepDinner : stepNight;
  useEffect(() => {
    if (!auto || !["arrivals", "kitchen", "dinner", "night"].includes(state.phase)) return;
    const timer = window.setTimeout(() => { if (autoRef.current) autoStep(); }, readDelay(autoLine));
    return () => window.clearTimeout(timer);
  }, [auto, state.phase, state.arrivalLine, state.arrivalScene, state.kitchenLine, state.dinnerLine, nightIndex, state.nightCamera, arrival.lines.length]);

  if (state.phase === "intro") return <div className="d1-intro" style={imageStyle("directorRoom")}>
    <div className="d1-intro-brand"><small>TOP SPECIAL · DIRECTOR'S CUT</small><p>曾经相爱的人</p><p>还能重新选择彼此吗？</p></div>
    <div className="d1-intro-card"><span>TRANSIT LOVE : TOP SPECIAL</span><h1>EP.01<br/>初次入住</h1><p>DAY 1 · 10:00—23:00<br/>节目组专用工作手机 · 离线试玩版</p><button className="d1-primary" onClick={() => save({ ...state, phase: "arrivals", arrivalScene: 0, arrivalLine: 0 })}><Video size={17}/>开始录制</button></div>
  </div>;
  if (state.phase === "kcNight") {
    const outcome = state.kcSmsOutcome || deriveKcSmsOutcome({ zhuzhixinSentToSuxinhao: state.zhuzhixinSentToSuxinhao, suxinhaoSentToZhuzhixin: state.suxinhaoSentToZhuzhixin });
    return <KcNightExperience episode={1} outcome={outcome} place={state.kcNightPlace ?? "客厅"} progress={state.kcNightProgress ?? {}} viewed={state.kcNightConversationViewed} onPlace={(place) => save({ ...state, kcNightPlace: place })} onProgress={(place, line) => save({ ...state, kcNightProgress: { ...state.kcNightProgress, [place]: line } })} onFinish={(place) => {
      if (!state.kcNightConversationViewed) p.onAction("director:record", "D01-KC-NIGHT");
      save({ ...state, phase: "edit", kcNightPlace: place, kcNightConversationViewed: true, kcNightConversationAired: state.kcNightConversationAired ?? false, eventStatus: { ...state.eventStatus, "D01-KC-NIGHT": { happened: true, recorded: true, watched: true, aired: false } } });
      p.onNavigate?.("bilibili");
    }} onBack={p.onBack ?? (() => {})}/>;
  }
  if (state.phase === "arrivals") {
    if (archive) {
      const scene = arrivalScenes[replayScene];
      return <div className="d1-camera-app"><Header label="CAM · MATERIAL LIBRARY" title="入住素材回放" sub="回放不会重新触发事件或关系变化"/><div className="d1-replay-list">{arrivalScenes.map((s, i) => <button key={s.id} className={i === replayScene ? "on" : ""} onClick={() => setReplayScene(i)}><Video size={16}/><span>{s.time} · {s.title}</span><small>{state.eventStatus[s.id]?.watched ? "已看" : "未看"}</small></button>)}</div><RecordView scene={scene} lineIndex={scene.lines.length - 1} onNext={() => setArchive(false)} onNextScene={() => setArchive(false)} guestIds={scene.lines.map((x) => x.speaker).filter((x) => x !== "STAGE")} camera="archive" replaying onBack={() => setArchive(false)}/></div>;
    }
    return <div className="d1-camera-app"><RecordView scene={arrival} lineIndex={state.arrivalLine} onNext={() => { stopAuto(); stepArrival(); }} onNextScene={() => { stopAuto(); stepArrival(); }} guestIds={guests.map((g) => g.id)} camera="D01-002" onPlayPause={toggleAuto} auto={auto} onBack={() => { stopAuto(); p.onBack(); }} archiveCount={state.arrivalScene + 1} onOpenArchive={() => { stopAuto(); setReplayScene(0); setArchive(true); }}/><div className="d1-camera-controls"><span>{mode ? "关系档案已加密 · 导演不可见" : "本季关系档案加密中"}</span></div></div>;
  }
  if (state.phase === "roles") return <div className="d1-camera-app d1-gate"><Header label="11:20 · DAY 1 COMPLETE" title="五位嘉宾全部入住" sub="下一项导演工作：分配入住第一餐。"/><div className="d1-gate-image" style={imageStyle("livingRoom")}><GuestStrip ids={guests.map((g) => g.id)} active=""/><span>五个人第一次坐在同一间客厅</span></div><button className="d1-primary" onClick={() => p.onNavigate?.("reminders")}>安排第一餐 <ArrowRight size={17}/></button></div>;
  if (state.phase === "kitchen") {
    const current = pair[Math.min(state.kitchenLine, Math.max(pair.length - 1, 0))] ?? { speaker: "STAGE" as const, text: "厨房分工已经确认。" };
    const ids = Object.keys(state.roles) as GuestId[];
    const scene: SceneScript = { id: "D01-KITCHEN", title: "晚餐准备 · 厨房", time: "16:30", place: "厨房", background: "kitchen", lines: kitchenScript.length ? kitchenScript : [current] };
    return <div className="d1-camera-app"><RecordView scene={scene} lineIndex={Math.min(state.kitchenLine, scene.lines.length - 1)} onNext={stepKitchen} onNextScene={stepKitchen} guestIds={ids} camera="D01-KITCHEN" onPlayPause={toggleAuto} auto={auto} onBack={() => { stopAuto(); p.onBack(); }}/><div className="d1-kitchen-footer"><span>当晚主厨 · {rolePair(state.roles).split("-").map(nameOf).join(" × ")}</span><small>分工记录已保存 · {pair.length} 句组合专属对白</small></div></div>;
  }
  if (state.phase === "dinner") {
    const scene: SceneScript = { id: "D01-008", title: "第一次五人晚餐", time: "18:30", place: "餐厅", background: "diningRoom", lines: dinnerLines };
    const current = dinnerLines[Math.min(state.dinnerLine, dinnerLines.length - 1)];
    return <div className="d1-camera-app"><RecordView scene={scene} lineIndex={state.dinnerLine} onNext={stepDinner} onNextScene={stepDinner} guestIds={current.speaker === "STAGE" ? guests.map((g) => g.id) : guests.map((g) => g.id)} camera="D01-008" onPlayPause={toggleAuto} auto={auto} onBack={() => { stopAuto(); p.onBack(); }}/><div className="d1-focus-pick"><p>导演监看重点</p>{[["ensemble","五人群像"],["GC","棍铲细节"],["JYZ","极禹航"],["random","生活反应"]].map(([id,label]) => <button key={id} className={state.dinnerFocus === id ? "on" : ""} onClick={() => save({ ...state, dinnerFocus: id })}>{label}</button>)}</div></div>;
  }
  if (state.phase === "night") {
    const title: SceneScript = { ...selectedNight, lines: selectedNight.lines };
    const progress = state.nightProgress[selectedNight.id] ?? 0;
    const onCamera = (id: string) => { stopAuto(); save({ ...state, nightCamera: id }); };
    return <div className="d1-camera-app"><div className="d1-night-switcher">{nightScenes.map((s, i) => <button key={s.id} onClick={() => onCamera(s.id)} className={state.nightCamera === s.id ? "on" : ""}><small>CAM 0{i + 1}</small>{s.place}<i>{state.nightViewed.includes(s.id) ? "✓" : "●"}</i></button>)}</div><RecordView scene={title} lineIndex={progress} onNext={stepNight} onNextScene={stepNight} guestIds={title.lines.map((x) => x.speaker).filter((x) => x !== "STAGE")} camera={state.nightCamera} onCamera={onCamera} onPlayPause={toggleAuto} auto={auto} onBack={() => { stopAuto(); p.onBack(); }}/><div className="d1-night-hint">其他机位仍在录制。切换不会重置进度，未读镜头可回放。</div></div>;
  }
  return <div className="d1-gate"><Header label="DAY 1" title="拍摄阶段已保存" sub="回到手机桌面，点按顶部的「继续录制」即可续播。"/><button className="d1-primary" onClick={() => p.onNavigate?.(state.phase === "interview" ? "mail" : state.phase === "sms" || state.phase === "kcNight" ? (state.phase === "sms" ? "messages" : "camera") : state.phase === "edit" ? "bilibili" : "camera")}>继续录制 <ArrowRight size={17}/></button></div>;
}

export function DayOneMission({ p }: { p: Props }) {
  const { state, save } = useDayOne(p);
  if (state.phase !== "roles") { const next=episodeManifest.find(item=>item.episode===2); return <div className="d1-flow-card"><Header label="DAY 1 · MISSION" title="入住第一餐" sub={state.phase === "complete" ? next?.available ? `EP.01已完成；EP.02《${next.title}》已开放。` : "EP.01已完成；下一期敬请期待。" : "导演组已记录当天分工。"}/><button className="d1-primary" onClick={() => p.onNavigate?.("camera")}>{state.phase === "complete" ? "查看录制完成页" : "回到CAM继续录制"}<ArrowRight size={17}/></button></div>; }
  return <RoleAssignment p={p} state={state} save={save}/>;
}

function modeSmsOptions(_items: Item[], _mode: string, _seed: string) {
  const out: Partial<Record<GuestId, Item[]>> = {};
  for (const g of guests) {
    out[g.id] = guests.filter((recipient) => recipient.id !== g.id).map((recipient) => ({
      id:`v17-route-D1-${g.id}-${recipient.id}`,title:`发送给${recipient.name}`,body:"",richText:"",
      meta:{senderId:g.id,recipient:recipient.id},time:"22:00",sender:g.name,avatar:"",kind:"text",media:"",hidden:false,unlock:"",password:"",folder:"D1",favorite:false,outgoing:true,read:false,likes:0,comments:[],
    }));
  }
  return out;
}
function noticeFor(recipient: GuestId, incoming: Item[], history: ReturnType<typeof readSavedRelationshipHistory>): string {
  return getXNoticeForInbox(recipient, incoming.map((m) => ({ senderId: String(m.meta?.senderId) as GuestId, recipientId: String(m.meta?.recipient) as GuestId })), history);
}

export function DayOneSms({ p }: { p: Props }) {
  const { state, save } = useDayOne(p);
  const history = readSavedRelationshipHistory(p.state.variables.topSeasonHistory, String(p.state.variables.gameMode || "A"));
  const mode = history.relationshipMode;
  const messages = useMemo(() => modeSmsOptions(p.items, mode, state.seed), [p.items, mode, state.seed]);
  const selectedId = (sender:GuestId) => {const options=messages[sender]??[];const stored=state.smsIds[sender];if(options.some(item=>item.id===stored))return stored;const legacy=p.items.find(item=>item.id===stored&&item.meta?.senderId===sender);const oldRecipient=legacy?.meta?.recipient;return options.find(item=>item.meta?.recipient===oldRecipient)?.id??options[0]?.id??"";};
  const selected = guests.map((g) => {const stored=state.smsFrozen?.[g.id]?.recipientId;const route=state.smsSent&&stored?messages[g.id]?.find(item=>item.meta?.recipient===stored):messages[g.id]?.find((item)=>item.id===selectedId(g.id));return route;}).filter(Boolean) as Item[];
  const lockedCount = state.smsLocked.length;
  const lock = (id: GuestId) => {
    const itemId = selectedId(id); if (!itemId) return;
    save({ ...state, smsLocked: [...new Set([...state.smsLocked, id])], smsIds: { ...state.smsIds, [id]: itemId } });
  };
  const send = () => { const flags = kcSmsFlagsFromDeliveries(selected.map((m) => ({ senderId: String(m.meta?.senderId) as GuestId, recipientId: String(m.meta?.recipient) as GuestId }))); const outcome = deriveKcSmsOutcome(flags); const evidenceIds=Object.entries(state.eventStatus).filter(([,event])=>event.happened).map(([id])=>id); const involved=guests.filter((g)=>evidenceIds.some((id)=>id.includes(g.id)||({"ZZX":"D01-002","SXH":"D01-003","ZJ":"D01-004","ZZY":"D01-005","ZH":"D01-006"} as Record<string,string>)[g.id]===id)).map(g=>g.id); const occurredEvents=smsSemanticEvents({episode:1,evidenceIds,involvedGuests:involved,completed:true}); const smsFrozen:Partial<Record<GuestId,FrozenSms>>={}; const batch=selectSmsBatch(selected.map(item=>{const sender=String(item.meta?.senderId) as GuestId,recipient=String(item.meta?.recipient) as GuestId;const used=smsUsageFromGameUi(p.gameUi,sender);return {episode:1,senderId:sender,recipientId:recipient,relationshipMode:mode,formalExPairs:history.formalExPairs,occurredEvents,previouslyUsedIds:used.ids,previouslyUsedTexts:used.texts,saveId:state.seed};})); for(const message of batch)smsFrozen[message.senderId]=message; p.onAction("heart:send", "D1"); save({ ...state, phase: "kcNight", smsSent: true, smsFrozen, ...flags, kcSmsOutcome: outcome, kcEmotionalReaction: kcEmotionalReaction(outcome), kcNightConversationViewed: false, kcNightConversationAired: false, kcNightPlace: "客厅", kcNightProgress: {}, eventStatus: { ...state.eventStatus, "D01-011": { happened: true, recorded: true, watched: true, aired: false } } }); };
  return <div className="d1-flow-card d1-sms-card"><Header label="22:00 · HEART SIGNAL" title="第一晚心动短信" sub="五位嘉宾分别锁定选择，五条短信统一发送；收件界面不显示发件人。"/>
    {!state.smsSent ? <><div className="d1-lock-progress"><span>已锁定</span><b>{lockedCount}<small>/5</small></b><span>条 · 锁定后不可更改；五人全部锁定前不送达</span></div><div className="d1-lock-list">{guests.map((g) => { const options = messages[g.id] ?? []; const locked = state.smsLocked.includes(g.id); return <article key={g.id} className={`d1-sms-choice ${locked ? "locked" : ""}`}><GuestAvatar id={g.id} className="d1-bubble-avatar"/><div className="d1-sms-choice-main"><strong>{g.name}</strong><label><span>选择一位收件嘉宾</span><select aria-label={`${g.name}选择收件人`} value={selectedId(g.id)} disabled={locked || options.length === 0} onChange={(e) => save({ ...state, smsIds: { ...state.smsIds, [g.id]: e.target.value } })}>{options.map((item) => <option key={item.id} value={item.id}>{nameOf(String(item.meta?.recipient))}</option>)}</select></label><small>{locked ? "个人选择已锁定 · 匿名待发" : "选择后单独锁定"}</small></div><button aria-label={`锁定${g.name}的选择`} disabled={locked || options.length === 0} onClick={() => lock(g.id)}><LockKeyhole size={15}/>{locked ? "已锁定" : "锁定"}</button></article>; })}</div><button className="d1-primary" disabled={lockedCount < guests.length} onClick={send}><Heart size={17}/>五条同时送达</button></> : <><p className="d1-anon-note">真实发送路由已保存 · 每位收件人单独看到匿名短信和准确X提示。</p><div className="d1-inbox-list">{guests.map((g) => { const incoming = selected.filter((m) => m.meta?.recipient === g.id); const notice = noticeFor(g.id, selected, history); return <article key={g.id}><header><b>{g.name} 的收件箱</b><small>匿名 · 22:00</small></header>{incoming.length ? incoming.map((m) => <div key={m.id} className="d1-anon-bubble"><small>来自匿名嘉宾</small><p>{state.smsFrozen?.[String(m.meta?.senderId) as GuestId]?.body ?? "旧存档短信已发送；原文快照不可用。"}</p></div>) : <p className="d1-no-message">今晚没有新信件。</p>}<span className={`d1-x-notice ${notice.includes("没有参与") ? "muted" : ""}`}>{notice}</span></article>; })}</div><button className="d1-primary" onClick={() => p.onNavigate?.("camera")}>查看深夜未公开素材 <ArrowRight size={17}/></button></>}
  </div>;
}

export function DayOneInterview({ p }: { p: Props }) {
  const { state, save } = useDayOne(p);
  const [question, setQuestion] = useState<(typeof interviewQuestions)[number]["id"]>("Q1");
  const selected = state.interviewGuests;
  const done = Object.keys(state.interviews);
  const currentId = state.interviewGuest || selected.find((id) => !done.includes(id)) || "";
  const choose = (id: GuestId) => {
    if (selected.includes(id)) save({ ...state, interviewGuests: selected.filter((x) => x !== id) });
    else if (selected.length < 2) save({ ...state, interviewGuests: [...selected, id] });
  };
  const begin = () => {
    if (selected.length !== 2) return;
    save({ ...state, interviewGuest: selected[0] });
  };
  const guestRecord = guest(currentId);
  const answers = currentId ? interviewAnswers[currentId as GuestId] : undefined;
  const submit = () => {
    if (!currentId || !answers) return;
    const nextAnswers = { ...state.interviews, [currentId]: { question, answer: answers[question] } };
    const nextGuest = selected.find((id) => !Object.hasOwn(nextAnswers, id));
    const status = { ...state.eventStatus, [`D01-010-${currentId}`]: { happened: true, recorded: true, watched: true, aired: false } };
    if (!nextGuest) {
      save({ ...state, interviews: nextAnswers, interviewGuest: "", phase: "sms", eventStatus: status });
      p.onNavigate?.("messages");
    } else save({ ...state, interviews: nextAnswers, interviewGuest: nextGuest, eventStatus: status });
    p.onRead(`interview-day-1`);
  };
  return <div className="d1-flow-card d1-interview-card">
    <Header label="21:00 · INTERVIEW ROOM" title="后期采访" sub="导演选择两位嘉宾，每人回答一个问题。只有被采访者会生成采访素材。"/>
    {!state.interviewGuest ? <><div className="d1-interview-select"><p>{selected.length === 2 ? "两位采访嘉宾已选好" : `选择两位嘉宾 · ${selected.length}/2`}</p>{guests.map((g) => <button key={g.id} className={selected.includes(g.id) ? "on" : ""} onClick={() => choose(g.id)}><GuestAvatar id={g.id} className="d1-bubble-avatar"/><strong>{g.name}</strong><span>{selected.includes(g.id) ? "已选择" : "选择采访"}</span></button>)}</div><button className="d1-primary" disabled={selected.length !== 2} onClick={begin}>开始采访 <ArrowRight size={17}/></button></> : <>
      <div className="d1-interview-portrait" style={imageStyle("interviewRoom")}>{guestRecord && <GuestAvatar id={currentId as GuestId} className="d1-interview-avatar"/>}<strong>{guestRecord?.name}</strong><small>独立采访 · CAM 05</small></div>
      <div className="d1-question-list"><p>选择一个采访问题</p>{interviewQuestions.map((q) => <button key={q.id} className={question === q.id ? "on" : ""} onClick={() => setQuestion(q.id)}>{q.id} · {q.label}</button>)}</div>
      <div className="d1-answer-preview"><small>预设采访回答</small><p>“{answers?.[question]}”</p></div>
      <button className="d1-primary" onClick={submit}><Check size={17}/>{done.includes(currentId) ? "切换下一位" : "保存回答并继续"}</button>
    </>}
  </div>;
}

export const clipCatalog = [
  { id: "CLIP-001", title: "第一位入住者", time: "10:00", place: "客厅", image: "livingRoom", summary: "朱志鑫独自抵达，放好行李后环顾客厅。", required: false },
  { id: "CLIP-002", title: "第二个问候与规则", time: "10:20", place: "客厅", image: "livingRoom", summary: "短暂停顿后，两人一起看入住规则。", required: false },
  { id: "CLIP-003", title: "箱子自己想躺", time: "10:45", place: "客厅", image: "livingRoom", summary: "张极用行李箱的玩笑打破安静。", required: false },
  { id: "CLIP-004", title: "五位嘉宾全部入住", time: "11:20", place: "客厅", image: "livingRoom", summary: "最后一位嘉宾到场，五人首次同框。", required: false },
  { id: "CLIP_D01_TOMATO", title: "入住第一餐 · 番茄与煎蛋", time: "16:30", place: "厨房", image: "kitchen", summary: "真实分工、煎蛋与饮食习惯；本段为三平台讨论必含素材。", required: true },
  { id: "CLIP-DINNER", title: "五人第一次共餐", time: "18:30", place: "餐厅", image: "diningRoom", summary: "五个人边吃边笑，镜头保留完整群像。", required: false },
  { id: "CLIP-NIGHT-LIVING", title: "客厅夜谈", time: "20:00", place: "客厅", image: "livingRoom", summary: "十四天会很长，还是会很快？", required: false },
  { id: "CLIP-NIGHT-BALCONY", title: "阳台透气", time: "20:00", place: "阳台", image: "balcony", summary: "两个人都说出来透透气。", required: false },
  { id: "CLIP-KC-NIGHT", title: "深夜未公开素材", time: "23:08", place: "客厅 / 厨房 / 阳台", image: "livingRoom", summary: "只呈现短信投递后的克制反应与日常关心；不公开发送对象，未选入正片前不触发舆论。", required: false },
  { id: "CLIP-INTERVIEW", title: "独立后采", time: "21:00", place: "采访室", image: "interviewRoom", summary: "只收录导演实际选择的两位嘉宾。", required: false },
];
export function DayOneEdit({ p }: { p: Props }) {
  const { state, save } = useDayOne(p);
  const availability: Record<string, { recorded: boolean; watched: boolean }> = {
    "CLIP-001": state.eventStatus["D01-002"] ?? { recorded: false, watched: false },
    "CLIP-002": state.eventStatus["D01-003"] ?? { recorded: false, watched: false },
    "CLIP-003": state.eventStatus["D01-004"] ?? { recorded: false, watched: false },
    "CLIP-004": state.eventStatus["D01-006"] ?? { recorded: false, watched: false },
    CLIP_D01_TOMATO: state.eventStatus["D01-KITCHEN"] ?? { recorded: false, watched: false },
    "CLIP-DINNER": state.eventStatus["D01-008"] ?? { recorded: false, watched: false },
    "CLIP-NIGHT-LIVING": state.eventStatus["D01-009A"] ?? { recorded: false, watched: false },
    "CLIP-NIGHT-BALCONY": state.eventStatus["D01-009C"] ?? { recorded: false, watched: false },
    "CLIP-KC-NIGHT": state.eventStatus["D01-KC-NIGHT"] ?? { recorded: false, watched: false },
    "CLIP-INTERVIEW": Object.entries(state.eventStatus).some(([id, x]) => id.startsWith("D01-010-") && x.recorded)
      ? { recorded: true, watched: Object.entries(state.eventStatus).some(([id, x]) => id.startsWith("D01-010-") && x.watched) }
      : { recorded: false, watched: false },
  };
  const dayOneClips: CutClip[] = clipCatalog.filter(clip => availability[clip.id]?.recorded).map(clip => {
    const sourceSceneId:Record<string,string>={"CLIP-001":"D01-002","CLIP-002":"D01-003","CLIP-003":"D01-004","CLIP-004":"D01-006","CLIP-NIGHT-LIVING":"D01-009A","CLIP-NIGHT-BALCONY":"D01-009C"};
    const scene=arrivalScenes.find(row=>row.id===sourceSceneId[clip.id])??nightScenes.find(row=>row.id===sourceSceneId[clip.id]);
    const assigned=Object.entries(state.roles).filter(([,role])=>role!=="餐桌").map(([id])=>id as GuestId);
    const kitchenPair=assigned.slice(0,2).sort().join("-");
    const lines=scene?.lines.map(line=>line.speaker==="STAGE"?line.text:`${nameOf(line.speaker)}：${line.text}`)
      ??(clip.id==="CLIP_D01_TOMATO"?(pairScenes[kitchenPair]??[]).slice(0,8).map(line=>`${nameOf(line.speaker)}：${line.text}`)
      :clip.id==="CLIP-DINNER"?dinnerLines.slice(0,8).map(line=>line.speaker==="STAGE"?line.text:`${nameOf(line.speaker)}：${line.text}`)
      :clip.id==="CLIP-INTERVIEW"?Object.entries(state.interviews).map(([id,row])=>`${nameOf(id as GuestId)}：${row.answer}`)
      :clip.id==="CLIP-KC-NIGHT"?["短信投递后的深夜独立机位。","回看只呈现本局记录的动作，不展示匿名短信发送对象。"]:[clip.summary]);
    const participants=clip.id==="CLIP-001"?["ZZX"]:clip.id==="CLIP-002"?["ZZX","SXH"]:clip.id==="CLIP-003"?["ZZX","SXH","ZJ"]:clip.id==="CLIP_D01_TOMATO"?assigned:["ZZX","SXH","ZJ","ZZY","ZH"];
    return { clipId: clip.id, episodeId: "EP01", sceneId: clip.title, recordedAt: clip.time, location: clip.place, camera: `CAM-${clip.place}`, guests: participants.map(id=>nameOf(id as GuestId)), summary: clip.summary, preview: lines.slice(0,8), watched: Boolean(availability[clip.id]?.watched), spoiler: clip.id === "CLIP-KC-NIGHT", publicEligible: true };
  });
  const legacyBroadcastId = state.broadcastId ?? (["social","complete"].includes(state.phase) ? `legacy-ep01-${state.cut||"published"}` : undefined);
  const draft: CutDraft = { selectedClipIds: state.selectedClips, clipOrder: state.clipOrder?.length ? state.clipOrder : state.selectedClips, editingStyle: (state.cut as CutStyle) || "", previewState: state.previewState ?? { seenClipIds: [], entered: false }, stage: state.editStage ?? (legacyBroadcastId ? 3 : 1), broadcastId: legacyBroadcastId, publishedAt: state.publishedAt };
  const draftChange = (next: CutDraft) => {
    if (legacyBroadcastId) return;
    save({ ...state, selectedClips: next.selectedClipIds.filter(id => availability[id]?.recorded), clipOrder: next.clipOrder, cut: next.editingStyle, editStage: next.stage, previewState: next.previewState, broadcastId: next.broadcastId, publishedAt: next.publishedAt });
  };
  const publish = (payload: { selectedClipIds: string[]; clipOrder: string[]; editingStyle: CutStyle; broadcastId: string; publishedAt: number }) => {
    if (legacyBroadcastId || payload.selectedClipIds.length < 3) return;
    const status = { ...state.eventStatus };
    const clipEvents: Record<string, string[]> = {
      "CLIP-001": ["D01-002"], "CLIP-002": ["D01-003"], "CLIP-003": ["D01-004"], "CLIP-004": ["D01-006"],
      CLIP_D01_TOMATO: ["D01-007", "D01-KITCHEN"], "CLIP-DINNER": ["D01-008"],
      "CLIP-NIGHT-LIVING": ["D01-009A"], "CLIP-NIGHT-BALCONY": ["D01-009C"], "CLIP-INTERVIEW": ["D01-010"],
      "CLIP-KC-NIGHT": ["D01-KC-NIGHT"],
    };
    for (const id of payload.selectedClipIds) {
      status[id] = { happened: true, recorded: true, watched: true, aired: true };
      for (const eventId of clipEvents[id] ?? []) status[eventId] = { happened: true, recorded: true, watched: true, aired: true };
    }
    status["D01-012"] = { happened: true, recorded: true, watched: true, aired: true };
    save({ ...state, phase: "social", cut: payload.editingStyle, selectedClips: payload.selectedClipIds, clipOrder: payload.clipOrder, broadcastId: payload.broadcastId, publishedAt: payload.publishedAt, editStage: 3, kcNightConversationAired: payload.selectedClipIds.includes("CLIP-KC-NIGHT"), eventStatus: status, socialVisited: [] });
    p.onAction("edit:publish", `1:${payload.editingStyle}`);
    p.onNavigate?.("weibo");
  };
  return <DirectorCutRoom episode={1} clips={dayOneClips} draft={draft} onDraft={draftChange} onPublish={publish} onReplay={id=>{if(state.eventStatus[id])save({...state,eventStatus:{...state.eventStatus,[id]:{...state.eventStatus[id],watched:true}}})}}/>;
}

export function DayOneEnd({ onReplay }: { onReplay?: () => void }) {
  const next=episodeManifest.find(item=>item.episode===2);
  return <div className="d1-end-card"><div className="d1-end-mark">TOP <span>·</span> EP.01</div><h1>本期录制完成</h1><p>EP.01 · 初次入住</p><div className="d1-end-rule"/><strong>EP.01 已保存</strong><span className="d1-day2-lock"><LockKeyhole size={15}/> {next?.available?`下一期：EP.02 · ${next.title} 已开放`:"下一期敬请期待"}</span><small>关系历史、导演决定和本期剧情结果已存入本地档案。</small>{onReplay && <button onClick={onReplay}><RotateCcw size={14}/>回看录制素材</button>}</div>;
}

type LocalThreadReply = { id: string; parent: string; text: string; author: string };
function socialItem(id: string, title: string, sender: string, body: string, comments: string[], likes: number, appId: string, edit: string): Item {
  return { id, title, body, richText: "", meta: { platform: appId, edit }, time: "播出后 · EP01", sender, avatar: "", kind: "post", media: "", hidden: false, unlock: "", password: "", folder: "D1", favorite: false, outgoing: false, read: false, likes, comments };
}
function readStringArray(value: UiValue | undefined): string[] {
  if (typeof value !== "string") return [];
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : []; }
  catch { return []; }
}
function readReplyList(value: UiValue | undefined): LocalThreadReply[] {
  if (typeof value !== "string") return [];
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((x) => x && typeof x.text === "string") as LocalThreadReply[] : []; }
  catch { return []; }
}

function readObject<T extends Record<string, unknown>>(value: UiValue | undefined): T {
  if (typeof value !== "string") return {} as T;
  try { const parsed = JSON.parse(value); return parsed && typeof parsed === "object" ? parsed as T : {} as T; }
  catch { return {} as T; }
}

function buildAiredClipRows(state: DayOneState): BroadcastClip[] {
  return state.selectedClips.flatMap((clipId) => {
    if (!state.eventStatus[clipId]?.aired) return [];
    const catalog = clipCatalog.find((x) => x.id === clipId);
    if (!catalog) return [];
    let speakers: GuestId[] = [];
    let cast: GuestId[] = [];
    let tags = ["life"];
    if (clipId === "CLIP-001") { speakers = arrivalScenes[0].lines.flatMap((x) => x.speaker === "STAGE" ? [] : [x.speaker]); cast = [...new Set(speakers)]; tags = ["life", "arrival"]; }
    else if (clipId === "CLIP-002") { speakers = arrivalScenes[1].lines.flatMap((x) => x.speaker === "STAGE" ? [] : [x.speaker]); cast = [...new Set(speakers)]; tags = ["life", "warm", "arrival"]; }
    else if (clipId === "CLIP-003") { speakers = arrivalScenes[2].lines.flatMap((x) => x.speaker === "STAGE" ? [] : [x.speaker]); cast = [...new Set(speakers)]; tags = ["life", "comedy", "arrival"]; }
    else if (clipId === "CLIP-004") { speakers = arrivalScenes[4].lines.flatMap((x) => x.speaker === "STAGE" ? [] : [x.speaker]); cast = [...new Set(speakers)]; tags = ["life", "ensemble", "arrival"]; }
    else if (clipId === "CLIP_D01_TOMATO") {
      const chosenPair = (Object.keys(state.roles) as GuestId[]).filter((id) => state.roles[id] === "主厨");
      speakers = [...new Set<GuestId>([...chosenPair, ...pairScenes[chosenPair.slice().sort().join("-")]?.flatMap((x) => x.speaker === "STAGE" ? [] : [x.speaker]) ?? [], "ZZX", "SXH"])];
      cast = [...new Set([...speakers, ...(Object.keys(state.roles) as GuestId[])])];
      tags = ["life", "warm", "kitchen"];
    } else if (clipId === "CLIP-DINNER") { speakers = [...new Set(dinnerLines.flatMap((x) => x.speaker === "STAGE" ? [] : [x.speaker]))]; cast = guests.map((x) => x.id); tags = ["life", "ensemble", "comedy"]; }
    else if (clipId === "CLIP-NIGHT-LIVING") { const scene = nightScenes.find((x) => x.id === "D01-009A")!; speakers = [...new Set(scene.lines.flatMap((x) => x.speaker === "STAGE" ? [] : [x.speaker]))]; cast = [...new Set(speakers)]; tags = ["warm", "life"]; }
    else if (clipId === "CLIP-NIGHT-BALCONY") { const scene = nightScenes.find((x) => x.id === "D01-009C")!; speakers = [...new Set(scene.lines.flatMap((x) => x.speaker === "STAGE" ? [] : [x.speaker]))]; cast = [...new Set(speakers)]; tags = ["warm", "life", "controversy"]; }
    else if (clipId === "CLIP-KC-NIGHT") { speakers = ["ZZX", "SXH"]; cast = ["ZZX", "SXH"]; tags = ["warm", "life", "care"]; }
    else if (clipId === "CLIP-INTERVIEW") { speakers = state.interviewGuests; cast = [...state.interviewGuests]; tags = ["theory", "controversy"]; }
    const eventType: BroadcastClip["eventType"] = clipId.startsWith("CLIP-NIGHT") ? "night" : clipId === "CLIP-INTERVIEW" ? "interview" : clipId === "CLIP_D01_TOMATO" ? "kitchen" : clipId === "CLIP-DINNER" ? "dinner" : "arrival";
    return [{ clipId, title: catalog.title, summary: catalog.summary, cast, speakers, cpIds: associatedAudienceShips(cast), eventType, controversyTags: tags.includes("controversy") ? ["剪辑解读争议"] : [], warmthTags: tags.includes("warm") ? ["日常温度"] : [], comedyTags: tags.includes("comedy") ? ["轻松反应"] : [], broadcastStatus: "aired", editFocus: state.cut as BroadcastClip["editFocus"], tags, weight: state.cut === "romance" ? 1.2 : state.cut === "conflict" ? 1.1 : 1 }];
  });
}

function _WeiboDynamicPanels({ p, tab, dynamics, clips }: { p: Props; tab: string; dynamics: WeiboDynamics; clips: BroadcastClip[] }) {
  const [topicId, setTopicId] = useState("");
  const [superId, setSuperId] = useState("");
  const [postId, setPostId] = useState("");
  const [draft, setDraft] = useState("");
  const [replyTarget, setReplyTarget] = useState("");
  const liked = readStringArray(p.ui?.["d1-liked"]);
  const getReplies = (id: string) => readReplyList(p.ui?.[`d1-comments-${id}`]);
  const topic = dynamics.topics.find((x) => x.id === topicId);
  const selectedSuper = dynamics.superTopics.find((x) => x.id === superId);
  const cpTopic = dynamics.cpBoard.find((x) => x.id === topicId.replace("cp-", ""));
  const superPosts = superId ? makeSuperTopicPosts(dynamics, superId, clips) : [];
  const activePosts = topic?.posts ?? (selectedSuper ? superPosts : cpTopic ? dynamics.topics.find((x) => x.id === `cp-${cpTopic.id}`)?.posts ?? [] : []);
  const activePost: WeiboPost | undefined = activePosts.find((x) => x.id === postId);
  const back = () => { if (postId) setPostId(""); else { setTopicId(""); setSuperId(""); } setDraft(""); setReplyTarget(""); };
  const like = (id: string) => p.onUi?.("d1-liked", JSON.stringify(liked.includes(id) ? liked.filter((x) => x !== id) : [...liked, id]));
  const sendReply = (post: WeiboPost) => {
    if (!draft.trim()) return;
    const key = `d1-comments-${post.id}`;
    const rows = getReplies(post.id);
    p.onUi?.(key, JSON.stringify([...rows, { id: `${Date.now()}`, parent: replyTarget, text: draft.trim(), author: "观众viewer_01" }]));
    setDraft(""); setReplyTarget("");
  };
  const movement = (value: number | null) => value === null ? <small className="wb-trend new">NEW</small> : value > 0 ? <small className="wb-trend up">↑ {value}</small> : value < 0 ? <small className="wb-trend down">↓ {Math.abs(value)}</small> : <small className="wb-trend same">—</small>;
  const openPosts = () => <div className="wb-post-list">{activePosts.map((post) => {
    const clip = clips.find((x) => x.clipId === post.clipId)!;
    const local = getReplies(post.id);
    const likedNow = liked.includes(post.id);
    return <article className="d1-social-post wb-post" key={post.id}><div className="d1-social-author"><span>{post.author.slice(0, 1)}</span><div><b>{post.author}</b><small>对应已播镜头 · {clip.title}</small></div></div><p>{post.body}</p><div className="d1-onair-proof"><Film size={13}/>{clip.clipId} · {clip.title}｜{clip.summary}</div><div className="d1-social-actions"><button className={likedNow ? "liked" : ""} onClick={() => like(post.id)}>{likedNow ? "♥" : "♡"} {likedNow ? 1 : 0}</button><button onClick={() => setPostId(post.id)}>评论 {post.replies.length + local.length}</button><button onClick={() => { setPostId(post.id); setDraft(`引用 @${post.author}：${post.body.slice(0, 50)}…`); }}>引用</button></div><button className="wb-read-post" onClick={() => setPostId(post.id)}>查看博文与楼中楼 ›</button></article>;
  })}</div>;

  if (activePost) {
    const clip = clips.find((x) => x.clipId === activePost.clipId)!;
    const local = getReplies(activePost.id);
    return <section className="wb-panel"><button className="d1-social-back" onClick={back}>‹ 返回话题</button><article className="d1-social-post d1-social-detail"><div className="d1-social-author"><span>{activePost.author.slice(0, 1)}</span><div><b>{activePost.author}</b><small>只讨论已播镜头 · {clip.clipId}</small></div></div><p>{activePost.body}</p><div className="d1-onair-proof"><Film size={14}/>本帖对应播出素材：{clip.title}｜{clip.summary}</div><div className="d1-comment-heading">评论与楼中楼 <small>{activePost.replies.length + local.length}</small></div>{activePost.replies.map((reply, i) => { const nested = local.filter((x) => x.parent === `source-${i}`); return <div className="d1-comment-thread" key={`${activePost.id}-reply-${i}`}><div className="d1-social-comment"><span>{reply.stance.slice(0, 1)}</span><p><b>{reply.author} · {reply.stance}</b><br/>{reply.body}</p><button onClick={() => { setReplyTarget(`source-${i}`); setDraft(`回复 ${reply.author}：`); }}>回复</button></div>{nested.map((row) => <div className="d1-social-comment nested" key={row.id}><span>观</span><p>{row.author}：{row.text}</p></div>)}</div>; })}{local.filter((x) => !x.parent).map((row) => <div className="d1-social-comment" key={row.id}><span>观</span><p>{row.author}：{row.text}</p><button onClick={() => { setReplyTarget(row.id); setDraft(`回复 ${row.author}：`); }}>回复</button>{local.filter((x) => x.parent === row.id).map((child) => <small className="d1-nested-reply" key={child.id}>↳ {child.author}：{child.text}</small>)}</div>)}<div className="d1-social-compose"><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={replyTarget ? "回复这条评论…" : "写一条评论…"}/><button disabled={!draft.trim()} onClick={() => sendReply(activePost)}>发送</button></div></article></section>;
  }
  if (topic || selectedSuper || cpTopic) {
    const heading = topic?.title ?? selectedSuper?.name ?? cpTopic?.name ?? "话题详情";
    const clipsFor = topic?.clipIds ?? (selectedSuper?.clipIds ?? cpTopic?.clipIds ?? []);
    const evidence = clips.filter((x) => clipsFor.includes(x.clipId));
    return <section className="wb-panel"><button className="d1-social-back" onClick={back}>‹ 返回{topic ? "热搜" : selectedSuper ? "超话" : "CP榜"}</button><header className="wb-detail-head"><small>{topic ? `热搜第 ${topic.rank} 位 · ${topic.score.toLocaleString()} 热度` : selectedSuper ? `超话 · ${selectedSuper.followers.toLocaleString()} 关注 · 活跃 ${selectedSuper.activity}` : "CP榜片段搜索"}</small><h2>{heading}</h2><p>仅关联实际进入正片的镜头；观众推理不代表嘉宾真实关系。</p></header><div className="d1-air-list"><span>关联播出片段</span>{evidence.map((x) => <small key={x.clipId}>· {x.title}</small>)}</div>{activePosts.length ? openPosts() : <div className="wb-empty">目前没有与此话题对应的已播镜头。后续节目播出后会在此更新。</div>}</section>;
  }
  if (tab === "热搜") return <section className="wb-panel"><header className="wb-section-title"><div><small>EP01 · ON AIR ONLY</small><h2>实时热搜</h2></div><span>按本次剪辑重新计算</span></header><div className="wb-hot-list">{dynamics.topics.slice(0, 12).map((item) => <button key={item.id} className="wb-hot-row" onClick={() => setTopicId(item.id)}><b>{item.rank}</b><span><strong>{item.title}</strong><small>{item.clipIds.map((id) => clips.find((x) => x.clipId === id)?.title).filter(Boolean).join(" · ")}</small></span><em>{item.score.toLocaleString()}</em>{movement(item.movement)}</button>)}</div></section>;
  if (tab === "超话") return <section className="wb-panel"><header className="wb-section-title"><div><small>FAN COMMUNITIES</small><h2>超话广场</h2></div><span>观点各有不同</span></header><div className="wb-super-grid">{dynamics.superTopics.map((item) => <button key={item.id} className="wb-super-card" onClick={() => setSuperId(item.id)}><span>{item.name}</span><small>{item.followers.toLocaleString()} 关注 · 活跃 {item.activity}</small><p>{item.intro}</p><b>{item.clipIds.length ? `本期关联 ${item.clipIds.length} 段镜头 ›` : "暂无对应已播镜头"}</b></button>)}</div></section>;
  if (tab === "CP榜") return <section className="wb-panel"><header className="wb-section-title"><div><small>VIEWER SHIP RANKING</small><h2>节目CP热度榜</h2></div><span>本次播出动态</span></header><p className="wb-disclaimer">此榜仅统计观众讨论热度，不是恋爱状态或X身份。主推CP与观众拉郎分栏标记。</p><div className="wb-cp-list">{dynamics.cpBoard.map((entry) => <button key={entry.id} onClick={() => setTopicId(`cp-${entry.id}`)}><b className="wb-cp-rank">{entry.rank}</b><span><strong>{entry.name}</strong><small>{entry.formal ? "节目主推CP" : "普通观众拉郎"} · 关联已播 {entry.clipIds.length} 段</small></span><em>{entry.score.toLocaleString()}</em>{movement(entry.movement)}</button>)}</div></section>;
  return <div className="wb-panel"><h2>选择栏目</h2></div>;
}

export function DayOneFeed({ p, appId }: { p: Props; appId: "weibo" | "forum" | "threads" }) {
  const { state, save } = useDayOne(p);
  const [activeId, setActiveId] = useState("");
  const [draft, setDraft] = useState("");
  const [replyTarget, setReplyTarget] = useState("");
  const [tab, setTab] = useState(appId === "weibo" ? "推荐" : appId === "forum" ? "讨论组" : "为你推荐");
  const clipIds = state.selectedClips.filter((id) => state.eventStatus[id]?.aired);
  const clips = clipCatalog.filter((x) => clipIds.includes(x.id));
  const airedClipRows = useMemo(() => buildAiredClipRows(state), [clipIds.join("|"), state.cut, JSON.stringify(state.roles), JSON.stringify(state.interviewGuests)]);
  const visiblePosts = p.items.filter((i) => i.folder === "D1" && i.meta?.platform === appId && i.meta?.edit === state.cut);
  const localPosts = (() => { try { const raw = p.ui?.["d1-user-posts"]; return typeof raw === "string" ? JSON.parse(raw) as { id: string; author: string; body: string }[] : []; } catch { return []; } })();
  const liked = readStringArray(p.ui?.["d1-liked"]);
  const previousRanks = readObject<{ fingerprint?: string; topics?: Record<string, number>; cps?: Record<string, number> }>(p.ui?.["d1-weibo-rank-snapshot"]);
  const audienceSupport: Record<string, number> = {};
  for (const pairId of ["GC", "JY", "JH", "MH", "ZX", "ZY", "ZH", "SZ", "SY", "SH"]) {
    const postPrefix = `wb-cp-${pairId}-`;
    const engagements = Object.entries(p.ui ?? {}).filter(([key]) => key.startsWith("d1-comments-") && key.includes(postPrefix)).reduce((n, [, value]) => n + readReplyList(value).length, 0);
    audienceSupport[`cp-${pairId}`] = liked.filter((id) => id.startsWith(postPrefix)).length + engagements;
  }
  for (const id of guests.map((x) => x.id)) {
    const postPrefix = `wb-guest-${id}-`;
    audienceSupport[`guest-${id}`] = liked.filter((postId) => postId.startsWith(postPrefix)).length + Object.entries(p.ui ?? {}).filter(([key]) => key.startsWith("d1-comments-") && key.includes(postPrefix)).reduce((n, [, value]) => n + readReplyList(value).length, 0);
  }
  const broadcastFingerprint = fingerprintBroadcast(airedClipRows, state.cut as "friendship" | "romance" | "conflict" | "ensemble", audienceSupport);
  const weiboDynamics = useMemo(() => buildWeiboDynamics({ clips: airedClipRows, cut: state.cut as "friendship" | "romance" | "conflict" | "ensemble", previousTopicRanks: previousRanks.fingerprint === broadcastFingerprint ? undefined : previousRanks.topics, previousCpRanks: previousRanks.fingerprint === broadcastFingerprint ? undefined : previousRanks.cps, support: audienceSupport }), [broadcastFingerprint, previousRanks.fingerprint, JSON.stringify(previousRanks.topics), JSON.stringify(previousRanks.cps)]);
  useEffect(() => {
    if (appId !== "weibo" || previousRanks.fingerprint === broadcastFingerprint) return;
    p.onUi?.("d1-weibo-rank-snapshot", JSON.stringify({ fingerprint: broadcastFingerprint, topics: Object.fromEntries(weiboDynamics.topics.map((x) => [x.id, x.rank])), cps: Object.fromEntries(weiboDynamics.cpBoard.map((x) => [x.id, x.rank])) }));
  }, [appId, broadcastFingerprint]);
  const postKey = (id: string) => `d1-comments-${id}`;
  const repliesFor = (id: string) => readReplyList(p.ui?.[postKey(id)]);
  const allSocialVisited = ["weibo"];
  useEffect(() => {
    if (state.phase !== "social" || state.socialVisited.includes(appId)) return;
    const socialVisited = [...state.socialVisited, appId];
    const phase = allSocialVisited.every((id) => socialVisited.includes(id)) ? "complete" : "social";
    const eventStatus = phase === "complete" ? { ...state.eventStatus, "D01-013": { happened: true, recorded: true, watched: true, aired: true } } : state.eventStatus;
    save({ ...state, socialVisited, phase, eventStatus });
    if (phase === "complete") p.onAction("episode:complete", "1");
  }, [state.phase, state.socialVisited.join(","), appId]);

  const title = appId === "weibo" ? "微博" : appId === "forum" ? "豆瓣" : "Threads";
  const tabs = ["推荐"];
  const corpusPlatform = appId === "forum" ? "douban" : appId;
  const corpusBatch = buildSocialBatch({ platform: corpusPlatform as "weibo" | "douban" | "threads", episode: 1, mode: String(p.state.variables.gameMode ?? "A"), airedEventIds: eventsForDayOneClips(clipIds) });
  const corpusPosts = corpusBatch.posts.map((item) => socialItem(item.id, corpusItemTitle(item), corpusPersonaLabel(item), item.text, corpusReplies(corpusBatch, item.id), 14 + item.id.length % 71, appId, state.cut));
  const extraReplyText = appId === "threads" ? [
    ["cutroom_02", "the kitchen clip is what aired; the rest is still a guess"],
    ["contextpls_08", "a familiar moment can be real without telling us the whole history"],
  ] : appId === "weibo" ? [
    ["@只看已播镜头", "今天能确认的只有节目播出的这几句，其他先别替他们下结论。"],
    ["@明天再推理", "镜头内外不是一回事，等下一期再补时间线。"],
  ] : [
    ["按镜头做笔记", "能确认的是节目里呈现的分工与对话，关系判断仍属猜测。"],
    ["只看在场片段", "请把播出事实、剪辑顺序和个人推理分开记录。"],
  ];

  const forumTopics = clips.map((clip, index) => ({
    id: `d1-forum-${clip.id}`,
    title: `EP01 · ${clip.title}`,
    author: index === 0 ? "按时间线说话" : "在场镜头记录员",
    body: `${clip.summary}\n\n本帖只整理本期已经播出的现场事实。对人物关系的判断仍属猜测；未播素材不作证据。`,
    comments: visiblePosts.flatMap((x) => x.comments).slice(0, 3).concat(extraReplyText.map(([author, body]) => `@${author}：${body}`)),
    likes: 28 + index * 7,
  }));
  const kcDiscussion = clipIds.includes("CLIP-KC-NIGHT") ? [socialItem("ep01-kc-night", appId === "forum" ? "EP01深夜机位：那句‘你先坐’之后" : appId === "threads" ? "深夜那句‘你先坐’有点温柔" : "深夜机位里的那杯水", appId === "threads" ? "quiet_cut_01" : appId === "forum" ? "按播出时间记" : "只看已播镜头", appId === "forum" ? "这段深夜素材里，朱志鑫把水杯推过去，苏新皓没有马上追问，两个人把话题留在明天的早餐。只看正片能确认的是，他们在当晚选择了用生活细节照顾彼此；节目没有公开短信对象，镜头也不能替他们解释选择原因。" : appId === "threads" ? "一个推杯子，一个没追问。深夜剪辑终于留了完整停顿，大家先聊画面就好。" : "深夜这段停顿挺明显的，递水和没追问都在正片里。先讨论镜头，不替他们猜短信收件人。", ["这更像熟悉后的生活习惯，先不下关系结论。", "我看到的是没有催着对方回答，这点挺舒服。", "前后镜头放一起看，剪辑没有只截一个表情。", "不能从这段推断短信发给了谁。", "节目把深夜素材放出来了，但短信路由仍然没有公开。"], 73, appId, state.cut)] : [];
  const posts = appId === "forum" ? [...visiblePosts, ...forumTopics.map((x) => socialItem(x.id, x.title, x.author, x.body, x.comments, x.likes, "forum", state.cut)), ...corpusPosts, ...kcDiscussion] : [...visiblePosts, ...corpusPosts, ...kcDiscussion];
  const active = [...posts, ...localPosts.map((x) => socialItem(x.id, "本地观众新帖", x.author, x.body, [], 0, appId, state.cut))].find((x) => x.id === activeId);
  const localReplies = active ? repliesFor(active.id) : [];
  const originalReplies = active?.comments ? (appId === "forum" || corpusBatch.posts.some((item) => item.id === active.id) ? active.comments : [...active.comments, ...extraReplyText.map(([author, body]) => `@${author}：${body}`)]) : [];
  const saveComment = () => {
    if (!active || !draft.trim()) return;
    const previous = repliesFor(active.id);
    const author = appId === "threads" ? "viewer_01" : "观众";
    const next = [...previous, { id: `${Date.now()}`, parent: replyTarget, text: draft.trim(), author }];
    p.onUi?.(postKey(active.id), JSON.stringify(next)); setDraft(""); setReplyTarget("");
  };
  const like = (id: string) => p.onUi?.("d1-liked", JSON.stringify(liked.includes(id) ? liked.filter((x) => x !== id) : [...liked, id]));
  const publishPost = () => {
    if (!draft.trim()) return;
    const raw = [...localPosts, { id: `local-${Date.now()}`, author: appId === "threads" ? "director_viewer01" : "节目观众", body: draft.trim() }];
    p.onUi?.("d1-user-posts", JSON.stringify(raw)); setDraft("");
  };
  if (state.phase !== "social" && state.phase !== "complete") return <div className="d1-flow-card"><Header label="ON AIR" title="社区尚未解锁" sub="先完成EP.01剪辑。社区只会出现与实际播出内容对应的讨论。"/><button className="d1-primary" onClick={() => p.onNavigate?.("bilibili")}>返回剪辑室 <ArrowRight size={17}/></button></div>;
  if (appId === "weibo" && tab !== "推荐") return null;
  if (active) return <div className={`d1-social-app d1-social-${appId}`}><Header label={`${title.toUpperCase()} · EP.01`} title="帖子详情" sub="所有帖子仅讨论本期实际播出的镜头"/><button className="d1-social-back" onClick={() => { setActiveId(""); setReplyTarget(""); }}>‹ 返回信息流</button><article className="d1-social-post d1-social-detail"><div className="d1-social-author"><span>{active.sender.slice(0, 1)}</span><div><b>{active.sender}</b><small>{appId === "threads" ? `@${active.sender}` : `EP.01 · ${active.meta?.edit ?? state.cut}`}</small></div></div><h2>{active.title}</h2><p>{active.body}</p><div className="d1-onair-proof"><Film size={14}/>本帖对应已播素材：{clips.map((x) => x.title).join("、")}</div><div className="d1-comment-heading">评论与楼中楼 <small>{originalReplies.length + localReplies.length}</small></div>{originalReplies.map((text, i) => { const replies = localReplies.filter((x) => x.parent === `source-${i}`); return <div className="d1-comment-thread" key={`source-${i}`}><div className="d1-social-comment"><span>{text.split("：")[0].slice(0, 1)}</span><p>{text}</p><button onClick={() => { setReplyTarget(`source-${i}`); setDraft(`回复 ${text.split("：")[0]}：`); }}>回复</button></div>{replies.map((r) => <div key={r.id} className="d1-social-comment nested"><span>{r.author.slice(0, 1)}</span><p>{r.text}</p></div>)}</div>; })}{localReplies.filter((x) => !x.parent).map((r) => <div className="d1-social-comment" key={r.id}><span>{r.author.slice(0, 1)}</span><p>{r.text}</p><button onClick={() => { setReplyTarget(r.id); setDraft(`回复 ${r.author}：`); }}>回复</button>{localReplies.filter((x) => x.parent === r.id).map((child) => <small key={child.id} className="d1-nested-reply">↳ {child.author}：{child.text}</small>)}</div>)}<div className="d1-social-compose"><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={replyTarget ? "回复这条评论…" : "写一条评论…"}/><button disabled={!draft.trim()} onClick={saveComment}>发送</button></div><button className="d1-quote-button" onClick={() => setDraft(`引用 @${active.sender}：${active.body.slice(0, 70)}…`)}>引用这条帖子</button></article></div>;

  return <div className={`d1-social-app d1-social-${appId}`}>
    <Header label={`${title.toUpperCase()} · EP.01`} title={title} sub={state.phase === "complete" ? "EP.01已录制完成 · DAY 2暂未开放" : "节目播出后 · 仅展示本期剪辑对应的观众讨论"}/>
    <div className="d1-social-tabs">{tabs.map((x) => <button key={x} className={tab === x ? "on" : ""} onClick={() => setTab(x)}>{x}</button>)}</div>
    <div className="d1-air-list"><span>本期实际播出素材</span>{clips.map((x) => <small key={x.id}>· {x.title}</small>)}</div>
    <div className="d1-new-post"><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={appId === "threads" ? "Start a thread…" : "分享你看到的本期镜头"}/><button disabled={!draft.trim()} onClick={publishPost}>发布</button></div>
    {[...localPosts.map((x) => socialItem(x.id, "本地观众新帖", x.author, x.body, [], 0, appId, state.cut)), ...posts.slice().reverse()].map((post) => {
      const likedNow = liked.includes(post.id);
      const extras = extraReplyText.map(([author, body]) => `${author}：${body}`);
      const comments = appId === "forum" || corpusBatch.posts.some((item) => item.id === post.id) ? post.comments : [...post.comments, ...extras];
      return <article className="d1-social-post" key={post.id}><div className="d1-social-author"><span>{post.sender.slice(0, 1)}</span><div><b>{post.sender}</b><small>{appId === "threads" ? `@${post.sender}` : `EP.01 · ${post.meta?.edit ?? state.cut}`}</small></div><button aria-label="打开帖子" onClick={() => setActiveId(post.id)}>•••</button></div><button className="d1-post-open" onClick={() => setActiveId(post.id)}><h2>{post.title}</h2><p>{post.body}</p></button><div className="d1-onair-proof"><Film size={13}/>{clips.map((x) => x.title).join(" · ")}</div><div className="d1-social-actions"><button className={likedNow ? "liked" : ""} onClick={() => like(post.id)}>{likedNow ? "♥" : "♡"} {post.likes + (likedNow ? 1 : 0)}</button><button onClick={() => setActiveId(post.id)}>评论 {comments.length}</button><button onClick={() => { setActiveId(post.id); setDraft(`引用 @${post.sender}：${post.body.slice(0, 65)}…`); }}>引用</button></div>{comments.slice(0, 3).map((x, i) => <div className="d1-feed-preview-reply" key={`${post.id}-${i}`}>{x}</div>)}</article>;
    })}
    {state.phase === "complete" && <DayOneEnd onReplay={() => p.onNavigate?.("camera")}/>}
    <div className="d1-social-footer">{appId === "threads" ? "Handles use English letters, numbers, and underscores." : "仅讨论已播镜头 · 虚构节目社区"}</div>
  </div>;
}
