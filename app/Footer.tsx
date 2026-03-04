"use client";

import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { useEffect, useState } from "react";
import { supabase } from "@/app/supabase";

interface ContactData {
  email?: string;
  phone1?: string;
  phone2?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

interface ServiceItem {
  title: string;
}

export default function Footer() {
  const [contact, setContact] = useState<ContactData>({});
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: contactData } = await supabase
          .from("site_content")
          .select("content")
          .eq("section", "contact")
          .single();

        if (contactData?.content) {
          setContact(contactData.content);
        }

        const { data: servicesData } = await supabase
          .from("site_content")
          .select("content")
          .eq("section", "services")
          .single();

        if (servicesData?.content) {
          setServices(servicesData.content);
        }
      } catch (error) {
        console.error("Footer fetch error:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <footer className="bg-slate-900 text-gray-300 pt-14 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid md:grid-cols-3 gap-10 mb-12">

          {/* LEFT */}
          <div>
            <img
              className="h-12"
              src="/lovable-uploads/5c0baea8-dfe7-4330-a35f-643db8adb0b0.png"
              alt="MOD-TECHNOLOGIE"
            />

            <p className="text-sm mt-4 text-gray-400 max-w-xs">
              MOD-TECHNOLOGIE
            </p>

            {contact.email && (
              <p className="text-sm mt-3">
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-teal-400 transition-colors"
                >
                  {contact.email}
                </a>
              </p>
            )}

            {(contact.phone1 || contact.phone2) && (
              <p className="text-sm mt-1 text-gray-400">
                {contact.phone1}
                {contact.phone2 && ` / ${contact.phone2}`}
              </p>
            )}
          </div>

          {/* SERVICES */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Services</h4>

            <ul className="space-y-2 text-sm">
              {services.map((s, i) => (
                <li
                  key={i}
                  className="text-gray-400 hover:text-teal-400 transition-colors cursor-pointer"
                >
                  {s.title}
                </li>
              ))}
            </ul>
          </div>

          {/* SOCIAL */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Suivez-nous</h4>

            <div className="flex gap-4">

              {contact.facebook && (
                <a
                  href={contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-blue-600 transition-all duration-300"
                >
                  <FaFacebookF size={18} />
                </a>
              )}

              {contact.instagram && (
                <a
                  href={contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-pink-600 transition-all duration-300"
                >
                  <FaInstagram size={18} />
                </a>
              )}

              {contact.linkedin && (
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-blue-700 transition-all duration-300"
                >
                  <FaLinkedinIn size={18} />
                </a>
              )}

            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 text-center text-lg text-sm text-gray-500 space-y-2">
          <p>
            © {new Date().getFullYear()} MOD-TECHNOLOGIE. Tous droits réservés.
          </p>

          <p className=" text-xl border-white/10   text-gray-400 flex items-center justify-center gap-2">
            Developed by
            <a
              href="https://wa.me/213773173911?text=Bonjour%20je%20viens%20depuis%20votre%20site"
              target="_blank"
              rel="noopener noreferrer"
              className="flex  items-center gap-2 text-green-500 hover:text-green-400 transition-colors"
            >
              Youcef
              <FaWhatsapp className="text-lg" />
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}