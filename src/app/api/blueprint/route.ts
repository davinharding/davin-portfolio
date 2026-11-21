import { after } from "next/server";
import { createBlueprintHandler, defaultDeps, methodNotAllowed } from "@/lib/thirty/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

const handle = createBlueprintHandler({
  ...defaultDeps,
  keepAlive: (work) => {
    try {
      after(() => work);
    } catch (err) {
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
