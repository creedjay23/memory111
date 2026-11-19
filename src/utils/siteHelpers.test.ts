import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_DISTRICT, SEOUL_DISTRICTS, SITE_DATA, type SiteInfo } from '../data/siteData';
import {
  MAX_IDEA_LENGTH,
  buildKakaoMapSearchUrl,
  filterSites,
  getDefaultIdeaSite,
  getDisplayText,
  getStageIndex,
  normalizeProgress,
  validateIdeaInput,
} from './siteHelpers';

test('SEOUL_DISTRICTS contains all 25 autonomous districts including 강동구', () => {
  assert.equal(SEOUL_DISTRICTS.length, 25);
  assert.equal(SEOUL_DISTRICTS.includes(DEFAULT_DISTRICT), true);
});

test('filterSites returns both 강동구 sites (공사 현장 + 유휴부지) and filters correctly', () => {
  const allGangdong = filterSites(SITE_DATA, '강동구', '전체');
  assert.equal(allGangdong.length, 2);

  const constructionGangdong = filterSites(SITE_DATA, '강동구', '공사 현장');
  assert.equal(constructionGangdong.length, 1);
  assert.equal(constructionGangdong[0].name, '강동 일반산업단지 조성공사');
  assert.equal(constructionGangdong[0].stage, '시공');
  assert.equal(constructionGangdong[0].progress, 14);
  assert.equal(constructionGangdong[0].projectPeriod, '2025. 10. ~ 2028. 03.');
  assert.equal(constructionGangdong[0].notice?.includes('상일3교'), true);

  const idleGangdong = filterSites(SITE_DATA, '강동구', '유휴부지');
  assert.equal(idleGangdong.length, 1);
  assert.equal(idleGangdong[0].name, '상일동 8-2 유휴부지');
  assert.equal(idleGangdong[0].address, '서울특별시 강동구 상일동 8-2');
  assert.equal(idleGangdong[0].currentStatus, '현황 확인 필요');
  assert.equal(idleGangdong[0].utilizationPlan, '시민 의견 수렴을 위한 예시 제안');
  assert.equal(idleGangdong[0].isVirtualClassification, true);
  assert.equal(idleGangdong[0].stage, null);
  assert.equal(idleGangdong[0].progress, null);
  assert.equal(idleGangdong[0].projectPeriod, null);
  assert.equal(idleGangdong[0].lastUpdated, null);
  assert.equal(idleGangdong[0].utilizationIdeas?.length, 3);

  const otherDistrict = filterSites(SITE_DATA, '강남구', '전체');
  assert.equal(otherDistrict.length, 0);
});

test('getDefaultIdeaSite resolves 상일동 8-2 유휴부지', () => {
  const defaultIdle = getDefaultIdeaSite(SITE_DATA);
  assert.ok(defaultIdle);
  assert.equal(defaultIdle.name, '상일동 8-2 유휴부지');
  assert.equal(defaultIdle.address, '서울특별시 강동구 상일동 8-2');
});

test('buildKakaoMapSearchUrl encodes address and site name safely', () => {
  const site = SITE_DATA[0];
  const url = buildKakaoMapSearchUrl(site.address, site.name);
  const expectedQuery = encodeURIComponent('서울 강동구 상일동 강동 일반산업단지 조성공사');
  assert.equal(url, `https://map.kakao.com/link/search/${expectedQuery}`);
});

test('getStageIndex and normalizeProgress handle missing and populated data', () => {
  assert.equal(getStageIndex(null), -1);
  assert.equal(normalizeProgress(null), null);

  assert.equal(getStageIndex(SITE_DATA[0].stage), 2);
  assert.equal(normalizeProgress(SITE_DATA[0].progress), 14);

  const mockPopulated: SiteInfo = {
    ...SITE_DATA[0],
    stage: '시공',
    progress: 68.4,
  };
  assert.equal(getStageIndex(mockPopulated.stage), 2);
  assert.equal(normalizeProgress(mockPopulated.progress), 68);
  assert.equal(normalizeProgress(150), 100);
  assert.equal(normalizeProgress(-5), 0);
});

test('getDisplayText provides fallback for missing values', () => {
  assert.equal(getDisplayText(null), '정보 준비 중');
  assert.equal(getDisplayText('   '), '정보 준비 중');
  assert.equal(getDisplayText('2025. 10. ~ 2028. 03.'), '2025. 10. ~ 2028. 03.');
});

test('validateIdeaInput rejects empty/whitespace and >500 chars, accepts valid input', () => {
  assert.deepEqual(validateIdeaInput(''), {
    valid: false,
    error: '유휴부지 활용 아이디어를 먼저 입력해주세요.',
  });
  assert.deepEqual(validateIdeaInput('   \n  '), {
    valid: false,
    error: '유휴부지 활용 아이디어를 먼저 입력해주세요.',
  });

  const maxValid = '가'.repeat(MAX_IDEA_LENGTH);
  assert.deepEqual(validateIdeaInput(maxValid), { valid: true, error: null });

  const overLimit = '가'.repeat(MAX_IDEA_LENGTH + 1);
  assert.equal(validateIdeaInput(overLimit).valid, false);
});
