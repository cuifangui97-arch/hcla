import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { Runtime } from "../../src/schema";
import { interviewFor, type InterviewProgress } from "../../src/game/interviews";
import { InterviewExperience } from "../../src/skins/InterviewExperience";

const entry=interviewFor(2,"ZZX")!;
const runtime={variables:{gameMode:"A",topSeasonHistory:JSON.stringify({relationshipMode:"A",formalExPairs:[["ZZX","SXH"],["ZJ","ZZY"]]})},ui:{game:{}}} as unknown as Runtime;
function Harness(){const [progress,setProgress]=useState<InterviewProgress>({line:0});const [done,setDone]=useState(false);return <main><InterviewExperience episode={2} guest="ZZX" name="朱志鑫" entry={entry} runtime={runtime} progress={progress} onProgress={setProgress} onComplete={()=>setDone(true)}/>{done&&<b>INTERVIEW_COMPLETE</b>}</main>}
createRoot(document.getElementById("root")!).render(<Harness/>);
