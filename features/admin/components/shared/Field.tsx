"use client";

import type React from "react";
import { ms } from "../../styles";

export function Field({ label, value, onChange, multi, dark, type = "text", placeholder }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multi?: boolean;
  dark: boolean;
  type?: string;
  placeholder?: string;
}) {
  const s = ms(dark);
  const base: React.CSSProperties = {
    ...s.inputStyle,
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
  };
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: s.space.xs }}>
      <label style={{
        ...s.typography.label,
        color: s.mut,
        letterSpacing: 0,
      }}>
        {label}
      </label>
      {multi ? (
        <textarea
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...base, resize: "vertical" }}
          onFocus={e => {
            e.currentTarget.style.borderColor = s.primary;
            e.currentTarget.style.boxShadow = `0 0 0 4px ${s.focusRing}`;
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = s.brd;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={base}
          onFocus={e => {
            e.currentTarget.style.borderColor = s.primary;
            e.currentTarget.style.boxShadow = `0 0 0 4px ${s.focusRing}`;
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = s.brd;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      )}
    </div>
  );
}
