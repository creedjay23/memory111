import React from 'react';
import { ChevronDown, ChevronRight, MapPin, Smartphone, Users } from 'lucide-react';
import { SEOUL_DISTRICTS } from '../data/siteData';
import {
  SeoulSkylineIllustration,
} from './Illustrations';

interface HomeScreenProps {
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
  onNavigateList: (filter: '공사 현장' | '유휴부지') => void;
  onNavigateCitizen: () => void;
  onNavigateArPreview: () => void;
}

export function HomeScreen({
  selectedDistrict,
  onSelectDistrict,
  onNavigateList,
  onNavigateCitizen,
  onNavigateArPreview,
}: HomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col justify-between bg-white">
      <div>
        {/* Top Brand Hero Banner */}
        <section
          aria-label="SH 현장 탐험 브랜드 배너"
          className="relative w-full overflow-hidden border-b border-[#E4E9E5] bg-[#EAF6FD]"
        >
          <h1 className="sr-only">
            SH 현장 탐험 — 서울의 변화를 한눈에, 우리 동네 공간의 미래를 함께 만들어갑니다.
          </h1>
          <img
            src="/assets/aistudio/KakaoTalk_Photo_2026-11-19-15-23-07_3a635bfc.png"
            alt="SH 현장 탐험 — 서울의 변화를 한눈에, 우리 동네 공간의 미래를 함께 만들어갑니다."
            referrerPolicy="no-referrer"
            className="w-full h-auto block select-none"
          />
        </section>

        <div className="px-5 pt-4 pb-4 space-y-4">
          {/* District Selection Card */}
        <section
          aria-label="자치구 선택 영역"
          className="rounded-2xl border border-[#E4E9E5] bg-[#FAFDFB] p-4 space-y-2.5"
        >
          <label
            htmlFor="district-select"
            className="flex items-center gap-1.5 text-sm font-bold text-[#17241C]"
          >
            <MapPin className="w-4 h-4 text-[#16783A] shrink-0" aria-hidden="true" />
            <span>자치구 선택</span>
          </label>

          <div className="relative">
            <select
              id="district-select"
              value={selectedDistrict}
              onChange={(e) => onSelectDistrict(e.target.value)}
              className="w-full min-h-[48px] appearance-none rounded-xl border border-[#C7D3CA] bg-white px-4 pr-10 text-base font-bold text-[#17241C] shadow-xs cursor-pointer hover:border-[#16783A] transition-colors"
            >
              {SEOUL_DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-5 h-5 text-[#095A2E] pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
          </div>
        </section>

        {/* Two Large Category Action Buttons */}
        <section aria-label="현장 유형 선택" className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onNavigateList('공사 현장')}
            className="group relative overflow-hidden min-h-[144px] rounded-2xl bg-gradient-to-b from-[#E5F6FE] via-[#D7F1FA] to-[#BFE6FA] border border-[#B5E1F4] shadow-xs p-4 flex flex-col items-center justify-between text-center hover:brightness-[0.98] active:scale-[0.98] transition-all cursor-pointer"
          >
            <div
              className="pointer-events-none absolute -bottom-4 -right-4 w-28 h-16 rounded-full bg-white/25"
              aria-hidden="true"
            />
            <img
              src="/assets/home-excavator.png"
              alt="공사 현장 굴착기"
              referrerPolicy="no-referrer"
              className="relative z-10 w-28 h-20 object-contain"
            />
            <div className="relative z-10 flex items-center justify-center gap-1 mt-1">
              <span className="text-[17px] font-extrabold text-[#17241C]">공사 현장</span>
              <ChevronRight
                className="w-4 h-4 text-[#095A2E] group-hover:translate-x-0.5 transition-transform"
                aria-hidden="true"
              />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateList('유휴부지')}
            className="group relative overflow-hidden min-h-[144px] rounded-2xl bg-gradient-to-b from-[#EFFCE7] via-[#DCF5CE] to-[#C7EDB1] border border-[#BEE6A8] shadow-xs p-4 flex flex-col items-center justify-between text-center hover:brightness-[0.98] active:scale-[0.98] transition-all cursor-pointer"
          >
            <div
              className="pointer-events-none absolute -bottom-4 -right-4 w-28 h-16 rounded-full bg-white/25"
              aria-hidden="true"
            />
            <img
              src="/assets/home-park-trees.png"
              alt="유휴부지 녹지 나무"
              referrerPolicy="no-referrer"
              className="relative z-10 w-28 h-20 object-contain"
            />
            <div className="relative z-10 flex items-center justify-center gap-1 mt-1">
              <span className="text-[17px] font-extrabold text-[#17241C]">유휴부지</span>
              <ChevronRight
                className="w-4 h-4 text-[#095A2E] group-hover:translate-x-0.5 transition-transform"
                aria-hidden="true"
              />
            </div>
          </button>
        </section>

        {/* Lower Feature Shortcuts */}
        <section aria-label="시민 소통 서비스 바로가기" className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={onNavigateCitizen}
            className="w-full min-h-[56px] rounded-2xl border border-[#C1E9AC] bg-[#F4FBF0] px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-[#DCF5CE]/60 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#DCF5CE] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#16783A]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#095A2E]">
                  시민참여
                </p>
                <p className="text-xs text-[#4C6253] leading-snug">
                  참여 포인트·활동 기록 및 유휴부지 아이디어 제안
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#16783A] shrink-0" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onNavigateArPreview}
            className="w-full min-h-[56px] rounded-2xl border border-[#E4E9E5] bg-white px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-[#F5F8F6] active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#D7F1FA] flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-[#095A2E]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#17241C] truncate">
                  AR 미래 공간 미리보기
                </p>
                <p className="text-xs text-[#5A6B60] truncate">
                  AR로 보는 미래 공간 및 현재·미래 비교
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#5A6B60] shrink-0" aria-hidden="true" />
          </button>
        </section>
        </div>
      </div>

      {/* Bottom Seoul Cityscape & Trees Illustration */}
      <div className="w-full pt-2 overflow-hidden">
        <SeoulSkylineIllustration className="w-full h-auto block" />
      </div>
    </div>
  );
}
