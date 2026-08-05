import type { MetadataRoute } from "next";
import { getPublishedProjects, projectPath } from "@/data/projectData";
import { getPublishedPosts, postPath } from "@/lib/blog";

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

  const postRoutes: MetadataRoute.Sitemap = getPublishedPosts().map((post) => ({
    url: `${SITE_URL}${postPath(post.slug)}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

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
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/call`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    ...projectRoutes,
    ...postRoutes,
  ];
}
