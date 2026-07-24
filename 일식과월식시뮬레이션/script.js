// === 상태 관리 (State) ===
const state = {
  mode: 'solar', // 'solar' 또는 'lunar'
  orbitAngle: 0, // 달 황경 차이 (0: 삭, 180: 망)
  earthAngle: 0, // 지구 위치 (계절 결정, 0: 겨울근일점, 180: 여름원일점)
  baseDistance: 381500,
  distance: 381500,
  perigeeAngle: 0, // 근지점 각도
  tilt: 5.14, // 백도 기울기
  cameraYaw: 15, // 3D 카메라 Yaw 회전 각도
  cameraPitch: -10, // 3D 카메라 Pitch 회전 각도
  zoom: 0.9,
  isPlaying: false,
  activePreset: 'presetTotalSolar'
};

const PHYS = {
  sunRadiusKM: 696340,
  earthRadiusKM: 6378,
  moonRadiusKM: 1737.4,
  sunEarthDistKM: 149600000
};

// === DOM 요소 ===
const tabBtns = document.querySelectorAll('.tab-btn');
const modeBadge = document.getElementById('modeBadge');
const actionButtonsContainer = document.getElementById('actionButtons');
const btnTogglePanel = document.getElementById('btn-toggle-panel');
const controlCard = document.querySelector('.control-card');

// 슬라이더 및 값 표시
const orbitSlider = document.getElementById('orbitSlider');
const orbitVal = document.getElementById('orbitVal');
const earthSlider = document.getElementById('earthSlider');
const earthVal = document.getElementById('earthVal');
const distSlider = document.getElementById('distSlider');
const distVal = document.getElementById('distVal');

// 정보 패널
const eclipseTypeStr = document.getElementById('eclipseTypeStr');

// 캔버스
const spaceCanvas = document.getElementById('spaceCanvas');
const spaceCtx = spaceCanvas.getContext('2d');
const skyCanvas = document.getElementById('skyCanvas');
const skyCtx = skyCanvas.getContext('2d');
const hintText = document.getElementById('hintText');

// 별 배경 데이터
let stars = [];
function initStars() {
  stars = [];
  for (let i = 0; i < 80; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.4
    });
  }
}
initStars();

// === 3D 투영 엔진 ===
function project3D(x, y, z, cx, cy) {
  const pitchRad = (state.cameraPitch * Math.PI) / 180;
  const yawRad = (state.cameraYaw * Math.PI) / 180;
  
  // 줌 적용
  const zX = x * state.zoom;
  const zY = y * state.zoom;
  const zZ = z * state.zoom;
  
  // 1. Yaw 회전 (X-Y 평면)
  const x1 = zX * Math.cos(yawRad) - zY * Math.sin(yawRad);
  const y1 = zX * Math.sin(yawRad) + zY * Math.cos(yawRad);
  const z1 = zZ;
  
  // 2. Pitch 회전 (Y-Z 평면)
  const x2 = x1;
  const y2 = y1 * Math.cos(pitchRad) - z1 * Math.sin(pitchRad);
  const z2 = y1 * Math.sin(pitchRad) + z1 * Math.cos(pitchRad);
  
  return {
    x: cx + x2,
    y: cy + y2,
    z: z2 // z2는 깊이(Depth) 정보
  };
}

// === 마우스 드래그를 이용한 3D 회전 제어 ===
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

spaceCanvas.addEventListener('mousedown', e => {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
});

spaceCanvas.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;
  
  state.cameraYaw += deltaX * 0.4;
  state.cameraPitch = Math.max(-85, Math.min(85, state.cameraPitch + deltaY * 0.4));
  
  previousMousePosition = { x: e.clientX, y: e.clientY };
  render();
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

// 마우스 휠 확대/축소
spaceCanvas.addEventListener('wheel', e => {
  e.preventDefault();
  const zoomSpeed = 0.08;
  if (e.deltaY < 0) {
    state.zoom = Math.min(3.0, state.zoom * (1 + zoomSpeed));
  } else {
    state.zoom = Math.max(0.3, state.zoom * (1 - zoomSpeed));
  }
  render();
}, { passive: false });

// 터치 이벤트 지원 (모바일/태블릿)
let lastPinchDist = 0;

spaceCanvas.addEventListener('touchstart', e => {
  if (e.touches.length === 1) {
    isDragging = true;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.touches.length === 2) {
    isDragging = false;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastPinchDist = Math.sqrt(dx * dx + dy * dy);
  }
});

spaceCanvas.addEventListener('touchmove', e => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (lastPinchDist > 0) {
      const scale = dist / lastPinchDist;
      state.zoom = Math.max(0.3, Math.min(3.0, state.zoom * scale));
      render();
    }
    lastPinchDist = dist;
    return;
  }
  if (!isDragging || e.touches.length !== 1) return;
  const deltaX = e.touches[0].clientX - previousMousePosition.x;
  const deltaY = e.touches[0].clientY - previousMousePosition.y;
  
  state.cameraYaw += deltaX * 0.4;
  state.cameraPitch = Math.max(-85, Math.min(85, state.cameraPitch + deltaY * 0.4));
  
  previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  render();
});

spaceCanvas.addEventListener('touchend', e => {
  isDragging = false;
  if (e.touches.length < 2) lastPinchDist = 0;
});

// === 달 기하학 정보 계산 ===
function getMoonCoordinates() {
  const orbitAngleRad = (state.orbitAngle * Math.PI) / 180;
  const perigeeAngleRad = (state.perigeeAngle * Math.PI) / 180;
  
  // 이심률 0.065를 고려한 실제 달-지구 거리 계산 (KM)
  const distance = state.baseDistance * (1 - 0.065 * 0.065) / (1 + 0.065 * Math.cos(orbitAngleRad - perigeeAngleRad));
  state.distance = distance;
  
  const earthAngleRad = (state.earthAngle * Math.PI) / 180;
  const moonAbsAngleRad = earthAngleRad + Math.PI + orbitAngleRad;
  const tiltRad = (state.tilt * Math.PI) / 180;
  
  // 시각화용 궤도 반경 조절
  const baseDistRatio = state.baseDistance / 384400;
  const orbitRadius = 75 * baseDistRatio;
  
  // 백도 경사각을 반영한 높이 Z 계산
  const zKM = distance * Math.sin(moonAbsAngleRad) * Math.sin(tiltRad);
  const zDraw = orbitRadius * Math.sin(moonAbsAngleRad) * Math.sin(tiltRad) * 4;
  
  return {
    distance: distance,
    orbitRadius: orbitRadius,
    zDraw: zDraw,
    zKM: zKM,
    moonAbsAngleRad: moonAbsAngleRad
  };
}

// === 식 판정 엔진 ===
function analyzeEclipse() {
  const geom = getMoonCoordinates();
  const earthAngleRad = (state.earthAngle * Math.PI) / 180;
  const moonAbsAngleRad = geom.moonAbsAngleRad;
  const tiltRad = (state.tilt * Math.PI) / 180;

  const sunAngRadius = 0.267; // 태양 각반경 (도)
  const moonAngRadius = (PHYS.moonRadiusKM / geom.distance) * (180 / Math.PI); // 달 각반경
  
  // 달의 수직 편차 (황위)
  const verticalSeparation = (geom.zKM / geom.distance) * (180 / Math.PI);

  let horizSeparationSolar = state.orbitAngle;
  if (horizSeparationSolar > 180) horizSeparationSolar = 360 - horizSeparationSolar;
  const horizSeparationLunar = Math.abs(state.orbitAngle - 180);

  if (state.mode === 'solar') {
    if (horizSeparationSolar < 25) {
      const totalSeparation = Math.sqrt(horizSeparationSolar ** 2 + verticalSeparation ** 2);
      if (totalSeparation < (sunAngRadius + moonAngRadius)) {
        if (totalSeparation < Math.abs(sunAngRadius - moonAngRadius)) {
          return {
            type: moonAngRadius >= sunAngRadius ? 'TOTAL_SOLAR' : 'ANNULAR_SOLAR',
            sep: totalSeparation,
            moonSize: moonAngRadius,
            targetSize: sunAngRadius,
            vertSep: verticalSeparation,
            horizSep: horizSeparationSolar
          };
        } else {
          return {
            type: 'PARTIAL_SOLAR',
            sep: totalSeparation,
            moonSize: moonAngRadius,
            targetSize: sunAngRadius,
            vertSep: verticalSeparation,
            horizSep: horizSeparationSolar
          };
        }
      }
    }
    return { type: 'NONE', sep: horizSeparationSolar, moonSize: moonAngRadius, targetSize: sunAngRadius, vertSep: verticalSeparation, horizSep: horizSeparationSolar };
  } else {
    // 월식 (지구 본그림자 및 반그림자 각반경 계산)
    const earthUmbraAngRadius = (((PHYS.earthRadiusKM - (PHYS.sunRadiusKM - PHYS.earthRadiusKM) * (geom.distance / PHYS.sunEarthDistKM)) / geom.distance) * (180 / Math.PI)) * 0.75;
    const earthPenumbraAngRadius = ((PHYS.earthRadiusKM + (PHYS.sunRadiusKM + PHYS.earthRadiusKM) * (geom.distance / PHYS.sunEarthDistKM)) / geom.distance) * (180 / Math.PI);
    
    if (horizSeparationLunar < 25) {
      const totalSeparation = Math.sqrt(horizSeparationLunar ** 2 + verticalSeparation ** 2);
      if (totalSeparation < (earthUmbraAngRadius + moonAngRadius)) {
        if (totalSeparation + moonAngRadius <= earthUmbraAngRadius) {
          return {
            type: 'TOTAL_LUNAR',
            sep: totalSeparation,
            moonSize: moonAngRadius,
            targetSize: earthUmbraAngRadius,
            penumbra: earthPenumbraAngRadius,
            vertSep: verticalSeparation,
            horizSep: horizSeparationLunar
          };
        } else {
          return {
            type: 'PARTIAL_LUNAR',
            sep: totalSeparation,
            moonSize: moonAngRadius,
            targetSize: earthUmbraAngRadius,
            penumbra: earthPenumbraAngRadius,
            vertSep: verticalSeparation,
            horizSep: horizSeparationLunar
          };
        }
      } else if (totalSeparation + moonAngRadius <= earthPenumbraAngRadius) {
        return {
          type: 'PENUMBRAL_LUNAR',
          sep: totalSeparation,
          moonSize: moonAngRadius,
          targetSize: earthUmbraAngRadius,
          penumbra: earthPenumbraAngRadius,
          vertSep: verticalSeparation,
          horizSep: horizSeparationLunar
        };
      }
    }
    return { type: 'NONE', sep: horizSeparationLunar, moonSize: moonAngRadius, targetSize: earthUmbraAngRadius, vertSep: verticalSeparation, horizSep: horizSeparationLunar };
  }
}

// === UI 업데이트 ===
function updateUI() {
  orbitSlider.value = state.orbitAngle;
  orbitVal.textContent = state.orbitAngle.toFixed(1) + '°';
  earthSlider.value = state.earthAngle;
  earthVal.textContent = state.earthAngle.toFixed(1) + '°';
  
  const distRatio = state.baseDistance / 381500;
  distSlider.value = distRatio;
  distVal.textContent = distRatio.toFixed(2) + 'x';
}

function updateInfoPanel(eclipse) {
  const types = {
    'TOTAL_SOLAR': '개기 일식', 'ANNULAR_SOLAR': '금환 일식', 'PARTIAL_SOLAR': '부분 일식',
    'TOTAL_LUNAR': '개기 월식', 'PARTIAL_LUNAR': '부분 월식', 'PENUMBRAL_LUNAR': '반영 월식',
    'NONE': '현상 없음'
  };
  
  eclipseTypeStr.textContent = types[eclipse.type] || '현상 없음';
  
  // 텍스트 강조 색상
  if (eclipse.type !== 'NONE') {
    eclipseTypeStr.style.color = '#ef4444';
    eclipseTypeStr.style.textShadow = '0 0 10px rgba(239, 68, 68, 0.4)';
  } else {
    eclipseTypeStr.style.color = '#f8fafc';
    eclipseTypeStr.style.textShadow = 'none';
  }

  if (state.mode === 'solar') {
    hintText.textContent = '일식 관측: 마우스 드래그로 우주를 회전해보세요. 달이 태양 앞에 정렬될 때 일식이 일어납니다.';
  } else {
    hintText.textContent = '월식 관측: 마우스 드래그로 우주를 회전해보세요. 달이 지구의 본그림자/반그림자 영역에 들어갈 때 월식이 일어납니다.';
  }
}

// === 탭 전환 ===
function switchTab(mode) {
  state.mode = mode;
  tabBtns.forEach(btn => {
    if (btn.dataset.tab === mode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (mode === 'solar') {
    modeBadge.textContent = '일식';
    state.orbitAngle = 0; // 삭
    state.earthAngle = 180; // 여름원일점
    setupSolarControls();
  } else {
    modeBadge.textContent = '월식';
    state.orbitAngle = 180; // 망
    state.earthAngle = 0; // 겨울근일점
    setupLunarControls();
  }
  
  updateUI();
  render();
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
  });
});

function setActivePreset(presetId) {
  const buttons = actionButtonsContainer.querySelectorAll('.action-btn');
  buttons.forEach(btn => {
    if (btn.id === presetId) {
      btn.classList.remove('secondary');
      btn.classList.add('primary');
    } else {
      btn.classList.remove('primary');
      btn.classList.add('secondary');
    }
  });
}

function setupSolarControls() {
  actionButtonsContainer.innerHTML = `
    <button class="action-btn primary" id="presetTotalSolar">개기 일식</button>
    <button class="action-btn secondary" id="presetAnnularSolar">금환 일식</button>
    <button class="action-btn secondary" id="presetPartialSolar">부분 일식</button>
  `;
  document.getElementById('presetTotalSolar').onclick = () => {
    state.orbitAngle = 0; state.earthAngle = 180; state.baseDistance = 381500; state.perigeeAngle = 0;
    setActivePreset('presetTotalSolar');
    updateUI(); render();
  };
  document.getElementById('presetAnnularSolar').onclick = () => {
    state.orbitAngle = 0; state.earthAngle = 0; state.baseDistance = 381500; state.perigeeAngle = 180;
    setActivePreset('presetAnnularSolar');
    updateUI(); render();
  };
  document.getElementById('presetPartialSolar').onclick = () => {
    state.orbitAngle = 0.3; state.earthAngle = 183.0; state.baseDistance = 381500; state.perigeeAngle = 90;
    setActivePreset('presetPartialSolar');
    updateUI(); render();
  };
}

function setupLunarControls() {
  actionButtonsContainer.innerHTML = `
    <button class="action-btn primary" id="presetTotalLunar">개기 월식</button>
    <button class="action-btn secondary" id="presetPartialLunar">부분 월식</button>
    <button class="action-btn secondary" id="presetPenumbralLunar">반영 월식</button>
  `;
  document.getElementById('presetTotalLunar').onclick = () => {
    state.orbitAngle = 180; state.earthAngle = 0; state.baseDistance = 381500; state.perigeeAngle = 180;
    setActivePreset('presetTotalLunar');
    updateUI(); render();
  };
  document.getElementById('presetPartialLunar').onclick = () => {
    state.orbitAngle = 180; state.earthAngle = 6.0; state.baseDistance = 381500; state.perigeeAngle = 90;
    setActivePreset('presetPartialLunar');
    updateUI(); render();
  };
  document.getElementById('presetPenumbralLunar').onclick = () => {
    state.orbitAngle = 180; state.earthAngle = 9.7; state.baseDistance = 381500; state.perigeeAngle = 45;
    setActivePreset('presetPenumbralLunar');
    updateUI(); render();
  };
}

// 슬라이더 바인딩
const onOrbitChange = e => { state.orbitAngle = parseFloat(e.target.value); updateUI(); render(); };
orbitSlider.addEventListener('input', onOrbitChange);
orbitSlider.addEventListener('change', onOrbitChange);

const onEarthChange = e => { state.earthAngle = parseFloat(e.target.value); updateUI(); render(); };
earthSlider.addEventListener('input', onEarthChange);
earthSlider.addEventListener('change', onEarthChange);

const onDistChange = e => { state.baseDistance = 381500 * parseFloat(e.target.value); updateUI(); render(); };
distSlider.addEventListener('input', onDistChange);
distSlider.addEventListener('change', onDistChange);

function resizeCanvas(canvas) {
  const rect = canvas.parentElement.getBoundingClientRect();
  if (canvas.width !== rect.width || canvas.height !== rect.height) {
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  return { width: canvas.width, height: canvas.height };
}

// === 3D 원뿔 그리기 헬퍼 ===
function draw3DCone(baseX, baseY, baseZ, radius, tipX, tipY, tipZ, cx, cy, fillStyle) {
  const numPoints = 16;
  const basePoints = [];
  for (let i = 0; i <= numPoints; i++) {
    const theta = (i / numPoints) * Math.PI * 2;
    // Y-Z 평면에 걸친 베이스 원
    basePoints.push(project3D(baseX, baseY + radius * Math.cos(theta), baseZ + radius * Math.sin(theta), cx, cy));
  }
  const pTip = project3D(tipX, tipY, tipZ, cx, cy);

  spaceCtx.fillStyle = fillStyle;
  for (let i = 0; i < numPoints; i++) {
    spaceCtx.beginPath();
    spaceCtx.moveTo(basePoints[i].x, basePoints[i].y);
    spaceCtx.lineTo(basePoints[i+1].x, basePoints[i+1].y);
    spaceCtx.lineTo(pTip.x, pTip.y);
    spaceCtx.closePath();
    spaceCtx.fill();
  }
}

// === 3D 절두체 원뿔 그리기 헬퍼 (반그림자용) ===
function draw3DTruncatedCone(baseX, baseY, baseZ, rBase, endX, endY, endZ, rEnd, cx, cy, fillStyle) {
  const numPoints = 16;
  const basePoints = [];
  const endPoints = [];
  for (let i = 0; i <= numPoints; i++) {
    const theta = (i / numPoints) * Math.PI * 2;
    basePoints.push(project3D(baseX, baseY + rBase * Math.cos(theta), baseZ + rBase * Math.sin(theta), cx, cy));
    endPoints.push(project3D(endX, endY + rEnd * Math.cos(theta), endZ + rEnd * Math.sin(theta), cx, cy));
  }

  spaceCtx.fillStyle = fillStyle;
  for (let i = 0; i < numPoints; i++) {
    spaceCtx.beginPath();
    spaceCtx.moveTo(basePoints[i].x, basePoints[i].y);
    spaceCtx.lineTo(basePoints[i+1].x, basePoints[i+1].y);
    spaceCtx.lineTo(endPoints[i+1].x, endPoints[i+1].y);
    spaceCtx.lineTo(endPoints[i].x, endPoints[i].y);
    spaceCtx.closePath();
    spaceCtx.fill();
  }
}

// === 3D 우주 공간 시각화 (Space View) ===
function drawSpaceView() {
  const { width, height } = resizeCanvas(spaceCanvas);
  spaceCtx.clearRect(0, 0, width, height);

  // A. 우주 배경 별빛
  spaceCtx.fillStyle = '#05070f';
  spaceCtx.fillRect(0, 0, width, height);
  stars.forEach(star => {
    spaceCtx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    spaceCtx.beginPath();
    spaceCtx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
    spaceCtx.fill();
  });

  const cx = width / 2;
  const cy = height / 2;

  // B. 3D 좌표 세팅
  const sunX = -220, sunY = 0, sunZ = 0;
  const earthX = 100, earthY = 0, earthZ = 0;

  const geom = getMoonCoordinates();
  const orbitRad = (state.orbitAngle * Math.PI) / 180;
  
  // 달의 지구 기준 3D 상대 위치 계산
  const xRel = -geom.orbitRadius * Math.cos(orbitRad); // 0도(삭)일 때 태양 방향(X 음수 방향)
  const yRel = geom.orbitRadius * Math.sin(orbitRad);  // 90도/270도일 때 깊이 축 (Z축)
  const zRel = geom.zDraw;                            // 백도 경사로 인한 상하 축 (Y축)

  const moonX = earthX + xRel;
  const moonY = earthY + yRel;
  const moonZ = earthZ + zRel;

  // 3D 투영 좌표 계산
  const pSun = project3D(sunX, sunY, sunZ, cx, cy);
  const pEarth = project3D(earthX, earthY, earthZ, cx, cy);
  const pMoon = project3D(moonX, moonY, moonZ, cx, cy);

  const earthRadiusDraw = 14 * state.zoom;
  const moonRadiusDraw = 5 * state.zoom;

  // === 3D 뎁스 버퍼 및 레이어링 처리 ===
  // 달의 깊이 pMoon.z에 따라 그리는 순서를 바꿉니다.
  const isMoonBehindEarth = pMoon.z < pEarth.z;

  // 1. 태양 그리기 (항상 맨 뒤)
  drawSun(pSun);

  // 2. 태양빛 조사선 렌더링
  drawSunlightBeams(pSun, pEarth, earthRadiusDraw);

  // 3. 백도 궤도선 (뒷쪽 반원)
  drawMoonOrbit(earthX, earthY, earthZ, geom.orbitRadius, cx, cy, true);

  if (isMoonBehindEarth) {
    // 달이 뒤에 있을 때: 달 -> 지구의 그림자 -> 지구 순서
    drawMoon(pMoon, pSun, moonRadiusDraw);
    drawEarthShadows(earthX, earthY, earthZ, earthRadiusDraw, cx, cy);
    drawEarth(pEarth, pSun, earthRadiusDraw);
  } else {
    // 달이 앞에 있을 때: 지구의 그림자 -> 지구 -> 달 -> 달의 그림자 순서
    drawEarthShadows(earthX, earthY, earthZ, earthRadiusDraw, cx, cy);
    drawEarth(pEarth, pSun, earthRadiusDraw);
    drawMoon(pMoon, pSun, moonRadiusDraw);
    if (state.mode === 'solar') {
      drawMoonShadows(moonX, moonY, moonZ, moonRadiusDraw, cx, cy);
    }
  }

  // 4. 백도 궤도선 (앞쪽 반원)
  drawMoonOrbit(earthX, earthY, earthZ, geom.orbitRadius, cx, cy, false);

  // 5. 교점선 (Line of Nodes) 렌더링
  drawNodeLine(earthX, earthY, earthZ, geom.orbitRadius, cx, cy);

  // 6. 천체 라벨들
  spaceCtx.font = 'bold 9.5px Noto Sans KR';
  spaceCtx.fillStyle = 'rgba(255,255,255,0.7)';
  spaceCtx.fillText('태양', pSun.x - 10, pSun.y - 28);
  spaceCtx.fillText('지구', pEarth.x - 10, pEarth.y - earthRadiusDraw - 6);
  spaceCtx.fillText('달', pMoon.x - 6, pMoon.y - moonRadiusDraw - 6);
}

// 태양 그리기 헬퍼
function drawSun(pSun) {
  const sunRadiusDraw = 25 * state.zoom;
  
  // 코로나 광원 효과
  const glowGrad = spaceCtx.createRadialGradient(pSun.x, pSun.y, sunRadiusDraw, pSun.x, pSun.y, sunRadiusDraw * 3.5);
  glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
  glowGrad.addColorStop(0.3, 'rgba(249, 115, 22, 0.15)');
  glowGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
  spaceCtx.fillStyle = glowGrad;
  spaceCtx.beginPath();
  spaceCtx.arc(pSun.x, pSun.y, sunRadiusDraw * 3.5, 0, Math.PI * 2);
  spaceCtx.fill();

  // 본체
  const sunGrad = spaceCtx.createRadialGradient(pSun.x - 2, pSun.y - 2, 2, pSun.x, pSun.y, sunRadiusDraw);
  sunGrad.addColorStop(0, '#fffbeb');
  sunGrad.addColorStop(0.2, '#fef08a');
  sunGrad.addColorStop(0.8, '#f97316');
  sunGrad.addColorStop(1, '#ea580c');
  spaceCtx.fillStyle = sunGrad;
  spaceCtx.beginPath();
  spaceCtx.arc(pSun.x, pSun.y, sunRadiusDraw, 0, Math.PI * 2);
  spaceCtx.fill();
}

// 태양빛 빔 시각화
function drawSunlightBeams(pSun, pEarth, earthRadiusDraw) {
  spaceCtx.strokeStyle = 'rgba(253, 224, 71, 0.08)';
  spaceCtx.lineWidth = 1;
  
  // 태양 끝단과 지구 끝단을 잇는 광선들
  spaceCtx.beginPath();
  spaceCtx.moveTo(pSun.x, pSun.y - 15);
  spaceCtx.lineTo(pEarth.x, pEarth.y - earthRadiusDraw);
  spaceCtx.moveTo(pSun.x, pSun.y + 15);
  spaceCtx.lineTo(pEarth.x, pEarth.y + earthRadiusDraw);
  spaceCtx.stroke();
}

// 지구 렌더링
function drawEarth(pEarth, pSun, earthRadiusDraw) {
  // 대기광 효과
  const atmoGrad = spaceCtx.createRadialGradient(pEarth.x, pEarth.y, earthRadiusDraw - 1, pEarth.x, pEarth.y, earthRadiusDraw + 4);
  atmoGrad.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
  atmoGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
  spaceCtx.fillStyle = atmoGrad;
  spaceCtx.beginPath();
  spaceCtx.arc(pEarth.x, pEarth.y, earthRadiusDraw + 4, 0, Math.PI * 2);
  spaceCtx.fill();

  // 지구 3D 광원 렌더링
  const earthGrad = spaceCtx.createRadialGradient(
    pEarth.x - (pEarth.x - pSun.x) * 0.15,
    pEarth.y - (pEarth.y - pSun.y) * 0.15,
    1,
    pEarth.x,
    pEarth.y,
    earthRadiusDraw
  );
  earthGrad.addColorStop(0, '#93c5fd'); // 낮 지역 (햇빛 반사)
  earthGrad.addColorStop(0.2, '#3b82f6');
  earthGrad.addColorStop(0.7, '#1d4ed8');
  earthGrad.addColorStop(0.9, '#0f172a'); // 밤 지역 경계
  earthGrad.addColorStop(1, '#020617');
  
  spaceCtx.fillStyle = earthGrad;
  spaceCtx.beginPath();
  spaceCtx.arc(pEarth.x, pEarth.y, earthRadiusDraw, 0, Math.PI * 2);
  spaceCtx.fill();

  // 지표면 관측자 점 표시 (일식: 낮 쪽, 월식: 밤 쪽)
  const obsAngle = state.mode === 'solar' ? Math.PI : 0; // 태양 방향 또는 반대 방향
  const ox = pEarth.x + earthRadiusDraw * Math.cos(obsAngle) * 0.6;
  const oy = pEarth.y + earthRadiusDraw * Math.sin(obsAngle) * 0.2;
  
  spaceCtx.fillStyle = '#22d3ee';
  spaceCtx.shadowColor = '#22d3ee';
  spaceCtx.shadowBlur = 6;
  spaceCtx.beginPath();
  spaceCtx.arc(ox, oy, 2.2, 0, Math.PI * 2);
  spaceCtx.fill();
  spaceCtx.shadowBlur = 0; // 그림자 복원

  // 관측자 라벨
  spaceCtx.font = '8px Noto Sans KR';
  spaceCtx.fillStyle = '#22d3ee';
  spaceCtx.fillText('관측지점', ox - 18, oy - 6);
}

// 달 렌더링
function drawMoon(pMoon, pSun, moonRadiusDraw) {
  const moonGrad = spaceCtx.createRadialGradient(
    pMoon.x - (pMoon.x - pSun.x) * 0.15,
    pMoon.y - (pMoon.y - pSun.y) * 0.15,
    0.5,
    pMoon.x,
    pMoon.y,
    moonRadiusDraw
  );
  moonGrad.addColorStop(0, '#f8fafc');
  moonGrad.addColorStop(0.4, '#cbd5e1');
  moonGrad.addColorStop(0.8, '#475569');
  moonGrad.addColorStop(1, '#1e293b');
  
  spaceCtx.fillStyle = moonGrad;
  spaceCtx.beginPath();
  spaceCtx.arc(pMoon.x, pMoon.y, moonRadiusDraw, 0, Math.PI * 2);
  spaceCtx.fill();
}

// 지구의 본그림자 및 반그림자 원뿔 렌더링 (3D 공간)
function drawEarthShadows(earthX, earthY, earthZ, earthRadiusDraw, cx, cy) {
  // 본그림자 (Umbra)
  // X축 양수 방향(태양 반대 방향)으로 수렴하는 원뿔
  const umbraLength = 160;
  const uBaseX = earthX;
  const uTipX = earthX + umbraLength;
  draw3DCone(uBaseX, earthY, earthZ, earthRadiusDraw, uTipX, earthY, earthZ, cx, cy, 'rgba(127, 29, 29, 0.45)');
  
  // 본그림자 외곽선 가이드
  const pBaseTop = project3D(uBaseX, earthY + earthRadiusDraw, earthZ, cx, cy);
  const pTip = project3D(uTipX, earthY, earthZ, cx, cy);
  spaceCtx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
  spaceCtx.lineWidth = 1;
  spaceCtx.beginPath();
  spaceCtx.moveTo(pBaseTop.x, pBaseTop.y);
  spaceCtx.lineTo(pTip.x, pTip.y);
  spaceCtx.stroke();

  // 반그림자 (Penumbra)
  // 멀어질수록 벌어지는 절두체 원뿔
  const penumbraLength = 180;
  const pEndX = earthX + penumbraLength;
  const pEndRadius = earthRadiusDraw * 2.3;
  draw3DTruncatedCone(uBaseX, earthY, earthZ, earthRadiusDraw, pEndX, earthY, earthZ, pEndRadius, cx, cy, 'rgba(148, 163, 184, 0.12)');
}

// 달의 그림자 원뿔 렌더링 (일식에서 중요)
function drawMoonShadows(moonX, moonY, moonZ, moonRadiusDraw, cx, cy) {
  // 태양빛 방향 벡터에 의한 달 그림자
  const D_x = moonX - (-220);
  const D_y = moonY;
  const D_z = moonZ;
  const len = Math.hypot(D_x, D_y, D_z);
  const ux = D_x / len;
  const uy = D_y / len;
  const uz = D_z / len;

  const shadowLen = 65;
  const tipX = moonX + ux * shadowLen;
  const tipY = moonY + uy * shadowLen;
  const tipZ = moonZ + uz * shadowLen;

  // 본그림자
  draw3DCone(moonX, moonY, moonZ, moonRadiusDraw, tipX, tipY, tipZ, cx, cy, 'rgba(15, 23, 42, 0.7)');
}

// 3D 백도 공전 궤도선 그리기
function drawMoonOrbit(earthX, earthY, earthZ, orbitRadius, cx, cy, drawBackground) {
  spaceCtx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
  spaceCtx.lineWidth = 1;
  spaceCtx.beginPath();

  const numPoints = 64;
  let firstPoint = true;

  for (let i = 0; i <= numPoints; i++) {
    const theta = (i / numPoints) * Math.PI * 2;
    const earthAngleRad = (state.earthAngle * Math.PI) / 180;
    const moonAbsAngleRad = earthAngleRad + Math.PI + theta;
    const tiltRad = (state.tilt * Math.PI) / 180;

    const xRel = -orbitRadius * Math.cos(theta);
    const yRel = orbitRadius * Math.sin(theta);
    const zRel = orbitRadius * Math.sin(moonAbsAngleRad) * Math.sin(tiltRad) * 4;

    const pt = project3D(earthX + xRel, earthY + yRel, earthZ + zRel, cx, cy);

    // Z 깊이 값에 의해 카메라 시점의 전반부/후반부 구분
    const isBehind = pt.z < (project3D(earthX, earthY, earthZ, cx, cy).z);
    
    if (drawBackground === isBehind) {
      if (firstPoint) {
        spaceCtx.moveTo(pt.x, pt.y);
        firstPoint = false;
      } else {
        spaceCtx.lineTo(pt.x, pt.y);
      }
    } else {
      firstPoint = true; // 세그먼트 끊김 처리
    }
  }
  spaceCtx.stroke();
}

// 교점선 (Line of Nodes) 축 시각화
function drawNodeLine(earthX, earthY, earthZ, orbitRadius, cx, cy) {
  // 교점은 달이 황도면을 지나는 지점 (Z = 0)
  // 3D 공간에서 황경 상 0도와 180도 지점에 위치함
  const ptNode1 = project3D(earthX - orbitRadius, earthY, earthZ, cx, cy);
  const ptNode2 = project3D(earthX + orbitRadius, earthY, earthZ, cx, cy);

  spaceCtx.strokeStyle = 'rgba(245, 158, 11, 0.18)';
  spaceCtx.lineWidth = 1.2;
  spaceCtx.setLineDash([3, 3]);
  spaceCtx.beginPath();
  spaceCtx.moveTo(ptNode1.x, ptNode1.y);
  spaceCtx.lineTo(ptNode2.x, ptNode2.y);
  spaceCtx.stroke();
  spaceCtx.setLineDash([]); // 복구

  spaceCtx.font = '8px Noto Sans KR';
  spaceCtx.fillStyle = 'rgba(245, 158, 11, 0.5)';
  spaceCtx.fillText('☊ 승교점', ptNode1.x - 22, ptNode1.y - 4);
  spaceCtx.fillText('☋ 강교점', ptNode2.x + 4, ptNode2.y + 10);
}

// === 지표면 관측자 시점 시각화 (Observer View) ===
function drawObserverView(eclipse) {
  const { width, height } = resizeCanvas(skyCanvas);
  skyCtx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  // 일식과 월식의 천체 각크기가 다르므로 개별 스케일(1도당 픽셀 매핑 배율) 적용
  const scale = state.mode === 'solar' ? 220 : 95;

  if (state.mode === 'solar') {
    // 1. 일식 (Solar Eclipse)
    // 하늘의 기본 밝기 설정 (식 진행 상태에 따라 어두워짐)
    let skyColor = '#38bdf8'; // 기본 푸른 하늘
    let maxDarkness = 0;
    
    if (eclipse.type !== 'NONE') {
      const dist = eclipse.sep;
      const totalRad = eclipse.moonSize + eclipse.targetSize;
      const overlapFactor = Math.max(0, 1 - dist / totalRad);
      maxDarkness = overlapFactor * 0.85;

      if (eclipse.type === 'TOTAL_SOLAR') maxDarkness = 1.0;
      else if (eclipse.type === 'ANNULAR_SOLAR') maxDarkness = 0.95;
    }

    // 하늘 색상 선형 보간
    if (maxDarkness > 0.8) {
      skyCtx.fillStyle = '#090d16'; // 개기일식 시의 밤하늘
    } else {
      skyCtx.fillStyle = `rgb(${Math.floor(56 - maxDarkness * 50)}, ${Math.floor(189 - maxDarkness * 175)}, ${Math.floor(248 - maxDarkness * 220)})`;
    }
    skyCtx.fillRect(0, 0, width, height);

    // 개기일식 시 은은한 배경 별들 노출
    if (maxDarkness > 0.85) {
      skyCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      [[30, 40, 0.8], [width - 45, 50, 0.6], [40, height - 50, 0.9]].forEach(star => {
        skyCtx.beginPath();
        skyCtx.arc(star[0], star[1], star[2], 0, Math.PI * 2);
        skyCtx.fill();
      });
    }

    const sunRadius = eclipse.targetSize * scale;
    const moonRadius = eclipse.moonSize * scale;

    let horizDiff = state.orbitAngle;
    if (horizDiff > 180) horizDiff -= 360;

    const mx = cx + horizDiff * scale;
    const my = cy - eclipse.vertSep * scale;

    // (1) 태양 및 코로나 그리기
    if (eclipse.type === 'TOTAL_SOLAR') {
      // 개기일식: 코로나 대폭 강화
      const coronaGrad = skyCtx.createRadialGradient(cx, cy, sunRadius - 2, cx, cy, sunRadius * 2.8);
      coronaGrad.addColorStop(0, '#ffffff');
      coronaGrad.addColorStop(0.2, '#fef08a');
      coronaGrad.addColorStop(0.5, 'rgba(253, 186, 116, 0.35)');
      coronaGrad.addColorStop(1, 'rgba(253, 186, 116, 0)');
      skyCtx.fillStyle = coronaGrad;
      skyCtx.beginPath();
      skyCtx.arc(cx, cy, sunRadius * 2.8, 0, Math.PI * 2);
      skyCtx.fill();

      // 다이아몬드 링 효과 (식 경계에서 살짝 보일 때 연출)
      if (eclipse.sep > 0.01) {
        const angle = Math.atan2(my - cy, mx - cx);
        const flareX = cx - sunRadius * Math.cos(angle);
        const flareY = cy - sunRadius * Math.sin(angle);
        
        const flareGrad = skyCtx.createRadialGradient(flareX, flareY, 1, flareX, flareY, 14);
        flareGrad.addColorStop(0, '#ffffff');
        flareGrad.addColorStop(0.2, '#fef08a');
        flareGrad.addColorStop(1, 'rgba(255,255,255,0)');
        skyCtx.fillStyle = flareGrad;
        skyCtx.beginPath();
        skyCtx.arc(flareX, flareY, 14, 0, Math.PI * 2);
        skyCtx.fill();
      }
    } else if (eclipse.type === 'ANNULAR_SOLAR') {
      // 금환일식: 빛 고리가 뚜렷하게 보이도록 코로나 및 본체 드로잉
      const sunGlow = skyCtx.createRadialGradient(cx, cy, sunRadius - 1, cx, cy, sunRadius * 2.2);
      sunGlow.addColorStop(0, '#fffbeb');
      sunGlow.addColorStop(0.3, 'rgba(249, 115, 22, 0.4)');
      sunGlow.addColorStop(1, 'rgba(249, 115, 22, 0)');
      skyCtx.fillStyle = sunGlow;
      skyCtx.beginPath();
      skyCtx.arc(cx, cy, sunRadius * 2.2, 0, Math.PI * 2);
      skyCtx.fill();

      // 태양 본체 (초고온 황백색 중심핵)
      skyCtx.fillStyle = '#fffbeb';
      skyCtx.beginPath();
      skyCtx.arc(cx, cy, sunRadius, 0, Math.PI * 2);
      skyCtx.fill();
      
      // 태양의 명확한 외곽선 (경계가 번지지 않도록 선명한 주황색/흰색 이중 테두리 적용)
      skyCtx.strokeStyle = '#ea580c';
      skyCtx.lineWidth = 1.8;
      skyCtx.stroke();
      skyCtx.strokeStyle = '#ffffff';
      skyCtx.lineWidth = 0.6;
      skyCtx.stroke();
    } else {
      // 일반/부분일식 시의 태양광 및 코로나
      const sunGlow = skyCtx.createRadialGradient(cx, cy, sunRadius - 1, cx, cy, sunRadius * 2.0);
      sunGlow.addColorStop(0, '#fef08a');
      sunGlow.addColorStop(0.4, 'rgba(249, 115, 22, 0.3)');
      sunGlow.addColorStop(1, 'rgba(249, 115, 22, 0)');
      skyCtx.fillStyle = sunGlow;
      skyCtx.beginPath();
      skyCtx.arc(cx, cy, sunRadius * 2.0, 0, Math.PI * 2);
      skyCtx.fill();

      skyCtx.fillStyle = '#fef08a';
      skyCtx.beginPath();
      skyCtx.arc(cx, cy, sunRadius, 0, Math.PI * 2);
      skyCtx.fill();
      
      skyCtx.strokeStyle = '#ea580c';
      skyCtx.lineWidth = 1.0;
      skyCtx.stroke();
    }

    // (2) 달 그리기 (검은 실루엣)
    skyCtx.fillStyle = '#070a13';
    skyCtx.beginPath();
    skyCtx.arc(mx, my, moonRadius, 0, Math.PI * 2);
    skyCtx.fill();

    // 식 경계가 맞닿는 테두리 처리 (경계 선명화)
    if (eclipse.type === 'TOTAL_SOLAR') {
      // 개기일식: 달과 태양 코로나가 만나는 경계에 하얗게 빛나는 초정밀 링 선명화
      skyCtx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      skyCtx.lineWidth = 1.0;
      skyCtx.shadowColor = '#fef08a';
      skyCtx.shadowBlur = 4;
      skyCtx.stroke();
      skyCtx.shadowBlur = 0; // 복원
    } else if (eclipse.type === 'ANNULAR_SOLAR') {
      // 금환일식: 가려진 검은 달 테두리에 광구의 강렬한 주황빛/붉은빛 경계 테두리 구현
      skyCtx.strokeStyle = '#ea580c';
      skyCtx.lineWidth = 1.5;
      skyCtx.stroke();
      skyCtx.strokeStyle = '#ffffff';
      skyCtx.lineWidth = 0.5;
      skyCtx.stroke();
    }

    // 식 가이드 텍스트
    skyCtx.font = '8px Noto Sans KR';
    skyCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    skyCtx.fillText('태양', cx - 8, cy - sunRadius - 6);
    skyCtx.fillText('달', mx - 4, my - moonRadius - 6);

  } else {
    // 2. 월식 (Lunar Eclipse)
    // 밤하늘 배경
    skyCtx.fillStyle = '#020308';
    skyCtx.fillRect(0, 0, width, height);

    // 미세한 별빛 배경
    skyCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    [[20, 30, 0.6], [width - 30, 45, 0.5], [50, height - 40, 0.7]].forEach(star => {
      skyCtx.beginPath();
      skyCtx.arc(star[0], star[1], star[2], 0, Math.PI * 2);
      skyCtx.fill();
    });

    const moonRadius = eclipse.moonSize * scale;
    const umbraRadius = eclipse.targetSize * scale;
    const penumbraRadius = (eclipse.penumbra || 1.15) * scale;

    let horizDiff = state.orbitAngle - 180;
    const mx = cx + horizDiff * scale;
    const my = cy - eclipse.vertSep * scale;

    // (1) 지구 반그림자 영역 그리기 (연한 회색 테두리)
    skyCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    skyCtx.lineWidth = 1;
    skyCtx.beginPath();
    skyCtx.arc(cx, cy, penumbraRadius, 0, Math.PI * 2);
    skyCtx.stroke();

    const penumbraGrad = skyCtx.createRadialGradient(cx, cy, umbraRadius, cx, cy, penumbraRadius);
    penumbraGrad.addColorStop(0, 'rgba(148, 163, 184, 0.15)');
    penumbraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    skyCtx.fillStyle = penumbraGrad;
    skyCtx.beginPath();
    skyCtx.arc(cx, cy, penumbraRadius, 0, Math.PI * 2);
    skyCtx.fill();

    // (2) 지구 본그림자 영역 그리기 (붉은색 그라디언트 테두리)
    const umbraGrad = skyCtx.createRadialGradient(cx, cy, umbraRadius * 0.4, cx, cy, umbraRadius);
    umbraGrad.addColorStop(0, 'rgba(127, 29, 29, 0.6)'); // 본그림자 중심부 (어두운 적갈색)
    umbraGrad.addColorStop(0.8, 'rgba(69, 10, 10, 0.45)');
    umbraGrad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    skyCtx.fillStyle = umbraGrad;
    skyCtx.beginPath();
    skyCtx.arc(cx, cy, umbraRadius, 0, Math.PI * 2);
    skyCtx.fill();

    skyCtx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
    skyCtx.lineWidth = 1.2;
    skyCtx.beginPath();
    skyCtx.arc(cx, cy, umbraRadius, 0, Math.PI * 2);
    skyCtx.stroke();

    // (3) 달 그리기
    let moonColor = '#e2e8f0'; // 일반 보름달 색
    
    if (eclipse.type === 'TOTAL_LUNAR') {
      moonColor = '#7f1d1d'; // 개기월식: 블러드문 (구리빛 적갈색)
    } else if (eclipse.type === 'PARTIAL_LUNAR') {
      // 본그림자 중심에서 달 중심을 향하는 방향 계산
      const shadowVectorAngle = Math.atan2(my - cy, mx - cx);
      const distToCenter = Math.hypot(mx - cx, my - cy);
      // 그림자에 들어간 정도 계산
      const overlapDepth = Math.max(0, Math.min(1, (umbraRadius + moonRadius - distToCenter) / (2 * moonRadius)));

      const gradStartX = mx - moonRadius * Math.cos(shadowVectorAngle);
      const gradStartY = my - moonRadius * Math.sin(shadowVectorAngle);
      const gradEndX = mx + moonRadius * Math.cos(shadowVectorAngle);
      const gradEndY = my + moonRadius * Math.sin(shadowVectorAngle);

      const partialGrad = skyCtx.createLinearGradient(gradStartX, gradStartY, gradEndX, gradEndY);
      partialGrad.addColorStop(0, '#7f1d1d'); // 완전히 본그림자에 들어간 부분
      partialGrad.addColorStop(Math.min(overlapDepth * 0.8, 0.7), '#450a0a');
      partialGrad.addColorStop(Math.min(overlapDepth * 0.8 + 0.15, 0.85), '#94a3b8');
      partialGrad.addColorStop(1, '#e2e8f0'); // 그림자 밖 밝은 부분
      moonColor = partialGrad;
    } else if (eclipse.type === 'PENUMBRAL_LUNAR') {
      moonColor = '#94a3b8'; // 반영월식: 살짝 어두운 회색조 보름달
    }

    // 달 본체 렌더링
    skyCtx.save();
    skyCtx.beginPath();
    skyCtx.arc(mx, my, moonRadius, 0, Math.PI * 2);
    skyCtx.clip();

    skyCtx.fillStyle = moonColor;
    skyCtx.beginPath();
    skyCtx.arc(mx, my, moonRadius, 0, Math.PI * 2);
    skyCtx.fill();

    // 분화구 표현 (달의 위상에 사실감 제공)
    skyCtx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    crawCraters(skyCtx, mx, my, [
      [-moonRadius * 0.3, -moonRadius * 0.2, moonRadius * 0.2],
      [moonRadius * 0.1, moonRadius * 0.3, moonRadius * 0.15],
      [-moonRadius * 0.1, moonRadius * 0.4, moonRadius * 0.1],
      [moonRadius * 0.4, -moonRadius * 0.1, moonRadius * 0.22]
    ]);
    skyCtx.restore();

    // 월식 텍스트 가이드
    skyCtx.font = '8px Noto Sans KR';
    skyCtx.fillStyle = 'rgba(239, 68, 68, 0.45)';
    skyCtx.fillText('본그림자 경계', cx - 25, cy - umbraRadius - 6);
    skyCtx.fillStyle = 'rgba(148, 163, 184, 0.45)';
    skyCtx.fillText('반그림자 경계', cx - 25, cy - penumbraRadius - 6);
    skyCtx.fillText('달', mx - 4, my - moonRadius - 6);
  }
}

// 달 표면 크레이터 질감 렌더링 헬퍼
function crawCraters(ctx, cx, cy, list) {
  list.forEach(c => {
    const x = cx + c[0];
    const y = cy + c[1];
    const r = c[2];
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(x + 0.5, y + 0.5, r, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function render() {
  const eclipse = analyzeEclipse();
  updateInfoPanel(eclipse);
  drawSpaceView();
  drawObserverView(eclipse);
}

// 윈도우 리사이즈 대응
window.addEventListener('resize', render);

// 프로그램 시작 초기화
switchTab('solar');
render();

// === 원리 설명 모달 ===
const principleModal = document.getElementById('principleModal');
const principleBtn = document.querySelector('.principle-btn');
const closeModalBtn = document.getElementById('closeModal');

principleBtn.addEventListener('click', () => {
  principleModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
  principleModal.classList.add('hidden');
});

principleModal.addEventListener('click', (e) => {
  if (e.target === principleModal) {
    principleModal.classList.add('hidden');
  }
});

// === 관찰자 시점 확대/축소 ===
const observerView = document.getElementById('observerView');
const observerExpandBtn = document.getElementById('observerExpandBtn');

observerExpandBtn.addEventListener('click', () => {
  observerView.classList.toggle('expanded');
  const isExpanded = observerView.classList.contains('expanded');
  
  // 아이콘 전환 (확대 ↔ 축소)
  observerExpandBtn.innerHTML = isExpanded
    ? `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="4 14 10 14 10 20"></polyline>
        <polyline points="20 10 14 10 14 4"></polyline>
        <line x1="14" y1="10" x2="21" y2="3"></line>
        <line x1="3" y1="21" x2="10" y2="14"></line>
      </svg>`
    : `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 3 21 3 21 9"></polyline>
        <polyline points="9 21 3 21 3 15"></polyline>
        <line x1="21" y1="3" x2="14" y2="10"></line>
        <line x1="3" y1="21" x2="10" y2="14"></line>
      </svg>`;
  
  // 트랜지션 완료 후 캔버스 리사이즈 및 재렌더링
  setTimeout(() => { render(); }, 420);
});

// === 뒤로가기 버튼 ===
const backBtn = document.querySelector('.back-btn');
if (backBtn) {
  backBtn.addEventListener('click', () => {
    window.location.href = '../index.html';
  });
}

// === 제어 패널 접기/열기 ===
if (btnTogglePanel && controlCard) {
  btnTogglePanel.addEventListener('click', () => {
    const isCollapsed = controlCard.classList.toggle('collapsed');
    btnTogglePanel.textContent = isCollapsed ? '열기 ☰' : '접기 ✕';
  });
}
