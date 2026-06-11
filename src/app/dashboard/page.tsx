"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Bookmark, History, Heart, ChevronRight, Bell, LogIn } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Profile = {
  first_name: string;
  last_name: string;
  email: string;
  role_id: string;
};

type FavoriteItem = {
  id: string;
  entity_type: string;
  program?: { id: string; name: string; slug: string; level: string };
  campus?: { name: string; institution?: { name: string } };
  institution?: { id: string; name: string };
  scholarship?: { id: string; name: string; provider: string };
};

type SearchHistoryItem = {
  id: string;
  query: string;
  filters: Record<string, string>;
  created_at: string;
};

type ScholarshipAlert = {
  id: string;
  email_notifications: boolean;
  in_app_notifications: boolean;
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"favs" | "history" | "alerts">("favs");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [alert, setAlert] = useState<ScholarshipAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingAlert, setSavingAlert] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const userId = session.user.id;

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name, email, role_id")
        .eq("id", userId)
        .single();

      if (profileData) setProfile(profileData);

      // Load favorites with related data
      const { data: favsData } = await supabase
        .from("favorites")
        .select(`
          id,
          entity_type,
          programs:program_id (
            id,
            name,
            slug,
            level,
            program_campuses (
              campuses (
                name,
                institutions (
                  name
                )
              )
            )
          ),
          campuses:campus_id ( name, institutions:institution_id ( name ) ),
          institutions:institution_id ( id, name ),
          scholarships:scholarship_id ( id, name, provider )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (favsData) {
        setFavorites(favsData.map((f: any) => {
          let campus = f.campuses;
          
          // If this is a program favorite and campus is null, try to retrieve it from program_campuses relationship
          if (!campus && f.programs?.program_campuses?.[0]?.campuses) {
            const pcCampus = f.programs.program_campuses[0].campuses;
            campus = {
              name: pcCampus.name,
              institution: pcCampus.institutions
            };
          }

          return {
            id: f.id,
            entity_type: f.entity_type,
            program: f.programs,
            campus: campus,
            institution: f.institutions,
            scholarship: f.scholarships,
          };
        }));
      }

      // Load search history
      const { data: histData } = await supabase
        .from("search_history")
        .select("id, query, filters, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(15);

      if (histData) setSearchHistory(histData);

      // Load scholarship alert settings
      const { data: alertData } = await supabase
        .from("scholarship_alerts")
        .select("id, email_notifications, in_app_notifications")
        .eq("user_id", userId)
        .single();

      if (alertData) setAlert(alertData);

      setLoading(false);
    };

    loadData();
  }, [router]);

  const handleRemoveFavorite = async (favId: string) => {
    await supabase.from("favorites").delete().eq("id", favId);
    setFavorites(prev => prev.filter(f => f.id !== favId));
  };

  const handleAlertToggle = async (field: "email_notifications" | "in_app_notifications") => {
    if (!alert) return;
    setSavingAlert(true);
    const newValue = !alert[field];

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (alert.id) {
      await supabase
        .from("scholarship_alerts")
        .update({ [field]: newValue })
        .eq("id", alert.id);
    } else {
      const { data } = await supabase
        .from("scholarship_alerts")
        .insert({ user_id: session.user.id, [field]: newValue })
        .select()
        .single();
      if (data) setAlert(data);
    }

    setAlert(prev => prev ? { ...prev, [field]: newValue } : null);
    setSavingAlert(false);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "Ahora mismo";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    if (diffDays === 1) return "Ayer";
    return `Hace ${diffDays} días`;
  };

  const initials =
    profile ? (profile.first_name?.charAt(0) ?? "") + (profile.last_name?.charAt(0) ?? "") : "?";
  const displayName =
    profile ? `${profile.first_name} ${profile.last_name}`.trim() || profile.email : "";

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
            <p className="text-sm text-text-secondary font-semibold">Cargando tu perfil...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-8 shadow-lg text-center max-w-sm space-y-4">
            <LogIn className="w-10 h-10 text-primary mx-auto" />
            <h2 className="text-lg font-extrabold text-text-primary">Sesión requerida</h2>
            <p className="text-xs text-text-secondary">Inicia sesión para ver tu dashboard personalizado.</p>
            <Link href="/login" className="block w-full h-12 bg-primary text-white font-bold text-sm rounded-xl flex items-center justify-center">
              Iniciar sesión
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1 flex flex-col lg:flex-row gap-8">

        {/* Left Column: Sidebar Profile Header */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-primary text-lg font-bold">
                {initials.toUpperCase()}
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-text-primary">{displayName}</h2>
                <span className="text-[10px] text-text-secondary font-medium truncate block max-w-[150px]">{profile.email}</span>
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
                      isActive ? "bg-primary text-white" : "text-text-secondary hover:bg-slate-50"
                    }`}
                    style={{ minHeight: "44px" }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Tab View */}
        <div className="flex-1 space-y-6">

          {/* FAVORITES TAB */}
          {activeTab === "favs" && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-primary" />
                <span>Mis Oportunidades Guardadas</span>
              </h2>

              {favorites.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm space-y-3">
                  <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-text-secondary">No tienes oportunidades guardadas aún.</p>
                  <Link href="/explorar" className="inline-block text-xs font-bold text-primary hover:underline">
                    Explorar programas →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favorites.map((fav) => {
                    const title = fav.program?.name ?? fav.institution?.name ?? fav.scholarship?.name ?? "—";
                    const badgeTranslations: Record<string, string> = {
                      program: "Programa / Carrera",
                      institution: "Institución",
                      campus: "Sede",
                      scholarship: "Beca",
                    };
                    const badge = badgeTranslations[fav.entity_type] || fav.entity_type;

                    const subtitle = fav.program
                      ? (fav.campus?.institution?.name || fav.campus?.name)
                        ? `${fav.campus?.institution?.name ?? ""} • ${fav.campus?.name ?? ""}`.trim().replace(/^•\s*|\s*•$/, "")
                        : ""
                      : fav.scholarship?.provider ?? "";
                    const href = fav.program
                      ? `/programas/${fav.program.id}`
                      : fav.institution
                      ? `/explorar?tipo=universidades`
                      : `/explorar?tipo=becas`;

                    return (
                      <div key={fav.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{badge}</span>
                            <button onClick={() => handleRemoveFavorite(fav.id)} title="Quitar de favoritos">
                              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                            </button>
                          </div>
                          <h4 className="text-sm font-extrabold text-text-primary line-clamp-2">{title}</h4>
                          {subtitle && <p className="text-xs text-text-secondary font-medium">{subtitle}</p>}
                        </div>

                        <div className="flex items-center justify-end pt-3 border-t border-slate-50 mt-3">
                          <Link
                            href={href}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                          >
                            <span>Ver más</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <span>Historial de Búsquedas</span>
              </h2>

              {searchHistory.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm space-y-3">
                  <History className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-text-secondary">No tienes búsquedas registradas aún.</p>
                  <Link href="/explorar" className="inline-block text-xs font-bold text-primary hover:underline">
                    Ir a explorar →
                  </Link>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm divide-y divide-slate-100">
                  {searchHistory.map((sh) => (
                    <div key={sh.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-text-primary">"{sh.query}"</h4>
                        <div className="flex gap-2 text-[10px] text-text-secondary font-medium mt-1 flex-wrap">
                          {Object.entries(sh.filters ?? {}).map(([k, v]) => (
                            <span key={k} className="bg-slate-100 px-1.5 py-0.5 rounded">
                              {k}: {v as string}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-3">
                        {formatDate(sh.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ALERTS TAB */}
          {activeTab === "alerts" && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <span>Alertas de Oportunidades</span>
              </h2>

              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                <p className="text-xs text-text-secondary">Recibe notificaciones cuando surjan becas y convocatorias que coincidan con tu perfil.</p>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-text-primary block">Notificaciones por Correo</span>
                      <span className="text-[10px] text-text-secondary">Recibe emails con nuevas oportunidades</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={alert?.email_notifications ?? true}
                      onChange={() => handleAlertToggle("email_notifications")}
                      disabled={savingAlert}
                      className="rounded text-primary focus:ring-primary h-4 w-4"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-text-primary block">Notificaciones In-App</span>
                      <span className="text-[10px] text-text-secondary">Alertas dentro de la plataforma</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={alert?.in_app_notifications ?? true}
                      onChange={() => handleAlertToggle("in_app_notifications")}
                      disabled={savingAlert}
                      className="rounded text-primary focus:ring-primary h-4 w-4"
                    />
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
