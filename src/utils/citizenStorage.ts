export const CITIZEN_STORAGE_KEY = 'sh_citizen_participation_v1';
export const NOTIFICATIONS_STORAGE_KEY = 'sh_custom_notifications_v1';
export const INITIAL_PUSH_SEEN_KEY = 'sh_initial_push_seen_v1';

export const DEFAULT_CITIZEN_POINTS = 300;
export const SUBMISSION_REWARD_POINTS = 100;
export const MAX_CITIZEN_TITLE_LENGTH = 60;
export const MAX_CITIZEN_IDEA_LENGTH = 500;
export const MAX_ACTIVITY_SUMMARY_LENGTH = 56;

export const CITIZEN_TARGET_SITES: readonly string[] = [
  '상일동 8-2 유휴부지 (서울특별시 강동구 상일동 8-2)',
  '강동 일반산업단지 인근 완충녹지 (상일동)',
  '상일3교 우회도로 주변 유휴공간',
  '고덕·강일 생활권 자투리 부지 예시',
];

export const FACILITY_CATEGORIES = [
  '공원·녹지',
  '생활체육시설',
  '주민 쉼터·문화',
  '보행·안전시설',
  '주차·편의시설',
] as const;

export type FacilityCategory = (typeof FACILITY_CATEGORIES)[number];

export interface CitizenActivity {
  id: string;
  targetSite: string;
  summary: string;
  pointsEarned: number;
  createdAt: string;
  isDemo: true;
}

export interface CitizenParticipationState {
  points: number;
  submittedCount: number;
  activities: CitizenActivity[];
}

export interface CitizenSubmissionDraft {
  targetSite: string;
  ideaText: string;
}

export interface CitizenValidationResult {
  valid: boolean;
  error: string | null;
}

export interface BestCaseExample {
  id: string;
  title: string;
  summary: string;
  image: string;
  kind: 'shelter' | 'garden';
}

export const BEST_CASE_EXAMPLES: readonly BestCaseExample[] = [
  {
    id: 'case-shelter',
    title: '주민 쉼터 조성',
    summary: '유휴부지를 나무와 벤치가 있는 작은 주민 쉼터로 활용',
    image: '/src/assets/images/sangil_idle_after_1795065923711.jpg',
    kind: 'shelter',
  },
  {
    id: 'case-garden',
    title: '주민 참여형 마을정원',
    summary: '주민들이 직접 식물을 가꾸는 작은 정원 조성',
    image: '/src/assets/images/sangil_idle_after_1795065923711.jpg',
    kind: 'garden',
  },
];

export function createInitialCitizenState(): CitizenParticipationState {
  return {
    points: DEFAULT_CITIZEN_POINTS,
    submittedCount: 0,
    activities: [],
  };
}

export function summarizeIdeaText(
  rawText: string,
  maxLength: number = MAX_ACTIVITY_SUMMARY_LENGTH
): string {
  const normalized = rawText.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function formatKoreanTimestamp(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

export function addCitizenSubmission(
  prevState: CitizenParticipationState,
  draft: CitizenSubmissionDraft,
  now: Date = new Date()
): CitizenParticipationState {
  const newActivity: CitizenActivity = {
    id: `act-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    targetSite: draft.targetSite.trim(),
    summary: summarizeIdeaText(draft.ideaText),
    pointsEarned: SUBMISSION_REWARD_POINTS,
    createdAt: formatKoreanTimestamp(now),
    isDemo: true,
  };

  return {
    points: prevState.points + SUBMISSION_REWARD_POINTS,
    submittedCount: prevState.submittedCount + 1,
    activities: [newActivity, ...prevState.activities],
  };
}

function getSafeLocalStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export function loadCitizenState(): CitizenParticipationState {
  const storage = getSafeLocalStorage();
  if (!storage) return createInitialCitizenState();

  try {
    const raw = storage.getItem(CITIZEN_STORAGE_KEY);
    if (!raw) return createInitialCitizenState();
    const parsed = JSON.parse(raw) as {
      points?: unknown;
      submittedCount?: unknown;
      activities?: unknown;
    };
    if (
      typeof parsed.points !== 'number' ||
      typeof parsed.submittedCount !== 'number' ||
      !Array.isArray(parsed.activities)
    ) {
      return createInitialCitizenState();
    }

    const sanitizedActivities: CitizenActivity[] = (parsed.activities as unknown[])
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === 'object' && item !== null
      )
      .map((item, idx) => ({
        id: typeof item.id === 'string' ? item.id : `act-legacy-${idx}`,
        targetSite:
          typeof item.targetSite === 'string' && item.targetSite.trim().length > 0
            ? item.targetSite
            : '상일동 8-2 유휴부지',
        summary:
          typeof item.summary === 'string'
            ? summarizeIdeaText(item.summary)
            : typeof item.title === 'string'
            ? summarizeIdeaText(item.title)
            : '유휴부지 활용 아이디어 제안',
        pointsEarned:
          typeof item.pointsEarned === 'number'
            ? item.pointsEarned
            : SUBMISSION_REWARD_POINTS,
        createdAt:
          typeof item.createdAt === 'string'
            ? item.createdAt
            : formatKoreanTimestamp(),
        isDemo: true as const,
      }));

    return {
      points: parsed.points,
      submittedCount: parsed.submittedCount,
      activities: sanitizedActivities,
    };
  } catch {
    return createInitialCitizenState();
  }
}

export function saveCitizenState(state: CitizenParticipationState): void {
  const storage = getSafeLocalStorage();
  if (!storage) return;
  try {
    // Store only minimal summary & metadata (never personal data or full submission text)
    const minimalState: CitizenParticipationState = {
      points: state.points,
      submittedCount: state.submittedCount,
      activities: state.activities.map((a) => ({
        id: a.id,
        targetSite: a.targetSite,
        summary: summarizeIdeaText(a.summary),
        pointsEarned: a.pointsEarned,
        createdAt: a.createdAt,
        isDemo: true,
      })),
    };
    storage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(minimalState));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

/* -------------------------------------------------------------------------- */
/* Custom Notifications & Live Push Demo                                      */
/* -------------------------------------------------------------------------- */

export type NotificationCategory = '생활불편' | '공사공정' | '시민참여';
export type NotificationFilter = '전체' | NotificationCategory;

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  timeLabel: string;
  isRead: boolean;
  isUrgent?: boolean;
}

export const PUSH_BANNER_MESSAGE =
  '🚨 [생활불편 사전안내] 내 생활권 500m 내 보행로 일부 통제 안내';

export const INITIAL_NOTIFICATIONS: readonly NotificationItem[] = [
  {
    id: 'notif-walkway-control',
    category: '생활불편',
    title: PUSH_BANNER_MESSAGE,
    body: '강동 일반산업단지 토공 및 우회도로 공사에 따라 상일동 일대 보행자 우회 동선이 운영됩니다. 이동 시 안전 유도 표지를 확인해 주세요.',
    timeLabel: '방금 전',
    isRead: false,
    isUrgent: true,
  },
  {
    id: 'notif-sangil3-bridge',
    category: '생활불편',
    title: '[통행제한 사전예고] 2027년 1월 상일3교 철거 및 통행 제한 예정',
    body: '기존 상일3교 철거 공사가 2027년 1월부터 시행될 예정이며, 대체 우회도로 안내가 사전 공지될 예정입니다.',
    timeLabel: '오늘 09:30',
    isRead: false,
  },
  {
    id: 'notif-progress-14',
    category: '공사공정',
    title: '[공정 업데이트] 강동 일반산업단지 조성공사 시공 공정률 14% 달성',
    body: '토공 및 우회도로 공사가 순차적으로 진행 중입니다. (사업 기간: 2025. 10. ~ 2028. 03.)',
    timeLabel: '어제',
    isRead: false,
  },
  {
    id: 'notif-citizen-point',
    category: '시민참여',
    title: '[참여 혜택] 유휴부지 활용 아이디어 제출 시 즉시 +100P 적립',
    body: '시민참여 메뉴에서 유휴부지 활용 아이디어를 제안하면 시연용 참여 포인트가 적립됩니다.',
    timeLabel: '2일 전',
    isRead: true,
  },
];

export function filterNotifications(
  items: readonly NotificationItem[],
  filter: NotificationFilter
): NotificationItem[] {
  if (filter === '전체') return [...items];
  return items.filter((item) => item.category === filter);
}

export function markNotificationRead(
  items: readonly NotificationItem[],
  id: string
): NotificationItem[] {
  return items.map((item) => (item.id === id ? { ...item, isRead: true } : item));
}

export function markAllNotificationsRead(
  items: readonly NotificationItem[]
): NotificationItem[] {
  return items.map((item) => ({ ...item, isRead: true }));
}

export function getUnreadNotificationCount(
  items: readonly NotificationItem[]
): number {
  return items.filter((item) => !item.isRead).length;
}
