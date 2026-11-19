export interface ArSimulationSite {
  id: string;
  siteType: '공사 현장' | '유휴부지';
  name: string;
  district: string;
  address: string;
  locationLabel: string;
  statusBadge: string;
  beforeLabel: string;
  afterLabel: string;
  isVirtualBefore: boolean;
  summary: string;
  arCaveat: string;
}

export const AR_SIMULATION_SITES: readonly ArSimulationSite[] = [
  {
    id: 'gangdong-industrial',
    siteType: '공사 현장',
    name: '강동 일반산업단지 조성공사',
    district: '강동구',
    address: '서울 강동구 상일동',
    locationLabel: '토공·우회도로 구간 (공정률 14%)',
    statusBadge: '시공 중 · 2028.03 준공 예정',
    beforeLabel: '현재 공간 (시공 현장 예시)',
    afterLabel: '미래 활용 예시 (친환경 R&D 단지)',
    isVirtualBefore: true,
    summary:
      '토공 및 우회도로 공사가 진행 중인 현재 모습과 향후 완공될 친환경 산업단지 예시를 비교하고 AR 뷰로 미리 확인할 수 있습니다.',
    arCaveat:
      '화면에 표시되는 건물 형태와 규모는 시민 이해를 돕기 위한 가상 예시이며, 실제 설계·시공 결과와 다를 수 있습니다.',
  },
  {
    id: 'sangil-8-2-idle',
    siteType: '유휴부지',
    name: '상일동 8-2 유휴부지',
    district: '강동구',
    address: '서울특별시 강동구 상일동 8-2',
    locationLabel: '시연용 가상 분류 · 현황 확인 필요',
    statusBadge: '시민 의견 수렴 예시',
    beforeLabel: '현재 공간 (가상 배경 이미지)',
    afterLabel: '미래 활용 예시 (주민 쉼터·마을정원)',
    isVirtualBefore: true,
    summary:
      '소규모 녹지공간, 휴식 벤치, 산책로, 계절 꽃밭 등이 어우러진 개방형 주민 쉼터 컨셉을 미리 살펴볼 수 있습니다.',
    arCaveat:
      '실제 현장 사진 자료가 아닌 가상 배경 이미지와 AI 활용 조감도를 조합한 컨셉 예시이며, 실제 부지 현황 및 개발계획과 다를 수 있습니다.',
  },
] as const;

export interface SiteImagePair {
  before: string;
  after: string;
  arCameraExample: string;
}

export const DUMMY_IMAGES: Record<string, SiteImagePair> = {
  'gangdong-industrial': {
    before: '/src/assets/images/gangdong_industrial_before_1795065939609.jpg',
    after: '/src/assets/images/gangdong_industrial_after_1795065923945.jpg',
    arCameraExample: '/src/assets/images/ar_construction_overlay_1795065921446.jpg',
  },
  'sangil-8-2-idle': {
    before: '/src/assets/images/sangil_idle_before_1795065922940.jpg',
    after: '/src/assets/images/sangil_idle_after_1795065923711.jpg',
    arCameraExample: '/src/assets/images/sangil_idle_after_1795065923711.jpg',
  },
};
