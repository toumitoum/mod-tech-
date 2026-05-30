export const teal = "#0d9488";
export const tG = "linear-gradient(135deg,#0d9488,#0f766e)";

export const adminColors = {
  primary: {
    light: "#0d9488",
    dark: "#14b8a6",
    gradient: "linear-gradient(135deg, #0d9488, #0f766e)",
  },
  secondary: { light: "#6b7280", dark: "#9ca3af" },
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  background: { light: "#f9fafb", dark: "#111827" },
  surface: { light: "#ffffff", dark: "#1f2937" },
  border: { light: "#e5e7eb", dark: "#374151" },
  text: {
    light: "#1f2937",
    dark: "#f3f4f6",
    muted: { light: "#6b7280", dark: "#9ca3af" },
  },
};

export function ms(dark: boolean) {
  return {
    bg: dark ? adminColors.background.dark : adminColors.background.light,
    sb: dark ? adminColors.surface.dark : adminColors.surface.light,
    card: dark ? adminColors.surface.dark : adminColors.surface.light,
    ci: dark ? "#374151" : "#f3f4f6",
    tx: dark ? adminColors.text.dark : adminColors.text.light,
    sub: dark ? adminColors.text.muted.dark : adminColors.text.muted.light,
    brd: dark ? adminColors.border.dark : adminColors.border.light,
    ibg: dark ? "#2d3748" : "#ffffff",
    top: dark ? "rgba(31,41,55,0.95)" : "rgba(255,255,255,0.95)",
    mut: dark ? adminColors.text.muted.dark : adminColors.text.muted.light,
    sbtn: (active: boolean) => ({
      background: active ? (dark ? "rgba(13,148,136,0.15)" : "rgba(13,148,136,0.08)") : "transparent",
      border: active ? "1px solid " + (dark ? "rgba(13,148,136,0.4)" : "rgba(13,148,136,0.4)") : "1px solid transparent",
      borderRadius: 10,
      padding: "11px 14px",
      textAlign: "left" as const,
      color: active ? teal : (dark ? adminColors.text.muted.dark : adminColors.text.muted.light),
      cursor: "pointer",
      fontSize: 13.5,
      fontWeight: active ? 700 : 500,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "all 0.15s",
      width: "100%",
    }),
  };
}

export type AdminStyleTokens = ReturnType<typeof ms>;
