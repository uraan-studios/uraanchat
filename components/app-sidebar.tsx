"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { GitBranch, MessageSquare, Trash2 } from "lucide-react"
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
import { useMutation } from '@tanstack/react-query';
import { formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns"
import { useRecentChats } from "@/lib/hooks/useRecentChat"
import { toast } from "sonner"
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"


interface ChatSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onNewChat: () => void;
}

export function AppSidebar({ onNewChat, ...props }: ChatSidebarProps) {
  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  
  const {
    chats,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    removeChat,
  } = useRecentChats(20);

  // Load more chats when scrolling to bottom
  useIntersectionObserver(loadMoreRef, {
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    enabled: hasNextPage && !isFetchingNextPage,
  });

  // Delete chat mutation
  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete chat');
      return response.json();
    },
    onSuccess: (_, chatId) => {
      removeChat(chatId);
      toast.success('Chat deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete chat');
    },
  });

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteChatMutation.mutate(chatId);
    }
  };


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

          <SidebarMenuButton
          asChild
          className="mt-4 items-center font-semibold bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
        >
            <div className=" ">

              New Chat
            </div>
        </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="flex flex-col gap-2 ">


      {/* Chat List - Scrollable Area */}
      <div >
        <div className="p-2">
          {isLoading && chats.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            <ScrollArea >
              <div className="space-y-1">
              {chats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className="block p-3  rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <MessageSquare className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-muted-foreground truncate">
                          {chat.title || 'Untitled Chat'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(chat.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0 hover:bg-red-100 rounded"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      disabled={deleteChatMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </Link>
              ))}

              {/* Load more trigger */}
              {hasNextPage && (
                <div ref={loadMoreRef} className="py-4">
                  {isFetchingNextPage ? (
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <button
                      onClick={() => fetchNextPage()}
                      className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Load more chats
                    </button>
                  )}
                </div>
              )}

              {chats.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chats yet</p>
                </div>
              )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}