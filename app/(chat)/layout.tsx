// components/layout/chat-layout.tsx
'use client';

import React from 'react';

import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ApiKeyProvider } from '@/components/apikeyprovider';
import { RedirectToSignIn, SignedIn } from '@daveyplate/better-auth-ui';

interface ChatLayoutProps {
  children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const router = useRouter();

  const handleNewChat = () => {
    router.push('/chat');
  };

  return (
    <>
    <RedirectToSignIn />
    <SignedIn>

    <body className="flex h-screen">
        <ApiKeyProvider>
      <SidebarProvider>

        <AppSidebar onNewChat={handleNewChat} />
        <SidebarInset className="flex-1 overflow-hidden">
          {children}
        </SidebarInset>
      </SidebarProvider>
        </ApiKeyProvider>
    </body>
    </SignedIn>
    </>
  );
}

export default ChatLayout;