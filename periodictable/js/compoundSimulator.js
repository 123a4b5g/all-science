/**
 * Compound Builder & Reaction Simulator
 * Allows users to add elements into a reaction flask and test chemical bond creations
 * High-End Cyber Chemistry Visualizer Design System
 */
class CompoundSimulator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.selectedCounts = {}; // { elementNumber: count }
    this.isPresetCollapsed = false;
    this.initUI();
  }

  initUI() {
    this.container.innerHTML = `
      <div class="compound-sim-layout">
        <!-- Left Side: Element Picker Palette -->
        <div class="element-picker-panel">
          <div class="panel-header-title">
            <h3><i class="fa-solid fa-flask"></i> 원소 선택 팔레트</h3>
            <p class="subtitle">반응 플라스크에 추가할 원소를 클릭하세요</p>
          </div>
          <div class="picker-grid" id="pickerGrid"></div>
        </div>

        <!-- Right Side: Interactive Reaction Flask & Result Chamber -->
        <div class="reaction-chamber-panel">
          <div class="chamber-header">
            <h3><i class="fa-solid fa-vial-circle-check"></i> 반응 플라스크 & 화합물 검증</h3>
            <button id="resetChamberBtn" class="btn btn-secondary"><i class="fa-solid fa-rotate-left"></i> 초기화</button>
          </div>

          <!-- Glass Chemistry Flask Chamber -->
          <div class="flask-display" id="flaskDisplay">
            <div class="empty-flask-msg">
              <i class="fa-solid fa-flask-vial fa-2x"></i>
              <span>왼쪽 팔레트에서 원소를 선택하여 플라스크에 채워보세요.</span>
            </div>
          </div>

          <div class="action-bar">
            <button id="runReactionBtn" class="btn btn-primary-glow" disabled>
              <i class="fa-solid fa-bolt"></i> 화학 반응 실행!
            </button>
          </div>

          <!-- Scrollable Chamber Body (Protects left panel from layout shifting) -->
          <div class="chamber-body-scroll">
            <!-- Reaction Result Card Container -->
            <div class="reaction-result-card" id="reactionResultCard" style="display:none;"></div>

            <!-- Collapsible Presets Guide -->
            <div class="preset-compounds" id="presetCompoundsSection">
              <div class="preset-header" id="presetToggleHeader">
                <h4>
                  <i class="fa-solid fa-bookmark"></i> 대표 화합물 프리셋 가이드 (40종)
                </h4>
                <span class="preset-toggle-badge" id="presetToggleBadge">
                  <i class="fa-solid fa-chevron-up"></i>
                </span>
              </div>
              <div class="preset-chips" id="presetChips"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderPickerGrid();
    this.renderPresetChips();
    this.bindEvents();
  }

  renderPickerGrid() {
    const grid = document.getElementById('pickerGrid');
    if (!grid) return;

    // Elements 1 through 20 continuously + key metals (26 Fe, 29 Cu)
    const commonIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 26, 29];
    const commonElements = ELEMENTS.filter(e => commonIds.includes(e.number));

    grid.innerHTML = commonElements.map(el => `
      <button type="button" class="picker-card" data-id="${el.number}">
        <span class="p-num">${el.number}</span>
        <span class="p-sym">${el.symbol}</span>
        <span class="p-name">${el.nameKr}</span>
      </button>
    `).join('');
  }

  renderPresetChips() {
    const chips = document.getElementById('presetChips');
    if (!chips) return;

    chips.innerHTML = COMPOUNDS.map((c, i) => `
      <button type="button" class="preset-chip" data-index="${i}">
        <span class="chip-formula">${c.formula}</span>
        <span class="chip-name">${c.nameKr}</span>
      </button>
    `).join('');
  }

  bindEvents() {
    const grid = document.getElementById('pickerGrid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const card = e.target.closest('.picker-card');
        if (card) {
          const num = parseInt(card.dataset.id, 10);
          this.addElement(num);
        }
      });
    }

    const resetBtn = document.getElementById('resetChamberBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetChamber());
    }

    const runBtn = document.getElementById('runReactionBtn');
    if (runBtn) {
      runBtn.addEventListener('click', () => this.runReaction());
    }

    const presetChips = document.getElementById('presetChips');
    if (presetChips) {
      presetChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.preset-chip');
        if (chip) {
          const index = parseInt(chip.dataset.index, 10);
          this.loadPreset(index);
        }
      });
    }

    // Toggle Collapsible Preset Section
    const toggleHeader = document.getElementById('presetToggleHeader');
    if (toggleHeader) {
      toggleHeader.addEventListener('click', () => {
        this.togglePresetSection();
      });
    }
  }

  togglePresetSection() {
    const section = document.getElementById('presetCompoundsSection');
    if (!section) return;

    this.isPresetCollapsed = !this.isPresetCollapsed;
    section.classList.toggle('collapsed', this.isPresetCollapsed);
  }

  addElement(num) {
    this.selectedCounts[num] = (this.selectedCounts[num] || 0) + 1;
    this.updateFlaskDisplay();
  }

  removeElement(num) {
    if (this.selectedCounts[num]) {
      this.selectedCounts[num]--;
      if (this.selectedCounts[num] <= 0) {
        delete this.selectedCounts[num];
      }
    }
    this.updateFlaskDisplay();
  }

  resetChamber() {
    this.selectedCounts = {};
    this.updateFlaskDisplay();
    const resultCard = document.getElementById('reactionResultCard');
    if (resultCard) resultCard.style.display = 'none';
  }

  loadPreset(index) {
    const comp = COMPOUNDS[index];
    if (!comp) return;

    this.selectedCounts = { ...comp.elementsRequired };
    this.updateFlaskDisplay();
    this.runReaction();
  }

  updateFlaskDisplay() {
    const flask = document.getElementById('flaskDisplay');
    const runBtn = document.getElementById('runReactionBtn');
    if (!flask) return;

    const keys = Object.keys(this.selectedCounts);
    if (keys.length === 0) {
      flask.innerHTML = `
        <div class="empty-flask-msg">
          <i class="fa-solid fa-flask-vial fa-2x"></i>
          <span>왼쪽 팔레트에서 원소를 선택하여 플라스크에 채워보세요.</span>
        </div>
      `;
      if (runBtn) runBtn.disabled = true;
      return;
    }

    if (runBtn) runBtn.disabled = false;

    flask.innerHTML = keys.map(numStr => {
      const num = parseInt(numStr, 10);
      const el = ELEMENTS.find(e => e.number === num);
      const count = this.selectedCounts[num];
      return `
        <div class="flask-item">
          <div class="f-atom-badge">
            <span class="f-sym">${el.symbol}</span>
            <span class="f-name">${el.nameKr}</span>
          </div>
          <div class="f-count-controls">
            <button class="count-btn" onclick="window.compoundSim.removeElement(${num})">-</button>
            <span class="f-count">${count}</span>
            <button class="count-btn" onclick="window.compoundSim.addElement(${num})">+</button>
          </div>
        </div>
      `;
    }).join('');
  }

  runReaction() {
    const resultCard = document.getElementById('reactionResultCard');
    if (!resultCard) return;

    // Check matching compound
    let matched = null;

    for (let comp of COMPOUNDS) {
      const req = comp.elementsRequired;
      const reqKeys = Object.keys(req);
      const selKeys = Object.keys(this.selectedCounts);

      if (reqKeys.length === selKeys.length) {
        let isMatch = true;
        for (let k of reqKeys) {
          if (this.selectedCounts[k] !== req[k]) {
            isMatch = false;
            break;
          }
        }
        if (isMatch) {
          matched = comp;
          break;
        }
      }
    }

    resultCard.style.display = 'block';

    if (matched) {
      const ratioStr = Object.entries(matched.elementsRequired).map(([numStr, count]) => {
        const el = ELEMENTS.find(e => e.number === parseInt(numStr, 10));
        return `${el.symbol}:${count}`;
      }).join(', ');

      resultCard.className = 'reaction-result-card match-success';
      resultCard.innerHTML = `
        <div class="result-card-inner">
          <div class="result-top-bar">
            <div class="result-title-group">
              <span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> 반응 성공</span>
              <h2 class="compound-title">${matched.nameKr} <span class="formula-highlight">(${matched.formula})</span></h2>
            </div>
            <span class="bond-type-tag"><i class="fa-solid fa-atom"></i> ${matched.type}</span>
          </div>

          <div class="visual-bond-diagram">
            <div class="formula-visual">
              ${Object.entries(matched.elementsRequired).map(([numStr, count]) => {
                const el = ELEMENTS.find(e => e.number === parseInt(numStr, 10));
                return `
                  <div class="atom-bubble">
                    <span class="a-sym">${el.symbol}</span>
                    ${count > 1 ? `<sub>${count}</sub>` : ''}
                    <span class="a-name">${el.nameKr}</span>
                  </div>
                `;
              }).join('<span class="plus-sign">+</span>')}
              <span class="arrow-sign"><i class="fa-solid fa-arrow-right-long"></i></span>
              <div class="molecule-badge" style="background:${matched.color}; box-shadow: 0 0 20px ${matched.color}80;">
                <span class="m-formula">${matched.formula}</span>
                <span class="m-name">${matched.nameKr}</span>
              </div>
            </div>
          </div>

          <div class="result-info-grid">
            <div class="info-pill"><span class="info-lbl">결합 유형</span><span class="info-val">${matched.type}</span></div>
            <div class="info-pill"><span class="info-lbl">반응 비율</span><span class="info-val">${ratioStr}</span></div>
            <div class="info-desc-box"><i class="fa-solid fa-circle-info"></i> ${matched.description}</div>
          </div>
        </div>
      `;
    } else {
      // Unstable or unknown combination
      const formulaAttempt = Object.entries(this.selectedCounts).map(([numStr, count]) => {
        const el = ELEMENTS.find(e => e.number === parseInt(numStr, 10));
        return `${el.symbol}${count > 1 ? `<sub>${count}</sub>` : ''}`;
      }).join('');

      resultCard.className = 'reaction-result-card match-fail';
      resultCard.innerHTML = `
        <div class="result-card-inner">
          <div class="result-top-bar">
            <span class="badge badge-warning"><i class="fa-solid fa-triangle-exclamation"></i> 미확인 / 불안정 상태</span>
          </div>
          <div class="result-body">
            <h3 class="compound-title">시도된 화학 조합: ${formulaAttempt}</h3>
            <p class="compound-desc">현재 선택된 원소 비율로는 화학적으로 안정적인 대표 화합물을 형성하지 않습니다. 하단 프리셋 가이드를 참고하여 알맞은 비율을 맞춰보세요!</p>
          </div>
        </div>
      `;
    }
  }
}
