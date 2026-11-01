import { describe, expect, it } from "vitest";
import { canonicalV13Episodes, isValidPairing, migrateLegacyV13EpisodeState, resolveV13Stage, v13DeprecatedSceneAliases } from "./canonical-v13";

describe("V13 canonical episode flow",()=>{
  it("registers one forward-only manifest for each EP05-EP14",()=>{
    expect(canonicalV13Episodes.map(row=>row.episode)).toEqual([5,6,7,8,9,10,11,12,13,14]);
    for(const episode of canonicalV13Episodes){
      expect(new Set(episode.scenes.map(scene=>scene.id)).size).toBe(episode.scenes.length);
      expect(episode.scenes.some(scene=>/KC-NIGHT|POST-SMS/.test(scene.id))).toBe(false);
      for(const scene of episode.scenes) if(scene.next) expect(episode.scenes.some(row=>row.id===`EP${String(episode.episode).padStart(2,"0")}-${scene.next}`),`${scene.id} -> ${scene.next}`).toBe(true);
      expect(episode.scenes.at(-1)?.phase).toBe("complete");
    }
  });
  it("preserves episode-specific mainline beats while making SMS flow directly to editing",()=>{
    const stage=(episode:number,key:string)=>canonicalV13Episodes.find(row=>row.episode===episode)?.scenes.find(item=>item.id===`EP${String(episode).padStart(2,"0")}-${key}`);
    expect(stage(8,"ROOMS")?.title).toBe("五人独立回忆室探索");
    expect(stage(10,"SUNRISE")?.title).toBe("清晨观景");
    expect(stage(10,"KC10")?.title).toBe("露台谈话");
    expect(stage(11,"KC11")?.title).toBe("暂停后回来继续谈");
    expect(stage(13,"KC13")?.title).toBe("棍铲关系修复对谈");
    for(let episode=5;episode<=13;episode++)expect(stage(episode,"SMS")?.next).toBe("EDITING");
  });
  it("migrates old forced night-talk states without altering committed SMS or history",()=>{
    const legacy={phase:"kcNight",sent:true,sms:{ZZX:"SXH"},smsFrozen:{ZZX:{body:"frozen"}},recorded:["clip"],broadcastId:undefined,auto:true};
    const migrated=migrateLegacyV13EpisodeState(6,legacy);
    expect(migrated).toMatchObject({phase:"edit",sent:true,sms:legacy.sms,smsFrozen:legacy.smsFrozen,recorded:legacy.recorded,auto:false,v13Migration:{from:"kcNight",to:"edit"}});
    expect(migrateLegacyV13EpisodeState(6,migrated)).toEqual(migrated);
    expect(migrateLegacyV13EpisodeState(4,legacy)).toBe(legacy);
    const ep05Mainline={phase:"activity",ep05Stage:"NIGHT",ep05NightIndex:0,recorded:["D05-KC-ATTEMPT-EXPLANATION"]};
    expect(migrateLegacyV13EpisodeState(5,ep05Mainline)).toBe(ep05Mainline);
  });
  it("resumes delivered legacy SMS at the editor and maps migration aliases",()=>{
    expect(resolveV13Stage(6,{phase:"kcNight",sent:true})).toBe("EDITING");
    for(let episode=5;episode<=14;episode++)if(episode!==7)expect(resolveV13Stage(episode,{phase:"kcNight",sent:true})).toBe(episode===14?"FINAL_CUT":"EDITING");
    expect(resolveV13Stage(7,{phase:"edit",sent:true})).toBe("INTRO");
    expect(resolveV13Stage(7,{phase:"edit",sent:true,ep07CompletedSceneIds:["D07-001","D07-002"],profileOrder:["ZZX","SXH","ZJ","ZZY","ZH"],rolePlan:{},ep07Stage:"SMS"})).toBe("RHYTHM");
    expect(resolveV13Stage(7,{phase:"edit",sent:true,ep07CompletedSceneIds:["D07-001","D07-002","D07-004","D07-005","D07-006","D07-007","D07-008","D07-009","D07-010"],rolePlan:{},ep07Stage:"EDITING"})).toBe("EDITING");
    expect(migrateLegacyV13EpisodeState(6,{phase:"sms",sent:true,sms:{ZZX:"SXH"},smsFrozen:{ZZX:{body:"kept"}},recorded:["clip"]})).toMatchObject({phase:"edit",sms:{ZZX:"SXH"},smsFrozen:{ZZX:{body:"kept"}},recorded:["clip"]});
    expect(migrateLegacyV13EpisodeState(6,{phase:"sms",sent:false,locked:["ZZX"]})).toMatchObject({phase:"sms",locked:["ZZX"]});
    expect(resolveV13Stage(6,{phase:"kcNight",sent:false,interviews:["ZZX","SXH"],interviewProgress:{ZZX:{finished:true},SXH:{finished:true}}})).toBe("SMS");
    expect(v13DeprecatedSceneAliases["KC-NIGHT-06"]).toBe("EP06-EDITING");
    expect(v13DeprecatedSceneAliases["D12-POST-SMS"]).toBe("EP12-EDITING");
    const oldRoute=migrateLegacyV13EpisodeState(10,{phase:"activity",v13SceneId:"EP10-KC-NIGHT",sent:true,sms:{ZJ:"ZH"},recorded:["travel"]});
    expect(oldRoute).toMatchObject({phase:"edit",v13SceneId:"EP10-EDITING",sms:{ZJ:"ZH"},recorded:["travel"]});
    expect(resolveV13Stage(10,{phase:"sms",sent:true,v13SceneId:"EP10-INTERVIEW"})).toBe("EDITING");
    const beforeDispatch=migrateLegacyV13EpisodeState(7,{phase:"kcNight",sent:false,interviews:["ZZX"],interviewProgress:{ZZX:{finished:true}},recorded:["performance"]});
    expect(beforeDispatch).toMatchObject({phase:"sms",recorded:["performance"]});
    const oldNamedPhase=migrateLegacyV13EpisodeState(8,{phase:"postSms",sent:true,smsFrozen:{ZZX:{body:"frozen"}},recorded:["xroom"]});
    expect(oldNamedPhase).toMatchObject({phase:"edit",v13SceneId:"EP08-EDITING",recorded:["xroom"]});
  });
  it("uses the ten-day EP08 X Room state and unique recorded material IDs",()=>{
    const episode=canonicalV13Episodes.find(row=>row.episode===8)!;
    expect(episode.scenes.map(row=>row.id.slice(5))).toEqual(["INTRO","ORDER","ROOMS","LUNCH","CHOICE_RULE","CHOICE_SUBMIT","CHOICE_RESULT","CHOICE_ACTIVITY","DINNER","INTERVIEW_SELECT","INTERVIEW","SMS","EDITING","BROADCAST","COMPLETE"]);
    expect(episode.scenes.flatMap(row=>row.clipIds).some(id=>/^D08-/.test(id))).toBe(false);
    const room=episode.scenes.find(row=>row.id==="EP08-ROOMS")!;
    expect(room.clipIds.filter(id=>id.startsWith("E08_KC_")).length).toBe(24);
    expect(room.clipIds.filter(id=>id.startsWith("E08-03-ROOM-")).length).toBe(9);
    expect(room.clipIds.length).toBe(42);
    expect(new Set(room.clipIds).size).toBe(room.clipIds.length);
    expect(resolveV13Stage(8,{v16Phase:"ROOMS",phase:"activity",roomIndex:2})).toBe("ROOMS");
    expect(resolveV13Stage(8,{v16Phase:"SMS",phase:"sms",sent:false})).toBe("SMS");
    expect(resolveV13Stage(8,{v16Phase:"EDITING",phase:"edit",sent:true})).toBe("EDITING");
  });
  it("rejects overlapping director pairs",()=>{
    expect(isValidPairing([["ZZX","SXH"],["ZJ","ZZY"]])).toBe(true);
    expect(isValidPairing([["ZZX","SXH"],["SXH","ZH"]])).toBe(false);
  });
});
