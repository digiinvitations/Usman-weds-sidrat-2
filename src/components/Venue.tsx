import { motion } from "motion/react";
import { HeartDivider } from "./HeartDivider";
import { VenueDetails } from "../types";
import { MapPin } from "lucide-react";

interface VenueProps {
  venue?: VenueDetails;
  theme?: 'navy' | 'golden';
}

export function Venue({ venue, theme = 'navy' }: VenueProps) {
  const isGolden = theme === 'golden';
  const venueData = venue || {
    name: "Sangamithirai Mahal",
    addressLine1: "Tamil Nadu",
    addressLine2: "",
    mapUrl: "https://maps.app.goo.gl/5PMTJDV85ZLAe9xr8?g_st=ac"
  };

  return (
    <section className={`pt-4 pb-4 px-4 ${isGolden ? 'bg-[#FFF9E9] text-[#142C4C]' : 'bg-[#071629] text-[#FFF9E9]'} flex flex-col items-center overflow-hidden transition-colors duration-500`}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md flex flex-col items-center text-center relative"
      >
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          isGolden ? 'bg-[#FFFCF4] border-2 border-[#D6B66F] shadow-sm' : 'bg-[#102746] border border-[#D6B66F] shadow-xs'
        } mb-1.5`}>
          <MapPin className={`w-4 h-4 ${isGolden ? 'text-[#94691F]' : 'text-[#E8CD91]'}`} strokeWidth={2} />
        </div>
        
        <h2 className={`font-script text-3xl sm:text-4xl ${isGolden ? 'text-[#94691F]' : 'text-[#E8CD91]'} drop-shadow-xs`}>
          Venue
        </h2>
        
        <HeartDivider />

        <div className="flex flex-col items-center relative z-10 -mt-1 mb-2">
          <h3 className={`font-serif font-bold text-lg sm:text-xl ${isGolden ? 'text-[#142C4C]' : 'text-[#FFF9E9]'} mb-1`}>
            {venueData.name}
          </h3>
          <p className={`${isGolden ? 'text-[#43536A]' : 'text-[#E0E7F1]'} text-xs sm:text-sm opacity-90 max-w-[280px] leading-relaxed`}>
            {venueData.addressLine1}
            {venueData.addressLine2 && (
              <>
                <br />
                {venueData.addressLine2}
              </>
            )}
          </p>
        </div>

        {/* Minimal Islamic palace line art motif in ornamental gold */}
        <div className="w-full max-w-[240px] h-20 my-2 opacity-50 flex items-end justify-center pointer-events-none">
          <svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full ${isGolden ? 'stroke-[#94691F]' : 'stroke-[#E8CD91]'}`} strokeWidth="1.2">
            <path d="M100 10C115 10 125 25 125 45V90H75V45C75 25 85 10 100 10Z" />
            <path d="M40 50C48 50 55 58 55 70V90H25V70C25 58 32 50 40 50Z" />
            <path d="M160 50C168 50 175 58 175 70V90H145V70C145 58 152 50 160 50Z" />
            <line x1="0" y1="90" x2="200" y2="90" />
            <path d="M90 90V65C90 60 94 55 100 55C106 55 110 60 110 65V90" />
            <line x1="25" y1="35" x2="25" y2="50" />
            <line x1="175" y1="35" x2="175" y2="50" />
            <circle cx="25" cy="32" r="3" />
            <circle cx="175" cy="32" r="3" />
            <circle cx="100" cy="5" r="4" />
          </svg>
        </div>

        {venueData.mapUrl && (
          <a 
            href={venueData.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 ${
              isGolden
                ? 'bg-gradient-to-r from-[#B88635] via-[#D6B66F] to-[#B88635] text-[#FFF9E9] shadow-md hover:brightness-105 border border-[#E8CD91]'
                : 'bg-gradient-to-r from-[#102746] via-[#19385D] to-[#102746] text-[#E8CD91] shadow-md hover:brightness-110 border border-[#D6B66F]'
            } px-6 py-2.5 rounded-full font-serif text-xs uppercase tracking-widest font-semibold active:scale-95 transition-all mt-1 cursor-pointer`}
          >
            <MapPin className={`w-3.5 h-3.5 ${isGolden ? 'text-[#FFF9E9]' : 'text-[#E8CD91]'}`} />
            View on Google Maps
          </a>
        )}

      </motion.div>
    </section>
  );
}
