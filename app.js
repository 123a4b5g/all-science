const DEFAULT_TEMPLATES = [
  {
    name: '역학 및 운동 법칙 시뮬레이션',
    author: 'All Science 물리 랩',
    description: '힘과 가속도(F=ma) 및 운동량 보존과 충돌을 다루는 인터랙티브 물리 시뮬레이션입니다. 질량, 힘, 마찰계수를 조절하며 물체의 운동을 관찰하거나 충돌 실험을 할 수 있습니다.',
    category: 'physics',
    imageStyle: 'physics_thumbnail.png',
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
    views: 9420,
    likes: 380,
    url: './wave/index.html',
    code: '<!-- 외부 URL로 연결된 시뮬레이션입니다. -->\n<!-- ./wave/index.html -->'
  }
];

const app = {
  programs: [],
  likedPrograms: {},
  viewMode: 'hub',
  selectedId: '',
  studioActiveTab: 'run',
  searchQuery: '',
  sandboxKey: 0,
 
  init() {
    this.loadData();
    this.bindEvents();
    this.render();
    lucide.createIcons();
    window.addEventListener('resize', () => this.updateIframeScale());
  },
 
  loadData() {
    try {
      const saved = localStorage.getItem('sci-lab-custom-programs-v5');
      let loadedPrograms = [];
      if (saved) {
        loadedPrograms = JSON.parse(saved).filter(p => p.url !== './physics.html' && p.url !== './wave.html');
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
    const filtered = this.programs.filter(prog => 
      prog.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
      (prog.description || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      prog.author.toLowerCase().includes(this.searchQuery.toLowerCase())
    );


    if (this.programs.length === 0) {
      grid.innerHTML = `
        <div class="bg-slate-50 border border-dashed border-slate-200/80 rounded-3xl p-16 text-center flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto my-4 shadow-xs">
          <div class="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-3xl shadow-sm">🔬</div>
          <h4 class="font-black text-slate-800 text-sm">가상 실험실이 비어 있습니다</h4>
          <p class="text-xs text-slate-500 max-w-sm leading-relaxed font-semibold">학술 플래너, 타이머, 계산기 등 모든 프리셋 템플릿과 시뮬레이션이 성공적으로 삭제되었습니다.</p>
        </div>
      `;
    } else if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <span class="text-3xl">🔍</span>
          <h4 class="font-bold text-slate-700 text-xs">일치하는 템플릿이 없습니다.</h4>
          <p class="text-[11px] text-slate-400">다른 검색어 또는 필터를 변경해 보세요.</p>
          <button onclick="app.searchQuery=''; document.getElementById('header-search-input').value=''; document.getElementById('hero-search-input').value=''; app.renderGrid();" class="mt-2 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded text-[11px] font-bold">필터 초기화</button>
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
                  <span class="text-[10px] text-white font-extrabold tracking-widest bg-slate-900/80 px-2.5 py-1 rounded-full shadow-lg backdrop-blur-xs">시뮬레이션 실행하기</span>
                </div>
              </div>
              <div class="px-4 pb-4 pt-1 flex gap-3 relative">
                <div class="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 font-bold text-slate-700 text-xs font-mono shadow-xs mt-1">
                  ${prog.author.charAt(0).toUpperCase()}
                </div>
                <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                  <h4 class="font-extrabold text-slate-900 text-xs group-hover:text-teal-700 transition-colors truncate leading-tight">${prog.name}</h4>
                  <p class="text-[11px] text-slate-500 font-semibold truncate flex items-center gap-1"><span>${prog.author}</span></p>
                  <p class="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                    <span>2일 전 업데이트</span>
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

    // Header & Canvas text
    document.getElementById('studio-title').innerText = p.name;
    document.getElementById('studio-category').innerText = `${p.category.toUpperCase()} WORKSPACE`;
    document.getElementById('sandbox-title').innerText = p.name;
    document.getElementById('sandbox-author').innerText = `Author Channel: ${p.author}`;
    document.getElementById('sandbox-desc').innerText = p.description || '별도 기술된 원리가 없습니다. 왼쪽 설정 탭을 사용하여 이 시뮬레이션의 가치를 설명해 보세요.';

    // Meta tab values
    document.getElementById('meta-input-name').value = p.name;
    document.getElementById('meta-input-author').value = p.author;
    document.getElementById('meta-input-desc').value = p.description || '';
    document.getElementById('meta-input-style').value = p.imageStyle || 'coding';
    document.getElementById('code-editor').value = p.code;

    // Run tab values
    document.getElementById('run-desc-container').style.display = p.description ? 'flex' : 'none';
    document.getElementById('run-desc-text').innerText = p.description || '';
    document.getElementById('run-meta-likes').innerText = `${p.likes}회`;
    document.getElementById('run-meta-category').innerText = p.category.toUpperCase();
    document.getElementById('run-meta-author').innerText = p.author;

    // Like Button state
    const isLiked = this.likedPrograms[p.id];
    const btnLike = document.getElementById('btn-like');
    const iconLike = document.getElementById('icon-like');
    const textLike = document.getElementById('text-like');

    if (isLiked) {
      btnLike.className = "px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 cursor-pointer bg-red-500/20 text-red-400 border border-red-500/30";
      iconLike.classList.add('fill-red-400', 'text-red-400');
      textLike.innerText = "즐겨찾기 보존중";
    } else {
      btnLike.className = "px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 cursor-pointer bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800";
      iconLike.classList.remove('fill-red-400', 'text-red-400');
      textLike.innerText = "즐겨찾기 추가";
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
