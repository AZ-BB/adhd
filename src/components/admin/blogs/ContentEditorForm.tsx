"use client";

import { useState, useTransition } from "react";

type ContentEditorFormProps = {
    initialContent: string;
    onSubmit: (formData: FormData) => Promise<void>;
};

export default function ContentEditorForm({ initialContent, onSubmit }: ContentEditorFormProps) {
    const [content, setContent] = useState<string>(initialContent || "");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.set("content", content);
        startTransition(async () => {
            await onSubmit(formData);
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
        >
            <label className="mb-2 block text-sm font-medium text-gray-300">Content</label>
            <input type="hidden" name="content" value={content} readOnly />
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm resize-y"
                placeholder="Enter blog content (HTML supported)"
            />
            <p className="text-xs text-gray-400">You can use HTML tags for formatting</p>
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isPending ? "Saving..." : "Save Content"}
                </button>
            </div>
        </form>
    );
}

