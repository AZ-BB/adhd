"use client"
import { useEffect, useState } from "react"

interface BackgroundSlideshowProps {
  images: string[]
  intervalMs?: number
  fadeMs?: number
}

export default function BackgroundSlideshow({ images, intervalMs = 7000, fadeMs = 1200 }: BackgroundSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!images || images.length === 0) return
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [images, intervalMs])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((src, index) => (
        <div
          key={src + index}
          className={`absolute inset-0 bg-center bg-cover bg-no-repeat transition-opacity ease-in-out pointer-events-none ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${src})`, transitionDuration: `${fadeMs}ms` }}
        ></div>
      ))}
    </div>
  )
}


