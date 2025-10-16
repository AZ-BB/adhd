'use server'

import { createSupabaseServerClient } from "@/lib/server"
import { Game, LearningDay, DayGame, GameConfig, GameType } from "@/types/learning-path"
import { revalidatePath } from "next/cache"

// ============================================
// LEARNING DAYS MANAGEMENT
// ============================================

/**
 * Get all learning days (including inactive ones for admin)
 */
export async function getAllLearningDays(): Promise<LearningDay[]> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('learning_days')
    .select('*')
    .order('day_number', { ascending: true })
  
  if (error) {
    console.error('Error fetching learning days:', error)
    throw new Error('Failed to fetch learning days')
  }
  
  return data || []
}

/**
 * Get a single learning day by ID
 */
export async function getLearningDayById(id: number): Promise<LearningDay | null> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('learning_days')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching learning day:', error)
    return null
  }
  
  return data
}

/**
 * Create a new learning day
 */
export async function createLearningDay(params: {
  day_number: number
  title: string
  title_ar?: string
  description?: string
  description_ar?: string
  required_correct_games?: number
  is_active?: boolean
}): Promise<LearningDay> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('learning_days')
    .insert({
      day_number: params.day_number,
      title: params.title,
      title_ar: params.title_ar,
      description: params.description,
      description_ar: params.description_ar,
      required_correct_games: params.required_correct_games || 5,
      is_active: params.is_active !== undefined ? params.is_active : true
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating learning day:', error)
    throw new Error('Failed to create learning day: ' + error.message)
  }
  
  revalidatePath('/admin/content')
  revalidatePath('/learning-path')
  
  return data
}

/**
 * Update an existing learning day
 */
export async function updateLearningDay(
  id: number,
  params: Partial<Omit<LearningDay, 'id' | 'created_at' | 'updated_at'>>
): Promise<LearningDay> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('learning_days')
    .update(params)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating learning day:', error)
    throw new Error('Failed to update learning day: ' + error.message)
  }
  
  revalidatePath('/admin/content')
  revalidatePath('/learning-path')
  
  return data
}

/**
 * Delete a learning day
 */
export async function deleteLearningDay(id: number): Promise<void> {
  const supabase = await createSupabaseServerClient()
  
  const { error } = await supabase
    .from('learning_days')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting learning day:', error)
    throw new Error('Failed to delete learning day: ' + error.message)
  }
  
  revalidatePath('/admin/content')
  revalidatePath('/learning-path')
}

// ============================================
// GAMES MANAGEMENT
// ============================================

/**
 * Get all games (including inactive ones for admin)
 */
export async function getAllGames(): Promise<Game[]> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching games:', error)
    throw new Error('Failed to fetch games')
  }
  
  return data || []
}

/**
 * Get games by type
 */
export async function getGamesByType(type: GameType): Promise<Game[]> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching games by type:', error)
    throw new Error('Failed to fetch games')
  }
  
  return data || []
}

/**
 * Get a single game by ID
 */
export async function getGameById(id: number): Promise<Game | null> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching game:', error)
    return null
  }
  
  return data
}

/**
 * Create a new game
 */
export async function createGame(params: {
  type: GameType
  name: string
  name_ar?: string
  description?: string
  description_ar?: string
  difficulty_level?: number
  config?: GameConfig
  is_active?: boolean
}): Promise<Game> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('games')
    .insert({
      type: params.type,
      name: params.name,
      name_ar: params.name_ar,
      description: params.description,
      description_ar: params.description_ar,
      difficulty_level: params.difficulty_level || 1,
      config: params.config || {},
      is_active: params.is_active !== undefined ? params.is_active : true
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating game:', error)
    throw new Error('Failed to create game: ' + error.message)
  }
  
  revalidatePath('/admin/content')
  
  return data
}

/**
 * Update an existing game
 */
export async function updateGame(
  id: number,
  params: Partial<Omit<Game, 'id' | 'created_at' | 'updated_at'>>
): Promise<Game> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('games')
    .update(params)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating game:', error)
    throw new Error('Failed to update game: ' + error.message)
  }
  
  revalidatePath('/admin/content')
  
  return data
}

/**
 * Delete a game
 */
export async function deleteGame(id: number): Promise<void> {
  const supabase = await createSupabaseServerClient()
  
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting game:', error)
    throw new Error('Failed to delete game: ' + error.message)
  }
  
  revalidatePath('/admin/content')
}

// ============================================
// DAY-GAME ASSIGNMENTS
// ============================================

/**
 * Get all games assigned to a specific day
 */
export async function getDayGames(learningDayId: number): Promise<Array<DayGame & { game: Game }>> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('day_games')
    .select(`
      *,
      game:games (*)
    `)
    .eq('learning_day_id', learningDayId)
    .order('order_in_day', { ascending: true })
  
  if (error) {
    console.error('Error fetching day games:', error)
    throw new Error('Failed to fetch day games')
  }
  
  return data || []
}

/**
 * Assign a game to a day
 */
export async function assignGameToDay(params: {
  learning_day_id: number
  game_id: number
  order_in_day: number
}): Promise<DayGame> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('day_games')
    .insert({
      learning_day_id: params.learning_day_id,
      game_id: params.game_id,
      order_in_day: params.order_in_day
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error assigning game to day:', error)
    throw new Error('Failed to assign game to day: ' + error.message)
  }
  
  revalidatePath('/admin/content')
  revalidatePath('/learning-path')
  
  return data
}

/**
 * Update a day-game assignment
 */
export async function updateDayGameAssignment(
  id: number,
  params: Partial<Omit<DayGame, 'id' | 'created_at'>>
): Promise<DayGame> {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('day_games')
    .update(params)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating day-game assignment:', error)
    throw new Error('Failed to update assignment: ' + error.message)
  }
  
  revalidatePath('/admin/content')
  revalidatePath('/learning-path')
  
  return data
}

/**
 * Remove a game from a day
 */
export async function removeGameFromDay(dayGameId: number): Promise<void> {
  const supabase = await createSupabaseServerClient()
  
  const { error } = await supabase
    .from('day_games')
    .delete()
    .eq('id', dayGameId)
  
  if (error) {
    console.error('Error removing game from day:', error)
    throw new Error('Failed to remove game from day: ' + error.message)
  }
  
  revalidatePath('/admin/content')
  revalidatePath('/learning-path')
}

/**
 * Batch update game order for a day
 */
export async function updateDayGamesOrder(
  assignments: Array<{ id: number; order_in_day: number }>
): Promise<void> {
  const supabase = await createSupabaseServerClient()
  
  // Update each assignment
  for (const assignment of assignments) {
    const { error } = await supabase
      .from('day_games')
      .update({ order_in_day: assignment.order_in_day })
      .eq('id', assignment.id)
    
    if (error) {
      console.error('Error updating game order:', error)
      throw new Error('Failed to update game order: ' + error.message)
    }
  }
  
  revalidatePath('/admin/content')
  revalidatePath('/learning-path')
}

