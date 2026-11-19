export type SiteType = '공사 현장' | '유휴부지';

export type ProjectStage = '계획' | '착공' | '시공' | '준공';

export type SiteFilterType = '전체' | SiteType;

export interface UtilizationIdea {
  id: string;
  numberLabel: string;
  title: string;
  points: readonly string[];
}

export interface SiteInfo {
  id: string;
  district: string;
  type: SiteType;
  name: string;
  address: string;
  projectPeriod: string | null;
  stage: ProjectStage | null;
  progress: number | null;
  currentWork?: string | null;
  currentStatus?: string | null;
  utilizationPlan?: string | null;
  isVirtualClassification?: boolean;
  virtualClassificationNotice?: string | null;
  utilizationIdeas?: readonly UtilizationIdea[];
  utilizationCaveat?: string | null;
  notice: string | null;
  lastUpdated: string | null;
  mapImage: string;
  isIdeaEnabled: boolean;
}

export const PROJECT_STAGES: readonly ProjectStage[] = ['계획', '착공', '시공', '준공'];

export const SEOUL_DISTRICTS: readonly string[] = [
  '강남구',
  '강동구',
  '강북구',
  '강서구',
  '관악구',
  '광진구',
  '구로구',
  '금천구',
  '노원구',
  '도봉구',
  '동대문구',
  '동작구',
  '마포구',
  '서대문구',
  '서초구',
  '성동구',
  '성북구',
  '송파구',
  '양천구',
  '영등포구',
  '용산구',
  '은평구',
  '종로구',
  '중구',
  '중랑구',
];

export const DEFAULT_DISTRICT = '강동구';

/**
 * 단일 사업 현장 데이터 배열 (SITE_DATA)
 * 관리자 또는 개발자가 이 배열만 수정하면 전체 화면에 즉시 반영됩니다.
 */
export const SITE_DATA: SiteInfo[] = [
  {
    id: 'gangdong-industrial-complex',
    district: '강동구',
    type: '공사 현장',
    name: '강동 일반산업단지 조성공사',
    address: '서울 강동구 상일동',
    projectPeriod: '2025. 10. ~ 2028. 03.',
    stage: '시공',
    progress: 14,
    currentWork: '토공 및 우회도로 공사 진행 중',
    notice:
      '현재 토공 및 우회도로 공사가 진행 중이며, 2027년 1월부터 기존에 사용 중이던 상일3교를 철거하고 통행 제한을 시행할 예정입니다.',
    lastUpdated: null,
    mapImage: '/assets/aistudio/_______91854d4c.png',
    isIdeaEnabled: false,
  },
  {
    id: 'sangil-8-2-idle-land',
    district: '강동구',
    type: '유휴부지',
    name: '상일동 8-2 유휴부지',
    address: '서울특별시 강동구 상일동 8-2',
    projectPeriod: null,
    stage: null,
    progress: null,
    currentWork: null,
    currentStatus: '현황 확인 필요',
    utilizationPlan: '시민 의견 수렴을 위한 예시 제안',
    isVirtualClassification: true,
    virtualClassificationNotice:
      '이 부지가 실제 SH공사 소유이거나 공식 유휴부지로 지정되었다는 사실은 확인되지 않았으며, 본 정보는 시연용 가상 분류입니다.',
    utilizationIdeas: [
      {
        id: 'idea-shelter-green',
        numberLabel: '①',
        title: '주민 쉼터 및 소규모 녹지공간 조성',
        points: [
          '주민이 자유롭게 이용할 수 있는 휴식 공간 조성',
          '벤치, 그늘막, 소규모 정원 설치',
          '계절별 꽃과 나무를 활용한 친환경 공간 구성',
          '주변 보행환경과 연계한 개방형 휴게공간 제안',
        ],
      },
      {
        id: 'idea-village-garden',
        numberLabel: '②',
        title: '주민 참여형 마을정원 조성',
        points: [
          '주민이 직접 참여하는 꽃밭 및 녹지 관리',
          '작은 산책로와 휴식 공간 마련',
          '지역 공동체 활동과 환경교육 공간으로 활용',
        ],
      },
      {
        id: 'idea-temp-culture',
        numberLabel: '③',
        title: '임시 문화·커뮤니티 공간 조성',
        points: [
          '이동식 벤치 및 소규모 전시 시설 배치',
          '주민 참여 프로그램과 소규모 지역 행사 운영',
          '장기 개발계획 확정 전 한시적으로 활용하는 방안 검토',
        ],
      },
    ],
    utilizationCaveat:
      '위 3가지 방안은 실제 확정된 개발계획이 아닌 시민 의견 수렴을 위한 아이디어 예시입니다. 토지 이용 가능 여부, 용도지역, 안전성, 소유·관리 주체 등에 따라 실제 실현 가능성이 달라질 수 있습니다.',
    notice: null,
    lastUpdated: null,
    mapImage: '',
    isIdeaEnabled: true,
  },
];
