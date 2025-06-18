// app/chat/[id]/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { MODELS } from "@/lib/models";
import { Attachment, ChatInput } from "@/components/chat/chat-input";
import { ConversationView } from "@/components/chat/conversation-view";
import { useDynamicChat } from "@/lib/hooks/useDynamicChat";
import { useChatStore } from "@/lib/stores/chat-store";
import { ModelSelector } from "@/components/chat/model-selector";


const ChatPage = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [model, setModel] = useState(MODELS[0].id);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { getChat, setChat } = useChatStore();
  const cachedChat = getChat(id);

  const selectedModel = MODELS.find((m) => m.id === model);
  const supports = selectedModel?.supports ?? [];

  useEffect(() => {
    const stored = localStorage.getItem("chat-model");
    if (stored) setModel(stored);
  }, []);

  const updateModel = (modelId: string) => {
    setModel(modelId);
    localStorage.setItem("chat-model", modelId);
  };

  // Fetch chat data with caching
  const { data: chat, isLoading: isFetching } = useQuery({
    queryKey: ["chat", id],
    queryFn: async () => {
      const res = await fetch(`/api/chat/${id}`);
      if (!res.ok) throw new Error('Failed to fetch chat');
      const data = await res.json();
      
      // Cache the chat data
      setChat(id, {
        id: data.id,
        title: data.title,
        messages: data.messages?.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: Array.isArray(m.content?.content)
            ? m.content.content.map((p: any) => p.text).join("\n")
            : typeof m.content?.content === "string"
            ? m.content.content
            : typeof m.content === "string"
            ? m.content
            : "",
        })) || [],
        createdAt: data.createdAt,
      });
      
      return data;
    },
    enabled: !!id && !cachedChat,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    reload,
    createNewChat,
  } = useDynamicChat({
    model,
    onFinish: () => {
      setTimeout(() => bottomRef.current?.scrollIntoView(), 50);
    },
  });

  // Use cached data immediately if available, then update with fetched data
  useEffect(() => {
    if (cachedChat && messages.length === 0) {
      setMessages(cachedChat.messages);
      setIsTransitioning(false);
    } else if (chat?.messages && !cachedChat) {
      const normalizedMessages = chat.messages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: Array.isArray(m.content?.content)
          ? m.content.content.map((p: any) => p.text).join("\n")
          : typeof m.content?.content === "string"
          ? m.content.content
          : typeof m.content === "string"
          ? m.content
          : "",
      }));
      
      if (JSON.stringify(messages) !== JSON.stringify(normalizedMessages)) {
        setMessages(normalizedMessages);
        setIsTransitioning(false);
      }
    }
  }, [chat, cachedChat, messages, setMessages]);

  // Set transitioning state when chat ID changes
  useEffect(() => {
    if (!cachedChat) {
      setIsTransitioning(true);
    }
  }, [id, cachedChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmitWithAttachments = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || input.trim().length === 0) return;

    const validAttachments = attachments
      .filter((att) => !att.isUploading && att.key)
      .map((att) => ({
        name: att.name,
        contentType: att.type,
        url: `https://chat.localhook.online/${att.key}`,
      }));

    handleSubmit(e, {
      experimental_attachments: validAttachments,
    });

    setAttachments([]);
  };

  const retry = React.useCallback(() => {
    const lastAssistantIdx = [...messages].reverse().findIndex((m) => m.role === "assistant");
    if (lastAssistantIdx === -1) return;
    const realIdx = messages.length - 1 - lastAssistantIdx;
    setMessages(messages.slice(0, realIdx));
    reload();
  }, [messages, setMessages, reload]);

  // Show smooth transition instead of loading
  if (isTransitioning && isFetching) {
    return (
      <div className="h-full flex flex-col overflow-hidden items-center animate-fadeIn">
        <div className="w-full max-w-3xl p-2 flex justify-between items-center">
          <button
            onClick={createNewChat}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            New Chat
          </button>
          <select
            value={model}
            onChange={(e) => updateModel(e.target.value)}
            className="p-2 border rounded"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="ml-2">Loading conversation...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden items-center animate-fadeIn">
      <div className="w-full max-w-3xl p-2 flex justify-between items-center">
        <button
          onClick={createNewChat}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          New Chat
        </button>
        <ModelSelector value={model} onChange={updateModel} />
      </div>


      <ConversationView
        messages={messages}
        isLoading={isLoading}
        retry={retry}
        clickPrompt={(prompt: string) =>
          handleInputChange({ target: { value: prompt } } as any)
        }
        bottomRef={bottomRef}
      />

      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmitWithAttachments}
        isLoading={isLoading}
        randomPrompt={() =>
          handleInputChange({
            target: {
              value: "Explain quantum computing in simple terms",
            },
          } as any)
        }
        lorem={() =>
          handleInputChange({
            target: { value: "Generate a random piece of lorem ipsum." },
          } as any)
        }
        idea={() =>
          handleInputChange({
            target: { value: "Give me a creative project idea." },
          } as any)
        }
        attachments={attachments}
        setAttachments={setAttachments}
        allowImage={supports.includes("image")}
        allowDocument={supports.includes("document")}
      />
    </div>
  );
};

export default ChatPage;