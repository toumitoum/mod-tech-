"use client";

import { Facebook, Instagram, Linkedin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/app/supabase";

const Footer = () => {

  const [contact, setContact] = useState<any>({});
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {

    // جلب بيانات التواصل
    supabase
      .from("site_content")
      .select("content")
      .eq("section", "contact")
      .single()
      .then(({ data }) => {
        if (data?.content) setContact(data.content);
      });

    // جلب الخدمات
    supabase
      .from("site_content")
      .select("content")
      .eq("section", "services")
      .single()
      .then(({ data }) => {
        if (data?.content) setServices(data.content);
      });

  }, []);

  return (
    <footer className="py-12 bg-card border-t border-border">
      <div className="container mx-auto px-4">

        <div className="grid md:grid-cols-3 gap-8 mb-8">

          {/* LEFT */}
          <div>
            <img
              className="h-12"
              src="/lovable-uploads/5c0baea8-dfe7-4330-a35f-643db8adb0b0.png"
            />

            <p className="text-sm text-muted-foreground mt-3 max-w-xs">
              M2 MOD-TECHNOLOGIE
            </p>

            {contact.email && (
              <p className="text-sm mt-2">
                <a href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </p>
            )}

            {(contact.phone1 || contact.phone2) && (
              <p className="text-sm">
                {contact.phone1} {contact.phone2 && " / " + contact.phone2}
              </p>
            )}
          </div>


          {/* SERVICES */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>

            <ul className="space-y-2 text-sm text-muted-foreground">
              {services.map((s,i)=>(
                <li key={i}>{s.title}</li>
              ))}
            </ul>
          </div>


          {/* SOCIAL */}
          <div>
            <h4 className="font-semibold mb-4">Suivez-nous</h4>

            <div className="flex gap-3">

              {contact.facebook && (
                <a href={contact.facebook} target="_blank">
                  <Facebook />
                </a>
              )}

              {contact.instagram && (
                <a href={contact.instagram} target="_blank">
                  <Instagram />
                </a>
              )}

              {contact.linkedin && (
                <a href={contact.linkedin} target="_blank">
                  <Linkedin />
                </a>
              )}

            </div>
          </div>

        </div>

        <div className="border-t pt-6 text-center text-sm">
          © {new Date().getFullYear()} MOD-TECHNOLOGIE
        </div>

      </div>
    </footer>
  );
};

export default Footer;
