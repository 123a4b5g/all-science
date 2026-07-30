/**
 * H-R도표 및 별의 진화 시뮬레이터 - 데이터 모듈
 */

const HR_DATA = {
    // 분광형 (Spectral Types) 정보 및 물리 상수
    spectralTypes: [
        { type: 'O', minTemp: 30000, maxTemp: 50000, color: '#9bb0ff', name: '청색', desc: '가장 뜨겁고 질량이 큰 항성 (스피카, O형 주계열)' },
        { type: 'B', minTemp: 10000, maxTemp: 30000, color: '#aabfff', name: '청백색', desc: '표면온도가 매우 높은 별 (리겔)' },
        { type: 'A', minTemp: 7500,  maxTemp: 10000, color: '#cad7ff', name: '백색', desc: '강한 수소 흡수선을 가지는 백색 항성 (시리우스A, 베가)' },
        { type: 'F', minTemp: 6000,  maxTemp: 7500,  color: '#f8f7ff', name: '황백색', desc: '밝은 황백색 항성 (북극성, 프로키온A)' },
        { type: 'G', minTemp: 5200,  maxTemp: 6000,  color: '#fff4ea', name: '황색', desc: '우리 태양과 같은 중간 질량 주계열성 (태양)' },
        { type: 'K', minTemp: 3700,  maxTemp: 5200,  color: '#ffd2a1', name: '주황색', desc: '주황색 거성 및 왜성 (알데바란, 아크투루스)' },
        { type: 'M', minTemp: 2400,  maxTemp: 3700,  color: '#ffcc6f', name: '적색', desc: '가장 낮은 표면 온도를 지닌 적색 왜성 및 초거성 (베텔게우스, 프록시마)' }
    ],

    // 실제 관측된 유명 별 데이터베이스 (확장 버전)
    famousStars: [
        {
            id: 'sun',
            name: '태양 (Sun)',
            temp: 5778,
            luminosity: 1.0,
            radius: 1.0,
            mass: 1.0,
            spectral: 'G2V',
            category: '주계열성',
            dist: '0 광년 (1 AU)',
            absMag: 4.83,
            desc: '우리 태양계의 중심별로, 중심부에서 수소 핵융합(p-p chain)을 진행하고 있는 안정적인 G형 주계열성입니다.',
            color: '#fff4ea'
        },
        {
            id: 'sirius_a',
            name: '시리우스 A (Sirius A)',
            temp: 9940,
            luminosity: 25.4,
            radius: 1.71,
            mass: 2.06,
            spectral: 'A1V',
            category: '주계열성',
            dist: '8.6 광년',
            absMag: 1.42,
            desc: '밤하늘에서 가장 밝게 관측되는 대표적인 백색 주계열성입니다.',
            color: '#cad7ff'
        },
        {
            id: 'sirius_b',
            name: '시리우스 B (Sirius B)',
            temp: 25200,
            luminosity: 0.056,
            radius: 0.0084,
            mass: 1.02,
            spectral: 'DA2',
            category: '백색왜성',
            dist: '8.6 광년',
            absMag: 11.18,
            desc: '지구 크기 정도로 붕괴한 초고밀도 사체별로, 시리우스 A 주위를 궤도 운행하는 백색왜성입니다.',
            color: '#aabfff'
        },
        {
            id: 'betelgeuse',
            name: '베텔게우스 (Betelgeuse)',
            temp: 3500,
            luminosity: 126000,
            radius: 764.0,
            mass: 16.5,
            spectral: 'M1-M2Ia-ab',
            category: '적색초거성',
            dist: '550 광년',
            absMag: -5.85,
            desc: '오리온자리의 어깨별로 궤도가 목성까지 미치는 거대한 적색초거성입니다. 머지않은 미래에 II형 초신성 폭발을 일으킵니다.',
            color: '#ff7755'
        },
        {
            id: 'rigel',
            name: '리겔 (Rigel)',
            temp: 12100,
            luminosity: 120000,
            radius: 78.9,
            mass: 21.0,
            spectral: 'B8Ia',
            category: '청색초거성',
            dist: '860 광년',
            absMag: -7.84,
            desc: '오리온자리의 다리에 해당하는 웅장한 청색초거성으로, 엄청난 복사에너지를 발산합니다.',
            color: '#9bb0ff'
        },
        {
            id: 'aldebaran',
            name: '알데바란 (Aldebaran)',
            temp: 3900,
            luminosity: 439,
            radius: 44.1,
            mass: 1.16,
            spectral: 'K5III',
            category: '적색거성',
            dist: '65.3 광년',
            absMag: -0.63,
            desc: '황소자리의 붉은 눈에 해당하는 거성으로, 주계열 수소를 모두 태우고 적색거성으로 팽창하였습니다.',
            color: '#ffaa66'
        },
        {
            id: 'arcturus',
            name: '아크투루스 (Arcturus)',
            temp: 4286,
            luminosity: 170,
            radius: 25.4,
            mass: 1.08,
            spectral: 'K1.5III',
            category: '적색거성',
            dist: '36.7 광년',
            absMag: -0.30,
            desc: '목동자리의 주황색 주별로 중심부에서 헬륨 융합 반응이 활발히 일어나고 있는 거성입니다.',
            color: '#ffd2a1'
        },
        {
            id: 'vega',
            name: '베가 (Vega)',
            temp: 9602,
            luminosity: 40.12,
            radius: 2.36,
            mass: 2.15,
            spectral: 'A0V',
            category: '주계열성',
            dist: '25.0 광년',
            absMag: 0.58,
            desc: '거문고자리의 알파별이자 여름철 대삼각형을 형성하는 청백색 영천문학의 등급 기준별입니다.',
            color: '#cad7ff'
        },
        {
            id: 'polaris',
            name: '북극성 (Polaris)',
            temp: 6015,
            luminosity: 1260,
            radius: 37.5,
            mass: 5.4,
            spectral: 'F7Ib',
            category: '적색초거성',
            dist: '433 광년',
            absMag: -3.64,
            desc: '작은곰자리의 지축 방향 정렬별로, 주기적으로 반경이 맥동하는 세페이드 변광성 성격의 초거성입니다.',
            color: '#f8f7ff'
        },
        {
            id: 'proxima',
            name: '프록시마 센타우리 (Proxima Centauri)',
            temp: 3042,
            luminosity: 0.0017,
            radius: 0.15,
            mass: 0.12,
            spectral: 'M5.5V',
            category: '주계열성',
            dist: '4.24 광년',
            absMag: 15.60,
            desc: '태양계와 가장 가까운 이웃 항성으로 질량이 매우 작은 어두운 M형 적색왜성입니다.',
            color: '#ff9966'
        },
        {
            id: 'antares',
            name: '안타레스 (Antares)',
            temp: 3660,
            luminosity: 75000,
            radius: 680.0,
            mass: 12.0,
            spectral: 'M1.5Iab',
            category: '적색초거성',
            dist: '550 광년',
            absMag: -5.28,
            desc: '전갈자리의 심장에 위치한 진붉은색 초대형 초거성입니다.',
            color: '#ff6644'
        },
        {
            id: 'spica',
            name: '스피카 (Spica)',
            temp: 22400,
            luminosity: 12100,
            radius: 7.47,
            mass: 11.4,
            spectral: 'B1III-IV',
            category: '청색거성',
            dist: '250 광년',
            absMag: -3.55,
            desc: '처녀자리의 가장 밝은 푸른색 거성입니다.',
            color: '#9bb0ff'
        },
        {
            id: 'procyon_a',
            name: '프로키온 A (Procyon A)',
            temp: 6530,
            luminosity: 6.93,
            radius: 2.05,
            mass: 1.5,
            spectral: 'F5IV-V',
            category: '주계열성',
            dist: '11.46 광년',
            absMag: 2.66,
            desc: '작은개자리의 주별로 수소 소진 단계에 진입한 준거성 특성의 황백색 별입니다.',
            color: '#f8f7ff'
        },
        {
            id: 'deneb',
            name: '데네브 (Deneb)',
            temp: 8525,
            luminosity: 196000,
            radius: 203.0,
            mass: 19.0,
            spectral: 'A2Ia',
            category: '적색초거성',
            dist: '2600 광년',
            absMag: -8.38,
            desc: '백조자리의 주별로, 수천 광년 거리에서도 눈부시게 빛나는 백색 초거성입니다.',
            color: '#e0e7ff'
        }
    ],

    // 질량별 진화 트랙 정의
    getEvolutionTrack: function(mass) {
        if (mass < 0.5) {
            return {
                type: 'redDwarf',
                name: `저질량 적색왜성 (${mass.toFixed(2)} M☉)`,
                finalOutcome: '헬륨 백색왜성',
                lifetimeYrs: '수천억 ~ 수조 년',
                stages: [
                    { timeRatio: 0.00, temp: 3000, lum: 0.05, name: '원시성 (Protostar)', core: '중력 수축', rRatio: 2.5, desc: '거대한 가스 구름이 중력 수축하며 원시 항성으로 형성됩니다.' },
                    { timeRatio: 0.05, temp: 3100, lum: 0.002, name: '주계열성 (ZAMS)', core: '수소 핵융합', rRatio: 0.2, desc: '중심 온도가 약 1,000만 K에 달하여 안정적 수소 핵융합이 진행됩니다.' },
                    { timeRatio: 0.85, temp: 3300, lum: 0.005, name: '주계열 연속', core: '전체 대류 수소 융합', rRatio: 0.25, desc: '별 전체 대류로 내부 수소를 남김없이 소비하므로 우주 나이보다 더 오래 생존합니다.' },
                    { timeRatio: 0.98, temp: 4500, lum: 0.01,  name: '수소 소진', core: '헬륨 코어 축적', rRatio: 0.3, desc: '수소가 모두 헬륨으로 변환되며 표면온도가 상승합니다.' },
                    { timeRatio: 1.00, temp: 15000, lum: 0.0005, name: '헬륨 백색왜성', core: '전자 퇴적압 서서히 식음', rRatio: 0.02, desc: '거성 팽창 단계를 거치지 않고 식어가는 헬륨 백색왜성이 됩니다.', finalState: 'whiteDwarf' }
                ]
            };
        } else if (mass <= 2.2) {
            return {
                type: 'sunLike',
                name: `태양형 별 (${mass.toFixed(1)} M☉)`,
                finalOutcome: '행성상 성운 + 탄소/산소 백색왜성',
                lifetimeYrs: `${(10 / Math.pow(mass, 2.5)).toFixed(1)}0억 년`,
                stages: [
                    { timeRatio: 0.00, temp: 3500, lum: 5.0,   name: '원시성 (Protostar)', core: '중력 수축', rRatio: 4.0, desc: '성간 물질 붕괴로 형성된 원시별 단계입니다.' },
                    { timeRatio: 0.05, temp: 5778 * Math.pow(mass, 0.5), lum: Math.pow(mass, 3.8), name: '주계열성 (Main Sequence)', core: '수소 핵융합 (p-p chain)', rRatio: Math.pow(mass, 0.8), desc: '수소를 헬륨으로 융합하며 정역학적 평형을 유지합니다.' },
                    { timeRatio: 0.75, temp: 4800, lum: Math.pow(mass, 3.8) * 2.5, name: '준거성 (Subgiant)', core: '수소 껍질 융합', rRatio: Math.pow(mass, 0.8) * 2.5, desc: '중심 수소가 소진되어 껍질 융합으로 외층이 팽창하기 시작합니다.' },
                    { timeRatio: 0.88, temp: 3800, lum: Math.pow(mass, 3.8) * 300, name: '적색거성 (Red Giant)', core: '헬륨 코어 중력 수축', rRatio: 80.0, desc: '외층이 거대하게 팽창하여 적색거성이 됩니다.' },
                    { timeRatio: 0.93, temp: 5000, lum: Math.pow(mass, 3.8) * 50,  name: '수평가지 (Helium Flash)', core: '헬륨 점화 (3-알파 반응)', rRatio: 12.0, desc: '중심부 헬륨이 폭발적으로 점화하여 탄소와 산소를 생성합니다.' },
                    { timeRatio: 0.97, temp: 3200, lum: Math.pow(mass, 3.8) * 2000, name: '점근거성가지 (AGB)', core: '이중 껍질 융합 (H & He)', rRatio: 250.0, desc: '중심 탄소 코어 주위에서 이중 껍질 융합 반응이 일어납니다.' },
                    { timeRatio: 0.99, temp: 80000, lum: 1000, name: '행성상 성운 분사', core: '외층 방출', rRatio: 500.0, desc: '불안정한 열 맥동으로 외층 가스를 우주 공간으로 방출합니다.', effect: 'planetaryNebula' },
                    { timeRatio: 1.00, temp: 25000, lum: 0.01,  name: '탄소-산소 백색왜성', core: '전자 퇴적압 식음', rRatio: 0.01, desc: '초고밀도 중심 코어가 남아 백색왜성으로 천천히 식어갑니다.', finalState: 'whiteDwarf' }
                ]
            };
        } else if (mass <= 8.0) {
            return {
                type: 'intermediate',
                name: `중질량 별 (${mass.toFixed(1)} M☉)`,
                finalOutcome: '행성상 성운 + O-Ne-Mg 백색왜성',
                lifetimeYrs: `${(1000 / Math.pow(mass, 2.5)).toFixed(0)}백만 년`,
                stages: [
                    { timeRatio: 0.00, temp: 4000, lum: 100,  name: '원시성', core: '중력 수축', rRatio: 10.0, desc: '빠른 중력 수축 단계입니다.' },
                    { timeRatio: 0.05, temp: 15000, lum: Math.pow(mass, 3.5), name: '주계열성 (B/A형)', core: 'CNO 수소 융합', rRatio: Math.pow(mass, 0.7), desc: 'CNO 순환 반응으로 수소를 빠르게 소비합니다.' },
                    { timeRatio: 0.85, temp: 4200, lum: Math.pow(mass, 3.5) * 5, name: '적색거성/준초거성', core: '헬륨 및 탄소 융합', rRatio: 150.0, desc: '광도가 매우 높아진 팽창 단계입니다.' },
                    { timeRatio: 0.95, temp: 9000, lum: Math.pow(mass, 3.5) * 3, name: '청색 고리 (Blue Loop)', core: '중심부 헬륨 융합', rRatio: 40.0, desc: 'H-R도 상에서 고온 청색 구역으로 이동하는 주기입니다.' },
                    { timeRatio: 0.99, temp: 110000, lum: 3000, name: '행성상 성운 방출', core: '외층 가스 방출', rRatio: 600.0, desc: '강력한 성운 방출을 일으킵니다.', effect: 'planetaryNebula' },
                    { timeRatio: 1.00, temp: 40000, lum: 0.05,  name: 'O-Ne-Mg 백색왜성', core: '전자 퇴적압', rRatio: 0.008, desc: '대질량 백색왜성이 됩니다.', finalState: 'whiteDwarf' }
                ]
            };
        } else if (mass <= 20.0) {
            return {
                type: 'massive',
                name: `고질량 초거성 (${mass.toFixed(1)} M☉)`,
                finalOutcome: 'II형 초신성 폭발 → 중성자별 (펄서)',
                lifetimeYrs: `${(100 / Math.pow(mass, 1.5)).toFixed(0)}백만 년`,
                stages: [
                    { timeRatio: 0.00, temp: 6000, lum: 2000, name: '원시성', core: '중력 수축', rRatio: 25.0, desc: '격렬한 아웃보스트와 함께 탄생합니다.' },
                    { timeRatio: 0.05, temp: 28000, lum: Math.pow(mass, 3.3), name: '청색 주계열성', core: 'CNO 고속 융합', rRatio: 7.0, desc: '강력한 자외선을 뿜어내는 청색 거대 주계열성입니다.' },
                    { timeRatio: 0.85, temp: 18000, lum: Math.pow(mass, 3.3) * 1.5, name: '청색 초거성', core: '헬륨 및 탄소 융합', rRatio: 50.0, desc: '높은 광도를 자랑합니다.' },
                    { timeRatio: 0.96, temp: 3500, lum: Math.pow(mass, 3.3) * 3.0, name: '적색초거성 (양파 껍질 구조)', core: '철(Fe) 코어 반응까지 연속 융합', rRatio: 800.0, desc: 'H->He->C->O->Ne->Si->Fe 양파 껍질 핵융합 구조가 완성됩니다.' },
                    { timeRatio: 0.999, temp: 100000, lum: 1e9, name: 'II형 초신성 폭발 (Supernova)', core: '철 코어 중력 붕괴', rRatio: 1200.0, desc: '철 코어 중력 붕괴로 은하 전체보다 밝은 무서운 폭발이 일어납니다!', effect: 'supernova' },
                    { timeRatio: 1.00, temp: 500000, lum: 0.01, name: '중성자별 / 펄서 (Pulsar)', core: '중성자 퇴적압', rRatio: 0.0001, desc: '반경 10km의 초고밀도 중성자별이 탄생하여 고속 자전 자기장 빔을 사출합니다.', finalState: 'neutronStar' }
                ]
            };
        } else {
            return {
                type: 'hypergiant',
                name: `극대질량 하이퍼거성 (${mass.toFixed(1)} M☉)`,
                finalOutcome: '극초신성 폭발 (Hypernova) → 블랙홀',
                lifetimeYrs: '수백만 년 이하',
                stages: [
                    { timeRatio: 0.00, temp: 10000, lum: 50000, name: '원시성', core: '초고속 중력 붕괴', rRatio: 50.0, desc: '엄청난 가스 물질 붕괴로 형성됩니다.' },
                    { timeRatio: 0.05, temp: 42000, lum: 300000 * (mass / 30), name: 'O형 최상위 주계열성', core: '극초고속 CNO 융합', rRatio: 15.0, desc: '복사압이 항성을 찢을 만큼 강력한 최상위 주계열성입니다.' },
                    { timeRatio: 0.70, temp: 35000, lum: 500000 * (mass / 30), name: '볼프-레이에 성 (Wolf-Rayet)', core: '강력 항성풍 물질 방출', rRatio: 30.0, desc: '자신의 외각층을 폭풍처럼 분사합니다.' },
                    { timeRatio: 0.95, temp: 4000, lum: 800000 * (mass / 30), name: '적색 하이퍼거성', core: '철 코어 형성', rRatio: 1400.0, desc: '우주에서 가장 거대한 반경의 항성이 됩니다.' },
                    { timeRatio: 0.999, temp: 200000, lum: 1e10, name: '극초신성 폭발 & 감마선 폭발', core: '직접 블랙홀 중력 붕괴', rRatio: 2000.0, desc: '강력한 감마선 버스트와 함께 폭발합니다!', effect: 'hypernova' },
                    { timeRatio: 1.00, temp: 0, lum: 0.00001, name: '항성 질량 블랙홀 (Black Hole)', core: '특이점 붕괴', rRatio: 0.00001, desc: '빛조차 탈출할 수 없는 시공간 굴절 블랙홀이 탄생합니다.', finalState: 'blackHole' }
                ]
            };
        }
    }
};

if (typeof window !== 'undefined') {
    window.HR_DATA = HR_DATA;
}
