import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { Runtime, UiValue } from "../../src/schema";
import { EpisodeFourteen } from "../../src/skins/EpisodeFourteen";
import "../../src/skins/day-one.css";
import "../../src/skins/season-episodes.css";

declare global { interface Window { __ep09Actions: string[] } }
window.__ep09Actions=[];
function Harness(){
 const [gameDay,setGameDay]=useState(()=>Number(localStorage.getItem("ep09GameDay")??8));const setDay=(value:number)=>{localStorage.setItem("ep09GameDay",String(value));setGameDay(value)};const [app,setApp]=useState("camera");
 const [gameUi,setGameUi]=useState<Record<string,UiValue>>(()=>{try{const saved=localStorage.getItem("ep09V164Save");return saved?JSON.parse(saved):{episode8:JSON.stringify({episode:8,phase:"complete",sent:true,roomViewedItemIds:["ZZ_KOREA_CHILDHOOD","SX_FRIED_EGG"],recorded:["E08-C16-BROADCAST","E08_KC_ZZ_WATER_VOUCHER"],airedClips:["E08-C16-BROADCAST","E08_KC_ZZ_WATER_VOUCHER"]})}}catch{return {episode8:JSON.stringify({episode:8,phase:"complete",sent:true,recorded:["E08-C16-BROADCAST"],airedClips:["E08-C16-BROADCAST"]})}}});
 const state={variables:{gameDay,gameMode:"CLASSIC",gameSeed:"browser-ep09-v164",topSeasonHistory:JSON.stringify({relationshipMode:"A",formalExPairs:[["ZZX","SXH"],["ZJ","ZZY"]]})}} as unknown as Runtime;
 const onGameUi=(key:string,value:UiValue)=>setGameUi(old=>{const next={...old,[key]:value};localStorage.setItem("ep09V164Save",JSON.stringify(next));return next});
 const onAction=(event:string,target:string)=>{window.__ep09Actions.push(event+":"+target);if(event==="episode:complete"&&target==="9")setDay(10)};
 const p={state,work:{id:"ep09-v164-browser",data:{camera:[]}},gameUi,onGameUi,onAction,onNavigate:setApp,onBack:()=>setApp("camera"),name:"Director",items:[],creator:true,onRead:()=>{},onItem:()=>{},onAdd:()=>{},thread:"",onThread:()=>{}} as never;
 return <>{gameDay===8?<main style={{padding:24}}><h1>EP08 已完成存档</h1><p>关系历史与短信已保存。此浏览器测试从EP08完成处继续。</p><button onClick={()=>setDay(9)}>继续录制 EP09</button></main>:<><nav style={{display:"flex",gap:8,padding:8}}><button onClick={()=>setApp("camera")}>CAM</button><button onClick={()=>setApp("reminders")}>DIRECTOR</button><button onClick={()=>setApp("messages")}>短信</button><button onClick={()=>setApp("bilibili")}>剪辑室</button></nav><output id="ep09-state" style={{display:"none"}}>{String(gameUi.episode9??"{}")}</output><output id="active-episode" style={{display:"none"}}>{gameDay}</output><output id="relationship-history" style={{display:"none"}}>{String(state.variables.topSeasonHistory)}</output><output id="ep08-save" style={{display:"none"}}>{String(gameUi.episode8)}</output><EpisodeFourteen p={p} appId={app}/></>}</>;
}
createRoot(document.getElementById("root")!).render(<Harness/>);
