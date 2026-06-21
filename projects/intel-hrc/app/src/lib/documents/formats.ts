export type FileFormat =
  | "pdf"
  | "excel"
  | "word"
  | "image"
  | "text"
  | "csv"
  | "other";

const FORMAT_LABELS: Record<FileFormat, string> = {
  pdf: "PDF",
  excel: "Excel",
  word: "Word",
  image: "Image",
  text: "Text",
  csv: "CSV",
  other: "Other",
};

export function detectFileFormat(fileName: string, mimeType?: string | null): FileFormat {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf" || mimeType === "application/pdf") return "pdf";
  if (["xlsx", "xls"].includes(ext) || mimeType?.includes("spreadsheet") || mimeType?.includes("excel")) {
    return "excel";
  }
  if (["docx", "doc"].includes(ext) || mimeType?.includes("word")) return "word";
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext) || mimeType?.startsWith("image/")) {
    return "image";
  }
  if (ext === "csv" || mimeType === "text/csv") return "csv";
  if (ext === "txt" || mimeType?.startsWith("text/")) return "text";
  return "other";
}

export function formatLabel(format: string): string {
  return FORMAT_LABELS[format as FileFormat] ?? format;
}

export const FORMAT_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All formats" },
  ...Object.entries(FORMAT_LABELS).map(([value, label]) => ({ value, label })),
];
