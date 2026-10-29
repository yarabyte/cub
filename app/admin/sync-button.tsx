import Link from "next/link"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function SyncButton({ variant = "default" }: { variant?: "default" | "outline" }) {
  return (
    <Button
      asChild
      variant={variant}
      className={cn(
        "font-semibold focus-visible:ring-[#F5C200]",
        variant === "default" && "bg-[#1B4FA8] text-white hover:bg-[#1B4FA8]/90"
      )}
    >
      <Link href="/admin/synchronisation">
        <RefreshCw className="size-4" />
        <span className="hidden sm:inline">Synchroniser</span>
      </Link>
    </Button>
  )
}
