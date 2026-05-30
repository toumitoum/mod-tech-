"use client";

import { AnimatePresence,motion } from "framer-motion";
import { ArrowRight,Menu,X } from "lucide-react";
import Link from "next/link";
import { useEffect,useState } from "react";

const navLinks = [
  { label: "Accueil",      href: "#accueil"   },
  { label: "Services",     href: "#services"  },
  { label: "À propos",     href: "#apropos"   },
  { label: "Nos Réussites",href: "#reussites" },
  { label: "Store",        href: "/store"     },
  { label: "Contact",      href: "#contact"   },
];

export default function Navbar() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive]   = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-2xl shadow-sm border-b border-slate-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 sm:h-18 px-5 sm:px-8 lg:px-12">

          {/* ── Logo ── */}
          <Link
            href="#accueil"
            className="flex items-center shrink-0"
            onClick={() => setOpen(false)}
          >
            <img
              src="/lovable-uploads/82aae3c4-6a6f-4687-91d2-40410f0e26b7.png"
              alt="MOD-TECHNOLOGIE"
              className="h-9 w-auto"
            />
          </Link>

          {/* ── Desktop links ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => setActive(link.href)}
                onMouseLeave={() => setActive("")}
                className="relative px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors duration-200 rounded-lg hover:bg-teal-50 group"
              >
                {link.label}
                {/* Active underline */}
                <span className={`absolute bottom-1 left-3.5 right-3.5 h-px bg-teal-500 rounded-full transition-all duration-200 ${
                  active === link.href ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                } origin-left`} />
              </Link>
            ))}
          </div>

          {/* ── Desktop CTA ── */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="#contact"
              className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-teal-500 hover:bg-teal-400 text-white rounded-xl transition-all duration-200 shadow-md shadow-teal-500/20 hover:shadow-teal-400/30 active:scale-[0.98]"
            >
              Demander un devis
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* ── Mobile toggle ── */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:text-teal-600 transition-all duration-200 shadow-sm"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={open ? "close" : "open"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>

        {/* ── Mobile drawer ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden bg-white border-t border-slate-100 shadow-lg"
            >
              <div className="px-5 pt-3 pb-6 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 transition-all duration-150"
                    >
                      {link.label}
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                    </Link>
                  </motion.div>
                ))}

                <div className="pt-3">
                  <Link
                    href="#contact"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-bold bg-teal-500 hover:bg-teal-400 text-white rounded-xl transition-all duration-200 shadow-md shadow-teal-500/20 active:scale-[0.98]"
                  >
                    Demander un devis
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}