import React,{useState} from "react";
import{createRoot}from"react-dom/client";
import type{Runtime,UiValue}from"../../src/schema";
import{EpisodeSevenExperience}from"../../src/skins/EpisodeSevenExperience";
import"../../src/skins/day-one.css";
import"../../src/skins/season-episodes.css";
import"../../src/skins/ep06-experience.css";
import"../../src/skins/ep07-experience.css";

function Harness(){
 const[app,setApp]=useState("camera");
 const[gameUi,setGameUi]=useState<Record<string,UiValue>>(()=>{try{return JSON.parse(localStorage.getItem("ep07V15Save")??"{}")}catch{return{}}});
 const[sends,setSends]=useState(()=>Number(localStorage.getItem("ep07V15SendCount")??0));
 const state={variables:{gameDay:7,gameMode:"CLASSIC",topSeasonHistory:JSON.stringify({relationshipMode:"A",formalExPairs:[["ZZX","SXH"],["ZJ","ZZY"]]})}} as unknown as Runtime;
 const onGameUi=(key:string,value:UiValue)=>setGameUi(old=>{const next={...old,[key]:value};localStorage.setItem("ep07V15Save",JSON.stringify(next));return next});
 const onAction=(event:string)=>{if(event==="test:sms")setSends(x=>{const next=x+1;localStorage.setItem("ep07V15SendCount",String(next));return next})};
 return <><output data-testid="state" style={{display:"none"}}>{String(gameUi.episode7??"{}")}</output><output data-testid="send-count" style={{display:"none"}}>{sends}</output><nav><button onClick={()=>setApp("camera")}>CAM</button><button onClick={()=>setApp("reminders")}>DIRECTOR</button><button onClick={()=>setApp("messages")}>SMS</button><button onClick={()=>setApp("bilibili")}>EDIT</button><button onClick={()=>setApp("weibo")}>微博</button><button onClick={()=>setApp("forum")}>豆瓣</button><button onClick={()=>setApp("threads")}>Threads</button><button onClick={()=>setApp("settings")}>SETTINGS</button></nav>{app==="messages"?<main className="ep06-screen"><h1>短信选择（测试代理）</h1><button onClick={()=>{const current=JSON.parse(String(gameUi.episode7)) as Record<string,unknown>;onGameUi("episode7",JSON.stringify({...current,sent:true,ep07Stage:"EDITING",phase:"edit",sms:{ZZX:"SXH",SXH:"ZZX",ZJ:"ZZY",ZZY:"ZJ",ZH:"ZZX"},smsFrozen:{ZZX:{id:"e7t1",senderId:"ZZX",recipientId:"SXH",body:"固定短信"},SXH:{id:"e7t2",senderId:"SXH",recipientId:"ZZX",body:"固定短信"}}}));onAction("test:sms");setApp("bilibili")}}>保留收件选择并发送一次</button></main>:<EpisodeSevenExperience p={{state,gameUi,onGameUi,onNavigate:setApp,onBack:()=>setApp("camera"),onAction} as never} appId={app}/>}</>
}
createRoot(document.getElementById("root")!).render(<Harness/>);
