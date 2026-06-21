import { createServiceClient } from "@/lib/supabase/server";
import { DocumentsShell } from "@/components/documents/DocumentsShell";

export const dynamic = "force-dynamic";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ doc?: string }>;
}) {
  const { doc: highlightId } = await searchParams;
  const supabase = createServiceClient();

  const [{ data: documents }, { data: entities }] = await Promise.all([
    supabase
      .from("library_documents")
      .select("*, entities(id, name, code)")
      .eq("is_archived", false)
      .order("document_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("entities").select("id, name, code").order("code"),
  ]);

  return (
    <DocumentsShell
      initialDocuments={documents ?? []}
      entities={entities ?? []}
      highlightId={highlightId}
    />
  );
}
