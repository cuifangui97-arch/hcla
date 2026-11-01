import { describe, expect, it } from "vitest";
import { isNearChatBottom } from "./SceneChatStream";

describe("shared episode chat stream scroll threshold", () => {
  it("keeps following while within 48px of the bottom", () => {
    expect(isNearChatBottom(0)).toBe(true);
    expect(isNearChatBottom(47)).toBe(true);
    expect(isNearChatBottom(48)).toBe(false);
  });

  it("does not force the viewer back while reading up or when scrolled beyond the content", () => {
    expect(isNearChatBottom(49)).toBe(false);
    expect(isNearChatBottom(-1)).toBe(false);
  });
});
