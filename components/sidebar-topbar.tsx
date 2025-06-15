import React from 'react'
import { SidebarTrigger, useSidebar } from './ui/sidebar'
import { Button } from './ui/button'
import { Plus, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SidebarTopbar = () => {
  const { state } = useSidebar()

  return (
    <div className="bg-sidebar rounded-md fixed top-2 left-2 z-10 flex items-center gap-1 px-1 h-9">
      <SidebarTrigger />

      <AnimatePresence initial={false}>
        {state === 'collapsed' && (
          <>
            <motion.div
              layout
              key="plus"
              initial={{ x: -20, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -20, opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.08,
                delay: 0,
                type: 'spring',
                stiffness: 600,
                damping: 45,
              }}
            >
              <Button size="icon" variant="ghost" className="size-7">
                <Plus />
                <span className="sr-only">New Chat</span>
              </Button>
            </motion.div>

            <motion.div
              layout
              key="search"
              initial={{ x: -20, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -20, opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.08,
                delay: 0.015,
                type: 'spring',
                stiffness: 600,
                damping: 45,
              }}
            >
              <Button size="icon" variant="ghost" className="size-7">
                <Search />
                <span className="sr-only">Search</span>
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SidebarTopbar
