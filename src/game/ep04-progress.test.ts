import { describe, expect, it } from "vitest";
import { diagnoseEp04, ep04EditorGate, ep04SmsPrerequisite, resolveEp04Phase } from "./ep04-progress";

describe("EP04 phase recovery and editor gate", () => {
  it("opens editing after frozen SMS even when an old save still says sms", () => {
    const legacy = { phase: "sms", sent: true, smsFrozen: { ZZX: { body: "frozen" } }, recorded: ["clip-a"] };
    expect(resolveEp04Phase(legacy)).toBe("edit");
    expect(ep04EditorGate(legacy)).toEqual({ unlocked: true, reason: "本期必需阶段已完成，剪辑室开放。", nextPhase: "edit" });
    expect(diagnoseEp04(legacy, "D04-SMS")).toMatchObject({ phase: "edit", currentSceneId: "D04-SMS", nextSceneId: "EP04-EDITING", editorUnlocked: true });
  });

  it("preserves an unfinished playable legacy post-SMS scene", () => {
    const legacy = { phase: "kcNight", sent: true, kcNightConversationViewed: false, kcNightProgress: { 客厅: 4 } };
    expect(resolveEp04Phase(legacy)).toBe("kcNight");
    expect(ep04EditorGate(legacy)).toMatchObject({ unlocked: false, nextPhase: "kcNight" });
    expect(diagnoseEp04(legacy).nextSceneId).toBe("D04-POST-SMS");
  });

  it("does not unlock on a premature phase with missing required stages", () => {
    const incomplete = { phase: "interview", sent: false, ep04FreeActivityCompleted: false, ep04InterviewCompleted: false };
    expect(ep04EditorGate(incomplete)).toMatchObject({ unlocked: false, nextPhase: "activity" });
  });

  it("keeps EP04 letters, free activity and interviews ahead of SMS even when its app is opened directly",()=>{
    expect(ep04SmsPrerequisite({phase:"story"})).toBe("story");
    expect(ep04SmsPrerequisite({phase:"sms"})).toBe("letters");
    expect(ep04SmsPrerequisite({readingOrderConfirmed:true,allLettersRead:true,phase:"sms"})).toBe("freeActivity");
    expect(ep04SmsPrerequisite({readingOrderConfirmed:true,allLettersRead:true,ep04FreeActivityCompleted:true,phase:"sms"})).toBe("interview");
    expect(ep04SmsPrerequisite({readingOrderConfirmed:true,allLettersRead:true,ep04FreeActivityCompleted:true,ep04InterviewCompleted:true,phase:"sms"})).toBeUndefined();
    expect(ep04SmsPrerequisite({phase:"story",sent:true,smsFrozen:{ZZX:{body:"keep"}}})).toBe("story");
    expect(resolveEp04Phase({phase:"story",sent:true,smsFrozen:{ZZX:{body:"keep"}}})).toBe("story");
  });

  it("returns to editing after the post-SMS scene is marked viewed", () => {
    expect(resolveEp04Phase({ phase: "kcNight", sent: true, kcNightConversationViewed: true })).toBe("edit");
  });
});
