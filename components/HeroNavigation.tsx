'use client'

import LanguageSwitcher from '@/components/LanguageSwitcher'

interface HeroNavigationProps {
  currentLocale: string
}

export default function HeroNavigation({ currentLocale }: HeroNavigationProps) {
  return (
    <div className="flex items-center gap-2" suppressHydrationWarning>
      <LanguageSwitcher currentLocale={currentLocale} />
    </div>
  )
}
