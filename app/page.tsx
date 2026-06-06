import sites from "../data/sites.json";
import { ToolWall, type Site } from "./tool-wall";

const displaySites = (sites as Site[]).map((site) => ({
  id: site.id,
  name: site.name,
  url: site.url,
  headline: site.headline,
  category: site.category,
  subcategory: site.subcategory,
  tags: site.tags,
  capabilities: site.capabilities,
  scenarios: site.scenarios,
  searchKeywords: site.searchKeywords,
  isGithub: site.isGithub,
  repoType: site.repoType,
  language: site.language,
  stars: site.stars,
  install: site.install,
  cover: site.cover,
  linkCheck: site.linkCheck,
}));

export default function HomePage() {
  return <ToolWall initialSites={displaySites} />;
}
