import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  ExternalLink,
  Info,
  Lightbulb,
  MapPin,
  Trees,
} from 'lucide-react';
import type { SiteInfo } from '../data/siteData';
import { buildKakaoMapSearchUrl, getDisplayText } from '../utils/siteHelpers';
import { ExcavatorBadgeIcon } from './Illustrations';
import { StageTimeline } from './StageTimeline';

interface SiteDetailScreenProps {
  site: SiteInfo;
  onBackToList: () => void;
  onProposeIdea: (site: SiteInfo) => void;
}

export function SiteDetailScreen({
  site,
  onBackToList,
  onProposeIdea,
}: SiteDetailScreenProps) {
  const [imgError, setImgError] = useState(false);
  const kakaoMapUrl = buildKakaoMapSearchUrl(site.address, site.name);
  const periodText = getDisplayText(site.projectPeriod, '정보 준비 중');
  const updatedText = getDisplayText(site.lastUpdated, '정보 준비 중');

  return (
    <div className="flex-1 flex flex-col bg-[#F9FBFA] px-4 py-4 space-y-4">
      {/* Site Name Header */}
      <div className="flex items-start gap-3 px-0.5">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            site.type === '공사 현장'
              ? 'bg-[#FEF3C7] text-[#B45309]'
              : 'bg-[#DCF5CE] text-[#16783A]'
          }`}
        >
          {site.type === '공사 현장' ? (
            <ExcavatorBadgeIcon className="w-6 h-6" />
          ) : (
            <Trees className="w-5 h-5" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                site.type === '공사 현장'
                  ? 'bg-[#FEF3C7] text-[#B45309]'
                  : 'bg-[#DCF5CE] text-[#16783A]'
              }`}
            >
              {site.type}
            </span>
            {site.isVirtualClassification && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#D7F1FA] text-[#095A2E]">
                시연용 가상 분류
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-[#17241C] leading-snug">
            {site.name}
          </h2>
          <p className="flex items-center gap-1 text-sm text-[#4A5B50]">
            <MapPin className="w-4 h-4 text-[#16783A] shrink-0" aria-hidden="true" />
            <span>{site.address}</span>
          </p>
        </div>
      </div>

      {/* Virtual Classification Notice for Idle Land */}
      {site.isVirtualClassification && site.virtualClassificationNotice && (
        <div
          role="note"
          className="rounded-2xl border border-[#93C5FD] bg-[#EFF6FF] p-3.5 flex items-start gap-2.5"
        >
          <Info className="w-5 h-5 text-[#1D4ED8] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="text-xs font-extrabold text-[#1E40AF]">
              시연용 가상 분류 안내
            </p>
            <p className="text-xs leading-relaxed text-[#1E3A8A]">
              {site.virtualClassificationNotice}
            </p>
          </div>
        </div>
      )}

      {/* Map Image or Honest Non-Photo Graphic */}
      <div className="rounded-2xl border border-[#E4E9E5] bg-white overflow-hidden">
        {site.type === '유휴부지' || imgError || !site.mapImage ? (
          <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#EDF8EA] via-[#F7FBF6] to-[#E6F4FA] flex flex-col items-center justify-center gap-2 text-[#095A2E] p-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#C1E9AC] flex items-center justify-center shadow-xs">
              <Trees className="w-6 h-6 text-[#16783A]" aria-hidden="true" />
            </div>
            <p className="text-sm font-extrabold text-[#17241C]">
              {site.name} · 현장 사진 자료 미제공
            </p>
            <p className="text-xs text-[#4A5B50] leading-relaxed max-w-[290px]">
              실제 현장 사진은 등록되어 있지 않으며, 아래 카카오맵 위치 검색으로 주변 지도를 확인할 수 있습니다.
            </p>
          </div>
        ) : (
          <img
            src={site.mapImage}
            alt={`${site.name} 위치 지도`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full aspect-[16/10] object-cover block"
          />
        )}
      </div>

      {/* Basic Info Card */}
      <section
        aria-label="기본 정보"
        className="rounded-2xl border border-[#E4E9E5] bg-white divide-y divide-[#EDF1EE]"
      >
        <div className="flex items-start gap-3 px-4 py-3 text-sm">
          <span className="w-20 shrink-0 font-bold text-[#4A5B50]">
            {site.type === '유휴부지' ? '표시명' : '사업명'}
          </span>
          <span className="font-bold text-[#17241C]">{site.name}</span>
        </div>
        <div className="flex items-start gap-3 px-4 py-3 text-sm">
          <span className="w-20 shrink-0 font-bold text-[#4A5B50]">주소</span>
          <span className="font-medium text-[#17241C]">{site.address}</span>
        </div>
        {site.currentStatus && (
          <div className="flex items-start gap-3 px-4 py-3 text-sm">
            <span className="w-20 shrink-0 font-bold text-[#4A5B50]">현재 상태</span>
            <span className="font-bold text-[#B45309]">{site.currentStatus}</span>
          </div>
        )}
        {site.utilizationPlan && (
          <div className="flex items-start gap-3 px-4 py-3 text-sm">
            <span className="w-20 shrink-0 font-bold text-[#4A5B50]">활용 방안</span>
            <span className="font-bold text-[#095A2E]">{site.utilizationPlan}</span>
          </div>
        )}
        <div className="flex items-start gap-3 px-4 py-3 text-sm">
          <span className="w-20 shrink-0 font-bold text-[#4A5B50]">사업 기간</span>
          <span
            className={`font-medium ${
              site.projectPeriod ? 'text-[#17241C]' : 'text-[#6A796F]'
            }`}
          >
            {periodText}
          </span>
        </div>
      </section>

      {/* 4-Stage Progress Timeline */}
      <StageTimeline
        stage={site.stage}
        progress={site.progress}
        currentWork={site.currentWork}
      />

      {/* Idle Land 3 Utilization Ideas Section */}
      {site.type === '유휴부지' &&
        site.utilizationIdeas &&
        site.utilizationIdeas.length > 0 && (
          <section
            aria-label="유휴부지 활용방안 제안"
            className="rounded-2xl border border-[#C1E9AC] bg-white p-4 space-y-3.5"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#DCF5CE] flex items-center justify-center text-[#16783A] shrink-0">
                <Lightbulb className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#17241C]">
                  유휴부지 활용방안 제안
                </h3>
                <p className="text-xs text-[#4A5B50]">
                  시민 의견 수렴을 위한 3가지 예시 아이디어입니다.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {site.utilizationIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="rounded-xl border border-[#E4E9E5] bg-[#FAFDFB] p-3.5 space-y-2"
                >
                  <h4 className="text-sm font-extrabold text-[#095A2E]">
                    {idea.numberLabel} {idea.title}
                  </h4>
                  <ul className="space-y-1 text-xs leading-relaxed text-[#384B3F]">
                    {idea.points.map((point) => (
                      <li key={point} className="flex items-start gap-1.5">
                        <span className="text-[#16783A] font-bold mt-0.5" aria-hidden="true">
                          •
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {site.utilizationCaveat && (
              <div
                role="note"
                className="rounded-xl border border-[#FCD34D] bg-[#FFFBEB] p-3 flex items-start gap-2"
              >
                <AlertCircle
                  className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-xs leading-relaxed text-[#78350F]">
                  {site.utilizationCaveat}
                </p>
              </div>
            )}
          </section>
        )}

      {/* Field Notice Card (shown primarily for construction site) */}
      {site.type === '공사 현장' && (
        <section
          aria-label="현장 통행 안내"
          className="rounded-2xl border border-[#FCD34D] bg-[#FFFBEB] p-4 space-y-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle
              className="w-5 h-5 text-[#F59E0B] shrink-0"
              aria-hidden="true"
            />
            <h3 className="text-base font-extrabold text-[#92400E]">현장 통행 안내</h3>
          </div>
          {site.notice ? (
            <div className="space-y-1.5">
              <p className="text-sm font-bold leading-relaxed text-[#78350F]">
                {site.notice}
              </p>
              <p className="text-xs leading-relaxed text-[#92400E]/90">
                세부 우회 동선 및 착수 일정은 현장 여건에 따라 변동될 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#78350F]">
                현재 등록된 통행 제한 공지가 없습니다.
              </p>
              <p className="text-xs leading-relaxed text-[#92400E]/90">
                이 안내는 시연용 예시 데이터에 통행 제한 공지 자료가 아직 등록되지 않았음을 의미하며, 실제 현장의 통행 가능 여부를 확정하는 정보가 아닙니다.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Last Updated */}
      <div className="flex items-center gap-2 px-1 text-sm text-[#5A6B60]">
        <Calendar className="w-4 h-4 text-[#7D8C82] shrink-0" aria-hidden="true" />
        <span>최종 업데이트: {updatedText}</span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-1 pb-2">
        {site.isIdeaEnabled && (
          <button
            type="button"
            onClick={() => onProposeIdea(site)}
            className="w-full min-h-[54px] rounded-2xl bg-[#16783A] hover:bg-[#095A2E] text-white font-extrabold text-base px-4 flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
          >
            <Lightbulb className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>이 땅, 이렇게 쓰면 어때요?</span>
          </button>
        )}

        <a
          href={kakaoMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-[54px] rounded-2xl bg-[#FEE500] hover:bg-[#F5DC00] text-[#17241C] font-extrabold text-base px-4 flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all"
        >
          <MapPin className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>카카오맵에서 위치 검색</span>
          <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
        </a>

        <button
          type="button"
          onClick={onBackToList}
          className="w-full min-h-[48px] rounded-2xl border border-[#E4E9E5] bg-white text-sm font-bold text-[#17241C] hover:bg-[#F2F6F3] active:scale-[0.99] transition-all cursor-pointer"
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}
