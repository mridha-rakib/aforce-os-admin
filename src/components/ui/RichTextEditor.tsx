import { useEffect, useRef } from 'react'
import { Bold, Heading1, Heading2, Italic, List, ListOrdered, Pilcrow, Quote, Redo2, Underline, Undo2 } from 'lucide-react'
import { cn } from '../../utils/cn'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

interface ToolbarAction {
  label: string
  icon: typeof Bold
  command: string
  value?: string
}

const toolbarActions: ToolbarAction[] = [
  { label: 'Bold', icon: Bold, command: 'bold' },
  { label: 'Italic', icon: Italic, command: 'italic' },
  { label: 'Underline', icon: Underline, command: 'underline' },
  { label: 'H1', icon: Heading1, command: 'formatBlock', value: 'h1' },
  { label: 'H2', icon: Heading2, command: 'formatBlock', value: 'h2' },
  { label: 'Paragraph', icon: Pilcrow, command: 'formatBlock', value: 'p' },
  { label: 'Quote', icon: Quote, command: 'formatBlock', value: 'blockquote' },
  { label: 'Bullets', icon: List, command: 'insertUnorderedList' },
  { label: 'Numbers', icon: ListOrdered, command: 'insertOrderedList' },
]

const toolbarButtonClass =
  'grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-panel text-text-muted transition hover:text-white'

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    onChange(editorRef.current?.innerHTML ?? '')
  }

  return (
    <div className={cn('rounded-2xl border border-border bg-card', className)}>
      <div className="flex flex-wrap gap-2 border-b border-border px-4 py-4">
        {toolbarActions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.label}
              type="button"
              className={toolbarButtonClass}
              aria-label={action.label}
              title={action.label}
              onClick={() => runCommand(action.command, action.value)}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
        <button
          type="button"
          className={toolbarButtonClass}
          aria-label="Undo"
          title="Undo"
          onClick={() => runCommand('undo')}
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarButtonClass}
          aria-label="Redo"
          title="Redo"
          onClick={() => runCommand('redo')}
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Write or format your CMS content here..."
        className="cms-editor cms-content min-h-[320px] rounded-b-2xl bg-[#0d131b] px-5 py-4 outline-none"
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
      />
    </div>
  )
}
