"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Trash2, Loader2, Eye, Reply } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import type { IContact } from "@/types";

interface MessagesManagerProps {
  messages: IContact[];
}

type FilterTab = "new" | "read" | "responded" | "all";

const STATUS_LABEL: Record<IContact["status"], string> = {
  new: "New",
  read: "Read",
  responded: "Responded",
};

const STATUS_STYLE: Record<IContact["status"], string> = {
  new: "bg-brass-400/15 text-brass-300",
  read: "bg-blue-400/15 text-blue-300",
  responded: "bg-emerald-400/15 text-emerald-300",
};

export default function MessagesManager({ messages: initial }: MessagesManagerProps) {
  const router = useRouter();
  const [messages, setMessages] = useState(initial);
  const [tab, setTab] = useState<FilterTab>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = messages.filter((m) => tab === "all" || m.status === tab);
  const newCount = messages.filter((m) => m.status === "new").length;

  async function updateStatus(id: string, status: IContact["status"]) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, status } : m)));
        router.refresh();
      }
    } catch {
      // no-op
    } finally {
      setBusyId(null);
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm("Delete this message permanently?")) return;

    setBusyId(id);
    try {
      const res = await fetch(`/api/contact/${id}`, { method: "DELETE" });
      const json = await res.json();

      if (res.ok && json.success) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
        router.refresh();
      }
    } catch {
      // no-op
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <TabButton active={tab === "all"} onClick={() => setTab("all")}>All</TabButton>
        <TabButton active={tab === "new"} onClick={() => setTab("new")}>
          New {newCount > 0 && `(${newCount})`}
        </TabButton>
        <TabButton active={tab === "read"} onClick={() => setTab("read")}>Read</TabButton>
        <TabButton active={tab === "responded"} onClick={() => setTab("responded")}>Responded</TabButton>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-white/10 bg-charcoal-800/50 p-12 text-center">
          <Mail className="mx-auto h-8 w-8 text-muted/40" />
          <p className="mt-3 font-display text-lg uppercase tracking-wide text-ink">No messages here</p>
          <p className="mt-2 text-sm text-muted">Inquiries submitted through the contact form will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((msg) => {
            const busy = busyId === msg._id;

            return (
              <li key={msg._id} className="card-surface p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink">{msg.name}</p>
                      <span className={cn("rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", STATUS_STYLE[msg.status])}>
                        {STATUS_LABEL[msg.status]}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
                      <a href={`mailto:${msg.email}`} className="flex items-center gap-1 hover:text-brass-400">
                        <Mail className="h-3 w-3" /> {msg.email}
                      </a>
                      <a href={`tel:${msg.phone}`} className="flex items-center gap-1 hover:text-brass-400">
                        <Phone className="h-3 w-3" /> {msg.phone}
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-muted">{formatDate(msg.createdAt)}</p>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-ink/90">{msg.message}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {busy && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
                  {msg.status === "new" && (
                    <button onClick={() => updateStatus(msg._id, "read")} disabled={busy} className="btn-outline">
                      <Eye className="h-3.5 w-3.5" />
                      Mark as Read
                    </button>
                  )}
                  {msg.status !== "responded" && (
                    <button
                      onClick={() => updateStatus(msg._id, "responded")}
                      disabled={busy}
                      className="btn-outline border-emerald-400/30 text-emerald-300 hover:border-emerald-400"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      Mark as Responded
                    </button>
                  )}
                  <a href={`mailto:${msg.email}`} className="btn-outline">
                    <Mail className="h-3.5 w-3.5" />
                    Reply by Email
                  </a>
                  <button
                    onClick={() => deleteMessage(msg._id)}
                    disabled={busy}
                    className="btn-outline border-red-400/30 text-red-300 hover:border-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-sm px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors",
        active ? "bg-brass-400 text-charcoal-950" : "border border-white/10 text-ink/70 hover:border-brass-400 hover:text-brass-400"
      )}
    >
      {children}
    </button>
  );
}
