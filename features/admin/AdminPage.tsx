"use client";

import { LogOut,Menu,Moon,RefreshCw,Save,Sun,Users,X } from "lucide-react";
import {
AboutEd,
ContactEd,
EmailEd,
HomeHeroEd,
LinksEd,
OrdersEd,
PartnersEd,
ProductsEd,
ReussitesEd,
SecurityEd,
ServicesEd,
SliderEd,
StoreHeroEd,
UsersEd,
} from "./components/editors";
import { ADMIN_NAV,AUTO_SAVE_SECTIONS } from "./constants/navigation";
import { useAdminDashboard } from "./hooks/useAdminDashboard";
import { ms,teal,tG } from "./styles";

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

  // ← الآن فقط return بعد كل الـ hooks
  if (!authChecked) return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: dark ? "#0f172a" : "#f8fafc",
      flexDirection: "column", gap: 16, fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: "linear-gradient(135deg,#0d9488,#0f766e)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
      }}></div>
      <div style={{ color: "#0d9488", fontSize: 14, fontWeight: 600 }}>
        Vérification en cours...
      </div>
    </div>
  );

  const s = ms(dark);

  return (
    <div style={{
      minHeight: "100vh",
      background: s.bg,
      color: s.tx,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      transition: "background 0.3s, color 0.3s"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        input:focus, textarea:focus, select:focus {
          border-color: ${teal} !important;
          box-shadow: 0 0 0 3px ${teal}20 !important;
          outline: none;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${dark ? '#1f2937' : '#f1f5f9'};
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${dark ? '#4b5563' : '#cbd5e1'};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${dark ? '#6b7280' : '#94a3b8'};
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
            padding: 16px !important;
          }
          .admin-card {
            padding: 16px !important;
          }
          button, .btn {
            font-size: 12px !important;
            padding: 8px 12px !important;
          }
          input, textarea, select {
            font-size: 14px !important;
          }
        }
      `}</style>

      {/* Topbar */}
      <div style={{
        background: s.top,
        borderBottom: "1px solid " + s.brd,
        height: 62,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
        gap: 8
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
          <button
            onClick={() => setOpen(!open)}
            className="menu-button"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: s.sub,
              fontSize: 20,
              padding: 4,
              display: "flex",
              alignItems: "center"
            }}
            title="Ouvrir le menu"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: tG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17
          }}>
            
          </div>
          <div className="hide-sm" style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>MOD-TECH Admin</div>
            <div style={{ fontSize: 11, color: s.sub }}>Panneau d&apos;administration</div>
          </div>
          {dirtyCount > 0 && (
            <div style={{
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 20,
              padding: "3px 8px",
              fontSize: 11,
              color: "#f59e0b",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 4,
              whiteSpace: "nowrap"
            }}>
              <span>{dirtyCount} modif.</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {msg && (
            <div
              className="hide-sm"
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "5px 12px",
                borderRadius: 9,
                background: mok ? "rgba(52,211,153,0.12)" : "rgba(239,68,68,0.12)",
                color: mok ? "#34d399" : "#f87171",
                border: "1px solid " + (mok ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"),
                alignItems: "center",
                gap: 4,
                whiteSpace: "nowrap"
              }}
            >
              {msg}
            </div>
          )}
          
          {userEmail && (
            <div
              className="hide-sm"
              style={{
                fontSize: 11,
                color: s.sub,
                background: s.ci,
                border: "1px solid " + s.brd,
                borderRadius: 8,
                padding: "4px 10px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                alignItems: "center",
                gap: 6
              }}
            >
                <Users className="w-3 h-3" />
                {userEmail}
              </div>
          )}
          
          <button
            onClick={toggleTheme}
            style={{
              background: dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.8)",
              border: "1px solid " + s.brd,
              borderRadius: 9,
              padding: "7px 10px",
              cursor: "pointer",
              color: s.tx,
              fontSize: 17,
              display: "flex",
              alignItems: "center"
            }}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <button
            onClick={logout}
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 9,
              padding: "7px 12px",
              cursor: "pointer",
              color: "#f87171",
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <LogOut className="w-4 h-4" />
            <span style={{ display: "none" }}>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 62px)" }}>
        {/* Sidebar */}
        <div style={{
          width: open ? 280 : 0,
          overflow: "hidden",
          transition: "width 0.25s",
          background: s.sb,
          borderRight: "1px solid " + s.brd,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "relative",
          zIndex: 90
        }}>
          <div style={{
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            flex: 1,
            overflowY: "auto"
          }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: s.sub,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 6,
              paddingLeft: 4
            }}>
              Sections
            </div>
            
            {ADMIN_NAV.map(({ key, label, icon, desc }) => {
              const row = rows.find(r => r.section === key);
              const d = !AUTO_SAVE_SECTIONS.includes(key) && JSON.stringify(drafts[key]) !== JSON.stringify(row?.content);
              return (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  style={s.sbtn(active === key)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 17, display: "flex", alignItems: "center" }}>{icon}</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: active === key ? 700 : 500, whiteSpace: "nowrap" }}>{label}</div>
                      <div style={{ fontSize: 10, color: s.sub, whiteSpace: "nowrap" }}>{desc}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {d && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />}
                    {key === "slider" && (
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: teal,
                        background: "rgba(13,148,136,0.1)",
                        borderRadius: 10,
                        padding: "1px 7px"
                      }}>
                        {slides.filter(x => x.is_active).length}
                      </span>
                    )}
                    {key === "partners" && (
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#8b5cf6",
                        background: "rgba(139,92,246,0.1)",
                        borderRadius: 10,
                        padding: "1px 7px"
                      }}>
                        {partners.filter(x => x.is_active).length}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Connection status */}
          <div style={{
            margin: "0 12px 16px",
            padding: 12,
            background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)",
            border: "1px solid rgba(13,148,136,0.15)",
            borderRadius: 12
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: connOk === null ? "#f59e0b" : connOk ? "#10b981" : "#ef4444",
                boxShadow: connOk ? "0 0 6px #10b981" : "none"
              }} />
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: connOk === null ? s.sub : connOk ? "#10b981" : "#ef4444"
              }}>
                {connOk === null ? "..." : connOk ? "Connecté ✓" : "Erreur ✗"}
              </span>
            </div>
            {connOk && (
              <button
                onClick={load}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(13,148,136,0.3)",
                  borderRadius: 6,
                  padding: "4px 10px",
                  color: teal,
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <RefreshCw className="w-3 h-3" />
                Rafraîchir
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }} className="admin-content">
          {status === "loading" ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 300,
              flexDirection: "column",
              gap: 16,
              color: s.sub
            }}>
              <RefreshCw className="w-8 h-8 animate-spin" style={{ color: teal }} />
              <span>Chargement...</span>
            </div>
          ) : status === "error" ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 300,
              flexDirection: "column",
              gap: 16
            }}>
              <div style={{ fontSize: 48 }}>❌</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#f87171" }}>Erreur de connexion</div>
              <button
                onClick={load}
                style={{
                  background: tG,
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
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              {/* Section header */}
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 24,
                paddingBottom: 18,
                borderBottom: "1px solid " + s.brd,
                flexWrap: "wrap",
                gap: 16
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 24, display: "flex", alignItems: "center" }}>{activeNav?.icon}</span>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{activeNav?.label}</h1>
                    {dirty && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#f59e0b",
                        background: "rgba(245,158,11,0.12)",
                        border: "1px solid rgba(245,158,11,0.25)",
                        borderRadius: 20,
                        padding: "2px 10px"
                      }}>
                        Non sauvegardé
                      </span>
                    )}
                    {isAuto && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: teal,
                        background: "rgba(13,148,136,0.1)",
                        border: "1px solid rgba(13,148,136,0.25)",
                        borderRadius: 20,
                        padding: "2px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}>
                        <Save className="w-3 h-3" />
                        Auto-save
                      </span>
                    )}
                  </div>
                  {activeRow && !isAuto && (
                    <div style={{ fontSize: 12, color: s.sub }}>
                      Modifié : {new Date(activeRow.updated_at).toLocaleString("fr-DZ")}
                    </div>
                  )}
                </div>

                {!isAuto && (
                  <div style={{ display: "flex", gap: 8 }}>
                    {dirty && (
                      <button
                        onClick={reset}
                        style={{
                          background: "transparent",
                          border: "1px solid " + s.brd,
                          color: s.sub,
                          borderRadius: 9,
                          padding: "9px 16px",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <X className="w-4 h-4" />
                        Annuler
                      </button>
                    )}
                    <button
                      onClick={save}
                      disabled={!dirty || status === "saving"}
                      style={{
                        background: dirty ? tG : "rgba(51,65,85,0.3)",
                        border: "none",
                        borderRadius: 9,
                        padding: "9px 22px",
                        color: dirty ? "#fff" : s.sub,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: dirty ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      {status === "saving" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {status === "saving" ? "Sauvegarde..." : "Sauvegarder"}
                    </button>
                  </div>
                )}
              </div>

              {/* Section content */}
              <div style={{
                background: isAuto ? "transparent" : s.card,
                border: isAuto ? "none" : "1px solid " + s.brd,
                borderRadius: 16,
                padding: isAuto ? 0 : 26
              }} className="admin-card">
                {active === "users" && <UsersEd dark={dark} />}
                {active === "links" && <LinksEd dark={dark} />}
                {active === "security" && <SecurityEd dark={dark} />}
                {active === "hero" && Boolean(drafts.hero) && <HomeHeroEd data={drafts.hero as Parameters<typeof HomeHeroEd>[0]["data"]} onChange={setDraft} dark={dark} />}
                {active === "store-hero" && Boolean(drafts["store-hero"]) && <StoreHeroEd data={drafts["store-hero"] as Parameters<typeof StoreHeroEd>[0]["data"]} onChange={setDraft} dark={dark} />}
                {active === "services" && Boolean(drafts.services) && <ServicesEd data={drafts.services as Parameters<typeof ServicesEd>[0]["data"]} onChange={setDraft} dark={dark} />}
                {active === "about" && Boolean(drafts.about) && <AboutEd data={drafts.about as Parameters<typeof AboutEd>[0]["data"]} onChange={setDraft} dark={dark} />}
                {active === "contact" && Boolean(drafts.contact) && <ContactEd data={drafts.contact as Parameters<typeof ContactEd>[0]["data"]} onChange={setDraft} dark={dark} />}
                {active === "slider" && <SliderEd slides={slides} onReload={loadSlides} dark={dark} />}
                {active === "partners" && <PartnersEd partners={partners} onReload={loadPartners} dark={dark} />}
                {active === "products" && <ProductsEd dark={dark} />}
                {active === "orders" && <OrdersEd dark={dark} />}
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
