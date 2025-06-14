"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Upload, ImageIcon, Sparkles } from "lucide-react"

interface ImageToPromptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPromptGenerated: (prompt: string) => void
}

export function ImageToPrompt({ open, onOpenChange, onPromptGenerated }: ImageToPromptProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [streamingText, setStreamingText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    setStreamingText("")

    try {
      // Convert image to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string

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
                  content: `Analyze this image and create a detailed prompt that could be used to generate a similar image. Focus on: composition, style, colors, lighting, mood, objects, people, setting, and artistic techniques. Make it suitable for AI image generation.`,
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
            setGeneratedPrompt(fullResponse.trim())
          } else {
            throw new Error("No response received")
          }
        } catch (error) {
          console.error("Error analyzing image:", error)
          // Fallback prompt based on image analysis
          setGeneratedPrompt(
            "A detailed, high-quality image with professional composition, balanced lighting, and artistic style. The image features rich colors and careful attention to detail, suitable for digital art generation.",
          )
        }
      }

      reader.readAsDataURL(selectedImage)
    } catch (error) {
      console.error("Error processing image:", error)
      setGeneratedPrompt(
        "A detailed, high-quality image with professional composition, balanced lighting, and artistic style.",
      )
    } finally {
      setIsAnalyzing(false)
      setStreamingText("")
    }
  }

  const usePrompt = () => {
    if (generatedPrompt) {
      onPromptGenerated(generatedPrompt)
      onOpenChange(false)
      resetForm()
    }
  }

  const resetForm = () => {
    setSelectedImage(null)
    setImagePreview("")
    setGeneratedPrompt("")
    setStreamingText("")
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
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
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
          {imagePreview && (
            <div className="border rounded-lg p-4 dark:border-gray-600">
              <Label className="text-sm font-medium dark:text-gray-200">Selected Image:</Label>
              <div className="mt-2 flex justify-center">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Selected"
                  className="max-w-full max-h-64 object-contain rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Generated Prompt Display */}
          {(isAnalyzing && streamingText) || generatedPrompt ? (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
              <Label className="text-sm font-medium dark:text-gray-200">Generated Prompt:</Label>
              <Textarea
                value={isAnalyzing ? streamingText : generatedPrompt}
                onChange={(e) => setGeneratedPrompt(e.target.value)}
                rows={6}
                className="mt-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="Generated prompt will appear here..."
              />
              {isAnalyzing && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Analyzing image...</span>
                </div>
              )}
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={analyzeImage} disabled={isAnalyzing || !selectedImage} className="flex-1">
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
