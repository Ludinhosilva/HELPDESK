"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, X } from "lucide-react";

type RunbookLine = {
  time: number;
  prefix: string;
  text: string;
  color: string;
};

const terminalLines: RunbookLine[] = [
  { time: 0, prefix: "INIT", text: "Conectando con FlixSupport Engine...", color: "text-zinc-400" },
  { time: 500, prefix: "INFO", text: "Ticket ID: #TICKET_ID recibido", color: "text-zinc-400" },
  { time: 1000, prefix: "SCAN", text: "Analizando estado del sistema remoto...", color: "text-yellow-400" },
  { time: 1500, prefix: "DIAG", text: "Diagnóstico iniciado en el equipo afectado...", color: "text-yellow-400" },
  { time: 2000, prefix: "INFO", text: "Problema identificado. Aplicando solución...", color: "text-zinc-400" },
  { time: 2500, prefix: "EXEC", text: "Ejecutando script de remediación...", color: "text-blue-400" },
  { time: 3000, prefix: "EXEC", text: "Reiniciando servicios afectados...", color: "text-blue-400" },
  { time: 3500, prefix: "OK", text: "Servicios restablecidos correctamente", color: "text-green-400" },
  { time: 4000, prefix: "OK", text: "Estado del ticket actualizado a READY", color: "text-green-400" },
  { time: 4500, prefix: "DONE", text: "Remediación completada exitosamente", color: "text-green-400" },
];

interface RunbookButtonProps {
  ticketId: string;
  ticketNumber: number;
  currentStatus: string;
  onComplete: () => void;
}

export default function RunbookButton({
  ticketId,
  ticketNumber,
  currentStatus,
  onComplete,
}: RunbookButtonProps) {
  const [open, setOpen] = useState(false);
  const [visibleLines, setVisibleLines] = useState<RunbookLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const canRun = currentStatus !== "READY" && currentStatus !== "CLOSED" && currentStatus !== "RESOLVED";

  const runTerminal = useCallback(() => {
    setOpen(true);
    setVisibleLines([]);
    setIsRunning(true);
    setIsDone(false);

    // Timer para cada línea del terminal
    terminalLines.forEach((line) => {
      setTimeout(() => {
        setVisibleLines((prev) => [
          ...prev,
          {
            ...line,
            text: line.text.replace("TICKET_ID", ticketNumber.toString()),
          },
        ]);
      }, line.time);
    });

    // Lanzar el fetch real del runbook
    fetch(`/api/tickets/${ticketId}/runbook`, {
      method: "POST",
    }).catch(console.error);

    // Después de 5 segundos (tiempo total de animación), marcar como done
    setTimeout(() => {
      setIsRunning(false);
      setIsDone(true);
    }, 5000);
  }, [ticketId, ticketNumber]);

  const handleClose = () => {
    setOpen(false);
    if (isDone) {
      onComplete();
    }
  };

  if (!canRun) return null;

  return (
    <>
      <Button
        onClick={runTerminal}
        disabled={isRunning}
        className="w-full bg-green-600 hover:bg-green-500 text-white"
      >
        <Play className="h-4 w-4 mr-2" />
        Ejecutar Runbook
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 max-w-lg p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm font-mono text-zinc-300">
                FlixSupport Runbook Engine v2.1
              </DialogTitle>
              <button
                onClick={handleClose}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="p-4 font-mono text-xs leading-6 min-h-[300px] max-h-[400px] overflow-y-auto bg-black/50">
            {visibleLines.map((line, i) => (
              <div key={i} className={`flex gap-2 ${line.color}`}>
                <span className="text-zinc-600 w-12 text-right shrink-0">
                  {`[${String(Math.floor(line.time / 1000)).padStart(2, "0")}:${String(
                    (line.time % 1000) / 100
                  ).padStart(2, "0")}]`}
                </span>
                <span className="font-bold w-12 shrink-0">[{line.prefix}]</span>
                <span>{line.text}</span>
              </div>
            ))}

            {/* Cursor parpadeante mientras ejecuta */}
            {isRunning && (
              <div className="flex items-center gap-2 text-zinc-500">
                <span className="w-12" />
                <span className="w-12" />
                <span className="inline-block w-2 h-4 bg-green-400 animate-pulse" />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              {isRunning
                ? "Ejecutando..."
                : isDone
                ? "Completado"
                : "Listo"}
            </span>
            {isDone && (
              <Button
                onClick={handleClose}
                size="sm"
                className="bg-green-600 hover:bg-green-500 text-white"
              >
                Cerrar y ver resultado
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
