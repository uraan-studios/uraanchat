'use client'

import { useEffect, useRef } from 'react'
import { animate, stagger } from 'motion'
import { splitText } from 'motion-plus'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

export default function AnimatedMessage({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.fonts.ready.then(() => {
      if (!ref.current) return
      ref.current.style.visibility = 'visible'

      const elements = ref.current.querySelectorAll('p, li, h1, h2, h3')
      elements.forEach((el) => {
        const { words } = splitText(el)
        animate(
          words,
          { opacity: [0, 1], y: [6, 0] },
          {
            type: 'spring',
            duration: 1.2,
            delay: stagger(0.035),
            bounce: 0.1,
          }
        )
      })
    })
  }, [])

  return (
    <div ref={ref} style={{ visibility: 'hidden' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
