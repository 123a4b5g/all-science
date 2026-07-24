/**
 * Main Application Script for Periodic Table Simulation
 * Standard IUPAC Grid + Lanthanides & Actinides + Side-by-Side Detail/Bohr Modal with Boundary Navigation Arrows
 */
document.addEventListener('DOMContentLoaded', () => {
  const state = {
    selectedCategory: 'all',
    selectedState: 'all',
    searchQuery: '',
    heatmapMode: 'none',
    selectedElement: ELEMENTS[0],
    currentTab: 'ptable'
  };

  // UI References
  const ptableGrid = document.getElementById('ptableGrid');
  const lanthanidesGrid = document.getElementById('lanthanidesGrid');
  const actinidesGrid = document.getElementById('actinidesGrid');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const stateFilter = document.getElementById('stateFilter');
  const heatmapSelect = document.getElementById('heatmapSelect');
  const heatmapLegend = document.getElementById('heatmapLegend');

  const elementModal = document.getElementById('elementModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalPrevBtn = document.getElementById('modalPrevBtn');
  const modalNextBtn = document.getElementById('modalNextBtn');

  // Atom Visualizer Instance for Modal
  const modalAtomVisualizer = new AtomVisualizer('modalBohrCanvas');

  window.compoundSim = new CompoundSimulator('compoundSimulatorContainer');

  // Render Grid with Headers
  function renderPeriodicTable() {
    if (!ptableGrid) return;

    ptableGrid.innerHTML = '';
    lanthanidesGrid.innerHTML = '';
    actinidesGrid.innerHTML = '';

    // 1. Top-Left Header Marker
    const originHeader = document.createElement('div');
    originHeader.className = 'header-cell origin-header';
    originHeader.style.gridRow = '1';
    originHeader.style.gridColumn = '1';
    originHeader.innerHTML = `<span>Group ➔</span><br><span>Period ⬇</span>`;
    ptableGrid.appendChild(originHeader);

    // 2. Group Number Headers (1 to 18)
    for (let g = 1; g <= 18; g++) {
      const gHeader = document.createElement('div');
      gHeader.className = 'header-cell group-header';
      gHeader.style.gridRow = '1';
      gHeader.style.gridColumn = (g + 1).toString();
      gHeader.textContent = g;
      ptableGrid.appendChild(gHeader);
    }

    // 3. Period Number Headers (1 to 7)
    for (let p = 1; p <= 7; p++) {
      const pHeader = document.createElement('div');
      pHeader.className = 'header-cell period-header';
      pHeader.style.gridRow = (p + 1).toString();
      pHeader.style.gridColumn = '1';
      pHeader.textContent = p;
      ptableGrid.appendChild(pHeader);
    }

    // 4. Lanthanides Sub-Grid Label Cell (* 57-70)
    const lanLabel = document.createElement('div');
    lanLabel.className = 'sub-grid-label-cell';
    lanLabel.style.gridColumn = '1 / span 3';
    lanLabel.innerHTML = `<span>* 란타넘족 (57-70)</span>`;
    lanthanidesGrid.appendChild(lanLabel);

    // 5. Actinides Sub-Grid Label Cell (** 89-102)
    const actLabel = document.createElement('div');
    actLabel.className = 'sub-grid-label-cell';
    actLabel.style.gridColumn = '1 / span 3';
    actLabel.innerHTML = `<span>** 악티늄족 (89-102)</span>`;
    actinidesGrid.appendChild(actLabel);

    // Heatmap Min/Max
    let minVal = Infinity, maxVal = -Infinity;
    if (state.heatmapMode !== 'none') {
      ELEMENTS.forEach(el => {
        const val = getHeatmapVal(el, state.heatmapMode);
        if (val !== null && !isNaN(val)) {
          if (val < minVal) minVal = val;
          if (val > maxVal) maxVal = val;
        }
      });
      renderLegend(minVal, maxVal);
    } else {
      if (heatmapLegend) heatmapLegend.style.display = 'none';
    }

    // Render Elements
    ELEMENTS.forEach(el => {
      const isSubGrid = el.group === null; // 57-70 (La-Yb) & 89-102 (Ac-No)
      const isMatch = checkFilters(el);
      const cell = createElementCell(el, isMatch, minVal, maxVal);

      if (isSubGrid) {
        if (el.number >= 57 && el.number <= 70) {
          const colIndex = (el.number - 57) + 4; // Align starting at Grid Column 4 (Group 3)
          cell.style.gridColumn = colIndex.toString();
          lanthanidesGrid.appendChild(cell);
        } else if (el.number >= 89 && el.number <= 102) {
          const colIndex = (el.number - 89) + 4; // Align starting at Grid Column 4 (Group 3)
          cell.style.gridColumn = colIndex.toString();
          actinidesGrid.appendChild(cell);
        }
      } else {
        cell.style.gridRow = (el.period + 1).toString();
        cell.style.gridColumn = (el.group + 1).toString();
        ptableGrid.appendChild(cell);
      }
    });
  }

  function checkFilters(el) {
    if (state.selectedCategory !== 'all' && el.category !== state.selectedCategory) return false;
    if (state.selectedState !== 'all' && el.state !== state.selectedState) return false;
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const matchSym = el.symbol.toLowerCase().includes(q);
      const matchNameKr = el.nameKr.includes(q);
      const matchNameEn = el.nameEn.toLowerCase().includes(q);
      const matchNum = el.number.toString() === q;
      if (!matchSym && !matchNameKr && !matchNameEn && !matchNum) return false;
    }
    return true;
  }

  function getHeatmapVal(el, mode) {
    switch (mode) {
      case 'mass': return el.weight;
      case 'electronegativity': return el.electronegativity;
      case 'melting': return el.meltingPoint;
      case 'boiling': return el.boilingPoint;
      case 'ionization': return el.ionizationEnergy;
      case 'radius': return el.atomicRadius;
      case 'density': return el.density;
      default: return null;
    }
  }

  function createElementCell(el, isMatch, minVal, maxVal) {
    const cell = document.createElement('div');
    cell.className = `element-cell category-${el.category} ${isMatch ? '' : 'dimmed'}`;
    cell.dataset.id = el.number;

    let heatmapColor = null;
    let displayVal = el.weight;

    if (state.heatmapMode !== 'none') {
      const val = getHeatmapVal(el, state.heatmapMode);
      if (val !== null && !isNaN(val) && maxVal > minVal) {
        const ratio = (val - minVal) / (maxVal - minVal);
        const hue = (1 - ratio) * 240;
        heatmapColor = `hsl(${hue}, 85%, 45%)`;
        displayVal = typeof val === 'number' ? (val % 1 !== 0 ? val.toFixed(1) : val) : val;
      } else {
        displayVal = '-';
      }
    }

    if (heatmapColor) {
      cell.style.background = heatmapColor;
      cell.style.borderColor = 'rgba(255,255,255,0.4)';
    }

    const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
    const elName = isEn ? el.nameEn : el.nameKr;

    cell.innerHTML = `
      <div class="cell-top-bar">
        <span class="el-num">${el.number}</span>
      </div>
      <div class="el-sym">${el.symbol}</div>
      <div class="el-name" title="${elName}">${elName}</div>
      <div class="el-weight">${displayVal}</div>
    `;

    cell.addEventListener('click', () => {
      state.selectedElement = el;
      openElementModal(el);
    });

    return cell;
  }

  function renderLegend(minVal, maxVal) {
    if (!heatmapLegend) return;
    heatmapLegend.style.display = 'flex';
    const minSpan = document.getElementById('legendMin');
    const maxSpan = document.getElementById('legendMax');
    const titleSpan = document.getElementById('legendTitle');

    const titles = {
      mass: '원자량 (u)',
      electronegativity: '전기음성도 (Pauling)',
      melting: '녹는점 (°C)',
      boiling: '끓는점 (°C)',
      ionization: '이온화 에너지 (kJ/mol)',
      radius: '원자 반지름 (pm)',
      density: '밀도 (g/cm³)'
    };

    if (titleSpan) titleSpan.textContent = titles[state.heatmapMode] || '';
    if (minSpan) minSpan.textContent = minVal !== Infinity ? minVal : '';
    if (maxSpan) maxSpan.textContent = maxVal !== -Infinity ? maxVal : '';
  }

  function openElementModal(el) {
    state.selectedElement = el;

    const idx = ELEMENTS.findIndex(e => e.number === el.number);

    // 1st Element (H 1): Hide Prev Arrow | Last Element (Og 118): Hide Next Arrow
    if (modalPrevBtn) {
      modalPrevBtn.style.display = (idx === 0 || el.number === 1) ? 'none' : 'flex';
    }
    if (modalNextBtn) {
      modalNextBtn.style.display = (idx === ELEMENTS.length - 1 || el.number === 118) ? 'none' : 'flex';
    }

    const isEn = (localStorage.getItem('sci-lab-lang') === 'en');

    // Right Side Property Info
    document.getElementById('modalNum').textContent = el.number;
    document.getElementById('modalSym').textContent = el.symbol;
    document.getElementById('modalNameKr').textContent = isEn ? el.nameEn : el.nameKr;
    document.getElementById('modalCategory').textContent = isEn ? (el.categoryEn || el.categoryKr) : el.categoryKr;
    document.getElementById('modalState').textContent = isEn ? (el.stateEn || el.stateKr) : el.stateKr;
    document.getElementById('modalWeight').textContent = el.weight + ' u';
    document.getElementById('modalElectronConfig').textContent = el.electronConfig;
    document.getElementById('modalEN').textContent = el.electronegativity !== null ? el.electronegativity : 'N/A';
    document.getElementById('modalMP').textContent = el.meltingPoint !== null ? el.meltingPoint + ' °C' : 'N/A';
    document.getElementById('modalBP').textContent = el.boilingPoint !== null ? el.boilingPoint + ' °C' : 'N/A';
    document.getElementById('modalDensity').textContent = el.density !== null ? el.density + ' g/cm³' : 'N/A';
    document.getElementById('modalIonization').textContent = el.ionizationEnergy !== null ? el.ionizationEnergy + ' kJ/mol' : 'N/A';
    document.getElementById('modalRadius').textContent = el.atomicRadius !== null ? el.atomicRadius + ' pm' : 'N/A';

    const heroBox = document.getElementById('modalHeroBox');
    if (heroBox) {
      heroBox.className = `hero-sym-box category-${el.category}`;
    }

    // Left Side Live Atom Visualizer
    modalAtomVisualizer.setElement(el);

    if (elementModal) elementModal.classList.add('active');

    requestAnimationFrame(() => {
      setTimeout(() => {
        modalAtomVisualizer.resizeCanvas();
        modalAtomVisualizer.startAnimation();
      }, 30);
    });
  }

  function closeModal() {
    if (elementModal) elementModal.classList.remove('active');
    modalAtomVisualizer.stopAnimation();
  }

  function navigateModalElement(direction) {
    if (!state.selectedElement) return;
    let idx = ELEMENTS.findIndex(e => e.number === state.selectedElement.number);
    if (idx === -1) idx = 0;
    if (direction === 'prev') {
      if (idx > 0) {
        openElementModal(ELEMENTS[idx - 1]);
      }
    } else if (direction === 'next') {
      if (idx < ELEMENTS.length - 1) {
        openElementModal(ELEMENTS[idx + 1]);
      }
    }
  }

  // Event Listeners for Filters & Modal Navigation
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderPeriodicTable();
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      state.selectedCategory = e.target.value;
      renderPeriodicTable();
    });
  }

  if (stateFilter) {
    stateFilter.addEventListener('change', (e) => {
      state.selectedState = e.target.value;
      renderPeriodicTable();
    });
  }

  if (heatmapSelect) {
    heatmapSelect.addEventListener('change', (e) => {
      state.heatmapMode = e.target.value;
      renderPeriodicTable();
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalPrevBtn) {
    modalPrevBtn.addEventListener('click', () => navigateModalElement('prev'));
  }

  if (modalNextBtn) {
    modalNextBtn.addEventListener('click', () => navigateModalElement('next'));
  }

  if (elementModal) {
    elementModal.addEventListener('click', (e) => {
      if (e.target === elementModal) closeModal();
    });
  }

  // Keyboard navigation when modal is open (Left/Right Arrow keys)
  window.addEventListener('keydown', (e) => {
    if (elementModal && elementModal.classList.contains('active')) {
      if (e.key === 'ArrowLeft') {
        navigateModalElement('prev');
      } else if (e.key === 'ArrowRight') {
        navigateModalElement('next');
      } else if (e.key === 'Escape') {
        closeModal();
      }
    }
  });

  // Navigation Tab Switching
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  function switchTab(tabId) {
    state.currentTab = tabId;
    navTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });
    tabContents.forEach(c => {
      c.classList.toggle('active', c.id === `tab-${tabId}`);
    });

    if (tabId === 'compound' && window.compoundSim) {
      window.compoundSim.renderPickerGrid();
      window.compoundSim.updateFlaskDisplay();
    }
  }

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Initial Render
  renderPeriodicTable();
});
