import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowDown } from "lucide-react";
import { WeddingData } from "../types";

interface HeroProps {
  data: WeddingData;
  shouldPlayVideo?: boolean;
  onVideoEnd?: () => void;
  onToggleDisplayMode?: (mode: "video_with_text" | "photo") => void;
}

export function Hero({ data, onVideoEnd }: HeroProps) {
  // Royal video card with text is the default presentation
  const [displayMode, setDisplayMode] = useState<"video_with_text" | "photo">(
    data.heroDisplayMode || "video_with_text"
  );
  // Controls visibility of text & shading: hidden for first 3 seconds of video, then revealed
  const [isRevealed, setIsRevealed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (data.heroDisplayMode) {
      setDisplayMode(data.heroDisplayMode);
    }
  }, [data.heroDisplayMode]);

  useEffect(() => {
    if (onVideoEnd) {
      onVideoEnd();
    }
  }, [onVideoEnd]);

  // Reveal shading and text after 3 seconds of background video playback
  useEffect(() => {
    if (displayMode === "video_with_text") {
      setIsRevealed(false);
      const timer = setTimeout(() => {
        setIsRevealed(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsRevealed(true);
    }
  }, [displayMode]);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (e.currentTarget.currentTime >= 3 && !isRevealed) {
      setIsRevealed(true);
    }
  };

  const heroPhoto =
    data.heroImageUrl ||
    data.openingThumbnailUrl ||
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop";

  const heroVideo =
    data.heroVideoUrl ||
    "https://www.image2url.com/r2/default/videos/1788011182513-3d74480d-c3ef-41df-926f-d21988765de3.mp4";

  // Data fields with requested defaults
  const invitationBy = data.heroInvitationBy || "Dr. Abdul Majeed";
  const invitationMessage =
    data.heroInvitationMessage ||
    "Cordially invites you to join for lunch\non the auspicious occasion of the";
  const mainHeading = data.heroHeading || "Nikah Ceremony";
  const occasionDetails = data.heroOccasionDetails || "Of His Beloved Grandson";
  const groomName = data.groom?.name || "Usman bin Khalid";
  const groomFather = data.heroGroomFather || data.groom?.parents || "S/o Mr. Khalid Majeed";
  const brideName = data.bride?.name || "Sidrat Shafiq Khan";
  const brideFather = data.heroBrideFather || data.bride?.parents || "D/o Mr. Mohammad Shafiq Khan";
  const brideAddress = data.heroBrideAddress || "R/o Al Farooq Colony, Sanat Nagar";
  const blessingMessage =
    data.heroBlessingMessage ||
    "Your gracious presence and blessings\nwill make the occasion even more special.";
  const guestInfo = data.heroGuestInfo || "1 Gents & 1 Ladies";

  return (
    <section 
      onClick={() => { if (!isRevealed) setIsRevealed(true); }}
      className="relative min-h-[100svh] w-full flex flex-col items-center justify-between overflow-hidden bg-[#071629] text-[#FFF9E9]"
    >

      <AnimatePresence mode="wait">
        {displayMode === "video_with_text" ? (
          /* ========================================================================= */
          /* 1. ACTUAL SECTION WITH TEXT & BACKGROUND VIDEO (BORDER-FREE, SLIGHT SHADE)*/
          /* ========================================================================= */
          <motion.div
            key="video-with-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full min-h-[100svh] flex flex-col items-center justify-between overflow-hidden px-4 pt-6 pb-20"
          >
            {/* Background Video: plays once and freezes at the end */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <video
                ref={videoRef}
                src={heroVideo}
                autoPlay
                muted
                playsInline
                preload="auto"
                loop={false}
                onEnded={() => {
                  if (videoRef.current) {
                    videoRef.current.pause();
                    try {
                      if (videoRef.current.duration) {
                        videoRef.current.currentTime = videoRef.current.duration;
                      }
                    } catch {
                      // ignore
                    }
                  }
                  if (!isRevealed) setIsRevealed(true);
                  if (onVideoEnd) onVideoEnd();
                }}
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-cover object-center scale-105"
              />

              {/* Light Royal Navy Gradient Shading: appears smoothly after 3 seconds of video */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isRevealed ? 1 : 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0 bg-gradient-to-b from-[#071629]/55 via-[#102746]/40 to-[#071629]/70 pointer-events-none" 
              />

              {/* Slight Warm Gold Ambient Shading to match website color theme */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isRevealed ? 1 : 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,134,53,0.14)_0%,transparent_75%)] pointer-events-none" 
              />

              {/* Downward shading equal in colour & capacity to the message section upward shading */}
              <div 
                className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-[#071629]/75 to-[#071629] pointer-events-none z-10" 
              />
            </div>

            {/* Note: NO BORDER on hero section as requested */}

            {/* Main Content Area: Smoothly reveals after 3 seconds of background video */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ 
                opacity: isRevealed ? 1 : 0,
                y: isRevealed ? 0 : 15
              }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className={`relative z-20 w-full max-w-sm mx-auto flex flex-col items-center text-center justify-between flex-1 py-4 transition-all ${
                isRevealed ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              
              {/* Header: Bismillah Emblem */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#E8CD91]" />
                  <span
                    className="text-[#E8CD91] text-lg sm:text-xl font-bold tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                    style={{ fontFamily: "'Amiri', serif" }}
                  >
                    ﷽
                  </span>
                  <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#E8CD91]" />
                </div>
              </div>

              {/* Invitation By Section */}
              <div className="my-1.5">
                <span className="block text-[10px] font-sans font-bold uppercase tracking-[0.28em] text-[#D6B66F] mb-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  Invitation By
                </span>
                <h2 
                  className="text-xl sm:text-2xl font-bold text-[#E8CD91] tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                  style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}
                >
                  {invitationBy}
                </h2>
                <p className="text-xs sm:text-[13px] text-[#FFF9E9] italic font-serif leading-relaxed mt-1 whitespace-pre-line max-w-[270px] mx-auto drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {invitationMessage}
                </p>
              </div>

              {/* Main Heading & Occasion Details */}
              <div className="my-2 flex flex-col items-center w-full">
                {/* Gold Arch Divider */}
                <div className="flex items-center justify-center gap-2 mb-1.5 w-full">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#D6B66F]/80" />
                  <div className="w-1.5 h-1.5 rotate-45 bg-[#E8CD91]" />
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#D6B66F]/80" />
                </div>

                <h1 
                  className="text-2xl sm:text-3xl font-extrabold uppercase tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-r from-[#E8CD91] via-[#FFFDF7] to-[#D6B66F] drop-shadow-[0_3px_8px_rgba(0,0,0,0.95)]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {mainHeading}
                </h1>

                <span className="inline-block text-[11px] sm:text-xs font-serif italic tracking-[0.18em] text-[#E8CD91] mt-1 font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {occasionDetails}
                </span>

                <div className="flex items-center justify-center gap-2 mt-1.5 w-full">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#D6B66F]/80" />
                  <div className="w-1.5 h-1.5 rotate-45 bg-[#E8CD91]" />
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#D6B66F]/80" />
                </div>
              </div>

              {/* Couple: Groom & Bride Details */}
              <div className="my-1.5 w-full space-y-2">
                {/* Groom */}
                <div className="flex flex-col items-center">
                  <h3 
                    className="text-xl sm:text-2xl font-bold text-[#FFF9E9] tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {groomName}
                  </h3>
                  <p className="text-xs text-[#E8CD91] font-serif italic mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {groomFather}
                  </p>
                </div>

                {/* Symmetrical Ornamental "weds" */}
                <div className="flex items-center justify-center gap-3 my-1">
                  <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D6B66F]" />
                  <span 
                    className="text-lg font-script text-[#E8CD91] px-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                  >
                    weds
                  </span>
                  <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D6B66F]" />
                </div>

                {/* Bride */}
                <div className="flex flex-col items-center">
                  <h3 
                    className="text-xl sm:text-2xl font-bold text-[#FFF9E9] tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {brideName}
                  </h3>
                  <p className="text-xs text-[#E8CD91] font-serif italic mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {brideFather}
                  </p>
                  <p className="text-[11px] text-[#D6B66F] font-sans tracking-normal mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {brideAddress}
                  </p>
                </div>
              </div>

              {/* Blessing Message */}
              <div className="my-1 px-2">
                <p className="text-[11px] sm:text-xs text-[#FFF9E9] italic font-serif leading-relaxed whitespace-pre-line max-w-[280px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  "{blessingMessage}"
                </p>
              </div>

              {/* Guest Information Badge */}
              <div className="my-1.5">
                <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-[#94691F] via-[#D6B66F] to-[#94691F] text-[#071629] font-sans font-bold text-[11px] tracking-widest uppercase shadow-md border border-[#E8CD91]">
                  <span>{guestInfo}</span>
                </div>
              </div>

              {/* Floating Scroll Down Indicator (Elevated upper to the shading for high visibility) */}
              <div className="mt-4 mb-4 relative z-40 flex flex-col items-center justify-center pointer-events-auto">
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const el = document.getElementById("quranic-message-section");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    } else {
                      window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
                    }
                  }}
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="w-10 h-10 rounded-full bg-[#102746]/95 hover:bg-[#19385D] backdrop-blur-md border border-[#E8CD91] flex items-center justify-center text-[#E8CD91] shadow-[0_4px_16px_rgba(0,0,0,0.6)] cursor-pointer transition-all active:scale-95"
                  title="Scroll to Invitation Message"
                  aria-label="Scroll to Invitation Message"
                >
                  <ArrowDown className="w-4 h-4 text-[#E8CD91]" strokeWidth={2.5} />
                </motion.button>
              </div>

            </motion.div>
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* 2. PHOTO ONLY HERO SECTION WITH AMBIENT MOTION                            */
          /* ========================================================================= */
          <motion.div
            key="photo-only"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full min-h-[100svh] flex flex-col items-center justify-between overflow-hidden bg-[#071629]"
          >
            {/* Full Hero Photo with ambient animation */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-[#071629]">
              <motion.div
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ 
                  opacity: 1, 
                  scale: [1, 1.03, 1] 
                }}
                transition={{
                  opacity: { duration: 1.2, ease: "easeOut" },
                  scale: { duration: 14, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-full h-full"
              >
                <img
                  src={heroPhoto}
                  alt="Wedding Celebration"
                  className="w-full h-full object-cover object-center"
                />
              </motion.div>

              {/* Subtle top vignette & bottom transition shade matching message section */}
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-b from-transparent via-[#071629]/75 to-[#071629] pointer-events-none z-10" />
            </div>

            {/* Spacer */}
            <div className="relative z-10 w-full pt-8" />

            {/* Animated Floating Scroll Indicator (Elevated upper to shading for high visibility) */}
            <div className="relative z-20 mb-8 flex flex-col items-center justify-center pointer-events-auto">
              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const el = document.getElementById("quranic-message-section");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
                  }
                }}
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="w-10 h-10 rounded-full bg-[#102746]/95 hover:bg-[#19385D] backdrop-blur-md border border-[#E8CD91] flex items-center justify-center text-[#E8CD91] shadow-[0_4px_16px_rgba(0,0,0,0.6)] cursor-pointer transition-all active:scale-95"
                title="Scroll to Invitation Message"
                aria-label="Scroll to Invitation Message"
              >
                <ArrowDown className="w-4 h-4 text-[#E8CD91]" strokeWidth={2.5} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
