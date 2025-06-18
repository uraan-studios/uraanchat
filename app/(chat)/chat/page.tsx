// app/chat/page.tsx
'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ConversationView } from '@/components/chat/conversation-view';
import { ChatInput, Attachment } from '@/components/chat/chat-input';
import { MODELS } from '@/lib/models';
import { useDynamicChat } from '@/lib/hooks/useDynamicChat';
import { ModelSelector } from '@/components/chat/model-selector';

export default function ChatPage() {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [model, setModel] = useState(MODELS[0].id);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const selectedModel = MODELS.find((m) => m.id === model);
  const supports = selectedModel?.supports ?? [];

  useEffect(() => {
    const stored = localStorage.getItem('chat-model');
    if (stored) setModel(stored);
  }, []);

  const updateModel = (id: string) => {
    setModel(id);
    localStorage.setItem('chat-model', id);
  };

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    reload,
    currentChatId,
    createNewChat,
  } = useDynamicChat({
    model,
    onFinish: () => {
      setTimeout(() => bottomRef.current?.scrollIntoView(), 50);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmitWithAttachments = (e: React.FormEvent<HTMLFormElement>) => {
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

  const retry = useCallback(() => {
    const lastAssistantIdx = [...messages].reverse().findIndex((m) => m.role === 'assistant');
    if (lastAssistantIdx === -1) return;
    const realIdx = messages.length - 1 - lastAssistantIdx;
    setMessages(messages.slice(0, realIdx));
    reload();
  }, [messages, setMessages, reload]);

  return (
    <div className="h-[98dvh] flex flex-col overflow-hidden items-center">
      <div className="w-full max-w-3xl p-2 flex justify-between items-center">
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
              value: 'Explain quantum computing in simple terms',
            },
          } as any)
        }
        lorem={() =>
          handleInputChange({ target: { value: 'Generate a random piece of lorem ipsum.' } } as any)
        }
        idea={() =>
          handleInputChange({ target: { value: 'Give me a creative project idea.' } } as any)
        }
        attachments={attachments}
        setAttachments={setAttachments}
        allowImage={supports.includes('image')}
        allowDocument={supports.includes('document')}
      />
    </div>
  );
}