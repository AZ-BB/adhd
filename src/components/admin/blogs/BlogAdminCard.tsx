'use client'

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { BlogDto } from "@/actions/blogs";

type BlogAdminCardProps = {
    blog: BlogDto;
    deleteAction?: (formData: FormData) => Promise<void>;
};

export default function BlogAdminCard({ blog, deleteAction }: BlogAdminCardProps) {
    const [openConfirm, setOpenConfirm] = useState(false);
    const [isPending, startTransition] = useTransition();

    const src = blog.thumbnailUrl && blog.thumbnailUrl.trim().length > 0 ? blog.thumbnailUrl : "/assets/admin/placeholder.png";

    function onConfirmDelete() {
        if (!blog.id || !deleteAction) {
            setOpenConfirm(false);
            return;
        }
        const fd = new FormData();
        fd.set("id", String(blog.id));
        startTransition(async () => {
            await deleteAction(fd);
            setOpenConfirm(false);
        });
    }

    return (
        <div className="relative group block w-full h-full rounded-xl border border-purple-800/50 overflow-hidden bg-black/30 backdrop-blur hover:border-purple-600/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenConfirm(true); }}
                className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 inline-flex items-center gap-1 rounded-full bg-red-600/90 hover:bg-red-600 text-white p-2 shadow-lg"
                aria-label="Delete blog"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
            </button>

            {/* Status badges */}
            <div className="absolute left-2 top-2 z-10 flex flex-col gap-2">
                {blog.publishedAt && (
                    <span className="px-2 py-1 bg-green-500/90 text-white text-xs font-bold rounded-full shadow-lg">
                        Published
                    </span>
                )}
                {blog.pinned && (
                    <span className="px-2 py-1 bg-yellow-500/90 text-white text-xs font-bold rounded-full shadow-lg">
                        ⭐ Featured
                    </span>
                )}
            </div>

            <Link href={`/admin/blogs/${blog.slug}`} className="block cursor-pointer h-full flex flex-col">
                <article className="h-full flex flex-col">
                    <div className="relative w-full aspect-[16/9] overflow-hidden flex-shrink-0 bg-gray-800">
                        <Image
                            src={src}
                            alt={`${blog.title} thumbnail`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            priority={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="p-5 border-t border-purple-800/50 flex-1 flex flex-col bg-gradient-to-b from-black/40 to-black/30">
                        <div className="flex flex-col items-start flex-1">
                            {blog.createdAt && (
                                <time className="text-xs text-gray-400 flex-shrink-0 mb-2" dateTime={new Date(blog.createdAt).toISOString()}>
                                    {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </time>
                            )}
                            <h2 className="text-lg font-bold text-white leading-snug line-clamp-2 flex-1 mb-2 group-hover:text-purple-300 transition-colors">
                                {blog.title}
                            </h2>
                            {blog.description && (
                                <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                                    {blog.description}
                                </p>
                            )}
                            {blog.tags && blog.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-auto">
                                    {blog.tags.slice(0, 2).map((tag) => (
                                        <span key={tag} className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                                            {tag}
                                        </span>
                                    ))}
                                    {blog.tags.length > 2 && (
                                        <span className="px-2 py-1 text-gray-500 text-xs">
                                            +{blog.tags.length - 2}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </article>
            </Link>

            {openConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !isPending && setOpenConfirm(false)} />
                    <div className="relative z-10 w-full max-w-md rounded-lg bg-black/90 backdrop-blur border border-purple-800/50 p-5 shadow-xl">
                        <div className="mb-3">
                            <h3 className="text-base font-semibold text-white">Confirm deletion</h3>
                            <p className="mt-1 text-sm text-gray-300">Are you sure you want to delete "{blog.title}"?</p>
                        </div>
                        <div className="mt-4 flex items-center justify-end gap-2">
                            <button 
                                type="button" 
                                onClick={() => setOpenConfirm(false)} 
                                disabled={isPending}
                                className="px-4 py-2 rounded-lg border border-purple-800/50 bg-black/50 text-gray-300 hover:bg-black/70 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                onClick={onConfirmDelete} 
                                disabled={isPending}
                                className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white disabled:opacity-50"
                            >
                                {isPending ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

