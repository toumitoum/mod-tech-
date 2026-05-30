import { supabase } from "@/app/supabase";

export async function uploadSiteImage(file: File, path: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const filePath = path + "-" + Date.now() + "." + ext;
  const { error } = await supabase.storage.from("site-images").upload(filePath, file, { upsert: true });

  if (error) {
    throw error;
  }

  return supabase.storage.from("site-images").getPublicUrl(filePath).data.publicUrl;
}
