import Link from "next/link";
import Image from "next/image";

export interface BlogCardProps {
    slug: string;
    src: string;
    title: string;
    tags?: string[];
    date?: string;
    basePath?: string;
}

export default function BlogCard({ slug, src, title, tags, date, basePath = "/blogs" }: BlogCardProps) {
    return (
        <Link 
            href={`${basePath}/${slug}`} 
            className="bg-white group w-full h-auto rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" 
            aria-label={`Read blog: ${title}`}
        >
            <article className="flex flex-col h-full">
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                    <Image
                        src={src ? src : "/assets/admin/placeholder.png"}
                        alt={`${title} thumbnail`}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        priority={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                    {tags && tags.length > 0 && (
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {tags.map((tag) => (
                                <span 
                                    key={tag} 
                                    className="text-blue-600 border border-blue-200 font-medium px-3 py-1 bg-blue-50 text-xs rounded-full hover:bg-blue-100 transition-colors"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    
                    <div className="flex flex-col flex-grow">
                        {date && (
                            <time 
                                className="text-xs text-gray-500 mb-2 font-medium" 
                                dateTime={new Date(date).toISOString()}
                            >
                                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </time>
                        )}
                        <h2 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {title}
                        </h2>
                    </div>
                    
                    <div className="flex items-center mt-auto text-blue-600 group-hover:text-blue-700 font-semibold">
                        <span className="text-sm">Read more</span>
                        <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="ml-1 group-hover:translate-x-1 transition-transform"
                            aria-hidden="true"
                        >
                            <path d="m9 18 6-6-6-6"/>
                        </svg>
                    </div>
                </div>
            </article>
        </Link>
    );
}

