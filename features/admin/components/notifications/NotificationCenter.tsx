"use client";

import { supabase } from "@/app/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Package,
  Search,
  Trash,
  Truck,
  UserPlus,
  Users,
  X
} from "lucide-react";
import { useCallback,useEffect,useMemo,useState } from "react";
import { AdminIconButton } from "../shared/AdminIconButton";
import {
  deleteAllNotifications,
  deleteNotification,
  convertPendingNotificationQueueJobs,
  loadNotifications,
  loadUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_CHANGED_EVENT
} from "../../services/notification.service";
import { ms } from "../../styles";
import type { NotificationRow } from "../../types";

const moduleLabels: Record<string, string> = {
  all: "Tous les modules",
  orders: "Commandes",
  products: "Produits",
  suppliers: "Fournisseurs",
  users: "Utilisateurs"
};

const typeLabels: Record<string, string> = {
  all: "Tous les types",
  order_created: "Nouvelle commande",
  order_assigned: "Commande assignée",
  order_assignee_changed: "Responsable modifié",
  order_confirmed: "Commande confirmée",
  order_status_changed: "Statut modifié",
  order_delivered: "Commande livrée",
  order_cancelled: "Commande annulée",
  product_created: "Produit ajouté",
  product_updated: "Produit modifié",
  product_deleted: "Produit supprimé",
  product_low_stock: "Stock bas",
  product_out_of_stock: "Stock épuisé",
  supplier_created: "Fournisseur ajouté",
  supplier_updated: "Fournisseur modifié",
  supplier_deleted: "Fournisseur supprimé",
  user_created: "Utilisateur ajouté",
  user_updated: "Utilisateur modifié",
  user_deleted: "Utilisateur supprimé"
};

const moduleOptions = ["all", "orders", "products", "suppliers", "users"];
const typeOptions = ["all", ...Object.keys(typeLabels).filter(type => type !== "all")];

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "A l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days} j`;
  return date.toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const getNotificationIcon = (notification: NotificationRow) => {
  if (notification.type.includes("stock") || notification.type.includes("cancelled")) return AlertTriangle;
  if (notification.type.includes("delivered")) return Truck;
  if (notification.type.includes("confirmed")) return CheckCircle;
  if (notification.type.includes("user_created")) return UserPlus;
  if (notification.module === "users") return Users;
  if (notification.module === "suppliers") return Truck;
  return Package;
};

export function NotificationCenter({
  dark,
  dirtyCount,
  connOk,
  onOpen
}: {
  dark: boolean;
  dirtyCount: number;
  connOk: boolean | null;
  onOpen?: () => void;
}) {
  const s = ms(dark);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");

  const refresh = useCallback(async () => {
    setLoading(true);
    await convertPendingNotificationQueueJobs();
    const [rowsResult, countResult] = await Promise.all([
      loadNotifications({ search, type: typeFilter, module: moduleFilter }),
      loadUnreadNotificationCount()
    ]);
    setLoading(false);

    if (rowsResult.error || countResult.error) {
      setErrorMessage("Centre de notifications indisponible. Appliquez la migration si elle ne l'est pas encore.");
      return;
    }

    setErrorMessage("");
    setNotifications(rowsResult.data);
    setUnreadCount(countResult.count);
  }, [moduleFilter, search, typeFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  useEffect(() => {
    const onChanged = () => void refresh();
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);

    const channel = supabase
      .channel("admin-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, onChanged)
      .subscribe();

    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [open, refresh]);

  const unreadLabel = unreadCount > 99 ? "99+" : String(unreadCount);
  const hasSystemNotice = dirtyCount > 0 || connOk === false;

  const groupedMeta = useMemo(() => ({
    unread: notifications.filter(notification => !notification.is_read).length,
    total: notifications.length
  }), [notifications]);

  const runAndRefresh = async (action: () => Promise<{ error: unknown }>) => {
    const { error } = await action();
    if (!error) await refresh();
  };

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => {
      setOpen(nextOpen);
      if (nextOpen) onOpen?.();
    }}>
      <SheetTrigger asChild>
        <div style={{ position: "relative" }}>
          <AdminIconButton
            dark={dark}
            label="Notifications"
            tone={unreadCount > 0 ? "primary" : "default"}
          >
            <Bell className="w-4 h-4" />
          </AdminIconButton>
          {unreadCount > 0 && (
            <Badge
              className="admin-notification-badge"
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                minWidth: 20,
                height: 20,
                padding: "0 6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                background: s.error,
                color: "#fff",
                border: "2px solid " + s.surface,
                fontSize: 10,
                fontWeight: 900
              }}
            >
              {unreadLabel}
            </Badge>
          )}
          {unreadCount === 0 && hasSystemNotice && (
            <span
              aria-hidden="true"
              className="admin-notification-status-dot"
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: connOk === false ? s.error : s.warning,
                border: "2px solid " + s.surface
              }}
            />
          )}
        </div>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="admin-notification-panel w-[min(460px,calc(100vw-24px))] border-l p-0"
        style={{
          background: s.elevated,
          borderColor: s.brd,
          color: s.tx,
          boxShadow: s.shadow
        }}
      >
        <SheetHeader className="border-b px-5 py-4 text-left" style={{ borderColor: s.brd }}>
          <div className="flex items-start justify-between gap-3 pr-8">
            <div>
              <SheetTitle style={{ color: s.tx, fontSize: 18, fontWeight: 900 }}>
                Notifications
              </SheetTitle>
              <SheetDescription style={{ color: s.sub, fontSize: 12, fontWeight: 650 }}>
                {groupedMeta.unread} non lue{groupedMeta.unread !== 1 ? "s" : ""} sur {groupedMeta.total}
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => runAndRefresh(markAllNotificationsRead)}
                disabled={unreadCount === 0}
                style={{ borderColor: s.brd, color: s.tx, background: s.surface }}
              >
                <CheckCircle className="w-4 h-4" />
                Tout lu
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => runAndRefresh(deleteAllNotifications)}
                disabled={notifications.length === 0}
                title="Supprimer toutes les notifications"
                aria-label="Supprimer toutes les notifications"
                style={{ borderColor: s.brd, color: s.error, background: s.surface }}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="border-b px-5 py-4" style={{ borderColor: s.brd }}>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: s.mut }} />
              <Input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Rechercher..."
                className="pl-9 pr-9"
                style={{ background: s.ibg, borderColor: s.brd, color: s.tx }}
              />
              {search && (
                <button
                  type="button"
                  aria-label="Effacer la recherche"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: s.mut }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => runAndRefresh(deleteAllNotifications)}
              disabled={notifications.length === 0}
              title="Clear all notifications"
              aria-label="Clear all notifications"
              style={{
                height: 44,
                flexShrink: 0,
                padding: "0 14px",
                borderColor: "transparent",
                borderWidth: 0,
                color: s.error,
                background: s.errorSoft,
                fontWeight: 850
              }}
            >
              <Trash className="h-4 w-4" />
              Clear all
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <select
              aria-label="Filtrer par type"
              value={typeFilter}
              onChange={event => setTypeFilter(event.target.value)}
              style={{
                minHeight: 40,
                borderRadius: s.radius.md,
                border: "1px solid " + s.brd,
                background: s.ibg,
                color: s.tx,
                padding: "0 10px",
                fontSize: 12,
                fontWeight: 750
              }}
            >
              {typeOptions.map(type => (
                <option key={type} value={type}>{typeLabels[type]}</option>
              ))}
            </select>
            <select
              aria-label="Filtrer par module"
              value={moduleFilter}
              onChange={event => setModuleFilter(event.target.value)}
              style={{
                minHeight: 40,
                borderRadius: s.radius.md,
                border: "1px solid " + s.brd,
                background: s.ibg,
                color: s.tx,
                padding: "0 10px",
                fontSize: 12,
                fontWeight: 750
              }}
            >
              {moduleOptions.map(module => (
                <option key={module} value={module}>{moduleLabels[module]}</option>
              ))}
            </select>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-214px)]">
          <div className="flex flex-col gap-2 p-4">
            {hasSystemNotice && (
              <div
                className="admin-notification-item"
                style={{
                  border: "1px solid " + s.brd,
                  borderRadius: s.radius.md,
                  background: connOk === false ? s.errorSoft : s.warningSoft,
                  color: connOk === false ? s.error : s.warning,
                  padding: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  lineHeight: 1.5
                }}
              >
                {connOk === false
                  ? "Connexion aux données administrateur indisponible."
                  : `${dirtyCount} section${dirtyCount > 1 ? "s" : ""} avec modifications non sauvegardées.`}
              </div>
            )}

            {errorMessage && (
              <div style={{ background: s.errorSoft, color: s.error, borderRadius: s.radius.md, padding: 12, fontSize: 12, fontWeight: 800 }}>
                {errorMessage}
              </div>
            )}

            {!errorMessage && loading && (
              <div style={{ color: s.sub, fontSize: 13, fontWeight: 750, padding: 16 }}>
                Chargement des notifications...
              </div>
            )}

            {!errorMessage && !loading && notifications.length === 0 && (
              <div style={{ color: s.sub, fontSize: 13, fontWeight: 750, padding: 24, textAlign: "center" }}>
                Aucune notification.
              </div>
            )}

            {!errorMessage && notifications.map((notification) => {
              const Icon = getNotificationIcon(notification);
              return (
                <div
                  key={notification.id}
                  className="admin-notification-item"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 1fr auto",
                    gap: 12,
                    alignItems: "start",
                    border: "1px solid " + (notification.is_read ? s.brd : s.primary),
                    borderRadius: s.radius.md,
                    background: notification.is_read ? s.surface : s.primarySoft,
                    padding: 12
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: s.radius.md,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: notification.is_read ? s.ibg : s.elevated,
                      color: notification.type.includes("stock") || notification.type.includes("cancelled") ? s.warning : s.primary
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => !notification.is_read && runAndRefresh(() => markNotificationRead(notification.id))}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      textAlign: "left",
                      cursor: notification.is_read ? "default" : "pointer",
                      minWidth: 0
                    }}
                  >
                    <div style={{ color: s.tx, fontSize: 13, fontWeight: 900, lineHeight: 1.35 }}>
                      {notification.title}
                    </div>
                    <div style={{ color: s.sub, fontSize: 12, fontWeight: 650, lineHeight: 1.5, marginTop: 3 }}>
                      {notification.message}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, color: s.mut, fontSize: 11, fontWeight: 750 }}>
                      <span>{formatRelativeTime(notification.created_at)}</span>
                      {!notification.is_read && (
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.primary }} />
                      )}
                      <span>{moduleLabels[notification.module] || notification.module}</span>
                    </div>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => runAndRefresh(() => deleteNotification(notification.id))}
                    style={{ width: 32, height: 32, color: s.error }}
                    aria-label="Supprimer la notification"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
