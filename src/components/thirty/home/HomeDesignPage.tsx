import type { HomeDesign } from "@/lib/experiments/homeDesign";
import { EXAMPLE_LINKS } from "@/lib/thirty/examples";
import { sampleTeams } from "@/lib/thirty/sampleTeams";
import { ClassicHome } from "./ClassicHome";
import { DraftingTableHome } from "./DraftingTableHome";
import { OpenRolesHome } from "./OpenRolesHome";

export function HomeDesignPage({ design }: { design: HomeDesign }) {
  switch (design) {
    case "open-roles":
      return <OpenRolesHome teams={sampleTeams()} />;
    case "drafting-table":
      return <DraftingTableHome examples={EXAMPLE_LINKS} />;
    case "classic":
      return <ClassicHome examples={EXAMPLE_LINKS} />;
  }
}
