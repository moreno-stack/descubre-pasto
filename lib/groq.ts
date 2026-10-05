import Groq from "groq-sdk";

let client: Groq | null = null;

// Se crea al primer uso para que el build no exija GROQ_API_KEY al importar las rutas.
export function getGroq(): Groq {
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}
