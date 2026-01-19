import { MetadataRoute } from 'next'
import { createSupabasePublicClient } from '@/lib/server'

export const revalidate = 3600 // Revalidate every hour

async function getBlogsWithDates() {
  try {
    const supabase = await createSupabasePublicClient()
    const { data, error } = await supabase
      .from('blogs')
      .select('slug, created_at')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return (data || []).map(blog => ({
      slug: blog.slug,
      lastModified: blog.created_at,
    }))
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
  
  // Get all blogs with their dates
  const blogs = await getBlogsWithDates()
  
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Dynamic blog routes
  const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${baseUrl}/blogs/${blog.slug}`,
    lastModified: new Date(blog.lastModified),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...blogRoutes]
}

