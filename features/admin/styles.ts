import type React from "react";

const brand = {
  primary: "#14C8B8",
  primaryHover: "#0fb3a4",
  primaryPressed: "#0f766e",
};

export const teal = brand.primary;
export const tG = brand.primary;

export const adminColors = {
  light: {
    primary: brand.primary,
    primaryHover: brand.primaryHover,
    primarySoft: "#e7fbf9",
    primarySoftHover: "#cff6f1",
    background: "#f7f9fc",
    surface: "#ffffff",
    surfaceElevated: "#ffffff",
    border: "#e5e7eb",
    borderStrong: "#cbd5e1",
    input: "#ffffff",
    hover: "#f1f5f9",
    textPrimary: "#111827",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
    disabled: "#94a3b8",
    disabledSoft: "#f1f5f9",
    success: "#059669",
    successSoft: "#e8f8f1",
    warning: "#b45309",
    warningSoft: "#fff6df",
    error: "#dc2626",
    errorSoft: "#fef0f0",
    info: "#2563eb",
    infoSoft: "#eff6ff",
    focusRing: "rgba(20, 200, 184, 0.18)",
    overlay: "rgba(255, 255, 255, 0.86)",
    shadow: "0 24px 56px rgba(15, 23, 42, 0.10)",
    softShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
  },
  dark: {
    primary: brand.primary,
    primaryHover: brand.primaryHover,
    primarySoft: "rgba(20, 200, 184, 0.16)",
    primarySoftHover: "rgba(20, 200, 184, 0.24)",
    background: "#0f172a",
    surface: "#111c31",
    surfaceElevated: "#17243a",
    border: "rgba(203, 213, 225, 0.14)",
    borderStrong: "rgba(203, 213, 225, 0.24)",
    input: "#0b1324",
    hover: "rgba(203, 213, 225, 0.08)",
    textPrimary: "#f8fafc",
    textSecondary: "#cbd5e1",
    textMuted: "#94a3b8",
    disabled: "#64748b",
    disabledSoft: "rgba(203, 213, 225, 0.08)",
    success: "#6ee7b7",
    successSoft: "rgba(16, 185, 129, 0.16)",
    warning: "#fcd34d",
    warningSoft: "rgba(245, 158, 11, 0.16)",
    error: "#fca5a5",
    errorSoft: "rgba(239, 68, 68, 0.16)",
    info: "#93c5fd",
    infoSoft: "rgba(59, 130, 246, 0.16)",
    focusRing: "rgba(94, 234, 212, 0.30)",
    overlay: "rgba(15, 23, 42, 0.84)",
    shadow: "0 24px 64px rgba(2, 6, 23, 0.38)",
    softShadow: "0 12px 32px rgba(2, 6, 23, 0.24)",
  },
} as const;

export const adminRadii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const adminSpace = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  "2xl": 64,
  "3xl": 96,
} as const;

export const adminTypography = {
  heading: { fontSize: 28, lineHeight: 1.16, fontWeight: 800 },
  title: { fontSize: 20, lineHeight: 1.25, fontWeight: 800 },
  subtitle: { fontSize: 14, lineHeight: 1.55, fontWeight: 600 },
  label: { fontSize: 12, lineHeight: 1.4, fontWeight: 700 },
  body: { fontSize: 14, lineHeight: 1.6, fontWeight: 500 },
  caption: { fontSize: 12, lineHeight: 1.45, fontWeight: 600 },
  description: { fontSize: 13, lineHeight: 1.6, fontWeight: 500 },
} as const;

export type AdminButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";

export function ms(dark: boolean) {
  const c = dark ? adminColors.dark : adminColors.light;
  const button = (variant: AdminButtonVariant = "secondary", disabled = false): React.CSSProperties => {
    const base: React.CSSProperties = {
      border: "1px solid transparent",
      borderRadius: adminRadii.md,
      minHeight: 42,
      padding: "10px 16px",
      fontSize: 13,
      fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      opacity: disabled ? 0.62 : 1,
      userSelect: "none",
      whiteSpace: "nowrap",
      letterSpacing: "-0.01em",
      transform: "translateY(0)",
      transition: "background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease, opacity 0.18s ease",
    };

    if (variant === "primary") {
      return {
        ...base,
        background: disabled ? c.disabledSoft : c.primary,
        color: disabled ? c.textMuted : "#062a28",
        boxShadow: disabled ? "none" : dark ? "0 10px 24px rgba(20, 200, 184, 0.16)" : "0 10px 20px rgba(15, 118, 110, 0.16)",
      };
    }

    if (variant === "danger") {
      return {
        ...base,
        background: disabled ? c.disabledSoft : c.errorSoft,
        border: "1px solid " + (disabled ? c.border : c.errorSoft),
        color: disabled ? c.textMuted : c.error,
        boxShadow: "none",
      };
    }

    if (variant === "ghost") {
      return {
        ...base,
        background: "transparent",
        color: disabled ? c.textMuted : c.textSecondary,
        boxShadow: "none",
      };
    }

    if (variant === "outline") {
      return {
        ...base,
        background: disabled ? c.disabledSoft : c.surface,
        border: "1px solid " + c.border,
        color: disabled ? c.textMuted : c.textPrimary,
        boxShadow: "none",
      };
    }

    return {
      ...base,
      background: disabled ? c.disabledSoft : c.hover,
      border: "1px solid " + c.border,
      color: disabled ? c.textMuted : c.textPrimary,
      boxShadow: "none",
    };
  };

  return {
    token: c,
    colors: c,
    space: adminSpace,
    radius: adminRadii,
    typography: adminTypography,
    primary: c.primary,
    primaryHover: c.primaryHover,
    primarySoft: c.primarySoft,
    primarySoftHover: c.primarySoftHover,
    bg: c.background,
    sb: c.surface,
    card: c.surface,
    surface: c.surface,
    elevated: c.surfaceElevated,
    ci: c.primarySoft,
    tx: c.textPrimary,
    sub: c.textSecondary,
    brd: c.border,
    ibg: c.input,
    top: c.overlay,
    mut: c.textMuted,
    disabled: c.disabled,
    disabledSoft: c.disabledSoft,
    success: c.success,
    successSoft: c.successSoft,
    warning: c.warning,
    warningSoft: c.warningSoft,
    error: c.error,
    errorSoft: c.errorSoft,
    info: c.info,
    infoSoft: c.infoSoft,
    focusRing: c.focusRing,
    hover: c.hover,
    shadow: c.shadow,
    softShadow: c.softShadow,
    accentSoft: c.primarySoft,
    blueSoft: c.primarySoft,
    cardStyle: {
      background: c.surface,
      border: "1px solid " + c.border,
      borderRadius: adminRadii.lg,
      boxShadow: c.softShadow,
      padding: adminSpace.md,
    } satisfies React.CSSProperties,
    inputStyle: {
      background: c.input,
      border: "1px solid " + c.border,
      borderRadius: adminRadii.md,
      color: c.textPrimary,
      minHeight: 48,
      padding: "12px 16px",
      outline: "none",
      fontSize: 14,
      fontFamily: "inherit",
    } satisfies React.CSSProperties,
    button,
    sbtn: (active: boolean): React.CSSProperties => ({
      background: active ? c.primarySoft : "transparent",
      border: "1px solid " + (active ? c.primarySoft : "transparent"),
      borderRadius: adminRadii.md,
      padding: "10px 16px",
      textAlign: "left",
      color: active ? c.primary : c.textSecondary,
      cursor: "pointer",
      fontSize: 13,
      fontWeight: active ? 800 : 600,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "all 0.18s ease",
      width: "100%",
    }),
  };
}

export type AdminStyleTokens = ReturnType<typeof ms>;
