"use client"

import { Toaster } from "sonner"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import type { SessionUser } from "@/lib/roles"
import AdminSidebar from "./admin-sidebar"

type Props = { children: React.ReactNode; newMessages: number; user: SessionUser }

export default function AdminShell({ children, newMessages, user }: Props) {
  return (
    <SidebarProvider>
      <AdminSidebar newMessages={newMessages} user={user} />
      <SidebarInset className="bg-[#F2F4F8] min-w-0">{children}</SidebarInset>
      <Toaster richColors position="top-right" closeButton />
    </SidebarProvider>
  )
}
