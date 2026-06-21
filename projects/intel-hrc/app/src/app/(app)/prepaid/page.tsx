import { createServiceClient } from "@/lib/supabase/server";
import PrepaidShell from "@/components/prepaid/PrepaidShell";

export const dynamic = "force-dynamic";

export default async function PrepaidPage() {
  const supabase = createServiceClient();

  const [{ data: contracts }, { data: entities }, { data: suppliers }] = await Promise.all([
    supabase
      .from("prepaid_contracts")
      .select(`
        *,
        entities(name, code),
        suppliers(name, aux_code),
        prepaid_schedule_lines(id, period_month, period_year, amount, status, scheduled_date, label)
      `)
      .order("created_at", { ascending: false }),
    supabase.from("entities").select("id, name, code").order("is_hq", { ascending: false }).order("code"),
    supabase.from("suppliers").select("id, name, aux_code, entity_id").eq("is_active", true).order("name"),
  ]);

  return (
    <PrepaidShell
      initialContracts={contracts ?? []}
      entities={entities ?? []}
      suppliers={suppliers ?? []}
    />
  );
}
