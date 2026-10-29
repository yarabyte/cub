type JsonLdProps = { data: Record<string, unknown> | Record<string, unknown>[] }

/** Renders schema.org data; several nodes are grouped in a single `@graph`. */
export default function JsonLd({ data }: JsonLdProps) {
  const payload = Array.isArray(data) ? { "@context": "https://schema.org", "@graph": data } : { "@context": "https://schema.org", ...data }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, "\\u003c") }}
    />
  )
}
