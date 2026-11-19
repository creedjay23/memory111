import React from 'react';
import { Check, CircleDot, Clock } from 'lucide-react';
import { PROJECT_STAGES, type ProjectStage } from '../data/siteData';
import { getStageIndex, normalizeProgress } from '../utils/siteHelpers';

interface StageTimelineProps {
  stage: ProjectStage | null;
  progress: number | null;
  currentWork?: string | null;
}

export function StageTimeline({ stage, progress, currentWork }: StageTimelineProps) {
  const activeIndex = getStageIndex(stage);
  const normalizedProgress = normalizeProgress(progress);
  const hasStage = activeIndex >= 0;

  return (
    <section
      aria-label="사업 진행 단계 및 진행률"
      className="rounded-2xl border border-[#E4E9E5] bg-white p-4 space-y-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-[#17241C]">사업 진행 현황</h2>
        {normalizedProgress !== null ? (
          <span className="text-base font-extrabold text-[#16783A] tabular-nums">
            {normalizedProgress}%
          </span>
        ) : (
          <span className="text-xs font-semibold text-[#5A6B60]">
            진행률 정보 준비 중
          </span>
        )}
      </div>

      {/* 4-Stage Timeline: 계획 -> 착공 -> 시공 -> 준공 */}
      <div className="flex items-start justify-between gap-1 pt-1">
        {PROJECT_STAGES.map((stageName, index) => {
          const isCompleted = hasStage && index < activeIndex;
          const isCurrent = hasStage && index === activeIndex;

          return (
            <React.Fragment key={stageName}>
              <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted
                      ? 'bg-[#DCF5CE] border-[#16783A] text-[#095A2E]'
                      : isCurrent
                      ? 'bg-[#16783A] border-[#16783A] text-white shadow-sm'
                      : 'bg-[#F3F5F3] border-[#D6DDD8] text-[#7D8C82]'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" aria-hidden="true" />
                  ) : isCurrent ? (
                    <CircleDot className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <span className="text-xs font-bold tabular-nums">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-bold text-center whitespace-nowrap ${
                    isCurrent
                      ? 'text-[#095A2E]'
                      : isCompleted
                      ? 'text-[#16783A]'
                      : 'text-[#6A796F]'
                  }`}
                >
                  {stageName}
                </span>
              </div>

              {index < PROJECT_STAGES.length - 1 && (
                <div className="flex items-center pt-4 flex-shrink-0 w-5 sm:w-7">
                  <div
                    className={`h-0.5 w-full rounded-full ${
                      hasStage && index < activeIndex ? 'bg-[#16783A]' : 'bg-[#DDE3DE]'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Status text & Progress Bar */}
      {hasStage ? (
        <p className="text-xs font-medium text-[#095A2E] bg-[#DCF5CE]/60 rounded-xl px-3 py-2 text-center leading-relaxed">
          현재 진행 단계: <strong className="font-bold">{stage}</strong>
          {currentWork ? ` · ${currentWork}` : ''}
        </p>
      ) : (
        <div className="flex items-center justify-center gap-1.5 bg-[#F5F7F5] border border-[#E4E9E5] rounded-xl px-3 py-2.5 text-xs font-medium text-[#5A6B60]">
          <Clock className="w-3.5 h-3.5 text-[#7D8C82] shrink-0" aria-hidden="true" />
          <span>현재 진행 단계 정보 준비 중</span>
        </div>
      )}

      {/* Progress bar: activates automatically when SITE_DATA provides a numeric progress */}
      <div className="space-y-1.5">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={normalizedProgress ?? 0}
          aria-label={
            normalizedProgress !== null
              ? `사업 진행률 ${normalizedProgress}%`
              : '진행률 정보 준비 중'
          }
          className="w-full h-3 rounded-full bg-[#EDF1EE] overflow-hidden"
        >
          {normalizedProgress !== null && (
            <div
              className="h-full rounded-full bg-[#16783A] transition-all duration-300"
              style={{ width: `${normalizedProgress}%` }}
            />
          )}
        </div>
        {normalizedProgress === null && (
          <p className="text-xs text-[#6A796F] text-center">
            공정률 자료가 등록되면 진행률 막대가 표시됩니다.
          </p>
        )}
      </div>
    </section>
  );
}
