import { easeInOut } from "framer-motion";

export interface HeroContent {
  title: string;
  titleHighlight: string;
  subtitle: string;
  badge: string;
  btnPrimary: string;
  btnSecondary: string;
  bgImage: string;
}

export interface AboutStats {
  years: string;
  clients: string;
  projects: string;
}

export const DEFAULT_HERO_CONTENT: HeroContent = {
  title: "Sécurité & Innovation",
  titleHighlight: "Technologique",
  subtitle:
    "Spécialistes en systèmes de sécurité, réseaux informatiques, domotique, contrôle d'accès et sonorisation, nous offrons des solutions intégrées pour une protection optimale et une gestion intelligente de vos espaces.",
  badge: "Solutions Technologiques Avancées",
  btnPrimary: "Demander une Consultation Gratuite",
  btnSecondary: "Découvrir Nos Services Complets",
  bgImage: "",
};

export const DEFAULT_ABOUT_STATS: AboutStats = {
  years: "5+",
  clients: "200+",
  projects: "500+",
};

export const CONTAINER_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeInOut }, // Changed from "easeInOut" to easeInOut
  },
};

export const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeInOut' } },
};
