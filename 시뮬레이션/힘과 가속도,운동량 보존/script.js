document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const tabs = document.querySelectorAll('.tab-btn');
    const fmaControls = document.getElementById('controls-fma');
    const colControls = document.getElementById('controls-collision');
    const fmaChartContainer = document.getElementById('chart-fma');
    const colChartContainer = document.getElementById('chart-collision');
    const simMessage = document.getElementById('sim-message');
    const btnInfo = document.getElementById('btn-info');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const infoModal = document.getElementById('info-modal');
    
    let currentMode = 'fma'; // 'fma' or 'collision'
    
    // --- Tabs Navigation ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentMode = tab.dataset.tab;
            
            if (currentMode === 'fma') {
                fmaControls.classList.remove('hidden');
                fmaChartContainer.classList.remove('hidden');
                colControls.classList.add('hidden');
                colChartContainer.classList.add('hidden');
            } else {
                fmaControls.classList.add('hidden');
                fmaChartContainer.classList.add('hidden');
                colControls.classList.remove('hidden');
                colChartContainer.classList.remove('hidden');
            }
            resetSim();
        });
    });

    // --- Navigation & Modal Actions ---
    
    if (btnInfo) btnInfo.addEventListener('click', () => infoModal.classList.remove('hidden'));
    if (btnCloseModal) btnCloseModal.addEventListener('click', () => infoModal.classList.add('hidden'));
    
    if (infoModal) {
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) infoModal.classList.add('hidden');
        });
    }

    // --- Canvases Setup ---
    const canvas = document.getElementById('simCanvas');
    const ctx = canvas.getContext('2d');
    
    const chartCanvas = document.getElementById('fmaChart');
    const chartCtx = chartCanvas.getContext('2d');
    
    function resizeCanvases() {
        // Main Sandbox Canvas
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Chart Canvas
        const chartRect = chartCanvas.parentElement.getBoundingClientRect();
        chartCanvas.width = chartRect.width;
        chartCanvas.height = chartRect.height;
        
        draw();
        drawCustomChart();
    }
    
    window.addEventListener('resize', resizeCanvases);

    // --- State Declarations ---
    let fmaState = {
        playing: false,
        x: 0, // will be centered dynamically on init
        v: 0,
        a: 0,
        time: 0,
        m: 5,
        F: 20,
        mu: 0.2,
        g: 9.8,
        pixelsPerMeter: 8,
        historyTime: [],
        historyV: [],
        historyA: []
    };
    
    let colState = {
        playing: false,
        x1: 0,
        v1: 10,
        m1: 5,
        x2: 0,
        v2: -5,
        m2: 5,
        e: 1.0,
        pixelsPerMeter: 12,
        radius1: 30,
        radius2: 30,
        collided: false,
        collisionTime: 0
    };

    // --- UI Sliders Bindings & Setters ---
    // F=ma
    const mSlider = document.getElementById('m-slider');
    const fSlider = document.getElementById('f-slider');
    const muSlider = document.getElementById('mu-slider');
    
    function updateFmaParams() {
        fmaState.m = parseFloat(mSlider.value);
        fmaState.F = parseFloat(fSlider.value);
        fmaState.mu = parseFloat(muSlider.value);
        
        document.getElementById('m-val').innerText = fmaState.m.toFixed(1);
        document.getElementById('f-val').innerText = fmaState.F.toFixed(0);
        document.getElementById('mu-val').innerText = fmaState.mu.toFixed(2);
        
        if(!fmaState.playing) {
            const F_f_max = fmaState.mu * fmaState.m * fmaState.g;
            let F_net = fmaState.F;
            let F_f = 0;
            
            if (fmaState.v === 0) {
                if (Math.abs(fmaState.F) <= F_f_max) {
                    F_net = 0;
                    F_f = -fmaState.F;
                } else {
                    F_f = fmaState.F > 0 ? -F_f_max : F_f_max;
                    F_net = fmaState.F + F_f;
                }
            }
            fmaState.a = F_net / fmaState.m;
            updateFmaStats(fmaState.a, fmaState.v, Math.abs(F_f));
        }
        draw();
    }
    
    mSlider.addEventListener('input', updateFmaParams);
    fSlider.addEventListener('input', updateFmaParams);
    muSlider.addEventListener('input', updateFmaParams);
    
    // Collisions
    const m1Slider = document.getElementById('m1-slider');
    const v1Slider = document.getElementById('v1-slider');
    const m2Slider = document.getElementById('m2-slider');
    const v2Slider = document.getElementById('v2-slider');
    
    function updateColParams() {
        if(!colState.playing && !colState.collided) {
            colState.m1 = parseFloat(m1Slider.value);
            colState.v1 = parseFloat(v1Slider.value);
            colState.m2 = parseFloat(m2Slider.value);
            colState.v2 = parseFloat(v2Slider.value);
            
            document.getElementById('m1-val').innerText = colState.m1.toFixed(1);
            document.getElementById('v1-val').innerText = colState.v1.toFixed(1);
            document.getElementById('m2-val').innerText = colState.m2.toFixed(1);
            document.getElementById('v2-val').innerText = colState.v2.toFixed(1);
            
            colState.radius1 = 20 + colState.m1 * 1.5;
            colState.radius2 = 20 + colState.m2 * 1.5;
            
            updateColStats();
        }
        draw();
    }
    
    m1Slider.addEventListener('input', updateColParams);
    v1Slider.addEventListener('input', updateColParams);
    m2Slider.addEventListener('input', updateColParams);
    v2Slider.addEventListener('input', updateColParams);

    // --- Custom Canvas Plotting Library (Dual Y-Axis) ---
    function drawCustomChart() {
        const w = chartCanvas.width;
        const h = chartCanvas.height;
        chartCtx.clearRect(0, 0, w, h);
        
        const padding = { top: 25, right: 45, bottom: 30, left: 45 };
        const graphW = w - padding.left - padding.right;
        const graphH = h - padding.top - padding.bottom;
        
        // Draw background grid lines
        chartCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        chartCtx.lineWidth = 1;
        const rows = 4;
        const cols = 5;
        for (let i = 0; i <= rows; i++) {
            const y = padding.top + (graphH * i / rows);
            chartCtx.beginPath();
            chartCtx.moveTo(padding.left, y);
            chartCtx.lineTo(w - padding.right, y);
            chartCtx.stroke();
        }
        for (let i = 0; i <= cols; i++) {
            const x = padding.left + (graphW * i / cols);
            chartCtx.beginPath();
            chartCtx.moveTo(x, padding.top);
            chartCtx.lineTo(x, h - padding.bottom);
            chartCtx.stroke();
        }

        // Draw outer borders
        chartCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        chartCtx.strokeRect(padding.left, padding.top, graphW, graphH);

        // Fetch data
        const times = fmaState.historyTime;
        const velocities = fmaState.historyV;
        const accelerations = fmaState.historyA;

        if (times.length < 2) {
            // Draw empty axis placeholders
            chartCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            chartCtx.font = '500 10px Inter';
            chartCtx.textAlign = 'center';
            chartCtx.fillText('속도 및 가속도 실시간 추이 그래프 (F=ma)', w/2, h/2);
            return;
        }

        // Scaling values dynamically
        const maxTime = times[times.length - 1];
        const minTime = times[0];
        const timeDiff = maxTime - minTime || 1;

        // Velocity range (Left Axis)
        let maxV = Math.max(...velocities, 10);
        let minV = Math.min(...velocities, -10);
        const marginV = (maxV - minV) * 0.1 || 2;
        maxV += marginV;
        minV -= marginV;

        // Acceleration range (Right Axis)
        let maxA = Math.max(...accelerations, 5);
        let minA = Math.min(...accelerations, -5);
        const marginA = (maxA - minA) * 0.1 || 2;
        maxA += marginA;
        minA -= marginA;

        // Coordinate mapping functions
        const getX = (t) => padding.left + ((t - minTime) / timeDiff) * graphW;
        const getY_V = (v) => padding.top + graphH - ((v - minV) / (maxV - minV)) * graphH;
        const getY_A = (a) => padding.top + graphH - ((a - minA) / (maxA - minA)) * graphH;

        // Draw Left Y-Axis labels (Velocity - Blue)
        chartCtx.fillStyle = '#60a5fa';
        chartCtx.font = '700 10px Outfit';
        chartCtx.textAlign = 'right';
        chartCtx.textBaseline = 'middle';
        for (let i = 0; i <= rows; i++) {
            const val = maxV - (i / rows) * (maxV - minV);
            const y = padding.top + (graphH * i / rows);
            chartCtx.fillText(val.toFixed(1) + ' m/s', padding.left - 8, y);
        }

        // Draw Right Y-Axis labels (Acceleration - Red)
        chartCtx.fillStyle = '#f43f5e';
        chartCtx.textAlign = 'left';
        for (let i = 0; i <= rows; i++) {
            const val = maxA - (i / rows) * (maxA - minA);
            const y = padding.top + (graphH * i / rows);
            chartCtx.fillText(val.toFixed(2) + ' m/s²', w - padding.right + 8, y);
        }

        // Draw X-Axis labels (Time - White/Gray)
        chartCtx.fillStyle = varColorTextMuted();
        chartCtx.font = '600 10px Inter';
        chartCtx.textAlign = 'center';
        chartCtx.textBaseline = 'top';
        for (let i = 0; i <= cols; i++) {
            const t = minTime + (i / cols) * timeDiff;
            const x = padding.left + (graphW * i / cols);
            chartCtx.fillText(t.toFixed(1) + 's', x, h - padding.bottom + 6);
        }

        // Draw Velocity line (Left Y axis)
        chartCtx.save();
        chartCtx.beginPath();
        chartCtx.moveTo(getX(times[0]), getY_V(velocities[0]));
        for (let i = 1; i < times.length; i++) {
            chartCtx.lineTo(getX(times[i]), getY_V(velocities[i]));
        }
        chartCtx.strokeStyle = '#3b82f6';
        chartCtx.lineWidth = 2.5;
        chartCtx.shadowColor = 'rgba(59, 130, 246, 0.4)';
        chartCtx.shadowBlur = 8;
        chartCtx.stroke();
        
        // Fill under Velocity curve
        chartCtx.shadowBlur = 0;
        chartCtx.lineTo(getX(times[times.length - 1]), getY_V(minV));
        chartCtx.lineTo(getX(times[0]), getY_V(minV));
        chartCtx.closePath();
        const grad = chartCtx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
        grad.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
        grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
        chartCtx.fillStyle = grad;
        chartCtx.fill();
        chartCtx.restore();

        // Draw Acceleration line (Right Y axis)
        chartCtx.save();
        chartCtx.beginPath();
        chartCtx.moveTo(getX(times[0]), getY_A(accelerations[0]));
        for (let i = 1; i < times.length; i++) {
            chartCtx.lineTo(getX(times[i]), getY_A(accelerations[i]));
        }
        chartCtx.strokeStyle = '#f43f5e';
        chartCtx.lineWidth = 2;
        chartCtx.shadowColor = 'rgba(244, 63, 94, 0.3)';
        chartCtx.shadowBlur = 6;
        chartCtx.stroke();
        chartCtx.restore();

        // Draw Legends
        chartCtx.font = '700 9px Outfit';
        chartCtx.textBaseline = 'top';
        chartCtx.textAlign = 'left';
        
        // Velocity Legend (Blue box)
        chartCtx.fillStyle = '#3b82f6';
        chartCtx.fillRect(padding.left + 10, padding.top - 18, 10, 6);
        chartCtx.fillStyle = '#f1f5f9';
        chartCtx.fillText('속도 (v)', padding.left + 25, padding.top - 20);

        // Acceleration Legend (Red box)
        chartCtx.fillStyle = '#f43f5e';
        chartCtx.fillRect(padding.left + 90, padding.top - 18, 10, 6);
        chartCtx.fillStyle = '#f1f5f9';
        chartCtx.fillText('가속도 (a)', padding.left + 105, padding.top - 20);
    }
    
    function varColorTextMuted() {
        return getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#94a3b8';
    }

    // --- State Update Physics Loop ---
    function update(dt) {
        if (currentMode === 'fma' && fmaState.playing) {
            fmaState.time += dt;
            
            const F_f_max = fmaState.mu * fmaState.m * fmaState.g;
            let F_net = fmaState.F;
            let F_f = 0;
            
            // Static friction threshold check
            if (Math.abs(fmaState.v) < 0.05 && Math.abs(fmaState.F) <= F_f_max) {
                fmaState.v = 0;
                F_net = 0;
                F_f = -fmaState.F;
                fmaState.a = 0;
            } else {
                // Kinetic friction calculation
                const dir = fmaState.v !== 0 ? Math.sign(fmaState.v) : Math.sign(fmaState.F);
                F_f = -dir * F_f_max;
                F_net = fmaState.F + F_f;
                fmaState.a = F_net / fmaState.m;
                fmaState.v += fmaState.a * dt;
            }
            
            fmaState.x += fmaState.v * fmaState.pixelsPerMeter * dt;
            
            // Loop box at screen edges
            const limit = 120;
            if (fmaState.x > canvas.width + limit) fmaState.x = -limit;
            if (fmaState.x < -limit) fmaState.x = canvas.width + limit;
            
            updateFmaStats(fmaState.a, fmaState.v, Math.abs(F_f));
            
            // Store variables history on a 0.08s scale for custom chart plotting
            if (fmaState.historyTime.length === 0 || fmaState.time - fmaState.historyTime[fmaState.historyTime.length - 1] >= 0.08) {
                fmaState.historyTime.push(fmaState.time);
                fmaState.historyV.push(fmaState.v);
                fmaState.historyA.push(fmaState.a);
                
                // Limit histories to prevent buffer overflow
                if (fmaState.historyTime.length > 70) {
                    fmaState.historyTime.shift();
                    fmaState.historyV.shift();
                    fmaState.historyA.shift();
                }
                
                drawCustomChart();
            }
            
        } else if (currentMode === 'collision' && colState.playing) {
            colState.x1 += colState.v1 * colState.pixelsPerMeter * dt;
            colState.x2 += colState.v2 * colState.pixelsPerMeter * dt;
            
            const dist = Math.abs(colState.x2 - colState.x1);
            const minDist = colState.radius1 + colState.radius2;
            
            // Bouncing collision detection between spheres
            if (dist <= minDist) {
                const relativeVelocity = (colState.x2 > colState.x1) ? (colState.v1 - colState.v2) : (colState.v2 - colState.v1);
                
                if (relativeVelocity > 0) {
                    // Resolve overlap slightly to avoid sticking
                    const overlap = minDist - dist;
                    if (colState.x1 < colState.x2) {
                        colState.x1 -= overlap/2;
                        colState.x2 += overlap/2;
                    } else {
                        colState.x1 += overlap/2;
                        colState.x2 -= overlap/2;
                    }
                    
                    const m1 = colState.m1;
                    const m2 = colState.m2;
                    const u1 = colState.v1;
                    const u2 = colState.v2;
                    const e = colState.e; // perfectly elastic (1.0)
                    
                    // 1D elastic collision velocity equations
                    colState.v1 = ((m1 - e*m2)*u1 + m2*(1 + e)*u2) / (m1 + m2);
                    colState.v2 = ((m2 - e*m1)*u2 + m1*(1 + e)*u1) / (m1 + m2);
                    
                    colState.collided = true;
                    colState.collisionTime = 0.8; // wave effect duration in seconds
                }
            }
            
            if (colState.collisionTime > 0) {
                colState.collisionTime -= dt;
            }
            
            // Bouncing physics against boundaries
            if (colState.x1 - colState.radius1 < 0) { colState.x1 = colState.radius1; colState.v1 *= -1; }
            if (colState.x1 + colState.radius1 > canvas.width) { colState.x1 = canvas.width - colState.radius1; colState.v1 *= -1; }
            
            if (colState.x2 - colState.radius2 < 0) { colState.x2 = colState.radius2; colState.v2 *= -1; }
            if (colState.x2 + colState.radius2 > canvas.width) { colState.x2 = canvas.width - colState.radius2; colState.v2 *= -1; }
            
            updateColStats();
        }
    }
    
    // --- Canvas Rendering Loop ---
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw elegant grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 1;
        const gridGap = 40;
        for (let i = 0; i < canvas.width; i += gridGap) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += gridGap) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
        }
        
        if (currentMode === 'fma') {
            const groundY = canvas.height * 0.75;
            
            // Ground layer
            ctx.fillStyle = '#0a0d16';
            ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(canvas.width, groundY); ctx.stroke();
            
            // Moving floor markers to simulate camera/box velocity
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 2;
            const markerInterval = fmaState.pixelsPerMeter * 5; // marker every 5 meters
            for (let i = -(fmaState.x % markerInterval); i < canvas.width; i += markerInterval) {
                ctx.beginPath(); ctx.moveTo(i, groundY); ctx.lineTo(i, groundY + 12); ctx.stroke();
            }
            
            // Main moving mass block
            const size = 35 + fmaState.m * 2;
            const cx = fmaState.x;
            const cy = groundY - size/2;
            
            ctx.save();
            ctx.fillStyle = '#3b82f6';
            ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
            ctx.shadowBlur = 20;
            ctx.fillRect(cx - size/2, cy - size/2, size, size);
            ctx.restore();
            
            // Label mass block text
            ctx.fillStyle = '#ffffff';
            ctx.font = '700 12px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${fmaState.m.toFixed(1)} kg`, cx, cy);
            
            // Force arrows drawing
            if (fmaState.F !== 0) {
                drawVectorArrow(cx, cy, fmaState.F * 1.5, 0, '#f43f5e', `외력 F (${fmaState.F} N)`);
            }
            
            let F_f_max = fmaState.mu * fmaState.m * fmaState.g;
            let F_f = 0;
            if (fmaState.v !== 0) {
                F_f = -Math.sign(fmaState.v) * F_f_max;
            } else if (fmaState.F !== 0) {
                F_f = Math.abs(fmaState.F) <= F_f_max ? -fmaState.F : -Math.sign(fmaState.F) * F_f_max;
            }
            
            if (Math.abs(F_f) > 0.05) {
                // Drawn at ground level below mass box
                drawVectorArrow(cx, groundY, F_f * 1.5, 0, '#10b981', `마찰력 f (${Math.abs(F_f).toFixed(1)} N)`);
            }
            
        } else if (currentMode === 'collision') {
            const trackY = canvas.height * 0.55;
            
            // Track rail drawing
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(0, trackY); ctx.lineTo(canvas.width, trackY); ctx.stroke();
            
            // Draw objects function
            const renderSphere = (x, y, r, color, glow, v, label, mass) => {
                ctx.save();
                ctx.fillStyle = color;
                ctx.shadowColor = glow;
                ctx.shadowBlur = 25;
                ctx.beginPath(); ctx.arc(x, y - r, r, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
                
                // Overlay text inside/above sphere
                ctx.fillStyle = '#ffffff';
                ctx.font = '600 11px Inter';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, x, y - r - 6);
                ctx.font = '700 10px Inter';
                ctx.fillText(`${mass.toFixed(1)}kg`, x, y - r + 8);
                
                // Draw velocity vector arrow above
                if (Math.abs(v) > 0.1) {
                    drawVectorArrow(x, y - r - 40, v * 3.5, 0, '#ffffff', `${v.toFixed(1)} m/s`);
                }
            };
            
            renderSphere(colState.x1, trackY, colState.radius1, '#f43f5e', 'rgba(244, 63, 94, 0.55)', colState.v1, '물체 1', colState.m1);
            renderSphere(colState.x2, trackY, colState.radius2, '#0ea5e9', 'rgba(14, 165, 233, 0.55)', colState.v2, '물체 2', colState.m2);
            
            // Expanding neon pulse on elastic collision impact
            if (colState.collisionTime > 0) {
                const midX = (colState.x1 + colState.x2) / 2;
                const waveR = 40 * (0.8 - colState.collisionTime) * 1.5;
                ctx.save();
                ctx.beginPath();
                ctx.arc(midX, trackY - (colState.radius1 + colState.radius2)/2, waveR, 0, Math.PI*2);
                ctx.fillStyle = `rgba(255, 255, 255, ${colState.collisionTime * 0.45})`;
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 15;
                ctx.fill();
                ctx.restore();
            }
        }
    }
    
    // --- Vector arrow helper ---
    function drawVectorArrow(x, y, magnitude, angle, color, labelText) {
        ctx.save();
        ctx.translate(x, y);
        
        const isNegative = magnitude < 0;
        let magAbs = Math.abs(magnitude);
        if (magAbs < 2) { ctx.restore(); return; }
        
        if (isNegative) ctx.scale(-1, 1);
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 3;
        
        // Line
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(magAbs, 0);
        ctx.stroke();
        
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(magAbs, 0);
        ctx.lineTo(magAbs - 8, -5);
        ctx.lineTo(magAbs - 8, 5);
        ctx.fill();
        
        // Label text rendering
        if (labelText) {
            ctx.shadowBlur = 0;
            if (isNegative) {
                ctx.scale(-1, 1);
                ctx.font = '700 11px Inter';
                ctx.textAlign = 'right';
                ctx.fillText(labelText, -magAbs / 2, -10);
            } else {
                ctx.font = '700 11px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(labelText, magAbs / 2, -10);
            }
        }
        
        ctx.restore();
    }
    
    // --- Stats updating ---
    function updateFmaStats(a, v, ff) {
        document.getElementById('stat-a').innerText = a.toFixed(2);
        document.getElementById('stat-v').innerText = v.toFixed(2);
        document.getElementById('stat-ff').innerText = ff.toFixed(1);
    }
    
    function updateColStats() {
        const p1 = colState.m1 * colState.v1;
        const p2 = colState.m2 * colState.v2;
        const pTot = p1 + p2;
        
        const k1 = 0.5 * colState.m1 * colState.v1 * colState.v1;
        const k2 = 0.5 * colState.m2 * colState.v2 * colState.v2;
        const kTot = k1 + k2;
        
        const maxP = 600; // max expected momentum for bar scaling
        const maxK = 6000; // max expected kinetic energy for bar scaling
        
        // Update bar gauges
        setBar('p1', Math.abs(p1), maxP, p1.toFixed(1));
        setBar('p2', Math.abs(p2), maxP, p2.toFixed(1));
        setBar('ptot', Math.abs(pTot), maxP, pTot.toFixed(1));
        
        setBar('k1', k1, maxK, k1.toFixed(1));
        setBar('k2', k2, maxK, k2.toFixed(1));
        setBar('ktot', kTot, maxK, kTot.toFixed(1));
    }
    
    function setBar(id, val, maxVal, text) {
        const percent = Math.min(100, Math.max(0, (val / maxVal) * 100));
        const el = document.getElementById(`${id}-bar`);
        if (el) el.style.width = `${percent}%`;
        
        const textEl = document.getElementById(`${id}-text`);
        if (textEl) textEl.innerText = text;
    }

    // --- Interactive Play/Pause & Reset Bindings ---
    const btnFmaPlay = document.getElementById('fma-play');
    const btnFmaReset = document.getElementById('fma-reset');
    
    function toggleFmaPlay() {
        fmaState.playing = !fmaState.playing;
        simMessage.classList.add('hidden');
        if (fmaState.playing) {
            btnFmaPlay.innerHTML = '⏸ 일시정지';
            btnFmaPlay.classList.add('paused');
        } else {
            btnFmaPlay.innerHTML = '▶ 재생';
            btnFmaPlay.classList.remove('paused');
        }
    }
    
    btnFmaPlay.addEventListener('click', toggleFmaPlay);
    btnFmaReset.addEventListener('click', resetSim);
    
    const btnColPlay = document.getElementById('col-play');
    const btnColReset = document.getElementById('col-reset');
    
    function toggleColPlay() {
        colState.playing = !colState.playing;
        simMessage.classList.add('hidden');
        
        if (colState.playing) {
            btnColPlay.innerHTML = '⏸ 일시정지';
            btnColPlay.classList.add('paused');
        } else {
            btnColPlay.innerHTML = '▶ 재생';
            btnColPlay.classList.remove('paused');
        }
        
        // Disable sliders during run/impact state
        const disabled = colState.playing || colState.collided;
        const sliders = [m1Slider, v1Slider, m2Slider, v2Slider];
        sliders.forEach(slider => {
            slider.disabled = disabled;
            slider.style.opacity = disabled ? '0.5' : '1';
        });
    }
    
    btnColPlay.addEventListener('click', toggleColPlay);
    btnColReset.addEventListener('click', resetSim);

    // --- Simulation Reset Logic ---
    function resetSim() {
        simMessage.classList.remove('hidden');
        if (currentMode === 'fma') {
            fmaState.playing = false;
            btnFmaPlay.innerHTML = '▶ 재생';
            btnFmaPlay.classList.remove('paused');
            fmaState.x = canvas.width / 2;
            fmaState.v = 0;
            fmaState.a = 0;
            fmaState.time = 0;
            fmaState.historyTime = [];
            fmaState.historyV = [];
            fmaState.historyA = [];
            
            // Clear graph
            drawCustomChart();
            updateFmaParams();
        } else {
            colState.playing = false;
            btnColPlay.innerHTML = '▶ 재생';
            btnColPlay.classList.remove('paused');
            colState.collided = false;
            colState.collisionTime = 0;
            colState.x1 = canvas.width * 0.25;
            colState.x2 = canvas.width * 0.75;
            
            // Re-enable collision input sliders
            const sliders = [m1Slider, v1Slider, m2Slider, v2Slider];
            sliders.forEach(slider => {
                slider.disabled = false;
                slider.style.opacity = '1';
            });
            
            updateColParams();
        }
        draw();
    }

    // --- Animation loop clock tick ---
    let lastTime = 0;
    function animLoop(time) {
        if (!lastTime) lastTime = time;
        let dt = Math.min((time - lastTime) / 1000, 0.1); // cap dt at 0.1s to avoid physics breaches on background tabs
        lastTime = time;
        
        update(dt);
        draw();
        
        requestAnimationFrame(animLoop);
    }

    // --- Initialise App ---
    function init() {
        resizeCanvases();
        
        fmaState.x = canvas.width / 2;
        colState.x1 = canvas.width * 0.25;
        colState.x2 = canvas.width * 0.75;
        
        updateFmaParams();
        updateColParams();
        
        resetSim();
        
        // Start core loop
        requestAnimationFrame(animLoop);
    }
    
    // Wait for elements to adjust layout metrics before sizing canvas
    setTimeout(init, 150);
});
