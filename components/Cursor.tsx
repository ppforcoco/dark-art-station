'use client'
import { useEffect, useState } from 'react'

export default function Cursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      const target = e.target as HTMLElement
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer')
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      <div 
        className="fixed top-0 left-0 w-5 h-5 border border-blood rounded-full pointer-events-none z-[9999] transition-transform duration-150 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${isPointer ? 2 : 1})` }}
      />
      <div 
        className="fixed top-0 left-0 w-1 h-1 bg-amber-500 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ left: position.x, top: position.y }}
      />
    </>
  )
}