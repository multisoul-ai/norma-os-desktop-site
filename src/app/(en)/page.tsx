import { Suspense } from "react";
import { HomepagePrototypeHost } from "../_components/homepage-prototype/homepage-prototype";
import { MarketingPage } from "../_components/marketing-page";
import { englishContent } from "../site-content";

export { latestDownloadUrl } from "../site-constants";

export default function Home() {
  const currentPage = <MarketingPage content={englishContent} />;
  if (process.env.NODE_ENV === "development") {
    return (
      <Suspense fallback={currentPage}>
        <HomepagePrototypeHost content={englishContent}>{currentPage}</HomepagePrototypeHost>
      </Suspense>
    );
  }
  return currentPage;
}
