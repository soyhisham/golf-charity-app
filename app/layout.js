// app/layout.js
// This is the WRAPPER around every single page.
// Whatever you put here appears on every page.
// Think of it like the picture frame — every page is a painting inside it.

import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'GolfCharity — Play. Win. Give.',
  description: 'Subscribe, track your golf scores, win prizes, and support charity.',
}

export default function RootLayout({ children }) {
  // 'children' means "whatever page is currently being shown"
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}