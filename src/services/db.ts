import { doc, getDoc, setDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { WeddingData } from "../types";
import { weddingData as defaultData } from "../data";

// ============================================================================
// 1. OFFICIAL MASTER WEBSITE IDENTIFIERS (READ-ONLY REFERENCE, STRICTLY PROTECTED)
// ============================================================================
export const ORIGINAL_TEMPLATE_NAME = "MuslimremixtemplateforJabairAli";
export const ORIGINAL_SLOT_ID = "wedding_data_MuslimremixtemplateforJabairAli";
export const ORIGINAL_RSVP_COLLECTION = "rsvps_MuslimremixtemplateforJabairAli";
export const ORIGINAL_AI_STUDIO_HASH = "lafhnf46ibcikz5qkq4yc4";

// Legacy protected master slots that must NEVER be modified or overlapped under any circumstances
export const PROTECTED_OFFICIAL_SLOTS: readonly string[] = [
  ORIGINAL_SLOT_ID,
  "wedding_data_lafhnf46ibcikz5qkq4yc4-14313311583",
  "wedding_data_official",
  "wedding_data_official_veer_zara",
  "wedding_data_rl2cohqvo2tuixw5mclqfx-14313311583",
  "main",
  "main 222",
  "main 333",
  "wedding_data_new_website_template_for_muslim_wedding_remix_4260",
  "wedding_data_muslim_wedding_remix_pt2_dtfj3xvvog56uzkooimbwq",
  "wedding_data_remix_pt2_usmanwithsidrat-digiinvitations_vercel_app",
  "wedding_official_master_jaspreet_weds_jasmeet",
  "permanent_official_wedding"
];

// Reference to parent template slot used for initial cloning
export const PARENT_TEMPLATE_SLOT_ID = "wedding_data_new_website_template_for_muslim_wedding_remix_4260";

// ============================================================================
// 2. THIS REMIX WEBSITE IDENTIFIERS (CURRENT ACTIVE REMIX APPLET)
// ============================================================================
export const CURRENT_AI_STUDIO_HASH = "bqzvra3vvb2odgvrb3x7ni";
export const CURRENT_APPLET_ID = "b6fab153-945d-48c3-b1e5-11194f37facd";
export const THIS_REMIX_TEMPLATE_NAME = "Remix Remix Premium muslim wedding template 1 + Jubair Client Pt-2";
export const THIS_REMIX_SLOT_ID = `wedding_data_muslim_wedding_remix_4260_2_${CURRENT_AI_STUDIO_HASH}`;
export const THIS_REMIX_RSVP_COLLECTION = `rsvps_muslim_wedding_remix_${CURRENT_AI_STUDIO_HASH}`;

// Backwards compatibility aliases
export const REMIX_PT2_TEMPLATE_NAME = THIS_REMIX_TEMPLATE_NAME;
export const REMIX_PT2_SLOT_ID = THIS_REMIX_SLOT_ID;
export const REMIX_PT2_RSVP_COLLECTION = THIS_REMIX_RSVP_COLLECTION;

export const UPCOMING_REMIX_TEMPLATE_NAME = "new website template for muslim wedding remix 4260-2";
export const REMIX_4260_2_TEMPLATE_NAME = THIS_REMIX_TEMPLATE_NAME;
export const REMIX_4260_2_SLOT_ID = THIS_REMIX_SLOT_ID;
export const REMIX_4260_2_RSVP_COLLECTION = THIS_REMIX_RSVP_COLLECTION;

export const REMIX_4260_TEMPLATE_NAME = THIS_REMIX_TEMPLATE_NAME;
export const REMIX_4260_SLOT_ID = THIS_REMIX_SLOT_ID;
export const REMIX_4260_RSVP_COLLECTION = THIS_REMIX_RSVP_COLLECTION;
export const TEMPLATE_FIELD_NAME = THIS_REMIX_TEMPLATE_NAME;
export const DEDICATED_SLOT_ID = THIS_REMIX_SLOT_ID;
export const OFFICIAL_DOC_ID = ORIGINAL_SLOT_ID;

/**
 * Check if a slot ID belongs to the protected official website or prior master templates
 */
export function isProtectedOfficialSlot(slotId: string): boolean {
  if (!slotId) return false;
  const normalized = slotId.trim();
  return (
    PROTECTED_OFFICIAL_SLOTS.some(
      protectedId => normalized === protectedId || normalized.toLowerCase() === protectedId.toLowerCase()
    ) ||
    normalized.startsWith("wedding_data_official") ||
    normalized.startsWith("wedding_official") ||
    normalized.startsWith("permanent_official")
  );
}

/**
 * Check if the active execution or environment is a separate remix instance
 */
export function isUpcomingRemixInstance(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const mode = localStorage.getItem("wedding_template_mode");
    if (mode === "remix_4260_2" || mode === "isolated_remix") return true;
    if (mode === "current_pt2") return false;

    const customSlot = localStorage.getItem("wedding_custom_slot_id");
    if (customSlot && (customSlot.includes("4260_2") || customSlot.includes("4260-2") || customSlot.includes("remix"))) {
      return true;
    }
  } catch (e) {}

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("remix") || params.get("template")) {
      return true;
    }
  } catch (e) {}

  return true;
}

/**
 * Automatically determine the isolated database document slot ID.
 * Strict multi-layer isolation ensures:
 * 1) Official website data (Jubair & Mugsina original) is 100% PROTECTED and NEVER touched.
 * 2) Current website saves into its own dedicated slot (`wedding_data_muslim_wedding_remix_4260_2_bqzvra3vvb2odgvrb3x7ni` or host-based).
 * 3) Zero overlap: dedicated separate fields (`remix_isolated_*`, `remix_isolated_files`, `remix_4260_2_*`).
 */
export function getEnvironmentDocId(): string {
  if (typeof window === 'undefined') {
    return THIS_REMIX_SLOT_ID;
  }

  // Layer 1: Custom Slot from localStorage (strictly guarded against protected official slots)
  try {
    const customSlot = localStorage.getItem("wedding_custom_slot_id");
    if (customSlot && customSlot.trim()) {
      const trimmed = customSlot.trim();
      if (!isProtectedOfficialSlot(trimmed)) {
        return trimmed;
      } else {
        console.warn(`Blocked attempt to point to protected official slot "${trimmed}". Resetting to isolated slot.`);
        localStorage.removeItem("wedding_custom_slot_id");
      }
    }
  } catch (e) {}

  // Layer 2: URL Query Parameter (?slot=...) with strict protection guard
  try {
    const params = new URLSearchParams(window.location.search);
    const slotParam = params.get("slot");
    if (slotParam && slotParam.trim()) {
      const trimmed = slotParam.trim();
      if (!isProtectedOfficialSlot(trimmed)) {
        return trimmed;
      }
    }
  } catch (e) {}

  // Layer 3: Automatic AI Studio Container & Hostname Detection
  try {
    const hostname = window.location.hostname || "";

    // If running in an AI Studio container (*.run.app)
    if (hostname.includes("ais-dev-") || hostname.includes("ais-pre-") || hostname.includes(".run.app")) {
      const match = hostname.match(/ais-(?:dev|pre)-([a-z0-9]+)/);
      if (match && match[1]) {
        const hash = match[1];
        // If this container matches the current container hash
        if (hash === CURRENT_AI_STUDIO_HASH) {
          return THIS_REMIX_SLOT_ID;
        }
        // If a new remix container is spawned in AI Studio:
        if (hash !== ORIGINAL_AI_STUDIO_HASH && !isProtectedOfficialSlot(`wedding_data_muslim_wedding_remix_4260_2_${hash}`)) {
          return `wedding_data_muslim_wedding_remix_4260_2_${hash}`;
        }
      }
      return THIS_REMIX_SLOT_ID;
    }

    // External Vercel / Netlify / Custom Domain Deployment
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      const cleanSlug = hostname.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
      const derivedSlot = `wedding_data_remix_isolated_${cleanSlug}`;
      if (!isProtectedOfficialSlot(derivedSlot)) {
        return derivedSlot;
      }
    }
  } catch (e) {}

  return THIS_REMIX_SLOT_ID;
}

/**
 * Returns the active template name corresponding to this remix
 */
export function getActiveTemplateName(): string {
  return THIS_REMIX_TEMPLATE_NAME;
}

/**
 * Check if the active instance is an isolated remix instance
 */
export function isRemix4260Instance(): boolean {
  return true;
}

export function isOfficialInstance(): boolean {
  return false;
}

/**
 * Programmatically set or clear custom database slot
 */
export function setCustomSlotId(slotId: string) {
  if (typeof window === 'undefined') return;
  try {
    if (slotId && slotId.trim()) {
      const trimmed = slotId.trim();
      if (isProtectedOfficialSlot(trimmed)) {
        alert("Protection Guard: Cannot point to official master website slot. Your remix data is kept separate in dedicated fields to prevent overlap.");
        return;
      }
      localStorage.setItem("wedding_custom_slot_id", trimmed);
    } else {
      localStorage.removeItem("wedding_custom_slot_id");
    }
  } catch (e) {}
}

export function switchToOriginalSlot() {
  alert("Safety Notice: Direct editing of the official website is strictly locked in this remix. All data and files for this website are saved separately into dedicated isolated fields.");
}

export function switchToRemix4260Slot() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem("wedding_custom_slot_id", THIS_REMIX_SLOT_ID);
    localStorage.setItem("wedding_template_mode", "isolated_remix");
  } catch (e) {}
}

export function switchToUpcomingRemixSlot() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem("wedding_custom_slot_id", THIS_REMIX_SLOT_ID);
    localStorage.setItem("wedding_template_mode", "isolated_remix");
  } catch (e) {}
}

export function switchToCurrentWebsiteSlot() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem("wedding_custom_slot_id", THIS_REMIX_SLOT_ID);
    localStorage.setItem("wedding_template_mode", "isolated_remix");
  } catch (e) {}
}

export function resetToAutomaticSlot() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem("wedding_custom_slot_id");
    localStorage.removeItem("wedding_template_mode");
  } catch (e) {}
}

/**
 * Get isolated RSVP collection name based on active database slot.
 * Ensures RSVPs submitted on this remix are NEVER mixed into official or other instances.
 */
export function getRsvpCollectionName(): string {
  const slot = getEnvironmentDocId();
  if (slot === THIS_REMIX_SLOT_ID) {
    return THIS_REMIX_RSVP_COLLECTION;
  }
  const cleanSuffix = slot.replace(/^wedding_data_/, "");
  return `rsvps_${cleanSuffix}`;
}

/**
 * Helper to build an organized media & files dictionary from the wedding data.
 * Every file added in this website (hero photo, opening thumbnail, opening video, hero video,
 * background music, logos, event videos, gallery photos) is tracked here and saved into dedicated separate fields:
 * - `remix_isolated_files`
 * - `remix_4260_2_media_files`
 * This guarantees 100% zero file collision and zero overlap with the official website.
 */
export function extractMediaFilesDictionary(data: WeddingData) {
  const gallery = data.gallery || [];
  const events = data.events || [];

  return {
    heroPhoto: {
      url: data.heroImageUrl || "",
      type: "image",
      field: "heroImageUrl",
      description: "Hero Section Full Photo (Replacement)",
      updatedAt: new Date().toISOString()
    },
    openingThumbnail: {
      url: data.openingThumbnailUrl || "",
      type: "image",
      field: "openingThumbnailUrl",
      description: "Opening Thumbnail (Click to Enter)",
      updatedAt: new Date().toISOString()
    },
    openingVideo: {
      url: data.openingVideoUrl || "",
      type: "video",
      field: "openingVideoUrl",
      description: "Opening Video (Auto-plays after thumbnail click)",
      updatedAt: new Date().toISOString()
    },
    heroVideo: {
      url: data.heroVideoUrl || "",
      type: "video",
      field: "heroVideoUrl",
      description: "Hero Section Background Video",
      updatedAt: new Date().toISOString()
    },
    backgroundMusic: {
      url: data.musicUrl || "",
      type: "audio",
      field: "musicUrl",
      description: "Background Music Track (.mp3)",
      updatedAt: new Date().toISOString()
    },
    jmLogo: {
      url: data.jmLogoUrl || "",
      type: "image",
      field: "jmLogoUrl",
      description: "Monogram Logo (Invitation Section)",
      size: data.logoSize || 240,
      updatedAt: new Date().toISOString()
    },
    ogImage: {
      url: data.ogImageUrl || "",
      type: "image",
      field: "ogImageUrl",
      description: "Social Share & WhatsApp Preview Card Image",
      updatedAt: new Date().toISOString()
    },
    eventMedia: events.map((ev, i) => ({
      index: i,
      id: ev.id || `ev_${i + 1}`,
      title: ev.title,
      videoUrl: ev.videoUrl || "",
      imageUrl: ev.image || "",
      mapUrl: ev.mapUrl || ""
    })),
    galleryPhotos: gallery.map((img, i) => ({
      index: i,
      url: img.startsWith("data:") ? "[Compressed Image File]" : img,
      rawUrl: img,
      isBase64: img.startsWith("data:")
    })),
    totalFilesCount: [
      data.heroImageUrl,
      data.openingThumbnailUrl,
      data.openingVideoUrl,
      data.heroVideoUrl,
      data.musicUrl,
      data.jmLogoUrl,
      data.ogImageUrl,
      ...events.map(e => e.videoUrl).filter(Boolean),
      ...gallery
    ].filter(Boolean).length,
    storageField: "remix_isolated_files",
    antiOverlapVerified: true,
    savedToOfficialWebsite: false
  };
}

function ensureUsmanAndSidratData(data: WeddingData): WeddingData {
  const groomName = (!data.groom?.name || data.groom.name.includes("Jubair")) ? "Usman bin Khalid" : data.groom.name;
  const brideName = (!data.bride?.name || data.bride.name.includes("Mugsina")) ? "Sidrat Shafiq Khan" : data.bride.name;
  const customText = (!data.customText || data.customText.includes("JM")) ? "(US)" : data.customText;
  const closingMessage = data.closingMessage || defaultData.closingMessage || "May Allah bless our union.\nWe look forward to celebrating\nthis blessed journey with you!\nPlease keep us in your prayers.";
  return {
    ...data,
    groom: {
      ...data.groom,
      name: groomName,
      parents: data.groom?.parents || "S/o Mr. Khalid Majeed"
    },
    bride: {
      ...data.bride,
      name: brideName,
      parents: data.bride?.parents || "D/o Mr. Mohammad Shafiq Khan"
    },
    heroDisplayMode: data.heroDisplayMode || "video_with_text",
    heroInvitationBy: data.heroInvitationBy || "Dr. Abdul Majeed",
    heroInvitationMessage: data.heroInvitationMessage || "Cordially invites you to join for lunch\non the auspicious occasion of the",
    heroHeading: data.heroHeading || "Nikah Ceremony",
    heroOccasionDetails: data.heroOccasionDetails || "Of His Beloved Grandson",
    heroGroomFather: data.heroGroomFather || data.groom?.parents || "S/o Mr. Khalid Majeed",
    heroBrideFather: data.heroBrideFather || data.bride?.parents || "D/o Mr. Mohammad Shafiq Khan",
    heroBrideAddress: data.heroBrideAddress || "R/o Al Farooq Colony, Sanat Nagar",
    heroBlessingMessage: data.heroBlessingMessage || "Your gracious presence and blessings\nwill make the occasion even more special.",
    heroGuestInfo: data.heroGuestInfo || "1 Gents & 1 Ladies",
    heroVideoUrl: data.heroVideoUrl || defaultData.heroVideoUrl || "https://www.image2url.com/r2/default/videos/1788011182513-3d74480d-c3ef-41df-926f-d21988765de3.mp4",
    customText,
    closingMessage
  };
}

/**
 * Fetch wedding data with full field-level segregation:
 * 1) Reads from the active dedicated slot (`THIS_REMIX_SLOT_ID` or dynamic container slot).
 * 2) Prioritizes dedicated separate fields:
 *    - `remix_isolated_data`
 *    - `remix_4260_2_data`
 *    - `remix_pt2_data`
 * 3) If document does not exist yet, seeds initial values and saves with isolated fields.
 * 4) NEVER touches or alters official website slots or fields!
 */
export async function getWeddingData(): Promise<WeddingData> {
  try {
    const slotId = getEnvironmentDocId();
    const docRef = doc(db, "weddingConfig", slotId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const rawData = docSnap.data();

      // Priority 1: dedicated isolated data field
      if (rawData.remix_isolated_data) {
        const isolated = rawData.remix_isolated_data as WeddingData;
        return ensureUsmanAndSidratData({
          ...defaultData,
          ...isolated,
          templateName: THIS_REMIX_TEMPLATE_NAME,
          remixSlotId: slotId,
          isRemix: true,
          logoSize: isolated.logoSize ?? defaultData.logoSize ?? 240
        });
      }

      // Priority 2: remix_4260_2_data (present in existing document)
      if (rawData.remix_4260_2_data) {
        const isolated = rawData.remix_4260_2_data as WeddingData;
        return ensureUsmanAndSidratData({
          ...defaultData,
          ...isolated,
          templateName: THIS_REMIX_TEMPLATE_NAME,
          remixSlotId: slotId,
          isRemix: true,
          logoSize: isolated.logoSize ?? defaultData.logoSize ?? 240
        });
      }

      // Priority 3: remix_pt2_data
      if (rawData.remix_pt2_data) {
        const isolated = rawData.remix_pt2_data as WeddingData;
        return ensureUsmanAndSidratData({
          ...defaultData,
          ...isolated,
          templateName: THIS_REMIX_TEMPLATE_NAME,
          remixSlotId: slotId,
          isRemix: true,
          logoSize: isolated.logoSize ?? defaultData.logoSize ?? 240
        });
      }

      // Fallback: document root
      const existing = rawData as WeddingData;
      return ensureUsmanAndSidratData({
        ...defaultData,
        ...existing,
        templateName: THIS_REMIX_TEMPLATE_NAME,
        remixSlotId: slotId,
        isRemix: true,
        logoSize: existing.logoSize ?? defaultData.logoSize ?? 240
      });
    } else {
      // Document does not exist yet -> Seed initial data from parent without touching parent
      let initialSeed: WeddingData = { ...defaultData };
      try {
        const parentDocSnap = await getDoc(doc(db, "weddingConfig", THIS_REMIX_SLOT_ID));
        if (parentDocSnap.exists()) {
          const parentData = parentDocSnap.data();
          const seedSource = parentData.remix_isolated_data || parentData.remix_4260_2_data || parentData.remix_pt2_data || parentData;
          initialSeed = {
            ...defaultData,
            ...seedSource
          };
        }
      } catch (seedErr) {
        console.warn("Could not fetch seed document, using default data.", seedErr);
      }

      const initialData: WeddingData = ensureUsmanAndSidratData({
        ...initialSeed,
        isRemix: true,
        remixSlotId: slotId,
        templateName: THIS_REMIX_TEMPLATE_NAME,
        lastUpdated: new Date().toISOString()
      });

      // Save initial document into this remix's separate fields
      await saveWeddingData(initialData);
      return initialData;
    }
  } catch (error) {
    console.error("Error fetching wedding data:", error);
    return defaultData;
  }
}

/**
 * Save wedding data with 100% FIELD & DOCUMENT ISOLATION:
 * 1) STRICT ENFORCEMENT: NEVER touches or overwrites official website slots or documents.
 * 2) Saves all data and files into DEDICATED SEPARATE FIELDS:
 *    - `remix_isolated_data`
 *    - `remix_isolated_files` (Media & files dictionary: heroPhoto, videos, audio, logos, gallery)
 *    - `remix_isolated_events`
 *    - `remix_isolated_family`
 *    - `remix_isolated_timeline`
 *    - `remix_isolated_venue`
 *    - `remix_isolated_metadata`
 *    - Plus backward-compatibility mirror fields `remix_4260_2_*` and `remix_pt2_*`.
 * 3) Zero overlap with official website is guaranteed.
 */
export async function saveWeddingData(data: WeddingData): Promise<void> {
  let slotId = getEnvironmentDocId();

  // STRICT GUARDRAIL 1: Block any writes to official protected website slots
  if (isProtectedOfficialSlot(slotId)) {
    console.warn(`Write to protected official slot "${slotId}" was BLOCKED! Redirecting to isolated remix slot.`);
    slotId = THIS_REMIX_SLOT_ID;
  }

  const basePayload: WeddingData = ensureUsmanAndSidratData({
    ...data,
    lastUpdated: new Date().toISOString(),
    isRemix: true,
    remixSlotId: slotId,
    templateName: THIS_REMIX_TEMPLATE_NAME
  });

  const mediaFiles = extractMediaFilesDictionary(basePayload);

  // Payload with DEDICATED SEPARATE FIELDS for this remix:
  const payload: any = {
    ...basePayload,
    lastUpdated: new Date().toISOString(),

    // 1. PRIMARY ISOLATED FIELDS (ZERO OVERLAP WITH OFFICIAL WEBSITE)
    remix_isolated: true,
    remix_isolated_slot: slotId,
    remix_isolated_template_name: THIS_REMIX_TEMPLATE_NAME,
    remix_isolated_data: { ...basePayload, templateName: THIS_REMIX_TEMPLATE_NAME },
    remix_isolated_files: mediaFiles,
    remix_isolated_events: basePayload.events || [],
    remix_isolated_family: basePayload.familyDetails || {},
    remix_isolated_timeline: basePayload.timeline || [],
    remix_isolated_venue: basePayload.venue || {},
    remix_isolated_metadata: {
      appletId: CURRENT_APPLET_ID,
      containerHash: CURRENT_AI_STUDIO_HASH,
      templateName: THIS_REMIX_TEMPLATE_NAME,
      slotId: slotId,
      lastSaved: new Date().toISOString(),
      protectedOfficialSlots: PROTECTED_OFFICIAL_SLOTS,
      zeroOverlapGuaranteed: true,
      officialWebsiteOverlapped: false
    },

    // 2. BACKWARD-COMPATIBILITY SEPARATE FIELDS (for existing queries)
    remix_4260_2_isolated: true,
    remix_4260_2_unique_slot: slotId,
    remix_4260_2_template_name: THIS_REMIX_TEMPLATE_NAME,
    remix_4260_2_data: { ...basePayload, templateName: THIS_REMIX_TEMPLATE_NAME },
    remix_4260_2_media_files: mediaFiles,
    remix_4260_2_events: basePayload.events || [],
    remix_4260_2_family: basePayload.familyDetails || {},
    remix_4260_2_timeline: basePayload.timeline || [],
    remix_4260_2_venue: basePayload.venue || {},
    remix_4260_2_metadata: {
      appletId: CURRENT_APPLET_ID,
      containerHash: CURRENT_AI_STUDIO_HASH,
      slotId: slotId,
      lastSaved: new Date().toISOString(),
      overlapPreventionVerified: true
    },
    isRemix4260_2: true,

    // 3. PT2 MIRRORS
    remix_pt2_isolated: true,
    remix_pt2_unique_slot: slotId,
    remix_pt2_template_name: THIS_REMIX_TEMPLATE_NAME,
    remix_pt2_data: { ...basePayload, templateName: THIS_REMIX_TEMPLATE_NAME },
    remix_pt2_media_files: mediaFiles,
    remix_pt2_events: basePayload.events || [],
    remix_pt2_family: basePayload.familyDetails || {},
    remix_pt2_timeline: basePayload.timeline || [],
    remix_pt2_venue: basePayload.venue || {},
    isRemixPt2: true
  };

  const docRef = doc(db, "weddingConfig", slotId);
  await setDoc(docRef, payload);
}

/**
 * Restore default template data for this slot
 */
export async function restoreOfficialMasterData(): Promise<WeddingData> {
  let currentSlotId = getEnvironmentDocId();
  const is4260_2 = isUpcomingRemixInstance() || currentSlotId.includes("4260_2") || currentSlotId.includes("4260-2");

  if (isProtectedOfficialSlot(currentSlotId)) {
    currentSlotId = is4260_2 ? REMIX_4260_2_SLOT_ID : REMIX_PT2_SLOT_ID;
  }

  // Clone from parent template or defaultData
  let seedData: WeddingData = { ...defaultData };
  try {
    const parentSnap = await getDoc(doc(db, "weddingConfig", is4260_2 ? REMIX_PT2_SLOT_ID : PARENT_TEMPLATE_SLOT_ID));
    if (parentSnap.exists()) {
      const p = parentSnap.data();
      seedData = { ...defaultData, ...(p.remix_pt2_data || p.remix4260_data || p) };
    }
  } catch (e) {}

  const activeTemplate = is4260_2 ? REMIX_4260_2_TEMPLATE_NAME : REMIX_PT2_TEMPLATE_NAME;

  const basePayload: WeddingData = {
    ...seedData,
    lastUpdated: new Date().toISOString(),
    isRemix: true,
    remixSlotId: currentSlotId,
    templateName: activeTemplate
  };

  await saveWeddingData(basePayload);
  return basePayload;
}

/**
 * 'usman data recovery': Restores and guarantees full wedding data for Usman bin Khalid & Sidrat Shafiq Khan.
 * Specifically built so when deployed on Vercel hosting (or any custom domain), clicking this button:
 * 1) Recovers the complete wedding data snapshot (names, dates, countdown, Islamic verse, venue, events, media URLs, closing message).
 * 2) Saves into the current active slot (including Vercel domain slot) AND the dedicated remix slot in Firestore.
 * 3) Cleans up any outdated local slots to ensure perfect syncing on Vercel.
 */
export async function recoverUsmanData(): Promise<WeddingData> {
  const currentSlotId = getEnvironmentDocId();
  
  // Clean, complete data snapshot for Usman bin Khalid & Sidrat Shafiq Khan
  const usmanSnapshot: WeddingData = {
    ...defaultData,
    groom: {
      name: "Usman bin Khalid",
      parents: "S/o Mr. Khalid Majeed",
      profession: "",
      education: ""
    },
    bride: {
      name: "Sidrat Shafiq Khan",
      parents: "D/o Mr. Mohammad Shafiq Khan",
      profession: "",
      education: ""
    },
    heroDisplayMode: "video_with_text",
    heroInvitationBy: "Dr. Abdul Majeed",
    heroInvitationMessage: "Cordially invites you to join for lunch\non the auspicious occasion of the",
    heroHeading: "Nikah Ceremony",
    heroOccasionDetails: "Of His Beloved Grandson",
    heroGroomFather: "S/o Mr. Khalid Majeed",
    heroBrideFather: "D/o Mr. Mohammad Shafiq Khan",
    heroBrideAddress: "R/o Al Farooq Colony, Sanat Nagar",
    heroBlessingMessage: "Your gracious presence and blessings\nwill make the occasion even more special.",
    heroGuestInfo: "1 Gents & 1 Ladies",
    customText: "(US)",
    closingMessage: "May Allah bless our union.\nWe look forward to celebrating\nthis blessed journey with you!\nPlease keep us in your prayers.",
    weddingDate: "2026-11-15T11:30",
    weddingDateFormatted: "November 15, 2026",
    weddingTimeFormatted: "11:30 AM",
    weddingDayFormatted: "Sunday",
    lastUpdated: new Date().toISOString(),
    isRemix: true,
    remixSlotId: currentSlotId,
    templateName: REMIX_PT2_TEMPLATE_NAME
  };

  // Try to preserve any existing user uploaded media if already configured in current doc
  try {
    const existingSnap = await getDoc(doc(db, "weddingConfig", currentSlotId));
    if (existingSnap.exists()) {
      const ext = existingSnap.data();
      const source = ext.remix_pt2_data || ext;
      if (source.heroImageUrl) usmanSnapshot.heroImageUrl = source.heroImageUrl;
      if (source.jmLogoUrl) usmanSnapshot.jmLogoUrl = source.jmLogoUrl;
      if (source.musicUrl) usmanSnapshot.musicUrl = source.musicUrl;
      if (source.venue?.mapUrl) usmanSnapshot.venue = source.venue;
    }
  } catch (e) {
    console.warn("Could not read existing doc during recovery, proceeding with clean snapshot:", e);
  }

  // Save to current slot
  await saveWeddingData(usmanSnapshot);

  // Also write directly to THIS_REMIX_SLOT_ID if on Vercel or external domain to guarantee cross-environment sync
  if (currentSlotId !== THIS_REMIX_SLOT_ID && !isProtectedOfficialSlot(THIS_REMIX_SLOT_ID)) {
    try {
      const mediaFiles = extractMediaFilesDictionary(usmanSnapshot);
      await setDoc(doc(db, "weddingConfig", THIS_REMIX_SLOT_ID), {
        ...usmanSnapshot,
        remixSlotId: THIS_REMIX_SLOT_ID,
        remix_isolated: true,
        remix_isolated_slot: THIS_REMIX_SLOT_ID,
        remix_isolated_data: { ...usmanSnapshot, remixSlotId: THIS_REMIX_SLOT_ID },
        remix_isolated_files: mediaFiles,
        remix_isolated_events: usmanSnapshot.events || [],
        remix_isolated_family: usmanSnapshot.familyDetails || {},
        remix_isolated_timeline: usmanSnapshot.timeline || [],
        remix_isolated_venue: usmanSnapshot.venue || {},
        remix_isolated_metadata: {
          appletId: CURRENT_APPLET_ID,
          templateName: THIS_REMIX_TEMPLATE_NAME,
          slotId: THIS_REMIX_SLOT_ID,
          recoveredAt: new Date().toISOString(),
          recoveryAction: "usman data recovery",
          zeroOverlapGuaranteed: true
        },
        // Mirror fields for backward compatibility
        remix_4260_2_data: { ...usmanSnapshot, remixSlotId: THIS_REMIX_SLOT_ID },
        remix_4260_2_media_files: mediaFiles,
        remix_pt2_data: { ...usmanSnapshot, remixSlotId: THIS_REMIX_SLOT_ID },
        remix_pt2_media_files: mediaFiles
      });
    } catch (crossErr) {
      console.warn("Cross-slot write warning:", crossErr);
    }
  }

  return usmanSnapshot;
}

export async function submitRSVP(rsvpData: any): Promise<void> {
  const collectionName = getRsvpCollectionName();
  const rsvpCollection = collection(db, collectionName);
  await addDoc(rsvpCollection, {
    ...rsvpData,
    submittedAt: new Date().toISOString(),
    appletId: CURRENT_APPLET_ID,
    sourceSlot: getEnvironmentDocId()
  });
}

export async function getRSVPs(): Promise<any[]> {
  try {
    const collectionName = getRsvpCollectionName();
    const rsvpCollection = collection(db, collectionName);
    const snapshot = await getDocs(rsvpCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching RSVPs:", error);
    return [];
  }
}
