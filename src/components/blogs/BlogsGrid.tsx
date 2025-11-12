interface BlogsGridProps {
    children: React.ReactNode;
    maxGridCols?: number;
    ariaLabel?: string;
}
export default function BlogsGrid({ children, maxGridCols = 3, ariaLabel = "Blog posts" }: BlogsGridProps) {
    return (
        <ul className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full`} aria-label={ariaLabel}>
            {children}
        </ul>
    )
}

