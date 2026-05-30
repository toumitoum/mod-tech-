"use client";

import { supabase } from "@/app/supabase";
import { Mail,MapPin,Phone } from "lucide-react";
import { useEffect,useState } from "react";
import { FaFacebookF,FaInstagram,FaLinkedinIn,FaWhatsapp } from "react-icons/fa";

interface ContactData {
  email?: string;
  phone1?: string;
  phone2?: string;
  address?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  whatsapp?: string;
}

interface ServiceItem {
  title: string;
}

const navLinks = [
  { label: "Accueil",       href: "#accueil"   },
  { label: "Services",      href: "#services"  },
  { label: "À propos",      href: "#apropos"   },
  { label: "Nos Réussites", href: "#reussites" },
  { label: "Contact",       href: "#contact"   },
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
    { icon: FaFacebookF,  href: contact.facebook,  hover: "hover:bg-blue-600",  show: !!contact.facebook  },
    { icon: FaInstagram,  href: contact.instagram, hover: "hover:bg-pink-600",  show: !!contact.instagram },
    { icon: FaLinkedinIn, href: contact.linkedin,  hover: "hover:bg-blue-700",  show: !!contact.linkedin  },
    {
      icon: FaWhatsapp,
      href: contact.whatsapp ? `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}` : undefined,
      hover: "hover:bg-green-600",
      show: !!contact.whatsapp,
    },
  ].filter((s) => s.show);

  return (
    <footer className="relative bg-slate-950 text-slate-400 overflow-hidden">

      {/* ── Subtle grid ── */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-teal-500/5 blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">

        {/* ── Top divider with teal accent ── */}
        <div className="flex items-center gap-4 pt-14 mb-14">
          <span className="h-px flex-1 bg-slate-800" />
          <div className="w-2 h-2 rounded-full bg-teal-500" />
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        {/* ── Main grid ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <img
              className="h-10 w-auto mb-5"
              src="/lovable-uploads/5c0baea8-dfe7-4330-a35f-643db8adb0b0.png"
              alt="MOD-TECHNOLOGIE"
            />
            <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-xs">
              Spécialistes en sécurité, réseaux, domotique et sonorisation. Des solutions sur mesure pour chaque besoin.
            </p>

            {/* Social icons */}
            {socialLinks.length > 0 && (
              <div className="flex gap-2">
                {socialLinks.map(({ icon: Icon, href, hover }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white ${hover} hover:border-transparent transition-all duration-200`}
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-5">
              Navigation
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-teal-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-teal-500 transition-colors duration-200" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-5">
              Services
            </h4>
            <ul className="space-y-3">
              {services.map((s, i) => (
                <li key={i}>
                  <a
                    href="#services"
                    className="text-sm text-slate-500 hover:text-teal-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-teal-500 transition-colors duration-200" />
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-5">
              Contact
            </h4>
            <ul className="space-y-4">
              {contact.email && (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-start gap-3 text-sm text-slate-500 hover:text-teal-400 transition-colors duration-200 group"
                  >
                    <Mail className="w-4 h-4 mt-0.5 shrink-0 text-slate-600 group-hover:text-teal-500 transition-colors duration-200" />
                    {contact.email}
                  </a>
                </li>
              )}
              {(contact.phone1 || contact.phone2) && (
                <li>
                  <a
                    href={`tel:${contact.phone1?.replace(/\s/g, "")}`}
                    className="flex items-start gap-3 text-sm text-slate-500 hover:text-teal-400 transition-colors duration-200 group"
                  >
                    <Phone className="w-4 h-4 mt-0.5 shrink-0 text-slate-600 group-hover:text-teal-500 transition-colors duration-200" />
                    <span>
                      {contact.phone1}
                      {contact.phone2 && <><br />{contact.phone2}</>}
                    </span>
                  </a>
                </li>
              )}
              {contact.address && (
                <li className="flex items-start gap-3 text-sm text-slate-500">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-600" />
                  {contact.address}
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-slate-800 py-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} MOD-TECHNOLOGIE. Tous droits réservés.</p>
          <p className="flex items-center gap-1.5">
            Développé par
            <a
              href="https://wa.me/213773173911?text=Bonjour%20je%20viens%20depuis%20votre%20site"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-green-500 hover:text-green-400 transition-colors duration-200 font-semibold"
            >
              Youcef
              <FaWhatsapp className="w-3.5 h-3.5" />
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}