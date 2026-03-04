"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Accueil", href: "#accueil" },
  { label: "Services", href: "#services" },
  { label: "À propos", href: "#apropos" },
  { label: "Nos Réussites", href: "#reussites" },
  { label: "Store", href: "/store" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-2xl shadow-lg border-b border-gray-700"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
        
        {/* Logo */}
        <Link href="#accueil" className="flex items-center">
          <img
            src="/lovable-uploads/82aae3c4-6a6f-4687-91d2-40410f0e26b7.png"
            alt="MOD-TECHNOLOGIE"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-700 hover:text-teal-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <Button
            asChild
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Link href="#contact">Demander un devis</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-gray-800"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Animated */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white/95 backdrop-blur-2xl border-t border-gray-200 px-6 pb-6 pt-4 space-y-4 shadow-lg"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block text-gray-700 hover:text-teal-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <Button
              asChild
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Link href="#contact" onClick={() => setOpen(false)}>
                Demander un devis
              </Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}