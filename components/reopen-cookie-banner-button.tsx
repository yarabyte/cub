"use client"

import { CONSENT_STORAGE_KEY } from "@/lib/consent"

export default function ReopenCookieBannerButton() {
  return (
    <button
      type="button"
      className="w-full text-xs font-black py-2.5 rounded-lg transition-all hover:opacity-90"
      style={{ backgroundColor: "#1B4FA8", color: "white" }}
      onClick={() => {
        localStorage.removeItem(CONSENT_STORAGE_KEY)
        window.location.reload()
      }}
    >
      Rouvrir le panneau cookies
    </button>
  )
}
