"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, Phone, Check, Loader2 } from "lucide-react";

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
    <div className="space-y-6">
      {/* Selector YAPE / PLIN */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMethod("yape")}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
            method === "yape"
              ? "border-purple-500 bg-purple-500/10"
              : "border-border hover:border-purple-500/30"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white text-sm font-bold">
            Y
          </div>
          <span className="text-sm font-medium">YAPE</span>
        </button>
        <button
          onClick={() => setMethod("plin")}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
            method === "plin"
              ? "border-blue-500 bg-blue-500/10"
              : "border-border hover:border-blue-500/30"
          }`}
        >
          <Phone className="h-10 w-10 p-2 rounded-full bg-blue-600 text-white" />
          <span className="text-sm font-medium">PLIN</span>
        </button>
      </div>

      {/* Contenido según método */}
      {method === "yape" ? (
        <div className="text-center space-y-4">
          <div className="mx-auto w-48 h-48 bg-purple-50 dark:bg-purple-950/30 rounded-2xl flex flex-col items-center justify-center border-2 border-purple-200 dark:border-purple-800">
            <QrCode className="h-32 w-32 text-purple-600 dark:text-purple-400" />
            <span className="text-xs text-muted-foreground mt-1">Código QR YAPE</span>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-bold">
              S/{(amount / 100).toFixed(2)} {currency}
            </p>
            <p className="text-sm text-muted-foreground">Empresa: {companyName}</p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-left space-y-1.5">
            <p className="text-sm font-medium">Instrucciones:</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Abre el app YAPE en tu celular</li>
              <li>Toca &quot;Escanear QR&quot;</li>
              <li>Escanea el código QR de arriba</li>
              <li>Confirma el monto de S/{(amount / 100).toFixed(2)}</li>
              <li>Toca &quot;Ya pagué, continuar&quot;</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="mx-auto w-48 h-48 bg-blue-50 dark:bg-blue-950/30 rounded-2xl flex flex-col items-center justify-center border-2 border-blue-200 dark:border-blue-800">
            <Phone className="h-20 w-20 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">{phoneNumber}</span>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-bold">
              S/{(amount / 100).toFixed(2)} {currency}
            </p>
            <p className="text-sm text-muted-foreground">Titular: {companyName}</p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-left space-y-1.5">
            <p className="text-sm font-medium">Instrucciones:</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Abre el app de tu banco (BCP, BBVA, Interbank, etc.)</li>
              <li>Selecciona &quot;Pago con PLIN&quot;</li>
              <li>Ingresa el número {phoneNumber}</li>
              <li>Envía S/{(amount / 100).toFixed(2)}</li>
              <li>Toca &quot;Ya pagué, continuar&quot;</li>
            </ol>
          </div>
        </div>
      )}

      {/* Confirmación */}
      {confirmed ? (
        <div className="text-center py-4 space-y-3 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">¡Pago confirmado!</p>
            <p className="text-sm text-muted-foreground">
              Gracias por tu pago con {method.toUpperCase()}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Ya pagué, continuar
          </Button>
        </div>
      )}
    </div>
  );
}
