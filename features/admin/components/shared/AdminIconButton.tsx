"use client";

import type React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ms } from "../../styles";

type AdminIconButtonTone = "default" | "primary" | "danger" | "ghost";

type AdminIconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  dark: boolean;
  label: string;
  tone?: AdminIconButtonTone;
  size?: number;
  side?: "top" | "right" | "bottom" | "left";
};

export function AdminIconButton({
  children,
  dark,
  disabled,
  label,
  side = "top",
  size = 40,
  style,
  tone = "default",
  ...props
}: AdminIconButtonProps) {
  const s = ms(dark);
  const isDanger = tone === "danger";
  const isPrimary = tone === "primary";
  const isGhost = tone === "ghost";
  const toneColor = isPrimary || isDanger ? s.tx : s.sub;
  const toneBackground = isDanger
    ? s.hover
    : isPrimary
      ? s.hover
      : isGhost
        ? "transparent"
        : s.hover;

  return (
    <TooltipProvider delayDuration={180}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            {...props}
            aria-label={label}
            data-admin-icon-button="true"
            disabled={disabled}
            title={undefined}
            type={props.type ?? "button"}
            style={{
              width: size,
              height: size,
              minHeight: size,
              padding: 0,
              flexShrink: 0,
              border: "none",
              borderRadius: 10,
              background: disabled ? s.disabledSoft : toneBackground,
              color: disabled ? s.disabled : toneColor,
              cursor: disabled ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "none",
              opacity: disabled ? 0.62 : 1,
              transition: "background 0.18s ease, color 0.18s ease, transform 0.18s ease, opacity 0.18s ease",
              ...style,
            }}
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          style={{
            background: s.elevated,
            border: "1px solid " + s.brd,
            borderRadius: s.radius.md,
            color: s.tx,
            fontSize: 12,
            fontWeight: 750,
            boxShadow: s.shadow,
          }}
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
