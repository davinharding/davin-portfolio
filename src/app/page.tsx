import MainContent from "@/components/MainContent";
import Timeline from "@/components/Timeline";
import Layout from "@/components/HeaderFooter";
import SkillBadgeSection from "@/components/SkillBadgeSection";
import { ProjectsSection } from "@/components/ProjectsSection";

export default function Home() {
  return (
    <Layout page="index">
      <div className="bg-background text-foreground">
        <MainContent />
        <ProjectsSection />
        <SkillBadgeSection />
        <Timeline />
      </div>
    </Layout>
  );
}
