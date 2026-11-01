import type { GuestId, ScriptLine } from "./day1-data";

const l = (speaker: ScriptLine["speaker"], text: string, mood?: string): ScriptLine => ({ speaker, text, mood });
const S = (text: string) => l("STAGE", text);
const K = (a: GuestId, b: GuestId) => [a,b].sort().join("-");

export const episode2PairDialogues: Record<string, ScriptLine[]> = {
  "SXH-ZZX": [l("ZZX","是不是还要买鸡蛋？"),l("SXH","要。"),l("ZZX","那你拿吧。"),l("SXH","你不吃也不是别人不吃。"),l("ZZX","我也没说不给买。"),l("SXH","我知道。"),l("ZZX","你知道还说。"),S("两个人停了一下，苏新皓把清单折起一角。"),l("SXH","那你拿一下篮子。"),l("ZZX","嗯。")],
  "ZJ-ZZY": [l("ZJ","这个是不是以前买过？"),l("ZZY","你说哪个？"),l("ZJ","这个。"),l("ZZY","你确定要买？"),l("ZJ","你怎么每次都要问我确定不确定。"),l("ZZY","因为你上次买了又不吃。"),S("张极看了看包装，又把它放回货架。"),l("ZJ","……那换一个。")],
  "ZH-ZJ": [l("ZJ","航酱，你要不要吃这个？"),l("ZH","你自己想吃吧。"),l("ZJ","我在问你。"),l("ZH","那我想吃。"),l("ZJ","买。"),l("ZH","这么好说话？"),l("ZJ","一直都很好说话。")],
  "ZH-ZZY": [l("ZH","要不要买点水果？"),l("ZZY","可以。"),l("ZH","你想吃什么？"),l("ZZY","都行。"),l("ZH","都行是什么？"),l("ZZY","你选。"),l("ZH","那我真选了。"),l("ZZY","嗯。")],
  "SXH-ZJ": [l("ZJ","这包麦片看起来挺方便。"),l("SXH","你早上会吃吗？"),l("ZJ","看心情。"),l("SXH","那先买小包装，别囤一柜子。"),l("ZJ","你对采购还挺有经验。"),l("SXH","家里缺东西就得记下来。"),S("苏新皓把麦片放进篮子，又核对了一遍数量。"),l("ZJ","好，听采购组长的。")],
  "SXH-ZZY": [l("ZZY","青菜买两把够不够？"),l("SXH","晚餐五个人，三把更稳。"),l("ZZY","那豆腐呢？"),l("SXH","一盒就行，冰箱里还有。"),l("ZZY","你记得这么清楚？"),l("SXH","出门前看过一遍。"),S("张泽禹把清单上那一项划掉。"),l("ZZY","行，少买一点不浪费。")],
  "SXH-ZH": [l("SXH","洗衣液快用完了。"),l("ZH","我记在清单上了。"),l("SXH","买这个牌子吗？"),l("ZH","上次用的那瓶不刺鼻。"),l("SXH","好，就拿它。"),l("ZH","你还挺看重气味。"),S("苏新皓闻了闻试用纸，点点头。"),l("SXH","住一起，细节还是要注意。")],
  "ZJ-ZZX": [l("ZJ","这个煎锅要不要换新的？"),l("ZZX","锅底还挺平。"),l("ZJ","我怕它再粘。"),l("ZZX","那买一把木铲，先试试。"),l("ZJ","你倒是挺会省。"),l("ZZX","能用就先用。"),S("朱志鑫把锅具型号拍下来，留给导演组核对预算。"),l("ZJ","好，听你的，木铲先入篮。")],
  "ZZX-ZZY": [l("ZZY","厨房纸还剩多少？"),l("ZZX","柜子里有半卷。"),l("ZZY","那买一提还是一卷？"),l("ZZX","一卷吧，先把地方留给食材。"),l("ZZY","采购还要考虑收纳。"),l("ZZX","不然回来没处放。"),S("张泽禹把大包装换成了单卷。"),l("ZZY","好，记一笔：空间也算成本。")],
  "ZH-ZZX": [l("ZH","牛奶买低温的还是常温的？"),l("ZZX","冰箱有地方就低温。"),l("ZH","我看了一下，门上还能放。"),l("ZZX","那拿两瓶。"),l("ZH","你喝牛奶吗？"),l("ZZX","偶尔。"),S("左航拿起两瓶，又确认了保质期。"),l("ZH","这次应该够大家分。")],
};
// The day-two pair scripts cover every legal shopping duo; keep a defensive fallback for future roster additions.
export function dayTwoShoppingDialogue(a: GuestId, b: GuestId, mode: string): ScriptLine[] {
  const rows = episode2PairDialogues[K(a,b)];
  if (rows?.length) {
    const formal = mode === "A" || mode === "E" ? [["ZZX","SXH"],["ZJ","ZZY"]] : mode === "B" ? [["ZZX","SXH"],["ZJ","ZH"]] : mode === "D" ? [["ZZX","SXH"],["ZZY","ZH"]] : [["ZZX","SXH"]];
    const isFixedX = formal.some((pair) => K(pair[0] as GuestId,pair[1] as GuestId) === K(a,b));
    return isFixedX ? [...rows, S("一个人顺手拿起了对方常用的那件东西，谁也没有特意解释。")] : [...rows];
  }
  return [l(a,"先把清单分一下。"),l(b,"你看生鲜，我找日用品。"),l(a,"好，缺的我拍下来。"),l(b,"预算还剩不少。"),S("两个人核对清单和篮子里的商品。"),l(a,"数量对得上。"),l(b,"回去再一起收纳。")];
}

export function dayThreeDateDialogue(a: GuestId, b: GuestId, venue: string, mode: string, sunriseHint: boolean): ScriptLine[] {
  const pair = K(a,b);
  if (pair === "SXH-ZZX") return [S(`D03 · ${venue} · 两人先各自看了看周围。`),l("ZZX",venue==="咖啡馆"?"你想喝什么？":venue==="陶艺工作室"?"围裙系好了？":venue==="唱片店"?"想先从哪排开始看？":"先沿哪边走？"),l("SXH",venue==="咖啡馆"?"都可以。":venue==="陶艺工作室"?"我先看看怎么做。":venue==="唱片店"?"我想先看一圈。":"慢慢走就行。"),l("ZZX",venue==="咖啡馆"?"你以前不是最不喜欢别人说都可以吗？":"那我们先看看再决定。"),S("苏新皓抬头，停了几秒。"),l("SXH","你不是也说了。"),l("ZZX","哦。"),l("SXH","你不用一直找话说。"),l("ZZX","我也没有。"),l("SXH","嗯。"),S(venue==="咖啡馆"?"服务员把两杯水放在桌边，话题暂时停住。":venue==="陶艺工作室"?"两人把泥团放到转盘中央，先从最简单的形状开始。":venue==="唱片店"?"店内放起一首旧歌，两人顺着旋律往下一排走。":"树荫挡住了些阳光，两人把步子放慢。"),l("ZZX",venue==="咖啡馆"?"那我们先看看菜单。":"先从这边开始吧。")];
  if (pair === "ZJ-ZZY") return [S(`D03 · ${venue} · 约会从一段熟悉的沉默开始。`),l("ZJ","你为什么选这个地方？"),l("ZZY",venue==="咖啡馆"?"感觉挺适合聊天。":venue==="陶艺工作室"?"感觉做点东西不容易冷场。":venue==="唱片店"?"想看看有没有喜欢的唱片。":"想出来走一走。"),l("ZJ","我们还有什么没聊过的吗？"),l("ZZY","那可多了。"),l("ZJ","比如？"),l("ZZY","比如你现在到底想什么。"),S("张极转着杯子，没有马上回答。"),...(mode === "A"||mode==="E" ? [l("ZJ","有些话不是没聊过，是那时候没说完。"),l("ZZY","今天也不用一次说完。")]:[l("ZJ","你还是这么会把问题丢回来。"),l("ZZY","你也还是这么会躲。")]),l("ZJ","那先聊点轻松的。"),l("ZZY",venue==="唱片店"?"先听听这张吧。":"可以，别点你上次剩一半的东西。"),l("ZJ","记这么久？"),l("ZZY","我只是记得浪费食物。")];
  if (pair === "ZH-ZJ") return [S(`D03 · ${venue} · 张极先替左航拉开椅子。`),l("ZJ","航酱，你是不是很喜欢这种地方？"),l("ZH","你不是也挺喜欢？"),l("ZJ","我是看你喜欢才选的。"),l("ZH","你什么时候这么会说话了？"),l("ZJ","一直都会。"),l("ZH","那你以前怎么不说？"),S("张极低头看了看桌面的木纹。"),...(mode === "B" ? [l("ZJ","以前我以为你知道。"),l("ZH","我不想总靠猜。")]:mode==="E"?[l("ZJ","以前我以为你知道。"),l("ZH","我不想总靠猜。")]:[l("ZJ","可能以前说话没现在顺。"),l("ZH","那今天多说两句。")]),l("ZJ","好，那你想先聊什么？"),l("ZH","先把饮料点了，等下再想。"),l("ZJ","收到。")];
  if (pair === "ZH-ZZY") return [S(`D03 · ${venue} · 张泽禹把菜单递给左航。`),l("ZZY","你昨天说想看日出。"),l("ZH",sunriseHint?"你还记得？":"你怎么突然想到这个？"),l("ZZY","记得啊。"),l("ZH","我以为你就听一下。"),l("ZZY","我听了为什么不能记得。"),l("ZH","也不是不行。"),l("ZZY","那下次去呗。"),l("ZH","什么时候？"),l("ZZY","有机会的时候。"),S("两人笑了一下，没有把约定说得很重。"),l("ZH","那先把今天过完。")];
  const character: Record<GuestId,string> = { ZZX:"我比较喜欢先看一圈再决定。",SXH:"我做事会先把步骤理清楚。",ZJ:"我本来想开个玩笑，后来觉得还是认真听你说。",ZZY:"我刚刚是开玩笑的，不过你可以认真回答。",ZH:"我觉得这样挺好，慢慢来。" };
  const actions = [S(`D03 · ${venue} · 两个人沿着约会地点慢慢走。`),l(a,"你平时会专门来这种地方吗？"),l(b,venue==="陶艺工作室"?"偶尔做点手工，做得好不好无所谓。":venue==="唱片店"?"偶尔，通常是路过才进来。":venue==="公园散步"?"我更喜欢边走边聊。":"偶尔，通常是路过才进来。"),l(a,character[a]),l(b,"听起来像你会做的事。"),l(a,"你怎么判断的？"),l(b,character[b]),S(venue==="陶艺工作室"?"两人试着把歪掉的陶土扶正，笑了一下又重新开始。":venue==="唱片店"?"店里换了一首歌，两人停下来听完前奏。":venue==="公园散步"?"一阵风吹过树梢，两人把步子放慢。":"一阵短暂的安静，桌边只剩杯子碰到碟子的轻响。"),l(a,venue==="咖啡馆"?"要不要再看看菜单？":"你想先看哪边？"),l(b,"先从入口那边开始吧。"),l(a,"好，我跟着你。"),l(b,"也可以各看各的，等下再碰头。"),l(a,"那就先自由逛一会儿。"),l(b,"等下见。")];
  return actions;
}

export const guestIdByName: Record<string,GuestId> = { "朱志鑫":"ZZX","苏新皓":"SXH","张极":"ZJ","张泽禹":"ZZY","左航":"ZH" };
export const guestLabel: Record<GuestId,string> = { ZZX:"朱志鑫",SXH:"苏新皓",ZJ:"张极",ZZY:"张泽禹",ZH:"左航" };
export function episode2Morning(ep1KitchenPairWasJY: boolean): ScriptLine[] { return [S("【DAY 2】"),S("【有些习惯，比本人先醒来。】"),S("08:00 · 苏新皓第一个来到厨房，打开柜门准备早餐。"),l("ZZY","早啊。"),l("SXH","早。"),l("ZZY","你这就开始做饭了？"),l("SXH","看冰箱里有什么。"),l("ZZY","我看看有没有能帮忙的。"),l("SXH","你先把杯子拿出来吧。"),l("ZZY","行。"),S("张极踩着拖鞋走进厨房，先看了眼墙上的钟。"),l("ZJ","你们怎么这么早？"),l("ZZY","因为正常人这个点已经醒了。"),l("ZJ","你攻击性有点强。"),l("ZZY","谢谢。"),...(ep1KitchenPairWasJY?[l("ZJ","昨天那个调味料你记得放哪儿了吗？"),l("ZZY","你自己收的，你问我？")]:[l("ZJ","厨房东西放得还挺整齐。"),l("ZZY","毕竟昨天收拾了一下午。")])]; }
export function episode2Breakfast(kitchenAired: boolean): ScriptLine[] {
  return [S("08:30 · 五个人陆续在餐桌边坐下。"),l("ZH","今天有什么安排？"),l("SXH","不知道，节目组还没通知。"),l("ZJ","我希望不要一大早就运动。"),l("ZZX","你现在不就在吃早饭吗？"),l("ZJ","提前说一下愿望。"),l("SXH","我等会儿吃点沙拉就行。"),l("ZJ","这也算吃早饭？"),l("SXH","算吧。"),...(kitchenAired ? [S("朱志鑫察觉苏新皓正在看自己。"),l("ZZX","怎么了？"),l("SXH","没事。"),l("ZZX","哦。")]:[S("苏新皓看见朱志鑫挑开不喜欢的食材，没有插话，只把纸巾推近了一点。")])];
}
