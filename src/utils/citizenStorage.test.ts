import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addCitizenSubmission,
  BEST_CASE_EXAMPLES,
  createInitialCitizenState,
  DEFAULT_CITIZEN_POINTS,
  filterNotifications,
  getUnreadNotificationCount,
  INITIAL_NOTIFICATIONS,
  markAllNotificationsRead,
  markNotificationRead,
  MAX_ACTIVITY_SUMMARY_LENGTH,
  SUBMISSION_REWARD_POINTS,
  summarizeIdeaText,
} from './citizenStorage.ts';
import { AR_SIMULATION_SITES, DUMMY_IMAGES } from '../data/dummyImages.ts';

test('citizen initial state starts at 300P with 0 submissions', () => {
  const initial = createInitialCitizenState();
  assert.equal(initial.points, DEFAULT_CITIZEN_POINTS);
  assert.equal(initial.points, 300);
  assert.equal(initial.submittedCount, 0);
  assert.deepEqual(initial.activities, []);
});

test('summarizeIdeaText trims whitespace and caps length for minimal localStorage storage', () => {
  const shortText = '  벤치와   그늘막   설치  ';
  assert.equal(summarizeIdeaText(shortText), '벤치와 그늘막 설치');

  const longText = '가'.repeat(MAX_ACTIVITY_SUMMARY_LENGTH + 40);
  const summary = summarizeIdeaText(longText);
  assert.equal(summary.length <= MAX_ACTIVITY_SUMMARY_LENGTH, true);
  assert.equal(summary.endsWith('…'), true);
});

test('addCitizenSubmission adds +100P, increments count, stores short summary, and sorts newest first', () => {
  const state0 = createInitialCitizenState();
  const state1 = addCitizenSubmission(state0, {
    targetSite: '상일동 8-2 유휴부지',
    ideaText: '주민들이 쉴 수 있는 나무 그늘 벤치를 설치해 주세요.',
  });
  assert.equal(state1.points, 300 + SUBMISSION_REWARD_POINTS);
  assert.equal(state1.points, 400);
  assert.equal(state1.submittedCount, 1);
  assert.equal(state1.activities[0]?.targetSite, '상일동 8-2 유휴부지');
  assert.equal(state1.activities[0]?.pointsEarned, 100);
  assert.equal(state1.activities[0]?.isDemo, true);

  const state2 = addCitizenSubmission(state1, {
    targetSite: '강동구 생활권 유휴공간',
    ideaText: '작은 마을 정원과 산책로를 함께 조성하면 좋겠습니다.',
  });
  assert.equal(state2.points, 500);
  assert.equal(state2.submittedCount, 2);
  assert.equal(state2.activities[0]?.targetSite, '강동구 생활권 유휴공간');
  assert.equal(state2.activities[1]?.targetSite, '상일동 8-2 유휴부지');
});

test('BEST_CASE_EXAMPLES includes the 2 required preview cases', () => {
  assert.equal(BEST_CASE_EXAMPLES.length, 2);
  assert.equal(BEST_CASE_EXAMPLES[0].title, '주민 쉼터 조성');
  assert.equal(BEST_CASE_EXAMPLES[1].title, '주민 참여형 마을정원');
});

test('notification helpers filter by category and update individual/all read states', () => {
  assert.equal(getUnreadNotificationCount(INITIAL_NOTIFICATIONS), 3);

  const inconvenience = filterNotifications(INITIAL_NOTIFICATIONS, '생활불편');
  assert.equal(inconvenience.length, 2);
  assert.ok(inconvenience.every((n) => n.category === '생활불편'));

  const afterOneRead = markNotificationRead(INITIAL_NOTIFICATIONS, 'notif-walkway-control');
  assert.equal(getUnreadNotificationCount(afterOneRead), 2);
  assert.equal(afterOneRead[0]?.isRead, true);

  const afterAllRead = markAllNotificationsRead(afterOneRead);
  assert.equal(getUnreadNotificationCount(afterAllRead), 0);
});

test('DUMMY_IMAGES provides photorealistic generated image assets for every AR simulation site', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  assert.equal(AR_SIMULATION_SITES.length, 2);
  for (const site of AR_SIMULATION_SITES) {
    const pair = DUMMY_IMAGES[site.id];
    assert.ok(pair, `Missing DUMMY_IMAGES entry for ${site.id}`);
    assert.ok(pair.before.startsWith('/src/assets/images/'));
    assert.ok(pair.after.startsWith('/src/assets/images/'));
    assert.ok(pair.arCameraExample.startsWith('/src/assets/images/'));

    for (const relPath of [pair.before, pair.after, pair.arCameraExample]) {
      const diskPath = path.resolve(process.cwd(), relPath.slice(1));
      assert.equal(fs.existsSync(diskPath), true, `Missing asset file: ${diskPath}`);
    }
  }
});
