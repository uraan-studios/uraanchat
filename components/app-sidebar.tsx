"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  GitBranch,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import SidebarTopbar from "./sidebar-topbar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  chats: [
    {
      id: 1,
      title: "How to train GPT: A very long title to demonstrate truncation",
      date: "today",
      pinned: true,
      branched: false,
    },
    {
      id: 5,
      title: "How to train GPT2",
      date: "today",
      pinned: true,
      branched: false,
    },
    {
      id: 2,
      title: "Marketing strategy",
      date: "today",
      pinned: false,
      branched: true,
    },
    {
      id: 3,
      title: "Weekly sync notes for the new quantum computing project",
      date: "yesterday",
      pinned: false,
      branched: false,
    },
    {
      id: 4,
      title: "Quantum model analysis",
      date: "3 days ago",
      pinned: false,
      branched: true,
    },
  ],
}

function groupChatsByDate(chats: typeof data.chats) {
  const groups: Record<string, typeof data.chats> = {}
  chats.forEach((chat) => {
    if (!groups[chat.date]) groups[chat.date] = []
    groups[chat.date].push(chat)
  })
  return groups
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const chatGroups = groupChatsByDate(data.chats)

  const renderChat = (chat: (typeof data.chats)[0], pinned?: boolean) => (
    <div key={chat.id} className={cn("relative group")}>
      <Link
        href="#"
        className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-muted"
      >
        <div className="flex items-center gap-2 truncate">
          {chat.branched && (
            <GitBranch className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          )}
          <span className="truncate">{chat.title}</span>
        </div>
      </Link>

      {/* Slide-in actions: hidden by default, shown on individual chat item hover */}
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
          className="p-1 hover:text-primary"
          title={chat.pinned ? "Unpin chat" : "Pin chat"}
        >
          {chat.pinned ? (
            <PinOff className="h-4 w-4" />
          ) : (
            <Pin className="h-4 w-4" />
          )}
        </button>
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
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            
            <SidebarTopbar />

            <h2 className="text-sm font-medium leading-tight text-sidebar-primary">
              Uraan Chat
            </h2>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenuItem>
          <SidebarMenuButton className="items-center font-semibold bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
            <Link
              href="/"
              aria-label="Start a new chat"
              className="flex w-full items-center justify-center rounded py-2 text-center"
            >
              New Chat
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Pinned Chats */}
        {data.chats.some((chat) => chat.pinned) && (
          <div className="px-3 pt-4">
            <p className="mb-1 text-xs text-muted-foreground">Pinned</p>
            {data.chats
              .filter((chat) => chat.pinned)
              .map((chat) => renderChat(chat, true))}
          </div>
        )}

        {/* Grouped Chats */}
        {Object.entries(chatGroups).map(([label, chats]) => (
          <div key={label} className="px-3 pt-4">
            <p className="mb-1 text-xs capitalize text-muted-foreground">
              {label}
            </p>
            {chats
              .filter((chat) => !chat.pinned)
              .map((chat) => renderChat(chat))}
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}