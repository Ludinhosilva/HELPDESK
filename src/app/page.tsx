import Link from "next/link";
import { Wrench, ClipboardList, BarChart3, Brain, BookOpen, Zap, Check, ArrowRight, Star, Users, Shield, Building2, MessageSquare, TrendingUp, Sparkles, Play } from "lucide-react";

const features = [
  { icon: ClipboardList, title: "Gestión de Tickets", desc: "Creación, asignación, seguimiento por estados, comentarios y evaluación post-resolución.", color: "from-blue-500 to-cyan-500", bg: "bg-blue-50 dark:bg-blue-950/30", iconColor: "text-blue-600 dark:text-blue-400" },
  { icon: BarChart3, title: "Analytics en Tiempo Real", desc: "Dashboard con métricas, gráficos por categoría, rendimiento de técnicos y tendencias temporales.", color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", iconColor: "text-emerald-600 dark:text-emerald-400" },
  { icon: Brain, title: "IA Predictiva", desc: "Clasificación automática de tickets, análisis de sentimiento y sugerencias de solución inteligentes.", color: "from-purple-500 to-pink-500", bg: "bg-purple-50 dark:bg-purple-950/30", iconColor: "text-purple-600 dark:text-purple-400" },
  { icon: BookOpen, title: "Base de Conocimiento", desc: "Artículos, guías y soluciones documentadas. Acceso rápido para técnicos y usuarios.", color: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-950/30", iconColor: "text-amber-600 dark:text-amber-400" },
  { icon: Zap, title: "Ticket Exprés", desc: "Prioridad urgente con respuesta garantizada en menos de 2 horas. Pago integrado por ticket.", color: "from-rose-500 to-red-500", bg: "bg-rose-50 dark:bg-rose-950/30", iconColor: "text-rose-600 dark:text-rose-400" },
  { icon: Users, title: "Roles y Equipos", desc: "Administradores, técnicos y usuarios finales. Asignación inteligente y flujos de trabajo.", color: "from-indigo-500 to-violet-500", bg: "bg-indigo-50 dark:bg-indigo-950/30", iconColor: "text-indigo-600 dark:text-indigo-400" },
];

const plans = [
  { name: "Gratis", price: "0", desc: "Perfecto para empezar", popular: false, features: ["50 tickets/mes", "Dashboard básico", "Base de conocimiento", "1 chat con IA gratis"], cta: "Empezar gratis", href: "/register" },
  { name: "Básico", price: "29", desc: "Para equipos en crecimiento", popular: true, features: ["Tickets ilimitados", "IA ilimitada", "Analytics básico", "Notificaciones por correo", "Soporte por correo"], cta: "Suscribirse", href: "/register" },
  { name: "Pro", price: "79", desc: "Para empresas que exigen más", popular: false, features: ["Todo del plan Básico", "IA clasificación automática", "Sugerencias de solución IA", "Analytics avanzado", "Soporte prioritario"], cta: "Contactar", href: "/register" },
];

const testimonials = [
  { name: "Danny Ordoñez", role: "Admin TI - TechCorp S.A.C.", avatar: "DO", text: "Desde que implementamos Flix Support, nuestros tiempos de respuesta se redujeron en un 60%. La IA nos ayuda a clasificar tickets automáticamente.", rating: 5 },
  { name: "Ludwing Silva", role: "Técnico - TechCorp S.A.C.", avatar: "LS", text: "La base de conocimiento integrada y las sugerencias de solución me permiten resolver tickets mucho más rápido. Excelente herramienta.", rating: 5 },
  { name: "Jhor Grandez", role: "Técnico - TechCorp S.A.C.", avatar: "JG", text: "El Ticket Exprés es un game changer. Nuestros usuarios pueden obtener soporte urgente en menos de 2 horas. Muy recomendado.", rating: 4 },
];

const steps = [
  { icon: Building2, step: "1", title: "Registra tu empresa", desc: "Crea tu cuenta en segundos. Configura tu organización, invita a tu equipo y define categorías." },
  { icon: MessageSquare, step: "2", title: "Crea y gestiona tickets", desc: "Usa el asistente IA para describir problemas. Asigna técnicos, da seguimiento y resuelve." },
  { icon: TrendingUp, step: "3", title: "Analiza y mejora", desc: "Métricas en tiempo real, evaluaciones post-resolución e IA que aprende de tu base de conocimiento." },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg transition-transform group-hover:scale-105 duration-300">
              <Wrench className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Flix<span className="text-blue-600">Support</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Características</Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Precios</Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 active:scale-100">
              Crear cuenta gratis
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
          <Link href="/register" className="md:hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
            Crear cuenta
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 via-transparent to-transparent dark:from-blue-950/20" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-3xl pointer-events-none" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Nueva: IA predictiva integrada
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                El soporte TI que{" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  tu empresa merece
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                Gestiona tickets, automatiza con IA predictiva, analiza métricas en tiempo real
                y ofrece soporte exprés. Todo en una plataforma moderna y escalable.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 active:scale-100">
                  Empezar gratis
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-3.5 text-base font-semibold text-foreground shadow-sm transition-all hover:bg-accent hover:shadow-md">
                  <Shield className="h-4 w-4" />
                  Iniciar sesión
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" />Sin tarjeta</div>
                <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" />50 tickets gratis</div>
                <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" />IA incluida</div>
              </div>
            </div>

            <div className="mt-16 mx-auto max-w-5xl">
              <div className="relative rounded-2xl border border-border/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-2 shadow-2xl">
                <div className="rounded-xl border border-border/30 bg-background overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <div className="mx-auto rounded-md bg-muted/50 px-3 py-0.5 text-xs text-muted-foreground">dashboard.flixsupport.app</div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-4">
                      {[
                        { label: "Tickets abiertos", value: "12", color: "text-blue-600" },
                        { label: "Resueltos hoy", value: "8", color: "text-green-600" },
                        { label: "T. promedio", value: "2.4h", color: "text-amber-600" },
                        { label: "Satisfacción", value: "96%", color: "text-purple-600" },
                      ].map((s) => (
                        <div key={s.label} className="rounded-lg bg-muted/50 p-3 text-center">
                          <div className={`text-lg sm:text-2xl font-bold ${s.color}`}>{s.value}</div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="rounded-lg bg-muted/30 p-3 sm:p-4 border border-border/30">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tickets por día</span>
                        </div>
                        <div className="flex items-end gap-1 h-12 sm:h-16">
                          {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                            <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-blue-500 to-blue-400 transition-all hover:opacity-80" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-3 sm:p-4 border border-border/30">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Por categoría</span>
                        </div>
                        <div className="space-y-2">
                          {[{ label: "Hardware", pct: 40 }, { label: "Software", pct: 30 }, { label: "Red", pct: 20 }, { label: "Accesos", pct: 10 }].map((c) => (
                            <div key={c.label} className="flex items-center gap-2">
                              <span className="text-[10px] sm:text-xs text-muted-foreground w-14 shrink-0">{c.label}</span>
                              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all" style={{ width: `${c.pct}%` }} />
                              </div>
                              <span className="text-[10px] sm:text-xs text-muted-foreground w-6 text-right">{c.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1 text-xs font-medium text-white shadow-lg">
                  Dashboard en vivo
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border/50 bg-muted/30 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">Usado por equipos de TI de</p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {["TechCorp S.A.C.", "InnovaSoft E.I.R.L.", "DataCenter Perú", "Soluciones TI", "CloudNet SAC", "ByteCorp"].map((c) => (
                <div key={c} className="flex items-center gap-2 text-sm font-medium text-muted-foreground/60">
                  <Building2 className="h-4 w-4" />
                  {c}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/50 px-4 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 mb-4">Características</div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Todo lo que necesitas para gestionar soporte TI</h2>
              <p className="mt-4 text-muted-foreground">Una plataforma completa con herramientas modernas, IA integrada y métricas en tiempo real.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="group relative rounded-2xl border border-border/50 bg-card p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-transparent">
                  <div className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${f.bg}`} />
                  <div className="relative">
                    <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${f.bg} ${f.iconColor} transition-transform group-hover:scale-110 duration-300`}>
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted/30 border-y border-border/50 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 px-4 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 mb-4">Cómo funciona</div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Comienza en 3 pasos</h2>
              <p className="mt-4 text-muted-foreground">Configura tu plataforma de soporte TI en minutos, no en semanas.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 relative">
              <div className="hidden md:block absolute top-12 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-transparent" />
              {steps.map((s) => (
                <div key={s.title} className="relative text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/20">
                    <s.icon className="h-7 w-7" />
                  </div>
                  <div className="absolute top-0 right-1/2 translate-x-16 -translate-y-1 hidden md:flex h-7 w-7 items-center justify-center rounded-full bg-muted-foreground/10 text-xs font-bold text-muted-foreground">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-4 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-4">Precios</div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Planes que se ajustan a tu empresa</h2>
              <p className="mt-4 text-muted-foreground">Desde empezar gratis hasta soluciones enterprise. Todos los planes incluyen actualizaciones.</p>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
              {plans.map((plan) => (
                <div key={plan.name} className={`relative flex flex-col rounded-2xl border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${plan.popular ? "border-blue-500 shadow-lg shadow-blue-500/10 scale-105 lg:scale-110" : "border-border/50"}`}>
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                      <Star className="h-3 w-3 fill-white" />
                      Más popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">S/{plan.price}</span>
                    <span className="text-sm text-muted-foreground ml-1">/mes</span>
                  </div>
                  <ul className="mb-8 space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <Check className={`h-4 w-4 mt-0.5 shrink-0 ${plan.popular ? "text-blue-500" : "text-green-500"}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]"
                        : "border border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted/30 border-y border-border/50 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50 px-4 py-1 text-xs font-semibold text-green-700 dark:text-green-300 mb-4">Testimonios</div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Lo que dicen nuestros clientes</h2>
              <p className="mt-4 text-muted-foreground">Equipos de TI reales que ya transformaron su gestión de soporte con Flix Support.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.name} className="rounded-2xl border border-border/50 bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 duration-300">
                  <StarRating rating={t.rating} />
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800" />
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-purple-400/10 blur-3xl" />
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Transforma tu soporte TI hoy</h2>
            <p className="mt-4 text-lg text-blue-100/80">Empieza gratis. Sin tarjeta de crédito. Sin compromiso. Configuración en 5 minutos.</p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-xl transition-all hover:shadow-2xl hover:scale-105 active:scale-100">
                Crear cuenta gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20">
                <Play className="h-4 w-4" />
                Ver demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg">
                  <Wrench className="h-4 w-4" />
                </div>
                <span className="text-base font-bold">Flix<span className="text-blue-600">Support</span></span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">Plataforma moderna de gestión de soporte técnico con IA predictiva.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Producto</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Características</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground transition-colors">Precios</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Crear cuenta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><span className="hover:text-foreground transition-colors cursor-default">Sobre nosotros</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-default">Blog</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-default">Contacto</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><span className="hover:text-foreground transition-colors cursor-default">Términos y condiciones</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-default">Política de privacidad</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Flix Support. Proyecto de Gestión de Servicios en TI &mdash; UNAP 2026</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-foreground transition-colors cursor-default">Términos</span>
              <span className="hover:text-foreground transition-colors cursor-default">Privacidad</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
