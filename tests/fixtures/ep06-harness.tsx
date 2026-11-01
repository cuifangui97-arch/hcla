import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { Runtime, UiValue } from "../../src/schema";
import type { GuestId } from "../../src/game/day1-data";
import { EpisodeSixExperience } from "../../src/skins/EpisodeSixExperience";
import "../../src/skins/day-one.css";
import "../../src/skins/season-episodes.css";

function Harness(){
 const [appId,setAppId]=useState(()=>new URLSearchParams(window.location.search).get("app")??"camera");const [gameUi,setGameUi]=useState<Record<string,UiValue>>(()=>new URLSearchParams(window.location.search).has("legacySent")?{episode6:JSON.stringify({episode:6,phase:"edit",line:0,ep06Stage:"INTRO",pair:["ZZX","SXH"],choice:"",sms:{ZZX:"SXH",SXH:"ZZX"},locked:["ZZX","SXH","ZJ","ZZY","ZH"],sent:true,smsFrozen:{ZZX:{id:"persisted-zzx",body:"原存档短信正文"}},formalExPairs:[["ZZX","SXH"]],recorded:["legacy-clip"],clips:["legacy-clip"]})}:{});const [complete,setComplete]=useState(false);
 const onGameUi=(key:string,value:UiValue)=>setGameUi(current=>({...current,[key]:value}));
 (window as unknown as {setApp:(app:string)=>void}).setApp=setAppId;
 const p={state:{variables:{gameMode:"CLASSIC",topSeasonHistory:JSON.stringify({relationshipMode:"C",formalExPairs:[["ZZX","SXH"]]})},ui:{}} as Runtime,gameUi,onGameUi,onNavigate:setAppId,onBack:()=>setAppId("camera"),onAction:(event:string,target:string)=>{if(event==="episode:complete"&&target==="6")setComplete(true)}};
 const row=()=>{try{return JSON.parse(String(gameUi.episode6??"{}")) as Record<string,unknown>}catch{return {}}};
 if(appId==="messages")return <main><h1>当晚短信</h1><button onClick={()=>{const state=row();onGameUi("episode6",JSON.stringify({...state,sent:true,phase:"edit",ep06Stage:"EDITING",smsFrozen:{sent:{id:"test-frozen",body:"已保存短信"}}}));setAppId("bilibili")}}>测试投递一次并打开剪辑室</button><pre data-testid="state">{JSON.stringify(row())}</pre><output data-testid="episode-complete">{String(complete)}</output></main>;
 return <><EpisodeSixExperience p={p} appId={appId}/><pre data-testid="state">{JSON.stringify(row())}</pre><output data-testid="episode-complete">{String(complete)}</output></>;
}
createRoot(document.getElementById("root")!).render(<Harness/>);
declare global { interface Window { resetEP06?:()=>void } }
