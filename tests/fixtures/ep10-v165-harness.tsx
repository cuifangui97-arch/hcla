import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { Runtime, UiValue } from "../../src/schema";
import { EpisodeFourteen } from "../../src/skins/EpisodeFourteen";
import "../../src/skins/day-one.css";
import "../../src/skins/season-episodes.css";

function Harness(){
 const [app,setApp]=useState("camera");
 const [gameUi,setGameUi]=useState<Record<string,UiValue>>(()=>{try{return JSON.parse(localStorage.getItem("ep10V165Save")??"{}")}catch{return {}}});
 const state={variables:{gameDay:10,gameMode:"CLASSIC",gameSeed:"browser-ep10-v165",topSeasonHistory:JSON.stringify({relationshipMode:"A",formalExPairs:[["ZZX","SXH"],["ZJ","ZZY"]]})}} as unknown as Runtime;
 const onGameUi=(key:string,value:UiValue)=>setGameUi(old=>{const next={...old,[key]:value};localStorage.setItem("ep10V165Save",JSON.stringify(next));return next});
 const p={state,work:{id:"ep10-v165-browser",data:{camera:[]}},gameUi,onGameUi,onAction:()=>{},onNavigate:setApp,onBack:()=>setApp("camera"),name:"Director",items:[],creator:true,onRead:()=>{},onItem:()=>{},onAdd:()=>{},thread:"",onThread:()=>{}} as never;
 return <><nav style={{display:"flex",gap:8,padding:8}}><button onClick={()=>setApp("camera")}>CAM</button><button onClick={()=>setApp("reminders")}>DIRECTOR</button><button onClick={()=>setApp("mail")}>后采</button></nav><output id="ep10-state" style={{display:"none"}}>{String(gameUi.episode10??"{}")}</output><EpisodeFourteen p={p} appId={app}/></>;
}
createRoot(document.getElementById("root")!).render(<Harness/>);
