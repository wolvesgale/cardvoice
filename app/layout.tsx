import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { jaJP } from '@clerk/localizations'
import './globals.css'

export const metadata: Metadata = {
  title: 'CardVoice - 撮って、話して、つながる名刺管理',
  description: 'スマホで名刺を撮影して音声でメモを追加。AIが自動で整理します。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={jaJP}>
      <html lang="ja">
        <body className="bg-neutral-950 text-white antialiased">{children}</body>
      </html>
    </ClerkProvider>
  )
}
