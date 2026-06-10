"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  type: "universidades" | "carreras" | "becas";
  title: string;
  description: string;
  href: string;
}

export default function CategoryCard({ type, title, description, href }: CategoryCardProps) {
  // Styles based on category type
  const config = {
    universidades: {
      bg: "bg-[#F0FDFA]",
      border: "border-[#CCFBF1]",
      btnBg: "bg-[#0F766E] hover:bg-[#0D665F]",
      textColor: "text-[#0F766E]",
    },
    carreras: {
      bg: "bg-[#F0F7FF]",
      border: "border-[#DBEAFE]",
      btnBg: "bg-blue-600 hover:bg-blue-700",
      textColor: "text-blue-700",
    },
    becas: {
      bg: "bg-[#FFFDF2]",
      border: "border-[#FFF5CC]",
      btnBg: "bg-amber-500 hover:bg-amber-600",
      textColor: "text-amber-700",
    },
  }[type];

  const renderIllustration = () => {
    switch (type) {
      case "universidades":
        return (
          <svg viewBox="0 0 160 120" className="w-full h-14 mx-auto mb-1" xmlns="http://www.w3.org/2000/svg">
            {/* University building illustration — scaled up to fill */}
            {/* Base */}
            <rect x="35" y="75" width="90" height="30" fill="#E2E8F0" rx="3" />
            {/* Main body */}
            <rect x="50" y="55" width="60" height="20" fill="#CBD5E1" />
            {/* Roof triangle */}
            <path d="M80 28 L50 55 L110 55 Z" fill="#0F766E" />
            {/* Dome */}
            <path d="M62 55 C62 42, 98 42, 98 55 Z" fill="#0D665F" />
            {/* Columns */}
            <rect x="58" y="70" width="5" height="35" fill="#FFFFFF" rx="1" />
            <rect x="78" y="70" width="5" height="35" fill="#FFFFFF" rx="1" />
            <rect x="98" y="70" width="5" height="35" fill="#FFFFFF" rx="1" />
            {/* Side windows */}
            <rect x="40" y="80" width="8" height="12" fill="#94A3B8" rx="1" />
            <rect x="112" y="80" width="8" height="12" fill="#94A3B8" rx="1" />
            {/* Flag */}
            <line x1="80" y1="28" x2="80" y2="15" stroke="#94A3B8" strokeWidth="1.5" />
            <path d="M80 15 L92 19 L80 23 Z" fill="#EF4444" />
            {/* Trees */}
            <circle cx="25" cy="92" r="10" fill="#10B981" opacity="0.8" />
            <circle cx="29" cy="84" r="7" fill="#059669" opacity="0.9" />
            <circle cx="135" cy="92" r="10" fill="#10B981" opacity="0.8" />
            <circle cx="131" cy="84" r="7" fill="#059669" opacity="0.9" />
          </svg>
        );
      case "carreras":
        return (
          <svg viewBox="0 0 160 120" className="w-full h-14 mx-auto mb-1" xmlns="http://www.w3.org/2000/svg">
            {/* Stack of books illustration */}
            {/* Book 1 (bottom - yellow) */}
            <rect x="35" y="88" width="90" height="14" fill="#F59E0B" rx="3" />
            <rect x="42" y="88" width="83" height="4" fill="#D97706" />
            <rect x="115" y="90" width="10" height="10" fill="#FFFFFF" />
            {/* Book 2 (middle - blue) */}
            <rect x="40" y="72" width="80" height="14" fill="#2563EB" rx="3" />
            <rect x="47" y="72" width="73" height="4" fill="#1D4ED8" />
            <rect x="110" y="74" width="10" height="10" fill="#FFFFFF" />
            {/* Book 3 (top - green) */}
            <rect x="45" y="56" width="70" height="14" fill="#10B981" rx="3" />
            <rect x="52" y="56" width="63" height="4" fill="#059669" />
            <rect x="105" y="58" width="10" height="10" fill="#FFFFFF" />
            {/* Graduation Cap */}
            <path d="M80 18 L125 32 L80 46 L35 32 Z" fill="#1E293B" />
            <rect x="65" y="38" width="30" height="12" fill="#334155" rx="1" />
            {/* Cap Tassel */}
            <path d="M80 32 L110 37 L110 50" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="110" cy="50" r="3" fill="#D97706" />
          </svg>
        );
      case "becas":
        return (
          <svg viewBox="0 0 160 120" className="w-full h-14 mx-auto mb-1" xmlns="http://www.w3.org/2000/svg">
            {/* Piggy Bank Illustration */}
            <ellipse cx="80" cy="70" rx="38" ry="28" fill="#F87171" opacity="0.85" />
            <ellipse cx="80" cy="70" rx="32" ry="24" fill="#FCA5A5" />
            {/* Snout */}
            <rect x="110" y="62" width="10" height="16" fill="#F87171" rx="3" />
            <circle cx="114" cy="67" r="1.5" fill="#334155" />
            <circle cx="114" cy="73" r="1.5" fill="#334155" />
            {/* Ears */}
            <path d="M55 48 L45 35 L62 42 Z" fill="#F87171" />
            <path d="M72 44 L68 28 L82 38 Z" fill="#FCA5A5" />
            {/* Legs */}
            <rect x="55" y="94" width="10" height="12" fill="#EF4444" rx="2" />
            <rect x="90" y="94" width="10" height="12" fill="#EF4444" rx="2" />
            {/* Eye */}
            <circle cx="95" cy="58" r="2.5" fill="#1E293B" />
            {/* Falling Gold Coin */}
            <circle cx="80" cy="24" r="12" fill="#F59E0B" />
            <circle cx="80" cy="24" r="9" fill="#FBBF24" />
            {/* Dollar Sign inside coin */}
            <text x="76" y="28" fill="#D97706" fontSize="13" fontWeight="bold" fontFamily="sans-serif">$</text>
          </svg>
        );
    }
  };

  return (
    <div className={`w-full ${config.bg} border ${config.border} rounded-xl p-2.5 flex flex-col justify-between h-[165px] transition-all duration-300 hover:shadow-md group`}>
      <div className="space-y-1">
        {/* Large Vector Illustration */}
        {renderIllustration()}

        <div className="text-center">
          <h4 className="text-[10px] sm:text-sm font-extrabold text-text-primary group-hover:text-[#0F766E] transition-colors leading-tight">
            {title}
          </h4>
          <p className="text-[7px] sm:text-[10px] text-text-secondary leading-snug font-medium mt-0.5 line-clamp-3">
            {description}
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          href={href}
          className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full ${config.btnBg} flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-sm`}
          style={{ minHeight: "28px", minWidth: "28px" }}
        >
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </Link>
      </div>
    </div>
  );
}
