"use client";

import React from "react";
import { Star } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  role: string;
  location: string;
  text: string;
  stars: number;
}

export default function TestimonialSlider() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Valentina G.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      role: "Estudia Arquitectura",
      location: "Medellín",
      text: "Gracias a RutaEdu encontré la carrera perfecta y una beca que hizo posible mi sueño.",
      stars: 5,
    },
    {
      id: 2,
      name: "Andrés M.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
      role: "Estudia Ingeniería de Sistemas",
      location: "Bogotá",
      text: "El test vocacional me abrió los ojos. Hoy estudio lo que realmente me apasiona.",
      stars: 5,
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Testimonials List (Side-by-Side on all screens) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-white border border-slate-100/90 rounded-2xl p-3 sm:p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex gap-2 items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-8 h-8 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-100 flex-shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] sm:text-[13px] font-extrabold text-[#0F172A] leading-tight truncate">
                    {testimonial.name}
                  </span>
                  <span className="text-[7.5px] sm:text-[9.5px] text-[#64748B] font-medium leading-tight mt-0.5 truncate">
                    {testimonial.role}
                  </span>
                  <span className="text-[7.5px] sm:text-[9.5px] text-[#64748B] font-medium leading-none">
                    en <span className="text-[#0F766E] font-bold">{testimonial.location}</span>
                  </span>
                </div>
              </div>

              <p className="text-[8px] sm:text-xs text-[#334155] leading-normal font-medium mt-2.5">
                "{testimonial.text}"
              </p>
            </div>

            <div className="flex gap-0.5 mt-2.5">
              {[...Array(testimonial.stars)].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination indicators under the cards */}
      <div className="flex justify-center gap-1.5 pt-1">
        <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
        <span className="w-2 h-2 rounded-full bg-slate-200" />
        <span className="w-2 h-2 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}
