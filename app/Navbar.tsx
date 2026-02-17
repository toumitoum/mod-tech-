"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.jpeg";

const navLinks = [
{ label: "Accueil", href: "#accueil" },
{ label: "Services", href: "#services" },
{ label: "À propos", href: "#apropos" },
{ label: "Contact", href: "#contact" }];


const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 bg-primary-foreground">
        <a href="#accueil" className="flex items-center">
          <img alt="MOD-TECHNOLOGIE" className="h-10 w-auto" src="/lovable-uploads/82aae3c4-6a6f-4687-91d2-40410f0e26b7.png" />
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
          <a
            key={link.href}
            href={link.href}
            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">

              {link.label}
            </a>
          )}
          <Button variant="hero" size="sm" asChild>
            <a href="#contact">Demander un devis</a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open &&
      <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-4 pb-4">
          {navLinks.map((link) =>
        <a
          key={link.href}
          href={link.href}
          onClick={() => setOpen(false)}
          className="block py-3 text-muted-foreground hover:text-primary transition-colors">

              {link.label}
            </a>
        )}
          <Button variant="hero" size="sm" className="w-full mt-2" asChild>
            <a href="#contact">Demander un devis</a>
          </Button>
        </div>
      }
    </nav>);

};

export default Navbar;