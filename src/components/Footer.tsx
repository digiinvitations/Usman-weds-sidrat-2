import { Heart, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { WeddingData } from "../types";

interface FooterProps {
  data: WeddingData;
}

export function Footer({ data }: FooterProps) {
  return (
    <footer className="py-12 bg-blush-light border-t border-pink-border flex flex-col items-center text-center px-4 relative">
      <h4 className="font-names text-xl sm:text-2xl font-bold text-[#98520C] mb-3 tracking-wide drop-shadow-2xs">
        {data.groom.name} <span className="text-[#B87919] font-normal italic">&amp;</span> {data.bride.name}
      </h4>
      
      <div className="flex items-center gap-2 opacity-60 mb-8">
        <div className="w-8 h-[1px] bg-wine-dark"></div>
        <Heart className="w-3 h-3 text-wine-dark fill-wine-dark" />
        <div className="w-8 h-[1px] bg-wine-dark"></div>
      </div>
      


      <Link 
        to="/admin" 
        className="absolute bottom-4 right-4 opacity-10 hover:opacity-100 transition-opacity p-2 text-wine-dark"
        title="Admin Panel"
      >
        <Settings className="w-4 h-4" />
      </Link>
    </footer>
  );
}
