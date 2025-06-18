// components/layout/chat-layout.tsx
'use client';

import React from 'react';

import { useRouter } from 'next/navigation';
import ChatSidebar from '@/components/app-sidebar';

interface ChatLayoutProps {
  children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const router = useRouter();

  const handleNewChat = () => {
    router.push('/chat');
  };

  return (
    <div className="flex h-screen">
      <ChatSidebar onNewChat={handleNewChat} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

export default ChatLayout;