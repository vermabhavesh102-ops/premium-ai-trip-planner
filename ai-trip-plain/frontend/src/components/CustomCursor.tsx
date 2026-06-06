import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [trailingPosition, setTrailingPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const posRef = useRef({ x: 0, y: 0 })
  const trailingRef = useRef({ x: 0, y: 0 })
  const animFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      posRef.current = { x: event.clientX, y: event.clientY }

      const target = event.target as HTMLElement
      const isInteractive =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      setIsHovering(!!isInteractive)
    }

    const animate = () => {
      setPosition({ x: posRef.current.x, y: posRef.current.y })
      
      // Smooth trailing effect for the dot
      trailingRef.current.x += (posRef.current.x - trailingRef.current.x) * 0.15
      trailingRef.current.y += (posRef.current.y - trailingRef.current.y) * 0.15
      
      setTrailingPosition({ x: trailingRef.current.x, y: trailingRef.current.y })
      animFrameRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove)
    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  return (
    <>
      <div
        className={`custom-cursor-ring ${isHovering ? 'hovering' : ''}`}
        style={{ left: position.x, top: position.y }}
      />
      <div
        className={`custom-cursor-dot ${isHovering ? 'hovering' : ''}`}
        style={{ left: trailingPosition.x, top: trailingPosition.y }}
      />
    </>
  )
}
