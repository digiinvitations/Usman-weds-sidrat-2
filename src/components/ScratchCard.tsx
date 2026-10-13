import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { generateIcsFile } from "../utils";
import { WeddingData } from "../types";
import { Calendar, Heart } from "lucide-react";
import { Countdown } from "./Countdown";
import confetti from "canvas-confetti";

interface ScratchCardProps {
  data: WeddingData;
  onReveal?: () => void;
}

const heartMaskStyle: React.CSSProperties = {
  WebkitMaskImage: `url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDIxLjM1bC0xLjQ1LTEuMzJDNS40IDE1LjM2IDIgMTIuMjggMiA4LjUgMiA1LjQyIDQuNDIgMyA3LjUgM2MxLjc0IDAgMy40MS44MSA0LjUgMi4wOUMxMy4wOSAzLjgxIDE0Ljc2IDMgMTYuNSAzIDE5LjU4IDMgMjIgNS40MiAyMiA4LjVjMCAzLjc4LTMuNCA2Ljg2LTguNTUgMTEuNTRMMTIgMjEuMzV6IiBmaWxsPSJibGFjayIvPjwvc3ZnPg==")`,
  WebkitMaskSize: "contain",
  WebkitMaskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskImage: `url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDIxLjM1bC0xLjQ1LTEuMzJDNS40IDE1LjM2IDIgMTIuMjggMiA4LjUgMiA1LjQyIDQuNDIgMyA3LjUgM2MxLjc0IDAgMy40MS44MSA0LjUgMi4wOUMxMy4wOSAzLjgxIDE0Ljc2IDMgMTYuNSAzIDE5LjU4IDMgMjIgNS40MiAyMiA4LjVjMCAzLjc4LTMuNCA2Ljg2LTguNTUgMTEuNTRMMTIgMjEuMzV6IiBmaWxsPSJibGFjayIvPjwvc3ZnPg==")`,
  maskSize: "contain",
  maskPosition: "center",
  maskRepeat: "no-repeat"
};

interface HeartItem {
  key: "date" | "month" | "year";
  label: string;
  value: string;
}

export function ScratchCardSection({ data, onReveal }: ScratchCardProps) {
  // Parse wedding date into separate Date, Month, Year parts (no timing, no day)
  const dateObj = new Date(data.weddingDate || "2026-11-15T11:30");
  const dayNumber = !isNaN(dateObj.getTime()) ? dateObj.getDate().toString() : "15";
  const monthName = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase()
    : "NOV";
  const yearNumber = !isNaN(dateObj.getTime()) ? dateObj.getFullYear().toString() : "2026";

  const heartItems: HeartItem[] = [
    { key: "date", label: "DATE", value: dayNumber },
    { key: "month", label: "MONTH", value: monthName },
    { key: "year", label: "YEAR", value: yearNumber }
  ];

  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const canvasRef3 = useRef<HTMLCanvasElement>(null);

  const [rev1, setRev1] = useState(false);
  const [rev2, setRev2] = useState(false);
  const [rev3, setRev3] = useState(false);
  const [activeHeart, setActiveHeart] = useState<number | null>(null);

  const allRevealed = rev1 && rev2 && rev3;

  // Initialize and draw gold glitter scratch layer on a canvas
  const drawGoldGlitterLayer = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Multi-tone ornamental gold gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#E6B84A");
    gradient.addColorStop(0.35, "#B87919");
    gradient.addColorStop(0.68, "#D9B875");
    gradient.addColorStop(1, "#98520C");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Fine sparkling gold glitter particles
    const sparkleColors = [
      "rgba(255, 255, 255, 0.95)",
      "rgba(230, 184, 74, 0.95)",
      "rgba(217, 184, 117, 0.9)",
      "rgba(255, 249, 233, 0.85)"
    ];

    for (let i = 0; i < 4500; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.fillStyle = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
      ctx.fillRect(rx, ry, Math.random() * 1.5 + 0.5, Math.random() * 1.5 + 0.5);
    }

    // Luminous diamond and gold star sparkles
    for (let i = 0; i < 120; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.fillStyle = Math.random() > 0.4 ? "rgba(255, 255, 255, 1)" : "rgba(230, 184, 74, 1)";
      ctx.beginPath();
      ctx.arc(rx, ry, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    const size = 110;
    [canvasRef1.current, canvasRef2.current, canvasRef3.current].forEach(canvas => {
      if (canvas) {
        canvas.width = size;
        canvas.height = size;
        drawGoldGlitterLayer(canvas);
      }
    });
  }, [drawGoldGlitterLayer]);

  // Scratch interaction handler for individual heart
  const handleScratch = (
    e: React.MouseEvent | React.TouchEvent,
    heartIndex: number
  ) => {
    const isTouch = "touches" in e;
    const canvas =
      heartIndex === 0
        ? canvasRef1.current
        : heartIndex === 1
        ? canvasRef2.current
        : canvasRef3.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = isTouch ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouch ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();

    checkIndividualReveal(canvas, heartIndex);
  };

  const checkIndividualReveal = (canvas: HTMLCanvasElement, heartIndex: number) => {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Check central area of the heart
    const sampleSize = 55;
    const startX = (canvas.width - sampleSize) / 2;
    const startY = (canvas.height - sampleSize) / 2;

    const imgData = ctx.getImageData(startX, startY, sampleSize, sampleSize);
    const dataArr = imgData.data;
    let transparent = 0;
    const total = dataArr.length / 4;

    for (let i = 3; i < dataArr.length; i += 4) {
      if (dataArr[i] === 0) transparent++;
    }

    const percentage = (transparent / total) * 100;
    if (percentage > 25) {
      if (heartIndex === 0 && !rev1) setRev1(true);
      if (heartIndex === 1 && !rev2) setRev2(true);
      if (heartIndex === 2 && !rev3) setRev3(true);
    }
  };

  // Trigger celebration when all three are scratched
  useEffect(() => {
    if (rev1 && rev2 && rev3) {
      const goldPalette = ["#B87919", "#98520C", "#E6B84A", "#D9B875", "#FFF9E9"];
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 },
        colors: goldPalette
      });
      if (onReveal) {
        onReveal();
      }
    }
  }, [rev1, rev2, rev3, onReveal]);

  return (
    <section className="pt-4 pb-4 px-3 bg-[#071629] text-[#FFF9E9] flex flex-col items-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md flex flex-col items-center"
      >
        {/* Section Header */}
        <h2 className="font-script text-3xl sm:text-4xl text-[#E8CD91] text-center drop-shadow-sm">
          Scratch to Reveal
        </h2>

        <div className="flex items-center justify-center w-full gap-3 mt-1.5 mb-3">
          <div className="h-[1px] w-10 bg-[#D6B66F]"></div>
          <Heart className="w-3.5 h-3.5 text-[#E8CD91] fill-[#E8CD91] opacity-90" />
          <div className="h-[1px] w-10 bg-[#D6B66F]"></div>
        </div>

        {/* 3 HEARTS IN PERFECT STRAIGHT HORIZONTAL ALIGNMENT */}
        <div className="flex flex-row justify-center items-center gap-2 sm:gap-3 w-full max-w-sm px-1">
          {heartItems.map((item, index) => {
            const isItemRevealed =
              index === 0 ? rev1 : index === 1 ? rev2 : rev3;
            const currentCanvasRef =
              index === 0
                ? canvasRef1
                : index === 1
                ? canvasRef2
                : canvasRef3;

            return (
              <div
                key={item.key}
                className="relative flex-1 max-w-[105px] aspect-square transition-transform"
                style={heartMaskStyle}
              >
                {/* Revealed Heart Content Underneath */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1.5 bg-[#102746] border border-[#D6B66F] select-none shadow-soft">
                  <div className="flex flex-col items-center justify-center mt-1">
                    <span className="text-[9px] font-serif uppercase tracking-widest text-[#D6B66F] font-bold">
                      {item.label}
                    </span>
                    <span className="font-names font-extrabold text-xl sm:text-2xl text-[#FFF9E9] tracking-wide mt-0.5 leading-none">
                      {item.value}
                    </span>
                  </div>
                </div>

                {/* Golden Glitter Canvas Layer on Top */}
                <canvas
                  ref={currentCanvasRef}
                  className={`absolute inset-0 w-full h-full z-10 cursor-crosshair transition-opacity duration-700 ${
                    isItemRevealed ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                  onMouseDown={() => setActiveHeart(index)}
                  onMouseUp={() => setActiveHeart(null)}
                  onMouseLeave={() => setActiveHeart(null)}
                  onMouseMove={(e) => {
                    if (activeHeart === index && !isItemRevealed) {
                      handleScratch(e, index);
                    }
                  }}
                  onTouchStart={() => setActiveHeart(index)}
                  onTouchEnd={() => setActiveHeart(null)}
                  onTouchMove={(e) => {
                    if (!isItemRevealed) {
                      handleScratch(e, index);
                    }
                  }}
                  onClick={() => {
                    // Tap-to-scratch assistance
                    if (index === 0 && !rev1) setRev1(true);
                    if (index === 1 && !rev2) setRev2(true);
                    if (index === 2 && !rev3) setRev3(true);
                  }}
                  style={{ touchAction: "none" }}
                />
              </div>
            );
          })}
        </div>

        {/* Status prompt */}
        {!allRevealed && (
          <p className="text-[11px] text-[#A2B5CD] font-serif italic mt-2.5 text-center">
            Scratch all 3 hearts to reveal the Nikah date & start countdown
          </p>
        )}

        {/* COUNTDOWN STARTS SHOWING JUST BELOW THE 3 HEARTS WHEN ALL SCRATCHED */}
        <AnimatePresence>
          {allRevealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full mt-1"
            >
              <Countdown targetDate={data.weddingDate} hideTitle={false} />

              {/* Save The Date Button */}
              <div className="flex flex-col items-center mt-3 mb-1">
                <button
                  onClick={() => generateIcsFile(data)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full font-serif uppercase tracking-widest text-[11px] transition-all font-semibold bg-gradient-to-r from-[#102746] via-[#19385D] to-[#102746] text-[#E8CD91] shadow-lg hover:brightness-110 active:scale-95 border border-[#D6B66F] cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#E8CD91]" />
                  Save The Date
                </button>
                <p className="text-[9px] uppercase tracking-widest text-[#A2B5CD] mt-2 font-semibold">
                  Add this event to your calendar
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
