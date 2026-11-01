import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { Runtime, UiValue } from "../../src/schema";
import { EpisodeEightExperience } from "../../src/skins/EpisodeEightExperience";
import { ep08Items } from "../../src/game/ep08-v16";
import "../../src/skins/day-one.css";
import "../../src/skins/season-episodes.css";

declare global { interface Window { __ep08Assets: string[] } }
const formalExPairs: ["ZZX"|"SXH"|"ZJ"|"ZZY"|"ZH","ZZX"|"SXH"|"ZJ"|"ZZY"|"ZH"][] = [["ZZX","SXH"],["ZJ","ZZY"]];
window.__ep08Assets = ep08Items({formalExPairs,aiFree:false}).filter(item=>item.asset).map(item=>item.asset);
const initial = {episode:8,phase:"activity",line:0,v16EpisodeVersion:"16.2",v16Phase:"ROOMS",v16Line:0,roomOrder:["ZZX","SXH","ZJ","ZZY","ZH"],roomOrderDraft:["ZZX","SXH","ZJ","ZZY","ZH"],roomIndex:0,roomViewedItemIds:[],completedRoomIds:[],ep08Clips:[],recorded:[],clips:[],clipOrder:[],cut:"",visits:[],likes:[],replies:{}};
function Harness(){
 const [app,setApp]=useState("camera");
 const [gameUi,setGameUi]=useState<Record<string,UiValue>>(()=>{try{const saved=localStorage.getItem("ep08V163Save");return {episode8:saved??JSON.stringify(initial)}}catch{return {episode8:JSON.stringify(initial)}}});
 const state={variables:{gameDay:8,gameMode:"CLASSIC",gameSeed:"v16.3-test",topSeasonHistory:JSON.stringify({relationshipMode:"A",formalExPairs})}} as unknown as Runtime;
 const onGameUi=(key:string,value:UiValue)=>setGameUi(old=>{const next={...old,[key]:value};localStorage.setItem("ep08V163Save",String(value));return next});
 return <><nav><button onClick={()=>setApp("camera")}>CAM</button><button onClick={()=>setApp("reminders")}>DIRECTOR</button></nav><output data-testid="save" style={{display:"none"}}>{String(gameUi.episode8??"{}")}</output><EpisodeEightExperience p={{state,gameUi,onGameUi,onNavigate:setApp,onBack:()=>setApp("camera"),onAction:()=>{}} as never} appId={app}/></>;
}
createRoot(document.getElementById("root")!).render(<Harness/>);
