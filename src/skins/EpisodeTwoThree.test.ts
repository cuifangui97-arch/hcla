import { describe, expect, it } from "vitest";
import { normalizeDatePairs } from "./EpisodeTwoThree";
import type { GuestId } from "../game/day1-data";

describe("EP03 date-pair recovery",()=>{
  it("removes stale overlap from the second group so visible choices stay selectable",()=>{
    const [first,second]=normalizeDatePairs([["ZZX","SXH"],["ZJ","ZZX"]]);
    expect(first).toEqual(["ZZX","SXH"]);
    expect(second).toEqual(["ZJ"]);
    const all:GuestId[]=["ZZX","SXH","ZJ","ZZY","ZH"];
    const remaining=all.filter(id=>!first.includes(id));
    expect(remaining.filter(id=>!second.includes(id))).toEqual(["ZZY","ZH"]);
  });

  it("deduplicates invalid and repeated selections while preserving a valid five-person split",()=>{
    const [first,second]=normalizeDatePairs([["ZZX","ZZX","SXH","ZJ"],["ZZX","ZZY","ZZY","ZH"]]);
    expect(first).toEqual(["ZZX","SXH"]);
    expect(second).toEqual(["ZZY","ZH"]);
    expect(new Set([...first,...second]).size).toBe(4);
  });
});
