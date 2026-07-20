// 렌츠의 법칙 시뮬레이션 스크립트

// === 1. DOM 요소 취득 ===
const canvas = document.getElementById('lenzCanvas');
const ctx = canvas.getContext('2d');

const btnTheory = document.getElementById('btn-theory');
const theoryModal = document.getElementById('theoryModal');
const closeModal = document.getElementById('closeModal');

const strengthSlider = document.getElementById('strengthSlider');
const strengthVal = document.getElementById('strengthVal');
const turnsSlider = document.getElementById('turnsSlider');
const turnsVal = document.getElementById('turnsVal');



const checkFields = document.getElementById('check-fields');
const checkInducedFields = document.getElementById('check-induced-fields');
const checkElectrons = document.getElementById('check-electrons');

// === 2. 물리 및 시뮬레이션 상태 변수 ===
let currentSim = 'coil'; // 'coil' (코일과 자석) 또는 'disk' (원판 낙하)
let simWidth = 800;
let simHeight = 600;

// 금속 원판 (Falling Disk)
const disk = {
  x: 400,
  y: 50,
  radius: 35,
  vy: 0,            // Y축 속도
  prevY: 50,        // 이전 프레임 Y 좌표 (드래그 속도 역산용)
  mass: 1.0,        // 질량
  material: 'aluminum', // 'copper', 'aluminum', 'brass'
  shape: 'solid',       // 'solid' (꽉 찬 원판), 'hole' (구멍 뚫림)
  isDragging: false,
  dragOffsetY: 0
};
// === 파이프 시뮬레이션 전용 객체 ===
const pipeMagnet = {
  x: 400,
  y: 100,
  width: 40,
  height: 60,
  vy: 0,
  prevY: 100,
  mass: 1.0,
  polarity: 's_down', // 's_down' (S극 아래), 'n_down' (N극 아래)
  isDragging: false,
  dragOffsetY: 0
};

const pipeCoil = {
  x: 400,
  y: 300,
  radius: 35,
  height: 80,
  turns: 5
};

let pipeVoltage = 0; // 유도 기전력

// 탭 전환 함수
window.switchTab = function(tabName) {
  currentSim = tabName;
  
  // 탭 버튼 스타일 갱신
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => btn.classList.remove('active'));
  if(tabName === 'coil') tabBtns[0].classList.add('active');
  else if(tabName === 'disk') tabBtns[1].classList.add('active');
  else if(tabName === 'pipe') tabBtns[2].classList.add('active');

  // 제어 패널 갱신
  document.getElementById('panel-coil').classList.add('hidden');
  document.getElementById('panel-disk').classList.add('hidden');
  document.getElementById('panel-pipe').classList.add('hidden');
  document.getElementById('panel-' + tabName).classList.remove('hidden');

  // 모드별 초기화
  if(tabName === 'disk') {
    disk.y = 50;
    disk.vy = 0;
    disk.prevY = 50;
  } else if (tabName === 'pipe') {
    pipeMagnet.y = 100;
    pipeMagnet.vy = 0;
    pipeMagnet.prevY = 100;
    pipeVoltage = 0;
  }
};

window.setPipePole = function(pole) {
  pipeMagnet.polarity = pole;
  document.getElementById('btn-pole-s').classList.remove('active');
  document.getElementById('btn-pole-n').classList.remove('active');
  if (pole === 's_down') document.getElementById('btn-pole-s').classList.add('active');
  else document.getElementById('btn-pole-n').classList.add('active');
};

// 자석 (Magnet)
const magnet = {
  x: 150,           // 중심 X 좌표 (픽셀 단위, 화면 좌표)
  y: 350,           // 중심 Y 좌표
  width: 160,       // 자석 길이
  height: 46,       // 자석 두께
  strength: 1.0,    // 자석 세기 (Tesla 상대값)
  polarity: 'NS',   // 'NS' (왼쪽 N, 오른쪽 S) 또는 'SN' (왼쪽 S, 오른쪽 N)
  vx: 0,            // 현재 X 속도
  prevX: 150,       // 이전 프레임 X
  isDragging: false,
  dragOffsetX: 0
};

// 코일 (Coil)
const coil = {
  x: 500,           // 코일 중심 X 좌표
  y: 350,           // 코일 중심 Y 좌표
  radius: 65,       // 코일 링 반경 (Y축 기준 높이)
  width: 120,       // 코일 뭉치 전체 길이
  turns: 2,         // 감은 수 (N)
  wireColor: '#d97706', // 코일 동선 색상
  backColor: '#78350f'  // 코일 뒷면 (가려지는 부분) 색상
};

// 검류계 (Galvanometer) - 화면 상단 중앙에 Canvas로 그림
const galvanometer = {
  x: 500,
  y: 120,
  radius: 70,
  angle: 0,         // 바늘 현재 각도 (라디안, 0 = 수직 위)
  targetAngle: 0,   // 기전력에 비례한 목표 각도
  vel: 0,           // 바늘 회전 속도 (물리 효과용)
  damping: 0.35,    // 회전 저항 (Damping - 요동 방지)
  springK: 0.12     // 원점으로 되돌아오는 스프링 상수
};

// 자동 운동 모드
let controlMode = 'manual'; // 'manual' or 'auto'
let autoTime = 0;

// 물리 연산 데이터
let flux = 0;       // 자속 (Weber 상대값)
let dfdt = 0;       // 자속 시간 변화율
let voltage = 0;    // 유도 기전력 (V)
let electronPhase = 0; // 전자의 흐름 애니메이션 페이즈

// 유도 자기장 효과 표시용 누적 타이머
let inducedFieldIntensity = 0; 


// === 3. 크기 동적 조절 (Resize) ===
function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const oldWidth = canvas.width || 800; // 이전 너비 보존
  
  canvas.width = rect.width;
  canvas.height = rect.height;
  simWidth = canvas.width;
  simHeight = canvas.height;
  
  // 모바일 가로 너비 기준 스케일 팩터 계산 (기준 폭: 800px)
  const baseScale = Math.min(1, simWidth / 800);
  
  // X 좌표 비율 이동 (화면 밖으로 벗어남 방지)
  const widthRatio = simWidth / oldWidth;
  if (!magnet.isDragging && controlMode === 'manual') {
    magnet.x *= widthRatio;
    magnet.prevX *= widthRatio;
  }
  
  // 코일, 원판 등 X 좌표 동적 할당 (정중앙 50% 지점에 앵커링)
  coil.x = simWidth * 0.5;
  disk.x = simWidth * 0.5;
  pipeMagnet.x = simWidth * 0.5;
  pipeCoil.x = simWidth * 0.5;
  pipeCoil.y = simHeight * 0.5;
  
  // 객체 크기 동적 스케일링
  magnet.width = 160 * baseScale;
  magnet.height = 46 * baseScale;
  
  coil.radius = 65 * baseScale;
  coil.width = 120 * baseScale;
  
  galvanometer.radius = 70 * baseScale;
  
  // 자석과 코일의 Y축 중심을 캔버스 높이 맞춤 조정
  magnet.y = simHeight * 0.58;
  coil.y = simHeight * 0.58;
  
  // 검류계 위치 조정
  galvanometer.x = coil.x;
  galvanometer.y = simHeight * 0.22;
}

window.addEventListener('resize', () => {
  resizeCanvas();
  draw();
});

// === 4. 이벤트 바인딩 (자석 설정 & 슬라이더) ===
strengthSlider.addEventListener('input', (e) => {
  magnet.strength = parseFloat(e.target.value);
  strengthVal.textContent = magnet.strength.toFixed(1) + ' T';
});

turnsSlider.addEventListener('input', (e) => {
  coil.turns = parseInt(e.target.value);
  turnsVal.textContent = coil.turns + ' 회';
});

window.setMagnetPolarity = function(pol) {
  magnet.polarity = pol;
  document.getElementById('btn-polarity-ns').classList.toggle('active', pol === 'NS');
  document.getElementById('btn-polarity-sn').classList.toggle('active', pol === 'SN');
};

window.setControlMode = function(mode) {
  controlMode = mode;
  document.getElementById('btn-mode-manual').classList.toggle('active', mode === 'manual');
  document.getElementById('btn-mode-auto').classList.toggle('active', mode === 'auto');
  if (mode === 'manual') magnet.x = simWidth * 0.2; 
};

window.setDiskMaterial = function(mat) {
  disk.material = mat;
  document.getElementById('btn-mat-copper').classList.toggle('active', mat === 'copper');
  document.getElementById('btn-mat-aluminum').classList.toggle('active', mat === 'aluminum');
  document.getElementById('btn-mat-brass').classList.toggle('active', mat === 'brass');
};

window.setDiskShape = function(shape) {
  disk.shape = shape;
  document.getElementById('btn-shape-solid').classList.toggle('active', shape === 'solid');
  document.getElementById('btn-shape-hole').classList.toggle('active', shape === 'hole');
};

function resetSimulation() {
  magnet.x = 150;
  magnet.vx = 0;
  magnet.prevX = 150;
  galvanometer.angle = 0;
  galvanometer.vel = 0;
  flux = 0;
  dfdt = 0;
  voltage = 0;
  
  disk.y = 50;
  disk.vy = 0;
  disk.prevY = 50;
}

// === 5. 마우스 및 터치 드래그 인터랙션 ===
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function onStart(e) {
  const pos = getMousePos(e);
  
  if (currentSim === 'coil') {
    if (controlMode === 'auto') return;
    const halfW = (magnet.width / 2) + 20; 
    const halfH = (magnet.height / 2) + 25; 
    if (pos.x >= magnet.x - halfW && pos.x <= magnet.x + halfW &&
        pos.y >= magnet.y - halfH && pos.y <= magnet.y + halfH) {
      magnet.isDragging = true;
      magnet.dragOffsetX = pos.x - magnet.x;
    }
  } else if (currentSim === 'disk') {
    const hitR = disk.radius + 20;
    const dx = pos.x - disk.x;
    const dy = pos.y - disk.y;
    if (dx*dx + dy*dy <= hitR*hitR) {
      disk.isDragging = true;
      disk.dragOffsetY = pos.y - disk.y;
      disk.vy = 0; 
      disk.prevY = disk.y;
    }
  } else if (currentSim === 'pipe') {
    const halfW = pipeMagnet.width/2 + 20;
    const halfH = pipeMagnet.height/2 + 20;
    // 줄 영역도 클릭 가능하게 확장 (자석 위쪽 중심에서 Y:0까지)
    const isHitMagnet = pos.x >= pipeMagnet.x - halfW && pos.x <= pipeMagnet.x + halfW &&
                        pos.y >= pipeMagnet.y - halfH && pos.y <= pipeMagnet.y + halfH;
    const isHitRope = pos.x >= pipeMagnet.x - 20 && pos.x <= pipeMagnet.x + 20 &&
                      pos.y >= 0 && pos.y < pipeMagnet.y;
                      
    if (isHitMagnet || isHitRope) {
      pipeMagnet.isDragging = true;
      pipeMagnet.dragOffsetY = pos.y - pipeMagnet.y;
      pipeMagnet.vy = 0;
      pipeMagnet.prevY = pipeMagnet.y;
    }
  }
}

function onMove(e) {
  if (e.cancelable && e.type.includes('touch')) {
    e.preventDefault();
  }
  const pos = getMousePos(e);
  
  if (currentSim === 'coil') {
    if (!magnet.isDragging || controlMode === 'auto') return;
    magnet.x = pos.x - magnet.dragOffsetX;
    const minX = magnet.width / 2;
    const maxX = simWidth - magnet.width / 2;
    if (magnet.x < minX) magnet.x = minX;
    if (magnet.x > maxX) magnet.x = maxX;
  } else if (currentSim === 'disk') {
    if (!disk.isDragging) return;
    disk.y = pos.y - disk.dragOffsetY;
    
    // 화면 위/아래 이탈 방지
    if (disk.y < 40) disk.y = 40;
    if (disk.y > simHeight - disk.radius - 20) disk.y = simHeight - disk.radius - 20;
  } else if (currentSim === 'pipe') {
    if (!pipeMagnet.isDragging) return;
    pipeMagnet.y = pos.y - pipeMagnet.dragOffsetY;
    if (pipeMagnet.y < 40) pipeMagnet.y = 40;
    if (pipeMagnet.y > simHeight - pipeMagnet.height/2 - 20) pipeMagnet.y = simHeight - pipeMagnet.height/2 - 20;
  }
}

function onEnd(e) {
  if (currentSim === 'coil') {
    magnet.isDragging = false;
  } else if (currentSim === 'disk') {
    disk.isDragging = false;
  } else if (currentSim === 'pipe') {
    pipeMagnet.isDragging = false;
  }
}

canvas.addEventListener('mousedown', onStart);
canvas.addEventListener('mousemove', onMove);
canvas.addEventListener('mouseup', onEnd);
canvas.addEventListener('mouseleave', onEnd);

canvas.addEventListener('touchstart', onStart, { passive: false });
canvas.addEventListener('touchmove', onMove, { passive: false });
canvas.addEventListener('touchend', onEnd);

// === 6. 모달 및 UI 토글 이벤트 제어 ===
btnTheory.addEventListener('click', () => theoryModal.classList.remove('hidden'));
closeModal.addEventListener('click', () => theoryModal.classList.add('hidden'));

// 패널 접기/펴기 (아코디언) 토글
const foldBtns = document.querySelectorAll('.fold-btn');
foldBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    const cardBody = this.parentElement.nextElementSibling;
    if (cardBody && cardBody.classList.contains('card-body')) {
      cardBody.classList.toggle('collapsed');
      if (cardBody.classList.contains('collapsed')) {
        this.textContent = '펴기 ▽';
      } else {
        this.textContent = '접기 ✕';
      }
    }
  });
});
theoryModal.addEventListener('click', (e) => {
  if (e.target === theoryModal) theoryModal.classList.add('hidden');
});

// === 7. 물리학 수식 및 자속(Flux) 계산 ===
// 막대자석의 양 끝극에서 방출되는 자기장을 적분하여 코일 루프를 지나는 자속을 계산합니다.
function calculateFluxAtX(magnetX) {
  // 물리적 차원 스케일링
  const scale = 0.05; 
  const mx = magnetX * scale;
  const cx = coil.x * scale;
  const cr = coil.radius * scale;
  
  // 자극간 간격
  const dPole = (magnet.width / 2) * scale;
  const pole1 = mx - dPole; // N극 (또는 S극, 방향에 따라 부호 변경)
  const pole2 = mx + dPole; // S극
  
  // 렌츠의 법칙 물리 기호 적용
  const polarityFactor = magnet.polarity === 'NS' ? 1 : -1;
  const strength = magnet.strength * polarityFactor * 25.0;

  // 단일 루프에서의 자속 함수: $\Phi = B \cdot A$
  // 무한소 링 전자기 공식의 근사화
  const fluxFromPole = (xPole, xRing) => {
    const dx = xRing - xPole;
    // 코일면을 지나는 자속: 거리가 가까울수록(abs(dx)->0) 최대(1)가 되는 올바른 입체각 공식
    return Math.sign(dx) * (1 - Math.abs(dx) / Math.sqrt(dx * dx + cr * cr));
  };

  let totalFlux = 0;
  // 코일의 두께 범위에 걸쳐 여러 개 루프 자속을 합산
  const numLoops = 15;
  const startX = cx - (coil.width / 2) * scale;
  const endX = cx + (coil.width / 2) * scale;
  
  for (let i = 0; i < numLoops; i++) {
    const xRing = startX + (i / (numLoops - 1)) * (endX - startX);
    // 양 극의 영향을 차감하여 쌍극자 자속 계산
    totalFlux += (fluxFromPole(pole1, xRing) - fluxFromPole(pole2, xRing));
  }
  
  return totalFlux * strength / numLoops;
}

// === 8. 시뮬레이션 프레임 업데이트 (Update Loop) ===
function updatePhysics() {
  const dt = 1 / 60; // 60fps 가정
  
  if (currentSim === 'coil') {
    // 1. 자석 위치 및 속도 계산
    if (controlMode === 'auto') {
      autoTime += dt * 1.2; 
      const center = simWidth * 0.45;
      const range = simWidth * 0.35;
      magnet.x = center + Math.sin(autoTime) * range;
      magnet.vx = Math.cos(autoTime) * range * 1.2; 
    } else {
      // 수동 드래그 속도 역산
      magnet.vx = (magnet.x - magnet.prevX) / dt;
      magnet.prevX = magnet.x;
    }

    // 2. 자속 및 기전력 계산
    const currentFlux = calculateFluxAtX(magnet.x);
    dfdt = (currentFlux - flux) / dt;
    flux = currentFlux;

    // $V = -N * d\Phi/dt$
    voltage = -coil.turns * dfdt;

    // 전자 흐름 애니메이션 페이즈 누적
    if (checkElectrons.checked) {
      electronPhase += voltage * 0.01;
    }

    // 3. 검류계 바늘 물리 계산 (진동자 모델)
    galvanometer.targetAngle = -voltage * 0.015; 
    if (galvanometer.targetAngle > Math.PI/3) galvanometer.targetAngle = Math.PI/3;
    if (galvanometer.targetAngle < -Math.PI/3) galvanometer.targetAngle = -Math.PI/3;

    const deltaAngle = galvanometer.angle - galvanometer.targetAngle;
    const acc = -galvanometer.springK * deltaAngle - galvanometer.damping * galvanometer.vel;
    galvanometer.vel += acc;
    galvanometer.angle += galvanometer.vel;

    // 유도 자기장 효과 강도 조절
    if (Math.abs(voltage) > 0.05) {
      inducedFieldIntensity = Math.min(1, inducedFieldIntensity + 0.15);
    } else {
      inducedFieldIntensity = Math.max(0, inducedFieldIntensity - 0.08);
    }
  } else if (currentSim === 'disk') {
    // 금속 원판 물리 시뮬레이션
    if (disk.isDragging) {
      // 마우스 드래그 속도 역산 (위로 던지는 관성 및 실시간 저항 관찰용)
      disk.vy = (disk.y - disk.prevY) / dt;
      disk.prevY = disk.y;
    } else {
      // 단위: px, px/s, px/s^2
      const SCALE = 100; // 시각적 스케일 (1m = 100px)
      const g_px = 9.8 * SCALE; // 중력 가속도 (픽셀 단위)
      let dampingAcc = 0;

      // 자석 레일 (가운데 영역)을 지날 때 맴돌이 전류에 의한 저항 발생
      // 모바일 등 세로가 짧은 해상도를 고려해 유동적 여백 적용 (최소 60px)
      const marginY = Math.min(150, Math.max(60, simHeight * 0.15));
      const railTop = marginY;
      const railBottom = simHeight - marginY;
      
      if (disk.y > railTop - disk.radius && disk.y < railBottom + disk.radius) {
        // 속도에 비례한 저항 계수 (렌츠의 법칙: 운동을 방해)
        let k = 0; 
        if (disk.material === 'copper') k = 18.0; // 매우 강한 저항
        else if (disk.material === 'aluminum') k = 6.0; // 중간 저항
        else if (disk.material === 'brass') k = 1.0; // 약한 저항
        
        // 구멍이 뚫리면 와전류 형성 방해
        if (disk.shape === 'hole') {
          k *= 0.1; // 저항 상실
        }
        
        // 저항 가속도 a = -k * v
        dampingAcc = -k * disk.vy;
      }
      
      // 총 가속도
      const totalAcc = g_px + dampingAcc;
      
      // 속도 및 위치 적분 (오일러)
      disk.vy += totalAcc * dt;
      disk.y += disk.vy * dt;
      
      // 바닥 충돌 처리 (튀어오름 방지 및 상단 이탈 방지)
      if (disk.y > simHeight - disk.radius - 20) {
        disk.y = simHeight - disk.radius - 20;
        disk.vy = 0;
      } else if (disk.y < 40) {
        disk.y = 40;
        disk.vy = 0;
      }
      
      disk.prevY = disk.y;
    }
  } else if (currentSim === 'pipe') {
    // 파이프 자석 낙하 물리 시뮬레이션
    if (pipeMagnet.isDragging) {
      pipeMagnet.vy = (pipeMagnet.y - pipeMagnet.prevY) / dt;
      pipeMagnet.prevY = pipeMagnet.y;
    } else {
      const g = 980; // 픽셀 스케일 중력 가속도 (9.8 * 100)
      let damping = 0;
      
      // 코일(금속) 내부를 지날 때 발생하는 약한 맴돌이 전류 제동력
      if (Math.abs(pipeMagnet.y - pipeCoil.y) < pipeCoil.height) {
        damping = -2.0 * pipeMagnet.vy;
      }
      
      const acc = g + damping;
      pipeMagnet.vy += acc * dt;
      pipeMagnet.y += pipeMagnet.vy * dt;
      
      // 바닥 및 천장 충돌
      const maxH = simHeight - pipeMagnet.height/2 - 20;
      if (pipeMagnet.y > maxH) {
        pipeMagnet.y = maxH;
        pipeMagnet.vy = 0;
      } else if (pipeMagnet.y < 40) {
        pipeMagnet.y = 40;
        pipeMagnet.vy = 0;
      }
      pipeMagnet.prevY = pipeMagnet.y;
    }

    // 패러데이 유도 기전력(전압) 계산
    // 코일에 들어갈 때와 나갈 때 자속 변화율(dΦ/dt)을 모델링
    const dy = pipeMagnet.y - pipeCoil.y; 
    // 가우스 함수의 도함수를 이용해 거리와 속도에 비례하는 자속 변화(유도 기전력) 모사
    // V = - (dΦ/dy) * vy
    const sigma = 60.0;
    const fluxGradient = -(dy / (sigma * sigma)) * Math.exp(-(dy * dy) / (2 * sigma * sigma));
    
    // N극이 아래면 극성 반전
    let polarityFactor = (pipeMagnet.polarity === 's_down') ? 1 : -1;
    
    // 최종 기전력
    pipeVoltage = -pipeCoil.turns * fluxGradient * pipeMagnet.vy * polarityFactor * 2.0;
  }
}

// === 9. 캔버스 그리기 함수군 (Render Framework) ===

// 9-1. 자석 자기장 선 그리기 (Magnetic Field Lines)
function drawMagnetFieldLines() {
  if (!checkFields.checked) return;

  const polarityFactor = magnet.polarity === 'NS' ? 1 : -1;
  const numLines = 8;
  const maxExtend = 320;
  
  ctx.save();
  ctx.lineWidth = 1.3;

  for (let i = 0; i < numLines; i++) {
    // 자극 상단/하단 오프셋 비율 계산
    const offsetRatio = (i / (numLines - 1)) * 2 - 1;
    const absOffset = Math.abs(offsetRatio);
    const startY = magnet.y + offsetRatio * (magnet.height * 0.35);

    // 극성 좌우 위치 결정
    const leftX = magnet.x - magnet.width/2;
    const rightX = magnet.x + magnet.width/2;

    // 자기선속 선 곡선 제어
    const controlOffset = 50 + (1 - absOffset) * 120;
    
    // 1. 우측에서 좌측으로 이어지는 거대한 루프선 그리기
    ctx.beginPath();
    ctx.moveTo(rightX, startY);
    ctx.bezierCurveTo(
      rightX + controlOffset, startY + offsetRatio * 180,
      leftX - controlOffset, startY + offsetRatio * 180,
      leftX, startY
    );
    
    // 자기장 색상 그라데이션 (N에서 나와 S로 들어감)
    // N극은 빨강, S극은 파랑 네온 효과
    const isRedStart = magnet.polarity === 'NS'; // NS면 우측이 S극(파랑), 좌측이 N극(빨강)
    const strokeGrad = ctx.createLinearGradient(leftX, startY, rightX, startY);
    strokeGrad.addColorStop(0, isRedStart ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)');
    strokeGrad.addColorStop(0.5, 'rgba(34, 211, 238, 0.05)');
    strokeGrad.addColorStop(1, isRedStart ? 'rgba(59, 130, 246, 0.12)' : 'rgba(239, 68, 68, 0.12)');
    
    ctx.strokeStyle = strokeGrad;
    ctx.stroke();

    // 2. 극 근처의 조밀한 미세선 흐름 입자 효과 추가
    if (Math.abs(magnet.vx) > 5) {
      // 움직일 때 자기장의 흐름을 시각적으로 보여주는 작은 도트 흐름
      const flowT = (Date.now() * 0.002 * (magnet.strength)) % 1;
      // 베지에 곡선 위 좌표 계산을 위한 2차 곡선 보간
      const getBezierPoint = (t, p0, p1, p2, p3) => {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;
        return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
      };

      const dotX = getBezierPoint(
        flowT, 
        isRedStart ? leftX : rightX, 
        isRedStart ? leftX - controlOffset : rightX + controlOffset,
        isRedStart ? rightX + controlOffset : leftX - controlOffset,
        isRedStart ? rightX : leftX
      );
      
      const dotY = getBezierPoint(
        flowT,
        startY,
        startY + offsetRatio * 180,
        startY + offsetRatio * 180,
        startY
      );

      ctx.fillStyle = isRedStart ? 'rgba(239, 68, 68, 0.35)' : 'rgba(59, 130, 246, 0.35)';
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// 9-2. 자석 본체 그리기
function drawMagnet() {
  const leftX = magnet.x - magnet.width/2;
  const topY = magnet.y - magnet.height/2;
  const halfW = magnet.width / 2;

  ctx.save();

  // 드래그 시 글로우 효과
  if (magnet.isDragging) {
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
  } else {
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  }

  // 1. 왼쪽 극 반쪽
  ctx.fillStyle = magnet.polarity === 'NS' ? '#ef4444' : '#3b82f6';
  ctx.beginPath();
  ctx.roundRect(leftX, topY, halfW, magnet.height, [8, 0, 0, 8]);
  ctx.fill();

  // 2. 오른쪽 극 반쪽
  ctx.fillStyle = magnet.polarity === 'NS' ? '#3b82f6' : '#ef4444';
  ctx.beginPath();
  ctx.roundRect(magnet.x, topY, halfW, magnet.height, [0, 8, 8, 0]);
  ctx.fill();

  // 글로우 해제
  ctx.shadowBlur = 0;

  // 입체감 반사광 추가 (하이라이트 그라데이션)
  const grad = ctx.createLinearGradient(leftX, topY, leftX, topY + magnet.height);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
  grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
  grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
  
  ctx.fillStyle = grad;
  ctx.fillRect(leftX, topY, magnet.width, magnet.height);

  // 극성 텍스트 표시
  ctx.font = "900 16px 'Noto Sans KR', sans-serif";
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (magnet.polarity === 'NS') {
    ctx.fillText('N', leftX + halfW * 0.5, magnet.y);
    ctx.fillText('S', magnet.x + halfW * 0.5, magnet.y);
  } else {
    ctx.fillText('S', leftX + halfW * 0.5, magnet.y);
    ctx.fillText('N', magnet.x + halfW * 0.5, magnet.y);
  }

  ctx.restore();
}

// 9-3. 코일 그리기 (앞면 / 뒷면 구분 렌더링)
// 'drawPart' 매개변수: 'back' 이면 자석보다 뒤에 있는 선, 'front' 이면 자석 앞쪽에 보여서 덮는 선
function drawCoil(drawPart) {
  const cx = coil.x;
  const cy = coil.y;
  const radius = coil.radius;
  const turns = coil.turns;
  
  ctx.save();
  // 감은 수가 많아질수록 굵기를 얇게 조절
  ctx.lineWidth = Math.max(1.5, 7 - (turns / 15));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const startX = cx - coil.width / 2;
  const endX = cx + coil.width / 2;
  const stepX = (endX - startX) / Math.max(1, turns);
  
  // 보빈(코일 뼈대) 렌더링 (뒷면 그릴 때 한 번만)
  if (drawPart === 'back') {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startX, cy - radius);
    ctx.lineTo(endX, cy - radius);
    ctx.ellipse(endX, cy, radius * 0.25, radius, 0, -Math.PI/2, Math.PI/2, false);
    ctx.lineTo(startX, cy + radius);
    ctx.ellipse(startX, cy, radius * 0.25, radius, 0, Math.PI/2, -Math.PI/2, false);
    ctx.fill();
    ctx.stroke();
    
    for (let i = 0; i <= 10; i++) {
        let lx = startX + (coil.width/10)*i;
        ctx.beginPath();
        ctx.ellipse(lx, cy, radius * 0.25, radius, 0, -Math.PI/2, Math.PI/2, false);
        ctx.stroke();
    }
    ctx.restore();
  }

  if (drawPart === 'back') {
    ctx.strokeStyle = coil.backColor;
  } else if (drawPart === 'front') {
    ctx.strokeStyle = coil.wireColor;
  }

  const segmentsPerTurn = 40; 
  
  for (let t = 0; t < turns; t++) {
     if (drawPart === 'front' && checkElectrons.checked && Math.abs(voltage) > 0.05) {
       ctx.shadowBlur = Math.max(2, 10 - (turns / 10));
       ctx.shadowColor = voltage > 0 ? 'rgba(249, 115, 22, 0.6)' : 'rgba(16, 185, 129, 0.6)';
     }

     ctx.beginPath();
     let startDeg = drawPart === 'back' ? 90 : -90;
     let endDeg = drawPart === 'back' ? 270 : 90;
     
     for (let i = 0; i <= segmentsPerTurn / 2; i++) {
        let phase = i / (segmentsPerTurn / 2); 
        let deg = startDeg + (endDeg - startDeg) * phase;
        let rad = deg * Math.PI / 180;
        let globalTurn = t + (deg + 90) / 360; 
        
        let px = startX + globalTurn * stepX;
        let py = cy + Math.sin(rad) * radius;
        px += Math.cos(rad) * (radius * 0.25);

        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
     }
     ctx.stroke();
     ctx.shadowBlur = 0;
     
     if (drawPart === 'front') {
       // 화살표 렌더링 빈도를 1/5 로 감소시킴
       const electronStep = Math.max(1, Math.floor(turns / 5));
       if (checkElectrons.checked && Math.abs(voltage) > 0.02 && (t % electronStep === 0)) {
         // 입자 개수도 8개에서 4개로 감소
         const numParticles = 4;
         ctx.fillStyle = '#ffffff';
         ctx.shadowBlur = 6;
         // 전류 방향에 따른 글로우 색상
         ctx.shadowColor = voltage > 0 ? '#f97316' : '#10b981'; 

         for (let p = 0; p < numParticles; p++) {
           const phaseOffset = (p / numParticles);
           let ePhase = (phaseOffset + electronPhase) % 1;
           if (ePhase < 0) ePhase += 1;
           
           let eDeg = -90 + 180 * ePhase;
           let eRad = eDeg * Math.PI / 180;
           let eGlobalTurn = t + (eDeg + 90) / 360;
           let ex = startX + eGlobalTurn * stepX;
           let ey = cy + Math.sin(eRad) * radius;
           ex += Math.cos(eRad) * (radius * 0.25);

           // 미분을 통한 곡선의 접선(방향) 계산
           const dx = -(radius * 0.25) * Math.sin(eRad);
           const dy = radius * Math.cos(eRad);
           let arrowAngle = Math.atan2(dy, dx);
           
           // 전압 방향에 따라 화살표 머리 방향 결정 (물리 공식 정상화로 원복)
           if (voltage < 0) {
               arrowAngle += Math.PI;
           }

           ctx.save();
           ctx.translate(ex, ey);
           ctx.rotate(arrowAngle);
           
           // 잔상 꼬리 (Comet tail) 그라데이션 - 착시 방지
           const tailLength = 25;
           const tailGrad = ctx.createLinearGradient(5, 0, -tailLength, 0);
           const baseRgb = voltage > 0 ? '249, 115, 22' : '16, 185, 129';
           tailGrad.addColorStop(0, `rgba(${baseRgb}, 0.9)`);
           tailGrad.addColorStop(1, `rgba(${baseRgb}, 0.0)`);
           
           // 꼬리 몸통 그리기
           ctx.fillStyle = tailGrad;
           ctx.beginPath();
           ctx.moveTo(5, 0);
           ctx.lineTo(-tailLength, -2.5);
           ctx.lineTo(-tailLength, 2.5);
           ctx.closePath();
           ctx.fill();
           
           // 화살표 머리(Head) 강조
           ctx.fillStyle = '#ffffff';
           ctx.beginPath();
           ctx.moveTo(8, 0);
           ctx.lineTo(-4, -5);
           ctx.lineTo(-2, 0); // 제비꼬리 모양
           ctx.lineTo(-4, 5);
           ctx.closePath();
           ctx.fill();
           
           ctx.restore();
         }
         ctx.shadowBlur = 0;
       }
     }
  }

  ctx.restore();
}

// 9-4. 코일 검류계 연결 도선 그리기
function drawConnectingWires() {
  ctx.save();
  ctx.lineCap = 'round';  // 선 끝단 둥글게 처리하여 뭉툭한 단면 방지
  ctx.lineJoin = 'round'; // 선 꺾임 둥글게 처리
  
  // 코일의 좌우 양 끝단(꼭대기)에서 도선이 뻗어 나오도록 좌표 재설정
  const leftX = coil.x - coil.width/2;
  const rightX = coil.x + coil.width/2;
  const topY = coil.y - coil.radius;

  // 검류계의 두 바인더 터미널 좌표 (좌/우 측면)
  const gLeftX = galvanometer.x - galvanometer.radius - 2;
  const gRightX = galvanometer.x + galvanometer.radius + 2;
  const gY = galvanometer.y;

  // 외부 회색 도선 굵기를 코일 두께에 비례하여 조정 (이질감 완화)
  const coilThick = Math.max(1.5, 7 - (coil.turns / 15));
  ctx.strokeStyle = '#475569'; 
  ctx.lineWidth = Math.max(3, coilThick * 0.85); 
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 왼쪽 단자선 (검류계에서 측면으로 나와 수직으로 떨어진 후, 코일 꼭대기 궤적을 수평으로 타고 들어감)
  ctx.beginPath();
  ctx.moveTo(gLeftX, gY);
  ctx.bezierCurveTo(
    gLeftX - 30, gY + 60,     // 수직으로 부드럽게 꺾여 내려옴
    leftX - 40, topY,         // 코일 상단과 정확히 같은 높이에서 수평(코일 곡률)으로 파고듦
    leftX, topY
  );
  ctx.stroke();

  // 오른쪽 단자선 (검류계에서 측면으로 나와 수직으로 떨어진 후, 코일 꼭대기 궤적을 수평으로 타고 들어감)
  ctx.beginPath();
  ctx.moveTo(gRightX, gY);
  ctx.bezierCurveTo(
    gRightX + 30, gY + 60, 
    rightX + 40, topY,        // 코일 상단과 정확히 같은 높이에서 수평(코일 곡률)으로 파고듦
    rightX, topY
  );
  ctx.stroke();

  ctx.restore();
}

// 9-5. 검류계 (Galvanometer Instrument) 렌더링
function drawGalvanometerInstrument() {
  const gx = galvanometer.x;
  const gy = galvanometer.y;
  const r = galvanometer.radius;

  ctx.save();
  
  // 1. 하우징 베이스 플레이트 (다크 메탈 플레이트)
  ctx.shadowBlur = 12;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(gx, gy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 2. 검류계 아치 눈금 패널
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(gx, gy, r - 8, Math.PI, 0, false);
  ctx.fill();

  // 눈금 눈금자 그리기 (G 및 눈금 표시)
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  
  const tickRadius = r - 16;
  for (let deg = -60; deg <= 60; deg += 15) {
    const rad = (deg - 90) * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    ctx.beginPath();
    ctx.moveTo(gx + cos * (tickRadius - 5), gy + sin * (tickRadius - 5));
    ctx.lineTo(gx + cos * tickRadius, gy + sin * tickRadius);
    ctx.stroke();

    // 방향 지시 텍스트 표시 (-/+ 기호 대신 실제 전류 방향을 ◀, ▶ 로 표시)
    if (deg === -60) {
      ctx.fillText('◀', gx + cos * (tickRadius - 14), gy + sin * (tickRadius - 14) + 3);
    } else if (deg === 0) {
      ctx.fillText('0', gx + cos * (tickRadius - 14), gy + sin * (tickRadius - 14) + 3);
    } else if (deg === 60) {
      ctx.fillText('▶', gx + cos * (tickRadius - 14), gy + sin * (tickRadius - 14) + 3);
    }
  }

  // 중앙의 대문자 'G' 표시
  ctx.font = "bold 20px 'Noto Sans KR', sans-serif";
  ctx.fillStyle = '#22d3ee';
  ctx.fillText('G', gx, gy + r * 0.4);

  // 3. 진동하는 바늘 (Needle)
  ctx.save();
  ctx.translate(gx, gy + 15);
  ctx.rotate(galvanometer.angle);

  // 바늘 네온 글로우
  ctx.shadowBlur = 6;
  ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  // 회전축(피벗)이 gy + 15로 아래로 내려갔으므로, 바늘 끝이 눈금에 닿기 위해서는 길이를 15만큼 보정해 주어야 합니다.
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -tickRadius - 15);
  ctx.stroke();
  ctx.restore();

  // 바늘 앵커 피벗 너트
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.arc(gx, gy + 15, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#fff';
  ctx.stroke();

  ctx.restore();
}

// 9-6. 유도 자기장 화살표 시각화 (Induced Magnetic Field)
function drawInducedMagneticField() {
  if (!checkInducedFields.checked || inducedFieldIntensity <= 0.01) return;

  const cx = coil.x;
  const cy = coil.y;
  
  ctx.save();
  ctx.globalAlpha = inducedFieldIntensity;

  // 유도 기전력(전압)의 극성에 따라 유도되는 자기장의 방향(좌/우)이 정해집니다.
  const isRightDirection = voltage > 0;
  
  // 유도 극성 판별 및 텍스트 
  let polarityLeftText = "";
  let polarityRightText = "";
  
  // 렌츠의 법칙: 기전력(voltage) 부호만으로 유도 자기장의 방향이 결정됩니다.
  // voltage > 0 (S극 접근 또는 N극 후퇴): 코일 왼쪽에 S극, 오른쪽에 N극 유도 (자기장 방향: ➔)
  // voltage < 0 (N극 접근 또는 S극 후퇴): 코일 왼쪽에 N극, 오른쪽에 S극 유도 (자기장 방향: ⬅)
  polarityLeftText = isRightDirection ? "S" : "N";
  polarityRightText = isRightDirection ? "N" : "S";

  // 1. 코일 양 끝단 극성 표시
  ctx.font = "bold 18px 'Noto Sans KR', sans-serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 왼쪽 유도극
  ctx.fillStyle = polarityLeftText === 'N' ? '#ef4444' : '#3b82f6';
  ctx.fillText(polarityLeftText + '극 유도', cx - coil.width/2 - 45, cy - 25);
  
  // 오른쪽 유도극
  ctx.fillStyle = polarityRightText === 'N' ? '#ef4444' : '#3b82f6';
  ctx.fillText(polarityRightText + '극 유도', cx + coil.width/2 + 45, cy - 25);

  // 2. 유도 자기장 메인 벡터 화살표
  const arrowY = cy + coil.radius + 35;
  ctx.lineWidth = 5;
  ctx.strokeStyle = isRightDirection ? '#f97316' : '#10b981';
  ctx.fillStyle = isRightDirection ? '#f97316' : '#10b981';
  
  const startX = isRightDirection ? cx - 80 : cx + 80;
  const endX = isRightDirection ? cx + 80 : cx - 80;

  ctx.beginPath();
  ctx.moveTo(startX, arrowY);
  ctx.lineTo(endX, arrowY);
  ctx.stroke();

  // 화살표 머리(Head)
  const headSize = 10;
  const angle = isRightDirection ? 0 : Math.PI;
  ctx.beginPath();
  ctx.moveTo(endX, arrowY);
  ctx.lineTo(endX - headSize * Math.cos(angle - Math.PI/6), arrowY - headSize * Math.sin(angle - Math.PI/6));
  ctx.lineTo(endX - headSize * Math.cos(angle + Math.PI/6), arrowY - headSize * Math.sin(angle + Math.PI/6));
  ctx.closePath();
  ctx.fill();

  // 화살표 텍스트 라벨
  ctx.font = "bold 12px 'Noto Sans KR', sans-serif";
  ctx.fillStyle = '#fff';
  ctx.fillText('유도 자기장 방향', cx, arrowY - 12);

  ctx.restore();
}


function drawFallingDiskScene() {
  const cx = simWidth * 0.5;
  // 모바일 등 세로가 짧은 해상도를 고려해 유동적 여백 적용 (최소 60px)
  const marginY = Math.min(150, Math.max(60, simHeight * 0.15));
  const railTop = marginY;
  const railBottom = simHeight - marginY;
  
  // 1. 수직 자석 레일 (양 옆)
  const railW = 40;
  const railDist = disk.radius + 15;
  
  // 왼쪽 레일 (N극)
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(cx - railDist - railW, railTop, railW, railBottom - railTop);
  ctx.fillStyle = '#fff';
  ctx.font = "bold 20px 'Noto Sans KR'";
  ctx.textAlign = 'center';
  ctx.fillText('N', cx - railDist - railW/2, (railTop + railBottom)/2);
  
  // 오른쪽 레일 (S극)
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(cx + railDist, railTop, railW, railBottom - railTop);
  ctx.fillStyle = '#fff';
  ctx.fillText('S', cx + railDist + railW/2, (railTop + railBottom)/2);

  // 2. 금속 원판
  ctx.save();
  ctx.translate(disk.x, disk.y);
  
  // 재질별 색상
  if (disk.material === 'copper') ctx.fillStyle = '#b87333';
  else if (disk.material === 'aluminum') ctx.fillStyle = '#d4d4d8';
  else if (disk.material === 'brass') ctx.fillStyle = '#eab308';
  
  ctx.beginPath();
  ctx.arc(0, 0, disk.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#333';
  ctx.stroke();

  // 구멍 뚫린 원판 처리
  if (disk.shape === 'hole') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(0, 0, disk.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    
    ctx.beginPath();
    ctx.arc(0, 0, disk.radius * 0.4, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // 와전류 시각화 효과 (속도가 빠를 때 레일 구간에서)
    if (disk.y > railTop - disk.radius && disk.y < railBottom + disk.radius && Math.abs(disk.vy) > 10) {
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
      ctx.lineWidth = 2;
      const t = Date.now() * 0.01;
      for (let i=0; i<3; i++) {
        const r = disk.radius * 0.3 + ((t + i*5) % 15);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI*2);
        ctx.stroke();
      }
    }
  }
  
  // 3. 힘 화살표 그리기 (렌츠의 법칙 - 운동을 방해하는 반대 방향)
  if (Math.abs(disk.vy) > 1 && disk.y > railTop - disk.radius && disk.y < railBottom + disk.radius) {
    ctx.fillStyle = '#10b981';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    
    // vy가 양수(아래로 떨어짐)이면 화살표는 위로(음수 Y)
    // vy가 음수(위로 올라감)이면 화살표는 아래로(양수 Y)
    const direction = -Math.sign(disk.vy); 

    // 시각적 효과를 위해 재질별 화살표 최대 길이를 명확하게 차등 부여
    // (물리적 종단속도 평형을 무시하고 "전도도에 따른 저항의 차이"를 교육적으로 강조하기 위함)
    let maxArrowLen = 0;
    if (disk.material === 'copper') maxArrowLen = 110;       // 구리: 강한 저항 (가장 김)
    else if (disk.material === 'aluminum') maxArrowLen = 50; // 알루미늄: 중간 저항
    else if (disk.material === 'brass') maxArrowLen = 15;    // 황동: 약한 저항 (가장 짧음)
    
    // 구멍 뚫린 원판이면 와전류가 상실되므로 화살표 길이 대폭 축소
    if (disk.shape === 'hole') {
      maxArrowLen *= 0.15; 
    }

    // 속도가 있을 때 서서히 길어지도록 조절하되, maxArrowLen을 넘지 않도록 제한
    const arrowLen = Math.min(Math.abs(disk.vy) * 1.5, maxArrowLen);
    
    // 시작점 (원판 경계)
    const arrowStartY = direction * (disk.radius + 5);
    const arrowEndY = arrowStartY + direction * arrowLen;
    
    ctx.beginPath();
    ctx.moveTo(0, arrowStartY);
    ctx.lineTo(0, arrowEndY);
    ctx.stroke();
    
    // 화살표 머리
    ctx.beginPath();
    ctx.moveTo(0, arrowEndY);
    ctx.lineTo(-8, arrowEndY - direction * 8);
    ctx.lineTo(8, arrowEndY - direction * 8);
    ctx.fill();
    
    ctx.font = "bold 14px 'Noto Sans KR'";
    ctx.fillStyle = '#10b981';
    const textY = arrowEndY + (direction < 0 ? -15 : 20);
    ctx.fillText('자기력(저항)', 0, textY);
  }

  ctx.restore();
}

// === 9-4. 파이프 속 자석 낙하 시뮬레이션 (LED) ===
function drawPipeScene() {
  const cx = simWidth * 0.5;
  
  // 파이프 (투명 관) 그리기
  const pipeW = pipeMagnet.width + 15;
  const pipeTop = 40;
  const pipeBottom = simHeight - 40;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fillRect(cx - pipeW/2, pipeTop, pipeW, pipeBottom - pipeTop);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - pipeW/2, pipeTop, pipeW, pipeBottom - pipeTop);
  
  // 코일 뒷부분 그리기
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;
  for (let i = 0; i < pipeCoil.turns; i++) {
    const y = pipeCoil.y - pipeCoil.height/2 + (i + 0.5) * (pipeCoil.height / pipeCoil.turns);
    ctx.beginPath();
    ctx.ellipse(cx, y - 5, pipeW/2 + 5, 8, 0, 0, Math.PI, true);
    ctx.stroke();
  }

  // 자석 그리기 (가운데)
  const isSDown = pipeMagnet.polarity === 's_down';
  const topColor = isSDown ? '#ef4444' : '#3b82f6'; // S_down 이면 위가 N(빨강)
  const bottomColor = isSDown ? '#3b82f6' : '#ef4444'; 
  const topText = isSDown ? 'N' : 'S';
  const bottomText = isSDown ? 'S' : 'N';
  
  ctx.save();
  ctx.translate(cx, pipeMagnet.y);
  
  // 윗극
  ctx.fillStyle = topColor;
  ctx.fillRect(-pipeMagnet.width/2, -pipeMagnet.height/2, pipeMagnet.width, pipeMagnet.height/2);
  ctx.fillStyle = 'white';
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(topText, 0, -pipeMagnet.height/4);
  
  // 아랫극
  ctx.fillStyle = bottomColor;
  ctx.fillRect(-pipeMagnet.width/2, 0, pipeMagnet.width, pipeMagnet.height/2);
  ctx.fillStyle = 'white';
  ctx.fillText(bottomText, 0, pipeMagnet.height/4);
  
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(-pipeMagnet.width/2, -pipeMagnet.height/2, pipeMagnet.width, pipeMagnet.height);
  ctx.restore();

  // 자석을 매단 빨간 줄
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 4;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, pipeMagnet.y - pipeMagnet.height/2);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // 코일 앞부분 그리기
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 4;
  for (let i = 0; i < pipeCoil.turns; i++) {
    const y = pipeCoil.y - pipeCoil.height/2 + (i + 0.5) * (pipeCoil.height / pipeCoil.turns);
    ctx.beginPath();
    ctx.ellipse(cx, y, pipeW/2 + 5, 8, 0, 0, Math.PI, false);
    ctx.stroke();
  }

  // 양쪽 LED 및 회로선 그리기
  const ledDist = 120; // 코일 중심에서 좌우로 떨어진 거리
  
  // 회로 선
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - pipeW/2 - 5, pipeCoil.y - pipeCoil.height/2 + 5);
  ctx.lineTo(cx - ledDist, pipeCoil.y - pipeCoil.height/2 + 5);
  ctx.lineTo(cx - ledDist, pipeCoil.y + pipeCoil.height/2 - 5);
  ctx.lineTo(cx - pipeW/2 - 5, pipeCoil.y + pipeCoil.height/2 - 5);
  
  ctx.moveTo(cx + pipeW/2 + 5, pipeCoil.y - pipeCoil.height/2 + 5);
  ctx.lineTo(cx + ledDist, pipeCoil.y - pipeCoil.height/2 + 5);
  ctx.lineTo(cx + ledDist, pipeCoil.y + pipeCoil.height/2 - 5);
  ctx.lineTo(cx + pipeW/2 + 5, pipeCoil.y + pipeCoil.height/2 - 5);
  ctx.stroke();

  // 전압에 따른 밝기 계산 (절대값 기반)
  const vRatio = Math.min(1.0, Math.abs(pipeVoltage) / 15.0); // 15정도면 최대 밝기
  
  // 들어갈 때와 나갈 때 LED 색 분리 (왼쪽 빨강, 오른쪽 파랑)
  // pipeVoltage의 부호에 따라 한쪽만 켜짐
  let redBrightness = 0;
  let blueBrightness = 0;
  if (pipeVoltage > 0.5) redBrightness = vRatio;
  else if (pipeVoltage < -0.5) blueBrightness = vRatio;

  // 왼쪽 LED (빨강)
  drawLED(cx - ledDist, pipeCoil.y, '#ef4444', redBrightness);
  // 오른쪽 LED (파랑)
  drawLED(cx + ledDist, pipeCoil.y, '#3b82f6', blueBrightness);
  
  // 자석 주변 화살표(유도 전류 방향 안내)
  const checkInduced = document.getElementById('check-pipe-induced');
  if (checkInduced && checkInduced.checked) {
    if (Math.abs(pipeVoltage) > 1.0) {
      ctx.fillStyle = pipeVoltage > 0 ? '#ef4444' : '#3b82f6';
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      // 좌측 혹은 우측으로 화살표 방향 지시
      const arrowTxt = pipeVoltage > 0 ? "←" : "→";
      ctx.fillText(arrowTxt, cx, pipeCoil.y + pipeCoil.height/2 + 30);
    }
  }
}

function drawLED(x, y, baseColor, brightness) {
  ctx.save();
  // 글로우 효과 (전압이 있을 때만)
  if (brightness > 0) {
    ctx.shadowBlur = 15 + 25 * brightness;
    ctx.shadowColor = baseColor;
  }
  
  // LED 유리구
  ctx.fillStyle = brightness > 0 ? baseColor : 'rgba(100, 100, 100, 0.5)';
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fill();
  
  // LED 테두리
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.restore();
}

// === 10. 전체 루프 및 그리기 조합 ===
function draw() {
  // 캔버스 초기화
  ctx.clearRect(0, 0, simWidth, simHeight);
  
  // 뒷배경에 은은한 렌츠 법칙 타이틀 및 가이드
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.font = "bold 90px 'Noto Sans KR', sans-serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText("LENZ'S LAW", simWidth * 0.5, simHeight * 0.52);

  if (currentSim === 'coil') {
    drawMagnetFieldLines();
    drawConnectingWires();
    drawCoil('back');
    drawMagnet();
    drawCoil('front');
    drawGalvanometerInstrument();
    drawInducedMagneticField();
  } else if (currentSim === 'disk') {
    drawFallingDiskScene();
  } else if (currentSim === 'pipe') {
    drawPipeScene();
  }
}

// 메인 프레임 틱
function tick() {
  updatePhysics();
  draw();
  requestAnimationFrame(tick);
}

// 초기화 시작
resizeCanvas();
tick();
