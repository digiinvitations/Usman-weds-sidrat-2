import { Heart } from "lucide-react";

export function HeartDivider() {
  return (
    <div className="flex items-center justify-center gap-3 py-1.5 opacity-90">
      <div className="h-[1px] w-10 bg-[#D6B66F]"></div>
      <Heart className="w-3.5 h-3.5 text-[#E8CD91] fill-[#E8CD91]" />
      <div className="h-[1px] w-10 bg-[#D6B66F]"></div>
    </div>
  );
}
