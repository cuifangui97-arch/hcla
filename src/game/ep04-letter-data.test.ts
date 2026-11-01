import { describe, expect, it } from "vitest";
import source from "./ep04-letters.json";
import { ep04LetterMaterials, ep04Reaction } from "./ep04-letter-data";

describe("EP04 locked introduction letters", () => {
  it("includes complete locked letters and five complete no-X profile cards", () => {
    expect(source.letters).toHaveLength(8);
    expect(source.profiles).toHaveLength(5);
    for (const material of [...source.letters, ...source.profiles]) {
      expect(material.body.split(/\r?\n\r?\n+/).filter((part) => part.trim().length > 0).length).toBeGreaterThanOrEqual(material.kind === "letter" ? 5 : 4);
    }
    expect(source.warning).toContain("虚构平行世界");
    expect(source.letters.find((item) => item.id === "LETTER-GC-01")?.body).toContain("但请不要因此觉得，他不需要被爱。");
  });

  it.each([
    ["A", "LETTER-JY-01", "LETTER-JY-02", "PROFILE-ZH｜左航"],
    ["B", "LETTER-JH-01", "PROFILE-ZZY｜张泽禹", "LETTER-JH-02"],
    ["C", "PROFILE-ZJ｜张极", "PROFILE-ZZY｜张泽禹", "PROFILE-ZH｜左航"],
    ["D", "PROFILE-ZJ｜张极", "LETTER-MH-01", "LETTER-MH-02"],
  ])("selects mode %s recipient material without inventing an X", (mode, zJ, zzy, zh) => {
    const materials = ep04LetterMaterials(mode);
    expect(materials.map((item) => item.id)).toEqual(["LETTER-GC-01", "LETTER-GC-02", zJ, zzy, zh]);
    expect(materials.filter((item) => item.kind === "profile").every((item) => item.label === "节目组个人介绍卡")).toBe(true);
  });

  it("uses the saved pair mapping for mode E rather than rerolling", () => {
    const saved = [["ZZX", "SXH"], ["ZJ", "ZH"]] as ["ZZX"|"SXH"|"ZJ"|"ZZY"|"ZH", "ZZX"|"SXH"|"ZJ"|"ZZY"|"ZH"][];
    const materials = ep04LetterMaterials("E", saved);
    expect(materials.find((item) => item.recipientId === "ZJ")?.id).toBe("LETTER-JH-01");
    expect(materials.find((item) => item.recipientId === "ZH")?.id).toBe("LETTER-JH-02");
    expect(materials.find((item) => item.recipientId === "ZZY")?.label).toBe("节目组个人介绍卡");
  });

  it("keeps X authors internal and supplies distinct read reactions", () => {
    const materials = ep04LetterMaterials("A");
    expect(materials.find((item) => item.recipientId === "ZZX")?.authorId).toBe("SXH");
    expect(materials.find((item) => item.recipientId === "ZZX")?.label).toBe("来自X");
    expect(ep04Reaction("ZZX", "A")).not.toEqual(ep04Reaction("ZJ", "A"));
  });
});
