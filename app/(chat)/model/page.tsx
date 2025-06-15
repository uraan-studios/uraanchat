'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { ConversationView } from '@/components/chat/conversation-view';
import { ChatInput, Attachment } from '@/components/chat/chat-input';
import { MODELS } from '@/lib/models';

export default function ChatPage() {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [model, setModel] = useState(MODELS[0].id);
//   const [attachments, setAttachments] = useState<Attachment[]>([{
//     "id": "1749971673745",
//     "key": "f/ac581160-3276-4ae7-95b0-6231c59b3fe4",
//     "name": "Yasin Shah Resume v2f.pdf",
//     "size": 478195,
//     "type": "application/pdf",
//     "isUploading": false
// }]);
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
    handleSubmit: originalHandleSubmit,
    isLoading,
    setMessages,
    reload,
  } = useChat({
    api: '/api/chat',
    body: { model,  },
    onFinish() {
      setTimeout(() => bottomRef.current?.scrollIntoView(), 50);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  originalHandleSubmit(e, {
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
      <div className="w-full max-w-3xl p-2 flex justify-end">
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
              value:
                'Explain quantum computing in simple terms',
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
