import source from "./ep04-letters.json";
import type { GuestId } from "./day1-data";

export type Ep04LetterMaterial = {
  id: string;
  recipientId: GuestId;
  title: string;
  kind: "letter" | "profile";
  label: "来自X" | "节目组个人介绍卡";
  body: string;
  /** Internal metadata only. Never render before EP13. */
  authorId?: GuestId;
};

const names: Record<GuestId, string> = { ZZX: "朱志鑫", SXH: "苏新皓", ZJ: "张极", ZZY: "张泽禹", ZH: "左航" };
const profiles = new Map(source.profiles.map((item) => [item.id.split("｜")[1], item]));
const letterById = new Map(source.letters.map((item) => [item.id, item]));
const pairs: Record<string, [GuestId, GuestId][]> = {
  A: [["ZZX", "SXH"], ["ZJ", "ZZY"]],
  B: [["ZZX", "SXH"], ["ZJ", "ZH"]],
  C: [["ZZX", "SXH"]],
  D: [["ZZX", "SXH"], ["ZZY", "ZH"]],
  E: [["ZZX", "SXH"], ["ZJ", "ZZY"]],
};
const letterIds: Record<string, Partial<Record<GuestId, string>>> = {
  "SXH-ZZX": { ZZX: "LETTER-GC-01", SXH: "LETTER-GC-02" },
  "ZJ-ZZY": { ZJ: "LETTER-JY-01", ZZY: "LETTER-JY-02" },
  "ZH-ZJ": { ZJ: "LETTER-JH-01", ZH: "LETTER-JH-02" },
  "ZH-ZZY": { ZZY: "LETTER-MH-01", ZH: "LETTER-MH-02" },
};
const key = (pair: GuestId[]) => [...pair].sort().join("-");

export function ep04LetterMaterials(mode: string, savedPairs?: [GuestId, GuestId][]): Ep04LetterMaterial[] {
  const chosenPairs = savedPairs?.length ? savedPairs : pairs[mode] ?? pairs.C;
  const byRecipient = new Map<GuestId, Ep04LetterMaterial>();
  for (const pair of chosenPairs) {
    const mapping = letterIds[key(pair)];
    if (!mapping) continue;
    for (const recipientId of pair) {
      const id = mapping[recipientId];
      const item = id ? letterById.get(id) : undefined;
      if (item) byRecipient.set(recipientId, { id: item.id, recipientId, title: item.title, kind: "letter", label: "来自X", body: item.body, authorId: pair.find((id) => id !== recipientId) });
    }
  }
  return (["ZZX", "SXH", "ZJ", "ZZY", "ZH"] as GuestId[]).map((recipientId) => {
    const letter = byRecipient.get(recipientId);
    if (letter) return letter;
    const profile = profiles.get(names[recipientId]);
    if (!profile) throw new Error(`EP04 缺少 ${names[recipientId]} 的个人介绍卡。`);
    return { id: profile.id, recipientId, title: profile.title, kind: "profile", label: "节目组个人介绍卡", body: profile.body };
  });
}

export function ep04Reaction(recipient: GuestId, mode: string): string[] {
  if (recipient === "ZZX") return ["他读到最后一段时停了一会儿，轻轻把信纸抚平。", "朱志鑫：“这个人写得有点……太了解了。”"];
  if (recipient === "SXH") return ["苏新皓把纸重新折齐，没有看向镜头。", "苏新皓：“我知道。”"];
  if ((mode === "A" || mode === "E") && recipient === "ZJ") return ["张极把信折好，又低头看了一眼刚才读过的那行。", "张极：“并排走路和牵着手走路，原来不是一回事。”"];
  if ((mode === "A" || mode === "E") && recipient === "ZZY") return ["张泽禹看完后没有马上放下信，手指停在折痕边。", "张泽禹：“他记得我很多年的样子，但我也可以继续往前走。”"];
  if (mode === "B" && recipient === "ZJ") return ["张极先笑了一下，随后把视线落回信纸。", "张极：“玩笑讲到最后，我反而不敢认真说了。”"];
  if (mode === "B" && recipient === "ZH") return ["左航把信放在桌上，安静地坐了一会儿。", "左航：“你可以把话说完，我会听。”"];
  if (mode === "D" && recipient === "ZZY") return ["张泽禹读到中间轻轻吸了口气，把信转回正面。", "张泽禹：“先等到的人，不一定先学会说。”"];
  if (mode === "D" && recipient === "ZH") return ["左航把折好的信放回信封，没有急着接话。", "左航：“这次可以慢慢讲。”"];
  if (recipient === "ZJ") return ["张极把信读完，先看了眼其他人，像是在确认大家都还好。", "张极：“有些友谊不需要一个标准答案。”"];
  if (recipient === "ZZY") return ["张泽禹读完后点点头，把信纸沿折线收好。", "张泽禹：“也有人只是错过了合适的时机。”"];
  return ["左航安静读完，抬头时神情放松了一些。", "左航：“我更期待接下来认识新的人。”"];
}

export function ep04ClipIds(recipient: GuestId) {
  return { body: `EP04-LETTER-BODY-${recipient}`, reaction: `EP04-LETTER-REACTION-${recipient}` };
}
