"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Search, GraduationCap, School, BookOpen, Award, Check, X, Scale, Heart, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Program {
  id: string;
  name: string;
  slug: string;
  level: string;
  institutionName: string;
  campusName: string;
  tuitionCost: number;
  durationSemesters: number;
  modality: string;
  degreeLevel: string;
  scholarshipsAvailable: boolean;
  estimatedSalaryRange: string;
  accreditationStatus: string;
}

function ExplorerContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialType = searchParams.get("tipo") || "";

  const [query, setQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState<string>(initialType);
  const [comparedPrograms, setComparedPrograms] = useState<Program[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Mock programs list for seed representation matching schema
  const allPrograms: Program[] = [
    {
      id: "p1",
      name: "Ingeniería de Sistemas y Computación",
      slug: "ingenieria-de-sistemas",
      level: "pregrado",
      institutionName: "Universidad de los Andes",
      campusName: "Campus Principal Bogotá",
      tuitionCost: 22000000,
      durationSemesters: 10,
      modality: "Presencial",
      degreeLevel: "Pregrado",
      scholarshipsAvailable: true,
      estimatedSalaryRange: "$4.5M - $8M COP/mes",
      accreditationStatus: "Alta Calidad",
    },
    {
      id: "p2",
      name: "Medicina",
      slug: "medicina",
      level: "pregrado",
      institutionName: "Universidad de Antioquia",
      campusName: "Ciudad Universitaria Medellín",
      tuitionCost: 4500000,
      durationSemesters: 12,
      modality: "Presencial",
      degreeLevel: "Pregrado",
      scholarshipsAvailable: false,
      estimatedSalaryRange: "$5M - $9M COP/mes",
      accreditationStatus: "Alta Calidad",
    },
    {
      id: "p3",
      name: "Desarrollo Full Stack Web",
      slug: "desarrollo-full-stack",
      level: "bootcamp",
      institutionName: "RutaEdu Academy",
      campusName: "Campus Digital",
      tuitionCost: 4900000,
      durationSemesters: 1,
      modality: "Virtual",
      degreeLevel: "Bootcamp",
      scholarshipsAvailable: true,
      estimatedSalaryRange: "$3.5M - $6M COP/mes",
      accreditationStatus: "Certificado RutaEdu",
    },
    {
      id: "p4",
      name: "Administración de Empresas",
      slug: "administracion-empresas",
      level: "pregrado",
      institutionName: "Universidad de los Andes",
      campusName: "Campus Principal Bogotá",
      tuitionCost: 21500000,
      durationSemesters: 10,
      modality: "Presencial",
      degreeLevel: "Pregrado",
      scholarshipsAvailable: true,
      estimatedSalaryRange: "$3.8M - $7M COP/mes",
      accreditationStatus: "Alta Calidad",
    },
  ];

  const filteredPrograms = allPrograms.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.institutionName.toLowerCase().includes(query.toLowerCase());
    
    if (activeType === "carreras") return matchesQuery && p.level === "pregrado";
    if (activeType === "cursos") return matchesQuery && p.level === "bootcamp";
    if (activeType === "universidades") return matchesQuery && p.institutionName.includes("Universidad");
    if (activeType === "becas") return matchesQuery && p.scholarshipsAvailable;
    
    return matchesQuery;
  });

  const handleToggleCompare = (program: Program) => {
    if (comparedPrograms.find((cp) => cp.id === program.id)) {
      setComparedPrograms(comparedPrograms.filter((cp) => cp.id !== program.id));
    } else {
      if (comparedPrograms.length >= 3) {
        alert("Puedes comparar hasta 3 programas simultáneamente.");
        return;
      }
      setComparedPrograms([...comparedPrograms, program]);
    }
  };

  const handleToggleFavorite = (programId: string) => {
    if (favorites.includes(programId)) {
      setFavorites(favorites.filter((f) => f !== programId));
    } else {
      setFavorites([...favorites, programId]);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col md:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Categorías</h3>
            <div className="flex flex-col gap-1.5">
              {[
                { id: "", label: "Todos", icon: Search },
                { id: "carreras", label: "Carreras / Pregrados", icon: GraduationCap },
                { id: "universidades", label: "Universidades", icon: School },
                { id: "cursos", label: "Cursos / Bootcamps", icon: BookOpen },
                { id: "becas", label: "Oportunidades con Beca", icon: Award },
              ].map((filter) => {
                const Icon = filter.icon;
                const isActive = activeType === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveType(filter.id)}
                    className={`flex items-center gap-3 px-3 h-11 rounded-xl text-xs font-bold border text-left transition-all ${
                      isActive
                        ? "bg-primary border-primary text-white"
                        : "bg-slate-50 border-slate-100 text-text-secondary hover:bg-slate-100"
                    }`}
                    style={{ minHeight: "44px" }}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sticky Comparison float bar */}
          {comparedPrograms.length > 0 && (
            <div className="bg-teal-900 text-white rounded-3xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-bold">Comparar ({comparedPrograms.length})</span>
                </div>
                <button
                  onClick={() => setComparedPrograms([])}
                  className="text-xs text-teal-300 hover:text-white underline"
                >
                  Limpiar
                </button>
              </div>
              <div className="space-y-2">
                {comparedPrograms.map((cp) => (
                  <div key={cp.id} className="flex justify-between items-center text-xs bg-teal-950/40 p-2.5 rounded-lg">
                    <span className="truncate max-w-[150px]">{cp.name}</span>
                    <button
                      onClick={() => handleToggleCompare(cp)}
                      className="text-white hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowComparisonModal(true)}
                className="w-full h-11 rounded-xl bg-secondary hover:bg-teal-400 text-teal-950 font-bold text-xs flex items-center justify-center transition-all"
                style={{ minHeight: "44px" }}
              >
                Comparar lado a lado
              </button>
            </div>
          )}
        </div>

        {/* Directory Content Area */}
        <div className="flex-1 space-y-6">
          {/* Main Search Input */}
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por programa o institución..."
              className="w-full pl-12 pr-4 h-13 rounded-2xl border border-slate-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 text-text-primary text-sm font-medium outline-none transition-all shadow-sm"
              style={{ minHeight: "48px" }}
            />
          </div>

          {/* Dynamic Cards list */}
          <div className="grid grid-cols-1 gap-4">
            {filteredPrograms.length > 0 ? (
              filteredPrograms.map((program) => {
                const isCompared = comparedPrograms.some((cp) => cp.id === program.id);
                const isFav = favorites.includes(program.id);
                return (
                  <div
                    key={program.id}
                    className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                          {program.degreeLevel}
                        </span>
                        {program.scholarshipsAvailable && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">
                            Beca Disponible
                          </span>
                        )}
                      </div>
                      <h3 className="text-base md:text-lg font-extrabold text-text-primary hover:text-primary transition-colors">
                        <Link href={`/programas/${program.id}`}>{program.name}</Link>
                      </h3>
                      <p className="text-xs text-text-secondary font-medium">
                        {program.institutionName} • <span className="text-slate-400">{program.campusName}</span>
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs font-semibold text-text-secondary pt-1">
                        <div>
                          Costo: <span className="text-text-primary font-bold">{formatCurrency(program.tuitionCost)}</span>
                        </div>
                        <div>
                          Duración: <span className="text-text-primary font-bold">{program.durationSemesters} semestres</span>
                        </div>
                        <div>
                          Modalidad: <span className="text-text-primary font-bold">{program.modality}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleFavorite(program.id)}
                          className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all ${
                            isFav
                              ? "bg-red-50 border-red-200 text-red-500"
                              : "border-slate-200 text-slate-400 hover:text-red-500 hover:bg-slate-50"
                          }`}
                          style={{ minHeight: "44px", minWidth: "44px" }}
                          aria-label="Add to favorites"
                        >
                          <Heart className={`w-5 h-5 ${isFav ? "fill-red-500" : ""}`} />
                        </button>
                        <button
                          onClick={() => handleToggleCompare(program)}
                          className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all ${
                            isCompared
                              ? "bg-teal-50 border-teal-200 text-primary"
                              : "border-slate-200 text-slate-400 hover:text-primary hover:bg-slate-50"
                          }`}
                          style={{ minHeight: "44px", minWidth: "44px" }}
                          aria-label="Add to compare list"
                        >
                          <Scale className="w-5 h-5" />
                        </button>
                      </div>
                      <Link
                        href={`/programas/${program.id}`}
                        className="inline-flex items-center justify-center px-4 h-11 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                        style={{ minHeight: "44px" }}
                      >
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 space-y-3">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-text-primary">No se encontraron resultados</h3>
                <p className="text-xs text-text-secondary">Prueba con otros términos o filtros en el panel lateral.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Side-by-Side Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2 text-primary">
                <Scale className="w-5 h-5" />
                <h2 className="text-lg font-extrabold text-text-primary">Comparador de Programas</h2>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Comparison Table */}
            <div className="p-6 overflow-x-auto flex-1">
              <table className="w-full border-collapse text-left text-xs font-semibold text-text-secondary">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 font-bold text-text-primary w-1/4">Característica</th>
                    {comparedPrograms.map((cp) => (
                      <th key={cp.id} className="py-3 px-4 text-sm font-extrabold text-primary w-1/4">
                        {cp.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4 font-bold text-text-primary bg-slate-50">Institución</td>
                    {comparedPrograms.map((cp) => (
                      <td key={cp.id} className="py-3 px-4 text-text-primary">{cp.institutionName}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-text-primary bg-slate-50">Sede Campus</td>
                    {comparedPrograms.map((cp) => (
                      <td key={cp.id} className="py-3 px-4">{cp.campusName}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-text-primary bg-slate-50">Costo Semestre</td>
                    {comparedPrograms.map((cp) => (
                      <td key={cp.id} className="py-3 px-4 font-bold text-text-primary">
                        {formatCurrency(cp.tuitionCost)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-text-primary bg-slate-50">Duración</td>
                    {comparedPrograms.map((cp) => (
                      <td key={cp.id} className="py-3 px-4">{cp.durationSemesters} semestres</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-text-primary bg-slate-50">Modalidad</td>
                    {comparedPrograms.map((cp) => (
                      <td key={cp.id} className="py-3 px-4">{cp.modality}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-text-primary bg-slate-50">Grado Académico</td>
                    {comparedPrograms.map((cp) => (
                      <td key={cp.id} className="py-3 px-4">{cp.degreeLevel}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-text-primary bg-slate-50">Beca Disponible</td>
                    {comparedPrograms.map((cp) => (
                      <td key={cp.id} className="py-3 px-4">
                        {cp.scholarshipsAvailable ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Check className="w-4 h-4" /> Sí
                          </span>
                        ) : (
                          <span className="text-red-500">No</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-text-primary bg-slate-50">Salario Estimado</td>
                    {comparedPrograms.map((cp) => (
                      <td key={cp.id} className="py-3 px-4 text-emerald-700 font-bold">{cp.estimatedSalaryRange}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-text-primary bg-slate-50">Acreditación</td>
                    {comparedPrograms.map((cp) => (
                      <td key={cp.id} className="py-3 px-4">{cp.accreditationStatus}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowComparisonModal(false)}
                className="px-5 h-11 border border-slate-200 hover:bg-slate-100 text-text-primary text-xs font-bold rounded-xl transition-all"
                style={{ minHeight: "44px" }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Cargando...</div>}>
      <ExplorerContent />
    </Suspense>
  );
}
