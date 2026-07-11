import type React from "react";

const brand = {
  primary: "#0d9488",
  primaryHover: "#0f766e",
  primaryPressed: "#115e59",
};

export const teal = brand.primary;
export const tG = brand.primary;

export const adminColors = {
  light: {
    primary: brand.primary,
    primaryHover: brand.primaryHover,
    primarySoft: "#e8f7f4",
    primarySoftHover: "#d3f0ea",
    background: "#f8fafc",
    surface: "#ffffff",
    surfaceElevated: "#ffffff",
    border: "#e2e8f0",
    borderStrong: "#cbd5e1",
    input: "#ffffff",
    hover: "#f1f5f9",
    textPrimary: "#17212f",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
    disabled: "#94a3b8",
    disabledSoft: "#f1f5f9",
    success: "#16845f",
    successSoft: "#e6f7ef",
    warning: "#b7791f",
    warningSoft: "#fbf1dc",
    error: "#c53f38",
    errorSoft: "#fcecea",
    info: "#256d85",
    infoSoft: "#e6f3f7",
    focusRing: "rgba(13, 148, 136, 0.18)",
    overlay: "rgba(255, 255, 255, 0.94)",
    shadow: "0 18px 46px rgba(15, 23, 42, 0.08)",
    softShadow: "0 10px 26px rgba(15, 23, 42, 0.06)",
  },
  dark: {
    primary: brand.primary,
    primaryHover: brand.primaryHover,
    primarySoft: "rgba(13, 148, 136, 0.16)",
    primarySoftHover: "rgba(13, 148, 136, 0.24)",
    background: "#050505",
    surface: "#0d0d0f",
    surfaceElevated: "#161618",
    border: "rgba(255, 255, 255, 0.10)",
    borderStrong: "rgba(255, 255, 255, 0.16)",
    input: "#111113",
    hover: "rgba(255, 255, 255, 0.06)",
    textPrimary: "#f7f7f8",
    textSecondary: "#ffffff",
    textMuted: "#ffffff",
    disabled: "#ffffff",
    disabledSoft: "rgba(255, 255, 255, 0.08)",
    success: "#67d5a4",
    successSoft: "rgba(103, 213, 164, 0.15)",
    warning: "#e7bd66",
    warningSoft: "rgba(231, 189, 102, 0.15)",
    error: "#f47d75",
    errorSoft: "rgba(244, 125, 117, 0.15)",
    info: "#7dd3fc",
    infoSoft: "rgba(125, 211, 252, 0.14)",
    focusRing: "rgba(94, 234, 212, 0.30)",
    overlay: "rgba(13, 13, 15, 0.84)",
    shadow: "0 24px 80px rgba(0, 0, 0, 0.34)",
    softShadow: "0 16px 48px rgba(0, 0, 0, 0.18)",
  },
} as const;

export const adminRadii = {
  sm: 10,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

export const adminSpace = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  "2xl": 48,
} as const;

export const adminTypography = {
  heading: { fontSize: 24, lineHeight: 1.2, fontWeight: 850 },
  title: { fontSize: 20, lineHeight: 1.25, fontWeight: 850 },
  subtitle: { fontSize: 14, lineHeight: 1.55, fontWeight: 650 },
  label: { fontSize: 12, lineHeight: 1.4, fontWeight: 800 },
  body: { fontSize: 14, lineHeight: 1.6, fontWeight: 500 },
  caption: { fontSize: 12, lineHeight: 1.45, fontWeight: 650 },
  description: { fontSize: 13, lineHeight: 1.6, fontWeight: 500 },
} as const;

export type AdminButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";

export function ms(dark: boolean) {
  const c = dark ? adminColors.dark : adminColors.light;
  const button = (variant: AdminButtonVariant = "secondary", disabled = false): React.CSSProperties => {
    const base: React.CSSProperties = {
      border: "none",
      borderRadius: adminRadii.md,
      minHeight: 40,
      padding: "10px 16px",
      fontSize: 13,
      fontWeight: 850,
      cursor: disabled ? "not-allowed" : "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      opacity: disabled ? 0.62 : 1,
      userSelect: "none",
      whiteSpace: "nowrap",
      transform: "translateY(0)",
      transition: "background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease, opacity 0.18s ease",
    };

    if (variant === "primary") {
      return {
        ...base,
        background: disabled ? c.disabledSoft : dark ? "#f7f7f8" : c.textPrimary,
        color: disabled ? c.textMuted : dark ? "#111113" : "#ffffff",
        boxShadow: disabled || dark ? "none" : "0 12px 24px rgba(15, 23, 42, 0.16)",
      };
    }

    if (variant === "danger") {
      return {
        ...base,
        background: disabled ? c.disabledSoft : c.hover,
        color: disabled ? c.textMuted : c.textPrimary,
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
        background: disabled ? c.disabledSoft : c.hover,
        color: disabled ? c.textMuted : c.textSecondary,
        boxShadow: "none",
      };
    }

    return {
      ...base,
      background: disabled ? c.disabledSoft : c.hover,
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
      border: "1px solid transparent",
      borderRadius: adminRadii.md,
      padding: "10px 16px",
      textAlign: "left",
      color: active ? c.primary : c.textSecondary,
      cursor: "pointer",
      fontSize: 13,
      fontWeight: active ? 800 : 650,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "all 0.18s ease",
      width: "100%",
    }),
  };
}

export type AdminStyleTokens = ReturnType<typeof ms>;
