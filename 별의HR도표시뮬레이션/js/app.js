/**
 * H-R도표 및 별의 진화 시뮬레이터 - 애플리케이션 메인 컨트롤러
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. 모듈 인스턴스 초기화
    const hrRenderer = new HRDiagramRenderer('hrCanvas');
    const evolutionHrRenderer = new HRDiagramRenderer('evolutionHrCanvas');
    const starVisualizer = new StarVisualizer('starVisualCanvas');
    const starScaleVisualizer = new StarScaleVisualizer('scaleCanvas');
    const evolutionEngine = new EvolutionEngine(hrRenderer, starVisualizer, null);

    // 2. DOM 요소 획득
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    const btnInfo = document.getElementById('btn-info');
    const infoModal = document.getElementById('info-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');

    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    const playBtn = document.getElementById('playBtn');
    const resetBtn = document.getElementById('resetBtn');
    const massSlider = document.getElementById('massSlider');
    const massValueBadge = document.getElementById('massValueBadge');
    const speedSelect = document.getElementById('speedSelect');
    const timelineProgress = document.getElementById('timelineProgress');

    const internalViewToggle = document.getElementById('internalViewToggle');
    const scaleZoomSlider = document.getElementById('scaleZoomSlider');
    const scaleZoomVal = document.getElementById('scaleZoomVal');

    const starPresetsGrid = document.getElementById('starPresetsGrid');

    const infoName = document.getElementById('infoName');
    const infoCategory = document.getElementById('infoCategory');
    const infoTemp = document.getElementById('infoTemp');
    const infoLum = document.getElementById('infoLum');
    const infoRadius = document.getElementById('infoRadius');
    const infoCore = document.getElementById('infoCore');
    const infoLifetime = document.getElementById('infoLifetime');
    const infoOutcome = document.getElementById('infoOutcome');
    const stageDescText = document.getElementById('stageDescText');

    // 3. 탭 전환 처리
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            navTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetId = `tab-${tab.getAttribute('data-tab')}`;
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            setTimeout(() => {
                hrRenderer.render();
                evolutionHrRenderer.render();
                starVisualizer.draw();
                starScaleVisualizer.render();
            }, 50);
        });
    });

    // 4. 모달 처리
    if (btnInfo) {
        btnInfo.addEventListener('click', () => {
            infoModal.classList.add('active');
        });
    }

    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', () => {
            infoModal.classList.remove('active');
        });
    }

    if (infoModal) {
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) {
                infoModal.classList.remove('active');
            }
        });
    }

    // 5. 탐구 탭 필터링 & 검색
    if (searchInput) searchInput.addEventListener('input', filterStars);
    if (categoryFilter) categoryFilter.addEventListener('change', filterStars);

    function filterStars() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const cat = categoryFilter ? categoryFilter.value : 'all';

        if (cat === 'none') {
            hrRenderer.setFilteredStars([]);
            return;
        }

        const filtered = HR_DATA.famousStars.filter(star => {
            const matchName = star.name.toLowerCase().includes(query) || star.spectral.toLowerCase().includes(query);
            const matchCat = (cat === 'all') || (star.category.includes(cat));
            return matchName && matchCat;
        });

        hrRenderer.setFilteredStars(filtered);
    }

    const isEn = (localStorage.getItem('sci-lab-lang') === 'en');

    // 6. 시뮬레이션 제어
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (evolutionEngine.isPlaying) {
                evolutionEngine.pause();
                playBtn.innerHTML = isEn ? '<i class="fa-solid fa-play"></i> Start' : '<i class="fa-solid fa-play"></i> 시뮬레이션 시작';
            } else {
                evolutionEngine.play();
                playBtn.innerHTML = isEn ? '<i class="fa-solid fa-pause"></i> Pause' : '<i class="fa-solid fa-pause"></i> 일시정지';
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            evolutionEngine.reset();
            if (playBtn) playBtn.innerHTML = isEn ? '<i class="fa-solid fa-play"></i> Start' : '<i class="fa-solid fa-play"></i> 시뮬레이션 시작';
        });
    }

    if (massSlider) {
        massSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (massValueBadge) massValueBadge.textContent = `${val.toFixed(1)} M☉`;
            evolutionEngine.setMass(val);
        });
    }

    if (timelineProgress) {
        timelineProgress.addEventListener('input', (e) => {
            const p = parseFloat(e.target.value) / 100;
            evolutionEngine.setProgress(p);
        });
    }

    if (speedSelect) {
        speedSelect.addEventListener('change', (e) => {
            evolutionEngine.setSpeed(parseFloat(e.target.value));
        });
    }

    if (internalViewToggle) {
        internalViewToggle.addEventListener('change', (e) => {
            starVisualizer.setInternalView(e.target.checked);
        });
    }

    // 7. 크기 비교 Zoom 조절
    if (scaleZoomSlider) {
        scaleZoomSlider.addEventListener('input', (e) => {
            const z = parseFloat(e.target.value);
            if (scaleZoomVal) scaleZoomVal.textContent = `${z.toFixed(1)}x`;
            starScaleVisualizer.setZoom(z);
        });
    }

    // 8. HR도 별 선택 콜백
    hrRenderer.onStarSelectCallback = (star) => {
        if (infoName) infoName.textContent = star.name;
        if (infoCategory) infoCategory.textContent = `${star.category} (${star.spectral})`;
        if (infoTemp) infoTemp.textContent = `${star.temp.toLocaleString()} K`;
        if (infoLum) infoLum.textContent = `${star.luminosity} L☉`;
        if (infoRadius) infoRadius.textContent = `${star.radius} R☉`;
        if (infoCore) infoCore.textContent = star.spectral;
        if (infoLifetime) infoLifetime.textContent = star.dist;
        if (infoOutcome) infoOutcome.textContent = star.category;
        if (stageDescText) stageDescText.textContent = star.desc;

        starVisualizer.updateState({
            temp: star.temp,
            lum: star.luminosity,
            rRatio: star.radius,
            name: star.name,
            core: star.category,
            effect: null,
            finalState: star.category === '백색왜성' ? 'whiteDwarf' : null,
            mass: star.mass
        });
    };

    // 9. 프리셋 칩 생성 및 바인딩
    if (starPresetsGrid && HR_DATA.famousStars) {
        HR_DATA.famousStars.forEach(star => {
            const chip = document.createElement('div');
            chip.className = 'preset-chip';
            let displayName = star.name.split(' ')[0];
            if (isEn) {
                if (star.name.includes('(')) {
                    displayName = star.name.split('(')[1].replace(')', '').trim();
                } else {
                    displayName = star.name;
                }
            }
            chip.innerHTML = `<strong>${displayName}</strong><br><span style="color:#94a3b8">${star.mass} M☉</span>`;
            chip.addEventListener('click', () => {
                if (massSlider) massSlider.value = star.mass;
                if (massValueBadge) massValueBadge.textContent = `${star.mass} M☉`;
                evolutionEngine.setMass(star.mass);
                hrRenderer.onStarSelectCallback(star);
            });
            starPresetsGrid.appendChild(chip);
        });
    }

    // 10. 진화 엔진 실시간 UI 바인딩
    evolutionEngine.onUpdateCallback = (data) => {
        if (timelineProgress) timelineProgress.value = Math.floor(data.progress * 100);

        if (data.currentPt) {
            let trackNameDisp = data.trackName;
            let ptNameDisp = data.currentPt.name;
            let ptNameClean = ptNameDisp.replace(/^\d+\.\s*/, '');

            if (isEn) {
                if (trackNameDisp.includes('(')) {
                    const match = trackNameDisp.match(/\((.*?)\)/);
                    const massPart = match ? match[1] : '';
                    if (trackNameDisp.includes('저질량')) trackNameDisp = `Low-mass Red Dwarf (${massPart})`;
                    else if (trackNameDisp.includes('태양형')) trackNameDisp = `Sun-like Star (${massPart})`;
                    else if (trackNameDisp.includes('중질량')) trackNameDisp = `Intermediate-mass Star (${massPart})`;
                    else if (trackNameDisp.includes('고질량')) trackNameDisp = `High-mass Supergiant (${massPart})`;
                    else if (trackNameDisp.includes('극대질량')) trackNameDisp = `Hypergiant (${massPart})`;
                }
                ptNameClean = ptNameClean.replace('원시성 (Protostar)', 'Protostar')
                                         .replace('주계열성 (Main Sequence)', 'Main Sequence')
                                         .replace('주계열성 (ZAMS)', 'Main Sequence (ZAMS)')
                                         .replace('준거성 (Subgiant)', 'Subgiant')
                                         .replace('적색거성 (Red Giant)', 'Red Giant')
                                         .replace('수평가지 (Helium Flash)', 'Horizontal Branch')
                                         .replace('점근거성가지 (AGB)', 'Asymptotic Giant Branch')
                                         .replace('행성상 성운 분사', 'Planetary Nebula Ejection')
                                         .replace('탄소-산소 백색왜성', 'Carbon-Oxygen White Dwarf')
                                         .replace('주계열성 (B/A형)', 'B/A Type Main Sequence')
                                         .replace('적색거성/준초거성', 'Red Giant / Red Supergiant')
                                         .replace('청색 고리 (Blue Loop)', 'Blue Loop')
                                         .replace('행성상 성운 방출', 'Planetary Nebula Ejection')
                                         .replace('O-Ne-Mg 백색왜성', 'O-Ne-Mg White Dwarf')
                                         .replace('청색 주계열성', 'Blue Main Sequence')
                                         .replace('청색 초거성', 'Blue Supergiant')
                                         .replace('적색초거성 (양파 껍질 구조)', 'Red Supergiant (Onion Shell)')
                                         .replace('II형 초신성 폭발 (Supernova)', 'Type II Supernova')
                                         .replace('중성자별 / 펄서 (Pulsar)', 'Neutron Star / Pulsar')
                                         .replace('O형 최상위 주계열성', 'O-type Top Main Sequence')
                                         .replace('볼프-레이에 성 (Wolf-Rayet)', 'Wolf-Rayet Star')
                                         .replace('적색 하이퍼거성', 'Red Hypergiant')
                                         .replace('극초신성 폭발 & 감마선 폭발', 'Hypernova & GRB')
                                         .replace('항성 질량 블랙홀 (Black Hole)', 'Stellar Mass Black Hole');
            }

            if (infoName) infoName.textContent = `${trackNameDisp} (${ptNameClean})`;
            if (infoCategory) infoCategory.textContent = ptNameClean;
            if (infoTemp) infoTemp.textContent = `${Math.round(data.currentPt.temp).toLocaleString()} K`;
            if (infoLum) infoLum.textContent = `${data.currentPt.lum >= 1 ? data.currentPt.lum.toFixed(1) : data.currentPt.lum.toFixed(4)} L☉`;
            if (infoRadius) infoRadius.textContent = `${data.currentPt.rRatio.toFixed(2)} R☉`;
            if (infoCore) infoCore.textContent = data.currentPt.core;
            if (infoLifetime) infoLifetime.textContent = data.lifetime;
            if (infoOutcome) infoOutcome.textContent = data.finalOutcome;
            if (stageDescText) stageDescText.textContent = data.currentPt.desc;
        }
    };

    // 초기 상태 설정
    evolutionEngine.setMass(1.0);
});
