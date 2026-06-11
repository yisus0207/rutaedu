"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Search, GraduationCap, School, BookOpen, Award, Check, X, Scale, Heart, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Program {
  id: string;
  name: string;
  slug: string;
  level: string;
  category: string;
  institutionName: string;
  institutionAccreditation: string;
  campusId: string;
  campusName: string;
  tuitionCost: number;
  currency: string;
  durationSemesters: number;
  modality: string;
  scholarshipsAvailable: boolean;
}

function ExplorerContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialType = searchParams.get("tipo") || "";

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState<string>(initialType);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparedPrograms, setComparedPrograms] = useState<Program[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favIds, setFavIds] = useState<Map<string, string>>(new Map()); // programId -> favoriteRowId
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Debounce search query for DB queries
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Load current user and their favorites once
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUserId(session.user.id);

      // Load existing favorites for this user
      const { data: favsData } = await supabase
        .from("favorites")
        .select("id, program_id")
        .eq("user_id", session.user.id)
        .eq("entity_type", "program")
        .not("program_id", "is", null);

      if (favsData) {
        const ids = new Set<string>();
        const map = new Map<string, string>();
        favsData.forEach((f: any) => {
          if (f.program_id) {
            ids.add(f.program_id);
            map.set(f.program_id, f.id);
          }
        });
        setFavorites(ids);
        setFavIds(map);
      }
    };

    loadUser();
  }, []);

  // Load programs from Supabase
  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);

      let q = supabase
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
            category
          ),
          campuses (
            id,
            name,
            institutions (
              name,
              accreditation_status
            )
          ),
          scholarship_programs:programs!inner ( scholarship_programs ( id ) )
        `)
        .eq("status", "active");

      const { data, error } = await q;

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Check scholarships per program: get program IDs that have scholarships
      const { data: scholarshipLinks } = await supabase
        .from("scholarship_programs")
        .select("program_id");
      const programsWithScholarships = new Set(
        (scholarshipLinks ?? []).map((s: any) => s.program_id)
      );

      const mapped: Program[] = data.map((pc: any) => ({
        id: pc.programs?.id ?? "",
        name: pc.programs?.name ?? "",
        slug: pc.programs?.slug ?? "",
        level: pc.programs?.level ?? "",
        category: pc.programs?.category ?? "",
        institutionName: pc.campuses?.institutions?.name ?? "",
        institutionAccreditation: pc.campuses?.institutions?.accreditation_status ?? "",
        campusId: pc.campuses?.id ?? "",
        campusName: pc.campuses?.name ?? "",
        tuitionCost: pc.tuition_cost ?? 0,
        currency: pc.currency ?? "COP",
        durationSemesters: pc.duration_semesters ?? 0,
        modality: pc.modality ?? "",
        scholarshipsAvailable: programsWithScholarships.has(pc.programs?.id),
      })).filter((p) => p.id !== "");

      setPrograms(mapped);
      setLoading(false);
    };

    fetchPrograms();
  }, []);

  // Save search query to history (debounced, only if user is logged in)
  useEffect(() => {
    if (!userId || debouncedQuery.trim().length < 2) return;
    supabase.from("search_history").insert({
      user_id: userId,
      query: debouncedQuery.trim(),
      filters: activeType ? { tipo: activeType } : {},
    }).then(() => { }); // fire and forget
  }, [debouncedQuery, userId]);

  // Filter locally after DB load
  const filteredPrograms = programs.filter((p) => {
    const matchesQuery =
      !debouncedQuery ||
      p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      p.institutionName.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(debouncedQuery.toLowerCase());

    if (activeType === "carreras") return matchesQuery && p.level === "pregrado";
    if (activeType === "cursos") return matchesQuery && (p.level === "bootcamp" || p.level === "curso" || p.level === "technical" || p.level === "technologist");
    if (activeType === "universidades") return matchesQuery && p.institutionName.toLowerCase().includes("universidad");
    if (activeType === "becas") return matchesQuery && p.scholarshipsAvailable;
    return matchesQuery;
  });

  const handleToggleFavorite = async (program: Program) => {
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    const isFav = favorites.has(program.id);

    if (isFav) {
      // Remove from favorites
      const favRowId = favIds.get(program.id);
      if (favRowId) {
        const { error } = await supabase.from("favorites").delete().eq("id", favRowId);
        if (!error) {
          setFavorites(prev => { const s = new Set(prev); s.delete(program.id); return s; });
          setFavIds(prev => { const m = new Map(prev); m.delete(program.id); return m; });
        } else {
          console.error("Error removing favorite:", error.message);
        }
      }
    } else {
      // Add to favorites
      // IMPORTANT: DB check constraint requires that for entity_type='program',
      // campus_id, institution_id and scholarship_id MUST be NULL.
      const { data, error } = await supabase
        .from("favorites")
        .insert({
          user_id: userId,
          entity_type: "program",
          program_id: program.id,
          campus_id: null,
          institution_id: null,
          scholarship_id: null,
        })
        .select("id")
        .single();

      if (!error && data) {
        setFavorites(prev => new Set([...prev, program.id]));
        setFavIds(prev => new Map([...prev, [program.id, data.id]]));
      } else if (error) {
        console.error("Error saving favorite:", error.message, error.details);
      }
    }
  };

  const handleToggleCompare = (program: Program) => {
    if (comparedPrograms.find((cp) => cp.id === program.id)) {
      setComparedPrograms(comparedPrograms.filter((cp) => cp.id !== program.id));
    } else {
      if (comparedPrograms.length >= 3) return;
      setComparedPrograms([...comparedPrograms, program]);
    }
  };

  const formatCurrency = (val: number, currency = "COP") => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
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
                    className={`flex items-center gap-3 px-3 h-11 rounded-xl text-xs font-bold border text-left transition-all ${isActive
                        ? "bg-primary border-primary text-white"
                        : "bg-slate-50 border-slate-100 text-text-secondary hover:bg-slate-100"
                      }`}
                    style={{ minHeight: "44px" }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compare floating box */}
          {comparedPrograms.length > 0 && (
            <div className="bg-teal-900 text-white rounded-3xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  <span className="text-sm font-bold">Comparar ({comparedPrograms.length})</span>
                </div>
                <button onClick={() => setComparedPrograms([])} className="text-xs text-teal-300 hover:text-white underline">
                  Limpiar
                </button>
              </div>
              <div className="space-y-2">
                {comparedPrograms.map((cp) => (
                  <div key={cp.id} className="flex justify-between items-center text-xs bg-teal-950/40 p-2.5 rounded-lg">
                    <span className="truncate max-w-[150px]">{cp.name}</span>
                    <button onClick={() => handleToggleCompare(cp)} className="text-white hover:text-red-400">
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

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                <p className="text-sm text-text-secondary font-semibold">Cargando programas...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {!userId && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs font-semibold text-amber-800 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>
                    <Link href="/login" className="underline font-bold">Inicia sesión</Link> para guardar tus programas favoritos.
                  </span>
                </div>
              )}

              {filteredPrograms.length > 0 ? (
                filteredPrograms.map((program) => {
                  const isCompared = comparedPrograms.some((cp) => cp.id === program.id);
                  const isFav = favorites.has(program.id);
                  return (
                    <div
                      key={program.id}
                      className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                            {program.level}
                          </span>
                          {program.scholarshipsAvailable && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">
                              Beca Disponible
                            </span>
                          )}
                          {program.institutionAccreditation && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 uppercase">
                              {program.institutionAccreditation}
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
                          <div>Costo: <span className="text-text-primary font-bold">{formatCurrency(program.tuitionCost, program.currency)}</span></div>
                          <div>Duración: <span className="text-text-primary font-bold">{program.durationSemesters} semestres</span></div>
                          <div>Modalidad: <span className="text-text-primary font-bold capitalize">{program.modality}</span></div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleFavorite(program)}
                            className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all ${isFav
                                ? "bg-red-50 border-red-200 text-red-500"
                                : "border-slate-200 text-slate-400 hover:text-red-500 hover:bg-slate-50"
                              }`}
                            style={{ minHeight: "44px", minWidth: "44px" }}
                            aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                            title={isFav ? "Quitar de favoritos" : userId ? "Guardar en favoritos" : "Inicia sesión para guardar"}
                          >
                            <Heart className={`w-5 h-5 ${isFav ? "fill-red-500" : ""}`} />
                          </button>
                          <button
                            onClick={() => handleToggleCompare(program)}
                            className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all ${isCompared
                                ? "bg-teal-50 border-teal-200 text-primary"
                                : "border-slate-200 text-slate-400 hover:text-primary hover:bg-slate-50"
                              }`}
                            style={{ minHeight: "44px", minWidth: "44px" }}
                            aria-label="Agregar a comparar"
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
          )}
        </div>
      </main>

      {/* Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
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

            <div className="p-6 overflow-x-auto flex-1">
              <table className="w-full border-collapse text-left text-xs font-semibold text-text-secondary">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 font-bold text-text-primary w-1/4">Característica</th>
                    {comparedPrograms.map((cp) => (
                      <th key={cp.id} className="py-3 px-4 text-sm font-extrabold text-primary w-1/4">{cp.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { label: "Institución", render: (cp: Program) => cp.institutionName },
                    { label: "Sede Campus", render: (cp: Program) => cp.campusName },
                    { label: "Costo Semestre", render: (cp: Program) => formatCurrency(cp.tuitionCost, cp.currency) },
                    { label: "Duración", render: (cp: Program) => `${cp.durationSemesters} semestres` },
                    { label: "Modalidad", render: (cp: Program) => cp.modality },
                    { label: "Nivel", render: (cp: Program) => cp.level },
                    {
                      label: "Beca Disponible",
                      render: (cp: Program) => cp.scholarshipsAvailable
                        ? <span className="text-emerald-600 flex items-center gap-1"><Check className="w-4 h-4" /> Sí</span>
                        : <span className="text-red-500">No</span>
                    },
                    { label: "Acreditación", render: (cp: Program) => cp.institutionAccreditation || "—" },
                  ].map(({ label, render }) => (
                    <tr key={label}>
                      <td className="py-3 px-4 font-bold text-text-primary bg-slate-50">{label}</td>
                      {comparedPrograms.map((cp) => (
                        <td key={cp.id} className="py-3 px-4 text-text-primary">{render(cp) as React.ReactNode}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
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
