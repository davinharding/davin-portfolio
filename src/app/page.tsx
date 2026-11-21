import { HomeDesignPage } from "@/components/thirty/home/HomeDesignPage";
import { homeMetadata } from "@/lib/thirty/homeCopy";

export const metadata = homeMetadata;

export default function Home() {
  return <HomeDesignPage design="classic" />;
}
