import React from 'react';
import {
  ArrowLeft,
  Bell,
  Box,
  Home,
  Info,
  Users,
  X,
} from 'lucide-react';
import { PUSH_BANNER_MESSAGE } from '../utils/citizenStorage';

export type AppTabId = 'home' | 'ar-preview' | 'citizen' | 'notifications';

interface AppShellProps {
  title?: string;
  showBack?: boolean;
  activeTab: AppTabId;
  unreadCount: number;
  pushBannerVisible: boolean;
  onDismissPushBanner: () => void;
  onClickPushBanner: () => void;
  onTriggerPushDemo: () => void;
  onBack?: () => void;
  onGoHome: () => void;
  onSelectTab: (tab: AppTabId) => void;
  children: React.ReactNode;
}

const BOTTOM_TABS: readonly {
  id: AppTabId;
  label: string;
  Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}[] = [
  { id: 'home', label: '홈', Icon: Home },
  { id: 'ar-preview', label: 'AR 미리보기', Icon: Box },
  { id: 'citizen', label: '시민참여', Icon: Users },
  { id: 'notifications', label: '맞춤알림', Icon: Bell },
];

export function AppShell({
  title,
  showBack = false,
  activeTab,
  unreadCount,
  pushBannerVisible,
  onDismissPushBanner,
  onClickPushBanner,
  onTriggerPushDemo,
  onBack,
  onGoHome,
  onSelectTab,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen w-full bg-[#EEF3EF] flex justify-center sm:py-5 sm:px-4">
      <div className="relative w-full max-w-[430px] min-h-screen sm:min-h-[820px] bg-white sm:rounded-[32px] sm:border sm:border-[#DCE4DE] sm:shadow-[0_18px_48px_rgba(23,36,28,0.08)] flex flex-col overflow-hidden">
        {/* Slide-Down Real-Time Push Notification Banner */}
        {pushBannerVisible && (
          <div
            role="alert"
            aria-live="polite"
            data-testid="push-toast-banner"
            className="absolute top-2 left-2.5 right-2.5 z-40 rounded-2xl border border-[#F59E0B] bg-[#17241C] text-white px-3.5 py-3 shadow-lg flex items-start gap-2.5 animate-[slideDown_0.28s_ease-out]"
          >
            <button
              type="button"
              onClick={onClickPushBanner}
              className="flex-1 text-left space-y-0.5 min-w-0 cursor-pointer"
            >
              <p className="text-xs font-extrabold leading-snug text-[#FEF3C7]">
                {PUSH_BANNER_MESSAGE}
              </p>
              <p className="text-[11px] text-[#D1DDD5]">
                터치하여 맞춤알림 상세 내용을 확인하세요
              </p>
            </button>
            <button
              type="button"
              onClick={onDismissPushBanner}
              aria-label="푸시 알림 닫기"
              className="min-h-[32px] min-w-[32px] rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Persistent Demo Data Notice on every screen */}
        <div
          role="note"
          aria-label="시연용 예시 데이터 고지"
          className="bg-[#D7F1FA] text-[#095A2E] px-4 py-2 flex items-center justify-center gap-1.5 text-xs font-semibold border-b border-[#BCE4F3] shrink-0"
        >
          <Info className="w-3.5 h-3.5 shrink-0 text-[#0E7490]" aria-hidden="true" />
          <span>시연용 예시 데이터입니다</span>
        </div>

        {/* Persistent Top Header with Back Button (sub-screens) + Notification Bell */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#E4E9E5] px-3 py-1.5 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            {showBack && onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="뒤로가기"
                className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#17241C] hover:bg-[#F3F7F4] active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              </button>
            ) : (
              <img
                src="/assets/seoul-compass-logo.png"
                alt="SEOUL ADVENTURE 나침반 로고"
                referrerPolicy="no-referrer"
                className="w-8 h-8 object-contain ml-1 shrink-0"
              />
            )}
            <h1 className="text-[16px] font-extrabold text-[#17241C] truncate">
              {title || 'SH 현장·유휴부지 소통'}
            </h1>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Header Notification Bell */}
            <button
              type="button"
              onClick={onTriggerPushDemo}
              aria-label={`알림 벨 (읽지 않은 알림 ${unreadCount}건)`}
              data-testid="header-bell-button"
              className="relative min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#17241C] hover:bg-[#F3F7F4] active:scale-95 transition-all cursor-pointer"
            >
              <Bell className="w-5 h-5 text-[#095A2E]" aria-hidden="true" />
              {unreadCount > 0 && (
                <span
                  data-testid="header-bell-badge"
                  className="absolute top-1.5 right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#DC2626] text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums"
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showBack && (
              <button
                type="button"
                onClick={onGoHome}
                aria-label="처음으로 이동"
                className="min-h-[44px] px-2 rounded-xl flex items-center gap-1 text-xs font-semibold text-[#095A2E] hover:bg-[#DCF5CE]/60 active:scale-95 transition-all cursor-pointer"
              >
                <img
                  src="/assets/seoul-compass-logo.png"
                  alt="SEOUL ADVENTURE 나침반 로고"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 object-contain shrink-0"
                />
                <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>
            )}
          </div>
        </header>

        {/* Main Screen Content */}
        <main className="flex-1 flex flex-col w-full overflow-x-hidden">
          {children}
        </main>

        {/* Bottom 4-Tab Navigation Bar */}
        <nav
          aria-label="하단 주요 메뉴"
          className="sticky bottom-0 z-20 bg-white/98 backdrop-blur-sm border-t border-[#E4E9E5] px-1.5 py-1 grid grid-cols-4 gap-1 shrink-0"
        >
          {BOTTOM_TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectTab(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative min-h-[52px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#DCF5CE]/80 text-[#095A2E]'
                    : 'text-[#5A6B60] hover:bg-[#F4F8F5]'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-[#16783A]' : 'text-[#5A6B60]'
                    }`}
                    aria-hidden={true}
                  />
                  {id === 'notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-[#DC2626] text-white text-[9px] font-extrabold flex items-center justify-center tabular-nums">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className="leading-none">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Persistent Footer on every screen */}
        <footer className="bg-[#FAFBF9] border-t border-[#E4E9E5] px-4 py-2 text-center shrink-0">
          <p className="text-[11px] font-medium text-[#5A6B60]">AI를 활용해 제작</p>
        </footer>
      </div>
    </div>
  );
}
