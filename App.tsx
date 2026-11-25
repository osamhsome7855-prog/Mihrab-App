import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertBanner } from './components/AlertBanner';
import { AdhkarView } from './components/AdhkarView';
import { Header } from './components/Header';
import { PrayerDashboard } from './components/PrayerDashboard';
import { SettingsView } from './components/SettingsView';
import { TasbihView } from './components/TasbihView';
import { ADHKAR_COLLECTION } from './data/adhkar';
import { useNotificationScheduler } from './hooks/useNotificationScheduler';
import { ActiveAlertBanner, ActiveTab, AppSettings, DhikrItem, PrayerKey } from './types';
import { computePrayerState } from './utils/prayerService';
import {
  DEFAULT_SETTINGS,
  getTodayKey,
  loadCustomAdhkar,
  loadDailyDhikrProgress,
  loadSettings,
  loadTasbihState,
  saveCustomAdhkar,
  saveDailyDhikrProgress,
  saveSettings,
  saveTasbihState,
  TasbihStoredState,
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('prayers');
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [now, setNow] = useState<Date>(() => new Date());
  const [activeAlert, setActiveAlert] = useState<ActiveAlertBanner | null>(null);

  const [dhikrProgress, setDhikrProgress] = useState(() => loadDailyDhikrProgress());
  const [customAdhkar, setCustomAdhkar] = useState<DhikrItem[]>(() => loadCustomAdhkar());
  const [tasbih, setTasbih] = useState<TasbihStoredState>(() => loadTasbihState());

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveSettings(settings);
  }, [settings]);

  // Real-time 1-second ticker for live countdown
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const prayerState = useMemo(() => computePrayerState(settings, now), [settings, now]);

  const handleTriggerAlert = useCallback((alert: ActiveAlertBanner) => {
    setActiveAlert(alert);
  }, []);

  useNotificationScheduler(settings, prayerState, handleTriggerAlert);

  const handleUpdateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleTogglePrayerAlert = useCallback((key: Exclude<PrayerKey, 'sunrise'>) => {
    setSettings((prev) => ({
      ...prev,
      prayerAlerts: {
        ...prev.prayerAlerts,
        [key]: !prev.prayerAlerts[key],
      },
    }));
  }, []);

  const handleToggleTheme = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const handleIncrementDhikr = useCallback((id: string, targetCount: number) => {
    setDhikrProgress((prev) => {
      const todayKey = getTodayKey();
      const baseCounts = prev.dateKey === todayKey ? prev.counts : {};
      const current = baseCounts[id] || 0;
      const next = Math.min(targetCount, current + 1);
      const updated = {
        dateKey: todayKey,
        counts: {
          ...baseCounts,
          [id]: next,
        },
      };
      saveDailyDhikrProgress(updated);
      return updated;
    });
  }, []);

  const handleResetDhikrCategory = useCallback((ids: string[]) => {
    setDhikrProgress((prev) => {
      const todayKey = getTodayKey();
      const nextCounts = { ...prev.counts };
      ids.forEach((id) => {
        delete nextCounts[id];
      });
      const updated = { dateKey: todayKey, counts: nextCounts };
      saveDailyDhikrProgress(updated);
      return updated;
    });
  }, []);

  const handleAddCustomDhikr = useCallback(
    (text: string, targetCount: number, virtue: string) => {
      const newItem: DhikrItem = {
        id: `custom-${Date.now()}`,
        category: 'custom',
        text,
        targetCount,
        reference: 'ذكر خاص',
        virtue: virtue || undefined,
        isCustom: true,
      };
      setCustomAdhkar((prev) => {
        const next = [newItem, ...prev];
        saveCustomAdhkar(next);
        return next;
      });
    },
    []
  );

  const handleDeleteCustomDhikr = useCallback((id: string) => {
    setCustomAdhkar((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveCustomAdhkar(next);
      return next;
    });
  }, []);

  const handleUpdateTasbih = useCallback(
    (updater: (prev: TasbihStoredState) => TasbihStoredState) => {
      setTasbih((prev) => {
        const next = updater(prev);
        saveTasbihState(next);
        return next;
      });
    },
    []
  );

  const handleResetDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const allAdhkar = useMemo(() => [...ADHKAR_COLLECTION, ...customAdhkar], [customAdhkar]);
  const adhkarCompletedCount = useMemo(
    () =>
      allAdhkar.filter((item) => (dhikrProgress.counts[item.id] || 0) >= item.targetCount).length,
    [allAdhkar, dhikrProgress.counts]
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0B162C] transition-colors duration-200 dark:bg-[#081120] dark:text-[#F3EFE6]">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
      />

      <AlertBanner alert={activeAlert} onDismiss={() => setActiveAlert(null)} />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8 md:pb-12 lg:px-8">
        {activeTab === 'prayers' && (
          <PrayerDashboard
            prayerState={prayerState}
            settings={settings}
            onTogglePrayerAlert={handleTogglePrayerAlert}
            onNavigate={setActiveTab}
            adhkarCompletedCount={adhkarCompletedCount}
            adhkarTotalCount={allAdhkar.length}
          />
        )}

        {activeTab === 'adhkar' && (
          <AdhkarView
            settings={settings}
            counts={dhikrProgress.counts}
            onIncrementDhikr={handleIncrementDhikr}
            onResetCategory={handleResetDhikrCategory}
            customAdhkar={customAdhkar}
            onAddCustomDhikr={handleAddCustomDhikr}
            onDeleteCustomDhikr={handleDeleteCustomDhikr}
            onToggleAutoAdvance={() =>
              handleUpdateSettings({ autoAdvanceDhikr: !settings.autoAdvanceDhikr })
            }
          />
        )}

        {activeTab === 'tasbih' && (
          <TasbihView
            tasbih={tasbih}
            settings={settings}
            onUpdateTasbih={handleUpdateTasbih}
            onToggleVolumeMute={() =>
              handleUpdateSettings({ volume: settings.volume > 0 ? 0 : 0.75 })
            }
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onTogglePrayerAlert={handleTogglePrayerAlert}
            onResetDefaults={handleResetDefaults}
            onTestAlert={handleTriggerAlert}
          />
        )}
      </main>

      <footer className="hidden border-t border-[#E5DEC9] py-6 md:block dark:border-[#1B2C4A]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 text-xs text-[#6E7A8D] sm:px-6 lg:px-8 dark:text-[#8A99B3]">
          <span className="font-display text-sm text-[#0B162C] dark:text-[#F3EFE6]">مِحراب</span>
          <span>مواقيت الصلاة والأذكار اليومية · حساب فلكي دقيق</span>
        </div>
      </footer>
    </div>
  );
}
