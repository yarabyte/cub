"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { usePathname } from "next/navigation"
import { CONSENT_EVENT, readConsent, type ConsentPreferences } from "@/lib/consent"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/** Loads GA4 only once the visitor has accepted analytics cookies, and never in the admin area. */
export default function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    setAllowed(Boolean(readConsent()?.analytics))
    const onChange = (e: Event) => {
      const granted = Boolean((e as CustomEvent<ConsentPreferences>).detail?.analytics)
      setAllowed(granted)
      window.gtag?.("consent", "update", { analytics_storage: granted ? "granted" : "denied" })
    }
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  if (!allowed || pathname?.startsWith("/admin")) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
gtag('js', new Date());
gtag('config', ${JSON.stringify(measurementId)}, { page_location: location.origin + location.pathname + location.search });`}
      </Script>
    </>
  )
}
