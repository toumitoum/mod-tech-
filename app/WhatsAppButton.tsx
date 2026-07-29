"use client";
import { useEffect,useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { supabase } from "./supabase";



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
      aria-label="Discuter sur WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-13 w-13 items-center justify-center rounded-2xl border border-white/40 bg-[#25D366] text-white shadow-[0_16px_32px_rgba(37,211,102,0.34)] transition-all duration-200 hover:-translate-y-1 hover:bg-[#20c45e] sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
    >
      <FaWhatsapp className="w-5 h-5 sm:w-6 sm:h-6" />
    </a>
  );
}
