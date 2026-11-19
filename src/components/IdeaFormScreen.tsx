import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ChevronDown, Info, MapPin, Send } from 'lucide-react';
import { MAX_IDEA_LENGTH, validateIdeaInput } from '../utils/siteHelpers';
import { CITIZEN_TARGET_SITES, SUBMISSION_REWARD_POINTS } from '../utils/citizenStorage';
import { IdeaMeadowIllustration } from './Illustrations';

interface IdeaFormScreenProps {
  targetSiteName?: string;
  targetAddress?: string;
  allowSiteSelect?: boolean;
  onSubmitSuccess: (targetSiteLabel: string, ideaText: string) => void;
}

const IDEA_QUICK_TOPICS = [
  '주민 쉼터 및 소규모 녹지공간',
  '주민 참여형 마을정원',
  '임시 문화·커뮤니티 공간',
] as const;

export function IdeaFormScreen({
  targetSiteName = '상일동 8-2 유휴부지',
  targetAddress = '서울특별시 강동구 상일동 8-2',
  allowSiteSelect = false,
  onSubmitSuccess,
}: IdeaFormScreenProps) {
  const defaultSiteOption = targetAddress
    ? `${targetSiteName} (${targetAddress})`
    : targetSiteName;

  const [selectedSiteOption, setSelectedSiteOption] = useState<string>(defaultSiteOption);
  const [ideaText, setIdeaText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitGuardRef = useRef<boolean>(false);

  useEffect(() => {
    setSelectedSiteOption(defaultSiteOption);
    submitGuardRef.current = false;
    setIsSubmitting(false);
  }, [defaultSiteOption]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value.slice(0, MAX_IDEA_LENGTH);
    setIdeaText(nextValue);
    if (errorMessage && nextValue.trim().length > 0) {
      setErrorMessage(null);
    }
  };

  const handleInsertTopic = (topic: string) => {
    const snippet = `${topic} 조성을 제안합니다. `;
    const nextValue = (
      ideaText.trim().length === 0 ? snippet : `${ideaText.trimEnd()} ${snippet}`
    ).slice(0, MAX_IDEA_LENGTH);
    setIdeaText(nextValue);
    if (errorMessage && nextValue.trim().length > 0) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitGuardRef.current) {
      return;
    }

    const validation = validateIdeaInput(ideaText);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      return;
    }

    submitGuardRef.current = true;
    setIsSubmitting(true);

    const submittedContent = ideaText.trim();
    const resolvedSiteLabel = allowSiteSelect ? selectedSiteOption : targetSiteName;

    setIdeaText('');
    setErrorMessage(null);
    onSubmitSuccess(resolvedSiteLabel, submittedContent);
  };

  return (
    <div className="flex-1 flex flex-col bg-white px-5 py-5 space-y-5">
      {/* Target Site & Address Banner */}
      <section
        aria-label="제안 대상 부지 정보"
        data-testid="idea-target-site-card"
        className="rounded-2xl border border-[#C1E9AC] bg-[#F4FBF0] p-3.5 space-y-2"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-[#095A2E]">
            {allowSiteSelect ? '대상 유휴부지 선택' : `대상 부지 · ${targetSiteName}`}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-[#D7F1FA] px-2 py-0.5 text-[10px] font-bold text-[#095A2E]">
            <Info className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>제출 시 +{SUBMISSION_REWARD_POINTS}P</span>
          </span>
        </div>

        {allowSiteSelect ? (
          <div className="relative">
            <select
              aria-label="유휴부지 선택"
              value={selectedSiteOption}
              onChange={(e) => setSelectedSiteOption(e.target.value)}
              className="w-full min-h-[44px] appearance-none rounded-xl border border-[#C7D3CA] bg-white px-3.5 pr-9 text-sm font-bold text-[#17241C] cursor-pointer focus:border-[#16783A]"
            >
              {CITIZEN_TARGET_SITES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-4 h-4 text-[#095A2E] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
          </div>
        ) : (
          <p className="flex items-center gap-1.5 text-sm font-bold text-[#17241C]">
            <MapPin className="w-4 h-4 text-[#16783A] shrink-0" aria-hidden="true" />
            <span>{targetAddress}</span>
          </p>
        )}
      </section>

      {/* Lightbulb Illustration & Heading */}
      <div className="flex flex-col items-center text-center space-y-2">
        <IdeaMeadowIllustration className="w-56 h-auto" />
        <h2 className="text-2xl font-extrabold text-[#17241C] text-balance">
          이 땅, 이렇게 쓰면 어때요?
        </h2>
        <p className="text-sm text-[#4A5B50] leading-relaxed">
          여러분의 아이디어로 우리 동네 유휴공간을 새롭게 만들어보세요.
        </p>
      </div>

      {/* Quick Idea Chips */}
      <div className="space-y-1.5">
        <p className="text-xs font-bold text-[#4A5B50]">추천 키워드 바로 넣기</p>
        <div className="flex flex-wrap gap-1.5">
          {IDEA_QUICK_TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => handleInsertTopic(topic)}
              className="min-h-[36px] rounded-xl border border-[#D4E6CC] bg-[#FAFDFB] px-2.5 py-1 text-xs font-bold text-[#095A2E] hover:bg-[#DCF5CE]/70 active:scale-[0.98] transition-all cursor-pointer"
            >
              + {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Idea Form (strictly no personal info inputs) */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4" noValidate>
        <div className="space-y-2">
          <label
            htmlFor="idle-land-idea"
            className="block text-sm font-bold text-[#17241C]"
          >
            아이디어 내용
          </label>
          <textarea
            id="idle-land-idea"
            value={ideaText}
            onChange={handleTextChange}
            maxLength={MAX_IDEA_LENGTH}
            rows={5}
            placeholder="주민 쉼터, 작은 마을정원, 임시 문화공간 등 유휴부지를 활용할 아이디어를 자유롭게 작성해주세요."
            aria-describedby="idea-char-count"
            aria-invalid={errorMessage ? 'true' : 'false'}
            className={`w-full rounded-2xl border bg-[#FAFDFB] p-4 text-base leading-relaxed text-[#17241C] placeholder:text-[#7D8C82] resize-none transition-colors ${
              errorMessage
                ? 'border-[#DC2626] focus:border-[#DC2626]'
                : 'border-[#C7D3CA] focus:border-[#16783A]'
            }`}
          />
          <div className="flex items-center justify-between gap-2 px-1">
            {errorMessage ? (
              <p
                role="alert"
                className="flex items-center gap-1.5 text-xs font-bold text-[#DC2626]"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </p>
            ) : (
              <span className="text-xs text-[#6A796F]">
                이름·연락처 등 개인정보는 기재하지 마세요.
              </span>
            )}
            <span
              id="idea-char-count"
              className={`text-xs font-bold tabular-nums shrink-0 ${
                ideaText.length >= MAX_IDEA_LENGTH
                  ? 'text-[#B45309]'
                  : 'text-[#5A6B60]'
              }`}
            >
              {ideaText.length} / {MAX_IDEA_LENGTH}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-[#F7FAF8] border border-[#E4E9E5] px-3 py-2.5 text-[11px] leading-relaxed text-[#4A5B50]">
          실제 서버로 전송되지 않으며, 개인정보 없는 시연용 요약 기록만 이 브라우저에 저장됩니다.
        </div>

        <div className="pt-1 mt-auto">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[54px] rounded-2xl bg-[#16783A] hover:bg-[#095A2E] disabled:opacity-60 text-white text-base font-extrabold flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>아이디어 제출하기 (+{SUBMISSION_REWARD_POINTS}P)</span>
          </button>
        </div>
      </form>
    </div>
  );
}
