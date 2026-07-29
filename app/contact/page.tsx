"use client";
import { supabase } from "@/app/supabase";
import { motion } from "framer-motion";
import {
ExternalLink,
Globe,
Mail,
MapPin,
Phone,
} from "lucide-react";
import { useEffect,useState } from "react";

import {
FaFacebookF,
FaInstagram,
FaLinkedinIn,
FaTiktok,
FaWhatsapp,
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
  if (name.includes("tiktok")) return { icon: FaTiktok, color: "text-white" };
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
    <main className="relative min-h-screen overflow-hidden bg-[#050505] px-4 py-7 text-white sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_7%_8%,rgba(20,200,184,0.15),transparent_23%),radial-gradient(circle_at_92%_85%,rgba(36,99,235,0.12),transparent_28%)]" />
      <div aria-hidden="true" className="absolute inset-0 opacity-55 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]" />

      <div className="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/12 bg-[#0a0d10]/85 shadow-[0_32px_100px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:grid-cols-[0.88fr_1.12fr]">
        <motion.aside
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden border-b border-white/10 p-6 sm:p-9 lg:border-b-0 lg:border-r lg:p-12"
        >
          <div aria-hidden="true" className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-[#14C8B8]/20" />
          <div aria-hidden="true" className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/10" />

          <div className="relative flex min-h-full flex-col">
            <div className="mb-12 sm:mb-20">
              <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/15 bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.3)]">
                <img
                  className="h-full w-full object-contain"
                  src="/lovable-uploads/5c0baea8-dfe7-4330-a35f-643db8adb0b0.png"
                  alt="logo"
                />
              </div>

              <h1 className="text-2xl font-light uppercase tracking-[0.08em] text-white sm:text-3xl">
                MOD-TECHNOLOGIE
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/62 sm:text-base">
                Sécurité · Réseaux · Domotique
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-white/42">
                <MapPin className="h-4 w-4 text-[#59dfaa]" />
                Algérie
              </div>
            </div>

            <div className="mt-auto grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[contact.phone1, contact.phone2].map(
                (phone, i) =>
                  phone && (
                    <a
                      key={i}
                      href={`tel:${phone}`}
                      className="group flex min-h-[88px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#14C8B8]/45 hover:bg-white/[0.065]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#14C8B8]/20 bg-[#14C8B8]/10 text-[#59dfaa] transition group-hover:bg-[#14C8B8]/16">
                        <Phone className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/42">
                          {i === 0 ? "Téléphone" : "Mobile"}
                        </span>
                        <span className="mt-1 block truncate text-sm font-semibold text-white">
                          {phone}
                        </span>
                      </div>
                    </a>
                  )
              )}

              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="group flex min-h-[88px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#14C8B8]/45 hover:bg-white/[0.065] sm:col-span-2 lg:col-span-1"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#14C8B8]/20 bg-[#14C8B8]/10 text-[#59dfaa] transition group-hover:bg-[#14C8B8]/16">
                    <Mail className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/42">Email</span>
                    <span className="mt-1 block truncate text-sm font-semibold text-white">{contact.email}</span>
                  </div>
                </a>
              )}
            </div>
          </div>
        </motion.aside>

        <section className="p-6 sm:p-9 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="mb-8 border-b border-white/10 pb-6 sm:mb-9 sm:pb-7"
          >
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#59dfaa]">
              <span className="h-2 w-2 rounded-full bg-[#59dfaa]" />
              Contact
            </span>
          </motion.div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/8 bg-white/[0.05]" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {whatsappPhone && (
                <motion.a
                  href={`https://api.whatsapp.com/send?phone=${whatsappPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative flex min-h-[116px] items-center gap-4 overflow-hidden rounded-2xl border border-[#59dfaa]/35 bg-[#59dfaa] p-5 text-[#07140f] shadow-[0_16px_36px_rgba(89,223,170,0.14)] transition duration-300 hover:-translate-y-1 hover:bg-[#73e9bc] sm:col-span-2"
                >
                  <div aria-hidden="true" className="absolute right-[-1rem] top-[-2rem] h-28 w-28 rounded-full border border-[#07140f]/10" />
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#07140f]/10">
                    <FaWhatsapp className="h-6 w-6" />
                  </div>

                  <div className="relative flex-1">
                    <div className="text-base font-bold">WhatsApp</div>
                    <div className="mt-1 text-sm text-[#07140f]/72">Discuter avec nous</div>
                  </div>

                  <ExternalLink className="relative h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </motion.a>
              )}

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
                    className="group flex min-h-[116px] items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#14C8B8]/45 hover:bg-white/[0.07]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/25">
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-white">{link.title}</div>
                      <div className="mt-1 text-xs text-white/45">Visiter le lien</div>
                    </div>

                    <ExternalLink className="h-4 w-4 shrink-0 text-white/35 transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#59dfaa]" />
                  </motion.a>
                );
              })}
            </div>
          )}

          <div className="mt-10 border-t border-white/10 pt-5 text-[11px] font-medium text-white/35">
            MOD-TECHNOLOGIE © {new Date().getFullYear()}
          </div>
        </section>
      </div>
    </main>
  );
}
