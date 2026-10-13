import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Hero } from './components/Hero';
import { QuranicVerseSection, ClosingBlessingAndLogo } from './components/InvitationMessage';
import { MusicControl, MusicControlHandle } from './components/MusicControl';
import { ScratchCardSection } from './components/ScratchCard';
import { Venue } from './components/Venue';
import { GoldenPetals } from './components/GoldenPetals';
import { getWeddingData } from './services/db';
import { WeddingData } from './types';
import { AdminPanel } from './components/AdminPanel';
import { Preloader } from './components/Preloader';

function PublicView() {
  const [data, setData] = useState<WeddingData | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);
  const [viewState, setViewState] = useState<'thumbnail' | 'opening-video' | 'main'>('thumbnail');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isHeroEnded, setIsHeroEnded] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  // Theme state: allows recovering earlier Golden Theme or staying in Royal Navy Blue
  const [theme, setTheme] = useState<'navy' | 'golden'>(() => {
    const saved = localStorage.getItem('wedding_theme');
    if (saved === 'golden' || saved === 'navy') return saved;
    return 'navy';
  });

  const openingVideoRef = useRef<HTMLVideoElement>(null);
  const musicControlRef = useRef<MusicControlHandle>(null);

  useEffect(() => {
    async function loadData() {
      const dbData = await getWeddingData();
      
      // Ensure working media URLs for music
      if (!dbData.musicUrl || dbData.musicUrl.includes("pixabay.com")) {
        dbData.musicUrl = "https://www.image2url.com/r2/default/audio/1788064469832-bf9b7150-96e8-40a9-aa58-a25cddf491c7.mp3";
      }

      // Default to video_with_text only if not set, respecting photo mode chosen in admin panel
      if (!dbData.heroDisplayMode) {
        dbData.heroDisplayMode = 'video_with_text';
      }
      
      // Respect colorTheme set by admin
      if (dbData.colorTheme) {
        setTheme(dbData.colorTheme);
        localStorage.setItem('wedding_theme', dbData.colorTheme);
      }

      setData(dbData);

      // Determine initial view: Opening Thumbnail -> Opening Video -> Main
      if (dbData.openingThumbnailUrl) {
        setViewState('thumbnail');
      } else if (dbData.openingVideoUrl) {
        setViewState('opening-video');
      } else {
        setViewState('main');
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (openingVideoRef.current && data?.openingVideoUrl) {
      openingVideoRef.current.load();
    }
  }, [data?.openingVideoUrl]);

  /**
   * User clicks anywhere on the opening video thumbnail:
   * 1. Music starts playing IMMEDIATELY on this user gesture
   * 2. Opening video starts playing
   */
  const handleThumbnailClick = () => {
    // Start background music immediately on user gesture
    if (musicControlRef.current) {
      musicControlRef.current.play();
    }
    setIsMusicPlaying(true);

    if (viewState === 'opening-video') {
      setViewState('main');
      return;
    }

    if (data?.openingVideoUrl) {
      setViewState('opening-video');
      setIsVideoPlaying(false);
      if (openingVideoRef.current) {
        openingVideoRef.current.currentTime = 0;
        // Keep opening video muted so background music plays crystal clear without audio clashing
        openingVideoRef.current.muted = true;
        const playPromise = openingVideoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsVideoPlaying(true);
            })
            .catch((err) => {
              console.error("Video playback failed", err);
              setViewState('main');
            });
        }
      }
    } else {
      setViewState('main');
    }
  };

  const handleVideoOverlayClick = () => {
    // If music hasn't started yet, ensure it starts
    if (musicControlRef.current) {
      musicControlRef.current.play();
    }
    setIsMusicPlaying(true);
    setViewState('main');
  };



  useEffect(() => {
    if (data?.ogImageUrl) {
      const updateOrCreateMeta = (selector: string, attrName: string, attrVal: string, contentVal: string) => {
        let el = document.querySelector(selector);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attrName, attrVal);
          document.head.appendChild(el);
        }
        el.setAttribute('content', contentVal);
      };

      updateOrCreateMeta('meta[property="og:image"]', 'property', 'og:image', data.ogImageUrl);
      updateOrCreateMeta('meta[property="og:image:secure_url"]', 'property', 'og:image:secure_url', data.ogImageUrl);
      updateOrCreateMeta('meta[name="twitter:image"]', 'name', 'twitter:image', data.ogImageUrl);
      updateOrCreateMeta('meta[itemprop="image"]', 'itemprop', 'image', data.ogImageUrl);

      let linkImg = document.querySelector('link[rel="image_src"]');
      if (!linkImg) {
        linkImg = document.createElement('link');
        linkImg.setAttribute('rel', 'image_src');
        document.head.appendChild(linkImg);
      }
      linkImg.setAttribute('href', data.ogImageUrl);
    }
  }, [data]);

  if (!data) {
    return <div className="min-h-screen bg-[#071629] flex items-center justify-center font-serif text-[#E8CD91]">Loading...</div>;
  }

  if (isPreloading) {
    return <Preloader data={data} onComplete={() => setIsPreloading(false)} />;
  }

  const isGolden = theme === 'golden';

  return (
    <div className={`w-full ${isGolden ? 'bg-[#FFF9E9]' : 'bg-[#071629]'} relative mx-auto max-w-md shadow-2xl overflow-hidden sm:my-0 ${viewState !== 'main' ? 'h-[100svh]' : 'min-h-[100svh]'} transition-colors duration-500`}>
      
      {/* Golden Petals Animation: Constant, gentle drifting from top of website */}
      <GoldenPetals />

      {/* Audio player remains mounted across transitions */}
      <MusicControl 
        ref={musicControlRef} 
        musicUrl={data.musicUrl} 
        shouldPlay={isMusicPlaying || viewState === 'main'} 
        theme={theme}
      />



      {/* Main Content Flow: Seamless transition between sections */}
      <main className={`w-full min-h-[100svh] ${isGolden ? 'bg-[#FFF9E9]' : 'bg-[#071629]'} relative overflow-hidden pb-3 transition-colors duration-500`}>
        {/* 1. Hero Section (Royal Video Card with Invitation Details) */}
        <Hero 
          data={data} 
          shouldPlayVideo={viewState === 'main'}
          onVideoEnd={() => setIsHeroEnded(true)}
          theme={theme}
        />

        {/* 2. Quranic Verse Section ("And We created you in pairs", Surah An-Naba • 78:8) */}
        <QuranicVerseSection data={data} isHeroEnded={isHeroEnded} theme={theme} />

        {/* 3. Scratch Card Section (3 Hearts with Countdown revealed on scratch) */}
        <ScratchCardSection data={data} theme={theme} />

        {/* 4. Venue Section (Unhidden & rearranged just below the scratch card countdown) */}
        <Venue venue={data.venue} theme={theme} />

        {/* 5. Wedding Invitation Blessing Message, Groom & Bride Names, Logo and Closing Message */}
        <ClosingBlessingAndLogo data={data} message={data.invitationMessage} theme={theme} />

        {/* 6. Subtle Admin Link Footer (No advertisement, no theme switcher) */}
        <footer className={`w-full pt-4 pb-8 px-4 flex flex-col items-center justify-center ${isGolden ? 'bg-[#FFF9E9]' : 'bg-[#071629]'} transition-colors duration-500`}>
          <Link
            to="/admin"
            className={`opacity-40 hover:opacity-100 transition-opacity duration-300 inline-flex items-center gap-1.5 text-[11px] font-serif tracking-wider ${
              isGolden ? 'text-[#77766F] hover:text-[#94691F] hover:bg-[#F5EBD2]' : 'text-[#A2B5CD] hover:text-[#E8CD91] hover:bg-[#102746]'
            } py-1.5 px-3 rounded-full`}
            title="Admin Panel"
            aria-label="Admin Panel"
          >
            <Settings className={`w-3.5 h-3.5 ${isGolden ? 'text-[#94691F]' : 'text-[#E8CD91]'}`} />
            <span>Admin</span>
          </Link>
        </footer>
      </main>

      {/* Opening Video Overlay (z-[9998]) */}
      {data.openingVideoUrl && (
        <div 
          className={`absolute inset-0 z-[9998] bg-[#071629] flex items-center justify-center transition-opacity duration-500 ease-in-out ${viewState === 'opening-video' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={handleVideoOverlayClick}
        >
          <video
            ref={openingVideoRef}
            src={data.openingVideoUrl}
            playsInline
            preload="auto"
            muted
            onLoadedData={() => {
              if (viewState === 'opening-video') setIsVideoPlaying(true);
            }}
            onPlaying={() => setIsVideoPlaying(true)}
            onEnded={() => setViewState('main')}
            className="w-full h-full object-contain cursor-pointer"
          />
          {/* Skip button for seamless navigation */}
          {viewState === 'opening-video' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVideoOverlayClick();
              }}
              className="absolute top-4 right-4 z-[10000] px-3.5 py-1.5 rounded-full bg-[#071629]/80 border border-[#D6B66F]/60 text-[11px] font-serif text-[#FFF9E9] hover:bg-[#102746] backdrop-blur-md transition-all shadow-md cursor-pointer"
            >
              Skip &rarr;
            </button>
          )}
        </div>
      )}

      {/* Thumbnail Overlay (z-[9999]) - Clicking anywhere starts background music and plays video */}
      {data.openingThumbnailUrl && (
        <div 
          className={`absolute inset-0 z-[9999] bg-[#071629] flex flex-col items-center justify-center cursor-pointer transition-opacity duration-700 ease-in-out ${viewState === 'thumbnail' || (viewState === 'opening-video' && !isVideoPlaying) ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={handleThumbnailClick}
        >
          <img 
            src={data.openingThumbnailUrl} 
            alt="Opening Invitation" 
            className="w-full h-full object-contain" 
          />
          {viewState === 'thumbnail' && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-[#071629]/85 border border-[#D6B66F]/60 backdrop-blur-md shadow-2xl flex items-center gap-2.5 pointer-events-none animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#E8CD91] animate-ping" />
              <span className="text-[11px] font-serif tracking-[0.2em] uppercase text-[#FFF9E9] font-medium">
                Tap to Open Invitation
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicView />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}
