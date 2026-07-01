"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Wrench, ClipboardList, BarChart3, Brain, Zap, Check, ArrowRight, Building2,
  UserCheck, Menu, X, ChevronLeft, ChevronRight, Sparkles, Columns3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useCountUp } from "@/hooks/use-count-up";

/* ── data ─────────────────────────────────────── */

const statsData = [
  { end: 1200, suffix: "+", label: "Tickets resueltos" },
  { end: 98, suffix: "%", label: "Satisfacción" },
  { value: "<2h", label: "Ticket Exprés" },
  { value: "24/7", label: "Disponible" },
];

const featuresData = [
  { icon: ClipboardList, title: "Gestión de Tickets", desc: "Crea, asigna y haz seguimiento con estados visuales.", span: 2 },
  { icon: BarChart3, title: "Analytics en Tiempo Real", desc: "Dashboard con métricas en vivo y tendencias.", span: 1 },
  { icon: Columns3, title: "Tablero Kanban", desc: "Arrastra y suelta tickets entre etapas.", span: 1 },
  { icon: Brain, title: "Clasificación Automática", desc: "El sistema sugiere categoría, prioridad y solución.", span: 1 },
  { icon: Zap, title: "Ticket Exprés", desc: "Respuesta garantizada en menos de 2 horas.", span: 2 },
];

const companyPlans = [
  { name: "Gratis", price: "0", desc: "Para empezar", features: ["50 tickets/mes", "Dashboard básico", "Base de conocimiento", "1 diagnóstico automático", "Pago con YAPE/PLIN"], cta: "Empezar gratis", href: "/register", popular: false },
  { name: "Básico", price: "29", desc: "Para equipos en crecimiento", features: ["Tickets ilimitados", "Diagnóstico automático ilimitado", "Analytics intermedio", "Notificaciones por correo", "Soporte por correo"], cta: "Suscribirse", href: "/register", popular: true },
  { name: "Pro", price: "79", desc: "Para empresas que exigen más", features: ["Todo del plan Básico", "Clasificación avanzada", "Sugerencias inteligentes", "Analytics avanzado", "Soporte prioritario", "Runbook Engine", "Kanban avanzado"], cta: "Contactar", href: "/register", popular: false },
];

const personalPlan = {
  name: "Soporte Individual", price: "0", desc: "Paga solo cuando necesites help desk",
  features: ["Diagnóstico automático gratis", "Técnicos asignados", "Seguimiento en tiempo real", "Pago por ticket resuelto", "Sin suscripción mensual"],
  cta: "Registrarme", href: "/register",
};

const testimonials = [
  { name: "Danny Ordoñez", role: "Admin TI — TechCorp S.A.C.", text: "Desde Flix Support, tiempos de respuesta -60%. La clasificación automática nos ayuda a priorizar." },
  { name: "Ludwing Silva", role: "Técnico — TechCorp S.A.C.", text: "La base de conocimiento integrada me permite resolver tickets mucho más rápido." },
  { name: "Jhor Grandez", role: "Técnico — TechCorp S.A.C.", text: "El Ticket Exprés cambió todo. Soporte urgente en menos de 2 horas." },
  { name: "Alexander Paredes", role: "Usuario Individual", text: "Mi laptop no encendía. En 3 horas un técnico vino a mi casa y lo solucionó." },
  { name: "María Castillo", role: "Admin TI — InnovaSoft", text: "Migramos de hojas de cálculo a Flix Support y la diferencia fue inmediata." },
];

/* ── sub-components ─────────────────────────── */

function AnimatedStat({ end, suffix, value, label }: { end?: number; suffix?: string; value?: string; label: string }) {
  const { value: count, ref } = useCountUp(end || 0, 2000);
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl font-bold tabular-nums text-foreground">
        {value || `${count}${suffix || ""}`}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function TestimonialCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
  }

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 360, behavior: "smooth" });
      }
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="relative group" onMouseEnter={() => clearInterval(intervalRef.current)} onMouseLeave={() => {
      intervalRef.current = setInterval(() => {
        if (!scrollRef.current) return;
        const el = scrollRef.current;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 10) el.scrollTo({ left: 0, behavior: "smooth" });
        else el.scrollBy({ left: 360, behavior: "smooth" });
      }, 4000);
    }}>
      <div ref={scrollRef} onScroll={checkScroll} className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4">
        {testimonials.map((t) => (
          <div key={t.name} className="flex-shrink-0 w-[300px] sm:w-[360px] snap-start rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6">
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map((i) => <Sparkles key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />)}
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
            <div className="mt-5 flex items-center gap-3 border-t border-border/40 pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-sm font-semibold text-blue-600 dark:text-blue-400">{t.name.charAt(0)}</div>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => scroll("left")} className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 h-10 w-10 rounded-full border border-border bg-card shadow-lg flex items-center justify-center transition-all hover:bg-muted ${canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={() => scroll("right")} className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 h-10 w-10 rounded-full border border-border bg-card shadow-lg flex items-center justify-center transition-all hover:bg-muted ${canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

function SectionHeading({ overline, title, subtitle }: { overline: string; title: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="mb-8 sm:mb-12"
    >
      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{overline}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 max-w-xl text-muted-foreground text-lg">{subtitle}</p>}
    </motion.div>
  );
}

/* ── page ────────────────────────────────────── */

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-transparent bg-background/70 backdrop-blur-xl dark:bg-black/50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Flix<span className="text-blue-600">Support</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Características</Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Precios</Link>
            <Link href="/kiosk" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Kiosko</Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-all hover:opacity-90">
              Crear cuenta <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
          <div className="md:hidden flex items-center gap-2">
            <Link href="/login" className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium">Iniciar sesión</Link>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9"><Menu className="h-5 w-5" /></Button></SheetTrigger>
              <SheetContent side="right" className="w-[260px] p-0">
                <SheetTitle className="sr-only">Menú</SheetTitle>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between px-5 h-16 border-b border-border">
                    <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background"><Wrench className="h-4 w-4" /></div>
                      <span className="font-bold">Flix<span className="text-blue-600">Support</span></span>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileOpen(false)}><X className="h-4 w-4" /></Button>
                  </div>
                  <nav className="flex flex-col gap-1 p-3 flex-1">
                    {[{ label: "Características", href: "#features" }, { label: "Precios", href: "#pricing" }, { label: "Kiosko", href: "/kiosk" }].map((i) => (
                      <Link key={i.label} href={i.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">{i.label}</Link>
                    ))}
                    <div className="mt-auto border-t border-border pt-3 space-y-2">
                      <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted">Iniciar sesión</Link>
                      <Link href="/register" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background">Crear cuenta<ArrowRight className="h-3.5 w-3.5" /></Link>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── HERO ── */}
        <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
          {/* Light mode: organic blobs */}
          <div className="absolute inset-0 dark:hidden">
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-200/40 via-purple-200/30 to-rose-200/30 blur-3xl" />
            <div className="absolute -bottom-60 -left-40 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-amber-200/30 via-pink-200/20 to-blue-200/30 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-blue-300/20 to-purple-300/20 blur-2xl" />
          </div>
          {/* Dark mode: animated mesh */}
            <div className="absolute inset-0 hidden dark:block">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_80%,rgba(139,92,246,0.1),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_20%_50%,rgba(6,182,212,0.08),transparent)]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 mb-6">
                  <Sparkles className="h-3.5 w-3.5" />
                  Nueva plataforma
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                  <span className="font-light text-muted-foreground">Soporte TI</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 dark:from-blue-400 dark:via-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
                    que funciona
                  </span>
                </h1>
                <p className="mt-4 sm:mt-6 max-w-lg text-base sm:text-lg text-muted-foreground leading-relaxed">
                  La plataforma que tu equipo de help desk merece. Tickets, Kanban, analytics y pagos con YAPE/PLIN. Para empresas y personas.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link href="/register" className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5">
                    <Building2 className="h-4 w-4" /> Para Empresas <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link href="/register" className="group inline-flex items-center gap-2 rounded-xl border-2 border-border px-7 py-3.5 text-base font-semibold text-foreground transition-all hover:border-foreground/30 hover:-translate-y-0.5 dark:border-white/20 dark:hover:border-white/40">
                    <UserCheck className="h-4 w-4" /> Soporte Personal <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500" /> Sin tarjeta</span>
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500" /> 50 tickets gratis</span>
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500" /> YAPE / PLIN</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                className="relative"
              >
                {/* Laptop frame */}
                <div className="relative mx-auto max-w-lg">
                  <div className="rounded-2xl border border-border/60 bg-card shadow-2xl shadow-blue-500/5 dark:shadow-blue-500/10 overflow-hidden">
                    <div className="flex items-center gap-2 border-b border-border/40 bg-muted/30 px-4 py-2.5">
                      <div className="flex gap-1.5"><div className="h-3 w-3 rounded-full bg-red-400" /><div className="h-3 w-3 rounded-full bg-amber-400" /><div className="h-3 w-3 rounded-full bg-green-400" /></div>
                    </div>
                    <Image src="/screenshots/dashboard.svg" alt="Dashboard de FlixSupport" width={600} height={340} className="w-full" />
                  </div>
                  {/* Glow behind */}
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 blur-2xl -z-10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-cyan-500/20" />
                </div>

                {/* Floating phone */}
                <div className="hidden lg:block absolute -bottom-6 -right-6 w-36 rounded-2xl border border-border/60 bg-card shadow-xl overflow-hidden rotate-6 hover:rotate-3 transition-transform duration-500">
                  <Image src="/screenshots/mobile.svg" alt="FlixSupport mobile" width={150} height={240} className="w-full" />
                </div>
              </motion.div>
            </div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-14 sm:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {statsData.map((s) => (
                <div key={s.label} className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-5 sm:p-6">
                  <AnimatedStat end={s.end} suffix={s.suffix} value={s.value} label={s.label} />
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="border-t border-border/40 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading overline="Lo que incluye" title="Todo el poder de un help desk moderno" subtitle="Herramientas reales que tu equipo va a usar. Sin relleno." />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuresData.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={`group rounded-2xl border border-border/50 bg-card p-5 sm:p-6 transition-all duration-200 hover:border-border hover:shadow-md ${f.span === 2 ? "sm:col-span-2" : ""}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30 transition-colors">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="border-t border-border/40 bg-muted/20 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading overline="Precios" title="Sin letra chica" subtitle="Empieza gratis. Escala cuando quieras. Sin compromisos forzosos." />

            {/* Company plans */}
            <div className="mb-14">
              <div className="flex items-center gap-2.5 mb-8">
                <Building2 className="h-5 w-5 text-foreground/60" />
                <h3 className="text-lg font-semibold">Para Empresas</h3>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                {companyPlans.map((plan, i) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    whileHover={{ scale: 1.02, rotateY: 2 }}
                    style={{ perspective: "1000px" }}
                    className={`relative flex flex-col rounded-2xl border bg-card p-7 transition-all duration-300 hover:shadow-2xl ${
                      plan.popular
                        ? "border-blue-600 shadow-xl shadow-blue-500/10 ring-1 ring-blue-600/20 dark:shadow-blue-500/20"
                        : "border-border/60 hover:border-border"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-6 inline-flex items-center rounded-md bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white">Más popular</div>
                    )}
                    <div className="mb-5">
                      <h4 className="text-lg font-semibold">{plan.name}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">{plan.desc}</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">S/{plan.price}</span>
                      <span className="text-sm text-muted-foreground ml-1">/mes</span>
                    </div>
                    <ul className="mb-8 space-y-2.5 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <Check className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
                          <span className="text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={plan.href}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                        plan.popular
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                          : "border border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Personal plan */}
            <div>
              <div className="flex items-center gap-2.5 mb-8">
                <UserCheck className="h-5 w-5 text-foreground/60" />
                <h3 className="text-lg font-semibold">Para Personas</h3>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="max-w-md"
              >
                <div className="relative flex flex-col rounded-2xl border border-border/60 bg-card p-7 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="mb-5">
                    <h4 className="text-lg font-semibold">{personalPlan.name}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{personalPlan.desc}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{personalPlan.price} PEN</span>
                    <span className="text-sm text-muted-foreground ml-1">diagnóstico</span>
                  </div>
                  <ul className="mb-8 space-y-2.5 flex-1">
                    {personalPlan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={personalPlan.href} className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-all shadow-sm">
                    {personalPlan.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="border-t border-border/40 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading overline="Testimonios" title="Equipos que ya confían" />
            <TestimonialCarousel />
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="absolute inset-0 bg-gray-950 dark:bg-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.25),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_80%,rgba(139,92,246,0.15),transparent)]" />
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Tu help desk,<br /><span className="text-blue-400">sin complicaciones</span>
              </h2>
              <p className="mt-5 text-lg text-gray-300">Empieza gratis. Sin tarjeta. Sin compromiso.</p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-gray-900 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-0.5">
                  <Building2 className="h-4 w-4" /> Crear cuenta empresa
                </Link>
                <Link href="/register" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/15">
                  <UserCheck className="h-4 w-4" /> Soporte personal
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background"><Wrench className="h-4 w-4" /></div>
                <span className="text-base font-bold">Flix<span className="text-blue-600">Support</span></span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">Plataforma de gestión de soporte técnico. Para empresas y personas.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Producto</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Características</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground transition-colors">Precios</Link></li>
                <li><Link href="/kiosk" className="hover:text-foreground transition-colors">Kiosko</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Crear cuenta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><span className="cursor-default">Sobre nosotros</span></li>
                <li><span className="cursor-default">Contacto</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><span className="cursor-default">Términos y condiciones</span></li>
                <li><span className="cursor-default">Política de privacidad</span></li>
              </ul>
              <div className="mt-6">
                <Image src="/payment-methods.svg" alt="Métodos de pago" width={180} height={28} className="opacity-60" />
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Flix Support. Proyecto de Gestión de Servicios en TI — UNAP 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
