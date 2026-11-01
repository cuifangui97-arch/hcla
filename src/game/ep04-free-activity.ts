import type { GuestId, ScriptLine } from "./day1-data";

export type Ep04FreeSceneId = "D04-FREE-LIVING" | "D04-FREE-KITCHEN" | "D04-FREE-BALCONY";
export type Ep04FreeScene = {
  id: Ep04FreeSceneId;
  camera: string;
  title: string;
  location: string;
  time: string;
  participants: GuestId[];
  background: "livingRoom" | "kitchen" | "balcony";
  clips: { id: string; title: string; theme: string; startLine: number; endLine: number }[];
  lines: ScriptLine[];
};
export type Ep04FreeSceneProgress = { line: number; watched: boolean; complete: boolean; auto: boolean };
export type Ep04FreeActivityProgress = Partial<Record<Ep04FreeSceneId, Ep04FreeSceneProgress>>;

const s = (text: string): ScriptLine => ({ speaker: "STAGE", text });
const d = (speaker: GuestId, text: string): ScriptLine => ({ speaker, text });

export function ep04FreeActivityScenes(mode: string): Ep04FreeScene[] {
  const living: ScriptLine[] = [
    s("【读完信之后，大家似乎都安静了一些。】"),
    s("【张极拿起遥控器，发现电视没有打开。】"),
    d("ZJ", "这个电视怎么开？"), d("ZZY", "遥控器不就在你手上？"),
    d("ZJ", "我按了，没反应。"), d("ZZY", "你是不是按错了？"), d("ZJ", "怎么可能。"),
    d("ZZY", "那你再按一下。"), s("【张极按下按钮。电视依旧没有反应。】"), d("ZJ", "你看。"),
    d("ZZY", "等会儿，我看看。"), s("【张泽禹拿过遥控器。】"), d("ZZY", "……你按的是空调。"),
    d("ZJ", "啊？"), d("ZZY", "你自己看看。"), d("ZJ", "长得太像了。"),
    d("ZZY", "这两个哪里像？"), d("ZJ", "都是白的。"), d("ZZY", "你这解释我没法接。"),
    s("【两人笑了一会儿。】"), d("ZJ", "说真的，刚刚那个读信环节，你有什么感觉？"),
    d("ZZY", "挺奇怪的。"), d("ZJ", "哪里奇怪？"),
    d("ZZY", "平时听别人介绍自己，和听一个认识你很久的人介绍你，不太一样。"),
    d("ZJ", "确实。"), d("ZZY", "你呢？"), d("ZJ", "我感觉有些话挺熟悉的。"),
    ...(mode === "A" ? [s("【两人短暂对视，又各自移开目光。】")] : []),
    d("ZZY", "比如？"), d("ZJ", "你们现在怎么都想套我的话？"), d("ZZY", "我就正常问一句。"),
    d("ZJ", "那我也正常保密一下。"), d("ZZY", "行。"), s("【张泽禹把遥控器放回桌上。】"),
    d("ZJ", "不是，你电视还没打开呢。"), d("ZZY", "你自己开。"), d("ZJ", "你帮人帮到底啊。"),
    d("ZZY", "刚刚是谁说自己会？"), d("ZJ", "……我现在不会了。"),
  ];
  const kitchen: ScriptLine[] = [
    s("【苏新皓在厨房整理杯子。】"), s("【朱志鑫走进来，打开冰箱看了一眼。】"),
    d("SXH", "找什么？"), d("ZZX", "水。"), d("SXH", "那边有常温的。"), d("ZZX", "我看见了。"), d("SXH", "嗯。"),
    s("【朱志鑫拿起杯子，倒了半杯。】"), d("ZZX", "刚刚那个信……"), d("SXH", "怎么了？"),
    d("ZZX", "没什么。"), d("SXH", "你是不是想说什么？"), d("ZZX", "我还没想好。"),
    d("SXH", "那就等你想好。"), s("【朱志鑫抬头看了他一眼。】"), d("ZZX", "你今天怎么不问了？"),
    d("SXH", "你不是说没想好？"), d("ZZX", "哦。"), d("SXH", "你又‘哦’。"), s("【朱志鑫笑了一下。】"),
    d("ZZX", "我还能说什么？"), d("SXH", "什么都可以。"), d("ZZX", "那我说你把杯子放错地方了。"),
    d("SXH", "哪儿错了？"), d("ZZX", "昨天不是放上面？"), d("SXH", "今天重新整理了。"),
    d("ZZX", "……行。"), d("SXH", "你有意见？"), d("ZZX", "没有。"),
    d("SXH", "你刚刚那个表情不像没有。"), d("ZZX", "我真没有。"), s("【苏新皓把另一个杯子递给他。】"),
    d("SXH", "你要不要再喝点？"), d("ZZX", "不用。"), s("【他却没有立即离开。】"),
    d("SXH", "还有事？"), d("ZZX", "没了。"), d("SXH", "那你怎么还在这儿？"),
    d("ZZX", "我站会儿不行？"), d("SXH", "行。"), s("【两人各自低头，却都没忍住笑了一下。】"),
  ];
  const balcony: ScriptLine[] = [
    s("【张极从客厅出来，发现左航正在阳台上。】"), d("ZJ", "航酱。"), d("ZH", "干嘛？"),
    d("ZJ", "你怎么一个人在这儿？"), d("ZH", "坐会儿。"),
    d("ZJ", "里面都快开始讨论谁写信文笔最好了。"), d("ZH", "谁开始讨论的？"), d("ZJ", "我。"),
    d("ZH", "那不奇怪。"), d("ZJ", "你能不能给点面子？"), d("ZH", "你要什么面子？"),
    d("ZJ", "至少假装好奇一下。"), d("ZH", "行，你觉得谁写得最好？"), d("ZJ", "我还真不知道。"),
    d("ZH", "那你讨论什么？"), d("ZJ", "讨论一下不行啊。"), s("【左航笑了。】"),
    s("【张极在旁边坐下。】"), d("ZJ", "你看完信以后有什么感觉？"), d("ZH", "有点意外。"),
    d("ZJ", "为什么？"), d("ZH", "没想到别人会那样介绍一个人。"), d("ZJ", "哪样？"),
    d("ZH", "就……平时可能不会说出来的那种。"),
    ...(mode === "B" ? [s("【两人短暂避开目光，阳台上安静了一瞬。】")] : []),
    d("ZJ", "嗯。"), d("ZH", "你呢？"), d("ZJ", "我也有。"), d("ZH", "那你刚刚还闹。"),
    d("ZJ", "总不能大家都不说话吧。"), d("ZH", "也是。"), s("【两人安静地坐了一会儿。】"),
    d("ZJ", "我发现你坐这儿挺舒服的。"), d("ZH", "这位置我先发现的。"),
    d("ZJ", "你这也要抢功劳？"), d("ZH", "那你起来。"), d("ZJ", "不起来。"),
  ];
  return [
    { id: "D04-FREE-LIVING", camera: "CAM 01", title: "客厅 · 遥控器风波", location: "客厅", time: "15:30—15:45", participants: ["ZJ", "ZZY"], background: "livingRoom", clips: [{ id: "D04_CLIP_LIVING_REMOTE", title: "遥控器风波", theme: "生活搞笑与极禹互动", startLine:0,endLine:20 }, { id: "D04_CLIP_LIVING_LETTER", title: "读信后的熟悉感", theme: "读信后感想与克制情绪", startLine:20,endLine:living.length }], lines: living },
    { id: "D04-FREE-KITCHEN", camera: "CAM 02", title: "厨房 · 杯子的位置", location: "厨房", time: "15:45—16:00", participants: ["ZZX", "SXH"], background: "kitchen", clips: [{ id: "D04_CLIP_KC_LETTER_PAUSE", title: "信后的停顿", theme: "朱志鑫尝试开口、苏新皓停止追问", startLine:0,endLine:19 }, { id: "D04_CLIP_KC_CUP", title: "杯子的位置", theme: "熟悉的生活习惯", startLine:19,endLine:kitchen.length }], lines: kitchen },
    { id: "D04-FREE-BALCONY", camera: "CAM 03", title: "阳台 · 坐一会儿", location: "阳台", time: "16:00—16:15", participants: ["ZJ", "ZH"], background: "balcony", clips: [{ id: "D04_CLIP_JH_BALCONY", title: "阳台并坐", theme: "张极与左航的轻松相处", startLine:0,endLine:18 }, { id: "D04_CLIP_JH_LETTER_REACTION", title: "读信后的意外", theme: "谈论被他人介绍的感觉", startLine:18,endLine:balcony.length }], lines: balcony },
  ];
}

export function freshEp04FreeActivityProgress(): Record<Ep04FreeSceneId, Ep04FreeSceneProgress> {
  return Object.fromEntries(["D04-FREE-LIVING", "D04-FREE-KITCHEN", "D04-FREE-BALCONY"].map(id => [id, { line: 0, watched: false, complete: false, auto: false }])) as Record<Ep04FreeSceneId, Ep04FreeSceneProgress>;
}

export const ep04FreeActivityClipIds = ep04FreeActivityScenes("C").flatMap(scene => scene.clips.map(clip => clip.id));
