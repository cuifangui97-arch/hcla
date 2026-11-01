import { formalXPairs, type GuestId, type ScriptLine } from "./day1-data";

export type ChatTopic = "restart" | "like-or-habit" | "remember-habits";
export type RoomKind = "pair" | "group" | "question";
export type LinkedChatLine = ScriptLine & { id: string; replyToId?: string };
export type AnonymousChatScript = {
  kind: RoomKind;
  topic: ChatTopic;
  title: string;
  participants: GuestId[];
  lines: LinkedChatLine[];
};

export const anonymousCodes = ["drrrr", "ggggn", "bbcca", "pyyyz", "mttto"] as const;
export type AnonymousCode = (typeof anonymousCodes)[number];
export type AnonymousAliases = Record<GuestId, AnonymousCode>;
const roster: GuestId[] = ["ZZX", "SXH", "ZJ", "ZZY", "ZH"];
const stableHash = (value: string) => { let h = 2166136261; for (const char of value) h = Math.imul(h ^ char.charCodeAt(0), 16777619); return h >>> 0; };

/** Deterministic per-save shuffle, persisted by EP02, with no identity clue in the code itself. */
export function assignAnonymousCodes(seed: string): AnonymousAliases {
  const people = [...roster].sort((a, b) => stableHash(`${seed}:person:${a}`) - stableHash(`${seed}:person:${b}`));
  const codes = [...anonymousCodes].sort((a, b) => stableHash(`${seed}:code:${a}`) - stableHash(`${seed}:code:${b}`));
  return Object.fromEntries(people.map((person, index) => [person, codes[index]])) as AnonymousAliases;
}

const line = (id: string, speaker: GuestId, text: string, replyToId: string, mood = "匿名嘉宾"): LinkedChatLine => ({ id, speaker, text, replyToId, mood });
const prompt = (id: string, text: string): LinkedChatLine => ({ id, speaker: "STAGE", text, mood: "系统提问" });
const label: Record<ChatTopic, string> = { restart: "你会和分手的人重新开始吗？", "like-or-habit": "你觉得喜欢与习惯有什么区别？", "remember-habits": "如果有人记得你的生活习惯，你会开心吗？" };

const groupScripts: Record<ChatTopic, (mode: string) => LinkedChatLine[]> = {
  restart: (mode) => [
    prompt("g-a-00", "节目组提问：如果曾经分开的人再次遇见，你觉得什么情况下适合重新开始？"),
    line("g-a-01", "ZJ", "我会先看当初为什么停下来。只因为最近想念，不一定就说明问题解决了。", "g-a-00"),
    line("g-a-02", "ZZY", "那要是当时有些话没说完呢？", "g-a-01"),
    line("g-a-03", "ZH", "没说完可以补上，但补完以后也可能发现答案还是不一样。", "g-a-02"),
    line("g-a-04", "SXH", "所以得先问现在的对方怎么想，不能拿以前的默契代替回答。", "g-a-03"),
    line("g-a-05", "ZZX", mode === "A" || mode === "E" ? "重新开始也不是回到原点，没说清的事得重新听一遍。" : mode === "B" ? "重新开始得看现在两个人都愿不愿意，不能只按熟悉的习惯走。" : mode === "C" ? "就算以前很熟，也要重新确认今天的想法。" : "如果只有一个人想回头，再熟悉也不能替另一个人做决定。", "g-a-04"),
    line("g-a-06", "ZJ", "听起来像复合之前还要先做一次复盘。", "g-a-05"),
    line("g-a-07", "ZZY", "至少得知道这次不是为了把‘想念’两个字交作业。", "g-a-06"),
    line("g-a-08", "ZJ", "你这话怎么还带检查项。", "g-a-07", "开玩笑"),
    line("g-a-09", "ZZY", "我只是怕有人连题目都没看完就交卷。", "g-a-08", "笑着补充"),
    line("g-a-10", "ZH", "玩笑归玩笑，重新开始不能靠一方替另一方做决定。", "g-a-09"),
    line("g-a-11", "SXH", "嗯，愿意再聊一次，和答应复合是两件事。", "g-a-10"),
    line("g-a-12", "ZZX", "那可以先从把一件旧事讲明白开始。", "g-a-11"),
    line("g-a-13", "ZJ", "比如先约一顿饭，不用第一天就给关系命名。", "g-a-12"),
    line("g-a-14", "ZZY", "这条我赞成，菜单比关系定义好选多了。", "g-a-13", "气氛放松"),
    line("g-a-15", "ZH", "先把话说清楚，之后由两个人各自决定。", "g-a-14"),
  ],
  "like-or-habit": () => [
    prompt("g-b-00", "节目组提问：你觉得喜欢和习惯有什么区别？可以从一件日常小事开始说。"),
    line("g-b-01", "SXH", "习惯像不用想就会去做，喜欢是做之前还会想知道对方舒不舒服。", "g-b-00"),
    line("g-b-02", "ZJ", "那每天提醒人吃饭算哪一个？", "g-b-01"),
    line("g-b-03", "ZZY", "得看是记着对方，还是只是在提醒自己完成任务。", "g-b-02"),
    line("g-b-04", "ZJ", "这标准挺严的，我发个‘吃饭了吗’还要交说明书。", "g-b-03", "打趣"),
    line("g-b-05", "ZH", "不用说明书，看对方有没有认真听答案就知道了。", "g-b-04"),
    line("g-b-06", "ZZX", "比如对方说今天不想吃，愿不愿意换个方式关心？", "g-b-05"),
    line("g-b-07", "SXH", "对，关心不是把自己的安排套在别人身上。", "g-b-06"),
    line("g-b-08", "ZJ", "我懂了。习惯会让我照着旧做法走，喜欢还得看今天的反应。", "g-b-07"),
    line("g-b-09", "ZZY", "这句比刚才的提醒有进步。", "g-b-08", "笑"),
    line("g-b-10", "ZJ", "收到，匿名聊天室还负责打分。", "g-b-09", "玩笑"),
    line("g-b-11", "ZH", "也不一定非得分出高低，习惯可以让人安心，也可能需要调整。", "g-b-10"),
    line("g-b-12", "ZZX", "喜欢大概是愿意为这个调整多问一句。", "g-b-11"),
    line("g-b-13", "SXH", "先问，不替对方回答。", "g-b-12"),
    line("g-b-14", "ZZY", "那我把‘你应该’换成‘你想不想’，听起来确实轻一点。", "g-b-13"),
    line("g-b-15", "ZH", "这样就能知道是在相处，还是只是在重复。", "g-b-14"),
  ],
  "remember-habits": () => [
    prompt("g-c-00", "节目组提问：如果有人记得你的生活习惯，你会开心吗？说说什么样的细节会让你舒服。"),
    line("g-c-01", "ZZY", "如果记得我不吃什么，我会觉得他有认真听。", "g-c-00"),
    line("g-c-02", "SXH", "记得和替你决定不一样。最好是问一句今天还要不要照旧。", "g-c-01"),
    line("g-c-03", "ZJ", "那我记得大家爱喝什么，算加分还是采购员基本功？", "g-c-02"),
    line("g-c-04", "ZZY", "先把东西买对，再来申请加分。", "g-c-03", "打趣"),
    line("g-c-05", "ZJ", "标准好具体，我现在就想检查购物清单。", "g-c-04", "笑"),
    line("g-c-06", "ZH", "被记得会开心，但如果对方不确定，直接问也很好。", "g-c-05"),
    line("g-c-07", "ZZX", "有时候一句‘还是原来那个吗’比直接递过来更体贴。", "g-c-06"),
    line("g-c-08", "SXH", "对，习惯会变，关心也得跟着更新。", "g-c-07"),
    line("g-c-09", "ZJ", "像软件更新？那我不能只记住旧版本。", "g-c-08", "玩笑"),
    line("g-c-10", "ZZY", "你最好别给人弹出‘是否稍后提醒’。", "g-c-09", "笑"),
    line("g-c-11", "ZH", "这个比喻还挺准确，记忆是提醒，不是替人做主。", "g-c-10"),
    line("g-c-12", "ZZX", "如果记错了，也可以让对方纠正，不用装作全都懂。", "g-c-11"),
    line("g-c-13", "SXH", "能记住当然好，愿意重新确认也一样重要。", "g-c-12"),
    line("g-c-14", "ZJ", "那今天的结论：清单可以存档，口味要问本人。", "g-c-13"),
    line("g-c-15", "ZZY", "同意，别把我的那份香菜记错就行。", "g-c-14", "轻松收尾"),
  ],
};

const pairScripts: Record<ChatTopic, [string, string][]> = {
  restart: [
    ["如果再次遇见一个曾经分开的人，你会先聊什么？", "先聊现在吧。以前为什么停下，也要等两个人都愿意再谈。"],
    ["那你会不会怕一聊以前，气氛就变得很沉？", "会，所以可以先从一件具体的事开始，不必一次说完。"],
    ["比如问问当时哪句话没说出口？", "可以，但也要允许对方不想回答。"],
    ["如果对方说愿意聊，你会马上答应重新开始吗？", "不会。愿意聊天只是愿意了解，不是已经做了决定。"],
    ["那要观察什么？", "看两个人现在能不能把问题讲清楚，也看行动有没有变化。"],
    ["听起来像面试。", "那我换个轻松点的说法：先一起吃顿饭，别带着答案去。"],
    ["吃饭的时候如果冷场呢？", "就先点菜。菜单不会替我们决定关系。"],
    ["你这个收尾还挺实用。", "至少比要求对方立刻说清未来容易。"],
  ],
  "like-or-habit": [
    ["你觉得喜欢和习惯最大的区别是什么？", "习惯会照旧做，喜欢会留意对方今天是不是还需要。"],
    ["那固定问一句‘吃了吗’算习惯吗？", "可能算。但你要听他怎么回答，不能问完就当完成了。"],
    ["如果他说现在不饿呢？", "那就记住今天不饿，不要把上次的答案当成这次的。"],
    ["听起来喜欢还得更新信息。", "是啊，不能拿旧印象替今天的人回答。"],
    ["你说得像在维护一份很长的清单。", "清单可以帮忙，最后还是要问本人。"],
    ["那我先把‘你肯定想要’删掉。", "换成‘你想不想’，听起来轻松多了。"],
    ["这算今天的聊天成果吗？", "算。至少少替对方做了一次决定。"],
    ["好，下一次我先问再买。", "成交。这个比抽象定义容易记。"],
  ],
  "remember-habits": [
    ["如果有人记得你的生活习惯，你会开心吗？", "会一点，但我更喜欢他记得之后还问我今天是不是照旧。"],
    ["为什么还要问？记住不是挺好吗？", "习惯会变。记得细节很好，替我决定就不一定。"],
    ["那记得你不吃什么呢？", "我会觉得他有认真听；要是记不准，问我也没关系。"],
    ["所以记错也不算扣分？", "不算，装作确定才比较尴尬。"],
    ["那我以后不猜口味，直接问。", "可以，问题比一盘不喜欢的菜容易处理。"],
    ["你这标准很现实。", "生活习惯本来就发生在生活里。"],
    ["那我先记下：记得，但别自作主张。", "这条记录得不错。"],
    ["匿名聊天室还真能做笔记。", "那就把最后一句当今天的总结。"],
  ],
};

const pairParticipants = (pair: GuestId[]) => pair.length === 2 ? pair : roster.slice(0, 2);
const makePairLines = (topic: ChatTopic, pair: GuestId[], mode: string): LinkedChatLine[] => {
  const [a, b] = pairParticipants(pair);
  const turns = pairScripts[topic].map((turn) => [...turn]);
  const pairKey = [a, b].sort().join("-");
  if (formalXPairs[mode]?.some(([x, y]) => [x, y].sort().join("-") === pairKey)) {
    const currentAttention: Record<ChatTopic, string> = {
      restart: "我会先确认旧问题有没有变化，再让两个人各自给出新的答案。",
      "like-or-habit": "相处久了容易照着惯性走，所以我会多确认一句对方现在怎么想。",
      "remember-habits": "熟悉细节不代表可以替对方做主，我更愿意记得之后再问一次。",
    };
    turns[0][1] = currentAttention[topic];
  }
  const lead = prompt(`p-${topic}-00`, `节目组向本轮两位嘉宾提问：${label[topic]}`);
  const lines = turns.flatMap(([first, second], index) => [
    line(`p-${topic}-${String(index * 2 + 1).padStart(2, "0")}`, a, first, index === 0 ? lead.id : `p-${topic}-${String((index - 1) * 2 + 2).padStart(2, "0")}`),
    line(`p-${topic}-${String(index * 2 + 2).padStart(2, "0")}`, b, second, `p-${topic}-${String(index * 2 + 1).padStart(2, "0")}`),
  ]);
  return [lead, ...lines, { id: `p-${topic}-end`, speaker: "STAGE", text: "本轮结束。匿名代号只在聊天室内显示，节目组保留身份映射。", mood: "系统提示" }];
};

export function createAnonymousChatScript(kind: RoomKind, topic: ChatTopic, pair: GuestId[], mode: string): AnonymousChatScript {
  const participants = kind === "pair" ? pairParticipants(pair) : kind === "group" ? [...roster] : [...roster];
  if (kind === "pair") return { kind, topic, title: "匿名双人聊天室", participants, lines: makePairLines(topic, participants, mode) };
  if (kind === "group") return { kind, topic, title: "五人匿名群聊", participants, lines: groupScripts[topic](mode) };
  const questionAnswers: Record<ChatTopic, string[]> = {
    restart: ["先想清楚当初停下的原因，再看现在是否还有共同意愿。", "愿意谈谈不等于已经决定复合。", "如果只是怀念熟悉感，我会先给自己一点时间。", "两个人都愿意、也能面对旧问题，才有重新了解的可能。", "答案不一定马上出现，可以先从一次诚实的对话开始。"],
    "like-or-habit": ["习惯会重复，喜欢会继续留意对方现在的感受。", "我觉得两者能同时存在，不必硬分输赢。", "固定做一件事不代表不真心，关键是能不能听见反馈。", "愿意调整和重新确认，比猜对所有习惯更重要。", "如果只剩下惯性，也可以停下来问问自己还想不想继续。"],
    "remember-habits": ["会开心，尤其是对方记得后还会问我有没有变化。", "记住细节让我觉得被认真听见。", "记错没关系，坦白问一句更舒服。", "关心不是替我做决定，而是给我表达的空间。", "能记住和愿意更新印象，都让我觉得安心。"],
  };
  return { kind, topic, title: "匿名提问箱", participants, lines: [prompt(`q-${topic}-00`, `匿名提问：${label[topic]}`), ...questionAnswers[topic].map((text, index) => ({ id: `q-${topic}-${index + 1}`, speaker: roster[index], text, mood: "匿名回答" })), { id: `q-${topic}-end`, speaker: "STAGE", text: "回答彼此独立，不组成群聊，也不显示回答者身份。", mood: "系统提示" }] };
}
