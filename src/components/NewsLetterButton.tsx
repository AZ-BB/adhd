export default function NewsLetterButton({ className }: { className?: string }) {
    // You can replace this with your actual newsletter form URL
    const formUrl = "#"
    return (
        <a href={formUrl} target="_blank" rel="noopener noreferrer"
            className={className ? className : `w-full bg-blue-600 hover:bg-blue-700 mb-2 block py-2 text-white rounded-md text-center text-sm font-[400]`}
        >
            Subscribe to Newsletter
        </a>
    )
}

