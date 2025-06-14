"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { type ButtonHTMLAttributes, forwardRef } from "react"

interface EnhancedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  pulseOnHover?: boolean
  size?: "sm" | "lg" | "default"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ children, isLoading, loadingText, pulseOnHover, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={`${pulseOnHover ? "hover:scale-105 transition-transform" : ""} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {loadingText || "Loading..."}
          </>
        ) : (
          children
        )}
      </Button>
    )
  },
)

EnhancedButton.displayName = "EnhancedButton"
