"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import SearchCard from "@/components/SearchCard";
import VocationalCard from "@/components/VocationalCard";
import CategoryCard from "@/components/CategoryCard";
import TestimonialSlider from "@/components/TestimonialSlider";
import FooterCTA from "@/components/FooterCTA";
import { Compass, Mail } from "lucide-react";
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
      <footer className="bg-white border-t border-slate-100 pt-10 pb-16 md:pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100 text-left">
            {/* Brand Block */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="flex items-center space-x-1.5">
                {/* Logo */}
                <svg viewBox="0 0 60 60" className="w-8.5 h-8.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 10 L52 20 L30 30 L8 20 Z" fill="#0A1E3A" />
                  <path d="M30 30 L16 23 L16 35 C16 43 30 50 30 50 Z" fill="#0A1E3A" />
                  <path d="M30 30 L44 23 L44 35 C44 43 30 50 30 50 Z" fill="#00875A" />
                  <circle cx="30" cy="30" r="8.5" fill="#00875A" stroke="#FFFFFF" strokeWidth="2.5" />
                  <circle cx="30" cy="30" r="5" fill="#FFFFFF" />
                  <circle cx="30" cy="30" r="2.5" fill="#00875A" />
                </svg>
                <span className="text-[17px] font-extrabold tracking-tight leading-none text-[#0A1E3A]">
                  Ruta<span className="text-[#00875A]">Edu</span>
                </span>
              </Link>
              <p className="text-xs text-[#64748B] font-medium leading-relaxed max-w-sm">
                La plataforma de descubrimiento educativo líder en América Latina. Ayudamos a estudiantes a encontrar su carrera, universidad, becas y financiación ideal.
              </p>
              {/* Social Media Links */}
              <div className="flex items-center space-x-3 pt-1">
                <a href="#" className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-[#64748B] hover:text-[#00875A] transition-colors border border-slate-100" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="#" className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-[#64748B] hover:text-[#00875A] transition-colors border border-slate-100" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="#" className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-[#64748B] hover:text-[#00875A] transition-colors border border-slate-100" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-[#64748B] hover:text-[#00875A] transition-colors border border-slate-100" aria-label="Twitter">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
              </div>
            </div>

            {/* Students Column */}
            <div className="col-span-1 space-y-3">
              <h4 className="text-xs font-bold text-[#0A1E3A] uppercase tracking-wider">Estudiantes</h4>
              <ul className="space-y-2 text-xs font-medium text-[#64748B]">
                <li><Link href="/test-vocacional" className="hover:text-[#00875A] transition-colors">Test Vocacional</Link></li>
                <li><Link href="/explorar?tipo=carreras" className="hover:text-[#00875A] transition-colors">Buscar Carreras</Link></li>
                <li><Link href="/explorar?tipo=universidades" className="hover:text-[#00875A] transition-colors">Universidades</Link></li>
                <li><Link href="/explorar?tipo=becas" className="hover:text-[#00875A] transition-colors">Becas y Financiación</Link></li>
                <li><Link href="/asesor-ia" className="hover:text-[#00875A] transition-colors">Asesor IA</Link></li>
              </ul>
            </div>

            {/* Institutions Column */}
            <div className="col-span-1 space-y-3">
              <h4 className="text-xs font-bold text-[#0A1E3A] uppercase tracking-wider">Instituciones</h4>
              <div className="space-y-2">
                <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                  ¿Eres una universidad o instituto técnico? Publica tus programas, carreras y becas para llegar a miles de estudiantes.
                </p>
                <div className="pt-1">
                  <a href="mailto:soporte@rutaedu.com" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00875A] hover:text-[#006F48] hover:underline">
                    <Mail className="w-3.5 h-3.5" />
                    <span>soporte@rutaedu.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom copyright & legal links row */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10.5px] font-semibold text-[#64748B]">
            <div className="flex items-center gap-1">
              <span>© {new Date().getFullYear()} RutaEdu.</span>
              <span>Todos los derechos reservados.</span>
            </div>
            <div className="flex gap-4">
              <Link href="/politica-de-privacidad" className="hover:text-[#00875A] transition-colors">Privacidad</Link>
              <Link href="/terminos-de-servicio" className="hover:text-[#00875A] transition-colors">Términos</Link>
              <Link href="/soporte" className="hover:text-[#00875A] transition-colors">Soporte</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
