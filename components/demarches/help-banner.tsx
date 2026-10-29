import Link from "next/link"
import { RangeePerles } from "@/components/bamileke-pattern"

export default function HelpBanner({ stacked = false }: { stacked?: boolean }) {
  return (
    <div
      className={`rounded-xl p-6 flex flex-col items-start gap-5 relative overflow-hidden ${stacked ? "" : "sm:flex-row sm:items-center"}`}
      style={{ backgroundColor: "#1B4FA8" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='2' fill='white' fill-opacity='0.08'/%3E%3C/svg%3E")`,
          backgroundSize: "20px 20px",
        }}
        aria-hidden="true"
      />
      <div className="relative flex-1">
        <div className="flex items-center gap-1 mb-2" aria-hidden="true">
          <RangeePerles count={5} color="#F5C200" size={5} gap={6} opacity={0.8} />
        </div>
        <p className="font-black text-sm text-white">Besoin d'aide pour vos démarches ?</p>
        <p className="text-xs mt-1 text-white/70">
          Nos agents vous accompagnent du lundi au vendredi de 7h30 à 15h30.
        </p>
      </div>
      <Link
        href="/contact"
        className="relative shrink-0 text-sm font-bold px-5 py-2.5 rounded-lg transition-all hover:opacity-90"
        style={{ backgroundColor: "#F5C200", color: "#0D1A2E" }}
      >
        Contacter la mairie
      </Link>
    </div>
  )
}
