(function() {
  const lang = localStorage.getItem('sci-lab-lang') || 'ko';
  if (lang !== 'en') return;

  const dictionary = {
    // Common terms
    "뒤로": "Back",
    "제어 패널": "Control Panel",
    "원리 설명": "Theory Guide",
    "접기 ✕": "Fold ✕",
    "열기 ☰": "Open ☰",
    "▶ 재생": "▶ Play",
    "⏸ 일시정지": "⏸ Pause",
    "초기화": "Reset",
    "물체 1": "Object 1",
    "물체 2": "Object 2",
    "총합": "Total",

    // Physics
    "역학 및 운동 법칙 시뮬레이션": "Mechanics & Laws of Motion Simulation",
    "역학 및 운동 법칙": "Mechanics & Laws of Motion",
    "힘과 가속도 (F=ma)": "Force & Acceleration (F=ma)",
    "운동량 보존과 충돌": "Momentum & Collision",
    "물리 시뮬레이션 학습 가이드": "Physics Simulation Guide",
    "질량 (m):": "Mass (m):",
    "가하는 힘 (F):": "Applied Force (F):",
    "마찰 계수 (μ):": "Friction Coeff (μ):",
    "실시간 물리 데이터": "Real-time Physics Data",
    "가속도 (A)": "Acceleration (a)",
    "속도 (V)": "Velocity (v)",
    "마찰력 (F)": "Frictional Force (f)",
    "🔴 물체 1 (빨강)": "🔴 Object 1 (Red)",
    "🔵 물체 2 (파랑)": "🔵 Object 2 (Blue)",
    "질량 (m₁):": "Mass (m₁):",
    "초기 속도 (v₁):": "Initial Vel (v₁):",
    "질량 (m₂):": "Mass (m₂):",
    "초기 속도 (v₂):": "Initial Vel (v₂):",
    "운동량 (p = mv) [kg·m/s]": "Momentum (p = mv) [kg·m/s]",
    "운동에너지 (K = ½mv²) [J]": "Kinetic Energy (K = ½mv²) [J]",
    "가속도 (a):": "Acceleration (a):",
    "속도 (v):": "Velocity (v):",
    "마찰력 (f):": "Frictional Force (f):",
    "물체 1 질량 (m1):": "Mass 1 (m1):",
    "물체 1 초기 속도 (v1):": "Initial Vel 1 (v1):",
    "물체 2 질량 (m2):": "Mass 2 (m2):",
    "물체 2 초기 속도 (v2):": "Initial Vel 2 (v2):",
    "물체 1 속도 (v1):": "Velocity 1 (v1):",
    "물체 2 속도 (v2):": "Velocity 2 (v2):",
    "충돌 후 예상 속도 (v1', v2'):": "Expected Vel (v1', v2'):",
    "실시간 운동량 분석 (Momentum, p = mv)": "Real-time Momentum (p = mv)",
    "실시간 운동에너지 분석 (Kinetic Energy, K = 0.5mv²)": "Real-time Kinetic Energy (K = 0.5mv²)",
    "시뮬레이션을 재생하여 측정을 시작하세요": "Start simulation to measure data",
    "속도 및 가속도 실시간 추이 그래프 (F=ma)": "Real-time Velocity & Acceleration (F=ma)",
    "속도 (v)": "Velocity (v)",
    "가속도 (a)": "Acceleration (a)",
    "외력 F": "External Force F",
    "마찰력 f": "Frictional Force f",

    // Wave
    "파동의 간섭 시뮬레이션 (1D)": "Wave Interference Simulation (1D)",
    "파동의 간섭 시뮬레이션": "Wave Interference Simulation",
    "파동 중첩 원리 가이드": "Wave Superposition Guide",
    "1D 펄스 중첩 시뮬레이션 (A: 빨강, B: 파랑, 합성: 보라)": "1D Pulse Superposition (A: Red, B: Blue, Combined: Purple)",
    "🔴 펄스 A (우방향)": "🔴 Pulse A (Rightward)",
    "🔵 펄스 B (좌방향)": "🔵 Pulse B (Leftward)",
    "형태:": "Shape:",
    "가우스": "Gaussian",
    "삼각": "Triangle",
    "사각": "Square",
    "사인": "Sine",
    "진폭 (y_A)": "Amplitude (y_A)",
    "너비": "Width",
    "진폭 (y_B)": "Amplitude (y_B)",
    "시뮬레이션 조작": "Simulation Controls",
    "재생 속도:": "Simulation Speed:",
    "이동 속도": "Playback Speed",
    "◀ 이전": "◀ Prev",
    "다음 ▶": "Next ▶",
    "실시간 펄스 중첩 분석": "Real-time Pulse Superposition Analysis",
    "🔴 펄스 A 변위 (y_A)": "🔴 Pulse A Disp (y_A)",
    "🔵 펄스 B 변위 (y_B)": "🔵 Pulse B Disp (y_B)",
    "🟣 합성 변위 (y)": "🟣 Combined Disp (y)",
    "중첩 상태": "Superposition State",
    "보강 중첩 🟢": "Constructive 🟢",
    "상쇄 중첩 🔴": "Destructive 🔴",
    "교차 진행 중 ⚪": "Crossing ⚪",
    "분리되어 이동 중 ⚪": "Separating ⚪",
    "분리됨": "Separated",

    // Eclipse
    "태양계 식 현상 시뮬레이션": "Solar System Eclipse Simulation",
    "식 현상 시뮬레이션": "Eclipse Simulation",
    "일식 시뮬레이션": "Solar Eclipse Sim",
    "월식 시뮬레이션": "Lunar Eclipse Sim",
    "달 궤도 위치 (황경):": "Moon Orbit Pos:",
    "지구 공전 위치 (황경):": "Earth Orbit Pos:",
    "지구-달 거리 조절:": "Earth-Moon Distance:",
    "현상 종류": "Eclipse Type",
    "없음": "None",
    "일식 관측: 마우스 드래그로 우주를 회전해보세요. 달이 태양 앞에 정렬될 때 일식이 일어납니다.": "Solar Eclipse View: Drag to rotate the space. Solar eclipse occurs when Moon aligns with Sun.",
    "월식 관측: 마우스 드래그로 우주를 회전해보세요. 달이 지구의 본그림자/반그림자 영역에 들어갈 때 월식이 일어납니다.": "Lunar Eclipse View: Drag to rotate the space. Lunar eclipse occurs when Moon enters Earth's shadow.",
    "일식과 월식 시뮬레이션": "Solar & Lunar Eclipse Simulation",
    "일식/월식 기하학 가이드": "Eclipse Geometry Guide",
    "궤도 평면 설정": "Orbital Plane Settings",
    "달의 공전 궤도 경사각 (5.14°) 적용": "Apply Lunar Orbit Inclination (5.14°)",
    "황도면과 백도면 교차 (노드 형성)": "Ecliptic & Lunar Orbit Intersect (Nodes)",
    "천체 거리 배율 설정": "Celestial Distance Scaling",
    "실제 비례 (태양/지구/달 크기 및 궤도 거리)": "Real Scale (Sun/Earth/Moon Sizes & Orbits)",
    "학습용 축소 (천체 크기 강조 확대)": "Educational Scale (Exaggerated Sizes for Study)",
    "달의 위치 미세조정": "Fine-tune Moon Position",
    "일식 위치": "Solar Eclipse Pos",
    "월식 위치": "Lunar Eclipse Pos",
    "우주선 카메라 시점 설정": "Spaceship Camera View",
    "태양계 평면 시점 (Top-down)": "System Plain View (Top-down)",
    "지구 중심 시점 (Earth-centered)": "Earth-centered View",
    "월식/일식 관측 카메라": "Eclipse Observation Camera",
    "지구에서 본 낮/밤 지역 (태양광 조사)": "Day/Night Regions from Earth (Solar Illumination)",
    "달의 위상: 황도면 위치 기준": "Moon Phase: Based on Ecliptic Position",
    "천체 크기 배율:": "Celestial Size Scale:",
    "궤도 거리 배율:": "Orbital Distance Scale:",
    "지구 1년 주기:": "Earth 1-Year Cycle:",
    "달 1달 주기:": "Moon 1-Month Cycle:",
    "일식 관측 상태": "Solar Eclipse View",
    "월식 관측 상태": "Lunar Eclipse View",
    "우주 전체 투영 맵": "Universe Projection Map",
    "지구에서 본 낮/밤 및 태양 고도": "Day/Night & Sun Altitude from Earth",
    "개기 일식": "Total Solar Eclipse",
    "금환 일식": "Annular Solar Eclipse",
    "부분 일식": "Partial Solar Eclipse",
    "개기 월식": "Total Lunar Eclipse",
    "부분 월식": "Partial Lunar Eclipse",
    "반영 월식": "Penumbral Lunar Eclipse",
    "일반 진행": "Normal State",

    // Electrolysis
    "물의 전기분해 실험 시뮬레이션": "Water Electrolysis Simulation",
    "물의 전기분해 실험": "Water Electrolysis Experiment",
    "물의 전기분해 원리 가이드": "Water Electrolysis Guide",
    "물의 전기분해 (수소: (-)극 파랑도선, 산소/염소/요오드: (+)극 빨강도선)": "Water Electrolysis (Hydrogen: (-) Blue wire, Oxygen/Chlorine: (+) Red wire)",
    "실험 원리": "Theory Guide",
    "전원 장치 전압": "Power Supply Voltage",
    "전해질 농도 (": "Electrolyte Concentration (",
    "전해질 농도": "Electrolyte Concentration",
    "전해질 종류": "Electrolyte Type",
    "이온(Na+, OH-) 표시": "Show Ions (Na+, OH-)",
    "이온(Na+, Cl-) 표시": "Show Ions (Na+, Cl-)",
    "이온(H+, OH-) 표시": "Show Ions (H+, OH-)",
    "이온(Na+, OH-) 숨김": "Hide Ions (Na+, OH-)",
    "이온(Na+, Cl-) 숨김": "Hide Ions (Na+, Cl-)",
    "이온(H+, OH-) 숨김": "Hide Ions (H+, OH-)",
    "기체 확인 가상 실험 (기체 수집 완료 후 가능)": "Virtual Gas Test (Available after gas collection)",
    "🔥 (-)극 기체 확인 (성냥불)": "🔥 (-) Pole Gas Test (Match)",
    "🕯️ (+)극 기체 확인 (": "🕯️ (+) Pole Gas Test (",
    "실시간 전류 및 기체 포집량 분석": "Real-time Current & Gas Volume Analysis",
    "회로 총 저항": "Total Circuit Resistance",
    "회로 총저항": "Total Circuit Resistance",
    "흐르는 전류": "Current Flow",
    "기체 부피 비 (H₂ : O₂)": "Gas Volume Ratio (H₂ : O₂)",
    "분해 상태": "Decomposition Status",
    "반응 전": "Before Reaction",
    "화학 반응 가이드": "Chemical Reaction Guide",
    "전해질 용액 설정": "Electrolyte Solution Settings",
    "수산화나트륨": "Sodium Hydroxide (NaOH)",
    "염화나트륨": "Sodium Chloride (NaCl)",
    "순수한 물": "Pure Water (H₂O)",
    "전압 크기 (Power):": "Voltage (Power):",
    "이온 표시": "Display Ions",
    "미시적(분자) 관찰": "Microscopic View",
    "이온": "Ions",
    "표시": "Show",
    "숨김": "Hide",
    "가스 성분 검정 테스트": "Gas Test Tube Analysis",
    "(-)극 수소 가스": "(-) Pole Hydrogen Gas",
    "성냥 테스트": "Match Test",
    "(+)극 산소/염소 가스": "(+) Pole Oxygen/Chlorine Gas",
    "향불 테스트": "Splint Test",
    "리트머스 종이": "Litmus Paper",
    "실시간 전기화학 데이터": "Real-time Electrochemical Data",
    "기체 부피 비": "Gas Volume Ratio",
    "(-)극 수소 기체 (H₂)": "(-) Pole Hydrogen Gas (H₂)",
    "(+)극 산소 기체 (O₂)": "(+) Pole Oxygen Gas (O₂)",
    "(+)극 염소 기체 (Cl₂)": "(+) Pole Chlorine Gas (Cl₂)",
    "향불": "Wooden Splint",
    "전기분해 반응 중...": "Electrolysis in progress...",
    "(-)극 수소 확인 성냥 테스트 진행 중...": "(-) Pole Match Test in progress...",
    "(+)극 염소 기체 확인 리트머스 테스트 진행 중...": "(+) Pole Litmus Test in progress...",
    "(+)극 산소 기체 확인 향불 테스트 진행 중...": "(+) Pole Splint Test in progress...",
    "수소 기체 확인 완료 (폭발성 확인)": "Hydrogen gas verified (Explosive)",
    "염소 기체 확인 완료 (리트머스 종이 탈색)": "Chlorine gas verified (Litmus Bleached)",
    "산소 기체 확인 완료 (조연성 확인)": "Oxygen gas verified (Combustibility)",
    "전류 차단됨 (순수한 물)": "Current blocked (Pure Water)",
    "초기화됨 (반응 전)": "Reset (Before reaction)",
    "미시적 분자 반응": "Microscopic Molecular Reaction",
    "눈금": "Graduation",
    "수소": "Hydrogen",
    "산소": "Oxygen",
    "염소": "Chlorine",
    "H₂ (수소)": "H₂ (Hydrogen)",
    "O₂ (산소)": "O₂ (Oxygen)",
    "Cl₂ (염소)": "Cl₂ (Chlorine)",
    "POP! 퍽!": "POP!",
    "탈색! Bleached": "Bleached!",
    "활활! Rekindle": "Rekindle!",
    "이온(H⁺, OH⁻) 표시": "Show Ions (H⁺, OH⁻)",
    "이온(Na⁺, OH⁻) 표시": "Show Ions (Na⁺, OH⁻)",
    "이온(Na⁺, Cl⁻) 표시": "Show Ions (Na⁺, Cl⁻)",
    "이온(H⁺, OH⁻) 숨김": "Hide Ions (H⁺, OH⁻)",
    "이온(Na⁺, OH⁻) 숨김": "Hide Ions (Na⁺, OH⁻)",
    "이온(Na⁺, Cl⁻) 숨김": "Hide Ions (Na⁺, Cl⁻)",

    // Theory Guides - Physics
    "1. 힘과 가속도 (F = ma)": "1. Force and Acceleration (F = ma)",
    "뉴턴의 운동 제2법칙을 시각적으로 관측합니다. 질량(m), 가해지는 힘(F), 마찰계수(μ)를 직접 제어하며 물체의 실시간 가속도(a)와 속도(v) 변화 그래프를 비교해 보세요. 외력이 최대 정지 마찰력보다 작으면 물체가 움직이지 않는 물리 법칙이 적용되어 있습니다.": "Visually observe Newton's Second Law of Motion. Control mass (m), applied force (F), and friction coefficient (μ) directly, and compare the real-time acceleration (a) and velocity (v) graphs. If the external force is less than the maximum static friction, the object will not move.",
    "마찰 계수 (μ)와 마찰력:": "Friction Coefficient (μ) and Frictional Force:",
    "접촉 면의 거친 정도를 나타내는 수치로, 마찰 계수(μ)와 질량(m)이 클수록 운동을 방해하는 마찰력이 강해집니다. 시뮬레이션에서 마찰 계수를 계속 늘려도 마찰력이 증가하지 않는 이유는 두 가지입니다. 첫째, 물체가 움직이기 전(정정 상태)에 작용하는 마찰력은 가한 외력과 항상 같기 때문입니다. 둘째, 물체가 움직일 때의 최대 마찰력은 시뮬레이션의 물리적 한계를 고려하여 최대 50 N으로 제한되어 있기 때문입니다.": "A value indicating the roughness of the contact surface. The larger the friction coefficient (μ) and mass (m), the stronger the frictional force resisting motion. There are two reasons why frictional force doesn't increase indefinitely when you increase the coefficient in the simulation. First, before the object moves (static state), the frictional force is always equal to the applied external force. Second, when moving, the maximum frictional force is limited to 50 N considering the simulation's physical limits.",
    "2. 운동량 보존과 충돌 (Momentum)": "2. Momentum Conservation and Collision",
    "마찰이 없는 평면에서 두 물체의 탄성 충돌(e = 1.0)을 재현합니다. 질량과 초기 속도에 따라 충돌 전후의 개별 운동량(p)과 운동에너지(K)는 변화하지만, 계 전체의 총합은 보존되는 역학적 보존 법칙을 직접 수치와 실시간 바 게이지로 확인할 수 있습니다.": "Simulates elastic collision (e = 1.0) of two objects on a frictionless plane. Depending on mass and initial velocity, individual momentum (p) and kinetic energy (K) change before and after collision, but the total sum of the system is conserved. You can directly verify this conservation law with numbers and real-time bar gauges.",

    // Theory Guides - Wave
    "1. 중첩의 원리 (Superposition Principle)": "1. Superposition Principle",
    "서로 반대 방향으로 진행하는 두 파동 펄스가 어느 지점에서 겹칠 때, 합성파의 변위(y)는 각 파동이 단독으로 도달했을 때의 변위의 대수적 합인": "When two wave pulses traveling in opposite directions overlap, the combined wave's displacement (y) is the algebraic sum of the individual displacements, given by",
    "가 됩니다.": ".",
    "2. 보강 간섭 (Constructive Interference)": "2. Constructive Interference",
    "두 파동의 위상(방향)이 같아 마루와 마루가 만나거나 골과 골이 만나는 경우입니다. 두 변위의 방향이 같으므로 합성파의 진폭은 각각의 진폭의 합보다 커지게 됩니다.": "Occurs when waves are in phase, where crest meets crest or trough meets trough. Since the displacement directions are the same, the combined amplitude becomes greater than the sum of the individual amplitudes.",
    "3. 상쇄 간섭 (Destructive Interference)": "3. Destructive Interference",
    "두 파동의 위상이 서로 반대(마루와 골)로 만나는 경우입니다. 두 변위의 방향이 반대이므로 합성파의 진폭은 각각의 차이만큼 감소하고, 크기가 같으면 완전히 지워져 0이 됩니다.": "Occurs when waves are out of phase (crest meets trough). Since the displacements are opposite, the combined amplitude is reduced by their difference. If equal in size, they cancel each other completely to 0.",
    "4. 파동의 독립성": "4. Independence of Waves",
    "중첩을 마치고 서로 스쳐 지나간 파동은 다른 파동을 만나기 전과 마찬가지로 파형, 진폭, 속도, 진행 방향 등 본래의 고유한 특성을 아무런 변형 없이 그대로 유지하며 진행합니다.": "After overlapping and passing through each other, the waves continue with their original characteristics—shape, amplitude, speed, and direction—unaltered, just as before they met.",

    // Theory Guides - Electrolysis
    "1. 물의 전기분해란?": "1. What is Water Electrolysis?",
    "순수한 물은 전류가 잘 흐르지 않기 때문에, 전해질인 수산화나트륨($NaOH$)을 녹여 전류가 흐를 수 있도록 한 뒤 전기에너지를 가해 물을 수소 기체와 산소 기체로 분해하는 반응입니다.": "Since pure water does not conduct electricity well, an electrolyte like sodium hydroxide ($NaOH$) is dissolved to allow current flow, and electrical energy is applied to decompose water into hydrogen and oxygen gas.",
    "2. 각 전극에서의 화학 반응": "2. Chemical Reactions at Electrodes",
    "(-)극 (음극, Cathode): 환원 반응": "(-) Pole (Cathode): Reduction Reaction",
    "물 분자가 전자를 얻어 수소 기체($H_2$)와 수산화 이온($OH^-$)을 생성합니다.": "Water molecules gain electrons to produce hydrogen gas ($H_2$) and hydroxide ions ($OH^-$).",
    "(+)극 (양극, Anode): 산화 반응": "(+) Pole (Anode): Oxidation Reaction",
    "물 분자가 전자를 잃어 산소 기체($O_2$)와 수소 이온($H^+$)을 생성합니다.": "Water molecules lose electrons to produce oxygen gas ($O_2$) and hydrogen ions ($H^+$).",
    "3. 발생 물질의 부피 및 질량비": "3. Volume and Mass Ratio of Products",
    "전체 전하량 보존 법칙에 의해 이동하는 전자의 몰수가 동일하므로:": "Since the moles of transferred electrons are equal by the law of conservation of charge:",
    "-": "-",
    "물의 전기분해 (NaOH)": "Water Electrolysis (NaOH)",
    ": 수소와 산소가": ": Hydrogen and oxygen are produced in a",
    "부피비로 생성됩니다.": "volume ratio.",
    "염화나트륨(NaCl) 분해": "Sodium Chloride (NaCl) Electrolysis",
    ": 수소와 염소가": ": Hydrogen and chlorine are produced in an",
    "당량비로 생성됩니다.": "equivalent ratio.",
    "4. 전해질 종류별 양극(+) 생성물 및 검출법": "4. Anode (+) Products and Tests by Electrolyte",
    "수산화나트륨 ($NaOH$)": "Sodium Hydroxide ($NaOH$)",
    ": (+)극에서 산소 기체($O_2$)가 발생하며 향불을 대면 다시 활활 탑니다.": ": Oxygen gas ($O_2$) is produced at the (+) pole, which rekindles a glowing splint.",
    "염화나트륨 ($NaCl$)": "Sodium Chloride ($NaCl$)",
    ": (+)극에서 황록색 염소 기체($Cl_2$)가 발생하며 푸른 리트머스 종이를 빨갛게 물들였다가 탈색시킵니다.": ": Yellow-green chlorine gas ($Cl_2$) is produced at the (+) pole, turning blue litmus paper red and then bleaching it.",

    // Theory Guides - Eclipse
    "일식과 월식의 원리": "Principles of Eclipses",
    "1. 일식": "1. Solar Eclipse",
    "일식은 달이 태양과 지구 사이에 정확히 위치하여 태양 빛을 가리는 현상입니다. 달의 궤도는 타원형이기 때문에 지구와의 거리가 변하며, 이에 따라 일식의 종류가 달라집니다.": "A solar eclipse occurs when the Moon is positioned exactly between the Sun and Earth, blocking sunlight. Because the Moon's orbit is elliptical, its distance from Earth varies, changing the type of solar eclipse.",
    "개기 일식:": "Total Solar Eclipse:",
    "달이 지구에 가까울 때(근지점) 발생하며, 달의 겉보기 크기가 태양보다 커서 태양을 완전히 가립니다. 이때 태양의 코로나(대기)가 관측됩니다.": "Occurs when the Moon is closest to Earth (perigee). The Moon's apparent size is larger than the Sun, completely blocking it. The solar corona (atmosphere) can be observed.",
    "금환 일식:": "Annular Solar Eclipse:",
    "달이 지구에서 멀 때(원지점) 발생하며, 달의 겉보기 크기가 태양보다 작아 태양의 가장자리가 고리 모양으로 보입니다.": "Occurs when the Moon is farthest from Earth (apogee). The Moon's apparent size is smaller than the Sun, leaving a ring-like edge of the Sun visible.",
    "부분 일식:": "Partial Solar Eclipse:",
    "달이 태양의 일부만 가리는 현상으로, 관측자가 본그림자 밖 반그림자 영역에 있을 때 관측됩니다.": "Occurs when the Moon blocks only part of the Sun, visible when the observer is in the penumbra.",
    "2. 월식": "2. Lunar Eclipse",
    "월식은 지구가 태양과 달 사이에 위치하여 지구의 그림자가 달 표면에 드리워지는 현상입니다. 월식은 항상 보름달일 때 발생합니다.": "A lunar eclipse occurs when Earth is positioned between the Sun and Moon, casting Earth's shadow on the lunar surface. It always occurs during a full moon.",
    "개기 월식:": "Total Lunar Eclipse:",
    "달이 지구의 본그림자 안에 완전히 들어가는 현상입니다. 지구 대기가 붉은빛을 굴절시켜 달이 붉은색으로 보이며, 이를 '블러드 문'이라 부릅니다.": "Occurs when the Moon completely enters Earth's umbra. Earth's atmosphere refracts red light, making the Moon appear red, known as a 'Blood Moon'.",
    "부분 월식:": "Partial Lunar Eclipse:",
    "달의 일부만 본그림자에 걸치는 현상입니다.": "Occurs when only a part of the Moon enters the umbra.",
    "반영 월식:": "Penumbral Lunar Eclipse:",
    "달이 지구의 반그림자 영역만 통과하는 현상으로, 달의 밝기가 미세하게 어두워지며 육안으로 구분하기 어렵습니다.": "Occurs when the Moon passes only through Earth's penumbra. The Moon dims slightly, making it difficult to distinguish with the naked eye.",
    "3. 시뮬레이션 조작법": "3. Simulation Controls",
    "궤도 위치:": "Orbital Position:",
    "태양-지구-달의 상대적 각도를 조절합니다. 일식은 달이 태양 방향에 있을 때, 월식은 반대편에 있을 때 발생합니다.": "Adjusts the relative angles of the Sun, Earth, and Moon. Solar eclipses occur when the Moon is toward the Sun, and lunar eclipses when it's opposite.",
    "궤도 기울기:": "Orbital Inclination:",
    "달 궤도면과 지구 궤도면의 교차 각도를 조절합니다. 실제 달 궤도는 약 5° 기울어져 있어 매 보름달/초승달마다 식 현상이 일어나지 않습니다.": "Adjusts the intersection angle between the Moon's and Earth's orbital planes. The real lunar orbit is tilted by about 5°, so eclipses don't happen every full/new moon.",
    "달 거리 비율:": "Moon Distance Ratio:",
    "달의 근지점/원지점 거리를 조절하여 개기 일식과 금환 일식의 차이를 관찰할 수 있습니다.": "Adjusts the perigee/apogee distance to observe the difference between total and annular solar eclipses.",

    // Lens Simulation
    "볼록렌즈와 오목렌즈 시뮬레이션": "Convex & Concave Lens Simulation",
    "볼록렌즈 & 오목렌즈 시뮬레이션": "Convex & Concave Lens Simulation",
    "볼록렌즈": "Convex Lens",
    "오목렌즈": "Concave Lens",
    "광학 레일 실험": "Optical Rail Experiment",
    "광학 원리 설명": "Optical Principles",
    "화면의 물체(주황 화살표)나 초점(F)을 마우스로 직접 드래그하여 움직여보세요!": "Drag the object (orange arrow) or focus (F) directly on the screen to move them!",
    "렌즈를 통해 보이는 모습": "View through the Lens",
    "상태 설명 텍스트": "Status Description",
    "실험 문자 설정": "Letter Settings",
    "투영할 이미지 문자 선택:": "Select Letter for Projection:",
    "1번 렌즈 (볼록렌즈) 설정:": "Lens 1 (Convex) Settings:",
    "사용함": "Use",
    "사용 안 함": "Do Not Use",
    "2번 렌즈 (오목렌즈) 설정:": "Lens 2 (Concave) Settings:",
    "광학 벤치 제어": "Optical Bench Controls",
    "레일 시스템 제어": "Rail System Controls",
    "초점 거리 (f):": "Focal Length (f):",
    "물체 위치 (a / d₀):": "Object Position (a / d₀):",
    "물체 높이 (h₀):": "Object Height (h₀):",
    "1번 렌즈(볼록) 위치:": "Lens 1 (Convex) Position:",
    "2번 렌즈(오목) 위치:": "Lens 2 (Concave) Position:",
    "스크린 패널 위치:": "Screen Panel Position:",
    "광선 모드": "Ray Mode",
    "대표 광선 3개": "3 Principal Rays",
    "평행 레이저": "Parallel Lasers",
    "그리드 표시": "Show Grid",
    "보조선 및 치수 표시": "Show Guidelines",
    "실시간 측정 데이터": "Real-time Measurement Data",
    "렌즈 공식 계산식": "Lens Formula",
    "물체 거리 (a)": "Object Distance (a)",
    "상 거리 (b)": "Image Distance (b)",
    "배율 (m = -b/a)": "Magnification (m = -b/a)",
    "상태 판별": "Image Type",
    "1번 렌즈(볼록) 위치": "Lens 1 (Convex) Pos",
    "2번 렌즈(오목) 위치": "Lens 2 (Concave) Pos",
    "스크린 패널 위치": "Screen Panel Pos",
    "최종 초점 면 (Focal Plane)": "Final Focal Plane",
    "상의 배율 / 상태": "Image Magnification / State",
    "렌즈의 광학적 원리": "Optical Principles of Lenses",
    "1. 얇은 렌즈 공식 (Thin Lens Equation)": "1. Thin Lens Equation",
    "렌즈의 초점 거리를 $f$, 물체와 렌즈 중심 사이의 거리를 $a$, 상과 렌즈 중심 사이의 거리를 $b$라 할 때, 다음과 같은 공식이 성립합니다.": "When the focal length of the lens is $f$, the distance between the object and the lens center is $a$, and the distance between the image and the lens center is $b$, the following formula holds:",
    "부호 규약 (Sign Convention):": "Sign Convention:",
    "$a$ (물체 거리): 항상 양수($+$)": "$a$ (Object distance): Always positive ($+$)",
    "$f$ (초점 거리): 볼록렌즈는 양수($+$), 오목렌즈는 음수($-$)": "$f$ (Focal length): Positive ($+$) for convex, negative ($-$) for concave",
    "$b$ (상 거리): 실상은 양수($+$) (렌즈 통과 후 오른쪽에 형성), 허상은 음수($-$) (렌즈 앞쪽 왼쪽에 형성)": "$b$ (Image distance): Positive ($+$) for real image, negative ($-$) for virtual image",
    "2. 복합 렌즈 시스템 및 레일 실험 원리": "2. Compound Lens System & Rail Experiment Principles",
    "일반적인 광학 레일 시스템에서는 물체에서 나온 빛이 1번 렌즈(볼록렌즈)와 2번 렌즈(오목렌즈)를 순차적으로 통과하여 최종 스크린에 상을 맺습니다.": "In an optical rail system, light from the object sequentially passes through Lens 1 (convex) and Lens 2 (concave) to form an image on the screen.",
    "단계별 상 계산: 1번 렌즈에 의해 만들어진 상이 2번 렌즈의 새로운 물체 역할을 하게 됩니다.": "Step-by-step image calculation: The image formed by Lens 1 acts as a new object for Lens 2.",
    "초점 맞추기 (Focusing): 스크린의 위치가 2번 렌즈를 거친 최종 상의 거리와 정확히 일치할 때, 스크린에 가장 선명하고 뚜렷한 상(글자)이 맺히게 됩니다. 스크린이 초점 평면을 벗어나면 빛이 퍼지면서 글자가 흐릿해집니다(Blur).": "Focusing: When the screen is at the final image distance, the clearest image (letter) is formed. If not, the light spreads out and the image blurs.",
    "3. 렌즈 종류별 상의 특징": "3. Image Characteristics by Lens Type",
    "볼록렌즈 (수렴 렌즈):": "Convex Lens (Converging Lens):",
    "$a > 2f$ (초점 거리 2배 밖): <strong>축소된 도립 실상</strong> (카메라, 눈의 망막)": "$a > 2f$ (Beyond 2f): <strong>Reduced inverted real image</strong> (Camera, retina)",
    "$a = 2f$ (초점 거리 2배 지점): <strong>크기가 같은 도립 실상</strong>": "$a = 2f$ (At 2f): <strong>Same-size inverted real image</strong>",
    "$f < a < 2f$ (초점과 2배 초점 사이): <strong>확대된 도립 실상</strong> (영화 영사기)": "$f < a < 2f$ (Between f and 2f): <strong>Magnified inverted real image</strong> (Projector)",
    "$a < f$ (초점 안쪽): <strong>확대된 정립 허상</strong> (돋보기, 현미경 접안렌즈)": "$a < f$ (Inside f): <strong>Magnified upright virtual image</strong> (Magnifying glass, microscope)",
    "오목렌즈 (발산 렌즈):": "Concave Lens (Diverging Lens):",
    "물체의 위치에 관계없이 항상 렌즈 앞쪽에 <strong>축소된 정립 허상</strong>이 생깁니다. (근시 교정용 안경)": "Regardless of position, a <strong>reduced upright virtual image</strong> is formed in front of the lens (Myopia glasses).",

    // Specific text node breakdown for DOM tree structure in Lens Modal
    "단계별 상 계산:": "Step-by-step image calculation:",
    "1번 렌즈에 의해 만들어진 상이 2번 렌즈의 새로운 물체 역할을 하게 됩니다.": "The image formed by Lens 1 acts as a new object for Lens 2.",
    "초점 맞추기 (Focusing):": "Focusing:",
    "스크린의 위치가 2번 렌즈를 거친 최종 상의 거리와 정확히 일치할 때, 스크린에 가장 선명하고 뚜렷한 상(글자)이 맺히게 됩니다. 스크린이 초점 평면을 벗어나면 빛이 퍼지면서 글자가 흐릿해집니다(Blur).": "When the screen position exactly matches the distance of the final image after Lens 2, the clearest and sharpest image (letter) is formed on the screen. If the screen deviates from the focal plane, the light spreads out, causing the image to blur.",
    "$a > 2f$ (초점 거리 2배 밖):": "$a > 2f$ (Beyond twice the focal length):",
    "축소된 도립 실상": "Reduced inverted real image",
    "(카메라, 눈의 망막)": "(Camera, retina)",
    "$a = 2f$ (초점 거리 2배 지점):": "$a = 2f$ (At twice the focal length):",
    "크기가 같은 도립 실상": "Same-size inverted real image",
    "$f < a < 2f$ (초점과 2배 초점 사이):": "$f < a < 2f$ (Between focal length and twice the focal length):",
    "확대된 도립 실상": "Magnified inverted real image",
    "(영화 영사기)": "(Projector)",
    "$a < f$ (초점 안쪽):": "$a < f$ (Inside focal length):",
    "확대된 정립 허상": "Magnified upright virtual image",
    "(돋보기, 현미경 접안렌즈)": "(Magnifying glass, microscope eyepiece)",
    "물체의 위치에 관계없이 항상 렌즈 앞쪽에": "Regardless of the object's position, a",
    "축소된 정립 허상": "reduced upright virtual image",
    "이 생깁니다. (근시 교정용 안경)": "is always formed in front of the lens. (Myopia correction glasses)",
    
    // Lens Script Dynamic
    "물체": "Object",
    "도립 실상": "Inverted Real Image",
    "정립 허상": "Upright Virtual Image",
    "미사용": "Not Used",
    "평행 발산": "Parallel Divergence",
    "도립": "Inverted",
    "정립": "Upright",
    " 배": "x",
    "초점 위에 물체가 있어 상이 보이지 않음": "Object at focus: no image formed",
    "정립 허상 (돋보기: ": "Upright Virtual Image (Magnifier: ",
    "배 똑바로 확대)": "x, upright)",
    "도립 실상 (눈: ": "Inverted Real Image (Eye: ",
    "배 거꾸로 보임)": "x, inverted)",
    "정립 허상 (축소안경: ": "Upright Virtual Image (Diminishing Lens: ",
    "배 똑바로 축소)": "x, upright)",
    "렌즈 없음 (직사 광선 투영)": "No lens (Direct ray projection)",
    "✓ 초점이 정확히 맞았습니다!": "✓ Perfectly in focus!",
    "초점 오차: ": "Focal Error: ",
    "% (스크린을 움직여 맞추세요)": "% (Move screen to focus)",
    "스크린에 투영된 이미지 (패널 관측)": "Projected Screen Image (Panel View)",
    "광원 (물체)": "Light Source (Object)",
    "1번 볼록렌즈": "Lens 1 (Convex)",
    "2번 오목렌즈": "Lens 2 (Concave)",
    "스크린 패널": "Screen Panel",

    // Lenz's Law Simulation
    "렌츠의 법칙 시뮬레이션": "Lenz's Law Simulation",
    "자석과 코일": "Magnet & Coil",
    "금속 원판 낙하": "Metal Disk Drop",
    "LED 실험": "LED Experiment",
    "원리 설명": "Theory Guide",
    "자석 설정": "Magnet Settings",
    "자석 극성 방향:": "Magnet Polarity:",
    "N - S (좌N 우S)": "N - S (Left N, Right S)",
    "S - N (좌S 우N)": "S - N (Left S, Right N)",
    "자석 세기 (Magnetic Strength):": "Magnetic Strength:",
    "자동 운동 모드:": "Movement Mode:",
    "수동 (드래그)": "Manual (Drag)",
    "자동 왕복": "Auto-Oscillation",
    "코일 & 시각화 설정": "Coil & Visualization Settings",
    "코일 감은 수 (N):": "Coil Turns (N):",
    "자기장선 (Magnetic Field Lines) 표시": "Show Magnetic Field Lines",
    "유도 자기장 표시": "Show Induced Magnetic Field",
    "유도 전류 (전자 흐름) 표시": "Show Induced Current (Electron Flow)",
    "금속 원판 설정": "Metal Disk Settings",
    "금속 재질 선택:": "Select Metal Material:",
    "구리": "Copper",
    "알루미늄": "Aluminum",
    "황동": "Brass",
    "원판 형태:": "Disk Shape:",
    "꽉 찬 원판": "Solid Disk",
    "구멍 뚫린 원판": "Slotted Disk",
    "코일과 자석 설정": "Coil & Magnet Settings",
    "S극이 아래로": "S Pole Down",
    "N극이 아래로": "N Pole Down",
    "자기장선 표시": "Show Magnetic Field Lines",
    "유도 전류 방향(화살표) 표시": "Show Induced Current Direction",
    "N극 유도": "N-Pole Induced",
    "S극 유도": "S-Pole Induced",
    "유도 자기장 방향": "Induced Field Direction",
    "자기력(저항)": "Magnetic Force (Drag)",
    "렌츠의 법칙 및 전자기 유도 원리": "Lenz's Law & Electromagnetic Induction",
    "1. 패러데이의 전자기 유도 법칙 (Faraday's Law of Induction)": "1. Faraday's Law of Induction",
    "회로를 관통하는 자기선속(자속, Magnetic Flux $\\Phi$)이 시간적으로 변화할 때, 회로에 유도 기전력(유도 전압, $V$)이 발생하는 현상입니다.": "When the magnetic flux ($\\Phi$) passing through a circuit changes over time, an induced electromotive force (voltage, $V$) is generated in the circuit.",
    "코일의 감은 수 (감은 수가 많을수록 강한 유도 기전력 발생)": "Coil turns (higher turns produce stronger induced EMF)",
    "시간당 자속의 변화율 (자석이 빠르게 움직일수록 강한 유도 기전력 발생)": "Rate of change of magnetic flux (faster magnet motion produces stronger induced EMF)",
    "마이너스($-$) 부호:": "Minus sign ($$-$):",
    "렌츠의 법칙을 나타냅니다.": "represents Lenz's Law.",
    "2. 렌츠의 법칙 (Lenz's Law)": "2. Lenz's Law",
    "전자기 유도에 의해 발생하는 유도 전류의 방향은 **\"자속의 변화를 방해하려는 방향\"**으로 자기장을 만드는 방향으로 흐릅니다. 즉, 자연은 변화를 싫어하며 현재 상태를 유지하려고 저항하는 성질이 있습니다.": "The direction of the induced current is always such that it opposes the change in magnetic flux. In other words, nature resists change and attempts to maintain the status quo.",
    "자석이 코일에 다가올 때 (자속 증가)": "When magnet approaches coil (Flux increases)",
    "다가오는 자석을 밀어내기 위해 코일 앞부분에 <strong>자석의 극과 같은 극</strong>이 유도되어 척력이 발생합니다.": "To push away the approaching magnet, a **pole of the same type** is induced at the front of the coil, creating repulsive force.",
    "N극 접근 $\\rightarrow$ 코일 왼쪽에 N극 유도 (오른손 법칙으로 전류 방향 결정)": "N-pole approach $\\rightarrow$ N-pole induced on left of coil (current direction by right-hand rule)",
    "S극 접근 $\\rightarrow$ 코일 왼쪽에 S극 유도": "S-pole approach $\\rightarrow$ S-pole induced on left of coil",
    "자석이 코일에서 멀어질 때 (자속 감소)": "When magnet recedes from coil (Flux decreases)",
    "멀어지는 자석을 붙잡기 위해 코일 앞부분에 <strong>자석의 극과 반대 극</strong>이 유도되어 인력이 발생합니다.": "To attract the receding magnet, a **pole of the opposite type** is induced at the front of the coil, creating attractive force.",
    "N극 후퇴 $\\rightarrow$ 코일 왼쪽에 S극 유도": "N-pole recession $\\rightarrow$ S-pole induced on left of coil",
    "S극 후퇴 $\\rightarrow$ 코일 왼쪽에 N극 유도": "S-pole recession $\\rightarrow$ N-pole induced on left of coil",
    "3. 검류계(G)의 작동 원리": "3. Galvanometer (G) Principle",
    "검류계는 아주 미세한 전류의 크기와 방향을 측정하는 기기입니다. 전류가 시계 방향 혹은 반시계 방향으로 흐름에 따라 검류계의 바늘이 좌(+) 혹은 우(-)로 기울어져 유도 전류의 방향과 세기를 직관적으로 보여줍니다.": "A galvanometer measures the direction and magnitude of tiny currents. The needle tilts left or right depending on the current flow, showing the direction and strength intuitively."
  };

  // Function to translate a single text value
  function translateText(text) {
    if (!text) return null;
    const trimmed = text.trim();
    if (dictionary[trimmed]) {
      return text.replace(trimmed, dictionary[trimmed]);
    }
    
    // Check for partial substring matches or dynamic numbers
    for (let key in dictionary) {
      if (trimmed.includes(key)) {
        return text.replace(key, dictionary[key]);
      }
    }
    return null;
  }

  // Walk DOM
  function walk(node) {
    if (node.nodeType === 3) { // Text node
      const translated = translateText(node.nodeValue);
      if (translated !== null) {
        node.nodeValue = translated;
      }
    } else if (node.nodeType === 1) { // Element node
      if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
        // Translate placeholders
        if (node.placeholder) {
          const trans = translateText(node.placeholder);
          if (trans) node.placeholder = trans;
        }
        // Translate button values or options
        if (node.tagName === 'INPUT' && (node.type === 'button' || node.type === 'submit') && node.value) {
          const trans = translateText(node.value);
          if (trans) node.value = trans;
        }
        
        node.childNodes.forEach(walk);
      }
    }
  }

  // Initial translation
  if (document.body) {
    walk(document.body);
  } else {
    document.addEventListener('DOMContentLoaded', () => walk(document.body));
  }

  if (document.title) {
    const trans = translateText(document.title);
    if (trans) document.title = trans;
  }

  // MutationObserver to translate dynamic content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(walk);
      } else if (mutation.type === 'characterData') {
        const node = mutation.target;
        const translated = translateText(node.nodeValue);
        if (translated !== null && node.nodeValue !== translated) {
          observer.disconnect();
          node.nodeValue = translated;
          observer.observe(document.body, { childList: true, characterData: true, subtree: true });
        }
      }
    });
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    });
  }

  // Monkeypatch CanvasRenderingContext2D.prototype.fillText for canvas text translations
  if (window.CanvasRenderingContext2D) {
    const originalFillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
      if (typeof text === 'string') {
        const translated = translateText(text);
        if (translated !== null) {
          text = translated;
        }
      }
      if (maxWidth !== undefined) {
        return originalFillText.call(this, text, x, y, maxWidth);
      } else {
        return originalFillText.call(this, text, x, y);
      }
    };
  }
})();
