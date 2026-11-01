import { ArrowRight, LockKeyhole } from "lucide-react";
import { assets, guests } from "../game/day1-data";
import { kcNightScript, type KcSmsOutcome, type KcNightPlace } from "../game/kc-night";
import { GuestAvatar } from "../game/GuestAvatar";
import { SceneChatStream } from "./SceneChatStream";
import "./kc-night.css";

const places: KcNightPlace[] = ["客厅", "厨房", "阳台"];
const backgroundByPlace: Record<KcNightPlace, keyof typeof assets> = { 客厅: "livingRoom", 厨房: "kitchen", 阳台: "balcony" };

export function KcNightExperience({
  episode, outcome, place, progress, viewed, onPlace, onProgress, onFinish, onBack,
}: {
  episode: number; outcome: KcSmsOutcome; place: KcNightPlace; progress: Partial<Record<KcNightPlace, number>>;
  viewed: boolean; onPlace: (place: KcNightPlace) => void; onProgress: (place: KcNightPlace, line: number) => void;
  onFinish: (place: KcNightPlace) => void; onBack: () => void;
}) {
  const lines = kcNightScript(outcome, place, episode);
  const line = Math.min(progress[place] ?? 0, lines.length - 1);
  const finished = line >= lines.length - 1;
  return <main className="kc-night-app">
    <header className="kc-night-header"><small>TOP · CAM · EP.{String(episode).padStart(2, "0")} · 未播出</small><h1>深夜未公开素材</h1><p>短信已投递 · 关系信息保密 · 导演决定是否收录进正片</p></header>
    <div className="kc-night-cameras">{places.map((option, index) => <button key={option} className={place === option ? "on" : ""} onClick={() => onPlace(option)}><small>CAM 0{index + 1}</small>{option}</button>)}</div>
    <section className="kc-night-monitor" style={{ backgroundImage: `linear-gradient(0deg,#171925dc,#17192525),url("${assets[backgroundByPlace[place]]}")` }}>
      <div><span><i/> REC · KC-NIGHT-{String(episode).padStart(2, "0")}</span><time>23:08</time></div>
      <h2>{place} · 夜间机位</h2>
      <aside>{["ZZX", "SXH"].map((id) => { const guest = guests.find((row) => row.id === id)!; return <span key={id}><GuestAvatar id={guest.id} className="kc-night-avatar"/>{guest.name}</span>; })}</aside>
      <small>画面仅记录现场反应，不显示短信发送对象</small>
    </section>
    <div className="kc-night-chat"><SceneChatStream sceneId={episode===4?"D04-POST-SMS":`KC-NIGHT-${episode}-${place}`} rows={lines} shownCount={line + 1} auto={false} label="未公开连续现场" speakerName={(id) => guests.find((guest) => guest.id === id)?.name ?? id}/></div>
    <footer className="kc-night-controls">
      {viewed && <span><LockKeyhole size={14}/> 已录制 · 未自动播出</span>}
      <button onClick={onBack}>返回桌面</button>
      {finished ? <button className="primary" onClick={() => onFinish(place)}>{viewed ? "完成并去剪辑室" : "记录未公开镜头"}<ArrowRight size={16}/></button> : <button className="primary" onClick={() => onProgress(place, line + 1)}>下一条 <ArrowRight size={16}/></button>}
    </footer>
  </main>;
}
