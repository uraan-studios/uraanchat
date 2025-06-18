// app/chat/components/MessageContent.tsx
'use client';

import React from 'react';
import { type Message } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

import { markdownComponents } from './markdown-renderer';
import { ReasoningBlock, type ReasoningDetail } from './reasoning-block';

export function MessageContent({ message }: { message: Message }) {
  if (message.parts && message.parts.length > 0) {
    return (
      <div className="w-full">
        {message.parts.map((part, index) => {
          if (part.type === 'text') {
            return (
              <div key={index}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={markdownComponents}
                >
                  {part.text}
                </ReactMarkdown>
              </div>
            );
          }

          if (part.type === 'reasoning') {
            let details: ReasoningDetail[];
            if (typeof part.reasoning === 'string') {
              details = [{ type: 'text', text: part.reasoning }];
            } else if (Array.isArray(part.reasoning)) {
              details = (part.reasoning as any[]).map((detail: any) => ({
                type: detail.type,
                text: detail.text,
              }));
            } else {
              details = [{ type: 'text', text: String(part.reasoning) }];
            }
            return <ReasoningBlock key={index} details={details} />;
          }

          return null;
        })}
      </div>
    );
  }

  return (
    <div className="w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={markdownComponents}
      >
        {message.content}
      </ReactMarkdown>
    </div>
  );
}