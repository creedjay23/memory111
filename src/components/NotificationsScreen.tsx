import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  BellRing,
  Check,
  CheckCheck,
  HardHat,
  Sparkles,
} from 'lucide-react';
import {
  filterNotifications,
  getUnreadNotificationCount,
  type NotificationCategory,
  type NotificationFilter,
  type NotificationItem,
} from '../utils/citizenStorage';

interface NotificationsScreenProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onTriggerPushDemo: () => void;
}

const NOTIFICATION_FILTERS: readonly NotificationFilter[] = [
  '전체',
  '생활불편',
  '공사공정',
  '시민참여',
];

function getCategoryStyle(category: NotificationCategory) {
  switch (category) {
    case '생활불편':
      return {
        badge: 'bg-[#FEF3C7] text-[#92400E]',
        iconBg: 'bg-[#FEF3C7] text-[#B45309]',
        Icon: AlertTriangle,
      };
    case '공사공정':
      return {
        badge: 'bg-[#D7F1FA] text-[#095A2E]',
        iconBg: 'bg-[#D7F1FA] text-[#0E7490]',
        Icon: HardHat,
      };
    case '시민참여':
      return {
        badge: 'bg-[#DCF5CE] text-[#16783A]',
        iconBg: 'bg-[#DCF5CE] text-[#16783A]',
        Icon: Sparkles,
      };
  }
}

export function NotificationsScreen({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onTriggerPushDemo,
}: NotificationsScreenProps) {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('전체');

  const unreadCount = getUnreadNotificationCount(notifications);
  const filteredItems = filterNotifications(notifications, activeFilter);

  return (
    <div className="flex-1 flex flex-col bg-[#F9FBFA] px-4 py-4 space-y-4">
      {/* Live Push Demo Action Card */}
      <section
        aria-label="실시간 푸시 알림 시연"
        className="rounded-2xl border border-[#B5E2F2] bg-gradient-to-br from-[#EAF7FC] to-white p-4 space-y-3"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D7F1FA] text-[#095A2E] flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1 min-w-0">
            <h2 className="text-base font-extrabold text-[#17241C]">
              내 생활권 맞춤 알림 센터
            </h2>
            <p className="text-xs leading-relaxed text-[#4A5B50]">
              상일동·강동구 생활권 반경 500m 내 보행로 통제 및 공정 변동 소식을 실시간 푸시 배너로 미리 체험해 볼 수 있습니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onTriggerPushDemo}
          className="w-full min-h-[48px] rounded-xl bg-[#16783A] hover:bg-[#095A2E] text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
        >
          <Bell className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>푸시 알림 시연하기</span>
        </button>
      </section>

      {/* Filter Bar + Mark All Read */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <p className="text-xs font-extrabold text-[#17241C]">
            읽지 않은 알림{' '}
            <span className="text-[#16783A] tabular-nums" data-testid="unread-count-label">
              {unreadCount}건
            </span>
          </p>
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className={`min-h-[36px] px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              unreadCount === 0
                ? 'bg-[#EDF1EE] text-[#8A988F] cursor-default'
                : 'bg-white border border-[#C7D3CA] text-[#095A2E] hover:bg-[#DCF5CE]/60 cursor-pointer'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>전체 읽음</span>
          </button>
        </div>

        <div
          role="tablist"
          aria-label="알림 카테고리 필터"
          className="grid grid-cols-4 gap-1.5"
        >
          {NOTIFICATION_FILTERS.map((cat) => {
            const isActive = activeFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(cat)}
                className={`min-h-[40px] rounded-xl px-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#16783A] text-white shadow-xs'
                    : 'bg-white text-[#17241C] border border-[#E4E9E5] hover:bg-[#F1F6F2]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-2.5 pb-2" data-testid="notification-list">
        {filteredItems.map((item) => {
          const { badge, iconBg, Icon } = getCategoryStyle(item.category);
          return (
            <article
              key={item.id}
              onClick={() => {
                if (!item.isRead) onMarkRead(item.id);
              }}
              className={`rounded-2xl border p-4 space-y-2 transition-all ${
                item.isRead
                  ? 'border-[#E4E9E5] bg-white/80 opacity-85'
                  : 'border-[#B5DEC2] bg-white shadow-xs cursor-pointer hover:border-[#16783A]'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${badge}`}>
                      {item.category}
                    </span>
                    {!item.isRead && (
                      <span
                        className="inline-block w-2 h-2 rounded-full bg-[#DC2626]"
                        aria-label="읽지 않음"
                      />
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-medium text-[#6A796F] shrink-0">
                  {item.timeLabel}
                </span>
              </div>

              <h3 className="text-sm font-extrabold text-[#17241C] leading-snug">
                {item.title}
              </h3>

              <p className="text-xs leading-relaxed text-[#4A5B50]">{item.body}</p>

              <div className="pt-1 flex justify-end">
                {item.isRead ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6A796F]">
                    <Check className="w-3.5 h-3.5 text-[#16783A]" aria-hidden="true" />
                    <span>읽음 완료</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(item.id);
                    }}
                    className="min-h-[34px] px-3 rounded-lg bg-[#F4FBF0] border border-[#C1E9AC] text-[11px] font-bold text-[#095A2E] hover:bg-[#DCF5CE] cursor-pointer"
                  >
                    읽음 처리
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
