/* app/chat/ChatPage.tsx */
'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { ConversationView } from '@/components/chat/conversation-view';
import { ChatInput } from '@/components/chat/chat-input';

const EXAMPLE_PROMPTS = [
  'Explain quantum computing in simple terms',
  'How do I make an HTTP request in JavaScript?',
  'Write a Python function to calculate Fibonacci numbers',
  "What's the difference between React and Vue?",
];

export default function ChatPage() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    reload,
  } = useChat({
    api: '/api/ai/gemini-2.0-flash',
    streamMode: 'parts',
    onFinish() {
      setTimeout(() => bottomRef.current?.scrollIntoView(), 50);
    },
  });

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clickPrompt = (prompt: string) =>
    handleInputChange({ target: { value: prompt } } as any);

  const randomPrompt = () =>
    clickPrompt(
      EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)],
    );
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
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        randomPrompt={randomPrompt}
        lorem={lorem}
        idea={idea}
      />
    </div>
  );
}