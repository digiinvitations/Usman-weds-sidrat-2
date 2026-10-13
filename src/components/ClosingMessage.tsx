import { motion } from "motion/react";
import { WeddingData } from "../types";

interface ClosingMessageProps {
  data: WeddingData;
}

export function ClosingMessage({ data }: ClosingMessageProps) {
  return (
    <section className="py-24 px-6 bg-[#071629] text-[#FFF9E9] relative overflow-hidden flex flex-col items-center justify-center text-center">
      
      {/* Top Decorative Wavy Line */}
      <div className="w-full max-w-sm mx-auto mb-10 flex justify-center opacity-80">
        <svg width="200" height="30" viewBox="0 0 200 30" preserveAspectRatio="none">
          <path d="M 0 15 Q 50 15 100 25 T 200 15" fill="none" stroke="#D6B66F" strokeWidth="0.8" />
          <circle cx="100" cy="18" r="1.5" fill="#E8CD91" />
          <circle cx="92" cy="22" r="1" fill="#D6B66F" />
          <circle cx="108" cy="22" r="1" fill="#D6B66F" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="max-w-md mx-auto flex flex-col items-center relative z-10"
      >
        <p className="font-serif text-lg md:text-xl text-[#FFF9E9] leading-relaxed drop-shadow-sm mb-8 whitespace-pre-line px-4">
          {data.closingMessage}
        </p>
        
        <h3 className="font-names text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#E8CD91] mt-4 tracking-wide drop-shadow-sm">
          {data.groom.name} <span className="text-[#D6B66F] font-normal italic">&amp;</span> {data.bride.name}
        </h3>
      </motion.div>

      {/* Bottom Decorative Wavy Line */}
      <div className="w-full max-w-sm mx-auto mt-12 flex justify-center opacity-80">
        <svg width="200" height="30" viewBox="0 0 200 30" preserveAspectRatio="none">
          <path d="M 0 15 Q 50 15 100 5 T 200 15" fill="none" stroke="#D6B66F" strokeWidth="0.8" />
          <circle cx="100" cy="12" r="1.5" fill="#E8CD91" />
          <circle cx="92" cy="8" r="1" fill="#D6B66F" />
          <circle cx="108" cy="8" r="1" fill="#D6B66F" />
        </svg>
      </div>
    </section>
  );
}
