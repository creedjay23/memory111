import React, { useState } from 'react';
import {
  ChevronRight,
  Clock,
  FolderSearch,
  HardHat,
  Info,
  MapPin,
  Trees,
} from 'lucide-react';
import { DEFAULT_DISTRICT, type SiteFilterType, type SiteInfo } from '../data/siteData';
import { normalizeProgress } from '../utils/siteHelpers';
import { ExcavatorBadgeIcon } from './Illustrations';

interface SiteListScreenProps {
  district: string;
  filter: SiteFilterType;
  sites: SiteInfo[];
  onChangeFilter: (filter: SiteFilterType) => void;
  onSelectSite: (siteId: string) => void;
  onResetToDefaultDistrict: () => void;
  onNavigateIdeaForm: () => void;
}

const FILTER_OPTIONS: readonly SiteFilterType[] = ['전체', '공사 현장', '유휴부지'];

function SiteCardVisual({ site }: { site: SiteInfo }) {
  const [hasError, setHasError] = useState(false);

  if (site.type === '유휴부지' || !site.mapImage || hasError) {
    return (
      <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#EDF8EA] via-[#F7FBF6] to-[#E6F4FA] flex flex-col items-center justify-center gap-2 px-4 py-5 text-center relative">
        <div className="w-12 h-12 rounded-2xl bg-white/90 border border-[#C1E9AC] flex items-center justify-center text-[#16783A] shadow-xs">
          <Trees className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-extrabold text-[#095A2E]">
            현장 사진 자료 미제공
          </p>
          <p className="text-[11px] font-medium text-[#4A5B50]">
            시연용 가상 분류 · 실제 현황 확인 필요 부지
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={site.mapImage}
      alt={`${site.name} 현장 지도 이미지`}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className="w-full aspect-[16/10] object-cover block"
    />
  );
}

export function SiteListScreen({
  district,
  filter,
  sites,
  onChangeFilter,
  onSelectSite,
  onResetToDefaultDistrict,
  onNavigateIdeaForm,
}: SiteListScreenProps) {
  return (
    <div className="flex-1 flex flex-col bg-[#F9FBFA] px-4 py-4 space-y-4">
      {/* Screen Headline */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-5 h-5 text-[#16783A] shrink-0" aria-hidden="true" />
          <h2 className="text-xl font-extrabold text-[#17241C] truncate">
            {district} 현장 목록
          </h2>
        </div>
        <span className="text-xs font-bold text-[#5A6B60] shrink-0 tabular-nums">
          총 {sites.length}건
        </span>
      </div>

      {/* 3 Filter Buttons */}
      <div
        role="tablist"
        aria-label="현장 유형 필터"
        className="grid grid-cols-3 gap-2"
      >
        {FILTER_OPTIONS.map((option) => {
          const isActive = filter === option;
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChangeFilter(option)}
              className={`min-h-[44px] rounded-xl px-2 text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#16783A] text-white shadow-xs'
                  : 'bg-white text-[#17241C] border border-[#E4E9E5] hover:bg-[#F1F6F2]'
              }`}
            >
              {option === '공사 현장' && (
                <HardHat className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              {option === '유휴부지' && (
                <Trees className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {/* Site List or Empty State */}
      {sites.length > 0 ? (
        <div className="space-y-3">
          {sites.map((site) => {
            const progressValue = normalizeProgress(site.progress);

            return (
              <button
                key={site.id}
                type="button"
                onClick={() => onSelectSite(site.id)}
                data-testid={`site-card-${site.id}`}
                className="w-full text-left rounded-2xl border border-[#E4E9E5] bg-white overflow-hidden shadow-xs hover:border-[#16783A]/60 active:scale-[0.99] transition-all cursor-pointer"
              >
                {/* Map Image (Construction) or Honest Non-Photo Graphic (Idle Land) */}
                <div className="border-b border-[#E4E9E5] bg-[#EDF2EE]">
                  <SiteCardVisual site={site} />
                </div>

                {/* Card Details */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {site.type === '공사 현장' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FEF3C7] px-2 py-0.5 text-xs font-extrabold text-[#B45309]">
                          <ExcavatorBadgeIcon className="w-4 h-4 shrink-0" />
                          <span>공사 현장</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#DCF5CE] px-2 py-0.5 text-xs font-extrabold text-[#16783A]">
                          <Trees className="w-3.5 h-3.5 text-[#16783A] shrink-0" aria-hidden="true" />
                          <span>유휴부지</span>
                        </span>
                      )}

                      {site.isVirtualClassification && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#D7F1FA] px-2 py-0.5 text-[11px] font-bold text-[#095A2E]">
                          <Info className="w-3 h-3 shrink-0" aria-hidden="true" />
                          <span>시연용 가상 분류</span>
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#5A6B60] shrink-0" aria-hidden="true" />
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-[#17241C] leading-snug">
                      {site.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-[#4A5B50]">
                      <MapPin className="w-4 h-4 text-[#16783A] shrink-0" aria-hidden="true" />
                      <span>{site.address}</span>
                    </p>
                  </div>

                  {site.type === '유휴부지' ? (
                    <div className="pt-2.5 border-t border-[#EDF1EE] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#5A6B60] font-semibold">현재 상태</span>
                        <span className="font-bold text-[#B45309]">
                          {site.currentStatus ?? '현황 확인 필요'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#5A6B60] font-semibold">활용 방안</span>
                        <span className="font-bold text-[#095A2E] text-right">
                          {site.utilizationPlan ?? '시민 의견 수렴을 위한 예시 제안'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 text-[#5A6B60] font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#7D8C82] shrink-0" aria-hidden="true" />
                        <span>진행 단계·사업 기간: 정보 준비 중</span>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2.5 border-t border-[#EDF1EE]">
                      {progressValue !== null ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-[#4A5B50]">
                              사업 진행률{site.stage ? ` (${site.stage})` : ''}
                            </span>
                            <span className="text-[#16783A] tabular-nums">{progressValue}%</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-[#EDF1EE] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#16783A]"
                              style={{ width: `${progressValue}%` }}
                            />
                          </div>
                          {site.currentWork && (
                            <p className="text-xs font-medium text-[#4A5B50] pt-0.5">
                              {site.currentWork}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-[#5A6B60]">
                          <Clock className="w-4 h-4 text-[#7D8C82] shrink-0" aria-hidden="true" />
                          <span>사업 진행 정보 준비 중</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center rounded-2xl border border-[#E4E9E5] bg-white px-5 py-10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F2F6F3] flex items-center justify-center text-[#5A6B60]">
            <FolderSearch className="w-7 h-7" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <p className="text-lg font-extrabold text-[#17241C]">
              등록된 현장이 없습니다
            </p>
            <p className="text-sm text-[#5A6B60] leading-relaxed">
              {filter === '유휴부지'
                ? `${district}에 등록된 유휴부지 정보는 아직 준비 중입니다.`
                : `${district}에는 현재 등록된 ${filter === '전체' ? '현장' : filter} 정보가 없습니다.`}
            </p>
          </div>

          <div className="w-full space-y-2 pt-2">
            {district !== DEFAULT_DISTRICT && (
              <button
                type="button"
                onClick={onResetToDefaultDistrict}
                className="w-full min-h-[48px] rounded-xl bg-[#16783A] text-white text-sm font-bold hover:bg-[#095A2E] active:scale-[0.98] transition-all cursor-pointer"
              >
                강동구 등록 현장 보기
              </button>
            )}
            {filter === '유휴부지' && (
              <button
                type="button"
                onClick={onNavigateIdeaForm}
                className="w-full min-h-[48px] rounded-xl bg-[#DCF5CE] text-[#095A2E] text-sm font-bold hover:bg-[#C9EEB4] active:scale-[0.98] transition-all cursor-pointer"
              >
                유휴부지 활용 아이디어 제안
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
