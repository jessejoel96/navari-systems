import { createServiceClient } from "@/lib/supabase/server";
import SettingsShell from "@/components/settings/SettingsShell";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createServiceClient();

  const [{ data: entities }, { data: settings }] = await Promise.all([
    supabase
      .from("entities")
      .select("id, name, code, country, is_hq, contact_email, contact_name, sage_folder, purchase_journal, cash_journal, general_journal, account_digits")
      .order("is_hq", { ascending: false })
      .order("code"),
    supabase
      .from("system_settings")
      .select("*")
      .order("group_name")
      .order("key"),
  ]);

  return <SettingsShell entities={entities ?? []} settings={settings ?? []} />;
}
