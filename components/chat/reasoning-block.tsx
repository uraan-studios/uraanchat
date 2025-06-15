// app/chat/components/ReasoningBlock.tsx
'use client';

import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';

export interface ReasoningDetail {
  type: 'text' | 'redacted';
  text?: string;
}

export function ReasoningBlock({ details }: { details: ReasoningDetail[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const reasoningText = details
    .map((detail) => (detail.type === 'text' ? detail.text : '<redacted>'))
    .join('');

  return (
    <div className="my-4 border border-amber-200 dark:border-amber-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 
                   hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
      >
        <Brain className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
          Reasoning Process
        </span>
        <div className="flex-1" />
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-3 bg-amber-25 dark:bg-amber-950/20 border-t border-amber-100 dark:border-amber-800">
          <pre className="text-xs text-amber-900 dark:text-amber-200 whitespace-pre-wrap font-mono leading-relaxed">
            {reasoningText}
          </pre>
        </div>
      )}
    </div>
  );
}