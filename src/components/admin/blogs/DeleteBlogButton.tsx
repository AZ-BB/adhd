"use client";

import { useTransition } from "react";

type DeleteBlogButtonProps = {
    onDelete: () => Promise<void>;
};

export default function DeleteBlogButton({ onDelete }: DeleteBlogButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this blog?')) {
            startTransition(async () => {
                await onDelete();
            });
        }
    };

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isPending ? "Deleting..." : "Delete"}
        </button>
    );
}

