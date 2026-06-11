import React from "react";
import Link from "next/link";
import { GraduationCap, Award, Search, BookOpen } from "lucide-react";

export default function FeaturedCategories() {
  const categories = [
    {
      title: "Pregrado",
      icon: <GraduationCap className="w-7 h-7 sm:w-9 sm:h-9" />,
      bgColor: "bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100/70 hover:scale-105",
      href: "/explorar?tipo=carreras&nivel=pregrado",
    },
    {
      title: "Posgrado",
      icon: <Award className="w-7 h-7 sm:w-9 sm:h-9" />,
      bgColor: "bg-pink-50 border border-pink-100 text-pink-600 hover:bg-pink-100/70 hover:scale-105",
      href: "/explorar?tipo=carreras&nivel=posgrado",
    },
    {
      title: "Investigación",
      icon: <Search className="w-7 h-7 sm:w-9 sm:h-9" />,
      bgColor: "bg-teal-50 border border-teal-100 text-teal-600 hover:bg-teal-100/70 hover:scale-105",
      href: "/explorar?tipo=universidades",
    },
    {
      title: "Cursos Cortos",
      icon: <BookOpen className="w-7 h-7 sm:w-9 sm:h-9" />,
      bgColor: "bg-orange-50 border border-orange-100 text-orange-600 hover:bg-orange-100/70 hover:scale-105",
      href: "/explorar?tipo=cursos",
    },
  ];

  return (
    <div className="w-full bg-white shadow-xl shadow-slate-100 border border-slate-100/80 rounded-2xl p-4 sm:p-5 md:p-6 transition-all duration-300">
      <h3 className="text-[13px] sm:text-base font-extrabold text-[#0F172A] tracking-tight mb-4 text-left">
        Categorías Destacadas
      </h3>
      <div className="grid grid-cols-4 gap-2 sm:gap-4 justify-items-center">
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            href={cat.href}
            className="flex flex-col items-center gap-2 group w-full text-center"
          >
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 ${cat.bgColor}`}
            >
              {cat.icon}
            </div>
            <span className="text-[9.5px] sm:text-xs font-bold text-slate-700 leading-tight group-hover:text-primary transition-colors">
              {cat.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

