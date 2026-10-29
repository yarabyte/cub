export const CONSENT_STORAGE_KEY = "cub_cookie_consent"

/** Dispatched on `window` whenever the visitor saves their cookie choices. */
export const CONSENT_EVENT = "cub-consent-change"

export type ConsentPreferences = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export function readConsent(): ConsentPreferences | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ConsentPreferences) : null
  } catch {
    return null
  }
}

export function saveConsent(prefs: ConsentPreferences) {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(prefs))
  window.dispatchEvent(new CustomEvent<ConsentPreferences>(CONSENT_EVENT, { detail: prefs }))
}
