"use client";

import { supabase } from "@/app/supabase";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter, FaYoutube } from "react-icons/fa6";

interface ContactData {
  email?: string;
  phone1?: string;
  phone2?: string;
  address?: string;
  facebook?: string;
  youtube?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  whatsapp?: string;
}

interface ServiceItem {
  title: string;
}

const navLinks = [
  { label: "Accueil", href: "#accueil" },
  { label: "Services", href: "#services" },
  { label: "À propos", href: "#apropos" },
  { label: "Nos Réussites", href: "#reussites" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  const [contact, setContact] = useState<ContactData>({});
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactRes, servicesRes] = await Promise.all([
          supabase.from("site_content").select("content").eq("section", "contact").single(),
          supabase.from("site_content").select("content").eq("section", "services").single(),
        ]);
        if (contactRes.data?.content) setContact(contactRes.data.content);
        if (servicesRes.data?.content) setServices(servicesRes.data.content);
      } catch (error) {
        console.error("Footer fetch error:", error);
      }
    };
    fetchData();
  }, []);

  const socialLinks = [
    { icon: FaFacebookF, href: contact.facebook, label: "Facebook", show: !!contact.facebook },
    { icon: FaYoutube, href: contact.youtube, label: "YouTube", show: !!contact.youtube },
    { icon: FaInstagram, href: contact.instagram, label: "Instagram", show: !!contact.instagram },
    { icon: FaXTwitter, href: contact.twitter, label: "X", show: !!contact.twitter },
    { icon: FaLinkedinIn, href: contact.linkedin, label: "LinkedIn", show: !!contact.linkedin },
    {
      icon: FaWhatsapp,
      href: contact.whatsapp ? `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}` : undefined,
      label: "WhatsApp",
      show: !!contact.whatsapp,
    },
  ].filter((social) => social.show);
  const mapQuery = encodeURIComponent(contact.address || "Algérie");

  return (
    <footer className="relative isolate overflow-hidden bg-[#030608] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "linear-gradient(to bottom, #000, #000 68%, transparent)",
        }}
      />
      <div aria-hidden="true" className="absolute -right-40 top-0 h-[28rem] w-[28rem] rounded-full bg-[#14C8B8]/10 blur-[150px]" />

      <div className="relative z-10 mod-container">
        <div className="h-px bg-gradient-to-r from-transparent via-[#59dfaa]/70 to-transparent" />

        <div className="grid gap-x-10 gap-y-12 py-14 sm:grid-cols-2 sm:py-16 lg:grid-cols-12 lg:py-20">
          <div className="sm:col-span-2 lg:col-span-4">
            <img
              className="h-12 w-auto object-contain sm:h-14"
              src="/lovable-uploads/5c0baea8-dfe7-4330-a35f-643db8adb0b0.png"
              alt="MOD-TECHNOLOGIE"
            />
            <p className="mt-6 max-w-sm text-sm leading-7 text-white/55">
              Spécialistes en sécurité, réseaux, domotique et sonorisation. Des solutions sur mesure pour chaque besoin.
            </p>

            {socialLinks.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2.5">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#ffffff08] text-white/65 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#59dfaa]/60 hover:bg-[#14C8B8] hover:text-[#06150f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59dfaa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030608]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <nav aria-label="Navigation principale" className="lg:col-span-2">
            <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">Navigation</h2>
            <ul className="space-y-3.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-white/60 transition-colors duration-200 hover:text-[#59dfaa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59dfaa]"
                  >
                    <span className="h-1 w-1 rounded-full bg-white/25 transition-all duration-200 group-hover:w-4 group-hover:bg-[#59dfaa]" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">Services</h2>
            <ul className="space-y-3.5">
              {services.map((service, index) => (
                <li key={`${service.title}-${index}`}>
                  <a
                    href="#services"
                    className="group inline-flex items-center gap-2 text-sm text-white/60 transition-colors duration-200 hover:text-[#59dfaa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59dfaa]"
                  >
                    <span className="h-1 w-1 rounded-full bg-white/25 transition-all duration-200 group-hover:w-4 group-hover:bg-[#59dfaa]" />
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-[24px] border border-white/10 bg-[#ffffff08] p-5 sm:p-6">
              <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">Contact</h2>
              <ul className="space-y-4">
                {contact.email && (
                  <li>
                    <a
                      href={`mailto:${contact.email}`}
                      className="group flex items-start gap-3 text-sm text-white/65 transition-colors duration-200 hover:text-[#59dfaa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59dfaa]"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#ffffff0a] text-[#59dfaa]">
                        <Mail className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 break-all">{contact.email}</span>
                      <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-white/20 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </li>
                )}
                {(contact.phone1 || contact.phone2) && (
                  <li>
                    <a
                      href={`tel:${contact.phone1?.replace(/\s/g, "")}`}
                      className="group flex items-start gap-3 text-sm text-white/65 transition-colors duration-200 hover:text-[#59dfaa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59dfaa]"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#ffffff0a] text-[#59dfaa]">
                        <Phone className="h-3.5 w-3.5" />
                      </span>
                      <span>
                        {contact.phone1}
                        {contact.phone2 && <><br />{contact.phone2}</>}
                      </span>
                      <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-white/20 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </li>
                )}
                {contact.address && (
                  <li className="flex items-start gap-3 text-sm text-white/65">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#ffffff0a] text-[#59dfaa]">
                      <MapPin className="h-3.5 w-3.5" />
                    </span>
                    <span>{contact.address}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="relative mb-12 overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0f13] shadow-[0_24px_70px_rgba(0,0,0,0.3)] sm:mb-14">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-[#030608cc] px-5 py-3 backdrop-blur-md sm:px-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Localisation</span>
            {contact.address && <span className="truncate text-xs text-white/65">{contact.address}</span>}
          </div>
          <iframe
            title="MOD-TECHNOLOGIE location map"
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
            className="h-64 w-full grayscale invert-[0.88] opacity-70 contrast-125 sm:h-72"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-7 text-center text-xs text-white/40 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} MOD-TECHNOLOGIE. Tous droits réservés.</p>
          <p className="flex items-center gap-1.5">
            Développé par
            <a
              href="https://wa.me/213773173911?text=Bonjour%20je%20viens%20depuis%20votre%20site"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#59dfaa] transition-colors duration-200 hover:text-[#83efc9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59dfaa]"
            >
              Youcef
              <FaWhatsapp className="h-3.5 w-3.5" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
