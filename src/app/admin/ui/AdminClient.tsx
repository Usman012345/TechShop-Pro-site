"use client";

import { useEffect, useMemo, useState } from "react";
import type { Catalog, Category, CategoryId, Product, ProductAvailability } from "@/types/catalog";
import type { IconName } from "@/components/icons";
import type { PutBlobResult } from "@vercel/blob";
import { Icons } from "@/components/icons";
import { ChevronDown } from "lucide-react";
import { cn, formatPriceRs } from "@/lib/utils";

type ApiCatalogResponse = { ok: true; catalog: Catalog } | { ok: false; error: string };

function slugifyId(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const availabilityOptions: { value: ProductAvailability; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "sale", label: "Sale" },
  { value: "limited", label: "Limited" },
  { value: "contact", label: "Contact" },
  { value: "request", label: "On request" },
  { value: "unavailable", label: "Unavailable" },
];

const iconOptions: { value: IconName; label: string }[] = (Object.keys(Icons) as IconName[]).map(
  (k) => ({ value: k, label: k })
);

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-fg/10 bg-bg/25 p-5">
      <div className="font-display text-lg">{title}</div>
      <p className="mt-1 text-sm text-muted">{text}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "h-11 rounded-xl border border-fg/10 bg-bg/35 px-4 text-sm text-fg placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70";

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[92px] rounded-xl border border-fg/10 bg-bg/35 px-4 py-3 text-sm text-fg placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
        props.className
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-11 rounded-xl border border-fg/10 bg-bg/35 px-4 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
        props.className
      )}
    />
  );
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        className="absolute inset-0 bg-bg/70 sm:backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative mx-auto mt-16 w-[min(860px,92vw)] overflow-hidden rounded-3xl border border-fg/10 bg-panel/80 shadow-2xl">
        <div className="border-b border-fg/10 bg-bg/35 px-6 py-4 sm:backdrop-blur">
          <div className="font-display text-xl text-gold2">{title}</div>
        </div>
        <div className="max-h-[78svh] overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export function AdminClient({
  persistenceEnabled,
}: {
  persistenceEnabled: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);

  // Product accordion UI
  const [openCategoryIds, setOpenCategoryIds] = useState<Record<string, boolean>>({});
  const allOpen = useMemo(() => {
    const ids = (catalog?.categories ?? []).map((c) => c.id);
    if (ids.length === 0) return false;
    return ids.every((id) => openCategoryIds[id]);
  }, [catalog?.categories, openCategoryIds]);

  // Category editor
  const [catEditOpen, setCatEditOpen] = useState(false);
  const [catEditing, setCatEditing] = useState<Category | null>(null);
  const [catDraft, setCatDraft] = useState<Category | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState<Product | null>(null);
  const [priceInput, setPriceInput] = useState<string>("0.00");

  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/catalog", { cache: "no-store" });
      const data = (await res.json()) as ApiCatalogResponse;
      if (!data.ok) throw new Error(data.error);
      setCatalog(data.catalog);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const counts = useMemo(() => {
    const m = new Map<CategoryId, number>();
    if (!catalog) return m;
    for (const p of catalog.products) {
      if (!p.isActive) continue;
      m.set(p.categoryId, (m.get(p.categoryId) ?? 0) + 1);
    }
    return m;
  }, [catalog]);

  const productsByCategory = useMemo(() => {
    const m = new Map<CategoryId, Product[]>();
    if (!catalog) return m;

    for (const c of catalog.categories) m.set(c.id, []);
    for (const p of catalog.products) {
      const arr = m.get(p.categoryId) ?? [];
      arr.push(p);
      m.set(p.categoryId, arr);
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    }
    return m;
  }, [catalog]);

  const categories = catalog?.categories ?? [];

  const categoriesView = useMemo(() => {
    return [...categories].sort((a, b) => {
      const ao = typeof a.sortOrder === "number" ? a.sortOrder : 1e9;
      const bo = typeof b.sortOrder === "number" ? b.sortOrder : 1e9;
      if (ao !== bo) return ao - bo;
      return a.name.localeCompare(b.name);
    });
  }, [categories]);

  async function saveCategory(next: Category) {
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ category: next }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? "Save category failed");
    }
  }

  async function removeCategory(id: string) {
    const res = await fetch(`/api/admin/categories/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? "Delete category failed");
    }
  }

  async function saveProduct(next: Product) {
    // Upsert: POST /api/admin/products
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ product: next }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? "Save failed");
    }
  }

  async function patch(id: string, patchObj: Partial<Product>) {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ patch: patchObj }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? "Update failed");
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? "Delete failed");
    }
  }

  async function resetToSeed() {
    const res = await fetch("/api/admin/catalog?action=reset", { method: "POST" });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? "Reset failed");
    }
    await refresh();
  }

  function toggleCategoryOpen(id: string) {
    setOpenCategoryIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function openCategoryProducts(id: string) {
    setOpenCategoryIds((prev) => ({ ...prev, [id]: true }));
    // Scroll after state update.
    setTimeout(() => {
      document.getElementById(`cat-products-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function toggleAllProductsOpen() {
    if (allOpen) {
      setOpenCategoryIds({});
      return;
    }
    const next: Record<string, boolean> = {};
    for (const c of categoriesView) next[c.id] = true;
    setOpenCategoryIds(next);
  }

  async function uploadProductImage(file: File) {
    setImageUploading(true);
    setImageUploadError(null);
    try {
      const res = await fetch(
        `/api/admin/upload?filename=${encodeURIComponent(file.name)}&folder=products`,
        {
          method: "POST",
          body: file,
        }
      );
      const data = (await res.json().catch(() => null)) as
        | { ok: true; blob: PutBlobResult }
        | { ok: false; error: string }
        | null;
      if (!res.ok || !data || data.ok === false) {
        throw new Error((data as any)?.error ?? "Upload failed");
      }
      setDraft((d) => (d ? { ...d, image: data.blob.url } : d));
    } catch (e) {
      setImageUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setImageUploading(false);
    }
  }

  function openCategoryEdit(c: Category) {
    setCatEditing(c);
    setCatDraft(structuredClone(c));
    setCatEditOpen(true);
  }

  function openCategoryCreate() {
    const base: Category = {
      id: "",
      name: "",
      description: "",
      iconName: "Sparkles",
      sortOrder: (categoriesView[categoriesView.length - 1]?.sortOrder ?? categoriesView.length) + 1,
    };
    setCatEditing(null);
    setCatDraft(base);
    setCatEditOpen(true);
  }

  async function handleCategorySave() {
    if (!catDraft) return;
    const id = catDraft.id.trim();
    if (!id) {
      alert("Category id is required");
      return;
    }
    if (!catDraft.name.trim()) {
      alert("Category name is required");
      return;
    }
    try {
      await saveCategory({ ...catDraft, id });
      setCatEditOpen(false);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function handleCategoryDelete(id: string) {
    const ok = confirm(
      "Delete this category? Products in this category will be kept but marked inactive (hidden on the website)."
    );
    if (!ok) return;
    try {
      await removeCategory(id);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  function openEdit(p: Product) {
    setEditing(p);
    setDraft(structuredClone(p));
    setPriceInput(Number.isFinite(p.price) ? p.price.toFixed(2) : "0.00");
    setImageUploadError(null);
    setEditOpen(true);
  }

  function openCreate(categoryId?: CategoryId) {
    const base: Product = {
      id: "",
      name: "",
      categoryId: categoryId ?? categoriesView[0]?.id ?? "security",
      availability: "available",
      isActive: true,
      image: "/products/placeholder.png",
      price: 0,
      showPrice: true,
    };
    setEditing(null);
    setDraft(base);
    setPriceInput("0.00");
    setImageUploadError(null);
    setEditOpen(true);
  }

  async function handleSave() {
    if (!draft) return;
    const id = draft.id.trim();
    if (!id) {
      alert("Product id is required");
      return;
    }
    if (!draft.name.trim()) {
      alert("Product name is required");
      return;
    }
    try {
      await saveProduct({ ...draft, id });
      setEditOpen(false);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function handleDelete(id: string) {
    const ok = confirm("Delete this product?");
    if (!ok) return;
    try {
      await remove(id);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function handleToggleActive(p: Product) {
    try {
      await patch(p.id, { isActive: !p.isActive });
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function exportJson() {
    try {
      const res = await fetch("/api/admin/catalog", { cache: "no-store" });
      const data = (await res.json()) as ApiCatalogResponse;
      if (!data.ok) throw new Error(data.error);

      const blob = new Blob([JSON.stringify(data.catalog, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "techshoppro-catalog.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Export failed");
    }
  }

  async function importJson(file: File) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Catalog;
      const res = await fetch("/api/admin/catalog", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ catalog: parsed }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Import failed");
      }
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Import failed");
    }
  }

  if (loading) {
    return <EmptyState title="Loading…" text="Fetching admin catalog." />;
  }

  if (error || !catalog) {
    return (
      <EmptyState
        title="Could not load catalog"
        text={error ?? "Unknown error"}
      />
    );
  }

  return (
    <div className="grid gap-6">
      {!persistenceEnabled ? (
        <div className="rounded-3xl border border-gold/25 bg-gold/10 p-5 text-sm text-muted">
          <div className="font-display text-base text-gold2">MongoDB is not configured or not reachable</div>
          <p className="mt-1">
            The admin panel uses <span className="text-gold2">MongoDB</span> to store your live
            catalog and hashed admin credentials.
          </p>
          <p className="mt-2 text-xs">
            Set <span className="text-gold2">MONGODB_URI</span> (and optionally
            <span className="text-gold2"> MONGODB_DB</span>) in Vercel → Project → Settings →
            Environment Variables. In MongoDB Atlas, make sure Network Access allows connections
            from Vercel (for quick testing, allow 0.0.0.0/0).
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-fg/10 bg-panel/45 p-5 text-sm text-muted">
          <div className="font-display text-base text-fg/95">Catalog is saved in MongoDB</div>
          <p className="mt-1">
            Your edits are <span className="text-gold2">live</span> immediately. The storefront reads
            the catalog from MongoDB, so any changes you save here will show on the website right away.
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openCreate()}
            className="inline-flex h-11 items-center justify-center rounded-full border border-gold/30 bg-gold/15 px-5 text-sm text-gold2 shadow-gold transition hover:border-gold/50 hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80"
          >
            + Add product
          </button>

          <button
            type="button"
            onClick={exportJson}
            className="inline-flex h-11 items-center justify-center rounded-full border border-fg/10 bg-panel/45 px-5 text-sm text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            Export JSON
          </button>

          <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-fg/10 bg-panel/45 px-5 text-sm text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible-within:ring-2 focus-visible-within:ring-ring/70">
            Import JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importJson(f);
                e.currentTarget.value = "";
              }}
            />
          </label>

          <button
            type="button"
            onClick={() => {
              const ok = confirm("Reset the catalog back to seed data?");
              if (ok) resetToSeed();
            }}
            className="inline-flex h-11 items-center justify-center rounded-full border border-fg/10 bg-bg/25 px-5 text-sm text-fg/90 transition hover:border-fg/20 hover:bg-bg/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            Reset to seed
          </button>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="inline-flex h-11 items-center justify-center rounded-full border border-fg/10 bg-panel/45 px-5 text-sm text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
        >
          Refresh
        </button>
      </div>

      {/* Categories */}
      <section className="rounded-3xl border border-fg/10 bg-panel/45 p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.30em] text-muted">Categories</div>
            <div className="mt-2 font-display text-xl">Manage</div>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Add, edit, or remove categories. You can also set the sort order to control how they
              appear on the home page.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openCategoryCreate}
              className="inline-flex h-11 items-center justify-center rounded-full border border-gold/30 bg-gold/15 px-5 text-sm text-gold2 shadow-gold transition hover:border-gold/50 hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80"
            >
              + Add category
            </button>
            <button
              type="button"
              onClick={toggleAllProductsOpen}
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-full border border-fg/10 bg-panel/45 px-5 text-sm text-fg/90 transition hover:border-fg/20 hover:bg-panel/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
                allOpen && "border-gold/30"
              )}
            >
              {allOpen ? "Collapse all products" : "Show all products"}
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-auto rounded-2xl border border-fg/10">
          <table className="min-w-[920px] w-full border-collapse text-sm">
            <thead className="bg-bg/30">
              <tr className="text-left text-xs text-muted">
                <th className="p-3">Order</th>
                <th className="p-3">Icon</th>
                <th className="p-3">Name</th>
                <th className="p-3">Id</th>
                <th className="p-3">Description</th>
                <th className="p-3">Active products</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categoriesView.map((c) => {
                const Icon = Icons[c.iconName] ?? Icons.Sparkles;
                return (
                  <tr key={c.id} className="border-t border-fg/10">
                    <td className="p-3 text-muted">{typeof c.sortOrder === "number" ? c.sortOrder : "—"}</td>
                    <td className="p-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gold/25 bg-bg/35 text-gold2 shadow-gold">
                        <Icon size={16} />
                      </span>
                    </td>
                    <td className="p-3 text-fg/95">{c.name}</td>
                    <td className="p-3 text-muted">{c.id}</td>
                    <td className="p-3 text-muted">
                      <span className="block max-w-[420px] truncate">{c.description}</span>
                    </td>
                    <td className="p-3">
                      <span className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs text-gold2">
                        {counts.get(c.id) ?? 0}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openCategoryProducts(c.id)}
                          className={cn(
                            "rounded-full border border-fg/10 bg-panel/45 px-4 py-2 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55",
                            openCategoryIds[c.id] && "border-gold/30"
                          )}
                        >
                          Products
                        </button>
                        <button
                          type="button"
                          onClick={() => openCategoryEdit(c)}
                          className="rounded-full border border-fg/10 bg-panel/45 px-4 py-2 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCategoryDelete(c.id)}
                          className="rounded-full border border-fg/10 bg-bg/25 px-4 py-2 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-bg/30"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-muted">
          Total products: <span className="text-gold2">{catalog.products.length}</span>
        </div>
      </section>

      {/* Products by category (dropdowns) */}
      <section className="rounded-3xl border border-fg/10 bg-panel/45 p-5 md:p-6">
        <div>
          <div className="text-xs uppercase tracking-[0.30em] text-muted">Products</div>
          <div className="mt-2 font-display text-xl">Manage by category</div>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Click a category to expand its products. The “Show all products” toggle above will open
            or collapse all category dropdowns.
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          {categoriesView.map((c) => {
            const Icon = Icons[c.iconName] ?? Icons.Sparkles;
            const list = productsByCategory.get(c.id) ?? [];
            const open = Boolean(openCategoryIds[c.id]);
            const activeCount = counts.get(c.id) ?? 0;
            return (
              <div
                key={c.id}
                id={`cat-products-${c.id}`}
                className="rounded-2xl border border-fg/10 bg-bg/20"
              >
                {/*
                  NOTE: This header used to be a <button> containing another <button> ("+ Add"),
                  which is invalid HTML and causes hydration errors in React/Next.
                  We render an accessible div-button instead.
                */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={open}
                  aria-controls={`cat-products-panel-${c.id}`}
                  onClick={() => toggleCategoryOpen(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleCategoryOpen(c.id);
                    }
                  }}
                  className="flex w-full cursor-pointer select-none items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-bg/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gold/25 bg-bg/35 text-gold2 shadow-gold">
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-display text-base text-fg/95">{c.name}</div>
                      <div className="mt-1 text-xs text-muted">
                        {c.id} • {list.length} total • {activeCount} active
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreate(c.id);
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-gold/30 bg-gold/15 px-4 text-xs text-gold2 shadow-gold transition hover:border-gold/50 hover:bg-gold/20"
                    >
                      + Add
                    </button>
                    <ChevronDown
                      size={18}
                      className={cn("text-muted transition", open && "rotate-180")}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {open ? (
                  <div
                    id={`cat-products-panel-${c.id}`}
                    className="border-t border-fg/10 p-4"
                  >
                    {list.length === 0 ? (
                      <p className="text-sm text-muted">No products in this category yet.</p>
                    ) : (
                      <div className="overflow-auto rounded-2xl border border-fg/10">
                        <table className="min-w-[920px] w-full border-collapse text-sm">
                          <thead className="bg-bg/30">
                            <tr className="text-left text-xs text-muted">
                              <th className="p-3">Active</th>
                              <th className="p-3">Image</th>
                              <th className="p-3">Name</th>
                              <th className="p-3">Plan</th>
                              <th className="p-3">Price</th>
                              <th className="p-3">Availability</th>
                              <th className="p-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {list.map((p) => (
                              <tr key={p.id} className="border-t border-fg/10">
                                <td className="p-3">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleActive(p)}
                                    className={cn(
                                      "h-8 w-14 rounded-full border border-fg/10 bg-bg/35 px-1 transition",
                                      p.isActive && "border-gold/30 bg-gold/15"
                                    )}
                                    aria-label="Toggle active"
                                  >
                                    <span
                                      className={cn(
                                        "block h-6 w-6 rounded-full bg-fg/70 transition",
                                        p.isActive && "translate-x-6 bg-gold2"
                                      )}
                                    />
                                  </button>
                                </td>
                                <td className="p-3">
                                  <div className="h-10 w-16 overflow-hidden rounded-lg border border-fg/10 bg-bg/35">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={p.image ?? "/products/placeholder.png"}
                                      alt=""
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="text-fg/95">{p.name}</div>
                                  <div className="mt-1 text-xs text-muted">{p.id}</div>
                                </td>
                                <td className="p-3 text-muted">{p.planLabel ?? "—"}</td>
                                <td className={cn("p-3", p.showPrice === false ? "text-muted" : "text-gold2")}>{p.showPrice === false ? "Contact for price" : formatPriceRs(p.price)}</td>
                                <td className="p-3 text-muted">{p.availability}</td>
                                <td className="p-3">
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => openEdit(p)}
                                      className="rounded-full border border-fg/10 bg-panel/45 px-4 py-2 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(p.id)}
                                      className="rounded-full border border-fg/10 bg-bg/25 px-4 py-2 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-bg/30"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Category modal */}
      <Modal
        open={catEditOpen}
        title={catEditing ? "Edit category" : "Add category"}
        onClose={() => setCatEditOpen(false)}
      >
        {!catDraft ? null : (
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Category name">
                <TextInput
                  value={catDraft.name}
                  onChange={(e) =>
                    setCatDraft((d) => (d ? { ...d, name: e.target.value } : d))
                  }
                  placeholder="e.g., VPN Services"
                />
              </Field>

              <Field label="Category id (slug)">
                <div className="flex gap-2">
                  <TextInput
                    value={catDraft.id}
                    onChange={(e) =>
                      setCatDraft((d) => (d ? { ...d, id: e.target.value } : d))
                    }
                    placeholder="e.g., vpn"
                    disabled={Boolean(catEditing)}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCatDraft((d) =>
                        d
                          ? {
                              ...d,
                              id: d.id || slugifyId(d.name || "category"),
                            }
                          : d
                      )
                    }
                    disabled={Boolean(catEditing)}
                    className={cn(
                      "shrink-0 rounded-xl border border-fg/10 bg-bg/25 px-3 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-bg/30",
                      catEditing && "opacity-40 pointer-events-none"
                    )}
                  >
                    Auto
                  </button>
                </div>
                {catEditing ? (
                  <div className="text-[11px] text-muted">
                    Id cannot be changed for existing categories.
                  </div>
                ) : null}
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Icon">
                <Select
                  value={catDraft.iconName}
                  onChange={(e) =>
                    setCatDraft((d) =>
                      d ? { ...d, iconName: e.target.value as IconName } : d
                    )
                  }
                >
                  {iconOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Sort order (optional)">
                <TextInput
                  type="number"
                  value={
                    typeof catDraft.sortOrder === "number" ? String(catDraft.sortOrder) : ""
                  }
                  onChange={(e) =>
                    setCatDraft((d) =>
                      d
                        ? {
                            ...d,
                            sortOrder: e.target.value ? Number(e.target.value) : undefined,
                          }
                        : d
                    )
                  }
                  placeholder="1"
                />
              </Field>
              <div className="hidden md:block" />
            </div>

            <Field label="Description">
              <TextArea
                value={catDraft.description}
                onChange={(e) =>
                  setCatDraft((d) => (d ? { ...d, description: e.target.value } : d))
                }
                placeholder="Short description shown under the category title."
              />
            </Field>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => setCatEditOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-fg/10 bg-panel/45 px-5 text-sm text-fg/90 transition hover:border-fg/20 hover:bg-panel/55"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCategorySave}
                className="inline-flex h-11 items-center justify-center rounded-full border border-gold/30 bg-gold/15 px-5 text-sm text-gold2 shadow-gold transition hover:border-gold/50 hover:bg-gold/20"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit / Create modal */}
      <Modal
        open={editOpen}
        title={editing ? "Edit product" : "Add product"}
        onClose={() => setEditOpen(false)}
      >
        {!draft ? null : (
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Product name">
                <TextInput
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, name: e.target.value } : d))
                  }
                  placeholder="e.g., NordVPN"
                />
              </Field>

              <Field label="Product id (slug)">
                <div className="flex gap-2">
                  <TextInput
                    value={draft.id}
                    onChange={(e) =>
                      setDraft((d) => (d ? { ...d, id: e.target.value } : d))
                    }
                    placeholder="e.g., vpn-nordvpn-2y"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) =>
                        d
                          ? {
                              ...d,
                              id: d.id || slugifyId(d.name || "product"),
                            }
                          : d
                      )
                    }
                    className="shrink-0 rounded-xl border border-fg/10 bg-bg/25 px-3 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-bg/30"
                  >
                    Auto
                  </button>
                </div>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Category">
                <Select
                  value={draft.categoryId}
                  onChange={(e) =>
                    setDraft((d) =>
                      d ? { ...d, categoryId: e.target.value as CategoryId } : d
                    )
                  }
                >
                  {categoriesView.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Availability">
                <Select
                  value={draft.availability}
                  onChange={(e) =>
                    setDraft((d) =>
                      d
                        ? {
                            ...d,
                            availability: e.target.value as ProductAvailability,
                          }
                        : d
                    )
                  }
                >
                  {availabilityOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Active">
                <Select
                  value={draft.isActive ? "yes" : "no"}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, isActive: e.target.value === "yes" } : d))
                  }
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Plan label (optional)">
                <TextInput
                  value={draft.planLabel ?? ""}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, planLabel: e.target.value } : d))
                  }
                  placeholder="e.g., 2 Years • Unlimited Devices"
                />
              </Field>

              <Field label="Price display">
                <Select
                  value={draft.showPrice === false ? "contact" : "show"}
                  onChange={(e) => {
                    const mode = e.target.value;
                    setDraft((d) => (d ? { ...d, showPrice: mode === "show" } : d));
                  }}
                >
                  <option value="show">Show numeric price</option>
                  <option value="contact">Contact for price</option>
                </Select>
              </Field>

              <Field label="Price (Rs)">
                <TextInput
                  type="text"
                  inputMode="decimal"
                  value={priceInput}
                  disabled={draft.showPrice === false}
                  onChange={(e) => {
                    const raw = e.target.value;

                    // Allow empty, digits, and a single decimal point (up to 2 decimals).
                    if (!/^\d*(\.\d{0,2})?$/.test(raw)) return;

                    setPriceInput(raw);
                    const next = raw === "" || raw === "." ? 0 : Number(raw);
                    setDraft((d) => (d ? { ...d, price: Number.isFinite(next) ? next : 0 } : d));
                  }}
                  onBlur={() => {
                    setPriceInput((v) => {
                      const n = Number(v);
                      if (!Number.isFinite(n)) return "0.00";
                      return n.toFixed(2);
                    });
                  }}
                  placeholder="0.00"
                />
                <div className="text-[11px] text-muted">
                  Preview:{" "}
                  {draft.showPrice === false ? "Contact for price" : formatPriceRs(draft.price)}
                </div>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Product image">
                <div className="grid gap-2">
                  <TextInput
                    value={draft.image ?? ""}
                    onChange={(e) =>
                      setDraft((d) => (d ? { ...d, image: e.target.value } : d))
                    }
                    placeholder="Upload an image or paste a URL…"
                  />

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-fg/10 bg-panel/45 px-4 text-xs text-fg/90 transition hover:border-fg/20 hover:bg-panel/55">
                      {imageUploading ? "Uploading…" : "Upload image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={imageUploading}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadProductImage(f);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>

                    <div className="text-xs text-muted">
                      Uses <span className="text-gold2">Vercel Blob</span> (BLOB_READ_WRITE_TOKEN).
                    </div>
                  </div>

                  {imageUploadError ? (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-xs text-red-200">
                      {imageUploadError}
                    </div>
                  ) : null}

                  <div className="h-24 overflow-hidden rounded-2xl border border-fg/10 bg-bg/35">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={draft.image ?? "/products/placeholder.png"}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </Field>

              <Field label="Logo watermark (optional)">
                <TextInput
                  value={draft.logo ?? ""}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, logo: e.target.value } : d))
                  }
                  placeholder="/logos/nordvpn.svg"
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Badge (optional)">
                <TextInput
                  value={draft.badge ?? ""}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, badge: e.target.value } : d))
                  }
                  placeholder="Sale / Limited / New"
                />
              </Field>
              <div className="hidden md:block" />
            </div>

            <Field label="Short description (optional)">
              <TextArea
                value={draft.shortDescription ?? ""}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, shortDescription: e.target.value } : d))
                }
                placeholder="One short line shown under the title."
              />
            </Field>

            <Field label="Feature bullets (optional, one per line)">
              <TextArea
                value={(draft.features ?? []).join("\n")}
                onChange={(e) =>
                  setDraft((d) =>
                    d
                      ? {
                          ...d,
                          features: e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        }
                      : d
                  )
                }
                placeholder="Feature 1\nFeature 2\nFeature 3"
              />
            </Field>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-fg/10 bg-panel/45 px-5 text-sm text-fg/90 transition hover:border-fg/20 hover:bg-panel/55"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex h-11 items-center justify-center rounded-full border border-gold/30 bg-gold/15 px-5 text-sm text-gold2 shadow-gold transition hover:border-gold/50 hover:bg-gold/20"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
