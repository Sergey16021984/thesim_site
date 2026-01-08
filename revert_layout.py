import sys
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')
path = Path('app/layout.tsx')
path.write_text("""import type { Metadata } from 'next'
import './globals.css'
import ErrorSuppressor from '@/components/ErrorSuppressor'

export const metadata: Metadata = {
  title: 'TheSim - Управление цифровыми активами',
  description: 'TheSim - ведущая платформа управления цифровыми активами. Защита капитала, диверсификация портфеля, инвестиции в криптовалюту.',
  keywords: 'управление цифровыми активами, инвестиции в криптовалюту, диверсификация портфеля, защита капитала',
  authors: [{ name: 'TheSim Team' }],
  creator: 'TheSim',
  publisher: 'TheSim',
  openGraph: {
    title: 'TheSim - Управление цифровыми активами | Инвестиции в криптовалюту',
    description: 'Ведущая платформа управления цифровыми активами. Защита капитала, диверсификация портфеля.',
    url: 'https://thesim.io',
    siteName: 'TheSim',
    locale: 'ru_RU',
    type: 'website',
    images: [
      {
        url: 'https://thesim.io/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TheSim - Digital Asset Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TheSim - Управление цифровыми активами | Инвестиции в криптовалюту',
    description: 'Ведущая платформа управления цифровыми активами. Защита капитала, диверсификация портфеля.',
    images: ['https://thesim.io/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  metadataBase: new URL('https://thesim.io'),
  alternates: {
    canonical: 'https://thesim.io',
    languages: {
      'ru': 'https://thesim.io/ru',
      'en': 'https://thesim.io/en',
      'zh': 'https://thesim.io/zh',
      'th': 'https://thesim.io/th',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="/clean-styles.css" />
        <script src="/suppress-errors.js" defer></script>
      </head>
      <body suppressHydrationWarning={true}>
        <ErrorSuppressor />
        {children}
      </body>
    </html>
  )
}
""", encoding='utf-8')
print('root layout reverted')
