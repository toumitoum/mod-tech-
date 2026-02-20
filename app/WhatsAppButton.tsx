"use client";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://djiosqlexflaqzrtuyqc.supabase.co",
  "sb_publishable_JMN6dsJOA2lUpSLYQcKD8A_3xBlz3bV"
);

export default function WhatsAppButton() {
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("section", "contact")
        .single();

      if (data?.content?.whatsapp) {
        setPhone(data.content.whatsapp.replace(/\D/g, ""));
      }
    };

    load();
  }, []);

  if (!phone) return null;

  return (
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform duration-200 animate-pulse-glow"
      aria-label="WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}