"use client"

import * as React from "react"
import { PencilIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "subtle" | "outline"
  tooltipText?: string
  onEdit?: () => void
}

export const EditButton = React.forwardRef<HTMLButtonElement, EditButtonProps>(
  ({ className, size = "md", variant = "default", tooltipText, onEdit, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (onEdit) {
        onEdit()
      }
    }

    const sizeClasses = {
      sm: "h-6 w-6 p-1",
      md: "h-8 w-8 p-1.5",
      lg: "h-10 w-10 p-2",
    }

    const variantClasses = {
      default: "bg-primary/10 hover:bg-primary/20 text-primary",
      subtle: "bg-transparent hover:bg-primary/10 text-primary/80 hover:text-primary",
      outline: "bg-transparent border border-primary/20 hover:border-primary/40 text-primary/80 hover:text-primary",
    }

    const buttonClasses = cn(
      "rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus-visible:ring-2 focus-visible:ring-primary/30 flex items-center justify-center",
      sizeClasses[size],
      variantClasses[variant],
      className,
    )

    return (
      <div className="relative group">
        <button
          type="button"
          className={buttonClasses}
          onClick={handleClick}
          ref={ref}
          aria-label={tooltipText || "Edit"}
          title={tooltipText || "Edit"}
          {...props}
        >
          <PencilIcon className="h-full w-full stroke-current" />
        </button>
        {tooltipText && (
          <div className="absolute z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 px-2 py-1 bg-gray-900 text-white text-xs rounded pointer-events-none whitespace-nowrap">
            {tooltipText}
          </div>
        )}
      </div>
    )
  },
)

EditButton.displayName = "EditButton"
