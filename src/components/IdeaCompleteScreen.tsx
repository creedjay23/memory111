import React from 'react';
import { CheckCircle2, Coins, Home, Info, Users } from 'lucide-react';
import { SUBMISSION_REWARD_POINTS } from '../utils/citizenStorage';

interface IdeaCompleteScreenProps {
  targetSiteName?: string;
  currentPoints: number;
  onGoCitizen: () => void;
  onGoHome: () => void;
}

export function IdeaCompleteScreen({
  targetSiteName = '상일동 8-2 유휴부지',
  currentPoints,
  onGoCitizen,
  onGoHome,
}: IdeaCompleteScreenProps) {
  return (
    <div className="flex-1 flex flex-col justify-between bg-white px-5 py-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-[#DCF5CE] flex items-center justify-center text-[#16783A]">
          <CheckCircle2 className="w-12 h-12" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-extrabold text-[#16783A]">
            {targetSiteName}
          </p>
          <h2 className="text-2xl font-extrabold text-[#17241C] text-balance">
            아이디어가 접수되었습니다!
          </h2>
          <p className="text-base font-medium text-[#4A5B50]">
            소중한 의견 감사합니다.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl border border-[#C1E9AC] bg-[#F4FBF0] px-4 py-2.5 text-sm font-extrabold text-[#095A2E]">
          <Coins className="w-4 h-4 text-[#16783A]" aria-hidden="true" />
          <span>
            +{SUBMISSION_REWARD_POINTS}P 적립 완료 (누적 {currentPoints.toLocaleString()}P)
          </span>
        </div>

        <div className="w-full rounded-2xl border border-[#E4E9E5] bg-[#F7FAF8] p-4 flex items-start gap-2.5 text-left">
          <Info className="w-5 h-5 text-[#16783A] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-[#384B3F] font-medium">
            시연용 참여 기록이 이 브라우저에 저장되었습니다. 실제 SH공사에 접수된 의견은 아닙니다.
          </p>
        </div>
      </div>

      <div className="pt-6 space-y-2.5">
        <button
          type="button"
          onClick={onGoCitizen}
          className="w-full min-h-[54px] rounded-2xl bg-[#16783A] hover:bg-[#095A2E] text-white text-base font-extrabold flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
        >
          <Users className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>시민참여 현황 확인하기</span>
        </button>

        <button
          type="button"
          onClick={onGoHome}
          className="w-full min-h-[48px] rounded-2xl border border-[#E4E9E5] bg-white text-sm font-bold text-[#17241C] hover:bg-[#F2F6F3] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>처음으로 돌아가기</span>
        </button>
      </div>
    </div>
  );
}
