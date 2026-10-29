import AdminPageHeader from "@/components/admin/admin-page-header"
import MessagesManager from "@/components/admin/messages/messages-manager"
import { getContactMessages } from "@/lib/contact-db"
import { isMailConfigured } from "@/lib/mailer"
import { requireUserPage } from "@/lib/admin-page-auth"

export const metadata = { title: "Messages — Administration" }
export const dynamic = "force-dynamic"

export default async function AdminMessagesPage() {
  await requireUserPage()
  const messages = await getContactMessages()
  const unread = messages.filter((m) => m.status === "new").length

  return (
    <>
      <AdminPageHeader
        title="Messages"
        subtitle={`${messages.length} message${messages.length !== 1 ? "s" : ""} · ${unread} non lu${unread !== 1 ? "s" : ""}`}
      />
      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <MessagesManager
          mailConfigured={isMailConfigured()}
          messages={messages.map((m) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            phone: m.phone,
            subject: m.subject,
            message: m.message,
            status: m.status,
            emailSent: m.email_sent_at !== null,
            emailError: m.email_error,
            createdAt: new Date(m.created_at).toISOString(),
          }))}
        />
      </div>
    </>
  )
}
