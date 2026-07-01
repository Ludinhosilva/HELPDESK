"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Smartphone } from "lucide-react";
import Image from "next/image";

interface YapePlinPaymentProps {
  amount: number;
  currency?: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function YapePlinPayment({ amount, currency = "PEN", onComplete, onCancel }: YapePlinPaymentProps) {
  const [method, setMethod] = useState<"yape" | "plin">("yape");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const phoneNumber = "999 888 777";
  const companyName = "FLIXSUPPORT";

  async function handleConfirm() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setConfirmed(true);
    setTimeout(() => onComplete(), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Selector YAPE / PLIN */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setMethod("yape")}
          type="button"
          className={`flex items-center justify-center gap-2 rounded-xl border-2 p-2.5 transition-all ${
            method === "yape"
              ? "border-purple-500 bg-purple-500/5"
              : "border-border hover:border-purple-500/30"
          }`}
        >
          <Image src="/yape-logo.png" alt="YAPE" width={52} height={22} className="object-contain" />
        </button>
        <button
          onClick={() => setMethod("plin")}
          type="button"
          className={`flex items-center justify-center gap-2 rounded-xl border-2 p-2.5 transition-all ${
            method === "plin"
              ? "border-blue-500 bg-blue-500/5"
              : "border-border hover:border-blue-500/30"
          }`}
        >
          <Image src="/plin-logo.png" alt="PLIN" width={52} height={22} className="object-contain" />
        </button>
      </div>

      {/* YAPE content */}
      {method === "yape" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center">
            <div className="w-36 h-36 rounded-2xl border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/20 flex items-center justify-center">
              <Image src="/yape-qr.jpeg" alt="QR YAPE" width={130} height={130} className="object-contain rounded-xl" />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1.5 font-medium">Escanea con YAPE</span>
          </div>
          <div className="space-y-3 text-center sm:text-left">
            <Image src="/yape-logo.png" alt="YAPE" width={72} height={28} className="mx-auto sm:mx-0 object-contain" />
            <div className="space-y-0.5">
              <p className="text-lg font-bold text-foreground">
                S/{(amount / 100).toFixed(2)} {currency}
              </p>
              <p className="text-xs text-muted-foreground">{companyName}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-left space-y-1">
              <p className="text-xs font-medium text-foreground/80">Instrucciones</p>
              <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal list-inside leading-relaxed">
                <li>Abre el app YAPE en tu celular</li>
                <li>Toca &quot;Escanear QR&quot;</li>
                <li>Escanea el código QR mostrado</li>
                <li>Confirma el monto de S/{(amount / 100).toFixed(2)}</li>
                <li>Toca &quot;Ya pagué, continuar&quot; abajo</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* PLIN content */}
      {method === "plin" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center">
            <div className="w-36 h-36 rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-blue-950/20 flex items-center justify-center">
              <Image src="/plin-qr.jpeg" alt="QR PLIN" width={130} height={130} className="object-contain rounded-xl" />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1.5 font-medium">Paga con PLIN</span>
          </div>
          <div className="space-y-3 text-center sm:text-left">
            <Image src="/plin-logo.png" alt="PLIN" width={72} height={28} className="mx-auto sm:mx-0 object-contain" />
            <div className="space-y-0.5">
              <p className="text-lg font-bold text-foreground">
                S/{(amount / 100).toFixed(2)} {currency}
              </p>
              <p className="text-xs text-muted-foreground">{companyName}</p>
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1.5">
                <Smartphone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-mono font-bold text-blue-700 dark:text-blue-400 tracking-wide">{phoneNumber}</span>
              </div>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-left space-y-1">
              <p className="text-xs font-medium text-foreground/80">Instrucciones</p>
              <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal list-inside leading-relaxed">
                <li>Abre el app de tu banco</li>
                <li>Selecciona &quot;Pago con PLIN&quot;</li>
                <li>Ingresa el número {phoneNumber}</li>
                <li>Envía S/{(amount / 100).toFixed(2)}</li>
                <li>Toca &quot;Ya pagué, continuar&quot;</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación */}
      {confirmed ? (
        <div className="text-center py-3 space-y-2 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="h-7 w-7 text-green-500" />
          </div>
          <div>
            <p className="text-base font-bold text-green-600 dark:text-green-400">Pago confirmado</p>
            <p className="text-xs text-muted-foreground">
              Gracias por tu pago con {method === "yape" ? "YAPE" : "PLIN"}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1 h-9 text-sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            className="flex-1 h-9 text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-md"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
            Ya pagué, continuar
          </Button>
        </div>
      )}
    </div>
  );
}
