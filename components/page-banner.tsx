import Link from "next/link"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { RangeePerles, LoSange } from "@/components/bamileke-pattern"

type Crumb = { label: string; href?: string }

export default function PageBanner({
  icon: Icon,
  title,
  subtitle,
  crumbs,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  crumbs: Crumb[]
}) {
  return (
    <div className="relative overflow-hidden py-14" style={{ backgroundColor: "#1B4FA8" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 2L46 24L24 46L2 24Z' fill='none' stroke='white' stroke-opacity='0.08' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />
      <div className="absolute top-6 right-20 hidden lg:block opacity-15" aria-hidden="true">
        <LoSange size={90} fill="white" />
      </div>
      <div className="absolute bottom-2 left-16 hidden lg:block opacity-10" aria-hidden="true">
        <LoSange size={55} fill="#F5C200" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <nav
          className="flex flex-wrap items-center gap-2 text-xs mb-6 font-medium"
          aria-label="Fil d'ariane"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          <Link href="/" className="hover:text-white transition-colors">
            Accueil
          </Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5" />
              {c.href ? (
                <Link href={c.href} className="hover:text-white transition-colors">
                  {c.label}
                </Link>
              ) : (
                <span style={{ color: "#F5C200" }}>{c.label}</span>
              )}
            </span>
          ))}
        </nav>

        <RangeePerles count={7} color="#F5C200" size={6} gap={8} opacity={0.6} />

        <div className="mt-4 flex items-start gap-5">
          <div
            className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white text-balance leading-tight">{title}</h1>
            <p className="mt-2 text-sm text-pretty max-w-2xl" style={{ color: "rgba(255,255,255,0.7)" }}>
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex" style={{ height: 4 }} aria-hidden="true">
        <div className="flex-1" style={{ backgroundColor: "#F5C200" }} />
        <div style={{ width: "20%", backgroundColor: "white" }} />
        <div className="flex-1" style={{ backgroundColor: "#0D2F6E" }} />
      </div>
    </div>
  )
}
