import React, { useState } from 'react';
import {
  Award,
  ClipboardList,
  Coins,
  Info,
  Lightbulb,
  Sparkles,
  Sprout,
  Trees,
} from 'lucide-react';
import {
  BEST_CASE_EXAMPLES,
  SUBMISSION_REWARD_POINTS,
  type CitizenParticipationState,
} from '../utils/citizenStorage';

interface CitizenParticipationScreenProps {
  state: CitizenParticipationState;
  onOpenIdeaForm: () => void;
}

function CasePreviewThumbnail({
  src,
  alt,
  kind,
}: {
  src: string;
  alt: string;
  kind: 'shelter' | 'garden';
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#DCF5CE] to-[#D7F1FA] flex items-center justify-center text-[#16783A] shrink-0">
        {kind === 'shelter' ? (
          <Trees className="w-7 h-7" aria-hidden="true" />
        ) : (
          <Sprout className="w-7 h-7" aria-hidden="true" />
        )}
      </div>
    );
  }

  return (
    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#DCE4DE] bg-[#EDF2EE] shrink-0">
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover ${
          kind === 'shelter' ? 'object-left' : 'object-right'
        }`}
      />
    </div>
  );
}

export function CitizenParticipationScreen({
  state,
  onOpenIdeaForm,
}: CitizenParticipationScreenProps) {
  return (
    <div className="flex-1 flex flex-col bg-[#F9FBFA] px-4 py-4 space-y-4">
      {/* ① 나의 참여 현황 */}
      <section
        aria-label="나의 참여 현황"
        className="rounded-2xl bg-gradient-to-br from-[#16783A] to-[#095A2E] text-white p-4 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              <Coins className="w-4 h-4 text-[#DCF5CE]" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-extrabold">나의 참여 현황</h2>
          </div>
          <span className="text-[11px] font-bold bg-white/15 px-2.5 py-1 rounded-lg text-[#DCF5CE]">
            1건 제출 시 +{SUBMISSION_REWARD_POINTS}P
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-white/12 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold text-[#DCF5CE]">나의 참여 포인트</p>
            <p
              data-testid="citizen-points-value"
              className="mt-0.5 text-2xl font-extrabold tabular-nums tracking-tight"
            >
              {state.points.toLocaleString()}P
            </p>
          </div>
          <div className="rounded-xl bg-white/12 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold text-[#DCF5CE]">아이디어 제출 건수</p>
            <p
              data-testid="citizen-count-value"
              className="mt-0.5 text-2xl font-extrabold tabular-nums tracking-tight"
            >
              {state.submittedCount}건
            </p>
          </div>
        </div>
      </section>

      {/* ② 아이디어 제안 */}
      <section
        aria-label="유휴부지 아이디어 제안"
        className="rounded-2xl border border-[#C1E9AC] bg-white p-4 space-y-3"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DCF5CE] flex items-center justify-center text-[#16783A] shrink-0">
            <Lightbulb className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1 min-w-0">
            <h3 className="text-base font-extrabold text-[#17241C]">
              아이디어 제안
            </h3>
            <p className="text-xs leading-relaxed text-[#4A5B50]">
              우리 동네 유휴부지 활용 아이디어를 작성하면 시연용 참여 포인트{' '}
              <strong className="font-extrabold text-[#16783A]">
                +{SUBMISSION_REWARD_POINTS}P
              </strong>
              가 즉시 적립됩니다. (개인정보 입력 없음)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenIdeaForm}
          className="w-full min-h-[52px] rounded-xl bg-[#16783A] hover:bg-[#095A2E] text-white text-sm font-extrabold px-4 flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
        >
          <Lightbulb className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>유휴부지 활용 아이디어 제안하기</span>
        </button>
      </section>

      {/* ③ 나의 활동 기록 */}
      <section aria-label="나의 활동 기록" className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-extrabold text-[#17241C] flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-[#16783A]" aria-hidden="true" />
            <span>나의 활동 기록</span>
          </h3>
          <span className="text-xs font-bold text-[#5A6B60] tabular-nums">
            총 {state.activities.length}건
          </span>
        </div>

        {state.activities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#C7D3CA] bg-white px-4 py-6 text-center">
            <p className="text-sm font-bold text-[#4A5B50] leading-relaxed">
              아직 참여한 활동이 없습니다. 첫 번째 아이디어를 제안해보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5" data-testid="citizen-activity-list">
            {state.activities.map((activity) => (
              <article
                key={activity.id}
                className="rounded-2xl border border-[#E4E9E5] bg-white p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 font-bold text-[#095A2E] bg-[#D7F1FA] px-2 py-0.5 rounded-md">
                    <Info className="w-3 h-3 shrink-0" aria-hidden="true" />
                    <span>시연용 제출</span>
                  </span>
                  <span className="font-extrabold text-[#16783A] bg-[#DCF5CE] px-2 py-0.5 rounded-md tabular-nums">
                    +{activity.pointsEarned}P
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-[#17241C]">
                  {activity.targetSite}
                </h4>

                <p className="text-xs leading-relaxed text-[#4A5B50]">
                  {activity.summary}
                </p>

                <div className="pt-1.5 border-t border-[#EDF1EE] flex items-center justify-between gap-2 text-[11px] text-[#5A6B60]">
                  <span>제출 날짜</span>
                  <span className="font-semibold tabular-nums">{activity.createdAt}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ④ 우수 의견 보상 안내 */}
      <section
        aria-label="우수 아이디어 보상 안내"
        className="rounded-2xl border border-[#FCD34D] bg-[#FFFBEB] p-4 space-y-2"
      >
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#F59E0B] shrink-0" aria-hidden="true" />
          <h3 className="text-sm font-extrabold text-[#92400E]">
            우수 아이디어 보상 안내
          </h3>
        </div>
        <p className="text-xs font-bold leading-relaxed text-[#78350F]">
          여러분의 창의적인 아이디어가 서울의 새로운 공간을 만드는 데 도움이 됩니다.
        </p>
        <ul className="space-y-1 text-xs leading-relaxed text-[#78350F]">
          <li className="flex items-start gap-1.5">
            <span className="font-bold" aria-hidden="true">•</span>
            <span>아이디어 제출 시 100P 적립</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="font-bold" aria-hidden="true">•</span>
            <span>우수 아이디어에 대한 추가 보상 제도는 향후 검토 예정</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="font-bold" aria-hidden="true">•</span>
            <span>포인트는 시연용이며 실제 금전적 가치가 없음</span>
          </li>
        </ul>
      </section>

      {/* ⑤ 모범 반영 사례 미리보기 */}
      <section aria-label="모범 반영 사례 미리보기" className="space-y-2.5 pb-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-extrabold text-[#17241C] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#16783A]" aria-hidden="true" />
            <span>모범 반영 사례 미리보기</span>
          </h3>
        </div>

        <div className="space-y-2.5">
          {BEST_CASE_EXAMPLES.map((example, index) => (
            <div
              key={example.id}
              className="rounded-2xl border border-[#E4E9E5] bg-white p-3.5 flex items-center gap-3"
            >
              <CasePreviewThumbnail
                src={example.image}
                alt={example.title}
                kind={example.kind}
              />
              <div className="min-w-0 space-y-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#16783A] bg-[#DCF5CE]/80 px-2 py-0.5 rounded-md">
                  {example.kind === 'shelter' ? (
                    <Trees className="w-3 h-3 shrink-0" aria-hidden="true" />
                  ) : (
                    <Sprout className="w-3 h-3 shrink-0" aria-hidden="true" />
                  )}
                  <span>사례 {index + 1}</span>
                </span>
                <h4 className="text-sm font-extrabold text-[#17241C]">
                  {example.title}
                </h4>
                <p className="text-xs leading-relaxed text-[#4A5B50]">
                  {example.summary}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          role="note"
          className="rounded-xl border border-[#DCE4DE] bg-[#F4F8F5] px-3 py-2 text-[11px] font-semibold text-[#4A5B50] text-center"
        >
          실제 반영 사례가 아닌 시연용 활용 예시입니다.
        </div>
      </section>
    </div>
  );
}
