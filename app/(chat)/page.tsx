/* app/chat/ChatPage.tsx */
'use client';

import React, {
  useRef,
  useEffect,
  KeyboardEvent,
  useCallback,
  useState,
} from 'react';
import { useChat, type Message } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  Check,
  Copy,
  RotateCcw,
  Sparkles,
  Dice3,
  Lightbulb,
  Globe2,
  Code2,
  BookOpen,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

/* ─────────────────────────  CONSTANTS  ───────────────────────── */

const EXAMPLE_PROMPTS = [
  'Explain quantum computing in simple terms',
  'How do I make an HTTP request in JavaScript?',
  'Write a Python function to calculate Fibonacci numbers',
  "What's the difference between React and Vue?",
];

type TabKey = 'CREATE' | 'EXPLORE' | 'CODE' | 'LEARN';

const TABS: Record<
  TabKey,
  { label: string; icon: React.ReactNode; examples: string[] }
> = {
  CREATE: {
    label: 'Create',
    icon: <Sparkles className="w-4 h-4" />,
    examples: [
      'Write a short story about a robot discovering emotions',
      'Help me outline a sci-fi novel set in a post-apocalyptic world',
      'Create a character profile for a complex villain with sympathetic motives',
      'Give me 5 creative writing prompts for flash fiction',
    ],
  },
  EXPLORE: {
    label: 'Explore',
    icon: <Globe2 className="w-4 h-4" />,
    examples: [
      'Plan a 3-day trip to Kyoto on a budget',
      'Explain how black holes are detected',
      'Compare the cultures of Spain and Portugal',
      'Why does the aurora occur only near the poles?',
    ],
  },
  CODE: {
    label: 'Code',
    icon: <Code2 className="w-4 h-4" />,
    examples: [
      'How do I make an HTTP request in JavaScript?',
      'Write a Python function to calculate Fibonacci numbers',
      'Show me an example of optimistic UI updates in React',
      'Explain the difference between Docker and Kubernetes',
    ],
  },
  LEARN: {
    label: 'Learn',
    icon: <BookOpen className="w-4 h-4" />,
    examples: [
      'Teach me the basics of linear regression',
      'What are the key events of the French Revolution?',
      'Summarise “Thinking, Fast and Slow” in 5 bullets',
      'How does compound interest work?',
    ],
  },
};

const TOP_SPACER_HEIGHT = 32; // px

/* ────────────────────────  MARKDOWN HELPERS  ─────────────────── */

function CodeBlock(
  props: React.ComponentProps<'code'> & { inline?: boolean },
) {
  const { className, children, ...rest } = props;

  // ------------------------------------------------------------
  // Multi-line if we have a language-xxx class  ➜ syntax highlight
  // ------------------------------------------------------------
  const isBlock = !!className?.startsWith('language-');
  if (!isBlock) {
    return (
      <code
        {...rest}
        className="px-1 py-0.5 rounded bg-card text-[0.92em]
                   whitespace-pre break-words"
      >
        {children}
      </code>
    );
  }

  /* ------------  real block code path (unchanged) ------------ */
  const [copied, setCopied] = React.useState(false);
  const codeRef = React.useRef<HTMLElement | null>(null);

  const copy = async () => {
    if (!codeRef.current) return;
    await navigator.clipboard.writeText(codeRef.current.innerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lang = className.match(/language-(\w+)/)?.[1]?.toUpperCase() ?? 'TEXT';

  return (
    <div className="relative group my-6 first:mt-0 last:mb-0">
      <div
        className="text-xs bg-gray-700 text-gray-100 px-2 py-1 rounded-t-lg
                   flex items-center justify-between"
      >
        <span>{lang}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 opacity-60 hover:opacity-100
                     transition"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <pre
        className={`${className} rounded-b-lg p-4 bg-gray-800
                    dark:bg-gray-900 overflow-x-auto`}
      >
        <code ref={codeRef} {...rest}>
          {children}
        </code>
      </pre>
    </div>
  );
}

const markdownComponents = {
  code: CodeBlock,
  li: (props: React.ComponentProps<'li'>) => (
    <li {...props} className="marker:text-primary" />
  ),
  ol: (props: React.ComponentProps<'ol'>) => (
    <ol {...props} className="list-decimal pl-6 marker:text-primary" />
  ),
  ul: (props: React.ComponentProps<'ul'>) => (
    <ul {...props} className="list-disc pl-6 marker:text-primary" />
  ),
  a: (props: React.ComponentProps<'a'>) => (
    <a
      {...props}
      className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
      target="_blank"
      rel="noreferrer"
    />
  ),
};

/* ────────────────────────  EMPTY STATE  ─────────────────────── */

function EmptyState(props: { onExampleClick: (s: string) => void }) {
  const [tab, setTab] = useState<TabKey>('CREATE');

  return (
    <div className="pt-24 text-center select-none">
      <h1 className="text-3xl font-semibold mb-8">
        How can I help you<span className="lowercase">?</span>
      </h1>

      <div className="inline-flex gap-2 mb-8">
        {(Object.keys(TABS) as TabKey[]).map((key) => {
          const active = key === tab;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`
                px-4 py-1.5 rounded-full flex items-center gap-1.5 text-sm
                transition
                ${
                  active
                    ? 'bg-primary text-white'
                    : 'bg-muted hover:bg-muted/70 dark:bg-gray-800'
                }
              `}
            >
              {TABS[key].icon}
              {TABS[key].label}
            </button>
          );
        })}
      </div>

      <div className="mx-auto max-w-md space-y-4">
        {TABS[tab].examples.map((ex) => (
          <button
            key={ex}
            onClick={() => props.onExampleClick(ex)}
            className="w-full text-left px-4 py-2 rounded bg-muted/40
              hover:bg-muted/60 dark:bg-gray-800 transition"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────  MAIN VIEW  ───────────────────────── */

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
    onFinish() {
      setTimeout(() => bottomRef.current?.scrollIntoView(), 50);
    },
  });

  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    textRef.current?.focus();
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) handleSubmit(e as any);
    }
  };

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

  const autoGrow = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget;
    const lineHeight = 20;
    const max = 15 * lineHeight;

    t.style.height = 'auto';
    t.style.height = Math.min(t.scrollHeight, max) + 'px';
  };

  const userBubble =
    'bg-blue-500 text-white rounded-xl px-4 py-2 inline-block ' +
    'max-w-[50%] min-w-[140px] text-[15px]';

  return (
    <div className="h-full flex flex-col overflow-hidden items-center">
      <ScrollArea
        className="flex-1 min-h-0 w-full px-4 pb-4"
        aria-label="Conversation"
      >
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* top spacer that scrolls away */}
          <div style={{ height: TOP_SPACER_HEIGHT }} />

          {messages.length === 0 ? (
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
                    <div className="w-full">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={markdownComponents}
                      >
                        {m.content}
                      </ReactMarkdown>

                      <div
                        className="mt-2 flex items-center gap-2 text-[10px]
                          text-gray-500"
                      >
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(m.content)
                          }
                          className="p-1 rounded hover:bg-gray-200
                            dark:hover:bg-gray-700"
                          title="Copy response"
                        >
                          <Copy size={12} />
                        </button>
                        {i === messages.length - 1 && (
                          <button
                            onClick={retry}
                            className="p-1 rounded hover:bg-gray-200
                              dark:hover:bg-gray-700"
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

          {isLoading && (
            <div className="w-full">
              <div
                className="max-w-2xl mx-auto px-4 py-3 space-x-2 flex"
              >
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

      <div className="w-full bg-gray-50 dark:bg-gray-900/40 py-3">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto w-full px-4">
          <div
            className="bg-white dark:bg-gray-800 border dark:border-gray-700
              rounded-xl shadow flex flex-col-reverse"
          >
            <div
              className="flex items-center justify-between
                border-t dark:border-gray-700 px-3 py-2"
            >
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={randomPrompt}
                  title="Random example prompt"
                >
                  <Dice3 className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={lorem}
                  title="Add lorem ipsum"
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={idea}
                  title="Creative idea"
                >
                  <Lightbulb className="w-4 h-4" />
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-full w-10 h-10 p-0 shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>

            <textarea
              ref={textRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={onKeyDown}
              onInput={autoGrow}
              placeholder="Type your message…"
              rows={1}
              className="w-full resize-none bg-transparent p-4
                focus:outline-none rounded-t-xl max-h-[300px]"
              disabled={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
}