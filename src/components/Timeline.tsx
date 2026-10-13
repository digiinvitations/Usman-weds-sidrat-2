import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { HeartDivider } from "./HeartDivider";
import { EventDetails } from "../types";
import { Calendar, Clock, MapPin, CalendarHeart } from "lucide-react";

interface TimelineProps {
  events: EventDetails[];
}

// Custom Blooming Lotus SVG Component
function LotusGlyph({ className = "w-5 h-5", color = "#B88635" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer Petals */}
      <path d="M50 20 C42 35 30 55 15 65 C30 70 42 66 50 60 Z" fill={color} opacity="0.75" />
      <path d="M50 20 C58 35 70 55 85 65 C70 70 58 66 50 60 Z" fill={color} opacity="0.75" />
      {/* Mid Petals */}
      <path d="M50 15 C44 32 35 52 24 62 C38 65 46 62 50 56 Z" fill={color} opacity="0.88" />
      <path d="M50 15 C56 32 65 52 76 62 C62 65 54 62 50 56 Z" fill={color} opacity="0.88" />
      {/* Center Petal */}
      <path d="M50 8 C43 25 43 45 50 62 C57 45 57 25 50 8 Z" fill={color} />
      {/* Base */}
      <path d="M22 68 C35 74 65 74 78 68 C72 73 50 76 22 68 Z" fill={color} opacity="0.9" />
      <circle cx="50" cy="58" r="3" fill="#FFF9E9" />
    </svg>
  );
}

// Systematic Date Parser
function formatSystematicDate(dateStr: string) {
  if (dateStr && dateStr.includes("-")) {
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3) {
      const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
      const formatted = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
      const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });
      return { formatted, weekday };
    }
  }
  return { formatted: dateStr, weekday: "" };
}

export function Timeline({ events }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll tracking across the timeline section for the sliding lotus
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "end 75%"]
  });

  // Smooth physics for fluid lotus sliding down the central line
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 18,
    restDelta: 0.001
  });

  // Calculate sliding lotus vertical position along the central vertical line (0% to ~97%)
  const lotusTop = useTransform(smoothProgress, [0, 1], ["0%", "96%"]);
  const filledLineHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  if (!events || events.length === 0) return null;

  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`).getTime();
    const dateB = new Date(`${b.date} ${b.time}`).getTime();
    if (!isNaN(dateA) && !isNaN(dateB)) return dateA - dateB;
    return a.date.localeCompare(b.date);
  });

  return (
    <section 
      ref={containerRef}
      className="py-16 px-3 sm:px-6 bg-[#071629] text-[#FFF9E9] flex flex-col items-center overflow-hidden relative"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-3xl flex flex-col items-center"
      >
        <CalendarHeart className="w-8 h-8 text-[#E8CD91] mb-4 opacity-90" strokeWidth={1.5} />
        <h2 className="font-script text-4xl text-[#E8CD91] text-center drop-shadow-sm">
          Program Timeline
        </h2>
        
        <HeartDivider />

        <div className="w-full mt-10 relative">
          
          {/* Central Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#D6B66F]/60 transform -translate-x-1/2 z-0" />
          
          {/* Active Progress Fill on Central Line */}
          <motion.div 
            style={{ height: filledLineHeight }}
            className="absolute left-1/2 top-0 w-[2px] bg-gradient-to-b from-[#94691F] via-[#E8CD91] to-[#B88635] transform -translate-x-1/2 origin-top z-0 shadow-[0_0_8px_rgba(184,134,53,0.35)]"
          />

          {/* SLIDING LOTUS: Automatically slides downwards along the central timeline when scrolling */}
          <motion.div
            style={{ top: lotusTop }}
            className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.15, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#102746] border-2 border-[#E8CD91] shadow-[0_0_14px_rgba(184,134,53,0.45)] flex items-center justify-center p-1.5"
            >
              <LotusGlyph className="w-full h-full" color="#E8CD91" />
            </motion.div>
          </motion.div>

          {/* Alternating Small Boxes Layout */}
          {sortedEvents.map((item, index) => {
            const isEven = index % 2 === 0;
            const { formatted: dateDisplay, weekday } = formatSystematicDate(item.date);

            return (
              <motion.div 
                key={item.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: index * 0.1, type: "spring", bounce: 0.25 }}
                className={`mb-10 relative w-full flex flex-row items-start ${isEven ? 'justify-start' : 'justify-end'}`}
              >
                {/* Center marker on line */}
                <div className="absolute left-1/2 top-4 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#102746] border border-[#D6B66F] shadow-xs z-10 p-1">
                  <LotusGlyph className="w-4 h-4" color="#E8CD91" />
                </div>
                
                {/* Given Small Box */}
                <div className={`w-[48%] md:w-[45%] ${isEven ? 'pr-3 sm:pr-8 text-right' : 'pl-3 sm:pl-8 text-left'} relative z-0`}>
                  <div className="bg-[#102746]/90 backdrop-blur-md p-3.5 sm:p-4 rounded-xl md:rounded-2xl border border-[#D6B66F]/60 shadow-soft hover:shadow-md transition-shadow relative">
                    
                    {/* Event Title */}
                    <h3 className="font-names font-bold text-base sm:text-lg text-[#E8CD91] mb-2.5 leading-snug tracking-wide">
                      {item.title}
                    </h3>
                    
                    {/* Systematic Details: Date, Time, Venue */}
                    <div className={`flex flex-col gap-2.5 font-serif text-xs ${isEven ? 'items-end' : 'items-start'}`}>
                      
                      {/* Systematic Date */}
                      <div className={`flex items-center gap-1.5 ${isEven ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                        <Calendar className="w-4 h-4 text-[#E8CD91] shrink-0" />
                        <span className="font-extrabold text-[12.5px] sm:text-[13.5px] tracking-wide text-[#FFF9E9] bg-[#071629] px-2.5 py-1 rounded-md border border-[#D6B66F] shadow-xs inline-block">
                          {dateDisplay} {weekday && `(${weekday})`}
                        </span>
                      </div>

                      {/* Systematic Time */}
                      <div className={`flex items-center gap-1.5 ${isEven ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                        <Clock className="w-3.5 h-3.5 text-[#E8CD91] shrink-0" />
                        <span className="font-bold text-xs sm:text-[13px] text-[#E0E7F1] tracking-wide bg-[#071629]/75 px-2 py-0.5 rounded-md border border-[#D6B66F]/40">
                          {item.time}
                        </span>
                      </div>

                      {/* Systematic Venue */}
                      <div className={`flex items-start gap-1.5 ${isEven ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                        <MapPin className="w-3.5 h-3.5 text-[#E8CD91] shrink-0 mt-0.5" />
                        <span className="font-bold text-xs sm:text-[12.5px] text-[#E0E7F1] break-words leading-tight bg-[#071629]/75 px-2 py-0.5 rounded-md border border-[#D6B66F]/40">
                          {item.location}
                        </span>
                      </div>

                    </div>

                    {/* Description note if present */}
                    {item.description && (
                      <div className="w-full h-px bg-[#D6B66F]/40 my-2" />
                    )}

                    {item.description && (
                      <p className={`text-[11px] sm:text-xs text-[#D6B66F] font-medium leading-relaxed font-serif italic ${isEven ? 'text-right' : 'text-left'}`}>
                        "{item.description}"
                      </p>
                    )}

                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
