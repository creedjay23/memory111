import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AltitudeMode, APIProvider, Pin, useMapsLibrary } from '@vis.gl/react-google-maps';
import {
  Map3D,
  MapMode,
  Marker3D,
  Polygon3D,
  Popover,
  type Map3DCameraChangedEvent,
} from '@vis.gl/react-google-maps/3d';
import { Box, Compass, Eye, Layers, Loader2, MapPin, RotateCcw } from 'lucide-react';
import { SITE_DATA } from '../data/siteData';

type CameraPresetId = 'aerial' | 'ar-low' | 'bridge';

interface CameraViewState {
  center: google.maps.LatLngAltitudeLiteral;
  range: number;
  heading: number;
  tilt: number;
  roll: number;
}

const CAMERA_PRESETS: Record<
  CameraPresetId,
  {
    label: string;
    description: string;
    heading: number;
    tilt: number;
    range: number;
    query: string;
  }
> = {
  aerial: {
    label: '전체 조감도',
    description: '구글 3D 지형 위에서 산업단지 전체 규모와 주변 도로망을 조망합니다.',
    heading: 22,
    tilt: 58,
    range: 920,
    query: '강동일반산업단지 서울 강동구 상일동',
  },
  'ar-low': {
    label: 'AR 저각도 시점',
    description: '보행자·현장 시점에 가까운 저각도 3D 뷰로 가상 시설 배치를 미리 봅니다.',
    heading: 42,
    tilt: 76,
    range: 360,
    query: '강동일반산업단지 서울 강동구 상일동',
  },
  bridge: {
    label: '상일3교 예정 구간',
    description: '2027년 1월 철거 및 통행 제한이 예정된 상일3교 인근 구간을 확인합니다.',
    heading: 315,
    tilt: 64,
    range: 460,
    query: '상일3교 서울 강동구',
  },
};

function supportsWebGL2(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

function buildParkMassCoordinates(
  center: google.maps.LatLngAltitudeLiteral
): google.maps.LatLngAltitudeLiteral[] {
  const latOffset = 0.00055;
  const lngOffset = 0.00075;
  return [
    { lat: center.lat + latOffset, lng: center.lng - lngOffset, altitude: 28 },
    { lat: center.lat + latOffset, lng: center.lng + lngOffset, altitude: 28 },
    { lat: center.lat - latOffset, lng: center.lng + lngOffset, altitude: 28 },
    { lat: center.lat - latOffset, lng: center.lng - lngOffset, altitude: 28 },
    { lat: center.lat + latOffset, lng: center.lng - lngOffset, altitude: 28 },
  ];
}

interface Inner3DSceneProps {
  siteName: string;
  siteStage: string;
  siteProgress: number | null;
  siteWork: string | null;
}

function Inner3DScene({
  siteName,
  siteStage,
  siteProgress,
  siteWork,
}: Inner3DSceneProps) {
  const placesLibrary = useMapsLibrary('places');
  const [activePreset, setActivePreset] = useState<CameraPresetId>('aerial');
  const [showVirtualMass, setShowVirtualMass] = useState<boolean>(true);
  const [camera, setCamera] = useState<CameraViewState | null>(null);
  const [siteLocation, setSiteLocation] = useState<google.maps.LatLngAltitudeLiteral | null>(
    null
  );
  const [placeAddress, setPlaceAddress] = useState<string>('서울 강동구 상일동');
  const [loadingPlace, setLoadingPlace] = useState<boolean>(true);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<boolean>(false);
  const [popoverOpen, setPopoverOpen] = useState<boolean>(true);
  const [interactiveMarker, setInteractiveMarker] =
    useState<google.maps.maps3d.Marker3DInteractiveElement | null>(null);

  const resolvedCacheRef = useRef<
    Record<string, { center: google.maps.LatLngAltitudeLiteral; address: string }>
  >({});
  const siteLocationRef = useRef<google.maps.LatLngAltitudeLiteral | null>(null);
  const hasInitializedRef = useRef<boolean>(false);

  const handleMarkerRef = useCallback(
    (
      marker:
        | google.maps.maps3d.Marker3DElement
        | google.maps.maps3d.Marker3DInteractiveElement
        | null
    ) => {
      if (marker && 'addEventListener' in marker) {
        setInteractiveMarker(
          marker as google.maps.maps3d.Marker3DInteractiveElement
        );
      } else {
        setInteractiveMarker(null);
      }
    },
    []
  );

  const resolvePlaceForPreset = useCallback(
    async (presetId: CameraPresetId) => {
      const preset = CAMERA_PRESETS[presetId];
      const cached = resolvedCacheRef.current[preset.query];
      if (cached) {
        if (presetId === 'aerial' || !siteLocationRef.current) {
          siteLocationRef.current = cached.center;
          setSiteLocation(cached.center);
        }
        setPlaceAddress(cached.address);
        setPlaceError(null);
        setLoadingPlace(false);
        setCamera({
          center: cached.center,
          range: preset.range,
          heading: preset.heading,
          tilt: preset.tilt,
          roll: 0,
        });
        return;
      }

      if (!placesLibrary) return;
      setLoadingPlace(true);
      setPlaceError(null);

      try {
        const { Place } = placesLibrary;
        const timeoutPromise = new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error('PLACES_TIMEOUT')), 10000);
        });

        const searchPromise = Place.searchByText({
          textQuery: preset.query,
          fields: ['displayName', 'location', 'formattedAddress'],
          language: 'ko',
          region: 'KR',
          maxResultCount: 1,
          internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
        } as google.maps.places.SearchByTextRequest);

        const { places } = await Promise.race([searchPromise, timeoutPromise]);

        let targetLoc = places?.[0]?.location;
        let resolvedAddr = places?.[0]?.formattedAddress;

        // If sub-landmark (e.g. 상일3교) returns no result, fall back to primary site query
        if (!targetLoc && presetId !== 'aerial') {
          const primaryCached = resolvedCacheRef.current[CAMERA_PRESETS.aerial.query];
          if (primaryCached) {
            setSiteLocation(primaryCached.center);
            setPlaceAddress(primaryCached.address);
            setCamera({
              center: primaryCached.center,
              range: preset.range,
              heading: preset.heading,
              tilt: preset.tilt,
              roll: 0,
            });
            setLoadingPlace(false);
            return;
          }

          const fallbackRes = await Place.searchByText({
            textQuery: CAMERA_PRESETS.aerial.query,
            fields: ['displayName', 'location', 'formattedAddress'],
            language: 'ko',
            region: 'KR',
            maxResultCount: 1,
            internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
          } as google.maps.places.SearchByTextRequest);
          targetLoc = fallbackRes.places?.[0]?.location;
          resolvedAddr = fallbackRes.places?.[0]?.formattedAddress;
        }

        if (!targetLoc) {
          setPlaceError('구글 지도에서 대상 위치 좌표를 찾지 못했습니다.');
          setLoadingPlace(false);
          return;
        }

        const nextCenter: google.maps.LatLngAltitudeLiteral = {
          lat: targetLoc.lat(),
          lng: targetLoc.lng(),
          altitude: 15,
        };
        const finalAddress = resolvedAddr || '서울 강동구 상일동';

        resolvedCacheRef.current[preset.query] = {
          center: nextCenter,
          address: finalAddress,
        };

        if (presetId === 'aerial' || !siteLocationRef.current) {
          siteLocationRef.current = nextCenter;
          setSiteLocation(nextCenter);
        }
        setPlaceAddress(finalAddress);

        setCamera({
          center: nextCenter,
          range: preset.range,
          heading: preset.heading,
          tilt: preset.tilt,
          roll: 0,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('429') ||
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.toLowerCase().includes('quota')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          setPlaceError('구글 지도 API 요청 한도에 도달해 3D 위치 조회를 잠시 표시할 수 없습니다.');
        } else {
          setPlaceError('위치 정보를 불러오는 중 일시적인 오류가 발생했습니다.');
        }
      } finally {
        setLoadingPlace(false);
      }
    },
    [placesLibrary]
  );

  useEffect(() => {
    if (!placesLibrary || hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    void resolvePlaceForPreset('aerial');
  }, [placesLibrary, resolvePlaceForPreset]);

  const handleSelectPreset = (presetId: CameraPresetId) => {
    setActivePreset(presetId);
    void resolvePlaceForPreset(presetId);
  };

  const handleCameraChanged = useCallback((ev: Map3DCameraChangedEvent) => {
    setCamera((prev) => ({
      center: ev.detail.center ?? prev?.center ?? { lat: 0, lng: 0, altitude: 0 },
      range: ev.detail.range ?? prev?.range ?? 920,
      heading: ev.detail.heading ?? prev?.heading ?? 22,
      tilt: ev.detail.tilt ?? prev?.tilt ?? 58,
      roll: ev.detail.roll ?? prev?.roll ?? 0,
    }));
  }, []);

  const parkMassCoords = useMemo(
    () => (siteLocation ? buildParkMassCoordinates(siteLocation) : []),
    [siteLocation]
  );

  return (
    <div className="space-y-3">
      {/* Camera Angle Preset Controls */}
      <div
        role="group"
        aria-label="구글 3D 시점 선택"
        className="grid grid-cols-3 gap-1.5"
      >
        {(Object.keys(CAMERA_PRESETS) as CameraPresetId[]).map((presetKey) => {
          const isSelected = activePreset === presetKey;
          return (
            <button
              key={presetKey}
              type="button"
              onClick={() => handleSelectPreset(presetKey)}
              className={`min-h-[44px] rounded-xl px-2 text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#16783A] text-white shadow-xs'
                  : 'bg-[#F4F8F5] text-[#17241C] border border-[#E4E9E5] hover:bg-[#DCF5CE]/60'
              }`}
            >
              {CAMERA_PRESETS[presetKey].label}
            </button>
          );
        })}
      </div>

      {/* 3D Map Viewport */}
      <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-[#DCE4DE] bg-[#E8F0EB]">
        {mapError || placeError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center space-y-3 bg-gradient-to-br from-[#EDF5F0] to-[#D7F1FA]">
            <Compass className="w-9 h-9 text-[#16783A]" aria-hidden="true" />
            <p className="text-sm font-bold text-[#17241C]">
              {placeError ?? '구글 3D 지도를 현재 브라우저 환경에서 표시할 수 없습니다.'}
            </p>
            <p className="text-xs text-[#4A5B50] leading-relaxed">
              {placeError
                ? "상단의 '카메라 AR 콘셉트' 탭에서 목표 AR 화면 예시를 확인하거나 잠시 후 다시 시도해 주세요."
                : 'WebGL2가 지원되는 최신 모바일·데스크톱 브라우저에서 실사 3D 지형이 표시됩니다.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setMapError(false);
                void resolvePlaceForPreset(activePreset);
              }}
              className="min-h-[44px] px-4 rounded-xl bg-[#16783A] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>다시 시도</span>
            </button>
          </div>
        ) : loadingPlace || !camera || !siteLocation ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2.5 text-[#095A2E]">
            <Loader2 className="w-7 h-7 animate-spin" aria-hidden="true" />
            <p className="text-xs font-bold">구글 3D 지형 및 현장 위치 불러오는 중...</p>
          </div>
        ) : (
          <Map3D
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            mode={MapMode.HYBRID}
            center={camera.center}
            range={camera.range}
            heading={camera.heading}
            tilt={camera.tilt}
            roll={camera.roll}
            onCameraChanged={handleCameraChanged}
            onError={() => setMapError(true)}
            style={{ width: '100%', height: '100%' }}
          >
            <Marker3D
              ref={handleMarkerRef}
              position={siteLocation}
              altitudeMode={AltitudeMode.RELATIVE_TO_GROUND}
              extruded
              onClick={() => setPopoverOpen((prev) => !prev)}
              title={siteName}
            >
              <Pin
                borderColor="#095A2E"
                background="#16783A"
                glyphColor="#FFFFFF"
              />
            </Marker3D>

            {popoverOpen && interactiveMarker && (
              <Popover
                open
                anchor={interactiveMarker}
                onClose={() => setPopoverOpen(false)}
              >
                <div className="p-2.5 max-w-[210px] space-y-1 text-[#17241C]">
                  <p className="text-xs font-extrabold text-[#095A2E]">
                    {siteName}
                  </p>
                  <p className="text-[11px] font-bold">
                    {siteStage} 중 · 공정률 {siteProgress ?? 0}%
                  </p>
                  {siteWork && (
                    <p className="text-[11px] text-[#4A5B50]">{siteWork}</p>
                  )}
                  <p className="text-[10px] text-[#6A796F]">{placeAddress}</p>
                </div>
              </Popover>
            )}

            {showVirtualMass && parkMassCoords.length > 0 && (
              <Polygon3D
                outerCoordinates={parkMassCoords}
                altitudeMode={AltitudeMode.RELATIVE_TO_GROUND}
                extruded
                fillColor="#16783A88"
                strokeColor="#DCF5CEFF"
                strokeWidth={3}
              />
            )}
          </Map3D>
        )}

        {/* Overlay Toggle Pill inside viewport */}
        {!loadingPlace && !mapError && !placeError && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
            <button
              type="button"
              onClick={() => setShowVirtualMass((prev) => !prev)}
              className="pointer-events-auto min-h-[38px] px-3 rounded-xl bg-white/95 backdrop-blur-xs border border-[#DCE4DE] text-xs font-bold text-[#17241C] flex items-center gap-1.5 shadow-sm cursor-pointer hover:bg-[#DCF5CE]"
            >
              <Layers className="w-3.5 h-3.5 text-[#16783A]" aria-hidden="true" />
              <span>
                {showVirtualMass ? '가상 3D 부지 볼륨 켜짐' : '가상 3D 부지 볼륨 꺼짐'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Preset explanation */}
      <div className="rounded-xl bg-[#F4F8F5] border border-[#E4E9E5] px-3.5 py-2.5 flex items-start gap-2">
        <Eye className="w-4 h-4 text-[#16783A] shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-[#384B3F]">
          {CAMERA_PRESETS[activePreset].description}
        </p>
      </div>
    </div>
  );
}

export function GoogleMaps3DViewer() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const webgl2Supported = useMemo(() => supportsWebGL2(), []);
  const primarySite = SITE_DATA[0];

  if (!apiKey || !webgl2Supported) {
    return (
      <div
        data-testid="maps3d-fallback"
        className="rounded-2xl border border-[#DCE4DE] bg-gradient-to-br from-[#F4F9F5] via-white to-[#EAF6FB] p-4 space-y-3"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#095A2E]">
            <Box className="w-5 h-5 text-[#16783A]" aria-hidden="true" />
            <span className="text-sm font-extrabold">
              구글 3D 지도(Photorealistic 3D) 미리보기
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#5A6B60]">
            {!apiKey ? 'API 키 설정 필요' : 'WebGL2 환경 안내'}
          </span>
        </div>

        <div className="rounded-xl overflow-hidden border border-[#E4E9E5] bg-white">
          <img
            src="/assets/ar-concept-preview.png"
            alt="구글 3D 지도 기반 AR 미래 활용 시뮬레이션 예시"
            className="w-full h-auto object-contain block"
          />
        </div>

        <div className="rounded-xl bg-white/90 border border-[#E4E9E5] p-3 space-y-1.5 text-xs text-[#384B3F]">
          <p className="font-bold text-[#17241C] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#16783A]" aria-hidden="true" />
            <span>
              {primarySite?.name} ({primarySite?.stage} · 공정률 {primarySite?.progress}%)
            </span>
          </p>
          <p className="leading-relaxed text-[#5A6B60]">
            {!webgl2Supported
              ? '현재 실행 환경에서 WebGL2(GPU 가속)가 비활성화되어 있어 대체 예시 화면을 표시합니다. 일반 스마트폰·PC 브라우저에서는 구글 실사 3D 지형과 3D 볼륨 오버레이가 직접 구동됩니다.'
              : 'Google Maps Platform API 키가 연결되면 강동 일반산업단지의 실사 3D 지형과 가상 3D 부지 볼륨을 직접 회전·탐색할 수 있습니다.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={apiKey}
      libraries={['maps3d', 'marker', 'places']}
      language="ko"
      region="KR"
    >
      <Inner3DScene
        siteName={primarySite?.name ?? '강동 일반산업단지 조성공사'}
        siteStage={primarySite?.stage ?? '시공'}
        siteProgress={primarySite?.progress ?? null}
        siteWork={primarySite?.currentWork ?? null}
      />
    </APIProvider>
  );
}
