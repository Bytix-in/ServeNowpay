import type { Metadata } from 'next'
import { Inter, Comfortaa } from 'next/font/google'
import './globals.css'
import { ReactQueryProvider } from '@/lib/react-query'
import { Providers } from '@/components/providers/Providers'

const inter = Inter({ subsets: ['latin'] })
const comfortaa = Comfortaa({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ServeNow - Restaurant Management SaaS',
  description: 'Modern restaurant management platform built with Next.js 14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Register service worker for notifications
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
        </Providers>
      </body>
    </html>
  )
}