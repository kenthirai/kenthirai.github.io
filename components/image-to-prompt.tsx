"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Upload, ImageIcon, Sparkles, X } from "lucide-react"

interface ImageToPromptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPromptGenerated: (prompt: string) => void
}

// Fungsi helper untuk mengompres gambar, diadaptasi dari ruangriung.js
const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Failed to get canvas context'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


export function ImageToPrompt({ open, onOpenChange, onPromptGenerated }: ImageToPromptProps) {
  const [compressedImage, setCompressedImage] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [streamingText, setStreamingText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      try {
        const compressedDataUrl = await compressImage(file);
        setCompressedImage(compressedDataUrl);
        setError(null);
        setGeneratedPrompt("");
        setStreamingText("");
      } catch (err) {
        console.error("Image compression failed:", err);
        setError("Failed to process image. Please try a different one.");
      }
    }
  }

// Ganti fungsi analyzeImage di dalam file: components/image-to-prompt.tsx

  const analyzeImage = async () => {
    if (!compressedImage) return;

    setIsAnalyzing(true);
    setStreamingText("");
    setGeneratedPrompt("");
    setError(null);

    try {
      // Panggilan ke backend API route kita tetap sama.
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: compressedImage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Analisis gagal dengan status: ${response.status}`);
      }

      // Sekarang kita mengharapkan JSON, bukan stream.
      const result = await response.json();
      
      // Ekstrak konten teks dari struktur respons JSON.
      const promptText = result?.choices?.[0]?.message?.content;

      if (promptText && typeof promptText === 'string') {
        const trimmedPrompt = promptText.trim();
        setGeneratedPrompt(trimmedPrompt);
        // Set juga streaming text agar pengguna bisa melihat hasilnya.
        setStreamingText(trimmedPrompt); 
      } else {
        throw new Error("Respons dari AI tidak valid atau tidak berisi prompt.");
      }
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError(err instanceof Error ? err.message : "Terjadi error yang tidak diketahui saat analisis.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  const usePrompt = () => {
    if (generatedPrompt) {
      onPromptGenerated(generatedPrompt)
      onOpenChange(false)
      resetForm()
    }
  }

  const resetForm = () => {
    setCompressedImage("")
    setGeneratedPrompt("")
    setStreamingText("")
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 dark:text-white">
            <ImageIcon className="w-5 h-5" />
            Image to Prompt Analyzer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <Label className="dark:text-gray-200">Upload Image</Label>
            <div className="mt-2">
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full h-32 border-2 border-dashed dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8" />
                  <span>Click to upload image</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Supports JPG, PNG, WebP</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Image Preview */}
          {compressedImage && (
            <div className="border rounded-lg p-4 dark:border-gray-600 relative">
               <Button
                onClick={() => setCompressedImage("")}
                variant="ghost"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full bg-black/50 text-white hover:bg-black/75"
              >
                <X className="w-4 h-4" />
              </Button>
              <Label className="text-sm font-medium dark:text-gray-200">Image Preview:</Label>
              <div className="mt-2 flex justify-center">
                <img
                  src={compressedImage}
                  alt="Selected"
                  className="max-w-full max-h-64 object-contain rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Result Display */}
          {(isAnalyzing || generatedPrompt || error) && (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
              <Label className="text-sm font-medium dark:text-gray-200">Analysis Result:</Label>
              {error ? (
                 <p className="text-sm mt-2 text-red-500 dark:text-red-400">{error}</p>
              ) : (
                <Textarea
                    value={isAnalyzing ? streamingText : generatedPrompt}
                    readOnly
                    rows={6}
                    className="mt-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white whitespace-pre-wrap"
                    placeholder="AI is analyzing the image..."
                />
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={analyzeImage} disabled={isAnalyzing || !compressedImage} className="flex-1">
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Image
                </>
              )}
            </Button>

            {generatedPrompt && (
              <Button
                onClick={usePrompt}
                variant="outline"
                className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                Use Prompt
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                resetForm()
              }}
              className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
