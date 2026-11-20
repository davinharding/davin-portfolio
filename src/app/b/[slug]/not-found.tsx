import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import HeaderFooter from "@/components/HeaderFooter";
import { Button } from "@/components/ui/button";
import { ExampleLinks } from "@/components/thirty/ExampleLinks";
import { EXAMPLE_LINKS } from "@/lib/thirty/examples";

export default function BlueprintNotFound() {
  return (
    <HeaderFooter page="blueprint">
      <div className="bg-background min-h-[100dvh] flex items-center">
        <div className="container-narrow py-24 max-w-2xl">
          <h1 className="heading-section mb-3">That blueprint does not exist or was removed.</h1>
          <p className="text-body mb-6">You can draft a new one for any company website in about 30 seconds.</p>
          <Button asChild size="lg" className="mb-8">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Draft a blueprint
            </Link>
          </Button>
          <ExampleLinks examples={EXAMPLE_LINKS} />
        </div>
      </div>
    </HeaderFooter>
  );
}
