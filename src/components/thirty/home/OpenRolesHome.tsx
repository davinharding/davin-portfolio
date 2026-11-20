import type { SampleTeam } from "@/lib/thirty/sampleTeams";
import { HomeStage } from "./HomeStage";
import { OpenRolesContent } from "./OpenRolesContent";

/** The Open roles homepage: the blueprint's org chart sits under the form, waiting for hires. */
export function OpenRolesHome({ teams }: { teams: readonly SampleTeam[] }) {
  return (
    <HomeStage design="open-roles">
      <OpenRolesContent teams={teams} />
    </HomeStage>
  );
}
