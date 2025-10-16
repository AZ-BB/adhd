# Content Management System - Complete Guide

## Overview

The admin panel now includes a comprehensive Content Management System (CMS) that allows administrators to:
- Create and manage learning days
- Create and manage games with full customization
- Assign games to specific days
- Reorder games within a day
- All games are fully customizable through a JSON configuration

## Features

### 1. Learning Days Management

**Location**: Admin Panel → Content → Learning Days Tab

**Capabilities**:
- Create new learning days with custom content
- Edit existing days
- Delete days (will also remove user progress)
- Configure:
  - Day number (unique identifier)
  - Title (English & Arabic)
  - Description (English & Arabic)
  - Required correct games to complete the day
  - Active/Inactive status

**Fields**:
```typescript
{
  day_number: number,          // Unique day number (1-30 or more)
  title: string,               // English title
  title_ar?: string,           // Arabic title (optional)
  description?: string,        // English description
  description_ar?: string,     // Arabic description
  required_correct_games: number, // How many games needed to complete (default: 5)
  is_active: boolean          // Visibility to users
}
```

### 2. Game Management

**Location**: Admin Panel → Content → Games Tab

**Game Types Available**:
- 🎯 Matching Game - Match items with their pairs
- 🧠 Memory Game - Card matching memory game
- 🔢 Sequence Game - Number/pattern sequences
- 👀 Attention Game - Spot differences and items
- 📊 Sorting Game - Sort items by categories

**Capabilities**:
- Create new games with custom configurations
- Edit existing games
- Delete games
- Configure game-specific parameters through JSON config

**Common Fields**:
```typescript
{
  type: 'matching' | 'memory' | 'sequence' | 'attention' | 'sorting',
  name: string,              // English name
  name_ar?: string,          // Arabic name
  description?: string,      // English description
  description_ar?: string,   // Arabic description
  difficulty_level: 1-5,     // Game difficulty
  config: GameConfig,        // Game-specific configuration
  is_active: boolean         // Available for assignment
}
```

### 3. Memory Game - Full Customization with Images

The memory game is now **fully customizable** with support for:

#### Built-in Themes:
1. **Animals** - Dog, Cat, Rabbit, Bear, Lion, Tiger, Elephant, Monkey (emojis)
2. **Shapes** - Circle, Square, Triangle, Star, Heart, Diamond (emojis)
3. **Colors** - Red, Blue, Green, Yellow, Purple, Orange, Pink, Brown (emojis)

#### Custom Cards with Image Upload:
Create your own memory cards with:
- **Emojis or text** - Quick and easy
- **Uploaded images** - Professional, realistic cards
- **Mixed content** - Combine emojis and images

**Configuration Options:**
```typescript
{
  pairs: number,              // 3-12 pairs (6-24 cards)
  timeLimit: number,          // Seconds (0 = no limit)
  theme: 'animals' | 'shapes' | 'colors' | 'custom',
  customCards?: [             // For custom theme
    {
      id: string,
      value: string,          // Matching identifier
      label: string,          // Display name
      type: 'emoji' | 'image',
      imageUrl?: string,      // Uploaded image URL
      imagePath?: string      // Storage path
    }
  ]
}
```

**Image Upload Features:**
- 📷 Direct upload from admin panel
- 🖼️ Supports JPG, PNG, GIF, WebP
- 📏 Max 5MB per image
- 🔄 Automatic cleanup on deletion
- 🎨 Live preview

**Example Use Cases:**
- Vocabulary learning with real photos
- Family members matching
- Historical figures
- Math problems (equation → answer)
- Flags → Country names

See `MEMORY_GAME_CUSTOMIZATION.md` for detailed guide.

### 4. Matching Game - Full Customization

The matching game is now **fully customizable** with the following options:

#### Built-in Categories:
1. **Colors** - Match objects with their colors (e.g., Apple 🍎 → Red)
2. **Shapes** - Match shape names with symbols (e.g., Circle → ⭕)
3. **Animals** - Match animals with their sounds (e.g., Dog 🐕 → Bark)

#### Custom Pairs:
Create your own matching pairs with any content you want!

**Configuration Structure**:
```typescript
{
  itemCount: number,           // How many pairs (3-10)
  category: 'colors' | 'shapes' | 'animals' | 'custom',
  customPairs?: [              // Only for custom category
    { left: string, right: string },
    { left: string, right: string },
    ...
  ]
}
```

**Example Custom Configuration**:
```json
{
  "itemCount": 5,
  "category": "custom",
  "customPairs": [
    { "left": "France 🇫🇷", "right": "Paris" },
    { "left": "Egypt 🇪🇬", "right": "Cairo" },
    { "left": "Japan 🇯🇵", "right": "Tokyo" },
    { "left": "USA 🇺🇸", "right": "Washington DC" },
    { "left": "UK 🇬🇧", "right": "London" }
  ]
}
```

### 5. Day-Game Assignments

**Location**: Admin Panel → Content → Assign Games Tab

**Capabilities**:
- Select a day from the left sidebar
- View currently assigned games
- Reorder games using up/down arrows
- Add new games from available pool
- Remove games from days

**Features**:
- Real-time order management (1st, 2nd, 3rd game, etc.)
- Visual indication of assigned vs available games
- Drag-free reordering with simple buttons
- Prevents duplicate assignments

## Setup Required

### Storage Setup for Image Uploads

Before using image uploads in Memory Games (and future features), set up Supabase Storage:

**Quick Setup:**
```bash
# Run the migration
npx supabase migration up
```

**Manual Setup:**
See `ADMIN_STORAGE_SETUP.md` for detailed instructions.

This creates a `game-assets` bucket for storing uploaded images with proper security policies.

---

## How to Use

### Creating a New Day with Custom Games

#### Step 1: Create a Learning Day

1. Go to **Admin Panel** → **Content**
2. Click **Learning Days** tab
3. Click **"Create New Learning Day"**
4. Fill in the form:
   - Day Number: 31 (next available)
   - Title: "Countries and Capitals"
   - Title (Arabic): "الدول والعواصم"
   - Description: "Learn world capitals through matching"
   - Required Games: 3
   - Active: ✓ Checked
5. Click **"Create Day"**

#### Step 2: Create Custom Games

1. Click **Games** tab
2. Click **"Create New Game"**
3. Select **Matching Game** type
4. Fill in details:
   - Name: "World Capitals"
   - Name (Arabic): "عواصم العالم"
   - Description: "Match countries with their capitals"
   - Difficulty: 2
5. In **Game Configuration**:
   - Item Count: 5
   - Category: **Custom**
   - Click **"+ Add Pair"** and create pairs:
     - France 🇫🇷 → Paris
     - Egypt 🇪🇬 → Cairo
     - Japan 🇯🇵 → Tokyo
     - USA 🇺🇸 → Washington DC
     - UK 🇬🇧 → London
6. Click **"Create Game"**

Repeat for more games with different themes!

#### Step 3: Assign Games to the Day

1. Click **Assign Games** tab
2. Select "Day 31: Countries and Capitals" from left sidebar
3. From **Available Games** section, click **"+ Assign to Day"** on:
   - World Capitals
   - (Any other games you created)
4. Games will appear in **Assigned Games** section
5. Use ▲▼ buttons to reorder if needed

#### Step 4: Test the Day

1. Go to main site as a user
2. Navigate to Learning Path
3. Access Day 31 (if available based on time)
4. Play the customized games!

## Database Structure

### Tables Used

1. **learning_days** - Stores all learning day configurations
2. **games** - Stores all game definitions with config
3. **day_games** - Junction table linking games to days with order
4. **user_day_progress** - Tracks user completion of days
5. **user_game_attempts** - Records every game attempt

### Game Config (JSONB Field)

The `config` field in the `games` table is a flexible JSONB field that can store any game-specific configuration. This makes games fully customizable without schema changes.

**Matching Game Config**:
```json
{
  "itemCount": 5,
  "category": "colors",
  "customPairs": []
}
```

**Memory Game Config**:
```json
{
  "pairs": 6,
  "timeLimit": 90,
  "theme": "shapes"
}
```

**Sequence Game Config**:
```json
{
  "numberCount": 5,
  "start": 1,
  "sequenceLength": 5
}
```

## API Actions

All server actions are located in: `src/actions/content-management.ts`

### Learning Days Actions:
- `getAllLearningDays()` - Get all days including inactive
- `getLearningDayById(id)` - Get single day
- `createLearningDay(params)` - Create new day
- `updateLearningDay(id, params)` - Update existing day
- `deleteLearningDay(id)` - Delete day

### Games Actions:
- `getAllGames()` - Get all games
- `getGamesByType(type)` - Filter by game type
- `getGameById(id)` - Get single game
- `createGame(params)` - Create new game
- `updateGame(id, params)` - Update game
- `deleteGame(id)` - Delete game

### Assignment Actions:
- `getDayGames(dayId)` - Get games for a day
- `assignGameToDay(params)` - Assign game to day
- `removeGameFromDay(dayGameId)` - Remove assignment
- `updateDayGamesOrder(assignments)` - Reorder games

## Game Rendering

Games are rendered in: `src/app/(protected)/learning-path/[day]/LearningDayClientAr.tsx`

The system automatically:
1. Fetches day configuration from database
2. Loads assigned games with their configs
3. Renders appropriate game component based on type
4. Passes configuration to game component
5. Records attempts and scores
6. Updates user progress

## Extending the System

### Adding New Game Types

1. **Create Game Component** in `src/components/games/YourGame.tsx`:
```typescript
interface YourGameProps {
  game: Game
  userId: number
  learningDayId: number
  dayGameId: number
  onComplete: (isCorrect: boolean, score: number) => void
}

export default function YourGame({ game, userId, learningDayId, dayGameId, onComplete }: YourGameProps) {
  const config = game.config as GameConfig
  // Use config to customize game behavior
  // ...
}
```

2. **Add Game Type** to types in `src/types/learning-path.ts`:
```typescript
export type GameType = 'memory' | 'matching' | 'sequence' | 'attention' | 'sorting' | 'your_new_type'
```

3. **Create Config Component** in `src/app/admin/content/components/game-configs/YourGameConfig.tsx`

4. **Add to GameManagement.tsx**:
```typescript
const gameTypes = [
  // ... existing types
  { value: 'your_new_type', label: 'Your Game', icon: '🎮' }
]
```

5. **Add to LearningDayClient** rendering logic

### Adding New Config Fields

Simply update the game config in admin panel - the JSONB field accepts any valid JSON structure!

## Security

- All actions use server-side authentication
- Admin access is checked via middleware
- Role-based access control is enforced
- User data is isolated and protected

## Future Enhancements

Possible additions:
- Bulk game creation
- Game templates
- Import/export functionality
- Game preview mode
- Advanced analytics per game
- A/B testing different configurations
- Game difficulty auto-adjustment
- Multi-language support for more languages

## Troubleshooting

**Games not appearing?**
- Check if games are marked as `is_active = true`
- Verify games are assigned to the day
- Check day is active and accessible (time-based)

**Can't edit a day?**
- Ensure you have admin privileges
- Check database connection
- Verify day exists and isn't deleted

**Custom pairs not working?**
- Ensure category is set to "custom"
- Verify customPairs array has enough pairs for itemCount
- Check JSON structure is valid

## Summary

The Content Management System provides:
✅ Complete control over learning content
✅ Fully customizable games without code changes
✅ Easy-to-use admin interface
✅ Flexible configuration system
✅ Bilingual support (English/Arabic)
✅ Real-time updates
✅ Safe data management

All changes are immediately reflected for users, and the system scales to support unlimited days and games!

