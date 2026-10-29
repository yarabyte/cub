"use client"

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Calendar,
  CalendarDays,
  ArrowRight,
  ChevronDown,
  ImageOff,
  Newspaper,
  RotateCcw,
  SlidersHorizontal,
  Tag,
  type LucideIcon,
} from "lucide-react"
import CategoryBadge from "@/components/category-badge"

export type FilterCategory = { id: number; slug: string; name: string; color: string }

export type ArticleCard = {
  id: number
  slug: string
  image: string | null
  title: string
  excerpt?: string
  date: string
  year: number | null
  categories: FilterCategory[]
}

type Props = {
  articles: ArticleCard[]
  categories: FilterCategory[]
  initialCategory?: string | null
  initialYear?: string | null
}

const PAGE_SIZE = 9

function setUrlParam(name: string, value: string | null) {
  const url = new URL(window.location.href)
  if (value) url.searchParams.set(name, value)
  else url.searchParams.delete(name)
  window.history.replaceState(null, "", url)
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  dot,
}: {
  active: boolean
  onClick: () => void
  label: ReactNode
  count: number
  dot?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-9 items-center gap-2 rounded-full border pl-3.5 pr-2 text-sm font-semibold transition-all ${
        active
          ? "border-[#1B4FA8] bg-[#1B4FA8] text-white shadow-md shadow-[#1B4FA8]/20"
          : `border-slate-200 bg-slate-50 text-slate-700 hover:border-[#1B4FA8]/40 hover:bg-white hover:text-[#1B4FA8] ${
              count === 0 ? "opacity-50" : ""
            }`
      }`}
    >
      {dot && (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: dot, boxShadow: active ? "0 0 0 2px rgba(255,255,255,0.7)" : undefined }}
          aria-hidden="true"
        />
      )}
      {label}
      <span
        className={`min-w-6 rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums ${
          active ? "bg-white/20 text-white" : "bg-[#1B4FA8]/10 text-[#1B4FA8]"
        }`}
      >
        {count}
      </span>
    </button>
  )
}

function FilterGroup({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="min-w-0">
      <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        <Icon className="h-3.5 w-3.5 text-[#F5C200]" aria-hidden="true" />
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

export default function ActualitesFilters({ articles, categories, initialCategory = null, initialYear = null }: Props) {
  const years = useMemo(
    () => [...new Set(articles.map((a) => a.year).filter((y): y is number => y !== null))].sort((a, b) => b - a),
    [articles]
  )
  const [selected, setSelected] = useState<string | null>(
    initialCategory && categories.some((c) => c.slug === initialCategory) ? initialCategory : null
  )
  const [year, setYear] = useState<number | null>(() => {
    const y = Number(initialYear)
    return years.includes(y) ? y : null
  })
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const inCategory = useMemo(
    () => (selected ? articles.filter((a) => a.categories.some((c) => c.slug === selected)) : articles),
    [articles, selected]
  )
  const inYear = useMemo(
    () => (year === null ? articles : articles.filter((a) => a.year === year)),
    [articles, year]
  )
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const a of inYear) for (const c of a.categories) counts.set(c.slug, (counts.get(c.slug) ?? 0) + 1)
    return counts
  }, [inYear])
  const yearCounts = useMemo(() => {
    const counts = new Map<number, number>()
    for (const a of inCategory) if (a.year !== null) counts.set(a.year, (counts.get(a.year) ?? 0) + 1)
    return counts
  }, [inCategory])
  const filteredArticles = useMemo(
    () => (year === null ? inCategory : inCategory.filter((a) => a.year === year)),
    [inCategory, year]
  )
  const visibleArticles = filteredArticles.slice(0, visibleCount)
  const remaining = filteredArticles.length - visibleArticles.length

  function select(slug: string | null) {
    setSelected(slug)
    setVisibleCount(PAGE_SIZE)
    setUrlParam("categorie", slug)
  }

  function selectYear(y: number | null) {
    setYear(y)
    setVisibleCount(PAGE_SIZE)
    setUrlParam("annee", y === null ? null : String(y))
  }

  function resetFilters() {
    select(null)
    selectYear(null)
  }

  const selectedName = categories.find((c) => c.slug === selected)?.name
  const activeLabel = [selectedName, year].filter(Boolean).join(" · ")
  const hasFilters = selected !== null || year !== null
  const showCategories = categories.length > 1
  const showYears = years.length > 1

  if (articles.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border bg-white" style={{ borderColor: "rgba(27,79,168,0.12)" }}>
        <Newspaper className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(27,79,168,0.35)" }} />
        <p className="text-sm font-medium" style={{ color: "#64748b" }}>
          Aucune actualité publiée pour le moment.
        </p>
      </div>
    )
  }

  return (
    <>
      <section
        aria-label="Filtrer les actualités"
        className="mb-8 overflow-hidden rounded-2xl border bg-white shadow-sm"
        style={{ borderColor: "rgba(27,79,168,0.12)" }}
      >
        <div className="flex h-1" aria-hidden="true">
          <div className="flex-1 bg-[#1B4FA8]" />
          <div className="w-16 bg-[#F5C200]" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B4FA8]/10 text-[#1B4FA8]">
              <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
            </div>
            <div aria-live="polite">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Filtrer les actualités</p>
              <p className="text-sm text-slate-500">
                <span className="text-lg font-black text-[#0D1A2E] tabular-nums">{filteredArticles.length}</span>{" "}
                article{filteredArticles.length !== 1 ? "s" : ""}
                {activeLabel && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-[#F5C200]/20 px-2 py-0.5 text-xs font-semibold text-[#7a5d00]">
                    {activeLabel}
                  </span>
                )}
              </p>
            </div>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:border-[#1B4FA8]/40 hover:text-[#1B4FA8]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Réinitialiser
            </button>
          )}
        </div>

        {(showCategories || showYears) && (
          <div
            className={`grid gap-6 px-5 py-5 ${
              showCategories && showYears ? "lg:grid-cols-[minmax(0,1fr)_auto] lg:divide-x lg:divide-slate-100" : ""
            }`}
          >
            {showCategories && (
              <FilterGroup icon={Tag} label="Catégorie">
                <FilterChip active={selected === null} onClick={() => select(null)} label="Toutes" count={inYear.length} />
                {categories.map((cat) => (
                  <FilterChip
                    key={cat.slug}
                    active={selected === cat.slug}
                    onClick={() => select(cat.slug)}
                    label={cat.name}
                    count={categoryCounts.get(cat.slug) ?? 0}
                    dot={cat.color}
                  />
                ))}
              </FilterGroup>
            )}
            {showYears && (
              <div className={showCategories ? "lg:pl-6" : ""}>
                <FilterGroup icon={CalendarDays} label="Année">
                  <FilterChip active={year === null} onClick={() => selectYear(null)} label="Toutes" count={inCategory.length} />
                  {years.map((y) => (
                    <FilterChip
                      key={y}
                      active={year === y}
                      onClick={() => selectYear(y)}
                      label={y}
                      count={yearCounts.get(y) ?? 0}
                    />
                  ))}
                </FilterGroup>
              </div>
            )}
          </div>
        )}
      </section>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleArticles.map((article) => (
          <li key={article.id}>
            <Link
              href={`/actualites/${article.slug}`}
              className="group block bg-white rounded-2xl border overflow-hidden h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              style={{ borderColor: "rgba(27,79,168,0.12)" }}
            >
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                {article.image ? (
                  <Image
                    src={article.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <ImageOff className="absolute inset-0 m-auto w-8 h-8 text-slate-300" />
                )}
                <div className="absolute bottom-0 left-0 right-0 flex h-1.5" aria-hidden="true">
                  <div className="flex-1" style={{ backgroundColor: "#1B4FA8" }} />
                  <div style={{ width: 20, backgroundColor: "#F5C200" }} />
                </div>
              </div>
              <div className="p-5">
                {article.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {article.categories.map((c) => (
                      <CategoryBadge key={c.id} category={c} />
                    ))}
                  </div>
                )}
                <h2 className="mt-3 font-bold text-base leading-snug text-balance line-clamp-2 transition-colors group-hover:text-[#1B4FA8]" style={{ color: "#0D1A2E" }}>
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="mt-2 text-sm line-clamp-2" style={{ color: "#64748b" }}>
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: "#94a3b8" }}>
                  <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: "#F5C200" }} />
                  {article.date}
                </div>
                <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold transition-all group-hover:gap-2" style={{ color: "#1B4FA8" }}>
                  Lire l'article
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {remaining > 0 && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: "#1B4FA8", color: "white" }}
          >
            Afficher plus d'articles
            <ChevronDown className="w-4 h-4" />
          </button>
          <p className="text-xs" style={{ color: "#64748b" }}>
            {visibleArticles.length} sur {filteredArticles.length} affichés
          </p>
        </div>
      )}

      {filteredArticles.length === 0 && (
        <div className="text-center py-12 rounded-2xl border bg-white" style={{ borderColor: "rgba(27,79,168,0.12)" }}>
          <p className="text-sm font-medium" style={{ color: "#64748b" }}>
            {year !== null ? "Aucun article pour ces filtres." : "Aucun article dans cette catégorie."}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 text-sm font-bold px-4 py-2 rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: "#1B4FA8", color: "white" }}
          >
            Voir tous les articles
          </button>
        </div>
      )}
    </>
  )
}
