import type { GuestId, ScriptLine } from "./day1-data";

export type KcSmsOutcome = "mutual" | "suxinhao_only" | "zhuzhixin_only" | "neither";
export type KcNightPlace = "客厅" | "厨房" | "阳台";
export type KcSmsFlags = { zhuzhixinSentToSuxinhao: boolean; suxinhaoSentToZhuzhixin: boolean };
export type KcSmsArchiveRow = { episode: number; outcome: KcSmsOutcome };

export function deriveKcSmsOutcome(flags: KcSmsFlags): KcSmsOutcome {
  if (flags.zhuzhixinSentToSuxinhao && flags.suxinhaoSentToZhuzhixin) return "mutual";
  if (flags.suxinhaoSentToZhuzhixin) return "suxinhao_only";
  if (flags.zhuzhixinSentToSuxinhao) return "zhuzhixin_only";
  return "neither";
}

export function kcSmsFlagsFromDeliveries(deliveries: { senderId: GuestId; recipientId: GuestId }[]): KcSmsFlags {
  return {
    zhuzhixinSentToSuxinhao: deliveries.some((row) => row.senderId === "ZZX" && row.recipientId === "SXH"),
    suxinhaoSentToZhuzhixin: deliveries.some((row) => row.senderId === "SXH" && row.recipientId === "ZZX"),
  };
}

export function kcEmotionalReaction(outcome: KcSmsOutcome): string {
  const reactions: Record<KcSmsOutcome, string> = {
    mutual: "两人都收到对方的选择；朱志鑫仍然话少，苏新皓把追问留到对方愿意开口时。",
    suxinhao_only: "苏新皓主动向朱志鑫表达了选择；朱志鑫用安静和生活细节回应，没有立刻解释自己的选择。",
    zhuzhixin_only: "朱志鑫向苏新皓表达了选择；苏新皓察觉对方情绪后先确认是否需要陪伴，不要求即时回答。",
    neither: "两人当晚都没有互相选择；朱志鑫转移话题并照看日常，苏新皓练习把关心说轻一点。",
  };
  return reactions[outcome];
}

const line = (speaker: ScriptLine["speaker"], text: string, mood?: string): ScriptLine => ({ speaker, text, mood });
const stage = (text: string): ScriptLine => line("STAGE", text);

/** Quiet, private dialogue. It never states who sent a message or confirms X identities. */
export function kcNightScript(outcome: KcSmsOutcome, place: KcNightPlace, episode: number): ScriptLine[] {
  const intro: Record<KcNightPlace, string> = {
    客厅: "深夜，客厅只留着一盏落地灯。两个人隔着茶几坐下，电视没有开。",
    厨房: "深夜，厨房的水壶刚停。朱志鑫把杯子放到台面，苏新皓在旁边收好餐具。",
    阳台: "深夜，阳台门留着一道缝。风把窗帘吹起一点，两个人各自安静了一会儿。",
  };
  const scripts: Record<KcSmsOutcome, ScriptLine[]> = {
    mutual: [stage("朱志鑫先把温水推到苏新皓手边。"), line("SXH", "你还没睡？"), line("ZZX", "等水凉一点。"), line("SXH", "那我陪你坐一会儿，不问今天的事。", "克制"), line("ZZX", "嗯。你明天还吃沙拉吗？"), line("SXH", "吃一点就好。你别又只顾着忙。"), line("ZZX", "知道了。"), stage("话题落在明天的早餐上。两个人都没有催对方把心情讲完。")],
    suxinhao_only: [stage("朱志鑫把杯子摆好，又低头整理桌边的餐巾。"), line("SXH", "今天有点晚了。你还想把厨房收完吗？"), line("ZZX", "马上。你先坐。"), line("SXH", "我可以帮忙，也可以先不问。你选一个。", "试着确认"), line("ZZX", "先把这个放冰箱吧。"), line("SXH", "好，我听你的。"), line("ZZX", "明早记得吃点东西，别只拿沙拉垫着。"), stage("苏新皓点点头，没有把关心变成追问。两人一起关掉厨房的灯。")],
    zhuzhixin_only: [stage("苏新皓发现朱志鑫一直在擦一只已经干净的杯子。"), line("SXH", "这只杯子我来放。你是不是有话想说？"), line("ZZX", "没有，刚好顺手。"), line("SXH", "好。如果你想说，我在；如果不想，现在也可以不说。", "放轻声音"), line("ZZX", "那你明天早点吃饭。"), line("SXH", "我会记得。你也别把早餐做成只给别人的。"), line("ZZX", "我又不是不会吃。"), stage("朱志鑫笑了一下，把话题留在早餐。苏新皓没有要求他解释沉默。")],
    neither: [stage("两个人先后走进厨房，没有马上看向对方。"), line("ZZX", "水壶里还有热水。"), line("SXH", "我看到了，谢谢。"), line("ZZX", "沙拉还剩一点，明早记得放进冰箱。"), line("SXH", "嗯。你不用特意替我收。"), line("ZZX", "顺手而已。"), line("SXH", "那我也把台面擦一下，可以吗？"), line("ZZX", "可以。"), stage("两个人各做一件小事，没有把当晚的安静解释成答案。")],
  };
  const contextual = episode > 1 ? [stage(`这是EP.${String(episode).padStart(2, "0")}短信投递后的深夜机位。节目组只保留现场，没有公开收件路由。`)] : [];
  return [stage(intro[place]), ...contextual, ...scripts[outcome]];
}

export function kcNightClipId(episode: number): string { return `D${String(episode).padStart(2, "0")}-KC-NIGHT`; }
export function kcNightEventId(episode: number): string { return `D${String(episode).padStart(2, "0")}-KC-NIGHT`; }

export function summarizeKcSmsHistory(rows: KcSmsArchiveRow[]): string[] {
  const mutual = rows.filter((row) => row.outcome === "mutual").map((row) => `EP.${String(row.episode).padStart(2, "0")}`);
  const missed = rows.filter((row) => row.outcome !== "mutual").map((row) => `EP.${String(row.episode).padStart(2, "0")}`);
  const format = (nights: string[]) => nights.length ? nights.join("、") : "暂无已保存记录";
  return [
    `按已保存并实际投递的短信路由核对：朱志鑫与苏新皓互选的夜晚为${format(mutual)}。`,
    `没有形成互选的夜晚为${format(missed)}。这份记录只反映当晚送达结果。`,
    "已保存的发送对象不能证明当事人当时的动机；是否曾想互选却另作选择，只能依据后来亲口说明，节目组不替他们补写避嫌理由。",
  ];
}
