'use client'

import { createContext, useContext, useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

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
            <DialogTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              Enter your OpenRouter API Key
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="sk-..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!input}>
                Save Key
              </Button>
              <Link
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" type="button">
                  Get API Key
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Your key is stored locally and never sent to our servers.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </ApiKeyContext.Provider>
  )
}
