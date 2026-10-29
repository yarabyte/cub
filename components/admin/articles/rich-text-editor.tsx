"use client"

import { useEffect } from "react"
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  invalid?: boolean
}

export function RichTextEditor({ value, onChange, placeholder = "Rédigez l’article…", invalid }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "article-content min-h-[320px] px-4 py-3 text-[15px] leading-relaxed text-slate-700 outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  })

  useEffect(() => {
    if (editor && !editor.isFocused && value !== editor.getHTML() && !(value === "" && editor.isEmpty)) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [editor, value])

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-white shadow-xs focus-within:border-[#1B4FA8] focus-within:ring-[3px] focus-within:ring-[#1B4FA8]/15",
        invalid && "border-red-500"
      )}
    >
      <Toolbar editor={editor} />
      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div className="min-h-[320px] animate-pulse bg-slate-50" aria-hidden="true" />
      )}
    </div>
  )
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            underline: editor.isActive("underline"),
            h2: editor.isActive("heading", { level: 2 }),
            h3: editor.isActive("heading", { level: 3 }),
            bulletList: editor.isActive("bulletList"),
            orderedList: editor.isActive("orderedList"),
            blockquote: editor.isActive("blockquote"),
            link: editor.isActive("link"),
            canUndo: editor.can().undo(),
            canRedo: editor.can().redo(),
          }
        : null,
  })

  const chain = () => editor!.chain().focus()

  function editLink() {
    if (!editor) return
    const previous = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Adresse du lien (https://…)", previous ?? "https://")
    if (url === null) return
    if (url.trim() === "" || url.trim() === "https://") {
      chain().extendMarkRange("link").unsetLink().run()
      return
    }
    chain().extendMarkRange("link").setLink({ href: url.trim() }).run()
  }

  const disabled = !editor || !state

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-slate-50/80 px-1.5 py-1">
      <Btn label="Gras" active={state?.bold} disabled={disabled} onClick={() => chain().toggleBold().run()}>
        <Bold />
      </Btn>
      <Btn label="Italique" active={state?.italic} disabled={disabled} onClick={() => chain().toggleItalic().run()}>
        <Italic />
      </Btn>
      <Btn
        label="Souligné"
        active={state?.underline}
        disabled={disabled}
        onClick={() => chain().toggleUnderline().run()}
      >
        <Underline />
      </Btn>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Btn
        label="Titre 2"
        active={state?.h2}
        disabled={disabled}
        onClick={() => chain().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 />
      </Btn>
      <Btn
        label="Titre 3"
        active={state?.h3}
        disabled={disabled}
        onClick={() => chain().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 />
      </Btn>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Btn
        label="Liste à puces"
        active={state?.bulletList}
        disabled={disabled}
        onClick={() => chain().toggleBulletList().run()}
      >
        <List />
      </Btn>
      <Btn
        label="Liste numérotée"
        active={state?.orderedList}
        disabled={disabled}
        onClick={() => chain().toggleOrderedList().run()}
      >
        <ListOrdered />
      </Btn>
      <Btn
        label="Citation"
        active={state?.blockquote}
        disabled={disabled}
        onClick={() => chain().toggleBlockquote().run()}
      >
        <Quote />
      </Btn>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Btn label="Lien" active={state?.link} disabled={disabled} onClick={editLink}>
        <Link2 />
      </Btn>
      <Btn
        label="Retirer le lien"
        disabled={disabled || !state?.link}
        onClick={() => chain().extendMarkRange("link").unsetLink().run()}
      >
        <Link2Off />
      </Btn>
      <div className="ml-auto flex items-center gap-0.5">
        <Btn label="Annuler" disabled={disabled || !state?.canUndo} onClick={() => chain().undo().run()}>
          <Undo2 />
        </Btn>
        <Btn label="Rétablir" disabled={disabled || !state?.canRedo} onClick={() => chain().redo().run()}>
          <Redo2 />
        </Btn>
      </div>
    </div>
  )
}

function Btn({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Toggle
      size="sm"
      pressed={Boolean(active)}
      onPressedChange={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="text-slate-600 data-[state=on]:bg-[#1B4FA8]/10 data-[state=on]:text-[#1B4FA8]"
    >
      {children}
    </Toggle>
  )
}
