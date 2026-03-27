import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { auth } from '@/auth'
import SessionProvider from '@/components/auth/SessionProvider'
import QueryProvider from '@/components/providers/QueryProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { ThemeProvider } from '@/contexts/ThemeContext'
import '../styles/globals.css'
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister'
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt'
import { headers } from 'next/headers'

export const viewport: Viewport = {
  themeColor: '#7C5CFC',
  width: 'device-width',
  initialScale: 1,
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  title: {
    default: 'Vora - Smart Goal & Habit Tracker',
    template: '%s | Vora',
  },
  description:
    'Achieve your goals with Vora, the intelligent habit tracker and productivity app. Track daily habits, manage tasks, visualize progress with analytics, and stay motivated with gamification.',
  keywords: [
    'habit tracker',
    'goal tracker',
    'productivity app',
    'task management',
    'daily habits',
    'progress tracking',
    'analytics',
    'gamification',
    'personal development',
  ],
  authors: [{ name: 'Vora Team' }],
  creator: 'Vora',
  publisher: 'Vora',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Vora',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: '/icons/manifest-icon-192.maskable.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icons/manifest-icon-512.maskable.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: '/icons/apple-icon-180.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Vora',
    title: 'Vora - Smart Goal & Habit Tracker',
    description:
      'Achieve your goals with Vora, the intelligent habit tracker and productivity app. Track daily habits, manage tasks, and visualize your progress.',
    images: [
      {
        url: '/icons/manifest-icon-512.maskable.png',
        width: 512,
        height: 512,
        alt: 'Vora Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Vora - Smart Goal & Habit Tracker',
    description:
      'Achieve your goals with Vora. Track daily habits, manage tasks, and visualize your progress.',
    images: ['/icons/manifest-icon-512.maskable.png'],
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
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  const nonce = (await headers()).get('x-nonce') || ''

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              try {
                var theme = localStorage.getItem('vora-theme') || 'system';
                var resolvedTheme = theme;
                if (theme === 'system') {
                  resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                document.documentElement.setAttribute('data-theme', resolvedTheme);
              } catch (e) {}
            })()
          `,
          }}
        />
      </head>
      <body className={inter.variable}>
        <SessionProvider session={session}>
          <QueryProvider>
            <ThemeProvider>
              <ToastProvider>
                {children}
                <ServiceWorkerRegister />
                <PWAInstallPrompt />
              </ToastProvider>
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
