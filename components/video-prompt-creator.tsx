"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Video, Sparkles } from "lucide-react"

interface VideoPromptCreatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPromptGenerated: (prompt: string) => void
}

const videoStyles = [
  "Cinematic",
  "Documentary",
  "Animation",
  "Time-lapse",
  "Slow Motion",
  "Drone Shot",
  "Close-up",
  "Wide Shot",
  "POV",
  "Tracking Shot",
]

const videoMoods = [
  "Epic",
  "Dramatic",
  "Peaceful",
  "Energetic",
  "Mysterious",
  "Romantic",
  "Action-packed",
  "Serene",
  "Intense",
  "Whimsical",
]

const videoSettings = [
  "Golden Hour",
  "Blue Hour",
  "Sunset",
  "Sunrise",
  "Night",
  "Studio Lighting",
  "Natural Light",
  "Neon Lights",
  "Candlelight",
  "Moonlight",
]

export function VideoPromptCreator({ open, onOpenChange, onPromptGenerated }: VideoPromptCreatorProps) {
  const [subject, setSubject] = useState("")
  const [action, setAction] = useState("")
  const [setting, setSetting] = useState("")
  const [style, setStyle] = useState("")
  const [mood, setMood] = useState("")
  const [lighting, setLighting] = useState("")
  const [duration, setDuration] = useState("")
  const [additionalDetails, setAdditionalDetails] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState("")

  const generateVideoPrompt = async () => {
    if (!subject.trim()) return

    setIsGenerating(true)

    try {
      const promptElements = [
        subject && `Subject: ${subject}`,
        action && `Action: ${action}`,
        setting && `Setting: ${setting}`,
        style && `Style: ${style}`,
        mood && `Mood: ${mood}`,
        lighting && `Lighting: ${lighting}`,
        duration && `Duration: ${duration}`,
        additionalDetails && `Details: ${additionalDetails}`,
      ].filter(Boolean)

      const basePrompt = promptElements.join(", ")

      // Enhanced prompt for video generation
      const enhancedPrompt = `Create a ${style || "cinematic"} video scene: ${basePrompt}. Professional video quality, smooth camera movement, ${mood || "dramatic"} atmosphere, ${lighting || "natural lighting"}, high resolution, detailed textures, realistic motion blur, depth of field.`

      setGeneratedPrompt(enhancedPrompt)
    } catch (error) {
      console.error("Error generating video prompt:", error)
    } finally {
      setIsGenerating(false)
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
    setSubject("")
    setAction("")
    setSetting("")
    setStyle("")
    setMood("")
    setLighting("")
    setDuration("")
    setAdditionalDetails("")
    setGeneratedPrompt("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 dark:text-white">
            <Video className="w-5 h-5" />
            Video Prompt Creator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject" className="dark:text-gray-200">
                Subject *
              </Label>
              <Input
                id="subject"
                placeholder="e.g., A majestic eagle"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="action" className="dark:text-gray-200">
                Action
              </Label>
              <Input
                id="action"
                placeholder="e.g., soaring through clouds"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <Label className="dark:text-gray-200">Video Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {videoStyles.map((s) => (
                    <SelectItem key={s} value={s} className="dark:text-white dark:focus:bg-gray-600">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="dark:text-gray-200">Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {videoMoods.map((m) => (
                    <SelectItem key={m} value={m} className="dark:text-white dark:focus:bg-gray-600">
                      {m}
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
                  {videoSettings.map((l) => (
                    <SelectItem key={l} value={l} className="dark:text-white dark:focus:bg-gray-600">
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration" className="dark:text-gray-200">
                Duration
              </Label>
              <Input
                id="duration"
                placeholder="e.g., 30 seconds"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="setting" className="dark:text-gray-200">
              Setting/Location
            </Label>
            <Input
              id="setting"
              placeholder="e.g., mountain peaks at sunrise"
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <Label htmlFor="additionalDetails" className="dark:text-gray-200">
              Additional Details
            </Label>
            <Textarea
              id="additionalDetails"
              placeholder="Any specific camera angles, effects, or other details..."
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              rows={3}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {generatedPrompt && (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
              <Label className="text-sm font-medium dark:text-gray-200">Generated Video Prompt:</Label>
              <p className="text-sm mt-2 dark:text-gray-300">{generatedPrompt}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={generateVideoPrompt} disabled={isGenerating || !subject.trim()} className="flex-1">
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Video Prompt
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
