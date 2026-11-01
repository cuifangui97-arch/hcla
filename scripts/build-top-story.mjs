import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url).pathname;
const read = async (p) => JSON.parse(await readFile(new URL(p, import.meta.url), 'utf8'));
const base = JSON.parse(await readFile(new URL('../stories/template/story.json', import.meta.url), 'utf8'));
const branches = JSON.parse(await readFile(new URL('../stories/source/branch_pack_v3.json', import.meta.url), 'utf8'));
const pack = JSON.parse(await readFile(new URL('../stories/source/sms_social_pack_v4.json', import.meta.url), 'utf8'));
const screenplay = await readFile(new URL('../stories/source/TOP_Transit_Love_Screenplay_V2_1.md', import.meta.url), 'utf8');
const cast = { ZZX:'朱志鑫', SXH:'苏新皓', ZJ:'张极', ZZY:'张泽禹', ZH:'左航' };
const topics = ['入住之前', ...Array.from({length:10},(_,i)=>pack.daysTopics[String(i+1)])];
topics[8]='过去留下的东西'; topics[9]='没说出口的话'; topics[10]='这次换我走向你';
const safeModeScene = (d,m) => branches.modeScenes.filter(x=>x.day===d&&x.mode===m);
const content = { cam:[], date:[], mission:[], heart_sms:[], edit:[], interview:[], album:[], notes:[], weibo:[], douban:[], threads:[], game_settings:[] };
const vars = { gameDay:0, gameSeed:'', recordedToday:false, missionToday:false, dateToday:false, smsToday:false, seasonStarted:false, finalChoices:false, gameMode:'', subtitles:true, sound:false, barrage:true };
const ev=[]; let seq=0; const add=(a,x)=>content[a].push(x);
const item=(id,title,body,time,extra={})=>({id,title,body,time,sender:'节目组',kind:'text',...extra});
const escHandle = s => /^[a-z][a-z0-9_]*$/.test(s);
const episodeClipEvidence = {
  2: { friendship:['D02-001','D02-002','D02-004B','D02-005-客厅'], romance:['D02-004','D02-005-阳台'], conflict:['D02-002','D02-005-厨房','D02-008'], ensemble:['D02-006','D02-007'] },
  3: { friendship:['D03-005'], romance:['D03-003','D03-004'], conflict:['D03-003','D03-004','D03-007'], ensemble:['D03-003','D03-004','D03-006'] },
};
const extractDay = d => { const re=new RegExp(`### D${d}｜[\\s\\S]*?(?=\\n### |$)`); return screenplay.match(re)?.[0]||''; };
for(let d=0;d<=10;d++){
  const src=extractDay(d), sceneIds=[...src.matchAll(/\*\*\[(D\d+-S\d+[^\]]*)\]\*\*/g)].map(x=>x[1]);
  if(d>=4){const evidence=sceneIds.map(id=>`scene-${id.replace(/[^A-Za-z0-9-]/g,'-')}`);episodeClipEvidence[d]={friendship:evidence,romance:evidence,conflict:evidence,ensemble:evidence};}
  add('cam',item(`cam-day-${d}`,`D${d} · ${topics[d]}`,`节目组拍摄排期：${topics[d]}。监看画面只显示授权的公共区域和当前已开放场景。`,`${String(8+d).padStart(2,'0')}:30`,{folder:`D${d}`,meta:{day:String(d),sceneIds:sceneIds.join(' · '),kind:'episode'}}));
  const marks=[...src.matchAll(/\*\*\[(D\d+-S\d+[^\]]*)\]\*\*/g)];
  for(let si=0;si<marks.length;si++){
    const m=marks[si],start=m.index+m[0].length,end=si+1<marks.length?marks[si+1].index:src.length;
    const head=m[1],raw=src.slice(start,end).replace(/^\s*[|｜]?[\s\S]*?(?=\S)/,'').trim();
    const protectedScene=/X见面室|X Room|记忆房|三人记忆房|关系揭晓/.test(head+' '+raw.slice(0,120));
    const loc=head.split(/[｜|]/).slice(2,3).join('').replace(/^\d{2}:\d{2}/,'').trim()||'公共区域';
    add('cam',item(`scene-${head.replace(/[^A-Za-z0-9-]/g,'-')}`,head,raw||topics[d],head.match(/\d{2}:\d{2}/)?.[0]||`${String(10+si).padStart(2,'0')}:00`,{folder:`D${d}`,...(protectedScene?{unlock:'revealedD10'}:{}),meta:{day:String(d),sceneId:head,kind:'scene',location:loc,sceneIndex:String(si),restricted:protectedScene?'true':'false'}}));
  }
  add('mission',item(`mission-day-${d}`,`D${d} 导演任务卡`,d===0?'完成入住前采访资料归档，并确认公开机位与授权边界。':`制作主题：${topics[d]}。选择一项公共区域任务，确认嘉宾自愿参与后发布。`,`${String(9+d).padStart(2,'0')}:00`,{folder:`D${d}`,meta:{day:String(d),status:'待发布'}}));
  add('notes',item(`notes-day-${d}`,`D${d} · ${topics[d]}`,`今日可观察事项：${topics[d]}。只记录实际拍摄且已授权的公共区域行为；未播素材不会出现在观众App。`,`${String(8+d).padStart(2,'0')}:05`,{folder:`D${d}`}));
  add('interview',item(`interview-day-${d}`,`D${d} 后采排期`,`问题建议：今天有没有一刻让你想起过去？\n拍摄须取得当事人同意；未播回答仅归档，不进入公开社区。`,`${String(18+d%4).padStart(2,'0')}:00`,{folder:`D${d}`}));
  add('album',item(`album-day-${d}`,`D${d} 场记缩略图 · ${topics[d]}`,`现场图像占位为节目组原创插画卡片，不使用真实人物影像。镜头主题：${topics[d]}。`,`${String(12+d%5).padStart(2,'0')}:00`,{folder:`D${d}`,meta:{scene:'原创示意图',mood:['晨光','室内暖灯','海边薄雾'][d%3]}}));
  if(d===10) for(const mode of 'ABCDE') add('album',item(`album-xroom-${mode}`,`X Room · 历史物件档案`,`本期获准公开的历史物件与介绍信摘录。只在D10播出授权后开放；本档案来自V3模式${mode}素材。`,`20:30`,{folder:'D10',unlock:'revealedD10',meta:{day:'10',mode,scene:'X Room · 已公开素材'}}));
  if(d>0) add('edit',item(`edit-source-${d}`,`D${d} 已录素材 · ${topics[d]}`,`本期可选剪辑范围：D${d}已录制且取得授权的场景。当前素材包括：${sceneIds.join('、')||'公共区域群像镜头'}。`,`${String(20+d%3).padStart(2,'0')}:00`,{folder:`D${d}`,meta:{day:String(d)}}));
  for(const mode of 'ABCDE') for(const s of safeModeScene(d,mode)) add('cam',item(`mode-${s.id}`,`模式条件场景 · D${d}`,s.dialogue.map(x=>`${cast[x.speaker]||x.speaker}：${x.text}`).join('\n'),`${String(10+d%8).padStart(2,'0')}:00`,{folder:`D${d}`,meta:{day:String(d),mode,kind:'mode',unlockDay:String(s.unlockDay??d)}}));
  if(d>=3&&d<=10) for(const s of branches.pairScenes.filter(x=>x.minDay<=d&&x.maxDay>=d)) add('date',item(`date-${s.id}-D${d}`,`${s.venueLabel} · ${s.participants.map(x=>cast[x]).join(' × ')}`,`${s.beat}\n${s.dialogue.map(x=>`${cast[x.speaker]||x.speaker}：${x.text}`).join('\n')}`,`${String(14+d%4).padStart(2,'0')}:30`,{folder:`D${d}`,meta:{day:String(d),participants:s.participants.join(','),venue:s.venueLabel,sceneId:s.id}}));
}
// EP10 endings are validated by the season finale flow; legacy D14 ending records are not published.
const xPairs=branches.rules.modes; const xNotice=(mode,sender,recipient)=>{
 const rel=xPairs[mode].exPairs||[]; const recipientHasX=rel.some(p=>p.includes(recipient));
 if(!recipientHasX)return '【本季你没有参与节目的正式X】';
 const isX=rel.some(p=>p.includes(recipient)&&p.includes(sender));
 return isX?'【你的X，选择了你】':'【你的X，没有选择你】';
};
for(const mode of 'ABCDE') for(const v of pack.sms.variants) if(v.mode===mode&&!v.requiredFlags.length){
 add('heart_sms',item(`sms-${v.id}`,`D${v.day} · 匿名来信`,`收件人：${cast[v.recipient]}\n${v.text}`,`22:00`,{folder:`D${v.day}`,meta:{day:String(v.day),mode,senderId:v.sender,recipient:v.recipient,notice:xNotice(mode,v.sender,v.recipient),requiredFlags:'',source:v.source}}));
}
for(const p of pack.social.posts){
 const episode=p.episode;if(episode>10)continue; const app=p.platform==='weibo'?'weibo':p.platform==='douban'?'douban':'threads';
 const author=p.platform==='threads'?(escHandle(p.author)?p.author:'transit_viewer01'):p.author;
 add(app,item(`social-${p.id}`,`EP${episode} · ${p.edit} · ${author}`,p.body,`播出后 · EP${episode}`,{sender:author,kind:'post',folder:`D${episode}`,comments:(p.replies||[]).map(r=>`@${r.author}：${r.body}`),likes:8+(episode*17)%200,unlock:`airedD${episode}_${p.edit}`,meta:{episode:String(episode),edit:p.edit,platform:app,source:'sms_social_pack_v4',clipIds:(episodeClipEvidence[episode]?.[p.edit]||[]).join('|')}}));
}
const appMap={cam:'camera',date:'calendar',mission:'reminders',heart_sms:'messages',edit:'bilibili',interview:'mail',album:'photos',notes:'notes',weibo:'weibo',douban:'forum',threads:'threads',settings:'settings'};
const appNames={cam:'CAM · 节目监控',date:'DATE · 约会安排',mission:'MISSION · 节目任务',heart_sms:'HEART SMS',edit:'EDIT · 剪辑室',interview:'INTERVIEW · 后采',album:'ALBUM · 节目相册',notes:'NOTES · 导演备忘录',weibo:'微博',douban:'豆瓣',threads:'Threads',settings:'节目组设置'};
const appIcons={cam:'',date:'',mission:'',heart_sms:'',edit:'',interview:'',album:'',notes:'',weibo:'',douban:'',threads:'',settings:''};
base.installedApps=Object.entries(appMap).map(([alias,id])=>({id,name:appNames[alias],installed:true,visible:true,dock:['heart_sms','notes','cam','date'].includes(alias),folder:'',icon:appIcons[alias]}));
base.phone={owner:'TOP节目组',date:'2026-10-31',time:'09:41',battery:96,network:'5G',wallpaper:'gradient-sunset',theme:'light',notifications:true,passcode:''};
base.title='TOP换乘恋爱 · 导演组观察计划';base.description='节目组专用工作手机。虚构成人平行世界；所有恋爱故事为原创同人，不代表现实私人关系。';base.id='top-transit-love-v7';base.revision=8;
base.contacts=Object.entries(cast).map(([id,name])=>({id,name,phone:'',avatar:'',bio:'成年虚构版本参演嘉宾。'}));
base.chats=[];base.content=Object.fromEntries(Object.entries(content).filter(([alias])=>appMap[alias]).map(([alias,items])=>[appMap[alias],items]));base.variables=vars;base.events=[];base.tests=[];
const node=(id,label,event,target,actions=[],conditions=[],type='event')=>ev.push({id,label,event,target,type,conditions,actions,next:[],once:true,x:(seq%8)*180,y:Math.floor(seq/8)*100});
node('episode-start','Day 1 节目启动','start','',[{type:'variable',key:'gameDay',value:1},{type:'variable',key:'seasonStarted',value:true},{type:'notification',key:'camera',value:'CAM · 节目监控: D1 10:00 五位嘉宾即将入住。点击打开现场监控。'}]);
node('episode-complete-1','EP01 完成并解锁EP02','episode:complete','1',[{type:'variable',key:'completedEpisodes',value:'[1]'},{type:'variable',key:'gameDay',value:2},{type:'notification',key:'camera',value:'EP.01 本期录制完成 · EP.02《熟悉的人》已开放'}]);
node('episode-complete-2','EP02 完成并解锁EP03','episode:complete','2',[{type:'variable',key:'completedEpisodes',value:'[1,2]'},{type:'variable',key:'gameDay',value:3},{type:'notification',key:'camera',value:'EP.02 本期录制完成 · EP.03《第一次约会》已开放'}]);
node('episode-complete-3','EP03 完成并解锁EP04','episode:complete','3',[{type:'variable',key:'completedEpisodes',value:'[1,2,3]'},{type:'variable',key:'gameDay',value:4},{type:'notification',key:'camera',value:'EP.03 本期录制完成 · EP.04《写给X的信》已开放'}]);
for(let d=4;d<=10;d++) node(`episode-complete-${d}`,`EP${String(d).padStart(2,'0')} 完成并保存`,'episode:complete',String(d),[
 {type:'variable',key:'completedEpisodes',value:JSON.stringify(Array.from({length:d},(_,i)=>i+1))},
 ...(d<10?[{type:'variable',key:'gameDay',value:d+1},{type:'notification',key:'camera',value:`EP.${String(d).padStart(2,'0')} 本期录制完成 · EP.${String(d+1).padStart(2,'0')} 已开放`}]:[{type:'variable',key:'seasonComplete',value:true},{type:'notification',key:'camera',value:'第一季EP01—EP10录制完成 · 终选结果与播出舆论已存档'}])
 ]);
node('season-finale-ep10','EP10 双向终选完成','director:finale','D10',[{type:'variable',key:'seasonComplete',value:true},{type:'ending',key:'',value:'mutual-choice-only'},{type:'notification',key:'camera',value:'第一季EP01—EP10录制完成 · 终选结果与播出舆论已存档'}]);
for(let d=0;d<=10;d++){
 node(`record-${d}`,`D${d} 镜头归档`,'director:record',`D${d}`,[{type:'variable',key:`recordedD${d}`,value:true},{type:'notification',key:'cam',value:`CAM · 节目监控: D${d} 拍摄素材已归档`}],[{key:'gameDay',op:'eq',value:d}]);
 node(`mission-${d}`,`D${d} 发布任务`,'director:mission',`D${d}`,[{type:'variable',key:`missionD${d}`,value:true},{type:'notification',key:'mission',value:`MISSION · 节目任务: D${d} 导演任务已发布`}],[{key:'gameDay',op:'eq',value:d}]);
 node(`date-${d}`,`D${d} 确认约会`,'director:date',`D${d}`,[{type:'variable',key:`dateD${d}`,value:true},{type:'notification',key:'date',value:`DATE · 约会安排: D${d} 约会安排已确认`}]);
 if(d>0){
   node(`sms-${d}`,`D${d} 同步发送短信`,'heart:send',`D${d}`,[{type:'variable',key:`smsD${d}`,value:true},{type:'notification',key:'heart_sms',value:`HEART SMS: D${d} 五条匿名心动短信已于22:00发送`}],[{key:'gameDay',op:'eq',value:d}]);
   for(const cut of ['friendship','romance','conflict','ensemble']){
    node(`air-${d}-${cut}`,`D${d} 发布${cut}剪辑`,'edit:publish',`${d}:${cut}`,[{type:'variable',key:`airedD${d}_${cut}`,value:true},{type:'notification',key:'edit',value:`EDIT · 剪辑室: EP${d} 已播出，观众社区收到新讨论`}],[{key:'gameDay',op:'eq',value:d}]);
   }
 }
 if(d<10) node(`advance-${d}`,`推进至D${d+1}`,'director:advance',String(d),[{type:'variable',key:'gameDay',value:d+1},...(d===0?[{type:'variable',key:'seasonStarted',value:true}]:[]),...(d===9?[{type:'variable',key:'revealedD10',value:true}]:[]),{type:'time',key:'',value:'09:41'},{type:'notification',key:'mission',value:`MISSION · 节目任务: D${d+1} 导演任务已更新：${topics[d+1]}`}],[{key:'gameDay',op:'eq',value:d}]);
}
for(const m of 'ABCDE') node(`mode-test-${m}`,`测试模式${m}`,'testMode',m,[{type:'variable',key:'gameMode',value:m}]);
// Season finale is committed by the EP10 episode state; there is no forced D14 finale event.
base.events=ev;
for(const m of 'ABCDE'){
 const steps=[{event:'testMode',target:m}];
 steps.push({event:'director:record',target:'D0'},{event:'director:mission',target:'D0'},{event:'director:date',target:'D0'},{event:'director:advance',target:'0'});
 for(let d=1;d<=10;d++){
   steps.push({event:'director:record',target:`D${d}`},{event:'director:mission',target:`D${d}`},{event:'director:date',target:`D${d}`},{event:'heart:send',target:`D${d}`},{event:'edit:publish',target:`${d}:friendship`});
   if(d<10)steps.push({event:'director:advance',target:String(d)});
 }
 steps.push({event:'episode:complete',target:'10'},{event:'director:finale',target:'D10'});
 base.tests.push({name:`Mode ${m} complete D0-D10 without API`,steps,ending:'mutual-choice-only',expectUnlocked:[]});
}
await writeFile(new URL('../stories/template/story.json',import.meta.url),JSON.stringify(base,null,2)+'\n');
console.log(`Generated ${Object.values(content).flat().length} story records, ${ev.length} cross-app events, 5 offline season paths.`);
