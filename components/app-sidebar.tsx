"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { GitBranch, Trash2 } from "lucide-react"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import SidebarTopbar from "./sidebar-topbar"

import { formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns"
import { useRecentChats } from "@/lib/hooks/useRecentChat"

function groupChatsByDate(chats: Chat[]) {
  const groups: Record<string, Chat[]> = {}
  chats.forEach((chat) => {
    const date = parseISO(chat.createdAt)
    let label = "older"
    if (isToday(date)) label = "today"
    else if (isYesterday(date)) label = "yesterday"
    else label = formatDistanceToNow(date, { addSuffix: true })

    if (!groups[label]) groups[label] = []
    groups[label].push(chat)
  })
  return groups
}

type Chat = {
  id: string
  title: string
  createdAt: string
  branched?: boolean
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data, isLoading } = useRecentChats()
  const chats = data?.data ?? []

  const chatGroups = groupChatsByDate(chats)

  const renderChat = (chat: Chat) => (
    <div key={chat.id} className="relative group">
      <Link
        href={`/chat/${chat.id}`}
        className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-muted"
      >
        <div className="flex items-center gap-2 truncate">
          {chat.branched && (
            <GitBranch className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          )}
          <span className="truncate">{chat.title || "New Chat"}</span>
        </div>
      </Link>

      <div
        className="
          absolute right-1 top-1/2 flex -translate-y-1/2 translate-x-2 opacity-0
          group-hover:translate-x-0 group-hover:opacity-100
          transition-all duration-200
          items-center rounded-md bg-muted
        "
      >
        <button
          onClick={(e) => e.preventDefault()}
          className="p-1 hover:text-destructive"
          title="Delete chat"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="mb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarTopbar />
            <h2 className="text-lg font-semibold leading-tight text-sidebar-primary text-center">
              Uraan Chat
            </h2>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenuButton
          asChild
          className="items-center font-semibold bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Link
            href="/"
            aria-label="Start a new chat"
            className="flex w-full items-center justify-center rounded py-2 text-center"
          >
            New Chat
          </Link>
        </SidebarMenuButton>

        {isLoading ? (
          <div className="px-3 pt-4 text-sm text-muted-foreground">Loading...</div>
        ) : (
          Object.entries(chatGroups).map(([label, chats]) => (
            <div key={label} className="px-3 pt-4">
              <p className="mb-1 text-xs capitalize text-muted-foreground">
                {label}
              </p>
              {chats.map(renderChat)}
            </div>
          ))
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
