import { Facebook, Instagram, Linkedin } from "lucide-react";
import logo from "@/assets/logo.jpeg";

const Footer = () => {
  return (
    <footer className="py-12 bg-card border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <img alt="MOD-TECHNOLOGIE" className="h-12 w-auto" src="/lovable-uploads/5c0baea8-dfe7-4330-a35f-643db8adb0b0.png" />
            <p className="text-sm text-muted-foreground mt-3 max-w-xs">
              M2 MOD-TECHNOLOGIE — Sécurité - Surveillance - Réseaux Informatiques - Domotique - Contrôle d'Accès - Sonorisation
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <a href="mailto:modtech.srv@gmail.com" className="hover:text-primary transition-colors">modtech.srv@gmail.com</a>
            </p>
            <p className="text-sm text-muted-foreground">
              06 57 84 14 23 / 06 69 21 19 51
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Sécurité & Surveillance</li>
              <li>Réseaux Informatiques</li>
              <li>Domotique</li>
              <li>Contrôle d'Accès</li>
              <li>Sonorisation</li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Suivez-nous</h4>
            <div className="flex gap-3">

  <a
    href="https://www.facebook.com/youcef.toumi.709822"
    target="_blank"
    rel="noopener noreferrer"
    className="p-2 rounded-lg bg-secondary border border-border hover:border-primary/30 hover:text-primary transition"
  >
    <Facebook className="w-5 h-5" />
  </a>

  <a
    href="https://instagram.com/YOURPAGE"
    target="_blank"
    rel="noopener noreferrer"
    className="p-2 rounded-lg bg-secondary border border-border hover:border-primary/30 hover:text-primary transition"
  >
    <Instagram className="w-5 h-5" />
  </a>

  <a
    href="https://linkedin.com/in/YOURPAGE"
    target="_blank"
    rel="noopener noreferrer"
    className="p-2 rounded-lg bg-secondary border border-border hover:border-primary/30 hover:text-primary transition"
  >
    <Linkedin className="w-5 h-5" />
  </a>

</div>

          </div>
        </div>

        <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MOD-TECHNOLOGIE. Tous droits réservés.
        </div>
      </div>
    </footer>);

};

export default Footer;