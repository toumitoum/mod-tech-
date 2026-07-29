"use client";

import { supabase } from "@/app/supabase";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect,useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/admin");
    });
  }, [router]);

  // LOGIN
  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pw,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#06090d] px-4 py-10 text-white sm:px-6">
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_16%_12%,rgba(20,200,184,0.16),transparent_31%),radial-gradient(circle_at_86%_82%,rgba(36,99,235,0.12),transparent_30%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_76%)]" />

      <section className="relative w-full max-w-[1040px] overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.035] shadow-[0_32px_100px_rgba(0,0,0,0.42)] backdrop-blur-xl lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden min-h-[610px] overflow-hidden border-r border-white/10 p-10 lg:flex lg:flex-col lg:justify-between">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(20,200,184,0.24),transparent_32%),linear-gradient(145deg,rgba(255,255,255,0.05),transparent_42%)]" />
          <div aria-hidden="true" className="absolute bottom-[-7rem] right-[-5rem] h-72 w-72 rounded-full border border-[#14C8B8]/30" />
          <div aria-hidden="true" className="absolute bottom-[-2.5rem] right-[2.5rem] h-48 w-48 rounded-full border border-white/10" />

          <div className="relative">
            <div className="mb-14 flex items-center gap-3">
              <img
                src="/lovable-uploads/82aae3c4-6a6f-4687-91d2-40410f0e26b7.png"
                alt="MOD-TECHNOLOGIE"
                className="h-10 w-auto"
              />
              <span className="h-5 w-px bg-white/20" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">Administration</span>
            </div>

            <p className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#59dfaa]">
              <span className="h-2 w-2 rounded-full bg-[#59dfaa]" />
              Espace sécurisé
            </p>
            <h1 className="max-w-sm text-4xl font-light uppercase leading-[1.04] tracking-[0.055em] text-white xl:text-5xl">
              Pilotez votre <span className="text-[#59dfaa]">activité</span> avec précision.
            </h1>
          </div>

          <div className="relative flex max-w-sm items-start gap-3 border-t border-white/12 pt-6 text-sm leading-6 text-white/60">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#59dfaa]" />
            <p>Accès réservé à l&apos;équipe MOD-TECHNOLOGIE.</p>
          </div>
        </div>

        <div className="flex min-h-[560px] items-center p-6 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-9 lg:hidden">
              <img
                src="/lovable-uploads/82aae3c4-6a6f-4687-91d2-40410f0e26b7.png"
                alt="MOD-TECHNOLOGIE"
                className="mb-8 h-9 w-auto"
              />
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#59dfaa]">Espace sécurisé</p>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight text-white">MOD-TECH Admin Login</h1>
              <p className="mt-2 text-sm leading-6 text-white/55">Connectez-vous pour accéder à l&apos;administration MOD-TECH.</p>
            </div>

            <form onSubmit={login} className="flex flex-col gap-5">
              <div className="space-y-2">
                <label htmlFor="login-email" className="text-xs font-semibold text-white/75">Email</label>
                <div className="group relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35 transition-colors group-focus-within:text-[#59dfaa]" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-white/14 bg-white/[0.055] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/25 focus:border-[#14C8B8] focus:bg-white/[0.075] focus:ring-4 focus:ring-[#14C8B8]/15"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="login-password" className="text-xs font-semibold text-white/75">Mot de passe</label>
                <div className="group relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35 transition-colors group-focus-within:text-[#59dfaa]" />
                  <input
                    id="login-password"
                    type={show ? "text" : "password"}
                    placeholder="Password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-white/14 bg-white/[0.055] py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/25 focus:border-[#14C8B8] focus:bg-white/[0.075] focus:ring-4 focus:ring-[#14C8B8]/15"
                  />

                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-white/45 transition hover:bg-white/10 hover:text-white"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{show ? "Hide" : "Show"}</span>
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" className="rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm leading-5 text-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="mt-1 flex h-14 items-center justify-center rounded-2xl bg-[#59dfaa] px-5 text-sm font-bold text-[#07140f] shadow-[0_14px_36px_rgba(89,223,170,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#73e9bc] active:translate-y-0 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-[#07140f]/25 border-t-[#07140f]" />Loading...</span>
                ) : "Login"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
