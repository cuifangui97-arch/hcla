import canonical from "../../source_package/ep09_complete_v16_4/EP09_COMPLETE_V16_4.md?raw";
import type { GuestId, ScriptLine } from "./day1-data";

export const ep09Phases = ["INTRO","TRAVEL_ASSIGN","TRAVEL_PLAY","RETURN","GIFT_RULE","GIFT_PLAY","FINAL_DATE_RULE","INVITES","FINAL_DATE_PLAY","TRUTH","INTERVIEW","SMS","EDITING","BROADCAST","COMPLETE"] as const;
export type Ep09Phase = typeof ep09Phases[number];
export const ep09Guests: GuestId[] = ["ZZX","SXH","ZJ","ZZY","ZH"];
export const ep09Names: Record<GuestId,string> = { ZZX:"朱志鑫", SXH:"苏新皓", ZJ:"张极", ZZY:"张泽禹", ZH:"左航" };
export const ep09Pairs: [GuestId,GuestId][] = [["ZZX","SXH"],["ZJ","ZZY"],["ZJ","ZH"],["ZZY","ZH"],["ZZX","ZJ"],["ZZX","ZZY"],["ZZX","ZH"],["SXH","ZJ"],["SXH","ZZY"],["SXH","ZH"]];
export type Ep09Weather = "clear"|"cloudy"|"overcast";
export type Ep09GiftMode = "anonymous"|"random"|"keyword";
export type Ep09Venue = "河边步道"|"小书店"|"复古唱片角";
const namesToIds: Record<string,GuestId|"STAGE"> = { "朱志鑫":"ZZX","朱":"ZZX","苏新皓":"SXH","苏":"SXH","张极":"ZJ","张泽禹":"ZZY","左航":"ZH","节目组":"STAGE","工作人员":"STAGE","主持人":"STAGE" };
const lines = canonical.split(/\r?\n/);
function section(title: string, level = 3): string {
  const marker = `${"#".repeat(level)} ${title}`;
  const start = lines.findIndex(line => line.startsWith(marker));
  if (start < 0) return "";
  const end = lines.findIndex((line,index) => index > start && new RegExp(`^#{1,${level}}\\s`).test(line));
  return lines.slice(start + 1, end < 0 ? lines.length : end).join("\n");
}
export function parseEp09Dialogue(source: string): ScriptLine[] {
  const out: ScriptLine[] = [];
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim().replace(/^\s*[-*]\s*/, "").replace(/\*\*/g, "");
    if (!line || line.startsWith("#") || line.startsWith("|") || line.startsWith("`") || line.startsWith("注意：") || line.startsWith("以下") || line.startsWith("导演从") || line.startsWith("- ")) continue;
    const action = [...line.matchAll(/【([^】]+)】/g)].map(match => match[1].trim()).filter(Boolean);
    for (const text of action) out.push({ speaker:"STAGE", text:`【${text}】` });
    const rx = /(朱志鑫|苏新皓|张泽禹|张极|左航|节目组|工作人员|主持人|朱|苏)[：:]“([^”]+)”/g;
    for (const match of line.matchAll(rx)) {
      const speaker = namesToIds[match[1]];
      if (speaker) out.push({ speaker, text:match[2].trim() });
    }
  }
  return out;
}
function between(start:string,end:string){const a=canonical.indexOf(start),b=a<0?-1:canonical.indexOf(end,a+start.length);return a<0?"":canonical.slice(a+start.length,b<0?undefined:b);}
export const ep09Intro = parseEp09Dialogue(section("2. E09-01 清晨集合【锁稿】",2));
export const ep09TravelScripts = Object.fromEntries(ep09Pairs.map((pair,index) => {
  const n = index + 1;
  const block = section(`4.${n} `,3);
  const rows = parseEp09Dialogue(block);
  if (index === 3) rows.push({speaker:"STAGE",text:"【芒猴只因本局实际同行而共同看见天亮；没有正式关系身份的旁白揭示。】"});
  return [pairKey(pair),rows];
})) as Record<string,ScriptLine[]>;
export const ep09SoloTravel: Record<GuestId,ScriptLine[]> = {
  ZZX:[{speaker:"STAGE",text:"【独行平台，摄影机保持距离。】"},{speaker:"ZZX",text:"原来一个人出来也没有想的那么安静。车开走以后，风声比人说话大得多。"},{speaker:"STAGE",text:"【他拍下天空，没有给谁发送。】"}],
  SXH:[{speaker:"STAGE",text:"【平台角落，整理背包。】"},{speaker:"SXH",text:"每次出门都习惯多准备一点。今天别人不在旁边，我才发现我可以只拿自己的那一份。"},{speaker:"STAGE",text:"【他拆开一包饼干。】"}],
  ZJ:[{speaker:"STAGE",text:"【靠近栏杆。】"},{speaker:"ZJ",text:"我本来觉得一个人看挺无聊的。结果不用商量拍照角度，倒也不错。"},{speaker:"STAGE",text:"【他给天空拍了两张，第二张不满意删掉。】"}],
  ZZY:[{speaker:"STAGE",text:"【小木凳上。】"},{speaker:"ZZY",text:"坐在这里，看着别人的车灯慢慢过去，会觉得一天很长。不是难受，就是有点舍不得。"},{speaker:"STAGE",text:"【他收起手机，继续看天色。】"}],
  ZH:[{speaker:"STAGE",text:"【沿安全步道走到标记点。】"},{speaker:"ZH",text:"原来这地方有三种鸟叫。我刚才数了一遍，结果第四种又出来了。"},{speaker:"STAGE",text:"【他对镜头比了一个‘等一下’的手势。】"}],
};
export const ep09Return = parseEp09Dialogue(section("6. E09-04 归来早餐【锁稿】",2));
export const ep09GiftChoiceScripts: Record<GuestId,ScriptLine[]> = {
 ZZX:parseEp09Dialogue(between("**朱志鑫｜小相片架**","**苏新皓｜折叠暖手袋**")), SXH:parseEp09Dialogue(between("**苏新皓｜折叠暖手袋**","**张极｜便携拍立得相纸册**")), ZJ:parseEp09Dialogue(between("**张极｜便携拍立得相纸册**","**张泽禹｜小小的旅行手账**")), ZZY:parseEp09Dialogue(between("**张泽禹｜小小的旅行手账**","**左航｜迷你指南针钥匙扣**")), ZH:parseEp09Dialogue(between("**左航｜迷你指南针钥匙扣**","### 拆礼时不可省略的五人现场对白【锁稿】")),
};
export const ep09GiftGroup = parseEp09Dialogue(between("### 拆礼时不可省略的五人现场对白【锁稿】","**额外条件：赠者在场且可合法知晓赠送关系**"));
export const ep09DateRule = parseEp09Dialogue(section("8.1 邀请时的完整公共脚本【锁稿】",3));
export const ep09DatePairScripts = Object.fromEntries(ep09Pairs.map((pair,index) => {
 const block=section(`9.${index+1} `,3); return [pairKey(pair),parseEp09Dialogue(block)];
})) as Record<string,ScriptLine[]>;
export const ep09DateLocationIntro: Record<Ep09Venue,ScriptLine[]> = {
 "河边步道":[{speaker:"STAGE",text:"【工作人员：今天没有指定路线，从这边走到桥头就可以。你们想停下随时停。】"},{speaker:"STAGE",text:"【两人沿河走，远处有人骑车经过。】"}],
 "小书店":[{speaker:"STAGE",text:"【工作人员：请分别挑一本自己想给对方看的书，不必解释与X有关。】"},{speaker:"STAGE",text:"【两人把书放上桌。】"}],
 "复古唱片角":[{speaker:"STAGE",text:"【工作人员：请各选一张封面吸引你的唱片。试听后说说为什么选它。现场使用节目原创音效。】"}],
};
export const ep09SoloDate: Record<GuestId,ScriptLine[]> = {
 ZZX:[{speaker:"STAGE",text:"【摄影角。】"},{speaker:"ZZX",text:"今天突然没人跟我商量去哪儿。我给自己选了个能看到整条街的座位。"},{speaker:"STAGE",text:"【拍一张照片，写上日期。】"}],
 SXH:[{speaker:"STAGE",text:"【小咖啡角。】"},{speaker:"SXH",text:"本来想把下午安排满，后来只点了一杯热饮。坐完它再回去。"},{speaker:"STAGE",text:"【他安静看窗外。】"}],
 ZJ:[{speaker:"STAGE",text:"【小书架前。】"},{speaker:"ZJ",text:"我想找一本封面看起来就很好笑的书，结果越挑越认真。"},{speaker:"STAGE",text:"【最后选了一本薄册子。】"}],
 ZZY:[{speaker:"STAGE",text:"【河边座椅。】"},{speaker:"ZZY",text:"如果今天只有自己，那就慢慢把路走完。"},{speaker:"STAGE",text:"【拍了水面倒影，没有配文。】"}],
 ZH:[{speaker:"STAGE",text:"【唱片封面墙。】"},{speaker:"ZH",text:"我现在可以完全按封面挑，不用和人争。"},{speaker:"STAGE",text:"【选完又看了一眼另一张，笑了。】"}],
};
export const ep09TruthQuestions: Record<string,{question:string;answers:Record<GuestId,string>}> = {
 Q1:{question:"今天谁做了让你意外的小事？",answers:{ZZX:"有人今天认真把邀请写清楚了，我觉得挺意外。",SXH:"我看到有人不赶时间，愿意把一段路走完。",ZJ:"有人明明困得要命，还能把早饭准备齐。",ZZY:"有人今天没有一直开玩笑，认真听我说话。",ZH:"有人没等天完全亮，就已经在找最好的位置了。"}},
 Q2:{question:"你想给今天的自己留一句什么话？",answers:{ZZX:"想做的事别只在心里排练。",SXH:"不是什么都要提前准备好。",ZJ:"认真说一句话不会让气氛变差。",ZZY:"没选到的人也不等于没被看见。",ZH:"别急着把答案定死。"}},
 Q3:{question:"你今天后悔哪一个小决定？",answers:{ZZX:"出门时穿得有点少。",SXH:"把一个东西放错包了，找了半天。",ZJ:"相机举得太多，有一段没认真看。",ZZY:"走到一半想拍照，结果没带够电。",ZH:"我应该在拐弯前看一眼路牌。"}},
 Q4:{question:"如果明天必须说一件真话，你希望是关于什么？",answers:{ZZX:"关于我为什么做了那个决定。",SXH:"关于我当时真正想解决的是什么。",ZJ:"关于认真和开玩笑的界线。",ZZY:"关于我是不是真的准备好了。",ZH:"关于我愿意走向谁，而不是谁来找我。"}},
 Q5:{question:"你最想保留今天的哪一个画面？",answers:{ZZX:"天刚亮，所有人都不说话的那几秒。",SXH:"回到小屋，大家重新坐齐的时候。",ZJ:"从窗外看见天色开始变亮的时候。",ZZY:"某一段不用赶路的时间。",ZH:"清晨风有点大，但大家都还在的时候。"}},
};
export const ep09Interviews: Record<GuestId,ScriptLine[]> = {
 ZZX:[{speaker:"STAGE",text:"采访：“今天有哪个决定是你主动做的？”"},{speaker:"ZZX",text:"最后那张邀请卡。我没让别人替我解释它。"},{speaker:"STAGE",text:"采访：“有没有一刻觉得紧张？”"},{speaker:"ZZX",text:"有。但紧张不代表我就得回避。"},{speaker:"STAGE",text:"采访：“明天想说清楚什么？”"},{speaker:"ZZX",text:"我当时到底在想什么。这次不只说结论。"}],
 SXH:[{speaker:"STAGE",text:"采访：“今天最意外的事情？”"},{speaker:"SXH",text:"大家早起的状态都不一样，结果还是一起出门了。"},{speaker:"STAGE",text:"采访：“今天有什么变化？”"},{speaker:"SXH",text:"以前我喜欢把行程排满。今天留了些空白，也没出事。"},{speaker:"STAGE",text:"采访：“你怎么看明天？”"},{speaker:"SXH",text:"我要说自己的感受，不是替别人把答案想出来。"}],
 ZJ:[{speaker:"STAGE",text:"采访：“今天最想重拍哪段？”"},{speaker:"ZJ",text:"想重拍一张照片，但又觉得没必要。那个瞬间本来就过去了。"},{speaker:"STAGE",text:"采访：“今天有没有认真说过话？”"},{speaker:"ZJ",text:"有。希望对方听出来了。"},{speaker:"STAGE",text:"采访：“明天希望怎样结束？”"},{speaker:"ZJ",text:"至少别把该说的话藏在玩笑后面。"}],
 ZZY:[{speaker:"STAGE",text:"采访：“今天的旅行怎么样？”"},{speaker:"ZZY",text:"天还没亮就出门，最难的是起床，最好的是走到最后。"},{speaker:"STAGE",text:"采访：“你怎么看最后一次约会？”"},{speaker:"ZZY",text:"答应或拒绝都算认真选择。我喜欢这个规则。"},{speaker:"STAGE",text:"采访：“你现在最担心什么？”"},{speaker:"ZZY",text:"担心自己的心意没讲清楚。但明天还有机会。"}],
 ZH:[{speaker:"STAGE",text:"采访：“今天有什么记得特别清楚的？”"},{speaker:"ZH",text:"路口有一段风很大。后来太阳有没有出来，我反而没那么在意。"},{speaker:"STAGE",text:"采访：“你满意今天的选择吗？”"},{speaker:"ZH",text:"我知道自己为什么这么选，就够了。"},{speaker:"STAGE",text:"采访：“明天最想做什么？”"},{speaker:"ZH",text:"不绕弯子。"}],
};
export function pairKey(pair: GuestId[]) { return [...pair].sort().join("-"); }
export function stableEp09Hash(value:string){let h=2166136261;for(const ch of value)h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;}
export function makeTravelGroups(first:GuestId[],second:GuestId[]) { const groups=[first,second].map(pair=>pair.slice(0,2)) as [GuestId,GuestId][];const valid=groups.every(group=>group.length===2&&group[0]!==group[1])&&new Set(groups.flat()).size===4;return {valid,groups,solo:valid?ep09Guests.find(id=>!groups.flat().includes(id))??null:null}; }
export function giftPermutation(mode:Ep09GiftMode,seed:string,anonymousTargets:Partial<Record<GuestId,GuestId>>={}) {
 if(mode==="anonymous")return {...anonymousTargets};
 const rotated=[...ep09Guests];const shift=(stableEp09Hash(seed)%4)+1;const recipients=[...rotated.slice(shift),...rotated.slice(0,shift)];
 if(mode==="random")return Object.fromEntries(ep09Guests.map((sender,index)=>[sender,recipients[index]])) as Record<GuestId,GuestId>;
 const keywords=["早起","热饮","相机","路线","音乐"];
 const ranked=[...ep09Guests].sort((a,b)=>stableEp09Hash(`${seed}:${keywords[ep09Guests.indexOf(a)]}`)-stableEp09Hash(`${seed}:${keywords[ep09Guests.indexOf(b)]}`));
 return Object.fromEntries(ep09Guests.map((sender,index)=>[sender,ranked[(index+1)%ranked.length]])) as Record<GuestId,GuestId>;
}
/** Public C-rule: order the five actual trip keywords; each gift follows the next keyword card.
 * Equal keywords are ordered by the saved seed so refreshes never reshuffle recipients. */
export function keywordGiftPermutation(keywords:Partial<Record<GuestId,string>>,seed:string):Record<GuestId,GuestId>|null{
 if(ep09Guests.some(id=>!keywords[id]?.trim()))return null;
 const order=[...ep09Guests].sort((a,b)=>{
  const wordA=keywords[a]!.trim().normalize("NFKC").toLocaleLowerCase();
  const wordB=keywords[b]!.trim().normalize("NFKC").toLocaleLowerCase();
  return wordA.localeCompare(wordB,"zh-CN")||stableEp09Hash(`${seed}:${a}`)-stableEp09Hash(`${seed}:${b}`);
 });
 return Object.fromEntries(order.map((donor,index)=>[donor,order[(index+1)%order.length]])) as Record<GuestId,GuestId>;
}
export function resolveAcceptedDatePairs(invites:Partial<Record<GuestId,GuestId|"">>,accepts:Partial<Record<GuestId,GuestId|"">>) {
 const candidates=ep09Guests.flatMap(from=>{const to=invites[from];return to&&to!==from&&accepts[to]===from?[[from,to] as GuestId[]]:[]});
 candidates.sort((a,b)=>Number(invites[b[1]]===b[0]&&invites[b[0]]===b[1])-Number(invites[a[1]]===a[0]&&invites[a[0]]===a[1])||pairKey(a).localeCompare(pairKey(b)));
 const selected:GuestId[][]=[];for(const pair of candidates)if(selected.length<2&&!selected.some(other=>pair.some(id=>other.includes(id))))selected.push(pair);
 return selected;
}
export function validateEp09Travel(groups:GuestId[][],solo:GuestId|null){return groups.length===2&&groups.every(group=>group.length===2&&group[0]!==group[1])&&new Set([...groups.flat(),...(solo?[solo]:[])]).size===5&&ep09Guests.every(id=>groups.flat().includes(id)||solo===id);}
