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
    "달의 근지점/원지점 거리를 조절하여 개기 일식과 금환 일식의 차이를 관찰할 수 있습니다.": "Adjusts the perigee/apogee distance to observe the difference between total and annular solar eclipses."
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
