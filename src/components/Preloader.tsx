import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { WeddingData } from '../types';

interface PreloaderProps {
  data: WeddingData;
  onComplete: () => void;
}

export function Preloader({ data, onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const loadAssets = async () => {
      const assets: { type: 'image' | 'media'; url: string }[] = [];

      // Collect all critical assets
      if (data.openingThumbnailUrl) assets.push({ type: 'image', url: data.openingThumbnailUrl });
      if (data.openingVideoUrl) assets.push({ type: 'media', url: data.openingVideoUrl });
      if (data.heroVideoUrl) assets.push({ type: 'media', url: data.heroVideoUrl });
      if (data.jmLogoUrl) assets.push({ type: 'image', url: data.jmLogoUrl });
      if (data.ogImageUrl) assets.push({ type: 'image', url: data.ogImageUrl });
      if (data.musicUrl) assets.push({ type: 'media', url: data.musicUrl });
      
      if (data.events) {
        data.events.forEach(e => {
           if (e.videoUrl) assets.push({ type: 'media', url: e.videoUrl });
           if (e.image) assets.push({ type: 'image', url: e.image });
        });
      }

      if (data.gallery) {
        data.gallery.forEach(img => assets.push({ type: 'image', url: img }));
      }

      // Deduplicate by URL
      const uniqueAssets = Array.from(new Set(assets.map(a => a.url)))
        .map(url => assets.find(a => a.url === url)!);

      const total = uniqueAssets.length;
      if (total === 0) {
        onComplete();
        return;
      }

      let loadedCount = 0;
      const updateProgress = () => {
        loadedCount++;
        if (isMounted) {
          setProgress(Math.round((loadedCount / total) * 100));
        }
      };

      const promises = uniqueAssets.map(asset => {
        return new Promise<void>((resolve) => {
          let isHandled = false;
          const markAssetReady = () => {
            if (!isHandled) {
              isHandled = true;
              updateProgress();
              resolve();
            }
          };

          if (asset.type === 'image') {
            const img = new Image();
            img.onload = markAssetReady;
            img.onerror = markAssetReady;
            img.src = asset.url;
            if (img.complete) {
              markAssetReady();
            }
          } else {
            // Preload media through browser native video engine so chunks & keyframes are ready in cache
            const video = document.createElement('video');
            video.preload = 'auto';
            video.muted = true;
            video.playsInline = true;
            video.onloadeddata = markAssetReady;
            video.oncanplay = markAssetReady;
            video.onerror = markAssetReady;
            video.src = asset.url;
            video.load();

            // Also trigger background fetch for HTTP cache
            try {
              fetch(asset.url, { mode: 'no-cors' }).catch(() => {});
            } catch (e) {}

            // Safety limit per media item to guarantee UI never gets stuck
            setTimeout(markAssetReady, 3500);
          }
        });
      });

      // Timeout after 12 seconds max to avoid freezing on slow connections
      const timeout = new Promise<void>(resolve => setTimeout(resolve, 12000));

      await Promise.race([Promise.all(promises), timeout]);

      if (isMounted) {
        setProgress(100);
        setTimeout(() => {
          if (isMounted) onComplete();
        }, 800); // Brief pause at 100% so it looks complete
      }
    };

    loadAssets();
    return () => { isMounted = false; };
  }, [data, onComplete]);

  return (
    <div className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-[#071629] px-6 text-[#FFF9E9]">
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="mb-8"
      >
        <Heart className="w-12 h-12 text-[#E8CD91] fill-[#E8CD91] opacity-90 drop-shadow-[0_0_15px_rgba(232,205,145,0.4)]" />
      </motion.div>
      <div className="w-full max-w-xs">
        <div className="h-1.5 w-full bg-[#102746] rounded-full overflow-hidden border border-[#D6B66F]/40">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#102746] via-[#B88635] to-[#E8CD91]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-center text-[#E8CD91] font-serif text-[11px] uppercase tracking-widest mt-4 font-semibold opacity-90">
          {progress < 100 ? `Preparing Memories... ${progress}%` : "Ready"}
        </p>
      </div>
    </div>
  );
}
