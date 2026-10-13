import { motion } from "motion/react";
import { WeddingData } from "../types";

interface SectionProps {
  data?: WeddingData;
  message?: string;
  isHeroEnded?: boolean;
  theme?: 'navy' | 'golden';
}

/**
 * 1. Quranic Verse Section ("And We created you in pairs", Surah An-Naba • 78:8)
 * Rendered directly below Hero and above Scratch Card.
 */
export function QuranicVerseSection({ data, theme = 'navy' }: SectionProps) {
  const isGolden = theme === 'golden';
  const quranicArabic = data?.quranicVerse?.arabic || "وَخَلَقْنَـٰكُمْ\nأَزْوَٰجًۭا";
  const quranicTranslation = data?.quranicVerse?.translation || "And We created you in pairs";

  return (
    <section 
      id="quranic-message-section"
      className={`relative px-4 pt-20 pb-8 ${isGolden ? 'bg-[#FFF9E9] text-[#142C4C]' : 'bg-[#071629] text-[#FFF9E9]'} flex flex-col items-center text-center overflow-hidden transition-colors duration-500`}
    >
      {/* Soft upward blend matching the decreased hero downside shading */}
      <div 
        className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${
          isGolden ? 'from-[#FFF9E9]/65 via-[#FFF9E9]/30 to-transparent' : 'from-[#071629]/65 via-[#071629]/30 to-transparent'
        } pointer-events-none z-0`} 
      />
      {/* Soft warm gold ambient glow centered behind verse */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,134,53,0.12)_0%,transparent_75%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
        className="max-w-md mx-auto flex flex-col items-center relative z-10 w-full"
      >
        {/* Top Decorative Motif in Ornamental Gold */}
        <div className="flex items-center justify-center w-full gap-3 mb-2">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#E8CD91] to-[#B88635]" />
          <span className={`text-xs font-serif tracking-widest font-semibold ${isGolden ? 'text-[#94691F]' : 'text-[#E8CD91]'}`}>﷽</span>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent via-[#E8CD91] to-[#B88635]" />
        </div>

        {/* QURANIC VERSE */}
        <div className="flex flex-col items-center px-2">
          <p 
            dir="rtl" 
            className={`font-serif text-2xl md:text-3xl ${
              isGolden ? 'text-[#94691F] drop-shadow-[0_1px_3px_rgba(184,134,53,0.2)]' : 'text-[#E8CD91] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]'
            } font-bold leading-relaxed whitespace-pre-line tracking-wide`}
            style={{ fontFamily: "'Amiri', 'Cormorant Garamond', serif" }}
          >
            {quranicArabic}
          </p>
          <p className={`font-serif italic text-sm md:text-base ${isGolden ? 'text-[#142C4C]' : 'text-[#FFF9E9]'} mt-2 tracking-wide font-medium drop-shadow-xs`}>
            "{quranicTranslation}"
          </p>
          <span className={`text-[10px] uppercase font-serif tracking-[0.25em] ${isGolden ? 'text-[#B88635]' : 'text-[#D6B66F]'} mt-1 font-semibold`}>
            Surah An-Naba • 78:8
          </span>
        </div>

        {/* Bottom subtle divider to transition into Scratch Card */}
        <div className="flex items-center justify-center w-full gap-3 mt-4">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D6B66F]" />
          <div className={`w-1.5 h-1.5 rotate-45 ${isGolden ? 'bg-[#94691F]' : 'bg-[#E8CD91]'}`} />
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D6B66F]" />
        </div>
      </motion.div>
    </section>
  );
}

/**
 * 2. Message Section, Couple Names, Logo & Closing Message at the End of Website
 * Concludes with Groom & Bride names, couple's monogram logo, and closing message line.
 */
export function ClosingBlessingAndLogo({ data, message, theme = 'navy' }: SectionProps) {
  const isGolden = theme === 'golden';
  const customText = data?.customText || "(JM)";
  const invitationMsg = message || data?.invitationMessage || "بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ\nMay Allah bless you and send blessings upon you. and bring goodness between you.";

  const lines = invitationMsg.split("\n");
  const arabicLine = lines[0] || "بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ";
  const englishLine = lines.slice(1).join("\n") || "May Allah bless you and send blessings upon you. and bring goodness between you.";

  const groomName = data?.groom?.name || "A.Jubair Ali";
  const brideName = data?.bride?.name || "M.Mugsina Safreen";

  const defaultClosingPrayer = "May Allah bless this union with eternal love, harmony, and happiness.\nPlease remember us in your precious prayers.";
  const closingLine = data?.closingMessage || defaultClosingPrayer;

  return (
    <section className={`relative px-4 pt-4 pb-4 ${isGolden ? 'bg-[#FFF9E9] text-[#142C4C]' : 'bg-[#071629] text-[#FFF9E9]'} flex flex-col items-center text-center transition-colors duration-500`}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
        className="max-w-md mx-auto flex flex-col items-center relative z-10 w-full"
      >
        {/* Top Divider */}
        <div className="flex items-center justify-center w-full gap-3 mb-3">
          <div className="h-[1px] w-14 bg-gradient-to-r from-transparent via-[#D6B66F] to-[#B88635]" />
          <div className={`w-1.5 h-1.5 rotate-45 ${isGolden ? 'bg-[#94691F]' : 'bg-[#E8CD91]'}`} />
          <div className="h-[1px] w-14 bg-gradient-to-l from-transparent via-[#D6B66F] to-[#B88635]" />
        </div>

        {/* WEDDING INVITATION BLESSING MESSAGE */}
        <div className="flex flex-col items-center px-2 mb-3">
          <p 
            dir="rtl" 
            className={`font-serif text-lg md:text-xl ${
              isGolden ? 'text-[#94691F]' : 'text-[#E8CD91]'
            } font-bold leading-relaxed tracking-wide mb-1.5 drop-shadow-xs`}
            style={{ fontFamily: "'Amiri', 'Cormorant Garamond', serif" }}
          >
            {arabicLine}
          </p>
          <p className={`font-serif text-xs md:text-sm ${isGolden ? 'text-[#43536A]' : 'text-[#FFF9E9]/90'} leading-relaxed italic max-w-sm whitespace-pre-line`}>
            {englishLine}
          </p>
        </div>

        {/* GROOM AND BRIDE NAMES AT END OF WEBSITE */}
        <div className={`w-full max-w-xs my-2.5 px-4 py-3.5 rounded-2xl ${
          isGolden 
            ? 'bg-[#FFFCF4] border-2 border-[#D6B66F] shadow-md' 
            : 'bg-[#102746]/85 border border-[#D6B66F]/70 shadow-soft'
        } backdrop-blur-md flex flex-col items-center`}>
          <span className={`text-[9px] uppercase font-serif tracking-[0.25em] ${isGolden ? 'text-[#94691F]' : 'text-[#D6B66F]'} font-bold mb-1`}>
            The Blessed Union Of
          </span>
          <div className="flex flex-col items-center text-center">
            <span className={`font-serif font-bold text-base sm:text-lg ${isGolden ? 'text-[#142C4C]' : 'text-[#FFF9E9]'} tracking-wide`}>
              {groomName}
            </span>
            <span className={`font-serif text-[11px] ${isGolden ? 'text-[#B88635]' : 'text-[#D6B66F]'} italic my-0.5`}>
              (Groom)
            </span>
            <span className={`font-script text-xl ${isGolden ? 'text-[#94691F]' : 'text-[#E8CD91]'} my-0.5`}>&amp;</span>
            <span className={`font-serif font-bold text-base sm:text-lg ${isGolden ? 'text-[#142C4C]' : 'text-[#FFF9E9]'} tracking-wide`}>
              {brideName}
            </span>
            <span className={`font-serif text-[11px] ${isGolden ? 'text-[#B88635]' : 'text-[#D6B66F]'} italic mt-0.5`}>
              (Bride)
            </span>
          </div>
        </div>

        {/* Divider before Signature Logo */}
        <div className="flex items-center justify-center w-full gap-3 my-2">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D6B66F]" />
          <div className={`w-1.5 h-1.5 rotate-45 ${isGolden ? 'bg-[#94691F]' : 'bg-[#E8CD91]'}`} />
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D6B66F]" />
        </div>

        {/* CUSTOM LOGO / MONOGRAM AT END OF WEBSITE */}
        <div className="flex items-center justify-center my-2">
          {data?.jmLogoUrl ? (
            <div className="relative flex items-center justify-center p-1 group w-full">
              <img 
                src={data.jmLogoUrl} 
                alt="Monogram Logo" 
                style={{
                  height: `${data.logoSize || 180}px`,
                  maxHeight: `${data.logoSize || 180}px`,
                  maxWidth: "100%",
                  width: "auto"
                }}
                className="object-contain drop-shadow-sm transition-all duration-300 group-hover:scale-105" 
              />
            </div>
          ) : (
            <div className={`relative px-8 py-3 rounded-full border ${
              isGolden ? 'border-[#D6B66F] bg-[#FFFCF4] shadow-md' : 'border-[#D6B66F]/70 bg-[#102746]/85 shadow-soft'
            } flex items-center justify-center backdrop-blur-md`}>
              <span className={`font-serif text-3xl sm:text-4xl font-bold tracking-[0.2em] ${isGolden ? 'text-[#94691F]' : 'text-[#E8CD91]'}`}>
                {customText}
              </span>
            </div>
          )}
        </div>

        {/* SMALL CLOSING MESSAGE LINE JUST BELOW THE LOGO IN THE END */}
        {closingLine && (
          <p className={`font-serif italic text-xs sm:text-sm ${isGolden ? 'text-[#43536A]' : 'text-[#FFF9E9]/90'} text-center max-w-xs mt-2 leading-relaxed whitespace-pre-line px-2`}>
            {closingLine}
          </p>
        )}

        {/* Bottom Decorative Motif */}
        <div className="flex items-center justify-center w-full gap-3 mt-3">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#D6B66F] to-[#B88635]" />
          <div className={`w-1.5 h-1.5 rotate-45 ${isGolden ? 'bg-[#94691F]' : 'bg-[#E8CD91]'}`} />
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent via-[#D6B66F] to-[#B88635]" />
        </div>
      </motion.div>
    </section>
  );
}

// Default export for backwards compatibility
export function InvitationMessage(props: SectionProps) {
  return (
    <>
      <QuranicVerseSection {...props} />
      <ClosingBlessingAndLogo {...props} />
    </>
  );
}
