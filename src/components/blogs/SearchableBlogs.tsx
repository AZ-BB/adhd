"use client";

import { useState, useEffect } from "react";
import BlogsGrid from "./BlogsGrid";
import BlogCard from "./BlogCard";
import { Input } from "../ui/input";

interface Blog {
    slug: string;
    src: string;
    title: string;
    tags: string[];
    date: string;
}

interface SearchableBlogsProps {
    blogs: Blog[];
}

export default function SearchableBlogs({ blogs }: SearchableBlogsProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>(blogs);
    const [currentPage, setCurrentPage] = useState(1);
    const blogsPerPage = 6;

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredBlogs(blogs);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = blogs.filter((blog) =>
                blog.title.toLowerCase().includes(query) ||
                blog.tags.some(tag => tag.toLowerCase().includes(query))
            );
            setFilteredBlogs(filtered);
        }
        // Reset to page 1 when search changes
        setCurrentPage(1);
    }, [searchQuery, blogs]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
    const indexOfLastBlog = currentPage * blogsPerPage;
    const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
    const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
            <section className="w-full max-w-7xl mx-auto px-5 lg:px-0">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">All Articles</h2>
                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search blogs..."
                        className="w-full h-12 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                    {searchQuery && (
                        <p className="text-sm text-gray-600 mt-3 font-medium">
                            Showing {currentBlogs.length} of {filteredBlogs.length} results
                        </p>
                    )}
                </div>
            </section>

            <section className="w-full flex items-center justify-center max-w-7xl mx-auto px-5 lg:px-0">
                {currentBlogs.length > 0 ? (
                    <BlogsGrid>
                        {currentBlogs.map(({ src, title, slug, date, tags }, index) => (
                            <li key={`blog-${index}`}>
                                <BlogCard basePath="/blogs" slug={slug} src={src} title={title} date={date} tags={tags} />
                            </li>
                        ))}
                    </BlogsGrid>
                ) : (
                    <div className="w-full text-center py-20">
                        <p className="text-gray-500">No blogs found matching your search.</p>
                    </div>
                )}
            </section>

            {/* Pagination */}
            {totalPages > 1 && (
                <section className="w-full max-w-7xl mx-auto px-5 lg:px-0 pt-12">
                    <div className="flex items-center justify-center space-x-2">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(currentPage - 1)
                            }}
                            disabled={currentPage === 1}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </button>

                        <div className="flex space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(pageNumber)
                                    }}
                                    className={`px-4 min-w-12 py-2 text-sm font-medium rounded-md ${currentPage === pageNumber
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNumber}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(currentPage + 1)
                            }}
                            disabled={currentPage === totalPages}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </section>
            )}
        </>
    );
}

