"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Save, X, RotateCcw, Contrast, Sun, Palette } from "lucide-react"

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

interface ImageEditorProps {
  image: GeneratedImage
  onSave: (editedImageUrl: string) => void
  onClose: () => void
}

export function ImageEditor({ image, onSave, onClose }: ImageEditorProps) {
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [hue, setHue] = useState(0)

  const resetFilters = () => {
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setHue(0)
  }

  const handleSave = () => {
    // In a real implementation, you would apply the filters to the image
    // and return the edited image URL. For now, we'll just return the original URL
    onSave(image.url)
  }

  const filterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg)`,
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between dark:text-white">
            <span>Image Editor</span>
            <Button onClick={onClose} variant="ghost" size="sm" className="dark:text-white dark:hover:bg-gray-700">
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Preview */}
          <div className="space-y-4">
            <Label className="text-base font-medium dark:text-gray-200">Preview</Label>
            <div className="border rounded-lg overflow-hidden dark:border-gray-600">
              <img
                src={image.url || "/placeholder.svg"}
                alt={image.prompt}
                style={filterStyle}
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium dark:text-gray-200">Adjustments</Label>
            </div>

            {/* Brightness */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 dark:text-gray-300" />
                <Label className="dark:text-gray-200">Brightness: {brightness}%</Label>
              </div>
              <Slider
                value={[brightness]}
                onValueChange={([value]) => setBrightness(value)}
                min={0}
                max={200}
                step={1}
                className="dark:[&>span]:bg-gray-600"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Contrast className="w-4 h-4 dark:text-gray-300" />
                <Label className="dark:text-gray-200">Contrast: {contrast}%</Label>
              </div>
              <Slider
                value={[contrast]}
                onValueChange={([value]) => setContrast(value)}
                min={0}
                max={200}
                step={1}
                className="dark:[&>span]:bg-gray-600"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 dark:text-gray-300" />
                <Label className="dark:text-gray-200">Saturation: {saturation}%</Label>
              </div>
              <Slider
                value={[saturation]}
                onValueChange={([value]) => setSaturation(value)}
                min={0}
                max={200}
                step={1}
                className="dark:[&>span]:bg-gray-600"
              />
            </div>

            {/* Hue */}
            <div className="space-y-2">
              <Label className="dark:text-gray-200">Hue: {hue}°</Label>
              <Slider
                value={[hue]}
                onValueChange={([value]) => setHue(value)}
                min={-180}
                max={180}
                step={1}
                className="dark:[&>span]:bg-gray-600"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={resetFilters}
                variant="outline"
                className="flex-1 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
