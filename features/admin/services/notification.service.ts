import { supabase } from "@/app/supabase";
import type { NotificationModule,NotificationRow,NotificationType } from "../types";

export const NOTIFICATIONS_CHANGED_EVENT = "modtech:notifications-changed";

type CreateNotificationInput = {
  title: string;
  message: string;
  type: NotificationType;
  module: NotificationModule;
  entity_id?: string | number | null;
  entity_type?: string | null;
  created_by?: string | null;
};

type QueuedNotificationJob = {
  id: number;
  payload: {
    title?: unknown;
    message?: unknown;
    type?: unknown;
    module?: unknown;
    entity_id?: unknown;
    entity_type?: unknown;
    created_by?: unknown;
  } | null;
};

export type NotificationFilters = {
  search?: string;
  type?: string;
  module?: string;
};

const emitNotificationsChanged = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT));
};

const getActor = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user?.email || data.user?.id || "Administrateur";
};

export const createNotification = async (input: CreateNotificationInput) => {
  try {
    const createdBy = input.created_by ?? await getActor();
    const { error } = await supabase
      .from("notifications")
      .insert([{
        title: input.title,
        message: input.message,
        type: input.type,
        module: input.module,
        entity_id: input.entity_id === undefined || input.entity_id === null ? null : String(input.entity_id),
        entity_type: input.entity_type ?? input.module,
        created_by: createdBy,
        is_read: false
      }]);

    if (!error) emitNotificationsChanged();
    return { error };
  } catch (error) {
    return { error };
  }
};

export const loadNotifications = async (filters: NotificationFilters = {}) => {
  let query = supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(120);

  if (filters.type && filters.type !== "all") query = query.eq("type", filters.type);
  if (filters.module && filters.module !== "all") query = query.eq("module", filters.module);

  const { data, error } = await query;
  if (error) return { data: [] as NotificationRow[], error };

  const search = filters.search?.trim().toLowerCase();
  const rows = ((data ?? []) as NotificationRow[]).filter((notification) => {
    if (!search) return true;
    return [
      notification.title,
      notification.message,
      notification.type,
      notification.module,
      notification.created_by,
      notification.entity_id
    ].some(value => String(value ?? "").toLowerCase().includes(search));
  });

  return { data: rows, error: null };
};

export const loadUnreadNotificationCount = async () => {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false);

  return { count: count ?? 0, error };
};

export const markNotificationRead = async (id: number) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);
  if (!error) emitNotificationsChanged();
  return { error };
};

export const markAllNotificationsRead = async () => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);
  if (!error) emitNotificationsChanged();
  return { error };
};

export const deleteNotification = async (id: number) => {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);
  if (!error) emitNotificationsChanged();
  return { error };
};

export const convertPendingNotificationQueueJobs = async () => {
  const { data: jobs, error: loadError } = await supabase
    .from("queue_jobs")
    .select("id,payload")
    .eq("job_type", "NOTIFICATION")
    .in("status", ["Pending", "Failed"])
    .limit(100);

  if (loadError) return { error: loadError };

  const queuedJobs = (jobs ?? []) as QueuedNotificationJob[];
  if (queuedJobs.length === 0) return { error: null };

  const rows = queuedJobs
    .map((job) => job.payload)
    .filter((payload): payload is NonNullable<QueuedNotificationJob["payload"]> => Boolean(payload))
    .map((payload) => ({
      title: String(payload.title || "Notification"),
      message: String(payload.message || ""),
      type: String(payload.type || "notification"),
      module: String(payload.module || "orders"),
      entity_id: payload.entity_id === undefined || payload.entity_id === null ? null : String(payload.entity_id),
      entity_type: payload.entity_type === undefined || payload.entity_type === null ? null : String(payload.entity_type),
      created_by: payload.created_by === undefined || payload.created_by === null ? null : String(payload.created_by),
      is_read: false
    }));

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from("notifications").insert(rows);
    if (insertError) return { error: insertError };
  }

  const { error: deleteError } = await supabase
    .from("queue_jobs")
    .delete()
    .in("id", queuedJobs.map((job) => job.id));

  if (!deleteError) emitNotificationsChanged();
  return { error: deleteError };
};

export const deleteAllNotifications = async () => {
  await convertPendingNotificationQueueJobs();
  const { error } = await supabase
    .from("notifications")
    .delete()
    .not("id", "is", null);
  if (!error) emitNotificationsChanged();
  return { error };
};
