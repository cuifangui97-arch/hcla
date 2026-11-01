import { describe, expect, it } from "vitest";
import type { GuestId } from "./day1-data";
import { ep06Dinner, ep06Interview, ep06PairLines, ep06Stay, ep06Venues, validEp06Pairing } from "./ep06-v14";

const pairs:GuestId[][]=[["ZZX","SXH"],["ZJ","ZZY"],["ZJ","ZH"],["ZZY","ZH"],["ZZX","ZJ"],["ZZX","ZZY"],["ZZX","ZH"],["SXH","ZJ"],["SXH","ZZY"],["SXH","ZH"]];
const cast:GuestId[]=["ZZX","SXH","ZJ","ZZY","ZH"];

describe("EP06 V14 canonical episode engine",()=>{
 it("runs all ten distinct pair scripts at all four actual venues",()=>{
  for(const pair of pairs)for(const venue of ep06Venues){
   const rows=ep06PairLines(pair,venue.id,"A",true,true);
   expect(rows.length,`${pair.join("+")} · ${venue.id}`).toBeGreaterThanOrEqual(18);
   expect(rows.some(row=>row.speaker==="STAGE"&&row.text.includes(venue.place))).toBe(true);
   expect(rows.every(row=>row.speaker==="STAGE"||pair.includes(row.speaker))).toBe(true);
  }
 });
 it("keeps relationship-only nuances inside compatible classic modes",()=>{
  const jyA=ep06PairLines(["ZJ","ZZY"],"record","A",true);
  const jyFree=ep06PairLines(["ZJ","ZZY"],"record","A",false);
  const jhB=ep06PairLines(["ZJ","ZH"],"bookstore","B",true);
  expect(jyA.some(row=>row.text.includes("以前我确实总以为我能猜中"))).toBe(true);
  expect(jyFree.some(row=>row.text.includes("以前我确实总以为我能猜中"))).toBe(false);
  expect(jhB.some(row=>row.text.includes("避开目光"))).toBe(true);
 });
 it("does not claim a sunrise conversation unless EP02 recorded that hint",()=>{
  const without=ep06PairLines(["ZZY","ZH"],"riverside","D",true,false).map(row=>row.text).join(" ");
  const withHint=ep06PairLines(["ZZY","ZH"],"riverside","D",true,true).map(row=>row.text).join(" ");
  expect(without).not.toContain("你上次说想去看那个地方");
  expect(withHint).toContain("你上次说想去看那个地方");
 });
 it("provides five individual stay-home stories and three materially different dinners",()=>{
  expect(Object.keys(ep06Stay).sort()).toEqual([...cast].sort());
  const pairingA:GuestId[]=["ZZX","SXH"],pairingB:GuestId[]=["ZJ","ZZY"];
  const funny=ep06Dinner("funny","ZH",pairingA,pairingB).map(row=>row.text).join(" ");
  const stay=ep06Dinner("stay","ZH",pairingA,pairingB).map(row=>row.text).join(" ");
  const surprise=ep06Dinner("surprise","ZH",pairingA,pairingB).map(row=>row.text).join(" ");
  expect(new Set([funny,stay,surprise]).size).toBe(3);
  for(const guest of cast)expect(ep06Stay[guest].length).toBeGreaterThanOrEqual(10);
 });
 it("creates complete conditional interviews for date and stay participants",()=>{
  const pairing={dateA:["ZZX","SXH"] as [GuestId,GuestId],venueA:"pottery" as const,stay:"ZH" as GuestId,dateB:["ZJ","ZZY"] as [GuestId,GuestId],venueB:"record" as const};
  for(const guest of cast){const rows=ep06Interview(guest,pairing,true);expect(rows.length).toBeGreaterThanOrEqual(8);expect(rows.every(row=>row.speaker==="STAGE"||row.speaker===guest)).toBe(true);}
  expect(ep06Interview("ZH",pairing,false).map(row=>row.text).join(" ")).toContain("阳台安静");
 });
 it("validates all five unique participants and both distinct two-person date groups",()=>{
  expect(validEp06Pairing({dateA:["ZZX","SXH"],venueA:"pottery",dateB:["ZJ","ZZY"],venueB:"bookstore",stay:"ZH"})).toBe(true);
  expect(validEp06Pairing({dateA:["ZZX","SXH"],venueA:"pottery",dateB:["ZJ","ZZY"],venueB:"bookstore",stay:"ZJ"})).toBe(false);
  expect(validEp06Pairing({dateA:["ZZX","SXH"],venueA:"pottery",dateB:["ZZX","ZZY"],venueB:"bookstore",stay:"ZH"})).toBe(false);
 });
});
