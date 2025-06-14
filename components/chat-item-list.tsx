"use client"

import Link from "next/link"
import { GitBranch, Pin, PinOff, Trash2 } from "lucide-react"
import * as React from "react"

interface ChatItemProps {
  id: number
  title: string
  pinned?: boolean
  branched?: boolean
  onUnpin?: () => void
  onDelete?: () => void
}

export function ChatListItem({
  id,
  title,
  pinned,
  branched,
  onDelete,
  onUnpin,
}: ChatItemProps) {
  return (
    <div className="group relative">
      <Link
        href="#"
        className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-muted"
      >
        <div className="flex items-center gap-2 truncate">
          {branched && (
            <GitBranch className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          )}
          <span className="truncate">{title}</span>
        </div>

        {pinned ? (
          <Pin className="h-3 w-3 flex-shrink-0 text-muted-foreground opacity-100" />
        ) : null}
      </Link>

      {/* Buttons appear only when this item is hovered */}
      <div className="absolute right-1 top-1/2 flex -translate-y-1/2 translate-x-2 items-center rounded-md bg-muted opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
        {pinned ? (
          <button
            onClick={(e) => {
              e.preventDefault()
              onUnpin?.()
            }}
            className="p-1 hover:text-primary"
            title="Unpin chat"
          >
            <PinOff className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault()
              // handle pin
            }}
            className="p-1 hover:text-primary"
            title="Pin chat"
          >
            <Pin className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.preventDefault()
            onDelete?.()
          }}
          className="p-1 hover:text-destructive"
          title="Delete chat"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
