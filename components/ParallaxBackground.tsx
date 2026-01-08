'use client'

import { useEffect, useRef, useState } from 'react'


export default function ParallaxBackground() {
  const [frames, setFrames] = useState<string[]>([])
  const [loadedIndex, setLoadedIndex] = useState(0)
  const loadedSetRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    let isMounted = true
    fetch('/api/bg-sequence')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return
        if (Array.isArray(data) && data.length) {
          const safeFrames = data.filter((item) => typeof item === 'string')
          setFrames(safeFrames)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  const frameCount = frames.length

  useEffect(() => {
    if (!frameCount) return
    let isCancelled = false
    frames.forEach((frame, index) => {
      const img = new Image()
      img.src = `/bg/${frame}`
      img.onload = () => {
        if (isCancelled) return
        loadedSetRef.current.add(index)
        if (index === 0) {
          setLoadedIndex(0)
        }
      }
      img.onerror = () => {
        if (isCancelled) return
        loadedSetRef.current.add(index)
      }
    })
    return () => {
      isCancelled = true
    }
  }, [frameCount, frames])

  useEffect(() => {
    if (!frameCount) return
    let ticking = false
    const update = () => {
      if (document.body.dataset.bgStatic === 'true') {
        if (loadedSetRef.current.has(0)) {
          setLoadedIndex(0)
        }
        return
      }
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollY = window.scrollY
        const docHeight = document.documentElement.scrollHeight
        const maxScroll = Math.max(docHeight - window.innerHeight, 0)
        const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0
        const next = Math.min(frameCount - 1, Math.floor(progress * (frameCount - 1)))
        if (loadedSetRef.current.has(next)) {
          setLoadedIndex(next)
        }
        ticking = false
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [frameCount])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
      style={{ backgroundColor: '#0a0f1f' }}
    >
      {frameCount ? (
        <img
          src={`/bg/${frames[loadedIndex]}`}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : null}
    </div>
  )
}
