import Blog from "@/components/blogs/Blog";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogBySlugCached, getBlogsSlugs } from "@/actions/blogs";

export const revalidate = 3600;

export async function generateStaticParams() {
    const slugs = await getBlogsSlugs();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const blog = await getBlogBySlugCached(slug);

    if (!blog) {
        return {
            title: "Blog not found",
            description: "The requested blog post could not be found.",
            robots: { index: false, follow: false },
        };
    }

    const url = `/blogs/${slug}`;
    const ogImage = blog.thumbnailUrl?.startsWith("http") ? blog.thumbnailUrl : `${blog.thumbnailUrl || "/logo/1.png"}`;
    const description = (blog.description && blog.description.trim().length > 0)
        ? blog.description
        : (blog.content || "").replace(/\n/g, " ").slice(0, 160);

    return {
        title: blog.title,
        description,
        alternates: { canonical: url },
        openGraph: {
            type: "article",
            title: blog.title,
            description,
            url,
            images: [
                { url: ogImage, width: 1200, height: 630, alt: blog.title },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: blog.title,
            description,
            images: [ogImage],
        },
    };
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const blog = await getBlogBySlugCached(slug);

    if (!blog) {
        notFound();
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        headline: blog!.title,
                        description: (blog!.description && blog!.description.trim().length > 0)
                            ? blog!.description
                            : (blog!.content || "").replace(/\n/g, " ").slice(0, 160),
                        image: blog!.thumbnailUrl?.startsWith("http") ? blog!.thumbnailUrl : `${blog!.thumbnailUrl || "/logo/1.png"}`,
                        datePublished: blog!.publishedAt || blog!.createdAt,
                        dateModified: blog!.publishedAt || blog!.createdAt,
                        mainEntityOfPage: { "@type": "WebPage", "@id": `/blogs/${slug}` },
                        publisher: {
                            "@type": "Organization",
                            name: "MovoKids",
                            logo: { "@type": "ImageObject", url: "/logo/1.png" },
                        },
                    })
                }}
            />
            <Blog
                slug={slug}
                title={blog!.title}
                description={blog!.description}
                date={blog!.publishedAt || blog!.createdAt}
                tags={blog!.tags || []}
                body={blog!.content}
                author={blog!.authorName}
                authorImg={blog!.authorImageUrl}
                thumbnail={blog!.thumbnailUrl || "/assets/admin/placeholder.png"}
                authorLinkedinUrl={blog!.authorLinkedinUrl}
                authorRole={blog!.authorRole}
            />
        </>
    );
}

