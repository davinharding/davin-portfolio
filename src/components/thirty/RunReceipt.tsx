import type { StoredBlueprint } from "@/lib/thirty/schema";

function seconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

function PageList({ pages }: { pages: StoredBlueprint["source"]["pages"] }) {
  if (pages.length === 0) return <p className="text-muted-foreground">No pages were fetched.</p>;
  return (
    <ul className="space-y-1">
      {pages.map((p) => (
        <li key={p.url} className="break-all">
          <a
            href={p.url}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="text-foreground/90 underline decoration-border underline-offset-2 hover:decoration-primary"
          >
            {p.title || p.url}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function RunReceipt({ blueprint }: { blueprint: StoredBlueprint }) {
  const { receipt, source } = blueprint;

  if (!receipt) {
    return (
      <div className="text-sm space-y-3">
        <p className="text-foreground font-medium">Curated example</p>
        <p className="text-muted-foreground">
          Written by hand from the company&apos;s public pages to show the standard a live run is held to. There is
          no run time, token count, or cost to report.
        </p>
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-1">Pages read</p>
          <PageList pages={source.pages} />
        </div>
      </div>
    );
  }

  const rows: Array<[string, string]> = [
    ["Total time", seconds(receipt.totalMs)],
    [
      "Models",
      [
        `research: ${receipt.models.research}`,
        `blueprint: ${receipt.models.blueprint}`,
        receipt.models.search ? `search: ${receipt.models.search}` : null,
      ]
        .filter(Boolean)
        .join(", "),
    ],
    ["Tokens", `${receipt.tokens.input.toLocaleString("en-US")} in, ${receipt.tokens.output.toLocaleString("en-US")} out`],
    ...(receipt.webSearches > 0 ? [["Web searches", String(receipt.webSearches)] as [string, string]] : []),
    ["Estimated cost", `$${receipt.estCostUsd.toFixed(4)}`],
  ];

  return (
    <div className="text-sm grid gap-5 md:grid-cols-2">
      <dl className="grid grid-cols-[auto_1fr] content-start gap-x-4 gap-y-1.5">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-foreground tabular-nums break-words">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-1">Steps</p>
          <ol className="space-y-1">
            {receipt.steps.map((s, i) => (
              <li key={`${s.id}-${i}`} className="flex justify-between gap-4">
                <span className="text-foreground/90">{s.label}</span>
                <span className="tabular-nums text-muted-foreground">{seconds(s.ms)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-1">Pages read</p>
          <PageList pages={source.pages} />
        </div>
      </div>
    </div>
  );
}
