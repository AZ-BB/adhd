'use server'

import { createSupabaseServerClient } from "@/lib/server"
import { revalidatePath } from "next/cache"

/**
 * Upload an image to Supabase Storage
 * Returns the public URL of the uploaded image
 */
export async function uploadGameImage(
  file: File,
  gameType: string
): Promise<{ url: string; path: string } | { error: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExt = file.name.split('.').pop()
    const fileName = `${gameType}_${timestamp}_${randomString}.${fileExt}`
    const filePath = `games/${gameType}/${fileName}`
    
    // Convert File to ArrayBuffer then to Buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Upload to storage
    const { data, error } = await supabase.storage
      .from('game-assets')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })
    
    if (error) {
      console.error('Upload error:', error)
      return { error: `Failed to upload image: ${error.message}` }
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('game-assets')
      .getPublicUrl(data.path)
    
    return { url: publicUrl, path: data.path }
  } catch (error) {
    console.error('Upload error:', error)
    return { error: 'Failed to upload image' }
  }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteGameImage(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { error } = await supabase.storage
      .from('game-assets')
      .remove([path])
    
    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error: 'Failed to delete image' }
  }
}

/**
 * Client-safe upload function that accepts FormData
 */
export async function uploadImageFromFormData(
  formData: FormData
): Promise<{ url: string; path: string } | { error: string }> {
  try {
    const file = formData.get('file') as File
    const gameType = formData.get('gameType') as string
    
    if (!file) {
      return { error: 'No file provided' }
    }
    
    if (!file.type.startsWith('image/')) {
      return { error: 'File must be an image' }
    }
    
    // Max file size: 5MB
    if (file.size > 5 * 1024 * 1024) {
      return { error: 'File size must be less than 5MB' }
    }
    
    return await uploadGameImage(file, gameType || 'memory')
  } catch (error) {
    console.error('FormData upload error:', error)
    return { error: 'Failed to process upload' }
  }
}

