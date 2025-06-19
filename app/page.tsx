// File: app/page.tsx

"use client"

// PERBAIKAN: Menambahkan useRef dan useCallback untuk hooks yang digunakan
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area" // Pastikan scroll-area ada

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
  BookText
} from "lucide-react"
import { ToastContainer, useToast } from "@/components/toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { ImageToPrompt } from "@/components/image-to-prompt"
import { VideoPromptCreator } from "@/components/video-prompt-creator"
import { EnhancedPromptCreator } from "@/components/enhanced-prompt-creator"

// --- INTERFACE DAN DATA ---
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
]
const qualityOptions: QualityOption[] = [
  { label: "Standard", value: "standard", cost: 1 },
  { label: "HD", value: "hd", cost: 2 },
]
const promptSuggestions = [
  "A majestic dragon flying over a mystical forest",
  "Cyberpunk cityscape with neon lights at night",
  "Beautiful sunset over mountain landscape",
  "Cute robot playing with colorful balloons",
]

// --- KOMPONEN BANTUAN ---
const Lightbox = ({ image, onClose, onZoomChange, zoomLevel }: { image: GeneratedImage | null, onClose: () => void, onZoomChange: (level: number) => void, zoomLevel: number }) => {
  if (!image) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center overflow-auto p-4" onClick={(e) => e.stopPropagation()}>
        <img src={image.url} alt={image.prompt} className="max-w-none max-h-none transition-transform duration-300" style={{ transform: `scale(${zoomLevel / 100})` }} />
      </div>
      <Button onClick={onClose} variant="ghost" className="absolute top-4 right-4 h-10 w-10 p-0 rounded-full bg-black/50 text-white hover:bg-white/20 hover:text-white" title="Close"><CloseIcon className="w-6 h-6" /></Button>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-md p-2 rounded-full">
        <Button onClick={() => onZoomChange(Math.max(25, zoomLevel - 25))} variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/20 hover:text-white"><ZoomOut className="w-5 h-5" /></Button>
        <span className="text-sm text-white w-12 text-center">{zoomLevel}%</span>
        <Button onClick={() => onZoomChange(Math.min(400, zoomLevel + 25))} variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/20 hover:text-white"><ZoomIn className="w-5 h-5" /></Button>
        <Button onClick={() => onZoomChange(100)} variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/20 hover:text-white"><RotateCcw className="w-5 h-5" /></Button>
      </div>
    </div>
  );
};

const GeneratingOverlay = () => (
  <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-10 rounded-lg">
    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Generating Your Masterpiece...</h3>
    <p className="text-gray-600 dark:text-gray-300">Please wait, the AI is hard at work.</p>
  </div>
);

// --- KOMPONEN UTAMA ---
export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [selectedModel, setSelectedModel] = useState("flux");
  const [selectedSize, setSelectedSize] = useState<ImageSize>(imageSizes[2]);
  const [selectedQuality, setSelectedQuality] = useState<QualityOption>(qualityOptions[1]);
  const [dalleApiKey, setDalleApiKey] = useState("");
  const [coins, setCoins] = useState(100);
  const [lastResetTime, setLastResetTime] = useState<Date>(new Date());
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 1000000));
  const [batchCount, setBatchCount] = useState(1);
  const [zoomedImage, setZoomedImage] = useState<GeneratedImage | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [streamingText, setStreamingText] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [audioText, setAudioText] = useState("");
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState("");
  const [audioHistory, setAudioHistory] = useState<AudioItem[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");

  const [status, setStatus] = useState({
    isGenerating: false,
    isEnhancing: false,
    isTranslating: false,
    isResetting: false,
    isGeneratingAudio: false,
  });

  const [dialogs, setDialogs] = useState({
    dalleModal: false,
    resetModal: false,
    resetSettingsModal: false,
    textToAudio: false,
    promptManager: false,
    imageToPrompt: false,
    videoPromptCreator: false,
    enhancedPromptCreator: false,
    zoomModal: false,
  });

  const { success, error: showError } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- EFEK & PEMUATAN DATA ---
  useEffect(() => {
    // Memuat semua data dari localStorage saat aplikasi dimulai
    const loadData = () => {
      const savedHistory = localStorage.getItem("ai-image-history");
      if (savedHistory) setGeneratedImages(JSON.parse(savedHistory).map((img: any) => ({ ...img, timestamp: new Date(img.timestamp), liked: img.liked || false, views: img.views || 0 })));

      const savedPromptsList = localStorage.getItem("saved-prompts");
      if (savedPromptsList) setSavedPrompts(JSON.parse(savedPromptsList).map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) })));

      const savedCoins = localStorage.getItem("user-coins");
      if (savedCoins) setCoins(Number.parseInt(savedCoins));

      const savedResetTime = localStorage.getItem("last-reset-time");
      if (savedResetTime) setLastResetTime(new Date(savedResetTime));
      
      const savedAudioHistory = localStorage.getItem("audio-history");
      if (savedAudioHistory) setAudioHistory(JSON.parse(savedAudioHistory).map((audio: any) => ({ ...audio, timestamp: new Date(audio.timestamp) })));
      
      loadSettings();
    };
    loadData();
  }, []);

  // Menyimpan prompt saat ini secara berkala
  useEffect(() => {
    const handler = setTimeout(() => {
      if (prompt) localStorage.setItem("kenthir-current-prompt", prompt);
    }, 1000);
    return () => clearTimeout(handler);
  }, [prompt]);

  // --- FUNGSI UTAMA ---
  const handleGenerateClick = useCallback(() => {
    if (!prompt.trim()) {
      showError("No Prompt", "Please enter a prompt to generate an image");
      return;
    }
    const totalCost = 1 * batchCount;
    if (coins < totalCost) {
      showError("Insufficient Coins", `You need ${totalCost} coin(s) but only have ${coins}`);
      return;
    }
    setStatus(s => ({ ...s, isGenerating: true }));
  }, [prompt, batchCount, coins, showError]);
  
  // Efek ini akan berjalan saat isGenerating menjadi true
  useEffect(() => {
    if (status.isGenerating) {
      const totalCost = 1 * batchCount;
      const newImages = Array.from({ length: batchCount }).map((_, i) => {
        const currentSeed = seed + i;
        let promptUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
        let queryParams = `?width=${selectedSize.width}&height=${selectedSize.height}&seed=${currentSeed}&nologo=true`;
        if (selectedModel === "dalle3" && dalleApiKey) queryParams += `&model=dalle3`;
        else queryParams += `&model=${selectedModel}`;
        if (negativePrompt.trim()) queryParams += `&negative_prompt=${encodeURIComponent(negativePrompt)}`;
        
        return {
          id: `${Date.now()}-${i}`, prompt, url: promptUrl + queryParams, model: selectedModel,
          size: selectedSize.label, quality: selectedQuality.label, seed: currentSeed,
          timestamp: new Date(), liked: false, views: 0,
        };
      });

      // PERBAIKAN: Ganti gambar yang ada dengan yang baru, agar loading overlay bekerja dengan baik
      setGeneratedImages(newImages);

      // Kita akan set isGenerating ke false setelah semua gambar selesai dimuat
      // Ini akan ditangani oleh komponen ImageGrid di bawah

    }
  }, [status.isGenerating]);

  // Callback ini dipanggil oleh ImageGrid setelah semua gambar dimuat
  const onAllImagesLoaded = useCallback(() => {
    if (status.isGenerating) {
        const totalCost = 1 * batchCount;
        const newCoinAmount = coins - totalCost;
        setCoins(newCoinAmount);
        localStorage.setItem("user-coins", newCoinAmount.toString());

        saveHistory([...generatedImages, ...savedPrompts]); // Simpan ke history setelah dimuat
        success(`${batchCount} Image(s) Generated!`, `Cost: ${totalCost} coins.`);
        generateRandomSeed();
        setStatus(s => ({ ...s, isGenerating: false }));
    }
  }, [status.isGenerating, generatedImages, batchCount, coins, success, savedPrompts]);


  // --- FUNGSI HELPER LAINNYA ---
  const saveHistory = (images: GeneratedImage[]) => localStorage.setItem("ai-image-history", JSON.stringify(images));
  const clearHistory = () => { setGeneratedImages([]); localStorage.removeItem("ai-image-history"); success("History Cleared", "All generated images have been removed"); };
  const generateRandomSeed = () => setSeed(Math.floor(Math.random() * 1000000));
  const loadSettings = () => { /* ... logika memuat pengaturan ... */ };
  
  // --- MANAJEMEN PROMPT ---
  const savePrompt = () => {
    if (!prompt.trim()) { showError("No Prompt", "Please enter a prompt to save"); return; }
    const newPrompt: SavedPrompt = { id: Date.now().toString(), text: prompt, category: "Custom", timestamp: new Date(), used: 0 };
    const updatedPrompts = [newPrompt, ...savedPrompts];
    setSavedPrompts(updatedPrompts);
    localStorage.setItem("saved-prompts", JSON.stringify(updatedPrompts));
    success("Prompt Saved", "Your prompt has been saved for future use");
  };

  const loadPrompt = (promptText: string) => {
    setPrompt(promptText);
    setDialogs(d => ({ ...d, promptManager: false }));
    const updatedPrompts = savedPrompts.map((p) => (p.text === promptText ? { ...p, used: p.used + 1 } : p));
    setSavedPrompts(updatedPrompts);
    localStorage.setItem("saved-prompts", JSON.stringify(updatedPrompts));
  };
  
  const deletePrompt = (id: string) => {
    const updatedPrompts = savedPrompts.filter((p) => p.id !== id);
    setSavedPrompts(updatedPrompts);
    localStorage.setItem("saved-prompts", JSON.stringify(updatedPrompts));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors">
      <div className="max-w-7xl mx-auto">
        <header> {/* ... Header tidak berubah ... */} </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>{/* ... Card Header tidak berubah ... */}</CardHeader>
              <CardContent className="space-y-6">
                {/* ... Kontrol prompt dan pengaturan tidak berubah ... */}
                 <Button onClick={handleGenerateClick} disabled={status.isGenerating || !prompt.trim() || coins < batchCount} className="w-full" size="lg">
                    {status.isGenerating ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>) : (<><Zap className="w-4 h-4 mr-2" />Generate</>)}
                  </Button>
              </CardContent>
            </Card>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold dark:text-white">Generated Images</h2>
                  {generatedImages.length > 0 && !status.isGenerating && (
                    <Button onClick={clearHistory} variant="outline" size="sm"><Trash2 className="w-4 h-4 mr-1" />Clear All</Button>
                  )}
              </div>
              
              <div className="relative min-h-[400px] bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4">
                {status.isGenerating && <GeneratingOverlay />}
                
                {!status.isGenerating && generatedImages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                    <ImageIcon className="w-16 h-16 mb-4" />
                    <h3 className="text-xl font-semibold">Your creations will appear here</h3>
                  </div>
                )}
                
                {generatedImages.length > 0 && (
                    <ImageGrid images={generatedImages} onAllImagesLoaded={onAllImagesLoaded} />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">{/* ... Kolom kanan tidak berubah ... */}</div>
        </div>
        
        {/* --- DIALOGS / MODALS --- */}
        <PromptManager 
          open={dialogs.promptManager} 
          onOpenChange={(open) => setDialogs(d => ({ ...d, promptManager: open }))}
          savedPrompts={savedPrompts}
          onSavePrompt={savePrompt}
          onDeletePrompt={deletePrompt}
          onUsePrompt={loadPrompt}
        />
        {/* ... Sisa dialogs tidak berubah ... */}

      </div>
    </div>
  )
}

// Pisahkan komponen ImageGrid untuk manajemen state yang lebih baik
const ImageGrid = ({ images, onAllImagesLoaded }: { images: GeneratedImage[]; onAllImagesLoaded: () => void }) => {
    const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

    useEffect(() => {
        const promises = imageRefs.current
            .filter(img => img && !img.complete)
            .map(img => new Promise(resolve => {
                if (img) {
                    img.onload = resolve;
                    img.onerror = resolve; // Tetap resolve meski error
                }
            }));

        if (promises.length > 0) {
            Promise.all(promises).then(() => {
                onAllImagesLoaded();
            });
        } else {
            // Jika semua gambar sudah di-cache/complete
            onAllImagesLoaded();
        }
    }, [images, onAllImagesLoaded]);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
                <div key={image.id} className="group relative aspect-square">
                    <img
                        ref={el => imageRefs.current[index] = el}
                        src={image.url}
                        alt={image.prompt}
                        className="w-full h-full object-cover rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                        loading="lazy"
                    />
                    {/* ... overlay ... */}
                </div>
            ))}
        </div>
    );
};