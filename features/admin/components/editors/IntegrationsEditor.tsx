"use client";

import {
  AlertTriangle,
  CheckCircle,
  Clipboard,
  FileSpreadsheet,
  HelpCircle,
  MessageCircle,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Slack,
  TerminalSquare,
  Webhook,
  Workflow,
  Zap
} from "lucide-react";
import React,{ useCallback,useEffect,useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  GOOGLE_APPS_SCRIPT_CODE,
  GOOGLE_SHEETS_SERVICE,
  loadIntegration,
  loadLastOrder,
  loadPendingOrders,
  resetIntegration,
  saveIntegration
} from "../../services/integration.service";
import { ms,teal } from "../../styles";
import type { Integration } from "../../types";

type SyncStats = {
  lastSyncAt: string | null;
  sentCount: number;
  failedCount: number;
  lastError: string;
};

const statsStorageKey = "modtech:google-sheets-stats";

const defaultStats: SyncStats = {
  lastSyncAt: null,
  sentCount: 0,
  failedCount: 0,
  lastError: ""
};

const futureIntegrations = [
  { name: "WhatsApp", icon: MessageCircle },
  { name: "Telegram", icon: Send },
  { name: "Discord", icon: MessageCircle },
  { name: "Slack", icon: Slack },
  { name: "Webhooks", icon: Webhook },
  { name: "Zapier", icon: Zap },
  { name: "Make", icon: Workflow },
  { name: "n8n", icon: TerminalSquare }
];

const helpSteps = [
  "Ouvrez Google Drive.",
  "Créez un nouveau Google Spreadsheet.",
  "Ouvrez Extensions puis Apps Script.",
  "Supprimez le code par défaut.",
  "Cliquez sur Copy Script depuis MOD-TECH.",
  "Collez le code dans Apps Script.",
  "Cliquez sur Deploy.",
  "Choisissez Web App.",
  "Définissez les permissions sur Anyone.",
  "Copiez l'URL du Web App.",
  "Collez l'URL dans Google Apps Script URL.",
  "Cliquez sur Test Connection, puis Save quand le test réussit."
];

const formatDateTime = (value: string | null) => {
  if (!value) return "Jamais";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Jamais";
  return date.toLocaleString("fr-DZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatGoogleSheetResult = (data: unknown) => {
  const result = typeof data === "object" && data !== null && "result" in data
    ? (data as { result?: unknown }).result
    : null;
  if (typeof result !== "object" || result === null) return "";

  const sheet = "sheet" in result ? String((result as { sheet?: unknown }).sheet || "") : "";
  const row = "row" in result ? String((result as { row?: unknown }).row || "") : "";
  if (!sheet && !row) return "";

  return ` Sheet: ${sheet || "Orders"}${row ? `, Row: ${row}` : ""}.`;
};

export function IntegrationsEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [endpoint, setEndpoint] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState("");
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [messageOk, setMessageOk] = useState(true);
  const [stats, setStats] = useState<SyncStats>(() => {
    if (typeof window === "undefined") return defaultStats;
    const savedStats = window.localStorage.getItem(statsStorageKey);
    if (!savedStats) return defaultStats;
    try {
      return { ...defaultStats, ...JSON.parse(savedStats) };
    } catch {
      return defaultStats;
    }
  });

  const connectionStatus = enabled && endpoint.trim() ? "connected" : "not_connected";

  const notify = useCallback((text: string, ok = true) => {
    setMessage(text);
    setMessageOk(ok);
    window.setTimeout(() => setMessage(""), 4500);
  }, []);

  const persistStats = (nextStats: SyncStats) => {
    setStats(nextStats);
    window.localStorage.setItem(statsStorageKey, JSON.stringify(nextStats));
  };

  const recordSyncSuccess = (count = 1) => {
    persistStats({
      ...stats,
      lastSyncAt: new Date().toISOString(),
      sentCount: stats.sentCount + count,
      lastError: ""
    });
  };

  const recordSyncFailure = (error: string) => {
    persistStats({
      ...stats,
      failedCount: stats.failedCount + 1,
      lastError: error
    });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.resolve().then(async () => {
        setLoading(true);
        const { data, error } = await loadIntegration();
        setLoading(false);

        if (error) {
          notify("Appliquez la migration Integrations avant d'utiliser cette page.", false);
          return;
        }

        setIntegration(data);
        setEndpoint(data?.endpoint || "");
        setEnabled(Boolean(data?.enabled));
      });
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [notify]);

  const save = async () => {
    setSaving(true);
    const { data, error } = await saveIntegration({
      service: GOOGLE_SHEETS_SERVICE,
      endpoint,
      enabled
    });
    setSaving(false);

    if (error) {
      notify(error.message, false);
      return;
    }

    setIntegration(data);
    notify("Integration sauvegardée.");
  };

  const reset = async () => {
    setSaving(true);
    const { data, error } = await resetIntegration();
    setSaving(false);

    if (error) {
      notify(error.message, false);
      return;
    }

    setIntegration(data);
    setEndpoint("");
    setEnabled(false);
    notify("Integration réinitialisée.");
  };

  const callGoogleSheet = async (body: Record<string, unknown>) => {
    const response = await fetch("/api/google-sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.ok === false) {
      const details = data.details || data.result?.error || data.result;
      const detailsText = typeof details === "string" ? details : details ? JSON.stringify(details) : "";
      throw new Error([data.error || "Google Sheets request failed", detailsText].filter(Boolean).join(": "));
    }

    return data;
  };

  const testConnection = async () => {
    if (!endpoint.trim()) {
      notify("Ajoutez l'URL Google Apps Script.", false);
      return;
    }

    setTesting(true);
    try {
      const data = await callGoogleSheet({ endpoint, test: true });
      const saved = await saveIntegration({
        service: GOOGLE_SHEETS_SERVICE,
        endpoint,
        enabled: true
      });
      if (saved.error) throw saved.error;
      setIntegration(saved.data);
      setEnabled(true);
      recordSyncSuccess(1);
      notify("Connected Successfully. Saved." + formatGoogleSheetResult(data));
    } catch (error) {
      const text = error instanceof Error ? error.message : "Connection failed";
      recordSyncFailure(text);
      notify(text, false);
    } finally {
      setTesting(false);
    }
  };

  const syncOrder = async (order: unknown, successMessage: string) => {
    if (!endpoint.trim()) {
      notify("Ajoutez et sauvegardez l'URL Google Apps Script.", false);
      return;
    }

    const data = await callGoogleSheet({ endpoint, order });
    recordSyncSuccess(1);
    notify(successMessage + formatGoogleSheetResult(data));
  };

  const syncLastOrder = async () => {
    setSyncing("last");
    try {
      const { data, error } = await loadLastOrder();
      if (error) throw error;
      if (!data) {
        notify("Aucune commande trouvée.", false);
        return;
      }
      await syncOrder(data, "Dernière commande synchronisée.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Sync failed";
      recordSyncFailure(text);
      notify(text, false);
    } finally {
      setSyncing("");
    }
  };

  const syncAllPending = async () => {
    setSyncing("pending");
    try {
      const { data, error } = await loadPendingOrders();
      if (error) throw error;
      const orders = data ?? [];
      if (orders.length === 0) {
        notify("Aucune commande en attente.");
        return;
      }

      for (const order of orders) {
        await callGoogleSheet({ endpoint, order });
      }

      recordSyncSuccess(orders.length);
      notify(`${orders.length} commande${orders.length > 1 ? "s" : ""} synchronisée${orders.length > 1 ? "s" : ""}.`);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Pending sync failed";
      recordSyncFailure(text);
      notify(text, false);
    } finally {
      setSyncing("");
    }
  };

  const retryFailedSync = async () => {
    if (!stats.lastError) {
      notify("Aucune erreur à relancer.");
      return;
    }
    await syncLastOrder();
  };

  const copyScript = async () => {
    await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const inputStyle: React.CSSProperties = {
    ...s.inputStyle,
    width: "100%",
    boxSizing: "border-box",
    minHeight: 54,
    paddingRight: 166
  };

  const iconButton = (tone: "primary" | "soft" | "ghost" | "danger" = "soft", disabled = false): React.CSSProperties => ({
    border: "none",
    borderRadius: s.radius.md,
    width: 44,
    height: 44,
    minHeight: 44,
    padding: 0,
    flex: "0 0 44px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.58 : 1,
    color: tone === "primary" ? "#fff" : tone === "danger" ? s.error : tone === "ghost" ? s.sub : s.primary,
    background: tone === "primary"
      ? `linear-gradient(135deg, ${s.primary}, ${s.primaryHover})`
      : tone === "danger"
        ? s.errorSoft
        : tone === "ghost"
          ? "transparent"
          : s.primarySoft,
    boxShadow: tone === "primary" && !disabled ? "0 12px 22px rgba(13, 148, 136, 0.22)" : "none",
    transition: "background 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease"
  });

  const statusColor = connectionStatus === "connected" ? s.success : s.sub;

  const statsTitle = [
    `Last sync: ${formatDateTime(stats.lastSyncAt)}`,
    `Sent: ${stats.sentCount}`,
    `Failed: ${stats.failedCount}`,
    `Last error: ${stats.lastError || "None"}`
  ].join("\n");

  const savedTitle = integration?.updated_at ? `Saved: ${formatDateTime(integration.updated_at)}` : "";

  const inputTitle = [
    "Google Apps Script URL",
    "Use the Web App URL ending with /exec.",
    savedTitle
  ].filter(Boolean).join("\n");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 24, fontWeight: 900, color: s.tx, lineHeight: 1.2 }}>Integrations</div>

      {message && (
        <div style={{
          background: messageOk ? s.successSoft : s.errorSoft,
          color: messageOk ? s.success : s.error,
          border: "1px solid " + s.brd,
          borderRadius: s.radius.md,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          fontWeight: 800
        }}>
          {messageOk ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {message}
        </div>
      )}

      <div className="admin-list-item" style={{ ...s.cardStyle, display: "flex", flexDirection: "column", gap: 14, padding: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: s.radius.md, background: s.primarySoft, color: teal, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: s.tx }}>Google Sheets</div>
            </div>
          </div>
          {connectionStatus === "connected" ? (
            <CheckCircle className="w-5 h-5" aria-label="Connected" style={{ color: statusColor }} />
          ) : (
            <AlertTriangle className="w-5 h-5" aria-label="Not connected" style={{ color: statusColor }} />
          )}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" aria-label="Generate Script" title="Generate Script" style={iconButton("primary")}>
                <TerminalSquare className="w-4 h-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl" style={{ background: s.elevated, borderColor: s.brd, color: s.tx }}>
              <DialogHeader>
                <DialogTitle style={{ color: s.tx }}>Google Apps Script</DialogTitle>
                <DialogDescription style={{ color: s.sub }}>Code généré localement depuis MOD-TECH.</DialogDescription>
              </DialogHeader>
              <pre style={{
                margin: 0,
                maxHeight: "58vh",
                overflow: "auto",
                background: dark ? "#0b0b0d" : "#0f172a",
                color: "#e2e8f0",
                borderRadius: s.radius.md,
                padding: 16,
                fontSize: 12,
                lineHeight: 1.55
              }}>
                <code>{GOOGLE_APPS_SCRIPT_CODE}</code>
              </pre>
              <Button type="button" onClick={copyScript} style={{ background: teal, color: "#fff" }}>
                <Clipboard className="w-4 h-4" />
                {copied ? "Script copied" : "Copy Script"}
              </Button>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <button type="button" aria-label="Help" title="Help" style={iconButton("soft")}>
                <HelpCircle className="w-4 h-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" style={{ background: s.elevated, borderColor: s.brd, color: s.tx }}>
              <DialogHeader>
                <DialogTitle style={{ color: s.tx }}>Configuration Google Sheets</DialogTitle>
                <DialogDescription style={{ color: s.sub }}>Suivez ces étapes dans l&apos;ordre.</DialogDescription>
              </DialogHeader>
              <div style={{ display: "grid", gap: 10, maxHeight: "62vh", overflow: "auto", paddingRight: 4 }}>
                {helpSteps.map((step, index) => (
                  <div key={step} style={{ display: "grid", gridTemplateColumns: "74px 1fr", gap: 12, alignItems: "start" }}>
                    <div style={{ color: teal, fontSize: 12, fontWeight: 900 }}>Étape {index + 1}</div>
                    <div style={{ color: s.tx, fontSize: 13, fontWeight: 700, lineHeight: 1.55 }}>{step}</div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: s.elevated, border: "1px solid " + s.brd, borderRadius: s.radius.md, padding: 12 }}>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
          <button type="button" aria-label="Stats" title={statsTitle} style={iconButton("ghost")}>
            <Zap className="w-4 h-4" />
          </button>
        </div>

        <div style={{ position: "relative" }}>
          <input
            aria-label="Google Apps Script URL"
            title={inputTitle}
            value={endpoint}
            onChange={event => setEndpoint(event.target.value)}
            placeholder="https://script.google.com/macros/s/..."
            style={inputStyle}
          />
          <div style={{
            position: "absolute",
            right: 5,
            top: 5,
            display: "flex",
            gap: 6,
            padding: 3,
            borderRadius: s.radius.lg,
            background: dark ? "rgba(255,255,255,0.04)" : "rgba(248,250,252,0.88)",
            backdropFilter: "blur(10px)"
          }}>
            <button type="button" onClick={testConnection} disabled={testing || loading} aria-label="Test Connection" title="Test Connection" style={iconButton("primary", testing || loading)}>
              {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            </button>
            <button type="button" onClick={save} disabled={saving || loading} aria-label="Save" title="Save" style={iconButton("soft", saving || loading)}>
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </button>
            <button type="button" onClick={reset} disabled={saving || loading} aria-label="Reset" title="Reset" style={iconButton("ghost", saving || loading)}>
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <details style={{ borderTop: "1px solid " + s.brd, paddingTop: 10 }}>
          <summary aria-label="Advanced sync tools" title="Advanced sync tools" style={{ cursor: "pointer", color: s.tx, fontSize: 0, fontWeight: 900 }}>
            <Workflow className="w-4 h-4" />
          </summary>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <button type="button" onClick={retryFailedSync} disabled={syncing === "last"} aria-label="Retry Failed Sync" title="Retry Failed Sync" style={iconButton("soft", syncing === "last")}>
              {syncing === "last" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            </button>
            <button type="button" onClick={syncLastOrder} disabled={syncing === "last"} aria-label="Sync Last Order" title="Sync Last Order" style={iconButton("soft", syncing === "last")}>
              {syncing === "last" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
            <button type="button" onClick={syncAllPending} disabled={syncing === "pending"} aria-label="Sync All Pending" title="Sync All Pending" style={iconButton("soft", syncing === "pending")}>
              {syncing === "pending" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Workflow className="w-4 h-4" />}
            </button>
          </div>
        </details>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
        {futureIntegrations.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} style={{
              background: s.surface,
              border: "1px dashed " + s.colors.borderStrong,
              borderRadius: s.radius.lg,
              padding: 14,
              opacity: 0.72,
              display: "flex",
              alignItems: "center",
              gap: 12
            }}>
              <div style={{ width: 36, height: 36, borderRadius: s.radius.md, background: s.disabledSoft, color: s.sub, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon className="w-4 h-4" />
              </div>
              <div style={{ color: s.tx, fontSize: 13, fontWeight: 900 }}>{item.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
