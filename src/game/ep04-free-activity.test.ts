import { describe, expect, it } from "vitest";
import { ep04FreeActivityClipIds, ep04FreeActivityScenes, freshEp04FreeActivityProgress } from "./ep04-free-activity";

describe("EP04 afternoon free activity",()=>{
  it("provides three time-separated camera scenes with the supplied participants and locations",()=>{
    const scenes=ep04FreeActivityScenes("C");
    expect(scenes.map(row=>row.id)).toEqual(["D04-FREE-LIVING","D04-FREE-KITCHEN","D04-FREE-BALCONY"]);
    expect(scenes.map(row=>row.time)).toEqual(["15:30—15:45","15:45—16:00","16:00—16:15"]);
    expect(scenes.map(row=>row.participants)).toEqual([["ZJ","ZZY"],["ZZX","SXH"],["ZJ","ZH"]]);
    expect(scenes.map(row=>row.location)).toEqual(["客厅","厨房","阳台"]);
    expect(scenes.every(row=>row.lines.length>=35)).toBe(true);
  });
  it("keeps relationship-mode-specific pauses isolated and leaves six unique editable clip IDs",()=>{
    const modeA=ep04FreeActivityScenes("A"),modeB=ep04FreeActivityScenes("B"),modeC=ep04FreeActivityScenes("C");
    expect(modeA[0].lines.some(row=>row.text.includes("短暂对视"))).toBe(true);
    expect(modeB[2].lines.some(row=>row.text.includes("避开目光"))).toBe(true);
    expect(modeC[0].lines.some(row=>row.text.includes("短暂对视"))).toBe(false);
    expect(modeC[2].lines.some(row=>row.text.includes("避开目光"))).toBe(false);
    expect(ep04FreeActivityClipIds).toHaveLength(6);
    expect(new Set(ep04FreeActivityClipIds).size).toBe(6);
  });
  it("creates independent zero-progress state for every camera",()=>{
    const progress=freshEp04FreeActivityProgress();
    expect(Object.keys(progress)).toHaveLength(3);
    expect(Object.values(progress).every(row=>row.line===0&&!row.watched&&!row.complete&&!row.auto)).toBe(true);
  });
});
