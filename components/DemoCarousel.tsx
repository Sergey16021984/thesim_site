'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SyntheticEvent, PointerEvent } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { createPortal } from 'react-dom'

const AUTO_INTERVAL = 3000
const SWIPE_THRESHOLD = 40

type Orientation = 'wide' | 'tall'

const imageStyle = (orientation: Orientation, fit: 'cover' | 'contain') => {
  if (fit === 'contain') {
    return {
      objectFit: 'contain' as const,
      width: '100%',
      height: '100%',
    }
  }
  const base = { objectFit: 'cover' as const }
  if (orientation === 'wide') {
    return {
      ...base,
      height: '100%',
      width: 'auto' as const,
      minWidth: '100%',
    }
  }
  return {
    ...base,
    width: '100%',
    height: 'auto' as const,
    minHeight: '100%',
  }
}

const wrapIndex = (index: number, length: number) => (index + length) % length

const createOrientationHandler = (
  name: string | null,
  orientations: React.MutableRefObject<Record<string, Orientation>>,
  setter: (value: Orientation) => void
) => (event: SyntheticEvent<HTMLImageElement>) => {
  if (!name) return
  const img = event.currentTarget
  const orientation: Orientation = img.naturalWidth >= img.naturalHeight ? 'wide' : 'tall'
  orientations.current[name] = orientation
  setter(orientation)
}

export default function DemoCarousel() {
  const { t } = useTranslations()
  const [images, setImages] = useState<string[]>([])
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [modalIndex, setModalIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentOrientation, setCurrentOrientation] = useState<Orientation>('wide')
  const [modalOrientation, setModalOrientation] = useState<Orientation>('wide')
  const [isNarrowScreen, setIsNarrowScreen] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const pointerStartX = useRef<number | null>(null)
  const orientations = useRef<Record<string, Orientation>>({})

  useEffect(() => {
    const container = document.createElement('div')
    container.dataset.demoCarouselPortal = 'true'
    document.body.appendChild(container)
    setPortalContainer(container)
    return () => {
      if (container.parentElement) {
        container.parentElement.removeChild(container)
      }
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)')
    const update = () => setIsNarrowScreen(media.matches)
    update()
    if (media.addEventListener) {
      media.addEventListener('change', update)
    } else {
      media.addListener(update)
    }
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', update)
      } else {
        media.removeListener(update)
      }
    }
  }, [])

  const loadImages = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/images')
      if (!res.ok) throw new Error('failed to load images')
      const data = (await res.json()) as unknown
      if (Array.isArray(data)) {
        const names = data.filter((name) => typeof name === 'string')
        setImages(names)
        if (names.length) {
          setCurrentIndex(0)
        }
      } else {
        setError('Нет доступных изображений')
      }
    } catch {
      setError('Не удалось загрузить изображения')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadImages()
  }, [loadImages])

  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (!images.length) {
      return
    }
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
      setModalIndex((prev) => (prev === null ? null : (prev + 1) % images.length))
    }, AUTO_INTERVAL)
  }, [images.length])

  useEffect(() => {
    if (modalIndex !== null) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }
    startTimer()
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [startTimer, modalIndex])

  const changeSliderIndex = useCallback(
    (direction: number) => {
      if (!images.length) return
      setCurrentIndex((prev) => wrapIndex(prev + direction, images.length))
      setModalIndex((prev) => {
        if (prev === null) return null
        return wrapIndex(prev + direction, images.length)
      })
      startTimer()
    },
    [images.length, startTimer]
  )

  const handlePrev = useCallback(() => {
    changeSliderIndex(-1)
  }, [changeSliderIndex])

  const handleNext = useCallback(() => {
    changeSliderIndex(1)
  }, [changeSliderIndex])

  const changeModalIndex = useCallback(
    (direction: number) => {
      if (!images.length) return
      setModalIndex((prev) => {
        if (prev === null) return null
        const next = wrapIndex(prev + direction, images.length)
        setCurrentIndex(next)
        return next
      })
    },
    [images.length]
  )

  const openModal = (index: number) => {
    setCurrentIndex(index)
    setModalIndex(index)
  }
  const closeModal = () => setModalIndex(null)
  const modalImage = modalIndex !== null ? images[modalIndex] : null
  const currentImage = useMemo(() => images[currentIndex], [currentIndex, images])
  const hasImages = images.length > 0

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = event.clientX
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null) return
    const delta = event.clientX - pointerStartX.current
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      if (delta > 0) {
        handlePrev()
      } else {
        handleNext()
      }
    }
    pointerStartX.current = null
  }

  useEffect(() => {
    if (!currentImage) {
      setCurrentOrientation('wide')
      return
    }
    const known = orientations.current[currentImage]
    if (known) {
      setCurrentOrientation(known)
    } else {
      setCurrentOrientation('wide')
    }
  }, [currentImage])

  useEffect(() => {
    if (!modalImage) {
      setModalOrientation('wide')
      return
    }
    const known = orientations.current[modalImage]
    if (known) {
      setModalOrientation(known)
    } else {
      setModalOrientation('wide')
    }
  }, [modalImage])

  const modalContent = modalImage ? (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4" onClick={closeModal}>
      <div
        className="relative w-[95vw] h-[90vh] max-w-none bg-black rounded-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={(event) => {
            event.stopPropagation()
            closeModal()
          }}
          className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 border border-white/20"
          aria-label="Закрыть"
        >
          <X size={20} />
        </button>
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={`/images/${modalImage}`}
            alt="Полноэкранный скриншот"
            className="max-h-full max-w-full object-contain"
            onLoad={createOrientationHandler(modalImage, orientations, setModalOrientation)}
            style={imageStyle(modalOrientation, isNarrowScreen ? 'contain' : 'cover')}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
          <button
            onClick={(event) => {
              event.stopPropagation()
              changeModalIndex(-1)
            }}
            className="pointer-events-auto text-white bg-black/40 rounded-full p-2 hover:bg-black/60"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation()
              changeModalIndex(1)
            }}
            className="pointer-events-auto text-white bg-black/40 rounded-full p-2 hover:bg-black/60"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  ) : null

  const renderedModal =
    modalContent && portalContainer ? createPortal(modalContent, portalContainer) : modalContent

  return (
    <>
      <div className="space-y-4" suppressHydrationWarning>
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700/30 bg-gray-900"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            pointerStartX.current = null
          }}
        >
          <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-gray-900 to-gray-800">
            {!hasImages && !isLoading && (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                {error || t('video.noImages', 'Нет доступных изображений')}
              </div>
            )}
            {isLoading && (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Загружаем изображения...
              </div>
            )}
            {hasImages && currentImage && (
              <img
                src={`/images/${currentImage}`}
                alt="Скриншот платформы"
                className="w-full h-full bg-black/40 cursor-pointer"
                loading="lazy"
                onClick={() => openModal(currentIndex)}
                onLoad={createOrientationHandler(currentImage, orientations, setCurrentOrientation)}
                style={imageStyle(currentOrientation, isNarrowScreen ? 'contain' : 'cover')}
              />
            )}
            {hasImages && (
              <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    handlePrev()
                  }}
                  aria-label="Предыдущее изображение"
                  className="pointer-events-auto bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    handleNext()
                  }}
                  aria-label="Следующее изображение"
                  className="pointer-events-auto bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
            {hasImages && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
                {images.map((name, idx) => (
                  <span
                    key={`${name}-${idx}`}
                    className={`h-1.5 w-7 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {renderedModal}
    </>
  )
}
