import { describe, expect, it } from "vitest";
import { ep09DatePairScripts, ep09GiftChoiceScripts, ep09GiftGroup, ep09Guests, ep09Intro, ep09Interviews, ep09Pairs, ep09Return, ep09SoloDate, ep09SoloTravel, ep09TravelScripts, giftPermutation, keywordGiftPermutation, makeTravelGroups, pairKey, resolveAcceptedDatePairs, validateEp09Travel } from "./ep09-v164";

describe("EP09 V16.4 locked script integration",()=>{
  it("loads the complete travel and last-date scripts for all ten unique pairs",()=>{
    expect(ep09Pairs).toHaveLength(10);
    for(const pair of ep09Pairs){expect(ep09TravelScripts[pairKey(pair)].length,`travel ${pair}`).toBeGreaterThanOrEqual(6);expect(ep09DatePairScripts[pairKey(pair)].length,`date ${pair}`).toBeGreaterThanOrEqual(10);}
  });
  it("provides the opening, breakfast, five gift scripts, five solo stories and interviews",()=>{
    expect(ep09Intro.length).toBeGreaterThan(12);expect(ep09Return.length).toBeGreaterThan(10);expect(ep09GiftGroup.length).toBeGreaterThan(4);
    for(const id of ep09Guests){expect(ep09GiftChoiceScripts[id].length,`gift ${id}`).toBeGreaterThan(2);expect(ep09SoloTravel[id].length).toBeGreaterThan(1);expect(ep09SoloDate[id].length).toBeGreaterThan(1);expect(ep09Interviews[id].length).toBeGreaterThan(4);}
  });
});

describe("EP09 V16.4 branch constraints",()=>{
  it("validates exactly two disjoint travel pairs and one solo guest",()=>{
    const result=makeTravelGroups(["ZZX","SXH"],["ZJ","ZZY"]);
    expect(result).toEqual({valid:true,groups:[["ZZX","SXH"],["ZJ","ZZY"]],solo:"ZH"});
    expect(validateEp09Travel(result.groups,result.solo)).toBe(true);
    expect(makeTravelGroups(["ZZX","SXH"],["SXH","ZZY"] ).valid).toBe(false);
  });
  it("keeps three distinct deterministic gifting rules",()=>{
    const anonymous=giftPermutation("anonymous","seed",{ZZX:"SXH",SXH:"ZZX",ZJ:"ZZY",ZZY:"ZJ",ZH:"ZZX"});
    const random=giftPermutation("random","seed");const keyword=giftPermutation("keyword","seed");
    expect(anonymous.ZH).toBe("ZZX");expect(new Set(Object.values(random)).size).toBe(5);expect(new Set(Object.values(keyword)).size).toBe(5);
    expect(giftPermutation("random","seed")).toEqual(random);expect(giftPermutation("keyword","seed")).toEqual(keyword);
    const keywords={ZZX:"早起",SXH:"热饮",ZJ:"相机",ZZY:"路线",ZH:"照片"};
    const matched=keywordGiftPermutation(keywords,"saved-seed");expect(matched).not.toBeNull();expect(new Set(Object.values(matched!)).size).toBe(5);expect(keywordGiftPermutation(keywords,"saved-seed")).toEqual(matched);expect(keywordGiftPermutation({...keywords,ZH:""},"saved-seed")).toBeNull();
  });
  it("supports zero, one and two consented dates without double booking",()=>{
    expect(resolveAcceptedDatePairs({},{})).toHaveLength(0);
    expect(resolveAcceptedDatePairs({ZZX:"SXH"},{SXH:"ZZX"})).toEqual([["ZZX","SXH"]]);
    const two=resolveAcceptedDatePairs({ZZX:"SXH",SXH:"ZZX",ZJ:"ZZY"},{SXH:"ZZX",ZZY:"ZJ"});
    expect(two).toHaveLength(2);expect(new Set(two.flat()).size).toBe(4);
  });
  it("prioritizes mutually accepted invitations over one-way accepted invitations",()=>{
    const pairs=resolveAcceptedDatePairs({ZZX:"SXH",SXH:"ZZX",ZJ:"ZZY"},{SXH:"ZZX",ZZY:"ZJ"});
    expect(pairs[0]).toEqual(["ZZX","SXH"]);
  });
});
