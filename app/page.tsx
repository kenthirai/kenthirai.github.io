// File: app/page.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { ImageToPrompt } from "@/components/image-to-prompt"
// Impor PromptManager yang baru
import { PromptManager, type SavedPrompt } from "@/components/prompt-manager"

import {
  Loader2,
  Settings,
  Coins,
  Zap,
  Trash2,
  ImageIcon,
  Shuffle,
  Languages,
  BookText,
  X as CloseIcon
} from "lucide-react"

// --- INTERFACE DAN DATA --- (Tidak ada perubahan di sini)
interface GeneratedImage {
  id: string
  prompt: string
  url: string
  model: string
  size: string
  quality: string
  seed: number
  timestamp: Date
}
interface ImageSize {
  label: string
  width: number
  height: number
}
const imageSizes: ImageSize[] = [
  { label: "1:1 Square", width: 1024, height: 1024 },
  { label: "16:9 Wide", width: 1024, height: 576 },
  { label: "9:16 Tall", width: 576, height: 1024 },
]


// --- Komponen Loading Indikator ---
const GeneratingOverlay = () => (
  <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-10 rounded-lg">
    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Generating Your Masterpiece...</h3>
    <p className="text-gray-600 dark:text-gray-300">Please wait, this may take a moment.</p>
  </div>
);


export default function AIImageGenerator() {
  // --- STATE MANAGEMENT ---
  const [prompt, setPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);

  const [settings, setSettings] = useState({
    model: "flux",
    size: imageSizes[0],
    seed: Math.floor(Math.random() * 1000000),
    batchCount: 1,
  });

  const [status, setStatus] = useState({
    isGenerating: false,
    isTranslating: false,
  });

  const [dialogs, setDialogs] = useState({
    promptManager: false,
    imageToPrompt: false,
  });
  
  const [coins, setCoins] = useState(100);
  const { success, error: showError } = useToast();

  // --- EFEK & PEMUATAN DATA ---

  // Memuat data dari localStorage saat komponen pertama kali dimuat
  useEffect(() => {
    const savedHistory = localStorage.getItem("ai-image-history");
    if (savedHistory) setGeneratedImages(JSON.parse(savedHistory).map((img: any) => ({ ...img, timestamp: new Date(img.timestamp) })));
    
    const savedUserPrompts = localStorage.getItem("ai-saved-prompts");
    if (savedUserPrompts) setSavedPrompts(JSON.parse(savedUserPrompts).map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) })));

    const savedCoins = localStorage.getItem("user-coins");
    if (savedCoins) setCoins(parseInt(savedCoins, 10));

    // Anda juga bisa memuat pengaturan terakhir pengguna di sini jika diinginkan
  }, []);

  // --- FUNGSI UTAMA ---

  const handleGenerateClick = useCallback(() => {
    if (!prompt.trim()) {
      showError("Prompt is empty", "Please enter a prompt to generate an image.");
      return;
    }
    const totalCost = settings.batchCount;
    if (coins < totalCost) {
      showError("Not enough coins", `You need ${totalCost} coins, but you only have ${coins}.`);
      return;
    }
    
    setStatus(s => ({ ...s, isGenerating: true }));

    // Tunda sedikit agar UI sempat update sebelum proses berat dimulai
    setTimeout(() => {
        try {
            const imagePromises = Array.from({ length: settings.batchCount }).map((_, i) => {
                const currentSeed = settings.seed + i;
                const promptUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${settings.size.width}&height=${settings.size.height}&seed=${currentSeed}&nologo=true&model=${settings.model}`;
                
                return {
                    id: `${Date.now()}-${i}`,
                    prompt,
                    url: promptUrl,
                    model: settings.model,
                    size: settings.size.label,
                    quality: 'Standard', // Disederhanakan untuk contoh ini
                    seed: currentSeed,
                    timestamp: new Date(),
                };
            });

            // Ganti gambar yang ada dengan yang baru, bukan menambahkan
            setGeneratedImages(imagePromises); 
            saveHistory(imagePromises); // Simpan riwayat baru

            const newCoinAmount = coins - totalCost;
            setCoins(newCoinAmount);
            localStorage.setItem("user-coins", newCoinAmount.toString());
            
            success(`${settings.batchCount} Image(s) Queued!`, `Cost: ${totalCost} coin(s).`);
            generateRandomSeed();

        } catch (err) {
            console.error("Image generation failed:", err);
            showError("Generation Failed", err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            // Kita akan set isGenerating ke false setelah gambar selesai dimuat, bukan di sini
            // Ini akan ditangani oleh event `onLoad` pada gambar
        }
    }, 100); // Penundaan 100ms
  }, [prompt, settings, coins, showError, success]);

  // Fungsi untuk menangani saat semua gambar selesai dimuat
  const handleAllImagesLoaded = () => {
      setStatus(s => ({ ...s, isGenerating: false }));
  };

  const handleTranslate = async () => {
    // ... (Fungsi terjemahan tidak berubah)
  }

  // --- FUNGSI HELPER & MANAJEMEN DATA ---

  const saveHistory = (images: GeneratedImage[]) => localStorage.setItem("ai-image-history", JSON.stringify(images));
  const clearHistory = () => {
    setGeneratedImages([]);
    localStorage.removeItem("ai-image-history");
    success("History Cleared", "All generated images have been removed.");
  };

  const generateRandomSeed = () => setSettings(s => ({ ...s, seed: Math.floor(Math.random() * 1000000) }));

  // --- FUNGSI MANAJEMEN PROMPT ---
  
  const savePrompt = (text: string, category: string) => {
    const newPrompt: SavedPrompt = {
      id: `prompt-${Date.now()}`,
      text,
      category,
      timestamp: new Date(),
      used: 0,
    };
    const updatedPrompts = [...savedPrompts, newPrompt];
    setSavedPrompts(updatedPrompts);
    localStorage.setItem("ai-saved-prompts", JSON.stringify(updatedPrompts));
    success("Prompt Saved!", `Successfully saved to the "${category}" category.`);
  };

  const deletePrompt = (id: string) => {
    const updatedPrompts = savedPrompts.filter(p => p.id !== id);
    setSavedPrompts(updatedPrompts);
    localStorage.setItem("ai-saved-prompts", JSON.stringify(updatedPrompts));
    showError("Prompt Deleted", "The selected prompt has been removed."); // Menggunakan showError untuk warna merah
  };
  
  const usePrompt = (text: string) => {
    setPrompt(text);
    setDialogs(d => ({ ...d, promptManager: false }));
    success("Prompt Loaded!", "The selected prompt has been loaded into the input area.");
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
            <div className="flex justify-between items-center">
                <div className="w-10"></div> {/* Spacer */}
                <div className="flex-1">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white">AI Image Generator</h1>
                    <p className="text-gray-600 dark:text-gray-300">Create with Kenthir AI</p>
                </div>
                <ThemeToggle />
            </div>
            <div className="mt-4 flex justify-center items-center gap-4">
                <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/50 px-4 py-2 rounded-full">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-yellow-800 dark:text-yellow-200">{coins} Coins</span>
                </div>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Kontrol & Pengaturan */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Settings className="w-5 h-5" />
                  Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Your Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="A hyperrealistic photo of a cat programming..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                      <Button onClick={() => setDialogs(d => ({ ...d, imageToPrompt: true }))} size="sm" variant="outline">
                          <ImageIcon className="w-4 h-4 mr-2" /> Image to Prompt
                      </Button>
                      <Button onClick={() => setDialogs(d => ({ ...d, promptManager: true }))} size="sm" variant="outline">
                          <BookText className="w-4 h-4 mr-2" /> Manage Prompts
                      </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>AI Model</Label>
                        <Select value={settings.model} onValueChange={(value) => setSettings(s => ({ ...s, model: value }))}>
                            <SelectTrigger className="dark:bg-gray-700"><SelectValue /></SelectTrigger>
                            <SelectContent className="dark:bg-gray-700">
                                <SelectItem value="flux">Flux</SelectItem>
                                <SelectItem value="turbo">Turbo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Aspect Ratio</Label>
                        <Select value={settings.size.label} onValueChange={(label) => setSettings(s => ({ ...s, size: imageSizes.find(size => size.label === label)! }))}>
                            <SelectTrigger className="dark:bg-gray-700"><SelectValue /></SelectTrigger>
                            <SelectContent className="dark:bg-gray-700">
                                {imageSizes.map(size => <SelectItem key={size.label} value={size.label}>{size.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Seed: {settings.seed}</Label>
                        <Button onClick={generateRandomSeed} size="sm" variant="outline"><Shuffle className="w-4 h-4 mr-1" />Random</Button>
                    </div>
                    <Slider value={[settings.seed]} onValueChange={([value]) => setSettings(s => ({ ...s, seed: value }))} min={0} max={1000000} step={1} />
                </div>

                <Button onClick={handleGenerateClick} disabled={status.isGenerating || !prompt.trim()} className="w-full" size="lg">
                  {status.isGenerating ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating...</>) : (<><Zap className="w-5 h-5 mr-2" />Generate</>)}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Kolom Kanan: Hasil Gambar */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold dark:text-white">Results</h2>
              {generatedImages.length > 0 && !status.isGenerating && (
                <Button onClick={clearHistory} variant="outline" size="sm"><Trash2 className="w-4 h-4 mr-2" />Clear All</Button>
              )}
            </div>
            
            <div className="relative min-h-[400px] bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4">
              {/* PERBAIKAN: Tampilkan overlay loading di sini */}
              {status.isGenerating && <GeneratingOverlay />}
              
              {/* PERBAIKAN: Tampilkan pesan jika tidak ada gambar dan tidak sedang loading */}
              {!status.isGenerating && generatedImages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                  <ImageIcon className="w-16 h-16 mb-4" />
                  <h3 className="text-xl font-semibold">Your creations will appear here</h3>
                  <p>Enter a prompt and click "Generate" to start.</p>
                </div>
              )}

              {/* Tampilkan gambar jika ada */}
              {generatedImages.length > 0 && (
                <ImageGrid images={generatedImages} onAllImagesLoaded={handleAllImagesLoaded} />
              )}
            </div>
          </div>
        </div>
        
        {/* --- Dialogs/Modals --- */}
        <ImageToPrompt 
          open={dialogs.imageToPrompt} 
          onOpenChange={(open) => setDialogs(d => ({ ...d, imageToPrompt: open }))}
          onPromptGenerated={usePrompt} 
        />
        <PromptManager
          open={dialogs.promptManager}
          onOpenChange={(open) => setDialogs(d => ({ ...d, promptManager: open }))}
          savedPrompts={savedPrompts}
          onUsePrompt={usePrompt}
          onSavePrompt={savePrompt}
          onDeletePrompt={deletePrompt}
        />
      </div>
    </div>
  )
}

// Komponen terpisah untuk grid gambar agar lebih rapi
const ImageGrid = ({ images, onAllImagesLoaded }: { images: GeneratedImage[], onAllImagesLoaded: () => void }) => {
    const imageLoadPromises = useRef<Promise<any>[]>([]);
    
    useEffect(() => {
        // Setiap kali gambar berubah, kita tunggu semuanya selesai dimuat
        const imageElements = document.querySelectorAll<HTMLImageElement>('#image-grid-item');
        imageLoadPromises.current = Array.from(imageElements).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve; // Tetap resolve meski error agar tidak stuck
            });
        });

        Promise.all(imageLoadPromises.current).then(() => {
            onAllImagesLoaded();
        });
    }, [images, onAllImagesLoaded]);

    return (
        <div className="grid grid-cols-2 gap-4">
            {images.map((image) => (
                <div key={image.id} className="group relative aspect-square">
                    <img id="image-grid-item" src={image.url} alt={image.prompt} className="w-full h-full object-cover rounded-lg transition-all duration-300 group-hover:brightness-75" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-white flex flex-col justify-end">
                        <p className="text-xs font-mono">{image.model} @ {image.seed}</p>
                        <p className="text-sm font-semibold truncate">{image.prompt}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
