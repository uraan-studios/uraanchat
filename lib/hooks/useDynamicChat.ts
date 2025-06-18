// lib/hooks/useDynamicChat.ts
import { useChat } from '@ai-sdk/react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';
import { useRecentChats } from './useRecentChat';
import { toast } from 'sonner';
import { useApiKey } from '@/components/apikeyprovider';

interface UseDynamicChatOptions {
  model: string;
  onFinish?: () => void;
}

export function useDynamicChat({ model, onFinish }: UseDynamicChatOptions) {
  const params = useParams();
  const router = useRouter();
  const initialChatId = params?.id as string;
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(initialChatId);
  const [isNewChat, setIsNewChat] = useState(!initialChatId);
  const shouldNavigateRef = useRef(false);
  const { addOptimisticChat, updateChatTitle } = useRecentChats();

  const apikey = useApiKey();

  const chatHook = useChat({
    api: '/api/chat',
    id: currentChatId || undefined,
    body: { model, apikey },
    onFinish(result) {
      onFinish?.();
      
      // If this was a new chat and we should navigate
      if (shouldNavigateRef.current && currentChatId) {
        shouldNavigateRef.current = false;
        setIsNewChat(false);
        
        // Use setTimeout to ensure the response is fully rendered before navigation
        setTimeout(() => {
          router.push(`/chat/${currentChatId}`);
        }, 100);
        
        // Generate title for the new chat
        const firstUserMessage = ((result as unknown) as { messages: any[] }).messages.find((m: any) => m.role === 'user');
        if (firstUserMessage) {
          generateChatTitle(currentChatId, firstUserMessage.content);
        }
      }
      
      // Update chat title if it's an early message in existing chat
      if (!isNewChat && chatHook.messages.length <= 4 && currentChatId) {
        const firstUserMessage = chatHook.messages.find(m => m.role === 'user');
        if (firstUserMessage) {
          generateChatTitle(currentChatId, firstUserMessage.content);
        }
      }
    },
    onError(error) {
      shouldNavigateRef.current = false;
      toast.error(error.message);
    },
  });

  // Generate AI title for chat
  const generateChatTitle = async (chatId: string, content: string) => {
    try {
      const response = await fetch('/api/chat/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, content }),
      });
      
      if (response.ok) {
        const { title } = await response.json();
        updateChatTitle(chatId, title);
      }
    } catch (error) {
      console.error('Failed to generate title:', error);
    }
  };

  // Handle URL-based chat loading
  useEffect(() => {
    if (initialChatId && initialChatId !== currentChatId) {
      setCurrentChatId(initialChatId);
      setIsNewChat(false);
      shouldNavigateRef.current = false;
    } else if (!initialChatId) {
      setCurrentChatId(undefined);
      setIsNewChat(true);
      shouldNavigateRef.current = false;
      chatHook.setMessages([]);
    }
  }, [initialChatId]);

  // Create new chat function
  const createNewChat = useCallback(() => {
    chatHook.setMessages([]);
    setCurrentChatId(undefined);
    setIsNewChat(true);
    shouldNavigateRef.current = false;
    router.push('/chat');
  }, [chatHook, router]);

  const handleDynamicSubmit = useCallback((
    e: React.FormEvent<HTMLFormElement>,
    options?: {
      experimental_attachments?: Array<{
        name: string;
        contentType: string;
        url: string;
      }>;
    }
  ) => {
    e.preventDefault();
    if (chatHook.isLoading || chatHook.input.trim().length === 0) return;

    let chatIdToUse = currentChatId;

    // If this is a new chat, create ID and prepare for navigation
    if (isNewChat && !chatIdToUse) {
      chatIdToUse = nanoid();
      setCurrentChatId(chatIdToUse);
      shouldNavigateRef.current = true; // Set flag to navigate after response
      
      // Add optimistic chat to sidebar
      addOptimisticChat({
        id: chatIdToUse,
        title: chatHook.input.slice(0, 50),
        createdAt: new Date().toISOString(),
      });
    }

    // Submit with the determined chat ID
    chatHook.handleSubmit(e, options);
  }, [currentChatId, isNewChat, chatHook, addOptimisticChat]);

  return {
    ...chatHook,
    currentChatId,
    isNewChat,
    handleSubmit: handleDynamicSubmit,
    createNewChat,
  };
}