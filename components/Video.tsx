'use client'



import { useState, useRef, useEffect, useCallback } from 'react'

import { useTranslations } from '@/hooks/useTranslations'

import { Play, Pause, Volume2, VolumeX, Square } from 'lucide-react'



type VideoQuality = '480p' | '720p' | '1080p'



const getNavigatorConnection = () => {

  if (typeof navigator === 'undefined') {

    return undefined

  }

  const nav = navigator as unknown as { connection?: any; mozConnection?: any; webkitConnection?: any }

  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection

}



const determineInitialQuality = (connection?: { downlink?: number; effectiveType?: string }): VideoQuality => {

  if (!connection) {

    return '480p'

  }

  const downlink = connection.downlink ?? 0

  const effectiveType = (connection.effectiveType ?? '').toLowerCase()



  if (downlink >= 5 || (effectiveType === '4g' && downlink >= 2.5)) {

    return '1080p'

  }

  if (downlink >= 2 || effectiveType === '4g' || effectiveType === '3g') {

    return '720p'

  }



  return '480p'

}



export default function Video() {

  const { t } = useTranslations()

  const [showVideo, setShowVideo] = useState(false)

  const [isPlaying, setIsPlaying] = useState(false)

  const [isMuted, setIsMuted] = useState(false)

  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('480p')

  const [isPreviewPlaying, setIsPreviewPlaying] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)

  const previewVideoRef = useRef<HTMLVideoElement>(null)



  const qualityTimeoutRef = useRef<NodeJS.Timeout | null>(null)



  const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'ru' : 'ru'

  const supportedLocales = ['ru', 'en', 'th', 'ch']

  const resolvedLocale = supportedLocales.includes(locale) ? locale : 'ru'

  const videoPrefix = `${resolvedLocale}_sim-overview`



  const videoPaths: Record<VideoQuality, string> = {

    '480p': `/videos/${resolvedLocale}/${videoPrefix}-480p.mp4`,

    '720p': `/videos/${resolvedLocale}/${videoPrefix}-720p.mp4`,

    '1080p': `/videos/${resolvedLocale}/${videoPrefix}-1080p.mp4`

  }



  const handlePlayPause = () => {

    const video = videoRef.current

    if (!video) return

    if (isPlaying) {

      video.pause()

    } else {

      video.play()

    }

  }



  const handleMute = () => {

    if (!videoRef.current) return

    videoRef.current.muted = !isMuted

    setIsMuted(!isMuted)

  }



  const handlePreviewPlayPause = () => {

    if (!previewVideoRef.current) return

    if (isPreviewPlaying) {

      previewVideoRef.current.pause()

      setIsPreviewPlaying(false)

    } else {

      previewVideoRef.current.play()

      setIsPreviewPlaying(true)

    }

  }



  const handlePreviewStop = () => {

    if (!previewVideoRef.current) return

    previewVideoRef.current.pause()

    previewVideoRef.current.currentTime = 0

    setIsPreviewPlaying(false)

  }



  const handleQualityChange = useCallback((quality: VideoQuality) => {

    setSelectedQuality(quality)

    if (videoRef.current) {

      videoRef.current.src = videoPaths[quality]

      videoRef.current.load()

    }

  }, [videoPaths])



  useEffect(() => {

    if (!showVideo) return

    const connection = getNavigatorConnection()

    const scheduleUpgrade = () => {

      const desired = determineInitialQuality(connection)

      if (desired === '480p' || selectedQuality !== '480p') {

        return

      }

      if (qualityTimeoutRef.current) {

        clearTimeout(qualityTimeoutRef.current)

        qualityTimeoutRef.current = null

      }

      qualityTimeoutRef.current = setTimeout(() => {

        handleQualityChange(desired)

        qualityTimeoutRef.current = null

      }, 1500)

    }

    scheduleUpgrade()

    connection?.addEventListener?.('change', scheduleUpgrade)

    return () => {

      connection?.removeEventListener?.('change', scheduleUpgrade)

      if (qualityTimeoutRef.current) {

        clearTimeout(qualityTimeoutRef.current)

        qualityTimeoutRef.current = null

      }

    }

  }, [handleQualityChange, selectedQuality, showVideo])



  useEffect(() => {

    const video = videoRef.current

    if (!video) return

    const handlePlay = () => setIsPlaying(true)

    const handlePause = () => setIsPlaying(false)

    const handleLoadedData = () => {

      video.muted = false

      setIsMuted(false)

      video.play().catch(() => {})

    }

    video.addEventListener('play', handlePlay)

    video.addEventListener('pause', handlePause)

    video.addEventListener('loadeddata', handleLoadedData)

    return () => {

      video.removeEventListener('play', handlePlay)

      video.removeEventListener('pause', handlePause)

      video.removeEventListener('loadeddata', handleLoadedData)

    }

  }, [selectedQuality])



  useEffect(() => {

    const previewVideo = previewVideoRef.current

    if (!previewVideo) return

    const handlePreviewPlay = () => setIsPreviewPlaying(true)

    const handlePreviewPause = () => setIsPreviewPlaying(false)

    previewVideo.addEventListener('play', handlePreviewPlay)

    previewVideo.addEventListener('pause', handlePreviewPause)

    return () => {

      previewVideo.removeEventListener('play', handlePreviewPlay)

      previewVideo.removeEventListener('pause', handlePreviewPause)

    }

  }, [])



  if (showVideo) {

    return (

      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 md:p-4">

        <div className="relative w-full max-w-6xl">

          <button

            onClick={() => setShowVideo(false)}

            className="absolute -top-8 md:-top-12 right-0 text-white hover:text-gray-300 transition-colors text-sm md:text-base"

          >

             {t('video.close', 'Закрыть')}

          </button>

          <div className="relative bg-black rounded-lg overflow-hidden">

            <video

              ref={videoRef}

              className="w-full h-auto"

              controls

              autoPlay

              muted={isMuted}

              playsInline

              onPlay={() => setIsPlaying(true)}

              onPause={() => setIsPlaying(false)}

            >

              <source src={videoPaths[selectedQuality]} type="video/mp4" />

            </video>

            <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 flex items-center justify-between">

              <div className="flex items-center gap-1 md:gap-2">

                <button onClick={handlePlayPause} className="text-white hover:text-gray-300 transition-colors p-1">

                  {isPlaying ? <Pause size={20} className="md:w-6 md:h-6" /> : <Play size={20} className="md:w-6 md:h-6" />}

                </button>

                <button onClick={handleMute} className="text-white hover:text-gray-300 transition-colors p-1">

                  {isMuted ? <VolumeX size={20} className="md:w-6 md:h-6" /> : <Volume2 size={20} className="md:w-6 md:h-6" />}

                </button>

              </div>

              <div className="flex items-center gap-1 md:gap-2">

                <select

                  value={selectedQuality}

                  onChange={(e) => handleQualityChange(e.target.value as VideoQuality)}

                  className="bg-gray-800 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm"

                >

                  <option value="480p">480p</option>

                  <option value="720p">720p</option>

                  <option value="1080p">1080p</option>

                </select>

              </div>

            </div>

          </div>

        </div>

      </div>

    )

  }



  return (

    <section className="py-12 md:py-20 px-4" suppressHydrationWarning>

      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-8 md:mb-16">

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">

            {t('video.title', 'Видеообзор')} <span className="brand-gradient">The SiM</span>

          </h2>

          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">

            {t('video.subtitle', 'Посмотрите, как наша платформа помогает инвесторам управлять цифровыми активами')}

          </p>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">

          <div className="relative">

            <div className="video-preview-container relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700/30">

              <div

                className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative group cursor-pointer overflow-hidden"

                onClick={() => setShowVideo(true)}

              >

                <div className="w-full h-full bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20 relative">

                  <video

                    ref={previewVideoRef}

                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"

                    autoPlay

                    muted={true}

                    loop

                    playsInline

                    preload="auto"

                    poster="/og-image.png"

                    onLoadedMetadata={() => {

                      if (previewVideoRef.current) {

                        previewVideoRef.current.muted = true

                        previewVideoRef.current.play().catch(() => {})

                      }

                    }}

                    onError={() => {}}

                  >

                    <source src={videoPaths[selectedQuality]} type="video/mp4" />

                  </video>

                  <div className="absolute inset-0 flex items-center justify-center">

                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">

                      <Play className="w-8 h-8 text-white ml-1" />

                    </div>

                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">

                    <div className="flex items-center gap-2">

                      <button

                        onClick={(e) => {

                          e.stopPropagation()

                          handlePreviewPlayPause()

                        }}

                        className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"

                      >

                        {isPreviewPlaying ? <Pause size={20} /> : <Play size={20} />}

                      </button>

                      <button

                        onClick={(e) => {

                          e.stopPropagation()

                          handlePreviewStop()

                        }}

                        className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"

                      >

                        <Square size={20} />

                      </button>

                    </div>

                  </div>

                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">

                    <span className="text-white text-sm font-medium">{selectedQuality}</span>

                  </div>

                </div>

              </div>

            </div>

          </div>

          <div className="space-y-6 md:space-y-8 px-4 md:px-0">

            <div className="space-y-3 md:space-y-4">

              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">

                {t('video.contentTitle', 'Полный обзор платформы')}

              </h3>

              <p className="text-base md:text-lg text-gray-300 leading-relaxed">

                {t('video.contentDescription', 'Узнайте, как наша платформа помогает инвесторам управлять цифровыми активами с максимальной эффективностью и безопасностью.')}

              </p>

            </div>

            <div className="space-y-3 md:space-y-4">

              <h4 className="text-lg md:text-xl font-semibold text-white">{t('video.whatYouWillSee', 'Что вы увидите:')}</h4>

              <ul className="space-y-2 md:space-y-3 text-gray-300">

                <li className="flex items-center gap-3">

                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>

                  <span className="text-sm md:text-base">{t('video.feature1', 'Интерфейс личного кабинета')}</span>

                </li>

                <li className="flex items-center gap-3">

                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>

                  <span className="text-sm md:text-base">{t('video.feature2', 'Процесс инвестирования')}</span>

                </li>

                <li className="flex items-center gap-3">

                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>

                  <span className="text-sm md:text-base">{t('video.feature3', 'Аналитические инструменты')}</span>

                </li>

                <li className="flex items-center gap-3">

                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>

                  <span className="text-sm md:text-base">{t('video.feature4', 'Система безопасности')}</span>

                </li>

              </ul>

            </div>

            <button

              onClick={() => setShowVideo(true)}

              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 text-sm md:text-base"

            >

              <Play className="w-4 h-4 md:w-5 md:h-5" />

              {t('video.watchButton', 'Смотреть видео')}

            </button>

          </div>

        </div>

      </div>

    </section>

  )

}

