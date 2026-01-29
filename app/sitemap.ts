import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://apm-portal.id';
const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function fetchDynamicRoutes() {
  try {
    // Fetch all lomba slugs from internal API
    const lombaRes = await fetch(`${API_BASE}/api/lomba?limit=1000`, {
      next: { revalidate: 3600 },
    });
    const lombaData = await lombaRes.json();
    const lombaPages = (lombaData.data || []).map((item: any) => ({
      url: `${baseUrl}/lomba/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Fetch all prestasi slugs from internal API
    const prestasiRes = await fetch(`${API_BASE}/api/prestasi?limit=1000`, {
      next: { revalidate: 3600 },
    });
    const prestasiData = await prestasiRes.json();
    const prestasiPages = (prestasiData.data || []).map((item: any) => ({
      url: `${baseUrl}/prestasi/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    // Fetch all expo slugs from internal API
    const expoRes = await fetch(`${API_BASE}/api/expo?limit=1000`, {
      next: { revalidate: 3600 },
    });
    const expoData = await expoRes.json();
    const expoPages = (expoData.data || []).map((item: any) => ({
      url: `${baseUrl}/expo/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Resources are still managed externally (CMS)
    const resourcePages: MetadataRoute.Sitemap = [];

    return [...lombaPages, ...prestasiPages, ...expoPages, ...resourcePages];
  } catch (error) {
    console.error('Error fetching dynamic routes for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/lomba`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/prestasi`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/expo`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kalender`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/submission`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  // Fetch dynamic pages
  const dynamicPages = await fetchDynamicRoutes();

  return [...staticPages, ...dynamicPages];
}

