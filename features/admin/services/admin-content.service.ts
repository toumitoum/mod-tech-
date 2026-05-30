import { supabase } from "@/app/supabase";
import type { Partner,SiteContentRow,Slide } from "../types";

export async function fetchSiteContent(): Promise<{ data: SiteContentRow[]; error: Error | null }> {
  const { data, error } = await supabase.from("site_content").select("*").order("id");
  return { data: (data ?? []) as SiteContentRow[], error: error as Error | null };
}

export async function updateSiteContent(section: string, content: unknown) {
  return supabase
    .from("site_content")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("section", section);
}

export async function fetchSlides(): Promise<Slide[]> {
  const { data } = await supabase.from("slider_slides").select("*").order("sort_order");
  return (data ?? []) as Slide[];
}

export async function fetchPartners(): Promise<Partner[]> {
  const { data } = await supabase.from("partners").select("*").order("sort_order");
  return (data ?? []) as Partner[];
}
