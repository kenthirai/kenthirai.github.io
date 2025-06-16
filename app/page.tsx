"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  History,
  Settings,
  Coins,
  Zap,
  Save,
  Trash2,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Shuffle,
  Plus,
  Minus,
  RefreshCw,
  Lock,
  Clock,
  Eye,
  EyeOff,
  Volume2,
  Play,
  Pause,
  Download,
  Heart,
  Share,
  ImageIcon,
  Wand2,
  Video,
  Languages,
} from "lucide-react"
import { ToastContainer, useToast } from "@/components/toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { ImageToPrompt } from "@/components/image-to-prompt"
import { VisualFeedback, LoadingAnimation, ProgressBar, FloatingFeedback } from "@/components/visual-feedback"
import { VideoPromptCreator } from "@/components/video-prompt-creator"
import { EnhancedPromptCreator } from "@/components/enhanced-prompt-creator"

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

interface SavedPrompt {
  id: string
  text: string
  category: string
  timestamp: Date
  used: number
}

interface ImageSize {
  label: string
  width: number
  height: number
}

interface QualityOption {
  label: string
  value: string
  cost: number
}

interface AudioItem {
  id: string
  text: string
  url: string
  timestamp: Date
}

const imageSizes: ImageSize[] = [
  { label: "1:1 Square", width: 1024, height: 1024 },
  { label: "4:3 Landscape", width: 1024, height: 768 },
  { label: "3:4 Portrait", width: 768, height: 1024 },
  { label: "16:9 Wide", width: 1024, height: 576 },
  { label: "9:16 Tall", width: 576, height: 1024 },
  { label: "2:3 Portrait", width: 1024, height: 1536 },
  { label: "3:2 Landscape", width: 1536, height: 1024 },
]

const qualityOptions: QualityOption[] = [
  { label: "Standard", value: "standard", cost: 1 },
  { label: "HD", value: "hd", cost: 2 },
  { label: "Ultra HD", value: "ultra", cost: 3 },
]

const promptSuggestions = [
  "A majestic dragon flying over a mystical forest",
  "Cyberpunk cityscape with neon lights at night",
  "Beautiful sunset over mountain landscape",
  "Cute robot playing with colorful balloons",
  "Abstract geometric patterns in vibrant colors",
  "Vintage car on a desert highway",
  "Magical underwater scene with glowing creatures",
  "Steampunk airship floating in cloudy sky",
]

export default function AIImageGenerator() {
  const [showPromptCreator, setShowPromptCreator] = useState(false)
  const [showImageToPrompt, setShowImageToPrompt] = useState(false)
  const [showVideoPromptCreator, setShowVideoPromptCreator] = useState(false)
  const [showEnhancedPromptCreator, setShowEnhancedPromptCreator] = useState(false)
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null)
  const [showImageEditor, setShowImageEditor] = useState(false)

  // Visual feedback states
  const [showVisualFeedback, setShowVisualFeedback] = useState(false)
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "generating" | "like" | "download">("success")
  const [generationProgress, setGenerationProgress] = useState(0)
  const [floatingMessage, setFloatingMessage] = useState("")
  const [showFloatingFeedback, setShowFloatingFeedback] = useState(false)

  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [selectedModel, setSelectedModel] = useState("flux")
  const [selectedSize, setSelectedSize] = useState<ImageSize>(imageSizes[2])
  const [selectedQuality, setSelectedQuality] = useState<QualityOption>(qualityOptions[1])
  const [dalleApiKey, setDalleApiKey] = useState("")
  const [showDalleModal, setShowDalleModal] = useState(false)
  const [tempApiKey, setTempApiKey] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [coins, setCoins] = useState(100)
  const [lastResetTime, setLastResetTime] = useState<Date>(new Date())
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 1000000))
  const [batchCount, setBatchCount] = useState(1)
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([])
  const [showPromptManager, setShowPromptManager] = useState(false)
  const [zoomedImage, setZoomedImage] = useState<GeneratedImage | null>(null)
  const [showZoomModal, setShowZoomModal] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetPassword, setResetPassword] = useState("")
  const [customPromptInput, setCustomPromptInput] = useState("")
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false)
  const [streamingText, setStreamingText] = useState("")
  const [showResetSettingsModal, setShowResetSettingsModal] = useState(false)
  const [settings, setSettings] = useState({
    model: "flux",
    size: imageSizes[2],
    quality: qualityOptions[1],
    batchCount: 1,
    noLogo: true,
  })

  // New states for enhanced features
  const [showPassword, setShowPassword] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [showTextToAudio, setShowTextToAudio] = useState(false)
  const [audioText, setAudioText] = useState("")
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState("")
  const [audioHistory, setAudioHistory] = useState<AudioItem[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)

  const { toasts, addToast, removeToast, success, error: showError } = useToast()

  const handleTranslate = async () => {
    if (!prompt.trim()) {
      showError("No Prompt", "Please enter a prompt to translate.")
      return
    }

    setIsTranslating(true);
    try {
      const response = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai",
          messages: [
            {
              role: "user",
              content: `Translate the following text to English. Make it suitable as a prompt for an AI image generator, keeping it descriptive and creative:\n\n"${prompt}"`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      const translatedText = result.choices?.[0]?.message?.content;
      
      if (translatedText) {
        setPrompt(translatedText.trim());
        success("Prompt Translated", "Your prompt has been translated to English.");
      } else {
        throw new Error("Received an empty translation.");
      }

    } catch (err) {
      console.error("Translation error:", err);
      showError("Translation Failed", err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsTranslating(false);
    }
  }

  useEffect(() => {
    const savedHistory = localStorage.getItem("ai-image-history")
    const savedPromptsList = localStorage.getItem("saved-prompts")
    const savedCoins = localStorage.getItem("user-coins")
    const savedResetTime = localStorage.getItem("last-reset-time")
    const savedPrompt = localStorage.getItem("kenthir-current-prompt")
    const savedAudioHistory = localStorage.getItem("audio-history")

    if (savedPrompt) {
      setPrompt(savedPrompt)
    }

    if (savedAudioHistory) {
      const parsed = JSON.parse(savedAudioHistory)
      setAudioHistory(
        parsed.map((audio: any) => ({
          ...audio,
          timestamp: new Date(audio.timestamp),
        })),
      )
    }

    loadSettings()

    if (savedHistory) {
      const parsed = JSON.parse(savedHistory)
      setGeneratedImages(
        parsed.map((img: any) => ({
          ...img,
          timestamp: new Date(img.timestamp),
          liked: img.liked || false,
          views: img.views || 0,
        })),
      )
    }

    if (savedPromptsList) {
      const parsed = JSON.parse(savedPromptsList)
      setSavedPrompts(
        parsed.map((prompt: any) => ({
          ...prompt,
          timestamp: new Date(prompt.timestamp),
        })),
      )
    }

    if (savedCoins) {
      setCoins(Number.parseInt(savedCoins))
    }

    if (savedResetTime) {
      setLastResetTime(new Date(savedResetTime))
    }
  }, [])

  useEffect(() => {
    const checkDailyReset = () => {
      const now = new Date()
      const timeDiff = now.getTime() - lastResetTime.getTime()
      const hoursDiff = timeDiff / (1000 * 3600)

      if (hoursDiff >= 24) {
        resetCoinsDaily()
      }
    }

    checkDailyReset()
    const interval = setInterval(checkDailyReset, 60000)

    return () => clearInterval(interval)
  }, [lastResetTime])

  const resetCoinsDaily = () => {
    setCoins(100)
    const now = new Date()
    setLastResetTime(now)
    localStorage.setItem("user-coins", "100")
    localStorage.setItem("last-reset-time", now.toISOString())
    success("Daily Reset", "Your coins have been reset to 100!")
  }

  const getTimeUntilReset = () => {
    const now = new Date()
    const timeDiff = now.getTime() - lastResetTime.getTime()
    const hoursDiff = timeDiff / (1000 * 3600)
    const hoursLeft = Math.max(0, 24 - hoursDiff)
    const hours = Math.floor(hoursLeft)
    const minutes = Math.floor((hoursLeft - hours) * 60)
    return `${hours}h ${minutes}m`
  }

  const saveHistory = (images: GeneratedImage[]) => {
    localStorage.setItem("ai-image-history", JSON.stringify(images))
  }

  const savePromptsList = (prompts: SavedPrompt[]) => {
    localStorage.setItem("saved-prompts", JSON.stringify(prompts))
  }

  const saveCoins = (coinAmount: number) => {
    localStorage.setItem("user-coins", coinAmount.toString())
    setCoins(coinAmount)
  }

  const saveAudioHistory = (audioItems: AudioItem[]) => {
    localStorage.setItem("audio-history", JSON.stringify(audioItems))
  }

  const handleManualReset = async () => {
    if (!resetPassword.trim()) {
      showError("Password Required", "Please enter the reset password")
      return
    }

    setIsResetting(true)

    try {
      const response = await fetch("/api/verify-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: resetPassword }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Server error: ${response.status}`)
      }

      const data = await response.json()

      resetCoinsDaily()
      setShowResetModal(false)
      setResetPassword("")
      setShowPassword(false)
      success("Manual Reset", "Coins have been manually reset to 100!")
    } catch (error) {
      console.error("Reset error:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        showError("Network Error", "Failed to connect to server. Please check your connection and try again.")
      } else if (error instanceof Error) {
        showError("Reset Failed", error.message)
      } else {
        showError("Unknown Error", "An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsResetting(false)
    }
  }

  const createCustomPrompt = async () => {
    if (!customPromptInput.trim()) {
      showError("No Input", "Please enter your prompt idea")
      return
    }

    setIsCreatingPrompt(true)
    setStreamingText("")

    try {
      const response = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          model: "openai",
          messages: [
            {
              role: "user",
              content: `Create a detailed image generation prompt based on this idea: "${customPromptInput}". Make it artistic, specific, and include technical details like lighting, composition, style, and quality descriptors.`,
            },
          ],
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data.trim() === "[DONE]") {
                break
              }

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  fullResponse += content
                  setStreamingText(fullResponse)
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      if (fullResponse.trim()) {
        setPrompt(fullResponse.trim())
        setShowPromptCreator(false)
        setCustomPromptInput("")
        success("Prompt Created", "Custom prompt has been generated and applied")
      } else {
        throw new Error("No response received")
      }
    } catch (error) {
      console.error("Error creating prompt:", error)
      showError("Creation Failed", "Could not create prompt. Please try again.")
    } finally {
      setIsCreatingPrompt(false)
      setStreamingText("")
    }
  }

  const generateAudio = async () => {
    if (!audioText.trim()) {
      showError("No Text", "Please enter text to convert to audio")
      return
    }

    if (audioText.length > 1000) {
      showError("Text Too Long", "Please limit text to 1000 characters")
      return
    }

    setIsGeneratingAudio(true)

    try {
      const audioUrl = `https://text.pollinations.ai/openai?text=${encodeURIComponent(audioText)}&voice=alloy&model=tts-1&format=mp3&timestamp=${Date.now()}`

      const response = await fetch(audioUrl, { method: "HEAD" })
      if (!response.ok) {
        throw new Error(`Audio generation failed: ${response.status} ${response.statusText}`)
      }

      const newAudio: AudioItem = {
        id: Date.now().toString(),
        text: audioText,
        url: audioUrl,
        timestamp: new Date(),
      }

      const updatedAudioHistory = [newAudio, ...audioHistory.slice(0, 4)]
      setAudioHistory(updatedAudioHistory)
      setGeneratedAudioUrl(audioUrl)
      saveAudioHistory(updatedAudioHistory)

      success("Audio Generated", "Text has been converted to audio successfully!")
      setAudioText("")
    } catch (error) {
      console.error("Audio generation error:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        showError("Network Error", "Failed to connect to audio service. Please check your connection.")
      } else if (error instanceof Error) {
        showError("Audio Generation Failed", error.message)
      } else {
        showError("Generation Failed", "Failed to generate audio. Please try again.")
      }
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const playAudio = (url: string) => {
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
      setIsPlaying(false)
    }

    const audio = new Audio(url)
    audio.addEventListener("ended", () => {
      setIsPlaying(false)
      setCurrentAudio(null)
    })
    audio.addEventListener("error", (e) => {
      console.error("Audio playback error:", e)
      showError("Playback Error", "Failed to play audio. Please try again.")
      setIsPlaying(false)
      setCurrentAudio(null)
    })

    audio
      .play()
      .then(() => {
        setCurrentAudio(audio)
        setIsPlaying(true)
      })
      .catch((error) => {
        console.error("Audio play error:", error)
        showError("Playback Error", "Failed to start audio playback.")
      })
  }

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
      setIsPlaying(false)
    }
  }

  const downloadAudio = async (url: string, text: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Download failed: ${response.status}`)

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `${text.slice(0, 30)}_${Date.now()}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      success("Download Complete", "Audio has been downloaded successfully")
    } catch (error) {
      console.error("Download error:", error)
      showError("Download Failed", error instanceof Error ? error.message : "Unknown error")
    }
  }

  const handleModelChange = (model: string) => {
    if (model === "dalle3") {
      setShowDalleModal(true)
    } else {
      setSelectedModel(model)
    }
  }

  const handleDalleApiSubmit = async () => {
    if (!tempApiKey.trim()) {
      showError("API Key Required", "Please enter a valid API key")
      return
    }

    if (!tempApiKey.startsWith("sk-") || tempApiKey.length < 20) {
      showError("Invalid API Key", "Please enter a valid OpenAI API key.")
      setSelectedModel("flux")
      setShowDalleModal(false)
      setTempApiKey("")
      return
    }

    setDalleApiKey(tempApiKey)
    setSelectedModel("dalle3")
    setShowDalleModal(false)
    setTempApiKey("")
    success("API Key Saved", "DALL-E 3 is now available for use")
  }

  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000))
  }

  const enhancePrompt = async () => {
    if (!prompt.trim()) {
      showError("No Prompt", "Please enter a prompt to enhance")
      return
    }

    setIsEnhancing(true)
    setStreamingText("")

    try {
      const response = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          model: "openai",
          messages: [
            {
              role: "user",
              content: `Enhance this image generation prompt to be more detailed, artistic, and specific. Add technical photography terms, lighting details, and artistic style descriptions. Original prompt: "${prompt}"`,
            },
          ],
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data.trim() === "[DONE]") {
                break
              }

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  fullResponse += content
                  setStreamingText(fullResponse)
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      if (fullResponse.trim()) {
        setPrompt(fullResponse.trim())
        success("Prompt Enhanced", "Your prompt has been enhanced with AI")
      } else {
        throw new Error("No response received")
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error)
      showError("Enhancement Failed", "Could not enhance prompt. Please try again.")
    } finally {
      setIsEnhancing(false)
    }
  }

  const saveSettings = () => {
    const currentSettings = {
      model: selectedModel,
      size: selectedSize,
      quality: selectedQuality,
      batchCount: batchCount,
      noLogo: true,
    }
    localStorage.setItem("kenthir-ai-settings", JSON.stringify(currentSettings))
    setSettings(currentSettings)
  }

  const loadSettings = () => {
    const savedSettings = localStorage.getItem("kenthir-ai-settings")
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSelectedModel(parsed.model || "flux")
      setSelectedSize(parsed.size || imageSizes[2])
      setSelectedQuality(parsed.quality || qualityOptions[1])
      setBatchCount(parsed.batchCount || 1)
      setSettings(parsed)
    }
  }

  const resetToDefaults = () => {
    const defaultSettings = {
      model: "flux",
      size: imageSizes[2],
      quality: qualityOptions[1],
      batchCount: 1,
      noLogo: true,
    }

    setSelectedModel(defaultSettings.model)
    setSelectedSize(defaultSettings.size)
    setSelectedQuality(defaultSettings.quality)
    setBatchCount(defaultSettings.batchCount)
    setSettings(defaultSettings)

    localStorage.setItem("kenthir-ai-settings", JSON.stringify(defaultSettings))
    setShowResetSettingsModal(false)
    success("Settings Reset", "All settings have been reset to default values")
  }

  const generateImage = async () => {
    if (!prompt.trim()) {
      showError("No Prompt", "Please enter a prompt to generate an image")
      return
    }

    const totalCost = 1 * batchCount;

    if (coins < totalCost) {
      showError("Insufficient Coins", `You need ${totalCost} coin(s) but only have ${coins}`)
      return
    }

    setIsGenerating(true)
    setError(null)
    setFeedbackType("generating")
    setShowVisualFeedback(true)
    setGenerationProgress(0)
    saveSettings()

    try {
      const newImages: GeneratedImage[] = []

      for (let i = 0; i < batchCount; i++) {
        setGenerationProgress(Math.round(((i + 1) / batchCount) * 100))

        const currentSeed = seed + i
        
        let promptUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`
        
        let queryParams = `?width=${selectedSize.width}&height=${selectedSize.height}&seed=${currentSeed}`

        if (selectedModel === "dalle3") {
            if (!dalleApiKey) {
                throw new Error("DALL-E 3 requires an API key. Please set it in the settings.")
            }
            queryParams += `&model=dalle3&nologo=true`
        } else if (selectedModel === 'gptimage') {
            // ---- LOGIKA BARU UNTUK GPTIMAGE ----
            queryParams += `&model=gptimage&transparent=true&nologo=true&enhance=true&safe=true`
        } else {
            // Logika untuk model lain (Flux, Turbo)
            const modelParam = selectedModel === "turbo" ? "turbo" : "flux"
            queryParams += `&model=${modelParam}&nologo=true`
        }

        if (negativePrompt.trim() !== "") {
            queryParams += `&negative_prompt=${encodeURIComponent(negativePrompt)}`
        }

        const imageUrl = promptUrl + queryParams

        const newImage: GeneratedImage = {
          id: `${Date.now()}-${i}`,
          prompt,
          url: imageUrl,
          model: selectedModel,
          size: selectedSize.label,
          quality: selectedQuality.label,
          seed: currentSeed,
          timestamp: new Date(),
          liked: false,
          views: 0,
        }

        newImages.push(newImage)
      }

      const updatedImages = [...newImages, ...generatedImages]
      setGeneratedImages(updatedImages)
      saveHistory(updatedImages)

      const newCoinAmount = coins - totalCost
      saveCoins(newCoinAmount)

      success(
        `${batchCount} Image${batchCount > 1 ? "s" : ""} Generated!`,
        `Cost: ${totalCost} coins. Remaining: ${newCoinAmount} coins`,
      )

      generateRandomSeed()
    } catch (error) {
      console.error("Error generating image:", error)
      showError("Generation Failed", error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsGenerating(false)
      setTimeout(() => setGenerationProgress(0), 1500);
    }
  }

  const clearPrompt = () => {
    setPrompt("")
    setStreamingText("")
  }

  const savePrompt = () => {
    if (!prompt.trim()) {
      showError("No Prompt", "Please enter a prompt to save")
      return
    }

    const newPrompt: SavedPrompt = {
      id: Date.now().toString(),
      text: prompt,
      category: "Custom",
      timestamp: new Date(),
      used: 0,
    }

    const updatedPrompts = [newPrompt, ...savedPrompts]
    setSavedPrompts(updatedPrompts)
    savePromptsList(updatedPrompts)
    success("Prompt Saved", "Your prompt has been saved for future use")
  }

  const loadPrompt = (promptText: string) => {
    setPrompt(promptText)
    setShowPromptManager(false)

    const updatedPrompts = savedPrompts.map((p) => (p.text === promptText ? { ...p, used: p.used + 1 } : p))
    setSavedPrompts(updatedPrompts)
    savePromptsList(updatedPrompts)
  }

  const deletePrompt = (id: string) => {
    const updatedPrompts = savedPrompts.filter((p) => p.id !== id)
    setSavedPrompts(updatedPrompts)
    savePromptsList(updatedPrompts)
  }

  const toggleLike = (imageId: string) => {
    const updatedImages = generatedImages.map((img) => (img.id === imageId ? { ...img, liked: !img.liked } : img))
    setGeneratedImages(updatedImages)
    saveHistory(updatedImages)
  }

  const incrementViews = (imageId: string) => {
    const updatedImages = generatedImages.map((img) => (img.id === imageId ? { ...img, views: img.views + 1 } : img))
    setGeneratedImages(updatedImages)
    saveHistory(updatedImages)
  }

  const openZoomModal = (image: GeneratedImage) => {
    setZoomedImage(image)
    setShowZoomModal(true)
    setZoomLevel(100)
    incrementViews(image.id)
  }

  const downloadImage = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Download failed: ${response.status}`)

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `${prompt.slice(0, 30)}_${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      success("Download Complete", "Image has been downloaded successfully")
    } catch (error) {
      showError("Download Failed", error instanceof Error ? error.message : "Unknown error")
    }
  }

  const shareImage = async (image: GeneratedImage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Generated Image",
          text: image.prompt,
          url: image.url,
        })
      } catch (error) {
        console.log("Share cancelled")
      }
    } else {
      navigator.clipboard.writeText(image.url)
      success("Link Copied", "Image URL copied to clipboard")
    }
  }

  const clearHistory = () => {
    setGeneratedImages([])
    localStorage.removeItem("ai-image-history")
    success("History Cleared", "All generated images have been removed")
  }

  const clearAudioHistory = () => {
    setAudioHistory([])
    localStorage.removeItem("audio-history")
    success("Audio History Cleared", "All audio history has been removed")
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (prompt.trim()) {
        localStorage.setItem("kenthir-current-prompt", prompt)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [prompt])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-between items-start mb-4">
            <div></div>
            <div className="text-center flex-1">
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                Kenthir AI Image Generator
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Powered by Pollinations AI & DALL-E
              </p>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-4">
            <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900 px-3 sm:px-4 py-2 rounded-full">
              <Coins className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm sm:text-base">
                {coins} Coins
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-3 sm:w-4 h-3 sm:h-4" />
              <span>Reset in: {getTimeUntilReset()}</span>
            </div>
            <Button onClick={() => setShowResetModal(true)} size="sm" variant="outline">
              <RefreshCw className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
              Manual Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
          <div className="xl:col-span-3">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl dark:text-white">
                  <Settings className="w-4 sm:w-5 h-4 sm:h-5" />
                  Generate Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <Label htmlFor="prompt" className="text-sm sm:text-base dark:text-gray-200">
                      Prompt
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => setShowImageToPrompt(true)} size="sm" variant="outline">
                        <ImageIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Image to Prompt
                      </Button>
                      <Button onClick={() => setShowEnhancedPromptCreator(true)} size="sm" variant="outline">
                        <Wand2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Enhanced Create
                      </Button>
                      <Button onClick={() => setShowVideoPromptCreator(true)} size="sm" variant="outline">
                        <Video className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Video Prompt
                      </Button>
                      <Button onClick={() => setShowTextToAudio(true)} size="sm" variant="outline">
                        <Volume2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Text to Audio
                      </Button>
                      <Button onClick={() => setShowPromptManager(true)} size="sm" variant="outline">
                        <Save className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Manage
                      </Button>
                      <Button onClick={enhancePrompt} size="sm" variant="outline" disabled={isEnhancing}>
                        {isEnhancing ? (
                          <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        )}
                        Enhance
                      </Button>
                      <Button onClick={clearPrompt} size="sm" variant="outline">
                        <Trash2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>

                  <Textarea
                    id="prompt"
                    placeholder="Describe the image you want to generate..."
                    value={isEnhancing ? streamingText || prompt : prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="resize-none text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={isEnhancing}
                  />

                  <div className="flex items-center gap-2">
                    <Button onClick={handleTranslate} size="sm" variant="outline" disabled={isTranslating || !prompt.trim()}>
                        {isTranslating ? (
                          <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1 animate-spin" />
                        ) : (
                          <Languages className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        )}
                        Translate to English
                      </Button>
                  </div>
                  
                  <div>
                    <Label htmlFor="negative-prompt" className="text-xs text-gray-600 dark:text-gray-400">
                        Negative Prompt (Opsional)
                    </Label>
                    <Textarea
                        id="negative-prompt"
                        placeholder="Things to avoid in the image, e.g., 'ugly, deformed, blurry'"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        rows={2}
                        className="resize-none text-sm sm:text-base mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {promptSuggestions.slice(0, 4).map((suggestion, index) => (
                      <Button
                        key={index}
                        onClick={() => setPrompt(suggestion)}
                        size="sm"
                        variant="ghost"
                        className="text-xs h-6 sm:h-7 px-2 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        {suggestion.slice(0, 20)}...
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm dark:text-gray-200">AI Model</Label>
                    <Select value={selectedModel} onValueChange={handleModelChange}>
                      <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="flux" className="dark:text-white dark:focus:bg-gray-600">
                          Flux
                        </SelectItem>
                        <SelectItem value="turbo" className="dark:text-white dark:focus:bg-gray-600">
                          Turbo
                        </SelectItem>
                        <SelectItem value="dalle3" className="dark:text-white dark:focus:bg-gray-600">
                          DALL-E 3
                        </SelectItem>
                        <SelectItem value="gptimage" className="dark:text-white dark:focus:bg-gray-600">
                          GPT-Image
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm dark:text-gray-200">Size</Label>
                    <Select
                      value={selectedSize.label}
                      onValueChange={(value) => {
                        const size = imageSizes.find((s) => s.label === value)
                        if (size) setSelectedSize(size)
                      }}
                    >
                      <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        {imageSizes.map((size) => (
                          <SelectItem
                            key={size.label}
                            value={size.label}
                            className="dark:text-white dark:focus:bg-gray-600"
                          >
                            <span className="hidden sm:inline">{size.label}</span>
                            <span className="sm:hidden">{size.label.split(" ")[0]}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm dark:text-gray-200">
                      Quality
                    </Label>
                    <Select
                      value={selectedQuality.value}
                      onValueChange={(value) => {
                        const quality = qualityOptions.find((q) => q.value === value)
                        if (quality) setSelectedQuality(quality)
                      }}
                    >
                      <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        {qualityOptions.map((quality) => (
                          <SelectItem
                            key={quality.value}
                            value={quality.value}
                            className="dark:text-white dark:focus:bg-gray-600"
                          >
                            {quality.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm dark:text-gray-200">Batch</Label>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        onClick={() => setBatchCount(Math.max(1, batchCount - 1))}
                        size="sm"
                        variant="outline"
                        disabled={batchCount <= 1}
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 sm:w-8 text-center text-xs sm:text-sm dark:text-white">{batchCount}</span>
                      <Button
                        onClick={() => setBatchCount(Math.min(4, batchCount + 1))}
                        size="sm"
                        variant="outline"
                        disabled={batchCount >= 4}
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs sm:text-sm dark:text-gray-200">Seed: {seed}</Label>
                    <Button
                      onClick={generateRandomSeed}
                      size="sm"
                      variant="outline"
                      className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                    >
                      <Shuffle className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Random</span>
                    </Button>
                  </div>
                  <Slider
                    value={[seed]}
                    onValueChange={([value]) => setSeed(value)}
                    min={0}
                    max={1000000}
                    step={1}
                    className="dark:[&>span]:bg-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={generateImage}
                    disabled={isGenerating || !prompt.trim() || coins < batchCount}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating {batchCount} image{batchCount > 1 ? "s" : ""}...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate {batchCount} Image{batchCount > 1 ? "s" : ""}
                      </>
                    )}
                  </Button>

                  {coins < batchCount && !isGenerating && (
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 text-center">
                      Insufficient coins. Need {batchCount} but have {coins}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {generatedImages.length > 0 && (
              <Card className="mt-4 sm:mt-6 dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg sm:text-xl dark:text-white">
                      Generated Images ({generatedImages.length})
                    </CardTitle>
                    <Button
                      onClick={clearHistory}
                      variant="outline"
                      size="sm"
                      className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                    >
                      <Trash2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Clear All</span>
                      <span className="sm:hidden">Clear</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {generatedImages.slice(0, 12).map((image) => (
                      <div
                        key={image.id}
                        className="group relative bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                      >
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.prompt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => openZoomModal(image)}
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">{image.prompt}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                {image.model.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                {image.size}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                onClick={() => toggleLike(image.id)}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 dark:text-white dark:hover:bg-gray-600"
                              >
                                <Heart className={`w-3 h-3 ${image.liked ? "fill-red-500 text-red-500" : ""}`} />
                              </Button>
                              <Button
                                onClick={() => downloadImage(image.url, image.prompt)}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 dark:text-white dark:hover:bg-gray-600"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => shareImage(image)}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 dark:text-white dark:hover:bg-gray-600"
                              >
                                <Share className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <Button
                  onClick={savePrompt}
                  variant="outline"
                  className="w-full justify-start text-xs sm:text-sm dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                >
                  <Save className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                  Save Prompt
                </Button>
                <Button
                  onClick={() => setShowPromptManager(true)}
                  variant="outline"
                  className="w-full justify-start text-xs sm:text-sm dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                >
                  <History className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                  Manage Prompts
                </Button>
                <Button
                  onClick={generateRandomSeed}
                  variant="outline"
                  className="w-full justify-start text-xs sm:text-sm dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                >
                  <Shuffle className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                  Random Seed
                </Button>
                <Button
                  onClick={() => setShowResetSettingsModal(true)}
                  variant="outline"
                  className="w-full justify-start text-xs sm:text-sm dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                >
                  <RotateCcw className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                  Reset Settings
                </Button>
                <Button
                  onClick={() => setShowTextToAudio(true)}
                  variant="outline"
                  className="w-full justify-start text-xs sm:text-sm dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                >
                  <Volume2 className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                  Text to Audio
                </Button>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg dark:text-white">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Images:</span>
                  <span className="font-semibold dark:text-white">{generatedImages.length}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Liked Images:</span>
                  <span className="font-semibold dark:text-white">
                    {generatedImages.filter((img) => img.liked).length}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Views:</span>
                  <span className="font-semibold dark:text-white">
                    {generatedImages.reduce((sum, img) => sum + img.views, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Saved Prompts:</span>
                  <span className="font-semibold dark:text-white">{savedPrompts.length}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Audio Generated:</span>
                  <span className="font-semibold dark:text-white">{audioHistory.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={showTextToAudio} onOpenChange={setShowTextToAudio}>
          <DialogContent className="sm:max-w-2xl dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 dark:text-white">
                <Volume2 className="w-5 h-5" />
                Text to Audio Generator
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="audioText" className="dark:text-gray-200">
                  Enter text to convert to audio (max 1000 characters)
                </Label>
                <Textarea
                  id="audioText"
                  placeholder="Enter the text you want to convert to audio..."
                  value={audioText}
                  onChange={(e) => setAudioText(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{audioText.length}/1000 characters</div>
              </div>

              {generatedAudioUrl && (
                <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                  <Label className="text-sm font-medium dark:text-gray-200">Generated Audio:</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      onClick={() => (isPlaying ? stopAudio() : playAudio(generatedAudioUrl))}
                      size="sm"
                      variant="outline"
                      className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      onClick={() => downloadAudio(generatedAudioUrl, audioText)}
                      size="sm"
                      variant="outline"
                      className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <audio controls className="flex-1">
                      <source src={generatedAudioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              )}

              {audioHistory.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium dark:text-gray-200">Audio History:</Label>
                    <Button
                      onClick={clearAudioHistory}
                      size="sm"
                      variant="outline"
                      className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {audioHistory.map((audio) => (
                      <div key={audio.id} className="border rounded p-2 dark:border-gray-600 dark:bg-gray-700">
                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{audio.text}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            onClick={() => playAudio(audio.url)}
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 dark:text-white dark:hover:bg-gray-600"
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => downloadAudio(audio.url, audio.text)}
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 dark:text-white dark:hover:bg-gray-600"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {audio.timestamp.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={generateAudio} disabled={isGeneratingAudio || !audioText.trim()} className="flex-1">
                  {isGeneratingAudio ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Audio...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Generate Audio
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTextToAudio(false)
                    setAudioText("")
                    setGeneratedAudioUrl("")
                    stopAudio()
                  }}
                  className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
          <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 dark:text-white">
                <Lock className="w-5 h-5" />
                Manual Coin Reset
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter the admin password to manually reset your coins to 100.
              </p>
              <div>
                <Label htmlFor="resetPassword" className="dark:text-gray-200">
                  Admin Password
                </Label>
                <div className="relative">
                  <Input
                    id="resetPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password..."
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                    disabled={isResetting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent dark:text-gray-400 dark:hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isResetting}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleManualReset} className="flex-1" disabled={isResetting || !resetPassword.trim()}>
                  {isResetting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Coins"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResetModal(false)
                    setResetPassword("")
                    setShowPassword(false)
                  }}
                  className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                  disabled={isResetting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showPromptManager} onOpenChange={setShowPromptManager}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Prompt Manager</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="saved" className="w-full">
              <TabsList className="grid w-full grid-cols-2 dark:bg-gray-700">
                <TabsTrigger value="saved" className="dark:data-[state=active]:bg-gray-600 dark:text-gray-200">
                  Saved Prompts ({savedPrompts.length})
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="dark:data-[state=active]:bg-gray-600 dark:text-gray-200">
                  Suggestions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="saved" className="space-y-4">
                {savedPrompts.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">No saved prompts yet</p>
                ) : (
                  <div className="grid gap-3">
                    {savedPrompts.map((savedPrompt) => (
                      <div key={savedPrompt.id} className="border rounded-lg p-3 dark:border-gray-600 dark:bg-gray-700">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm dark:text-gray-200">{savedPrompt.text}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                {savedPrompt.category}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Used {savedPrompt.used} times
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button onClick={() => loadPrompt(savedPrompt.text)} size="sm">
                              Use
                            </Button>
                            <Button
                              onClick={() => deletePrompt(savedPrompt.id)}
                              size="sm"
                              variant="outline"
                              className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-4">
                <div className="grid gap-3">
                  {promptSuggestions.map((suggestion, index) => (
                    <div key={index} className="border rounded-lg p-3 dark:border-gray-600 dark:bg-gray-700">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm flex-1 dark:text-gray-200">{suggestion}</p>
                        <Button onClick={() => loadPrompt(suggestion)} size="sm">
                          Use
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        <Dialog open={showZoomModal} onOpenChange={setShowZoomModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between dark:text-white">
                <span>Image Viewer</span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                    size="sm"
                    variant="outline"
                    className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm dark:text-gray-200">{zoomLevel}%</span>
                  <Button
                    onClick={() => setZoomLevel(Math.min(400, zoomLevel + 25))}
                    size="sm"
                    variant="outline"
                    className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setZoomLevel(100)}
                    size="sm"
                    variant="outline"
                    className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            {zoomedImage && (
              <div className="overflow-auto max-h-[70vh]">
                <img
                  src={zoomedImage.url || "/placeholder.svg"}
                  alt={zoomedImage.prompt}
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top left" }}
                  className="max-w-none"
                />
                <div className="mt-4 space-y-2">
                  <p className="text-sm dark:text-gray-200">
                    <strong>Prompt:</strong> {zoomedImage.prompt}
                  </p>
                  <div className="flex gap-2">
                    <Badge className="dark:bg-gray-600 dark:text-gray-200">{zoomedImage.model.toUpperCase()}</Badge>
                    <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                      {zoomedImage.quality}
                    </Badge>
                    <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                      {zoomedImage.size}
                    </Badge>
                    <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                      Seed: {zoomedImage.seed}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showDalleModal} onOpenChange={setShowDalleModal}>
          <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">DALL-E 3 API Key Required</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                To use DALL-E 3, please enter your OpenAI API key. Your key will be stored locally and used only for
                image generation.
              </p>
              <div>
                <Label htmlFor="apikey" className="dark:text-gray-200">
                  OpenAI API Key
                </Label>
                <Input
                  id="apikey"
                  type="password"
                  placeholder="sk-..."
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDalleApiSubmit} className="flex-1">
                  Save & Use DALL-E
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDalleModal(false)
                    setTempApiKey("")
                    setSelectedModel("flux")
                  }}
                  className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showResetSettingsModal} onOpenChange={setShowResetSettingsModal}>
          <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 dark:text-white">
                <RotateCcw className="w-5 h-5" />
                Reset Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will reset all settings to their default values:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                <li>• Model: Flux</li>
                <li>• Size: 3:4 Portrait</li>
                <li>• Quality: HD</li>
                <li>• Batch Count: 1</li>
                <li>• Logo: Disabled</li>
              </ul>
              <div className="flex gap-2">
                <Button onClick={resetToDefaults} className="flex-1">
                  Reset to Defaults
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowResetSettingsModal(false)}
                  className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <ImageToPrompt
          open={showImageToPrompt}
          onOpenChange={setShowImageToPrompt}
          onPromptGenerated={(prompt) => {
            setPrompt(prompt)
            success("Prompt Generated", "Image has been analyzed and prompt created!")
          }}
        />

        <Dialog open={showPromptCreator} onOpenChange={setShowPromptCreator}>
          <DialogContent className="sm:max-w-2xl dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 dark:text-white">
                <Wand2 className="w-5 h-5" />
                AI Prompt Creator
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customPromptInput" className="dark:text-gray-200">
                  Describe your idea
                </Label>
                <Textarea
                  id="customPromptInput"
                  placeholder="e.g., 'a magical forest scene' or 'futuristic city at sunset'"
                  value={customPromptInput}
                  onChange={(e) => setCustomPromptInput(e.target.value)}
                  rows={3}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {isCreatingPrompt && streamingText && (
                <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                  <Label className="text-sm font-medium dark:text-gray-200">Generated Prompt:</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap dark:text-gray-300">{streamingText}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={createCustomPrompt} disabled={isCreatingPrompt || !customPromptInput.trim()}>
                  {isCreatingPrompt ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Create Prompt
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPromptCreator(false)
                    setCustomPromptInput("")
                    setStreamingText("")
                  }}
                  className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <EnhancedPromptCreator
          open={showEnhancedPromptCreator}
          onOpenChange={setShowEnhancedPromptCreator}
          onPromptGenerated={(prompt) => {
            setPrompt(prompt)
            success("Enhanced Prompt Created", "Your detailed prompt has been generated!")
          }}
        />

        <VideoPromptCreator
          open={showVideoPromptCreator}
          onOpenChange={setShowVideoPromptCreator}
          onPromptGenerated={(prompt) => {
            setPrompt(prompt)
            success("Video Prompt Created", "Your video generation prompt has been created!")
          }}
        />

        <VisualFeedback
          type={feedbackType}
          trigger={showVisualFeedback}
          onComplete={() => setShowVisualFeedback(false)}
        />

        <LoadingAnimation isVisible={isGenerating} />

        <ProgressBar progress={generationProgress} isVisible={isGenerating && generationProgress > 0} />

        <FloatingFeedback
          message={floatingMessage}
          type={feedbackType === "error" ? "error" : "success"}
          isVisible={showFloatingFeedback}
          onClose={() => setShowFloatingFeedback(false)}
        />

        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </div>
  )
}