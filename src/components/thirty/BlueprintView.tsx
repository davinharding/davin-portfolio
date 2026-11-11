import Link from "next/link";
import { RotateCcw, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublishedProjects, projectPath } from "@/data/projectData";
import { getCatalogEntry } from "@/lib/thirty/projectCatalog";
import type { StoredBlueprint } from "@/lib/thirty/schema";
import { AgentCard, type RelatedProjectLink } from "./AgentCard";
import { CallCta } from "./CallCta";
import { CopyLinkButton } from "./CopyLinkButton";
import { OrgChart } from "./OrgChart";
import { RunReceipt } from "./RunReceipt";

const SITE_URL = "https://www.davin.io";
const REMOVAL_EMAIL = "davinlharding+dev@gmail.com";

function draftedOn(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

/** Catalog keys resolve only to projects that are still published; anything else is dropped. */
function relatedLink(key: string): RelatedProjectLink | null {
  if (key === "none") return null;
  const entry = getCatalogEntry(key);
  if (!entry) return null;
  const project = getPublishedProjects().find((p) => p.name === entry.projectName);
  if (!project) return null;
  return { href: projectPath(project.name), projectName: project.name, relevance: entry.relevance };
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="py-8 md:py-10 border-t border-border">
      <h2 id={id} className="text-meta mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function BlueprintView({ blueprint: stored }: { blueprint: StoredBlueprint }) {
  const { company, source, blueprint } = stored;
  const isExample = stored.kind === "example";
  const host = source.host;

  return (
    <article className="container-narrow pt-24 pb-16">
      <header className="pb-8">
        <p className="text-meta mb-2">Agent blueprint for</p>
        <h1 className="heading-hero break-words">{company.name}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {host}
          {draftedOn(stored.createdAt) ? <> · Drafted {draftedOn(stored.createdAt)}</> : null}
        </p>
        <p className="mt-4 max-w-3xl rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          {isExample
            ? "Example run. Not affiliated with or endorsed by the company."
            : `Drafted automatically from ${host}'s public website. Not reviewed by a human, and not affiliated with or endorsed by the company.`}
          {source.method === "search"
            ? " Based on web search results, because the site did not load for a bot."
            : null}
        </p>
      </header>

      <section aria-labelledby="thesis" className="pb-10">
        <h2 id="thesis" className="sr-only">
          Thesis
        </h2>
        <p className="text-2xl md:text-3xl font-medium leading-snug tracking-tight text-foreground max-w-4xl">
          {blueprint.headline}
        </p>
      </section>

      <Section id="what-i-read" title="What I read">
        <dl className="grid gap-4 md:grid-cols-3 text-sm">
          <div>
            <dt className="text-muted-foreground mb-1">What they do</dt>
            <dd className="text-foreground/90 leading-relaxed">{company.oneLiner || "Not stated on the site."}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground mb-1">What they sell</dt>
            <dd className="text-foreground/90 leading-relaxed">
              {company.offerings.length > 0 ? company.offerings.join(", ") : "Not stated on the site."}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground mb-1">Who buys it</dt>
            <dd className="text-foreground/90 leading-relaxed">{company.customers || "Not stated on the site."}</dd>
          </div>
        </dl>
      </Section>

      <Section id="the-team" title="The team">
        <OrgChart agents={blueprint.agents} companyName={company.name} />
      </Section>

      <Section id="agents" title="The agents">
        <div className="grid gap-5 lg:grid-cols-2">
          {blueprint.agents.map((agent, i) => (
            <AgentCard
              key={agent.name}
              agent={agent}
              index={i}
              related={relatedLink(agent.relatedProject)}
              isFirstBuild={agent.name === blueprint.firstBuild.agentName}
            />
          ))}
        </div>
      </Section>

      <Section id="first" title="Build this one first">
        <p className="text-lg font-semibold text-foreground">{blueprint.firstBuild.agentName}</p>
        {blueprint.firstBuild.why ? <p className="text-body mt-1 max-w-3xl">{blueprint.firstBuild.why}</p> : null}
        {blueprint.firstBuild.scope.length > 0 ? (
          <>
            <p className="mt-4 mb-2 text-sm font-medium text-foreground">First version</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90 marker:text-primary max-w-3xl">
              {blueprint.firstBuild.scope.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </>
        ) : null}
      </Section>

      <Section id="not-obvious" title="What is not obvious">
        <p className="text-lg leading-relaxed text-foreground max-w-3xl">{blueprint.nonObvious}</p>
      </Section>

      {blueprint.caveats.length > 0 ? (
        <Section id="caveats" title="Caveats">
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground max-w-3xl">
            {blueprint.caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      <section aria-label="Next steps" className="py-8 md:py-10 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start gap-3">
          <CallCta />
          <CopyLinkButton fallbackUrl={`${SITE_URL}/b/${stored.slug}`} />
          <Button asChild variant="ghost" size="lg">
            <Link href="/">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Run another
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/work">
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              See my work
            </Link>
          </Button>
        </div>
      </section>

      <Section id="receipt" title="Run receipt">
        <RunReceipt blueprint={stored} />
      </Section>

      <p className="pt-6 border-t border-border text-xs text-muted-foreground">
        Is this your company and you want it gone?{" "}
        <a
          href={`mailto:${REMOVAL_EMAIL}?subject=${encodeURIComponent(`Remove blueprint ${stored.slug}`)}`}
          className="underline underline-offset-2 hover:text-foreground"
        >
          Email me.
        </a>
      </p>
    </article>
  );
}
