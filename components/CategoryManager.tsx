"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Check, Loader2, AlertCircle } from "lucide-react";
import type { ICategory } from "@/types";

interface CategoryManagerProps {
  categories: ICategory[];
}

export default function CategoryManager({ categories: initial }: CategoryManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Failed to create category");
        return;
      }

      setCategories((prev) => [...prev, json.data].sort((a, b) => a.name.localeCompare(b.name)));
      setForm({ name: "", description: "" });
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(cat: ICategory) {
    setEditingId(cat._id);
    setEditForm({ name: cat.name, description: cat.description || "" });
    setError(null);
  }

  async function handleUpdate(id: string) {
    setBusyId(id);
    setError(null);

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Failed to update category");
        return;
      }

      setCategories((prev) =>
        prev.map((c) => (c._id === id ? { ...c, ...json.data } : c)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? This is only possible if no cars are assigned to it.")) return;

    setBusyId(id);
    setError(null);

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Failed to delete category");
        return;
      }

      setCategories((prev) => prev.filter((c) => c._id !== id));
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Create form */}
      <form onSubmit={handleCreate} className="card-surface space-y-4 p-5">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-brass-400">
          Add New Category
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="label-field">Name</label>
            <input
              id="name"
              type="text"
              className="input-field"
              placeholder="e.g. SUV"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="label-field">Description (optional)</label>
            <input
              id="description"
              type="text"
              className="input-field"
              placeholder="Short description shown on the category page"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Category
        </button>
      </form>

      {/* List */}
      {categories.length === 0 ? (
        <div className="rounded-md border border-dashed border-white/10 bg-charcoal-800/50 p-12 text-center">
          <p className="font-display text-lg uppercase tracking-wide text-ink">No categories yet</p>
          <p className="mt-2 text-sm text-muted">Add your first category above (e.g. SUV, Sedan, Truck).</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-white/5">
          <table className="w-full text-left text-sm">
            <thead className="bg-charcoal-800 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Cars</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map((cat) => {
                const isEditing = editingId === cat._id;
                const busy = busyId === cat._id;

                return (
                  <tr key={cat._id} className="bg-charcoal-900/40 hover:bg-charcoal-800/60">
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          className="input-field"
                          value={editForm.name}
                          onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        />
                      ) : (
                        <span className="font-medium text-ink">{cat.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{cat.slug}</td>
                    <td className="px-4 py-3 text-muted">
                      {isEditing ? (
                        <input
                          type="text"
                          className="input-field"
                          value={editForm.description}
                          onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                        />
                      ) : (
                        <span className="line-clamp-1">{cat.description || "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{cat.carCount ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {busy && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleUpdate(cat._id)}
                              disabled={busy}
                              className="flex h-8 w-8 items-center justify-center rounded-sm border border-emerald-400/30 text-emerald-300 hover:border-emerald-400"
                              aria-label="Save"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex h-8 w-8 items-center justify-center rounded-sm border border-white/10 text-ink/70 hover:border-red-400 hover:text-red-400"
                              aria-label="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(cat)}
                              className="flex h-8 w-8 items-center justify-center rounded-sm border border-white/10 text-ink/70 hover:border-brass-400 hover:text-brass-400"
                              aria-label="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat._id)}
                              disabled={busy}
                              className="flex h-8 w-8 items-center justify-center rounded-sm border border-white/10 text-ink/70 hover:border-red-400 hover:text-red-400"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
