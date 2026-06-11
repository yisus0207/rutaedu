"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FooterCTA() {
  return (
    <div className="w-full bg-[#F2FAF7] border border-[#E2F2ED] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
      
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
        {/* Custom SVG: Books, cap, and plant illustration */}
        <div className="w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Stack of books */}
            <rect x="15" y="65" width="55" height="10" fill="#2563EB" rx="1.5" />
            <rect x="20" y="65" width="50" height="2" fill="#1D4ED8" />
            
            <rect x="18" y="55" width="50" height="10" fill="#F59E0B" rx="1.5" />
            <rect x="22" y="55" width="46" height="2" fill="#D97706" />

            <rect x="20" y="45" width="46" height="10" fill="#10B981" rx="1.5" />
            <rect x="24" y="45" width="42" height="2" fill="#059669" />

            {/* Graduation Cap */}
            <path d="M43 22 L72 31 L43 40 L14 31 Z" fill="#1E293B" />
            <rect x="33" y="35" width="20" height="8" fill="#334155" rx="0.5" />
            <path d="M43 31 L62 34 L62 43" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
            <circle cx="62" cy="43" r="1.5" fill="#D97706" />

            {/* Plant pot next to books */}
            <rect x="74" y="58" width="12" height="16" fill="#D1A180" rx="1" />
            {/* Plant leaves */}
            <path d="M80 58 Q85 45 88 48 Q85 53 80 58 Z" fill="#059669" />
            <path d="M80 58 Q75 45 72 48 Q75 53 80 58 Z" fill="#10B981" />
            <path d="M80 58 Q80 40 80 43 Q80 50 80 58 Z" fill="#047857" />
          </svg>
        </div>

        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg md:text-xl font-extrabold tracking-tight text-text-primary">
            Tu <span className="text-[#0F766E]">futuro</span> comienza hoy
          </h3>
          <p className="text-text-secondary text-xs font-semibold max-w-sm leading-relaxed">
            Miles de opciones, un solo lugar. <br className="xs:hidden" />
            Empieza tu ruta con RutaEdu.
          </p>
        </div>
      </div>

      <div className="w-full md:w-auto flex-shrink-0">
        <Link
          href="/asesor-ia"
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 h-12 rounded-full text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0D665F] shadow-sm transition-all transform active:scale-95"
          style={{ minHeight: "48px" }}
        >
          <span>Comenzar ahora</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
