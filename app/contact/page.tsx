"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/supabase";
import { motion } from "framer-motion";
import {
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Globe,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";

type Link = {
  id: number;
  title: string;
  url: string;
  sort_order: number;
  is_active: boolean;
};

type ContactInfo = {
  phone1?: string;
  phone2?: string;
  email?: string;
};

// 🎨 ICON SYSTEM
const getIcon = (title: string) => {
  const name = title.toLowerCase();

  if (name.includes("facebook")) return { icon: FaFacebookF, color: "text-blue-600" };
  if (name.includes("instagram")) return { icon: FaInstagram, color: "text-pink-500" };
  if (name.includes("linkedin")) return { icon: FaLinkedinIn, color: "text-blue-700" };
  if (name.includes("whatsapp")) return { icon: FaWhatsapp, color: "text-green-500" };
  if (name.includes("tiktok")) return { icon: FaTiktok, color: "text-black" };
  if (name.includes("youtube")) return { icon: FaYoutube, color: "text-red-500" };
  if (name.includes("site") || name.includes("web"))
    return { icon: Globe, color: "text-gray-700" };

  return { icon: Globe, color: "text-gray-500" };
};

export default function ContactPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [contact, setContact] = useState<ContactInfo>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase
        .from("contact_links")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("site_content")
        .select("content")
        .eq("section", "contact")
        .single(),
    ]).then(([linksRes, contactRes]) => {
      setLinks(linksRes.data ?? []);
      if (contactRes.data?.content) setContact(contactRes.data.content);
      setLoading(false);
    });
  }, []);

  // 📱 WhatsApp formatter
  const formatPhoneForWhatsApp = (phone?: string) => {
    if (!phone) return "";
    let clean = phone.replace(/\s+/g, "");
    if (clean.startsWith("0")) clean = "213" + clean.substring(1);
    return clean;
  };

  const whatsappPhone = formatPhoneForWhatsApp(contact.phone1 || contact.phone2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center py-8 sm:py-12 px-3 sm:px-4">
      <div className="w-full max-w-md">

        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8 sm:mb-10"
        >
          <img
            className="h-20 w-20 sm:h-24 sm:w-24 object-contain rounded-2xl bg-white p-2 shadow"
            src="/lovable-uploads/5c0baea8-dfe7-4330-a35f-643db8adb0b0.png"
            alt="logo"
          />

          <h1 className="text-lg sm:text-2xl text-gray-900 font-bold mt-3 sm:mt-4">
            MOD-TECHNOLOGIE
          </h1>

          <p className="text-xs sm:text-sm text-gray-500">
            Sécurité · Réseaux · Domotique
          </p>

          <div className="flex items-center gap-1 text-gray-400 text-[10px] sm:text-xs mt-1">
            <MapPin className="w-3 h-3" />
            Algérie
          </div>
        </motion.div>

        {/* CONTACT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-5 sm:mb-6">

          {[contact.phone1, contact.phone2].map(
            (phone, i) =>
              phone && (
                <a
                  key={i}
                  href={`tel:${phone}`}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white shadow-sm sm:shadow-md hover:shadow-lg transition flex items-center gap-2 sm:gap-3"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                    <Phone className="w-4 h-4 text-gray-600" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] sm:text-xs text-gray-500">
                      {i === 0 ? "Téléphone" : "Mobile"}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                      {phone}
                    </span>
                  </div>
                </a>
              )
          )}

          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="col-span-1 sm:col-span-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white shadow-sm sm:shadow-md hover:shadow-lg transition flex items-center gap-2 sm:gap-3"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                <Mail className="w-4 h-4 text-gray-600" />
              </div>

              <div>
                <span className="text-[10px] sm:text-xs text-gray-500">
                  Email
                </span>
                <div className="text-xs sm:text-sm font-medium text-gray-900">
                  {contact.email}
                </div>
              </div>
            </a>
          )}
        </div>

        {/* LINKS */}
        {loading ? (
          <div className="space-y-2 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 sm:h-14 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-4">

            {/* ✅ WhatsApp as normal link */}
            {whatsappPhone && (
              <motion.a
                href={`https://api.whatsapp.com/send?phone=${whatsappPhone}`}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white shadow-sm sm:shadow-md hover:shadow-lg transition"
              >
                <div className="w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center bg-green-100 rounded-lg">
                  <FaWhatsapp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>

                <div className="flex-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900">
                    WhatsApp
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    Discuter avec nous
                  </div>
                </div>

                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              </motion.a>
            )}

            {/* Other links */}
            {links.map((link, i) => {
              const { icon: Icon, color } = getIcon(link.title);

              return (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white shadow-sm sm:shadow-md hover:shadow-lg transition"
                >
                  <div className="w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center bg-gray-100 rounded-lg">
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
                  </div>

                  <div className="flex-1">
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">
                      {link.title}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500">
                      Visiter le lien
                    </div>
                  </div>

                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                </motion.a>
              );
            })}
          </div>
        )}

        {/* FOOTER */}
        <div className="text-center mt-8 sm:mt-10 text-[10px] sm:text-xs text-gray-400">
          MOD-TECHNOLOGIE © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}