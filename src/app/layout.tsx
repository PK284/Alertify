import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Alertify — Smart Price & Stock Alerts',
  description: 'Set up instant alerts for price drops and stock availability across Amazon, Flipkart, Amul, Myntra and more. Never miss a deal again.',
  keywords: 'price alert, stock alert, price tracker, Amazon price drop, Flipkart alert',
  openGraph: {
    title: 'Alertify — Smart Price & Stock Alerts',
    description: 'Get notified instantly when prices drop or products come back in stock.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
