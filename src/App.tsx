import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Settings, Mail } from 'lucide-react';
import { Hero } from './components/Hero';
import { QuranicVerseSection, ClosingBlessingAndLogo } from './components/InvitationMessage';
import { MusicControl } from './components/MusicControl';
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
  const [viewState, setViewState] = useState<'thumbnail' | 'opening-video' | 'main'>('main');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isHeroEnded, setIsHeroEnded] = useState(true);
  const openingVideoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function loadData() {
      const dbData = await getWeddingData();
      
      // Ensure working media URLs for music
      if (!dbData.musicUrl || dbData.musicUrl.includes("pixabay.com")) {
        dbData.musicUrl = "https://www.image2url.com/r2/default/audio/1788064469832-bf9b7150-96e8-40a9-aa58-a25cddf491c7.mp3";
      }

      // Ensure royal video card is shown firstly when someone enters the website
      dbData.heroDisplayMode = 'video_with_text';
      
      setData(dbData);
      setViewState('main');
    }
    loadData();
  }, []);

  useEffect(() => {
    if (openingVideoRef.current && data?.openingVideoUrl) {
      openingVideoRef.current.load();
    }
  }, [data?.openingVideoUrl]);

  const handleThumbnailClick = () => {
    if (viewState === 'opening-video') {
      setViewState('main');
      return;
    }

    if (data?.openingVideoUrl) {
      setViewState('opening-video');
      if (openingVideoRef.current) {
        openingVideoRef.current.play().catch((err) => {
          console.error("Video playback failed", err);
          setViewState('main');
        });
      }
    } else {
      setViewState('main');
    }
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

  return (
    <div className={`w-full bg-[#071629] relative mx-auto max-w-md shadow-2xl overflow-hidden sm:my-0 ${viewState !== 'main' ? 'h-[100svh]' : 'min-h-[100svh]'}`}>
      
      {/* Golden Petals Animation: Constant, gentle drifting from top of website */}
      <GoldenPetals />

      {/* Audio player remains mounted across transitions */}
      <MusicControl musicUrl={data.musicUrl} shouldPlay={viewState !== 'thumbnail'} />

      {/* Main Content Flow: Very slight gap between sections */}
      <main className="w-full min-h-[100svh] bg-[#071629] relative overflow-hidden pb-3">
        {/* 1. Hero Section (Royal Video Card with Invitation Details) */}
        <Hero 
          data={data} 
          onVideoEnd={() => setIsHeroEnded(true)}
        />

        {/* 2. Quranic Verse Section ("And We created you in pairs", Surah An-Naba • 78:8) */}
        <QuranicVerseSection data={data} isHeroEnded={isHeroEnded} />

        {/* 3. Scratch Card Section (3 Hearts with Countdown revealed on scratch) */}
        <ScratchCardSection data={data} />

        {/* 4. Venue Section (Unhidden & rearranged just below the scratch card countdown) */}
        <Venue venue={data.venue} />

        {/* 5. Wedding Invitation Blessing Message, Groom & Bride Names, Logo and Closing Message */}
        <ClosingBlessingAndLogo data={data} message={data.invitationMessage} />

        {/* 6. Admin Panel Button & Very Small Advertisement Box at the end of website */}
        <footer className="w-full pt-4 pb-6 px-4 flex flex-col items-center justify-center gap-2.5 bg-[#071629]">
          {/* Small Advertisement Box with WhatsApp */}
          <a 
            href="https://wa.me/919456411569?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20a%20wedding%20invitation%20website" 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-[280px] p-2.5 rounded-xl border border-[#D6B66F]/50 bg-[#102746]/80 text-center opacity-70 hover:opacity-100 transition-opacity duration-300 backdrop-blur-md shadow-soft group cursor-pointer block"
            title="Contact on WhatsApp"
          >
            <p className="text-[10px] font-serif text-[#FFF9E9] tracking-wide leading-tight">
              Website designed &amp; developed with care
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <svg 
                className="w-3.5 h-3.5 text-[#25D366] fill-current" 
                viewBox="0 0 24 24"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span className="text-[11px] font-sans font-semibold text-[#E8CD91] group-hover:text-[#FFF9E9] tracking-wider">
                9456411569
              </span>
            </div>
          </a>

          <Link
            to="/admin"
            className="opacity-40 hover:opacity-100 transition-opacity duration-300 inline-flex items-center gap-1.5 text-[11px] font-serif tracking-wider text-[#A2B5CD] hover:text-[#E8CD91] py-1 px-3 rounded-full hover:bg-[#102746]"
            title="Admin Panel"
            aria-label="Admin Panel"
          >
            <Settings className="w-3.5 h-3.5 text-[#E8CD91]" />
            <span>Admin</span>
          </Link>
        </footer>
      </main>

      {/* Opening Video Overlay (z-[9999]) */}
      {data.openingVideoUrl && (
        <div 
          className={`absolute inset-0 z-[9999] bg-[#071629] flex items-center justify-center ${viewState === 'opening-video' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <video
            ref={openingVideoRef}
            src={data.openingVideoUrl}
            playsInline
            muted
            preload="auto"
            onLoadedData={() => setIsVideoPlaying(true)}
            onTimeUpdate={(e) => {
              if (e.currentTarget.currentTime > 0.1) {
                setIsVideoPlaying(true);
              }
            }}
            onEnded={() => setViewState('main')}
            onClick={() => setViewState('main')}
            className="w-full h-full object-contain cursor-pointer"
          />
        </div>
      )}

      {/* Thumbnail Overlay (z-[9999]) */}
      {data.openingThumbnailUrl && (
        <div 
          className={`absolute inset-0 z-[9999] bg-[#071629] flex items-center justify-center cursor-pointer ${viewState === 'thumbnail' || (viewState === 'opening-video' && !isVideoPlaying) ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={handleThumbnailClick}
        >
          <img 
            src={data.openingThumbnailUrl} 
            alt="Opening" 
            className="w-full h-full object-contain" 
          />
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
