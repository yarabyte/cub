"use client"

/**
 * BamilekePattern — Composants décoratifs inspirés du drapeau de Bafoussam
 * Bleu royal #1B4FA8 + Or #F5C200 + Blanc
 * Motifs : bande diagonale, rangée de points/perles, losange, séparateur tricolore
 */

/** Bande tricolore horizontale (bleu | or | blanc) */
export function BandeBamileke({ className = "" }: { className?: string }) {
  return (
    <div className={`flex w-full ${className}`} aria-hidden="true" role="presentation">
      <div className="flex-1 h-full" style={{ backgroundColor: "#1B4FA8" }} />
      <div style={{ width: "18%", backgroundColor: "#F5C200" }} />
      <div style={{ width: "6%", backgroundColor: "#ffffff" }} />
    </div>
  )
}

/** Rangée de perles/points — motif emblème tissu Bamileke */
export function RangeePerles({
  count = 12,
  color = "#F5C200",
  size = 7,
  gap = 10,
  opacity = 1,
  className = "",
}: {
  count?: number
  color?: string
  size?: number
  gap?: number
  opacity?: number
  className?: string
}) {
  return (
    <div
      className={`flex items-center ${className}`}
      style={{ gap: `${gap}px`, opacity }}
      aria-hidden="true"
      role="presentation"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-full shrink-0"
          style={{ width: size, height: size, backgroundColor: color }}
        />
      ))}
    </div>
  )
}

/** Losange décoratif SVG */
export function LoSange({
  size = 20,
  fill = "#F5C200",
  stroke = "none",
  opacity = 1,
  className = "",
}: {
  size?: number
  fill?: string
  stroke?: string
  opacity?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      opacity={opacity}
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <path d="M12 1L23 12L12 23L1 12Z" />
    </svg>
  )
}

/** Séparateur section — bande with losanges */
export function SeparateurLosanges({
  bgColor = "#1B4FA8",
  diamondColor = "#F5C200",
  count = 9,
  className = "",
}: {
  bgColor?: string
  diamondColor?: string
  count?: number
  className?: string
}) {
  return (
    <div
      className={`flex items-center justify-center gap-3 py-3 ${className}`}
      style={{ backgroundColor: bgColor }}
      aria-hidden="true"
      role="presentation"
    >
      {Array.from({ length: count }).map((_, i) => (
        <LoSange key={i} size={10} fill={i % 3 === 1 ? "#ffffff" : diamondColor} />
      ))}
    </div>
  )
}

/** Bloc badge catégorie avec accent or */
export function BadgeCategorie({
  label,
  variant = "blue",
}: {
  label: string
  variant?: "blue" | "gold" | "white"
}) {
  const styles = {
    blue:  { backgroundColor: "rgba(27,79,168,0.12)", color: "#1B4FA8" },
    gold:  { backgroundColor: "rgba(245,194,0,0.18)",  color: "#7A5900" },
    white: { backgroundColor: "rgba(255,255,255,0.18)", color: "#ffffff" },
  }
  return (
    <span
      className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded"
      style={styles[variant]}
    >
      {label}
    </span>
  )
}

/** Label de section avec accent bleu */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="flex items-center gap-0.5" aria-hidden="true">
        <div className="h-4 w-1 rounded-full" style={{ backgroundColor: "#1B4FA8" }} />
        <div className="h-4 w-1 rounded-full" style={{ backgroundColor: "#F5C200" }} />
      </div>
      <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#1B4FA8" }}>
        {children}
      </p>
    </div>
  )
}
