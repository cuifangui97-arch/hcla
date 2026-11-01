import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { SkinProps } from "../../src/AppSkins";
import { ForumSkin, WeiboSkin } from "../../src/skins/SocialSkins";
import { ThreadsReference } from "../../src/skins/ThreadsReference";
import { makeItem, type UiValue } from "../../src/schema";
import "../../src/styles.css";
import "../../src/skins/skins.css";
import "../../src/skins/threads-reference.css";

const items = [
  makeItem({id:"soc-1",title:"读信之后的沉默是不是更说明问题",body:"逐帧看了一遍，张极先把遥控器放下，后面那句才接上。也可能只是疲惫，先记下镜头顺序。",sender:"慢慢看正片",time:"2026-11-01 21:20",folder:"棍铲超话",likes:348,comments:["我看的是他先看了对面一眼","也可能单纯在等人说话"],meta:{heat:"28.6万",views:"2.1万",status:"精华",handle:"slowframe_01",reposts:"76"},media:"/assets/ep08-kc/zz-water-voucher.jpg",kind:"image"}),
  makeItem({id:"soc-2",title:"这段先别急着下结论",body:"机位切换之前还有一秒空镜，节目组怎么剪的可以讨论，人的真实关系还是等正片信息。",sender:"剪辑观察员",time:"2026-11-01 20:52",folder:"剪辑讨论",likes:192,comments:["支持等播出","镜头语言确实可以拆开说"],meta:{heat:"12.4万",views:"8,920",handle:"edit_watch_9",reposts:"31"}}),
  makeItem({id:"soc-3",title:"今天这句接得太快了",body:"我本来在喝水，看到这里直接呛到。这个接话速度像抢答比赛哈哈。",sender:"饭后复盘",time:"2026-11-01 20:30",folder:"节目超话",likes:88,comments:["我也笑了","录制现场估计更乱"],meta:{heat:"7.8万",views:"3,102",handle:"after_show_2",reposts:"8"}}),
  makeItem({id:"soc-4",title:"关于阳台那段的时间线整理",body:"把公开正片的三个镜头按时间放一起，暂时能确认的是出场顺序，不足以推断谁和谁的历史。",sender:"时间轴存档",time:"2026-11-01 19:46",folder:"考据",likes:253,comments:["时间点补充在二楼","这个谨慎程度很有必要"],meta:{heat:"6.1万",views:"6,401",handle:"timeline_archive",reposts:"19"}}),
];
function Harness(){
 const [view,setView]=useState("weibo"); const [ui,setUi]=useState<Record<string,UiValue>>({});
 const p={ui,onUi:(key:string,value:UiValue)=>setUi(old=>({...old,[key]:value})),name:view==="weibo"?"微博":view==="forum"?"豆瓣":"Threads",items,creator:true,owner:"导演观察员",virtualTime:"21:27",onRead:()=>{},onItem:()=>{},onAdd:()=>{},onBack:()=>{},thread:"",onThread:()=>{}} as SkinProps;
 return <main className="social-preview ios18"><nav className="social-preview-switch"><button onClick={()=>setView("weibo")}>微博</button><button onClick={()=>setView("forum")}>豆瓣</button><button onClick={()=>setView("threads")}>Threads</button></nav><section className="social-preview-phone">{view==="weibo"?<WeiboSkin {...p}/>:view==="forum"?<ForumSkin {...p}/>:<ThreadsReference {...p}/>}</section></main>
}
createRoot(document.getElementById("root")!).render(<Harness/>);
