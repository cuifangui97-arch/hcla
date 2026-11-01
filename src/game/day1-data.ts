export type GuestId = "ZZX" | "SXH" | "ZJ" | "ZZY" | "ZH";
export type ScriptLine = { speaker: GuestId | "STAGE"; text: string; mood?: string };
export type SceneScript = { id: string; title: string; time: string; place: string; background: string; lines: ScriptLine[] };

export const guests: { id: GuestId; name: string; role: string; color: string }[] = [
  { id: "ZZX", name: "朱志鑫", role: "话少，熟悉后温柔幽默", color: "#d58b7f" },
  { id: "SXH", name: "苏新皓", role: "行动派，认真观察周围", color: "#8298b6" },
  { id: "ZJ", name: "张极", role: "会用玩笑化解初见的拘谨", color: "#c79a60" },
  { id: "ZZY", name: "张泽禹", role: "反应快，擅长观察细节", color: "#86a886" },
  { id: "ZH", name: "左航", role: "独立细腻，习惯先观察", color: "#9b87ae" },
];

export const formalXPairs: Record<string, [GuestId, GuestId][]> = {
  A: [["ZZX", "SXH"], ["ZJ", "ZZY"]],
  B: [["ZZX", "SXH"], ["ZJ", "ZH"]],
  C: [["ZZX", "SXH"]],
  D: [["ZZX", "SXH"], ["ZZY", "ZH"]],
  E: [["ZZX", "SXH"], ["ZJ", "ZZY"]],
};

export function getXNotice(recipient: GuestId, incomingSenders: GuestId[], mode: string): string {
  const x = formalXPairs[mode]?.find((pair) => pair.includes(recipient));
  if (!x) return "【本季你没有参与节目的正式X】";
  const former = x.find((id) => id !== recipient)!;
  return incomingSenders.includes(former) ? "【你的X，选择了你】" : "【你的X，没有选择你】";
}

export type SavedRelationshipHistory = { relationshipMode: string; formalExPairs: [GuestId, GuestId][] };
const guestIds = new Set<GuestId>(guests.map((guest) => guest.id));

/** Reads the immutable relationship mapping from the persisted season history.
 * Legacy saves without a pair list fall back to their saved mode, then the runtime mode.
 */
export function readSavedRelationshipHistory(value: unknown, fallbackMode = "C"): SavedRelationshipHistory {
  let raw: unknown = value;
  if (typeof raw === "string") {
    try { raw = JSON.parse(raw) as unknown; } catch { raw = undefined; }
  }
  const record = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const relationshipMode = typeof record.relationshipMode === "string" && formalXPairs[record.relationshipMode]
    ? record.relationshipMode
    : formalXPairs[fallbackMode] ? fallbackMode : "C";
  let formalExPairs: [GuestId, GuestId][] | undefined;
  if (Array.isArray(record.formalExPairs)) {
    const pairs = record.formalExPairs.filter((pair): pair is [GuestId, GuestId] =>
      Array.isArray(pair) && pair.length === 2 && guestIds.has(pair[0] as GuestId) && guestIds.has(pair[1] as GuestId) && pair[0] !== pair[1],
    );
    if (pairs.length === record.formalExPairs.length) formalExPairs = pairs;
  }
  if (!formalExPairs && record.formalExMap && typeof record.formalExMap === "object") {
    const map = record.formalExMap as Record<string, unknown>;
    const pairs: [GuestId, GuestId][] = [];
    for (const guest of guests) {
      const former = map[guest.id];
      if (typeof former === "string" && guestIds.has(former as GuestId) && former !== guest.id && !pairs.some((pair) => pair.includes(guest.id) || pair.includes(former as GuestId))) {
        pairs.push([guest.id, former as GuestId]);
      }
    }
    if (pairs.length) formalExPairs = pairs;
  }
  return { relationshipMode, formalExPairs: formalExPairs ?? formalXPairs[relationshipMode].map((pair) => [...pair] as [GuestId, GuestId]) };
}

/** The notice uses the actual senders selected for this delivery batch. */
export function getXNoticeFromHistory(recipient: GuestId, actualSenders: GuestId[], history: SavedRelationshipHistory): string {
  const x = history.formalExPairs.find((pair) => pair.includes(recipient));
  if (!x) return "【本季你没有参与节目的正式X】";
  const former = x.find((id) => id !== recipient)!;
  return actualSenders.includes(former) ? "【你的X，选择了你】" : "【你的X，没有选择你】";
}

export type SmsDelivery = { senderId: GuestId; recipientId: GuestId };
export function getXNoticeForInbox(recipient: GuestId, deliveries: SmsDelivery[], history: SavedRelationshipHistory): string {
  const actualSenders = deliveries.filter((delivery) => delivery.recipientId === recipient).map((delivery) => delivery.senderId);
  return getXNoticeFromHistory(recipient, actualSenders, history);
}

const line = (speaker: ScriptLine["speaker"], text: string, mood?: string): ScriptLine => ({ speaker, text, mood });

export const arrivalScenes: SceneScript[] = [
  { id: "D01-002", title: "朱志鑫入住", time: "10:00", place: "门厅 · 客厅", background: "livingRoom", lines: [
    line("STAGE", "【第一位入住者】行李箱停在沙发旁，客厅暂时只有一个人。"),
    line("ZZX", "有人吗？", "轻声"),
    line("STAGE", "没有回应。他把行李放到沙发边，环顾房间。"),
    line("ZZX", "看来我是第一个。"),
    line("ZZX", "还挺大的。", "观察"),
  ] },
  { id: "D01-003", title: "苏新皓入住", time: "10:20", place: "门厅 · 客厅", background: "livingRoom", lines: [
    line("STAGE", "【二十分钟后】门打开。苏新皓看见朱志鑫，声音停了半拍。"),
    line("SXH", "你们好——", "停顿"),
    line("ZZX", "你好。"),
    line("SXH", "你好。", "克制"),
    line("ZZX", "你来得挺早。"),
    line("SXH", "也没有。"),
    line("STAGE", "短暂沉默。苏新皓先把视线移向桌上的入住规则。"),
    line("SXH", "你已经看过规则了吗？"),
    line("ZZX", "看了一点。"),
    line("SXH", "那我也看看。"),
  ] },
  { id: "D01-004", title: "张极入住", time: "10:45", place: "门厅 · 客厅", background: "livingRoom", lines: [
    line("STAGE", "【第三位入住者】箱轮滚过门槛，客厅里安静的气氛被打断。"),
    line("ZJ", "哈喽！"), line("ZZX", "你好。"), line("SXH", "你好。"),
    line("ZJ", "我还以为我来得挺早。"),
    line("SXH", "你已经第三个了。"),
    line("ZJ", "那还行，没垫底。"),
    line("STAGE", "朱志鑫笑了一下。"),
    line("ZJ", "你们刚刚在干嘛？"),
    line("SXH", "研究规则。"),
    line("ZJ", "研究出来什么了？"),
    line("ZZX", "没有。"),
    line("ZJ", "那你们研究半天研究什么呢？"),
    line("STAGE", "三个人都笑起来。"),
  ] },
  { id: "D01-005", title: "张泽禹入住", time: "11:05", place: "门厅 · 客厅", background: "livingRoom", lines: [
    line("STAGE", "【第四位入住者】门口传来试探的声音。"),
    line("ZZY", "有人在吗？"),
    line("ZJ", "在在在。"),
    line("ZZY", "哟，这么多人？"),
    line("ZJ", "你已经第四个了。"),
    line("ZZY", "那完了。"),
    line("STAGE", "他把行李靠墙放好，目光从每个人脸上掠过。"),
    line("STAGE", "【采访提问】今天有特别在意的人吗？"),
    line("ZZY", "第一天还看不出来吧。"),
  ] },
  { id: "D01-006", title: "左航入住", time: "11:20", place: "门厅 · 客厅", background: "livingRoom", lines: [
    line("STAGE", "【第五位入住者】最后一只行李箱进门，五人终于到齐。"),
    line("ZH", "大家好。"),
    line("STAGE", "四个人先后回应。"),
    line("ZJ", "终于到齐了。"),
    line("ZH", "我是最后一个？"),
    line("ZZY", "对。"),
    line("ZH", "那不好意思。"),
    line("ZJ", "没事，也没等多久。"),
    line("ZH", "这里还挺好看的。"),
    line("STAGE", "【五位嘉宾全部入住 · CLIP-004】"),
  ] },
];

export const pairScenes: Record<string, ScriptLine[]> = {
  "SXH-ZZX": [
    line("SXH", "这个要先洗一下。"), line("ZZX", "我知道。"),
    line("SXH", "那你怎么还没洗？"), line("ZZX", "我刚拿起来。"),
    line("SXH", "行。"), line("ZZX", "你别老站旁边看着。"),
    line("SXH", "我没看你。"), line("ZZX", "那你在看什么？"),
    line("SXH", "看你手上的刀。"), line("ZZX", "哦。"),
  ],
  "ZJ-ZZY": [
    line("ZJ", "这个放多少？"), line("ZZY", "你问我啊？"),
    line("ZJ", "不然问谁？"), line("ZZY", "你自己尝尝。"),
    line("ZJ", "你确定？"), line("ZZY", "你先放少点。"),
  ],
  "ZJ-ZH": [
    line("ZJ", "航酱，帮个忙。"), line("ZH", "什么忙？"),
    line("ZJ", "拿一下那个。"), line("ZH", "你自己够不到？"),
    line("ZJ", "够得到。"), line("ZH", "那你叫我干嘛？"),
    line("ZJ", "给你一点参与感。"), line("STAGE", "左航把东西递过去。"),
    line("ZJ", "谢谢航酱。"),
  ],
  "ZZY-ZH": [
    line("ZZY", "你会切这个吗？"), line("ZH", "应该会。"),
    line("ZZY", "应该？"), line("ZH", "那你会？"),
    line("ZZY", "我也不知道。"), line("STAGE", "两人停顿，低头看了看手里的菜。"),
    line("ZZY", "算了，先查一下。"), line("ZH", "我来。"),
    line("ZZY", "那我给你打下手。"),
  ],
  "SXH-ZJ": [
    line("ZJ", "这个叶子都要放进去吗？"), line("SXH", "先洗干净，再挑掉黄的。"),
    line("ZJ", "步骤这么认真。"), line("SXH", "不然等下吃到沙子怎么办？"),
    line("ZJ", "行，那我负责把沙子找出来。"), line("SXH", "不用找，先冲洗就行。"),
    line("ZJ", "好，我去拿个大一点的盆。"), line("SXH", "谢谢，放水池旁边就行。"),
  ],
  "SXH-ZZY": [
    line("ZZY", "盘子放这边可以吗？"), line("SXH", "再往里一点，端的时候不会碰到。"),
    line("ZZY", "你怎么连桌子都规划得这么细？"), line("SXH", "五个人一起吃，留点位置比较方便。"),
    line("ZZY", "好，听你的。"), line("SXH", "我把沙拉碗放到桌子中间。"),
    line("ZZY", "那我把杯子挪到两边。"), line("SXH", "这样就不容易碰到了。"),
  ],
  "SXH-ZH": [
    line("SXH", "水果要不要先分开洗？"), line("ZH", "我分好了，容易压坏的在上面。"),
    line("SXH", "你挺会收拾。"), line("ZH", "就是不想等会儿重新弄。"),
    line("SXH", "那我把盆放近一点。"), line("ZH", "我洗完就放在右边。"),
    line("SXH", "好，台面我留出一块。"), line("ZH", "这样做起来方便。"),
  ],
  "ZZX-ZJ": [
    line("ZJ", "你煎蛋看起来很熟练。"), line("ZZX", "火小一点就行。"),
    line("ZJ", "那我帮你切葱。"), line("ZZX", "切细一点，放旁边就好。"),
    line("ZJ", "收到，主厨。"), line("STAGE", "朱志鑫把火调小，蛋边缘慢慢定型。"),
    line("ZZX", "葱先放一点就够了。"), line("ZJ", "我先放一半，剩下的留着。"),
    line("ZZX", "行，等下尝一口再决定。"), line("ZJ", "我去拿小碟子。"),
  ],
  "ZZX-ZZY": [
    line("ZZY", "你要不要看一下计时？"), line("ZZX", "还有一会儿。"),
    line("ZZY", "你怎么知道？"), line("ZZX", "听声音差不多了。"),
    line("ZZY", "我负责把盘子准备好。"), line("ZZX", "先拿两个就够了。"),
    line("ZZY", "那我等下再把剩下的端过来。"), line("ZZX", "好，放桌边就行。"),
  ],
  "ZZX-ZH": [
    line("ZH", "这个盘子放哪儿？"), line("ZZX", "灶台旁边，等下装蛋。"),
    line("ZH", "要先垫纸吗？"), line("ZZX", "不用，直接放就行。"),
    line("ZH", "好，我把餐具也拿过去。"), line("ZZX", "谢谢，盘子放左边吧。"),
    line("ZH", "好，我把这边留空。"), line("ZZX", "这样刚好。"),
  ],
};

export const dinnerLines: ScriptLine[] = [
  line("ZJ", "第一次做饭还挺成功。"), line("ZZY", "你先尝完再说。"),
  line("ZH", "别立flag。"), line("SXH", "应该能吃。"),
  line("ZZX", "你们说得我都不敢吃了。"),
  line("STAGE", "所有人笑起来。朱志鑫没有主动夹番茄，苏新皓注意到了。"),
];

export const nightScenes: SceneScript[] = [
  { id: "D01-009A", title: "夜谈 · 客厅", time: "20:00", place: "客厅", background: "livingRoom", lines: [
    line("ZJ", "你觉得住十四天怎么样？"), line("ZZY", "应该挺快的吧。"),
    line("ZJ", "我觉得会很长。"), line("ZZY", "才第一天你就开始想了？"),
    line("ZJ", "提前做心理准备。"),
  ] },
  { id: "D01-009B", title: "夜谈 · 厨房", time: "20:00", place: "厨房", background: "kitchen", lines: [
    line("STAGE", "苏新皓整理餐具。朱志鑫走进来倒水。"),
    line("SXH", "杯子在左边。"), line("ZZX", "我知道。"), line("SXH", "嗯。"),
    line("ZZX", "你也早点休息。"), line("SXH", "好。"),
  ] },
  { id: "D01-009C", title: "夜谈 · 阳台", time: "20:00", place: "阳台", background: "balcony", lines: [
    line("STAGE", "左航独自坐着。张泽禹推门出来。"),
    line("ZZY", "你怎么一个人在这儿？"), line("ZH", "透透气。"),
    line("ZZY", "里面挺热闹的。"), line("ZH", "你怎么出来了？"),
    line("ZZY", "也透透气。"), line("STAGE", "左航笑了。"),
  ] },
];

export const interviewQuestions = [
  { id: "Q1", label: "今天谁给你的印象最深？" },
  { id: "Q2", label: "你觉得自己能在这里遇到爱情吗？" },
  { id: "Q3", label: "今天有没有尴尬时刻？" },
] as const;

export const interviewAnswers: Record<GuestId, Record<(typeof interviewQuestions)[number]["id"], string>> = {
  ZZX: { Q1: "大家都挺好的，没有特别想排顺序。", Q2: "我不知道，可能还得看后面。", Q3: "刚开始只有两个人的时候，有一点。" },
  SXH: { Q1: "每个人都挺有意思的。", Q2: "来这里肯定还是希望有所收获。", Q3: "有，但是也还好。" },
  ZJ: { Q1: "左航挺有意思的。", Q2: "看缘分吧。", Q3: "没有吧，我好像还挺自在的。" },
  ZZY: { Q1: "大家都挺容易相处的。", Q2: "我觉得不一定非得有什么结果。", Q3: "刚进门的时候有一点。" },
  ZH: { Q1: "目前还没有特别确定。", Q2: "不知道，先相处看看。", Q3: "最后一个到的时候，稍微有点。" },
};

export const assets = {
  livingRoom: `${import.meta.env.BASE_URL}assets/backgrounds/living-room-day1.jpg`,
  kitchen: `${import.meta.env.BASE_URL}assets/backgrounds/kitchen-day1.jpg`,
  diningRoom: `${import.meta.env.BASE_URL}assets/backgrounds/dining-room-day1.jpg`,
  balcony: `${import.meta.env.BASE_URL}assets/backgrounds/balcony-day1.jpg`,
  interviewRoom: `${import.meta.env.BASE_URL}assets/backgrounds/interview-room-day1.jpg`,
  directorRoom: `${import.meta.env.BASE_URL}assets/ui/director-room-bg.jpg`,
} as const;

export function validDayOneClipSet(ids: string[]) {
  const arrivals = new Set(["CLIP-001", "CLIP-002", "CLIP-003", "CLIP-004"]);
  const evening = new Set(["CLIP-DINNER", "CLIP-NIGHT-LIVING", "CLIP-NIGHT-BALCONY", "CLIP-INTERVIEW", "CLIP-KC-NIGHT"]);
  return ids.length === 3 && new Set(ids).size === 3 && ids.includes("CLIP_D01_TOMATO") && ids.some((id) => arrivals.has(id)) && ids.some((id) => evening.has(id));
}
