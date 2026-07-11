// 1D Wave Pulse Superposition Simulation Engine

// 1. DOM Elements
const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const simMessage = document.getElementById('sim-message');

// Sliders and Displays
const ampASlider = document.getElementById('amp-a-slider');
const ampAVal = document.getElementById('amp-a-val');
const widthASlider = document.getElementById('width-a-slider');
const widthAVal = document.getElementById('width-a-val');

const ampBSlider = document.getElementById('amp-b-slider');
const ampBVal = document.getElementById('amp-b-val');
const widthBSlider = document.getElementById('width-b-slider');
const widthBVal = document.getElementById('width-b-val');

const speedSlider = document.getElementById('speed-slider');
const speedVal = document.getElementById('speed-val');

// Buttons
const playBtn = document.getElementById('sim-play');
const stepBackBtn = document.getElementById('step-back');
const stepFwdBtn = document.getElementById('step-fwd');
const resetBtn = document.getElementById('sim-reset');

// Shape Buttons
const shapeAButtons = document.querySelectorAll('#shape-a-group .radio-btn');
const shapeBButtons = document.querySelectorAll('#shape-b-group .radio-btn');

// Modal Elements
const btnInfo = document.getElementById('btn-info');
const btnCloseModal = document.getElementById('btn-close-modal');
const infoModal = document.getElementById('info-modal');

// 2. Simulation State
let isRunning = true;
let time1d = 0;

// Pulse Parameters
let shapeA = 'gaussian';
let ampA = 60;
let widthA = 40;

let shapeB = 'gaussian';
let ampB = 60;
let widthB = 40;

let speed = 1.0;

// 3. Initialization
function init() {
    resizeCanvas();
    setupEventListeners();
    render();
}

// 4. Wave Pulse Mathematical Models
function getPulseDisplacement(x, shape, w, amp) {
    const absX = Math.abs(x);
    switch (shape) {
        case 'gaussian':
            // Gaussian distribution height
            return amp * Math.exp(-Math.pow(x / (w * 0.7), 2));
        case 'triangle':
            // Triangular linear height
            return amp * Math.max(0, 1 - absX / (w * 1.2));
        case 'square':
            // Discontinuous step height
            return absX <= w * 0.9 ? amp : 0;
        case 'sine':
            // Cosine half-wave hump
            return absX <= w * 1.2 ? amp * Math.cos((Math.PI * x) / (w * 2.4)) : 0;
        default:
            return 0;
    }
}

// 5. Drawing Functions
function drawArrow(fromx, fromy, tox, toy, color, label) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    
    // Shaft
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.stroke();
    
    // Arrow Head
    const angle = Math.atan2(toy - fromy, tox - fromx);
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - 7 * Math.cos(angle - Math.PI/6), toy - 7 * Math.sin(angle - Math.PI/6));
    ctx.lineTo(tox - 7 * Math.cos(angle + Math.PI/6), toy - 7 * Math.sin(angle + Math.PI/6));
    ctx.closePath();
    ctx.fill();
    
    // Label above arrow
    ctx.fillStyle = color;
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(label, fromx + (tox - fromx) / 2, fromy - 6);
}

function drawDot(x, y, color, size, glow = false) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    if (glow) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
    }
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// 6. MAIN RENDER LOOP
function render() {
    if (isRunning) {
        time1d += 1.2 * speed;
        // Loop time when pulses propagate out of bounds (startX is 300, logical space width is 180)
        if (time1d * 1.5 > 600) {
            time1d = 0;
        }
    }
    
    // Ensure canvas dimensions match CSS
    const rect = canvas.parentElement.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    
    const w = canvas.width;
    const h = canvas.height;
    const yCenter = h / 2;
    
    // Clear screen
    ctx.fillStyle = '#080a12';
    ctx.fillRect(0, 0, w, h);
    
    // Draw horizontal reference dotted axis
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, yCenter);
    ctx.lineTo(w, yCenter);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Logical x-range: [-180, 180]
    const lxMin = -180;
    const lxMax = 180;
    const lxRange = lxMax - lxMin;
    
    const startOffset = 300;
    const currentDist = startOffset - time1d * 1.5;
    const xA = -currentDist; // Center of pulse A
    const xB = currentDist;  // Center of pulse B
    
    const scaleY = Math.min(1.0, (yCenter - 15) / 200);

    const curveA = [];
    const curveB = [];
    const curveTotal = [];
    
    for (let px = 0; px < w; px++) {
        const lx = lxMin + (px / w) * lxRange;
        
        const yValA = getPulseDisplacement(lx - xA, shapeA, widthA, ampA);
        const yValB = getPulseDisplacement(lx - xB, shapeB, widthB, ampB);
        const yValTotal = yValA + yValB;
        
        curveA.push({ x: px, y: yCenter - yValA * scaleY });
        curveB.push({ x: px, y: yCenter - yValB * scaleY });
        curveTotal.push({ x: px, y: yCenter - yValTotal * scaleY });
    }
    
    // 1. Draw Pulse A (Red Dashed Line)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(curveA[0].x, curveA[0].y);
    for (let i = 1; i < curveA.length; i++) {
        ctx.lineTo(curveA[i].x, curveA[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 2. Draw Pulse B (Blue Dashed Line)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(curveB[0].x, curveB[0].y);
    for (let i = 1; i < curveB.length; i++) {
        ctx.lineTo(curveB[i].x, curveB[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 3. Draw Combined Wave (Thick Glowing Purple Line)
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
    ctx.beginPath();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3.5;
    ctx.moveTo(curveTotal[0].x, curveTotal[0].y);
    for (let i = 1; i < curveTotal.length; i++) {
        ctx.lineTo(curveTotal[i].x, curveTotal[i].y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // reset glow
    
    // 4. Draw Direction Arrows
    const scaleFactor = w / lxRange;
    const arrowOffset = 18;
    
    // Arrow A (Right)
    if (xA > -170 && xA < 170) {
        const pxA = w / 2 + xA * scaleFactor;
        const pyA = yCenter - ampA * scaleY - (ampA >= 0 ? arrowOffset : -arrowOffset - 8);
        drawArrow(pxA - 14, pyA, pxA + 14, pyA, '#f43f5e', 'A');
    }
    
    // Arrow B (Left)
    if (xB > -170 && xB < 170) {
        const pxB = w / 2 + xB * scaleFactor;
        const pyB = yCenter - ampB * scaleY - (ampB >= 0 ? arrowOffset : -arrowOffset - 8);
        drawArrow(pxB + 14, pyB, pxB - 14, pyB, '#3b82f6', 'B');
    }
    
    // 5. Draw Vertical Measurement Overlay at the meeting point (x=0)
    const overlapLimit = (widthA + widthB) * 1.5;
    if (Math.abs(xA - xB) < overlapLimit) {
        const pxCenter = w / 2;
        const yaCenter = getPulseDisplacement(0 - xA, shapeA, widthA, ampA);
        const ybCenter = getPulseDisplacement(0 - xB, shapeB, widthB, ampB);
        const ytotCenter = yaCenter + ybCenter;
        
        const pyA = yCenter - yaCenter * scaleY;
        const pyB = yCenter - ybCenter * scaleY;
        const pyTot = yCenter - ytotCenter * scaleY;
        
        // Vertical dashed reference line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pxCenter, Math.min(pyA, pyB, pyTot, yCenter) - 8);
        ctx.lineTo(pxCenter, Math.max(pyA, pyB, pyTot, yCenter) + 8);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Dots
        drawDot(pxCenter, pyA, '#f43f5e', 4);
        drawDot(pxCenter, pyB, '#3b82f6', 4);
        drawDot(pxCenter, pyTot, '#a855f7', 5.5, true);
        
        // Update stats
        document.getElementById('val-ya').textContent = yaCenter.toFixed(0);
        document.getElementById('val-yb').textContent = ybCenter.toFixed(0);
        document.getElementById('val-ytot').textContent = ytotCenter.toFixed(0);
        
        const statusTxt = document.getElementById('status-txt');
        if (Math.abs(ytotCenter) > Math.max(Math.abs(yaCenter), Math.abs(ybCenter)) + 5) {
            statusTxt.textContent = '보강 중첩 🟢';
            statusTxt.style.color = '#10b981';
        } else if (Math.abs(ytotCenter) < Math.max(Math.abs(yaCenter), Math.abs(ybCenter)) - 5) {
            statusTxt.textContent = '상쇄 중첩 🔴';
            statusTxt.style.color = '#ef4444';
        } else {
            statusTxt.textContent = '교차 진행 중 ⚪';
            statusTxt.style.color = '#94a3b8';
        }
    } else {
        document.getElementById('val-ya').textContent = '0';
        document.getElementById('val-yb').textContent = '0';
        document.getElementById('val-ytot').textContent = '0';
        
        const statusTxt = document.getElementById('status-txt');
        statusTxt.textContent = '분리되어 이동 중 ⚪';
        statusTxt.style.color = '#94a3b8';
    }
    
    requestAnimationFrame(render);
}

// 7. EVENT LISTENERS
function setupEventListeners() {
    
    // Shape A buttons
    shapeAButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            shapeAButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            shapeA = btn.dataset.shape;
        });
    });
    
    // Shape B buttons
    shapeBButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            shapeBButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            shapeB = btn.dataset.shape;
        });
    });
    
    // Sliders
    const onAmpA = () => {
        ampA = parseInt(ampASlider.value);
        ampAVal.textContent = ampA;
    };
    ampASlider.addEventListener('input', onAmpA);
    ampASlider.addEventListener('change', onAmpA);
    
    const onWidthA = () => {
        widthA = parseInt(widthASlider.value);
        widthAVal.textContent = widthA;
    };
    widthASlider.addEventListener('input', onWidthA);
    widthASlider.addEventListener('change', onWidthA);
    
    const onAmpB = () => {
        ampB = parseInt(ampBSlider.value);
        ampBVal.textContent = ampB;
    };
    ampBSlider.addEventListener('input', onAmpB);
    ampBSlider.addEventListener('change', onAmpB);
    
    const onWidthB = () => {
        widthB = parseInt(widthBSlider.value);
        widthBVal.textContent = widthB;
    };
    widthBSlider.addEventListener('input', onWidthB);
    widthBSlider.addEventListener('change', onWidthB);
    
    const onSpeed = () => {
        speed = parseFloat(speedSlider.value);
        speedVal.textContent = speed.toFixed(1);
    };
    speedSlider.addEventListener('input', onSpeed);
    speedSlider.addEventListener('change', onSpeed);
    
    // Controls
    playBtn.addEventListener('click', () => {
        isRunning = !isRunning;
        updatePlayBtn();
    });
    
    stepBackBtn.addEventListener('click', () => {
        isRunning = false;
        updatePlayBtn();
        time1d = Math.max(0, time1d - 2.5);
    });
    
    stepFwdBtn.addEventListener('click', () => {
        isRunning = false;
        updatePlayBtn();
        time1d += 2.5;
        if (time1d * 1.5 > 600) time1d = 0;
    });
    
    resetBtn.addEventListener('click', () => {
        isRunning = true;
        updatePlayBtn();
        time1d = 0;
        
        ampA = 60; widthA = 40; shapeA = 'gaussian';
        ampB = 60; widthB = 40; shapeB = 'gaussian';
        speed = 1.0;
        
        ampASlider.value = 60; ampAVal.textContent = 60;
        widthASlider.value = 40; widthAVal.textContent = 40;
        ampBSlider.value = 60; ampBVal.textContent = 60;
        widthBSlider.value = 40; widthBVal.textContent = 40;
        speedSlider.value = 1.0; speedVal.textContent = "1.0";
        
        shapeAButtons.forEach(b => b.classList.remove('active'));
        shapeAButtons[0].classList.add('active');
        shapeBButtons.forEach(b => b.classList.remove('active'));
        shapeBButtons[0].classList.add('active');
    });
    
    // Modal
    btnInfo.addEventListener('click', () => {
        infoModal.classList.remove('hidden');
    });
    
    btnCloseModal.addEventListener('click', () => {
        infoModal.classList.add('hidden');
    });
    
    // Collapsible control panels logic for mobile
    document.querySelectorAll('.btn-toggle-panel').forEach(btn => {
        btn.addEventListener('click', () => {
            const panel = btn.closest('.controls-panel');
            const isCollapsed = panel.classList.toggle('collapsed');
            btn.innerText = isCollapsed ? '열기 ☰' : '접기 ✕';
        });
    });
}

function updatePlayBtn() {
    if (isRunning) {
        playBtn.textContent = '⏸ 일시정지';
        playBtn.classList.add('paused');
    } else {
        playBtn.textContent = '▶ 재생';
        playBtn.classList.remove('paused');
    }
}

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

window.addEventListener('resize', resizeCanvas);
init();
