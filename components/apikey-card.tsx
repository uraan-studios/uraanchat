// components/api-key-card.tsx
'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const API_KEY_STORAGE_KEY = "openrouter-api-key"

export function ApiKeyCard() {
  const [key, setKey] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState("")

  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY)
    if (storedKey) {
      setKey(storedKey)
      setInput(storedKey)
    }
  }, [])

  const handleSave = () => {
    if (!input) return
    localStorage.setItem(API_KEY_STORAGE_KEY, input)
    setKey(input)
    setEditing(false)
    toast.success("API key updated")
  }

  const displayKey = key ? key.slice(0, 4) + "****" + key.slice(-4) : "No key saved"

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>OpenRouter API Key</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!editing ? (
          <>
            <div className="text-muted-foreground text-sm">{displayKey}</div>
            <Button variant="outline" onClick={() => setEditing(true)}>Edit Key</Button>
          </>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="apikey">Enter new key</Label>
            <Input
              id="apikey"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="sk-..."
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!input}>Save</Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
