"use client";

import { supabase } from "@/app/supabase";
import { motion } from "framer-motion";
import {
ChevronDown,
ChevronUp,
RefreshCw,
ShoppingBag,
Trash2
} from "lucide-react";
import { useEffect,useState } from "react";
import { ms,teal } from "../../styles";
import type { Order } from "../../types";

export function OrdersEd({ dark }: { dark: boolean }) {
  const s = ms(dark);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  
  const loadOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };
  
  useEffect(() => { void Promise.resolve().then(loadOrders); }, []);
  
  const updateStatus = async (id: number, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    loadOrders();
    if (selected?.id === id) setSelected(o => o ? { ...o, status } : null);
  };
  
  const deleteOrder = async (id: number) => {
    if (!confirm("Supprimer ?")) return;
    await supabase.from("orders").delete().eq("id", id);
    loadOrders();
    if (selected?.id === id) setSelected(null);
  };
  
  const ST: Record<string, { label: string; color: string; bg: string }> = {
    new: { label: " Nouveau", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    confirmed: { label: " Confirmé", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    shipped: { label: " Expédié", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    delivered: { label: " Livré", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
    cancelled: { label: " Annulée", color: "#ef4444", bg: "rgba(239,68,68,0.12)" }
  };
  
  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const counts = Object.keys(ST).reduce((a, k) => ({ ...a, [k]: orders.filter(o => o.status === k).length }), {} as Record<string, number>);
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{
        background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)",
        border: "1px solid rgba(13,148,136,0.2)",
        borderRadius: 12,
        padding: "12px 16px",
        fontSize: 13,
        color: s.sub,
        display: "flex",
        alignItems: "center",
        gap: 8
      }}>
        <ShoppingBag className="w-4 h-4" style={{ color: teal }} />
        <span>
          <span style={{ color: teal, fontWeight: 700 }}>{orders.length} commande{orders.length !== 1 ? "s" : ""}</span>
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
        {[["all", " Tous", orders.length, "#64748b"], ...Object.entries(ST).map(([k, v]) => [k, v.label, counts[k] || 0, v.color])].map(([k, l, c, col]) => (
          <button
            key={k as string}
            onClick={() => setFilter(k as string)}
            style={{
              background: filter === k ? (dark ? "rgba(13,148,136,0.15)" : "rgba(13,148,136,0.08)") : "transparent",
              border: filter === k ? "1px solid rgba(13,148,136,0.4)" : "1px solid " + s.brd,
              borderRadius: 10,
              padding: "10px 6px",
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: col as string }}>{c as number}</div>
            <div style={{ fontSize: 10, color: s.sub, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l as string}</div>
          </button>
        ))}
      </div>
      
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: s.sub, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <RefreshCw className="w-4 h-4 animate-spin" />
          Chargement...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: s.sub }}>
          <ShoppingBag className="w-12 h-12 mx-auto mb-4" style={{ color: s.mut }} />
          <p>Aucune commande</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(order => {
            const st = ST[order.status] || ST.new;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: s.card,
                  border: "1px solid " + s.brd,
                  borderRadius: 14,
                  overflow: "hidden",
                  cursor: "pointer"
                }}
                onClick={() => setSelected(selected?.id === order.id ? null : order)}
              >
                <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ background: st.bg, borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: st.color, whiteSpace: "nowrap" }}>
                    {st.label}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{order.customer_name}</div>
                    <div style={{ fontSize: 12, color: s.sub }}>
                      {order.customer_phone} · {new Date(order.created_at).toLocaleString("fr-DZ")}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: teal, whiteSpace: "nowrap" }}>
                    {order.total.toLocaleString()} DA
                  </div>
                  <div style={{ color: s.sub, fontSize: 16 }}>
                    {selected?.id === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
                
                {selected?.id === order.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{ borderTop: "1px solid " + s.brd, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 10px", background: s.ci, borderRadius: 8 }}>
                          <span>{item.name} × {item.qty}</span>
                          <span style={{ fontWeight: 700, color: teal }}>{(item.price * item.qty).toLocaleString()} DA</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, padding: "8px 10px", borderTop: "1px solid " + s.brd }}>
                        <span>Total</span>
                        <span style={{ color: teal }}>{order.total.toLocaleString()} DA</span>
                      </div>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, fontSize: 13 }}>
                      {[
                        ["address", order.customer_address],
                        ["email", order.customer_email || "—"],
                        ["phone", order.customer_phone || "—"],
                        ["notes", order.notes || "—"]


                      ].map(([l, v]) => (
                        <div key={l as string} style={{ background: s.ci, borderRadius: 8, padding: "8px 12px" }}>
                          <div style={{ fontSize: 10, color: s.sub, marginBottom: 3, fontWeight: 600 }}>{l}</div>
                          <div style={{ color: s.tx }}>{v as string}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {Object.entries(ST).filter(([k]) => k !== order.status).map(([k, v]) => (
                        <button
                          key={k}
                          onClick={() => updateStatus(order.id, k)}
                          style={{
                            background: v.bg,
                            borderRadius: 8,
                            border: "none",
                            padding: "6px 12px",
                            color: v.color,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          {v.label}
                        </button>
                      ))}
                      <div style={{ flex: 1 }} />
                      <a
                        href={`tel:${order.customer_phone}`}
                        style={{
                          background: "rgba(16,185,129,0.1)",
                          border: "1px solid rgba(16,185,129,0.3)",
                          borderRadius: 8,
                          padding: "6px 14px",
                          color: "#10b981",
                          fontSize: 12,
                          fontWeight: 700,
                          textDecoration: "none"
                        }}
                      >
                        📞 Appeler
                      </a>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        style={{
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: 8,
                          padding: "6px 10px",
                          color: "#f87171",
                          fontSize: 12,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
