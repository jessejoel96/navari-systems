"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  FolderOpen,
  Upload,
  Search,
  Filter,
  Download,
  Mail,
  X,
  Loader2,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Tag,
  Calendar,
  Share2,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { cn } from "@/lib/utils";
import { storageDownloadUrl } from "@/lib/payments/documents";
import { DOCUMENT_CATEGORIES, categoryLabel } from "@/lib/documents/constants";
import { FORMAT_FILTER_OPTIONS, formatLabel, type FileFormat } from "@/lib/documents/formats";

type Entity = { id: string; name: string; code: string };

export type LibraryDocument = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  tags: string[];
  document_date: string | null;
  file_format: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
  entities: Entity | null;
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDisplayDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function FormatIcon({ format }: { format: string }) {
  const cls = "h-5 w-5";
  switch (format as FileFormat) {
    case "pdf":
    case "text":
      return <FileText className={cn(cls, "text-red-500")} />;
    case "excel":
    case "csv":
      return <FileSpreadsheet className={cn(cls, "text-emerald-600")} />;
    case "word":
      return <FileText className={cn(cls, "text-blue-600")} />;
    case "image":
      return <FileImage className={cn(cls, "text-violet-500")} />;
    default:
      return <File className={cn(cls, "text-gray-400")} />;
  }
}

export function DocumentsShell({
  initialDocuments,
  entities,
  highlightId,
}: {
  initialDocuments: LibraryDocument[];
  entities: Entity[];
  highlightId?: string;
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [format, setFormat] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showUpload, setShowUpload] = useState(false);
  const [shareDoc, setShareDoc] = useState<LibraryDocument | null>(null);
  const [selected, setSelected] = useState<LibraryDocument | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    documents.forEach((d) => d.tags?.forEach((t) => tags.add(t)));
    return [...tags].sort();
  }, [documents]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (category) params.set("category", category);
      if (format) params.set("format", format);
      if (tagFilter) params.set("tag", tagFilter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      const res = await fetch(`/api/documents?${params}`);
      if (res.ok) setDocuments(await res.json());
    } finally {
      setLoading(false);
    }
  }, [search, category, format, tagFilter, dateFrom, dateTo]);

  useEffect(() => {
    const t = setTimeout(refresh, 300);
    return () => clearTimeout(t);
  }, [refresh]);

  useEffect(() => {
    if (highlightId) {
      const doc = documents.find((d) => d.id === highlightId);
      if (doc) setSelected(doc);
    }
  }, [highlightId, documents]);

  async function archiveDocument(id: string) {
    if (!confirm("Archive this document? It will be hidden from the library.")) return;
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selected?.id === id) setSelected(null);
    }
  }

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Document Library"
        description="Organize AP files by category, tags, and date — download or share with colleagues."
      >
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-brand-blue-deep shadow-sm hover:bg-blue-50"
        >
          <Upload className="h-4 w-4" />
          Upload document
        </button>
      </AppPageHeader>

      {/* Search + filters */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description, filename…"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
          >
            <option value="">All categories</option>
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
          >
            {FORMAT_FILTER_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm",
              showFilters ? "border-brand-blue bg-brand-blue-light text-brand-blue" : "border-gray-200 text-gray-600"
            )}
          >
            <Filter className="h-4 w-4" />
            More
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showFilters && "rotate-180")} />
          </button>
          {loading && <Loader2 className="h-5 w-5 animate-spin text-gray-400 self-center" />}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-50">
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">All tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400" />
              From
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm" />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              To
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm" />
            </label>
            {(category || format || tagFilter || dateFrom || dateTo || search) && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("");
                  setFormat("");
                  setTagFilter("");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="text-sm text-brand-blue hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Document grid */}
      {documents.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <FolderOpen className="h-12 w-12 text-gray-200" />
          <p className="mt-4 text-sm font-medium text-gray-600">No documents yet</p>
          <p className="mt-1 text-xs text-gray-400">Upload policies, contracts, templates, and shared AP files.</p>
          <button
            onClick={() => setShowUpload(true)}
            className="mt-4 text-sm font-medium text-brand-blue hover:underline"
          >
            Upload your first document
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <article
              key={doc.id}
              onClick={() => setSelected(doc)}
              className={cn(
                "cursor-pointer rounded-xl border bg-white p-4 transition-shadow hover:shadow-md",
                selected?.id === doc.id ? "border-brand-blue ring-2 ring-brand-blue/20" : "border-gray-100",
                highlightId === doc.id && "border-violet-300 ring-2 ring-violet-200"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                  <FormatIcon format={doc.file_format} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-gray-900">{doc.title}</h3>
                  <p className="text-xs text-gray-500">{categoryLabel(doc.category)}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                  {formatLabel(doc.file_format)}
                </span>
                {doc.document_date && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                    {formatDisplayDate(doc.document_date)}
                  </span>
                )}
                {doc.entities?.code && (
                  <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                    {doc.entities.code}
                  </span>
                )}
              </div>
              {doc.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {doc.tags.slice(0, 3).map((t) => (
                    <span key={t} className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
                      <Tag className="h-2.5 w-2.5" />{t}
                    </span>
                  ))}
                  {doc.tags.length > 3 && (
                    <span className="text-[10px] text-gray-400">+{doc.tags.length - 3}</span>
                  )}
                </div>
              )}
              <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                <a
                  href={storageDownloadUrl(doc.storage_path)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
                <button
                  onClick={() => setShareDoc(doc)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <DetailPanel
          doc={selected}
          onClose={() => setSelected(null)}
          onShare={() => setShareDoc(selected)}
          onArchive={() => archiveDocument(selected.id)}
        />
      )}

      {showUpload && (
        <UploadModal
          entities={entities}
          onClose={() => setShowUpload(false)}
          onUploaded={(doc) => {
            setDocuments((prev) => [doc, ...prev]);
            setShowUpload(false);
          }}
        />
      )}

      {shareDoc && (
        <ShareModal
          doc={shareDoc}
          onClose={() => setShareDoc(null)}
        />
      )}
    </div>
  );
}

function DetailPanel({
  doc,
  onClose,
  onShare,
  onArchive,
}: {
  doc: LibraryDocument;
  onClose: () => void;
  onShare: () => void;
  onArchive: () => void;
}) {
  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md border-l border-gray-200 bg-white shadow-xl">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Document details</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center gap-3">
            <FormatIcon format={doc.file_format} />
            <div>
              <p className="font-semibold text-gray-900">{doc.title}</p>
              <p className="text-xs text-gray-500">{doc.file_name}</p>
            </div>
          </div>
          <dl className="space-y-2 text-sm">
            <Row label="Category" value={categoryLabel(doc.category)} />
            <Row label="Format" value={formatLabel(doc.file_format)} />
            <Row label="Document date" value={formatDisplayDate(doc.document_date)} />
            <Row label="Uploaded" value={formatDisplayDate(doc.created_at?.slice(0, 10) ?? null)} />
            <Row label="Size" value={formatBytes(doc.size_bytes)} />
            <Row label="Uploaded by" value={doc.uploaded_by ?? "—"} />
            {doc.entities && <Row label="Entity" value={`${doc.entities.code} — ${doc.entities.name}`} />}
            {doc.description && <Row label="Description" value={doc.description} />}
          </dl>
          {doc.tags?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {doc.tags.map((t) => (
                  <span key={t} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-gray-100 p-4 flex flex-wrap gap-2">
          <a
            href={storageDownloadUrl(doc.storage_path)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-blue px-3 py-2 text-sm font-medium text-white"
          >
            <Download className="h-4 w-4" /> Download
          </a>
          <button
            onClick={onShare}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Mail className="h-4 w-4" /> Share
          </button>
          <button
            onClick={onArchive}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Archive
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 text-xs text-gray-500">{label}</dt>
      <dd className="text-gray-800">{value}</dd>
    </div>
  );
}

function UploadModal({
  entities,
  onClose,
  onUploaded,
}: {
  entities: Entity[];
  onClose: () => void;
  onUploaded: (doc: LibraryDocument) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [tags, setTags] = useState("");
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().slice(0, 10));
  const [entityId, setEntityId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "));
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 25 * 1024 * 1024,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
      "text/csv": [".csv"],
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title.trim());
      fd.append("description", description);
      fd.append("category", category);
      fd.append("tags", tags);
      fd.append("document_date", documentDate);
      if (entityId) fd.append("entity_id", entityId);
      const res = await fetch("/api/documents", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUploaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-sm font-semibold">Upload document</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div
            {...getRootProps()}
            className={cn(
              "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center text-sm",
              isDragActive ? "border-brand-blue bg-brand-blue-light" : file ? "border-emerald-300 bg-emerald-50" : "border-gray-200"
            )}
          >
            <input {...getInputProps()} />
            {file ? (
              <p className="font-medium text-emerald-700">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>
            ) : (
              <p className="text-gray-500">Drop PDF, Excel, Word, images, or CSV (max 25 MB)</p>
            )}
          </div>
          <label className="block text-xs font-medium text-gray-500">
            Title *
            <input required value={title} onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-gray-500">
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-gray-500">
              Document date
              <input type="date" value={documentDate} onChange={(e) => setDocumentDate(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </label>
          </div>
          <label className="block text-xs font-medium text-gray-500">
            Tags (comma-separated)
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="sage, 2026, rent"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          <label className="block text-xs font-medium text-gray-500">
            Entity (optional)
            <select value={entityId} onChange={(e) => setEntityId(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
              <option value="">All / group-wide</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>{e.code} — {e.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-gray-500">
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={uploading || !file}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue py-2.5 text-sm font-medium text-white disabled:opacity-50">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading…" : "Save to library"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ShareModal({
  doc,
  onClose,
}: {
  doc: LibraryDocument;
  onClose: () => void;
}) {
  const [emails, setEmails] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/documents/${doc.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emails, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(`Sent to ${(data.sent_to as string[]).join(", ")}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4 text-brand-blue" /> Share via email
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <p className="text-sm text-gray-600">
            Sharing <strong>{doc.title}</strong> — colleagues receive a download link and library reference.
          </p>
          <label className="block text-xs font-medium text-gray-500">
            Colleague emails (comma-separated) *
            <input required value={emails} onChange={(e) => setEmails(e.target.value)}
              placeholder="cfo@intelhrc.com, colleague@…"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          <label className="block text-xs font-medium text-gray-500">
            Message (optional)
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
              placeholder="Please review before the payment run on Friday."
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {result && <p className="text-xs text-emerald-600">{result}</p>}
          <button type="submit" disabled={sending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue py-2.5 text-sm font-medium text-white disabled:opacity-50">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {sending ? "Sending…" : "Send email"}
          </button>
        </form>
      </div>
    </div>
  );
}
