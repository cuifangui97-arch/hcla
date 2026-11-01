import { useState } from "react";
import { createRoot } from "react-dom/client";
import { DirectorCutRoom, type CutClip, type CutDraft } from "../../src/skins/DirectorCutRoom";

const clips:CutClip[]=Array.from({length:5},(_,i)=>({clipId:`EP04-CAM-${i+1}`,episodeId:"EP04",sceneId:["朱志鑫读信","苏新皓的反应","厨房里的停顿","五人晚餐","阳台交谈"][i],recordedAt:`${18+i}:0${i}`,location:["客厅","客厅","厨房","餐厅","阳台"][i],camera:`CAM 0${i+1}`,guests:[["朱志鑫"],["苏新皓"],["朱志鑫","苏新皓"],["朱志鑫","张极","张泽禹","左航"],["张极","左航"]][i],summary:["朱志鑫读完信后把信纸沿折痕放回桌面。","苏新皓听完后停了一会儿，没有打断。","厨房里的话题转回晚餐准备。","五个人边吃饭边接话。","阳台机位记录两人短暂交谈。"][i],preview:[`测试对白 ${i+1}：${["我刚刚看到最后一句了。","你不用马上回答。","那我先把菜放下。","今天大家都辛苦了。","等下再回客厅吧。"][i]}`],watched:false,spoiler:false,publicEligible:true}));
clips.push({clipId:"EP04-SECRET",episodeId:"EP04",sceneId:"不得出现的X身份详情",recordedAt:"20:10",location:"X Room",camera:"CAM 06",guests:["朱志鑫","苏新皓"],summary:"该镜头包含尚未公开的身份线索，已锁定在导演内部素材库。",preview:["内部保密内容"],watched:false,spoiler:true,publicEligible:false});
const initial:CutDraft={selectedClipIds:[],clipOrder:[],editingStyle:"",previewState:{seenClipIds:[],entered:false},stage:1};
function Harness(){const [draft,setDraft]=useState<CutDraft>(()=>{try{return JSON.parse(localStorage.getItem("cut-draft")||"null")??initial}catch{return initial}});const update=(next:CutDraft)=>{setDraft(next);localStorage.setItem("cut-draft",JSON.stringify(next))};return <DirectorCutRoom episode={4} clips={clips} draft={draft} onDraft={update} onPublish={payload=>update({...draft,...payload,previewState:{...draft.previewState,entered:true},stage:3})}/>}
createRoot(document.getElementById("root")!).render(<Harness/>);
