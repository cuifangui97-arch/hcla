import seed from "./social-corpus.v1.json";
import extension from "./social-corpus.v1.1.json";

export type SocialPlatform = "weibo" | "douban" | "threads";
export type CorpusItem = {
  id: string;
  platform: SocialPlatform;
  episode: string;
  eventId: string;
  kind: "post" | "reply";
  authorRole: string;
  cpIds: string[];
  tags: string[];
  text: string;
  requiresAiredEventIds: string[];
  minEpisodeReleased: number;
  xKnowledge: "public_only" | "x_revealed";
  relationshipModes: string[];
  stance: string;
  replyTo: string | null;
};

export type SocialPersona = {
  id: string;
  handle: string;
  displayName: string;
  platform: SocialPlatform;
  fanIdentity: string;
  voice: string;
  stance: string;
  history: string;
};

export type CorpusEvent = { id: string; episode: string; title: string; cpIds: string[]; tags: string[] };
export type SocialBatch = { items: CorpusItem[]; posts: CorpusItem[]; repliesByPost: Record<string, CorpusItem[]> };

const source = seed as { version: string; events: CorpusEvent[]; items: CorpusItem[] };
const extensionSource = extension as { version: string; items: CorpusItem[] };
export const socialEvents = source.events;
export const socialSeedItems = source.items;
export const socialCorpusItems = [...source.items, ...extensionSource.items];

const personaProfiles: Record<string, Omit<SocialPersona, "id" | "handle" | "displayName" | "platform">> = {
  gc_fan: { fanIdentity: "棍铲CP粉", voice: "记熟悉的小动作，也会提醒自己别替当事人发言", stance: "偏爱棍铲的公开互动，尊重节目尚未揭晓的部分", history: "从EP01开始按已播镜头记录棍铲的相处细节；EP13后才引用正式揭晓。" },
  jy_fan: { fanIdentity: "极禹CP粉", voice: "爱做时间线，兴奋时会连发但会标清猜测", stance: "偏爱极禹同框，不把共同经历自动等同正式X", history: "持续关注节目里极禹的互动；身份判断始终等本局EP13公开。" },
  jh_fan: { fanIdentity: "极航CP粉", voice: "偏练习室和共同成长的细节，表达克制", stance: "偏爱极航镜头，区分节目关系与观众嗑点", history: "按公开镜头整理极航共同成长内容，未公开X时只作推测。" },
  mh_fan: { fanIdentity: "芒猴CP粉", voice: "爱翻活动照和彼此接话的节奏", stance: "对芒猴互动有好感，不以照片证明恋爱史", history: "持续收藏节目中的芒猴镜头；考古只引用清晰、可核实的公开内容。" },
  solo: { fanIdentity: "个人唯粉", voice: "先看单人状态和表达，不急着接受CP剪辑", stance: "支持自己关注的嘉宾，也会反对过度关系解读", history: "持续关注个人表现，对不同剪辑保持自己的判断。" },
  group: { fanIdentity: "团体粉", voice: "喜欢五人一起做事的场面，常聊分工和默契", stance: "更在意群像互动，不押单一关系", history: "从入住开始记录五人共同生活和合作的变化。" },
  viewer: { fanIdentity: "普通恋综观众", voice: "边看边说，允许自己改观但会说明新依据", stance: "以正片为证，保留多种解释", history: "按期追节目，只有出现新播出事实时才更新看法。" },
  microscope: { fanIdentity: "显微镜推理党", voice: "标时间码、镜头顺序和能确认的细节", stance: "把推断与事实分栏，拒绝凭糊字和剪辑补证", history: "长期做播出镜头笔记；EP13前所有X结论都标作猜测。" },
  cut_critic: { fanIdentity: "剪辑质疑观众", voice: "会问前后镜头在哪里，关注反应镜头和叙事顺序", stance: "质疑剪辑但不猜测幕后隐私", history: "每期比较正片呈现与素材范围，只基于播出内容评论。" },
  promo: { fanIdentity: "营销号", voice: "标题夸张、正文回到镜头证据并标注猜测", stance: "追节目话题热度，不把未公开身份包装成事实", history: "跟进播出节点和话题榜，公开结论以节目正式内容为准。" },
  shipper: { fanIdentity: "嗑有趣组合的路人", voice: "看到好玩的互动就接梗，不坚持固定CP", stance: "轻松嗑镜头，不把拉郎写成正式关系", history: "组合偏好随实际播出片段变化；始终区分拉郎与正式X。" },
  archivist: { fanIdentity: "理性考据用户", voice: "先列来源、时间和不确定项，再给有限结论", stance: "只接受清晰的节目证据，明确标出推理边界", history: "维护跨期证据表；新一期只补充可核对的已播信息。" },
};

const rolePersona: Record<string, string> = {
  cp_fan: "shipper", solo_fan: "solo", analysis_fan: "microscope", casual: "viewer",
  skeptic: "archivist", meme_fan: "shipper", editorial_critic: "cut_critic",
};
const platformNames: Record<SocialPlatform, string> = { weibo: "微博", douban: "豆瓣", threads: "Threads" };
const personaHandles: Record<string, Record<SocialPlatform, [string, string]>> = {
  gc_fan: { weibo: ["ganchan_note", "棍铲日常簿"], douban: ["ganchan_archive", "棍铲镜头档案"], threads: ["gc_framebyframe", "gc frame note"] },
  jy_fan: { weibo: ["jiyu_timeline", "极禹时间线"], douban: ["jiyu_evidence", "极禹证据整理"], threads: ["jy_rewatch", "jy on replay"] },
  jh_fan: { weibo: ["jihang_rehearsal", "极航练习室"], douban: ["jihang_records", "极航共同成长记录"], threads: ["jh_practice_log", "practice log"] },
  mh_fan: { weibo: ["manghou_album", "芒猴相册管理员"], douban: ["manghou_publicnotes", "芒猴公开物料整理"], threads: ["mh_smallmoments", "small moments"] },
  solo: { weibo: ["solo_cam_07", "只看单人镜头"], douban: ["solo_viewer_note", "单人观感记录"], threads: ["solo_cam_07", "solo cam"] },
  group: { weibo: ["five_at_home", "小屋群像观察"], douban: ["five_person_timeline", "五人生活时间线"], threads: ["five_in_one_room", "five in one room"] },
  viewer: { weibo: ["afterwork_viewer", "下班追更中"], douban: ["ordinary_viewer_log", "普通观众看片笔记"], threads: ["afterwork_watch", "after work watch"] },
  microscope: { weibo: ["timecode_reader", "时间码记录员"], douban: ["frame_by_frame_db", "逐帧观察小组"], threads: ["framecheck_01", "frame check"] },
  cut_critic: { weibo: ["context_first", "先给前后镜头"], douban: ["edit_context_check", "剪辑上下文核对"], threads: ["contextpls_08", "context please"] },
  promo: { weibo: ["topic_relay", "综艺话题速报"], douban: ["show_topic_index", "节目话题索引"], threads: ["topicrelay_5", "topic relay"] },
  shipper: { weibo: ["pairing_on_air", "同框就记一笔"], douban: ["pairing_context_db", "同框语境讨论"], threads: ["shipthemoment", "ship the moment"] },
  archivist: { weibo: ["public_record_only", "只存公开记录"], douban: ["source_check_archive", "来源核对档案"], threads: ["sourcecheck_02", "source check"] },
};

function inferPersonaId(item: CorpusItem): string {
  if (item.authorRole === "promo") return "promo";
  if (item.authorRole === "group_fan") return "group";
  if (item.authorRole === "cp_fan") {
    if (item.cpIds.includes("gc")) return "gc_fan";
    if (item.cpIds.includes("jy")) return "jy_fan";
    if (item.cpIds.includes("jh")) return "jh_fan";
    if (item.cpIds.includes("mh")) return "mh_fan";
  }
  if (item.tags.some((tag) => ["cut", "edit", "editing", "controversy"].includes(tag)) || item.authorRole === "editorial_critic") return "cut_critic";
  if (item.tags.some((tag) => ["group", "arrival", "ensemble", "team"].includes(tag))) return "group";
  if (item.authorRole === "analysis_fan" && (item.tags.includes("timeline") || item.tags.includes("evidence"))) return "archivist";
  return rolePersona[item.authorRole] ?? "viewer";
}

export function personaFor(item: CorpusItem): SocialPersona {
  const personaId = inferPersonaId(item);
  const profile = personaProfiles[personaId] ?? personaProfiles.viewer;
  const platform = item.platform;
  const [handle, displayName] = personaHandles[personaId]?.[platform] ?? personaHandles.viewer[platform];
  const safeHandle = platform === "threads" ? handle.replace(/[^A-Za-z0-9_]/g, "_") : handle;
  return { id: personaId, handle: safeHandle, displayName, platform, ...profile };
}

export function buildSocialBatch(input: {
  platform: SocialPlatform;
  episode: number;
  mode: string;
  airedEventIds: Iterable<string>;
  airedCut?: string;
}): SocialBatch {
  const aired = new Set(input.airedEventIds);
  const retiredEp08Events = new Set(["ep08_rose", "ep08_letter"]);
  const modes = new Set([input.mode]);
  const visible = socialCorpusItems.filter((item) =>
    item.platform === input.platform &&
    // V16.5 retires the old room rose and private-letter teaser from every new public batch.
    !retiredEp08Events.has(item.eventId) &&
    Number(item.episode.replace("EP", "")) <= input.episode &&
    item.relationshipModes.some((mode) => modes.has(mode)) &&
    item.requiresAiredEventIds.length > 0 &&
    item.requiresAiredEventIds.every((eventId) => aired.has(eventId)) &&
    // EP04's previous seed corpus paraphrased placeholder letters. The episode UI now
    // authors discussion from the exact locked letter only when that recipient's text aired.
    !(item.eventId === "ep04_letters") &&
    item.minEpisodeReleased <= input.episode &&
    (item.xKnowledge !== "x_revealed" || (input.episode >= 13 && aired.has("ep13_reveal")))
  );
  const posts = visible.filter((item) => item.kind === "post");
  const postIds = new Set(posts.map((post) => post.id));
  const repliesByPost: Record<string, CorpusItem[]> = {};
  for (const reply of visible) {
    if (reply.kind !== "reply" || !reply.replyTo || !postIds.has(reply.replyTo)) continue;
    (repliesByPost[reply.replyTo] ??= []).push(reply);
  }
  return { items: visible, posts, repliesByPost };
}

export function eventsForDayOneClips(clipIds: string[]): string[] {
  const events = new Set<string>();
  const arrivals = new Set(["CLIP-001", "CLIP-002", "CLIP-003", "CLIP-004"]);
  if (clipIds.some((id) => arrivals.has(id))) events.add("ep01_arrival");
  if (clipIds.includes("CLIP_D01_TOMATO")) events.add("ep01_kitchen");
  if (clipIds.includes("CLIP-KC-NIGHT")) events.add("ep01_kc_night");
  return [...events];
}

export function eventsForAiredClips(episode: number, clipIds: string[]): string[] {
  const ids = new Set(clipIds);
  const out = new Set<string>();
  const hasScene = (scene: string) => [...ids].some((id) => id.includes(scene));
  if (episode === 1) return eventsForDayOneClips(clipIds);
  // EP02's repeated post-SMS night scene was retired; ignore legacy aired IDs.
  if (episode !== 2 && ids.has(`D${String(episode).padStart(2, "0")}-KC-NIGHT`)) out.add(`ep${String(episode).padStart(2, "0")}_kc_night`);
  if (episode === 2) {
    if (ids.has("D02-001") || ids.has("D02-002") || ids.has("D02-005-厨房")) out.add("ep02_breakfast");
    if (["D02-004", "D02-004B"].some((id) => ids.has(id))) out.add("ep02_shopping");
    if (ids.has("D02-007")) out.add("ep02_chat");
  } else if (episode === 3) {
    if (["D03-003", "D03-004"].some((id) => ids.has(id))) out.add("ep03_date");
  } else if (episode === 4 && [...ids].some((id) => /^EP04-LETTER-(BODY|REACTION)-/.test(id))) out.add("ep04_letters");
  else if (episode === 5 && hasScene("D05-S")) out.add("ep05_eye");
  else if (episode === 6 && hasScene("D06-S")) out.add("ep06_second_date");
  else if (episode === 7 && hasScene("D07-S")) out.add("ep07_music");
  else if (episode === 8) {
    // V16.2 rose, corridor and EP08 private-letter seeds stay dormant forever.
    if ([...ids].some((id) => /ZZ_BLINDBOX/i.test(id))) out.add("ep08_blindbox");
    if ([...ids].some((id) => /ZZ_WATER_VOUCHER/i.test(id))) out.add("ep08_water_voucher");
    if ([...ids].some((id) => /SX_FRIED_EGG/i.test(id))) out.add("ep08_fried_egg");
    if ([...ids].some((id) => /SX_POLAROID/i.test(id))) out.add("ep08_polaroid");
    if ([...ids].some((id) => /ZZ_SPORTS_2024/i.test(id))) out.add("ep08_sports_2024");
    if ([...ids].some((id) => /boarding|jy-01|登机/i.test(id))) out.add("ep08_boarding");
    if ([...ids].some((id) => /jh-02|record-sheet|记录表/i.test(id))) out.add("ep08_jh_sheet");
    if ([...ids].some((id) => /mh-01|sports-photo|射箭|球拍/i.test(id))) out.add("ep08_mh_photo");
  } else if (episode === 9 && hasScene("D09-S")) out.add("ep09_mutual");
  else if (episode === 10) {
    if (hasScene("D10-S01") || hasScene("D10-S02")) out.add("ep10_sunrise");
    if (hasScene("D10-S03")) out.add("ep10_kc_talk");
  } else if (episode === 11 && hasScene("D11-S")) out.add("ep11_gift");
  else if (episode === 12 && hasScene("D12-S")) out.add("ep12_lastdate");
  else if (episode === 13) {
    if (hasScene("D13-S01")) out.add("ep13_reveal");
    if (hasScene("D13-S02")) out.add("ep13_fullletter");
  } else if (episode === 14 && hasScene("D14-S")) out.add("ep14_final");
  return [...out];
}

export function corpusCountByPlatform(items: CorpusItem[] = socialCorpusItems) {
  return Object.fromEntries((Object.keys(platformNames) as SocialPlatform[]).map((platform) => [
    platform,
    items.filter((item) => item.platform === platform).length,
  ])) as Record<SocialPlatform, number>;
}

export function corpusItemTitle(item: CorpusItem): string {
  const event = socialEvents.find((row) => row.id === item.eventId);
  return event ? `${event.episode} · ${event.title}` : item.episode;
}

export function corpusPersonaLabel(item: CorpusItem): string {
  const persona = personaFor(item);
  return item.platform === "threads" ? `@${persona.handle}` : persona.displayName;
}

export function corpusReplies(batch: SocialBatch, postId: string): string[] {
  const replies = batch.repliesByPost[postId] ?? [];
  const ids = new Set<string>();
  const sorted = [...replies].sort((a, b) => a.id.localeCompare(b.id));
  return sorted.map((reply) => {
    const persona = personaFor(reply);
    const label = reply.platform === "threads" ? `@${persona.handle}` : persona.displayName;
    const parent = reply.replyTo && ids.has(reply.replyTo) ? "↳ " : "";
    ids.add(reply.id);
    return `${parent}${label}：${reply.text}`;
  });
}

export function validateSocialCorpus(items: CorpusItem[] = socialCorpusItems, events: CorpusEvent[] = socialEvents): string[] {
  const errors: string[] = [];
  const eventIds = new Set(events.map((event) => event.id));
  const ids = new Set<string>();
  for (const item of items) {
    if (ids.has(item.id)) errors.push(`重复内容ID：${item.id}`);
    ids.add(item.id);
    if (!eventIds.has(item.eventId)) errors.push(`${item.id} 引用了不存在的事件 ${item.eventId}`);
    if (item.requiresAiredEventIds.some((id) => !eventIds.has(id))) errors.push(`${item.id} 要求不存在的播出事件`);
    if (!item.text.trim()) errors.push(`${item.id} 内容为空`);
    if (item.kind === "reply" && !item.replyTo) errors.push(`${item.id} 回复缺少上级帖子`);
    if (item.kind === "post" && item.replyTo) errors.push(`${item.id} 主帖不能引用 replyTo`);
    if (item.xKnowledge === "x_revealed" && Number(item.episode.slice(2)) < 13) errors.push(`${item.id} 提前传播了X揭晓信息`);
  }
  for (const item of items) if (item.replyTo && !ids.has(item.replyTo)) errors.push(`${item.id} 回复了不存在的内容 ${item.replyTo}`);
  return errors;
}

export const socialPlatformName = (platform: SocialPlatform) => platformNames[platform];
