import type { GuestId, ScriptLine } from "./day1-data";

export const seasonEpisodes = [
  { episode: 4, title: "写给X的信", activity: "匿名介绍信", decision: "安排介绍信阅读顺序", venue: "客厅", focus: "熟悉与克制" },
  { episode: 5, title: "你在看谁", activity: "30秒对视任务", decision: "指定对视搭档", venue: "庭院", focus: "眼神与回应" },
  { episode: 6, title: "第二次选择", activity: "自由约会", decision: "安排两组约会和留守嘉宾", venue: "唱片店", focus: "先问再帮忙" },
  { episode: 7, title: "关于你，我还不知道", activity: "五人音乐合作", decision: "分配表演合作", venue: "练习室", focus: "听见彼此的想法" },
  { episode: 8, title: "过去留下的东西", activity: "X Room与匿名互选", decision: "安排进入顺序与互选公布方式", venue: "X Room", focus: "物件保留沉默" },
  { episode: 9, title: "没说出口的话", activity: "旅行、礼物、最后约会与真心话", decision: "安排旅行分组与礼物规则", venue: "旅行民宿", focus: "可以暂停，也可以拒答" },
  { episode: 10, title: "这次换我走向你", activity: "X公开、关系对谈与终选", decision: "确认最终剪辑与播出", venue: "终选现场", focus: "让选择由本人完成" },
] as const;

const photoSource = [
  { photoId:"gc-korea-childhood",cpId:"gunchan",assetPath:"./assets/ep08-kc/zz-korea-childhood.jpg",description:"童年韩国冬日照片",observedContent:"小时候一起去韩国的冬日照片；不补写具体城市和年月。",narrativeRole:"童年共同成长",unlockEpisode:8,relationshipModeConditions:["A","B","C","D","E"] },
  { photoId:"gc-sports-2024",cpId:"gunchan",assetPath:"./assets/ep08-kc/zz-sports-2024.jpg",description:"2024蓝绿运动会",observedContent:"2024年运动会台上较劲、台下沉默的个人回忆。",narrativeRole:"共同活动中的分歧与回避",unlockEpisode:8,relationshipModeConditions:["A","B","C","D","E"] },
  { photoId:"gc-birthday-art",cpId:"gunchan",assetPath:"./assets/ep08-kc/zz-birthday-art.jpg",description:"生日画作",observedContent:"朱志鑫回忆一直挂在卧室里的生日画；不推断作者身份。",narrativeRole:"被认真看待的记忆",unlockEpisode:8,relationshipModeConditions:["A","B","C","D","E"] },
  { photoId:"jh-01",cpId:"jihang",assetPath:"./assets/cp-photos/jihang/01-amusement.jpg",description:"游乐设施双人画面",observedContent:"两人在游乐设施旁同框。",narrativeRole:"共同体验与熟悉玩笑",unlockEpisode:6,relationshipModeConditions:["A","B","C","D","E"] },
  { photoId:"jh-02",cpId:"jihang",assetPath:"./assets/cp-photos/jihang/02-trainee-record.jpg",description:"练习生记录表",observedContent:"一张带手写信息的练习生记录表；字迹不清处不作推断。",narrativeRole:"共同成长线索",unlockEpisode:8,zoom:true,relationshipModeConditions:["A","B","C","D","E"] },
  { photoId:"jh-03",cpId:"jihang",assetPath:"./assets/cp-photos/jihang/03-timeline.jpg",description:"不同时期的互动拼图",observedContent:"不同时期互动的拼图。",narrativeRole:"共同成长时间线；仅模式B可在EP13联系正式旧X",unlockEpisode:8,relationshipModeConditions:["A","B","C","D","E"] },
  { photoId:"jy-01",cpId:"jiyu",assetPath:"./assets/cp-photos/jiyu/01-flight.jpg",description:"飞机座位同框",observedContent:"飞机座位上的同框画面。",narrativeRole:"同行与共同成长；模式A可衔接旧X回忆",unlockEpisode:8,relationshipModeConditions:["A","B","C","D","E"] },
  { photoId:"jy-02",cpId:"jiyu",assetPath:"./assets/cp-photos/jiyu/02-stage.jpg",description:"舞台近距离互动",observedContent:"舞台上的近距离互动。",narrativeRole:"音乐合作回忆",unlockEpisode:7,relationshipModeConditions:["A","B","C","D","E"] },
  { photoId:"jy-03",cpId:"jiyu",assetPath:"./assets/cp-photos/jiyu/03-selfie.jpg",description:"双人自拍",observedContent:"双人自拍画面。",narrativeRole:"共同成长回忆；模式A可在公开后联系旧X",unlockEpisode:8,relationshipModeConditions:["A","B","C","D","E"] },
  { photoId:"mh-01",cpId:"manghou",assetPath:"./assets/cp-photos/manghou/01-archery.jpg",description:"射箭活动画面",observedContent:"射箭活动中的双人画面。",narrativeRole:"默契任务与共同活动记忆",unlockEpisode:5,relationshipModeConditions:["A","B","C","D","E"] },
  { photoId:"mh-02",cpId:"manghou",assetPath:"./assets/cp-photos/manghou/02-stage.jpg",description:"红色舞台同框",observedContent:"红色舞台上的同框画面。",narrativeRole:"音乐合作与舞台回忆",unlockEpisode:7,relationshipModeConditions:["A","B","C","D","E"] },
  { photoId:"mh-03",cpId:"manghou",assetPath:"./assets/cp-photos/manghou/03-rackets.jpg",description:"双人球拍运动",observedContent:"双人球拍运动合照。",narrativeRole:"活动记忆与季终回顾",unlockEpisode:6,relationshipModeConditions:["A","B","C","D","E"] },
] as const;
export const cpPhotos=photoSource.map(photo=>({...photo,unlockConditions:{episode:photo.unlockEpisode,relationshipMode:photo.relationshipModeConditions},viewed:false,recorded:false,aired:false,linkedScenes:[`EP${String(photo.unlockEpisode).padStart(2,"0")}-XROOM`,`EP${String(Math.min(10,photo.unlockEpisode+5)).padStart(2,"0")}-RECALL`]}));

export const canonicalUnsentLetter = `苏新皓：\n这封信写了很多次，又删掉了很多次。\n其实我也不知道该从哪里说起。\n以前你总问我是不是不开心，我每次都说没有。后来想想，你应该也挺累的吧。明明是两个人的事，却总让你一个人猜。\n我不是不想告诉你。\n\n有时候我会把一句本来可以说清楚的话吞回去，觉得等自己想明白就好了。可我忘了，你也在等一个答案。\n\n以前我们可以为了谁先拿蛋糕笑半天，也能为了一个根本不重要的比赛较劲。后来我把那些小事都留着，却偏偏没把最该说的话讲出来。\n\n我不想让你替我猜，也不想你因为担心我就把自己弄得很累。如果以后还能一起走，我想先学会把话说完整，哪怕说得慢一点。你不用急着给答案，我也不能拿沉默当答案。\n\n这封信当时没有寄出去。现在我想亲手给你。`;
const sl=(speaker:GuestId,text:string):ScriptLine=>({speaker,text});
const ss=(text:string):ScriptLine=>({speaker:"STAGE",text});
export const kcRevealCardsV165:{id:"A"|"B"|"C"|"D";title:string;items:string;assets:(string|null)[];rows:ScriptLine[]}[]=[
 {id:"A",title:"小时候还不会装酷",items:"韩国旧照＋《回答》初中拍立得",assets:["./assets/ep08-kc/zz-korea-childhood.jpg","./assets/ep08-kc/sx-junior-polaroid.jpg"],rows:[ss("【两张少年时期的画面左右并排，一张是韩国冬日外套照，一张是初中演出拍立得。】"),sl("SXH","你当时那个帽子真的好傻。"),sl("ZZX","你先看看自己的表情。"),sl("SXH","我们那时候演《回答》，你还演那个小哑巴。"),sl("ZZX","然后还要参加唱歌比赛。"),sl("SXH","现在说出来还是好好笑。"),sl("ZZX","那时候好像什么都敢试。"),sl("SXH","嗯，觉得两个人一起就能搞定。"),ss("【两人对着照片同时笑起来，镜头停留在过去与当下的对照。】")]},
 {id:"B",title:"像你",items:"小白玩偶＋Jellycat猪玩偶",assets:["./assets/ep08-kc/zz-shiro.jpg","./assets/ep08-kc/sx-pig-plush.jpg"],rows:[ss("【左侧小白，右侧小猪。】"),sl("ZZX","等会儿，你真的拿猪当我？"),sl("SXH","它可爱啊。"),sl("SXH","那你呢，为什么留个小白？"),sl("ZZX","因为像你。"),sl("SXH","哪里像？"),sl("ZZX","你现在问我的样子就挺像。"),sl("SXH","那我们是不是应该把两个放一块儿？"),sl("ZZX","别，放一块儿你又要说那个猪比较可爱。"),sl("SXH","本来就很可爱。"),ss("【两个玩偶被摆到画面中间，彼此朝向。】")]},
 {id:"C",title:"你随口给的，我认真留着",items:"生日画＋软糖＋第一块蛋糕＋盲盒",assets:["./assets/ep08-kc/zz-birthday-art.jpg",null,"./assets/ep08-kc/sx-anniversary-cake.jpg","./assets/ep08-kc/zz-blindbox.png"],rows:[ss("【照片依次切换到画框、白桃糖盒、纪念日蛋糕和一整套未拆完的盲盒。】"),sl("SXH","原来那幅画你一直挂着。我还以为你收起来了。"),sl("ZZX","挂着啊。你改了那么久才画好的。"),sl("ZZX","那个糖盒你也留着？"),sl("SXH","糖早吃完了。盒子又不舍得扔。"),sl("ZZX","我当时说附赠一盒，你还笑我。"),sl("SXH","谁让你说得像在推销。"),sl("ZZX","那块蛋糕不算推销吧？"),sl("SXH","不算。你还记得第二天是我生日。"),sl("ZZX","那我送的不是蛋糕，是第一块。"),sl("SXH","盲盒也是，你明明可以一次拆完。"),sl("ZZX","所以才要留着，明年还有一个。"),ss("【卡片结尾不额外重复问答，两人同时看着画面轻笑收束。】")]},
 {id:"D",title:"别扭的人也会做小事",items:"蓝绿运动会＋水券＋泼水摸头＋煎蛋",assets:["./assets/ep08-kc/zz-sports-2024.jpg","./assets/ep08-kc/zz-water-voucher.jpg","./assets/ep08-kc/sx-water-game-headpat.jpg","./assets/ep08-kc/sx-fried-egg.jpg"],rows:[ss("【2024运动会蓝绿照与泼水摸头照前后出现。】"),sl("ZZX","那天眼罩一戴，你是真的一点也不让我。"),sl("SXH","你也没让我啊。下台又隔着老远。"),sl("ZZX","我那时候就怕再说一句又吵起来。"),sl("SXH","可后来你又会做别的事。泼水游戏那个摸头，我当时都没反应过来。"),sl("ZZX","你那时候头发湿得乱七八糟。"),sl("SXH","那十个闹钟的煎蛋呢？"),sl("ZZX","你不是说八点想吃？"),sl("SXH","我开玩笑的。"),sl("ZZX","我也知道。就是想试试看我能不能起。"),sl("SXH","你能。就是第二天又睡过头了。"),sl("ZZX","那张水券也一样。你说请我一天水钱，我到现在都不舍得兑。"),sl("SXH","这次不用兑券。以后要喝什么你直接说。"),sl("ZZX","我会说。"),ss("【结束，不在这里抢先宣布最终选择。】")]},
];
export const kcPrivateLetterRowsV165:ScriptLine[]=[ss("【朱志鑫读出EP10封存文件中的私人信件全文。】"),sl("ZZX",canonicalUnsentLetter),ss("【苏新皓听完，先低头看一眼纸，又抬头。】"),sl("SXH","你知道我为什么留下那个煎蛋的照片吗？"),sl("ZZX","因为我那天起得特别早？"),sl("SXH","不只是。是我随口说的一句话，你真的当了真。"),sl("ZZX","所以以后重要的话，我也应该当真。")];
export const kcRepairRowsV165:ScriptLine[]=[sl("SXH","我们都要。"),sl("ZZX","要是再吵架，先停一下，约好什么时候继续，不要直接走。"),sl("SXH","我会先问你想让我听还是想让我帮忙。"),sl("ZZX","我也会把‘没事’换成真正想说的。"),sl("SXH","这次是两个都要做到。"),ss("【两人没有立刻拥抱，留下实际最终选择的空间。】")];
export const xRoomProps = [{id:"private-letter-ep10",title:"未寄出的信·EP10全文",image:"./assets/props/unsent-letter.png",body:canonicalUnsentLetter,episode:10,cp:"gunchan"}] as const;

const l=(speaker:GuestId,text:string,mood?:string):ScriptLine=>({speaker,text,mood});
const S=(text:string):ScriptLine=>({speaker:"STAGE",text});
export function seasonSceneLines(episode:number,pair:GuestId[],mode:string,choice:string,formalExPairs?:GuestId[][]):ScriptLine[]{
 if(!Number.isInteger(episode)||episode<4||episode>10)return [S("该期属于旧版14集时间线，已封存；当前第一季只播放EP01—EP10。")];
 const a=pair[0]??"ZZX",b=pair[1]??"SXH";
 const pairKey=(x:string,y:string)=>[x,y].sort().join("-");
 const castNames:Record<GuestId,string>={ZZX:"朱志鑫",SXH:"苏新皓",ZJ:"张极",ZZY:"张泽禹",ZH:"左航"};
  const official:GuestId[][]=formalExPairs!==undefined?formalExPairs:(mode==="A"||mode==="E"?[["ZZX","SXH"],["ZJ","ZZY"]]:mode==="B"?[["ZZX","SXH"],["ZJ","ZH"]]:mode==="D"?[["ZZX","SXH"],["ZZY","ZH"]]:[["ZZX","SXH"]]);
 const isOfficialPair=official.some(([x,y])=>[x,y].sort().join("-")===[a,b].sort().join("-"));
 const hasKcHistory=official.some(([x,y])=>[x,y].sort().join("-")==="SXH-ZZX");
 if(episode===9){
  const selected=pair.map(id=>castNames[id]).join("和"),isMhSunrise=pairKey(a,b)==="ZH-ZZY"&&isOfficialPair;
  const gift=choice.includes("匿名赠送")?"匿名赠送":choice.includes("随机交换")?"随机交换":"关键词匹配";
  const refused=choice.includes("礼貌拒绝");
  return [S(`清晨，导演把旅行分成两个错峰小组：${selected}先出发，另外三位随后走另一条路线。集合时间分开，所有人只出现在自己实际参加的机位。`),l(a,"先把外套拿上吧，山上风可能大。"),l(b,"我带了。你自己那件呢？"),l(a,"在包里，刚刚差点忘了。"),S("两组按各自路线抵达观景点；镜头只记录实际同行成员。"),...(isMhSunrise?[S("【实际同组且此前有共同日出伏笔。】"),l("ZH","2023年说过想一起看日出，后来青岛那次还是没赶上。"),l("ZZY","我记得。那次天亮得比我们快。"),l("ZH","这次至少赶上了。"),l("ZZY","嗯，先看一会儿，不急着说别的。")]:[S("【本次分组不包含左航与张泽禹，节目不插入他们的日出旧事。】"),l(a,"天亮得挺快。"),l(b,"再站一会儿吧，等光线出来。")]),S(`中午的礼物交换采用「${gift}」。礼物根据本轮规则交接，不凭礼物反推X关系。`),l("ZJ","我拿到的是一张‘留给下次’的卡。"),l("ZZY","你先别急着解释，等会儿还要约会呢。"),l("ZJ","我没说要解释。"),S("下午每位嘉宾可提出最后一次自由约会邀约；对方可以接受或拒绝。未同意者进入单人活动，镜头不制造重叠行程。"),l(a,"我想邀请你出去走走，你愿意吗？"),l(b,refused?"谢谢你问我，但我今天想自己待一会儿。":"可以。我们先说好，想结束的时候直接告诉对方。"),...(refused?[l(a,"好，谢谢你直接告诉我。那我去附近转转。")]:[S("双方确认自愿同行后出发，其余嘉宾各自完成安排。")]),S("晚间真心话可以暂停或拒答。"),...(hasKcHistory?[l("ZZX","以前我一难受就说没事，自己也没想清楚。"),l("SXH","我以前听到没事就急着解决。以后我先问你想让我听，还是一起想办法。"),l("ZZX","如果我需要时间，会告诉你什么时候回来继续聊。"),l("SXH","好，我也会记得回来。"),S("两人谈清楚下一步沟通方式，尚未在本期直接复合。")]:[l(a,"今天有些话说出来，比一直猜轻松。"),l(b,"不一定马上要有答案。愿意讲，我就先听。")])];
 }
 if(episode===10){
  const publicPairs=official.map(pair=>pair.map(id=>castNames[id]).join("×")).join("；")||"本季没有正式X";
  const kcReveal=hasKcHistory?[S("【上午正式公开后，导演进入双柜对照。两间回忆室曾经彼此独立；接下来由导演选择两张主题卡，让两人第一次一起看这些物件。】")]:[S("有正式X的嘉宾按本局固定映射自愿进行对谈；没有X的人只回顾个人经历，不补写不存在的前任。")];
  return [S("上午，节目组公开本局真实正式X映射。映射直接读取开局存档，不因互选、短信或人气改变。"),S(`本局正式X：${publicPairs}`),...kcReveal,S("五位嘉宾将分别完成最终单人采访；任何问题都可以跳过。傍晚再独立提交最终选择。"),l("ZZX","我想把最后的选择留到傍晚，再亲口说。"),l("SXH","好，这次我们都把话说完整。"),S("导演没有提前代替任何人提交选择。")];
 }
 if(episode===4)return [S("傍晚，五只未署名信封摆在餐桌上。节目组说明：有正式X的嘉宾会收到X写给自己的介绍信；没有正式X的嘉宾将阅读节目组制作的个人介绍卡。每份材料的作者信息均封存。")];
 if(episode===5)return [S("庭院里摆好两把椅子，计时器设为30秒。导演安排搭档面对面坐下。"),l(a,"开始了吗？"),l(b,"开始了。"),S("计时器亮起。两个人先看着对方，随后有人移开视线，又重新看回来。"),l(a,choice==="ask"?"你不舒服的话可以说。":"我在想要不要先笑一下。"),l(b,choice==="ask"?"我可以继续。":"那你先别笑。"),S("30秒结束，现场没有人替他们解释那个眼神。"),l(a,"刚才那半分钟，你觉得哪里最难？"),l(b,choice==="ask"?"你先问我能不能继续，这样我就不用猜。":"一开始有点不习惯，后面就没那么紧张了。"),l(a,"我刚才也在猜你是不是想结束。"),l(b,"下次可以直接问我，我会告诉你。"),S("两个人把任务中的感受说清楚，导演没有替他们定义那个眼神。"),l(a,"那我记住了，先问你。"),l(b,"好。下次换我问你。")];
 if(episode===6){const where=choice||"唱片店";const common=[S(`导演公布约会分组：${pair.map(id=>castNames[id]).join("和")}前往${where}，其余嘉宾留在小屋。`)];const finish=[l(a,"刚才那句话我还想补充一点。"),l(b,"好，你慢慢说，我先听完。"),S("两个人确认接下来的安排，再并肩走向集合点。")];if(isOfficialPair&&pairKey(a,b)==="SXH-ZZX")return [...common,l("SXH","你要帮忙之前可以先问我。"),l("ZZX","我可以帮你吗？"),l("SXH","可以。"),l("ZZX","那我拿这边。"),S("两个人边整理物品边决定约会路线，没有急着给关系下结论。"),...finish];if(isOfficialPair&&pairKey(a,b)==="ZJ-ZZY")return [...common,l("ZJ","你还记得我们以前走过的机场吗？"),l("ZZY","记得。一起走过很久，不代表所有答案都不用重新问。"),l("ZJ","那我现在问你，想先去哪儿？"),l("ZZY",`先去${where}看看。`),S("他们聊到共同成长，也把今天的选择留给现在的彼此。"),...finish];if(isOfficialPair&&pairKey(a,b)==="ZH-ZJ")return [...common,l("ZJ","航酱，你想先看哪边？"),l("ZH","先看你刚才说的那排。"),l("ZJ","我以为你会说随便。"),l("ZH","今天我想把话说清楚一点。"),l("ZJ","那我也认真听。"),...finish];if(isOfficialPair&&pairKey(a,b)==="ZH-ZZY")return [...common,l("ZZY","你上次说想一起看日出。"),l("ZH","我没想到你还记得。"),l("ZZY","记得不等于替你决定。今天去哪儿你来选。"),l("ZH",`那就去${where}。`),S("两人保留了自己的节奏，也确认今天的安排出自彼此同意。"),...finish];return [...common,l(a,`我们先去${where}，你想从哪边开始？`),l(b,"先看看再决定吧。"),l(a,"好，走慢一点。"),l(b,"这边光线挺好，等下可以坐下来聊。"),S("两人并肩走进约会地点。有人停下来观察环境，有人把饮料放到桌边。"),l(a,"我可以帮你拿吗？"),l(b,"可以。谢谢你先问。"),S("镜头记录下这次询问，没有把普通照顾剪成关系结论。"),...finish];}
 if(episode===7)return [S("五个人围着练习室的桌子分配音乐段落。导演把编排权交给实际负责的嘉宾。"),l(a,"我想到一种节奏处理，可以先把副歌留空一拍。"),l(b,"我跟一遍看看。"),l(a,"如果不合适，我们就换回原来的。"),l(b,"先试过再决定。"),S("伴奏重新开始。第一遍有人抢了半拍，第二遍五个人把呼吸对齐。"),l("ZZY","刚才那版层次清楚很多。"),l("ZH","因为中间那一拍留出来了。"),l("SXH","再来一次，这次从头接。"),S("导演收录了练习前后两个版本，最终剪辑由玩家决定。")];
 if(episode===8)return [S("V16.5双柜回忆室：朱志鑫与苏新皓分别进入独立房间，逐件点击十二件真实道具与照片。对话、回忆与后采由对应物件独立触发；正式X仍未公开。"),S("每件物品首次点击会录制独立镜头；再次打开只回看，不重复结算。回忆室依照存档关系模式显示兼容内容。")];
 return [S(`EP.${String(episode).padStart(2,"0")} · ${seasonEpisodes.find(x=>x.episode===episode)?.title??"小屋日常"}`),l(a,"我们先把今天的安排理一下。"),l(b,"好，先做眼前的事。"),S("五个人分工准备活动，节目组记录下具体过程与临场反应。"),l(a,"刚刚那一段你觉得怎么样？"),l(b,"我想想再回答。"),l(a,"可以，不着急。"),S(`本期导演观察重点：${seasonEpisodes.find(x=>x.episode===episode)?.focus??"共同生活"}。`),l("ZZX","晚一点我们再聊。"),l("SXH","好，我会等你说完。")];
}

export function modeAwareMemory(cpId:string,mode:string,formal:boolean,episode:number){
 if(cpId==="gunchan")return "节目虚构的共同生活与回忆线索。正式X信息仅在EP10公开。";
 if(episode<10)return "节目组尚未公开人物关系。当前只能按画面中可观察到的共同活动与熟悉程度理解。";
 if(formal)return `模式${mode}中这组是正式X关系；该照片用于回顾已发生的共同经历。`;
 return `模式${mode}中这组不是正式X关系。照片仅呈现共同成长、友情或当下发展，不构成旧爱证明。`;
}
