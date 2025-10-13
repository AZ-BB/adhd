// Game Types
export type GameType = 'memory' | 'matching' | 'sequence' | 'attention' | 'sorting'

export interface GameConfig {
  // Memory game config
  pairs?: number
  timeLimit?: number
  theme?: string
  
  // Matching game config
  itemCount?: number
  category?: string
  
  // Sequence game config
  numberCount?: number
  start?: number
  patternLength?: number
  difficulty?: string
  sequenceLength?: number
  colors?: string[]
  
  // Attention game config
  differences?: number
  targetCount?: number
  duration?: number
  speed?: string
  
  // Sorting game config
  colorGroups?: number
  categories?: number
}

export interface Game {
  id: number
  created_at: string
  updated_at: string
  type: GameType
  name: string
  name_ar?: string
  description?: string
  description_ar?: string
  difficulty_level: number
  config?: GameConfig
  is_active: boolean
}

// Learning Day Types
export interface LearningDay {
  id: number
  created_at: string
  updated_at: string
  day_number: number
  title: string
  title_ar?: string
  description?: string
  description_ar?: string
  required_correct_games: number
  is_active: boolean
}

// Day Games Junction
export interface DayGame {
  id: number
  created_at: string
  learning_day_id: number
  game_id: number
  order_in_day: number
  game?: Game // Populated when joined
}

// User Progress Types
export interface UserDayProgress {
  id: number
  created_at: string
  updated_at: string
  user_id: number
  learning_day_id: number
  is_completed: boolean
  completed_at?: string
  games_correct_count: number
  current_game_order: number
  learning_day?: LearningDay // Populated when joined
}

export interface GameAttemptData {
  // Memory game data
  moves?: number
  matchedPairs?: number[]
  
  // Matching game data
  correctMatches?: number
  incorrectMatches?: number
  matchPairs?: Array<{ item1: string; item2: string }>
  
  // Sequence game data
  userSequence?: (string | number)[]
  correctSequence?: (string | number)[]
  
  // Attention game data
  foundItems?: string[]
  missedItems?: string[]
  clickAccuracy?: number
  
  // Sorting game data
  sortedItems?: Array<{ item: string; category: string }>
  correctSorts?: number
  incorrectSorts?: number
}

export interface UserGameAttempt {
  id: number
  created_at: string
  user_id: number
  game_id: number
  learning_day_id: number
  day_game_id?: number
  is_correct: boolean
  score: number
  time_taken_seconds?: number
  attempt_number: number
  mistakes_count: number
  game_data?: GameAttemptData
  game?: Game // Populated when joined
}

// Extended types with related data
export interface LearningDayWithGames extends LearningDay {
  day_games: Array<DayGame & { game: Game }>
}

export interface UserDayProgressWithDetails extends UserDayProgress {
  learning_day: LearningDayWithGames
  game_attempts: UserGameAttempt[]
}

// API Response Types
export interface DayProgressResponse {
  day: LearningDay
  progress: UserDayProgress | null
  games: Array<{
    dayGame: DayGame
    game: Game
    attempts: UserGameAttempt[]
    isCompleted: boolean
  }>
}

export interface UserLearningPathStats {
  totalDays: number
  completedDays: number
  currentDay: number
  totalGamesPlayed: number
  totalGamesCompleted: number
  averageScore: number
  totalTimePlayed: number // in seconds
  streak: number // consecutive days completed
  lastPlayedAt?: string
}

// Game State Types (for frontend game components)
export interface GameState {
  gameId: number
  dayGameId: number
  learningDayId: number
  isStarted: boolean
  isCompleted: boolean
  isPaused: boolean
  score: number
  mistakes: number
  timeElapsed: number
  attemptNumber: number
}

export interface MemoryGameState extends GameState {
  cards: Array<{
    id: number
    value: string
    isFlipped: boolean
    isMatched: boolean
  }>
  firstCard?: number
  secondCard?: number
  moves: number
}

export interface MatchingGameState extends GameState {
  leftItems: Array<{ id: string; value: string; matched: boolean }>
  rightItems: Array<{ id: string; value: string; matched: boolean }>
  selectedLeft?: string
  selectedRight?: string
  matches: Array<{ left: string; right: string }>
}

export interface SequenceGameState extends GameState {
  sequence: (string | number)[]
  userSequence: (string | number)[]
  isShowingSequence: boolean
  currentIndex: number
}

export interface AttentionGameState extends GameState {
  items: Array<{
    id: string
    type: string
    position: { x: number; y: number }
    isTarget: boolean
    isFound: boolean
  }>
  foundCount: number
  targetCount: number
}

export interface SortingGameState extends GameState {
  items: Array<{
    id: string
    value: string
    category: string
    currentCategory?: string
  }>
  categories: Array<{
    id: string
    name: string
    items: string[]
  }>
}

