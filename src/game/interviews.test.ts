import { describe, expect, it } from "vitest";
import { initialRuntime } from "../schema";
import { interviewEntries, interviewFor, interviewConditional, interviewLines } from "./interviews";
import type { InterviewProgress } from "./interviews";

describe("EP01-EP14 delivered interview corpus",()=>{
  it("preserves all 70 unique interview scripts and complete turn/choice counts",()=>{
    expect(interviewEntries).toHaveLength(70);
    expect(new Set(interviewEntries.map(row=>row.interviewId)).size).toBe(70);
    for(const row of interviewEntries){
      expect(row.canonicalTurns).toHaveLength(8);
      expect(row.directorFollowupChoices).toHaveLength(2);
      expect(row.directorFollowupChoices.every(choice=>choice.turns.length===2)).toBe(true);
      expect(JSON.stringify(row)).not.toContain("有些细节我会记得");
    }
  });
  it("inserts the real follow-up branch between the two halves of canonical turns",()=>{
    const row=interviewFor(4,"ZZX")!;
    expect(interviewLines(row,{line:0})).toHaveLength(4);
    const chosen:InterviewProgress={line:4,followupId:"probe"};
    const turns=interviewLines(row,chosen);
    expect(turns).toHaveLength(10);
    expect(turns[4].text).toContain(row.directorFollowupChoices[0].turns[0].text);
    expect(turns[6].text).toContain(row.canonicalTurns[4].text);
  });
  it("uses the whitelist no-branch if an EP02 event has not happened",()=>{
    const runtime=initialRuntime({id:"test",revision:1,variables:{},phone:{},apps:[],data:{}} as never);
    const row=interviewFor(2,"ZJ")!;
    expect(interviewConditional(row,runtime,"ZJ")?.answer).toBe(row.conditionalInsert!.no);
  });
  it("only gives the EP13 X-dependent insert from the saved relationship mapping",()=>{
    const runtime=initialRuntime({id:"test",revision:1,variables:{},phone:{},apps:[],data:{}} as never);
    runtime.variables.gameMode="C";
    const row=interviewFor(13,"ZJ")!;
    expect(interviewConditional(row,runtime,"ZJ")?.answer).toBe(row.conditionalInsert!.no);
    runtime.variables.gameMode="A";
    expect(interviewConditional(row,runtime,"ZJ")?.answer).toBe(row.conditionalInsert!.yes);
  });
});
