export type ThemePreference = 'LIGHT' | 'DARK' | 'SYSTEM';

export interface CustomCategoryRecord {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsProfile {
  name: string;
  email: string;
  bio: string | null;
  image: string | null;
  preferredTheme: ThemePreference;
  preferredCurrency: string;
  lastExportedAt: string | null;
  customCategories: CustomCategoryRecord[];
}

export interface ProfileUpdatePayload {
  name: string;
  bio?: string;
  image?: string;
}

export interface PasswordUpdatePayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PreferencesUpdatePayload {
  preferredTheme?: ThemePreference;
}

export interface CustomCategoryPayload {
  name: string;
}

export interface DeleteAccountPayload {
  confirmation: string;
}