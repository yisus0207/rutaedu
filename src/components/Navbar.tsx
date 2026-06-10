"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, BookOpen, Compass, Search, Bookmark, Brain, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 10) {
            setScrolled(true);
          } else {
            setScrolled(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { name: "Explorar", href: "/explorar", icon: Search },
    { name: "Test Vocacional", href: "/test-vocacional", icon: Brain },
    { name: "Asesor IA", href: "/asesor-ia", icon: MessageSquare },
    { name: "Mis Oportunidades", href: "/dashboard", icon: Bookmark },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-300 w-full py-2.5 sm:py-3.5 ${
          scrolled ? "glass shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            {/* Custom SVG Logo: Graduation Cap + Location Pin */}
            <svg viewBox="0 0 60 60" className="w-9.5 h-9.5 sm:w-12 sm:h-12 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
              {/* Graduation Cap top diamond - Dark Blue */}
              <path d="M30 10 L52 20 L30 30 L8 20 Z" fill="#0A1E3A" />

              {/* Pin Left Half - Dark Blue */}
              <path d="M30 30 L16 23 L16 35 C16 43 30 50 30 50 Z" fill="#0A1E3A" />

              {/* Pin Right Half - Green */}
              <path d="M30 30 L44 23 L44 35 C44 43 30 50 30 50 Z" fill="#00875A" />

              {/* Central Circle - Green background, white border */}
              <circle cx="30" cy="30" r="8.5" fill="#00875A" stroke="#FFFFFF" strokeWidth="2.5" />
              {/* Center inner green-teal circle */}
              <circle cx="30" cy="30" r="5" fill="#FFFFFF" />
              <circle cx="30" cy="30" r="2.5" fill="#00875A" />
            </svg>
            <div className="flex flex-col">
              <span className="text-[17.5px] sm:text-xl font-extrabold tracking-tight leading-none text-[#0A1E3A]">
                Ruta<span className="text-[#00875A]">Edu</span>
              </span>
              <span className="text-[8.5px] sm:text-[10px] text-[#64748B] mt-0.5 font-semibold block">
                Tu camino académico, tu futuro.
              </span>
            </div>
          </Link>

          {/* Action and Menu Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 mr-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Hamburger Button (Mobile) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center text-text-primary focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Login button (desktop and mobile) */}
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-3.5 h-8 sm:px-5 sm:h-11 rounded-full text-[10px] sm:text-sm font-bold text-white bg-[#00875A] hover:bg-[#006F48] transition-all shadow-sm"
            >
              Iniciar sesión
            </Link>

            {/* Discover Path (Desktop only) */}
            <Link
              href="/test-vocacional"
              className="hidden md:inline-flex items-center justify-center px-5 h-11 rounded-full text-sm font-bold text-[#0F766E] bg-teal-50 hover:bg-teal-100 transition-all border border-teal-100"
              style={{ minHeight: "44px" }}
            >
              Descubrir mi camino
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            />

            {/* Sidebar panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white shadow-2xl p-6 flex flex-col justify-between md:hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                      <Compass className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-extrabold text-text-primary">
                      RutaEdu
                    </span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-text-secondary"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <nav className="flex flex-col space-y-4">
                  {menuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-4 p-3 rounded-xl hover:bg-slate-50 text-base font-semibold text-text-primary transition-colors"
                      style={{ minHeight: "48px" }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex flex-col space-y-3 pt-6 border-t border-slate-100">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center h-12 rounded-xl text-base font-bold text-primary hover:bg-primary/5 transition-all"
                  style={{ minHeight: "48px" }}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/test-vocacional"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center h-12 rounded-xl text-base font-bold text-white bg-primary hover:bg-primary-hover shadow-md transition-all active:scale-95"
                  style={{ minHeight: "48px" }}
                >
                  Descubrir mi camino
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
