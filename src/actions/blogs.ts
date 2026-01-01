"use server";

import { createSupabaseAdminServerClient, createSupabasePublicClient } from "@/lib/server";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

/**
 * @deprecated Use /api/blogs/upload API route instead
 * Upload functionality has been moved to API routes to support files larger than 1MB
 */

export async function getBlogsSlugs() {
    try {
        const supabase = await createSupabasePublicClient();
        const { data, error } = await supabase
            .from("blogs")
            .select("slug");
        
        if (error) throw error;
        return data?.map((blog) => blog.slug) || [];
    }
    catch (error) {
        console.error(error);
        return [];
    }
}

export interface BlogDto {
    id: number;
    slug: string;
    title: string;
    thumbnailUrl: string | null;
    createdAt: string;
    description: string;
    content: string;
    tags?: string[];
    pinned?: boolean;
    publishedAt?: string;
    authorName?: string;
    authorImageUrl?: string;
    authorLinkedinUrl?: string;
    authorRole?: string;
}

export async function getBlogBySlug(slug: string): Promise<
    | (BlogDto & { content: string })
    | null
> {
    try {
        const supabase = await createSupabasePublicClient();
        const { data: blogData, error: blogError } = await supabase
            .from("blogs")
            .select(`
                id,
                slug,
                title,
                thumbnail_url,
                created_at,
                description,
                content
            `)
            .eq("slug", slug)
            .single();

        if (blogError || !blogData) return null;

        const blog = {
            id: blogData.id,
            slug: blogData.slug,
            title: blogData.title,
            thumbnailUrl: blogData.thumbnail_url,
            createdAt: blogData.created_at,
            description: blogData.description,
            content: blogData.content,
        };

        return blog as BlogDto & { content: string };

    } catch (error) {
        console.error(error);
        return null;
    }
}

// Cached per-slug fetch with tags for precise invalidation
export async function getBlogBySlugCached(slug: string) {
    const cached = unstable_cache(
        async (s: string) => await getBlogBySlug(s),
        ["blog-by-slug", slug],
        {
            revalidate: 3600,
            tags: ["blogs", `blogs:${slug}`],
        }
    );
    return cached(slug);
}

export async function getBlogs({
    offset = 0,
    limit = 10,
    search = "",
    filters = {},
    ssg = false
}: {
    offset: number;
    limit: number;
    search: string;
    filters?: Record<string, any>;
    ssg?: boolean;
}): Promise<{
    rows: BlogDto[];
    rowsCount: number;
    error: string | null;
}> {
    try {
        const supabase = await createSupabaseAdminServerClient();
        
        // Build the query for blogs
        let query = supabase
            .from("blogs")
            .select(`
                id,
                slug,
                title,
                thumbnail_url,
                created_at,
                description,
                content
            `, { count: 'exact' });

        // Apply search filter
        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        // Apply ordering
        query = query.order("created_at", { ascending: false });

        // Apply pagination
        query = query.range(offset * limit, (offset * limit) + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        const rows = (data || []).map((row: any) => {
            return {
                id: row.id,
                slug: row.slug,
                title: row.title,
                thumbnailUrl: row.thumbnail_url,
                createdAt: row.created_at,
                description: row.description,
                content: row.content,
                tags: row.tags || [],
                pinned: row.pinned || false,
                publishedAt: row.published_at || row.created_at,
                authorName: row.author_name,
                authorImageUrl: row.author_image_url,
                authorLinkedinUrl: row.author_linkedin_url,
                authorRole: row.author_role,
            } as BlogDto;
        });

        return {
            rows,
            rowsCount: count || 0,
            error: null
        }
    } catch (error) {
        console.error(error);
        return { rows: [], rowsCount: 0, error: "Failed to get blogs" };
    }
}

// Cached variant for SSG listing page with tag-based revalidation
export const getBlogsCached = unstable_cache(
    async (params: {
        offset: number;
        limit: number;
        search: string;
        filters?: Record<string, any>;
    }) => {
        try {
            const supabase = await createSupabasePublicClient();
            
            // Build the query for blogs
            let query = supabase
                .from("blogs")
                .select(`
                    id,
                    slug,
                    title,
                    thumbnail_url,
                    created_at,
                    description,
                    content
                `, { count: 'exact' });

            // Apply search filter
            if (params.search) {
                query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
            }

            // Apply ordering
            query = query.order("created_at", { ascending: false });

            // Apply pagination
            query = query.range(params.offset * params.limit, (params.offset * params.limit) + params.limit - 1);

            const { data, error, count } = await query;

            if (error) throw error;

            const rows = (data || []).map((row: any) => {
                return {
                    id: row.id,
                    slug: row.slug,
                    title: row.title,
                    thumbnailUrl: row.thumbnail_url,
                    createdAt: row.created_at,
                    description: row.description,
                    content: row.content,
                    tags: [],
                    pinned: false,
                    publishedAt: row.created_at,
                } as BlogDto;
            });

            return {
                rows,
                rowsCount: count || 0,
                error: null
            };
        } catch (error) {
            console.error(error);
            return { rows: [], rowsCount: 0, error: "Failed to get blogs" };
        }
    },
    ["blogs-listing"],
    {
        revalidate: 3600,
        tags: ["blogs"],
    }
);

export async function createBlog({
    title,
    content,
    thumbnailUrl,
    slug,
    description,
}: {
    title: string;
    content: string;
    thumbnailUrl?: string;
    slug: string;
    description: string;
}) {
    try {
        const supabase = await createSupabaseAdminServerClient();
        const { data, error } = await supabase
            .from("blogs")
            .insert({
                title: title,
                content: content,
                thumbnail_url: thumbnailUrl || null,
                slug: slug,
                description: description,
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    catch (error: any) {
        console.error(JSON.stringify(error, null, 2));
        const messageText = String(error?.message || "").toLowerCase();
        const isUniqueViolation = error?.code === "23505" || messageText.includes("duplicate") || messageText.includes("unique");
        const message = isUniqueViolation ? "Slug already exists" : "Failed to create blog";
        throw new Error(message);
    }
}

export async function updateBlog(id: number, {
    title,
    content,
    thumbnailUrl,
    slug,
    description,
}: {
    title?: string;
    content?: string;
    thumbnailUrl?: string;
    slug?: string;
    description?: string;
}) {
    try {
        const supabase = await createSupabaseAdminServerClient();
        
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (thumbnailUrl !== undefined) updateData.thumbnail_url = thumbnailUrl;
        if (slug !== undefined) updateData.slug = slug;
        if (description !== undefined) updateData.description = description;

        const { data, error } = await supabase
            .from("blogs")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        await revalidateBlogs();

        return data;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

export async function deleteBlog(id: number) {
    try {
        const supabase = await createSupabaseAdminServerClient();
        const { error } = await supabase
            .from("blogs")
            .delete()
            .eq("id", id);

        if (error) throw error;

        await revalidateBlogs();
        return { success: true };
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

export async function revalidateBlogs() {
    try {
        // Invalidate cached data used by the listing and details
        revalidateTag("blogs");
        revalidateTag("sitemap"); // Invalidate sitemap when blogs change
        const slugs = await getBlogsSlugs();
        // Revalidate listing page
        revalidatePath("/blogs", "page");
        // Revalidate sitemap
        revalidatePath("/sitemap.xml", "page");
        // Revalidate each blog detail page
        for (const slug of slugs) {
            revalidateTag(`blogs:${slug}`);
            revalidatePath(`/blogs/${slug}`, "page");
        }
    } catch (error) {
        console.error("Failed to revalidate blogs", error);
    }
}
