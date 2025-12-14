import Image from "next/image";
import Link from "next/link";
import ContentViewer from "./ContentViewer";

interface BlogProps {
    slug: string;
    title: string;
    description?: string;
    date: string;
    tags: string[];
    body: string;
    author?: string;
    authorImg?: string;
    thumbnail: string;
    authorLinkedinUrl?: string;
    authorRole?: string;
}

export default function Blog({
    slug,
    title,
    description,
    date,
    tags = [],
    body,
    author,
    authorImg,
    thumbnail,
    authorLinkedinUrl,
    authorRole,
}: BlogProps) {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white" role="main" dir="rtl">
            {/* Header with Back Button */}
            <div className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link 
                        href="/blogs" 
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors group"
                    >
                        <svg className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>جميع المدونات</span>
                    </Link>
                </div>
            </div>

            <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Featured Image - Modern Card Style */}
                <div className="mb-8 lg:mb-12">
                    <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-100 to-purple-100">
                        <Image
                            src={thumbnail ? thumbnail : "/assets/admin/placeholder.png"}
                            alt={title}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    </div>
                </div>

                {/* Article Header */}
                <header className="mb-8 lg:mb-12">
                    {/* Tags */}
                    {tags && tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mb-4">
                            {tags.map((tag) => (
                                <span 
                                    key={tag} 
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                        {title}
                    </h1>

                    {/* Description */}
                    {description && (
                        <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed mb-6 font-light">
                            {description}
                        </p>
                    )}

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-200">
                        {/* Date */}
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <time 
                                className="text-sm font-medium" 
                                dateTime={new Date(date).toISOString()}
                            >
                                {new Date(date).toLocaleDateString('ar-SA', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </time>
                        </div>

                        {/* Author */}
                        {author && (
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-indigo-100">
                                    <Image
                                        src={authorImg || "/images/avatars/default.png"}
                                        alt={`Author ${author}`}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 mb-0.5">الكاتب</p>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900">
                                            {author}
                                        </h3>
                                        {authorLinkedinUrl && (
                                            <a 
                                                href={authorLinkedinUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:text-indigo-700 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                    {authorRole && (
                                        <p className="text-xs text-gray-500">{authorRole}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Article Content */}
                <div className="prose prose-lg prose-indigo max-w-none 
                    prose-headings:font-bold prose-headings:text-gray-900
                    prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
                    prose-p:text-gray-700 prose-p:leading-relaxed
                    prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900 prose-strong:font-semibold
                    prose-ul:list-disc prose-ol:list-decimal
                    prose-li:text-gray-700
                    prose-img:rounded-xl prose-img:shadow-lg
                    prose-blockquote:border-r-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded
                    prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-gray-900 prose-pre:text-gray-100
                    mb-12">
                    <ContentViewer html={body} className="blog-content" />
                </div>

                {/* Footer Section */}
                <footer className="mt-16 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <Link 
                            href="/blogs" 
                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors group"
                        >
                            <svg className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>العودة إلى المدونات</span>
                        </Link>
                        
                        {tags && tags.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-gray-500">الوسوم:</span>
                                {tags.map((tag) => (
                                    <span 
                                        key={tag} 
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </footer>
            </article>
        </main>
    )
}

