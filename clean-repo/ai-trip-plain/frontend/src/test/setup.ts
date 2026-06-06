import '@testing-library/jest-dom'
import React from 'react'
import { vi } from 'vitest'

vi.mock('framer-motion', () => {
  const passthrough = ({ children, ...props }: any) => React.createElement('div', props, children)
  const motion = new Proxy({}, { get: () => passthrough })
  return {
    motion,
    AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
  }
})
