// 볼록렌즈와 오목렌즈 시뮬레이션 핵심 로직
const canvas = document.getElementById('opticsCanvas');
const ctx = canvas.getContext('2d');

// 스크린 패널 오버레이 요소
const screenCanvas = document.getElementById('screenCanvas');
const screenCtx = screenCanvas.getContext('2d');
const screenViewOverlay = document.getElementById('screenViewOverlay');
const screenBlurInfo = document.getElementById('screenBlurInfo');
const screenViewHeader = document.getElementById('screenViewHeader');
const screenViewTitle = document.getElementById('screenViewTitle');

// 슬라이더 및 엘리먼트 참조
const focalSlider = document.getElementById('focalSlider');
const focalVal = document.getElementById('focalVal');
const objPosSlider = document.getElementById('objPosSlider');
const objPosVal = document.getElementById('objPosVal');
const objHeightSlider = document.getElementById('objHeightSlider');
const objHeightVal = document.getElementById('objHeightVal');

const checkGrid = document.getElementById('check-grid');
const checkValues = document.getElementById('check-values');
const btnToggleObservation = document.getElementById('btn-toggle-observation');
const btnCloseObservation = document.getElementById('btn-close-observation');

// 카드 엘리먼트들 (모드에 따라 표시 여부 조절)
const cardRailConfig = document.getElementById('card-rail-config');
const cardOpticsControls = document.getElementById('card-optics-controls');
const infoOpticsBody = document.getElementById('info-optics-body');
const infoRailBody = document.getElementById('info-rail-body');
const opticsToggleGroup = document.getElementById('optics-toggle-group');
const btnTogglePanel = document.getElementById('btn-toggle-panel');
const controlPanel = document.querySelector('.control-panel');

// 슬라이더 라벨
const labelSlider1 = document.getElementById('label-slider-1');
const labelSlider2 = document.getElementById('label-slider-2');
const labelSlider3 = document.getElementById('label-slider-3');
const controlsTitle = document.getElementById('controls-title');

// 정보창 엘리먼트 참조
const infoA = document.getElementById('info-a');
const infoB = document.getElementById('info-b');
const infoM = document.getElementById('info-m');
const infoState = document.getElementById('info-state');
const formulaText = document.getElementById('formulaText');

// 레일 모드 정보창 엘리먼트
const infoLens1Pos = document.getElementById('info-lens1-pos');
const infoLens2Pos = document.getElementById('info-lens2-pos');
const infoScreenPos = document.getElementById('info-screen-pos');
const infoFocalPlane = document.getElementById('info-focal-plane');
const infoRailM = document.getElementById('info-rail-m');

// 모달 엘리먼트
const theoryModal = document.getElementById('theoryModal');
const btnTheory = document.getElementById('btn-theory');
const closeModal = document.getElementById('closeModal');

// 시뮬레이션 상태 변수
let lensType = 'convex'; // 'convex' | 'concave' | 'rail'
let rayMode = 'primary'; // 'primary' | 'laser'

// 기본 모드 치수 상태 (단위: 픽셀)
let f = 120;       // 초점 거리
let doVal = 240;   // 물체 거리 (a)
let ho = 80;       // 물체 높이
let di = 240;      // 상 거리 (b)
let hi = -80;      // 상 높이
let m = -1;        // 배율

// 레일 모드 치수 상태 (단위: 픽셀, 레일은 왼쪽 0부터 오른쪽 800까지 스케일)
let railObjectPos = 80;      // 고정 광원/물체 위치
let railLens1Pos = 240;      // 1번 렌즈 (볼록렌즈) 위치
let railLens2Pos = 380;      // 2번 렌즈 (오목렌즈) 위치
let railScreenPos = 520;     // 스크린(패널) 위치
let railLens1Active = true;  // 1번 렌즈 사용 여부
let railLens2Active = true;  // 2번 렌즈 사용 여부
let railLetter = 'F';        // 투영할 문자 ('F', 'P', 'R', 'A')

const f1_rail = 110;          // 1번 볼록렌즈 초점 거리 (고정값)
const f2_rail_base = 90;      // 2번 오목렌즈 초점 거리 절대값 (고정값)

// 인터랙션 제어 변수
let isDraggingObject = false;
let isDraggingFocal = false;

let isDraggingRailLens1 = false;
let isDraggingRailLens2 = false;
let isDraggingRailScreen = false;

let activeDragHandle = ''; // 드래그 상태 태그

// 화면 크기 결정
let centerX = 0;
let centerY = 0;

// 화면 드래그/드로잉 스케일 변수 및 헬퍼
let drawScaleX = 1;

function getDrawScale() {
  const rect = canvas.getBoundingClientRect();
  return rect.width < 960 ? rect.width / 960 : 1;
}

function toRailScreenX(xLogical) {
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const padding = 40;
  return padding + (xLogical / 800) * (w - 2 * padding);
}

function toRailLogicalX(xScreen) {
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const padding = 40;
  return ((xScreen - padding) / (w - 2 * padding)) * 800;
}

// 애니메이션 입자 효과용 시간 변수
let animTime = 0;

// 초기화 함수
function init() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // 슬라이더 이벤트 바인딩
  const onFocalChange = (e) => {
    if (lensType === 'rail') {
      railLens1Pos = parseFloat(e.target.value);
      focalVal.textContent = railLens1Pos + 'px';
      if (railLens2Active && railLens1Pos >= railLens2Pos - 30) {
        railLens1Pos = railLens2Pos - 30;
        focalSlider.value = railLens1Pos;
        focalVal.textContent = Math.round(railLens1Pos) + 'px';
      }
    } else {
      f = parseFloat(e.target.value);
      focalVal.textContent = f + 'px';
    }
    calculateOptics();
    draw();
  };
  focalSlider.addEventListener('input', onFocalChange);
  focalSlider.addEventListener('change', onFocalChange);

  const onObjPosChange = (e) => {
    if (lensType === 'rail') {
      railLens2Pos = parseFloat(e.target.value);
      objPosVal.textContent = railLens2Pos + 'px';
      if (railLens2Pos <= railLens1Pos + 30) {
        railLens2Pos = railLens1Pos + 30;
      }
      if (railLens2Pos >= railScreenPos - 30) {
        railLens2Pos = railScreenPos - 30;
      }
      objPosSlider.value = railLens2Pos;
      objPosVal.textContent = Math.round(railLens2Pos) + 'px';
    } else {
      doVal = parseFloat(e.target.value);
      objPosVal.textContent = doVal + 'px';
    }
    calculateOptics();
    draw();
  };
  objPosSlider.addEventListener('input', onObjPosChange);
  objPosSlider.addEventListener('change', onObjPosChange);

  const onObjHeightChange = (e) => {
    if (lensType === 'rail') {
      railScreenPos = parseFloat(e.target.value);
      objHeightVal.textContent = railScreenPos + 'px';
      const minLimit = railLens2Active ? railLens2Pos + 30 : (railLens1Active ? railLens1Pos + 30 : 110);
      if (railScreenPos <= minLimit) {
        railScreenPos = minLimit;
        objHeightSlider.value = railScreenPos;
        objHeightVal.textContent = Math.round(railScreenPos) + 'px';
      }
    } else {
      ho = parseFloat(e.target.value);
      objHeightVal.textContent = ho + 'px';
    }
    calculateOptics();
    draw();
  };
  objHeightSlider.addEventListener('input', onObjHeightChange);
  objHeightSlider.addEventListener('change', onObjHeightChange);

  // 체크박스 토글
  checkGrid.addEventListener('change', draw);
  checkValues.addEventListener('change', draw);

  if (btnToggleObservation) {
    btnToggleObservation.addEventListener('click', () => {
      screenViewOverlay.style.display = 'flex';
      btnToggleObservation.style.display = 'none';
      draw();
    });
  }

  if (btnCloseObservation) {
    btnCloseObservation.addEventListener('click', () => {
      screenViewOverlay.style.display = 'none';
      if (btnToggleObservation) {
        btnToggleObservation.style.display = 'flex';
      }
      draw();
    });
  }

  // 마우스/터치 인터랙션 설정
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseleave', onMouseUp);

  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onMouseUp);

  // 모달 제어
  btnTheory.addEventListener('click', () => theoryModal.classList.remove('hidden'));
  closeModal.addEventListener('click', () => theoryModal.classList.add('hidden'));
  theoryModal.addEventListener('click', (e) => {
    if (e.target === theoryModal) theoryModal.classList.add('hidden');
  });

  screenCanvas.width = 140;
  screenCanvas.height = 140;

  resetControls();
  animate();
}

// 화면 해상도 보정 및 크기 결정
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  centerX = rect.width / 2;
  centerY = rect.height / 2;
  drawScaleX = getDrawScale();
  draw();
}

// 렌즈 및 레일 모드 종류 전환
function setLensType(type) {
  lensType = type;
  document.getElementById('btn-convex').classList.toggle('active', type === 'convex');
  document.getElementById('btn-concave').classList.toggle('active', type === 'concave');
  document.getElementById('btn-rail').classList.toggle('active', type === 'rail');
  
  if (type === 'rail') {
    cardRailConfig.classList.remove('hidden');
    document.getElementById('rail-lens-controls').style.display = 'block';
    infoOpticsBody.classList.add('hidden');
    infoRailBody.classList.remove('hidden');
    opticsToggleGroup.classList.add('hidden');
    screenViewTitle.textContent = "스크린에 투영된 이미지 (패널 관측)";

    controlsTitle.textContent = "제어 패널";
    labelSlider1.textContent = "1번 렌즈(볼록) 위치:";
    labelSlider2.textContent = "2번 렌즈(오목) 위치:";
    labelSlider3.textContent = "스크린 패널 위치:";

    focalSlider.min = 100;
    focalSlider.max = 350;
    focalSlider.value = railLens1Pos;
    focalVal.textContent = Math.round(railLens1Pos) + 'px';

    objPosSlider.min = 120;
    objPosSlider.max = 480;
    objPosSlider.value = railLens2Pos;
    objPosVal.textContent = Math.round(railLens2Pos) + 'px';

    objHeightSlider.min = 150;
    objHeightSlider.max = 620;
    objHeightSlider.value = railScreenPos;
    objHeightVal.textContent = Math.round(railScreenPos) + 'px';

    setRailLens1Active(railLens1Active);
    setRailLens2Active(railLens2Active);
  } else {
    cardRailConfig.classList.remove('hidden');
    document.getElementById('rail-lens-controls').style.display = 'none';
    infoOpticsBody.classList.remove('hidden');
    infoRailBody.classList.add('hidden');
    opticsToggleGroup.classList.remove('hidden');
    screenViewTitle.textContent = "렌즈를 통해 보이는 모습";

    controlsTitle.textContent = "제어 패널";
    labelSlider1.textContent = "초점 거리 (f):";
    labelSlider2.textContent = "물체 위치 (a / d₀):";
    labelSlider3.textContent = "물체 높이 (h₀):";

    focalSlider.min = 50;
    focalSlider.max = 200;
    focalSlider.value = f;
    focalVal.textContent = Math.round(f) + 'px';

    objPosSlider.min = 10;
    objPosSlider.max = 450;
    objPosSlider.value = doVal;
    objPosVal.textContent = Math.round(doVal) + 'px';

    objHeightSlider.min = -150;
    objHeightSlider.max = 150;
    objHeightSlider.value = ho;
    objHeightVal.textContent = Math.round(ho) + 'px';
  }

  calculateOptics();
  draw();
}

// 1번 볼록렌즈 활성/비활성 설정
function setRailLens1Active(active) {
  railLens1Active = active;
  document.getElementById('btn-lens1-on').classList.toggle('active', active);
  document.getElementById('btn-lens1-off').classList.toggle('active', !active);
  
  focalSlider.disabled = !active;
  document.getElementById('focal-control-group').style.opacity = active ? '1' : '0.4';
  
  calculateOptics();
  draw();
}

// 2번 오목렌즈 활성/비활성 설정
function setRailLens2Active(active) {
  railLens2Active = active;
  document.getElementById('btn-lens2-on').classList.toggle('active', active);
  document.getElementById('btn-lens2-off').classList.toggle('active', !active);
  
  objPosSlider.disabled = !active;
  document.getElementById('object-pos-control-group').style.opacity = active ? '1' : '0.4';
  
  calculateOptics();
  draw();
}

// 레일 실험 문자 선택
function setRailLetter(letter) {
  railLetter = letter;
  const letters = ['F', 'P', 'R', 'A'];
  letters.forEach(letVar => {
    document.getElementById(`btn-letter-${letVar}`).classList.toggle('active', letVar === letter);
  });
  draw();
}

// 광선 모드 전환
function setRayMode(mode) {
  rayMode = mode;
  document.getElementById('btn-ray-primary').classList.toggle('active', mode === 'primary');
  document.getElementById('btn-ray-laser').classList.toggle('active', mode === 'laser');
  draw();
}

// 슬라이더 값 동기화
function updateSliders() {
  if (lensType === 'rail') {
    focalSlider.value = railLens1Pos;
    focalVal.textContent = Math.round(railLens1Pos) + 'px';
    objPosSlider.value = railLens2Pos;
    objPosVal.textContent = Math.round(railLens2Pos) + 'px';
    objHeightSlider.value = railScreenPos;
    objHeightVal.textContent = Math.round(railScreenPos) + 'px';
  } else {
    focalSlider.value = f;
    focalVal.textContent = Math.round(f) + 'px';
    objPosSlider.value = doVal;
    objPosVal.textContent = Math.round(doVal) + 'px';
    objHeightSlider.value = ho;
    objHeightVal.textContent = Math.round(ho) + 'px';
  }
}

// 광학 계산식
function calculateOptics() {
  if (lensType === 'rail') {
    const x0 = railObjectPos;
    const h0 = 45;
    
    // Stage 1 (1번 볼록렌즈)
    let x_img1 = x0;
    let h1 = h0;
    let m1 = 1;
    let x1 = railLens1Pos;

    if (railLens1Active) {
      const a1 = x1 - x0;
      let b1 = (a1 * f1_rail) / (a1 - f1_rail);
      m1 = -b1 / a1;
      h1 = m1 * h0;
      x_img1 = x1 + b1;
    }

    // Stage 2 (2번 오목렌즈)
    let finalFocalX = x_img1;
    if (railLens2Active) {
      const x2 = railLens2Pos;
      const a2 = x2 - x_img1;
      let b2 = 0;
      let m2 = 1;
      const f2_actual = -f2_rail_base;

      if (Math.abs(a2 - f2_actual) < 0.1) {
        b2 = Infinity;
        m2 = Infinity;
      } else {
        b2 = (a2 * f2_actual) / (a2 - f2_actual);
        m2 = -b2 / a2;
      }

      finalFocalX = x2 + b2;
      m = m1 * m2;
      hi = m * h0;
    } else {
      m = m1;
      hi = h1;
      finalFocalX = x_img1;
    }

    infoLens1Pos.textContent = railLens1Active ? `${Math.round(x1)} px` : '미사용';
    infoLens2Pos.textContent = railLens2Active ? `${Math.round(railLens2Pos)} px` : '미사용';
    infoScreenPos.textContent = `${Math.round(railScreenPos)} px`;
    infoFocalPlane.textContent = isFinite(finalFocalX) ? `${Math.round(finalFocalX)} px` : '평행 발산';
    infoRailM.textContent = isFinite(m) ? `${m.toFixed(2)} 배 (${m < 0 ? '도립' : '정립'})` : 'N/A';
  } else {
    if (lensType === 'convex') {
      if (Math.abs(doVal - f) < 1) {
        di = Infinity;
        hi = Infinity;
        m = Infinity;
      } else {
        di = (doVal * f) / (doVal - f);
        m = -di / doVal;
        hi = m * ho;
      }
    } else {
      di = -(doVal * f) / (doVal + f);
      m = -di / doVal;
      hi = m * ho;
    }
    updateInfoPanel();
  }
}

// 실시간 수치 UI 업데이트 (기본 모드 전용)
function updateInfoPanel() {
  const scale = 0.5;
  const aCm = (doVal * scale).toFixed(1);
  
  infoA.textContent = `${aCm} cm`;
  
  if (lensType === 'convex') {
    formulaText.innerHTML = `1/a + 1/b = 1/f`;
    if (di === Infinity) {
      infoB.textContent = '∞ (상 없음)';
      infoM.textContent = 'N/A';
      infoState.textContent = '수평 평행선';
      infoState.className = 'highlight badge';
    } else {
      const bCm = (di * scale).toFixed(1);
      infoB.textContent = `${bCm} cm`;
      infoM.textContent = `${Math.abs(m).toFixed(2)} 배`;
      
      if (di > 0) {
        infoState.textContent = '도립 실상';
        infoState.className = 'highlight badge real';
      } else {
        infoState.textContent = '정립 허상';
        infoState.className = 'highlight badge virtual';
      }
    }
  } else {
    formulaText.innerHTML = `1/a + 1/b = -1/f`;
    const bCm = (di * scale).toFixed(1);
    infoB.textContent = `${bCm} cm`;
    infoM.textContent = `${Math.abs(m).toFixed(2)} 배`;
    infoState.textContent = '정립 허상';
    infoState.className = 'highlight badge virtual';
  }
}

// 컨트롤 초기화
function resetControls() {
  if (lensType === 'rail') {
    railLens1Pos = 240;
    railLens2Pos = 380;
    railScreenPos = 520;
    railLens1Active = true;
    railLens2Active = true;
    railLetter = 'F';
    setRailLens1Active(true);
    setRailLens2Active(true);
    setRailLetter('F');
  } else {
    lensType = 'convex';
    rayMode = 'primary';
    f = 120;
    doVal = 240;
    ho = 80;

    document.getElementById('btn-convex').classList.add('active');
    document.getElementById('btn-concave').classList.remove('active');
    document.getElementById('btn-rail').classList.remove('active');
    document.getElementById('btn-ray-primary').classList.add('active');
    document.getElementById('btn-ray-laser').classList.remove('active');
    setRailLetter('F');
  }

  if (btnToggleObservation) {
    btnToggleObservation.style.display = 'none';
  }
  screenViewOverlay.style.display = 'flex';

  updateSliders();
  calculateOptics();
  draw();
}

// 마우스 다운 이벤트 (드래그 감지)
function onMouseDown(e) {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  
  if (lensType === 'rail') {
    const s = drawScaleX;
    const rx = (logicalX) => centerX + (logicalX - 400) * s;
    const distToLens1 = railLens1Active ? Math.abs(clickX - rx(railLens1Pos)) : Infinity;
    const distToLens2 = railLens2Active ? Math.abs(clickX - rx(railLens2Pos)) : Infinity;
    const distToScreen = Math.abs(clickX - rx(railScreenPos));

    const hitTolerance = Math.max(25, 30 * s);

    if (distToLens1 < hitTolerance) {
      isDraggingRailLens1 = true;
      activeDragHandle = 'rail-lens1';
      canvas.style.cursor = 'ew-resize';
    } else if (distToLens2 < hitTolerance) {
      isDraggingRailLens2 = true;
      activeDragHandle = 'rail-lens2';
      canvas.style.cursor = 'ew-resize';
    } else if (distToScreen < hitTolerance) {
      isDraggingRailScreen = true;
      activeDragHandle = 'rail-screen';
      canvas.style.cursor = 'ew-resize';
    }
  } else {
    const objX = centerX - doVal * drawScaleX;
    const objY = centerY - ho * drawScaleX;
    const distToObjectTip = Math.hypot(clickX - objX, clickY - objY);
    
    const fLeftX = centerX - f * drawScaleX;
    const fRightX = centerX + f * drawScaleX;
    
    const distToFLeft = Math.abs(clickX - fLeftX);
    const distToFRight = Math.abs(clickX - fRightX);
    
    if (distToObjectTip < 22) {
      isDraggingObject = true;
      activeDragHandle = 'object-tip';
      canvas.style.cursor = 'grabbing';
    } else if (distToFLeft < 18 && Math.abs(clickY - centerY) < 18) {
      isDraggingFocal = true;
      activeDragHandle = 'f-left';
      canvas.style.cursor = 'ew-resize';
    } else if (distToFRight < 18 && Math.abs(clickY - centerY) < 18) {
      isDraggingFocal = true;
      activeDragHandle = 'f-right';
      canvas.style.cursor = 'ew-resize';
    }
  }
}

// 마우스 무브 이벤트 (드래그 처리)
function onMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const currX = e.clientX - rect.left;
  const currY = e.clientY - rect.top;
  
  if (lensType === 'rail') {
    const s = drawScaleX;
    const rx = (logicalX) => centerX + (logicalX - 400) * s;
    const rxInv = (screenX) => (screenX - centerX) / s + 400;
    
    if (!isDraggingRailLens1 && !isDraggingRailLens2 && !isDraggingRailScreen) {
      const distToLens1 = railLens1Active ? Math.abs(currX - rx(railLens1Pos)) : Infinity;
      const distToLens2 = railLens2Active ? Math.abs(currX - rx(railLens2Pos)) : Infinity;
      const distToScreen = Math.abs(currX - rx(railScreenPos));
      
      if (distToLens1 < 20 || distToLens2 < 20 || distToScreen < 20) {
        canvas.style.cursor = 'ew-resize';
      } else {
        canvas.style.cursor = 'default';
      }
      return;
    }

    if (isDraggingRailLens1) {
      let val = rxInv(currX);
      val = Math.max(100, Math.min(railLens2Active ? railLens2Pos - 30 : railScreenPos - 30, val));
      railLens1Pos = val;
      focalSlider.value = val;
      focalVal.textContent = Math.round(val) + 'px';
    }
    if (isDraggingRailLens2) {
      let val = rxInv(currX);
      val = Math.max(railLens1Active ? railLens1Pos + 30 : 100, Math.min(railScreenPos - 30, val));
      railLens2Pos = val;
      objPosSlider.value = val;
      objPosVal.textContent = Math.round(val) + 'px';
    }
    if (isDraggingRailScreen) {
      let val = rxInv(currX);
      const minLimit = railLens2Active ? railLens2Pos + 30 : (railLens1Active ? railLens1Pos + 30 : 110);
      val = Math.max(minLimit, Math.min(750, val));
      railScreenPos = val;
      objHeightSlider.value = val;
      objHeightVal.textContent = Math.round(val) + 'px';
    }
  } else {
    if (!isDraggingObject && !isDraggingFocal) {
      const objX = centerX - doVal * drawScaleX;
      const objY = centerY - ho * drawScaleX;
      const distToObj = Math.hypot(currX - objX, currY - objY);
      
      const distFLeft = Math.abs(currX - (centerX - f * drawScaleX));
      const distFRight = Math.abs(currX - (centerX + f * drawScaleX));
      
      if (distToObj < 22) {
        canvas.style.cursor = 'grab';
      } else if ((distFLeft < 18 || distFRight < 18) && Math.abs(currY - centerY) < 18) {
        canvas.style.cursor = 'ew-resize';
      } else {
        canvas.style.cursor = 'default';
      }
      return;
    }
    
    if (isDraggingObject) {
      let newDo = (centerX - currX) / drawScaleX;
      newDo = Math.max(10, Math.min(480, newDo));
      doVal = newDo;
      objPosSlider.value = doVal;
      objPosVal.textContent = Math.round(doVal) + 'px';
      
      let newHo = (centerY - currY) / drawScaleX;
      newHo = Math.max(-150, Math.min(150, newHo));
      ho = newHo;
      objHeightSlider.value = ho;
      objHeightVal.textContent = Math.round(ho) + 'px';
    }
    
    if (isDraggingFocal) {
      let newF = 120;
      if (activeDragHandle === 'f-left') {
        newF = (centerX - currX) / drawScaleX;
      } else {
        newF = (currX - centerX) / drawScaleX;
      }
      newF = Math.max(50, Math.min(200, newF));
      f = newF;
      focalSlider.value = f;
      focalVal.textContent = Math.round(f) + 'px';
    }
  }
  
  calculateOptics();
  draw();
}

// 드래그 종료
function onMouseUp() {
  isDraggingObject = false;
  isDraggingFocal = false;
  
  isDraggingRailLens1 = false;
  isDraggingRailLens2 = false;
  isDraggingRailScreen = false;
  activeDragHandle = '';
  canvas.style.cursor = 'default';
  draw();
}

// 터치 대응
function onTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const mEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mEvent);
}

function onTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const mEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mEvent);
}

// 캔버스 그리기 메인 루틴
function draw() {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  
  ctx.clearRect(0, 0, width, height);
  
  if (checkGrid.checked) {
    drawGrid(width, height);
  }
  
  if (lensType === 'rail') {
    drawRailSystem(width, height);
  } else {
    // 수평 중심 축
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    
    const benchY = centerY + 90 * drawScaleX;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(20, benchY, width - 40, 10);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, benchY, width - 40, 10);

    drawFocalPoints();
    drawObject();
    drawImage();
    
    if (rayMode === 'primary') {
      drawPrimaryRays();
    } else {
      drawLaserRays(width);
    }
    
    drawLens();

    renderProjectedScreen();
  }
}

// 격자선
function drawGrid(w, h) {
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const step = 20;
  for (let x = 0; x < w; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y < h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
}

// 초점 도리
function drawFocalPoints() {
  const points = [
    { x: centerX - f * drawScaleX, label: "F", active: activeDragHandle === 'f-left' },
    { x: centerX + f * drawScaleX, label: "F'", active: activeDragHandle === 'f-right' },
    { x: centerX - 2 * f * drawScaleX, label: "2F", active: false },
    { x: centerX + 2 * f * drawScaleX, label: "2F'", active: false }
  ];
  
  points.forEach(pt => {
    ctx.beginPath();
    ctx.arc(pt.x, centerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = pt.active ? '#fff' : 'rgba(34, 211, 238, 0.8)';
    ctx.shadowColor = 'rgba(34, 211, 238, 0.7)';
    ctx.shadowBlur = pt.active ? 15 : 6;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = '11px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'center';
    ctx.fillText(pt.label, pt.x, centerY + 20);
  });
}

// 물체 그리기
function drawObject() {
  const objX = centerX - doVal * drawScaleX;
  const objY = centerY - ho * drawScaleX;
  
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(249, 115, 22, 0.85)';
  ctx.lineWidth = 3.5;
  ctx.moveTo(objX, centerY);
  ctx.lineTo(objX, objY);
  ctx.stroke();
  
  const headSize = 10;
  const dir = ho >= 0 ? 1 : -1;
  ctx.beginPath();
  ctx.fillStyle = '#f97316';
  ctx.moveTo(objX - headSize/1.5, objY + headSize * dir);
  ctx.lineTo(objX, objY);
  ctx.lineTo(objX + headSize/1.5, objY + headSize * dir);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(objX, objY, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 2;
  ctx.shadowColor = 'rgba(249, 115, 22, 0.8)';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 글자 오버레이 표시
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(railLetter, objX, centerY - (ho * drawScaleX)/2 + 3);
  
  if (checkValues.checked) {
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#f97316';
    ctx.textAlign = 'center';
    ctx.fillText("물체", objX, centerY - ho * drawScaleX - (ho >= 0 ? 18 : -25));
  }
}

// 상 그리기
function drawImage() {
  if (di === Infinity || isNaN(di)) return;
  
  const imgX = centerX + di * drawScaleX;
  const imgY = centerY + hi * drawScaleX;
  
  if (imgX < 0 || imgX > canvas.width / (window.devicePixelRatio || 1)) return;

  const isVirtual = di < 0;
  
  ctx.beginPath();
  ctx.strokeStyle = isVirtual ? 'rgba(236, 72, 153, 0.85)' : 'rgba(16, 185, 129, 0.85)';
  ctx.lineWidth = 3;
  
  if (isVirtual) {
    ctx.setLineDash([5, 4]);
  }
  ctx.moveTo(imgX, centerY);
  ctx.lineTo(imgX, imgY);
  ctx.stroke();
  ctx.setLineDash([]);
  
  const headSize = 8;
  const dir = hi >= 0 ? 1 : -1;
  ctx.beginPath();
  ctx.fillStyle = isVirtual ? '#ec4899' : '#10b981';
  ctx.moveTo(imgX - headSize/1.5, imgY - headSize * dir);
  ctx.lineTo(imgX, imgY);
  ctx.lineTo(imgX + headSize/1.5, imgY - headSize * dir);
  ctx.fill();
  
  if (checkValues.checked) {
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = isVirtual ? '#ec4899' : '#10b981';
    ctx.textAlign = 'center';
    ctx.fillText(isVirtual ? "정립 허상" : "도립 실상", imgX, centerY + hi * drawScaleX + (hi >= 0 ? 20 : -15));
  }
}

// 렌즈 그리기
function drawLens() {
  const lensWidth = 24;
  const lensHeight = 180 * drawScaleX;
  
  ctx.save();
  ctx.shadowColor = 'rgba(34, 211, 238, 0.2)';
  ctx.shadowBlur = 10;
  
  const grad = ctx.createLinearGradient(centerX - lensWidth/2, centerY, centerX + lensWidth/2, centerY);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
  grad.addColorStop(0.3, 'rgba(34, 211, 238, 0.25)');
  grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
  grad.addColorStop(0.7, 'rgba(34, 211, 238, 0.25)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.15)');

  ctx.beginPath();
  if (lensType === 'convex') {
    ctx.moveTo(centerX, centerY - lensHeight/2);
    ctx.quadraticCurveTo(centerX + lensWidth, centerY, centerX, centerY + lensHeight/2);
    ctx.quadraticCurveTo(centerX - lensWidth, centerY, centerX, centerY - lensHeight/2);
  } else {
    ctx.moveTo(centerX - lensWidth/2, centerY - lensHeight/2);
    ctx.lineTo(centerX + lensWidth/2, centerY - lensHeight/2);
    ctx.quadraticCurveTo(centerX + lensWidth/4, centerY, centerX + lensWidth/2, centerY + lensHeight/2);
    ctx.lineTo(centerX - lensWidth/2, centerY + lensHeight/2);
    ctx.quadraticCurveTo(centerX - lensWidth/4, centerY, centerX - lensWidth/2, centerY - lensHeight/2);
  }
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.moveTo(centerX, centerY - lensHeight/2 - 10);
  ctx.lineTo(centerX, centerY + lensHeight/2 + 10);
  ctx.stroke();
  ctx.setLineDash([]);
  
  ctx.restore();
}

// 대표 광선
function drawPrimaryRays() {
  const objX = centerX - doVal * drawScaleX;
  const objY = centerY - ho * drawScaleX;
  const w = canvas.width / (window.devicePixelRatio || 1);
  
  if (di === Infinity || isNaN(di)) {
    drawGlowingRay(objX, objY, centerX, objY, 'rgba(34, 211, 238, 0.8)');
    drawGlowingRay(centerX, objY, centerX + (f + 200) * drawScaleX, centerY + (centerY - objY) * 1.5, 'rgba(34, 211, 238, 0.8)');

    const dx = centerX - objX;
    const dy = centerY - objY;
    drawGlowingRay(objX, objY, centerX + 300 * drawScaleX, centerY + 300 * drawScaleX * (dy / dx), 'rgba(236, 72, 153, 0.8)');
    return;
  }

  const imgX = centerX + di * drawScaleX;
  const imgY = centerY + hi * drawScaleX;

  const color1 = 'rgba(34, 211, 238, 0.7)';
  const color2 = 'rgba(168, 85, 247, 0.7)';
  const color3 = 'rgba(234, 179, 8, 0.7)';
  const traceColor = 'rgba(255, 255, 255, 0.25)';

  if (lensType === 'convex') {
    const isReal = di > 0;

    drawGlowingRay(objX, objY, centerX, objY, color1);
    if (isReal) {
      drawGlowingRay(centerX, objY, imgX, imgY, color1);
      drawGlowingRay(imgX, imgY, imgX + 100 * drawScaleX, imgY + (imgY - objY) * ((100 * drawScaleX) / (di * drawScaleX)), color1);
    } else {
      const slope = (centerY - objY) / (f * drawScaleX);
      const outX = w;
      const outY = objY + slope * (outX - centerX);
      drawGlowingRay(centerX, objY, outX, outY, color1);
      
      ctx.beginPath();
      ctx.strokeStyle = traceColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(centerX, objY);
      ctx.lineTo(imgX, imgY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    drawGlowingRay(objX, objY, centerX, centerY, color2);
    if (isReal) {
      drawGlowingRay(centerX, centerY, imgX, imgY, color2);
      drawGlowingRay(imgX, imgY, imgX + 100 * drawScaleX, imgY + (imgY - centerY) * ((100 * drawScaleX) / (di * drawScaleX)), color2);
    } else {
      const slope = (centerY - objY) / (doVal * drawScaleX);
      const outX = w;
      const outY = centerY + slope * (outX - centerX);
      drawGlowingRay(centerX, centerY, outX, outY, color2);
      
      ctx.beginPath();
      ctx.strokeStyle = traceColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(imgX, imgY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (doVal > f) {
      drawGlowingRay(objX, objY, centerX, imgY, color3);
      drawGlowingRay(centerX, imgY, imgX, imgY, color3);
      drawGlowingRay(imgX, imgY, imgX + 150 * drawScaleX, imgY, color3);
    } else {
      const lensHitY = centerY + ((objY - centerY) / ((f - doVal) * drawScaleX)) * (f * drawScaleX);
      drawGlowingRay(objX, objY, centerX, lensHitY, color3);
      drawGlowingRay(centerX, lensHitY, w, lensHitY, color3);
      
      ctx.beginPath();
      ctx.strokeStyle = traceColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(centerX, lensHitY);
      ctx.lineTo(imgX, imgY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

  } else {
    drawGlowingRay(objX, objY, centerX, objY, color1);
    const slope = (objY - centerY) / (f * drawScaleX);
    const outX = w;
    const outY = objY + slope * (outX - centerX);
    drawGlowingRay(centerX, objY, outX, outY, color1);
    
    ctx.beginPath();
    ctx.strokeStyle = traceColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(centerX, objY);
    ctx.lineTo(centerX - f * drawScaleX, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    drawGlowingRay(objX, objY, centerX, centerY, color2);
    const outCenterSlope = (centerY - objY) / (doVal * drawScaleX);
    const outCenterX = w;
    const outCenterY = centerY + outCenterSlope * (outCenterX - centerX);
    drawGlowingRay(centerX, centerY, outCenterX, outCenterY, color2);

    const lensHitY = centerY + (objY - centerY) * ((f * drawScaleX) / ((doVal + f) * drawScaleX));
    drawGlowingRay(objX, objY, centerX, lensHitY, color3);
    drawGlowingRay(centerX, lensHitY, w, lensHitY, color3);

    ctx.beginPath();
    ctx.strokeStyle = traceColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(centerX, lensHitY);
    ctx.lineTo(imgX, imgY);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// 평행 레이저
function drawLaserRays(width) {
  const laserColor = 'rgba(34, 211, 238, 0.75)';
  const rayCount = 5;
  const spacing = 26;

  for (let i = 0; i < rayCount; i++) {
    const y = centerY - ((rayCount - 1) / 2 - i) * spacing;
    drawGlowingRay(0, y, centerX, y, laserColor);

    if (lensType === 'convex') {
      const focalX = centerX + f * drawScaleX;
      const slope = (centerY - y) / (f * drawScaleX);
      const outX = width;
      const outY = centerY + slope * (outX - focalX);
      drawGlowingRay(centerX, y, outX, outY, laserColor);
    } else {
      const slope = (y - centerY) / (f * drawScaleX);
      const outX = width;
      const outY = y + slope * (outX - centerX);
      drawGlowingRay(centerX, y, outX, outY, laserColor);

      if (checkValues.checked) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.moveTo(centerX, y);
        ctx.lineTo(centerX - f * drawScaleX, centerY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }
}

// 광선 이펙트
function drawGlowingRay(x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.0;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const dist = Math.hypot(x2 - x1, y2 - y1);
  const particleSpacing = 80;
  const speed = 1.2;
  const offset = (animTime * speed) % particleSpacing;
  
  ctx.fillStyle = '#fff';
  for (let d = offset; d < dist; d += particleSpacing) {
    const ratio = d / dist;
    const px = x1 + (x2 - x1) * ratio;
    const py = y1 + (y2 - y1) * ratio;
    
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// 과학관 레일 시스템 실험 드로잉
function drawRailSystem(width, height) {
  const s = drawScaleX; // 모바일 축소 비율
  const railY1 = centerY + 105 * s;
  const railY2 = centerY + 115 * s;
  
  // 레일 위치를 화면 비율에 맞게 변환
  const rx = (logicalX) => centerX + (logicalX - 400) * s;
  
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = Math.max(2, 3 * s);
  ctx.moveTo(rx(40), railY1);
  ctx.lineTo(rx(760), railY1);
  ctx.moveTo(rx(40), railY2);
  ctx.lineTo(rx(760), railY2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(100, 110, 130, 0.7)';
  ctx.fillRect(rx(30), railY1 - 5 * s, 10 * s, 25 * s);
  ctx.fillRect(rx(760), railY1 - 5 * s, 10 * s, 25 * s);

  const objX = rx(railObjectPos);
  drawRailMount(objX, railY1, "광원 (물체)", false, s);
  
  ctx.beginPath();
  ctx.arc(objX, centerY, 15 * s, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowColor = '#fff';
  ctx.shadowBlur = 15 * s;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#05070f';
  ctx.font = `bold ${Math.round(15 * s)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(railLetter, objX, centerY);
  ctx.textBaseline = 'alphabetic';

  if (railLens1Active) {
    const lens1X = rx(railLens1Pos);
    drawRailMount(lens1X, railY1, "1번 볼록렌즈", activeDragHandle === 'rail-lens1', s);
    drawSingleLensIcon(lens1X, 'convex', 45 * s, s);
  }

  if (railLens2Active) {
    const lens2X = rx(railLens2Pos);
    drawRailMount(lens2X, railY1, "2번 오목렌즈", activeDragHandle === 'rail-lens2', s);
    drawSingleLensIcon(lens2X, 'concave', 45 * s, s);
  }

  const screenX = rx(railScreenPos);
  drawRailMount(screenX, railY1, "스크린 패널", activeDragHandle === 'rail-screen', s);
  
  ctx.fillStyle = 'rgba(200, 210, 230, 0.9)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.fillRect(screenX - 4 * s, centerY - 65 * s, 8 * s, 130 * s);
  ctx.strokeRect(screenX - 4 * s, centerY - 65 * s, 8 * s, 130 * s);

  drawCompoundRailRays(width);
  renderProjectedScreen();
}

// 레일 부품 고정 마운트
function drawRailMount(x, railY, label, isActive, s) {
  ctx.fillStyle = isActive ? '#22d3ee' : 'rgba(150, 160, 180, 0.8)';
  ctx.fillRect(x - 16 * s, centerY + 60 * s, 32 * s, 45 * s);
  
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x - 20 * s, railY - 2 * s, 40 * s, 6 * s);

  ctx.fillStyle = isActive ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255, 255, 255, 0.05)';
  ctx.strokeStyle = isActive ? '#22d3ee' : 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.roundRect(x - 25 * s, centerY - 65 * s, 50 * s, 125 * s, 8 * s);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(x - 18 * s, centerY - 58 * s, 2.5 * s, 0, Math.PI*2);
  ctx.arc(x + 18 * s, centerY - 58 * s, 2.5 * s, 0, Math.PI*2);
  ctx.arc(x - 18 * s, centerY + 53 * s, 2.5 * s, 0, Math.PI*2);
  ctx.arc(x + 18 * s, centerY + 53 * s, 2.5 * s, 0, Math.PI*2);
  ctx.fill();

  ctx.font = `bold ${Math.max(7, Math.round(9 * s))}px sans-serif`;
  ctx.fillStyle = isActive ? '#22d3ee' : 'rgba(255, 255, 255, 0.6)';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, centerY + 80 * s);
}

// 미니 렌즈 형상
function drawSingleLensIcon(x, type, height, s) {
  const lensW = 10 * s;
  const grad = ctx.createLinearGradient(x - lensW/2, centerY, x + lensW/2, centerY);
  grad.addColorStop(0, 'rgba(255,255,255,0.15)');
  grad.addColorStop(0.5, 'rgba(34, 211, 238, 0.45)');
  grad.addColorStop(1, 'rgba(255,255,255,0.15)');

  ctx.beginPath();
  if (type === 'convex') {
    ctx.moveTo(x, centerY - height/2);
    ctx.quadraticCurveTo(x + lensW, centerY, x, centerY + height/2);
    ctx.quadraticCurveTo(x - lensW, centerY, x, centerY - height/2);
  } else {
    ctx.moveTo(x - lensW/2, centerY - height/2);
    ctx.lineTo(x + lensW/2, centerY - height/2);
    ctx.quadraticCurveTo(x + lensW/4, centerY, x + lensW/2, centerY + height/2);
    ctx.lineTo(x - lensW/2, centerY + height/2);
    ctx.quadraticCurveTo(x - lensW/4, centerY, x - lensW/2, centerY - height/2);
  }
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.stroke();
}

// 레일 광원 굴절
function drawCompoundRailRays(width) {
  const s = drawScaleX;
  const rx = (logicalX) => centerX + (logicalX - 400) * s;
  
  const x0 = rx(railObjectPos);
  const x1 = rx(railLens1Pos);
  const x2 = rx(railLens2Pos);
  const x_screen = rx(railScreenPos);

  const rayCount = 5;
  const raySpacing = 16 * s;
  const laserColor = 'rgba(34, 211, 238, 0.7)';
  const focusLaserColor = 'rgba(16, 185, 129, 0.65)';

  for (let i = 0; i < rayCount; i++) {
    const y0 = centerY - ((rayCount - 1) / 2 - i) * raySpacing;
    let y1 = y0;
    let y2 = y0;

    if (railLens1Active) {
      y1 = centerY - ((rayCount - 1) / 2 - i) * (raySpacing * 0.4);
      drawGlowingRay(x0, y0, x1, y1, laserColor);
    }

    if (railLens1Active && railLens2Active) {
      const a1 = railLens1Pos - railObjectPos;
      const b1 = (a1 * f1_rail) / (a1 - f1_rail);
      const x_img1_logical = railLens1Pos + b1;
      const x_img1 = rx(x_img1_logical);
      
      if (isFinite(x_img1)) {
        const slope1 = (centerY - y1) / (x_img1 - x1);
        y2 = centerY - slope1 * (x_img1 - x2);
      } else {
        y2 = y1;
      }
      drawGlowingRay(x1, y1, x2, y2, laserColor);

      const a2 = railLens2Pos - x_img1_logical;
      const f2_actual = -f2_rail_base;
      const b2 = (a2 * f2_actual) / (a2 - f2_actual);
      const x_img2 = rx(railLens2Pos + b2);

      let slope2 = 0;
      if (isFinite(x_img2)) {
        slope2 = (centerY - y2) / (x_img2 - x2);
      }
      
      const targetY = centerY + slope2 * (x_screen - x_img2);
      drawGlowingRay(x2, y2, x_screen, targetY, focusLaserColor);
      drawGlowingRay(x_screen, targetY, x_screen + 80 * s, targetY + slope2 * 80 * s, 'rgba(16, 185, 129, 0.25)');
    } 
    else if (railLens1Active && !railLens2Active) {
      const a1 = railLens1Pos - railObjectPos;
      const b1 = (a1 * f1_rail) / (a1 - f1_rail);
      const x_img1 = rx(railLens1Pos + b1);

      const slope = isFinite(x_img1) ? (centerY - y1) / (x_img1 - x1) : 0;
      const targetY = centerY + slope * (x_screen - x_img1);
      drawGlowingRay(x1, y1, x_screen, targetY, focusLaserColor);
      drawGlowingRay(x_screen, targetY, x_screen + 80 * s, targetY + slope * 80 * s, 'rgba(16, 185, 129, 0.2)');
    } 
    else if (!railLens1Active && railLens2Active) {
      y2 = centerY - ((rayCount - 1) / 2 - i) * (raySpacing * 0.4);
      drawGlowingRay(x0, y0, x2, y2, laserColor);

      const a2 = railLens2Pos - railObjectPos;
      const f2_actual = -f2_rail_base;
      const b2 = (a2 * f2_actual) / (a2 - f2_actual);
      const x_img2 = rx(railObjectPos + a2 + b2);

      let slope2 = 0;
      if (isFinite(x_img2)) {
        slope2 = (centerY - y2) / (x_img2 - x2);
      }
      
      const targetY = centerY + slope2 * (x_screen - x_img2);
      drawGlowingRay(x2, y2, x_screen, targetY, focusLaserColor);
      drawGlowingRay(x_screen, targetY, x_screen + 80 * s, targetY + slope2 * 80 * s, 'rgba(16, 185, 129, 0.25)');
    } 
    else {
      // 둘 다 미사용 -> 그냥 직진
      drawGlowingRay(x0, y0, x_screen, y0, laserColor);
    }
  }
}

// 스크린 알파벳 투영 및 블러 계산 (모든 모드 완벽 연동)
function renderProjectedScreen() {
  const w = screenCanvas.width;
  const h = screenCanvas.height;
  
  screenCtx.clearRect(0, 0, w, h);
  
  let finalM = 1;
  let blurVal = 0;
  let isVirtualMode = false;
  let isObserverEyeView = false; // 기본 렌즈 모드(관찰자 시선 모드) 여부

  if (lensType === 'rail') {
    const x0 = railObjectPos;
    const x1 = railLens1Pos;
    const x2 = railLens2Pos;
    const x_screen = railScreenPos;

    // Stage 1 (1번 볼록렌즈)
    let x_img1 = x0;
    let m1 = 1;

    if (railLens1Active) {
      const a1 = x1 - x0;
      const b1 = (a1 * f1_rail) / (a1 - f1_rail);
      x_img1 = x1 + b1;
      m1 = -b1 / a1;
    }

    let x_final = 0;

    if (!railLens2Active) {
      x_final = x_img1;
      finalM = m1;
    } else {
      const a2 = x2 - x_img1;
      const f2_actual = -f2_rail_base;
      const b2 = (a2 * f2_actual) / (a2 - f2_actual);
      x_final = x2 + b2;
      const m2 = -b2 / a2;
      finalM = m1 * m2;
    }

    const deltaX = Math.abs(x_screen - x_final);
    if (!isFinite(x_final)) {
      blurVal = 15;
    } else {
      blurVal = Math.min(20, deltaX * 0.13);
    }

    // 둘 다 비활성화 상태이면 스크린은 항상 100% 뚜렷하게 맺힙니다 (그냥 다이렉트 투사 광원이므로)
    if (!railLens1Active && !railLens2Active) {
      blurVal = 0;
    }
  } else {
    // 단일 볼록/오목렌즈 모드 -> 사람이 렌즈를 직접 들여다볼 때 보이는 모습 (항상 선명함)
    isObserverEyeView = true;
    finalM = m;
    blurVal = 0; // 사람 눈은 결상 초점을 눈 근육으로 자동 보정하여 선명하게 봅니다.
    
    if (!isFinite(di)) {
      isVirtualMode = true; // 초점 위에서는 빛이 그냥 흩어짐
    }
  }

  screenCtx.save();
  screenCtx.fillStyle = '#010206';
  screenCtx.fillRect(0, 0, w, h);

  // 그리드 원형 십자선 (투영판 조준선)
  screenCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  screenCtx.lineWidth = 1;
  screenCtx.beginPath();
  screenCtx.arc(w/2, h/2, 50, 0, Math.PI*2);
  screenCtx.moveTo(w/2, 10);
  screenCtx.lineTo(w/2, h - 10);
  screenCtx.moveTo(10, h/2);
  screenCtx.lineTo(w - 10, h/2);
  screenCtx.stroke();

  screenCtx.translate(w/2, h/2);

  if (isVirtualMode) {
    screenCtx.beginPath();
    screenCtx.arc(0, 0, 35, 0, Math.PI*2);
    const radGrad = screenCtx.createRadialGradient(0, 0, 5, 0, 0, 35);
    radGrad.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
    radGrad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    screenCtx.fillStyle = radGrad;
    screenCtx.fill();

    screenBlurInfo.textContent = "초점 위에 물체가 있어 상이 보이지 않음";
    screenBlurInfo.className = "screen-info";
  } else {
    // 글자 투영
    let displayScale = Math.abs(finalM) * 1.5;
    displayScale = Math.max(0.4, Math.min(3.5, displayScale));
    
    if (finalM < 0) {
      screenCtx.scale(-displayScale, -displayScale);
    } else {
      screenCtx.scale(displayScale, displayScale);
    }

    if (blurVal > 0.5) {
      screenCtx.filter = `blur(${blurVal.toFixed(1)}px)`;
    } else {
      screenCtx.filter = 'none';
    }

    screenCtx.font = 'bold 36px monospace';
    screenCtx.fillStyle = '#10b981';
    screenCtx.shadowColor = '#10b981';
    screenCtx.shadowBlur = blurVal > 3 ? 0 : 8;
    screenCtx.textAlign = 'center';
    screenCtx.textBaseline = 'middle';
    screenCtx.fillText(railLetter, 0, 0);

    if (isObserverEyeView) {
      // 사람이 직접 렌즈를 들여다볼 때 상태 텍스트
      if (lensType === 'convex') {
        if (doVal < f) {
          screenBlurInfo.textContent = `정립 허상 (돋보기: ${Math.abs(finalM).toFixed(1)}배 똑바로 확대)`;
          screenBlurInfo.className = "screen-info focused";
        } else {
          screenBlurInfo.textContent = `도립 실상 (눈: ${Math.abs(finalM).toFixed(1)}배 거꾸로 보임)`;
          screenBlurInfo.className = "screen-info focused";
        }
      } else {
        screenBlurInfo.textContent = `정립 허상 (축소안경: ${Math.abs(finalM).toFixed(1)}배 똑바로 축소)`;
        screenBlurInfo.className = "screen-info focused";
      }
    } else {
      // 레일 스크린 상태 텍스트
      if (!railLens1Active && !railLens2Active) {
        screenBlurInfo.textContent = "렌즈 없음 (직사 광선 투영)";
        screenBlurInfo.className = "screen-info focused";
      } else if (blurVal < 1.0) {
        screenBlurInfo.textContent = "✓ 초점이 정확히 맞았습니다!";
        screenBlurInfo.className = "screen-info focused";
      } else {
        screenBlurInfo.textContent = `초점 오차: ${(blurVal * 1.5).toFixed(0)}% (스크린을 움직여 맞추세요)`;
        screenBlurInfo.className = "screen-info";
      }
    }
  }

  screenCtx.restore();
}

// 프레임 애니메이션
function animate() {
  animTime++;
  draw();
  requestAnimationFrame(animate);
}

window.onload = init;

// === 제어 패널 접기/열기 ===
if (btnTogglePanel && controlPanel) {
  btnTogglePanel.addEventListener('click', () => {
    const isCollapsed = controlPanel.classList.toggle('collapsed');
    btnTogglePanel.textContent = isCollapsed ? '열기 ☰' : '접기 ✕';
  });
}
