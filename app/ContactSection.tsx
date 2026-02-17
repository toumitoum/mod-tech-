"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const message =
    `name: ${formData.name}\n` +
    `email: ${formData.email}\n` +
    `phone: ${formData.phone}\n` +
    `message: ${formData.message}`;


  window.open(`https://wa.me/213556074480?text=${message}`, "_blank");
  setFormData({ name: "", email: "", phone: "", message: "" });

toast({
  title: "Message envoyé",
  description: "Nous vous répondrons sur WhatsApp.",
});

};



  return (
    <section id="contact" className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary tracking-wide uppercase">
            Contact
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-3 mb-4">
            Parlons de votre projet
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Contactez-nous pour un devis gratuit ou pour toute question sur nos services.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-8"
          >
            {[
              { icon: Phone, label: "Téléphone", value: "06 57 84 14 23 / 06 69 21 19 51" },
              { icon: Mail, label: "Email", value: "modtech.srv@gmail.com" },
              { icon: MapPin, label: "Adresse", value: "Algérie" },
            ].map((item) => (
              <div key={item.label} className="flex gap-4">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 h-fit">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                  <div className="font-medium text-foreground">{item.value}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="lg:col-span-3 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                placeholder="Votre nom"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-card border-border focus:border-primary"
              />
              <Input
                type="email"
                placeholder="Votre email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-card border-border focus:border-primary"
              />
            </div>
            <Input
              type="tel"
              placeholder="Votre téléphone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-card border-border focus:border-primary"
            />
            <Textarea
              placeholder="Décrivez votre projet..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={5}
              className="bg-card border-border focus:border-primary resize-none"
            />
            <Button variant="hero" size="lg" type="submit" className="w-full sm:w-auto">
              <Send className="w-4 h-4 mr-2" />
              Envoyer le message
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
