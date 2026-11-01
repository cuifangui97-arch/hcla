import type { GuestId, ScriptLine } from "./day1-data";
import { kcCabinetItems, kcBreakfastV165, kcLunchV165, kcMutualPairV165, kcFollowupByItem } from "./ep08-kc-v165";

export type Ep08Phase = "INTRO"|"ORDER"|"ROOMS"|"LUNCH"|"CHOICE_RULE"|"CHOICE_SUBMIT"|"CHOICE_RESULT"|"CHOICE_ACTIVITY"|"DINNER"|"INTERVIEW_SELECT"|"INTERVIEW"|"SMS"|"EDITING"|"BROADCAST"|"COMPLETE";
export type Ep08ChoiceMap = Record<GuestId, GuestId>;
export type Ep08Pair = [GuestId,GuestId];
export type Ep08RevealRule = "COUNT_ONLY"|"PAIRS_ONLY"|"FULL_CHOICES";
export type Ep08PhotoId = "jy-01"|"jy-02"|"jy-03"|"jh-01"|"jh-02"|"jh-03"|"mh-01"|"mh-02"|"mh-03";
export type Ep08Item = {id:string;owner:GuestId;title:string;asset:string;kind:"prop"|"photo"|"archive";cp?:string;summary:string;lines:ScriptLine[];tags:string[];masked?:boolean};
export const ep08GuestOrder:GuestId[]=["ZZX","SXH","ZJ","ZZY","ZH"];
const n:Record<GuestId,string>={ZZX:"朱志鑫",SXH:"苏新皓",ZJ:"张极",ZZY:"张泽禹",ZH:"左航"};
const line=(speaker:GuestId|"STAGE",text:string):ScriptLine=>({speaker,text});
const stage=(text:string)=>line("STAGE",text);
export const ep08BreakfastLegacy:ScriptLine[]=[
 line("ZJ","今天谁最早起来的？"),line("SXH","左航吧。我出来的时候他已经在倒水了。"),line("ZH","我只是醒得早。"),line("ZZY","醒这么早还没把早餐吃完。"),line("ZH","因为你们一直说话。"),line("ZZX","这个理由好。"),line("ZJ","怎么就开始针对我们了。"),stage("【工作人员将五张卡片放在桌边。】"),line("SXH","又有信？"),line("ZZY","昨天没有，今天补上是吧。"),line("ZZX","先看卡片。"),stage("节目组：【今天，每个人都会走进一间只属于自己的回忆室。你可以看，也可以选择略过某件物品。】"),line("ZJ","略过是什么意思？里面不会有什么我都忘了的东西吧。"),line("ZH","那你进去就知道了。"),line("ZJ","我现在有点紧张了。"),line("ZZX","你刚刚不是还挺期待？"),line("ZJ","期待和紧张又不冲突。"),stage("【五人分别拿走卡片。】")
];
export const ep08Breakfast:ScriptLine[]=kcBreakfastV165;
export const ep08RoomInstructions:ScriptLine[]=[stage("节目组：“这是单独进入的环节。房间里的物品不要求你一件件解释，如果想停下来，就告诉我们。”"),line("ZZY","那我们出来能互相说吗？"),stage("节目组：“可以说自己的感受，但请保留正式X身份的悬念。”"),line("SXH","明白了。")];
export const ep08Lunch:ScriptLine[]=kcLunchV165;
export const ep08ChoiceIntro:ScriptLine[]=[stage("节目组广播：【下午每位嘉宾将秘密选择一位最希望共同完成任务的人。每人必须选择其他四人中的一人，不可选择自己。两人互选优先组成搭档；其余嘉宾将参加其他合法协作活动。】"),line("ZJ","上午回忆，下午互选，你们节目组很会安排。"),line("ZZY","至少这次不用读信。"),line("ZH","你不要说了，等会儿又让我们写信。"),line("SXH","规则上写的是先提交，不公布结果。"),line("ZZX","那就先选吧。")];
export const ep08PairDialogue:Record<string,string[]>={
 "SXH-ZZX":["SXH|先看日期吧，这张明显在后面。","ZZX|等一下，照片里的摆设不一样。","SXH|哪个？","ZZX|左边那个灯，第一张还没换。","SXH|哦，那你排。我核对文字。","ZZX|行。你别趁我排的时候偷改。","SXH|我什么时候偷改过？","ZZX|以前……做任务的时候。","SXH|今天我不改。"],
 "ZJ-ZZY":["ZJ|这张我记得比另一张早。","ZZY|你记反了吧？那时候还没换衣服。","ZJ|你确定？","ZZY|不确定就再看一次。","ZJ|行，我听你的。不过错了你背锅。","ZZY|想得挺好。"],
 "ZH-ZJ":["ZJ|航酱，我觉得这张排第一。","ZH|你理由呢？","ZJ|感觉。","ZH|那我也凭感觉排第三。","ZJ|你不能这样。","ZH|你先开始的。","ZJ|……行，咱们看背面的时间。"],
 "ZH-ZZY":["ZZY|你先排还是我先排？","ZH|你先，我来找哪里不对。","ZZY|你准备专门挑错啊？","ZH|也不是，免得我们俩都漏看。","ZZY|那正好，我容易看太快。","ZH|这张背面还有字。","ZZY|真有。放中间。"],
 "ZZX-ZJ":["ZJ|我赌这张最早。","ZZX|赌什么？","ZJ|赌一杯饮料。","ZZX|那我先看清楚再答应。","ZJ|你这也太谨慎。","ZZX|不然怎么赢你。"],
 "ZZX-ZZY":["ZZY|先分一下这三张。","ZZX|我觉得中间这张反而最晚。","ZZY|为什么？","ZZX|后面那个装饰多了一个。","ZZY|你观察这个挺快。","ZZX|刚好看见。"],
 "ZZX-ZH":["ZH|你先放吧。","ZZX|你有想法？","ZH|有一点，但想再确认。","ZZX|那我等你确认。","ZH|这张在最后。","ZZX|好，咱们一致。"],
 "SXH-ZJ":["SXH|我们先把线索念一遍。","ZJ|好的苏老师。","SXH|你能不能正常点。","ZJ|我很正常啊。第一张时间最早，记下了。","SXH|……行，这次算认真。","ZJ|我一直很认真。"],
 "SXH-ZZY":["ZZY|我觉得你会先做表格。","SXH|三张卡还要做表格？","ZZY|那你准备怎么排？","SXH|先看线索，再看画面。","ZZY|行，跟我想的一样。","SXH|那你别先抢答案。"],
 "SXH-ZH":["SXH|这张怎么会放到最前面？","ZH|我还没确定。","SXH|那我们再核一遍。","ZH|可以。你看文字，我看照片。","SXH|好。等会儿一起确认。","ZH|这次应该没问题。"]
};
const photoSpecs:{id:Ep08PhotoId;owner:GuestId;title:string;asset:string;cp:string;summary:string;lines:string[]}[]=[
 {id:"jy-01",owner:"ZJ",title:"飞机座位同框",asset:"./assets/cp-photos/jiyu/01-flight.jpg",cp:"jiyu",summary:"飞机座位上的同框照片；航班号与日期仅为图片美术信息。",lines:["张极：“这张坐飞机的，旁边的人当时还嫌我太吵。”","节目组：“现在还嫌吗？”","张极：“现在我也吵啊，可能已经习惯了。”"]},
 {id:"jy-02",owner:"ZZY",title:"舞台近距离互动",asset:"./assets/cp-photos/jiyu/02-stage.jpg",cp:"jiyu",summary:"舞台上的近距离互动，呈现共同活动记忆。",lines:["张泽禹：“这个动作我记得。那天结束以后我们还说这个角度看着特别好笑。”","节目组：“你记住的是舞台还是旁边的人？”","张泽禹：“当然先记舞台。你们这个问法很容易让人误会。”"]},
 {id:"jy-03",owner:"ZZY",title:"双人自拍",asset:"./assets/cp-photos/jiyu/03-selfie.jpg",cp:"jiyu",summary:"一张旅途中的自拍，只说明照片中的共同经历。",lines:["张泽禹：“如果让我选一张旅途照片，可能还是机场那张。”","节目组：“为什么？”","张泽禹：“不是拍得多好，是看了知道那时候大家在一起。”"]},
 {id:"jh-01",owner:"ZJ",title:"游乐设施",asset:"./assets/cp-photos/jihang/01-amusement.jpg",cp:"jihang",summary:"游乐设施旁的共同活动照片。",lines:["张极：“那天不是我先喊的啊。”","节目组：“那是谁？”","张极：“这我不能说，不然人家又要拿出来笑我。”","节目组：“你还会想再玩一次吗？”","张极：“可以啊，但别让我坐最外边。”"]},
 {id:"jh-02",owner:"ZH",title:"练习生记录表",asset:"./assets/cp-photos/jihang/02-trainee-record.jpg",cp:"jihang",summary:"一张带手写信息的练习生记录表；模糊字迹不作推断。",lines:["左航：“这张纸还挺有年代感。”","节目组：“你还记得上面写了什么？”","左航：“有的记得，有的早忘了。现在看还有点不好意思。”","节目组：“我们能放大给观众看吗？”","左航：“清楚的部分可以。看不清的别帮我们脑补啊。”"]},
 {id:"jh-03",owner:"ZJ",title:"不同时期互动拼图",asset:"./assets/cp-photos/jihang/03-timeline.jpg",cp:"jihang",summary:"不同时期互动照片组成的拼图，不作为正式X凭证。",lines:["张极：“这么多张挤在一起，你们是把我俩一年拍的都翻出来了？”","节目组：“你觉得哪张最好？”","张极：“你先告诉我是不是要截图做表情包。”"]},
 {id:"mh-01",owner:"ZZY",title:"射箭活动",asset:"./assets/cp-photos/manghou/01-archery.jpg",cp:"manghou",summary:"射箭活动中的双人照片。",lines:["张泽禹：“这张拍得像我特别有把握。”","节目组：“实际呢？”","张泽禹：“实际我在想别把箭射偏。还好照片看不出来。”"]},
 {id:"mh-02",owner:"ZH",title:"红色舞台",asset:"./assets/cp-photos/manghou/02-stage.jpg",cp:"manghou",summary:"红色舞台上的同框画面，不自动证明正式恋爱史。",lines:["左航：“这张灯挺亮。”","节目组：“你想到什么？”","左航：“想到那时候排练完就想找地方坐会儿。站在台上又觉得还能再来一遍。”"]},
 {id:"mh-03",owner:"ZZY",title:"球拍运动",asset:"./assets/cp-photos/manghou/03-rackets.jpg",cp:"manghou",summary:"球拍运动中的双人照片。",lines:["张泽禹：“你们怎么把这个也找来了？”","节目组：“你们俩看着挺认真。”","张泽禹：“比赛的时候确实认真。结束以后就不一定了。”","节目组：“谁输得不服气？”","张泽禹：“这个我不说，留点面子。”"]}
];
const photoSpeakerIds:Record<string,GuestId>={"朱志鑫":"ZZX","苏新皓":"SXH","张极":"ZJ","张泽禹":"ZZY","左航":"ZH"};
export function ep08PhotoItems():Ep08Item[]{return photoSpecs.map(x=>({id:x.id,owner:x.owner,title:x.title,asset:x.asset,kind:"photo",cp:x.cp,summary:x.summary,lines:x.lines.map(s=>{const i=s.indexOf("：");const speaker=s.slice(0,i).replace(/^[【[]|[】\]]$/g,"");const text=s.slice(i+1).replace(/^“|”$/g,"");return line(photoSpeakerIds[speaker]??"STAGE",text)}),tags:["photo",x.cp,"shared-growth"]}))}
export function ep08Items():Ep08Item[]{
  const props:Ep08Item[]=kcCabinetItems.map(item=>({id:item.id,owner:item.owner,title:item.title,asset:item.asset??"",kind:"prop",cp:"gunchan",summary:item.subtitle,lines:item.lines,tags:item.tags}));
  // The twelve photos are documented shared-growth artifacts in every mode. In AI_FREE
 // they remain activity memories; only dialogue that depends on a formal X is gated below.
 const photos=ep08PhotoItems();
  const allItems=[...props,...photos.filter(item=>!item.id.startsWith("gc-"))];
  for(const owner of ep08GuestOrder)if(!allItems.some(item=>item.owner===owner))allItems.push({id:`personal-reflection-${owner}`,owner,title:`${n[owner]}的个人回忆卡`,asset:"",kind:"archive",summary:"节目组准备的个人回忆提示，不指向任何未确认关系。",tags:["personal-memory"],lines:[stage(`【节目组为${n[owner]}放入个人回忆提示卡，不指向任何未确认关系。】`),line(owner,"我先从自己记得的事情讲起，不替别人补答案。"),line("STAGE","节目组：“今天有没有一件小事想带走？”"),line(owner,owner==="SXH"?"我想把刚才看见的那一页记下来。":owner==="ZH"?"我想记得自己今天停下来看的那一眼。":"我想先想清楚，再决定要不要讲。"),line("STAGE","节目组：“可以。你随时可以停下来。”"),line(owner,"那就先把这张卡留在这里。")]});
 return allItems;
}
export function itemRoomLines(item:Ep08Item,formalExPairs:GuestId[][],mode:string):ScriptLine[]{
 const locked=kcCabinetItems.find(x=>x.id===item.id);if(locked)return locked.lines;
 const lines=[...item.lines]; const has=(a:GuestId,b:GuestId)=>formalExPairs.some(p=>p.includes(a)&&p.includes(b));
 if(item.id==="jy-01"&&has("ZJ","ZZY"))lines.push(line("ZJ","那会儿等着下飞机，我一直在看窗外。"),line("STAGE","【这段只回忆一次同行经历，不替照片定义关系。】"));
 if(item.id==="jy-03"&&has("ZJ","ZZY"))lines.push(line("ZZY","后来回头看这张照片，才发现那天我一直在笑。"));
 if(item.id==="jh-01"&&has("ZJ","ZH"))lines.push(line("ZH","那次玩完以后，我的耳朵还响了好一会儿。"));
 if(item.id==="jh-02"&&has("ZJ","ZH"))lines.push(line("ZJ","有几行字我还记得，模糊的地方就别猜了。"));
 void mode;
 return lines;
}
const itemInterviewScripts:Record<string,ScriptLine[]>={
 "jy-01":[stage("后采｜飞机同框"),line("STAGE","节目组：“这张飞机照片里没有清晰的航班记录，能确认的是什么？”"),line("ZJ","当时是一起出行。航班号和日期不用从图里猜。"),line("STAGE","节目组：“你刚才提到有人嫌你吵。”"),line("ZJ","那是我记得的玩笑，不代表每个人都一直这么想。")],
 "jy-02":[stage("后采｜舞台互动"),line("STAGE","节目组：“你提到结束后还聊了角度，记得是哪一侧吗？”"),line("ZZY","记得舞台灯打过来的方向。具体是哪一首歌我不想乱说，照片看不出来。"),line("STAGE","节目组：“你会想再拍一张吗？”"),line("ZZY","下次有机会可以，先把舞台站稳。")],
 "jy-03":[stage("后采｜双人自拍"),line("STAGE","节目组：“你说这张旅途自拍让你想到大家在一起，具体是哪件小事？”"),line("ZZY","拍完以后有人一直检查有没有闭眼。这个细节比照片构图更清楚。"),line("STAGE","节目组：“你觉得它代表关系答案吗？”"),line("ZZY","不是。它就是一张共同经历的照片。")],
 "jh-01":[stage("后采｜游乐设施"),line("STAGE","节目组：“你说不想坐最外边，是因为害怕吗？”"),line("ZJ","不是害怕，是那位置风大。你们别给我剪成尖叫合集。"),line("STAGE","节目组：“有人陪你坐了吗？”"),line("ZJ","大家都玩了，具体谁先坐不重要。")],
 "jh-02":[stage("后采｜练习生记录表"),line("STAGE","节目组：“能否放大看这张表？”"),line("ZH","能看清的地方可以。模糊的字别补出来，也别替我们猜当时的关系。"),line("STAGE","节目组：“你自己还记得什么？”"),line("ZH","记得训练时间挺长。具体写了什么，要看得清才算数。")],
 "jh-03":[stage("后采｜不同时期互动拼图"),line("STAGE","节目组：“把不同年份放在一起，会让你想到什么？”"),line("ZJ","确实认识了挺久。但每张图都只是那一天的互动。"),line("STAGE","节目组：“你想从中找一个答案吗？”"),line("ZJ","不想靠拼图替现在的人做选择。")],
 "mh-01":[stage("后采｜射箭"),line("STAGE","节目组：“你说照片看不出当时心里在想什么。”"),line("ZZY","对，我当时只想把箭射稳。照片拍得挺有气势，实际没那么从容。"),line("STAGE","节目组：“旁边的人给过建议吗？”"),line("ZZY","有聊活动本身，别的就不往上加了。")],
 "mh-02":[stage("后采｜红色舞台"),line("STAGE","节目组：“你记得这盏灯吗？”"),line("ZH","记得红色灯一亮，台下就看不清了。结束以后大家找地方坐了一会儿。"),line("STAGE","节目组：“它代表某段正式关系吗？”"),line("ZH","不能这么说，它是舞台记忆。")],
 "mh-03":[stage("后采｜球拍运动"),line("STAGE","节目组：“你们当时打得认真吗？”"),line("ZZY","比赛的时候认真，结束以后先找水喝。"),line("STAGE","节目组：“记得谁赢了吗？”"),line("ZZY","不记得比分，所以别替我宣布胜负。")]
};
export function ep08ItemInterviewRows(item:Ep08Item,formalExPairs:GuestId[][],mode:string):ScriptLine[]{
 const locked=kcCabinetItems.find(x=>x.id===item.id);if(locked)return locked.interview;
 const base=itemInterviewScripts[item.id]??[stage(`后采｜${item.title}`),line(item.owner,"我愿意讲这件物品能确认的部分。"),line("STAGE","节目组：“它能证明正式恋爱关系吗？”"),line(item.owner,"不能。它只记录当时确实发生过的共同经历。")];
 if(mode==="AI_FREE"&&item.kind==="photo")return [...base,stage("【自由导演模式：本段只讨论照片可确认的活动，不推断X身份。】")];
 return base;
}
export function ep08PairKey(pair:GuestId[]){return [...pair].sort().join("-")}
export function validateEp08ChoiceMap(value:unknown):value is Ep08ChoiceMap {
 if(!value||typeof value!=="object")return false;const row=value as Record<string,unknown>;return ep08GuestOrder.every(id=>ep08GuestOrder.includes(row[id] as GuestId)&&(row[id] as GuestId)!==id)&&Object.keys(row).length===5;
}
export function ep08MutualPairs(map:Ep08ChoiceMap):Ep08Pair[]{if(!validateEp08ChoiceMap(map))return[];return ep08GuestOrder.flatMap((a,i)=>ep08GuestOrder.slice(i+1).filter(b=>map[a]===b&&map[b]===a).map(b=>[a,b] as Ep08Pair))}
export function ep08Unmatched(map:Ep08ChoiceMap,pairs=ep08MutualPairs(map)):GuestId[]{const paired=new Set(pairs.flat());return ep08GuestOrder.filter(id=>!paired.has(id))}
export function ep08PairLines(pair:Ep08Pair,formalExPairs:GuestId[][],revealRule:Ep08RevealRule):ScriptLine[]{
 const [a,b]=pair,key=ep08PairKey(pair),stored=ep08PairDialogue[key];const rows=stored?stored.map(text=>{const i=text.indexOf("|");return line(text.slice(0,i) as GuestId,text.slice(i+1))}):[line(a,"这张卡先放在这里吧。"),line(b,"我再对一下背面的时间。"),line(a,"好，我们一起核对。")];
 if(key==="SXH-ZZX")return [...kcMutualPairV165];
 rows.push(stage("【两人把三张公共活动卡按节目提供的时间顺序排好。】"));
 if(formalExPairs.some(x=>x.includes(a)&&x.includes(b))){if(key==="SXH-ZZX")rows.push(line("ZZX","这次你怎么没先替我排？"),line("SXH","因为想听你怎么想。"),line("ZZX","那我说得挺清楚吧。"),line("SXH","嗯。"));else if(key==="ZJ-ZZY")rows.push(line("ZJ","你选我是想跟我做任务，还是觉得我不会拖后腿？"),line("ZZY","你先做完再说。"),line("ZJ","好严格。"));else if(key==="ZJ-ZH")rows.push(line("ZH","你这次还准备靠感觉？"),line("ZJ","准备先问你。"),line("ZH","不错，有进步。"));else if(key==="ZH-ZZY")rows.push(revealRule==="COUNT_ONLY"?line("ZZY","那我们现在被分到一组。") : line("ZZY","我刚才还以为你会选别的。"),line("ZH","你怎么知道我选了谁？"),line("ZZY","……也是。"));}
 rows.push(stage("【拼图完成。导演记录了两人核对线索的过程，没有把任务结果当作恋爱结论。】"));return rows;
}
export function ep08RevealLines(rule:Ep08RevealRule,count:number,pairs:Ep08Pair[]=[]):ScriptLine[]{
 if(rule==="COUNT_ONLY")return [stage(`节目组：【本轮出现${count}组双向互选。】`),line("ZJ","就一个数字？"),line("ZZY","不然呢，你还想他们现场念名字？"),line("ZH","这样倒也好。")];
 if(rule==="PAIRS_ONLY")return [stage(`节目组：【本轮产生${count}组双向互选。以下只公布任务搭档：${pairs.map(pair=>pair.map(id=>({ZZX:"朱志鑫",SXH:"苏新皓",ZJ:"张极",ZZY:"张泽禹",ZH:"左航"} as Record<GuestId,string>)[id]).join("×")).join("；")||"无"}。不公开每个人原始选择。】`),line("ZJ","行，现在至少知道等会儿和谁一组。"),line("SXH","那准备任务吧。")];
 return [stage(`节目组：【任务结束后公开五人的原始选择。本轮共有${count}组双向互选。】`),line("ZZY","任务都做完了再公开？行，那先别想了。")];
}
export function ep08ActivityLines(pairs:Ep08Pair[],formalExPairs:GuestId[][],rule:Ep08RevealRule):ScriptLine[]{
 if(pairs.length===0)return [stage("节目组：【本轮没有出现双向互选。】由节目组组织五人共同完成物品整理与线索配对。"),line("ZJ","这还能全错开？"),line("ZZY","五个人也不是没有可能。"),line("ZH","至少不用争谁先去。"),line("SXH","那任务怎么分？"),line("ZZX","那还是一起做。"),stage("【五人按提示将五张共同物件卡匹配到对应场景。】"),line("SXH","先找有明确时间的那张。"),line("ZZX","我来核对图上的位置。"),line("ZJ","我负责把卡片摆出来。"),line("ZZY","我看背面的说明。"),line("ZH","我来检查有没有放错。"),stage("【五组线索完成配对；五人共同核对后确认结果。】")];
 const rows:ScriptLine[]=[stage(`节目组：【本轮产生${pairs.length}组双向互选。】`),line("ZJ","那剩下的嘉宾呢？"),line("SXH","应该还有任务吧。")];
 if(pairs.length===1){rows.push(stage("节目组：【互选的一组完成双人记忆拼图，其余三人完成公共区域协作。】"));}
 else rows.push(stage("节目组：【两组分别完成双人记忆拼图，第五位嘉宾负责线索展示及结算。】"));
 for(const pair of pairs)rows.push(...ep08PairLines(pair,formalExPairs,rule));
 const solo=ep08UnmatchedFromPairs(pairs);if(pairs.length===1){const intros:Record<GuestId,string>={ZZX:"我来贴编号，不然等会儿分不清。",SXH:"先分工吧，一人拿卡，一人记录，一人确认。",ZJ:"三个也挺好，至少有人可以当裁判。",ZZY:"你们先说怎么分，我再动手。",ZH:"我先把桌子空出来。"};for(const id of solo)rows.push(line(id,intros[id]));rows.push(stage("【三人完成物件排序。】"),line(solo[0],"这张标签贴反了，我换一下。"),line(solo[1],"现在顺序对上了。"),line(solo[2],"那我来确认最后一遍。"),stage("【公共区域任务完成，三人共同确认线索顺序。】"));}
 if(pairs.length===2&&solo[0]){const outro:Record<GuestId,string>={ZZX:"我来计时。你们完成了再叫我。",SXH:"你们先各自检查一次，别弄混顺序。",ZJ:"行，我今天是主持人了？",ZZY:"我负责给你们看答案，但不提示。",ZH:"我拿卡。你们慢慢拼。"};rows.push(line(solo[0],outro[solo[0]]),stage("【第五位嘉宾有独立机位，完成计时与线索结算。】"));}
 return rows;
}
function ep08UnmatchedFromPairs(pairs:Ep08Pair[]){const paired=new Set(pairs.flat());return ep08GuestOrder.filter(id=>!paired.has(id))}
export const ep08Dinner:ScriptLine[]=[line("SXH","这边那盘谁还要？"),line("ZJ","我。你先别收。"),line("ZZY","你今天下午还没吃够？"),line("ZJ","动脑子很费体力。"),line("ZH","那你刚刚应该多做两题。"),line("ZJ","我今天被你们说了好多次。"),line("ZZX","谁让你每次都接。"),line("ZJ","不接话多尴尬。"),line("SXH","其实下午大家还挺快的。"),line("ZZY","比我预想的快，就是刚开始选人比较难。"),line("ZH","选完也没那么复杂。"),line("ZZX","任务做完才知道。"),stage("【镜头切向五人，晚餐继续。】")];
export const ep08Interview:Record<GuestId,string[]>={
 ZZX:["今天进房间最先看了什么？|先看见桌子。上面有几样东西，感觉像有人刚整理过。","你最后为什么停在那套盒子前？|因为它平时不放在那里。","你会把它带走吗？|本来就是我自己的东西，当然带走。","今天互选任务有意外吗？|有一点。你们出的题不难，就是选人那一下有点难。","为什么难？|每个人都挺熟了，选谁都容易被你们拿来做文章。","你现在不想被做文章？|我想先吃饭。","下午有没有一刻想退出？|没有，只是有些东西看得慢一点。","如果能带走一样东西呢？|我想先把今天看到的都记住，再决定。"],
 SXH:["看到以前准备过的礼物记录是什么感觉？|有点不好意思。感觉那时候写得太认真了。","现在会少准备一点吗？|不会。我觉得认真没什么不好。","那会换什么方式？|会先问对方喜欢什么，别总凭自己觉得。","下午选搭档你犹豫了吗？|犹豫了，毕竟每个人今天都看了很多东西。","你是想照顾谁的心情吗？|不是所有事都能照顾全，先把任务选好吧。","你觉得今天大家合作顺利吗？|顺利。有人负责看细节，有人负责把气氛放松一点。","你会记得这次任务吗？|会记得我们怎么把卡片一张张核对完。","今天有没有什么还没说完？|有，但我想等自己想清楚再说。"],
 ZJ:["你进去之前很紧张？|是啊。谁知道里面会不会放我小时候的奇怪照片。","真的看到了吗？|你们差点就放了。还好我先看了一眼。","哪张最喜欢？|我先保密，万一你们拿去做海报。","今天双人拼图表现怎样？|那得看跟谁一组。不是，我的意思是大家都挺厉害的。","你在补救吗？|对，我在努力补救。","今天有没有被哪件物品吓一跳？|没有被吓到，是突然发现时间过得挺快。","午饭最想多拿什么？|刚刚那盘我已经吃了两次。","如果明天还有任务呢？|先告诉我规则，我就不乱猜了。"],
 ZZY:["旧照片里有没有一张让你想笑？|有，那个镜头拍得太突然了。","你怎么还留着？|拍得不好也是回忆啊，不能所有照片都像宣传照。","今天匿名互选难不难？|比拼卡难。","为什么？|拼卡能找线索，选人只能问自己想怎么选。","最后后悔吗？|选都选完了，先不后悔。","今天哪一段最轻松？|午饭的时候吧，大家终于没有一直盯着物件看。","你会把自己的选择解释给别人听吗？|如果对方想听，我会讲。","现在有什么想对大家说？|先把今天过完，答案不急着一次说完。"],
 ZH:["你在房间里待得比预计久。|有几样东西太久没看，找了半天是哪一张。","最想留下哪张？|都想留。你们不会要没收吧？","节目组：“不会。”|那就好。","下午互选有什么感受？|任务挺正常，选人更难一点。","你有特别想一起做任务的人吗？|我选过了啊。你们不是收到答案了？","现在愿意公开吗？|按节目规则来。","你觉得今天大家相处得怎么样？|没有想象中那么紧张，后来就开始互相接话了。","离开回忆室时在想什么？|想先把看到的东西放一放，晚点再整理。"]
};
export function ep08InterviewRows(id:GuestId,viewed:string[]):ScriptLine[]{
 if(id==="ZZX"||id==="SXH"){
  const choices=id==="ZZX"?["ZZ_WATER_VOUCHER","ZZ_BIRTHDAY_ART","ZZ_SPORTS_2024","ZZ_KOREA_CHILDHOOD","ZZ_BLINDBOX","ZZ_SHIRO"]:["SX_PEACH_CANDY","SX_BIRTHDAY_CAKE","SX_PIG_PLUSH","SX_FRIED_EGG","SX_WATER_GAME","SX_POLAROID"];
  const selected=choices.find(itemId=>viewed.includes(itemId));
  const intro=id==="ZZX"?[stage("节目组：“你今天最意外的是自己记得什么？”"),line(id,"记得的不是大事。是有些东西被放在那儿好多年，我以为自己早忘了。")]:[stage("节目组：“这间房让你最意外的是什么？”"),line(id,"有些我以为随手就过去了的事，居然还能想得那么清楚。")];
  return [...intro,...(selected?kcFollowupByItem[selected]??[]:[])];
 }
 const rows=ep08Interview[id].map(entry=>{const [q,a]=entry.split("|");return [line("STAGE",`节目组：“${q}”`),line(id,a??"")] }).flat();
 return rows;
}
export function ep08LegacyProgress(state:Record<string,unknown>):boolean{
 if(state.v16EpisodeVersion==="16.2"||state.v16EpisodeVersion==="16.5")return false;
 const legacyStage=String(state.phase??"");return Boolean((state.line??0)!==0||!["","story","intro"].includes(legacyStage)||state.sent||state.broadcastId||(Array.isArray(state.recorded)&&state.recorded.length>0)||(Array.isArray(state.clips)&&state.clips.length>0)||state.roomViewedItemIds||state.choiceMap);
}
export function ep08PublicPostSeed(clipId:string,platform:string,summary:string){
 const v165:Record<string,{weibo:string;forum:string;threads:string}>={
  ZZ_WATER_VOUCHER:{weibo:"一张请一天水钱的生日券，谁想出来的啊哈哈哈哈",forum:"2024运动会的喝水玩笑在2025生日又被接住，这个时间线很有意思；送券的人节目仍未公开。",threads:"一天水钱券我申请批发。"},
  ZZ_BLINDBOX:{weibo:"一整套每年拆一个，我先替未拆盒紧张",forum:"这是被长期保存的物件，不等于观众已知道赠送者身份。节目只说一整套、每年拆一个。",threads:"拆盒进度比我追剧还慢。"},
  SX_FRIED_EGG:{weibo:"十个闹钟叫醒一个煎蛋，太有画面感了",forum:"兑现一句玩笑是很具体的照顾，但它不是唯一的恋爱证据，也可以是珍惜共同成长。",threads:"我连一个闹钟都叫不醒。"},
  SX_POLAROID:{weibo:"小哑巴要参加唱歌比赛？这个设定是谁写的",forum:"舞台剧《回答》这段更像共同成长的少年回忆，别过早推断X。",threads:"小哑巴唱歌比赛这个概念好抽象。"},
  ZZ_SPORTS_2024:{weibo:"台上吵得热热闹闹，下了台反而不说话",forum:"节目展示同场互动和个人回忆；‘离婚期’是CP粉解读，不是节目认定的客观关系。",threads:"眼罩戴上吵架有规则，眼罩摘了谁都不想先说话。"},
  ZZ_BIRTHDAY_ART:{weibo:"生日画挂了好多年，这份认真被好好收着",forum:"画作被留在卧室的事实来自本人回忆；不能据此确认画作者或X身份。",threads:"画框扶正那一下，突然有点温柔。"},
  ZZ_KOREA_CHILDHOOD:{weibo:"小时候的冬日照也太可爱了",forum:"两人童年出游的叙述是个人回忆，不宜套用分手后疗伤等剧情。",threads:"小帽子歪着还要装酷，笑死。"},
  ZZ_SHIRO:{weibo:"小白：我好像知道你在说谁，但我不说",forum:"玩偶相似感是当事人的私人比喻，正片没有直接公开对象姓名。",threads:"小白今天也被迫营业。"},
  SX_PEACH_CANDY:{weibo:"冰箱贴大家都有，附赠软糖偏偏记了这么久",forum:"软糖已吃完、盒子留下的叙述有生活细节，但没有公开赠送者身份。",threads:"‘附赠一盒’说得像开VIP权益。"},
  SX_BIRTHDAY_CAKE:{weibo:"团队纪念日第一块蛋糕，明天过生日的人有点幸福",forum:"这是团队纪念日中的一块蛋糕；并非单独庆生，原图里其他人仍应保留。",threads:"第一块蛋糕先到手，好会记日子。"},
  SX_PIG_PLUSH:{weibo:"小猪玩偶被称作秘密代餐，节目组不许上热搜",forum:"受访者只说玩偶像一个人，EP08不公开对象姓名，不能写成X实锤。",threads:"小猪：怎么又是我替人出镜。"},
  SX_WATER_GAME:{weibo:"泼水游戏摸头那张，苏新皓看一次笑一次",forum:"画面可见的是游戏中的摸头瞬间；不把单个动作推成正式关系证据。",threads:"那天谁的发型都没能活下来。"}
 };
 const itemId=Object.keys(v165).find(id=>clipId.includes(id));if(itemId)return v165[itemId][platform==="forum"?"forum":platform==="threads"?"threads":"weibo"];
 if(clipId.includes("jh-02")){return platform==="weibo"?"放大可以，糊成一片的字就别自由发挥了朋友们。":platform==="forum"?"这张表能看到共同练习记忆，但看不清的笔迹不能当结论。":"刚刚放大记录表三遍，我承认我近视了，节目组能不能给高清。"}
 if(clipId.includes("mutual-result")){return platform==="weibo"?"只讨论今天互选的任务搭档，别提前替人结婚。":platform==="forum"?"今天的互选结果不等于正式X，也不等于最终短信对象。":"一张任务票闹得我像在等选秀排名。"}
 return platform==="threads"?`${summary.slice(0,100)} 我现在只想看下一段。`:platform==="forum"?`【EP08｜播出镜头记录】\n\n${summary} 目前只按实际入选的镜头讨论，不把物件或剪辑顺序当作X证明。`:`${summary} 只讨论今天正片实际播出的内容，身份信息仍按节目规则保密。`;
}
