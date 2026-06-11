"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Send, Sparkles, User, BrainCircuit, ArrowRight, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
  recommendations?: Array<{
    name: string;
    institution: string;
    reason: string;
    href: string;
  }>;
}

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "¡Hola! Soy tu Asesor Vocacional con IA. Cuéntame qué te gusta hacer, qué materias prefieres evitar, o tus metas laborales y te sugeriré caminos educativos ideales.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const suggestionChips = [
    "Me gusta la tecnología pero no las matemáticas avanzadas",
    "Quiero una carrera corta con alta salida laboral",
    "Busco becas completas de ingeniería de sistemas",
    "Carreras creativas con buen salario",
  ];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Fetch active programs from Supabase
      const { data: offerings } = await supabase
        .from("program_campuses")
        .select(`
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

      const normalized = text.toLowerCase();
      const scoredPrograms = (offerings ?? []).map((o: any) => {
        const prog = o.programs;
        if (!prog) return null;

        let score = 0;
        const name = (prog.name || "").toLowerCase();
        const cat = (prog.category || "").toLowerCase();
        const desc = (prog.description || "").toLowerCase();
        const level = (prog.level || "").toLowerCase();

        // Check for general search term overlaps
        const terms = normalized.split(/\s+/).filter(t => t.length > 2);
        for (const term of terms) {
          if (name.includes(term)) score += 5;
          if (cat.includes(term)) score += 3;
          if (desc.includes(term)) score += 2;
          if (level.includes(term)) score += 1;
        }

        // Custom keyword mapping helpers
        if (normalized.includes("tecnología") || normalized.includes("programar") || normalized.includes("desarrollo") || normalized.includes("matemáticas")) {
          if (cat.includes("tecnología") || cat.includes("ingeniería") || name.includes("sistemas") || name.includes("desarrollo")) {
            score += 4;
          }
        }
        if (normalized.includes("corta") || normalized.includes("bootcamp") || normalized.includes("rápida") || normalized.includes("laboral")) {
          if (level === "bootcamp" || level === "curso" || name.includes("desarrollo")) {
            score += 4;
          }
        }
        if (normalized.includes("salud") || normalized.includes("medicina") || normalized.includes("médic")) {
          if (cat.includes("salud") || name.includes("medicina")) {
            score += 4;
          }
        }

        return {
          program: prog,
          institution: o.campuses?.institutions?.name ?? "Institución",
          score
        };
      }).filter(Boolean) as Array<{ program: any, institution: string, score: number }>;

      // Sort scored matching programs descending
      const matched = scoredPrograms
        .filter(sp => sp.score > 0)
        .sort((a, b) => b.score - a.score);

      let recs: Message["recommendations"] = [];
      let aiText = "";

      if (matched.length > 0) {
        const topMatched = matched.slice(0, 2);
        const primaryCat = topMatched[0].program.category?.toLowerCase() || "";
        
        if (primaryCat.includes("tecnología") || primaryCat.includes("ingeniería")) {
          aiText = "¡Excelente interés! Si te apasiona la tecnología y resolver problemas complejos mediante el desarrollo de software o infraestructura digital, te recomiendo considerar las siguientes opciones reales de nuestra base de datos:";
        } else if (primaryCat.includes("salud") || primaryCat.includes("medicina")) {
          aiText = "Si tienes vocación para las ciencias de la salud, el cuidado humano y la investigación médica, estas son opciones destacadas en nuestra base de datos:";
        } else {
          aiText = "Basado en tu mensaje, he analizado las opciones en nuestra base de datos y estas son las mejores recomendaciones de programas académicos para ti:";
        }

        recs = topMatched.map(item => ({
          name: item.program.name,
          institution: item.institution,
          reason: item.program.description || `Programa de nivel ${item.program.level} en el área de ${item.program.category}.`,
          href: `/programas/${item.program.slug || item.program.id}`
        }));
      } else {
        // Fallback default programs
        const defaultItems = (offerings ?? []).slice(0, 2);
        aiText = "¡Hola! He analizado tus intereses. Aunque no encontré coincidencias exactas para esos términos específicos, te recomiendo explorar estas opciones destacadas disponibles en nuestra base de datos:";

        recs = defaultItems.map((o: any) => ({
          name: o.programs?.name ?? "Programa Académico",
          institution: o.campuses?.institutions?.name ?? "Institución",
          reason: o.programs?.description ?? "Explora este programa y sus oportunidades de desarrollo profesional.",
          href: `/programas/${o.programs?.slug || o.programs?.id}`
        }));
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: aiText,
          recommendations: recs,
        },
      ]);
    } catch (err) {
      console.error("AI Advisor Query Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "Lo siento, tuve un inconveniente al consultar los programas académicos en tiempo real. Puedes explorar directamente todas nuestras carreras y becas usando la sección de búsqueda.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-3xl w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-between">
        
        {/* Chat window panel */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-xl shadow-slate-100/50 flex flex-col h-[520px] justify-between">
          
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-primary">
              <BrainCircuit className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-text-primary">Orientador Vocacional IA</h1>
              <span className="text-[10px] text-teal-600 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" /> En línea
              </span>
            </div>
          </div>

          {/* Messages display */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1 scrollbar-thin scrollbar-thumb-slate-200">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  msg.sender === "user" 
                    ? "bg-slate-100 text-slate-600" 
                    : "bg-teal-50 text-primary border border-teal-100"
                }`}>
                  {msg.sender === "user" ? <User className="w-4.5 h-4.5" /> : <Sparkles className="w-4.5 h-4.5" />}
                </div>

                <div className="space-y-3">
                  {/* Bubble body */}
                  <div className={`p-4 rounded-2xl text-xs md:text-sm font-semibold leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-white"
                      : "bg-slate-50 text-text-primary"
                  }`}>
                    {msg.text}
                  </div>

                  {/* Recommendations layout if present */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 mt-1">
                      {msg.recommendations.map((rec, i) => (
                        <div key={i} className="bg-teal-50/50 border border-teal-100 rounded-xl p-3 space-y-2">
                          <div>
                            <h4 className="text-xs font-extrabold text-text-primary">{rec.name}</h4>
                            <span className="text-[10px] text-text-secondary font-medium">{rec.institution}</span>
                          </div>
                          <p className="text-[11px] text-text-secondary font-medium italic">
                            "{rec.reason}"
                          </p>
                          <Link
                            href={rec.href}
                            className="inline-flex items-center gap-1 text-[10px] text-primary font-bold hover:underline"
                          >
                            <span>Ver programa</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-primary border border-teal-100 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 animate-spin" />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-xs text-text-secondary font-bold">
                  Analizando opciones académicas...
                </div>
              </div>
            )}
          </div>

          {/* Footer Input */}
          <div className="pt-3 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Escribe tus gustos, ej. Me gusta el arte y la comunicación..."
              className="flex-1 px-4 h-12 rounded-xl border border-slate-200 bg-slate-50 text-xs md:text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
              style={{ minHeight: "44px" }}
            />
            <button
              onClick={() => handleSend(input)}
              className="w-12 h-12 bg-primary hover:bg-primary-hover flex items-center justify-center text-white rounded-xl shadow-md transition-all active:scale-95 flex-shrink-0"
              style={{ minHeight: "44px", minWidth: "44px" }}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="mt-4 space-y-2">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block text-center">
            Prueba preguntando algo como
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestionChips.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSend(chip)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 hover:border-primary hover:text-primary transition-colors text-[10px] md:text-xs font-semibold text-text-secondary bg-white shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>"{chip}"</span>
              </button>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
