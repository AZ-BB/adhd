import BlogAdminCard from "@/components/admin/blogs/BlogAdminCard";
import { getBlogs, deleteBlog } from "@/actions/blogs";
import BlogsAdminGrid from "@/components/admin/blogs/BlogsAdminGrid";
import Link from "next/link";

export default async function BlogsTable({
    searchParams
}: {
    searchParams: Promise<{
        page?: string;
        limit?: string;
        search?: string;
    }>
}) {
    const params = await searchParams;
    const search = params.search || '';
    const page = params.page ? Number(params.page) : 1;
    const pageSize = params.limit ? Number(params.limit) : 20;

    const { rows, rowsCount, error } = await getBlogs({
        offset: Number(page) - 1,
        limit: Number(pageSize),
        search: search,
        filters: {}
    });

    if (error) {
        return (
            <div className="p-6">
                <div className="rounded-md border border-red-500/50 bg-red-500/20 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            </div>
        );
    }

    async function deleteBlogAction(formData: FormData) {
        "use server";
        const rawId = formData.get("id");
        const id = Number(rawId);
        if (!id || Number.isNaN(id)) {
            throw new Error("Invalid blog id");
        }
        await deleteBlog(id);
        // revalidateBlogs() is already called inside deleteBlog
    }

    const totalPages = Math.ceil(rowsCount / pageSize);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white">Blog Management</h1>
                    <p className="text-gray-400 mt-1">Create, edit, and manage blog posts</p>
                </div>
                <Link
                    href="/admin/blogs/create"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    + Create New Blog
                </Link>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                    <div className="text-3xl font-black text-purple-400">{rowsCount}</div>
                    <div className="text-sm text-gray-400">Total Blogs</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <div className="text-3xl font-black text-green-400">
                        {rows.filter((b) => b.publishedAt).length}
                    </div>
                    <div className="text-sm text-gray-400">Published</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="text-3xl font-black text-blue-400">
                        {rows.filter((b) => b.pinned).length}
                    </div>
                    <div className="text-sm text-gray-400">Featured</div>
                </div>
            </div>

            {rows.length === 0 ? (
                <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl p-12 text-center">
                    <div className="text-6xl mb-4">✍️</div>
                    <p className="text-xl text-gray-400 mb-6">No blogs found</p>
                    <Link
                        href="/admin/blogs/create"
                        className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Create Your First Blog
                    </Link>
                </div>
            ) : (
                <>
                    <div className="bg-black/30 backdrop-blur border border-purple-800/50 rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-6 lg:p-8">
                            <BlogsAdminGrid ariaLabel="Admin blogs list" maxGridCols={4}>
                                {rows.map((b) => {
                                    return (
                                        <li key={b.id}>
                                            <BlogAdminCard
                                                blog={b}
                                                deleteAction={deleteBlogAction}
                                            />
                                        </li>
                                    );
                                })}
                            </BlogsAdminGrid>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 pt-6">
                            {page > 1 && (
                                <Link
                                    href={`/admin/blogs?page=${page - 1}${search ? `&search=${search}` : ''}`}
                                    className="px-6 py-2.5 rounded-xl border border-purple-800/50 bg-black/50 text-gray-300 hover:bg-purple-800/30 hover:border-purple-600/50 transition-all font-medium"
                                >
                                    ← Previous
                                </Link>
                            )}
                            <div className="px-6 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-white font-semibold">
                                Page {page} of {totalPages}
                            </div>
                            {page < totalPages && (
                                <Link
                                    href={`/admin/blogs?page=${page + 1}${search ? `&search=${search}` : ''}`}
                                    className="px-6 py-2.5 rounded-xl border border-purple-800/50 bg-black/50 text-gray-300 hover:bg-purple-800/30 hover:border-purple-600/50 transition-all font-medium"
                                >
                                    Next →
                                </Link>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

