"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Brain, ArrowLeft, ArrowRight, Award, GraduationCap, Building2, Check, Star, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Question {
  id: number;
  text: string;
  dimension: "R" | "I" | "A" | "S" | "E" | "C";
}

export default function VocationalTestPage() {
  const [step, setStep] = useState<"intro" | "questions" | "results">("intro");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  const questions: Question[] = [
    { id: 1, text: "Me gusta reparar aparatos eléctricos o mecánicos y trabajar con herramientas.", dimension: "R" },
    { id: 2, text: "Disfruto resolviendo acertijos matemáticos complejos o investigando problemas científicos.", dimension: "I" },
    { id: 3, text: "Me agrada escribir historias, dibujar, pintar o tocar algún instrumento musical.", dimension: "A" },
    { id: 4, text: "Me gusta enseñar, aconsejar o ayudar a otras personas con sus problemas.", dimension: "S" },
    { id: 5, text: "Prefiero liderar proyectos grupales, convencer a otros o vender ideas.", dimension: "E" },
    { id: 6, text: "Disfruto organizar archivos, bases de datos o llevar las finanzas ordenadamente.", dimension: "C" },
  ];

  const answerOptions = [
    { label: "Totalmente de acuerdo", value: 3 },
    { label: "De acuerdo", value: 2 },
    { label: "En desacuerdo", value: 0 },
  ];

  const handleStart = () => {
    setAnswers({});
    setCurrentQuestionIdx(0);
    setStep("questions");
  };

  const handleAnswer = (value: number) => {
    const currentQuestion = questions[currentQuestionIdx];
    setAnswers(prev => ({ ...prev, [currentQuestion.dimension]: value }));

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setStep("results");
    }
  };

  const handleBack = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    } else {
      setStep("intro");
    }
  };

  // Process Results
  const getTopHollandCodes = () => {
    // Sort dimensions by score
    const scores = Object.entries(answers).map(([code, value]) => ({
      code,
      value,
      name: {
        R: "Realista (Práctico, técnico)",
        I: "Investigador (Analítico, científico)",
        A: "Artístico (Creativo, original)",
        S: "Social (Colaborativo, empático)",
        E: "Emprendedor (Persuasivo, líder)",
        C: "Convencional (Organizado, metódico)",
      }[code as "R" | "I" | "A" | "S" | "E" | "C"],
      careers: {
        R: ["Ingeniería Civil", "Arquitectura", "Robótica", "Agronomía"],
        I: ["Ingeniería de Software", "Medicina", "Física", "Ciencia de Datos"],
        A: ["Diseño Gráfico", "Cine", "Marketing Creativo", "Música"],
        S: ["Psicología", "Trabajo Social", "Educación", "Enfermería"],
        E: ["Administración de Empresas", "Derecho", "Relaciones Públicas", "Negocios Internacional"],
        C: ["Contaduría", "Administración de Finanzas", "Logística", "Desarrollo de Software"],
      }[code as "R" | "I" | "A" | "S" | "E" | "C"],
    }));

    return scores.sort((a, b) => b.value - a.value);
  };

  const results = getTopHollandCodes();
  const topDimension = results[0];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {/* INTRO STEP */}
          {step === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-100/50 space-y-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 text-primary flex items-center justify-center mx-auto shadow-sm">
                <Brain className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">
                  Descubre tu perfil profesional
                </h1>
                <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-md mx-auto">
                  Este test vocacional interactivo evalúa tus intereses en base al prestigioso modelo Holland (RIASEC) para conectarte con carreras, universidades y becas adaptadas a ti.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <button
                  onClick={handleStart}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 h-13 rounded-xl text-base font-bold text-white bg-primary hover:bg-primary-hover shadow-md transition-all active:scale-95"
                  style={{ minHeight: "48px" }}
                >
                  <span>Iniciar test</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* QUESTIONS STEP */}
          {step === "questions" && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-6"
            >
              {/* Back & Progress */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>
                <span className="text-xs font-bold text-primary">
                  Pregunta {currentQuestionIdx + 1} de {questions.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <div className="py-4 text-center">
                <h2 className="text-lg md:text-xl font-extrabold text-text-primary leading-relaxed">
                  {questions[currentQuestionIdx].text}
                </h2>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-3">
                {answerOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handleAnswer(option.value)}
                    className="w-full flex items-center justify-between px-5 h-14 rounded-xl border border-slate-200 hover:border-primary hover:bg-teal-50/20 text-sm font-semibold text-text-primary text-left transition-all active:scale-[0.99]"
                    style={{ minHeight: "48px" }}
                  >
                    <span>{option.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* RESULTS STEP */}
          {step === "results" && topDimension && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Success Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-primary flex items-center justify-center shadow-sm">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-primary tracking-widest uppercase">Tu Perfil Vocacional</span>
                    <h2 className="text-xl font-extrabold text-text-primary">{topDimension.name}</h2>
                  </div>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed">
                  Basado en tus respuestas, muestras un gran interés y potencial en áreas que requieren habilidades analíticas, científicas o creativas según tu puntaje máximo.
                </p>

                {/* Score Chart list */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-text-primary">Tus dimensiones vocacionales:</h3>
                  <div className="space-y-2">
                    {results.slice(0, 3).map((res) => (
                      <div key={res.code} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-text-primary">
                          <span>{res.name}</span>
                          <span>{((res.value / 3) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${(res.value / 3) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-6">
                <h3 className="text-lg font-extrabold text-text-primary">Carreras recomendadas para ti</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {topDimension.careers.map((careerName) => (
                    <div key={careerName} className="p-4 border border-slate-150 rounded-2xl flex items-start gap-3 hover:border-primary transition-all">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-primary flex-shrink-0">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">{careerName}</h4>
                        <Link
                          href={`/explorar?q=${encodeURIComponent(careerName)}`}
                          className="inline-flex items-center gap-0.5 text-xs text-primary font-bold mt-1 hover:underline"
                        >
                          <span>Ver universidades</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/explorar"
                  className="flex-1 inline-flex items-center justify-center gap-2 h-13 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-md shadow-primary/10 transition-all active:scale-95"
                  style={{ minHeight: "48px" }}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Explorar Universidades</span>
                </Link>
                <button
                  onClick={handleStart}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-13 rounded-xl text-sm font-bold text-text-primary bg-white hover:bg-slate-50 border border-slate-200 transition-all"
                  style={{ minHeight: "48px" }}
                >
                  <span>Repetir test</span>
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
