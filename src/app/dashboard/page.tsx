"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Bookmark, School, Award, History, Heart, ChevronRight, Bell, Settings, User } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"favs" | "history" | "alerts">("favs");

  // Mock favorites
  const favoritePrograms = [
    {
      id: "p1",
      name: "Ingeniería de Sistemas y Computación",
      institution: "Universidad de los Andes",
      campus: "Bogotá",
      cost: "$22.000.000 COP",
    },
    {
      id: "p3",
      name: "Desarrollo Full Stack Web",
      institution: "RutaEdu Academy",
      campus: "Virtual",
      cost: "$4.900.000 COP",
    },
  ];

  // Mock search history
  const searchHistory = [
    { query: "Ingeniería de Sistemas", filters: { level: "Pregrado", country: "Colombia" }, date: "Hace 2 horas" },
    { query: "Diseño UX/UI", filters: { modality: "Virtual" }, date: "Ayer" },
    { query: "Becas MinTIC", filters: {}, date: "Hace 3 días" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Sidebar Profile Header */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-primary text-lg font-bold">
                U
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-text-primary">Usuario Demo</h2>
                <span className="text-[10px] text-text-secondary font-medium">Estudiante RutaEdu</span>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-1">
              {[
                { id: "favs", label: "Oportunidades guardadas", icon: Bookmark },
                { id: "history", label: "Historial de búsquedas", icon: History },
                { id: "alerts", label: "Alertas de Becas", icon: Bell },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 px-3 h-11 rounded-xl text-xs font-bold text-left transition-all ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-text-secondary hover:bg-slate-50"
                    }`}
                    style={{ minHeight: "44px" }}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Tab View */}
        <div className="flex-1 space-y-6">
          
          {activeTab === "favs" && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-primary" />
                <span>Mis Oportunidades Guardadas</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoritePrograms.map((p) => (
                  <div key={p.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[180px]">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">Carrera</span>
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      </div>
                      <h4 className="text-sm font-extrabold text-text-primary line-clamp-1">{p.name}</h4>
                      <p className="text-xs text-text-secondary font-medium">{p.institution} • {p.campus}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <span className="text-xs font-bold text-text-primary">{p.cost}</span>
                      <Link
                        href={`/programas/${p.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                      >
                        <span>Ver más</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <span>Historial de Búsquedas</span>
              </h2>

              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm divide-y divide-slate-100">
                {searchHistory.map((sh, i) => (
                  <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">"{sh.query}"</h4>
                      <div className="flex gap-2 text-[10px] text-text-secondary font-medium mt-1">
                        {Object.entries(sh.filters).map(([k, v]) => (
                          <span key={k} className="bg-slate-100 px-1.5 py-0.5 rounded">
                            {k}: {v as string}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{sh.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "alerts" && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <span>Alertas de Oportunidades</span>
              </h2>

              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                <p className="text-xs text-text-secondary">Recibe correos e-mail o notificaciones in-app cuando surjan becas y convocatorias que coincidan con tu perfil.</p>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-bold text-text-primary">Notificaciones por Correo</span>
                    <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4" />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-bold text-text-primary">Notificaciones In-App</span>
                    <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4" />
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
