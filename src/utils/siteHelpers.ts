import { PROJECT_STAGES, type ProjectStage, type SiteFilterType, type SiteInfo } from '../data/siteData';

export const MAX_IDEA_LENGTH = 500;

export function filterSites(
  sites: readonly SiteInfo[],
  district: string,
  filterType: SiteFilterType
): SiteInfo[] {
  return sites.filter((site) => {
    const matchesDistrict = site.district === district;
    const matchesType = filterType === '전체' || site.type === filterType;
    return matchesDistrict && matchesType;
  });
}

export function buildKakaoMapSearchUrl(address: string, name: string): string {
  const query = `${address} ${name}`.trim();
  return `https://map.kakao.com/link/search/${encodeURIComponent(query)}`;
}

export function getDisplayText(value: string | null | undefined, fallback = '정보 준비 중'): string {
  if (!value || value.trim().length === 0) {
    return fallback;
  }
  return value.trim();
}

export function getStageIndex(stage: ProjectStage | null | undefined): number {
  if (!stage) {
    return -1;
  }
  return PROJECT_STAGES.indexOf(stage);
}

export function normalizeProgress(progress: number | null | undefined): number | null {
  if (typeof progress !== 'number' || Number.isNaN(progress)) {
    return null;
  }
  return Math.min(100, Math.max(0, Math.round(progress)));
}

export function getDefaultIdeaSite(sites: readonly SiteInfo[]): SiteInfo | null {
  return sites.find((site) => site.isIdeaEnabled || site.type === '유휴부지') ?? null;
}

export interface IdeaValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateIdeaInput(rawText: string): IdeaValidationResult {
  if (rawText.length > MAX_IDEA_LENGTH) {
    return {
      valid: false,
      error: `아이디어는 최대 ${MAX_IDEA_LENGTH}자까지 입력할 수 있습니다.`,
    };
  }
  if (rawText.trim().length === 0) {
    return {
      valid: false,
      error: '유휴부지 활용 아이디어를 먼저 입력해주세요.',
    };
  }
  return {
    valid: true,
    error: null,
  };
}
