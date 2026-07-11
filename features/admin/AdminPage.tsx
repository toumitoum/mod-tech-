"use client";

import {
CheckCircle2,
ChevronDown,
ChevronRight,
CircleAlert,
LogOut,
Menu,
Moon,
PanelLeftClose,
RefreshCw,
Save,
Search,
Sun,
UserCircle,
X
} from "lucide-react";
import { useEffect,useMemo,useRef,useState } from "react";
import { NotificationCenter } from "./components/notifications/NotificationCenter";
import {
AboutEd,
AuditLogEd,
ContactEd,
EmailEd,
HomeHeroEd,
IntegrationsEd,
LinksEd,
OrdersEd,
PartnersEd,
ProductsEd,
QueueMonitorEd,
ReussitesEd,
SecurityEd,
ServicesEd,
SliderEd,
StoreHeroEd,
SuppliersEd,
UsersEd,
} from "./components/editors";
import { AdminIconButton } from "./components/shared/AdminIconButton";
import { ADMIN_NAV,ADMIN_NAV_GROUPS,AUTO_SAVE_SECTIONS } from "./constants/navigation";
import { useAdminDashboard } from "./hooks/useAdminDashboard";
import { ms } from "./styles";

type AdminNavItem = (typeof ADMIN_NAV)[number];

const adminEmojiPattern = /[\p{Extended_Pictographic}\uFE0F]/gu;
const floatingMenuCloseDelay = 900;

function cleanAdminMessage(value: string) {
  return value.replace(adminEmojiPattern, "").replace(/\s+/g, " ").trim();
}

export default function AdminPage() {
  const {
    active,
    activeNav,
    activeRow,
    authChecked,
    connOk,
    dark,
    dirty,
    dirtyCount,
    drafts,
    isAuto,
    load,
    loadPartners,
    loadSlides,
    logout,
    msg,
    mok,
    open,
    partners,
    reset,
    rows,
    save,
    setActive,
    setDraft,
    setOpen,
    slides,
    status,
    toggleTheme,
    userEmail,
  } = useAdminDashboard();

  const [headerSearch, setHeaderSearch] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ADMIN_NAV_GROUPS.map((group) => [group.key, false])),
  );
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navByKey = useMemo(() => new Map<string, AdminNavItem>(ADMIN_NAV.map((item) => [item.key, item])), []);
  const activeGroup = useMemo(
    () => ADMIN_NAV_GROUPS.find((group) => (group.items as readonly string[]).includes(active)),
    [active],
  );
  const filteredGroups = useMemo(() => {
    return ADMIN_NAV_GROUPS.map((group) => ({
      ...group,
      items: (group.items as readonly string[])
        .map((key) => navByKey.get(key))
        .filter(Boolean),
    })).filter((group) => group.items.length > 0);
  }, [navByKey]);

  const currentMessage = cleanAdminMessage(msg);
  const s = ms(dark);
  const headerSearchResults = useMemo(() => {
    const query = headerSearch.trim().toLowerCase();
    if (!query) return [];
    return ADMIN_NAV.filter((item) =>
      [item.label, item.desc, item.key].some((value) => String(value).toLowerCase().includes(query)),
    ).slice(0, 6);
  }, [headerSearch]);

  const goToSection = (key: string) => {
    setActive(key);
    setHeaderSearch("");
  };

  const clearFloatingMenuTimer = (timer: { current: ReturnType<typeof setTimeout> | null }) => {
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = null;
  };

  const closeUserMenuSoon = () => {
    clearFloatingMenuTimer(userMenuCloseTimer);
    userMenuCloseTimer.current = setTimeout(() => setUserMenuOpen(false), floatingMenuCloseDelay);
  };

  useEffect(() => {
    const closeFloatingMenus = (event: PointerEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current?.contains(target)) return;
      clearFloatingMenuTimer(userMenuCloseTimer);
      setUserMenuOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      clearFloatingMenuTimer(userMenuCloseTimer);
      setUserMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeFloatingMenus);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      clearFloatingMenuTimer(userMenuCloseTimer);
      document.removeEventListener("pointerdown", closeFloatingMenus);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  // ← الآن فقط return بعد كل الـ hooks
  if (!authChecked) return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: s.bg,
      flexDirection: "column", gap: s.space.sm, fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: s.radius.lg,
        background: s.primary,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: s.shadow
      }}>
        <RefreshCw className="w-5 h-5 animate-spin" style={{ color: "#fff" }} />
      </div>
      <div style={{ color: s.primary, fontSize: s.typography.subtitle.fontSize, fontWeight: 800 }}>
        Vérification en cours...
      </div>
    </div>
  );

  return (
    <div className={`admin-dashboard-shell${dark ? " admin-dark" : ""}`} style={{
      minHeight: "100vh",
      background: s.bg,
      color: s.tx,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      transition: "background 0.3s, color 0.3s"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        .admin-dashboard-shell, .admin-dashboard-shell * {
          box-sizing: border-box;
        }
        
        .admin-dashboard-shell {
          --admin-bg: ${s.bg};
          --admin-surface: ${s.surface};
          --admin-surface-elevated: ${s.elevated};
          --admin-card: ${s.surface};
          --admin-border: ${s.brd};
          --admin-border-strong: ${s.colors.borderStrong};
          --admin-input: ${s.ibg};
          --admin-table-line: ${s.brd};
          --admin-table-head: ${s.primarySoft};
          --admin-text: ${s.tx};
          --admin-text-secondary: ${s.sub};
          --admin-text-muted: ${s.mut};
          --admin-primary: ${s.primary};
          --admin-primary-hover: ${s.primaryHover};
          --admin-primary-soft: ${s.primarySoft};
          --admin-ring: ${s.focusRing};
          --admin-hover: ${s.hover};
          --admin-success: ${s.success};
          --admin-success-soft: ${s.successSoft};
          --admin-warning: ${s.warning};
          --admin-warning-soft: ${s.warningSoft};
          --admin-error: ${s.error};
          --admin-error-soft: ${s.errorSoft};
          --admin-disabled: ${s.disabled};
          --admin-disabled-soft: ${s.disabledSoft};
          --admin-panel-shadow: ${s.shadow};
          --admin-soft-shadow: ${s.softShadow};
          --admin-radius-sm: ${s.radius.sm}px;
          --admin-radius-md: ${s.radius.md}px;
          --admin-radius-lg: ${s.radius.lg}px;
          --admin-space-xs: ${s.space.xs}px;
          --admin-space-sm: ${s.space.sm}px;
          --admin-space-md: ${s.space.md}px;
        }

        .admin-dashboard-shell.admin-dark label,
        .admin-dashboard-shell.admin-dark [style*="color: #475569"],
        .admin-dashboard-shell.admin-dark [style*="color:#475569"],
        .admin-dashboard-shell.admin-dark [style*="color: #64748b"],
        .admin-dashboard-shell.admin-dark [style*="color:#64748b"],
        .admin-dashboard-shell.admin-dark [style*="color: #94a3b8"],
        .admin-dashboard-shell.admin-dark [style*="color:#94a3b8"],
        .admin-dashboard-shell.admin-dark [style*="color: #b6b6bd"],
        .admin-dashboard-shell.admin-dark [style*="color:#b6b6bd"],
        .admin-dashboard-shell.admin-dark [style*="color: #7f8087"],
        .admin-dashboard-shell.admin-dark [style*="color:#7f8087"],
        .admin-dashboard-shell.admin-dark [style*="color: #5f6067"],
        .admin-dashboard-shell.admin-dark [style*="color:#5f6067"] {
          color: #ffffff !important;
        }

        html,
        body {
          background: ${s.bg} !important;
        }

        .admin-dashboard-shell,
        .admin-dashboard-shell .admin-main-layout,
        .admin-dashboard-shell .admin-content {
          background: var(--admin-bg) !important;
        }

        .admin-dashboard-shell button,
        .admin-dashboard-shell a,
        .admin-dashboard-shell input,
        .admin-dashboard-shell textarea,
        .admin-dashboard-shell select {
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, color 0.18s ease, transform 0.18s ease, opacity 0.18s ease;
        }

        .admin-dashboard-shell button:focus-visible,
        .admin-dashboard-shell a:focus-visible,
        .admin-dashboard-shell input:focus-visible,
        .admin-dashboard-shell textarea:focus-visible,
        .admin-dashboard-shell select:focus-visible {
          outline: none;
          box-shadow: 0 0 0 4px var(--admin-ring) !important;
        }

        .admin-dashboard-shell button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: var(--admin-soft-shadow) !important;
        }

        .admin-dashboard-shell input:not([type="file"]),
        .admin-dashboard-shell textarea,
        .admin-dashboard-shell select {
          min-height: 48px;
          border-color: var(--admin-border) !important;
          background: var(--admin-input) !important;
          border-radius: var(--admin-radius-md) !important;
          color: var(--admin-text) !important;
          box-shadow: none !important;
        }

        .admin-dashboard-shell button {
          border-color: transparent !important;
        }

        .admin-dashboard-shell button[style*="background: transparent"] {
          box-shadow: none !important;
        }

        .admin-dashboard-shell div[style*="border: 1px solid"],
        .admin-dashboard-shell aside[style*="border: 1px solid"],
        .admin-dashboard-shell span[style*="border: 1px solid"] {
          border-color: var(--admin-border) !important;
        }

          .admin-dashboard-shell input[style*="border: 1px solid"],
          .admin-dashboard-shell textarea[style*="border: 1px solid"],
          .admin-dashboard-shell select[style*="border: 1px solid"] {
          border-color: var(--admin-border) !important;
        }

        .admin-dashboard-shell [style*="borderBottom"],
        .admin-dashboard-shell [style*="border-bottom"] {
          border-color: var(--admin-table-line) !important;
        }

        .admin-dashboard-shell [style*="borderTop"],
        .admin-dashboard-shell [style*="border-top"] {
          border-color: var(--admin-table-line) !important;
        }

        .admin-dashboard-shell [style*="border: 2px dashed"] {
          border-color: var(--admin-border-strong) !important;
          background: var(--admin-primary-soft) !important;
        }

        .admin-dashboard-shell [style*="box-shadow"],
        .admin-dashboard-shell [style*="boxShadow"] {
          box-shadow: var(--admin-soft-shadow) !important;
        }

        .admin-dashboard-shell .admin-page-toolbar {
          border-color: transparent !important;
          box-shadow: none !important;
          background: transparent !important;
        }

        .admin-dashboard-shell .admin-card {
          border-color: var(--admin-border) !important;
          box-shadow: var(--admin-panel-shadow) !important;
          border-radius: var(--admin-radius-lg) !important;
        }

        .admin-dashboard-shell .admin-list-item {
          border-color: var(--admin-border-strong) !important;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04), inset 0 0 0 1px var(--admin-border) !important;
        }

        .admin-dashboard-shell tr.admin-list-item {
          box-shadow: none !important;
        }

        .admin-dashboard-shell tr.admin-list-item td {
          border-top: 1px solid var(--admin-border-strong) !important;
          border-bottom: 1px solid var(--admin-border-strong) !important;
        }

        .admin-dashboard-shell input:focus,
        .admin-dashboard-shell textarea:focus,
        .admin-dashboard-shell select:focus {
          border-color: var(--admin-primary) !important;
          box-shadow: 0 0 0 4px var(--admin-ring) !important;
          outline: none;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }

        .admin-dashboard-shell .admin-skeleton {
          position: relative;
          overflow: hidden;
          background: var(--admin-disabled-soft);
        }

        .admin-dashboard-shell .admin-skeleton::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, ${dark ? "rgba(239,250,247,0.08)" : "rgba(255,255,255,0.72)"}, transparent);
          animation: shimmer 1.4s infinite;
        }

        .admin-dashboard-shell ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .admin-dashboard-shell ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .admin-dashboard-shell ::-webkit-scrollbar-thumb {
          background: var(--admin-disabled);
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        
        .admin-dashboard-shell ::-webkit-scrollbar-thumb:hover {
          background: var(--admin-text-muted);
          background-clip: padding-box;
        }

        .admin-dashboard-shell table {
          border-collapse: separate;
          border-spacing: 0;
          width: 100%;
        }

        .admin-dashboard-shell table thead tr {
          background: ${dark ? s.elevated : "#f8fafc"} !important;
        }

        .admin-dashboard-shell table thead th {
          position: sticky;
          top: 0;
          z-index: 2;
          backdrop-filter: blur(12px);
        }

        .admin-dashboard-shell table th {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-color: var(--admin-table-line) !important;
          color: var(--admin-text-secondary) !important;
          padding-top: 16px !important;
          padding-bottom: 16px !important;
        }

        .admin-dashboard-shell table td {
          border-color: var(--admin-table-line) !important;
          padding-top: 16px !important;
          padding-bottom: 16px !important;
        }

        .admin-dashboard-shell table tbody tr {
          transition: background 0.16s ease;
        }

        .admin-dashboard-shell table tbody tr:hover {
          background: var(--admin-hover) !important;
        }

        .admin-dashboard-shell .admin-toast {
          animation: adminToastIn 0.22s ease both;
        }

        .admin-dashboard-shell .admin-popover {
          animation: adminPopoverIn 0.18s ease both;
          transform-origin: top right;
        }

        .admin-dashboard-shell .admin-notification-badge {
          animation: adminBadgePulse 1.7s ease-in-out infinite;
        }

        .admin-dashboard-shell .admin-notification-status-dot {
          animation: adminFadePulse 1.9s ease-in-out infinite;
        }

        .admin-notification-panel {
          animation: adminNotificationSlideIn 0.24s ease both;
        }

        .admin-notification-panel .admin-notification-item {
          animation: adminNotificationFadeIn 0.2s ease both;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
        }

        .admin-notification-panel .admin-notification-item:hover {
          transform: translateY(-1px);
          box-shadow: var(--admin-soft-shadow);
        }

        .admin-dashboard-shell .admin-empty-state {
          min-height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          text-align: center;
          border-radius: var(--admin-radius-lg);
          background: var(--admin-surface);
          box-shadow: var(--admin-soft-shadow);
          padding: 32px;
        }

        @keyframes adminToastIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes adminPopoverIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes adminBadgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        @keyframes adminFadePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.52; }
        }

        @keyframes adminNotificationSlideIn {
          from { opacity: 0; transform: translateX(18px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes adminNotificationFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hide-sm {
          display: none;
        }

        @media (min-width: 768px) {
          .hide-sm {
            display: flex;
          }
        }

        @media (max-width: 768px) {
          .admin-content {
            padding: 14px !important;
          }
          .admin-card {
            padding: 16px !important;
          }
          .admin-header-search {
            display: none !important;
          }
          .admin-page-toolbar {
            align-items: stretch !important;
          }
          .admin-page-toolbar-actions {
            width: 100%;
            justify-content: stretch !important;
          }
          .admin-page-toolbar-actions button:not([data-admin-icon-button="true"]) {
            flex: 1;
          }
          .admin-page-toolbar-actions button[data-admin-icon-button="true"] {
            flex: 0 0 40px;
          }
        }
      `}</style>

      <div style={{
        background: s.surface,
        border: "none",
        borderBottom: "1px solid " + s.brd,
        borderRadius: 0,
        minHeight: 82,
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(18px)",
        gap: 12,
        margin: 0,
        boxShadow: "none"
      }}>
        <button type="button"
          onClick={() => setOpen(!open)}
          className="menu-button"
          style={{
            width: 40,
            height: 40,
            background: "transparent",
            border: "1px solid transparent",
            borderRadius: s.radius.md,
            cursor: "pointer",
            color: s.sub,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {open ? <PanelLeftClose className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        <img src="/images/logo.png" alt="MOD-TECH" style={{ width: 38, height: 38, objectFit: "contain", flexShrink: 0 }} />

        <nav aria-label="Breadcrumb" style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          minWidth: 0,
          color: s.sub,
          fontSize: 12,
          fontWeight: 700
        }}>
          <span style={{ color: s.tx, fontWeight: 850, whiteSpace: "nowrap" }}>MOD-TECH</span>
          <ChevronRight className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: "nowrap" }}>{activeGroup?.label || "Admin"}</span>
          <ChevronRight className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
          <span style={{ color: s.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {activeNav?.label || "Dashboard"}
          </span>
        </nav>

        <div style={{ flex: 1 }} />

        <div className="admin-header-search" style={{ position: "relative", width: "min(360px, 30vw)" }}>
          <Search className="w-4 h-4" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: s.mut, pointerEvents: "none" }} />
          <input
            aria-label="Rechercher une section"
            value={headerSearch}
            onChange={e => setHeaderSearch(e.target.value)}
            placeholder="Rechercher..."
            style={{
              width: "100%",
              minHeight: 44,
              padding: "10px 14px 10px 40px",
              borderRadius: s.radius.lg,
              border: "1px solid " + s.brd,
              background: s.ibg,
              color: s.tx,
              fontSize: 13,
              fontWeight: 650,
              outline: "none"
            }}
          />
          {headerSearchResults.length > 0 && (
            <div className="admin-popover" style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              background: s.elevated,
              border: "1px solid " + s.brd,
              borderRadius: s.radius.lg,
              boxShadow: s.shadow,
              overflow: "hidden",
              padding: 6,
              zIndex: 180
            }}>
              {headerSearchResults.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => goToSection(item.key)}
                  style={{
                    width: "100%",
                    border: "none",
                    background: active === item.key ? s.primarySoft : "transparent",
                    borderRadius: s.radius.md,
                    padding: "10px 12px",
                    color: active === item.key ? s.primary : s.tx,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <span style={{ width: 28, height: 28, borderRadius: s.radius.sm, background: s.primarySoft, color: s.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
                    <span style={{ display: "block", fontSize: 11, color: s.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <NotificationCenter
          dark={dark}
          dirtyCount={dirtyCount}
          connOk={connOk}
          onOpen={() => {
            clearFloatingMenuTimer(userMenuCloseTimer);
            setUserMenuOpen(false);
          }}
        />

        <div
          ref={userMenuRef}
          onMouseEnter={() => clearFloatingMenuTimer(userMenuCloseTimer)}
          onMouseLeave={closeUserMenuSoon}
          style={{ position: "relative" }}
        >
          <AdminIconButton
            dark={dark}
            label="Menu utilisateur"
            onClick={() => {
              clearFloatingMenuTimer(userMenuCloseTimer);
              setUserMenuOpen(current => !current);
            }}
            tone="ghost"
          >
            <UserCircle className="w-5 h-5" />
          </AdminIconButton>
          {userMenuOpen && (
            <div className="admin-popover" style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: 280,
              maxWidth: "calc(100vw - 48px)",
              background: s.elevated,
              border: "1px solid " + s.brd,
              borderRadius: s.radius.lg,
              boxShadow: s.shadow,
              padding: 8,
              zIndex: 180
            }}>
              <div style={{ padding: "10px 10px 12px", borderBottom: "1px solid " + s.brd, marginBottom: 6 }}>
                <div style={{ fontSize: 12, color: s.mut, fontWeight: 750 }}>Connecté</div>
                <div style={{ fontSize: 13, color: s.tx, fontWeight: 850, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail || "Administrateur"}</div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  borderRadius: s.radius.md,
                  padding: "10px 12px",
                  color: s.tx,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  fontWeight: 750,
                  textAlign: "left"
                }}
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {dark ? "Mode clair" : "Mode sombre"}
              </button>
              <button
                type="button"
                onClick={logout}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  borderRadius: s.radius.md,
                  padding: "10px 12px",
                  color: s.error,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  fontWeight: 750,
                  textAlign: "left"
                }}
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>

      {msg && currentMessage && (
        <div
          className="admin-toast"
          style={{
            position: "fixed",
            top: 86,
            right: 18,
            zIndex: 260,
            maxWidth: "min(420px, calc(100vw - 36px))",
            background: s.surface,
            color: s.tx,
            border: "1px solid " + (mok ? s.successSoft : s.errorSoft),
            borderLeft: "4px solid " + (mok ? s.success : s.error),
            borderRadius: 14,
            boxShadow: s.shadow,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10
          }}
        >
          {mok ? <CheckCircle2 className="w-5 h-5" style={{ color: s.success, flexShrink: 0 }} /> : <CircleAlert className="w-5 h-5" style={{ color: s.error, flexShrink: 0 }} />}
          <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.45 }}>{currentMessage}</div>
        </div>
      )}

      {/* Main layout */}
      <div className="admin-main-layout" style={{ display: "flex", minHeight: "calc(100vh - 82px)", background: s.bg }}>
        {/* Sidebar */}
        <aside style={{
          width: open ? 280 : 0,
          overflow: "hidden",
          transition: "width 0.24s ease",
          background: s.surface,
          borderRight: "1px solid " + s.brd,
          boxShadow: "none",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 82,
          height: "calc(100vh - 82px)",
          zIndex: 90,
          backdropFilter: "blur(16px)"
        }}>
          <div style={{
            padding: "22px 18px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            flex: 1,
            overflowY: "auto"
          }}>
            {filteredGroups.map((group) => {
              const isGroupOpen = Boolean(openGroups[group.key]);
              const groupActive = (group.items as Array<(typeof ADMIN_NAV)[number] | undefined>).some((item) => item?.key === active);
              return (
                <div key={group.key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <button
                    type="button"
                    onClick={() => setOpenGroups((current) => ({ ...current, [group.key]: !current[group.key] }))}
                    style={{
                      background: "transparent",
                      border: "1px solid transparent",
                      borderRadius: 12,
                      padding: "9px 10px",
                      width: "100%",
                      color: groupActive && !dark ? s.primary : s.sub,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em"
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      {group.icon}
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{group.label}</span>
                    </span>
                    <ChevronDown className="w-3.5 h-3.5" style={{ transform: isGroupOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.18s ease" }} />
                  </button>

                  {isGroupOpen && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {group.items.map((item) => {
                        if (!item) return null;
                        const row = rows.find(r => r.section === item.key);
                        const itemDirty = !AUTO_SAVE_SECTIONS.includes(item.key) && JSON.stringify(drafts[item.key]) !== JSON.stringify(row?.content);
                        const isActive = active === item.key;
                        const activeCount = item.key === "slider"
                          ? slides.filter(x => x.is_active).length
                          : item.key === "partners"
                            ? partners.filter(x => x.is_active).length
                            : null;
                        return (
                          <button type="button"
                            key={item.key}
                            onClick={() => setActive(item.key)}
                            style={{
                              background: isActive ? `linear-gradient(135deg, ${s.primary}, ${s.primaryHover})` : "transparent",
                              border: "1px solid transparent",
                              borderRadius: 12,
                              padding: "11px 12px",
                              textAlign: "left",
                              color: isActive ? "#ffffff" : s.tx,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 8,
                              width: "100%"
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                              <span style={{
                                width: 30,
                                height: 30,
                                borderRadius: 10,
                                background: isActive ? "rgba(255,255,255,0.16)" : s.primarySoft,
                                color: isActive ? "#ffffff" : s.sub,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0
                              }}>
                                {item.icon}
                              </span>
                              <span style={{ minWidth: 0 }}>
                                <span style={{ display: "block", fontWeight: isActive ? 850 : 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
                              </span>
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                              {itemDirty && <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.warning }} />}
                              {activeCount !== null && (
                                <span style={{
                                  minWidth: 22,
                                  height: 20,
                                  borderRadius: 999,
                                  background: isActive ? "rgba(255,255,255,0.18)" : s.primarySoft,
                                  color: isActive ? "#ffffff" : s.primary,
                                  fontSize: 10,
                                  fontWeight: 900,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: "0 7px"
                                }}>
                                  {activeCount}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px 40px", background: s.bg }} className="admin-content">
          {status === "loading" ? (
            <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div className="admin-skeleton" style={{ width: 220, height: 24, borderRadius: 10, marginBottom: 10 }} />
                  <div className="admin-skeleton" style={{ width: 320, maxWidth: "70vw", height: 12, borderRadius: 999 }} />
                </div>
                <div className="admin-skeleton" style={{ width: 148, height: 40, borderRadius: 12 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} style={{ ...s.cardStyle, padding: s.space.sm }}>
                    <div className="admin-skeleton" style={{ width: 42, height: 42, borderRadius: 12, marginBottom: 16 }} />
                    <div className="admin-skeleton" style={{ width: "70%", height: 16, borderRadius: 999, marginBottom: 10 }} />
                    <div className="admin-skeleton" style={{ width: "90%", height: 12, borderRadius: 999 }} />
                  </div>
                ))}
              </div>
              <div style={{ ...s.cardStyle, padding: s.space.sm }}>
                <div className="admin-skeleton" style={{ width: "100%", height: 340, borderRadius: 14 }} />
              </div>
            </div>
          ) : status === "error" ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "calc(100vh - 170px)",
              flexDirection: "column",
              gap: 14,
              textAlign: "center"
            }}>
              <div style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                background: s.errorSoft,
                color: s.error,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <CircleAlert className="w-7 h-7" />
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.tx }}>Erreur de connexion</div>
              <div style={{ maxWidth: 420, fontSize: 13, color: s.sub, lineHeight: 1.7 }}>
                Impossible de charger les données administrateur pour le moment.
              </div>
              <button type="button"
                onClick={load}
                style={{
                  background: s.primary,
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 24px",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </button>
            </div>
          ) : (
            <div style={{ maxWidth: 1240, margin: "0 auto" }}>
              {/* Section header */}
              <div className="admin-page-toolbar" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
                background: "transparent",
                border: "none",
                borderRadius: s.radius.lg,
                padding: "8px 0",
                boxShadow: "none",
                flexWrap: "wrap",
                gap: 16
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${s.primary}, ${s.info})`,
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {activeNav?.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 850, color: s.tx }}>{activeNav?.label}</h2>
                      {dirty && (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: s.warning,
                          background: s.warningSoft,
                          border: "1px solid transparent",
                          borderRadius: 999,
                          padding: "3px 9px"
                        }}>
                          Non sauvegardé
                        </span>
                      )}
                      {isAuto && (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: s.primary,
                          background: s.primarySoft,
                          border: "1px solid transparent",
                          borderRadius: 999,
                          padding: "3px 9px",
                          display: "flex",
                          alignItems: "center",
                          gap: 5
                        }}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Auto-save
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 14, color: s.sub, lineHeight: 1.55 }}>
                      {activeNav?.desc}
                      {activeRow && !isAuto ? ` · Modifié : ${new Date(activeRow.updated_at).toLocaleString("fr-DZ")}` : ""}
                    </div>
                  </div>
                </div>

                <div className="admin-page-toolbar-actions" style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <AdminIconButton dark={dark} label="Actualiser" onClick={load}>
                    <RefreshCw className="w-4 h-4" />
                  </AdminIconButton>
                  {!isAuto && dirty && (
                    <AdminIconButton dark={dark} label="Annuler les modifications" onClick={reset} tone="ghost">
                      <X className="w-4 h-4" />
                    </AdminIconButton>
                  )}
                  {!isAuto && (
                    <button type="button"
                      onClick={save}
                      disabled={!dirty || status === "saving"}
                      style={{
                        background: dirty ? s.primary : s.disabledSoft,
                        border: "none",
                        borderRadius: 12,
                        padding: "10px 18px",
                        color: dirty ? "#fff" : s.disabled,
                        fontSize: 14,
                        fontWeight: 850,
                        cursor: dirty ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        opacity: status === "saving" ? 0.72 : 1,
                        minHeight: 40
                      }}
                    >
                      {status === "saving" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {status === "saving" ? "Sauvegarde..." : "Sauvegarder"}
                    </button>
                  )}
                </div>
              </div>

              {/* Section content */}
              <div style={{
                background: isAuto ? "transparent" : s.surface,
                border: isAuto ? "none" : "1px solid " + s.brd,
                borderRadius: 16,
                padding: isAuto ? 0 : 28,
                boxShadow: isAuto ? "none" : s.shadow
              }} className="admin-card">
                {active === "users" && <UsersEd dark={dark} />}
                {active === "links" && <LinksEd dark={dark} />}
                {active === "security" && <SecurityEd dark={dark} />}
                {active === "integrations" && <IntegrationsEd dark={dark} />}
                {active === "hero" && Boolean(drafts.hero) && <HomeHeroEd data={drafts.hero as Parameters<typeof HomeHeroEd>[0]["data"]} onChange={setDraft} dark={dark} />}
                {active === "store-hero" && Boolean(drafts["store-hero"]) && <StoreHeroEd data={drafts["store-hero"] as Parameters<typeof StoreHeroEd>[0]["data"]} onChange={setDraft} dark={dark} />}
                {active === "services" && Boolean(drafts.services) && <ServicesEd data={drafts.services as Parameters<typeof ServicesEd>[0]["data"]} onChange={setDraft} dark={dark} />}
                {active === "about" && Boolean(drafts.about) && <AboutEd data={drafts.about as Parameters<typeof AboutEd>[0]["data"]} onChange={setDraft} dark={dark} />}
                {active === "contact" && Boolean(drafts.contact) && <ContactEd data={drafts.contact as Parameters<typeof ContactEd>[0]["data"]} onChange={setDraft} dark={dark} />}
                {active === "slider" && <SliderEd slides={slides} onReload={loadSlides} dark={dark} />}
                {active === "partners" && <PartnersEd partners={partners} onReload={loadPartners} dark={dark} />}
                {active === "products" && <ProductsEd dark={dark} />}
                {active === "suppliers" && <SuppliersEd dark={dark} />}
                {active === "orders" && <OrdersEd dark={dark} />}
                {active === "audit-log" && <AuditLogEd dark={dark} />}
                {active === "queue-monitor" && <QueueMonitorEd dark={dark} />}
                {active === "emails" && <EmailEd dark={dark} />}
                {active === "reussites" && <ReussitesEd dark={dark} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
