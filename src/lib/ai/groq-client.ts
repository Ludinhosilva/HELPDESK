// Cliente para Groq API (compatible con OpenAI SDK format).
// Usa fetch nativo para evitar dependencias externas.
// Modelo: llama3-8b-8192 (gratuito, rápido, buen español).

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";
const TIMEOUT_MS = 10000;

function getApiKey(): string | null {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  // Limpiar whitespace, newlines, y caracteres invisibles
  const clean = key.trim().replace(/\s+/g, "");
  return clean.startsWith("gsk_") ? clean : null;
}

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface GroqResult {
  text: string;
  model: string;
}

export async function groqChat(
  messages: GroqMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<GroqResult | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("[Groq] No API key configured");
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens ?? 600,
      }),
      signal: controller.signal,
    });

    if (res.status === 429) {
      console.warn("[Groq] Rate limited (429)");
      return null;
    }

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "unknown");
      console.warn(`[Groq] API error ${res.status}: ${errorBody.slice(0, 200)}`);
      return null;
    }

    const data: GroqResponse = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.warn("[Groq] Empty response content");
      return null;
    }

    return { text: content, model: GROQ_MODEL };
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      console.warn("[Groq] Timeout");
    } else {
      console.warn("[Groq] Network error:", (err as Error).message);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export function isGroqAvailable(): boolean {
  return !!getApiKey();
}
