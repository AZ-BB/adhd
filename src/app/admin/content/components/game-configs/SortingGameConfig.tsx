'use client'

import { useState, useEffect } from 'react'
import { GameConfig } from '@/types/learning-path'
import { uploadImageFromFormData, deleteGameImage } from '@/actions/storage'

interface SortingGameConfigProps {
  config: GameConfig
  onChange: (config: GameConfig) => void
}

interface CategoryItem {
  id: string
  name: string
  emoji: string
  color: string
  imageUrl?: string
  imagePath?: string
  type?: 'emoji' | 'image'
}

interface SortingItem {
  id: string
  value: string
  emoji: string
  category: string
  imageUrl?: string
  imagePath?: string
  type?: 'emoji' | 'image'
}

const defaultCategoryTypes = {
  colors: {
    name: 'Colors',
    description: 'Sort items by their colors',
    maxItems: 12,
    categories: [
      { name: 'Red', emoji: '🔴', color: '#ef4444' },
      { name: 'Blue', emoji: '🔵', color: '#3b82f6' },
      { name: 'Yellow', emoji: '🟡', color: '#eab308' },
      { name: 'Green', emoji: '🟢', color: '#22c55e' }
    ]
  },
  animals: {
    name: 'Animals',
    description: 'Sort animals by habitat',
    maxItems: 12,
    categories: [
      { name: 'Farm', emoji: '🚜', color: '#f59e0b' },
      { name: 'Wild', emoji: '🌿', color: '#10b981' },
      { name: 'Pets', emoji: '🏠', color: '#8b5cf6' },
      { name: 'Sea', emoji: '🌊', color: '#06b6d4' }
    ]
  },
  shapes: {
    name: 'Shapes',
    description: 'Sort shapes by number of sides',
    maxItems: 10,
    categories: [
      { name: '3 Sides', emoji: '3️⃣', color: '#ec4899' },
      { name: '4 Sides', emoji: '4️⃣', color: '#8b5cf6' },
      { name: 'Circles', emoji: '⭕', color: '#06b6d4' },
      { name: 'Stars', emoji: '⭐', color: '#f59e0b' }
    ]
  },
  sizes: {
    name: 'Sizes',
    description: 'Sort items by their size',
    maxItems: 10,
    categories: [
      { name: 'Tiny', emoji: '🔬', color: '#06b6d4' },
      { name: 'Small', emoji: '🐁', color: '#10b981' },
      { name: 'Big', emoji: '🏠', color: '#f59e0b' },
      { name: 'Huge', emoji: '🏔️', color: '#8b5cf6' }
    ]
  }
}

export default function SortingGameConfig({ config, onChange }: SortingGameConfigProps) {
  const [categoryType, setCategoryType] = useState((config as any).categoryType || 'colors')
  const [itemCount, setItemCount] = useState((config as any).itemCount || 8)
  const [customCategories, setCustomCategories] = useState<CategoryItem[]>(
    (config as any).customCategories || []
  )
  const [customItems, setCustomItems] = useState<SortingItem[]>(
    (config as any).customItems || []
  )
  const [showCustomEditor, setShowCustomEditor] = useState(categoryType === 'custom')
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null)
  const [uploadingItem, setUploadingItem] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    const newConfig: GameConfig = {
      categoryType,
      itemCount
    } as any

    if (categoryType === 'custom') {
      (newConfig as any).customCategories = customCategories;
      (newConfig as any).customItems = customItems
    }

    onChange(newConfig)
  }, [categoryType, itemCount, customCategories, customItems])

  const handleCategoryTypeChange = (newType: string) => {
    setCategoryType(newType)
    setShowCustomEditor(newType === 'custom')
    
    // Initialize with empty custom data if switching to custom
    if (newType === 'custom' && customCategories.length === 0) {
      setCustomCategories([
        { id: 'cat-1', name: 'Category 1', emoji: '📁', color: '#3b82f6', type: 'emoji' },
        { id: 'cat-2', name: 'Category 2', emoji: '📂', color: '#10b981', type: 'emoji' }
      ])
      setCustomItems([])
    }
  }

  // Category management
  const addCategory = () => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']
    const newCategory: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: `Category ${customCategories.length + 1}`,
      emoji: '📁',
      color: colors[customCategories.length % colors.length],
      type: 'emoji'
    }
    setCustomCategories([...customCategories, newCategory])
  }

  const removeCategory = async (id: string) => {
    const category = customCategories.find(cat => cat.id === id)
    // Delete image if exists
    if (category?.imagePath) {
      await deleteGameImage(category.imagePath)
    }
    setCustomCategories(customCategories.filter(cat => cat.id !== id))
    // Remove items in this category
    setCustomItems(customItems.filter(item => item.category !== id))
  }

  const updateCategory = (id: string, updates: Partial<CategoryItem>) => {
    setCustomCategories(customCategories.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ))
  }

  // Item management
  const addItem = () => {
    if (customCategories.length === 0) {
      alert('Please create at least one category first')
      return
    }

    const newItem: SortingItem = {
      id: `item-${Date.now()}`,
      value: `Item ${customItems.length + 1}`,
      emoji: '📦',
      category: customCategories[0].id,
      type: 'emoji'
    }
    setCustomItems([...customItems, newItem])
  }

  const removeItem = async (id: string) => {
    const item = customItems.find(i => i.id === id)
    // Delete image if exists
    if (item?.imagePath) {
      await deleteGameImage(item.imagePath)
    }
    setCustomItems(customItems.filter(item => item.id !== id))
  }

  const updateItem = (id: string, updates: Partial<SortingItem>) => {
    setCustomItems(customItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  // Image upload handlers for categories
  const handleCategoryImageUpload = async (categoryId: string, file: File) => {
    setUploadingCategory(categoryId)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('gameType', 'sorting')

      const result = await uploadImageFromFormData(formData)

      if ('error' in result) {
        setUploadError(result.error)
      } else {
        // Delete old image if exists
        const category = customCategories.find(cat => cat.id === categoryId)
        if (category?.imagePath) {
          await deleteGameImage(category.imagePath)
        }

        updateCategory(categoryId, {
          type: 'image',
          imageUrl: result.url,
          imagePath: result.path
        })
      }
    } catch (error) {
      setUploadError('Failed to upload category image')
    } finally {
      setUploadingCategory(null)
    }
  }

  const handleCategoryFileSelect = (categoryId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleCategoryImageUpload(categoryId, file)
    }
  }

  const switchCategoryToEmoji = async (categoryId: string) => {
    const category = customCategories.find(cat => cat.id === categoryId)
    if (category?.imagePath) {
      await deleteGameImage(category.imagePath)
    }
    updateCategory(categoryId, {
      type: 'emoji',
      imageUrl: undefined,
      imagePath: undefined
    })
  }

  // Image upload handlers for items
  const handleItemImageUpload = async (itemId: string, file: File) => {
    setUploadingItem(itemId)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('gameType', 'sorting')

      const result = await uploadImageFromFormData(formData)

      if ('error' in result) {
        setUploadError(result.error)
      } else {
        // Delete old image if exists
        const item = customItems.find(i => i.id === itemId)
        if (item?.imagePath) {
          await deleteGameImage(item.imagePath)
        }

        updateItem(itemId, {
          type: 'image',
          imageUrl: result.url,
          imagePath: result.path
        })
      }
    } catch (error) {
      setUploadError('Failed to upload item image')
    } finally {
      setUploadingItem(null)
    }
  }

  const handleItemFileSelect = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleItemImageUpload(itemId, file)
    }
  }

  const switchItemToEmoji = async (itemId: string) => {
    const item = customItems.find(i => i.id === itemId)
    if (item?.imagePath) {
      await deleteGameImage(item.imagePath)
    }
    updateItem(itemId, {
      type: 'emoji',
      imageUrl: undefined,
      imagePath: undefined
    })
  }

  const maxItems = categoryType === 'custom' 
    ? 20 
    : defaultCategoryTypes[categoryType as keyof typeof defaultCategoryTypes]?.maxItems || 12

  return (
    <div className="space-y-4">
      {/* Item Count */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Number of Items to Sort *
        </label>
        <input
          type="number"
          min="4"
          max={maxItems}
          value={itemCount}
          onChange={(e) => setItemCount(parseInt(e.target.value) || 8)}
          className="w-full px-4 py-2 bg-black/50 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          How many items to sort (4-{maxItems})
        </p>
      </div>

      {/* Category Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Sorting Category Type *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(defaultCategoryTypes).map(([key, type]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleCategoryTypeChange(key)}
              className={`p-3 rounded-lg border transition-all text-left ${
                categoryType === key
                  ? 'border-purple-500 bg-purple-600/20 text-white'
                  : 'border-purple-800/30 bg-black/20 text-gray-400 hover:border-purple-700/50'
              }`}
            >
              <div className="font-medium">{type.name}</div>
              <div className="text-xs opacity-75 mt-1">{type.description}</div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleCategoryTypeChange('custom')}
            className={`p-3 rounded-lg border transition-all text-left ${
              categoryType === 'custom'
                ? 'border-purple-500 bg-purple-600/20 text-white'
                : 'border-purple-800/30 bg-black/20 text-gray-400 hover:border-purple-700/50'
            }`}
          >
            <div className="font-medium">Custom</div>
            <div className="text-xs opacity-75 mt-1">Create your own</div>
          </button>
        </div>
      </div>

      {/* Preview Default Categories */}
      {categoryType !== 'custom' && (
        <div className="p-4 bg-black/30 border border-purple-800/30 rounded-lg">
          <div className="text-sm font-medium text-gray-300 mb-3">
            Preview Categories
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {defaultCategoryTypes[categoryType as keyof typeof defaultCategoryTypes].categories.map((cat, index) => (
              <div
                key={index}
                className="p-3 rounded-lg text-center"
                style={{ 
                  backgroundColor: `${cat.color}20`,
                  borderLeft: `4px solid ${cat.color}`
                }}
              >
                <div className="text-2xl mb-1">{cat.emoji}</div>
                <div className="text-sm text-white font-medium">{cat.name}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-400">
            Items will be automatically distributed across these categories
          </div>
        </div>
      )}

      {/* Custom Editor */}
      {showCustomEditor && (
        <div className="space-y-4">
          {/* Categories Editor */}
          <div className="p-4 bg-black/30 border border-purple-800/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-300">
                  Custom Categories
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Define the categories for sorting (emoji or image)
                </div>
              </div>
              <button
                type="button"
                onClick={addCategory}
                disabled={customCategories.length >= 6}
                className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add Category
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {uploadError}
              </div>
            )}

            {customCategories.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                No categories yet. Click "Add Category" to create one.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customCategories.map((category) => (
                  <div key={category.id} className="p-3 bg-black/50 border border-purple-800/50 rounded-lg space-y-2">
                    <div className="flex items-start gap-2">
                      {/* Preview */}
                      <div 
                        className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{ backgroundColor: `${category.color}30` }}
                      >
                        {category.type === 'image' && category.imageUrl ? (
                          <img 
                            src={category.imageUrl} 
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-3xl">{category.emoji || '📁'}</div>
                        )}
                      </div>

                      {/* Fields */}
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          placeholder="Category name"
                          value={category.name}
                          onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                          className="w-full px-2 py-1 bg-black/50 border border-purple-800/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        
                        {category.type === 'emoji' ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Emoji"
                              value={category.emoji}
                              onChange={(e) => updateCategory(category.id, { emoji: e.target.value })}
                              className="w-20 px-2 py-1 bg-black/50 border border-purple-800/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 text-center"
                            />
                            <input
                              type="color"
                              value={category.color}
                              onChange={(e) => updateCategory(category.id, { color: e.target.value })}
                              className="w-12 h-8 bg-black/50 border border-purple-800/30 rounded cursor-pointer"
                            />
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">Image uploaded</div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-1">
                          {category.type === 'emoji' ? (
                            <label className="flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleCategoryFileSelect(category.id, e)}
                                disabled={uploadingCategory === category.id}
                                className="hidden"
                              />
                              <div className="px-2 py-1 bg-blue-600/20 border border-blue-500/50 rounded text-blue-300 text-xs text-center cursor-pointer hover:bg-blue-600/30">
                                {uploadingCategory === category.id ? 'Uploading...' : '📷 Upload Image'}
                              </div>
                            </label>
                          ) : (
                            <button
                              type="button"
                              onClick={() => switchCategoryToEmoji(category.id)}
                              className="flex-1 px-2 py-1 bg-orange-600/20 border border-orange-500/50 rounded text-orange-300 text-xs hover:bg-orange-600/30"
                            >
                              🔄 Switch to Emoji
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeCategory(category.id)}
                            className="px-2 py-1 bg-red-600/20 border border-red-500/50 rounded text-red-300 text-xs hover:bg-red-600/30"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {customCategories.length > 0 && customCategories.length < 2 && (
              <div className="text-xs text-yellow-400">
                ⚠️ You need at least 2 categories for a sorting game
              </div>
            )}
          </div>

          {/* Items Editor */}
          <div className="p-4 bg-black/30 border border-purple-800/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-300">
                  Items to Sort
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Create items that kids will sort (emoji or image)
                </div>
              </div>
              <button
                type="button"
                onClick={addItem}
                disabled={customCategories.length < 2}
                className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add Item
              </button>
            </div>

            {customCategories.length < 2 && (
              <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 text-sm">
                ⚠️ Please create at least 2 categories before adding items
              </div>
            )}

            {customItems.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                No items yet. Click "Add Item" to create one.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customItems.map((item) => (
                  <div key={item.id} className="p-3 bg-black/50 border border-purple-800/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      {/* Preview */}
                      <div className="w-16 h-16 bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.type === 'image' && item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.value}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-2xl">{item.emoji || '📦'}</div>
                        )}
                      </div>

                      {/* Fields */}
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          placeholder="Item name"
                          value={item.value}
                          onChange={(e) => updateItem(item.id, { value: e.target.value })}
                          className="w-full px-2 py-1 bg-black/50 border border-purple-800/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        
                        <div className="flex gap-2">
                          {item.type === 'emoji' && (
                            <input
                              type="text"
                              placeholder="Emoji"
                              value={item.emoji}
                              onChange={(e) => updateItem(item.id, { emoji: e.target.value })}
                              className="w-16 px-2 py-1 bg-black/50 border border-purple-800/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 text-center"
                            />
                          )}
                          <select
                            value={item.category}
                            onChange={(e) => updateItem(item.id, { category: e.target.value })}
                            className="flex-1 px-2 py-1 bg-black/50 border border-purple-800/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            {customCategories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.emoji} {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          {item.type === 'emoji' ? (
                            <label className="flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleItemFileSelect(item.id, e)}
                                disabled={uploadingItem === item.id}
                                className="hidden"
                              />
                              <div className="px-2 py-1 bg-blue-600/20 border border-blue-500/50 rounded text-blue-300 text-xs text-center cursor-pointer hover:bg-blue-600/30">
                                {uploadingItem === item.id ? 'Uploading...' : '📷 Upload Image'}
                              </div>
                            </label>
                          ) : (
                            <button
                              type="button"
                              onClick={() => switchItemToEmoji(item.id)}
                              className="flex-1 px-2 py-1 bg-orange-600/20 border border-orange-500/50 rounded text-orange-300 text-xs hover:bg-orange-600/30"
                            >
                              🔄 Switch to Emoji
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="px-2 py-1 bg-red-600/20 border border-red-500/50 rounded text-red-300 text-xs hover:bg-red-600/30"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {customItems.length > 0 && customItems.length < itemCount && (
              <div className="text-xs text-yellow-400">
                ⚠️ You have {customItems.length} items but need {itemCount}. Add more items or reduce item count.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Configuration Summary */}
      <div className="p-3 bg-purple-900/20 border border-purple-800/30 rounded-lg">
        <div className="text-xs text-gray-400">Configuration Summary</div>
        <div className="text-sm text-white mt-1">
          • Category type: <span className="text-purple-400">{categoryType}</span><br />
          • Items to sort: <span className="text-purple-400">{itemCount}</span><br />
          {categoryType === 'custom' && (
            <>
              • Custom categories: <span className="text-purple-400">{customCategories.length}</span><br />
              • Custom items: <span className="text-purple-400">{customItems.length}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

