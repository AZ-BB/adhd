import { deleteBlog, getBlogBySlug, updateBlog } from "@/actions/blogs";
import EditBlogForm from "@/components/admin/blogs/EditBlogForm";
import ContentEditorForm from "@/components/admin/blogs/ContentEditorForm";
import DeleteBlogButton from "@/components/admin/blogs/DeleteBlogButton";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

type PageProps = { params: Promise<{ slug: string }> }

export default async function BlogDetail({ params: paramsPromise }: PageProps) {
    const params = await paramsPromise;
    const blog = await getBlogBySlug(params.slug);

    if (!blog) {
        return <div className="p-6 text-white">Blog not found</div>;
    }

    async function updateMeta(formData: FormData) {
        "use server";
        const title = String(formData.get("title") || "").trim();
        const slug = String(formData.get("slug") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const thumbnailUrl = String(formData.get("thumbnailUrl") || "").trim();

        if (!blog) throw new Error("Blog not found");
        await updateBlog(blog.id, { 
            title, 
            slug, 
            description, 
            thumbnailUrl: thumbnailUrl || undefined 
        });
        revalidatePath(`/admin/blogs/${slug}`);
        if (slug !== params.slug) {
            redirect(`/admin/blogs/${slug}`);
        }
    }

    async function updateContent(formData: FormData) {
        "use server";
        const content = String(formData.get("content") || "");
        if (!blog) throw new Error("Blog not found");
        await updateBlog(blog.id, { content });
        revalidatePath(`/admin/blogs/${blog.slug}`);
    }

    async function deleteAction() {
        "use server";
        if (!blog) throw new Error("Blog not found");
        await deleteBlog(blog.id);
        redirect("/admin/blogs");
    }

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Edit Blog</h1>
                    <p className="text-gray-400 mt-1">{blog.title}</p>
                </div>
                <div className="flex items-center gap-3">
                    <DeleteBlogButton onDelete={deleteAction} />
                    <Link
                        href={`/blogs/${blog.slug}`}
                        target="_blank"
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center gap-2"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        Preview
                    </Link>
                </div>
            </div>

            <div className="space-y-8">
                <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Meta Information</h2>
                    <EditBlogForm
                        initial={{
                            title: blog.title,
                            slug: blog.slug,
                            description: blog.description,
                            thumbnailUrl: blog.thumbnailUrl,
                        }}
                        onUpdate={updateMeta}
                        formId="blog-meta-form"
                    />
                </div>

                <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Content</h2>
                    <ContentEditorForm
                        initialContent={blog.content}
                        onSubmit={updateContent}
                    />
                </div>
            </div>
        </div>
    );
}

