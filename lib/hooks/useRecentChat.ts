// lib/hooks/useRecentChats.ts
import { useQuery } from "@tanstack/react-query"

type Chat = {
  id: string
  title: string
  createdAt: string
  branched?: boolean
}

type ChatResponse = {
  data: Chat[]
}

export const useRecentChats = () => {
  return useQuery<ChatResponse>({
    queryKey: ["recent-chats"],
    queryFn: async () => {
      const res = await fetch("/api/chat/recent")
      if (!res.ok) throw new Error("Failed to fetch chats")
      return res.json()
    },
  })
}
