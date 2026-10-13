import React, { useMemo } from "react";

interface PetalConfig {
  id: number;
  left: number;       // percentage 0 - 100
  size: number;       // width in px
  duration: number;   // fall duration in seconds
  delay: number;      // animation delay in seconds
  swayDuration: number;
  rotationSpeed: number;
  opacity: number;
  variant: number;    // 0, 1, or 2 for petal SVG path & tone
}

export function GoldenPetals() {
  // Slightly low in quantity: 15 graceful petals constantly falling
  const petals = useMemo<PetalConfig[]>(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.floor(Math.random() * 12) + 16, // 16px - 28px
      duration: Math.random() * 6 + 8,           // 8s - 14s
      delay: Math.random() * 12 - 12,            // negative delay so petals are already falling immediately
      swayDuration: Math.random() * 3 + 3,       // 3s - 6s sway
      rotationSpeed: Math.random() * 6 + 6,      // 6s - 12s tumble
      opacity: Math.random() * 0.35 + 0.65,      // 0.65 - 1.0 opacity
      variant: i % 3
    }));
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden" 
      aria-hidden="true"
    >
      <style>{`
        @keyframes petalFall {
          0% {
            transform: translate3d(0, -60px, 0);
          }
          100% {
            transform: translate3d(0, 105vh, 0);
          }
        }
        @keyframes petalSway {
          0%, 100% {
            transform: translateX(-18px) rotate(-15deg);
          }
          50% {
            transform: translateX(18px) rotate(15deg);
          }
        }
        @keyframes petalFlip {
          0% {
            transform: rotateZ(0deg) rotateY(0deg);
          }
          50% {
            transform: rotateZ(180deg) rotateY(180deg) scale(0.85);
          }
          100% {
            transform: rotateZ(360deg) rotateY(360deg);
          }
        }
      `}</style>

      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute top-0"
          style={{
            left: `${petal.left}%`,
            width: `${petal.size}px`,
            height: `${petal.size * 1.3}px`,
            animation: `petalFall ${petal.duration}s linear infinite`,
            animationDelay: `${petal.delay}s`,
            willChange: "transform"
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              animation: `petalSway ${petal.swayDuration}s ease-in-out infinite`,
              willChange: "transform"
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                animation: `petalFlip ${petal.rotationSpeed}s ease-in-out infinite`,
                opacity: petal.opacity,
                filter: "drop-shadow(0 2px 4px rgba(184, 121, 25, 0.35))",
                willChange: "transform"
              }}
            >
              {/* Golden Petal Curved SVG with Radiant Gold Gradients */}
              <svg
                viewBox="0 0 30 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id={`goldGrad-${petal.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF9E9" stopOpacity="0.9" />
                    <stop offset="25%" stopColor="#E6B84A" />
                    <stop offset="65%" stopColor="#B87919" />
                    <stop offset="100%" stopColor="#98520C" />
                  </linearGradient>
                  <linearGradient id={`goldShine-${petal.id}`} x1="30%" y1="0%" x2="70%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#E6B84A" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#B87919" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {petal.variant === 0 ? (
                  // Classic curved almond petal
                  <>
                    <path
                      d="M15 2 C25 8, 29 24, 15 38 C1 24, 5 8, 15 2 Z"
                      fill={`url(#goldGrad-${petal.id})`}
                    />
                    <path
                      d="M15 4 C21 10, 23 22, 15 34 C11 22, 13 10, 15 4 Z"
                      fill={`url(#goldShine-${petal.id})`}
                    />
                    <path
                      d="M15 6 Q16 20 15 35"
                      stroke="#E6B84A"
                      strokeWidth="0.75"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                  </>
                ) : petal.variant === 1 ? (
                  // Soft rounded rose petal
                  <>
                    <path
                      d="M15 3 C27 5, 30 22, 16 37 C2 23, 3 5, 15 3 Z"
                      fill={`url(#goldGrad-${petal.id})`}
                    />
                    <path
                      d="M14 6 C23 9, 25 20, 15 33 C7 21, 9 9, 14 6 Z"
                      fill={`url(#goldShine-${petal.id})`}
                    />
                  </>
                ) : (
                  // Delicate elongated curved petal
                  <>
                    <path
                      d="M14 2 C23 7, 27 26, 14 39 C3 25, 6 8, 14 2 Z"
                      fill={`url(#goldGrad-${petal.id})`}
                    />
                    <path
                      d="M14 5 C19 11, 21 24, 14 35 C9 24, 11 11, 14 5 Z"
                      fill={`url(#goldShine-${petal.id})`}
                    />
                    <path
                      d="M14 7 Q15 22 14 36"
                      stroke="#FFFFFF"
                      strokeWidth="0.5"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                  </>
                )}
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
