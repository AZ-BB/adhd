import { createBlog } from "@/actions/blogs";
import CreateBlogForm from "@/components/admin/blogs/CreateBlogForm";
import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export default async function CreateBlogPage() {
    await requireAdmin();

    async function createBlogAction(formData: FormData) {
        "use server";

        const title = String(formData.get("title") || "").trim();
        const slug = String(formData.get("slug") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const content = String(formData.get("content") || "").trim();
        const thumbnailUrl = String(formData.get("thumbnailUrl") || "").trim();

        if (!title || !slug || !description || !content) {
            throw new Error("Please fill all required fields");
        }

        const created = await createBlog({
            title,
            content,
            thumbnailUrl: thumbnailUrl || undefined,
            slug,
            description,
        });
        
        if (!created) {
            throw new Error("Failed to create blog");
        }
        redirect("/admin/blogs/" + slug);
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Create New Blog</h1>
                <p className="text-gray-400 mt-1">Fill in the details to create a new blog post</p>
            </div>
            <CreateBlogForm onCreate={createBlogAction} />
        </div>
    );
}

