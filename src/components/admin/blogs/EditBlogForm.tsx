'use client'

import { useEffect, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { uploadBlogImageFromFormData } from '@/actions/blogs'
import { toKebabCase } from '@/utils/utils'
import Image from 'next/image'

type EditBlogFormProps = {
  initial: {
    title: string
    slug: string
    description: string
    thumbnailUrl: string | null
  }
  onUpdate: (formData: FormData) => Promise<void>
  formId: string
}

export default function EditBlogForm({ initial, onUpdate, formId }: EditBlogFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [slugError, setSlugError] = useState<string | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(initial.thumbnailUrl || "")
  const [title, setTitle] = useState<string>(initial.title)
  const [slug, setSlug] = useState<string>(initial.slug)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState<boolean>(false)
  const [description, setDescription] = useState<string>(initial.description)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (slugError) setSlugError(null)
  }, [slug])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await uploadBlogImageFromFormData(formData)
      if ('error' in result) {
        setError(result.error)
      } else {
        setThumbnailUrl(result.url)
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        setSlugError(null)
        const form = e.currentTarget as HTMLFormElement
        const formData = new FormData(form)
        formData.set('thumbnailUrl', thumbnailUrl)
        startTransition(async () => {
          try {
            await onUpdate(formData)
          } catch (err: any) {
            const message = err?.message ?? 'Failed to update blog'
            if (/slug already exists/i.test(message)) {
              setSlugError('Slug already exists')
            } else {
              setError(message)
            }
          }
        })
      }}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-md border border-red-500/50 bg-red-500/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Title *</label>
          <Input
            name="title"
            placeholder="Enter title"
            value={title}
            onChange={(e) => {
              const nextTitle = e.target.value
              setTitle(nextTitle)
              if (error) setError(null)
              if (!slugManuallyEdited) {
                setSlug(toKebabCase(nextTitle))
              }
            }}
            required
            className="bg-black/50 border-purple-800/50 text-white placeholder:text-gray-500"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Slug *</label>
          <Input
            name="slug"
            placeholder="my-first-post"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value)
              setSlugManuallyEdited(true)
              if (slugError) setSlugError(null)
              if (error) setError(null)
            }}
            onBlur={() => setSlug((s) => toKebabCase(s))}
            aria-invalid={!!slugError}
            className={`bg-black/50 border-purple-800/50 text-white placeholder:text-gray-500 ${slugError ? "border-red-500 focus-visible:ring-red-500/60" : ""}`}
            required
          />
          {slugError && (
            <p className="mt-1 text-xs text-red-400">{slugError}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Description *</label>
        <textarea
          name="description"
          placeholder="Enter description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value)
            if (error) setError(null)
          }}
          required
          rows={3}
          className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Thumbnail Image</label>
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImage}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-600/50 file:text-white hover:file:bg-purple-600/70 disabled:opacity-50"
          />
          {uploadingImage && (
            <p className="text-sm text-gray-400">Uploading...</p>
          )}
          {thumbnailUrl && (
            <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-purple-800/50">
              <Image
                src={thumbnailUrl}
                alt="Thumbnail preview"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
        <input type="hidden" name="thumbnailUrl" value={thumbnailUrl} />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

