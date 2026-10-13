import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  getWeddingData, 
  saveWeddingData, 
  getEnvironmentDocId, 
  getActiveTemplateName,
  isRemix4260Instance,
  ORIGINAL_TEMPLATE_NAME,
  ORIGINAL_SLOT_ID,
  THIS_REMIX_TEMPLATE_NAME,
  THIS_REMIX_SLOT_ID,
  REMIX_PT2_TEMPLATE_NAME,
  REMIX_PT2_SLOT_ID,
  REMIX_PT2_RSVP_COLLECTION,
  UPCOMING_REMIX_TEMPLATE_NAME,
  REMIX_4260_2_TEMPLATE_NAME,
  REMIX_4260_2_SLOT_ID,
  isUpcomingRemixInstance,
  switchToUpcomingRemixSlot,
  switchToCurrentWebsiteSlot,
  setCustomSlotId,
  restoreOfficialMasterData,
  isProtectedOfficialSlot,
  resetToAutomaticSlot,
  recoverUsmanData
} from "../services/db";
import { WeddingData } from "../types";
import { compressImageFile } from "../utils";
import { 
  Save, 
  Image as ImageIcon, 
  ArrowLeft, 
  Download, 
  Upload, 
  FileJson, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Music, 
  Video, 
  Database,
  RefreshCw,
  Plus, 
  Trash2, 
  Users, 
  User, 
  Sparkles, 
  Layers, 
  Lock, 
  Film,
  Camera,
  Palette
} from "lucide-react";

export function AdminPanel() {
  const [data, setData] = useState<WeddingData | null>(null);
  const [saving, setSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [currentSlot, setCurrentSlot] = useState<string>("");
  const [activeTemplate, setActiveTemplate] = useState<string>("");
  const [isRemix, setIsRemix] = useState<boolean>(true);
  const [customSlotInput, setCustomSlotInput] = useState<string>("");
  const [showSlotSettings, setShowSlotSettings] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      const dbData = await getWeddingData();
      setData(dbData);
      setCurrentSlot(getEnvironmentDocId());
      setActiveTemplate(getActiveTemplateName());
      setIsRemix(true);
    }
    loadData();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#071322] flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="bg-[#0C1B30] p-8 rounded-2xl shadow-2xl border border-[#D6B66F]/50 max-w-sm w-full text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#071424] border border-[#D6B66F] flex items-center justify-center text-[#E8CD91]">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#E8CD91] mb-1">Admin Login</h2>
          <p className="text-xs text-slate-300 mb-6">Enter password to manage wedding website</p>
          <input 
            type="password"
            placeholder="Enter Password (4260)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (password === "4260") setIsAuthenticated(true);
                else alert("Incorrect password");
              }
            }}
            className="w-full bg-[#071424] text-white border border-slate-600 rounded-lg px-4 py-2.5 mb-4 text-center focus:outline-none focus:border-[#E8CD91] focus:ring-1 focus:ring-[#E8CD91] placeholder-slate-400 font-sans text-sm"
          />
          <button 
            onClick={() => {
              if (password === "4260") setIsAuthenticated(true);
              else alert("Incorrect password");
            }}
            className="w-full bg-gradient-to-r from-[#D6B66F] via-[#E8CD91] to-[#D6B66F] text-[#071629] py-2.5 rounded-lg font-bold uppercase tracking-wider text-xs hover:brightness-110 transition-all shadow-md cursor-pointer"
          >
            Enter Admin Panel
          </button>
          <Link to="/" className="block mt-4 text-xs text-[#E8CD91] hover:underline font-serif">
            &larr; Return to Website
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#071322] flex items-center justify-center font-sans text-slate-100">
        <div className="p-8 text-center space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto text-[#E8CD91] animate-spin" />
          <p className="text-sm font-semibold text-[#E8CD91]">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  const handleChange = (path: string, value: any) => {
    setData((prev: any) => {
      const updated = { ...prev };
      const keys = path.split('.');
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
          current[keys[i]] = {};
        } else {
          current[keys[i]] = Array.isArray(current[keys[i]]) ? [...current[keys[i]]] : { ...current[keys[i]] };
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  /**
   * 1-Click Switch: Hero Display Mode (Photo Only vs Royal Video Card)
   * Instantly updates state, saves to database, and notifies user.
   */
  const handleSetHeroDisplayMode = async (mode: 'video_with_text' | 'photo') => {
    if (!data) return;
    setSaving(true);
    try {
      const updatedData: WeddingData = { ...data, heroDisplayMode: mode };
      setData(updatedData);
      await saveWeddingData(updatedData);
      alert(
        mode === 'photo'
          ? "📸 Switched to 'Photo Only Mode' in 1 Click!\n\nThe hero section on the website will now show the couple photo with ambient motion."
          : "🎬 Switched to 'Royal Video & Text Card' in 1 Click!\n\nThe hero section on the website will now show the 9:16 Royal Islamic video card with animations."
      );
    } catch (err) {
      console.error("Failed to switch hero mode:", err);
      alert("Failed to switch hero display mode. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /**
   * 1-Click Switch: Website Color Theme (Golden Theme vs Royal Navy Blue)
   * Instantly updates state, saves to database & localStorage, and notifies user.
   */
  const handleSetColorTheme = async (newTheme: 'navy' | 'golden') => {
    if (!data) return;
    setSaving(true);
    try {
      const updatedData: WeddingData = { ...data, colorTheme: newTheme };
      setData(updatedData);
      localStorage.setItem('wedding_theme', newTheme);
      await saveWeddingData(updatedData);
      alert(
        newTheme === 'golden'
          ? "⚜️ Switched to 'Golden Theme' in 1 Click!\n\nAll sections across the website are now recovered into the earlier warm golden & ivory palette."
          : "🌌 Switched to 'Royal Navy Blue Theme' in 1 Click!\n\nAll sections across the website are now set to the royal navy blue & antique gold palette."
      );
    } catch (err) {
      console.error("Failed to switch color theme:", err);
      alert("Failed to switch color theme. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBrotherChange = (index: number, field: 'name' | 'wife' | 'child', value: string) => {
    setData((prev: any) => {
      const family = prev.familyDetails ? { ...prev.familyDetails } : { groomSide: {}, brideSide: {} };
      const groomSide = family.groomSide ? { ...family.groomSide } : {};
      const brothers = groomSide.brothers ? [...groomSide.brothers] : [];
      if (!brothers[index]) {
        brothers[index] = { name: "", wife: "", child: "" };
      } else {
        brothers[index] = { ...brothers[index] };
      }
      brothers[index][field] = value;
      groomSide.brothers = brothers;
      family.groomSide = groomSide;
      return { ...prev, familyDetails: family };
    });
  };

  const addBrother = () => {
    setData((prev: any) => {
      const family = prev.familyDetails ? { ...prev.familyDetails } : { groomSide: {}, brideSide: {} };
      const groomSide = family.groomSide ? { ...family.groomSide } : {};
      const brothers = groomSide.brothers ? [...groomSide.brothers] : [];
      brothers.push({ name: "", wife: "", child: "" });
      groomSide.brothers = brothers;
      family.groomSide = groomSide;
      return { ...prev, familyDetails: family };
    });
  };

  const removeBrother = (index: number) => {
    setData((prev: any) => {
      const family = prev.familyDetails ? { ...prev.familyDetails } : { groomSide: {}, brideSide: {} };
      const groomSide = family.groomSide ? { ...family.groomSide } : {};
      const brothers = groomSide.brothers ? [...groomSide.brothers] : [];
      brothers.splice(index, 1);
      groomSide.brothers = brothers;
      family.groomSide = groomSide;
      return { ...prev, familyDetails: family };
    });
  };

  const handleSisterChange = (index: number, value: string) => {
    setData((prev: any) => {
      const family = prev.familyDetails ? { ...prev.familyDetails } : { groomSide: {}, brideSide: {} };
      const brideSide = family.brideSide ? { ...family.brideSide } : {};
      const sisters = brideSide.sisters ? [...brideSide.sisters] : [];
      sisters[index] = value;
      brideSide.sisters = sisters;
      family.brideSide = brideSide;
      return { ...prev, familyDetails: family };
    });
  };

  const addSister = () => {
    setData((prev: any) => {
      const family = prev.familyDetails ? { ...prev.familyDetails } : { groomSide: {}, brideSide: {} };
      const brideSide = family.brideSide ? { ...family.brideSide } : {};
      const sisters = brideSide.sisters ? [...brideSide.sisters] : [];
      sisters.push("");
      brideSide.sisters = sisters;
      family.brideSide = brideSide;
      return { ...prev, familyDetails: family };
    });
  };

  const removeSister = (index: number) => {
    setData((prev: any) => {
      const family = prev.familyDetails ? { ...prev.familyDetails } : { groomSide: {}, brideSide: {} };
      const brideSide = family.brideSide ? { ...family.brideSide } : {};
      const sisters = brideSide.sisters ? [...brideSide.sisters] : [];
      sisters.splice(index, 1);
      brideSide.sisters = sisters;
      family.brideSide = brideSide;
      return { ...prev, familyDetails: family };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64String = await compressImageFile(file);
      setData((prev: any) => {
        const newGallery = [...(prev.gallery || [])];
        newGallery[index] = base64String;
        return { ...prev, gallery: newGallery };
      });
    } catch (err) {
      console.error("Image processing error", err);
    }
  };

  const handleSingleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64String = await compressImageFile(file);
      handleChange(field, base64String);
    } catch (err) {
      console.error("Image processing error", err);
    }
  };

  const addImage = () => {
    setData((prev: any) => ({
      ...prev,
      gallery: [...(prev.gallery || []), ""]
    }));
  };

  const removeImage = (index: number) => {
    setData((prev: any) => {
      const newGallery = [...(prev.gallery || [])];
      newGallery.splice(index, 1);
      return { ...prev, gallery: newGallery };
    });
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await saveWeddingData(data);
      const activeSlot = getEnvironmentDocId();
      alert(
        `✅ SUCCESS!\n\nAll settings and files have been saved into separate dedicated fields:\n` +
        `• remix_isolated_data (Wedding details, couple, dates, text)\n` +
        `• remix_isolated_files (All uploaded photos, videos, music, logos)\n` +
        `• remix_isolated_events (Event schedule & maps)\n` +
        `• remix_isolated_family (Family details)\n` +
        `• remix_isolated_timeline (Timeline sequence)\n` +
        `• remix_isolated_venue (Venue location)\n\n` +
        `Active Document Slot: ${activeSlot}\n\n` +
        `🔒 Zero Overlap Protection: 100% Guaranteed.`
      );
    } catch (error) {
      console.error(error);
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    try {
      const templateLabel = activeTemplate || ORIGINAL_TEMPLATE_NAME;
      const exportPayload = {
        version: "1.0",
        templateName: templateLabel,
        exportedAt: new Date().toISOString(),
        databaseSlot: getEnvironmentDocId(),
        couple: `${data.groom?.name || "Groom"} & ${data.bride?.name || "Bride"}`,
        data: data
      };
      const jsonString = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const sanitizedName = templateLabel.replace(/[^a-zA-Z0-9_-]/g, "_");
      link.download = `${sanitizedName}_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const importedData: WeddingData = parsed.data && typeof parsed.data === "object" ? parsed.data : parsed;

        if (!importedData || typeof importedData !== "object") {
          throw new Error("Invalid file format. Please provide a valid JSON backup.");
        }
        if (!importedData.groom || !importedData.bride) {
          throw new Error("Missing groom or bride information in the backup file.");
        }

        if (!Array.isArray(importedData.events)) importedData.events = [];
        if (!Array.isArray(importedData.timeline)) importedData.timeline = [];
        if (!Array.isArray(importedData.gallery)) importedData.gallery = [];
        if (!importedData.venue) {
          importedData.venue = { name: "", addressLine1: "", addressLine2: "", mapUrl: "" };
        }

        setData(importedData);

        const shouldAutoSave = window.confirm(
          `Backup loaded successfully for ${importedData.groom?.name || "Groom"} & ${importedData.bride?.name || "Bride"}!\n\n` +
          `Do you want to SAVE this imported data to this website's database now?`
        );

        if (shouldAutoSave) {
          setSaving(true);
          await saveWeddingData(importedData);
          setSaving(false);
          alert("All data and files have been successfully imported and saved to the database!");
        } else {
          alert("Backup data loaded into the Admin Panel! You can make further edits and click 'Save Changes' whenever you are ready.");
        }
      } catch (err: any) {
        console.error("Import error:", err);
        alert("Failed to import file: " + (err.message || "Invalid JSON structure"));
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadAsset = async (url: string, filename: string) => {
    if (!url) return;
    try {
      if (url.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, "_blank");
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const mediaFilesList = [
    { label: "Hero Full Photo (Replacement)", url: data.heroImageUrl, type: "image", filename: "hero_photo.jpg" },
    { label: "Opening Thumbnail", url: data.openingThumbnailUrl, type: "image", filename: "opening_thumbnail.png" },
    { label: "Opening Video", url: data.openingVideoUrl, type: "video", filename: "opening_video.mp4" },
    { label: "Hero Section Video", url: data.heroVideoUrl, type: "video", filename: "hero_video.mp4" },
    { label: "Background Music", url: data.musicUrl, type: "audio", filename: "background_music.mp3" },
    { label: "OG Social Image", url: data.ogImageUrl, type: "image", filename: "social_og_image.jpg" },
    ...(data.events || []).map((ev, i) => ({
      label: `Event ${i + 1} Video (${ev.title || "Untitled"})`,
      url: ev.videoUrl,
      type: "video",
      filename: `event_${i + 1}_video.mp4`
    })),
    ...(data.gallery || []).map((img, i) => ({
      label: `Gallery Image ${i + 1}`,
      url: img,
      type: "image",
      filename: `gallery_${i + 1}.jpg`
    }))
  ].filter(item => Boolean(item.url));

  const handleDownloadAllLinksTxt = () => {
    if (!data) return;
    const lines: string[] = [
      `================================================`,
      `WEDDING ASSET & MEDIA URL BACKUP`,
      `Couple: ${data.groom?.name} & ${data.bride?.name}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Database Slot: ${currentSlot}`,
      `================================================`,
      ``,
      `[HERO FULL PHOTO (REPLACEMENT)]`,
      data.heroImageUrl || "(None)",
      ``,
      `[OPENING THUMBNAIL]`,
      data.openingThumbnailUrl || "(None)",
      ``,
      `[OPENING VIDEO]`,
      data.openingVideoUrl || "(None)",
      ``,
      `[HERO BACKGROUND VIDEO]`,
      data.heroVideoUrl || "(None)",
      ``,
      `[BACKGROUND MUSIC TRACK]`,
      data.musicUrl || "(None)",
      ``,
      `[OG SOCIAL SHARE IMAGE]`,
      data.ogImageUrl || "(None)",
      ``,
      `[EVENTS]`,
      ...(data.events || []).map((ev, i) => 
        `Event ${i + 1}: ${ev.title} (${ev.date || 'No date'})\n  Video: ${ev.videoUrl || 'None'}\n  Map: ${ev.mapUrl || 'None'}`
      ),
      ``,
      `[GALLERY IMAGES]`,
      ...(data.gallery || []).map((img, i) => `Photo ${i + 1}: ${img.startsWith('data:') ? '[Base64 Uploaded Image]' : img}`)
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wedding_media_links_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpdateCustomSlot = () => {
    const trimmed = customSlotInput.trim();
    if (!trimmed) {
      setCustomSlotId("");
      alert("Reset to automatic slot identification.");
    } else {
      if (trimmed === "wedding_data_rl2cohqvo2tuixw5mclqfx-14313311583" || trimmed === "wedding_data_official") {
        alert("Protection Error: Custom slots cannot point to legacy templates. Please provide a distinct slot name.");
        return;
      }
      setCustomSlotId(trimmed);
      alert(`Database slot updated to: ${trimmed}`);
    }
    window.location.reload();
  };

  const handleRestoreOfficial = async () => {
    const isCurrentRemix = isRemix;
    const templateLabel = isCurrentRemix ? REMIX_PT2_TEMPLATE_NAME : ORIGINAL_TEMPLATE_NAME;
    const confirm = window.confirm(
      `Are you sure you want to recover and restore default data for "${templateLabel}"?\n\nThis will restore all default Nikah details, Quranic verse, hero & opening videos, family details, events, and timeline settings for this slot.`
    );
    if (!confirm) return;

    setSaving(true);
    try {
      const restored = await restoreOfficialMasterData();
      setData(restored);
      setCurrentSlot(getEnvironmentDocId());
      alert(`Default template data for "${templateLabel}" successfully restored!`);
    } catch (err) {
      console.error("Failed to restore data:", err);
      alert("Failed to restore data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleUsmanDataRecovery = async () => {
    const confirm = window.confirm(
      "⚡ usman data recovery\n\n" +
      "This will recover and ensure the full wedding data for Usman bin Khalid & Sidrat Shafiq Khan (date, Islamic verse, venue, events, countdown, and settings) and sync it for Vercel hosting.\n\n" +
      "Proceed with data recovery?"
    );
    if (!confirm) return;

    setSaving(true);
    try {
      const recovered = await recoverUsmanData();
      setData(recovered);
      setCurrentSlot(getEnvironmentDocId());
      alert(
        "✅ 'usman data recovery' Completed Successfully!\n\n" +
        "• Groom: Usman bin Khalid\n" +
        "• Bride: Sidrat Shafiq Khan\n" +
        "• Date: November 15, 2026 (Nikah Ceremony)\n" +
        "• Scratch Hearts & Countdown: Activated\n" +
        "• Venue & Islamic Blessings: Synced\n\n" +
        "Your wedding data is now completely saved and recovered for Vercel hosting!"
      );
    } catch (err) {
      console.error("Failed to recover data:", err);
      alert("Failed to recover data. Please check your network and try again.");
    } finally {
      setSaving(false);
    }
  };

  const isCurrentPhotoOnly = data.heroDisplayMode === "photo";
  const isCurrentGoldenTheme = data.colorTheme === "golden";

  return (
    <div className="min-h-screen bg-[#071322] p-3 sm:p-6 lg:p-8 font-sans text-slate-100 antialiased selection:bg-[#E8CD91] selection:text-[#071629]">
      <div className="max-w-5xl mx-auto bg-[#0C1B30] rounded-2xl shadow-2xl p-5 sm:p-8 md:p-10 border border-[#D6B66F]/40 text-slate-100 space-y-8">
        
        {/* Top Header with Navigation & Action Buttons */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pb-6 border-b border-slate-700/80 gap-4">
          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-[#E8CD91] hover:text-white bg-[#13243F] hover:bg-[#1a3258] px-3.5 py-2 rounded-xl border border-slate-700 transition-colors text-xs font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F3E2B8]">Admin Panel</h1>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                <span className="font-semibold text-[#E8CD91]">{activeTemplate || ORIGINAL_TEMPLATE_NAME}</span> &bull; Manage wedding details, media files, and backups
              </p>
            </div>
          </div>

          {/* Action Bar: Export, Import, Usman Data, Save */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Hidden JSON file input */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json,application/json"
              onChange={handleImport}
              className="hidden"
            />

            <button 
              onClick={handleExport}
              type="button"
              className="flex items-center gap-1.5 bg-[#13243F] hover:bg-[#1c355d] text-slate-100 border border-slate-600 px-3 py-2 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
              title="Download full wedding data & media as a JSON file"
            >
              <Download className="w-3.5 h-3.5 text-[#E8CD91]" />
              Export
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="flex items-center gap-1.5 bg-[#13243F] hover:bg-[#1c355d] text-slate-100 border border-slate-600 px-3 py-2 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
              title="Upload and load a wedding JSON backup file"
            >
              <Upload className="w-3.5 h-3.5 text-[#E8CD91]" />
              Import
            </button>

            <button 
              onClick={handleUsmanDataRecovery}
              disabled={saving}
              type="button"
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#B87919] to-[#98520C] text-white px-3 py-2 rounded-lg hover:brightness-110 transition-all text-xs font-bold uppercase tracking-wider shadow-sm disabled:opacity-50 cursor-pointer"
              title="Recover all wedding data for Usman bin Khalid & Sidrat Shafiq Khan"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F3E2B8]" />
              usman recovery
            </button>

            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2 rounded-lg transition-all disabled:opacity-50 text-xs font-bold uppercase tracking-wider shadow-md ml-auto lg:ml-0 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ONE-CLICK QUICK CONTROLS: HERO DISPLAY MODE & WEBSITE COLOR THEME        */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-br from-[#102544] via-[#142C4E] to-[#0D1E38] p-5 sm:p-6 rounded-2xl border-2 border-[#D6B66F] shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/80">
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#F3E2B8] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E8CD91]" />
                1-Click Quick Controls (Theme &amp; Display Mode)
              </h2>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Switch hero presentation and whole-website color palette in one click. Changes save and apply instantly.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold bg-[#071322] text-[#E8CD91] border border-[#D6B66F]/50 px-3 py-1 rounded-full self-start sm:self-center">
              Instant Live Sync
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* CONTROL 1: HERO DISPLAY MODE (Photo Only vs Royal Video Card) */}
            <div className="bg-[#0A182B] p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#E8CD91]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D6B66F]">
                    Hero Display Mode
                  </span>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  isCurrentPhotoOnly 
                    ? 'bg-amber-950 text-amber-300 border-amber-600' 
                    : 'bg-indigo-950 text-indigo-300 border-indigo-600'
                }`}>
                  {isCurrentPhotoOnly ? "Photo Only Mode Active" : "Royal Video Card Active"}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {isCurrentPhotoOnly 
                  ? "Currently displaying the full couple photo with ambient motion. You can switch to the Royal Islamic Video Card anytime."
                  : "Currently displaying the 9:16 Royal Islamic Video Card with ornamental arch, bismillah emblem & invitation text."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSetHeroDisplayMode("photo")}
                  disabled={saving}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    isCurrentPhotoOnly
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-[#071322] border-amber-400 shadow-md font-extrabold ring-2 ring-amber-300/40'
                      : 'bg-[#13243F] hover:bg-[#1c365f] text-slate-200 border-slate-600'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Switch to Photo Only</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetHeroDisplayMode("video_with_text")}
                  disabled={saving}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    !isCurrentPhotoOnly
                      ? 'bg-gradient-to-r from-[#D6B66F] to-[#B88635] text-[#071322] border-[#F3E2B8] shadow-md font-extrabold ring-2 ring-[#E8CD91]/40'
                      : 'bg-[#13243F] hover:bg-[#1c365f] text-slate-200 border-slate-600'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  <span>Royal Video Card</span>
                </button>
              </div>
            </div>

            {/* CONTROL 2: COLOR THEME (Golden Theme vs Royal Navy Blue) */}
            <div className="bg-[#0A182B] p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#E8CD91]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D6B66F]">
                    Website Color Theme
                  </span>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  isCurrentGoldenTheme 
                    ? 'bg-amber-950 text-amber-300 border-amber-600' 
                    : 'bg-blue-950 text-blue-300 border-blue-600'
                }`}>
                  {isCurrentGoldenTheme ? "⚜️ Golden Theme Active" : "🌌 Royal Navy Blue Active"}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {isCurrentGoldenTheme 
                  ? "Recovered earlier Golden Theme (warm ivory, champagne & gold backgrounds across all sections)." 
                  : "Royal Navy Blue Theme active (rich royal navy background with gold accents & ornaments)."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSetColorTheme("golden")}
                  disabled={saving}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    isCurrentGoldenTheme
                      ? 'bg-gradient-to-r from-[#D6B66F] via-[#E8CD91] to-[#D6B66F] text-[#071322] border-[#F3E2B8] shadow-md font-extrabold ring-2 ring-[#E8CD91]/40'
                      : 'bg-[#13243F] hover:bg-[#1c365f] text-slate-200 border-slate-600'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Recover Golden Theme ⚜️</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetColorTheme("navy")}
                  disabled={saving}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    !isCurrentGoldenTheme
                      ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white border-blue-400 shadow-md font-extrabold ring-2 ring-blue-400/40'
                      : 'bg-[#13243F] hover:bg-[#1c365f] text-slate-200 border-slate-600'
                  }`}
                >
                  <span>Royal Navy Blue 🌌</span>
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* REMIX ISOLATION & DATABASE STATUS BANNER */}
        <section className="bg-[#10243E] rounded-xl p-5 border border-slate-700 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-[#0A182B] rounded-lg border border-slate-700 text-[#E8CD91]">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-white text-sm">Remix Data &amp; Files Separation (Zero Overlap Protection)</h3>
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    100% Isolated
                  </span>
                  <span className="bg-[#0A182B] text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#E8CD91]" /> Official Website Untouched
                  </span>
                </div>

                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-sans">
                  <div className="bg-[#081527] p-2.5 rounded-lg border border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Active Document Slot</span>
                    <code className="text-[#E8CD91] font-mono text-[11px] font-semibold break-all">{currentSlot}</code>
                  </div>
                  <div className="bg-[#081527] p-2.5 rounded-lg border border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Separate Storage Fields</span>
                    <code className="text-[#E8CD91] font-mono text-[11px] font-semibold">
                      remix_isolated_data &amp; files
                    </code>
                  </div>
                  <div className="bg-[#081527] p-2.5 rounded-lg border border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Official Website Guard</span>
                    <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-400" /> Strictly Locked &amp; Protected
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-2.5 font-sans leading-relaxed">
                  Every file and piece of data in this remix website is saved into dedicated isolated fields.
                  The official website (<strong className="text-[#E8CD91]">&quot;{ORIGINAL_TEMPLATE_NAME}&quot;</strong>) is protected with strict runtime guardrails.
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setShowSlotSettings(!showSlotSettings)}
              className="text-xs text-[#E8CD91] underline hover:text-white font-sans shrink-0 self-end sm:self-center cursor-pointer"
            >
              {showSlotSettings ? "Hide Advanced Slot Settings" : "Advanced Slot Settings"}
            </button>
          </div>

          {showSlotSettings && (
            <div className="mt-4 pt-4 border-t border-slate-700 font-sans text-xs space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-300 font-medium">Quick Target Switcher:</span>
                <button
                  type="button"
                  onClick={() => { switchToCurrentWebsiteSlot(); window.location.reload(); }}
                  className="bg-[#13243F] border border-slate-600 text-[#E8CD91] px-2.5 py-1 rounded text-xs hover:bg-[#1c365f] transition-colors font-medium"
                >
                  Target Current Website (Pt-2 / Usman)
                </button>
                <button
                  type="button"
                  onClick={() => { switchToUpcomingRemixSlot(); window.location.reload(); }}
                  className="bg-[#13243F] border border-slate-600 text-[#E8CD91] px-2.5 py-1 rounded text-xs hover:bg-[#1c365f] transition-colors font-medium"
                >
                  Target Upcoming Remix (remix 4260-2)
                </button>
                <button
                  type="button"
                  onClick={() => { resetToAutomaticSlot(); window.location.reload(); }}
                  className="bg-[#081527] border border-slate-700 text-slate-300 px-2.5 py-1 rounded text-xs hover:bg-[#13243F] transition-colors"
                >
                  Reset to Auto
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <span className="text-slate-300 font-medium">Custom Database Slot ID:</span>
                <input 
                  type="text"
                  placeholder="e.g. wedding_data_custom_slot"
                  value={customSlotInput}
                  onChange={(e) => setCustomSlotInput(e.target.value)}
                  className="bg-[#081527] text-white border border-slate-600 rounded px-2.5 py-1.5 text-xs flex-1 max-w-xs focus:outline-none focus:border-[#E8CD91]"
                />
                <button
                  type="button"
                  onClick={handleUpdateCustomSlot}
                  className="bg-[#D6B66F] text-[#071322] px-3 py-1.5 rounded text-xs font-bold hover:brightness-110 transition-colors"
                >
                  Apply Custom Slot
                </button>
              </div>
            </div>
          )}
        </section>

        {/* BACKUP, IMPORT & EXPORT CENTER */}
        <section className="bg-[#13243F] rounded-xl p-5 border border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-[#E8CD91]" />
            <h2 className="text-lg font-bold text-white">Data Backup &amp; Migration (Import / Export)</h2>
          </div>
          <p className="text-xs text-slate-300 font-sans">
            Download all details, messages, timeline events, and file URLs as a portable backup file. 
            You can import this backup file into any remix or another wedding website with 1-click.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center justify-center gap-2 p-3 bg-[#0B182B] hover:bg-[#10223c] border border-slate-700 rounded-lg text-[#E8CD91] font-sans font-semibold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#E8CD91]" />
              <span>Export Full Backup JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 p-3 bg-[#0B182B] hover:bg-[#10223c] border border-slate-700 rounded-lg text-[#E8CD91] font-sans font-semibold text-xs transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#E8CD91]" />
              <span>Import &amp; Restore From JSON</span>
            </button>
          </div>

          {/* Uploaded Files & Media List */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Uploaded Media &amp; Files ({mediaFilesList.length})</span>
                  <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-700 px-2 py-0.5 rounded font-mono font-medium">
                    field: remix_pt2_media_files
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300 font-sans">
                  All media files uploaded to this remix website.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadAllLinksTxt}
                className="flex items-center gap-1.5 text-xs text-[#E8CD91] hover:text-white bg-[#0B182B] px-2.5 py-1.5 rounded border border-slate-700 font-sans font-medium"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download Links (.txt)</span>
              </button>
            </div>

            {mediaFilesList.length === 0 ? (
              <p className="text-xs text-slate-400 italic font-sans py-2">No media files currently uploaded.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {mediaFilesList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-[#0B182B] rounded-lg border border-slate-700 text-xs font-sans gap-2">
                    <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                      {item.type === "video" ? (
                        <Video className="w-3.5 h-3.5 text-[#E8CD91] shrink-0" />
                      ) : item.type === "audio" ? (
                        <Music className="w-3.5 h-3.5 text-[#E8CD91] shrink-0" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5 text-[#E8CD91] shrink-0" />
                      )}
                      <span className="font-semibold text-white shrink-0">{item.label}:</span>
                      <span className="truncate text-slate-400 text-[11px]">{item.url}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.url || "", idx)}
                        className="p-1 text-[#E8CD91] hover:text-white hover:bg-[#13243F] rounded transition-colors"
                        title="Copy Link"
                      >
                        {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadAsset(item.url || "", item.filename)}
                        className="flex items-center gap-1 px-2 py-1 bg-[#13243F] hover:bg-[#1c365f] border border-slate-600 rounded text-[11px] font-medium text-slate-200 transition-colors"
                        title="Download File"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Couple Details */}
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#F3E2B8]">Couple Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-[#13243F] p-5 rounded-xl border border-slate-700">
              <h3 className="font-bold text-[#E8CD91] text-base border-b border-slate-700 pb-2">Groom Information</h3>
              <Input label="Name" value={data.groom.name} onChange={(v) => handleChange("groom.name", v)} />
              <Input label="Parents" value={data.groom.parents} onChange={(v) => handleChange("groom.parents", v)} />
              <Input label="Education" value={data.groom.education} onChange={(v) => handleChange("groom.education", v)} />
              <Input label="Profession" value={data.groom.profession} onChange={(v) => handleChange("groom.profession", v)} />
            </div>
            <div className="space-y-4 bg-[#13243F] p-5 rounded-xl border border-slate-700">
              <h3 className="font-bold text-[#E8CD91] text-base border-b border-slate-700 pb-2">Bride Information</h3>
              <Input label="Name" value={data.bride.name} onChange={(v) => handleChange("bride.name", v)} />
              <Input label="Parents" value={data.bride.parents} onChange={(v) => handleChange("bride.parents", v)} />
              <Input label="Education" value={data.bride.education} onChange={(v) => handleChange("bride.education", v)} />
              <Input label="Profession" value={data.bride.profession} onChange={(v) => handleChange("bride.profession", v)} />
            </div>
          </div>
        </section>

        {/* Family & Parents Details */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#F3E2B8] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#E8CD91]" />
              Parents &amp; Family Details Section
            </h2>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Parents' names, family blessings, brothers, and sisters displayed in the website's Family Details section.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* GROOM'S SIDE */}
            <div className="bg-[#13243F] p-5 rounded-xl border border-slate-700 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#E8CD91]" />
                  <h3 className="font-bold text-base text-white">Groom's Parents &amp; Family</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0B182B] px-2 py-0.5 rounded text-[#E8CD91] border border-slate-700">
                  Groom Side
                </span>
              </div>

              {/* Parents' Names */}
              <div className="space-y-3 bg-[#0B182B] p-4 rounded-lg border border-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#E8CD91]">
                  Parents' Names (Family Section)
                </h4>
                <Input 
                  label="Father's Name" 
                  value={data.familyDetails?.groomSide.father || ""} 
                  onChange={(v) => handleChange("familyDetails.groomSide.father", v)} 
                />
                <Input 
                  label="Mother's Name" 
                  value={data.familyDetails?.groomSide.mother || ""} 
                  onChange={(v) => handleChange("familyDetails.groomSide.mother", v)} 
                />
                <div className="pt-1">
                  <Input 
                    label="Hero Parents Subtitle (Under Groom Name on Hero)" 
                    value={data.groom.parents} 
                    onChange={(v) => handleChange("groom.parents", v)} 
                  />
                </div>
              </div>

              {/* Groom's Brothers */}
              <div className="space-y-3 bg-[#0B182B] p-4 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#E8CD91]">
                    Groom's Brothers ({data.familyDetails?.groomSide.brothers?.length || 0})
                  </h4>
                  <button
                    type="button"
                    onClick={addBrother}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#13243F] hover:bg-[#1d3761] text-[#E8CD91] rounded text-xs font-bold transition-colors border border-slate-600 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Brother
                  </button>
                </div>

                {(!data.familyDetails?.groomSide.brothers || data.familyDetails.groomSide.brothers.length === 0) ? (
                  <p className="text-xs text-slate-400 italic py-2">No brothers listed. Click "Add Brother" above to add one.</p>
                ) : (
                  <div className="space-y-3 pt-1">
                    {data.familyDetails.groomSide.brothers.map((brother, bIdx) => (
                      <div key={bIdx} className="p-3 bg-[#081527] rounded-lg border border-slate-700 relative space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[#13243F] text-[#E8CD91] text-[9px] flex items-center justify-center font-bold">
                              {bIdx + 1}
                            </span>
                            Brother {bIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeBrother(bIdx)}
                            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Delete Brother"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <Input 
                          label="Brother Name & Qualification" 
                          value={brother.name} 
                          onChange={(v) => handleBrotherChange(bIdx, 'name', v)} 
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input 
                            label="Wife's Name (Optional)" 
                            value={brother.wife || ""} 
                            onChange={(v) => handleBrotherChange(bIdx, 'wife', v)} 
                          />
                          <Input 
                            label="Child Details (Optional)" 
                            value={brother.child || ""} 
                            onChange={(v) => handleBrotherChange(bIdx, 'child', v)} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* BRIDE'S SIDE */}
            <div className="bg-[#13243F] p-5 rounded-xl border border-slate-700 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#E8CD91]" />
                  <h3 className="font-bold text-base text-white">Bride's Parents &amp; Family</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0B182B] px-2 py-0.5 rounded text-[#E8CD91] border border-slate-700">
                  Bride Side
                </span>
              </div>

              {/* Parents' Names */}
              <div className="space-y-3 bg-[#0B182B] p-4 rounded-lg border border-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#E8CD91]">
                  Parents' Names (Family Section)
                </h4>
                <Input 
                  label="Father's Name" 
                  value={data.familyDetails?.brideSide.father || ""} 
                  onChange={(v) => handleChange("familyDetails.brideSide.father", v)} 
                />
                <Input 
                  label="Mother's Name" 
                  value={data.familyDetails?.brideSide.mother || ""} 
                  onChange={(v) => handleChange("familyDetails.brideSide.mother", v)} 
                />
                <div className="pt-1">
                  <Input 
                    label="Hero Parents Subtitle (Under Bride Name on Hero)" 
                    value={data.bride.parents} 
                    onChange={(v) => handleChange("bride.parents", v)} 
                  />
                </div>
              </div>

              {/* Bride's Sisters */}
              <div className="space-y-3 bg-[#0B182B] p-4 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#E8CD91]">
                    Bride's Sisters ({data.familyDetails?.brideSide.sisters?.length || 0})
                  </h4>
                  <button
                    type="button"
                    onClick={addSister}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#13243F] hover:bg-[#1d3761] text-[#E8CD91] rounded text-xs font-bold transition-colors border border-slate-600 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Sister
                  </button>
                </div>

                {(!data.familyDetails?.brideSide.sisters || data.familyDetails.brideSide.sisters.length === 0) ? (
                  <p className="text-xs text-slate-400 italic py-2">No sisters listed. Click "Add Sister" above to add one.</p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {data.familyDetails.brideSide.sisters.map((sister, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2 bg-[#081527] p-2.5 rounded-lg border border-slate-700">
                        <span className="w-4 h-4 rounded-full bg-[#13243F] text-[#E8CD91] text-[9px] flex items-center justify-center font-bold shrink-0">
                          {sIdx + 1}
                        </span>
                        <div className="flex-1">
                          <input 
                            type="text"
                            placeholder="Sister's Full Name"
                            value={sister}
                            onChange={(e) => handleSisterChange(sIdx, e.target.value)}
                            className="w-full bg-[#0B182B] text-white border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-[#E8CD91]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSister(sIdx)}
                          className="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-red-950/40 transition-colors shrink-0 cursor-pointer"
                          title="Delete Sister"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </section>

        {/* Event Date & Time */}
        <section className="bg-[#13243F] p-5 rounded-xl border border-slate-700 space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#F3E2B8]">Event Date &amp; Time</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Target Date (Countdown ISO)" value={data.weddingDate} onChange={(v) => handleChange("weddingDate", v)} type="datetime-local" />
            <Input label="Formatted Date" value={data.weddingDateFormatted} onChange={(v) => handleChange("weddingDateFormatted", v)} />
            <Input label="Formatted Time" value={data.weddingTimeFormatted} onChange={(v) => handleChange("weddingTimeFormatted", v)} />
            <Input label="Day of Week" value={data.weddingDayFormatted} onChange={(v) => handleChange("weddingDayFormatted", v)} />
          </div>
        </section>

        {/* Messages & Text */}
        <section className="bg-[#13243F] p-5 rounded-xl border border-slate-700 space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#F3E2B8]">Messages, Quranic Verse &amp; Monogram</h2>
          <div className="space-y-4">
            <TextArea label="Hero Message" value={data.heroMessage} onChange={(v) => handleChange("heroMessage", v)} />
            <TextArea label="Quranic Verse (Arabic)" value={data.quranicVerse?.arabic || ""} onChange={(v) => handleChange("quranicVerse.arabic", v)} />
            <Input label="Quranic Verse Translation" value={data.quranicVerse?.translation || ""} onChange={(v) => handleChange("quranicVerse.translation", v)} />
            <Input label="Custom Text : Initials of Groom & Bride" value={data.customText || ""} onChange={(v) => handleChange("customText", v)} />
            
            {/* JM Monogram Logo Controls */}
            <div className="flex flex-col gap-3 p-4 bg-[#0B182B] rounded-xl border border-slate-700 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#D6B66F]">
                  JM Monogram Logo (Invitation Section)
                </label>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#13243F] text-[#E8CD91] font-bold border border-slate-600">
                  Size: {data.logoSize || 240}px
                </span>
              </div>
              
              <p className="text-xs text-slate-300">
                Upload background-removed logo photo to replace the (JM) text in the invitation message section.
              </p>
              
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => handleSingleImageUpload(e, 'jmLogoUrl')}
                className="w-full text-xs file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#13243F] file:text-[#E8CD91] hover:file:bg-[#1d3761] cursor-pointer"
              />
              <Input label="Or JM Logo Image URL" value={data.jmLogoUrl || ""} onChange={(v) => handleChange("jmLogoUrl", v)} />
              
              {/* Size Controls */}
              <div className="mt-2 pt-3 border-t border-slate-700 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D6B66F]">
                    Logo Size Controls
                  </span>
                  <span className="text-xs font-bold text-[#E8CD91] bg-[#071424] border border-slate-600 px-2.5 py-1 rounded-md">
                    {data.logoSize || 240} px
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const current = data.logoSize || 240;
                      handleChange("logoSize", Math.max(80, current - 25));
                    }}
                    className="py-1.5 px-2 bg-[#13243F] hover:bg-[#1d3761] text-[#E8CD91] font-sans text-xs font-bold rounded-lg border border-slate-600 transition-colors"
                  >
                    - 25px
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const current = data.logoSize || 240;
                      handleChange("logoSize", Math.max(80, current - 10));
                    }}
                    className="py-1.5 px-2 bg-[#13243F] hover:bg-[#1d3761] text-[#E8CD91] font-sans text-xs font-bold rounded-lg border border-slate-600 transition-colors"
                  >
                    - 10px
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const current = data.logoSize || 240;
                      handleChange("logoSize", Math.min(500, current + 10));
                    }}
                    className="py-1.5 px-2 bg-[#13243F] hover:bg-[#1d3761] text-[#E8CD91] font-sans text-xs font-bold rounded-lg border border-slate-600 transition-colors"
                  >
                    + 10px
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const current = data.logoSize || 240;
                      handleChange("logoSize", Math.min(500, current + 25));
                    }}
                    className="py-1.5 px-2 bg-[#13243F] hover:bg-[#1d3761] text-[#E8CD91] font-sans text-xs font-bold rounded-lg border border-slate-600 transition-colors"
                  >
                    + 25px
                  </button>
                </div>

                {/* Range Slider */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-sans whitespace-nowrap">80px</span>
                  <input 
                    type="range" 
                    min="80" 
                    max="450" 
                    step="5" 
                    value={data.logoSize || 240} 
                    onChange={(e) => handleChange("logoSize", Number(e.target.value))}
                    className="flex-1 accent-[#E8CD91] cursor-pointer h-2 bg-slate-700 rounded-lg"
                  />
                  <span className="text-[11px] text-slate-400 font-sans whitespace-nowrap">450px</span>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Presets:</span>
                  {[
                    { label: "Compact", size: 140 },
                    { label: "Normal", size: 200 },
                    { label: "Large", size: 240 },
                    { label: "X-Large", size: 300 },
                    { label: "Jumbo", size: 380 }
                  ].map((preset) => (
                    <button
                      key={preset.size}
                      type="button"
                      onClick={() => handleChange("logoSize", preset.size)}
                      className={`text-[11px] font-sans px-2.5 py-1 rounded-full border transition-all ${
                        (data.logoSize || 240) === preset.size
                          ? "bg-[#D6B66F] text-[#071322] border-[#E8CD91] font-bold"
                          : "bg-[#071424] text-slate-300 border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      {preset.label} ({preset.size}px)
                    </button>
                  ))}
                </div>

                {/* Live Preview Box */}
                {data.jmLogoUrl && (
                  <div className="mt-2 p-3 bg-[#071424] rounded-xl border border-slate-700 flex flex-col items-center">
                    <img 
                      src={data.jmLogoUrl} 
                      style={{ 
                        height: `${Math.min(data.logoSize || 240, 260)}px`,
                        maxHeight: '260px'
                      }} 
                      className="w-auto object-contain drop-shadow-md" 
                      alt="JM Logo Preview" 
                    />
                    <button 
                      type="button" 
                      onClick={() => handleChange("jmLogoUrl", "")}
                      className="mt-2 text-xs text-red-400 hover:underline font-sans cursor-pointer"
                    >
                      Remove Logo (Revert to text)
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <TextArea label="Wedding Invitation Message (Arabic & English)" value={data.invitationMessage} onChange={(v) => handleChange("invitationMessage", v)} />
            <TextArea label="Transportation Details" value={data.transportation} onChange={(v) => handleChange("transportation", v)} />
            <Input label="Dress Code" value={data.dressCode} onChange={(v) => handleChange("dressCode", v)} />
            <TextArea label="Closing Message (Small line just below logo at end of website)" value={data.closingMessage} onChange={(v) => handleChange("closingMessage", v)} />
          </div>
        </section>

        {/* Events */}
        <section className="bg-[#13243F] p-5 rounded-xl border border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-[#F3E2B8]">Events Schedule ({data.events.length})</h2>
            <button 
              type="button"
              onClick={() => {
                const newEvent = {
                  id: Date.now().toString(),
                  title: "New Event",
                  date: "",
                  time: "",
                  location: "",
                  videoUrl: "",
                  mapUrl: ""
                };
                handleChange("events", [...data.events, newEvent]);
              }} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D6B66F] text-[#071322] font-bold rounded-lg text-xs hover:brightness-110 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Event
            </button>
          </div>

          <div className="space-y-4">
            {data.events.map((event, idx) => (
              <div key={event.id || idx} className="bg-[#0B182B] p-4 rounded-xl border border-slate-700 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                  <h3 className="font-bold text-[#E8CD91] text-sm">Event {idx + 1}: {event.title || "Untitled"}</h3>
                  <button 
                    onClick={() => {
                      const newEvents = [...data.events];
                      newEvents.splice(idx, 1);
                      handleChange("events", newEvents);
                    }} 
                    className="text-red-400 hover:text-red-300 text-xs px-2.5 py-1 rounded bg-red-950/40 border border-red-800/50 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Event Title" value={event.title} onChange={(v) => handleChange(`events.${idx}.title`, v)} />
                  <Input label="Date" value={event.date} type="date" onChange={(v) => handleChange(`events.${idx}.date`, v)} />
                  <Input label="Time (e.g., 7:00 PM)" value={event.time} onChange={(v) => handleChange(`events.${idx}.time`, v)} />
                  <Input label="Location Name" value={event.location} onChange={(v) => handleChange(`events.${idx}.location`, v)} />
                  <Input label="Timeline Message" value={event.description || ""} onChange={(v) => handleChange(`events.${idx}.description`, v)} />
                  <Input label="Video URL (.mp4)" value={event.videoUrl || ""} onChange={(v) => handleChange(`events.${idx}.videoUrl`, v)} />
                  <Input label="Map Link (URL)" value={event.mapUrl || ""} onChange={(v) => handleChange(`events.${idx}.mapUrl`, v)} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Media Settings */}
        <section className="bg-[#13243F] p-5 rounded-xl border border-slate-700 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <h2 className="text-xl font-serif font-bold text-[#F3E2B8] flex items-center gap-2">
              <Video className="w-5 h-5 text-[#E8CD91]" />
              Media Settings &amp; Files
            </h2>
            <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-700 px-2.5 py-0.5 rounded-full font-mono font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              remix_isolated_files
            </span>
          </div>

          {/* HERO SECTION DISPLAY MODE & TEXT CONTROLS */}
          <div className="bg-[#0B182B] p-5 rounded-xl border border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#E8CD91]" />
                  Hero Section Style &amp; Content
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-0.5">
                  Switch between 9:16 Royal Islamic Video Card and Photo Only mode in 1-click.
                </p>
              </div>

              {/* 1-Click Toggle */}
              <div className="flex items-center gap-1.5 p-1 bg-[#071424] rounded-lg border border-slate-700 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => handleSetHeroDisplayMode("video_with_text")}
                  className={`px-3 py-1.5 rounded-md text-xs font-sans font-bold transition-all cursor-pointer ${
                    !isCurrentPhotoOnly
                      ? "bg-[#D6B66F] text-[#071322] shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Royal Video &amp; Text Card
                </button>
                <button
                  type="button"
                  onClick={() => handleSetHeroDisplayMode("photo")}
                  className={`px-3 py-1.5 rounded-md text-xs font-sans font-bold transition-all cursor-pointer ${
                    isCurrentPhotoOnly
                      ? "bg-[#D6B66F] text-[#071322] shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Photo Only Mode
                </button>
              </div>
            </div>

            {!isCurrentPhotoOnly ? (
              <div className="space-y-4 pt-1">
                <div className="p-3 bg-[#071424] rounded-lg border border-slate-700 text-xs text-slate-300">
                  <span className="font-bold text-[#E8CD91]">Active Mode: </span>
                  Vertical 9:16 Royal Islamic Video Card with ornamental arch, Bismillah emblem, invitation message, couple names, and animated background video.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Invitation By" 
                    value={data.heroInvitationBy || "Dr. Abdul Majeed"} 
                    onChange={(v) => handleChange("heroInvitationBy", v)} 
                  />
                  <Input 
                    label="Main Heading" 
                    value={data.heroHeading || "Nikah Ceremony"} 
                    onChange={(v) => handleChange("heroHeading", v)} 
                  />
                  <TextArea 
                    label="Invitation Message" 
                    value={data.heroInvitationMessage || "Cordially invites you to join for lunch\non the auspicious occasion of the"} 
                    onChange={(v) => handleChange("heroInvitationMessage", v)} 
                  />
                  <Input 
                    label="Occasion Details" 
                    value={data.heroOccasionDetails || "Of His Beloved Grandson"} 
                    onChange={(v) => handleChange("heroOccasionDetails", v)} 
                  />
                  <Input 
                    label="Groom's Father Subtitle" 
                    value={data.heroGroomFather || data.groom?.parents || "S/o Mr. Khalid Majeed"} 
                    onChange={(v) => {
                      handleChange("heroGroomFather", v);
                      handleChange("groom.parents", v);
                    }} 
                  />
                  <Input 
                    label="Bride's Father Subtitle" 
                    value={data.heroBrideFather || data.bride?.parents || "D/o Mr. Mohammad Shafiq Khan"} 
                    onChange={(v) => {
                      handleChange("heroBrideFather", v);
                      handleChange("bride.parents", v);
                    }} 
                  />
                  <Input 
                    label="Bride's Address" 
                    value={data.heroBrideAddress || "R/o Al Farooq Colony, Sanat Nagar"} 
                    onChange={(v) => handleChange("heroBrideAddress", v)} 
                  />
                  <Input 
                    label="Guest Information Badge" 
                    value={data.heroGuestInfo || "1 Gents & 1 Ladies"} 
                    onChange={(v) => handleChange("heroGuestInfo", v)} 
                  />
                  <div className="md:col-span-2">
                    <TextArea 
                      label="Blessing Message" 
                      value={data.heroBlessingMessage || "Your gracious presence and blessings\nwill make the occasion even more special."} 
                      onChange={(v) => handleChange("heroBlessingMessage", v)} 
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700">
                  <Input 
                    label="Hero Background Video URL (.mp4)" 
                    value={data.heroVideoUrl || "https://www.image2url.com/r2/default/videos/1788011182513-3d74480d-c3ef-41df-926f-d21988765de3.mp4"} 
                    onChange={(v) => handleChange("heroVideoUrl", v)} 
                  />
                </div>
              </div>
            ) : (
              /* Photo Only Mode */
              <div className="space-y-3 pt-1">
                <p className="text-xs text-slate-300">
                  Upload or link a portrait photo to replace the entire hero section with ambient motion.
                </p>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleSingleImageUpload(e, 'heroImageUrl')}
                  className="w-full text-xs file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#13243F] file:text-[#E8CD91] hover:file:bg-[#1d3761] cursor-pointer"
                />
                <Input label="Or Direct Hero Photo URL" value={data.heroImageUrl || ""} onChange={(v) => handleChange("heroImageUrl", v)} />
                {data.heroImageUrl && (
                  <div className="relative inline-block w-36 h-48 mt-2">
                    <img src={data.heroImageUrl} className="w-36 h-48 object-cover rounded-md border border-slate-700 shadow-md" alt="Hero Photo Preview" />
                    <span className="absolute bottom-2 left-2 bg-[#071322] text-[#E8CD91] text-[9px] px-1.5 py-0.5 rounded font-sans font-bold border border-slate-700 shadow-xs">
                      Active Hero Photo
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Opening Thumbnail */}
          <div className="flex flex-col gap-2 p-4 bg-[#0B182B] rounded-xl border border-slate-700">
            <h3 className="font-bold text-white text-sm">Opening Thumbnail (Click anywhere to start music &amp; enter)</h3>
            <p className="text-xs text-slate-300">When visitors click anywhere on this thumbnail, background music starts playing immediately.</p>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleSingleImageUpload(e, 'openingThumbnailUrl')}
              className="w-full text-xs file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#13243F] file:text-[#E8CD91] hover:file:bg-[#1d3761] cursor-pointer"
            />
            <Input label="Or Thumbnail URL" value={data.openingThumbnailUrl || ""} onChange={(v) => handleChange("openingThumbnailUrl", v)} />
            {data.openingThumbnailUrl && (
              <div className="relative inline-block w-24 h-24 mt-2">
                <img src={data.openingThumbnailUrl} className="w-24 h-24 object-cover rounded-md border border-slate-700 shadow-xs" alt="Thumbnail Preview" />
              </div>
            )}
          </div>

          {/* Opening Video */}
          <div className="flex flex-col gap-2 p-4 bg-[#0B182B] rounded-xl border border-slate-700">
            <h3 className="font-bold text-white text-sm">Opening Video</h3>
            <p className="text-xs text-slate-300">Plays immediately after clicking the thumbnail. Direct MP4 link.</p>
            <Input label="Video URL" value={data.openingVideoUrl || ""} onChange={(v) => handleChange("openingVideoUrl", v)} />
          </div>

          {/* Social Preview */}
          <div className="flex flex-col gap-2 p-4 bg-[#0B182B] rounded-xl border border-slate-700">
            <h3 className="font-bold text-white text-sm">OG Image URL (Social Sharing Preview)</h3>
            <p className="text-xs text-slate-300">Image shown when sharing the link on WhatsApp, Facebook, Instagram.</p>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleSingleImageUpload(e, 'ogImageUrl')}
              className="w-full text-xs file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#13243F] file:text-[#E8CD91] hover:file:bg-[#1d3761] cursor-pointer"
            />
            <Input label="Or Direct Image URL" value={data.ogImageUrl || ""} onChange={(v) => handleChange("ogImageUrl", v)} />
            {data.ogImageUrl && (
              <img src={data.ogImageUrl} className="w-28 h-16 object-cover rounded-md mt-2 border border-slate-700" alt="OG Preview" />
            )}
          </div>

          {/* Background Music */}
          <div className="flex flex-col gap-2 p-4 bg-[#0B182B] rounded-xl border border-slate-700">
            <h3 className="font-bold text-white text-sm">Background Music Track</h3>
            <p className="text-xs text-slate-300">Direct link to an audio file (e.g., .mp3) to play in the background.</p>
            <Input label="Music URL" value={data.musicUrl || ""} onChange={(v) => handleChange("musicUrl", v)} />
          </div>
        </section>

        {/* Photo Gallery & Album Section */}
        <section className="bg-[#13243F] p-5 rounded-xl border border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#F3E2B8]">Photo Gallery &amp; Album Files</h2>
              <p className="text-xs text-slate-300 font-sans">
                Upload images or provide image URLs.
              </p>
            </div>
            <button 
              type="button"
              onClick={addImage}
              className="flex items-center gap-1.5 bg-[#D6B66F] text-[#071322] px-3 py-1.5 rounded-lg text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Photo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data.gallery || []).map((imgUrl, idx) => (
              <div key={idx} className="bg-[#0B182B] p-4 rounded-xl border border-slate-700 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E8CD91]">Photo {idx + 1}</span>
                  <button 
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 hover:bg-red-950/40 p-1 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>

                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, idx)}
                  className="w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#13243F] file:text-[#E8CD91] hover:file:bg-[#1d3761] cursor-pointer"
                />
                
                <Input 
                  label="Or Photo Direct URL" 
                  value={imgUrl.startsWith("data:") ? "[Uploaded Image File]" : imgUrl} 
                  onChange={(val) => {
                    const updated = [...(data.gallery || [])];
                    updated[idx] = val;
                    handleChange("gallery", updated);
                  }} 
                />

                {imgUrl && (
                  <div className="mt-1">
                    <img 
                      src={imgUrl} 
                      alt={`Gallery ${idx + 1}`} 
                      className="w-full h-32 object-cover rounded-md border border-slate-700" 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {(data.gallery || []).length === 0 && (
            <div className="p-6 text-center border border-dashed border-slate-700 rounded-lg bg-[#0B182B]">
              <p className="text-xs text-slate-400 italic font-sans mb-3">No photos currently added to the gallery.</p>
              <button 
                type="button"
                onClick={addImage}
                className="inline-flex items-center gap-1.5 bg-[#D6B66F] text-[#071322] px-3.5 py-1.5 rounded-lg text-xs font-bold hover:brightness-110 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add First Photo
              </button>
            </div>
          )}
        </section>

        {/* Venue Settings */}
        <section className="bg-[#13243F] p-5 rounded-xl border border-slate-700 space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#F3E2B8]">Venue Details</h2>
          <div className="space-y-4">
            <Input label="Venue Name" value={data.venue.name} onChange={(v) => handleChange("venue.name", v)} />
            <Input label="Address Line 1" value={data.venue.addressLine1} onChange={(v) => handleChange("venue.addressLine1", v)} />
            <Input label="Address Line 2" value={data.venue.addressLine2} onChange={(v) => handleChange("venue.addressLine2", v)} />
            <Input label="Google Maps URL" value={data.venue.mapUrl} onChange={(v) => handleChange("venue.mapUrl", v)} />
          </div>
        </section>

      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }: { label: string, value: string, onChange: (v: string) => void, type?: string, placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-semibold uppercase tracking-wider text-[#D6B66F] font-sans">{label}</label>
      <input 
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#071424] text-white placeholder-slate-400 border border-slate-600 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8CD91] focus:ring-1 focus:ring-[#E8CD91] transition-all font-sans"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 4, placeholder }: { label: string, value: string, onChange: (v: string) => void, rows?: number, placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-semibold uppercase tracking-wider text-[#D6B66F] font-sans">{label}</label>
      <textarea 
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#071424] text-white placeholder-slate-400 border border-slate-600 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#E8CD91] focus:ring-1 focus:ring-[#E8CD91] transition-all font-sans resize-y"
      />
    </div>
  );
}
