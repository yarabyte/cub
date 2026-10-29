"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ExternalLink, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { WhatsAppPanel } from "@/components/whatsapp-widget"
import {
  WHATSAPP_QUESTION_COUNT,
  WHATSAPP_QUESTION_MAX,
  isValidPhone,
  whatsappLink,
  whatsappSchema,
  type WhatsappSettings,
} from "@/lib/whatsapp-schema"
import { cn } from "@/lib/utils"

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-[#1B4FA8]/12 bg-white p-5 shadow-sm", className)}>
      <h2 className="mb-4 text-sm font-semibold text-[#0D1A2E]">{title}</h2>
      {children}
    </section>
  )
}

export default function WhatsappSettingsForm({ initialValues }: { initialValues: WhatsappSettings }) {
  const form = useForm<WhatsappSettings>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: initialValues,
  })
  const [phone, questions, enabled] = form.watch(["phone", "questions", "enabled"])
  const { isSubmitting, isDirty } = form.formState

  async function onSubmit(values: WhatsappSettings) {
    const res = await fetch("/api/admin/whatsapp", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).catch(() => null)
    const data = res ? await res.json().catch(() => ({})) : {}

    if (!res || !res.ok) {
      const message = data.error ?? "Enregistrement impossible"
      if (data.field) form.setError(data.field as keyof WhatsappSettings, { message })
      toast.error(message)
      return
    }

    form.reset(data)
    toast.success("Réglages WhatsApp enregistrés", {
      description: data.enabled ? "Le bouton est visible sur la page d'accueil." : "Le bouton est masqué sur le site.",
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]" noValidate>
        <div className="min-w-0 space-y-6">
          <Panel title="Affichage et destinataire">
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-3 rounded-lg border border-[#25D366]/40 bg-[#25D366]/8 px-3 py-2.5">
                    <div>
                      <FormLabel>Afficher le bouton WhatsApp sur l&apos;accueil</FormLabel>
                      <FormDescription className="text-xs">
                        Bouton flottant en bas à droite de la page d&apos;accueil.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro destinataire</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} inputMode="tel" placeholder="+237 6 90 00 00 00" className="max-w-xs" />
                      </FormControl>
                      {isValidPhone(phone) ? (
                        <Button variant="outline" asChild>
                          <a href={whatsappLink(phone)} target="_blank" rel="noopener noreferrer">
                            <ExternalLink />
                            Tester
                          </a>
                        </Button>
                      ) : (
                        <Button type="button" variant="outline" disabled>
                          <ExternalLink />
                          Tester
                        </Button>
                      )}
                    </div>
                    <FormDescription>
                      Numéro WhatsApp qui recevra les messages, au format international avec l&apos;indicatif du pays
                      (237 pour le Cameroun).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Panel>

          <Panel title="Questions proposées aux visiteurs">
            <div className="space-y-4">
              {Array.from({ length: WHATSAPP_QUESTION_COUNT }, (_, i) => (
                <FormField
                  key={i}
                  control={form.control}
                  name={`questions.${i}`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Question {i + 1}</FormLabel>
                        <span className="text-xs text-muted-foreground">
                          {field.value.length}/{WHATSAPP_QUESTION_MAX}
                        </span>
                      </div>
                      <FormControl>
                        <Input {...field} maxLength={WHATSAPP_QUESTION_MAX} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <p className="text-xs text-muted-foreground">
                Le visiteur dispose aussi d&apos;un bouton « Autre question » pour écrire librement.
              </p>
            </div>
          </Panel>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !isDirty} className="bg-[#1B4FA8] hover:bg-[#0D2F6E]">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
              Enregistrer
            </Button>
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0D1A2E]">Aperçu</h2>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                enabled ? "bg-[#25D366]/15 text-[#128C4B]" : "bg-slate-100 text-slate-500"
              )}
            >
              {enabled ? "Visible sur l'accueil" : "Masqué"}
            </span>
          </div>
          <WhatsAppPanel phone={phone} questions={questions} className="w-full" />
        </aside>
      </form>
    </Form>
  )
}
