import { TYPE_LABELS } from "@/lib/constants";

const TYPE_COLORS: Record<string, string> = {
  feuer: "bg-type-feuer/20 text-type-feuer",
  wasser: "bg-type-wasser/20 text-type-wasser",
  stein: "bg-type-stein/20 text-type-stein",
  luft: "bg-type-luft/20 text-type-luft",
  blitz: "bg-type-blitz/20 text-type-blitz",
  eis: "bg-type-eis/20 text-type-eis",
  gift: "bg-type-gift/20 text-type-gift",
  licht: "bg-type-licht/20 text-type-licht",
  schatten: "bg-type-schatten/20 text-type-schatten",
};

export default function TypeBadge({ type }: { type: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[type] || ""}`}>
      {TYPE_LABELS[type] || type}
    </span>
  );
}
