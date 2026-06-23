import { describe, it, expect } from "vitest";
import { analyzeSentiment, getPriorityOverride } from "@/lib/sentiment";

describe("Análisis de sentimiento", () => {
  it("retorna CALM para texto neutral", () => {
    const result = analyzeSentiment("Mi computadora no enciende, por favor revisen");
    expect(result.level).toBe("CALM");
    expect(result.score).toBeLessThan(15);
  });

  it("detecta FRUSTRATED por palabras urgentes", () => {
    const result = analyzeSentiment("Necesito ayuda rapido por favor");
    expect(result.level).toBe("FRUSTRATED");
    expect(result.score).toBeGreaterThanOrEqual(15);
  });

  it("detecta FRUSTRATED por palabra urgente", () => {
    const result = analyzeSentiment("ESTO ES URGENTE");
    expect(result.level).toBe("FRUSTRATED");
    expect(result.score).toBe(15);
  });

  it("detecta CRITICAL por combinacion urgente + frustrado", () => {
    const result = analyzeSentiment("Estoy harto, necesito ayuda ya");
    expect(result.level).toBe("CRITICAL");
    expect(result.score).toBeGreaterThanOrEqual(40);
  });

  it("detecta CRITICAL por palabras graves", () => {
    const result = analyzeSentiment("Pérdida total de datos críticos, emergencia");
    expect(result.level).toBe("CRITICAL");
  });

  it("detecta CRITICAL por caida del sistema", () => {
    const result = analyzeSentiment("El servidor esta caido y es una emergencia");
    expect(result.level).toBe("CRITICAL");
  });

  it("reporta coincidencias encontradas", () => {
    const result = analyzeSentiment("Estoy molesto urgente");
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches).toContain("urgente");
    expect(result.matches).toContain("molesto");
  });

  it("es case-insensitive", () => {
    const result = analyzeSentiment("URGENTE");
    expect(result.level).toBe("FRUSTRATED");
  });

  it("maneja texto vacio", () => {
    const result = analyzeSentiment("");
    expect(result.level).toBe("CALM");
    expect(result.score).toBe(0);
  });
});

describe("Ajuste de prioridad según sentimiento", () => {
  it("eleva a URGENT para nivel CRITICAL", () => {
    expect(getPriorityOverride("CRITICAL", "MEDIUM")).toBe("URGENT");
  });

  it("eleva a URGENT incluso si ya es URGENT", () => {
    expect(getPriorityOverride("CRITICAL", "URGENT")).toBe("URGENT");
  });

  it("eleva a HIGH para nivel FRUSTRATED desde MEDIUM", () => {
    expect(getPriorityOverride("FRUSTRATED", "MEDIUM")).toBe("HIGH");
  });

  it("eleva a MEDIUM para nivel FRUSTRATED desde LOW", () => {
    expect(getPriorityOverride("FRUSTRATED", "LOW")).toBe("MEDIUM");
  });

  it("no cambia si CALM", () => {
    expect(getPriorityOverride("CALM", "MEDIUM")).toBeNull();
  });

  it("no baja prioridad FRUSTRATED si ya URGENT", () => {
    expect(getPriorityOverride("FRUSTRATED", "URGENT")).toBeNull();
  });
});
