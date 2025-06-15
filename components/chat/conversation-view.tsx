// app/chat/components/ConversationView.tsx
'use client';

import React from 'react';
import { type Message } from '@ai-sdk/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, RotateCcw, FileText, Image as ImageIcon } from 'lucide-react';
import { EmptyState } from './empty-state';
import { MessageContent } from './message-content';
import Image from 'next/image';

const TOP_SPACER_HEIGHT = 32; // px

// Helper component to render the user's potentially complex message
const UserMessageContent = ({ message }: { message: Message }) => {
  const userBubble =
    'bg-card rounded-xl px-4 py-2 inline-block max-w-[80%] min-w-[140px]';

  // Handle the new format where `content` is an array of parts
  if (Array.isArray(message.content)) {
    return (
      <div className={`${userBubble} flex flex-col gap-2`}>
        {message.content.map((part, index) => {
          if (part.type === 'text') {
            return <p key={index}>{part.text}</p>;
          }
          if (part.type === 'image' && 'url' in part) {
            return (
              <div key={index} className="relative w-48 h-48">
                <Image
                  src={part.url as string}
                  alt="User attachment"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
            );
          }
          if (part.type === 'document' && 'url' in part) {
            return (
              <a
                key={index}
                href={part.url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <FileText className="w-5 h-5" />
                <span className="truncate">
                  {/* Extract filename from URL */}
                  {(part.url as string).split('/').pop()}
                </span>
              </a>
            );
          }
          return null;
        })}
      </div>
    );
  }

  // Fallback for simple string content
  return <div className={userBubble}>{message.content}</div>;
};

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
  // Robustly get text content for the copy button
  const getMessageText = (message: Message) => {
    if (typeof message.content === 'string') {
      return message.content;
    }
    // For assistant messages, parts are on the root
    const parts = message.content || message.parts || [];
    return parts
      .filter((part) => part.type === 'text')
      .map((part) => ('text' in part ? part.text : ''))
      .join('');
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
                  <UserMessageContent message={m} />
                ) : (
                  <div>
                    <MessageContent message={m} />
                    <div className="mt-2 flex items-center gap-2 text-gray-500">
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(getMessageText(m))
                        }
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Copy response"
                      >
                        <Copy size={12} />
                      </button>
                      {i === messages.length - 1 && !isLoading && (
                        <button
                          onClick={retry}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Retry"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
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