// lib/stores/chat-store.ts
import { create } from 'zustand';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatData {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

interface ChatStore {
  chats: Map<string, ChatData>;
  setChat: (chatId: string, chat: ChatData) => void;
  getChat: (chatId: string) => ChatData | undefined;
  updateChatMessages: (chatId: string, messages: ChatMessage[]) => void;
  clearStore: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: new Map(),
  
  setChat: (chatId, chat) => {
    set((state) => {
      const newChats = new Map(state.chats);
      newChats.set(chatId, chat);
      return { chats: newChats };
    });
  },
  
  getChat: (chatId) => {
    return get().chats.get(chatId);
  },
  
  updateChatMessages: (chatId, messages) => {
    set((state) => {
      const chat = state.chats.get(chatId);
      if (chat) {
        const newChats = new Map(state.chats);
        newChats.set(chatId, { ...chat, messages });
        return { chats: newChats };
      }
      return state;
    });
  },
  
  clearStore: () => {
    set({ chats: new Map() });
  },
}));