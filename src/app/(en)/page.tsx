import { MarketingPage } from "../_components/marketing-page";
import { englishContent } from "../site-content";

export { latestDownloadUrl } from "../site-constants";

export default function Home() {
  return <MarketingPage content={englishContent} />;
}
