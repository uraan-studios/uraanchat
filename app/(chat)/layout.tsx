import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

const ChatLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {

  return (
    <body>
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className='overflow-y-hidden'>
              {children}
            </SidebarInset>
          </SidebarProvider>
      
    </body>
  )
}

export default ChatLayout
