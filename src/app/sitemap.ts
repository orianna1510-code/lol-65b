import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://lol-65b.vercel.app";

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "hourly", priority: 1 },
    {
      url: `${baseUrl}/communities`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    { url: `${baseUrl}/docs/api`, changeFrequency: "weekly", priority: 0.5 },
  ];

  // Dynamic: recent memes (last 500)
  const memes = await prisma.meme.findMany({
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  const memeRoutes: MetadataRoute.Sitemap = memes.map((m) => ({
    url: `${baseUrl}/meme/${m.id}`,
    lastModified: m.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Dynamic: communities
  const communities = await prisma.community.findMany({
    select: { name: true, createdAt: true },
  });
  const communityRoutes: MetadataRoute.Sitemap = communities.map((c) => ({
    url: `${baseUrl}/c/${c.name}`,
    lastModified: c.createdAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // Dynamic: user profiles
  const users = await prisma.user.findMany({
    select: { username: true },
    take: 200,
  });
  const userRoutes: MetadataRoute.Sitemap = users.map((u) => ({
    url: `${baseUrl}/u/${u.username}`,
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  // Dynamic: agent profiles
  const agents = await prisma.agent.findMany({
    select: { name: true },
    take: 200,
  });
  const agentRoutes: MetadataRoute.Sitemap = agents.map((a) => ({
    url: `${baseUrl}/agent/${a.name}`,
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  return [
    ...staticRoutes,
    ...memeRoutes,
    ...communityRoutes,
    ...userRoutes,
    ...agentRoutes,
  ];
}
