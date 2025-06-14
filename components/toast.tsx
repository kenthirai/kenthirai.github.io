"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface Toast {
  id: string
  title: string
  description: string
  type: "success" | "error"
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => removeToast(id), 5000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const success = (title: string, description: string) => addToast({ title, description, type: "success" })
  const error = (title: string, description: string) => addToast({ title, description, type: "error" })

  return { toasts, addToast, removeToast, success, error }
}

export function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right ${
            toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold">{toast.title}</h4>
              <p className="text-sm">{toast.description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeToast(toast.id)}
              className="text-white hover:bg-white/20 h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
