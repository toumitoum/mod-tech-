(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/modtech-dashboard/app/admin/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminDashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])("https://djiosqlexflaqzrtuyqc.supabase.co", "sb_publishable_JMN6dsJOA2lUpSLYQcKD8A_3xBlz3bV");
function formatDate(iso) {
    return new Date(iso).toLocaleString("fr-DZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}
function makeStyles(dark) {
    return {
        bg: dark ? "#0a0f1a" : "#f1f5f9",
        sidebar: dark ? "rgba(15,23,42,0.95)" : "#ffffff",
        card: dark ? "rgba(15,23,42,0.8)" : "#ffffff",
        cardInner: dark ? "rgba(20,30,50,0.6)" : "#f8fafc",
        text: dark ? "#e2e8f0" : "#1e293b",
        sub: dark ? "#64748b" : "#94a3b8",
        border: dark ? "rgba(51,65,85,0.6)" : "#e2e8f0",
        inputBg: dark ? "rgba(10,15,26,0.8)" : "#ffffff",
        topbar: dark ? "rgba(15,23,42,0.98)" : "rgba(255,255,255,0.98)",
        mutedText: dark ? "#94a3b8" : "#64748b",
        sectionBtn: (active)=>({
                background: active ? dark ? "rgba(13,148,136,0.15)" : "rgba(13,148,136,0.08)" : "transparent",
                border: active ? "1px solid rgba(13,148,136,0.4)" : "1px solid transparent",
                borderRadius: 10,
                padding: "11px 14px",
                textAlign: "left",
                color: active ? "#0d9488" : dark ? "#94a3b8" : "#64748b",
                cursor: "pointer",
                fontSize: 13.5,
                fontWeight: active ? 700 : 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.15s",
                width: "100%"
            })
    };
}
const teal = "#0d9488";
const tealGrad = "linear-gradient(135deg, #0d9488, #0f766e)";
function Field({ label, value, onChange, multiline, dark }) {
    const s = makeStyles(dark);
    const base = {
        background: s.inputBg,
        border: "1px solid " + s.border,
        borderRadius: 8,
        padding: "10px 13px",
        color: s.text,
        fontSize: 14,
        width: "100%",
        outline: "none",
        fontFamily: "inherit",
        boxSizing: "border-box",
        transition: "border-color 0.2s"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "grid",
            gridTemplateColumns: "120px 1fr",
            gap: 12,
            alignItems: "start"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                style: {
                    fontSize: 11,
                    fontWeight: 700,
                    color: s.mutedText,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    paddingTop: 12,
                    fontFamily: "monospace"
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            multiline ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                rows: 3,
                value: value,
                onChange: (e)=>onChange(e.target.value),
                style: {
                    ...base,
                    resize: "vertical"
                }
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 51,
                columnNumber: 20
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                value: value,
                onChange: (e)=>onChange(e.target.value),
                style: base
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 51,
                columnNumber: 139
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
_c = Field;
function ImageUpload({ label, currentUrl, bucket, path, onUploaded, dark }) {
    _s();
    const s = makeStyles(dark);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [preview, setPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(currentUrl);
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const upload = async (file)=>{
        setUploading(true);
        const ext = file.name.split(".").pop();
        const filePath = path + "-" + Date.now() + "." + ext;
        const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
            upsert: true
        });
        if (!error) {
            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
            setPreview(data.publicUrl);
            onUploaded(data.publicUrl);
        }
        setUploading(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "grid",
            gridTemplateColumns: "120px 1fr",
            gap: 12,
            alignItems: "start"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                style: {
                    fontSize: 11,
                    fontWeight: 700,
                    color: s.mutedText,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    paddingTop: 12,
                    fontFamily: "monospace"
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    preview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: 10,
                            borderRadius: 10,
                            overflow: "hidden",
                            border: "1px solid " + s.border,
                            maxHeight: 120
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: preview,
                            alt: label,
                            style: {
                                width: "100%",
                                height: 120,
                                objectFit: "cover",
                                display: "block"
                            }
                        }, void 0, false, {
                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                            lineNumber: 77,
                            columnNumber: 142
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                        lineNumber: 77,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ref: ref,
                        type: "file",
                        accept: "image/*",
                        style: {
                            display: "none"
                        },
                        onChange: (e)=>e.target.files?.[0] && upload(e.target.files[0])
                    }, void 0, false, {
                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>ref.current?.click(),
                        disabled: uploading,
                        style: {
                            background: "rgba(13,148,136,0.1)",
                            border: "1px dashed rgba(13,148,136,0.4)",
                            borderRadius: 8,
                            padding: "9px 18px",
                            color: teal,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: uploading ? "not-allowed" : "pointer"
                        },
                        children: uploading ? "⏳ Upload..." : "📁 Choisir une image"
                    }, void 0, false, {
                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this),
                    preview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 11,
                            color: s.sub,
                            marginTop: 6,
                            wordBreak: "break-all"
                        },
                        children: preview.split("/").pop()
                    }, void 0, false, {
                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                        lineNumber: 82,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
_s(ImageUpload, "pfY165J/8J+koQpq6v++f13vHAg=");
_c1 = ImageUpload;
function HeroEditor({ data, onChange, dark }) {
    const f = (k, v)=>onChange({
            ...data,
            [k]: v
        });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            flexDirection: "column",
            gap: 16
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "Titre",
                value: data.title ?? "",
                onChange: (v)=>f("title", v),
                dark: dark
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "Highlight",
                value: data.titleHighlight ?? "",
                onChange: (v)=>f("titleHighlight", v),
                dark: dark
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "Sous-titre",
                value: data.subtitle ?? "",
                onChange: (v)=>f("subtitle", v),
                multiline: true,
                dark: dark
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "Badge",
                value: data.badge ?? "",
                onChange: (v)=>f("badge", v),
                dark: dark
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "Btn Principal",
                value: data.btnPrimary ?? "",
                onChange: (v)=>f("btnPrimary", v),
                dark: dark
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "Btn Secondaire",
                value: data.btnSecondary ?? "",
                onChange: (v)=>f("btnSecondary", v),
                dark: dark
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ImageUpload, {
                label: "Image Hero",
                currentUrl: data.bgImage ?? "",
                bucket: "site-images",
                path: "hero-bg",
                onUploaded: (v)=>f("bgImage", v),
                dark: dark
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 98,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ImageUpload, {
                label: "Logo",
                currentUrl: data.logoUrl ?? "",
                bucket: "site-images",
                path: "logo",
                onUploaded: (v)=>f("logoUrl", v),
                dark: dark
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 99,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
        lineNumber: 91,
        columnNumber: 5
    }, this);
}
_c2 = HeroEditor;
function ServicesEditor({ data, onChange, dark }) {
    const s = makeStyles(dark);
    const update = (idx, field, val)=>onChange(data.map((item, i)=>i === idx ? {
                ...item,
                [field]: val
            } : item));
    const remove = (idx)=>onChange(data.filter((_, i)=>i !== idx));
    const add = ()=>onChange([
            ...data,
            {
                id: Date.now(),
                title: "Nouveau service",
                description: "",
                icon: "⚙️"
            }
        ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            flexDirection: "column",
            gap: 14
        },
        children: [
            data.map((svc, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: s.cardInner,
                        border: "1px solid " + s.border,
                        borderRadius: 14,
                        padding: 18
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 14
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: 24
                                            },
                                            children: svc.icon
                                        }, void 0, false, {
                                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                            lineNumber: 115,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: 11,
                                                fontWeight: 700,
                                                color: teal,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.1em"
                                            },
                                            children: [
                                                "Service ",
                                                idx + 1
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                            lineNumber: 116,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                    lineNumber: 114,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>remove(idx),
                                    style: {
                                        background: "rgba(239,68,68,0.1)",
                                        border: "1px solid rgba(239,68,68,0.2)",
                                        color: "#f87171",
                                        borderRadius: 7,
                                        padding: "4px 12px",
                                        cursor: "pointer",
                                        fontSize: 12,
                                        fontWeight: 600
                                    },
                                    children: "✕ Supprimer"
                                }, void 0, false, {
                                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                            lineNumber: 113,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: 12
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                    label: "Icône",
                                    value: svc.icon,
                                    onChange: (v)=>update(idx, "icon", v),
                                    dark: dark
                                }, void 0, false, {
                                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                    lineNumber: 121,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                    label: "Titre",
                                    value: svc.title,
                                    onChange: (v)=>update(idx, "title", v),
                                    dark: dark
                                }, void 0, false, {
                                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                    lineNumber: 122,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                    label: "Description",
                                    value: svc.description,
                                    onChange: (v)=>update(idx, "description", v),
                                    multiline: true,
                                    dark: dark
                                }, void 0, false, {
                                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                    lineNumber: 123,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                            lineNumber: 120,
                            columnNumber: 11
                        }, this)
                    ]
                }, svc.id, true, {
                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                    lineNumber: 112,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: add,
                style: {
                    border: "2px dashed rgba(13,148,136,0.3)",
                    background: "transparent",
                    color: teal,
                    borderRadius: 12,
                    padding: "14px",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600
                },
                children: "+ Ajouter un service"
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 127,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
        lineNumber: 110,
        columnNumber: 5
    }, this);
}
_c3 = ServicesEditor;
function AboutEditor({ data, onChange, dark }) {
    const s = makeStyles(dark);
    const f = (k, v)=>onChange({
            ...data,
            [k]: v
        });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            flexDirection: "column",
            gap: 16
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "Titre",
                value: data.title ?? "",
                onChange: (v)=>f("title", v),
                dark: dark
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 137,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "Description",
                value: data.description ?? "",
                onChange: (v)=>f("description", v),
                multiline: true,
                dark: dark
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 138,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "Mission",
                value: data.mission ?? "",
                onChange: (v)=>f("mission", v),
                multiline: true,
                dark: dark
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 139,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    borderTop: "1px solid " + s.border,
                    paddingTop: 16,
                    marginTop: 4
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 11,
                            fontWeight: 700,
                            color: s.mutedText,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            marginBottom: 14
                        },
                        children: "Statistiques"
                    }, void 0, false, {
                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: 12
                        },
                        children: [
                            [
                                "years",
                                "Années"
                            ],
                            [
                                "clients",
                                "Clients"
                            ],
                            [
                                "projects",
                                "Projets"
                            ]
                        ].map(([key, lbl])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: s.cardInner,
                                    border: "1px solid " + s.border,
                                    borderRadius: 12,
                                    padding: 14,
                                    textAlign: "center"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: 11,
                                            color: s.sub,
                                            marginBottom: 8,
                                            fontWeight: 600
                                        },
                                        children: lbl
                                    }, void 0, false, {
                                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                        lineNumber: 145,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: data[key] ?? "",
                                        onChange: (e)=>f(key, e.target.value),
                                        style: {
                                            background: "transparent",
                                            border: "none",
                                            borderBottom: "1px solid " + s.border,
                                            width: "80px",
                                            textAlign: "center",
                                            color: teal,
                                            fontSize: 20,
                                            fontWeight: 800,
                                            outline: "none",
                                            fontFamily: "inherit"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                        lineNumber: 146,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, key, true, {
                                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                lineNumber: 144,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                        lineNumber: 142,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 140,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
        lineNumber: 136,
        columnNumber: 5
    }, this);
}
_c4 = AboutEditor;
function ContactEditor({ data, onChange, dark }) {
    const f = (k, v)=>onChange({
            ...data,
            [k]: v
        });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            flexDirection: "column",
            gap: 16
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "Téléphone 1",
                value: data.phone1 ?? "",
                onChange: (v)=>f("phone1", v),
                dark: dark
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 159,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "Téléphone 2",
                value: data.phone2 ?? "",
                onChange: (v)=>f("phone2", v),
                dark: dark
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 160,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "Email",
                value: data.email ?? "",
                onChange: (v)=>f("email", v),
                dark: dark
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 161,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "Adresse",
                value: data.address ?? "",
                onChange: (v)=>f("address", v),
                dark: dark
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 162,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "WhatsApp",
                value: data.whatsapp ?? "",
                onChange: (v)=>f("whatsapp", v),
                dark: dark
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 163,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
        lineNumber: 158,
        columnNumber: 5
    }, this);
}
_c5 = ContactEditor;
const NAV = [
    {
        key: "hero",
        label: "Hero",
        icon: "🏠",
        desc: "Titre, boutons, images"
    },
    {
        key: "services",
        label: "Services",
        icon: "🛠",
        desc: "Cartes de services"
    },
    {
        key: "about",
        label: "À propos",
        icon: "ℹ️",
        desc: "Stats & description"
    },
    {
        key: "contact",
        label: "Contact",
        icon: "📞",
        desc: "Téléphones & email"
    }
];
function AdminDashboard() {
    _s1();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [rows, setRows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [active, setActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("hero");
    const [drafts, setDrafts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("loading");
    const [msg, setMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [msgType, setMsgType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("ok");
    const [dark, setDark] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [sideOpen, setSideOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminDashboard.useEffect": ()=>{
            if (localStorage.getItem("mt_auth") !== "1") router.push("/login");
            const t = localStorage.getItem("mt_theme");
            if (t) setDark(t === "dark");
        }
    }["AdminDashboard.useEffect"], [
        router
    ]);
    const s = makeStyles(dark);
    const loadData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AdminDashboard.useCallback[loadData]": async ()=>{
            setStatus("loading");
            const { data, error } = await supabase.from("site_content").select("*").order("id");
            if (error) {
                setStatus("error");
                return;
            }
            setRows(data ?? []);
            const d = {};
            (data ?? []).forEach({
                "AdminDashboard.useCallback[loadData]": (r)=>{
                    d[r.section] = JSON.parse(JSON.stringify(r.content));
                }
            }["AdminDashboard.useCallback[loadData]"]);
            setDrafts(d);
            setStatus("idle");
        }
    }["AdminDashboard.useCallback[loadData]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminDashboard.useEffect": ()=>{
            loadData();
        }
    }["AdminDashboard.useEffect"], [
        loadData
    ]);
    const notify = (text, type = "ok")=>{
        setMsg(text);
        setMsgType(type);
        setTimeout(()=>setMsg(""), 3500);
    };
    const save = async ()=>{
        setStatus("saving");
        const { error } = await supabase.from("site_content").update({
            content: drafts[active],
            updated_at: new Date().toISOString()
        }).eq("section", active);
        if (error) notify("❌ " + error.message, "err");
        else {
            notify("✅ Sauvegardé !");
            await loadData();
        }
        setStatus("idle");
    };
    const logout = ()=>{
        localStorage.removeItem("mt_auth");
        router.push("/login");
    };
    const toggleTheme = ()=>{
        const nd = !dark;
        setDark(nd);
        localStorage.setItem("mt_theme", nd ? "dark" : "light");
    };
    const activeRow = rows.find((r)=>r.section === active);
    const isDirty = JSON.stringify(drafts[active]) !== JSON.stringify(activeRow?.content);
    const totalDirty = NAV.filter((n)=>JSON.stringify(drafts[n.key]) !== JSON.stringify(rows.find((r)=>r.section === n.key)?.content)).length;
    const setDraft = (v)=>setDrafts((d)=>({
                ...d,
                [active]: v
            }));
    const resetDraft = ()=>setDrafts((d)=>({
                ...d,
                [active]: JSON.parse(JSON.stringify(activeRow?.content))
            }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            minHeight: "100vh",
            background: s.bg,
            color: s.text,
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            transition: "background 0.3s"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: s.topbar,
                    borderBottom: "1px solid " + s.border,
                    height: 62,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 24px",
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    backdropFilter: "blur(12px)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 14
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setSideOpen(!sideOpen),
                                style: {
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    color: s.sub,
                                    fontSize: 20,
                                    padding: 4
                                },
                                children: "☰"
                            }, void 0, false, {
                                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                lineNumber: 233,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: 34,
                                    height: 34,
                                    borderRadius: 9,
                                    background: tealGrad,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 17
                                },
                                children: "⚙️"
                            }, void 0, false, {
                                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                lineNumber: 234,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontWeight: 800,
                                            fontSize: 15
                                        },
                                        children: "MOD-TECH Dashboard"
                                    }, void 0, false, {
                                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                        lineNumber: 236,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: 11,
                                            color: s.sub
                                        },
                                        children: "Panneau d'administration"
                                    }, void 0, false, {
                                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                        lineNumber: 237,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                lineNumber: 235,
                                columnNumber: 11
                            }, this),
                            totalDirty > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: "rgba(245,158,11,0.15)",
                                    border: "1px solid rgba(245,158,11,0.3)",
                                    borderRadius: 20,
                                    padding: "3px 10px",
                                    fontSize: 12,
                                    color: "#f59e0b",
                                    fontWeight: 700
                                },
                                children: [
                                    totalDirty,
                                    " section",
                                    totalDirty > 1 ? "s" : "",
                                    " modifiée",
                                    totalDirty > 1 ? "s" : ""
                                ]
                            }, void 0, true, {
                                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                lineNumber: 239,
                                columnNumber: 30
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                        lineNumber: 232,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 10
                        },
                        children: [
                            msg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 13,
                                    fontWeight: 600,
                                    padding: "7px 16px",
                                    borderRadius: 9,
                                    background: msgType === "err" ? "rgba(239,68,68,0.12)" : "rgba(52,211,153,0.12)",
                                    color: msgType === "err" ? "#f87171" : "#34d399",
                                    border: "1px solid " + (msgType === "err" ? "rgba(239,68,68,0.25)" : "rgba(52,211,153,0.25)")
                                },
                                children: msg
                            }, void 0, false, {
                                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                lineNumber: 242,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: toggleTheme,
                                style: {
                                    background: dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.8)",
                                    border: "1px solid " + s.border,
                                    borderRadius: 9,
                                    padding: "7px 12px",
                                    cursor: "pointer",
                                    color: s.text,
                                    fontSize: 17
                                },
                                children: dark ? "☀️" : "🌙"
                            }, void 0, false, {
                                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                lineNumber: 243,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: logout,
                                style: {
                                    background: "rgba(239,68,68,0.08)",
                                    border: "1px solid rgba(239,68,68,0.2)",
                                    borderRadius: 9,
                                    padding: "7px 14px",
                                    cursor: "pointer",
                                    color: "#f87171",
                                    fontSize: 13,
                                    fontWeight: 600
                                },
                                children: "🚪 Déconnexion"
                            }, void 0, false, {
                                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                lineNumber: 244,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                        lineNumber: 241,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 231,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    minHeight: "calc(100vh - 62px)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: sideOpen ? 240 : 0,
                            overflow: "hidden",
                            transition: "width 0.25s ease",
                            background: s.sidebar,
                            borderRight: "1px solid " + s.border,
                            display: "flex",
                            flexDirection: "column",
                            flexShrink: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: "20px 14px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                    flex: 1
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: s.sub,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.12em",
                                            marginBottom: 8,
                                            paddingLeft: 4
                                        },
                                        children: "Sections"
                                    }, void 0, false, {
                                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                        lineNumber: 250,
                                        columnNumber: 13
                                    }, this),
                                    NAV.map(({ key, label, icon, desc })=>{
                                        const row = rows.find((r)=>r.section === key);
                                        const dirty = JSON.stringify(drafts[key]) !== JSON.stringify(row?.content);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setActive(key),
                                            style: s.sectionBtn(active === key),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 10
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: 18
                                                            },
                                                            children: icon
                                                        }, void 0, false, {
                                                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                                            lineNumber: 257,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                textAlign: "left"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        fontWeight: active === key ? 700 : 500
                                                                    },
                                                                    children: label
                                                                }, void 0, false, {
                                                                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                                                    lineNumber: 259,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        fontSize: 10,
                                                                        color: s.sub
                                                                    },
                                                                    children: desc
                                                                }, void 0, false, {
                                                                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                                                    lineNumber: 260,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                                            lineNumber: 258,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                                    lineNumber: 256,
                                                    columnNumber: 19
                                                }, this),
                                                dirty && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        width: 7,
                                                        height: 7,
                                                        borderRadius: "50%",
                                                        background: "#f59e0b",
                                                        flexShrink: 0
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                                    lineNumber: 263,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, key, true, {
                                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                            lineNumber: 255,
                                            columnNumber: 17
                                        }, this);
                                    })
                                ]
                            }, void 0, true, {
                                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                lineNumber: 249,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    margin: "0 14px 20px",
                                    padding: 14,
                                    background: dark ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.04)",
                                    border: "1px solid rgba(13,148,136,0.15)",
                                    borderRadius: 12
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: teal,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.1em",
                                            marginBottom: 6
                                        },
                                        children: "Supabase"
                                    }, void 0, false, {
                                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                        lineNumber: 269,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: 11,
                                            color: s.sub,
                                            marginBottom: 4
                                        },
                                        children: "djiosqlexflaqzrtuyqc"
                                    }, void 0, false, {
                                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                        lineNumber: 270,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: "50%",
                                                    background: status === "loading" || status === "saving" ? "#f59e0b" : status === "error" ? "#ef4444" : "#10b981"
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                                lineNumber: 272,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 11,
                                                    color: s.sub
                                                },
                                                children: status === "loading" ? "Chargement..." : status === "saving" ? "Sauvegarde..." : status === "error" ? "Erreur" : "Connecté ✓"
                                            }, void 0, false, {
                                                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                                lineNumber: 273,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                        lineNumber: 271,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                lineNumber: 268,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                        lineNumber: 248,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            overflowY: "auto",
                            padding: 32
                        },
                        children: status === "loading" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: 300,
                                flexDirection: "column",
                                gap: 16,
                                color: s.sub
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: 44,
                                        height: 44,
                                        border: "3px solid rgba(13,148,136,0.2)",
                                        borderTop: "3px solid " + teal,
                                        borderRadius: "50%",
                                        animation: "spin 0.8s linear infinite"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                    lineNumber: 280,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Chargement des données..."
                                }, void 0, false, {
                                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                    lineNumber: 281,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                            lineNumber: 279,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                maxWidth: 780
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "flex",
                                        alignItems: "flex-start",
                                        justifyContent: "space-between",
                                        marginBottom: 28,
                                        paddingBottom: 20,
                                        borderBottom: "1px solid " + s.border
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 10,
                                                        marginBottom: 4
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: 26
                                                            },
                                                            children: NAV.find((n)=>n.key === active)?.icon
                                                        }, void 0, false, {
                                                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                                            lineNumber: 288,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                            style: {
                                                                margin: 0,
                                                                fontSize: 22,
                                                                fontWeight: 800
                                                            },
                                                            children: NAV.find((n)=>n.key === active)?.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                                            lineNumber: 289,
                                                            columnNumber: 21
                                                        }, this),
                                                        isDirty && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                color: "#f59e0b",
                                                                background: "rgba(245,158,11,0.12)",
                                                                border: "1px solid rgba(245,158,11,0.25)",
                                                                borderRadius: 20,
                                                                padding: "2px 10px"
                                                            },
                                                            children: "Non sauvegardé"
                                                        }, void 0, false, {
                                                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                                            lineNumber: 290,
                                                            columnNumber: 33
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                                    lineNumber: 287,
                                                    columnNumber: 19
                                                }, this),
                                                activeRow && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: 12,
                                                        color: s.sub
                                                    },
                                                    children: [
                                                        "Dernière modification : ",
                                                        formatDate(activeRow.updated_at)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                                    lineNumber: 292,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                            lineNumber: 286,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: "flex",
                                                gap: 8
                                            },
                                            children: [
                                                isDirty && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: resetDraft,
                                                    style: {
                                                        background: "transparent",
                                                        border: "1px solid " + s.border,
                                                        color: s.sub,
                                                        borderRadius: 9,
                                                        padding: "9px 16px",
                                                        cursor: "pointer",
                                                        fontSize: 13,
                                                        fontWeight: 600
                                                    },
                                                    children: "↺ Annuler"
                                                }, void 0, false, {
                                                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                                    lineNumber: 295,
                                                    columnNumber: 31
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: save,
                                                    disabled: !isDirty || status === "saving",
                                                    style: {
                                                        background: isDirty ? tealGrad : "rgba(51,65,85,0.3)",
                                                        border: "none",
                                                        borderRadius: 9,
                                                        padding: "9px 22px",
                                                        color: isDirty ? "#fff" : s.sub,
                                                        fontSize: 14,
                                                        fontWeight: 700,
                                                        cursor: isDirty ? "pointer" : "not-allowed",
                                                        transition: "all 0.2s"
                                                    },
                                                    children: status === "saving" ? "⏳ Sauvegarde..." : "💾 Sauvegarder"
                                                }, void 0, false, {
                                                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                                    lineNumber: 296,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                            lineNumber: 294,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                    lineNumber: 285,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: s.card,
                                        border: "1px solid " + s.border,
                                        borderRadius: 16,
                                        padding: 28
                                    },
                                    children: [
                                        active === "hero" && drafts.hero && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(HeroEditor, {
                                            data: drafts.hero,
                                            onChange: setDraft,
                                            dark: dark
                                        }, void 0, false, {
                                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                            lineNumber: 302,
                                            columnNumber: 62
                                        }, this),
                                        active === "services" && drafts.services && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ServicesEditor, {
                                            data: drafts.services,
                                            onChange: setDraft,
                                            dark: dark
                                        }, void 0, false, {
                                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                            lineNumber: 303,
                                            columnNumber: 63
                                        }, this),
                                        active === "about" && drafts.about && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AboutEditor, {
                                            data: drafts.about,
                                            onChange: setDraft,
                                            dark: dark
                                        }, void 0, false, {
                                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                            lineNumber: 304,
                                            columnNumber: 63
                                        }, this),
                                        active === "contact" && drafts.contact && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ContactEditor, {
                                            data: drafts.contact,
                                            onChange: setDraft,
                                            dark: dark
                                        }, void 0, false, {
                                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                            lineNumber: 305,
                                            columnNumber: 63
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                                    lineNumber: 301,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                            lineNumber: 284,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                        lineNumber: 277,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 247,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `* { box-sizing: border-box; } input:focus, textarea:focus { border-color: rgba(13,148,136,0.7) !important; box-shadow: 0 0 0 3px rgba(13,148,136,0.12) !important; } @keyframes spin { to { transform: rotate(360deg); } } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }`
            }, void 0, false, {
                fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
                lineNumber: 311,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/modtech-dashboard/app/admin/page.tsx",
        lineNumber: 230,
        columnNumber: 5
    }, this);
}
_s1(AdminDashboard, "T8fyfAZ73bVd+mP89JfyhDV3w1Q=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c6 = AdminDashboard;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "Field");
__turbopack_context__.k.register(_c1, "ImageUpload");
__turbopack_context__.k.register(_c2, "HeroEditor");
__turbopack_context__.k.register(_c3, "ServicesEditor");
__turbopack_context__.k.register(_c4, "AboutEditor");
__turbopack_context__.k.register(_c5, "ContactEditor");
__turbopack_context__.k.register(_c6, "AdminDashboard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=modtech-dashboard_app_admin_page_tsx_6dfdeba9._.js.map