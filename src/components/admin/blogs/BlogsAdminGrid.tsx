interface BlogsAdminGridProps {
    children: React.ReactNode;
    maxGridCols?: number;
    ariaLabel?: string;
}
export default function BlogsAdminGrid({ children, maxGridCols = 4, ariaLabel = "Admin blogs list" }: BlogsAdminGridProps) {
    // Tailwind requires full class names, so we map maxGridCols to actual classes
    const gridColsClass = maxGridCols === 2 
        ? "grid-cols-1 md:grid-cols-2" 
        : maxGridCols === 3
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    
    return (
        <ul className={`grid ${gridColsClass} gap-6 lg:gap-8 w-full list-none`} aria-label={ariaLabel}>
            {children}
        </ul>
    )
}

