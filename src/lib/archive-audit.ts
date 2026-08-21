import { supabase } from "@/integrations/supabase/client";
import { getSession } from "@/lib/team-store";

export type ArchiveAuditAction = "requested" | "ready" | "accessed";

export interface ArchiveAuditLog {
  id: string;
  action: ArchiveAuditAction;
  footage_date: string;
  site_id: string | null;
  actor_name: string;
  actor_email: string | null;
  actor_role: string | null;
  note: string | null;
  created_at: string;
}

const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

export async function logArchiveEvent(input: {
  action: ArchiveAuditAction;
  footageDate: Date;
  siteId?: string | null;
  note?: string | null;
}) {
  const s = getSession();
  const { error } = await supabase.from("archive_audit_logs").insert({
    action: input.action,
    footage_date: toDateKey(input.footageDate),
    site_id: input.siteId ?? null,
    actor_name: s?.displayName || s?.name || "Unknown",
    actor_email: s?.email ?? null,
    actor_role: s?.role ?? null,
    note: input.note ?? null,
  });
  if (error) console.error("[archive-audit]", error.message);
}

export async function fetchArchiveAudit(limit = 20): Promise<ArchiveAuditLog[]> {
  const { data, error } = await supabase
    .from("archive_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[archive-audit]", error.message);
    return [];
  }
  return (data ?? []) as ArchiveAuditLog[];
}
