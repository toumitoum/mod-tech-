import { supabase } from "@/app/supabase";
import type { JsonObject,QueueJob,QueueJobType } from "../types";

export type CreateQueueJobInput = {
  job_type: QueueJobType;
  payload: JsonObject;
  max_retries?: number;
  scheduled_at?: string | null;
  created_by?: string | null;
};

export const createQueueJob = async ({
  job_type,
  payload,
  max_retries = 3,
  scheduled_at = null,
  created_by = null
}: CreateQueueJobInput) => {
  const { error, data } = await supabase
    .from("queue_jobs")
    .insert([{
      job_type,
      payload,
      status: "Pending",
      retries: 0,
      max_retries,
      scheduled_at: scheduled_at || new Date().toISOString(),
      created_by
    }])
    .select("*")
    .single();

  return { data: data as QueueJob | null, error };
};

export const loadQueueJobs = async () => {
  const { data, error } = await supabase
    .from("queue_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return { data: (data ?? []) as QueueJob[], error };
};

export const retryQueueJob = async (id: number) => {
  const { error } = await supabase
    .from("queue_jobs")
    .update({
      status: "Pending",
      error_message: null,
      scheduled_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  return { error };
};

export const cancelQueueJob = async (id: number) => {
  const { error } = await supabase
    .from("queue_jobs")
    .update({
      status: "Cancelled",
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .in("status", ["Pending", "Failed"]);

  return { error };
};

export const retryAllFailedJobs = async () => {
  const { error } = await supabase
    .from("queue_jobs")
    .update({
      status: "Pending",
      error_message: null,
      scheduled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("status", "Failed");

  return { error };
};

export const deleteJobsByStatus = async (status: "Completed" | "Failed") => {
  const { error } = await supabase
    .from("queue_jobs")
    .delete()
    .eq("status", status);

  return { error };
};

export const processQueueJobs = async (limit = 5, jobIds: number[] = []) => {
  const response = await fetch("/api/queue/worker", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit, jobIds })
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok && data.ok !== false, data };
};
