import type { GuestId, ScriptLine } from "./day1-data";

export type Ep05Segment = "ready" | "eye" | "after";
export type Ep05Stage = "BREAKFAST" | "INTRO" | "ROUND1_SELECTION" | "ROUND1_PLAY" | "ROUND2_SELECTION" | "ROUND2_PLAY" | "GROUP_REACTION" | "BONUS_SELECTION" | "BONUS_PLAY" | "EVENING" | "INTERVIEW" | "SMS" | "EDITING" | "BROADCAST" | "COMPLETE";
export type Ep05Round = {
  roundId: "round1" | "round2"; pairIds: GuestId[]; preparationCompleted: boolean;
  timerStarted: boolean; timerFinished: boolean; taskOutcome: string;
  dialogueProgress: Record<Ep05Segment, number>; completionStatus: "inProgress" | "completed";
  generatedClipIds: string[];
};
export type Ep05Line = ScriptLine & { id: string; second?: number };
type Row = { speaker: GuestId | "STAGE"; text: string; second?: number };
type PairScript = { code: string; ids: [GuestId, GuestId]; label: string; outcome: string; segments: Record<Ep05Segment, Row[]> };
const S=(text:string,second?:number):Row=>({speaker:"STAGE",text,...(second===undefined?{}:{second})});
const L=(speaker:GuestId,text:string):Row=>({speaker,text});

export const ep05Opening: Row[] = [
 S("【今天的任务是30秒对视。】"),S("【每轮由两位嘉宾参加。】"),S("【目光移开超过一秒，即视为挑战失败。】"),S("【请在计时开始后保持目光接触。】"),
 L("ZJ","三十秒听起来还好。"),L("ZZY","那你等会儿别笑。"),L("ZJ","我尽量。"),L("ZH","你一说尽量，我就觉得不太可靠。"),L("ZJ","怎么连你也不相信我。"),L("SXH","先看规则，笑应该不算输吧？"),L("ZZX","只是不能移开眼睛？"),L("SXH","对。"),L("ZJ","那我可以一边看一边笑？"),L("ZZY","你先做到再说。"),S("【请导演安排第一轮嘉宾。】"),
];
export const ep05Breakfast: Row[] = [
 S("【09:30，五个人陆续来到厨房准备早餐。】"),L("ZZX","鸡蛋要不要再煎一会儿？"),L("SXH","可以，我去拿盘子。"),S("【苏新皓打开冰箱，拿出一盒沙拉。】"),L("ZZX","你早饭又打算吃沙拉？"),L("SXH","还有面包，我等一下吃。"),L("ZJ","早上就开始讨论吃什么了？"),L("ZZY","厨房里最先讨论的不是今天任务吗？"),L("ZH","先吃饭吧，不然等会儿又要说饿。"),L("ZJ","这句是在说谁？"),L("ZH","谁先回答就是谁。"),S("【五个人坐下吃早餐。11点，节目组在客厅公布今日任务。】")
];
export const ep05GroupReaction: Row[] = [
 L("ZJ","这任务真的有点难。"),L("ZZY","你刚才不是说三十秒很简单？"),L("ZJ","我说听起来还行。"),L("ZH","现在呢？"),L("ZJ","现在觉得可以缩短成十秒。"),L("SXH","十秒能看出来什么？"),L("ZJ","至少能看出来谁先笑。"),L("ZZX","你不是笑得挺快？"),L("ZJ","怎么又说我？"),L("ZZY","因为你刚刚提的。"),S("【五人一起笑起来。】"),S("【上午的对视任务全部结束。】"),S("【导演可以安排一项下午追加任务。】"),
];

const pairScripts: PairScript[] = [
 {code:"GC",ids:["ZZX","SXH"],label:"棍铲",outcome:"苏新皓先移开视线",segments:{
 ready:[S("【第一组嘉宾：朱志鑫、苏新皓。】"),L("SXH","你坐那边吧。"),L("ZZX","为什么？"),L("SXH","那边光好一点。"),L("ZZX","这还要挑位置啊。"),L("SXH","不然你坐这边也行。"),L("ZZX","我就坐这里。"),S("【两个人面对面坐下。】"),L("ZZX","开始了吗？"),L("SXH","还没有。"),L("ZZX","那你怎么已经看我了？"),L("SXH","我看看你准备好了没有。"),L("ZZX","准备好了。")],
 eye:[S("【30秒倒计时开始。】",0),L("SXH","你不要一直笑。"),L("ZZX","我没笑。"),L("SXH","你嘴角都起来了。"),L("ZZX","你怎么一直看我嘴角？"),L("SXH","不是对视吗？"),L("ZZX","那你看眼睛。"),S("【苏新皓下意识移开目光。】",18),S("【本轮挑战结束。】",30)],
 after:[L("ZZX","你输了。"),L("SXH","这也算？"),L("ZZX","当然算。"),L("SXH","那重新来一次？"),L("ZZX","规则说只能一次。"),L("SXH","你倒记得清楚。"),L("ZZX","刚刚有人让我认真看规则。"),L("SXH","三十秒还挺难的。"),L("ZZX","你刚才不是挺有信心？"),L("SXH","我什么时候说过？"),L("ZZX","你表情写着呢。"),L("SXH","你又知道了。"),S("【朱志鑫笑了。】")]}},
 {code:"JY",ids:["ZJ","ZZY"],label:"极禹",outcome:"张极先移开视线",segments:{
 ready:[S("【本轮嘉宾：张极、张泽禹。】"),L("ZJ","我有一个问题。"),L("ZZY","你说。"),L("ZJ","能不能眨眼？"),L("ZZY","你不眨眼试试？"),L("ZJ","我怕我忍不住。"),L("ZZY","没人让你不眨。"),L("ZJ","那还行。"),S("【张极把椅子往后挪了一点。】"),L("ZZY","你坐那么远干嘛？"),L("ZJ","保持安全距离。"),L("ZZY","你是怕看我还是怕我看你？"),L("ZJ","怕你突然笑。"),L("ZZY","你先管好你自己。")],
 eye:[S("【30秒倒计时开始。】",0),L("ZJ","你别这样看我。"),L("ZZY","我怎么看你了？"),L("ZJ","就那个表情。"),L("ZZY","我没表情。"),L("ZJ","那更吓人。"),S("【张极忍不住笑了一声。】",12),L("ZZY","你笑可以，别移开。"),L("ZJ","我知道。"),L("ZJ","还有多久？"),L("ZZY","你问了也不会变快。"),S("【张极低头笑，视线离开。】",27),S("【挑战结束。】",30),L("ZZY","输了。"),L("ZJ","我没想到你这么能忍。"),L("ZZY","是你太容易笑了。")],
 after:[L("ZJ","下一次我一定不笑。"),L("ZZY","还有下一次？"),L("ZJ","可以申请。"),L("ZZY","你先把这一次的结果接受了。"),L("ZJ","行，我认输。"),S("【张极伸手做了一个投降动作。】")]}},
 {code:"JH",ids:["ZJ","ZH"],label:"极航",outcome:"左航先移开视线",segments:{
 ready:[S("【本轮嘉宾：张极、左航。】"),L("ZJ","航酱。"),L("ZH","干嘛？"),L("ZJ","你等会儿不能笑。"),L("ZH","为什么？"),L("ZJ","你笑了我肯定也会笑。"),L("ZH","那是你的问题。"),L("ZJ","你就不能配合一下？"),L("ZH","我已经坐这里了。"),L("ZJ","确实，很配合。"),S("【左航把椅子转正。】"),L("ZH","你还不坐好？"),L("ZJ","这就坐。")],
 eye:[S("【30秒倒计时开始。】",0),L("ZJ","你怎么这么严肃？"),L("ZH","在做任务。"),L("ZJ","你平时也这样？"),L("ZH","你平时话也这么多？"),L("ZJ","好像是。"),S("【张极收起笑容，认真看着左航。】",14),L("ZH","你突然这样干嘛？"),L("ZJ","你不是让我认真？"),L("ZH","……行。"),L("ZJ","航酱，你耳朵是不是红了？"),L("ZH","你看眼睛。"),L("ZJ","我看见了。"),S("【左航笑着偏过头。】",28),S("【挑战结束。】",30),L("ZJ","抓到了！"),L("ZH","什么抓到了？"),L("ZJ","你笑了，还转头了。"),L("ZH","是你一直说话。")],
 after:[L("ZJ","我赢了。"),L("ZH","你很骄傲？"),L("ZJ","第一次赢，不行啊。"),L("ZH","那你庆祝一下。"),L("ZJ","晚上给我加个菜？"),L("ZH","你想得挺好。")]}},
 {code:"MH",ids:["ZZY","ZH"],label:"芒猴",outcome:"双方完成30秒",segments:{
 ready:[S("【本轮嘉宾：张泽禹、左航。】"),L("ZZY","你准备好了？"),L("ZH","差不多。"),L("ZZY","差不多算什么？"),L("ZH","就是可以开始。"),L("ZZY","那你说准备好了不就行。"),L("ZH","准备好了。"),L("ZZY","现在又太正式了。"),S("【左航笑了一下。】"),L("ZH","你到底想让我怎么回答？"),L("ZZY","正常回答。"),L("ZH","那刚刚不就挺正常。")],
 eye:[S("【30秒倒计时开始。】",0),S("【两个人没有立即说话。】",8),L("ZZY","你不说话啊？"),L("ZH","对视为什么要说话？"),L("ZZY","你说得有道理。"),L("ZZY","我发现你真的很能忍。"),L("ZH","什么？"),L("ZZY","就是一直这样看着。"),L("ZH","你也没移开。"),S("【张泽禹忍不住笑了一下，却仍然保持视线。】",25),S("【倒计时结束，双方挑战成功。】",30)],
 after:[L("ZZY","这就结束了？"),L("ZH","嗯。"),L("ZZY","我还以为会更难一点。"),L("ZH","你刚才不是一直问时间？"),L("ZZY","我那是聊天。"),L("ZH","哦。"),L("ZZY","你这个‘哦’什么意思？"),L("ZH","没什么意思。"),S("【张泽禹笑着摇了摇头。】")]}},
 {code:"ZZ-ZJ",ids:["ZZX","ZJ"],label:"朱志鑫 × 张极",outcome:"张极先移开视线",segments:{
 ready:[L("ZJ","我先声明，我可能会笑。"),L("ZZX","你刚刚已经声明过了。"),L("ZJ","多说一次比较保险。"),L("ZZX","保险什么？"),L("ZJ","到时候输了有理由。"),L("ZZX","那我也先声明。"),L("ZJ","什么？"),L("ZZX","我可能不会笑。"),L("ZJ","那你这样很难办。")],
 eye:[S("【30秒倒计时开始。】",0),L("ZJ","你别那么认真。"),L("ZZX","是你说不要笑。"),L("ZJ","那你也不用像在考试。"),L("ZZX","我在认真完成任务。"),S("【张极突然压低声音。】",14),L("ZJ","请问这位考生，感觉如何？"),L("ZZX","请考官保持安静。"),S("【张极先笑起来，但勉强没有转头。】",22),L("ZZX","你是不是憋得很辛苦？"),L("ZJ","你别说话。"),S("【张极终于低头。】",28),S("【挑战结束。】",30)],
 after:[L("ZZX","你不是让我别笑？"),L("ZJ","那你刚刚怎么还逗我？"),L("ZZX","我只是在回答考官问题。"),L("ZJ","这位考生很有想法。"),L("ZZX","谢谢考官。")]}},
 {code:"ZZ-ZZY",ids:["ZZX","ZZY"],label:"朱志鑫 × 张泽禹",outcome:"双方完成30秒",segments:{
 ready:[L("ZZY","你觉得这任务难吗？"),L("ZZX","还没试。"),L("ZZY","先预测一下。"),L("ZZX","不知道。"),L("ZZY","你这预测等于没预测。"),L("ZZX","那你觉得呢？"),L("ZZY","我觉得我能坚持。"),L("ZZX","行，那我看看。"),L("ZZY","你不要给我压力。"),L("ZZX","不是你自己说的？")],
 eye:[S("【30秒倒计时开始。】",0),L("ZZY","你怎么一点表情没有？"),L("ZZX","我在听你说话。"),L("ZZY","这是对视，不是听力考试。"),L("ZZX","那你不说就行。"),S("【短暂安静。】",16),L("ZZY","行，我不说。"),S("【朱志鑫看了他一会儿。】",23),L("ZZX","你还真不说了。"),L("ZZY","你不是让我不说？"),L("ZZX","挺能忍。"),S("【倒计时结束，双方挑战成功。】",30)],
 after:[L("ZZY","你刚刚故意找我讲话吧？"),L("ZZX","没有。"),L("ZZY","我都快成功了你突然来一句。"),L("ZZX","最后也成功了。"),L("ZZY","那倒也是。"),L("ZZX","恭喜。"),L("ZZY","同喜。")]}},
 {code:"ZZ-ZH",ids:["ZZX","ZH"],label:"朱志鑫 × 左航",outcome:"双方完成30秒",segments:{
 ready:[L("ZH","坐哪儿？"),L("ZZX","你选吧。"),L("ZH","都可以。"),L("ZZX","那就这里。"),L("ZH","行。"),S("【两个人坐下以后都没有说话。】"),L("ZZX","你是不是已经开始了？"),L("ZH","还没有吧？"),L("ZZX","我看你挺认真。"),L("ZH","我在等倒计时。"),L("ZZX","哦。")],
 eye:[S("【30秒倒计时开始。】",0),S("【两个人仍然没有说话。】",9),S("【安静持续了一会儿。】",15),L("ZZX","感觉比我想的安静。"),L("ZH","对啊。"),L("ZZX","我们是不是应该说点什么？"),L("ZH","规则没有要求。"),L("ZZX","也对。"),S("【朱志鑫突然笑了一声。】",24),L("ZH","你笑什么？"),L("ZZX","不知道，太安静了。"),S("【倒计时结束，双方挑战成功。】",30)],
 after:[L("ZH","你刚刚为什么突然笑？"),L("ZZX","就觉得我们俩挺像在发呆。"),L("ZH","确实。"),L("ZZX","这任务还挺省力。"),L("ZH","不用动。"),L("ZZX","下回可以再参加。"),L("ZH","看节目组。")]}},
 {code:"SXH-ZJ",ids:["SXH","ZJ"],label:"苏新皓 × 张极",outcome:"张极先移开视线",segments:{
 ready:[L("SXH","你能不能先坐好？"),L("ZJ","我坐好了啊。"),L("SXH","你椅子还在晃。"),L("ZJ","这也有要求？"),L("SXH","等会儿开始你再晃，镜头都不好拍。"),L("ZJ","你现在已经开始当导演了？"),L("SXH","我是怕你一会儿摔了。"),L("ZJ","那谢谢关心。")],
 eye:[S("【30秒倒计时开始。】",0),L("ZJ","你眼睛怎么这么有压迫感？"),L("SXH","我正常看着你。"),L("ZJ","跟老师检查作业一样。"),L("SXH","你作业写完了没有？"),L("ZJ","……没有。"),S("【苏新皓忍不住笑。】",16),L("ZJ","你先笑了。"),L("SXH","笑不算输。"),L("ZJ","你规则背得挺熟。"),L("SXH","刚看过。"),S("【张极再次忍不住低头笑。】",27),S("【挑战结束。】",30)],
 after:[L("SXH","你刚刚非得讲作业。"),L("ZJ","不是你先问的吗？"),L("SXH","是你说像老师。"),L("ZJ","那我回答得也很诚实。"),L("SXH","行。"),L("ZJ","老师，我这算及格吗？"),L("SXH","不及格，移开视线了。")]}},
 {code:"SXH-ZZY",ids:["SXH","ZZY"],label:"苏新皓 × 张泽禹",outcome:"苏新皓先移开视线",segments:{
 ready:[L("SXH","要不要先看一下倒计时？"),L("ZZY","看了能怎么样？"),L("SXH","至少知道什么时候开始。"),L("ZZY","节目组会告诉我们的。"),L("SXH","我知道。"),L("ZZY","你是不是有点紧张？"),L("SXH","没有。"),L("ZZY","那你干嘛一直看计时器？"),L("SXH","确认一下。"),L("ZZY","行，确认完了我们开始。")],
 eye:[S("【30秒倒计时开始。】",0),L("SXH","你别老挑眉。"),L("ZZY","我挑眉了吗？"),L("SXH","挑了。"),L("ZZY","那是自然反应。"),L("ZZY","你怎么跟比赛一样？"),L("SXH","任务不就是要完成？"),L("ZZY","这么认真啊。"),L("SXH","当然。"),L("ZZY","还有六秒。"),L("SXH","你不要报时。"),L("ZZY","五、四——"),S("【苏新皓忍不住低头笑。】",24),S("【挑战结束。】",30)],
 after:[L("SXH","你故意的。"),L("ZZY","我就是报个时间。"),L("SXH","你明明知道我会笑。"),L("ZZY","那说明我很了解你？"),L("SXH","别乱总结。"),L("ZZY","好好好。")]}},
 {code:"SXH-ZH",ids:["SXH","ZH"],label:"苏新皓 × 左航",outcome:"双方完成30秒",segments:{
 ready:[L("SXH","你要坐里面一点吗？"),L("ZH","这里可以。"),L("SXH","光不会太晃？"),L("ZH","不会。"),L("SXH","那就好。"),L("ZH","你是不是检查过场地了？"),L("SXH","没有，顺便看一下。"),L("ZH","挺细致。"),L("SXH","怕一会儿有问题。")],
 eye:[S("【30秒倒计时开始。】",0),S("【两人安静地看着对方。】",8),L("ZH","你是不是特别想赢？"),L("SXH","也没有。"),L("ZH","那怎么坐得这么直？"),L("SXH","我平时就这样。"),L("ZH","哦。"),L("SXH","你不想赢？"),L("ZH","想。"),L("SXH","那你怎么这么放松？"),L("ZH","紧张也不会更容易赢。"),L("SXH","……有道理。"),S("【倒计时结束，双方挑战成功。】",30)],
 after:[L("SXH","还挺顺利。"),L("ZH","嗯。"),L("SXH","你刚刚是不是一点都没紧张？"),L("ZH","有一点。"),L("SXH","那你看不出来。"),L("ZH","你也看不出来。"),L("SXH","真的？"),L("ZH","真的。")]}},
];

const pairKey=(ids:GuestId[])=>[...ids].sort().join("|");
export function ep05PairScript(ids:GuestId[]):PairScript|undefined { return ids.length===2?pairScripts.find(row=>pairKey(row.ids)===pairKey(ids)):undefined; }
export function ep05Pairs(): {code:string;ids:[GuestId,GuestId];label:string}[] { return pairScripts.map(({code,ids,label})=>({code,ids,label})); }
export function ep05PairLines(ids:GuestId[], segment:Ep05Segment, round:number, mode:string):Ep05Line[] {
 const script=ep05PairScript(ids); if(!script)return [];
 const source=script.segments[segment]; const rows=[...source];
 if(segment==="after"&&script.code==="JY"&&mode==="A")rows.splice(0,0,S("【两人视线重新落回彼此身上，中间短暂停了一下。】"));
 if(segment==="after"&&script.code==="JH"&&mode==="B")rows.splice(0,0,S("【笑声停下来后，两个人一时都不知道该接什么。】"));
 if(segment==="after"&&script.code==="MH"&&mode==="D")rows.push(S("【两人同时看向桌上的任务卡，又默契地把话题放了过去。】"));
 return rows.map((row,index)=>({...row,id:`D05-R${round}-${script.code}-${segment}-${index}`}));
}
export function ep05Outcome(ids:GuestId[]):string { return ep05PairScript(ids)?.outcome??""; }
export function ep05ClipIds(ids:GuestId[],round:number):Record<Ep05Segment,string> {
 const script=ep05PairScript(ids); if(!script)return {ready:"",eye:"",after:""};
 const legacy=round===1?({GC:{ready:"D05-GC-READY",eye:"D05-GC-EYE",after:"D05-GC-AFTER"},JY:{ready:"D05-JY-READY",eye:"D05-JY-EYE",after:"D05-JY-AFTER"},JH:{ready:"D05-JH-READY",eye:"D05-JH-EYE",after:"D05-JH-AFTER"},MH:{ready:"D05-MH-READY",eye:"D05-MH-EYE",after:"D05-MH-AFTER"},"ZZ-ZJ":{ready:"D05-ZZ-ZJ-READY",eye:"D05-ZZ-ZJ-EYE",after:"D05-ZZ-ZJ-AFTER"},"ZZ-ZZY":{ready:"D05-ZZ-ZZY-READY",eye:"D05-ZZ-ZZY-EYE",after:"D05-ZZ-ZZY-AFTER"},"ZZ-ZH":{ready:"D05-ZZ-ZH-READY",eye:"D05-ZZ-ZH-EYE",after:"D05-ZZ-ZH-AFTER"},"SXH-ZJ":{ready:"D05-SXH-ZJ-READY",eye:"D05-SXH-ZJ-EYE",after:"D05-SXH-ZJ-AFTER"},"SXH-ZZY":{ready:"D05-SXH-ZZY-READY",eye:"D05-SXH-ZZY-EYE",after:"D05-SXH-ZZY-AFTER"},"SXH-ZH":{ready:"D05-SXH-ZH-READY",eye:"D05-SXH-ZH-EYE",after:"D05-SXH-ZH-AFTER"}} as Record<string,Record<Ep05Segment,string>>)[script.code] : undefined;
 if(legacy)return legacy;
 return {ready:`D05-R${round}-${script.code}-READY`,eye:`D05-R${round}-${script.code}-EYE`,after:`D05-R${round}-${script.code}-AFTER`};
}
export const ep05BonusScripts={
 anonymousCards:[S("【请每位嘉宾写下今天最意外的一位任务搭档，以及一句理由。】"),L("ZJ","这个要给别人看吗？"),L("SXH","应该是匿名的。"),L("ZJ","那我放心了。"),L("ZH","你准备写谁？"),L("ZJ","都匿名了我还能告诉你？"),L("ZZY","那你刚刚问得挺积极。"),L("ZZX","他想知道别人写了谁。"),S("【五人分别完成卡片。卡片候选只来自今日真实任务参与记录。】")],
 replay:[S("【现在播放今天的一段对视花絮。】"),L("ZZY","怎么还带回放的？"),L("ZJ","节目组很会抓重点。"),L("SXH","我看看放哪段。"),L("ZH","不会又放你笑吧？"),L("ZJ","不要诅咒我。"),S("【屏幕播放导演实际选中的已录制任务片段。】"),L("ZZX","这角度怎么看着这么近。"),L("ZZY","本来就坐得近。"),L("ZJ","从屏幕上看真的更好笑。")],
 notes:[S("【请向今天的一位任务搭档写一句话。】"),L("ZJ","只能写一句？"),L("SXH","规则是这么说的。"),L("ZJ","那我想想。"),L("ZZY","你不会又准备写谢谢参与吧？"),L("ZJ","被你发现了。"),L("ZH","写点正常的。"),L("ZZX","我觉得谢谢参与也挺正常。"),L("SXH","那你们先写。"),S("【五人开始写纸条。正文仅对应今日实际搭档；未参与者可写给计时员或协助者。】")],
} satisfies Record<string,Row[]>;

export function ep05RowsToScript(rows:Row[],scope:string):Ep05Line[]{return rows.map((row,index)=>({...row,id:`${scope}-${index}`}));}
export function ep05RoundEventId(round:Ep05Round):string{return `ep05_eye_pair_${pairKey(round.pairIds).replace(/\|/g,"_").toLowerCase()}`;}
export function ep05Participated(rounds:Ep05Round[],guest:GuestId):boolean{return rounds.some(round=>round.pairIds.includes(guest)&&round.completionStatus==="completed");}
export function ep05ParticipationPairs(rounds:Ep05Round[],guest:GuestId):GuestId[][]{return rounds.filter(round=>round.pairIds.includes(guest)&&round.completionStatus==="completed").map(round=>round.pairIds);}
export function ep05RowAsScript(row:Ep05Line):ScriptLine{return {speaker:row.speaker,text:row.text};}
export function ep05SegmentClipText(ids:GuestId[],segment:Ep05Segment,round:number,mode:string):string[]{return ep05PairLines(ids,segment,round,mode).map(row=>row.text);}

export type Ep05EveningMainScene={id:string;time:string;location:string;camera:string;participants:GuestId[];clipId:string;rows:Ep05Line[]};
export function ep05EveningMainScenes(_rounds:Ep05Round[],classic:boolean,formalPairs:[GuestId,GuestId][]):Ep05EveningMainScene[]{
 const hasKcX=formalPairs.some(pair=>pairKey(pair)==="SXH|ZZX");
 const rows=classic&&hasKcX
  ?[S("【小屋晚饭后，苏新皓在厨房收拾餐具。】"),L("SXH","你今天后面怎么不说话了？"),L("ZZX","刚刚在想一件事。"),L("SXH","需要我听吗？"),L("ZZX","嗯……我在想你今天那句‘先看规则’，其实你一直都这样。"),L("SXH","这样不好？"),L("ZZX","不是，我想说我知道你是在认真做事。"),L("SXH","那就好。"),L("ZZX","有时候我还没想明白，但我会试着告诉你我在想。"),L("SXH","行，我听着。"),S("【朱志鑫第一次主动说出自己正在想什么。】")]
  :[S("【小屋晚饭后，五个人回顾白天的任务。】"),L("ZZX","刚才规则读得挺快。"),L("SXH","怕大家误会。"),L("ZZX","确实有用。"),S("【两人把话题留在当天任务，没有调用未确认的旧关系经历。】")];
 return [{id:"D05-KC-ATTEMPT-EXPLANATION",time:"20:00",location:"厨房",camera:"CAM 02",participants:["ZZX","SXH"],clipId:"D05-KC-ATTEMPT-EXPLANATION",rows:ep05RowsToScript(rows,"D05-KC-ATTEMPT-EXPLANATION")}];
}
