import source from "./sms-x-ep01-10-v17.json";
import type { GuestId } from "./day1-data";

export type SmsKind = "confirmed_x_pair" | "confirmed_x_generic" | "confirmed_x_prop" | "non_x_fallback";
type V17Row = { id:string; episode:number; senderId:string; recipientId:string|null; text:string; kind:SmsKind; variant:string; isOfficialXRequired:boolean; requiresAll:string[]; appliesTo:string; pair:string|null; anonymous:boolean; archiveVersion:string };
export type SmsCorpusMessage = V17Row;
export type FrozenSms = { id:string; senderId:GuestId; recipientId:GuestId; body:string };
export type SmsSelectionContext = { episode:number; senderId:GuestId; recipientId:GuestId; relationshipMode:string; formalExPairs:[GuestId,GuestId][]; occurredEvents:string[]; previouslyUsedIds:string[]; previouslyUsedTexts?:string[]; saveId:string };

const cast:Record<string,GuestId>={zzx:"ZZX",sxh:"SXH",zj:"ZJ",zzy:"ZZY",zh:"ZH"};
const inverse=Object.fromEntries(Object.entries(cast).map(([a,b])=>[b,a])) as Record<GuestId,string>;
const rows=(source as {messages:V17Row[];recordCount:number}).messages;
const stableHash=(value:string)=>{let h=2166136261;for(const c of value)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
const pairKey=(a:GuestId,b:GuestId)=>[a,b].sort().join("|");
export function isFormalSmsPair(a:GuestId,b:GuestId,pairs:[GuestId,GuestId][]){return pairs.some(([x,y])=>pairKey(x,y)===pairKey(a,b));}

/** V17 is the only selectable pool. Empty recipientId denotes a recipient-neutral authored fallback. */
export function smsCandidatePool(context:Omit<SmsSelectionContext,"previouslyUsedIds"|"saveId">){
 const sender=inverse[context.senderId],recipient=inverse[context.recipientId]; if(!sender||!recipient||sender===recipient||context.episode<1||context.episode>10)return [];
 const isX=isFormalSmsPair(context.senderId,context.recipientId,context.formalExPairs);
 const occurred=new Set(context.occurredEvents);
 return rows.filter(row=>{
  if(row.episode!==context.episode||row.senderId!==sender||(row.recipientId&&row.recipientId!==recipient))return false;
  if(row.appliesTo!=="ALL"&&row.appliesTo!==context.relationshipMode)return false;
  if(row.isOfficialXRequired!==isX)return false;
  if(row.kind==="non_x_fallback"&&isX)return false;
  if(row.kind!=="non_x_fallback"&&!isX)return false;
  return row.requiresAll.every(tag=>occurred.has(tag)||occurred.has(`${tag}:${context.senderId}`)||occurred.has(`${tag}:${context.senderId}:${context.recipientId}`));
 });
}

/** Strict adapter: only explicit semantic flags or exact episode evidence mappings count. */
const itemTag:Record<string,string>={ZZ_BLINDBOX:"sender_saw_blindbox",ZZ_BIRTHDAY_ART:"sender_saw_birthday_drawing",ZZ_WATER_VOUCHER:"sender_saw_water_voucher",ZZ_SPORTS_2024:"sender_saw_2024_sports_photo",ZZ_KOREA_CHILDHOOD:"sender_saw_childhood_korea_photo",ZZ_SHIRO:"sender_saw_shiro_plush",SX_PEACH_CANDY:"sender_saw_peach_candy",SX_BIRTHDAY_CAKE:"sender_saw_first_cake",SX_PIG_PLUSH:"sender_saw_pig_plush",SX_FRIED_EGG:"sender_saw_fried_egg",SX_WATER_GAME:"sender_saw_water_game_photo",SX_POLAROID:"sender_saw_answer_polaroid"};
export function smsSemanticEvents(input:{episode:number;evidenceIds:string[];involvedGuests?:GuestId[];completed?:boolean;semanticEvents?:string[];pairEvidence?:{tag:string;pair:GuestId[]}[]}){
 const events=new Set(input.semanticEvents??[]);
 for(const {tag,pair} of input.pairEvidence??[]){if(pair.length===2&&pair[0]!==pair[1]){events.add(`${tag}:${pair[0]}:${pair[1]}`);events.add(`${tag}:${pair[1]}:${pair[0]}`);}}
 const exact:Record<number,Record<string,string>>={1:{"D01-008":"group_dinner_shared"},2:{"D02-004":"shopping_together"},3:{"D03-003":"first_date_paired","D03-004":"first_date_paired"}};
 for(const id of input.evidenceIds){const tag=exact[input.episode]?.[id];if(tag&&input.episode===1)events.add(tag);}
 for(const id of input.evidenceIds){
  const normalized=id.replace(/^E08_KC_/,"").replace(/^E08-KC-/,"");
  if(input.episode===8&&itemTag[normalized]){const owner=normalized.startsWith("ZZ_")?"ZZX":normalized.startsWith("SX_")?"SXH":null;if(owner)events.add(`${itemTag[normalized]}:${owner}`);}
  // A successful exact E08 cabinet interaction proves the sender explored their own room only.
  if(input.episode===8&&Object.keys(itemTag).includes(normalized)){const owner=normalized.startsWith("ZZ_")?"ZZX":normalized.startsWith("SX_")?"SXH":null;if(owner)events.add(`sender_explored_xroom:${owner}`);}
 }
 return [...events];
}

export function selectSms(context:SmsSelectionContext):FrozenSms{
 const pool=smsCandidatePool(context),usedTexts=context.previouslyUsedTexts??[];
 const unused=pool.filter(row=>!context.previouslyUsedIds.includes(row.id)&&!usedTexts.includes(row.text));
 if(!unused.length)throw new Error(`V17短信无合格候选：EP${String(context.episode).padStart(2,"0")} ${context.senderId}→${context.recipientId}；请检查正式X、已发生事件标签及历史去重。`);
 const preferred=["confirmed_x_prop","confirmed_x_pair","confirmed_x_generic","non_x_fallback"];
 const priority=Math.min(...unused.map(row=>preferred.indexOf(row.kind)));
 const top=unused.filter(row=>preferred.indexOf(row.kind)===priority);
 const selected=top[stableHash(`${context.saveId}:${context.episode}:${context.senderId}:${context.recipientId}`)%top.length];
 return {id:selected.id,senderId:context.senderId,recipientId:context.recipientId,body:selected.text};
}
export function selectSmsBatch(contexts:SmsSelectionContext[]):FrozenSms[]{
 const chosen:FrozenSms[]=[],nightTexts:string[]=[];
 for(const context of contexts){const message=selectSms({...context,previouslyUsedTexts:[...(context.previouslyUsedTexts??[]),...nightTexts]});chosen.push(message);nightTexts.push(message.body);}
 return chosen;
}

export function smsCorpusValidation(){
 const ids=new Set<string>(),errors:string[]=[];
 for(const row of rows){if(ids.has(row.id))errors.push(`重复ID: ${row.id}`);ids.add(row.id);if(!cast[row.senderId]||row.recipientId&&!cast[row.recipientId])errors.push(`未知人物: ${row.id}`);if(row.recipientId===row.senderId)errors.push(`自发自收: ${row.id}`);if(row.episode<1||row.episode>10||!row.text.trim()||row.anonymous!==true)errors.push(`无效字段: ${row.id}`);if(!Array.isArray(row.requiresAll)||typeof row.appliesTo!=="string")errors.push(`缺失条件: ${row.id}`);}
 return {count:rows.length,errors};
}
export function smsUsageFromGameUi(gameUi:Record<string,unknown>|undefined,senderId?:GuestId){
 const frozen:FrozenSms[]=[];
 for(const value of Object.values(gameUi??{})){if(typeof value!=="string")continue;try{const parsed=JSON.parse(value) as {smsFrozen?:Record<string,FrozenSms>};for(const msg of Object.values(parsed.smsFrozen??{}))if(msg&&typeof msg.id==="string"&&typeof msg.body==="string"&&(!senderId||msg.senderId===senderId))frozen.push(msg);}catch{/* unrelated UI save */}}
 return {ids:frozen.map(x=>x.id),texts:frozen.map(x=>x.body)};
}
export function smsCorpusMessages(){return rows;}
