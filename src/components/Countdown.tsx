import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { HeartDivider } from "./HeartDivider";

interface CountdownProps {
  targetDate: string;
  hideTitle?: boolean;
  theme?: 'navy' | 'golden';
}

export function Countdown({ targetDate, hideTitle = false, theme = 'navy' }: CountdownProps) {
  const isGolden = theme === 'golden';
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setIsEnded(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="w-full max-w-md mx-auto pt-2 pb-1 px-2 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full flex flex-col items-center"
      >
        {!hideTitle && (
          <>
            <h3 className={`font-script text-2xl sm:text-3xl ${isGolden ? 'text-[#94691F]' : 'text-[#E8CD91]'} text-center drop-shadow-xs`}>
              Counting Down to Forever
            </h3>
            <HeartDivider />
          </>
        )}

        {!isEnded ? (
          <div className="flex justify-between items-center w-full gap-2 sm:gap-3 px-1 mt-1">
            <TimeUnit value={timeLeft.days} label="DAYS" isGolden={isGolden} />
            <TimeUnit value={timeLeft.hours} label="HOURS" isGolden={isGolden} />
            <TimeUnit value={timeLeft.minutes} label="MINS" isGolden={isGolden} />
            <TimeUnit value={timeLeft.seconds} label="SECS" isGolden={isGolden} />
          </div>
        ) : (
          <div className={`text-center p-4 border border-[#D6B66F] rounded-xl ${isGolden ? 'bg-[#FFFCF4]' : 'bg-[#102746]'} mt-1 shadow-md`}>
            <h3 className={`font-script text-2xl ${isGolden ? 'text-[#94691F]' : 'text-[#E8CD91]'} mb-1`}>Today is the Blessed Day!</h3>
            <p className={`text-[11px] ${isGolden ? 'text-[#142C4C]' : 'text-[#FFF9E9]'} uppercase tracking-widest font-semibold`}>Let the celebration begin</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function TimeUnit({ value, label, isGolden }: { value: number; label: string; isGolden: boolean }) {
  const formattedValue = value.toString().padStart(2, "0");
  
  return (
    <div className="flex flex-col items-center w-1/4">
      <div className={`w-full aspect-square ${
        isGolden 
          ? 'bg-[#FFFCF4] border-2 border-[#D6B66F] shadow-sm' 
          : 'bg-[#102746] border border-[#D6B66F] shadow-soft'
      } rounded-xl flex items-center justify-center mb-1 transition-transform hover:scale-105`}>
        <span className={`font-serif font-bold text-lg sm:text-2xl ${isGolden ? 'text-[#142C4C]' : 'text-[#FFF9E9]'}`}>
          {formattedValue}
        </span>
      </div>
      <span className={`text-[9px] sm:text-[10px] uppercase tracking-widest ${isGolden ? 'text-[#B88635]' : 'text-[#D6B66F]'} font-bold`}>
        {label}
      </span>
    </div>
  );
}
