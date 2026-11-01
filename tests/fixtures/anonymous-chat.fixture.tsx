import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { assignAnonymousCodes, createAnonymousChatScript, type ChatTopic, type RoomKind } from "../../src/game/anonymous-chat";
import type { GuestId } from "../../src/game/day1-data";
import { guests } from "../../src/game/day1-data";
import { SceneChatStream } from "../../src/skins/SceneChatStream";
import "../../src/skins/day-one.css";
import "./anonymous-chat.fixture.css";

function AnonymousChatFixture() {
  const [kind, setKind] = useState<RoomKind>("group");
  const [topic, setTopic] = useState<ChatTopic>("restart");
  const [shown, setShown] = useState(2);
  const [auto, setAuto] = useState(false);
  const aliases = useMemo(() => assignAnonymousCodes("browser-fixture-save"), []);
  const script = useMemo(() => createAnonymousChatScript(kind, topic, ["ZJ", "ZH"] as GuestId[], "B"), [kind, topic]);
  const topicNames: Record<ChatTopic, string> = { restart: "你会和分手的人重新开始吗？", "like-or-habit": "你觉得喜欢与习惯有什么区别？", "remember-habits": "如果有人记得你的生活习惯，你会开心吗？" };

  useEffect(() => {
    if (!auto || shown >= script.lines.length) return;
    const timer = window.setTimeout(() => setShown((value) => Math.min(script.lines.length, value + 1)), 1750);
    return () => window.clearTimeout(timer);
  }, [auto, shown, script.lines.length]);

  const changeRoom = (next: RoomKind) => { setKind(next); setShown(2); setAuto(false); };
  const participants = kind === "pair" ? ["ZJ", "ZH"] as GuestId[] : guests.map((guest) => guest.id);

  return <main className="d1-camera-app anonymous-fixture">
    <header className="d1-header"><small>EP.02 · ANONYMOUS ROOM</small><div><h1>{script.title}</h1><p>{topicNames[topic]} · 匿名身份不公开</p></div></header>
    <nav className="fixture-room-tabs">{([["pair", "双人房"], ["group", "五人群聊"], ["question", "提问箱"]] as [RoomKind, string][]).map(([id, name]) => <button key={id} aria-pressed={kind === id} onClick={() => changeRoom(id)}>{name}</button>)}</nav>
    <label className="fixture-topic">话题<select value={topic} onChange={(event) => { setTopic(event.target.value as ChatTopic); setShown(2); setAuto(false); }}><option value="restart">分手后重新开始</option><option value="like-or-habit">喜欢与习惯</option><option value="remember-habits">记得生活习惯</option></select></label>
    <div className="d1-anon-participants">参与者：{kind === "question" ? "5 份独立回答" : participants.map((id) => `@${aliases[id]}`).join(" · ")}</div>
    <SceneChatStream sceneId={`${kind}-${topic}`} rows={script.lines} shownCount={shown} auto={auto} label={script.title} anonymous anonymousDisplayName={(speaker) => `@${aliases[speaker]}`} presentation={kind === "question" ? "answers" : "conversation"} speakerName={() => "匿名嘉宾"}/>
    <footer className="d1-player-bar"><button onClick={() => setAuto((value) => !value)}>{auto ? "暂停" : "自动播放"}</button><button onClick={() => setShown((value) => Math.min(script.lines.length, value + 1))} disabled={shown >= script.lines.length}>下一条</button><span data-testid="chat-progress">{shown}/{script.lines.length}</span></footer>
  </main>;
}

const root = document.getElementById("root");
if (!root) throw new Error("missing test root");
createRoot(root).render(<AnonymousChatFixture/>);
