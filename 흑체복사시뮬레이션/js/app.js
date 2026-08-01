/* ==========================================================================
   별과 흑체 복사 시뮬레이션 - 메인 애플리케이션 컨트롤러
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. 시뮬레이션 엔진 인스턴스 생성
    const planckSim = new PlanckCurveSim();
    const lumSim = new LuminositySim();
    const compSim = new StarComparisonSim();

    // 초기 UI 동기화
    planckSim.updateUI();
    lumSim.updateUI();
    compSim.updateUI();
    compSim.render();

    // 2. 네비게이션 탭 전환 처리
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetElem = document.getElementById(targetTab);
            if (targetElem) {
                targetElem.classList.add('active');
            }

            if (window.soundController) window.soundController.playTabSound();

            // 탭 전환 시 캔버스 리사이즈 & 재렌더링
            setTimeout(() => {
                if (targetTab === 'tab-planck') planckSim.resize();
                else if (targetTab === 'tab-luminosity') lumSim.resize();
                else if (targetTab === 'tab-comparison') {
                    compSim.resize();
                    compSim.render();
                }
            }, 50);
        });
    });

    // 3. TAB 1: 플랑크 곡선 & 별의 색상 컨트롤러
    const tempSlider = document.getElementById('tempSlider');
    const tempValueBadge = document.getElementById('tempValueBadge');
    const presetBtns = document.querySelectorAll('.preset-btn');

    if (tempSlider) {
        tempSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            if (tempValueBadge) tempValueBadge.innerText = `${val.toLocaleString()} K`;
            planckSim.setTemperature(val);

            // 온도 변화 피드백 사운드
            if (window.soundController) window.soundController.playTempSound(val);

            presetBtns.forEach(b => b.classList.remove('active'));
        });
    }

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const temp = parseInt(btn.getAttribute('data-temp'), 10);
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (tempSlider) tempSlider.value = temp;
            if (tempValueBadge) tempValueBadge.innerText = `${temp.toLocaleString()} K`;

            planckSim.setTemperature(temp);
            if (window.soundController) window.soundController.playClick();
        });
    });

    // 4. TAB 2: 광도 & 슈테판-볼츠만 법칙 컨트롤러
    const radiusSlider = document.getElementById('radiusSlider');
    const lumTempSlider = document.getElementById('lumTempSlider');

    if (radiusSlider) {
        radiusSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            const relRadius = Math.pow(10, val);
            lumSim.setRadius(relRadius);

            if (window.soundController) window.soundController.playRadiusSound(relRadius);
        });
    }

    if (lumTempSlider) {
        lumTempSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            lumSim.setTemperature(val);

            if (window.soundController) window.soundController.playTempSound(val);
        });
    }

    // 5. TAB 3: 유명 항성 2체 비교 컨트롤러
    const selectStarA = document.getElementById('selectStarA');
    const selectStarB = document.getElementById('selectStarB');

    if (selectStarA) {
        selectStarA.addEventListener('change', (e) => {
            compSim.setStarA(e.target.value);
            if (window.soundController) window.soundController.playClick();
        });
    }

    if (selectStarB) {
        selectStarB.addEventListener('change', (e) => {
            compSim.setStarB(e.target.value);
            if (window.soundController) window.soundController.playClick();
        });
    }

    // 6. 헤더 기능 (원리 모달)
    const btnInfo = document.getElementById('btn-info');
    const infoModal = document.getElementById('infoModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalConfirmBtn = document.getElementById('modalConfirmBtn');

    const openModal = () => {
        if (infoModal) infoModal.classList.add('active');
        if (window.soundController) window.soundController.playClick();
    };

    const closeModal = () => {
        if (infoModal) infoModal.classList.remove('active');
        if (window.soundController) window.soundController.playClick();
    };

    if (btnInfo) btnInfo.addEventListener('click', openModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', closeModal);

    if (infoModal) {
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) closeModal();
        });
    }
});
