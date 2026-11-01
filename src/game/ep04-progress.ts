export type Ep04ProgressLike = Record<string, unknown>;

/**
 * Resolve legacy EP04 phases without discarding any saved content. SMS delivery is
 * the durable boundary: an old `sms` phase with frozen deliveries resumes in the
 * edit room; an in-progress legacy `kcNight` remains playable exactly once.
 */
export function resolveEp04Phase(state: Ep04ProgressLike): string {
  const phase = String(state.phase ?? "story");
  if (state.ep04BroadcastCompleted === true && phase !== "social") return "complete";
  if (phase === "social" || phase === "complete") return phase;
  if (phase === "edit") return "edit";

  // Keep an early stage even if someone opened HEART SMS directly. A premature
  // delivery must not make the letter and activity scenes disappear.
  if (["story", "decision", "activity", "freeActivity", "interview"].includes(phase)) return phase;

  const smsDelivered = state.sent === true || state.ep04SmsCompleted === true || Boolean(state.smsFrozen && Object.keys(state.smsFrozen as object).length);
  if (smsDelivered) {
    // This is the existing, playable post-SMS scene. Keep its progress if it has
    // not been completed; otherwise go straight to EDITING.
    if (phase === "kcNight" && state.kcNightConversationViewed !== true) return "kcNight";
    return "edit";
  }

  if (phase === "kcNight") return "sms";
  if (phase === "interview" && state.ep04InterviewCompleted === true) return "sms";
  if (phase === "freeActivity" && state.ep04FreeActivityCompleted === true) return "interview";
  return phase;
}

export function ep04SmsDelivered(state: Ep04ProgressLike): boolean {
  return state.sent === true || state.ep04SmsCompleted === true || Boolean(state.smsFrozen && Object.keys(state.smsFrozen as object).length);
}

/** First unfinished EP04 checkpoint before SMS dispatch; opening the app cannot skip it. */
export function ep04SmsPrerequisite(state: Ep04ProgressLike): string | undefined {
  if (!state.readingOrderConfirmed || !(state.allLettersRead || state.ep04LetterPhaseCompleted)) {
    return state.phase === "story" ? "story" : "letters";
  }
  if (state.ep04FreeActivityCompleted !== true) return "freeActivity";
  if (state.ep04InterviewCompleted !== true) return "interview";
  return undefined;
}

export function ep04EditorGate(state: Ep04ProgressLike): { unlocked: boolean; reason: string; nextPhase: string } {
  const phase = resolveEp04Phase(state);
  if (phase === "edit" || phase === "social" || phase === "complete" || Boolean(state.broadcastId)) {
    return { unlocked: true, reason: "本期必需阶段已完成，剪辑室开放。", nextPhase: phase };
  }
  if (phase === "kcNight") return { unlocked: false, reason: "深夜未公开素材仍在录制中。", nextPhase: "kcNight" };
  if (!state.allLettersRead && !state.ep04LetterPhaseCompleted) return { unlocked: false, reason: "五人读信尚未完成。", nextPhase: "activity" };
  if (!state.ep04FreeActivityCompleted) return { unlocked: false, reason: "下午自由活动尚未完成。", nextPhase: "freeActivity" };
  if (!state.ep04InterviewCompleted) return { unlocked: false, reason: "本期后采尚未完成。", nextPhase: "interview" };
  if (!ep04SmsDelivered(state)) return { unlocked: false, reason: "本期短信尚未投递。", nextPhase: "sms" };
  return { unlocked: false, reason: "当前阶段尚未完成。", nextPhase: phase };
}

export function diagnoseEp04(state: Ep04ProgressLike, currentSceneId = ""): {
  episode: number; phase: string; completedPhases: string[]; currentSceneId: string;
  nextSceneId: string; editorUnlocked: boolean; editorReason: string;
} {
  const phase = resolveEp04Phase(state);
  const completedPhases: string[] = [];
  if (state.readingOrderConfirmed && (state.allLettersRead || state.ep04LetterPhaseCompleted)) completedPhases.push("LETTER_ORDER", "LETTER_READING");
  if (state.ep04FreeActivityCompleted) completedPhases.push("FREE_ACTIVITY");
  if (state.ep04InterviewCompleted) completedPhases.push("INTERVIEW");
  if (ep04SmsDelivered(state)) completedPhases.push("SMS");
  if (state.kcNightConversationViewed) completedPhases.push("POST_SMS");
  if (state.broadcastId || state.ep04BroadcastCompleted) completedPhases.push("EDITING", "BROADCAST");
  const gate = ep04EditorGate(state);
  const nextSceneId = phase === "kcNight" ? "D04-POST-SMS" : phase === "edit" ? "EP04-EDITING" : `EP04-${phase.toUpperCase()}`;
  return { episode: 4, phase, completedPhases, currentSceneId, nextSceneId, editorUnlocked: gate.unlocked, editorReason: gate.reason };
}
