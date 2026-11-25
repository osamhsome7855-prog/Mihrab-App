export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type CalculationMethodKey =
  | 'UmmAlQura'
  | 'Egyptian'
  | 'MuslimWorldLeague'
  | 'Karachi'
  | 'NorthAmerica'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait';

export type MadhhabKey = 'Shafi' | 'Hanafi';

export type ToneCategory = 'adhan' | 'adhkar' | 'prePrayer';

export type ToneId =
  | 'makkah_chime'
  | 'fajr_calm'
  | 'takbir_dew'
  | 'morning_breeze'
  | 'evening_calm'
  | 'musk_bowl'
  | 'gentle_bell';

export interface ToneDefinition {
  id: ToneId;
  nameAr: string;
  descriptionAr: string;
  category: ToneCategory;
  durationLabel: string;
}

export interface CityPreset {
  id: string;
  nameAr: string;
  countryAr: string;
  lat: number;
  lng: number;
  method: CalculationMethodKey;
}

export type DhikrCategory = 'morning' | 'evening' | 'afterPrayer' | 'sleep' | 'custom';

export interface DhikrItem {
  id: string;
  category: DhikrCategory;
  text: string;
  targetCount: number;
  reference: string;
  virtue?: string;
  isCustom?: boolean;
}

export interface AppSettings {
  userName: string;
  theme: 'light' | 'dark';
  locationMode: 'preset' | 'gps';
  selectedCityId: string;
  customLat: number;
  customLng: number;
  customLocationName: string;
  calculationMethod: CalculationMethodKey;
  madhhab: MadhhabKey;
  notificationsEnabled: boolean;
  prayerAlerts: Record<Exclude<PrayerKey, 'sunrise'>, boolean>;
  prePrayerMinutes: 0 | 10 | 15 | 20;
  morningAdhkarTime: string;
  eveningAdhkarTime: string;
  morningAdhkarEnabled: boolean;
  eveningAdhkarEnabled: boolean;
  adhanTone: ToneId;
  adhkarTone: ToneId;
  prePrayerTone: ToneId;
  volume: number;
  autoAdvanceDhikr: boolean;
  hapticEnabled: boolean;
}

export interface ActiveAlertBanner {
  id: string;
  title: string;
  message: string;
  type: 'adhan' | 'adhkar' | 'prePrayer';
  timestamp: string;
}

export type ActiveTab = 'prayers' | 'adhkar' | 'tasbih' | 'settings';

export interface PrayerScheduleItem {
  key: PrayerKey;
  nameAr: string;
  time: Date;
  formattedTime: string;
  isNext: boolean;
  isCurrent: boolean;
  isAlertable: boolean;
}

export interface ComputedPrayerState {
  schedule: PrayerScheduleItem[];
  nextPrayer: {
    key: PrayerKey;
    nameAr: string;
    time: Date;
    formattedTime: string;
  };
  currentPrayerKey: PrayerKey | null;
  countdown: {
    hours: string;
    minutes: string;
    seconds: string;
    totalSeconds: number;
  };
  qiblaAngle: number;
  hijriDate: string;
  gregorianDate: string;
  locationLabel: string;
}
