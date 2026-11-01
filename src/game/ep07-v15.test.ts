import { describe, expect, it } from "vitest";
import { ep07Coordinator, ep07Interview, ep07Names, ep07PairKey, ep07PairScripts, ep07ProfileOrder, ep07Profiles, ep07Rehearsal, validEp07RolePlan } from "./ep07-v15";

const ids=["ZZX","SXH","ZJ","ZZY","ZH"] as const;
describe("EP07 V15 locked story data",()=>{
 it("contains ten distinct pair dialogues with only their assigned two speakers",()=>{
  expect(Object.keys(ep07PairScripts)).toHaveLength(10);
  const pairs: [typeof ids[number],typeof ids[number]][]=[];for(let i=0;i<5;i++)for(let j=i+1;j<5;j++)pairs.push([ids[i],ids[j]]);
  for(const pair of pairs){const key=ep07PairKey([...pair]);const rows=ep07PairScripts[key];expect(rows.length, key).toBeGreaterThanOrEqual(10);expect(new Set(rows.filter(x=>x.speaker!=="STAGE").map(x=>x.speaker))).toEqual(new Set(pair));}
 });
 it("validates exclusive 2+2+1 job assignments",()=>{
  expect(validEp07RolePlan({rhythmPair:["ZZX","SXH"],melodyPair:["ZJ","ZZY"],coordinator:"ZH"})).toBe(true);
  expect(validEp07RolePlan({rhythmPair:["ZZX","SXH"],melodyPair:["ZJ","ZZY"],coordinator:"ZZX"})).toBe(false);
  expect(validEp07RolePlan({rhythmPair:["ZZX","SXH"],melodyPair:["ZJ","ZZX"],coordinator:"ZH"})).toBe(false);
 });
 it("has five coordinator-specific, five profile, and three nonempty rehearsal branches",()=>{
  expect(Object.keys(ep07Coordinator)).toHaveLength(5);expect(Object.keys(ep07Profiles)).toHaveLength(5);
  expect(ep07ProfileOrder).toHaveLength(5);expect(new Set(ep07ProfileOrder).size).toBe(5);
  expect(Object.keys(ep07Interview)).toHaveLength(5);
  for(const choice of ["TRY_BOTH","FOLLOW_RHYTHM","FOLLOW_MELODY"] as const)expect(ep07Rehearsal(choice,true,false).length).toBeGreaterThan(15);
  expect(ep07Rehearsal("TRY_BOTH",true,true).some(x=>x.text.includes("两组第一次合起来"))).toBe(false);
  expect(ep07Rehearsal("TRY_BOTH",false,false).some(x=>x.text.includes("两组第一次合起来"))).toBe(false);
  expect(ep07Names.ZZX).toBe("朱志鑫");
 });
});
