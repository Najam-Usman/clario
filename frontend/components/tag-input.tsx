"use client"

import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  suggestions?: string[]
}

export function TagInput({ value, onChange, placeholder, suggestions = [] }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredSuggestions = suggestions.filter(
    (suggestion) => suggestion.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(suggestion),
  )

  const addTag = (tag: string) => {
    if (tag.trim() && !value.includes(tag.trim())) {
      onChange([...value, tag.trim()])
      setInputValue("")
      setShowSuggestions(false)
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setShowSuggestions(e.target.value.length > 0)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="rounded-2xl"
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-2xl shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-full px-3 py-1 bg-primary/10 text-foreground border-0"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
