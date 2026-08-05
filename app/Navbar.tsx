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
            ? "border-b border-slate-200/80 bg-white/92 shadow-[0_10px_28px_rgba(15,23,42,0.08)] backdrop-blur-2xl"
            : "border-b border-slate-200/60 bg-white/75 backdrop-blur-xl"
        }`}
      >
        <div className="mod-container flex h-[76px] items-center justify-between lg:h-[88px]">

          {/* ── Logo ── */}
          <Link
            href="#accueil"
            className="flex items-center shrink-0"
            onClick={() => setOpen(false)}
          >
            <img
              src="/lovable-uploads/82aae3c4-6a6f-4687-91d2-40410f0e26b7.png"
              alt="MOD-TECHNOLOGIE"
              className="h-9 w-auto lg:h-10"
            />
          </Link>

          {/* ── Desktop links ── */}
          <div className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => setActive(link.href)}
                onMouseLeave={() => setActive("")}
                onFocus={() => setActive(link.href)}
                onBlur={() => setActive("")}
                className={`group relative rounded-lg px-2.5 py-2 text-[13px] font-medium tracking-[-0.01em] transition-colors duration-200 hover:text-[#59dfaa] lg:px-3 ${
                  "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {link.label}
                {/* Active underline */}
                <span className={`absolute bottom-1 left-2.5 right-2.5 h-px rounded-full bg-[#14C8B8] transition-all duration-200 lg:left-3 lg:right-3 ${
                  active === link.href ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                } origin-left`} />
              </Link>
            ))}
          </div>

          {/* ── Desktop CTA ── */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="#contact"
              className={`group inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-[13px] font-semibold tracking-[-0.01em] shadow-sm transition-all duration-200 active:scale-[0.98] lg:px-5 ${
                "bg-slate-950 text-white hover:bg-[#0f766e]"
              }`}
            >
              Demander un devis
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* ── Mobile toggle ── */}
          <button type="button"
            className={`relative z-[60] ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-lg transition-all duration-200 md:hidden ${
              "border-slate-200 bg-white text-slate-700 hover:border-[#14C8B8]/50 hover:text-[#0fb3a4] shadow-sm"
            }`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
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
              className={`overflow-hidden border-t shadow-xl md:hidden ${
                "border-slate-100 bg-white"
              }`}
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
                      className={`flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-150 ${
                        "text-slate-700 hover:bg-[#14C8B8]/8 hover:text-[#0fb3a4]"
                      }`}
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
                    className={`flex w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-bold active:scale-[0.98] ${
                      "bg-slate-950 text-white"
                    }`}
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
