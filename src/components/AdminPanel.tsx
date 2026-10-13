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
  Film
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
      <div className="min-h-screen bg-blush-main flex items-center justify-center p-4 font-serif">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-pink-border max-w-sm w-full text-center">
          <h2 className="text-2xl font-script text-wine-dark mb-4">Admin Login</h2>
          <input 
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (password === "4260") setIsAuthenticated(true);
                else alert("Incorrect password");
              }
            }}
            className="w-full border border-pink-border rounded-md px-4 py-2 mb-4 text-center focus:outline-none focus:border-pink-accent"
          />
          <button 
            onClick={() => {
              if (password === "4260") setIsAuthenticated(true);
              else alert("Incorrect password");
            }}
            className="w-full bg-burgundy text-white py-2 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-wine-dark transition-colors"
          >
            Enter
          </button>
          <Link to="/" className="block mt-4 text-sm text-wine-dark/70 hover:text-wine-dark underline">
            Return to Website
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-8 font-serif">Loading Admin Panel...</div>;

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
        `🔒 Zero Overlap Protection: 100% Guaranteed.\n` +
        `The official website is locked and completely untouched! All files and data for this remix are stored in separate fields.`
      );
    } catch (error) {
      console.error(error);
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  // EXPORT: Download complete JSON package containing all wedding data & files
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

  // IMPORT: Import complete JSON package from another website or remix
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        // Support both wrapped export format { data: WeddingData } and raw WeddingData
        const importedData: WeddingData = parsed.data && typeof parsed.data === "object" ? parsed.data : parsed;

        if (!importedData || typeof importedData !== "object") {
          throw new Error("Invalid file format. Please provide a valid JSON backup.");
        }
        if (!importedData.groom || !importedData.bride) {
          throw new Error("Missing groom or bride information in the backup file.");
        }

        // Safety defaults for nested structures
        if (!Array.isArray(importedData.events)) importedData.events = [];
        if (!Array.isArray(importedData.timeline)) importedData.timeline = [];
        if (!Array.isArray(importedData.gallery)) importedData.gallery = [];
        if (!importedData.venue) {
          importedData.venue = { name: "", addressLine1: "", addressLine2: "", mapUrl: "" };
        }

        // Update local state immediately so fields update
        setData(importedData);

        const shouldAutoSave = window.confirm(
          `Backup loaded successfully for ${importedData.groom?.name || "Groom"} & ${importedData.bride?.name || "Bride"}!\n\n` +
          `Events: ${importedData.events.length}\n` +
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

  // DOWNLOAD ASSET HELPER: Allows downloading individual media files (videos, mp3, images)
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

      // Fetch blob to prompt download
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
      // Fallback if CORS prevents blob download
      window.open(url, "_blank");
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // List of all media files currently configured in this wedding
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

  return (
    <div className="min-h-screen bg-blush-main p-4 md:p-8 font-serif text-text-body">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 md:p-10 border border-pink-border">
        
        {/* Top Header with Navigation & Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-pink-border pb-6 gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-wine-dark hover:text-burgundy bg-blush-light px-3 py-1.5 rounded-full border border-pink-border/50 transition-colors text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" /> Go Back
            </Link>
            <div>
              <h1 className="text-3xl font-script text-wine-dark">Admin Panel</h1>
              <p className="text-xs text-text-body/70 font-sans mt-0.5">
                <span className="font-semibold text-wine-dark">{activeTemplate || ORIGINAL_TEMPLATE_NAME}</span> • Manage wedding details, media files, and backups
              </p>
            </div>
          </div>

          {/* Action Bar: Export, Import, Save */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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
              className="flex items-center gap-1.5 bg-white text-wine-dark border border-pink-border px-3.5 py-2 rounded-md hover:bg-blush-light transition-colors text-xs font-bold uppercase tracking-wider shadow-sm"
              title="Download full wedding data & media as a JSON file"
            >
              <Download className="w-4 h-4 text-wine-dark" />
              Export
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="flex items-center gap-1.5 bg-white text-wine-dark border border-pink-border px-3.5 py-2 rounded-md hover:bg-blush-light transition-colors text-xs font-bold uppercase tracking-wider shadow-sm"
              title="Upload and load a wedding JSON backup file"
            >
              <Upload className="w-4 h-4 text-wine-dark" />
              Import
            </button>

            <button 
              onClick={handleUsmanDataRecovery}
              disabled={saving}
              type="button"
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#B87919] to-[#98520C] text-white px-3.5 py-2 rounded-md hover:from-[#98520C] hover:to-[#75400F] transition-all text-xs font-bold uppercase tracking-wider shadow-sm disabled:opacity-50"
              title="Recover all wedding data for Usman bin Khalid & Sidrat Shafiq Khan on Vercel hosting"
            >
              <Sparkles className="w-4 h-4 text-[#E6B84A]" />
              usman data recovery
            </button>

            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-burgundy text-white px-5 py-2 rounded-md hover:bg-wine-dark transition-colors disabled:opacity-50 text-xs font-bold uppercase tracking-wider shadow-sm ml-auto md:ml-0"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="space-y-8">

          {/* REMIX ISOLATION & DATABASE STATUS BANNER */}
          <div className="bg-gradient-to-r from-pink-50 via-blush-light to-amber-50/50 rounded-xl p-5 border border-pink-border/80 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-white rounded-lg border border-pink-border/60 text-wine-dark shadow-xs">
                  <ShieldCheck className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-wine-dark text-sm">Remix Data &amp; Files Separation (Zero Overlap Protection)</h3>
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      This Remix Website • 100% Isolated
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" /> Official Website Untouched
                    </span>
                  </div>

                  {/* Active slot & field details */}
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-sans">
                    <div className="bg-white/90 p-2.5 rounded-lg border border-pink-border/50">
                      <span className="text-text-body/60 block text-[10px] uppercase font-bold tracking-wider">Active Document Slot</span>
                      <code className="text-wine-dark font-mono text-[11px] font-semibold break-all">{currentSlot}</code>
                    </div>
                    <div className="bg-white/90 p-2.5 rounded-lg border border-pink-border/50">
                      <span className="text-text-body/60 block text-[10px] uppercase font-bold tracking-wider">Separate Storage Fields</span>
                      <code className="text-wine-dark font-mono text-[11px] font-semibold">
                        remix_isolated_data &amp; remix_isolated_files
                      </code>
                    </div>
                    <div className="bg-white/90 p-2.5 rounded-lg border border-pink-border/50">
                      <span className="text-text-body/60 block text-[10px] uppercase font-bold tracking-wider">Official Website Guard</span>
                      <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-600" /> Strictly Locked &amp; Protected
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-text-body/80 mt-2.5 font-sans leading-relaxed">
                    Every file and piece of data you add or edit in this remix website is completely saved into dedicated separate fields (<code className="font-mono text-wine-dark font-semibold">remix_isolated_data</code> and <code className="font-mono text-wine-dark font-semibold">remix_isolated_files</code>). 
                    The official website (<strong className="text-wine-dark">&quot;{ORIGINAL_TEMPLATE_NAME}&quot;</strong>) and any prior templates are locked and protected with strict runtime guardrails. 
                    Zero data, media, or file overlap is 100% guaranteed.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 self-end sm:self-center shrink-0">
                <button 
                  type="button"
                  onClick={() => setShowSlotSettings(!showSlotSettings)}
                  className="text-xs text-wine-dark underline hover:text-burgundy font-sans"
                >
                  {showSlotSettings ? "Hide Advanced Slot Settings" : "Advanced Slot Settings"}
                </button>
              </div>
            </div>

            {showSlotSettings && (
              <div className="mt-4 pt-4 border-t border-pink-border/40 font-sans text-xs space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-text-body/80 font-medium">Quick Target Switcher:</span>
                  <button
                    type="button"
                    onClick={() => { switchToCurrentWebsiteSlot(); window.location.reload(); }}
                    className="bg-blush-light border border-pink-border text-wine-dark px-2.5 py-1 rounded text-xs hover:bg-blush-main transition-colors font-medium"
                    title="Target current website (Usman bin Khalid & Sidrat Shafiq Khan) slot"
                  >
                    Target Current Website (Pt-2 / Usman)
                  </button>
                  <button
                    type="button"
                    onClick={() => { switchToUpcomingRemixSlot(); window.location.reload(); }}
                    className="bg-blush-light border border-pink-border text-wine-dark px-2.5 py-1 rounded text-xs hover:bg-blush-main transition-colors font-medium"
                    title="Target upcoming remix (new website template for muslim wedding remix 4260-2) slot"
                  >
                    Target Upcoming Remix (remix 4260-2)
                  </button>
                  <button
                    type="button"
                    onClick={() => { resetToAutomaticSlot(); window.location.reload(); }}
                    className="bg-white border border-pink-border text-text-body px-2.5 py-1 rounded text-xs hover:bg-blush-light transition-colors"
                  >
                    Reset to Auto
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <span className="text-text-body/80 font-medium">Custom Database Slot ID:</span>
                  <input 
                    type="text"
                    placeholder="e.g. wedding_data_custom_slot"
                    value={customSlotInput}
                    onChange={(e) => setCustomSlotInput(e.target.value)}
                    className="bg-white border border-pink-border rounded px-2.5 py-1.5 text-xs flex-1 max-w-xs focus:outline-none focus:border-pink-accent"
                  />
                  <button
                    type="button"
                    onClick={handleUpdateCustomSlot}
                    className="bg-wine-dark text-white px-3 py-1.5 rounded text-xs hover:bg-burgundy transition-colors"
                  >
                    Apply Custom Slot
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* BACKUP, IMPORT & EXPORT CENTER */}
          <section className="bg-white rounded-xl p-5 border border-pink-border/80 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <FileJson className="w-5 h-5 text-wine-dark" />
              <h2 className="text-lg font-bold text-wine-dark">Data Backup & Migration (Import / Export)</h2>
            </div>
            <p className="text-xs text-text-body/75 font-sans mb-4">
              Download all details, messages, timeline events, and file URLs as a portable backup file. 
              You can import this backup file into any remix or another wedding website with 1-click.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {/* Usman Data Recovery Button */}
              <button
                type="button"
                onClick={handleUsmanDataRecovery}
                disabled={saving}
                className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-[#FFF9E9] to-[#FFF3D6] hover:from-[#FFF3D6] hover:to-[#FFE8B8] border-2 border-[#B87919] rounded-lg text-[#75400F] font-sans font-bold text-xs transition-all shadow-xs sm:col-span-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-[#B87919]" />
                <span className="tracking-wide">usman data recovery (Vercel Hosting Sync & Data Restore)</span>
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 p-3 bg-blush-light hover:bg-pink-100/70 border border-pink-border rounded-lg text-wine-dark font-sans font-semibold text-xs transition-colors"
              >
                <Download className="w-4 h-4 text-wine-dark" />
                <span>Download Backup ({activeTemplate || REMIX_PT2_TEMPLATE_NAME})</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 bg-blush-light hover:bg-pink-100/70 border border-pink-border rounded-lg text-wine-dark font-sans font-semibold text-xs transition-colors"
              >
                <Upload className="w-4 h-4 text-wine-dark" />
                <span>Import Wedding Backup File (.json)</span>
              </button>

              <button
                type="button"
                onClick={handleRestoreOfficial}
                disabled={saving}
                className="flex items-center justify-center gap-2 p-3 bg-burgundy/10 hover:bg-burgundy/20 border border-burgundy/30 rounded-lg text-burgundy font-sans font-semibold text-xs transition-colors sm:col-span-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-burgundy ${saving ? "animate-spin" : ""}`} />
                <span>Restore Clean Default Template Data</span>
              </button>
            </div>

            {/* Uploaded Files & Media List */}
            <div className="mt-4 pt-4 border-t border-pink-border/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-wine-dark flex items-center gap-2">
                    <span>Uploaded Media & Files ({mediaFilesList.length})</span>
                    <span className="text-[10px] bg-purple-100 text-purple-900 border border-purple-200 px-2 py-0.5 rounded font-mono font-medium">
                      field: remix_pt2_media_files
                    </span>
                  </h3>
                  <p className="text-[11px] text-text-body/70 font-sans">
                    All media files and assets uploaded to this remix website. Saved strictly into separate fields without overlapping official website data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadAllLinksTxt}
                  className="flex items-center gap-1.5 text-xs text-wine-dark hover:text-burgundy bg-blush-light px-2.5 py-1 rounded border border-pink-border font-sans font-medium"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Links (.txt)</span>
                </button>
              </div>

              {mediaFilesList.length === 0 ? (
                <p className="text-xs text-text-body/60 italic font-sans py-2">No media files currently uploaded.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {mediaFilesList.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-blush-light/50 rounded-lg border border-pink-border/40 text-xs font-sans gap-2">
                      <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                        {item.type === "video" ? (
                          <Video className="w-3.5 h-3.5 text-wine-dark shrink-0" />
                        ) : item.type === "audio" ? (
                          <Music className="w-3.5 h-3.5 text-wine-dark shrink-0" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5 text-wine-dark shrink-0" />
                        )}
                        <span className="font-semibold text-wine-dark shrink-0">{item.label}:</span>
                        <span className="truncate text-text-body/70 text-[11px]">{item.url}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[9px] bg-white border border-pink-border text-wine-dark px-1.5 py-0.5 rounded font-mono hidden sm:inline">
                          Isolated
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.url || "", idx)}
                          className="p-1 text-wine-dark hover:bg-white rounded transition-colors"
                          title="Copy Link"
                        >
                          {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadAsset(item.url || "", item.filename)}
                          className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-blush-light border border-pink-border/60 rounded text-[11px] font-medium text-wine-dark transition-colors"
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
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Couple Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
                <h3 className="font-bold">Groom</h3>
                <Input label="Name" value={data.groom.name} onChange={(v) => handleChange("groom.name", v)} />
                <Input label="Parents" value={data.groom.parents} onChange={(v) => handleChange("groom.parents", v)} />
                <Input label="Education" value={data.groom.education} onChange={(v) => handleChange("groom.education", v)} />
                <Input label="Profession" value={data.groom.profession} onChange={(v) => handleChange("groom.profession", v)} />
              </div>
              <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
                <h3 className="font-bold">Bride</h3>
                <Input label="Name" value={data.bride.name} onChange={(v) => handleChange("bride.name", v)} />
                <Input label="Parents" value={data.bride.parents} onChange={(v) => handleChange("bride.parents", v)} />
                <Input label="Education" value={data.bride.education} onChange={(v) => handleChange("bride.education", v)} />
                <Input label="Profession" value={data.bride.profession} onChange={(v) => handleChange("bride.profession", v)} />
              </div>
            </div>
          </section>

          {/* Family & Parents Details */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-xl font-bold text-wine-dark flex items-center gap-2">
                  <Users className="w-5 h-5 text-burgundy" />
                  Parents & Family Details Section
                </h2>
                <p className="text-xs text-wine-dark/70">
                  Full control over parents' names, family blessings, brothers, and sisters displayed in the website's Family Details section.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* GROOM'S SIDE */}
              <div className="bg-blush-light p-5 rounded-xl border border-pink-border/70 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-pink-border/60">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-wine-dark" />
                    <h3 className="font-bold text-base text-wine-dark">Groom's Parents & Family</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded text-burgundy border border-pink-border/50">
                    Groom Side
                  </span>
                </div>

                {/* Parents' Names */}
                <div className="space-y-3 bg-white/80 p-3.5 rounded-lg border border-pink-border/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-burgundy flex items-center gap-1.5">
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

                {/* Groom's Brothers & Family */}
                <div className="space-y-3 bg-white/80 p-3.5 rounded-lg border border-pink-border/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-burgundy">
                      Groom's Brothers & Family ({data.familyDetails?.groomSide.brothers?.length || 0})
                    </h4>
                    <button
                      type="button"
                      onClick={addBrother}
                      className="flex items-center gap-1 px-2.5 py-1 bg-burgundy hover:bg-wine-dark text-white rounded text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Brother
                    </button>
                  </div>

                  {(!data.familyDetails?.groomSide.brothers || data.familyDetails.groomSide.brothers.length === 0) ? (
                    <p className="text-xs text-wine-dark/60 italic py-2">No brothers listed. Click "Add Brother" above to add one.</p>
                  ) : (
                    <div className="space-y-3 pt-1">
                      {data.familyDetails.groomSide.brothers.map((brother, bIdx) => (
                        <div key={bIdx} className="p-3 bg-blush-main/40 rounded-lg border border-pink-border/60 relative space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-wine-dark flex items-center gap-1">
                              <span className="w-4 h-4 rounded-full bg-burgundy text-white text-[9px] flex items-center justify-center font-bold">
                                {bIdx + 1}
                              </span>
                              Brother {bIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeBrother(bIdx)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
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
              <div className="bg-blush-light p-5 rounded-xl border border-pink-border/70 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-pink-border/60">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-wine-dark" />
                    <h3 className="font-bold text-base text-wine-dark">Bride's Parents & Family</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded text-burgundy border border-pink-border/50">
                    Bride Side
                  </span>
                </div>

                {/* Parents' Names */}
                <div className="space-y-3 bg-white/80 p-3.5 rounded-lg border border-pink-border/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-burgundy flex items-center gap-1.5">
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
                <div className="space-y-3 bg-white/80 p-3.5 rounded-lg border border-pink-border/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-burgundy">
                      Bride's Sisters ({data.familyDetails?.brideSide.sisters?.length || 0})
                    </h4>
                    <button
                      type="button"
                      onClick={addSister}
                      className="flex items-center gap-1 px-2.5 py-1 bg-burgundy hover:bg-wine-dark text-white rounded text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Sister
                    </button>
                  </div>

                  {(!data.familyDetails?.brideSide.sisters || data.familyDetails.brideSide.sisters.length === 0) ? (
                    <p className="text-xs text-wine-dark/60 italic py-2">No sisters listed. Click "Add Sister" above to add one.</p>
                  ) : (
                    <div className="space-y-2 pt-1">
                      {data.familyDetails.brideSide.sisters.map((sister, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 bg-blush-main/40 p-2.5 rounded-lg border border-pink-border/60">
                          <span className="w-4 h-4 rounded-full bg-burgundy text-white text-[9px] flex items-center justify-center font-bold shrink-0">
                            {sIdx + 1}
                          </span>
                          <div className="flex-1">
                            <input 
                              type="text"
                              placeholder="Sister's Full Name"
                              value={sister}
                              onChange={(e) => handleSisterChange(sIdx, e.target.value)}
                              className="w-full bg-white border border-pink-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSister(sIdx)}
                            className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
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

          {/* Event Details */}
          <section>
             <h2 className="text-xl font-bold text-wine-dark mb-4">Event Date & Time</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Target Date (Countdown ISO)" value={data.weddingDate} onChange={(v) => handleChange("weddingDate", v)} type="datetime-local" />
                <Input label="Formatted Date" value={data.weddingDateFormatted} onChange={(v) => handleChange("weddingDateFormatted", v)} />
                <Input label="Formatted Time" value={data.weddingTimeFormatted} onChange={(v) => handleChange("weddingTimeFormatted", v)} />
                <Input label="Day of Week" value={data.weddingDayFormatted} onChange={(v) => handleChange("weddingDayFormatted", v)} />
             </div>
          </section>

          {/* Messages */}
          <section>
             <h2 className="text-xl font-bold text-wine-dark mb-4">Messages & Text</h2>
             <div className="space-y-4">
               <TextArea label="Hero Message" value={data.heroMessage} onChange={(v) => handleChange("heroMessage", v)} />
               <TextArea label="Quranic Verse (Arabic)" value={data.quranicVerse?.arabic || ""} onChange={(v) => handleChange("quranicVerse.arabic", v)} />
               <Input label="Quranic Verse Translation" value={data.quranicVerse?.translation || ""} onChange={(v) => handleChange("quranicVerse.translation", v)} />
               <Input label="Custom Text : Initials of Groom & Bride" value={data.customText || ""} onChange={(v) => handleChange("customText", v)} />
               
               <div className="flex flex-col gap-3 p-4 bg-white/85 rounded-xl border border-pink-border/70 shadow-xs">
                 <div className="flex items-center justify-between">
                   <label className="text-xs font-bold uppercase tracking-wider text-wine-dark">
                     JM Monogram Logo (Invitation Section)
                   </label>
                   <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-burgundy/10 text-burgundy font-bold">
                     Current Size: {data.logoSize || 240}px
                   </span>
                 </div>
                 
                 <p className="text-xs text-text-body/75">
                   Insert background-removed logo photo to replace the (JM) text in the invitation message section.
                 </p>
                 
                 <input 
                   type="file" 
                   accept="image/*"
                   onChange={(e) => handleSingleImageUpload(e, 'jmLogoUrl')}
                   className="w-full text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer"
                 />
                 <Input label="Or JM Logo Image URL" value={data.jmLogoUrl || ""} onChange={(v) => handleChange("jmLogoUrl", v)} />
                 
                 {/* LOGO SIZE CONTROLS (Option to Increase or Decrease Logo Size) */}
                 <div className="mt-2 pt-3 border-t border-pink-border/60 flex flex-col gap-3">
                   <div className="flex items-center justify-between">
                     <div>
                       <span className="text-xs font-bold uppercase tracking-wider text-wine-dark block">
                         Logo Size Controls
                       </span>
                       <span className="text-[11px] text-text-body/70">
                         Increase or decrease the logo size on the invitation page
                       </span>
                     </div>
                     <div className="flex items-center gap-1.5">
                       <span className="text-xs font-bold text-burgundy bg-pink-50 border border-pink-border px-2.5 py-1 rounded-md">
                         {data.logoSize || 240} px
                       </span>
                     </div>
                   </div>

                   {/* Step Increase / Decrease Buttons */}
                   <div className="grid grid-cols-4 gap-2">
                     <button
                       type="button"
                       onClick={() => {
                         const current = data.logoSize || 240;
                         handleChange("logoSize", Math.max(80, current - 25));
                       }}
                       className="py-1.5 px-2 bg-pink-50 hover:bg-pink-100 text-wine-dark font-sans text-xs font-bold rounded-lg border border-pink-border/80 transition-colors flex items-center justify-center gap-1 active:scale-95"
                     >
                       - 25px
                     </button>
                     <button
                       type="button"
                       onClick={() => {
                         const current = data.logoSize || 240;
                         handleChange("logoSize", Math.max(80, current - 10));
                       }}
                       className="py-1.5 px-2 bg-pink-50 hover:bg-pink-100 text-wine-dark font-sans text-xs font-bold rounded-lg border border-pink-border/80 transition-colors flex items-center justify-center gap-1 active:scale-95"
                     >
                       - 10px
                     </button>
                     <button
                       type="button"
                       onClick={() => {
                         const current = data.logoSize || 240;
                         handleChange("logoSize", Math.min(500, current + 10));
                       }}
                       className="py-1.5 px-2 bg-burgundy/10 hover:bg-burgundy/20 text-burgundy font-sans text-xs font-bold rounded-lg border border-burgundy/30 transition-colors flex items-center justify-center gap-1 active:scale-95"
                     >
                       + 10px
                     </button>
                     <button
                       type="button"
                       onClick={() => {
                         const current = data.logoSize || 240;
                         handleChange("logoSize", Math.min(500, current + 25));
                       }}
                       className="py-1.5 px-2 bg-burgundy/10 hover:bg-burgundy/20 text-burgundy font-sans text-xs font-bold rounded-lg border border-burgundy/30 transition-colors flex items-center justify-center gap-1 active:scale-95"
                     >
                       + 25px
                     </button>
                   </div>

                   {/* Smooth Range Slider */}
                   <div className="flex items-center gap-3">
                     <span className="text-[11px] text-text-body/70 font-sans whitespace-nowrap">Smaller (80px)</span>
                     <input 
                       type="range" 
                       min="80" 
                       max="450" 
                       step="5" 
                       value={data.logoSize || 240} 
                       onChange={(e) => handleChange("logoSize", Number(e.target.value))}
                       className="flex-1 accent-burgundy cursor-pointer h-2 bg-pink-border/40 rounded-lg"
                     />
                     <span className="text-[11px] text-text-body/70 font-sans whitespace-nowrap">Bigger (450px)</span>
                   </div>

                   {/* Quick Preset Buttons */}
                   <div className="flex flex-wrap items-center gap-1.5">
                     <span className="text-[10px] uppercase font-bold text-text-body/60 mr-1">Presets:</span>
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
                             ? "bg-burgundy text-white border-burgundy shadow-xs"
                             : "bg-white/80 text-wine-dark/80 border-pink-border hover:bg-pink-50"
                         }`}
                       >
                         {preset.label} ({preset.size}px)
                       </button>
                     ))}
                   </div>

                   {/* Live Preview Box in Admin */}
                   <div className="mt-2 p-3 bg-blush-light rounded-xl border border-pink-border flex flex-col items-center">
                     <div className="w-full flex justify-between items-center mb-2 pb-1.5 border-b border-pink-border/50 text-[11px]">
                       <span className="text-text-body/70 font-medium">Live Admin Preview:</span>
                       <span className="text-burgundy font-bold">Rendered Height: {data.logoSize || 240}px</span>
                     </div>
                     {data.jmLogoUrl ? (
                       <div className="w-full flex flex-col items-center justify-center p-2 min-h-[120px] bg-white/40 rounded-lg overflow-hidden">
                         <img 
                           src={data.jmLogoUrl} 
                           style={{ 
                             height: `${Math.min(data.logoSize || 240, 260)}px`,
                             maxHeight: '260px'
                           }} 
                           className="w-auto object-contain drop-shadow-md transition-all duration-200" 
                           alt="JM Logo Preview" 
                         />
                         {(data.logoSize || 240) > 260 && (
                           <span className="text-[10px] text-text-body/60 mt-1 italic">
                             (Preview scaled in admin panel; on invitation website will render full {data.logoSize || 240}px)
                           </span>
                         )}
                       </div>
                     ) : (
                       <div className="text-xs text-text-body/60 py-4 text-center">
                         Upload a logo to see live scaling preview
                       </div>
                     )}
                     {data.jmLogoUrl && (
                       <button 
                         type="button" 
                         onClick={() => handleChange("jmLogoUrl", "")}
                         className="mt-2 text-xs text-red-500 hover:underline font-sans"
                       >
                         Remove Logo (Revert to (JM) text)
                       </button>
                     )}
                   </div>
                 </div>
               </div>
               
               <TextArea label="Wedding Invitation Message (Arabic & English)" value={data.invitationMessage} onChange={(v) => handleChange("invitationMessage", v)} />
               <TextArea label="Transportation Details" value={data.transportation} onChange={(v) => handleChange("transportation", v)} />
               <Input label="Dress Code" value={data.dressCode} onChange={(v) => handleChange("dressCode", v)} />
               <TextArea label="Closing Message (Small line just below logo at end of website)" value={data.closingMessage} onChange={(v) => handleChange("closingMessage", v)} />
             </div>
          </section>

          {/* Events */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Events</h2>
            <div className="space-y-4">
              {data.events.map((event, idx) => (
                <div key={event.id || idx} className="bg-blush-light p-4 rounded-lg border border-pink-border/50 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-wine-dark">Event {idx + 1}</h3>
                    <button onClick={() => {
                      const newEvents = [...data.events];
                      newEvents.splice(idx, 1);
                      handleChange("events", newEvents);
                    }} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-sm">Remove</button>
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
              <button onClick={() => {
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
              }} className="text-wine-dark hover:bg-blush-light px-4 py-2 rounded-md border border-pink-border w-full text-center">
                + Add Event
              </button>
            </div>
          </section>

          {/* Media Settings */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-wine-dark flex items-center gap-2 flex-wrap">
                <span>Media Settings &amp; Files</span>
                <span className="text-xs bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full font-mono font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Saved in dedicated remix_isolated_files
                </span>
              </h2>
            </div>
            <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
              
              {/* HERO SECTION DISPLAY MODE & TEXT CONTROLS */}
              <div className="flex flex-col gap-4 p-4 bg-white rounded-xl border border-pink-border shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-pink-border/60">
                  <div>
                    <h3 className="font-bold text-wine-dark text-base flex items-center gap-2">
                      <Film className="w-4 h-4 text-burgundy" />
                      Hero Section Style &amp; Content
                    </h3>
                    <p className="text-xs text-text-body/75 font-sans mt-0.5">
                      Switch between the 9:16 Royal Islamic Video Card (with text &amp; background video) and Photo Only mode.
                    </p>
                  </div>

                  {/* Mode Switcher Buttons */}
                  <div className="flex items-center gap-1.5 p-1 bg-blush-main/60 rounded-lg border border-pink-border/60 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleChange("heroDisplayMode", "video_with_text")}
                      className={`px-3 py-1.5 rounded-md text-xs font-sans font-bold transition-all cursor-pointer ${
                        (data.heroDisplayMode || "video_with_text") === "video_with_text"
                          ? "bg-burgundy text-white shadow-xs"
                          : "text-wine-dark hover:bg-white"
                      }`}
                    >
                      Royal Video &amp; Text Card
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange("heroDisplayMode", "photo")}
                      className={`px-3 py-1.5 rounded-md text-xs font-sans font-bold transition-all cursor-pointer ${
                        data.heroDisplayMode === "photo"
                          ? "bg-burgundy text-white shadow-xs"
                          : "text-wine-dark hover:bg-white"
                      }`}
                    >
                      Photo Only Mode
                    </button>
                  </div>
                </div>

                {/* Content for Royal Islamic Video & Text Mode */}
                {(data.heroDisplayMode || "video_with_text") === "video_with_text" ? (
                  <div className="space-y-4 pt-1">
                    <div className="p-3 bg-gradient-to-r from-navy/5 via-gold/10 to-transparent rounded-lg border border-pink-border/50 text-xs text-wine-dark">
                      <span className="font-bold text-burgundy">Active Mode: </span>
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

                    {/* Hero Background Video URL */}
                    <div className="pt-2 border-t border-pink-border/50">
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
                    <p className="text-xs text-text-body/75">
                      Upload or link a portrait photo to replace the entire hero section with ambient motion.
                    </p>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleSingleImageUpload(e, 'heroImageUrl')}
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer"
                    />
                    <Input label="Or Direct Hero Photo URL" value={data.heroImageUrl || ""} onChange={(v) => handleChange("heroImageUrl", v)} />
                    {data.heroImageUrl && (
                      <div className="relative inline-block w-36 h-48 mt-2">
                        <img src={data.heroImageUrl} className="w-36 h-48 object-cover rounded-md border border-pink-border shadow-md" alt="Hero Photo Preview" />
                        <span className="absolute bottom-2 left-2 bg-wine-dark text-white text-[9px] px-1.5 py-0.5 rounded font-sans font-bold shadow-xs">
                          Active Hero Photo
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Opening Thumbnail (Click to Enter)</h3>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleSingleImageUpload(e, 'openingThumbnailUrl')}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer"
                />
                <Input label="Or Thumbnail URL" value={data.openingThumbnailUrl || ""} onChange={(v) => handleChange("openingThumbnailUrl", v)} />
                {data.openingThumbnailUrl && (
                  <div className="relative inline-block w-24 h-24 mt-2">
                    <img src={data.openingThumbnailUrl} className="w-24 h-24 object-cover rounded-md border border-pink-border shadow-xs" alt="Thumbnail Preview" />
                    <span className="absolute bottom-1 right-1 bg-wine-dark text-white text-[9px] px-1 rounded font-mono">Remix</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Opening Video</h3>
                <p className="text-xs opacity-70">Plays immediately after clicking the thumbnail. Must be a direct URL (e.g., .mp4).</p>
                <Input label="Video URL" value={data.openingVideoUrl || ""} onChange={(v) => handleChange("openingVideoUrl", v)} />
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">OG Image URL (Social Sharing Preview)</h3>
                <p className="text-xs opacity-70">Image shown when sharing the link on WhatsApp, Facebook, etc.</p>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleSingleImageUpload(e, 'ogImageUrl')}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer"
                />
                <Input label="Or Direct Image URL" value={data.ogImageUrl || ""} onChange={(v) => handleChange("ogImageUrl", v)} />
                {data.ogImageUrl && (
                  <img src={data.ogImageUrl} className="w-28 h-16 object-cover rounded-md mt-2 border border-pink-border shadow-xs" alt="OG Preview" />
                )}
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Hero Section Video</h3>
                <p className="text-xs opacity-70">Background video for the first section. Must be a direct URL (e.g., .mp4).</p>
                <Input label="Hero Video URL" value={data.heroVideoUrl || ""} onChange={(v) => handleChange("heroVideoUrl", v)} />
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Background Music</h3>
                <p className="text-xs opacity-70">Direct link to an audio file (e.g., .mp3) to play in the background.</p>
                <Input label="Music URL" value={data.musicUrl || ""} onChange={(v) => handleChange("musicUrl", v)} />
              </div>
            </div>
          </section>

          {/* Photo Gallery & Album Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-wine-dark">Photo Gallery & Album Files</h2>
                <p className="text-xs text-text-body/70 font-sans">
                  Upload images or provide image URLs. Files added here are saved strictly into isolated remix fields.
                </p>
              </div>
              <button 
                type="button"
                onClick={addImage}
                className="flex items-center gap-1.5 bg-burgundy text-white px-3 py-1.5 rounded-md hover:bg-wine-dark text-xs font-bold transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Photo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data.gallery || []).map((imgUrl, idx) => (
                <div key={idx} className="bg-blush-light p-3.5 rounded-lg border border-pink-border/60 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-wine-dark">Photo {idx + 1}</span>
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, idx)}
                    className="w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-wine-dark file:text-white hover:file:bg-burgundy cursor-pointer"
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
                        className="w-full h-32 object-cover rounded-md border border-pink-border shadow-xs" 
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {(data.gallery || []).length === 0 && (
              <div className="p-6 text-center border border-dashed border-pink-border rounded-lg bg-blush-light/50">
                <p className="text-xs text-text-body/60 italic font-sans mb-3">No photos currently added to the gallery.</p>
                <button 
                  type="button"
                  onClick={addImage}
                  className="inline-flex items-center gap-1.5 bg-burgundy text-white px-3.5 py-1.5 rounded-md hover:bg-wine-dark text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add First Photo
                </button>
              </div>
            )}
          </section>

          {/* Venue Settings */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Venue Details</h2>
            <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
              <Input label="Venue Name" value={data.venue.name} onChange={(v) => handleChange("venue.name", v)} />
              <Input label="Address Line 1" value={data.venue.addressLine1} onChange={(v) => handleChange("venue.addressLine1", v)} />
              <Input label="Address Line 2" value={data.venue.addressLine2} onChange={(v) => handleChange("venue.addressLine2", v)} />
              <Input label="Google Maps URL" value={data.venue.mapUrl} onChange={(v) => handleChange("venue.mapUrl", v)} />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string, value: string, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</label>
      <textarea 
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent resize-y"
      />
    </div>
  );
}
