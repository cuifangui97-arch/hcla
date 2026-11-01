import type { GuestId } from "./day1-data";
import "./guest-avatar.css";

const portraits: Record<GuestId, { src: string; name: string }> = {
  ZZX: { src: "zhuzhixin.jpg", name: "朱志鑫" },
  SXH: { src: "suxinhao.jpg", name: "苏新皓" },
  ZJ: { src: "zhangji.jpg", name: "张极" },
  ZZY: { src: "zhangzeyu.jpg", name: "张泽禹" },
  ZH: { src: "zuohang.jpg", name: "左航" },
};

const idsByName = Object.fromEntries(
  Object.entries(portraits).map(([id, person]) => [person.name, id]),
) as Record<string, GuestId>;

export const guestIdForName = (name: string) => idsByName[name];

export function GuestAvatar({
  id,
  className = "",
}: {
  id: GuestId;
  className?: string;
}) {
  const person = portraits[id];
  return (
    <img
      className={`guest-portrait ${className}`.trim()}
      src={`${import.meta.env.BASE_URL}assets/avatars/${person.src}`}
      alt={`${person.name}头像`}
      draggable={false}
      loading="lazy"
    />
  );
}
