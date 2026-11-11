import type { MetadataRoute } from "next";
import { getPublishedProjects, projectPath } from "@/data/projectData";
import { EXAMPLE_LINKS } from "@/lib/thirty/examples";

const SITE_URL = "https://www.davin.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const projectRoutes: MetadataRoute.Sitemap = getPublishedProjects().map(
    (project) => ({
      url: `${SITE_URL}${projectPath(project.name)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  const exampleRoutes: MetadataRoute.Sitemap = EXAMPLE_LINKS.map((example) => ({
    url: `${SITE_URL}/b/${example.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/work`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/portfolio`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/call`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    ...projectRoutes,
    ...exampleRoutes,
  ];
}
