import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/data/projectData";

const SITE_URL = "https://www.davin.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const projectRoutes: MetadataRoute.Sitemap = getPublishedProjects().map(
    (project) => ({
      url: `${SITE_URL}/portfolio/${encodeURI(project.name)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
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
  ];
}
