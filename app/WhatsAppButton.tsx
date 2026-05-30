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
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-5 z-50 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/40 hover:bg-[#20c45e] transition-colors duration-200"
    >
      <FaWhatsapp className="w-5 h-5 sm:w-6 sm:h-6" />
    </a>
  );
}