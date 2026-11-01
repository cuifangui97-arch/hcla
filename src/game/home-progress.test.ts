import { describe, expect, it } from "vitest";
import { resolveHomeProgress } from "./home-progress";
import { episodeManifest } from "../persistence";
import type { Runtime } from "../schema";

function runtime(gameDay:number, game:Record<string,string>, variables:Record<string,string|number|boolean>={}) {
  return {workId:"top-transit-love-v7",revision:1,variables:{gameDay,seasonStarted:true,completedEpisodes:"[]",...variables},visited:[],read:[],clues:[],unlocked:[],hidden:[],completed:[],notifications:[],endings:[],choices:[],messages:{},time:"12:00",trace:[],ui:{game}} as Runtime;
}
const saved=(state:Record<string,unknown>)=>JSON.stringify(state);

describe("dynamic home recording card",()=>{
  it("shows the true EP04 first scene and resumes the saved CAM playback position",()=>{
    const game={episode4:saved({episode:4,phase:"story",line:0,pair:[],recorded:[]})};
    const progress=resolveHomeProgress(runtime(1,game,{completedEpisodes:"[1,2,3]"}));
    expect(progress.currentEpisode).toBe(4);
    expect(progress.title).toBe("写给X的信");
    expect(progress.sceneIndex).toBe(1);
    expect(progress.sceneCount).toBe(12);
    expect(progress.resumeApp).toBe("camera");
    const refreshed=resolveHomeProgress(JSON.parse(JSON.stringify(runtime(1,game,{completedEpisodes:"[1,2,3]"}))) as Runtime);
    expect(refreshed).toEqual(progress);
  });

  it("keeps dialogue and phase routing in sync for a saved EP04 scene",()=>{
    const sms=resolveHomeProgress(runtime(4,{episode4:saved({episode:4,phase:"sms",line:7})}));
    expect(sms.resumeApp).toBe("messages");
    expect(sms.dialogueIndex).toBe(8);
    const activity=resolveHomeProgress(runtime(4,{episode4:saved({episode:4,phase:"activity",line:2,ep04Letters:{ZZX:{reactionViewed:true,observationViewed:true}}})}));
    expect(activity.resumeApp).toBe("camera");
    expect(activity.sceneIndex).toBe(4);
  });

  it("migrates an already delivered EP04 SMS save directly to editing",()=>{
    const sms=resolveHomeProgress(runtime(4,{episode4:saved({episode:4,phase:"sms",line:11,sent:true,ep04SmsCompleted:true,sms:{ZZX:"SXH",SXH:"ZZX",ZJ:"ZZY",ZZY:"ZJ",ZH:"ZZX"},smsFrozen:{ZZX:{body:"frozen"}},recorded:["D04_CLIP_LIVING_REMOTE"]})}));
    expect(sms.resumeApp).toBe("bilibili");
    expect(sms.sceneLabel).toBe("正片剪辑");
    expect(sms.sceneIndex).toBe(12);
  });

  it("resumes legacy EP05 after delivered SMS at the editor",()=>{
    const savedGame={episode5:saved({episode:5,phase:"sms",sent:true,smsFrozen:{ZJ:{body:"kept"}},recorded:["D05-BREAKFAST-CAM01"]})};
    const progress=resolveHomeProgress(runtime(5,savedGame,{completedEpisodes:"[1,2,3,4]"}));
    expect(progress.currentEpisode).toBe(5);
    expect(progress.resumeApp).toBe("bilibili");
    expect(progress.sceneLabel).toBe("正片剪辑");
  });
  it("keeps the EP05 evening mainline but migrates a dispatched legacy night save",()=>{
    const evening=resolveHomeProgress(runtime(5,{episode5:saved({episode:5,phase:"activity",ep05Stage:"NIGHT",sent:false})},{completedEpisodes:"[1,2,3,4]"}));
    expect(evening.sceneLabel).toBe("晚饭后主线");
    const oldNight=resolveHomeProgress(runtime(5,{episode5:saved({episode:5,phase:"kcNight",ep05Stage:"NIGHT",sent:true})},{completedEpisodes:"[1,2,3,4]"}));
    expect(oldNight.resumeApp).toBe("bilibili");
    expect(oldNight.sceneLabel).toBe("正片剪辑");
  });

  it("resumes an unfinished valid post-SMS scene without losing it",()=>{
    const postSms=resolveHomeProgress(runtime(4,{episode4:saved({episode:4,phase:"kcNight",sent:true,kcNightProgress:{客厅:3},kcNightConversationViewed:false})}));
    expect(postSms.resumeApp).toBe("camera");
    expect(postSms.sceneLabel).toBe("深夜观察");
    const finished=resolveHomeProgress(runtime(4,{episode4:saved({episode:4,phase:"kcNight",sent:true,kcNightProgress:{客厅:7},kcNightConversationViewed:true})}));
    expect(finished.resumeApp).toBe("bilibili");
    expect(finished.sceneLabel).toBe("正片剪辑");
  });

  it("advances completed EP04 to EP05 when the release manifest allows it",()=>{
    const current=resolveHomeProgress(runtime(5,{episode4:saved({episode:4,phase:"complete"})},{completedEpisodes:"[1,2,3,4]"}));
    expect(current.currentEpisode).toBe(5);
    expect(current.title).toBe("你在看谁");
    expect(current.completed).toBe(false);
    expect(current.resumeApp).toBe("camera");
  });

  it("restores EP05 director selection, SMS, edit and broadcast stages from the active episode save",()=>{
    const selection=resolveHomeProgress(runtime(5,{episode5:saved({episode:5,phase:"decision",ep05Stage:"ROUND2_SELECTION",ep05Rounds:[{roundId:"round1"}]})}));
    expect(selection.resumeApp).toBe("reminders");
    expect(selection.sceneLabel).toBe("安排第二轮嘉宾");
    const sms=resolveHomeProgress(runtime(5,{episode5:saved({episode:5,phase:"sms",ep05Stage:"EDITING",sent:true})}));
    expect(sms.resumeApp).toBe("bilibili");
    expect(sms.sceneLabel).toBe("正片剪辑");
    const aired=resolveHomeProgress(runtime(5,{episode5:saved({episode:5,phase:"social",ep05Stage:"BROADCAST",broadcastId:"stable-broadcast",visits:["weibo"]})}));
    expect(aired.resumeApp).toBe("forum");
    expect(aired.sceneLabel).toBe("观众讨论");
  });

  it("migrates an older EP05 activity save with its selected pair instead of returning to breakfast",()=>{
    const legacy=resolveHomeProgress(runtime(5,{episode5:saved({episode:5,phase:"activity",line:4,pair:["ZZX","SXH"],recorded:["D05-GC-READY"]})}));
    expect(legacy.resumeApp).toBe("camera");
    expect(legacy.sceneLabel).toBe("第一轮对视任务");
    expect(legacy.dialogueIndex).toBeGreaterThan(1);
    const oldNight=resolveHomeProgress(runtime(5,{episode5:saved({episode:5,phase:"activity",ep05Stage:"NIGHT",sent:false,ep05NightIndex:2})}));
    expect(oldNight.resumeApp).toBe("camera");
    expect(oldNight.sceneLabel).toBe("晚饭后主线");
  });

  it("shows a completed and waiting card when the next release is not available",()=>{
    const release=episodeManifest.map(entry=>({...entry,available:entry.episode<=4}));
    const progress=resolveHomeProgress(runtime(5,{episode4:saved({episode:4,phase:"complete"})},{completedEpisodes:"[1,2,3,4]"}),release);
    expect(progress.currentEpisode).toBe(4);
    expect(progress.completed).toBe(true);
    expect(progress.waitingForNext).toBe(true);
    expect(progress.nextEpisode).toBe(5);
  });

  it("shows start for the engine's untouched gameDay=1 state and keeps mode saves isolated",()=>{
    const fresh=resolveHomeProgress(runtime(1,{}, {seasonStarted:true}));
    expect(fresh.started).toBe(false);
    const classic=runtime(4,{episode4:saved({episode:4,phase:"story",line:3})},{gameMode:"A"});
    const free=runtime(2,{episode2:saved({episode:2,step:"shopping",line:1})},{gameMode:"C"});
    expect(resolveHomeProgress(classic).currentEpisode).toBe(4);
    expect(resolveHomeProgress(free).currentEpisode).toBe(2);
  });

  it("offers an explicit EP08 timeline migration for old EP11-14 saves without deleting them",()=>{
    const old=runtime(14,{episode8:saved({episode:8,phase:"social",sent:true,recorded:["old-ep08-clip"]}),episode14:saved({episode:14,phase:"complete",recorded:["old-finale"]})},{completedEpisodes:"[1,2,3,4,5,6,7,8,9,10,11,12,13,14]"});
    const progress=resolveHomeProgress(old);
    expect(progress.currentEpisode).toBe(8);
    expect(progress.completed).toBe(false);
    expect(progress.legacyTimelineArchived).toBe(true);
    expect(progress.resumeApp).toBe("camera");
    expect(old.ui?.game?.episode14).toContain("old-finale");
    expect(old.ui?.game?.episode8).toContain("old-ep08-clip");
  });

  it("resumes EP09 and EP10 from their canonical phase after the season migration is confirmed",()=>{
    const ep9=resolveHomeProgress(runtime(14,{episode9:saved({episode:9,phase:"decision",line:0})},{seasonTimelineV16:"16.1",completedEpisodes:"[1,2,3,4,5,6,7,8]"}));
    expect(ep9.currentEpisode).toBe(9);expect(ep9.resumeApp).toBe("reminders");expect(ep9.title).toBe("没说出口的话");
    const ep10=resolveHomeProgress(runtime(14,{episode10:saved({episode:10,phase:"finale",line:0})},{seasonTimelineV16:"16.1",completedEpisodes:"[1,2,3,4,5,6,7,8,9]"}));
    expect(ep10.currentEpisode).toBe(10);expect(ep10.resumeApp).toBe("camera");expect(ep10.title).toBe("这次换我走向你");
  });
});
