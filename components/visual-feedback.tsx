"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Loader2, Heart, Download } from "lucide-react"

interface VisualFeedbackProps {
  type: "success" | "error" | "generating" | "like" | "download"
  trigger: boolean
  onComplete?: () => void
}

export function VisualFeedback({ type, trigger, onComplete }: VisualFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (trigger) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [trigger, onComplete])

  if (!isVisible) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-8 h-8 text-green-500" />
      case "error":
        return <XCircle className="w-8 h-8 text-red-500" />
      case "generating":
        return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      case "like":
        return <Heart className="w-8 h-8 text-red-500 fill-current" />
      case "download":
        return <Download className="w-8 h-8 text-green-500" />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg animate-pulse">{getIcon()}</div>
    </div>
  )
}

export function LoadingAnimation({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-lg font-medium dark:text-white">Generating...</span>
        </div>
      </div>
    </div>
  )
}

export function ProgressBar({ progress, isVisible }: { progress: number; isVisible: boolean }) {
  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium dark:text-white">Generating Images</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

export function FloatingFeedback({
  message,
  type,
  isVisible,
  onClose,
}: {
  message: string
  type: "success" | "error"
  isVisible: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
      <div
        className={`p-4 rounded-lg shadow-lg max-w-sm ${
          type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}
      >
        <div className="flex items-center gap-2">
          {type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{message}</span>
        </div>
      </div>
    </div>
  )
}
