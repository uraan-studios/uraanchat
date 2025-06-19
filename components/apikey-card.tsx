'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"
import { Eye, Pencil, Save, X, ExternalLink } from "lucide-react"

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

  const displayKey = key ? `${key.slice(0, 4)}****${key.slice(-4)}` : "No key saved"

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>OpenRouter API Key</span>
          {!editing && key && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditing(true)}
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!editing ? (
          <>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              {displayKey}
            </div>
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
              <Button onClick={handleSave} disabled={!input}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Don’t have an API key?{" "}
          <Link
            href="https://openrouter.ai/keys"
            target="_blank"
            className="text-primary hover:underline inline-flex items-center"
          >
            Get one here <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  )
}
