export type UserRole = "guest" | "staff" | "admin";
export type StaffRole = "security" | "medical" | "manager";
export type SupportedLanguage = "en" | "hi" | "ta" | "bn" | "te" | "mr" | "gu" | "kn" | "ml" | "pa";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  language: SupportedLanguage;
  hotelId: string;
  roomNumber?: string;
  floor?: number;
  staffRole?: StaffRole;
  fcmToken?: string;
  createdAt: string;
}

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  hi: "हिंदी (Hindi)",
  ta: "தமிழ் (Tamil)",
  bn: "বাংলা (Bengali)",
  te: "తెలుగు (Telugu)",
  mr: "मराठी (Marathi)",
  gu: "ગુજરાતી (Gujarati)",
  kn: "ಕನ್ನಡ (Kannada)",
  ml: "മലയാളം (Malayalam)",
  pa: "ਪੰਜਾਬੀ (Punjabi)",
};
