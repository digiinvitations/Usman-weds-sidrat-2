export interface Person {
  name: string;
  parents: string;
  education: string;
  profession: string;
}

export interface EventDetails {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  icon?: string;
  image?: string;
  videoUrl?: string;
  mapUrl?: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
}

export interface VenueDetails {
  name: string;
  addressLine1: string;
  addressLine2: string;
  mapUrl: string;
}

export interface BrotherFamily {
  name: string;
  wife?: string;
  child?: string;
}

export interface FamilyDetails {
  brideSide: {
    father: string;
    mother: string;
    sisters?: string[];
  };
  groomSide: {
    father: string;
    mother: string;
    brothers?: BrotherFamily[];
  };
}

export interface QuranicVerse {
  arabic: string;
  translation: string;
}

export interface WeddingData {
  groom: Person;
  bride: Person;
  weddingDate: string; // ISO format for countdown
  weddingDateFormatted: string;
  weddingTimeFormatted: string;
  weddingDayFormatted: string;
  openingThumbnailUrl?: string;
  openingVideoUrl?: string;
  heroVideoUrl?: string;
  heroImageUrl?: string;
  heroDisplayMode?: 'video_with_text' | 'photo';
  heroInvitationBy?: string;
  heroInvitationMessage?: string;
  heroHeading?: string;
  heroOccasionDetails?: string;
  heroGroomFather?: string;
  heroBrideFather?: string;
  heroBrideAddress?: string;
  heroBlessingMessage?: string;
  heroGuestInfo?: string;
  ogImageUrl?: string;
  heroMessage: string;
  invitationMessage: string;
  customText?: string;
  jmLogoUrl?: string;
  logoSize?: number;
  quranicVerse?: QuranicVerse;
  familyDetails?: FamilyDetails;
  events: EventDetails[];
  timeline: TimelineItem[];
  venue: VenueDetails;
  transportation: string;
  dressCode: string;
  gallery: string[];
  musicUrl: string;
  closingMessage: string;
  templateName?: string;
  isRemix?: boolean;
  remixSlotId?: string;
  lastUpdated?: string;
}
