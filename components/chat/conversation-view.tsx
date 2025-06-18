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

// Extend the Message type to include experimental_attachments
interface ExtendedMessage extends Message {
  experimental_attachments?: Array<{
    name: string;
    contentType: string;
    url: string;
  }>;
}

// Helper component to render the user's potentially complex message
const UserMessageContent = ({ message }: { message: ExtendedMessage }) => {
  const userBubble =
    'bg-card rounded-xl px-4 py-2 inline-block max-w-[80%] min-w-[140px]';

  // Debug log to see what's in the message
  console.log('UserMessageContent - message:', message);

  // Handle the new format where `content` is an array of parts
  if (Array.isArray(message.content)) {
    return (
      <div className="flex flex-col gap-2 items-end">
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
                    fill
                    style={{ objectFit: 'cover' }}
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
                    {(part.url as string).split('/').pop()}
                  </span>
                </a>
              );
            }
            return null;
          })}
        </div>
        
        {/* Render experimental_attachments */}
        {message.experimental_attachments && message.experimental_attachments.length > 0 && (
          <div className="flex flex-col gap-1 max-w-[80%]">
            {message.experimental_attachments.map((attachment, index) => {
              const isImage = attachment.contentType?.startsWith('image/');
              const IconComponent = isImage ? ImageIcon : FileText;
              
              return (
                <a
                  key={index}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                  title={`Open ${attachment.name}`}
                >
                  <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="truncate text-gray-700 dark:text-gray-300">
                    {attachment.name}
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Fallback for simple string content - also check for experimental_attachments
  return (
    <div className="flex flex-col gap-2 items-end">
      <div className={userBubble}>{message.content}</div>
      
      {/* Render experimental_attachments for simple content too */}
      {message.experimental_attachments && message.experimental_attachments.length > 0 && (
        <div className="flex flex-col gap-1 max-w-[80%]">
          {message.experimental_attachments.map((attachment, index) => {
            const isImage = attachment.contentType?.startsWith('image/');
            const IconComponent = isImage ? ImageIcon : FileText;
            
            return (
              <a
                key={index}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                title={`Open ${attachment.name}`}
              >
                <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="truncate text-gray-700 dark:text-gray-300">
                  {attachment.name}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface ConversationViewProps {
  messages: ExtendedMessage[];
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
  // Debug log to see all messages
  console.log('ConversationView - messages:', messages);

  // Robustly get text content for the copy button
  const getMessageText = (message: ExtendedMessage) => {
    if (typeof message.content === 'string') {
      return message.content;
    }
    // For assistant messages, parts are on the root
    const parts: any[] = (message.content as any[]) || (message as any).parts || [];
    return parts
      .filter((part: any) => part.type === 'text')
      .map((part: any) => ('text' in part ? part.text : ''))
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