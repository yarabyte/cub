import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NewArticleButton() {
  return (
    <Button asChild className="bg-[#1B4FA8] font-semibold text-white hover:bg-[#1B4FA8]/90 focus-visible:ring-[#F5C200]">
      <Link href="/admin/actualites/nouveau">
        <Plus className="size-4" />
        <span className="hidden sm:inline">Nouvel article</span>
      </Link>
    </Button>
  )
}
