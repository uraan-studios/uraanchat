// lib/hooks/useRecentChats.ts
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"

type Chat = {
  id: string
  title: string
  createdAt: string
  branched?: boolean
}

type ChatResponse = {
  data: Chat[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const useRecentChats = (limit: number = 20) => {
  const queryClient = useQueryClient()

  const query = useInfiniteQuery<ChatResponse>({
    queryKey: ["recent-chats", limit],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/chat/recent?page=${pageParam}&limit=${limit}`)
      if (!res.ok) throw new Error("Failed to fetch chats")
      return res.json()
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    initialPageParam: 1,
  })

  // Optimistically add a new chat to the beginning of the list
  const addOptimisticChat = (newChat: Chat) => {
    queryClient.setQueryData(
      ["recent-chats", limit],
      (oldData: any) => {
        if (!oldData) return oldData

        const newPages = [...oldData.pages]
        if (newPages[0]) {
          // Add to the first page
          newPages[0] = {
            ...newPages[0],
            data: [newChat, ...newPages[0].data],
            pagination: {
              ...newPages[0].pagination,
              total: newPages[0].pagination.total + 1
            }
          }
        }

        return {
          ...oldData,
          pages: newPages
        }
      }
    )
  }

  // Remove a chat from the list
  const removeChat = (chatId: string) => {
    queryClient.setQueryData(
      ["recent-chats", limit],
      (oldData: any) => {
        if (!oldData) return oldData

        const newPages = oldData.pages.map((page: ChatResponse) => ({
          ...page,
          data: page.data.filter((chat: Chat) => chat.id !== chatId),
          pagination: {
            ...page.pagination,
            total: Math.max(0, page.pagination.total - 1)
          }
        }))

        return {
          ...oldData,
          pages: newPages
        }
      }
    )
  }

  // Update chat title optimistically
  const updateChatTitle = (chatId: string, newTitle: string) => {
    queryClient.setQueryData(
      ["recent-chats", limit],
      (oldData: any) => {
        if (!oldData) return oldData

        const newPages = oldData.pages.map((page: ChatResponse) => ({
          ...page,
          data: page.data.map((chat: Chat) => 
            chat.id === chatId ? { ...chat, title: newTitle } : chat
          )
        }))

        return {
          ...oldData,
          pages: newPages
        }
      }
    )
  }

  // Flatten all chats from all pages
  const allChats = query.data?.pages.flatMap(page => page.data) ?? []

  return {
    ...query,
    chats: allChats,
    addOptimisticChat,
    removeChat,
    updateChatTitle,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  }
}