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
        <main className="flex flex-col items-center justify-between" role="main" dir="rtl">
            {/* Hero Section */}
            <section className="w-full relative bg-cover bg-center bg-no-repeat min-h-[500px] flex items-center justify-center"
                style={{ backgroundImage: 'url(/bg3.jpg)' }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40"></div>
                
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-20 py-16 lg:py-24">
                    <Link 
                        href="/blogs" 
                        className="inline-flex gap-2 items-center text-white/90 hover:text-white font-medium mb-6 transition-colors group"
                    >
                        <svg className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>جميع المدونات</span>
                    </Link>

                    <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
                        <div className="w-full lg:w-2/3 flex flex-col justify-center gap-6 text-white">
                            <div className="flex items-center gap-3">
                                <time 
                                    className="text-sm text-white/80 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm" 
                                    dateTime={new Date(date).toISOString()}
                                >
                                    نُشر في {new Date(date).toLocaleDateString('ar-SA', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </time>
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-bold leading-tight drop-shadow-lg">
                                {title}
                            </h1>

                            {description && (
                                <p className="text-lg lg:text-xl text-white/90 leading-relaxed">
                                    {description}
                                </p>
                            )}

                            {tags && tags.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    {tags.map((tag) => (
                                        <span 
                                            key={tag} 
                                            className="text-white bg-white/20 backdrop-blur-sm border border-white/30 font-medium px-4 py-2 text-sm rounded-full hover:bg-white/30 transition-colors"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {author && (
                                <div className="flex items-center gap-4 pt-4">
                                    <Image
                                        src={authorImg || "/images/avatars/default.png"}
                                        alt={`Author ${author}`}
                                        width={60}
                                        height={60}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
                                    />
                                    <div className="text-right">
                                        <p className="text-white/70 text-sm font-medium">الكاتب</p>
                                        <h2 className="font-semibold text-lg text-white hover:text-blue-200 transition-colors duration-300">
                                            {author}
                                        </h2>
                                        {authorRole && (
                                            <p className="text-white/70 text-sm">{authorRole}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-full lg:w-1/3 flex justify-center items-center">
                            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                                <Image
                                    src={thumbnail ? thumbnail : "/assets/admin/placeholder.png"}
                                    alt={`${title} thumbnail`}
                                    fill
                                    className="object-cover"
                                    loading="lazy"
                                    priority={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="w-full max-w-4xl mx-auto py-12 lg:py-16 px-4 lg:px-8">
                <div className="prose prose-lg max-w-none">
                    <ContentViewer html={body} className="blog-content" />
                </div>
            </section>
        </main>
    )
}

