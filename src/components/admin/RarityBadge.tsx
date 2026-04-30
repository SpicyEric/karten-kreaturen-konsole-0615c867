import { RARITY_LABELS } from "@/lib/constants";

const RARITY_COLORS: Record<string, string> = {
  gewoehnlich: "bg-rarity-gewoehnlich/20 text-rarity-gewoehnlich",
  selten: "bg-rarity-selten/20 text-rarity-selten",
  episch: "bg-rarity-episch/20 text-rarity-episch",
  legendaer: "bg-rarity-legendaer/20 text-rarity-legendaer",
};

export default function RarityBadge({ rarity }: { rarity: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${RARITY_COLORS[rarity] || ""}`}>
      {RARITY_LABELS[rarity] || rarity}
    </span>
  );
}
