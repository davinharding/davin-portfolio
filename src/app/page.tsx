import { HomeDesignPage } from "@/components/thirty/home/HomeDesignPage";
import { homeMetadata } from "@/lib/thirty/homeCopy";

export const metadata = homeMetadata;

// The proxy rewrites `/` to a design under /home/<design>. This page is what
// renders if the proxy does not run or fails: the classic design.
export default function Home() {
  return <HomeDesignPage design="classic" />;
}
