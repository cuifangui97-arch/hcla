import type { GuestId } from "./day1-data";

export type WeiboCut = "friendship" | "romance" | "conflict" | "ensemble";
export type BroadcastClip = {
  clipId: string;
  title: string;
  summary: string;
  cast: GuestId[];
  speakers: GuestId[];
  cpIds: string[];
  eventType: "arrival" | "kitchen" | "dinner" | "night" | "interview" | "task" | "other";
  controversyTags: string[];
  warmthTags: string[];
  comedyTags: string[];
  broadcastStatus: "aired" | "unreleased";
  editFocus: WeiboCut;
  tags: string[];
  weight?: number;
};
export type WeiboReply = { author: string; stance: string; body: string };
export type WeiboPost = { id: string; author: string; body: string; clipId: string; replies: WeiboReply[] };
export type WeiboTopic = {
  id: string; title: string; kind: "episode" | "guest" | "cp" | "theory" | "edit" | "fun" | "life";
  score: number; rank: number; movement: number | null; clipIds: string[]; posts: WeiboPost[]; cpId?: string;
};
export type CpEntry = { id: string; name: string; formal: boolean; score: number; rank: number; movement: number | null; clipIds: string[] };
export type WeiboDynamics = { topics: WeiboTopic[]; cpBoard: CpEntry[]; superTopics: { id: string; name: string; intro: string; followers: number; activity: number; clipIds: string[] }[] };

const castNames: Record<GuestId, string> = { ZZX: "朱志鑫", SXH: "苏新皓", ZJ: "张极", ZZY: "张泽禹", ZH: "左航" };
const pairs = [
  { id: "GC", name: "棍铲", a: "ZZX" as const, b: "SXH" as const, formal: true },
  { id: "JY", name: "极禹", a: "ZJ" as const, b: "ZZY" as const, formal: true },
  { id: "JH", name: "极航", a: "ZJ" as const, b: "ZH" as const, formal: true },
  { id: "MH", name: "芒猴", a: "ZZY" as const, b: "ZH" as const, formal: true },
  { id: "ZX", name: "朱志鑫 × 张极", a: "ZZX" as const, b: "ZJ" as const, formal: false },
  { id: "ZY", name: "朱志鑫 × 张泽禹", a: "ZZX" as const, b: "ZZY" as const, formal: false },
  { id: "ZH", name: "朱志鑫 × 左航", a: "ZZX" as const, b: "ZH" as const, formal: false },
  { id: "SZ", name: "苏新皓 × 张极", a: "SXH" as const, b: "ZJ" as const, formal: false },
  { id: "SY", name: "苏新皓 × 张泽禹", a: "SXH" as const, b: "ZZY" as const, formal: false },
  { id: "SH", name: "苏新皓 × 左航", a: "SXH" as const, b: "ZH" as const, formal: false },
];
const authors = ["只看已播镜头", "剪辑边角料", "今天也不押结论", "路过的场记", "逐帧慢放中"];
const replyAuthors = ["framecheck_01", "softfocus_27", "scene_note_8", "aftercut_14", "watchagain_03"];
const replyStances = ["共鸣", "谨慎", "质疑", "路人", "剪辑观察"];
export function associatedAudienceShips(cast: GuestId[]): string[] {
  return pairs.filter((pair) => cast.includes(pair.a) && cast.includes(pair.b)).map((pair) => pair.id);
}

function hash(text: string): number {
  let value = 2166136261;
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}

function buildReplies(clip: BroadcastClip, seed: number): WeiboReply[] {
  const title = `《${clip.title}》`;
  const fact = clip.summary.replace(/[。！？；]+$/u, "");
  const templates = [
    `看完${title}我会记住这个细节，先当作观众感受收藏，不替当事人下结论。`,
    `这条只确认${title}已经播出的内容；关系判断还要等更多公开镜头。`,
    `同一段${title}也可以有普通相处的解释，别把剪辑顺序当成事实证据。`,
    `路过记下${title}：${fact}。这段生活感挺自然，暂时不押任何一组。`,
    `希望下次把${title}前后镜头也放出来，单独截一帧很容易过度解读。`,
  ];
  return templates.map((body, i) => ({ author: replyAuthors[(i + seed) % replyAuthors.length], stance: replyStances[i], body }));
}

function makePosts(topic: Pick<WeiboTopic, "id" | "title" | "kind" | "cpId">, clips: BroadcastClip[]): WeiboPost[] {
  if (!clips.length) return [];
  return Array.from({ length: 3 }, (_, i) => {
    const clip = clips[i % clips.length];
    const fact = clip.summary.replace(/[。！？；]+$/u, "");
    const seed = hash(`${topic.id}:${clip.clipId}:${i}`);
    const scope = topic.kind === "cp" ? `关于「${topic.title}」的观众讨论` : topic.kind === "theory" ? "关于X的推理区" : topic.kind === "edit" ? "关于剪辑取舍的讨论" : `围绕「${topic.title}」`;
    const bodies = topic.kind === "theory" ? [
      `X推理区只讨论已播的《${clip.title}》：${fact}。节目尚未公开X身份，这只是猜测，不是关系事实。`,
      `《${clip.title}》能记录的是镜头里发生的事。没有公开X资料前，任何人名配对都不能当作确认。`,
      `关于X先保留问号。即使《${clip.title}》让人想到某种可能，也不能把剪辑推断成身份公布。`,
    ] : [
      `${scope}，我只按本期已播的《${clip.title}》讨论：${fact}。这让我有一点观感，但不是关系事实。`,
      `把《${clip.title}》放回时间线上看：${fact}。镜头能说明发生了什么，不能替他们说明心里怎么想。`,
      `《${clip.title}》播出后大家开始聊${topic.kind === "cp" ? "这组CP" : "这一段"}。可以有不同解读，未播内容先不补写。`,
    ];
    return { id: `wb-${topic.id}-${i + 1}`, author: authors[(i + seed) % authors.length], body: bodies[i], clipId: clip.clipId, replies: buildReplies(clip, i + seed) };
  });
}

export function buildWeiboDynamics(input: {
  clips: BroadcastClip[];
  cut: WeiboCut;
  previousTopicRanks?: Record<string, number>;
  previousCpRanks?: Record<string, number>;
  support?: Record<string, number>;
}): WeiboDynamics {
  const { cut } = input;
  const clips = input.clips.filter((clip) => clip.broadcastStatus === "aired");
  if (!clips.length) return { topics: [], cpBoard: [], superTopics: [] };
  const allIds = clips.map((clip) => clip.clipId);
  const frequency = new Map<GuestId, number>();
  for (const clip of clips) for (const id of new Set(clip.cast)) frequency.set(id, (frequency.get(id) ?? 0) + (clip.weight ?? 1));

  const candidates: Omit<WeiboTopic, "rank" | "movement" | "posts">[] = [];
  const pushTopic = (value: Omit<WeiboTopic, "rank" | "movement" | "posts">) => candidates.push(value);
  pushTopic({ id: "episode-d1", title: "#TOP换乘恋爱EP01#", kind: "episode", score: 1200 + clips.reduce((n, x) => n + (x.weight ?? 1) * 32, 0), clipIds: allIds });
  for (const [id, count] of frequency) {
    const related = clips.filter((clip) => clip.cast.includes(id));
    pushTopic({ id: `guest-${id}`, title: `#${castNames[id]}入住观察#`, kind: "guest", score: 700 + count * 115 + (input.support?.[`guest-${id}`] ?? 0) * 23, clipIds: related.map((x) => x.clipId) });
  }

  const cpScores = pairs.map((pair) => {
    const related = clips.filter((clip) => clip.cpIds.includes(pair.id));
    const direct = related.reduce((total, clip) => total + (clip.speakers.includes(pair.a) && clip.speakers.includes(pair.b) ? 1 : 0), 0);
    const kitchenScene = related.some((clip) => clip.eventType === "kitchen");
    const styleWeight = cut === "romance" ? direct * 1.7 : cut === "conflict" ? direct * 1.05 + related.reduce((n, x) => n + x.controversyTags.length * 0.8, 0) : cut === "ensemble" ? direct * 0.65 + related.length * 0.75 : direct + related.length * 0.45;
    const GCkitchen = pair.id === "GC" && kitchenScene ? (cut === "romance" ? 1.1 : cut === "ensemble" ? 0.4 : cut === "friendship" ? 2.2 : 0.25) : 0;
    const base = pair.formal ? 4 : 0;
    const support = input.support?.[`cp-${pair.id}`] ?? 0;
    const score = Math.round((base + related.reduce((n, x) => n + (x.weight ?? 1), 0) + styleWeight + GCkitchen) * 90 + support * 22);
    return { ...pair, related, direct, score };
  }).filter((x) => x.related.length > 0);

  for (const cp of cpScores) {
    pushTopic({ id: `cp-${cp.id}`, title: `#${cp.name.replaceAll(" × ", "与")}镜头讨论#`, kind: "cp", cpId: cp.id, score: 670 + cp.score * 0.62, clipIds: cp.related.map((x) => x.clipId) });
  }
  pushTopic({ id: "x-theory-d1", title: "#同框镜头能证明X吗#", kind: "theory", score: 780 + clips.filter((x) => x.cast.length > 1).length * 64, clipIds: clips.filter((x) => x.cast.length > 1).map((x) => x.clipId) });
  pushTopic({ id: `edit-${cut}`, title: cut === "conflict" ? "#EP01剪辑留白引争议#" : cut === "romance" ? "#EP01暧昧细节被放大#" : cut === "ensemble" ? "#EP01五人群像剪辑#" : "#EP01生活镜头的节奏#", kind: "edit", score: 740 + clips.reduce((n, x) => n + x.controversyTags.length * 95, 0) + (cut === "conflict" ? 270 : cut === "romance" ? 210 : cut === "ensemble" ? 95 : 0), clipIds: allIds });
  const funClips = clips.filter((x) => x.comedyTags.length > 0);
  pushTopic({ id: "fun-d1", title: "#EP01轻松名场面#", kind: "fun", score: 620 + funClips.length * 145, clipIds: (funClips.length ? funClips : clips).map((x) => x.clipId) });
  const lifeClips = clips.filter((x) => x.warmthTags.length > 0 || x.eventType === "kitchen");
  pushTopic({ id: "life-d1", title: "#入住第一天的生活细节#", kind: "life", score: 680 + lifeClips.length * 105, clipIds: (lifeClips.length ? lifeClips : clips).map((x) => x.clipId) });

  const byId = new Map(clips.map((x) => [x.clipId, x]));
  const topics = candidates.map((item) => ({ ...item, posts: makePosts(item, item.clipIds.map((id) => byId.get(id)).filter((x): x is BroadcastClip => Boolean(x))) }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .map((item, index) => {
      const rank = index + 1;
      const before = input.previousTopicRanks?.[item.id];
      return { ...item, rank, movement: before === undefined ? null : before - rank };
    });

  const cpBoard: CpEntry[] = cpScores.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).map((cp, index) => {
    const rank = index + 1;
    const before = input.previousCpRanks?.[cp.id];
    return { id: cp.id, name: cp.name, formal: cp.formal, score: cp.score, rank, movement: before === undefined ? null : before - rank, clipIds: cp.related.map((x) => x.clipId) };
  });

  const superTopics = [
    { id: "GC", name: "棍铲超话", intro: "从实际播出的共同镜头慢慢记录，不替嘉宾确认关系。", followers: 12804 },
    { id: "JY", name: "极禹超话", intro: "整理张极与张泽禹的节目同框与公开互动。", followers: 9630 },
    { id: "JH", name: "极航超话", intro: "关注张极与左航在本期中的同场片段。", followers: 8246 },
    { id: "MH", name: "芒猴超话", intro: "从实际播出镜头讨论张泽禹与左航的相处。", followers: 7652 },
    { id: "program", name: "TOP换乘恋爱超话", intro: "本期流程、镜头顺序与节目剪辑讨论。", followers: 24681 },
  ].map((space) => {
    const associated = space.id === "program" ? clips : clips.filter((clip) => {
      const pair = pairs.find((x) => x.id === space.id);
      return pair ? clip.cast.includes(pair.a) && clip.cast.includes(pair.b) : false;
    });
    return { ...space, clipIds: associated.map((x) => x.clipId), activity: associated.length * 13 + (input.support?.[`cp-${space.id}`] ?? 0) * 2 };
  });
  return { topics, cpBoard, superTopics };
}

export function makeSuperTopicPosts(dynamics: WeiboDynamics, topicId: string, clips: BroadcastClip[]): WeiboPost[] {
  const cp = dynamics.cpBoard.find((entry) => entry.id === topicId);
  const topic = dynamics.superTopics.find((entry) => entry.id === topicId);
  const clipIds = topicId === "program" ? clips.map((x) => x.clipId) : (cp?.clipIds ?? []);
  const matched = clips.filter((clip) => clipIds.includes(clip.clipId));
  if (!matched.length) return [];
  const title = topic?.name ?? cp?.name ?? topicId;
  const posts = makePosts({ id: `super-${topicId}`, title, kind: "cp", cpId: topicId }, matched);
  return posts.map((post, index) => {
    const clip = matched.find((x) => x.clipId === post.clipId)!;
    const perspectives = topicId === "program" ? [
      "【时间线记录】我先把这段实际播出的内容记下来，不拿单个镜头判断谁和谁是什么关系。",
      "【剪辑讨论】希望下次播出能给这段前后留足上下文，观众才好核对发生顺序。",
      "【路人观感】本期这段生活镜头挺自然，先看节目接下来怎么讲。",
    ] : [
      `【超话观感】看完《${clip.title}》，我会把这个同框细节收进本组的播出记录；这只是嗑点，不是关系事实。`,
      `【唯粉视角】《${clip.title}》里的内容也可以是普通相处，我不想因为一个镜头替嘉宾确认关系。`,
      `【路人看剪辑】这段放进正片的顺序值得聊，但《${clip.title}》本身没有公布任何X身份。`,
    ];
    return { ...post, body: `${perspectives[index]}\n${clip.summary.replace(/[。！？；]+$/u, "")}。` };
  });
}

export function fingerprintBroadcast(clips: BroadcastClip[], cut: WeiboCut, support: Record<string, number>): string {
  return `${cut}|${clips.filter((x) => x.broadcastStatus === "aired").map((x) => `${x.clipId}:${x.cast.join("")}:${x.cpIds.join("")}:${x.editFocus}:${x.weight ?? 1}`).sort().join(";")}|${Object.keys(support).sort().map((k) => `${k}:${support[k]}`).join(";")}`;
}
