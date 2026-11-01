import { useState } from "react";
import { createRoot } from "react-dom/client";
import { EpisodeFiveExperience } from "../../src/skins/EpisodeFiveExperience";
import type { State } from "../../src/skins/EpisodeFourteen";
import type { Runtime } from "../../src/schema";
import type { GuestId } from "../../src/game/day1-data";
import "../../src/skins/day-one.css";
import "../../src/skins/season-episodes.css";

const guests:GuestId[]=["ZZX","SXH","ZJ","ZZY","ZH"];
const initial:State={episode:5,phase:"decision",line:0,auto:false,pair:[],choice:"",interviews:[],ep05Stage:"ROUND1_SELECTION",ep05Rounds:[],ep05PairSelection:[],ep05ActiveSegment:"ready",sms:{},locked:[],sent:false,clips:[],cut:"",visits:[],likes:[],replies:{},viewed:[],recorded:[],ending:""};
function Harness(){const [state,setState]=useState(initial);const [appId,setAppId]=useState("reminders");(window as unknown as {seedPair:(ids:GuestId[])=>void}).seedPair=ids=>{setState({...initial,ep05PairSelection:[],ep05Rounds:[],phase:"decision",ep05Stage:"ROUND1_SELECTION"});setAppId("reminders");};return <><EpisodeFiveExperience appId={appId} state={state} runtime={{variables:{},ui:{}} as Runtime} mode="C" formalExPairs={[]} classic={false} save={setState} onNavigate={setAppId} onBack={()=>setAppId("reminders")}/><pre data-testid="state">{JSON.stringify(state)}</pre></>}
createRoot(document.getElementById("root")!).render(<Harness/>);
