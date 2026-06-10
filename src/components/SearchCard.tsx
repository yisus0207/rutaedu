"use client";

import React, { useState } from "react";
import { Search, GraduationCap, School, BookOpen, Award, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchCard() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const tabs = [
    { id: "carreras", label: "Carreras", icon: GraduationCap, color: "text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 border-emerald-100" },
    { id: "universidades", label: "Universidades", icon: School, color: "text-blue-700 bg-blue-50 hover:bg-blue-100/70 border-blue-100" },
    { id: "cursos", label: "Cursos", icon: BookOpen, color: "text-amber-700 bg-amber-50 hover:bg-amber-100/70 border-amber-100" },
    { id: "becas", label: "Becas", icon: Award, color: "text-purple-700 bg-purple-50 hover:bg-purple-100/70 border-purple-100" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !activeTab) return;
    
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (activeTab) params.set("tipo", activeTab);
    
    router.push(`/explorar?${params.toString()}`);
  };

  const handleTabClick = (tabId: string) => {
    const nextTab = activeTab === tabId ? null : tabId;
    setActiveTab(nextTab);
  };

  return (
    <div className="w-full bg-white shadow-xl shadow-slate-100 border border-slate-100/80 rounded-2xl p-3.5 sm:p-5 md:p-6 transition-all duration-300">
      <div className="flex items-center gap-2 mb-3">
        <Search className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 flex-shrink-0" />
        <h2 className="text-[13.5px] sm:text-xl font-extrabold text-text-primary tracking-tight">¿Qué estás buscando?</h2>
      </div>

      <form onSubmit={handleSearchSubmit} className="space-y-3">
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 sm:left-4 text-slate-400 w-3.5 h-3.5 sm:w-5 sm:h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej. Ingeniería Civil, Diseño, Maestrías..."
            className="w-full pl-9 sm:pl-12 pr-10 h-10 sm:h-12 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 text-text-primary text-[11px] sm:text-sm placeholder-slate-400 font-medium transition-all outline-none"
          />
          {query.trim().length > 0 && (
            <button
              type="submit"
              className="absolute right-1.5 w-7 h-7 sm:w-9 sm:h-9 bg-[#0F766E] hover:bg-[#0D665F] flex items-center justify-center text-white rounded-lg sm:rounded-xl transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {/* Categorized Filter Tabs - Grid layout to fit 4 on single line on mobile */}
        <div className="grid grid-cols-4 gap-1.5 pt-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center justify-center gap-0.5 sm:gap-1.5 px-1 sm:px-3 h-8 sm:h-10 rounded-full text-[8.5px] sm:text-xs font-bold border transition-all ${
                  isSelected 
                    ? "bg-[#0F766E] text-white border-[#0F766E] shadow-sm" 
                    : tab.color
                }`}
              >
                <Icon className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${isSelected ? "text-white" : ""}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </form>
    </div>
  );
}
