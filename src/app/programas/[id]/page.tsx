"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { GraduationCap, Landmark, Calendar, MapPin, DollarSign, Award, BookOpen, Send, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ProgramDetailPage({ params }: { params: { id: string } }) {
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  // Fetch or represent mock details matching schema
  const program = {
    id: params.id || "p1",
    name: "Ingeniería de Sistemas y Computación",
    institution: "Universidad de los Andes",
    campus: "Campus Principal Bogotá",
    address: "Cra. 1 #18a-12, Bogotá",
    level: "Pregrado",
    duration: "10 semestres",
    cost: "$22.000.000 COP / semestre",
    modality: "Presencial",
    accreditation: "Acreditación de Alta Calidad por 8 años",
    description: "El programa de Ingeniería de Sistemas y Computación de la Universidad de los Andes forma profesionales capaces de liderar la transformación digital a través del desarrollo de software de vanguardia, inteligencia artificial, ciberseguridad y arquitectura de datos compleja.",
    benefits: [
      "Intercambios internacionales con universidades de prestigio mundial.",
      "Laboratorios de computación de alto rendimiento.",
      "Acceso directo a convenios de prácticas empresariales en empresas de tecnología.",
    ],
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;
    
    // Simulate database Lead creation
    setLeadSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1 flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Details */}
        <div className="flex-1 space-y-6">
          
          {/* Header metadata card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-teal-50 text-primary uppercase">
              {program.level}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">{program.name}</h1>
            <p className="text-sm font-semibold text-text-secondary">
              {program.institution} • <span className="text-slate-400">{program.campus}</span>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-[10px] text-text-secondary block font-bold">Duración</span>
                  <span className="text-xs font-bold text-text-primary">{program.duration}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-[10px] text-text-secondary block font-bold">Modalidad</span>
                  <span className="text-xs font-bold text-text-primary">{program.modality}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-[10px] text-text-secondary block font-bold">Acreditación</span>
                  <span className="text-xs font-bold text-text-primary">Alta Calidad</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-[10px] text-text-secondary block font-bold">Ubicación</span>
                  <span className="text-xs font-bold text-text-primary">{program.campus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-text-primary">Descripción del programa</h3>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium">
              {program.description}
            </p>
          </div>

          {/* Benefits Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-text-primary">Beneficios clave</h3>
            <ul className="space-y-3">
              {program.benefits.map((b, i) => (
                <li key={i} className="flex gap-3 text-xs md:text-sm text-text-secondary font-medium leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Call to action Lead Form */}
        <div className="w-full md:w-80 flex-shrink-0">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl sticky top-24 space-y-6">
            
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-text-secondary block uppercase tracking-widest">Matrícula</span>
              <h3 className="text-xl font-extrabold text-text-primary">{program.cost}</h3>
              <span className="text-[10px] text-text-secondary font-medium block">Precios oficiales vigentes.</span>
            </div>

            {leadSubmitted ? (
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-primary mx-auto" />
                <h4 className="text-sm font-extrabold text-text-primary">¡Solicitud Enviada!</h4>
                <p className="text-[11px] text-text-secondary leading-relaxed">Un asesor de la institución se pondrá en contacto contigo en las próximas horas.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <h4 className="text-xs font-bold text-text-primary">Solicitar Información Directa</h4>
                
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre completo"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 h-11 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold outline-none focus:border-primary transition-all"
                    style={{ minHeight: "44px" }}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Tu correo electrónico"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3.5 h-11 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold outline-none focus:border-primary transition-all"
                    style={{ minHeight: "44px" }}
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    placeholder="Tu número celular"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3.5 h-11 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold outline-none focus:border-primary transition-all"
                    style={{ minHeight: "44px" }}
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Mensaje o dudas..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-3 h-20 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold outline-none focus:border-primary transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  style={{ minHeight: "48px" }}
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar datos de contacto</span>
                </button>
              </form>
            )}

            <div className="text-[10px] text-text-secondary text-center font-semibold border-t border-slate-100 pt-3">
              RutaEdu no cobra comisiones a los estudiantes por aplicar.
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
