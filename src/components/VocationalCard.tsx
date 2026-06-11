"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Brain } from "lucide-react";

export default function VocationalCard() {
  return (
    <div className="w-full bg-[#EAF7F3] border border-[#DCEFEA] rounded-2xl p-3 sm:p-5 flex items-center justify-between gap-3 sm:gap-6 transition-transform duration-300">
      
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        {/* Brain Bubble Graphic SVG */}
        <div className="w-11 h-11 sm:w-16 sm:h-16 flex-shrink-0 relative">
          <svg viewBox="0 0 64 64" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Speech bubble path */}
            <path
              d="M 7,26 A 20,20 0 1,1 41.1,40.1 L 46,47 L 37.3,43.3 A 20,20 0 0,1 7,26 Z"
              fill="#FFFFFF"
              stroke="#10B981"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Brain Stem */}
            <path
              d="M25.5 34 c0 1.5 0.5 3 1 4 c0.3 0 1 0 1.2 -0.2 c0.2 -1 0.8 -2.5 0.8 -3.8"
              fill="#10B981"
              stroke="#047857"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Brain Lobe fill & outline */}
            <path
              d="M27 34.5c-0.5 0.5 -1.2 0.8 -2 0.8c-1.8 0 -3.3 -1.2 -3.7 -2.8c-1.2 0 -2.3 -0.8 -2.7 -2c-1.2 -0.2 -2.1 -1.2 -2.1 -2.5c0 -0.5 0.2 -1 0.5 -1.4c-0.6 -0.6 -1 -1.4 -1 -2.3c0 -1.9 1.5 -3.5 3.4 -3.5c0.2 0 0.4 0 0.6 0.1c0.7 -1.8 2.4 -3.1 4.5 -3.1c0.9 0 1.8 0.3 2.5 0.8c0.7 -0.5 1.6 -0.8 2.5 -0.8c2.1 0 3.8 1.3 4.5 3.1c0.2 0 0.4 -0.1 0.6 -0.1c1.9 0 3.4 1.6 3.4 3.5c0 0.9 -0.4 1.7 -1 2.3c0.3 0.4 0.5 0.9 0.5 1.4c0 1.3 -0.9 2.3 -2.1 2.5c-0.4 1.2 -1.5 2 -2.7 2c-0.4 1.6 -1.9 2.8 -3.7 2.8c-0.8 0 -1.5 -0.3 -2 -0.8"
              fill="#10B981"
              stroke="#047857"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Center dividing line */}
            <path d="M27 18.2v16.3" stroke="#047857" strokeWidth="1.2" strokeLinecap="round" />
            
            {/* Left lobe folds */}
            <path
              d="M22 21.5c1 -0.5 2.5 -0.2 3 0.8M19.5 25c1.5 0 2.5 -1 2.5 -2.5M19.5 28.5c1.5 0.5 2.5 -0.5 3 -2M22.5 31.5c0.5 -1 1.5 -1.5 2.5 -1.5"
              stroke="#047857"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
            />
            
            {/* Right lobe folds */}
            <path
              d="M32 21.5c-1 -0.5 -2.5 -0.2 -3 0.8M34.5 25c-1.5 0 -2.5 -1 -2.5 -2.5M34.5 28.5c-1.5 0.5 -2.5 -0.5 -3 -2M31.5 31.5c-0.5 -1 -1.5 -1.5 -2.5 -1.5"
              stroke="#047857"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        <div className="space-y-0.5 min-w-0">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[7.5px] sm:text-[9.5px] font-extrabold bg-[#D6F2EA] text-[#007A53] tracking-wide uppercase">
            Test Vocacional IA
          </span>
          <h3 className="text-[11px] sm:text-base font-extrabold text-[#0F172A] leading-tight">
            ¿No sabes qué estudiar?
          </h3>
          <p className="text-[8.5px] sm:text-xs text-[#475569] leading-snug font-medium max-w-[170px] xs:max-w-[210px] sm:max-w-sm">
            Platica con nuestro asesor inteligente y descubre carreras recomendadas según tus gustos, ubicación y presupuesto.
          </p>
        </div>
      </div>

      <div className="flex-shrink-0">
        <Link
          href="/asesor-ia"
          className="inline-flex items-center justify-center gap-1 px-2.5 h-8 sm:px-5 sm:h-11 rounded-full text-[10px] sm:text-xs font-bold text-white bg-[#00875A] hover:bg-[#006F48] transition-all transform active:scale-95 shadow-sm"
        >
          <span>Iniciar chat</span>
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </Link>
      </div>
    </div>
  );
}
