import { cn } from "@/lib/utils"

export type CategoryBadgeData = { name: string; color: string }

/** Category label tinted with the category color (stored as `#RRGGBB`). */
export default function CategoryBadge({
  category,
  className,
  onDark,
}: {
  category: CategoryBadgeData
  className?: string
  /** Solid background, for use over images */
  onDark?: boolean
}) {
  const color = /^#[0-9a-fA-F]{6}$/.test(category.color) ? category.color : "#1B4FA8"
  return (
    <span
      className={cn(
        "inline-block rounded px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest",
        className
      )}
      style={onDark ? { backgroundColor: color, color: "white" } : { backgroundColor: `${color}1F`, color }}
    >
      {category.name}
    </span>
  )
}
