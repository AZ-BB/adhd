type ContentViewerProps = {
    html: string;
    className?: string;
};

export default function ContentViewer({ html, className }: ContentViewerProps) {
    return (
        <div
            className={`blog-content min-w-0 break-words text-right ${className || ""}`}
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: html || "" }}
        />
    );
}

