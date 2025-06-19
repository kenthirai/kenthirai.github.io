// File: app/page.tsx

"use client"

import { useState, useEffect, useRef } from "react"
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
  X as CloseIcon,
} from "lucide-react"
import { ToastContainer, useToast } from "@/components/toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { ImageToPrompt } from "@/components/image-to-prompt"
import { VisualFeedback, ProgressBar } from "@/components/visual-feedback"
import { VideoPromptCreator } from "@/components/video-prompt-creator"
import { EnhancedPromptCreator } from "@/components/enhanced-prompt-creator"

// --- INTERFACE DAN DATA TETAP SAMA ---
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
]

// Komponen Lightbox kustom
const Lightbox = ({ image, onClose, onZoomChange, zoomLevel }: { image: GeneratedImage | null, onClose: () => void, onZoomChange: (level: number) => void, zoomLevel: number }) => {
  if (!image) return null;
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full flex items-center justify-center overflow-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.url || "/placeholder.svg"}
          alt={image.prompt}
          className="max-w-none max-h-none transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        />
      </div>
      <Button
        onClick={onClose}
        variant="ghost"
        className="absolute top-4 right-4 h-10 w-10 p-0 rounded-full bg-black/50 text-white hover:bg-white/20 hover:text-white"
        title="Close"
      >
        <CloseIcon className="w-6 h-6" />
      </Button>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-md p-2 rounded-full">
        <Button onClick={() => onZoomChange(Math.max(25, zoomLevel - 25))} variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/20 hover:text-white"><ZoomOut className="w-5 h-5" /></Button>
        <span className="text-sm text-white w-12 text-center">{zoomLevel}%</span>
        <Button onClick={() => onZoomChange(Math.min(400, zoomLevel + 25))} variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/20 hover:text-white"><ZoomIn className="w-5 h-5" /></Button>
        <Button onClick={() => onZoomChange(100)} variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/20 hover:text-white"><RotateCcw className="w-5 h-5" /></Button>
      </div>
    </div>
  );
};


export default function AIImageGenerator() {
  const [showPromptCreator, setShowPromptCreator] = useState(false);
  const [showImageToPrompt, setShowImageToPrompt] = useState(false);
  const [showVideoPromptCreator, setShowVideoPromptCreator] = useState(false);
  const [showEnhancedPromptCreator, setShowEnhancedPromptCreator] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedModel, setSelectedModel] = useState("flux");
  const [selectedSize, setSelectedSize] = useState<ImageSize>(imageSizes[2]);
  const [selectedQuality, setSelectedQuality] = useState<QualityOption>(qualityOptions[1]);
  const [dalleApiKey, setDalleApiKey] = useState("");
  const [showDalleModal, setShowDalleModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [coins, setCoins] = useState(100);
  const [lastResetTime, setLastResetTime] = useState<Date>(new Date());
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 1000000));
  const [batchCount, setBatchCount] = useState(1);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [showPromptManager, setShowPromptManager] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<GeneratedImage | null>(null);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [showResetSettingsModal, setShowResetSettingsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showTextToAudio, setShowTextToAudio] = useState(false);
  const [audioText, setAudioText] = useState("");
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState("");
  const [audioHistory, setAudioHistory] = useState<AudioItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toasts, addToast, removeToast, success, error: showError } = useToast();

  const handleGenerateClick = () => {
    if (!prompt.trim()) {
      showError("No Prompt", "Please enter a prompt to generate an image");
      return;
    }
    const totalCost = 1 * batchCount;
    if (coins < totalCost) {
      showError("Insufficient Coins", `You need ${totalCost} coin(s) but only have ${coins}`);
      return;
    }
    setIsGenerating(true);
  };

  useEffect(() => {
    // Gunakan flag untuk mencegah eksekusi ganda jika isGenerating berubah terlalu cepat
    let isProcessing = false;

    if (isGenerating && !isProcessing) {
      isProcessing = true;
      
      const processGeneration = () => {
        try {
          const totalCost = 1 * batchCount;
          const imagePromises = Array.from({ length: batchCount }).map((_, i) => {
            const currentSeed = seed + i;
            let promptUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
            let queryParams = `?width=${selectedSize.width}&height=${selectedSize.height}&seed=${currentSeed}&nologo=true`;

            if (selectedModel === "dalle3") {
              if (!dalleApiKey) throw new Error("DALL-E 3 requires an API key.");
              queryParams += `&model=dalle3`;
            } else if (selectedModel === 'gptimage') {
              queryParams += `&model=gptimage&transparent=true&enhance=true&safe=true`;
            } else {
              queryParams += `&model=${selectedModel === "turbo" ? "turbo" : "flux"}`;
            }

            if (negativePrompt.trim() !== "") {
              queryParams += `&negative_prompt=${encodeURIComponent(negativePrompt)}`;
            }
            return {
              id: `${Date.now()}-${i}`,
              prompt,
              url: promptUrl + queryParams,
              model: selectedModel,
              size: selectedSize.label,
              quality: selectedQuality.label,
              seed: currentSeed,
              timestamp: new Date(),
              liked: false,
              views: 0,
            };
          });

          setGeneratedImages(prevImages => [...imagePromises, ...prevImages]);
          saveHistory([...imagePromises, ...generatedImages]);
          
          const newCoinAmount = coins - totalCost;
          saveCoins(newCoinAmount);
          success(`${batchCount} Image${batchCount > 1 ? "s" : ""} Generated!`, `Cost: ${totalCost} coins. Remaining: ${newCoinAmount} coins`);
          generateRandomSeed();

        } catch (error) {
          console.error("Error generating image:", error);
          showError("Generation Failed", error instanceof Error ? error.message : "Unknown error occurred");
        } finally {
          setIsGenerating(false);
        }
      };
      
      // Memberi sedikit jeda sebelum menjalankan proses, untuk memastikan UI update
      setTimeout(processGeneration, 50);
    }
  }, [isGenerating]);


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
        parsed.map((p: any) => ({
          ...p,
          timestamp: new Date(p.timestamp),
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
        const errorData = await response.json().catch(() => ({ message: "An unknown error occurred." }))
        throw new Error(errorData.message || `Server error: ${response.status}`)
      }

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

  const generateAudio = async () => {
    if (!audioText.trim()) {
        showError("No Text", "Please enter text to convert to audio.");
        return;
    }

    if (audioText.length > 1000) {
        showError("Text Too Long", "Please limit text to 1000 characters.");
        return;
    }

    setIsGeneratingAudio(true);
    setGeneratedAudioUrl(""); 
    stopAudio(); 

    try {
        const response = await fetch('/api/generate-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: audioText }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Audio generation failed: ${errorText || response.statusText}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        const newAudio: AudioItem = {
            id: Date.now().toString(),
            text: audioText,
            url: audioUrl,
            timestamp: new Date(),
        };

        const updatedAudioHistory = [newAudio, ...audioHistory.slice(0, 4)];
        setAudioHistory(updatedAudioHistory);
        setGeneratedAudioUrl(audioUrl); 
        saveAudioHistory(updatedAudioHistory);

        success("Audio Generated", "Text has been converted successfully!");
        
        if(audioRef.current) {
          audioRef.current.src = audioUrl;
        }

    } catch (err: any) {
        console.error("Audio generation error:", err);
        showError("Generation Failed", err.message || "An unknown error occurred.");
    } finally {
        setIsGeneratingAudio(false);
    }
  };


  const playAudio = (url: string) => {
    if (currentAudio && currentAudio.src === url) {
      if (isPlaying) {
        currentAudio.pause();
        setIsPlaying(false);
      } else {
        currentAudio.play();
        setIsPlaying(true);
      }
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
    }
    
    const audio = new Audio(url);
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    };
    audio.onerror = (e) => {
      console.error("Audio playback error:", e);
      showError("Playback Error", "Failed to play audio.");
      setIsPlaying(false);
      setCurrentAudio(null);
    };

    audio.play().then(() => {
        setCurrentAudio(audio);
        setIsPlaying(true);
    }).catch(error => {
        console.error("Audio play error:", error);
        showError("Playback Error", "Failed to start audio playback.");
    });
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0; 
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  };

  const downloadAudio = (url: string, text: string) => {
    if (!url) {
        showError("Download Error", "No audio URL available.");
        return;
    }
    try {
        const link = document.createElement("a");
        link.href = url;
        const safeText = text.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
        link.download = `${safeText}_${new Date().getTime()}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        success("Download Complete", "Audio has been saved.");
    } catch (err) {
        console.error("Download error:", err);
        showError("Download Failed", "Could not initiate download.");
    }
  };

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

  const loadSettings = () => {
    const savedSettings = localStorage.getItem("kenthir-ai-settings")
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSelectedModel(parsed.model || "flux")
      setSelectedSize(parsed.size || imageSizes[2])
      setSelectedQuality(parsed.quality || qualityOptions[1])
      setBatchCount(parsed.batchCount || 1)
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

    localStorage.setItem("kenthir-ai-settings", JSON.stringify(defaultSettings))
    setShowResetSettingsModal(false)
    success("Settings Reset", "All settings have been reset to default values")
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
  
  const closeZoomModal = () => {
      setShowZoomModal(false);
      setZoomedImage(null);
  }

  const downloadImage = async (url: string, prompt: string) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok.");
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        success("Download started", "Image is being downloaded.");
    } catch (e) {
        console.error("Download failed", e);
        showError("Download Failed", "Could not download the image.");
        window.open(url, '_blank');
    }
  };

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
    setGeneratedAudioUrl("")
    stopAudio()
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
                      <Button onClick={() => setShowImageToPrompt(true)} size="sm" variant="outline"><ImageIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />Image to Prompt</Button>
                      <Button onClick={() => setShowEnhancedPromptCreator(true)} size="sm" variant="outline"><Wand2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />Enhanced Create</Button>
                      <Button onClick={() => setShowVideoPromptCreator(true)} size="sm" variant="outline"><Video className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />Video Prompt</Button>
                      <Button onClick={() => setShowTextToAudio(true)} size="sm" variant="outline"><Volume2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />Text to Audio</Button>
                      <Button onClick={() => setShowPromptManager(true)} size="sm" variant="outline"><Save className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />Manage</Button>
                      <Button onClick={enhancePrompt} size="sm" variant="outline" disabled={isEnhancing}>{isEnhancing ? (<Loader2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1 animate-spin" />) : (<Sparkles className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />)}Enhance</Button>
                      <Button onClick={clearPrompt} size="sm" variant="outline"><Trash2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />Clear</Button>
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
                        {isTranslating ? (<Loader2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1 animate-spin" />) : (<Languages className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />)}
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
                      <Button key={index} onClick={() => setPrompt(suggestion)} size="sm" variant="ghost" className="text-xs h-6 sm:h-7 px-2 dark:text-gray-300 dark:hover:bg-gray-700">
                        {suggestion.slice(0, 20)}...
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm dark:text-gray-200">AI Model</Label>
                    <Select value={selectedModel} onValueChange={handleModelChange}>
                      <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="flux" className="dark:text-white dark:focus:bg-gray-600">Flux</SelectItem>
                        <SelectItem value="turbo" className="dark:text-white dark:focus:bg-gray-600">Turbo</SelectItem>
                        <SelectItem value="dalle3" className="dark:text-white dark:focus:bg-gray-600">DALL-E 3</SelectItem>
                        <SelectItem value="gptimage" className="dark:text-white dark:focus:bg-gray-600">GPT-Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm dark:text-gray-200">Size</Label>
                    <Select value={selectedSize.label} onValueChange={(value) => { const size = imageSizes.find((s) => s.label === value); if (size) setSelectedSize(size)}}>
                      <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        {imageSizes.map((size) => (
                          <SelectItem key={size.label} value={size.label} className="dark:text-white dark:focus:bg-gray-600">
                            <span className="hidden sm:inline">{size.label}</span>
                            <span className="sm:hidden">{size.label.split(" ")[0]}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm dark:text-gray-200">Quality</Label>
                    <Select value={selectedQuality.value} onValueChange={(value) => { const quality = qualityOptions.find((q) => q.value === value); if (quality) setSelectedQuality(quality)}}>
                      <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        {qualityOptions.map((quality) => (
                          <SelectItem key={quality.value} value={quality.value} className="dark:text-white dark:focus:bg-gray-600">{quality.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm dark:text-gray-200">Batch</Label>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button onClick={() => setBatchCount(Math.max(1, batchCount - 1))} size="sm" variant="outline" disabled={batchCount <= 1} className="h-6 w-6 sm:h-8 sm:w-8 p-0 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"><Minus className="w-3 h-3" /></Button>
                      <span className="w-6 sm:w-8 text-center text-xs sm:text-sm dark:text-white">{batchCount}</span>
                      <Button onClick={() => setBatchCount(Math.min(4, batchCount + 1))} size="sm" variant="outline" disabled={batchCount >= 4} className="h-6 w-6 sm:h-8 sm:w-8 p-0 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"><Plus className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs sm:text-sm dark:text-gray-200">Seed: {seed}</Label>
                    <Button onClick={generateRandomSeed} size="sm" variant="outline" className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"><Shuffle className="w-3 sm:w-4 h-3 sm:h-4 mr-1" /><span className="hidden sm:inline">Random</span></Button>
                  </div>
                  <Slider value={[seed]} onValueChange={([value]) => setSeed(value)} min={0} max={1000000} step={1} className="dark:[&>span]:bg-gray-600" />
                </div>

                <div className="space-y-2">
                  <Button onClick={handleGenerateClick} disabled={isGenerating || !prompt.trim() || coins < batchCount} className="w-full" size="lg">
                    {isGenerating ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating {batchCount > 1 ? `${batchCount} images` : 'image'}...</>) : (<><Zap className="w-4 h-4 mr-2" />Generate {batchCount > 1 ? `${batchCount} Images` : 'Image'}</>)}
                  </Button>
                  {coins < batchCount && !isGenerating && (<p className="text-xs sm:text-sm text-red-600 dark:text-red-400 text-center">Insufficient coins. Need {batchCount} but have {coins}</p>)}
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 sm:mt-6">
              <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold dark:text-white">Generated Images</h2>
                  {generatedImages.length > 0 && !isGenerating && (
                    <Button onClick={clearHistory} variant="outline" size="sm" className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"><Trash2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1" /><span className="hidden sm:inline">Clear All</span><span className="sm:hidden">Clear</span></Button>
                  )}
              </div>
              
              {isGenerating ? (
                <div className="w-full text-center py-10 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-center items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Generating images, please wait...</p>
                  </div>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {generatedImages.map((image) => (
                    <div key={image.id} className="group relative aspect-square" onClick={() => openZoomModal(image)}>
                      <img src={image.url || "/placeholder.svg"} alt={image.prompt} className="aspect-square w-full h-full object-cover rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer" loading="lazy" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-opacity duration-300 flex flex-col items-center justify-end opacity-0 group-hover:opacity-100 rounded-lg p-2">
                         <div className="flex items-center justify-center gap-2 bg-black/40 backdrop-blur-sm p-1.5 rounded-full">
                            <Button onClick={(e) => { e.stopPropagation(); toggleLike(image.id); }} size="sm" variant="ghost" className="h-7 w-7 p-0 text-white hover:bg-white/20 hover:text-white" title="Like"><Heart className={`w-4 h-4 ${image.liked ? "fill-red-500 text-red-500" : ""}`} /></Button>
                            <Button onClick={(e) => { e.stopPropagation(); downloadImage(image.url, image.prompt); }} size="sm" variant="ghost" className="h-7 w-7 p-0 text-white hover:bg-white/20 hover:text-white" title="Download"><Download className="w-4 h-4" /></Button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full text-center py-10 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No images generated yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your generated images will appear here.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader><CardTitle className="text-base sm:text-lg dark:text-white">Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <Button onClick={savePrompt} variant="outline" className="w-full justify-start text-xs sm:text-sm dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"><Save className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />Save Prompt</Button>
                <Button onClick={() => setShowPromptManager(true)} variant="outline" className="w-full justify-start text-xs sm:text-sm dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"><History className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />Manage Prompts</Button>
                <Button onClick={generateRandomSeed} variant="outline" className="w-full justify-start text-xs sm:text-sm dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"><Shuffle className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />Random Seed</Button>
                <Button onClick={() => setShowResetSettingsModal(true)} variant="outline" className="w-full justify-start text-xs sm:text-sm dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"><RotateCcw className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />Reset Settings</Button>
                <Button onClick={() => setShowTextToAudio(true)} variant="outline" className="w-full justify-start text-xs sm:text-sm dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"><Volume2 className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />Text to Audio</Button>
              </CardContent>
            </Card>
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader><CardTitle className="text-base sm:text-lg dark:text-white">Statistics</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm"><span className="text-gray-600 dark:text-gray-400">Total Images:</span><span className="font-semibold dark:text-white">{generatedImages.length}</span></div>
                <div className="flex justify-between text-xs sm:text-sm"><span className="text-gray-600 dark:text-gray-400">Liked Images:</span><span className="font-semibold dark:text-white">{generatedImages.filter((img) => img.liked).length}</span></div>
                <div className="flex justify-between text-xs sm:text-sm"><span className="text-gray-600 dark:text-gray-400">Total Views:</span><span className="font-semibold dark:text-white">{generatedImages.reduce((sum, img) => sum + img.views, 0)}</span></div>
                <div className="flex justify-between text-xs sm:text-sm"><span className="text-gray-600 dark:text-gray-400">Saved Prompts:</span><span className="font-semibold dark:text-white">{savedPrompts.length}</span></div>
                <div className="flex justify-between text-xs sm:text-sm"><span className="text-gray-600 dark:text-gray-400">Audio Generated:</span><span className="font-semibold dark:text-white">{audioHistory.length}</span></div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {showZoomModal && <Lightbox image={zoomedImage} onClose={closeZoomModal} onZoomChange={setZoomLevel} zoomLevel={zoomLevel} />}
        
        {/* SEMUA DIALOG FUNGSIONALITAS YANG HILANG DIKEMBALIKAN DI SINI */}
        <Dialog open={showDalleModal} onOpenChange={setShowDalleModal}>
          <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader><DialogTitle className="dark:text-white">DALL-E 3 API Key Required</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">To use DALL-E 3, please enter your OpenAI API key.</p>
              <div>
                <Label htmlFor="apikey" className="dark:text-gray-200">OpenAI API Key</Label>
                <Input id="apikey" type="password" placeholder="sk-..." value={tempApiKey} onChange={(e) => setTempApiKey(e.target.value)} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDalleApiSubmit} className="flex-1">Save & Use DALL-E</Button>
                <Button variant="outline" onClick={() => { setShowDalleModal(false); setTempApiKey(""); setSelectedModel("flux");}} className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showResetSettingsModal} onOpenChange={setShowResetSettingsModal}>
          <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader><DialogTitle className="flex items-center gap-2 dark:text-white"><RotateCcw className="w-5 h-5" />Reset Settings</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">This will reset all settings to their default values:</p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                <li>• Model: Flux</li><li>• Size: 3:4 Portrait</li><li>• Quality: HD</li><li>• Batch Count: 1</li>
              </ul>
              <div className="flex gap-2">
                <Button onClick={resetToDefaults} className="flex-1">Reset to Defaults</Button>
                <Button variant="outline" onClick={() => setShowResetSettingsModal(false)} className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showTextToAudio} onOpenChange={(isOpen) => { setShowTextToAudio(isOpen); if (!isOpen) stopAudio(); }}>
          <DialogContent className="sm:max-w-2xl dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader><DialogTitle className="flex items-center gap-2 dark:text-white"><Volume2 className="w-5 h-5" />Text to Audio Generator</DialogTitle></DialogHeader>
             <div className="space-y-4">
              <div>
                <Label htmlFor="audioText" className="dark:text-gray-200">Enter text to convert to audio (max 1000 characters)</Label>
                <Textarea id="audioText" placeholder="Enter the text you want to convert to audio..." value={audioText} onChange={(e) => setAudioText(e.target.value)} rows={4} maxLength={1000} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{audioText.length}/1000 characters</div>
              </div>
              {generatedAudioUrl && (
                <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                  <Label className="text-sm font-medium dark:text-gray-200">Generated Audio:</Label>
                  <div className="flex items-center gap-2 mt-2">
                     <audio ref={audioRef} controls className="w-full"><source src={generatedAudioUrl} type="audio/mpeg" />Your browser does not support the audio element.</audio>
                    <Button onClick={() => downloadAudio(generatedAudioUrl, audioText)} size="sm" variant="outline" className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"><Download className="w-4 h-4" /></Button>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={generateAudio} disabled={isGeneratingAudio || !audioText.trim()} className="flex-1">{isGeneratingAudio ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Audio...</>) : (<><Volume2 className="w-4 h-4 mr-2" />Generate Audio</>)}</Button>
                <Button variant="outline" onClick={() => { setShowTextToAudio(false); setAudioText(""); setGeneratedAudioUrl(""); stopAudio();}} className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
          <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader><DialogTitle className="flex items-center gap-2 dark:text-white"><Lock className="w-5 h-5" />Manual Coin Reset</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Enter the admin password to manually reset your coins to 100.</p>
              <div>
                <Label htmlFor="resetPassword" className="dark:text-gray-200">Admin Password</Label>
                <div className="relative">
                  <Input id="resetPassword" type={showPassword ? "text" : "password"} placeholder="Enter admin password..." value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10" disabled={isResetting}/>
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent dark:text-gray-400 dark:hover:text-white" onClick={() => setShowPassword(!showPassword)} disabled={isResetting}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleManualReset} className="flex-1" disabled={isResetting || !resetPassword.trim()}>{isResetting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Resetting...</>) : ("Reset Coins")}</Button>
                <Button variant="outline" onClick={() => { setShowResetModal(false); setResetPassword(""); setShowPassword(false);}} className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700" disabled={isResetting}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <ImageToPrompt open={showImageToPrompt} onOpenChange={setShowImageToPrompt} onPromptGenerated={(prompt) => { setPrompt(prompt); success("Prompt Generated", "Image has been analyzed and prompt created!"); }} />
        <VideoPromptCreator open={showVideoPromptCreator} onOpenChange={setShowVideoPromptCreator} onPromptGenerated={(prompt) => { setPrompt(prompt); success("Video Prompt Created", "Your video generation prompt has been created!"); }} />
        <EnhancedPromptCreator open={showEnhancedPromptCreator} onOpenChange={setShowEnhancedPromptCreator} onPromptGenerated={(prompt) => { setPrompt(prompt); success("Enhanced Prompt Created", "Your detailed prompt has been generated!"); }} />
        
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </div>
  )
}
