"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Heading } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  id?: string;
}

/**
 * A lightweight rich text editor using contentEditable + execCommand.
 * Output is sanitized server-side before being stored, so only a safe
 * subset of formatting (bold, italic, lists, headings, paragraphs) is
 * preserved.
 */
export default function RichTextEditor({ value, onChange, placeholder, id }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (ref.current && isFirstRender.current) {
      ref.current.innerHTML = value || "";
      isFirstRender.current = false;
    }
  }, [value]);

  function exec(command: string, arg?: string) {
    document.execCommand(command, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
    ref.current?.focus();
  }

  return (
    <div className="overflow-hidden rounded-sm border border-white/10 bg-charcoal-900">
      <div className="flex items-center gap-1 border-b border-white/10 bg-charcoal-800 p-1.5">
        <ToolbarButton onClick={() => exec("bold")} label="Bold">
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")} label="Italic">
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("formatBlock", "h4")} label="Heading">
          <Heading className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("insertUnorderedList")} label="Bullet list">
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("insertOrderedList")} label="Numbered list">
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>
      <div
        ref={ref}
        id={id}
        contentEditable
        onInput={() => ref.current && onChange(ref.current.innerHTML)}
        onBlur={() => ref.current && onChange(ref.current.innerHTML)}
        data-placeholder={placeholder}
        className="prose-invert min-h-[140px] max-w-none px-4 py-3 text-sm text-ink focus:outline-none [&:empty]:before:text-muted/50 [&:empty]:before:content-[attr(data-placeholder)] [&_h4]:font-display [&_h4]:text-base [&_h4]:font-semibold [&_h4]:uppercase [&_h4]:tracking-wide [&_li]:ml-4 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:mb-2"
      />
    </div>
  );
}

function ToolbarButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-sm text-muted transition-colors hover:bg-charcoal-700 hover:text-brass-400"
    >
      {children}
    </button>
  );
}
