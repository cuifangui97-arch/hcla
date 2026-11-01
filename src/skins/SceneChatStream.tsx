import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { GuestId, ScriptLine } from "../game/day1-data";
import { guests } from "../game/day1-data";
import { GuestAvatar } from "../game/GuestAvatar";

type Props = {
  sceneId: string;
  rows: (ScriptLine & { id?: string; replyToId?: string })[];
  shownCount: number;
  auto: boolean;
  label: string;
  anonymous?: boolean;
  anonymousDisplayName?: (speaker: GuestId) => string;
  presentation?: "conversation" | "answers";
  speakerName: (speaker: GuestId) => string;
  onLatest?: () => void;
};

export function isNearChatBottom(distanceFromBottom: number, threshold = 48) {
  return distanceFromBottom >= 0 && distanceFromBottom < threshold;
}

export function SceneChatStream({ sceneId, rows, shownCount, auto, label, anonymous = false, anonymousDisplayName, presentation = "conversation", speakerName, onLatest }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const followBottom = useRef(true);
  const previousScene = useRef(sceneId);
  const wasAuto = useRef(auto);
  const userScrollIntent = useRef(false);
  const userScrollTimer = useRef<number | undefined>(undefined);
  const [showLatest, setShowLatest] = useState(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const markUserScroll = () => {
    userScrollIntent.current = true;
    if (userScrollTimer.current !== undefined) window.clearTimeout(userScrollTimer.current);
    userScrollTimer.current = window.setTimeout(() => { userScrollIntent.current = false; }, 180);
  };

  useEffect(() => () => {
    if (userScrollTimer.current !== undefined) window.clearTimeout(userScrollTimer.current);
  }, []);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (previousScene.current !== sceneId) {
      previousScene.current = sceneId;
      followBottom.current = true;
      setShowLatest(false);
      el.scrollTop = 0;
    }
    // Follow state comes from the user's last deliberate scroll event, before
    // React commits the newly appended row; don't infer it from post-append height.
    if (!followBottom.current) return;
    let frame = 0;
    frame = window.requestAnimationFrame(() => {
      scrollToBottom();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [sceneId, shownCount, auto, scrollToBottom]);

  useEffect(() => {
    const el = listRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (followBottom.current) scrollToBottom();
    });
    observer.observe(el);
    const content = el.querySelector(".d1-chat-content");
    if (content) observer.observe(content);
    return () => observer.disconnect();
  }, [sceneId, scrollToBottom]);

  useEffect(() => {
    if (auto && !wasAuto.current) {
      followBottom.current = true;
      setShowLatest(false);
      const frame = window.requestAnimationFrame(() => scrollToBottom("smooth"));
      wasAuto.current = auto;
      return () => window.cancelAnimationFrame(frame);
    }
    wasAuto.current = auto;
  }, [auto, scrollToBottom]);

  const returnLatest = () => {
    onLatest?.();
    followBottom.current = true;
    setShowLatest(false);
    const el = listRef.current;
    scrollToBottom("smooth");
  };
  const visibleRows = rows.slice(0, shownCount);
  const rowsById = new Map(visibleRows.flatMap((row) => row.id ? [[row.id, row] as const] : []));

  return <div className="d1-dialogue-area">
    <div className="d1-transcript-meta"><span>{label}</span><span>{Math.min(shownCount, rows.length)} / {rows.length}</span></div>
    <div ref={listRef} className="d1-chat-scroll" onWheel={markUserScroll} onTouchStart={markUserScroll} onPointerDown={markUserScroll} onScroll={(event) => {
      if (!userScrollIntent.current) return;
      const el = event.currentTarget;
      followBottom.current = isNearChatBottom(el.scrollHeight - el.scrollTop - el.clientHeight);
      setShowLatest(!followBottom.current);
      if (userScrollTimer.current !== undefined) window.clearTimeout(userScrollTimer.current);
      userScrollTimer.current = window.setTimeout(() => { userScrollIntent.current = false; }, 180);
    }}>
      <div className="d1-chat-content">
      <div className="d1-chat-bottom-spacer" aria-hidden="true" />
      {visibleRows.map((row, index) => {
        const key = row.id ?? `${sceneId}-${index}`;
        if (row.speaker === "STAGE") return <div className="d1-stage-caption" key={`${sceneId}-${index}`}><span>{row.mood==="interview-pd"?"节目组提问":`节目字幕 · ${anonymous ? "系统" : "动作"}`}</span><p>{row.text}</p></div>;
        const id = row.speaker as GuestId;
        if (presentation === "answers") return <article className="d1-anonymous-answer" key={key}><span>匿名回答</span><p>{row.text}</p></article>;
        const alias = anonymous ? anonymousDisplayName?.(id) ?? row.mood ?? "匿名嘉宾" : speakerName(id);
        const parent = row.replyToId ? rowsById.get(row.replyToId) : undefined;
        const parentName = parent && parent.speaker !== "STAGE" ? anonymousDisplayName?.(parent.speaker) : undefined;
        return <article className="d1-bubble-row" key={key}>
          {anonymous ? <span className={`d1-bubble-avatar d1-anon-avatar d1-anon-${alias.replace(/^@/, "")}`} aria-label="匿名嘉宾头像">{alias.replace(/^@/, "")}</span> : <GuestAvatar id={id} className="d1-bubble-avatar"/>}
          <div className="d1-bubble-main">
            <div className="d1-bubble-name">{alias}<small>{anonymous ? row.mood ?? "匿名嘉宾" : row.mood ?? "现场对白"}</small></div>
            {parentName && <small className="d1-reply-reference">回应 {parentName}</small>}
            <div className="d1-bubble"><p>{row.text}</p></div>
          </div>
        </article>;
      })}
      <div className="d1-chat-bottom-anchor" aria-hidden="true" />
      </div>
    </div>
    {showLatest && <button className="d1-latest" onClick={returnLatest}>回到最新</button>}
  </div>;
}

export function sceneSpeakerName(id: GuestId) {
  return guests.find((guest) => guest.id === id)?.name ?? id;
}
