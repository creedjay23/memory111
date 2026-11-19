import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Box,
  Camera,
  CheckCircle2,
  ChevronDown,
  Compass,
  HardHat,
  Home,
  Layers,
  MapPin,
  MoveHorizontal,
  RefreshCw,
  SlidersHorizontal,
  Trees,
  VideoOff,
} from 'lucide-react';
import { AR_SIMULATION_SITES, DUMMY_IMAGES } from '../data/dummyImages';
import { GoogleMaps3DViewer } from './GoogleMaps3DViewer';

interface ArPreviewScreenProps {
  onGoHome: () => void;
}

type ArTabMode = 'compare' | 'camera-ar' | 'google-3d';

const FEASIBILITY_ITEMS = [
  {
    id: 'feasible-now',
    level: '현재 웹·구글 3D로 즉시 구현 가능',
    title: '현재·미래 비교 및 실사 3D 지형 시뮬레이션',
    description:
      '구글 Photorealistic 3D 지도와 현장 전경·미래 활용 조감도를 겹쳐 보며 사업 규모와 공간 변화를 웹에서 바로 확인할 수 있습니다.',
    icon: CheckCircle2,
    tintClass: 'bg-[#DCF5CE] text-[#16783A]',
  },
  {
    id: 'needs-ar-dev',
    level: '정밀 야외 AR 확장 시 추가 연동',
    title: '스마트폰 카메라 영상 정합 및 야외 측위(VPS)',
    description:
      '현재는 카메라 화면 위로 미래 공간 예시를 겹쳐 보여주며, 현장 오차 없는 고정을 위해서는 GPS·VPS 측위 및 BIM/CAD 좌표 정합 개발이 추가됩니다.',
    icon: Camera,
    tintClass: 'bg-[#D7F1FA] text-[#095A2E]',
  },
] as const;

const AR_FEATURES = [
  {
    id: 'construction-preview',
    title: '공사 현장 미래 모습 미리보기',
    description:
      '현재 진행 중인 토공·우회도로 공사와 향후 완공 모습을 좌우 비교 슬라이더와 AR 뷰로 확인합니다.',
    icon: HardHat,
    tintClass: 'bg-[#D7F1FA] text-[#095A2E]',
  },
  {
    id: 'idle-visualization',
    title: '유휴부지 활용 컨셉 시각화',
    description:
      '주민 쉼터, 벤치, 산책로, 녹지공간, 작은 꽃밭 등이 조성된 미래 공원 모습을 가상으로 미리 확인합니다.',
    icon: Trees,
    tintClass: 'bg-[#DCF5CE] text-[#16783A]',
  },
  {
    id: 'spatial-scale',
    title: '현장 위치와 시설 규모 직관적 확인',
    description:
      '투명도 조절과 구글 3D 시점 전환으로 주변 도로(상일3교 등)와 공간 규모를 함께 파악합니다.',
    icon: Layers,
    tintClass: 'bg-[#FEF3C7] text-[#B45309]',
  },
] as const;

function SafePreviewImage({
  src,
  alt,
  className = '',
  style,
  testId,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  testId?: string;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError) {
    return (
      <div
        className={`bg-gradient-to-br from-[#DCF5CE] to-[#D7F1FA] flex flex-col items-center justify-center gap-1.5 p-4 text-center text-[#095A2E] ${className}`}
        style={style}
      >
        <Box className="w-7 h-7" aria-hidden="true" />
        <span className="text-xs font-bold">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      data-testid={testId}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      style={style}
      className={className}
    />
  );
}

export function ArPreviewScreen({ onGoHome }: ArPreviewScreenProps) {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    AR_SIMULATION_SITES[0].id
  );
  const [activeTab, setActiveTab] = useState<ArTabMode>('compare');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(72);
  const [cameraStatus, setCameraStatus] = useState<
    'idle' | 'requesting' | 'live' | 'fallback'
  >('idle');
  const [cameraReason, setCameraReason] = useState<string>(
    '카메라 미지원 또는 권한 거부 환경에서는 가상 배경 이미지로 자동 전환됩니다.'
  );

  const compareBoxRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const selectedSite =
    AR_SIMULATION_SITES.find((s) => s.id === selectedSiteId) ??
    AR_SIMULATION_SITES[0];
  const siteImages =
    DUMMY_IMAGES[selectedSite.id] ?? DUMMY_IMAGES['gangdong-industrial'];

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCameraStream = useCallback(async () => {
    stopCameraStream();

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setCameraStatus('fallback');
      setCameraReason(
        '현재 브라우저에서 실시간 카메라 API를 지원하지 않아 가상 배경 이미지로 자동 전환되었습니다.'
      );
      return;
    }

    setCameraStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCameraStatus('live');
      setCameraReason('실시간 카메라 화면 위로 미래 공간 예시가 투영됩니다.');
    } catch {
      setCameraStatus('fallback');
      setCameraReason(
        '카메라 권한이 거부되었거나 장치가 없어 가상 배경 이미지로 자동 전환되었습니다.'
      );
    }
  }, [stopCameraStream]);

  useEffect(() => {
    if (activeTab === 'camera-ar') {
      void startCameraStream();
    } else {
      stopCameraStream();
      setCameraStatus('idle');
    }
    return () => {
      stopCameraStream();
    };
  }, [activeTab, startCameraStream, stopCameraStream]);

  const updateSliderFromClientX = (clientX: number) => {
    const container = compareBoxRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0) return;
    const rawPct = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(0, Math.min(100, Math.round(rawPct)));
    setSliderPosition(clamped);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F9FBFA] px-4 py-4 space-y-4">
      {/* Status Banner */}
      <div className="rounded-xl bg-[#D7F1FA] border border-[#B5E2F2] px-3.5 py-2.5 flex items-center justify-center gap-2">
        <Box className="w-4 h-4 text-[#095A2E] shrink-0" aria-hidden="true" />
        <span className="text-xs sm:text-sm font-extrabold text-[#095A2E]">
          AR 미래 공간 미리보기 · AR로 보는 미래 공간
        </span>
      </div>

      {/* Headline */}
      <div className="text-center space-y-1.5 px-1">
        <h2 className="text-[21px] leading-snug font-extrabold text-[#17241C] text-balance">
          AR로 보는 미래 공간 미리보기
        </h2>
        <p className="text-xs sm:text-sm text-[#4A5B50] leading-relaxed">
          대상 부지를 선택하고 현재 공간과 미래 활용 예시를 비교하거나 카메라 AR 뷰로 미리 살펴보세요.
        </p>
      </div>

      {/* Target Site Dropdown Selector */}
      <section
        aria-label="AR 미리보기 대상 부지 선택"
        className="rounded-2xl border border-[#E4E9E5] bg-white p-3.5 space-y-2"
      >
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="ar-site-select"
            className="flex items-center gap-1.5 text-xs font-extrabold text-[#095A2E]"
          >
            <MapPin className="w-3.5 h-3.5 text-[#16783A] shrink-0" aria-hidden="true" />
            <span>대상 부지 선택</span>
          </label>
          <span className="text-[11px] font-bold text-[#16783A] bg-[#DCF5CE]/70 px-2 py-0.5 rounded-lg">
            {selectedSite.statusBadge}
          </span>
        </div>

        <div className="relative">
          <select
            id="ar-site-select"
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="w-full min-h-[46px] appearance-none rounded-xl border border-[#C7D3CA] bg-[#FAFDFB] px-3.5 pr-9 text-sm font-bold text-[#17241C] cursor-pointer hover:border-[#16783A] transition-colors"
          >
            {AR_SIMULATION_SITES.map((site) => (
              <option key={site.id} value={site.id}>
                [{site.siteType}] {site.name} ({site.district})
              </option>
            ))}
          </select>
          <ChevronDown
            className="w-4 h-4 text-[#095A2E] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
        </div>

        <p className="text-xs text-[#4A5B50] leading-relaxed px-0.5">
          {selectedSite.summary}
        </p>
      </section>

      {/* 3 Mode Switcher Tabs */}
      <div
        role="tablist"
        aria-label="AR 미리보기 모드 선택"
        className="grid grid-cols-3 gap-1 p-1 bg-[#E8EFEA] rounded-2xl"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'compare'}
          onClick={() => setActiveTab('compare')}
          className={`min-h-[44px] rounded-xl px-1.5 text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'compare'
              ? 'bg-white text-[#095A2E] shadow-xs'
              : 'text-[#4A5B50] hover:text-[#17241C]'
          }`}
        >
          <MoveHorizontal className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>현재·미래 비교</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'camera-ar'}
          onClick={() => setActiveTab('camera-ar')}
          className={`min-h-[44px] rounded-xl px-1.5 text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'camera-ar'
              ? 'bg-white text-[#095A2E] shadow-xs'
              : 'text-[#4A5B50] hover:text-[#17241C]'
          }`}
        >
          <Camera className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>카메라 AR</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'google-3d'}
          onClick={() => setActiveTab('google-3d')}
          className={`min-h-[44px] rounded-xl px-1.5 text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'google-3d'
              ? 'bg-white text-[#095A2E] shadow-xs'
              : 'text-[#4A5B50] hover:text-[#17241C]'
          }`}
        >
          <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>구글 3D</span>
        </button>
      </div>

      {/* Mode 1: 현재 공간 / 미래 활용 예시 Comparison Drag Slider */}
      {activeTab === 'compare' && (
        <section
          aria-label="현재 공간과 미래 활용 예시 비교 영역"
          className="rounded-2xl border border-[#E4E9E5] bg-white p-3.5 space-y-3"
        >
          <div className="flex items-center justify-between gap-2 text-xs px-0.5">
            <span className="font-extrabold text-[#095A2E]">
              현재 공간 / 미래 활용 예시 비교
            </span>
            <span className="font-semibold text-[#5A6B60] tabular-nums">
              분할 {sliderPosition}%
            </span>
          </div>

          {/* Interactive Draggable Before & After Frame */}
          <div
            ref={compareBoxRef}
            data-testid="before-after-container"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-[#DCE4DE] bg-[#EDF2EE] select-none touch-none cursor-ew-resize"
          >
            {/* Base layer: After (미래 활용 예시) */}
            <SafePreviewImage
              src={siteImages.after}
              alt={`${selectedSite.name} ${selectedSite.afterLabel}`}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* Clipped top layer: Before (현재 공간) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
              }}
            >
              <SafePreviewImage
                src={siteImages.before}
                alt={`${selectedSite.name} ${selectedSite.beforeLabel}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Vertical Divider Handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.45)] pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border-2 border-[#16783A] shadow-md flex items-center justify-center text-[#16783A]">
                <MoveHorizontal className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>

            {/* Virtual Background Label on Left / Before side */}
            {selectedSite.isVirtualBefore && sliderPosition > 18 && (
              <div className="absolute top-2 left-2 rounded-md bg-[#17241C]/80 px-2 py-0.5 text-[10px] font-bold text-[#FEF3C7] pointer-events-none">
                가상 배경 이미지
              </div>
            )}

            {/* Bottom Corner Labels */}
            <div className="absolute bottom-2 left-2 rounded-lg bg-[#17241C]/80 px-2 py-1 text-[10px] font-bold text-white pointer-events-none">
              현재 공간
            </div>
            <div className="absolute bottom-2 right-2 rounded-lg bg-[#16783A]/90 px-2 py-1 text-[10px] font-bold text-white pointer-events-none">
              미래 활용 예시
            </div>
          </div>

          {/* Range Slider Control & Quick Presets */}
          <div className="space-y-2 pt-0.5">
            <input
              type="range"
              min={0}
              max={100}
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              aria-label="현재 공간과 미래 활용 예시 비교 슬라이더"
              className="w-full accent-[#16783A] cursor-pointer"
            />
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setSliderPosition(100)}
                className="min-h-[36px] rounded-xl border border-[#E4E9E5] bg-[#F7FAF8] text-xs font-bold text-[#17241C] hover:bg-[#DCF5CE]/60 cursor-pointer"
              >
                현재 공간만
              </button>
              <button
                type="button"
                onClick={() => setSliderPosition(50)}
                className="min-h-[36px] rounded-xl border border-[#E4E9E5] bg-[#F7FAF8] text-xs font-bold text-[#095A2E] hover:bg-[#DCF5CE]/60 cursor-pointer"
              >
                50 : 50 비교
              </button>
              <button
                type="button"
                onClick={() => setSliderPosition(0)}
                className="min-h-[36px] rounded-xl border border-[#E4E9E5] bg-[#F7FAF8] text-xs font-bold text-[#16783A] hover:bg-[#DCF5CE]/60 cursor-pointer"
              >
                미래 활용 예시
              </button>
            </div>
          </div>

          {/* Required AI Virtual Rendering Disclaimer */}
          <div
            role="note"
            className="rounded-xl bg-[#F4F8F5] border border-[#DCE4DE] px-3 py-2 text-[11px] leading-relaxed text-[#4A5B50] font-medium"
          >
            미래 활용 이미지는 AI로 제작한 가상 조감도이며 실제 개발계획과 다를 수 있습니다.
          </div>
        </section>
      )}

      {/* Mode 2: AR로 보는 미래 공간 (Camera AR Overlay + Spatial Corner Brackets) */}
      {activeTab === 'camera-ar' && (
        <section
          aria-label="AR로 보는 미래 공간 카메라 뷰"
          className="rounded-2xl border border-[#E4E9E5] bg-white p-3.5 space-y-3"
        >
          <div className="flex items-center justify-between gap-2 text-xs px-0.5">
            <span className="font-extrabold text-[#095A2E]">
              AR로 보는 미래 공간 · {selectedSite.siteType}
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded-lg ${
                cameraStatus === 'live'
                  ? 'bg-[#DCF5CE] text-[#16783A]'
                  : 'bg-[#D7F1FA] text-[#095A2E]'
              }`}
            >
              {cameraStatus === 'live'
                ? '실시간 카메라 연동'
                : cameraStatus === 'requesting'
                ? '카메라 연결 중...'
                : '가상 배경 이미지'}
            </span>
          </div>

          {/* Smartphone Camera AR Viewport (clean HUD, no outer bezel) */}
          <div
            data-testid="camera-ar-viewport"
            className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-[#DCE4DE] bg-[#17241C]"
          >
            {/* Background layer: Live Camera Video OR Photorealistic Virtual Background */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${
                cameraStatus === 'live' ? 'block' : 'hidden'
              }`}
            />

            {cameraStatus !== 'live' && (
              <SafePreviewImage
                src={siteImages.before}
                alt={`${selectedSite.name} 가상 배경 이미지`}
                testId="camera-ar-virtual-bg"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* Overlaid AR 3D / Future Concept Layer with adjustable opacity */}
            <SafePreviewImage
              src={siteImages.arCameraExample}
              alt={`${selectedSite.name} AR 미래 조성 모습 예시`}
              testId="camera-ar-overlay-img"
              style={{ opacity: overlayOpacity / 100 }}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-75 pointer-events-none"
            />

            {/* AR Spatial Recognition Corner Brackets & HUD Overlay */}
            <div className="absolute inset-3 pointer-events-none flex flex-col justify-between">
              {/* Top Bar: Site Name & Opacity Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-lg bg-[#17241C]/80 backdrop-blur-xs px-2.5 py-1 text-[11px] font-extrabold text-white shadow-xs">
                  {selectedSite.name}
                </span>
                <span className="rounded-lg bg-[#16783A]/90 px-2 py-1 text-[10px] font-bold text-white tabular-nums">
                  AR 투영 {overlayOpacity}%
                </span>
              </div>

              {/* Center AR Corner Recognition Border */}
              <div className="relative mx-auto w-[74%] h-[58%]">
                <span className="absolute top-0 left-0 w-5 h-5 border-t-[2.5px] border-l-[2.5px] border-white/95 rounded-tl-sm" />
                <span className="absolute top-0 right-0 w-5 h-5 border-t-[2.5px] border-r-[2.5px] border-white/95 rounded-tr-sm" />
                <span className="absolute bottom-0 left-0 w-5 h-5 border-b-[2.5px] border-l-[2.5px] border-white/95 rounded-bl-sm" />
                <span className="absolute bottom-0 right-0 w-5 h-5 border-b-[2.5px] border-r-[2.5px] border-white/95 rounded-br-sm" />
              </div>

              {/* Bottom Bar: "미래 조성 모습 예시" */}
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-[#17241C]/80 backdrop-blur-xs px-3 py-1 text-[11px] font-bold text-[#DCF5CE]">
                  미래 조성 모습 예시
                </span>
                {cameraStatus !== 'live' && (
                  <span className="rounded-md bg-[#17241C]/75 px-2 py-0.5 text-[10px] font-bold text-[#FEF3C7]">
                    가상 배경 이미지
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Overlay Opacity Slider */}
          <div className="rounded-xl bg-[#F4F8F5] border border-[#E4E9E5] p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#17241C]">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#16783A]" aria-hidden="true" />
                <span>AR 미래 공간 오버레이 투명도</span>
              </span>
              <span className="text-[#16783A] tabular-nums">{overlayOpacity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              aria-label="AR 오버레이 투명도 조절"
              className="w-full accent-[#16783A] cursor-pointer"
            />
          </div>

          {/* Virtual Example Caveat */}
          <div className="rounded-xl bg-[#FFFBEB] border border-[#FCD34D] px-3 py-2 text-[11px] leading-relaxed text-[#78350F]">
            {selectedSite.arCaveat}
          </div>

          {/* Camera Fallback Status & Retry */}
          <div className="rounded-xl bg-[#FAFDFB] border border-[#E4E9E5] px-3 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              {cameraStatus === 'live' ? (
                <Camera className="w-4 h-4 text-[#16783A] shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <VideoOff className="w-4 h-4 text-[#095A2E] shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <p className="text-[11px] leading-relaxed text-[#4A5B50]">
                {cameraReason}
              </p>
            </div>
            {cameraStatus !== 'live' && (
              <button
                type="button"
                onClick={() => void startCameraStream()}
                className="min-h-[36px] px-2.5 rounded-lg border border-[#C7D3CA] bg-white text-[11px] font-bold text-[#095A2E] flex items-center gap-1 shrink-0 hover:bg-[#DCF5CE]/60 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" aria-hidden="true" />
                <span>재시도</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* Mode 3: Google Maps 3D Real-time Example */}
      {activeTab === 'google-3d' && (
        <section
          aria-label="구글 3D 지도 예시"
          className="rounded-2xl border border-[#E4E9E5] bg-white p-3.5 space-y-3"
        >
          <div className="flex items-center justify-between text-xs px-0.5">
            <span className="font-extrabold text-[#095A2E]">
              Google Maps 3D · 강동 일반산업단지
            </span>
            <span className="font-semibold text-[#5A6B60]">
              드래그·회전 가능
            </span>
          </div>
          <GoogleMaps3DViewer />
        </section>
      )}

      {/* Quick Visual Reference Gallery: A. Construction AR & B. Idle-Land Concept */}
      <section aria-label="AR 구현 예시 한눈에 보기" className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-extrabold text-[#17241C]">
            AR 구현 예시 미리보기
          </h3>
          <span className="text-[11px] font-bold text-[#5A6B60]">가상 예시</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {AR_SIMULATION_SITES.map((item) => {
            const pair = DUMMY_IMAGES[item.id];
            const isSelected = selectedSiteId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedSiteId(item.id);
                  setActiveTab('camera-ar');
                }}
                className={`text-left rounded-2xl border bg-white overflow-hidden transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#16783A] ring-1 ring-[#16783A]/30'
                    : 'border-[#E4E9E5] hover:border-[#16783A]/60'
                }`}
              >
                <div className="relative aspect-[16/9] bg-[#EDF2EE]">
                  <SafePreviewImage
                    src={pair.arCameraExample}
                    alt={`${item.name} 미래 조성 모습 예시`}
                    className="w-full h-full object-cover block"
                  />
                  <div className="absolute top-2 left-2 rounded-md bg-[#17241C]/80 px-2 py-0.5 text-[10px] font-extrabold text-white">
                    {item.name}
                  </div>
                  <div className="absolute bottom-2 left-2 rounded-full bg-[#16783A]/90 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    미래 조성 모습 예시
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-[#095A2E]">
                      {item.siteType} AR 예시 · {item.address}
                    </span>
                    <span className="text-[11px] font-bold text-[#16783A]">
                      AR 보기 &rsaquo;
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A6B60] leading-relaxed">
                    {item.arCaveat}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Feasibility Breakdown Section */}
      <section aria-label="구글 3D 기반 AR 실현 가능성" className="space-y-2.5">
        <h3 className="text-base font-extrabold text-[#17241C] px-1">
          구글 3D 및 웹 AR 실현 가능 범위
        </h3>
        {FEASIBILITY_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-[#E4E9E5] bg-white p-4 flex items-start gap-3.5"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.tintClass}`}
              >
                <IconComponent className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-extrabold text-[#16783A]">
                  {item.level}
                </p>
                <h4 className="text-sm font-extrabold text-[#17241C]">
                  {item.title}
                </h4>
                <p className="text-xs leading-relaxed text-[#4A5B50]">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3 Feature Introduction Cards */}
      <section aria-label="AR 서비스 주요 기능 소개" className="space-y-2.5">
        <h3 className="text-base font-extrabold text-[#17241C] px-1">
          주요 제공 기능
        </h3>
        {AR_FEATURES.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={feature.id}
              className="rounded-2xl border border-[#E4E9E5] bg-white p-4 flex items-start gap-3.5"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${feature.tintClass}`}
              >
                <IconComponent className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-sm font-extrabold text-[#17241C]">
                  {feature.title}
                </h4>
                <p className="text-xs leading-relaxed text-[#4A5B50]">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Explicit Disclaimer */}
      <div
        role="note"
        className="rounded-2xl border border-[#FCD34D] bg-[#FFFBEB] p-4 flex items-start gap-2.5"
      >
        <AlertCircle
          className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="space-y-1 text-left">
          <p className="text-sm font-extrabold text-[#92400E]">가상 시뮬레이션 안내</p>
          <p className="text-xs leading-relaxed text-[#78350F]">
            미래 활용 이미지는 AI로 제작한 가상 조감도이며 실제 개발계획과 다를 수 있습니다. 카메라 권한 거부 또는 미지원 환경에서는 가상 배경 이미지로 자동 전환됩니다.
          </p>
        </div>
      </div>

      {/* Home Return CTA */}
      <div className="pt-1 pb-2">
        <button
          type="button"
          onClick={onGoHome}
          className="w-full min-h-[52px] rounded-2xl bg-[#16783A] hover:bg-[#095A2E] text-white text-base font-extrabold flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
        >
          <Home className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>처음으로 돌아가기</span>
        </button>
      </div>
    </div>
  );
}
