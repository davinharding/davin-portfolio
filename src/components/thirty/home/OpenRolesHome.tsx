import type { SampleTeam } from "@/lib/thirty/sampleTeams";
import { HomeStage } from "./HomeStage";
import { OpenRolesContent } from "./OpenRolesContent";

export function OpenRolesHome({ teams }: { teams: readonly SampleTeam[] }) {
  return (
    <HomeStage design="open-roles">
      <OpenRolesContent teams={teams} />
    </HomeStage>
  );
}
