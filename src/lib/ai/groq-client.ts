// Cliente para Groq API (compatible con OpenAI SDK format).
// Usa fetch nativo para evitar dependencias externas.
// Modelo: llama3-8b-8192 (gratuito, rápido, buen español).

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama3-8b-8192";
const TIMEOUT_MS = 8000;

function getApiKey(): string | null {
  return process.env.GROQ_API_KEY || null;
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
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens ?? 600,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    if (res.status === 429) {
      console.warn("[Groq] Rate limited");
      return null;
    }

    if (!res.ok) {
      console.warn(`[Groq] API error ${res.status}`);
      return null;
    }

    const data: GroqResponse = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

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
