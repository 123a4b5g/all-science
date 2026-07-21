const DEFAULT_TEMPLATES = [
  {
    name: '역학 및 운동 법칙 시뮬레이션',
    author: 'All Science 물리 랩',
    description: '힘과 가속도(F=ma) 및 운동량 보존과 충돌을 다루는 인터랙티브 물리 시뮬레이션입니다. 질량, 힘, 마찰계수를 조절하며 물체의 운동을 관찰하거나 충돌 실험을 할 수 있습니다.',
    category: 'physics',
    imageStyle: 'physics_thumbnail.png',
    translationKey: 'Physics',
    views: 12500,
    likes: 430,
    url: './physics/index.html',
    code: '<!-- 외부 URL로 연결된 시뮬레이션입니다. -->\n<!-- ./physics/index.html -->'
  },
  {
    name: '파동의 간섭 시뮬레이션',
    author: 'All Science 물리 랩',
    description: '서로 다른 방향으로 진행하는 두 파동의 중첩과 간섭 현상을 관찰할 수 있는 인터랙티브 시뮬레이션입니다. 진폭, 너비, 형태 등을 조절하여 보강 간섭과 상쇄 간섭을 탐구해 보세요.',
    category: 'physics',
    imageStyle: 'wave_thumbnail.jpg',
    translationKey: 'Wave',
    views: 9420,
    likes: 380,
    url: './wave/index.html',
    code: '<!-- 외부 URL로 연결된 시뮬레이션입니다. -->\n<!-- ./wave/index.html -->'
  },
  {
    name: '물의 전기분해 실험 시뮬레이션',
    author: 'All Science 화학 랩',
    description: '수산화나트륨(NaOH) 또는 염화나트륨(NaCl) 전해질을 녹인 물에 전류를 흘려주어 수소, 산소, 염소 기체로 분해하는 전기분해 실험 시뮬레이션입니다.',
    category: 'chemistry',
    imageStyle: 'electrolysis_thumbnail.png',
    translationKey: 'Chemistry',
    views: 8500,
    likes: 310,
    url: './electrolysis/index.html',
    code: '<!-- 외부 URL로 연결된 시뮬레이션입니다. -->\n<!-- ./electrolysis/index.html -->'
  },
  {
    name: '일식과 월식 시뮬레이션',
    author: 'All Science 지구과학 랩',
    description: '태양, 지구, 달의 상대적인 위치와 궤도를 조절하여 일식(개기일식, 금환일식, 부분일식)과 월식(개기월식, 부분월식, 반영월식)의 원리를 탐구하는 시뮬레이션입니다.',
    category: 'earth_science',
    imageStyle: 'eclipse_thumbnail.jpg',
    translationKey: 'EarthScience',
    views: 11000,
    likes: 420,
    url: './eclipse/index.html',
    code: '<!-- 외부 URL로 연결된 시뮬레이션입니다. -->\n<!-- ./eclipse/index.html -->'
  },
  {
    name: '볼록렌즈와 오목렌즈 시뮬레이션',
    author: 'All Science 물리 랩',
    description: '볼록렌즈와 오목렌즈를 통과하는 빛의 굴절 현상과 실시간 상(Image)의 형성을 관측하고, 복합 렌즈 정렬을 다루는 광학 레일 실험을 수행하는 시뮬레이션입니다.',
    category: 'physics',
    imageStyle: 'lens_thumbnail.png',
    translationKey: 'Lens',
    views: 7200,
    likes: 290,
    url: './lens/index.html',
    code: '<!-- 외부 URL로 연결된 시뮬레이션입니다. -->\n<!-- ./lens/index.html -->'
  },
  {
    name: '렌츠의 법칙 시뮬레이션',
    author: 'All Science 물리 랩',
    description: '자석의 운동에 의해 코일에 발생하는 유도 전류와 전자기 유도 현상을 관찰하고, 금속 원판 낙하 및 파이프 속 자석 낙하 실험을 통해 렌츠의 법칙을 탐구하는 시뮬레이션입니다.',
    category: 'physics',
    imageStyle: 'lenz_thumbnail.png',
    translationKey: 'Lenz',
    views: 9100,
    likes: 340,
    url: './lenz/index.html',
    code: '<!-- 외부 URL로 연결된 시뮬레이션입니다. -->\n<!-- ./lenz/index.html -->'
  }
];

const TRANSLATIONS = {
  ko: {
    // Header & Hub
    headerSearchPlaceholder: "검색하여 과학 템플릿 즉시 매칭...",
    heroTitle: "실험, 화학, 물리, 시뮬레이션까지<br /><span class='text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600'>쉬운 과학의 시작!</span>",
    heroSubtitle: "직접 해보고 과학의 흥미를 느껴보세요!",
    heroSearchPlaceholder: "원하는 과학 시뮬레이션 명칭이나 키워드를 검색해 보세요...",
    exploreTitle: "과학 실험 시뮬레이션 탐색",
    exploreSubtitle: "마우스 클릭 시 즉시 실시간 런타임 실험실에 진입합니다.",
    emptyTitle: "가상 실험실이 비어 있습니다",
    emptyDesc: "학술 플래너, 타이머, 계산기 등 모든 프리셋 템플릿과 시뮬레이션이 성공적으로 삭제되었습니다.",
    noMatchingTitle: "일치하는 템플릿이 없습니다.",
    noMatchingDesc: "다른 검색어 또는 필터를 변경해 보세요.",
    resetFilterBtn: "필터 초기화",
    clickToExecute: "시뮬레이션 실행하기",
    lastUpdated: "2일 전 업데이트",
    
    // Studio
    backToHome: "메인 홈으로",
    tabRun: "🚀 실행 가이드",
    tabCode: "💻 코드 편집",
    tabMeta: "⚙️ 설정 & 제거",
    runTitle: "실시간 과학실 관측 정보",
    runGuideTitle: "실시간 시뮬레이션 가이드",
    runGuideDesc: "현재 이 과학 시뮬레이션은 격리된 가상 샌드박스 내부에서 안전하게 실행되고 있습니다. 우측 화면을 조작하여 가상 과학 반응과 움직임을 관찰하고, 상단의 '코드 편집' 탭을 통해 언제든지 코드를 수정해 보세요.",
    runTheoryTitle: "이론적 원리 & 공식 가이드",
    runLikes: "즐겨찾기 횟수 (Stars)",
    runCategory: "학술 카테고리",
    runAuthor: "프로그램 개발자",
    runRebootBtn: "실험 기기 및 런타임 재부팅 (Reboot Instance)",
    
    codeTitle: "HTML5 소스 코드 에디터",
    codeDesc: "오른쪽 가상 샌드박스 화면에 즉시 로드되는 소스코드를 수정하세요.<br /><span class='text-emerald-600 font-bold'>● 실시간 자동 저장(Auto-save)이 적용됩니다.</span>",
    codeSaved: "✓ 실시간 자동 저장됨",
    codeRunBtn: "컴파일 & 즉시 실행",
    
    metaTitle: "연구 설정 및 카드 메타데이터 변경",
    metaNameLabel: "시뮬레이션 연구 과제명",
    metaNamePlaceholder: "시뮬레이션 연구명 입력",
    metaAuthorLabel: "연구 개발자 / 채널명",
    metaAuthorPlaceholder: "개발자 이름 입력",
    metaDescLabel: "이론적 설명 및 가이드",
    metaDescPlaceholder: "시뮬레이션 과학 원리 및 조작법 설명",
    metaStyleLabel: "카드 썸네일 스타일",
    metaDeleteBtn: "이 시뮬레이션 연구 영구 삭제하기",
    
    // Sandbox
    rebootBtn: "재생 재부팅",
    likeAdd: "즐겨찾기 추가",
    likeSaved: "즐겨찾기 보존중",
    descSummary: "상세 원리 요약:",
    descPlaceholder: "별도 기술된 원리가 없습니다. 왼쪽 설정 탭을 사용하여 이 시뮬레이션의 가치를 설명해 보세요.",
    
    // Default templates
    templatePhysicsName: "역학 및 운동 법칙 시뮬레이션",
    templatePhysicsAuthor: "All Science 물리 랩",
    templatePhysicsDesc: "힘과 가속도(F=ma) 및 운동량 보존과 충돌을 다루는 인터랙티브 물리 시뮬레이션입니다. 질량, 힘, 마찰계수를 조절하며 물체의 운동을 관찰하거나 충돌 실험을 할 수 있습니다.",
    
    templateWaveName: "파동의 간섭 시뮬레이션",
    templateWaveAuthor: "All Science 물리 랩",
    templateWaveDesc: "서로 다른 방향으로 진행하는 두 파동의 중첩과 간섭 현상을 관찰할 수 있는 인터랙티브 시뮬레이션입니다. 진폭, 너비, 형태 등을 조절하여 보강 간섭과 상쇄 간섭을 탐구해 보세요.",

    templateChemistryName: "물의 전기분해 실험 시뮬레이션",
    templateChemistryAuthor: "All Science 화학 랩",
    templateChemistryDesc: "수산화나트륨(NaOH) 또는 염화나트륨(NaCl) 전해질을 녹인 물에 전류를 흘려주어 수소, 산소, 염소 기체로 분해하는 전기분해 실험 시뮬레이션입니다.",

    templateEarthScienceName: "일식과 월식 시뮬레이션",
    templateEarthScienceAuthor: "All Science 지구과학 랩",
    templateEarthScienceDesc: "태양, 지구, 달의 상대적인 위치와 궤도를 조절하여 일식(개기일식, 금환일식, 부분일식)과 월식(개기월식, 부분월식, 반영월식)의 원리를 탐구하는 시뮬레이션입니다.",
    
    templateLensName: "볼록렌즈와 오목렌즈 시뮬레이션",
    templateLensAuthor: "All Science 물리 랩",
    templateLensDesc: "볼록렌즈와 오목렌즈를 통과하는 빛의 굴절 현상과 실시간 상(Image)의 형성을 관측하고, 복합 렌즈 정렬을 다루는 광학 레일 실험을 수행하는 시뮬레이션입니다.",
    
    templateLenzName: "렌츠의 법칙 시뮬레이션",
    templateLenzAuthor: "All Science 물리 랩",
    templateLenzDesc: "자석의 운동에 의해 코일에 발생하는 유도 전류와 전자기 유도 현상을 관찰하고, 금속 원판 낙하 및 파이프 속 자석 낙하 실험을 통해 렌츠의 법칙을 탐구하는 시뮬레이션입니다."
  },
  en: {
    // Header & Hub
    headerSearchPlaceholder: "Search to match science templates instantly...",
    heroTitle: "From experiments, chemistry, physics to simulations<br /><span class='text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600'>Science Made Easy!</span>",
    heroSubtitle: "Try it yourself and experience the fun of science!",
    heroSearchPlaceholder: "Search for simulation name or keyword...",
    exploreTitle: "Explore Science Simulations",
    exploreSubtitle: "Click to enter the real-time laboratory sandbox instantly.",
    emptyTitle: "Virtual Lab is Empty",
    emptyDesc: "All presets, templates, and simulations have been deleted.",
    noMatchingTitle: "No matching templates found.",
    noMatchingDesc: "Try changing your search terms or filters.",
    resetFilterBtn: "Reset Filters",
    clickToExecute: "Run Simulation",
    lastUpdated: "Updated 2 days ago",
    
    // Studio
    backToHome: "Go to Home",
    tabRun: "🚀 Run Guide",
    tabCode: "💻 Edit Code",
    tabMeta: "⚙️ Settings & Delete",
    runTitle: "Real-time Lab Information",
    runGuideTitle: "Real-time Simulation Guide",
    runGuideDesc: "This simulation is running safely inside an isolated virtual sandbox. Control the screen on the right to observe scientific reactions and motions, and edit the code anytime using the 'Edit Code' tab.",
    runTheoryTitle: "Theoretical Principles & Formula",
    runLikes: "Favorites (Stars)",
    runCategory: "Academic Category",
    runAuthor: "Developer",
    runRebootBtn: "Reboot Lab Equipment & Runtime",
    
    codeTitle: "HTML5 Source Code Editor",
    codeDesc: "Edit the source code loaded directly into the virtual sandbox.<br /><span class='text-emerald-600 font-bold'>● Auto-save is applied in real-time.</span>",
    codeSaved: "✓ Auto-saved in real-time",
    codeRunBtn: "Compile & Run",
    
    metaTitle: "Research Settings & Metadata",
    metaNameLabel: "Simulation Project Name",
    metaNamePlaceholder: "Enter project name",
    metaAuthorLabel: "Developer / Channel Name",
    metaAuthorPlaceholder: "Enter developer name",
    metaDescLabel: "Description & User Guide",
    metaDescPlaceholder: "Explain scientific principles and controls",
    metaStyleLabel: "Card Thumbnail Style",
    metaDeleteBtn: "Permanently Delete Simulation",
    
    // Sandbox
    rebootBtn: "Restart Run",
    likeAdd: "Add to Favorites",
    likeSaved: "In Favorites",
    descSummary: "Detailed Principles:",
    descPlaceholder: "No description provided. Use the Settings tab to explain the principles of this simulation.",
    
    // Default templates
    templatePhysicsName: "Mechanics & Laws of Motion",
    templatePhysicsAuthor: "All Science Physics Lab",
    templatePhysicsDesc: "An interactive physics simulation covering force and acceleration (F=ma) and conservation of momentum. Adjust mass, force, and friction to observe motion or run collision experiments.",
    
    templateWaveName: "Wave Interference Simulation",
    templateWaveAuthor: "All Science Physics Lab",
    templateWaveDesc: "An interactive simulation to observe the superposition and interference of two waves traveling in opposite directions. Adjust amplitude, width, and shape to study constructive and destructive interference.",

    templateChemistryName: "Water Electrolysis Simulation",
    templateChemistryAuthor: "All Science Chemistry Lab",
    templateChemistryDesc: "A simulation of water electrolysis where electric current passes through water containing sodium hydroxide (NaOH) or sodium chloride (NaCl) electrolyte to decompose it into hydrogen, oxygen, and chlorine gases.",

    templateEarthScienceName: "Solar and Lunar Eclipse Simulation",
    templateEarthScienceAuthor: "All Science Earth Science Lab",
    templateEarthScienceDesc: "Explore solar eclipses (total, annular, partial) and lunar eclipses (total, partial, penumbral) by adjusting the relative positions and orbits of the Sun, Earth, and Moon.",
    
    templateLensName: "Convex & Concave Lens Simulation",
    templateLensAuthor: "All Science Physics Lab",
    templateLensDesc: "Observe the refraction of light passing through convex and concave lenses and the real-time formation of images, and conduct optical rail experiments covering compound lens alignment.",
    
    templateLenzName: "Lenz's Law Simulation",
    templateLenzAuthor: "All Science Physics Lab",
    templateLenzDesc: "Observe induced current and electromagnetic induction in a coil caused by magnet motion, and explore Lenz's law through metal disk drop and magnet drop in pipe experiments."
  }
};

const app = {
  currentLang: 'ko',
  programs: [],
  likedPrograms: {},
  viewMode: 'hub',
  selectedId: '',
  studioActiveTab: 'run',
  searchQuery: '',
  sandboxKey: 0,
 
  init() {
    this.currentLang = localStorage.getItem('sci-lab-lang') || 'ko';
    this.loadData();
    this.bindEvents();
    this.applyLanguage();
    this.render();
    lucide.createIcons();
    window.addEventListener('resize', () => this.updateIframeScale());
  },

  getTranslation(prog) {
    const t = TRANSLATIONS[this.currentLang];
    const def = DEFAULT_TEMPLATES.find(d => d.url === prog.url);
    if (def && def.translationKey) {
      return {
        name: t[`template${def.translationKey}Name`],
        author: t[`template${def.translationKey}Author`],
        description: t[`template${def.translationKey}Desc`]
      };
    }
    return {
      name: prog.name,
      author: prog.author,
      description: prog.description
    };
  },

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('sci-lab-lang', lang);
    this.applyLanguage();
    this.render();
    if (this.viewMode === 'studio') {
      this.refreshSandbox();
    }
  },

  applyLanguage() {
    const lang = this.currentLang;
    const t = TRANSLATIONS[lang];
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) {
        el.innerHTML = t[key];
      }
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key]) {
        el.placeholder = t[key];
      }
    });

    const btnKo = document.getElementById('lang-ko');
    const btnEn = document.getElementById('lang-en');
    if (btnKo && btnEn) {
      if (lang === 'ko') {
        btnKo.className = "px-2.5 py-1 text-xs font-bold rounded-lg border border-teal-600 bg-teal-600 text-white cursor-pointer transition-colors";
        btnEn.className = "px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 cursor-pointer transition-colors";
      } else {
        btnKo.className = "px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 cursor-pointer transition-colors";
        btnEn.className = "px-2.5 py-1 text-xs font-bold rounded-lg border border-teal-600 bg-teal-600 text-white cursor-pointer transition-colors";
      }
    }
  },
 
  loadData() {
    try {
      const saved = localStorage.getItem('sci-lab-custom-programs-v5');
      let loadedPrograms = [];
      if (saved) {
        loadedPrograms = JSON.parse(saved).filter(p => !p.url.match(/^\.\/(physics|wave|electrolysis|eclipse|lens|lenz)\.html$/));
      }
      
      const defaultWithIds = DEFAULT_TEMPLATES.map((t, idx) => ({
        id: `default-${idx + 1}`,
        ...t
      }));

      if (loadedPrograms.length === 0) {
        this.programs = defaultWithIds;
      } else {
        // Sync default templates metadata (like name, description, author, imageStyle)
        loadedPrograms = loadedPrograms.map(p => {
          const def = defaultWithIds.find(d => d.url === p.url);
          if (def) {
            return {
              ...p,
              name: def.name,
              author: def.author,
              description: def.description,
              category: def.category,
              imageStyle: def.imageStyle,
              url: def.url,
              code: def.code
            };
          }
          return p;
        });

        // Merge missing default templates
        const existingUrls = new Set(loadedPrograms.map(p => p.url));
        const missingDefaults = defaultWithIds.filter(d => d.url && !existingUrls.has(d.url));
        this.programs = [...loadedPrograms, ...missingDefaults];
      }
      this.savePrograms();

      const savedLikes = localStorage.getItem('sci-lab-liked-videos-v5');
      if (savedLikes) {
        this.likedPrograms = JSON.parse(savedLikes);
      }
    } catch (e) {
      console.error('Error loading data', e);
    }
  },

  savePrograms() {
    localStorage.setItem('sci-lab-custom-programs-v5', JSON.stringify(this.programs));
  },

  saveLikes() {
    localStorage.setItem('sci-lab-liked-videos-v5', JSON.stringify(this.likedPrograms));
  },

  bindEvents() {
    const headerInput = document.getElementById('header-search-input');
    const heroInput = document.getElementById('hero-search-input');

    headerInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderGrid();
    });

    heroInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderGrid();
    });
  },

  get activeProgram() {
    return this.programs.find(p => p.id === this.selectedId) || this.programs[0] || null;
  },

  setViewMode(mode) {
    this.viewMode = mode;
    this.render();
  },

  setStudioTab(tab) {
    this.studioActiveTab = tab;
    this.renderStudioTabs();
  },

  selectProgram(id) {
    this.selectedId = id;
    const p = this.activeProgram;
    if (p && p.url) {
      window.location.href = p.url;
      return;
    }
    this.setViewMode('studio');
    this.refreshSandbox();
  },

  triggerAlert(msg) {
    const popup = document.getElementById('alert-popup');
    document.getElementById('alert-msg').innerText = msg;
    popup.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    popup.classList.add('opacity-100');
    
    setTimeout(() => {
      popup.classList.remove('opacity-100');
      popup.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => popup.classList.add('hidden'), 300);
    }, 2500);
  },

  toggleLike() {
    const p = this.activeProgram;
    if (!p) return;
    
    const isLiked = this.likedPrograms[p.id];
    this.likedPrograms[p.id] = !isLiked;
    
    const idx = this.programs.findIndex(x => x.id === p.id);
    if (idx !== -1) {
      this.programs[idx].likes = (this.programs[idx].likes || 0) + (isLiked ? -1 : 1);
    }
    
    this.saveLikes();
    this.savePrograms();
    this.triggerAlert(isLiked ? '즐겨찾기에서 취소되었습니다.' : '💖 이 과학 템플릿을 즐겨찾기에 등록했습니다!');
    this.renderStudioMeta();
  },

  handleUpdateCode(newCode) {
    const p = this.activeProgram;
    if (!p) return;
    
    const idx = this.programs.findIndex(x => x.id === p.id);
    if (idx !== -1) {
      this.programs[idx].code = newCode;
      this.savePrograms();
    }
  },

  handleUpdateMeta(field, value) {
    const p = this.activeProgram;
    if (!p) return;
    
    const idx = this.programs.findIndex(x => x.id === p.id);
    if (idx !== -1) {
      this.programs[idx][field] = value;
      this.savePrograms();
      this.renderStudioMeta();
    }
  },

  handleDeleteProgram() {
    const p = this.activeProgram;
    if (!p) return;

    this.programs = this.programs.filter(x => x.id !== p.id);
    this.savePrograms();
    
    this.triggerAlert('🗑️ 시뮬레이션 연구가 삭제되었습니다.');
    if (this.programs.length > 0) {
      this.selectedId = this.programs[0].id;
      this.setViewMode('hub');
    } else {
      this.selectedId = '';
      this.setViewMode('hub');
    }
  },

  refreshSandbox() {
    this.sandboxKey++;
    const iframe = document.getElementById('sandbox-iframe');
    const p = this.activeProgram;
    if (iframe && p) {
      if (p.url) {
        iframe.removeAttribute('srcdoc');
        iframe.src = p.url;
      } else {
        iframe.removeAttribute('src');
        iframe.srcdoc = p.code;
      }
      setTimeout(() => this.updateIframeScale(), 50);
    }
  },

  updateIframeScale() {
    const container = document.getElementById('iframe-container');
    const scaler = document.getElementById('iframe-scaler');
    const iframe = document.getElementById('sandbox-iframe');
    const p = this.activeProgram;
    
    if (!container || !scaler || !iframe) return;

    if (window.innerWidth <= 1024) {
      scaler.style.width = '100%';
      scaler.style.height = '100%';
      scaler.style.transform = 'none';
      scaler.style.position = 'relative';
      scaler.style.left = '0';
      scaler.style.top = '0';
      return;
    }

    if (p && p.url) {
      // 외부 URL 템플릿(역학 시뮬레이션 등)은 데스크탑 해상도(1440x900)를 기준으로 렌더링 후 스케일 다운
      const targetWidth = 1440;
      const targetHeight = 900;
      
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      if (containerWidth === 0) return; // Hidden state
      
      const scaleX = containerWidth / targetWidth;
      const scaleY = containerHeight / targetHeight;
      const scale = Math.min(scaleX, scaleY, 1.0);
      
      scaler.style.width = `${targetWidth}px`;
      scaler.style.height = `${targetHeight}px`;
      scaler.style.transform = `scale(${scale})`;
      
      // Center the scaled content
      scaler.style.position = 'absolute';
      scaler.style.left = `${(containerWidth - targetWidth * scale) / 2}px`;
      scaler.style.top = `${(containerHeight - targetHeight * scale) / 2}px`;
    } else {
      // 일반 코드 에디터용은 그대로 출력
      scaler.style.width = '100%';
      scaler.style.height = '100%';
      scaler.style.transform = 'none';
      scaler.style.position = 'relative';
      scaler.style.left = '0';
      scaler.style.top = '0';
    }
  },

  renderTemplateMockup(prog) {
    const style = prog.imageStyle || 'coding';

    // Render as an image if the style is a file name or a URL
    if (style.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i) || style.startsWith('http')) {
      return `
        <div class="w-full h-full relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
          <img src="${style}" alt="${prog.name}" class="w-full h-full object-fill" />
        </div>
      `;
    }
    
    if (style === 'model') {
      return `
        <div class="w-full h-full bg-rose-50 flex items-center justify-between p-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
          <div class="flex flex-col justify-between h-full z-10 w-1/2">
            <div>
              <span class="bg-red-500 text-white text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded">NEW</span>
              <h4 class="text-slate-800 font-extrabold text-xs tracking-tight mt-1 leading-tight">Swoon-worthy Social Post</h4>
              <p class="text-[7px] text-slate-500 mt-0.5 font-bold">오리지널 물리 가속화</p>
            </div>
            <div class="text-[6px] font-bold text-rose-600 bg-white/80 self-start px-2 py-1 rounded border border-rose-100">
              PHYSICS SIMULATOR
            </div>
          </div>
          <div class="w-2/5 h-full relative flex items-center justify-center">
            <div class="w-16 h-16 rounded-full bg-rose-200/60 border border-rose-300 flex items-center justify-center relative">
              <span class="text-[24px] animate-bounce">🔴</span>
              <div class="absolute top-1 left-2 w-2 h-2 rounded-full bg-blue-400"></div>
              <div class="absolute bottom-2 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400"></div>
            </div>
          </div>
          <div class="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-rose-200/20 blur-md"></div>
        </div>
      `;
    }

    if (style === 'report') {
      return `
        <div class="w-full h-full bg-emerald-50/50 flex flex-col justify-between p-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
          <div class="flex items-center justify-between border-b border-emerald-100 pb-2 z-10">
            <span class="text-[7px] font-mono font-bold text-emerald-800">CORPORATE PRESENTATION</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <div class="z-10 py-1">
            <h4 class="text-slate-900 font-black text-[13px] leading-tight tracking-tight">AI-Powered Report Template</h4>
            <p class="text-[8px] text-slate-400 font-medium mt-0.5">Galaxy Particle interactive Sandbox</p>
          </div>
          <div class="flex items-center justify-between z-10">
            <div class="text-[7px] font-bold text-slate-500 font-mono">www.tablabpresentation.com</div>
            <div class="flex -space-x-1">
              <div class="w-3.5 h-3.5 rounded-full bg-blue-400/80"></div>
              <div class="w-3.5 h-3.5 rounded-full bg-indigo-500/80"></div>
            </div>
          </div>
          <div class="absolute top-8 right-6 w-1 h-1 rounded-full bg-blue-400 animate-ping"></div>
          <div class="absolute bottom-4 left-16 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
          <div class="absolute -right-10 -bottom-10 w-24 h-24 bg-gradient-to-tr from-emerald-200 to-teal-100 rounded-full blur-xl opacity-60"></div>
        </div>
      `;
    }

    if (style === 'coding') {
      return `
        <div class="w-full h-full bg-blue-50/40 flex items-center justify-center p-3 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
          <div class="w-11/12 h-5/6 bg-white border border-slate-200 rounded-lg shadow-xs p-2 flex flex-col justify-between">
            <div class="flex items-center justify-between border-b border-slate-100 pb-1">
              <div class="flex gap-1">
                <span class="w-1 h-1 rounded-full bg-red-400"></span>
                <span class="w-1 h-1 rounded-full bg-amber-400"></span>
                <span class="w-1 h-1 rounded-full bg-emerald-400"></span>
              </div>
              <span class="text-[6px] font-mono text-slate-300">Chemistry elements.exe</span>
            </div>
            <div class="flex-1 flex gap-1.5 items-center py-2">
              <div class="w-1/3 flex flex-col items-center">
                <div class="w-7 h-7 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center text-xs">👨‍💻</div>
                <span class="text-[5px] text-slate-400 font-bold mt-1 scale-90">STUDENT</span>
              </div>
              <div class="flex-1 grid grid-cols-4 gap-0.5">
                ${Array.from({ length: 12 }).map((_, i) => `
                  <div class="h-2 rounded-[1px] text-[4px] font-bold flex items-center justify-center ${i % 3 === 0 ? 'bg-red-200 text-red-800' : i % 3 === 1 ? 'bg-blue-200 text-blue-800' : 'bg-emerald-200 text-emerald-800'}">H</div>
                `).join('')}
              </div>
            </div>
            <div class="bg-slate-50 text-[5px] text-slate-400 font-bold p-0.5 text-center rounded border border-slate-100">CLICK TO EXECUTE CHEM ENGINE</div>
          </div>
        </div>
      `;
    }

    if (style === 'browser') {
      return `
        <div class="w-full h-full bg-indigo-50/40 flex items-center justify-center p-3 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
          <div class="w-11/12 h-5/6 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col">
            <div class="bg-slate-50 px-2 py-1 border-b border-slate-100 flex items-center justify-between text-[6px] font-mono text-slate-400 shrink-0">
              <div class="flex gap-1 items-center">
                <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                <span class="text-[5px] text-slate-400">https://timer.allscience.org</span>
              </div>
              <span>Timer Clock</span>
            </div>
            <div class="flex-1 p-2 flex gap-2">
              <div class="w-1/2 bg-slate-900 rounded border border-slate-800 flex flex-col items-center justify-center text-white p-1">
                <div class="text-[8px] font-mono text-emerald-400 font-bold tracking-tight">12:35:48</div>
                <div class="w-3 h-3 rounded-full bg-red-600 flex items-center justify-center mt-1 scale-90">
                  <i data-lucide="play" class="w-1.5 h-1.5 text-white fill-white ml-[0.5px]"></i>
                </div>
              </div>
              <div class="flex-1 flex flex-col justify-between py-1">
                <div class="h-1 w-full bg-slate-200 rounded"></div>
                <div class="h-1 w-4/5 bg-slate-200 rounded"></div>
                <div class="h-1.5 w-1/2 bg-indigo-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (style === 'perfume') {
      return `
        <div class="w-full h-full bg-amber-50/30 flex items-center justify-center p-3 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
          <div class="w-11/12 h-5/6 bg-white border border-slate-200 rounded-lg shadow-xs p-2.5 flex gap-2">
            <div class="w-2/5 h-full bg-amber-100/30 border border-amber-200 rounded flex flex-col items-center justify-center relative p-1">
              <div class="w-4 h-8 bg-amber-800/20 border border-amber-800/40 rounded flex flex-col justify-between items-center py-1">
                <div class="w-2 h-1 bg-amber-950 rounded-xs"></div>
                <div class="w-3 h-3 bg-amber-900/10 border border-amber-950/20 rounded-xs flex items-center justify-center scale-75 text-[4px] font-bold">MIRI</div>
              </div>
              <span class="text-[4px] text-slate-500 mt-1 font-bold">PRISM FLUID</span>
            </div>
            <div class="flex-1 flex flex-col gap-1.5 justify-between">
              <div class="grid grid-cols-2 gap-1 flex-1">
                <div class="bg-slate-100 rounded"></div>
                <div class="bg-slate-200 rounded"></div>
              </div>
              <div class="bg-slate-50 border border-slate-100 rounded p-1">
                <p class="text-[5px] text-slate-700 font-bold leading-none">Minimalist Brand Mood Board</p>
                <span class="text-[4px] text-slate-400 scale-90 block mt-0.5">Optics Physics dispersion</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (style === 'bakery') {
      return `
        <div class="w-full h-full bg-slate-100 flex items-center justify-center p-3 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
          <div class="w-11/12 h-5/6 bg-white border border-slate-200 rounded-lg shadow-xs p-2 flex flex-col justify-between">
            <div class="flex justify-between items-center text-[5px] font-bold text-slate-400 border-b border-slate-100 pb-1">
              <span>MIRI JEANS INSTAGRAM</span>
              <span>CAROUSEL</span>
            </div>
            <div class="flex gap-1.5 my-1.5 flex-1">
              <div class="w-1/3 bg-amber-50 border border-amber-200 rounded p-1 flex flex-col items-center justify-center">
                <span class="text-sm">🥐</span>
                <span class="text-[4px] text-amber-800 font-bold scale-90">BAKERY</span>
              </div>
              <div class="w-1/3 bg-blue-50 border border-blue-200 rounded p-1 flex flex-col items-center justify-center">
                <span class="text-sm">👖</span>
                <span class="text-[4px] text-blue-800 font-bold scale-90">MIRI JEANS</span>
              </div>
              <div class="flex-1 bg-slate-900 border border-slate-950 rounded p-1 flex flex-col items-center justify-center text-sky-400">
                <span class="text-[8px] animate-pulse">🌲</span>
                <span class="text-[3px] text-sky-300 scale-90 font-mono">FRACTAL TREE</span>
              </div>
            </div>
            <div class="text-[5px] font-bold text-slate-400 text-center uppercase tracking-wider scale-90">Brand Jeans Instagram Carousel</div>
          </div>
        </div>
      `;
    }

    return `
      <div class="w-full h-full bg-gradient-to-tr from-slate-800 to-indigo-900 flex flex-col justify-between p-4 text-white relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
        <div class="flex justify-between items-start">
          <span class="bg-blue-600 text-[8px] font-mono font-black tracking-widest px-1.5 py-0.5 rounded">CUSTOM MODULE</span>
          <i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-300"></i>
        </div>
        <div>
          <h4 class="font-extrabold text-xs tracking-tight line-clamp-1">${prog.name}</h4>
          <span class="text-[8px] text-slate-300 block font-mono mt-0.5">Internal Sandbox Code</span>
        </div>
        <div class="flex items-center gap-1 bg-white/10 self-start px-2 py-0.5 rounded text-[8px] font-bold">
          <i data-lucide="code-2" class="w-2.5 h-2.5 text-blue-300"></i> Vanilla JS Sandbox
        </div>
        <div class="absolute -right-6 -bottom-6 w-16 h-16 rounded-full bg-blue-500/30 blur-lg"></div>
      </div>
    `;
  },

  renderGrid() {
    const grid = document.getElementById('template-explorer-grid');
    const t = TRANSLATIONS[this.currentLang];
    const filtered = this.programs.filter(prog => {
      const trans = this.getTranslation(prog);
      return trans.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        (trans.description || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        trans.author.toLowerCase().includes(this.searchQuery.toLowerCase());
    });


    if (this.programs.length === 0) {
      grid.innerHTML = `
        <div class="bg-slate-50 border border-dashed border-slate-200/80 rounded-3xl p-16 text-center flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto my-4 shadow-xs">
          <div class="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-3xl shadow-sm">🔬</div>
          <h4 class="font-black text-slate-800 text-sm" data-i18n="emptyTitle">${t.emptyTitle}</h4>
          <p class="text-xs text-slate-500 max-w-sm leading-relaxed font-semibold" data-i18n="emptyDesc">${t.emptyDesc}</p>
        </div>
      `;
    } else if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <span class="text-3xl">🔍</span>
          <h4 class="font-bold text-slate-700 text-xs" data-i18n="noMatchingTitle">${t.noMatchingTitle}</h4>
          <p class="text-[11px] text-slate-400" data-i18n="noMatchingDesc">${t.noMatchingDesc}</p>
          <button onclick="app.searchQuery=''; document.getElementById('header-search-input').value=''; document.getElementById('hero-search-input').value=''; app.renderGrid();" class="mt-2 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded text-[11px] font-bold" data-i18n="resetFilterBtn">${t.resetFilterBtn}</button>
        </div>
      `;
    } else {
      grid.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${filtered.map(prog => `
            <div onclick="app.selectProgram('${prog.id}')" class="group flex flex-col gap-3 bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer relative">
              <div class="aspect-video w-full bg-slate-100 border-b border-slate-100 overflow-hidden relative">
                ${this.renderTemplateMockup(prog)}
                <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <div class="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <i data-lucide="play" class="w-5 h-5 fill-white ml-0.5"></i>
                  </div>
                  <span class="text-[10px] text-white font-extrabold tracking-widest bg-slate-900/80 px-2.5 py-1 rounded-full shadow-lg backdrop-blur-xs" data-i18n="clickToExecute">${t.clickToExecute}</span>
                </div>
              </div>
              <div class="px-4 pb-4 pt-1 flex gap-3 relative">
                <div class="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 font-bold text-slate-700 text-xs font-mono shadow-xs mt-1">
                  ${this.getTranslation(prog).author.charAt(0).toUpperCase()}
                </div>
                <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                  <h4 class="font-extrabold text-slate-900 text-xs group-hover:text-teal-700 transition-colors truncate leading-tight">${this.getTranslation(prog).name}</h4>
                  <p class="text-[11px] text-slate-500 font-semibold truncate flex items-center gap-1"><span>${this.getTranslation(prog).author}</span></p>
                  <p class="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                    <span data-i18n="lastUpdated">${t.lastUpdated}</span>
                  </p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
    lucide.createIcons();
  },

  renderStudioMeta() {
    const p = this.activeProgram;
    if (!p) return;

    const trans = this.getTranslation(p);
    const t = TRANSLATIONS[this.currentLang];

    // Header & Canvas text
    document.getElementById('studio-title').innerText = trans.name;
    document.getElementById('studio-category').innerText = `${p.category.toUpperCase()} WORKSPACE`;
    document.getElementById('sandbox-title').innerText = trans.name;
    document.getElementById('sandbox-author').innerText = `Author Channel: ${trans.author}`;
    document.getElementById('sandbox-desc').innerText = trans.description || t.descPlaceholder;

    // Meta tab values
    document.getElementById('meta-input-name').value = p.name;
    document.getElementById('meta-input-author').value = p.author;
    document.getElementById('meta-input-desc').value = p.description || '';
    document.getElementById('meta-input-style').value = p.imageStyle || 'coding';
    document.getElementById('code-editor').value = p.code;

    // Run tab values
    document.getElementById('run-desc-container').style.display = trans.description ? 'flex' : 'none';
    document.getElementById('run-desc-text').innerText = trans.description || '';
    document.getElementById('run-meta-likes').innerText = `${p.likes}${this.currentLang === 'ko' ? '회' : ''}`;
    document.getElementById('run-meta-category').innerText = p.category.toUpperCase();
    document.getElementById('run-meta-author').innerText = trans.author;

    // Like Button state
    const isLiked = this.likedPrograms[p.id];
    const btnLike = document.getElementById('btn-like');
    const iconLike = document.getElementById('icon-like');
    const textLike = document.getElementById('text-like');

    if (isLiked) {
      btnLike.className = "px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 cursor-pointer bg-red-500/20 text-red-400 border border-red-500/30";
      iconLike.classList.add('fill-red-400', 'text-red-400');
      textLike.innerText = t.likeSaved;
    } else {
      btnLike.className = "px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 cursor-pointer bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800";
      iconLike.classList.remove('fill-red-400', 'text-red-400');
      textLike.innerText = t.likeAdd;
    }
  },

  renderStudioTabs() {
    const tabs = ['run', 'code', 'meta'];
    tabs.forEach(t => {
      const btn = document.querySelector(`.studio-tab-btn[data-tab="${t}"]`);
      const content = document.getElementById(`tab-${t}`);
      
      if (t === this.studioActiveTab) {
        btn.className = "studio-tab-btn flex-1 py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer bg-teal-700 text-white shadow-xs";
        content.classList.remove('hidden');
      } else {
        btn.className = "studio-tab-btn flex-1 py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-white/50";
        content.classList.add('hidden');
      }
    });
  },

  render() {
    this.applyLanguage();
    const viewHub = document.getElementById('view-hub');
    const viewStudio = document.getElementById('view-studio');

    if (this.viewMode === 'hub') {
      viewHub.classList.remove('hidden');
      viewStudio.classList.add('hidden');
      this.renderGrid();
    } else {
      viewHub.classList.add('hidden');
      viewStudio.classList.remove('hidden');
      this.renderStudioMeta();
      this.renderStudioTabs();
      setTimeout(() => this.updateIframeScale(), 50);
    }
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
