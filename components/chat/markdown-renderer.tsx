// app/chat/components/MarkdownRenderer.tsx
'use client';

import React from 'react';
import { Check, Copy } from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

function getTextContent(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(getTextContent).join('');
  if (React.isValidElement(node) && typeof node === 'object' && node !== null && 'props' in node) {
    const props = (node as { props?: unknown }).props;
    if (props && typeof props === 'object' && 'children' in props) {
      return getTextContent((props as { children?: React.ReactNode }).children);
    }
  }
  return '';
}

export function CodeBlock(
  props: React.ComponentProps<'code'> & { inline?: boolean },
) {
  const { className, children, inline, ...rest } = props;
  const rawText = getTextContent(children);

  const isProbablyBlock = () => {
    if (className?.startsWith('language-')) return true;
    const lineBreaks = rawText.includes('\n');
    const wordCount = rawText.trim().split(/\s+/).length;
    const charCount = rawText.trim().length;
    return lineBreaks || wordCount > 2 || charCount > 80;
  };

  const isBlock = inline !== undefined ? !inline : isProbablyBlock();

  if (!isBlock) {
    return (
      <code
        {...rest}
        className="px-1 py-0.5 rounded bg-card whitespace-pre break-words"
      >
        {children}
      </code>
    );
  }

  const [copied, setCopied] = React.useState(false);
  const codeRef = React.useRef<HTMLElement | null>(null);

  const copy = async () => {
    if (!codeRef.current) return;
    await navigator.clipboard.writeText(codeRef.current.innerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lang = className?.match(/language-(\w+)/)?.[1]?.toUpperCase() ?? 'TEXT';

  return (
    <div className="relative group mb-8 mt-4">
      <div className="text-xs bg-card px-2 py-1 rounded-t-lg flex items-center justify-between">
        <span>{lang}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 opacity-60 hover:opacity-100 transition"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <ScrollArea>

      <pre
        className={`${className} rounded-b-lg p-4 bg-gray-800 dark:bg-gray-900`}
        >
        <code ref={codeRef} {...rest}>
          {children}
        </code>
      </pre>
        <ScrollBar orientation='horizontal' />
        </ScrollArea>
    </div>
  );
}

export const markdownComponents = {
  p: (props: React.ComponentProps<'p'>) => (
    <p {...props} className="my-4 first:mt-0 last:mb-0" />
  ),
  h1: (props: React.ComponentProps<'h1'>) => (
    <h1 {...props} className="text-3xl font-bold my-6 first:mt-0" />
  ),
  h2: (props: React.ComponentProps<'h2'>) => (
    <h2
      {...props}
      className="text-2xl font-semibold my-5 pb-2 border-b first:mt-0"
    />
  ),
  h3: (props: React.ComponentProps<'h3'>) => (
    <h3 {...props} className="text-xl font-semibold my-4 first:mt-0" />
  ),
  blockquote: (props: React.ComponentProps<'blockquote'>) => (
    <blockquote
      {...props}
      className="my-4 pl-4 border-l-4 italic first:mt-0 last:mb-0"
    />
  ),
  hr: (props: React.ComponentProps<'hr'>) => (
    <hr {...props} className="my-6" />
  ),
  code: CodeBlock,
  li: (props: React.ComponentProps<'li'>) => (
    <li {...props} className="marker:text-primary" />
  ),
  ol: (props: React.ComponentProps<'ol'>) => (
    <ol
      {...props}
      className="list-decimal pl-6 my-4 marker:text-primary first:mt-0 last:mb-0"
    />
  ),
  ul: (props: React.ComponentProps<'ul'>) => (
    <ul
      {...props}
      className="list-disc pl-6 my-4 marker:text-primary first:mt-0 last:mb-0"
    />
  ),
  a: (props: React.ComponentProps<'a'>) => (
    <a
      {...props}
      className="text-primary underline hover:text-accent"
      target="_blank"
      rel="noreferrer"
    />
  ),
};