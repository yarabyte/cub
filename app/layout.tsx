import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import CookieBanner from '@/components/cookie-banner'
import JsonLd from '@/components/json-ld'
import GoogleAnalytics from '@/components/google-analytics'
import { organizationSchema, websiteSchema } from '@/lib/structured-data'
import { RSS_ALTERNATE, SITE, SITE_URL } from '@/lib/site'
import './globals.css'

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
})

const verification: Metadata['verification'] = {
  google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  other: process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : undefined,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} — Portail officiel de la Communauté Urbaine de Bafoussam`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.portalName,
  keywords: ['Bafoussam', 'CUB', 'Communauté Urbaine de Bafoussam', 'mairie de Bafoussam', 'portail municipal', 'état civil', 'acte de naissance', 'Cameroun', 'Mifi', 'Région de l\'Ouest'],
  authors: [{ name: SITE.organization, url: SITE_URL }],
  creator: SITE.organization,
  publisher: SITE.organization,
  icons: {
    icon: SITE.logo,
    apple: SITE.logo,
  },
  alternates: { types: RSS_ALTERNATE },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: SITE.locale,
    title: `${SITE.name} — Portail officiel`,
    description: SITE.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — Portail officiel`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  verification,
  formatDetection: { telephone: false },
  category: 'government',
}

export const viewport: Viewport = {
  themeColor: SITE.colors.primary,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={jakartaSans.variable}>
      <body className="font-sans antialiased">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        {children}
        <CookieBanner />
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_ID} />}
      </body>
    </html>
  )
}
