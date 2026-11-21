import type { ExampleLinkItem } from "@/components/thirty/ExampleLinks";
import { DraftingTableContent } from "./DraftingTableContent";
import { HomeStage } from "./HomeStage";

export function DraftingTableHome({ examples }: { examples: readonly ExampleLinkItem[] }) {
  return (
    <HomeStage design="drafting-table" glow={false} className="drafting-paper">
      <DraftingTableContent examples={examples} />
    </HomeStage>
  );
}
