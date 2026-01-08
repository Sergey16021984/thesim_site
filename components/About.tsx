'use client'

import { m } from '@/components/LazyMotionProvider'
import { useInView } from 'react-intersection-observer'
import { Shield, TrendingUp, Zap, BarChart3 } from 'lucide-react'
import { useTranslations, useLocale } from '@/hooks/useTranslations'
import DemoCarousel from './DemoCarousel'
import { useState, useEffect } from 'react'
import type { MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence } from 'framer-motion'

export default function About() {
  const { t } = useTranslations()
  const locale = useLocale()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  const [isClient, setIsClient] = useState(false)
  const [isAssetsOpen, setIsAssetsOpen] = useState(false)
  const [assets, setAssets] = useState<string[]>([])
  const [assetsError, setAssetsError] = useState<string | null>(null)
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const container = document.createElement('div')
    container.dataset.assetsModalPortal = 'true'
    document.body.appendChild(container)
    setPortalContainer(container)
    return () => {
      if (container.parentElement) {
        container.parentElement.removeChild(container)
      }
    }
  }, [])

  const assetsCopy = {
    ru: {
      button: 'Посмотреть активы',
      modalTitle: 'Проверенные активы',
      loading: 'Загрузка списка...',
      empty: 'Список пока пуст.',
      close: 'Закрыть',
      loadError: 'Не удалось загрузить список активов.',
    },
    en: {
      button: 'View assets',
      modalTitle: 'Verified assets',
      loading: 'Loading list...',
      empty: 'The list is empty.',
      close: 'Close',
      loadError: 'Failed to load the assets list.',
    },
    zh: {
      button: '查看资产',
      modalTitle: '已验证资产',
      loading: '正在加载...',
      empty: '列表为空。',
      close: '关闭',
      loadError: '无法加载资产列表。',
    },
    th: {
      button: 'ดูสินทรัพย์',
      modalTitle: 'สินทรัพย์ที่ผ่านการตรวจสอบ',
      loading: 'กำลังโหลด...',
      empty: 'รายการว่างเปล่า',
      close: 'ปิด',
      loadError: 'ไม่สามารถโหลดรายการสินทรัพย์ได้',
    },
  }

  const assetText = assetsCopy[locale] || assetsCopy.en

  const loadAssets = async () => {
    setAssetsLoading(true)
    setAssetsError(null)
    try {
      const response = await fetch('/assets.json', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to load assets')
      }
      const data = await response.json()
      const list = Array.isArray(data) ? data : data?.items
      setAssets(Array.isArray(list) ? list : [])
    } catch {
      setAssetsError(assetText.loadError)
      setAssets([])
    } finally {
      setAssetsLoading(false)
    }
  }

  // Используем inView только на клиенте для избежания гидратации
  const shouldAnimate = isClient && inView

  const features = [
    {
      icon: Shield,
      title: t('about.features.market.title'),
      description: t('about.features.market.description')
    },
    {
      icon: TrendingUp,
      title: t('about.features.assets.title'),
      description: t('about.features.assets.description')
    },
    {
      icon: Zap,
      title: t('about.features.trends.title'),
      description: t('about.features.trends.description')
    },
    {
      icon: BarChart3,
      title: t('about.features.api.title'),
      description: t('about.features.api.description')
    }
  ]

  const assetsModal = (
    <AnimatePresence>
      {isAssetsOpen && (
        <m.div
          className="fixed inset-0 z-[99999] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsAssetsOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <m.div
            className="relative z-10 w-full max-w-2xl max-h-[70vh] sm:max-h-[80vh] rounded-2xl border border-white/10 bg-gradient-to-br from-[#101933] via-[#0f1a2f] to-[#0b1426] shadow-2xl overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between px-6 py-5 border-b border-white/10">
              <div>
                <h4 className="text-xl font-semibold text-white">
                  {assetText.modalTitle}
                </h4>
              </div>
            </div>
            <div className="px-6 py-5 overflow-y-auto max-h-[45vh] sm:max-h-[55vh]">
              {assetsLoading && (
                <div className="text-sm text-gray-400">
                  {assetText.loading}
                </div>
              )}
              {assetsError && (
                <div className="text-sm text-red-300">{assetsError}</div>
              )}
              {!assetsLoading && !assetsError && assets.length === 0 && (
                <div className="text-sm text-gray-400">
                  {assetText.empty}
                </div>
              )}
              {!assetsLoading && !assetsError && assets.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {assets.map((asset, assetIndex) => (
                    <div
                      key={`${asset}-${assetIndex}`}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white text-center"
                    >
                      {asset}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAssetsOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
              >
                {assetText.close}
              </button>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )

  return (
    <section id="about" className="py-20 relative overflow-hidden" suppressHydrationWarning>
      {/* Убираем градиентные фоны */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-dark-900 to-dark-800"></div> */}
      {/* <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent"></div>
      </div> */}

      <div className="container mx-auto px-4 relative z-10">
        <m.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="gradient-text">The SiM</span> — {t('about.title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            {t('about.description')}
          </p>
        </m.div>

        {/* Features Grid */}
        <m.div
          initial={{ opacity: 0, y: 50 }}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <m.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="glass rounded-2xl p-6 hover-lift group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                {index === 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAssetsOpen(true)
                      loadAssets()
                    }}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-white rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
                  >
                    {assetText.button}
                  </button>
                )}
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </m.div>
          ))}
        </m.div>

        {portalContainer ? createPortal(assetsModal, portalContainer) : assetsModal}



        {/* Screenshot Section */}
        <m.div
          initial={{ opacity: 0, y: 50 }}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
                     {/* Live Dashboard */}
           <div className="space-y-4">
             <h4 className="text-lg font-semibold text-blue-400 text-center">
               {t('about.demoTitle')}
             </h4>
             {/* Загружаем видео сразу, не зависимо от viewport */}
             <DemoCarousel />
           </div>

          {/* Content */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">
              {t('about.dashboard.title')}
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {t('about.dashboard.description')}
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                {t('about.dashboard.features.realTime')}
              </li>
              <li className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                {t('about.dashboard.features.analytics')}
              </li>
              <li className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                {t('about.dashboard.features.security')}
              </li>
            </ul>
          </div>
        </m.div>
      </div>
    </section>
  )
}
