// app/chat/ChatPage.tsx
'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { ConversationView } from '@/components/chat/conversation-view';
import { ChatInput, Attachment } from '@/components/chat/chat-input';

const EXAMPLE_PROMPTS = [
  'Explain quantum computing in simple terms',
  'How do I make an HTTP request in JavaScript?',
  'Write a Python function to calculate Fibonacci numbers',
  "What's the difference between React and Vue?",
];

export default function ChatPage() {
  const [attachments, setAttachments] = useState<Attachment[]>([{
    "id": "1749971673745",
    "key": "f/316dd615-b23f-43b9-bb74-575da1f6ba67",
    "name": "iphone 20.png",
    "size": 478195,
    "type": "image/png",
    "isUploading": false
}]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [body , setBody] = useState<any>([]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    setMessages,
    reload,
  } = useChat({
    api: '/api/ai/gemini-2.0-flash',
    onFinish() {
      setTimeout(() => bottomRef.current?.scrollIntoView(), 50);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Custom handleSubmit that includes attachments
  const handleSubmitWithAttachments = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading || (input.trim().length === 0 && attachments.length === 0)) {
      return;
    }

    const content: any[] = [];

    if (input.trim()) {
      content.push({ type: 'text', text: input });
    }

    attachments.forEach((att) => {
      if (!att.isUploading && att.key) {
        const url = `https://chat.localhook.online/${att.key}`;
        if (att.type.startsWith('image/')) {
          content.push({ type: 'image', url });
        } else {
          content.push({ type: 'document', url, mimeType: att.type });
        }
      }
    });

    const newMessage = {
      role: 'user',
      content,
    };

    originalHandleSubmit(e, {
      messages: [...messages, newMessage],
    });

    setAttachments([]);
  };

  const clickPrompt = (prompt: string) =>
    handleInputChange({ target: { value: prompt } } as any);

  const randomPrompt = () =>
    clickPrompt(EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)]);
  const lorem = () => clickPrompt('Generate a random piece of lorem ipsum.');
  const idea = () => clickPrompt('Give me a creative project idea.');

  const retry = useCallback(() => {
    const lastAssistantIdx = [...messages]
      .reverse()
      .findIndex((m) => m.role === 'assistant');
    if (lastAssistantIdx === -1) return;
    const realIdx = messages.length - 1 - lastAssistantIdx;
    setMessages(messages.slice(0, realIdx));
    reload();
  }, [messages, setMessages, reload]);

  return (
    <div className="h-[98dvh] flex flex-col overflow-hidden items-center">
      <ConversationView
        messages={messages}
        isLoading={isLoading}
        retry={retry}
        clickPrompt={clickPrompt}
        bottomRef={bottomRef}
      />

      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmitWithAttachments}
        isLoading={isLoading}
        randomPrompt={randomPrompt}
        lorem={lorem}
        idea={idea}
        attachments={attachments}
        setAttachments={setAttachments}
      />
    </div>
  );
}
