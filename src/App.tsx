import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_DISTRICT,
  SITE_DATA,
  type SiteFilterType,
  type SiteInfo,
} from './data/siteData';
import { filterSites, getDefaultIdeaSite } from './utils/siteHelpers';
import {
  INITIAL_NOTIFICATIONS,
  addCitizenSubmission,
  getUnreadNotificationCount,
  loadCitizenState,
  markAllNotificationsRead,
  markNotificationRead,
  saveCitizenState,
  type CitizenParticipationState,
  type NotificationItem,
} from './utils/citizenStorage';
import { AppShell, type AppTabId } from './components/AppShell';
import { HomeScreen } from './components/HomeScreen';
import { SiteListScreen } from './components/SiteListScreen';
import { SiteDetailScreen } from './components/SiteDetailScreen';
import { ArPreviewScreen } from './components/ArPreviewScreen';
import { CitizenParticipationScreen } from './components/CitizenParticipationScreen';
import { IdeaFormScreen } from './components/IdeaFormScreen';
import { IdeaCompleteScreen } from './components/IdeaCompleteScreen';
import { NotificationsScreen } from './components/NotificationsScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

type Screen =
  | 'home'
  | 'list'
  | 'detail'
  | 'ar-preview'
  | 'citizen'
  | 'idea-form'
  | 'idea-complete'
  | 'notifications';

function PlatformApp() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(DEFAULT_DISTRICT);
  const [siteFilter, setSiteFilter] = useState<SiteFilterType>('전체');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [ideaTargetSiteId, setIdeaTargetSiteId] = useState<string | null>(null);
  const [ideaFromCitizenMenu, setIdeaFromCitizenMenu] = useState<boolean>(false);
  const [lastSubmittedSiteName, setLastSubmittedSiteName] = useState<string>('상일동 8-2 유휴부지');
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  const [citizenState, setCitizenState] = useState<CitizenParticipationState>(() =>
    loadCitizenState()
  );

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => [
    ...INITIAL_NOTIFICATIONS,
  ]);
  const [pushBannerVisible, setPushBannerVisible] = useState<boolean>(false);
  const hasShownInitialPushRef = useRef<boolean>(false);
  const pushTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  const triggerPushBanner = useCallback(() => {
    if (pushTimerRef.current !== null) {
      window.clearTimeout(pushTimerRef.current);
      pushTimerRef.current = null;
    }
    setPushBannerVisible(true);
    pushTimerRef.current = window.setTimeout(() => {
      setPushBannerVisible(false);
      pushTimerRef.current = null;
    }, 6500);
  }, []);

  useEffect(() => {
    if (!hasShownInitialPushRef.current) {
      hasShownInitialPushRef.current = true;
      triggerPushBanner();
    }
    return () => {
      if (pushTimerRef.current !== null) {
        window.clearTimeout(pushTimerRef.current);
      }
    };
  }, [triggerPushBanner]);

  const dismissPushBanner = useCallback(() => {
    if (pushTimerRef.current !== null) {
      window.clearTimeout(pushTimerRef.current);
      pushTimerRef.current = null;
    }
    setPushBannerVisible(false);
  }, []);

  const unreadCount = useMemo(
    () => getUnreadNotificationCount(notifications),
    [notifications]
  );

  const filteredSites = useMemo(
    () => filterSites(SITE_DATA, selectedDistrict, siteFilter),
    [selectedDistrict, siteFilter]
  );

  const selectedSite = useMemo(
    () => SITE_DATA.find((site) => site.id === selectedSiteId) ?? null,
    [selectedSiteId]
  );

  const defaultIdeaSite = useMemo(() => getDefaultIdeaSite(SITE_DATA), []);
  const ideaTargetSite = useMemo(() => {
    if (ideaTargetSiteId) {
      return SITE_DATA.find((site) => site.id === ideaTargetSiteId) ?? defaultIdeaSite;
    }
    return defaultIdeaSite;
  }, [ideaTargetSiteId, defaultIdeaSite]);

  const navigateTo = (nextScreen: Screen) => {
    setScreen(nextScreen);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleGoHome = () => {
    setSelectedSiteId(null);
    navigateTo('home');
  };

  const handleNavigateList = (filter: '공사 현장' | '유휴부지') => {
    setSiteFilter(filter);
    navigateTo('list');
  };

  const handleSelectSite = (siteId: string) => {
    setSelectedSiteId(siteId);
    navigateTo('detail');
  };

  const handleOpenIdeaForm = (site?: SiteInfo, fromCitizen = false) => {
    setIdeaTargetSiteId(site?.id ?? defaultIdeaSite?.id ?? null);
    setIdeaFromCitizenMenu(fromCitizen);
    navigateTo('idea-form');
  };

  const handleIdeaSubmitted = (targetSiteLabel: string, ideaText: string) => {
    setLastSubmittedSiteName(targetSiteLabel);
    setCitizenState((prev) => {
      const next = addCitizenSubmission(prev, {
        targetSite: targetSiteLabel,
        ideaText,
      });
      saveCitizenState(next);
      return next;
    });
    navigateTo('idea-complete');
  };

  const handleResetToDefaultDistrict = () => {
    setSelectedDistrict(DEFAULT_DISTRICT);
    setSiteFilter('전체');
  };

  const handleSelectTab = (tab: AppTabId) => {
    if (tab === 'home') {
      handleGoHome();
      return;
    }
    navigateTo(tab);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) => markNotificationRead(prev, id));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => markAllNotificationsRead(prev));
  };

  const activeTab: AppTabId =
    screen === 'ar-preview'
      ? 'ar-preview'
      : screen === 'citizen' || screen === 'idea-form' || screen === 'idea-complete'
      ? 'citizen'
      : screen === 'notifications'
      ? 'notifications'
      : 'home';

  const getHeaderConfig = (): {
    showBack: boolean;
    title: string;
    onBack?: () => void;
  } => {
    switch (screen) {
      case 'home':
        return { showBack: false, title: 'SH 현장·유휴부지 소통' };
      case 'list':
        return {
          showBack: true,
          title: '현장 목록',
          onBack: handleGoHome,
        };
      case 'detail':
        return {
          showBack: true,
          title: '현장 상세',
          onBack: () => navigateTo('list'),
        };
      case 'ar-preview':
        return {
          showBack: true,
          title: 'AR 미래 공간 미리보기',
          onBack: handleGoHome,
        };
      case 'citizen':
        return {
          showBack: true,
          title: '시민참여',
          onBack: handleGoHome,
        };
      case 'idea-form':
        return {
          showBack: true,
          title: '아이디어 제안',
          onBack: () =>
            ideaFromCitizenMenu
              ? navigateTo('citizen')
              : selectedSite && selectedSite.type === '유휴부지'
              ? navigateTo('detail')
              : navigateTo('citizen'),
        };
      case 'idea-complete':
        return {
          showBack: true,
          title: '제안 완료',
          onBack: () => navigateTo('citizen'),
        };
      case 'notifications':
        return {
          showBack: true,
          title: '맞춤알림',
          onBack: handleGoHome,
        };
    }
  };

  const headerConfig = getHeaderConfig();

  return (
    <>
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      <AppShell
        showBack={headerConfig.showBack}
        title={headerConfig.title}
        activeTab={activeTab}
        unreadCount={unreadCount}
        pushBannerVisible={pushBannerVisible}
        onDismissPushBanner={dismissPushBanner}
        onClickPushBanner={() => {
          dismissPushBanner();
          navigateTo('notifications');
        }}
        onTriggerPushDemo={triggerPushBanner}
        onBack={headerConfig.onBack}
        onGoHome={handleGoHome}
        onSelectTab={handleSelectTab}
      >
        {screen === 'home' && (
          <HomeScreen
            selectedDistrict={selectedDistrict}
            onSelectDistrict={setSelectedDistrict}
            onNavigateList={handleNavigateList}
            onNavigateCitizen={() => navigateTo('citizen')}
            onNavigateArPreview={() => navigateTo('ar-preview')}
          />
        )}

        {screen === 'list' && (
          <SiteListScreen
            district={selectedDistrict}
            filter={siteFilter}
            sites={filteredSites}
            onChangeFilter={setSiteFilter}
            onSelectSite={handleSelectSite}
            onResetToDefaultDistrict={handleResetToDefaultDistrict}
            onNavigateIdeaForm={() => navigateTo('citizen')}
          />
        )}

        {screen === 'detail' &&
          (selectedSite ? (
            <SiteDetailScreen
              site={selectedSite}
              onBackToList={() => navigateTo('list')}
              onProposeIdea={(site) => handleOpenIdeaForm(site, false)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <p className="text-base font-bold text-[#17241C]">
                선택한 현장 정보를 찾을 수 없습니다.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('list')}
                className="min-h-[48px] px-5 rounded-xl bg-[#16783A] text-white text-sm font-bold cursor-pointer"
              >
                현장 목록으로 이동
              </button>
            </div>
          ))}

        {screen === 'ar-preview' && <ArPreviewScreen onGoHome={handleGoHome} />}

        {screen === 'citizen' && (
          <CitizenParticipationScreen
            state={citizenState}
            onOpenIdeaForm={() => handleOpenIdeaForm(undefined, true)}
          />
        )}

        {screen === 'idea-form' && (
          <IdeaFormScreen
            targetSiteName={ideaTargetSite?.name}
            targetAddress={ideaTargetSite?.address}
            allowSiteSelect={ideaFromCitizenMenu}
            onSubmitSuccess={handleIdeaSubmitted}
          />
        )}

        {screen === 'idea-complete' && (
          <IdeaCompleteScreen
            targetSiteName={lastSubmittedSiteName}
            currentPoints={citizenState.points}
            onGoCitizen={() => navigateTo('citizen')}
            onGoHome={handleGoHome}
          />
        )}

        {screen === 'notifications' && (
          <NotificationsScreen
            notifications={notifications}
            onMarkRead={handleMarkNotificationRead}
            onMarkAllRead={handleMarkAllRead}
            onTriggerPushDemo={triggerPushBanner}
          />
        )}
      </AppShell>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PlatformApp />
    </ErrorBoundary>
  );
}
