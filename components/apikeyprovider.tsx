// components/api-key-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const API_KEY_STORAGE_KEY = "openrouter-api-key"

const ApiKeyContext = createContext<string | null>(null)

export function useApiKey() {
  return useContext(ApiKeyContext)
}

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY)
    if (storedKey) {
      setApiKey(storedKey)
    } else {
      setOpen(true)
    }
  }, [])

  const handleSave = () => {
    if (!input) return
    localStorage.setItem(API_KEY_STORAGE_KEY, input)
    setApiKey(input)
    setOpen(false)
  }

  return (
    <ApiKeyContext.Provider value={apiKey}>
      {children}

      <Dialog open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your OpenRouter API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder="sk-..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button onClick={handleSave} disabled={!input}>
              Save Key
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ApiKeyContext.Provider>
  )
}
