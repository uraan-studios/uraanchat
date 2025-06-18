// components/layout/chat-layout.tsx
'use client';

import React from 'react';

import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

interface ChatLayoutProps {
  children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const router = useRouter();

  const handleNewChat = () => {
    router.push('/chat');
  };

  return (
    
    <body className="flex h-screen">
      <SidebarProvider>
      <AppSidebar onNewChat={handleNewChat} />
      <SidebarInset className="flex-1 overflow-hidden">
        {children}
      </SidebarInset>
    </SidebarProvider>
    </body>
  );
}

export default ChatLayout;