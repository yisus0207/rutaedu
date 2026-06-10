"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import SearchCard from "@/components/SearchCard";
import VocationalCard from "@/components/VocationalCard";
import CategoryCard from "@/components/CategoryCard";
import TestimonialSlider from "@/components/TestimonialSlider";
import FooterCTA from "@/components/FooterCTA";
import { Compass } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF9] text-[#0F172A] overflow-x-hidden font-sans">
      {/* Navigation Header */}
      <Navbar />

      {/* ============================================= */}
      {/* HERO SECTION — Dominates first viewport        */}
      {/* Left: Headline + Description + CTAs            */}
      {/* Right: Student illustration with signposts     */}
      {/* ============================================= */}
      <section className="relative w-full overflow-hidden min-h-[190px] sm:min-h-[300px] flex items-center">
        {/* Background Image that matches the reference design */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/student_hero.png"
            alt="Estudiante buscando camino académico"
            className="w-full h-full object-cover object-[75%_center] sm:object-right-bottom scale-[1.08] origin-center"
          />
          {/* Fading overlay to keep text readable on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAF9] via-[#FAFAF9]/95 sm:via-[#FAFAF9]/75 to-[#FAFAF9]/10" />
        </div>

        <div className="max-w-7xl mx-auto w-full px-2.5 sm:px-6 lg:px-8 pt-1.5 pb-5 sm:py-10 lg:py-14 relative z-10">
          {/* Left — Text Content (~60%) */}
          <div className="max-w-[210px] xs:max-w-[240px] sm:max-w-md lg:max-w-lg space-y-2.5 sm:space-y-5 lg:space-y-6 min-w-0">
            <h1 className="text-[20px] sm:text-[38px] lg:text-5xl xl:text-[56px] font-extrabold tracking-tight text-[#0F172A] leading-[1.12]">
              Descubre{" "}
              <br className="sm:hidden" />
              <span className="text-[#10B981]">tu camino,</span>
              <br />
              decide tu futuro
            </h1>

            <p className="text-[10px] sm:text-sm lg:text-base text-[#64748B] font-medium leading-relaxed max-w-[170px] xs:max-w-xs sm:max-w-md">
              Encuentra carreras, universidades, cursos y becas que se adaptan a ti y a tu presupuesto.
            </p>

            {/* Hero Action Buttons */}
            <div className="flex flex-col gap-2 max-w-[170px] xs:max-w-[190px] sm:max-w-xs">
              <Link
                href="/test-vocacional"
                className="w-full inline-flex items-center justify-center gap-1.5 h-8.5 sm:h-12 rounded-full text-[10px] sm:text-xs font-bold text-white bg-[#00875A] hover:bg-[#006F48] transition-all transform active:scale-95 shadow-sm"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Descubrir mi camino</span>
              </Link>
              <Link
                href="/explorar"
                className="w-full inline-flex items-center justify-center h-8.5 sm:h-12 rounded-full text-[10px] sm:text-xs font-bold text-[#0F172A] bg-white border border-[#E2E8F0] hover:bg-slate-50 transition-all"
              >
                Explorar oportunidades
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* SEARCH FILTER CARD                             */}
      {/* ============================================= */}
      <section className="py-2 px-4 sm:px-6 lg:px-8 max-w-xl sm:max-w-3xl lg:max-w-5xl mx-auto w-full">
        <SearchCard />
      </section>

      {/* ============================================= */}
      {/* VOCATIONAL TEST CARD                           */}
      {/* ============================================= */}
      <section className="py-2 px-4 sm:px-6 lg:px-8 max-w-xl sm:max-w-3xl lg:max-w-5xl mx-auto w-full">
        <VocationalCard />
      </section>

      {/* ============================================= */}
      {/* EXPLORA OPORTUNIDADES — Category Cards         */}
      {/* Horizontal scroll on mobile, 3-col grid on sm+ */}
      {/* ============================================= */}
      <section className="py-2.5 px-4 sm:px-6 lg:px-8 max-w-xl sm:max-w-3xl lg:max-w-5xl mx-auto w-full space-y-4">
        <h2 className="text-[13px] sm:text-lg font-extrabold text-[#0F172A] tracking-tight">
          Explora oportunidades que se adaptan a ti
        </h2>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <CategoryCard
            type="universidades"
            title="Universidades"
            description="Encuentra universidades de calidad en Colombia y el mundo."
            href="/explorar?tipo=universidades"
          />
          <CategoryCard
            type="carreras"
            title="Programas y carreras"
            description="Descubre programas que impulsan tu futuro profesional."
            href="/explorar?tipo=carreras"
          />
          <CategoryCard
            type="becas"
            title="Becas y financiación"
            description="Explora becas y opciones de financiación que se ajustan a ti."
            href="/explorar?tipo=becas"
          />
        </div>
      </section>

      {/* ============================================= */}
      {/* TESTIMONIALS                                   */}
      {/* ============================================= */}
      <section className="py-2.5 px-4 sm:px-6 lg:px-8 max-w-xl sm:max-w-3xl lg:max-w-5xl mx-auto w-full space-y-4">
        <h3 className="text-[13px] sm:text-lg font-extrabold text-[#0F172A] tracking-tight">
          Historias reales, resultados reales
        </h3>
        <TestimonialSlider />
      </section>

      {/* ============================================= */}
      {/* FINAL CTA                                      */}
      {/* ============================================= */}
      <section className="py-3 px-4 sm:px-6 lg:px-8 max-w-xl sm:max-w-3xl lg:max-w-5xl mx-auto w-full pb-10">
        <FooterCTA />
      </section>

      {/* ============================================= */}
      {/* FOOTER                                         */}
      {/* ============================================= */}
      <footer className="bg-white border-t border-slate-150 py-8 mt-auto">
        <div className="max-w-xl mx-auto px-4 text-center space-y-3">
          <div className="flex justify-center items-center gap-2">
            <span className="text-sm font-extrabold text-[#0F172A]">RutaEdu</span>
            <span className="text-[10px] text-[#64748B] font-semibold">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex justify-center gap-4 text-[10px] font-bold text-[#64748B]">
            <Link href="/politica-de-privacidad" className="hover:text-primary">Privacidad</Link>
            <Link href="/terminos-de-servicio" className="hover:text-primary">Términos</Link>
            <Link href="/soporte" className="hover:text-primary">Soporte</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
