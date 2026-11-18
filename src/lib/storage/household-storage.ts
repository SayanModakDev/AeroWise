import { DEFAULT_HOUSEHOLD_PROFILE, HouseholdProfile } from '@/types/household';

const STORAGE_KEY = 'aerowise_household_profile_v1';
const CHECKLIST_STORAGE_KEY = 'aerowise_daily_checklist_v1';

export function loadHouseholdProfile(): HouseholdProfile {
  if (typeof window === 'undefined') {
    return DEFAULT_HOUSEHOLD_PROFILE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_HOUSEHOLD_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_HOUSEHOLD_PROFILE,
      ...parsed,
    };
  } catch (e) {
    console.error('Failed to load profile from localStorage:', e);
    return DEFAULT_HOUSEHOLD_PROFILE;
  }
}

export function saveHouseholdProfile(profile: HouseholdProfile): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage:', e);
  }
}

export function resetHouseholdProfile(): HouseholdProfile {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to reset profile in localStorage:', e);
    }
  }
  return { ...DEFAULT_HOUSEHOLD_PROFILE };
}

export function loadCompletedChecklist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCompletedChecklist(completedIds: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      CHECKLIST_STORAGE_KEY,
      JSON.stringify(completedIds)
    );
  } catch (e) {
    console.error('Failed to save checklist:', e);
  }
}
