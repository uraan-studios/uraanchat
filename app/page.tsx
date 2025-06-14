'use client';

import { useChat } from '@ai-sdk/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const EXAMPLE_PROMPTS = [
  "Explain quantum computing in simple terms",
  "How do I make an HTTP request in JavaScript?",
  "Write a Python function to calculate Fibonacci numbers",
  "What's the difference between React and Vue?"
];

export default function ChatPage() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    api: '/api/ai/gemini-2.0-flash',
    initialMessages: [],
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b dark:border-gray-700 p-4">
        <h1 className="text-xl font-bold text-center">AI Assistant</h1>
      </header>

      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full -mt-16">
            <div className="text-center max-w-2xl space-y-6">
              <h2 className="text-3xl font-bold">How can I help you today?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXAMPLE_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleInputChange({ target: { value: prompt } } as any)}
                    className="p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : ''}`}>
                {m.role !== 'user' && (
                  <Avatar className="flex-shrink-0">
                    <AvatarImage src="/ai-avatar.png" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[calc(100%-64px)] rounded-lg px-4 py-3 ${m.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-bl-none'}`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        return !inline ? (
                          <pre className={`${className} rounded-lg p-4 bg-gray-800 dark:bg-gray-900 my-2 overflow-x-auto`}>
                            <code {...props}>{children}</code>
                          </pre>
                        ) : (
                          <code className={`${className} px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700`} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
                {m.role === 'user' && (
                  <Avatar className="flex-shrink-0">
                    <AvatarImage src="/user-avatar.png" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <Avatar className="flex-shrink-0">
                  <AvatarImage src="/ai-avatar.png" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg rounded-bl-none px-4 py-3 max-w-[calc(100%-64px)]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="border-t dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 rounded-full px-4 py-5"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="rounded-full w-12 h-12 p-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
          AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}