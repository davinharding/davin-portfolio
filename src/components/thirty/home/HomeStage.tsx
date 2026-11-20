import Layout from "@/components/HeaderFooter";
import LegacyHashRedirect from "@/components/thirty/LegacyHashRedirect";
import type { HomeDesign } from "@/lib/experiments/homeDesign";
import { cn } from "@/lib/utils";
import { HomeView } from "./HomeView";

type HomeStageProps = {
  design: HomeDesign;
  /** The accent glow that follows the run step. Off for designs with their own background. */
  glow?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** The frame every homepage design sits in: header, one full-height stage, footer. */
export function HomeStage({ design, glow = true, className, children }: HomeStageProps) {
  return (
    <Layout page="index" fitViewport>
      <LegacyHashRedirect />
      <HomeView design={design} />
      <section
        data-thirty-stage
        data-step="idle"
        aria-labelledby="home-title"
        className={cn("relative flex flex-1 flex-col bg-background", glow && "thirty-stage", className)}
      >
        {children}
      </section>
    </Layout>
  );
}
