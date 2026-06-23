import Link from "next/link";
import { Wrench, ClipboardList, BarChart3, Brain, Check, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Wrench className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold">ServiDesk</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Iniciar sesi&oacute;n
            </Link>
            <Link href="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <Wrench className="h-8 w-8" />
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight">
            Soporte TI <span className="text-blue-600">simplificado</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            Plataforma de gesti&oacute;n de soporte t&eacute;cnico para empresas medianas.
            Tickets, anal&iacute;ticas, base de conocimiento e inteligencia artificial.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register" className="rounded-lg bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              Empezar gratis
              <ArrowRight className="inline ml-2 h-4 w-4" />
            </Link>
            <Link href="/login" className="rounded-lg border border-border px-8 py-3 text-base font-medium text-foreground hover:bg-muted transition-colors">
              Ya tengo cuenta
            </Link>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Todo lo que necesitas</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="group rounded-xl bg-card p-6 shadow-sm border hover:shadow-md transition-all hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Gesti&oacute;n de Tickets</h3>
                <p className="text-muted-foreground text-sm">Creaci&oacute;n, asignaci&oacute;n, seguimiento por estados, comentarios y evaluaci&oacute;n post-resoluci&oacute;n.</p>
              </div>
              <div className="group rounded-xl bg-card p-6 shadow-sm border hover:shadow-md transition-all hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Analytics</h3>
                <p className="text-muted-foreground text-sm">Dashboard con m&eacute;tricas, gr&aacute;ficos por categor&iacute;a, rendimiento de t&eacute;cnicos y tendencias temporales.</p>
              </div>
              <div className="group rounded-xl bg-card p-6 shadow-sm border hover:shadow-md transition-all hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">IA Integrada</h3>
                <p className="text-muted-foreground text-sm">Clasificaci&oacute;n autom&aacute;tica de tickets y sugerencias de soluci&oacute;n basadas en la base de conocimiento.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Planes que se ajustan a tu empresa</h2>
            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
              {[
                { name: "Gratis", price: "0", popular: false, features: ["50 tickets/mes", "Dashboard b&aacute;sico", "Base de conocimiento"], href: "/register" },
                { name: "B&aacute;sico", price: "29", popular: true, features: ["Tickets ilimitados", "Analytics b&aacute;sico", "Notificaciones por correo", "Soporte por correo"], href: "/register" },
                { name: "Pro", price: "79", popular: false, features: ["Todo del plan B&aacute;sico", "IA clasificaci&oacute;n autom&aacute;tica", "Sugerencias de soluci&oacute;n", "Analytics avanzado", "Soporte prioritario"], href: "/register" },
              ].map((plan) => (
                <div key={plan.name} className={`rounded-xl border bg-card p-6 relative hover:shadow-lg transition-all hover:-translate-y-1 ${plan.popular ? "border-blue-600 shadow-md" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-medium text-white">Popular</div>
                  )}
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="my-4 text-3xl font-bold">S/.{plan.price}<span className="text-sm font-normal text-muted-foreground">/mes</span></div>
                  <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: f }} />
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`block w-full rounded-lg py-2 text-center text-sm font-medium transition-colors ${
                      plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {plan.popular ? "Suscribirse" : "Empezar"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          ServiDesk &mdash; Proyecto de Gesti&oacute;n de Servicios en TI &mdash; UNAP 2026
        </div>
      </footer>
    </div>
  );
}
