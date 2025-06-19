// File: components/prompt-manager.tsx

"use client"

import type React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Trash2, BookText, Wand2, Save } from "lucide-react"
import { useState } from "react"

// Definisikan tipe data untuk SavedPrompt
export interface SavedPrompt {
  id: string
  text: string
  category: string
  timestamp: Date
  used: number
}

interface PromptManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  savedPrompts: SavedPrompt[]
  onUsePrompt: (promptText: string) => void
  onSavePrompt: (promptText: string, category: string) => void
  onDeletePrompt: (promptId: string) => void
}

export function PromptManager({
  open,
  onOpenChange,
  savedPrompts,
  onUsePrompt,
  onSavePrompt,
  onDeletePrompt,
}: PromptManagerProps) {
  const [newPromptText, setNewPromptText] = useState("")
  const [newPromptCategory, setNewPromptCategory] = useState("General")

  const handleSaveClick = () => {
    if (newPromptText.trim()) {
      onSavePrompt(newPromptText, newPromptCategory)
      setNewPromptText("")
      setNewPromptCategory("General")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 dark:text-white">
            <BookText className="w-5 h-5" />
            Prompt Manager
          </DialogTitle>
          <DialogDescription>
            Save, manage, and reuse your favorite prompts.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Kolom Kiri: Simpan Prompt Baru */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg dark:text-gray-100">Save a New Prompt</h3>
            <div className="space-y-2">
              <Textarea
                placeholder="Enter the prompt text to save..."
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                rows={5}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Input
                placeholder="Category (e.g., Character, Scenery)"
                value={newPromptCategory}
                onChange={(e) => setNewPromptCategory(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <Button onClick={handleSaveClick} disabled={!newPromptText.trim()} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Prompt
            </Button>
          </div>

          {/* Kolom Kanan: Daftar Prompt Tersimpan */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg dark:text-gray-100">Saved Prompts</h3>
            <ScrollArea className="h-72 w-full rounded-md border p-4 dark:border-gray-600">
              {savedPrompts.length > 0 ? (
                <div className="space-y-3">
                  {savedPrompts
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .map((prompt) => (
                      <Card key={prompt.id} className="dark:bg-gray-700">
                        <CardContent className="p-3">
                          <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">
                            {prompt.text}
                          </p>
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="dark:bg-gray-600 dark:text-gray-200">
                              {prompt.category}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                title="Use this prompt"
                                onClick={() => onUsePrompt(prompt.text)}
                              >
                                <Wand2 className="w-4 h-4 text-blue-500" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                title="Delete prompt"
                                onClick={() => onDeletePrompt(prompt.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                  <BookText className="w-12 h-12 mb-2" />
                  <p>No prompts saved yet.</p>
                  <p className="text-xs">Save your first prompt using the form on the left.</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
