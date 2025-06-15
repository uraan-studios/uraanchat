// app/chat/components/EmptyState.tsx
'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Globe2,
  Code2,
  BookOpen,
} from 'lucide-react';

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
      'Summarise "Thinking, Fast and Slow" in 5 bullets',
      'How does compound interest work?',
    ],
  },
};

export function EmptyState(props: { onExampleClick: (s: string) => void }) {
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