import { supabase } from "@/app/supabase";
import type { AuditLog } from "../types";

export type AuditLogFilters = {
  user: string;
  section: string;
  action: string;
  from: string;
  to: string;
  search: string;
};

export type AuditLogSort = {
  field: keyof Pick<AuditLog, "created_at" | "user_email" | "section" | "action" | "item_name">;
  ascending: boolean;
};

const AUDIT_SELECT = "id,user_id,user_email,action,operation_type,section,item_name,item_id,old_data,new_data,details,ip_address,description,created_at";

const escapeFilterValue = (value: string) => value.replace(/[%_]/g, "\\$&");

export async function fetchAuditLogs(
  filters: AuditLogFilters,
  sort: AuditLogSort,
  page: number,
  pageSize: number
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from("audit_logs")
    .select(AUDIT_SELECT, { count: "exact" });

  const user = filters.user.trim();
  const search = filters.search.trim();

  if (user) query = query.ilike("user_email", `%${escapeFilterValue(user)}%`);
  if (filters.section !== "all") query = query.eq("section", filters.section);
  if (filters.action !== "all") query = query.eq("operation_type", filters.action);
  if (filters.from) query = query.gte("created_at", `${filters.from}T00:00:00`);
  if (filters.to) query = query.lte("created_at", `${filters.to}T23:59:59`);
  if (search) {
    const escaped = escapeFilterValue(search);
    query = query.or(`description.ilike.%${escaped}%,item_name.ilike.%${escaped}%,item_id.ilike.%${escaped}%,user_email.ilike.%${escaped}%`);
  }

  const { data, error, count } = await query
    .order(sort.field, { ascending: sort.ascending })
    .range(from, to);
  return { data: (data ?? []) as AuditLog[], error, count: count ?? 0 };
}

export async function fetchAuditLogsForExport(filters: AuditLogFilters, sort: AuditLogSort) {
  let query = supabase
    .from("audit_logs")
    .select(AUDIT_SELECT);
  const user = filters.user.trim();
  const search = filters.search.trim();

  if (user) query = query.ilike("user_email", `%${escapeFilterValue(user)}%`);
  if (filters.section !== "all") query = query.eq("section", filters.section);
  if (filters.action !== "all") query = query.eq("operation_type", filters.action);
  if (filters.from) query = query.gte("created_at", `${filters.from}T00:00:00`);
  if (filters.to) query = query.lte("created_at", `${filters.to}T23:59:59`);
  if (search) {
    const escaped = escapeFilterValue(search);
    query = query.or(`description.ilike.%${escaped}%,item_name.ilike.%${escaped}%,item_id.ilike.%${escaped}%,user_email.ilike.%${escaped}%`);
  }

  const { data, error } = await query
    .order(sort.field, { ascending: sort.ascending })
    .limit(5000);
  return { data: (data ?? []) as AuditLog[], error };
}

export async function fetchAuditLogStats(filters: AuditLogFilters) {
  let query = supabase
    .from("audit_logs")
    .select("created_at,user_email,section,operation_type");
  const user = filters.user.trim();
  const search = filters.search.trim();

  if (user) query = query.ilike("user_email", `%${escapeFilterValue(user)}%`);
  if (filters.section !== "all") query = query.eq("section", filters.section);
  if (filters.action !== "all") query = query.eq("operation_type", filters.action);
  if (filters.from) query = query.gte("created_at", `${filters.from}T00:00:00`);
  if (filters.to) query = query.lte("created_at", `${filters.to}T23:59:59`);
  if (search) {
    const escaped = escapeFilterValue(search);
    query = query.or(`description.ilike.%${escaped}%,item_name.ilike.%${escaped}%,item_id.ilike.%${escaped}%,user_email.ilike.%${escaped}%`);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(1000);
  return { data: (data ?? []) as Pick<AuditLog, "created_at" | "user_email" | "section" | "operation_type">[], error };
}

export async function clearAuditLogs() {
  const { error, count } = await supabase
    .from("audit_logs")
    .delete({ count: "exact" })
    .neq("id", -1)
    .select("id");

  return { error, count: count ?? 0 };
}
