import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Volume2, VolumeX } from "lucide-react";

export interface MusicControlHandle {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  isPlaying: () => boolean;
}

interface MusicControlProps {
  musicUrl: string;
  shouldPlay?: boolean;
  theme?: 'navy' | 'golden';
  forceVisible?: boolean;
}

export const MusicControl = forwardRef<MusicControlHandle, MusicControlProps>(function MusicControl(
  { musicUrl, shouldPlay = false, theme = 'navy', forceVisible = false },
  ref
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStartedAuto, setHasStartedAuto] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (!musicUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(musicUrl);
      audioRef.current.loop = true;
    } else {
      audioRef.current.src = musicUrl;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
    };
  }, [musicUrl]);

  // Imperative handle for parent to start playback directly on user gesture (e.g., thumbnail click)
  useImperativeHandle(ref, () => ({
    play: () => {
      if (!audioRef.current && musicUrl) {
        audioRef.current = new Audio(musicUrl);
        audioRef.current.loop = true;
      }
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setHasStartedAuto(true);
          })
          .catch((err) => {
            console.log("Audio play error", err);
          });
      }
    },
    pause: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    },
    toggle: () => {
      togglePlay();
    },
    isPlaying: () => isPlaying
  }));

  // Auto-play when shouldPlay becomes true
  useEffect(() => {
    if (shouldPlay && !hasStartedAuto && audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setHasStartedAuto(true);
        })
        .catch((err) => {
          console.log("Autoplay blocked by browser", err);
        });
    }
  }, [shouldPlay, hasStartedAuto]);

  const togglePlay = () => {
    if (!audioRef.current && musicUrl) {
      audioRef.current = new Audio(musicUrl);
      audioRef.current.loop = true;
    }
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setHasStartedAuto(true);
          })
          .catch(e => console.error("Playback failed", e));
      }
    }
  };

  // The music button should be visible when forceVisible is true, or when in main view
  const isButtonVisible = forceVisible || shouldPlay || isPlaying;

  if (!isButtonVisible) return null;

  const isGolden = theme === 'golden';

  return (
    <button
      onClick={togglePlay}
      className={`fixed top-6 right-6 z-50 p-2.5 sm:p-3 rounded-full backdrop-blur-md shadow-soft border transition-all active:scale-95 cursor-pointer ${
        isGolden
          ? 'bg-[#FFF9E9]/90 border-[#D6B66F] hover:bg-[#F5EBD2] text-[#94691F]'
          : 'bg-[#071629]/85 border-[#D6B66F]/60 hover:bg-[#102746] text-[#E8CD91]'
      }`}
      aria-label={isPlaying ? "Mute music" : "Play music"}
      title={isPlaying ? "Mute wedding music" : "Play wedding music"}
    >
      {isPlaying ? (
        <Volume2 className={`w-5 h-5 ${isGolden ? 'text-[#94691F]' : 'text-[#E8CD91]'}`} />
      ) : (
        <VolumeX className={`w-5 h-5 ${isGolden ? 'text-[#94691F]/50' : 'text-[#E8CD91]/60'}`} />
      )}
    </button>
  );
});
