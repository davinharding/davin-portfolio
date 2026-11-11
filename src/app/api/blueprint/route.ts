import { after } from "next/server";
import { createBlueprintHandler, defaultDeps, methodNotAllowed } from "@/lib/thirty/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

const handle = createBlueprintHandler({
  ...defaultDeps,
  // The run must finish and be cached even after the visitor disconnects.
  keepAlive: (work) => {
    try {
      after(() => work);
    } catch (err) {
      // Outside a request scope (should not happen here); the promise still runs.
      console.error("[thirty] after() unavailable", err);
    }
  },
});

export function POST(request: Request) {
  return handle(request);
}

export function GET() {
  return methodNotAllowed();
}

export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;
