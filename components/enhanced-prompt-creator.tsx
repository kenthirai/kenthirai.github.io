"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wand2, Sparkles, Plus, X } from "lucide-react"

interface EnhancedPromptCreatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPromptGenerated: (prompt: string) => void
}

const artStyles = [
  "Photorealistic",
  "Digital Art",
  "Oil Painting",
  "Watercolor",
  "Sketch",
  "3D Render",
  "Anime",
  "Cartoon",
  "Abstract",
  "Surreal",
  "Minimalist",
  "Vintage",
  "Cyberpunk",
  "Steampunk",
]

const cameraAngles = [
  "Close-up",
  "Wide Shot",
  "Bird's Eye View",
  "Low Angle",
  "High Angle",
  "Dutch Angle",
  "Over the Shoulder",
  "POV",
  "Macro",
  "Panoramic",
]

const lightingTypes = [
  "Golden Hour",
  "Blue Hour",
  "Soft Lighting",
  "Hard Lighting",
  "Backlighting",
  "Side Lighting",
  "Studio Lighting",
  "Natural Light",
  "Neon Lighting",
  "Candlelight",
  "Moonlight",
  "Dramatic Lighting",
]

const colorPalettes = [
  "Vibrant",
  "Muted",
  "Monochrome",
  "Warm Tones",
  "Cool Tones",
  "Pastel",
  "High Contrast",
  "Sepia",
  "Black and White",
  "Neon Colors",
  "Earth Tones",
  "Jewel Tones",
]

const qualityModifiers = [
  "8K",
  "4K",
  "Ultra HD",
  "High Resolution",
  "Sharp Focus",
  "Highly Detailed",
  "Professional",
  "Award Winning",
  "Masterpiece",
  "Trending on ArtStation",
  "Unreal Engine",
  "Octane Render",
]

export function EnhancedPromptCreator({ open, onOpenChange, onPromptGenerated }: EnhancedPromptCreatorProps) {
  const [mainSubject, setMainSubject] = useState("")
  const [environment, setEnvironment] = useState("")
  const [artStyle, setArtStyle] = useState("")
  const [cameraAngle, setCameraAngle] = useState("")
  const [lighting, setLighting] = useState("")
  const [colorPalette, setColorPalette] = useState("")
  const [mood, setMood] = useState("")
  const [customTags, setCustomTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [selectedQualityModifiers, setSelectedQualityModifiers] = useState<string[]>([])
  const [additionalDetails, setAdditionalDetails] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [streamingText, setStreamingText] = useState("")

  const addCustomTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      setCustomTags([...customTags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeCustomTag = (tag: string) => {
    setCustomTags(customTags.filter((t) => t !== tag))
  }

  const toggleQualityModifier = (modifier: string) => {
    setSelectedQualityModifiers((prev) =>
      prev.includes(modifier) ? prev.filter((m) => m !== modifier) : [...prev, modifier],
    )
  }

  const generateEnhancedPrompt = async () => {
    if (!mainSubject.trim()) return

    setIsGenerating(true)
    setStreamingText("")

    try {
      const promptElements = [
        mainSubject,
        environment && `in ${environment}`,
        cameraAngle && `${cameraAngle.toLowerCase()} shot`,
        artStyle && `${artStyle.toLowerCase()} style`,
        lighting && `${lighting.toLowerCase()}`,
        colorPalette && `${colorPalette.toLowerCase()} color palette`,
        mood && `${mood} mood`,
        ...customTags,
        additionalDetails,
      ].filter(Boolean)

      const qualityString =
        selectedQualityModifiers.length > 0 ? `, ${selectedQualityModifiers.join(", ").toLowerCase()}` : ""

      const basePrompt = promptElements.join(", ") + qualityString

      // Use AI to enhance the prompt
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
              content: `Transform this into a detailed, professional image generation prompt with artistic and technical details: "${basePrompt}". Make it more descriptive, add composition details, and enhance the visual elements while keeping the core concept.`,
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
        // Fallback to manual prompt construction
        setGeneratedPrompt(basePrompt)
      }
    } catch (error) {
      console.error("Error generating enhanced prompt:", error)
      // Fallback to manual prompt construction
      const promptElements = [
        mainSubject,
        environment && `in ${environment}`,
        cameraAngle && `${cameraAngle.toLowerCase()} shot`,
        artStyle && `${artStyle.toLowerCase()} style`,
        lighting && `${lighting.toLowerCase()}`,
        colorPalette && `${colorPalette.toLowerCase()} color palette`,
        mood && `${mood} mood`,
        ...customTags,
        additionalDetails,
      ].filter(Boolean)

      const qualityString =
        selectedQualityModifiers.length > 0 ? `, ${selectedQualityModifiers.join(", ").toLowerCase()}` : ""

      setGeneratedPrompt(promptElements.join(", ") + qualityString)
    } finally {
      setIsGenerating(false)
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
    setMainSubject("")
    setEnvironment("")
    setArtStyle("")
    setCameraAngle("")
    setLighting("")
    setColorPalette("")
    setMood("")
    setCustomTags([])
    setNewTag("")
    setSelectedQualityModifiers([])
    setAdditionalDetails("")
    setGeneratedPrompt("")
    setStreamingText("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 dark:text-white">
            <Wand2 className="w-5 h-5" />
            Enhanced Prompt Creator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Subject */}
          <div>
            <Label htmlFor="mainSubject" className="text-base font-medium dark:text-gray-200">
              Main Subject *
            </Label>
            <Input
              id="mainSubject"
              placeholder="e.g., A majestic dragon, A futuristic cityscape, A portrait of a woman"
              value={mainSubject}
              onChange={(e) => setMainSubject(e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Style and Technical Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="dark:text-gray-200">Art Style</Label>
              <Select value={artStyle} onValueChange={setArtStyle}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {artStyles.map((style) => (
                    <SelectItem key={style} value={style} className="dark:text-white dark:focus:bg-gray-600">
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="dark:text-gray-200">Camera Angle</Label>
              <Select value={cameraAngle} onValueChange={setCameraAngle}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select angle" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {cameraAngles.map((angle) => (
                    <SelectItem key={angle} value={angle} className="dark:text-white dark:focus:bg-gray-600">
                      {angle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="dark:text-gray-200">Lighting</Label>
              <Select value={lighting} onValueChange={setLighting}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select lighting" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {lightingTypes.map((light) => (
                    <SelectItem key={light} value={light} className="dark:text-white dark:focus:bg-gray-600">
                      {light}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="dark:text-gray-200">Color Palette</Label>
              <Select value={colorPalette} onValueChange={setColorPalette}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select colors" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {colorPalettes.map((palette) => (
                    <SelectItem key={palette} value={palette} className="dark:text-white dark:focus:bg-gray-600">
                      {palette}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="environment" className="dark:text-gray-200">
                Environment
              </Label>
              <Input
                id="environment"
                placeholder="e.g., mystical forest, cyberpunk city"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="mood" className="dark:text-gray-200">
                Mood
              </Label>
              <Input
                id="mood"
                placeholder="e.g., dramatic, peaceful, mysterious"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Quality Modifiers */}
          <div>
            <Label className="text-base font-medium dark:text-gray-200">Quality Modifiers</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
              {qualityModifiers.map((modifier) => (
                <div key={modifier} className="flex items-center space-x-2">
                  <Checkbox
                    id={modifier}
                    checked={selectedQualityModifiers.includes(modifier)}
                    onCheckedChange={() => toggleQualityModifier(modifier)}
                    className="dark:border-gray-600"
                  />
                  <Label htmlFor={modifier} className="text-sm dark:text-gray-300">
                    {modifier}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Tags */}
          <div>
            <Label className="text-base font-medium dark:text-gray-200">Custom Tags</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add custom tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCustomTag()}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Button
                onClick={addCustomTag}
                size="sm"
                variant="outline"
                className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {customTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {customTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="dark:bg-gray-600 dark:text-gray-200">
                    {tag}
                    <Button
                      onClick={() => removeCustomTag(tag)}
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div>
            <Label htmlFor="additionalDetails" className="text-base font-medium dark:text-gray-200">
              Additional Details
            </Label>
            <Textarea
              id="additionalDetails"
              placeholder="Any specific details, composition notes, or special effects..."
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              rows={3}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Generated Prompt Display */}
          {(isGenerating && streamingText) || generatedPrompt ? (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
              <Label className="text-sm font-medium dark:text-gray-200">Generated Enhanced Prompt:</Label>
              <p className="text-sm mt-2 whitespace-pre-wrap dark:text-gray-300">
                {isGenerating ? streamingText : generatedPrompt}
              </p>
              {isGenerating && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">AI is enhancing your prompt...</span>
                </div>
              )}
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={generateEnhancedPrompt} disabled={isGenerating || !mainSubject.trim()} className="flex-1">
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Enhanced Prompt
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
