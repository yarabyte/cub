"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  ExternalLink,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Newspaper,
  Quote,
  RefreshCw,
  Tags,
  UserRound,
  Users,
} from "lucide-react"
import { isAdmin, ROLE_LABELS, type SessionUser } from "@/lib/roles"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const NAV_ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, match: (p: string) => p === "/admin" },
  {
    href: "/admin/actualites",
    label: "Actualités",
    icon: Newspaper,
    match: (p: string) => p.startsWith("/admin/actualites"),
  },
  {
    href: "/admin/categories",
    label: "Catégories",
    icon: Tags,
    match: (p: string) => p.startsWith("/admin/categories"),
  },
  {
    href: "/admin/agenda",
    label: "Agenda",
    icon: CalendarDays,
    match: (p: string) => p.startsWith("/admin/agenda"),
  },
  {
    href: "/admin/mot-du-maire",
    label: "Mot du maire",
    icon: Quote,
    match: (p: string) => p.startsWith("/admin/mot-du-maire"),
  },
  {
    href: "/admin/mediatheque",
    label: "Médiathèque",
    icon: Images,
    match: (p: string) => p.startsWith("/admin/mediatheque"),
  },
  {
    href: "/admin/messages",
    label: "Messages",
    icon: Inbox,
    match: (p: string) => p.startsWith("/admin/messages"),
  },
  {
    href: "/admin/whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    match: (p: string) => p.startsWith("/admin/whatsapp"),
  },
  {
    href: "/admin/synchronisation",
    label: "Synchronisation",
    icon: RefreshCw,
    match: (p: string) => p.startsWith("/admin/synchronisation"),
    adminOnly: true,
  },
  {
    href: "/admin/utilisateurs",
    label: "Utilisateurs",
    icon: Users,
    match: (p: string) => p.startsWith("/admin/utilisateurs"),
    adminOnly: true,
  },
]

// The mobile sidebar is portaled outside the provider, so the theme variables
// must live on an element rendered inside the Sidebar itself.
const SIDEBAR_THEME = {
  "--sidebar": "#0D2F6E",
  "--sidebar-foreground": "rgba(255,255,255,0.82)",
  "--sidebar-accent": "rgba(255,255,255,0.10)",
  "--sidebar-accent-foreground": "#FFFFFF",
  "--sidebar-border": "rgba(255,255,255,0.12)",
  "--sidebar-ring": "#F5C200",
} as React.CSSProperties

export default function AdminSidebar({ newMessages, user }: { newMessages: number; user: SessionUser }) {
  const pathname = usePathname()
  const items = NAV_ITEMS.filter((item) => !("adminOnly" in item) || isAdmin(user.role))
  const accountActive = pathname.startsWith("/admin/compte")

  return (
    <Sidebar collapsible="icon">
      <div style={SIDEBAR_THEME} className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
        <SidebarHeader className="py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="hover:bg-transparent active:bg-transparent">
                <Link href="/admin">
                  <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-[#F5C200]/60">
                    <Image src="/images/logo-cub.png" alt="" width={28} height={28} className="size-7 object-contain" />
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-bold text-white">CUB Admin</span>
                    <span className="truncate text-[11px] text-white/60">Communauté Urbaine de Bafoussam</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-white/45 uppercase tracking-wider text-[10px]">
              Gestion
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const active = item.match(pathname)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                        className="data-[active=true]:shadow-[inset_3px_0_0_#F5C200]"
                      >
                        <Link href={item.href}>
                          <item.icon className={active ? "text-[#F5C200]" : undefined} />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.href === "/admin/messages" && newMessages > 0 && (
                        <SidebarMenuBadge className="bg-[#F5C200] text-[#0D1A2E] peer-hover/menu-button:text-[#0D1A2E] peer-data-[active=true]/menu-button:text-[#0D1A2E]">
                          {newMessages}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="pb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                isActive={accountActive}
                tooltip="Mon compte"
                className="data-[active=true]:shadow-[inset_3px_0_0_#F5C200]"
              >
                <Link href="/admin/compte">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <UserRound className={accountActive ? "size-4 text-[#F5C200]" : "size-4"} />
                  </div>
                  <div className="grid min-w-0 flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-semibold text-white">{user.name || user.email}</span>
                    <span className="flex items-center gap-1.5 truncate text-[11px] text-white/60">
                      <span
                        className={
                          isAdmin(user.role)
                            ? "rounded bg-[#F5C200] px-1.5 py-px text-[10px] font-bold text-[#0D1A2E]"
                            : "rounded bg-white/15 px-1.5 py-px text-[10px] font-bold text-white"
                        }
                      >
                        {ROLE_LABELS[user.role]}
                      </span>
                      Mon compte
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Voir le site">
                <a href="/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink />
                  <span>Voir le site</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Déconnexion"
                className="hover:bg-red-500/15 hover:text-red-200"
              >
                <Link
                  href={`/admin/deconnexion?from=${encodeURIComponent(pathname)}`}
                  prefetch={false}
                >
                  <LogOut />
                  <span>Déconnexion</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </div>
      <SidebarRail />
    </Sidebar>
  )
}
