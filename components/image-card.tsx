"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Download, Share, ZoomIn } from "lucide-react"

interface GeneratedImage {
  id: string
  prompt: string
  url: string
  model: string
  size: string
  quality: string
  seed: number
  timestamp: Date
  liked: boolean
  views: number
}

interface ImageCardProps {
  image: GeneratedImage
  onLike: (id: string) => void
  onDownload: (url: string, prompt: string) => void
  onShare: (image: GeneratedImage) => void
  onZoom: (image: GeneratedImage) => void
}

export function ImageCard({ image, onLike, onDownload, onShare, onZoom }: ImageCardProps) {
  return (
    <div className="group relative bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="aspect-square overflow-hidden">
        <img
          src={image.url || "/placeholder.svg"}
          alt={image.prompt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
          onClick={() => onZoom(image)}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            onClick={() => onZoom(image)}
            size="sm"
            variant="secondary"
            className="bg-white/90 text-black hover:bg-white"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">{image.prompt}</p>
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-1">
            <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
              {image.model.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
              {image.size}
            </Badge>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{image.views} views</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <Button
              onClick={() => onLike(image.id)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 dark:text-white dark:hover:bg-gray-600"
            >
              <Heart className={`w-3 h-3 ${image.liked ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button
              onClick={() => onDownload(image.url, image.prompt)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 dark:text-white dark:hover:bg-gray-600"
            >
              <Download className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => onShare(image)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 dark:text-white dark:hover:bg-gray-600"
            >
              <Share className="w-3 h-3" />
            </Button>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Seed: {image.seed}</span>
        </div>
      </div>
    </div>
  )
}
