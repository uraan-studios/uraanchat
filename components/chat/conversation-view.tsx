// app/chat/components/ConversationView.tsx
'use client';

import React from 'react';
import { type Message } from '@ai-sdk/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, RotateCcw } from 'lucide-react';
import { EmptyState } from './empty-state';
import { MessageContent } from './message-content';

const TOP_SPACER_HEIGHT = 32; // px

interface ConversationViewProps {
  messages: Message[];
  isLoading: boolean;
  retry: () => void;
  clickPrompt: (prompt: string) => void;
  bottomRef: React.RefObject<HTMLDivElement>;
}

export function ConversationView({
  messages,
  isLoading,
  retry,
  clickPrompt,
  bottomRef,
}: ConversationViewProps) {
  const userBubble =
    'bg-card rounded-xl px-4 py-2 inline-block ' +
    'max-w-[50%] min-w-[140px] ';

  const getMessageContent = (message: Message) => {
    if (message.parts) {
      return message.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join('');
    }
    return message.content;
  };

  return (
    <ScrollArea
      className="flex-1 min-h-0 w-full px-4 pb-4"
      aria-label="Conversation"
    >
      <div className="space-y-6 max-w-2xl mx-auto">
        <div style={{ height: TOP_SPACER_HEIGHT }} />

        {messages.length === 0 && !isLoading ? (
          <EmptyState onExampleClick={clickPrompt} />
        ) : (
          messages.map((m, i) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`w-full ${isUser ? 'flex justify-end' : ''}`}
              >
                {isUser ? (
                  <div className={userBubble}>{m.content}</div>
                ) : (
                  <>
                    <MessageContent message={m} />
                    <div className="mt-2 flex items-center gap-2 text-gray-500">
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(getMessageContent(m))
                        }
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Copy response"
                      >
                        <Copy size={12} />
                      </button>
                      {i === messages.length - 1 && (
                        <button
                          onClick={retry}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Retry"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="w-full">
            <div className="max-w-2xl mx-auto px-4 py-3 space-x-2 flex">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
              <div
                className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
              <div
                className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}