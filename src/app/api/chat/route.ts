import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith("```")) {
    // Strip markdown code fences if present
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "El mensaje es obligatorio." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not defined in environment variables.");
      return NextResponse.json(
        { error: "La API Key de Gemini no está configurada en el servidor." },
        { status: 500 }
      );
    }

    // 1. Fetch all active program offerings from Supabase database
    const { data: offerings, error: dbError } = await supabase
      .from("program_campuses")
      .select(`
        id,
        tuition_cost,
        currency,
        duration_semesters,
        modality,
        programs (
          id,
          name,
          slug,
          level,
          category,
          description
        ),
        campuses (
          name,
          institutions (
            name
          )
        )
      `)
      .eq("status", "active");

    if (dbError) {
      console.error("Database query error:", dbError);
    }

    // Map offerings to a simplified structure for LLM context
    const programList = (offerings ?? [])
      .map((o: any) => {
        const prog = o.programs;
        if (!prog) return null;
        return {
          id: prog.slug || prog.id,
          name: prog.name,
          level: prog.level,
          category: prog.category,
          description: prog.description,
          tuition_cost: o.tuition_cost,
          currency: o.currency,
          duration_semesters: o.duration_semesters,
          modality: o.modality,
          campus: o.campuses?.name,
          institution: o.campuses?.institutions?.name,
        };
      })
      .filter(Boolean);

    // 2. Build system prompt instruction
    const systemPrompt = `Eres un Asesor Vocacional de RutaEdu experto y empático. Tu objetivo es orientar a los estudiantes a encontrar su carrera ideal de forma conversacional y armónica.
Debes entablar una conversación natural y amigable. No abrumes al estudiante con muchas preguntas a la vez; hazlo paso a paso de forma conversacional.

Tu meta es recopilar o inferir a lo largo de la charla los siguientes datos del estudiante:
1. Sus intereses, gustos o lo que le apasiona.
2. Su presupuesto máximo por semestre.
3. Su ubicación o preferencia de modalidad (presencial en ciudades de Colombia, virtual, etc.).

A continuación se presenta el listado de TODOS los programas académicos reales disponibles en nuestra base de datos.
IMPORTANTE: SÓLO puedes recomendar programas de este listado. NO inventes universidades ni programas que no estén aquí:
${JSON.stringify(programList, null, 2)}

Reglas de respuesta:
- Debes responder siempre en un formato JSON válido con las siguientes claves:
  - "text": Tu respuesta amigable en español. Mantén un tono motivador, empático y profesional. Si te falta información para dar una recomendación precisa (ej. no sabes sus gustos, ubicación o presupuesto), hazle preguntas naturales en este texto y mantén el arreglo de "recommendations" vacío.
  - "recommendations": Un arreglo con un máximo de 2 objetos de recomendación. Cada objeto debe tener obligatoriamente:
    - "id": El "id" exacto del programa (su slug o uuid de la lista anterior).
    - "name": El nombre del programa de la lista.
    - "institution": El nombre de la institución de la lista.
    - "reason": Una breve explicación de por qué este programa encaja con sus gustos, presupuesto o ubicación.
- Si decides recomendar algo, asegúrate de que encaje lo mejor posible con sus intereses expresados y que esté dentro de su presupuesto (si lo mencionó).
- No muestres código markdown en el JSON, solo devuelve el objeto JSON directamente.`;

    // 3. Format history for Gemini API (roles must alternate user/model)
    const contents = (history ?? []).map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // Append current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // 4. Call Gemini REST API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    let geminiResponse: Response | null = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        geminiResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        });

        if (geminiResponse.ok) {
          break;
        }

        const status = geminiResponse.status;
        if (status === 503 || status === 429 || status === 504) {
          console.warn(`Transient Gemini API error ${status} (attempt ${attempts}/${maxAttempts}). Retrying in 1.5s...`);
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } else {
          // Fail fast for 400, 403, 404, etc.
          break;
        }
      } catch (fetchErr: any) {
        console.error(`Fetch attempt ${attempts} failed:`, fetchErr);
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } else {
          throw fetchErr;
        }
      }
    }

    if (!geminiResponse || !geminiResponse.ok) {
      const errText = geminiResponse ? await geminiResponse.text() : "No response";
      console.error("Gemini API Error Response:", errText);
      return NextResponse.json(
        { error: "Error de comunicación con la API de IA." },
        { status: geminiResponse ? geminiResponse.status : 503 }
      );
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return NextResponse.json({ error: "La IA devolvió una respuesta vacía." }, { status: 500 });
    }

    // Parse the JSON output from Gemini
    try {
      const cleanedText = cleanJsonString(responseText);
      const parsedJson = JSON.parse(cleanedText);

      // Ensure that all recommendations have a valid href property mapped from the id
      if (parsedJson.recommendations && Array.isArray(parsedJson.recommendations)) {
        parsedJson.recommendations = parsedJson.recommendations.map((r: any) => ({
          ...r,
          href: r.href || `/programas/${r.id || ""}`
        }));
      }

      return NextResponse.json(parsedJson);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", responseText, parseError);
      // Fallback in case LLM output was malformed
      return NextResponse.json({
        text: "Entiendo tus intereses. Me gustaría poder mostrarte recomendaciones, pero tuve un inconveniente técnico al procesar el listado. ¿Podrías indicarme más detalles sobre qué área te gustaría explorar?",
        recommendations: [],
      });
    }
  } catch (error: any) {
    console.error("Server API Chat Error:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor." },
      { status: 500 }
    );
  }
}
