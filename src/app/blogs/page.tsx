import BlogsGrid from "@/components/blogs/BlogsGrid";
import BlogCard from "@/components/blogs/BlogCard";
import type { Metadata } from "next";
import { getBlogsCached } from "@/actions/blogs";
import SearchableBlogs from "@/components/blogs/SearchableBlogs";

export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Blogs",
    description: "Insights and articles on ADHD support, learning strategies, and child development from MovoKids.",
    alternates: {
        canonical: "/blogs",
    },
    openGraph: {
        type: "website",
        title: "Blogs",
        description: "Latest articles on ADHD support and learning strategies.",
        url: "/blogs",
        images: [
            {
                url: "/logo/1.png",
                width: 1200,
                height: 630,
                alt: "MovoKids Blogs",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Blogs",
        description: "Latest articles on ADHD support and learning strategies.",
        images: ["/logo/1.png"],
    },
};

export default async function BlogsPage() {
    const { rows } = await getBlogsCached({ offset: 0, limit: 100, search: "", filters: { published: true, tags: [] } });

    const featureSection = rows.filter((blog) => blog.pinned).map((blog) => ({
        slug: blog.slug,
        src: blog.thumbnailUrl || "/assets/admin/placeholder.png",
        title: blog.title,
        tags: blog.tags || [],
        date: blog.publishedAt || blog.createdAt,
    }));

    const blogSection = rows.filter((blog) => !blog.pinned).map((blog) => ({
        src: blog.thumbnailUrl || "/assets/admin/placeholder.png",
        title: blog.title,
        slug: blog.slug,
        date: blog.publishedAt || blog.createdAt,
        tags: blog.tags || [],
    }));

    return (
        <main className="flex flex-col items-center justify-center" role="main">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        name: "MovoKids Blogs",
                        url: "/blogs",
                        mainEntity: {
                            "@type": "ItemList",
                            itemListElement: rows.map((post, index) => ({
                                "@type": "ListItem",
                                position: index + 1,
                                url: `/blogs/${post.slug}`,
                                name: post.title,
                                image: post.thumbnailUrl?.startsWith("http") ? post.thumbnailUrl : `${post.thumbnailUrl || "/logo/1.png"}`,
                                datePublished: post.publishedAt || post.createdAt,
                            })),
                        },
                    })
                }}
            />

            <section
                className='w-full px-4 lg:px-[20%] flex flex-col items-center justify-center py-16 lg:py-40 relative bg-cover bg-center bg-no-repeat min-h-[600px]'
                style={{ backgroundImage: 'url(/bg3.jpg)' }}
            >
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="text-sm bg-[#D9FE46] text-black px-5 py-2 rounded-full mb-8 font-semibold tracking-wide shadow-lg">
                        BLOG
                    </div>

                    <h1 className="text-4xl lg:text-7xl text-center font-bold text-white mb-6 drop-shadow-lg leading-tight">
                        Empowering Children with ADHD <br />
                        <span className="text-blue-200">Through Learning and Play</span>
                    </h1>

                    <h3 className="text-lg lg:text-2xl text-center font-medium text-white/90 max-w-3xl drop-shadow-md">
                        Discover insights, strategies, and stories to support your child's journey
                    </h3>
                </div>
            </section>

            {featureSection.length > 0 && (
                <section className="w-full flex items-center justify-center max-w-7xl pt-16 px-5 lg:px-0">
                    <div className="w-full">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center lg:text-left">Featured Articles</h2>
                        <BlogsGrid>
                            {featureSection.map(({ src, title, tags, slug, date }, index) => (
                                <li key={`blog-${index}`}>
                                    <BlogCard basePath="/blogs" slug={slug} src={src} title={title} tags={tags} date={date} />
                                </li>
                            ))}
                        </BlogsGrid>
                    </div>
                </section>
            )}
            
            {
                blogSection.length > 0 &&
                <div className="w-full pt-16 pb-20">
                    <SearchableBlogs blogs={blogSection} />
                </div>
            }
        </main>
    );
}

