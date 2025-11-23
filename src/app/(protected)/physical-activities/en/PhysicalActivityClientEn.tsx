'use client'

import { useState, useRef } from 'react'
import { PhysicalActivityDayInfo } from '@/types/physical-activities'
import { recordPhysicalActivityWatch } from '@/actions/physical-activities'
import { useRouter } from 'next/navigation'

interface PhysicalActivityClientEnProps {
  activityInfo: PhysicalActivityDayInfo
  userId: number
}

export default function PhysicalActivityClientEn({ activityInfo, userId }: PhysicalActivityClientEnProps) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null)
  const [localWatchedVideos, setLocalWatchedVideos] = useState<number[]>(activityInfo.watchedVideoNumbers)
  const [showCompletionMessage, setShowCompletionMessage] = useState(false)
  
  // Get video URL from storage
  const getVideoUrl = (storagePath: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    return `${supabaseUrl}/storage/v1/object/public/physical-activities/${storagePath}`
  }
  
  const handlePlay = () => {
    if (!watchStartTime) {
      setWatchStartTime(Date.now())
    }
  }
  
  const handleVideoEnd = async () => {
    const currentVideo = activityInfo.availableVideos[currentVideoIndex]
    if (!currentVideo || !watchStartTime) return
    
    // Check if already watched
    if (localWatchedVideos.includes(currentVideo.video_number)) return
    
    const watchDuration = Math.floor((Date.now() - watchStartTime) / 1000)
    
    const result = await recordPhysicalActivityWatch(
      userId,
      currentVideo.video_number,
      watchDuration
    )
    
    if (result.success) {
      setLocalWatchedVideos([...localWatchedVideos, currentVideo.video_number])
      setShowCompletionMessage(true)
      
      // Hide message after 3 seconds
      setTimeout(() => {
        setShowCompletionMessage(false)
        
        // Auto-advance to next video if available
        if (currentVideoIndex < activityInfo.availableVideos.length - 1) {
          handleNext()
        } else {
          // All videos watched, refresh page
          router.refresh()
        }
      }, 3000)
    }
  }
  
  const handleNext = () => {
    if (currentVideoIndex < activityInfo.availableVideos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1)
      setWatchStartTime(null)
      if (videoRef.current) {
        videoRef.current.load()
      }
    }
  }
  
  const handlePrevious = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1)
      setWatchStartTime(null)
      if (videoRef.current) {
        videoRef.current.load()
      }
    }
  }
  
  const isVideoWatched = (videoNumber: number) => {
    return localWatchedVideos.includes(videoNumber)
  }
  
  if (activityInfo.availableVideos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-6xl mb-4">🎥</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Videos Available</h2>
          <p className="text-gray-600">Please try again later or contact support</p>
        </div>
      </div>
    )
  }
  
  const currentVideo = activityInfo.availableVideos[currentVideoIndex]
  const watchedCount = localWatchedVideos.length
  const totalTodayVideos = activityInfo.availableVideos.length
  const isCurrentWatched = isVideoWatched(currentVideo.video_number)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            🏃 Daily Physical Activities
          </h1>
          <p className="text-gray-600 text-lg">
            Video {currentVideoIndex + 1} of {totalTodayVideos} - Watched {watchedCount} videos
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-purple-800">Today's Progress</h3>
            <span className="text-purple-600 font-bold">
              {Math.round((watchedCount / totalTodayVideos) * 100)}%
            </span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${(watchedCount / totalTodayVideos) * 100}%` }}
            />
          </div>
          <p className="text-purple-600 text-sm mt-2 text-center">
            {watchedCount === totalTodayVideos 
              ? "🎉 Great job! You've completed all of today's videos!"
              : `Watched ${watchedCount} out of ${totalTodayVideos} videos`}
          </p>
        </div>
        
        {/* Video Player Section */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          {/* Video Info Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-white/20 rounded-full px-4 py-1 text-sm font-bold">
                  Video #{currentVideo.video_number}
                </span>
                {isCurrentWatched && (
                  <span className="bg-green-500 rounded-full px-4 py-1 text-sm font-bold flex items-center gap-1">
                    <span>✓</span>
                    <span>Watched</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold">{currentVideo.title}</h2>
              {currentVideo.description && (
                <p className="text-blue-100 mt-2">{currentVideo.description}</p>
              )}
              {currentVideo.duration_seconds && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span>⏱️</span>
                  <span>Duration: {Math.floor(currentVideo.duration_seconds / 60)} minutes</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Video Player */}
          <div className="relative bg-black aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              onPlay={handlePlay}
              onEnded={handleVideoEnd}
              poster={currentVideo.thumbnail_url}
            >
              <source src={getVideoUrl(currentVideo.storage_path)} type="video/mp4" />
              Your browser does not support the video tag
            </video>
          </div>
          
          {/* Status Messages */}
          <div className="p-6">
            {showCompletionMessage && (
              <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-6 text-center animate-pulse mb-4">
                <div className="text-5xl mb-3">🎉</div>
                <p className="text-white font-bold text-2xl mb-2">Well Done!</p>
                <p className="text-white text-lg">Your progress has been recorded</p>
              </div>
            )}
            
            {isCurrentWatched && !showCompletionMessage && (
              <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4 text-center mb-4">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-green-800 font-semibold text-lg">
                  Great! You've watched this video
                </p>
              </div>
            )}
            
            {!isCurrentWatched && !showCompletionMessage && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-blue-800 font-semibold mb-1">Tip:</p>
                    <p className="text-blue-600 text-sm">
                      Watch the video until the end to record your progress
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentVideoIndex === 0}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>←</span>
                <span>Previous</span>
              </button>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {currentVideoIndex + 1} / {totalTodayVideos}
                </div>
                <div className="text-xs text-gray-600">Current Video</div>
              </div>
              
              <button
                onClick={handleNext}
                disabled={currentVideoIndex === totalTodayVideos - 1}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Next</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Video Thumbnails / Dots Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Today's Videos</h3>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {activityInfo.availableVideos.map((video, index) => (
              <button
                key={video.id}
                onClick={() => {
                  setCurrentVideoIndex(index)
                  setWatchStartTime(null)
                  if (videoRef.current) {
                    videoRef.current.load()
                  }
                }}
                className={`relative group transition-all ${
                  index === currentVideoIndex
                    ? 'ring-4 ring-blue-500 scale-110'
                    : 'hover:scale-105'
                }`}
              >
                <div className={`w-24 h-24 rounded-xl flex flex-col items-center justify-center ${
                  isVideoWatched(video.video_number)
                    ? 'bg-gradient-to-br from-green-400 to-green-600'
                    : index === currentVideoIndex
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                    : 'bg-gradient-to-br from-gray-300 to-gray-400'
                }`}>
                  {isVideoWatched(video.video_number) ? (
                    <div className="text-white">
                      <div className="text-3xl">✓</div>
                      <div className="text-xs mt-1">#{video.video_number}</div>
                    </div>
                  ) : (
                    <div className="text-white">
                      <div className="text-2xl font-bold">#{video.video_number}</div>
                      {index === currentVideoIndex && (
                        <div className="text-xs mt-1">Playing</div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {video.title}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 text-center border-2 border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{activityInfo.totalVideosWatched}</div>
            <div className="text-sm text-gray-600">Total Videos Watched</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center border-2 border-purple-200">
            <div className="text-3xl font-bold text-purple-600">{totalTodayVideos}</div>
            <div className="text-sm text-gray-600">Today's Videos</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center border-2 border-green-200">
            <div className="text-3xl font-bold text-green-600">{activityInfo.totalVideosAvailable}</div>
            <div className="text-sm text-gray-600">Total Available</div>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📋</span>
            <span>Instructions</span>
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">1.</span>
              <span>Watch the current video and follow the movements carefully</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">2.</span>
              <span>Use "Next" and "Previous" buttons to navigate between videos</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">3.</span>
              <span>Click on the numbered boxes below to jump to a specific video</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">4.</span>
              <span>Watch videos until the end to record your progress</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">5.</span>
              <span>Make sure you have enough space to move safely</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
