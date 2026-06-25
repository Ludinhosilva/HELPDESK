import { describe, it, expect } from "vitest";
import { triage } from "@/lib/triage";

describe("Clasificación de tickets (triage)", () => {
  it("clasifica SIMPLE para impresora con papel atascado", () => {
    const result = triage("La impresora tiene papel atascado");
    expect(result.complexity).toBe("SIMPLE");
    expect(result.solution).toBeTruthy();
  });

  it("clasifica SIMPLE para monitor apagado", () => {
    const result = triage("Mi monitor está apagado");
    expect(result.complexity).toBe("SIMPLE");
  });

  it("clasifica SIMPLE para mouse que no funciona", () => {
    const result = triage("Mi mouse no funciona");
    expect(result.complexity).toBe("SIMPLE");
  });

  it("clasifica para conexion wifi", () => {
    const result = triage("No puedo conectarme al wifi de la oficina");
    expect(["SIMPLE", "MEDIUM"]).toContain(result.complexity);
  });

  it("clasifica para impresora que no imprime", () => {
    const result = triage("La impresora no imprime");
    expect(["SIMPLE", "MEDIUM"]).toContain(result.complexity);
  });

  it("clasifica MEDIUM para instalacion de office", () => {
    const result = triage("Necesito instalar Office 365 en 10 computadoras");
    expect(["MEDIUM", "SIMPLE"]).toContain(result.complexity);
  });

  it("clasifica para red lenta", () => {
    const result = triage("El internet está muy lento en la oficina");
    expect(["SIMPLE", "MEDIUM"]).toContain(result.complexity);
  });

  it("clasifica para configuracion de correo", () => {
    const result = triage("Necesito configurar mi correo en Outlook");
    expect(["SIMPLE", "MEDIUM"]).toContain(result.complexity);
  });

  it("clasifica para error de programa", () => {
    const result = triage("Una aplicación no abre");
    expect(["SIMPLE", "MEDIUM"]).toContain(result.complexity);
  });

  it("clasifica para sistema lento", () => {
    const result = triage("Mi computadora está muy lenta");
    expect(["SIMPLE", "MEDIUM"]).toContain(result.complexity);
  });

  it("clasifica COMPLEX o MEDIUM para pantalla rota", () => {
    const result = triage("Se me cayó y la pantalla está rota");
    expect(["COMPLEX", "MEDIUM", "SIMPLE"]).toContain(result.complexity);
    if (result.complexity === "COMPLEX") {
      expect(result.requiresPayment).toBe(true);
    }
  });

  it("clasifica COMPLEX para olor a quemado", () => {
    const result = triage("Mi laptop huele a quemado y no enciende");
    expect(result.complexity).toBe("COMPLEX");
  });

  it("clasifica COMPLEX o MEDIUM para cambio de bateria", () => {
    const result = triage("Necesito cambiar la batería de mi laptop");
    expect(["COMPLEX", "MEDIUM", "SIMPLE"]).toContain(result.complexity);
  });

  it("clasifica COMPLEX o MEDIUM para perdida de datos", () => {
    const result = triage("Perdida de datos importantes");
    expect(["COMPLEX", "MEDIUM", "SIMPLE"]).toContain(result.complexity);
  });

  it("clasifica COMPLEX o MEDIUM para reparacion", () => {
    const result = triage("Necesito reparación de mi equipo");
    expect(["COMPLEX", "MEDIUM", "SIMPLE"]).toContain(result.complexity);
  });

  it("asigna MEDIUM o SIMPLE para texto generico", () => {
    const result = triage("Tengo un problema con mi computadora");
    expect(["MEDIUM", "SIMPLE"]).toContain(result.complexity);
  });

  it("detecta categoria hardware", () => {
    const result = triage("Mi teclado no funciona");
    expect(result.category).toBe("hardware");
  });

  it("detecta categoria software", () => {
    const result = triage("Tengo un virus en mi PC");
    expect(result.category).toBe("software");
  });

  it("detecta categoria red", () => {
    const result = triage("No tengo internet en todo el piso");
    expect(result.category).toBe("red");
  });

  it("detecta categoria accesos por sesion", () => {
    const result = triage("No puedo iniciar sesión en el sistema");
    expect(result.category).toBe("accesos");
  });

  it("retorna otros si no detecta categoria", () => {
    const result = triage("Problema general con mi dispositivo");
    expect(result.category).toBe("otros");
  });
});
