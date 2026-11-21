import BlueprintLauncher from "@/components/thirty/BlueprintLauncher";
import type { ExampleLinkItem } from "@/components/thirty/ExampleLinks";
import { HEADLINE } from "@/lib/thirty/homeCopy";
import { HomeStage } from "./HomeStage";

export function ClassicHome({ examples }: { examples: readonly ExampleLinkItem[] }) {
  return (
    <HomeStage design="classic">
      <div className="container-narrow w-full relative pb-3 pt-[max(5.5rem,calc(42dvh-14rem))] sm:pt-[max(5.5rem,calc(50dvh-15rem))]">
        <div className="mx-auto max-w-2xl">
          <h1 id="home-title" className="heading-hero thirty-hero mb-8 md:mb-10 text-balance">
            {HEADLINE}.
          </h1>
          <BlueprintLauncher examples={examples} />
        </div>
      </div>
    </HomeStage>
  );
}
