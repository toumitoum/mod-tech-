"use client";

import {
  AlertTriangle,
  Ban,
  CheckCircle,
  Clock,
  Eye,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Trash2
} from "lucide-react";
import React,{ useCallback,useEffect,useMemo,useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  cancelQueueJob,
  deleteJobsByStatus,
  loadQueueJobs,
  processQueueJobs,
  retryAllFailedJobs,
  retryQueueJob
} from "../../services/queue.service";
import { ms } from "../../styles";
import type { QueueJob } from "../../types";

const pauseStorageKey = "modtech:queue-paused";

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("fr-DZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const executionTime = (job: QueueJob) => {
  if (!job.started_at) return "-";
  const end = job.completed_at ? new Date(job.completed_at) : new Date(job.updated_at);
  const start = new Date(job.started_at);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "-";
  const ms = Math.max(0, end.getTime() - start.getTime());
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
};

const statusTone = (status: string, s: ReturnType<typeof ms>) => {
  if (status === "Completed") return { bg: s.successSoft, color: s.success };
  if (status === "Failed") return { bg: s.errorSoft, color: s.error };
  if (status === "Processing") return { bg: s.primarySoft, color: s.primary };
  if (status === "Cancelled") return { bg: s.disabledSoft, color: s.sub };
  return { bg: s.warningSoft, color: s.warning };
};

export function QueueMonitorEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(pauseStorageKey) === "true";
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [detailsJob, setDetailsJob] = useState<QueueJob | null>(null);
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(true);

  const notify = useCallback((text: string, ok = true) => {
    setMessage(text);
    setMessageOk(ok);
    window.setTimeout(() => setMessage(""), 3500);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await loadQueueJobs();
    setLoading(false);
    if (error) {
      notify(error.message, false);
      return;
    }
    setJobs(data);
  }, [notify]);

  const runWorker = useCallback(async () => {
    if (paused || running) return;
    setRunning(true);
    const result = await processQueueJobs(8);
    setRunning(false);
    if (!result.ok) {
      notify(result.data?.error || "Queue worker failed", false);
      return;
    }
    await refresh();
  }, [notify, paused, refresh, running]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  useEffect(() => {
    window.localStorage.setItem(pauseStorageKey, String(paused));
  }, [paused]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      void runWorker();
    }, 7000);
    return () => window.clearInterval(timer);
  }, [paused, runWorker]);

  const counts = useMemo(() => ({
    pending: jobs.filter(job => job.status === "Pending").length,
    processing: jobs.filter(job => job.status === "Processing").length,
    completed: jobs.filter(job => job.status === "Completed").length,
    failed: jobs.filter(job => job.status === "Failed").length
  }), [jobs]);

  const selectedJobs = jobs.filter(job => selectedIds.includes(job.id));

  const runAction = async (action: () => Promise<{ error?: { message?: string } | null }>, success: string) => {
    const { error } = await action();
    if (error) notify(error.message || "Action failed", false);
    else notify(success);
    await refresh();
  };

  const retrySelected = async () => {
    await Promise.all(selectedJobs.map(job => retryQueueJob(job.id)));
    setSelectedIds([]);
    notify("Selected jobs scheduled.");
    await refresh();
  };

  const toggleSelected = (id: number) => {
    setSelectedIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  };

  const card = (label: string, value: number, Icon: typeof Clock, color: string, bg: string) => (
    <div style={{ background: s.surface, border: "1px solid " + s.brd, borderRadius: s.radius.lg, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: s.radius.md, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div style={{ color: s.sub, fontSize: 11, fontWeight: 850, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
        <div style={{ color: s.tx, fontSize: 22, fontWeight: 900 }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: s.tx, fontSize: 24, fontWeight: 900 }}>Queue Monitor</div>
          <div style={{ color: s.sub, fontSize: 13, fontWeight: 650, marginTop: 4 }}>Background jobs for external operations.</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setPaused(current => !current)} style={s.button(paused ? "primary" : "outline")}>
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {paused ? "Resume Queue" : "Pause Queue"}
          </button>
          <button type="button" onClick={runWorker} disabled={paused || running} style={s.button("primary", paused || running)}>
            {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Worker
          </button>
          <button type="button" onClick={refresh} disabled={loading} style={s.button("outline", loading)}>
            <RefreshCw className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
            Refresh
          </button>
        </div>
      </div>

      {message && (
        <div style={{ background: messageOk ? s.successSoft : s.errorSoft, color: messageOk ? s.success : s.error, border: "1px solid " + s.brd, borderRadius: s.radius.md, padding: "10px 14px", fontSize: 13, fontWeight: 800 }}>
          {message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {card("Pending Jobs", counts.pending, Clock, s.warning, s.warningSoft)}
        {card("Processing", counts.processing, RefreshCw, s.primary, s.primarySoft)}
        {card("Completed", counts.completed, CheckCircle, s.success, s.successSoft)}
        {card("Failed", counts.failed, AlertTriangle, s.error, s.errorSoft)}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={retrySelected} disabled={selectedIds.length === 0} style={s.button("outline", selectedIds.length === 0)}>
          <RotateCcw className="w-4 h-4" />
          Retry Selected
        </button>
        <button type="button" onClick={() => runAction(retryAllFailedJobs, "Failed jobs scheduled.")} style={s.button("outline")}>
          <RotateCcw className="w-4 h-4" />
          Retry All Failed
        </button>
        <button type="button" onClick={() => runAction(() => deleteJobsByStatus("Completed"), "Completed jobs deleted.")} style={s.button("outline")}>
          <Trash2 className="w-4 h-4" />
          Delete Completed
        </button>
        <button type="button" onClick={() => runAction(() => deleteJobsByStatus("Failed"), "Failed jobs deleted.")} style={s.button("danger")}>
          <Trash2 className="w-4 h-4" />
          Delete Failed
        </button>
      </div>

      <div style={{ overflow: "auto", border: "1px solid " + s.brd, borderRadius: s.radius.lg, background: s.surface }}>
        <table style={{ minWidth: 1080 }}>
          <thead>
            <tr>
              <th style={{ width: 44 }} />
              {["Job ID", "Job Type", "Status", "Retries", "Created At", "Started At", "Completed At", "Execution Time", "Last Error", ""].map(head => (
                <th key={head} style={{ textAlign: "left", padding: 12 }}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => {
              const tone = statusTone(job.status, s);
              return (
                <tr key={job.id}>
                  <td style={{ padding: 12 }}>
                    <input type="checkbox" checked={selectedIds.includes(job.id)} onChange={() => toggleSelected(job.id)} />
                  </td>
                  <td style={{ padding: 12, color: s.tx, fontWeight: 850 }}>#{job.id}</td>
                  <td style={{ padding: 12, color: s.tx, fontWeight: 800 }}>{job.job_type}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{ background: tone.bg, color: tone.color, borderRadius: 999, padding: "5px 9px", fontSize: 11, fontWeight: 900 }}>{job.status}</span>
                  </td>
                  <td style={{ padding: 12, color: s.sub, fontWeight: 750 }}>{job.retries}/{job.max_retries}</td>
                  <td style={{ padding: 12, color: s.sub, fontSize: 12 }}>{formatDateTime(job.created_at)}</td>
                  <td style={{ padding: 12, color: s.sub, fontSize: 12 }}>{formatDateTime(job.started_at)}</td>
                  <td style={{ padding: 12, color: s.sub, fontSize: 12 }}>{formatDateTime(job.completed_at)}</td>
                  <td style={{ padding: 12, color: s.sub, fontSize: 12 }}>{executionTime(job)}</td>
                  <td style={{ padding: 12, color: job.error_message ? s.error : s.sub, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.error_message || "-"}</td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" onClick={() => retryQueueJob(job.id).then(refresh)} title="Retry" style={s.button("ghost")}>
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => cancelQueueJob(job.id).then(refresh)} title="Cancel" style={s.button("ghost")}>
                        <Ban className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setDetailsJob(job)} title="View Details" style={s.button("ghost")}>
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={10} style={{ padding: 28, textAlign: "center", color: s.sub, fontWeight: 750 }}>No queue jobs yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(detailsJob)} onOpenChange={(open) => !open && setDetailsJob(null)}>
        <DialogContent className="max-w-3xl" style={{ background: s.elevated, color: s.tx, borderColor: s.brd }}>
          <DialogHeader>
            <DialogTitle style={{ color: s.tx }}>Job #{detailsJob?.id}</DialogTitle>
            <DialogDescription style={{ color: s.sub }}>{detailsJob?.job_type} · {detailsJob?.status}</DialogDescription>
          </DialogHeader>
          {detailsJob && (
            <div style={{ display: "grid", gap: 12, maxHeight: "68vh", overflow: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                <div style={s.cardStyle}>Execution Time<br /><strong>{executionTime(detailsJob)}</strong></div>
                <div style={s.cardStyle}>Attempts<br /><strong>{detailsJob.retries}/{detailsJob.max_retries}</strong></div>
                <div style={s.cardStyle}>Created<br /><strong>{formatDateTime(detailsJob.created_at)}</strong></div>
              </div>
              <pre style={{ background: dark ? "#0b0b0d" : "#0f172a", color: "#e2e8f0", borderRadius: s.radius.md, padding: 14, overflow: "auto", fontSize: 12 }}>
                {JSON.stringify(detailsJob.payload, null, 2)}
              </pre>
              <div style={{ background: s.surface, border: "1px solid " + s.brd, borderRadius: s.radius.md, padding: 12, color: detailsJob.error_message ? s.error : s.sub, fontWeight: 750 }}>
                {detailsJob.error_message || "No errors."}
              </div>
              <div style={{ background: s.surface, border: "1px solid " + s.brd, borderRadius: s.radius.md, padding: 12, color: s.sub, fontSize: 12, lineHeight: 1.6 }}>
                Status History: Created {formatDateTime(detailsJob.created_at)} · Started {formatDateTime(detailsJob.started_at)} · Completed {formatDateTime(detailsJob.completed_at)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
