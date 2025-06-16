import { Chat } from "@/generated/prisma"
import { formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns"

export function groupChatsByDate(chats: Chat[]) {
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
