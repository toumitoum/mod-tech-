"use client";

import { supabase } from "@/app/supabase";
import { useRouter } from "next/navigation";
import { useCallback,useEffect,useState } from "react";
import { ADMIN_NAV,AUTO_SAVE_SECTIONS } from "../constants/navigation";
import { fetchPartners,fetchSiteContent,fetchSlides,updateSiteContent } from "../services/admin-content.service";
import type { AdminDrafts,Partner,SiteContentRow,Slide,Status } from "../types";

export function useAdminDashboard() {
  const router = useRouter();
  const [rows, setSiteContentRows] = useState<SiteContentRow[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [active, setActiveState] = useState(() => {
    if (typeof window === "undefined") return "hero";
    const stored = localStorage.getItem("mt_admin_active_section");
    return ADMIN_NAV.some((item) => item.key === stored) ? stored as string : "hero";
  });
  const [drafts, setDrafts] = useState<AdminDrafts>({});
  const [status, setStatus] = useState<Status>("loading");
  const [msg, setMsg] = useState("");
  const [mok, setMok] = useState(true);
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const theme = localStorage.getItem("mt_theme");
    return theme ? theme === "dark" : false;
  });
  const [open, setOpen] = useState(true);
  const [connOk, setConnOk] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  const loadSlides = useCallback(async () => {
    setSlides(await fetchSlides());
  }, []);

  const loadPartners = useCallback(async () => {
    setPartners(await fetchPartners());
  }, []);

  const load = useCallback(async () => {
    setStatus("loading");
    const { data, error } = await fetchSiteContent();
    if (error) {
      setStatus("error");
      setConnOk(false);
      return;
    }

    setConnOk(true);
    setSiteContentRows(data);

    const nextDrafts: AdminDrafts = {};
    data.forEach((row) => {
      nextDrafts[row.section] = JSON.parse(JSON.stringify(row.content));
    });

    setDrafts(nextDrafts);
    await loadSlides();
    await loadPartners();
    setStatus("idle");
  }, [loadPartners, loadSlides]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login");
      } else {
        setUserEmail(data.session.user.email ?? "");
        setAuthChecked(true);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push("/login");
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const notify = useCallback((text: string, ok = true) => {
    setMsg(text);
    setMok(ok);
    setTimeout(() => setMsg(""), 3500);
  }, []);

  const save = useCallback(async () => {
    setStatus("saving");
    const { error } = await updateSiteContent(active, drafts[active]);
    if (error) notify(error.message, false);
    else {
      notify("Sauvegardé !");
      await load();
    }
    setStatus("idle");
  }, [active, drafts, load, notify]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  const toggleTheme = useCallback(() => {
    setDark((current) => {
      const next = !current;
      localStorage.setItem("mt_theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  const setActive = useCallback((section: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mt_admin_active_section", section);
    }
    setActiveState(section);
  }, []);

  const isAuto = AUTO_SAVE_SECTIONS.includes(active);
  const activeRow = rows.find((row) => row.section === active);
  const dirty = !isAuto && JSON.stringify(drafts[active]) !== JSON.stringify(activeRow?.content);
  const dirtyCount = ADMIN_NAV.filter((item) => {
    return !AUTO_SAVE_SECTIONS.includes(item.key)
      && JSON.stringify(drafts[item.key]) !== JSON.stringify(rows.find((row) => row.section === item.key)?.content);
  }).length;

  const setDraft = useCallback((value: unknown) => {
    setDrafts((current) => ({ ...current, [active]: value }));
  }, [active]);

  const reset = useCallback(() => {
    setDrafts((current) => ({
      ...current,
      [active]: JSON.parse(JSON.stringify(activeRow?.content)),
    }));
  }, [active, activeRow?.content]);

  return {
    active,
    activeNav: ADMIN_NAV.find((item) => item.key === active),
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
  };
}
