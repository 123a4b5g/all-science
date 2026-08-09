/* ==========================================================================
   돌림힘 (Torque) & 회전 평형 시뮬레이션 - 2022 개정 고2 물리학 Engine Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Sound Effects (Disabled) ---
    class SoundSynthesizer {
        constructor() {}
        init() {}
        playClick() {}
        playSnap() {}
        playChime() {}
        playUnbalance() {}
        playSuccess() {}
    }

    const sound = new SoundSynthesizer();

    // --- 2. Tab Navigation & Modal Setup ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sound.playClick();
            const target = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const targetPane = document.getElementById(target);
            if (targetPane) targetPane.classList.add('active');

            setTimeout(resizeAllCanvases, 50);
        });
    });

    // Modal Control
    const btnInfo = document.getElementById('btn-info');
    const modalInfo = document.getElementById('modal-info');
    const btnCloseModal = document.getElementById('btn-close-modal');

    if (btnInfo && modalInfo && btnCloseModal) {
        btnInfo.addEventListener('click', () => {
            sound.playClick();
            modalInfo.classList.add('open');
        });
        btnCloseModal.addEventListener('click', () => {
            sound.playClick();
            modalInfo.classList.remove('open');
        });
        modalInfo.addEventListener('click', (e) => {
            if (e.target === modalInfo) modalInfo.classList.remove('open');
        });
    }

    const canvasVector = document.getElementById('canvas-vector');
    const ctxVector = canvasVector ? canvasVector.getContext('2d') : null;

    const canvasSeesaw = document.getElementById('canvas-seesaw');
    const ctxSeesaw = canvasSeesaw ? canvasSeesaw.getContext('2d') : null;

    // Canvas Resize Observer
    function resizeAllCanvases() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        [canvasVector, canvasSeesaw].forEach(canvas => {
            if (!canvas) return;
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth * dpr;
                canvas.height = parent.clientHeight * dpr;
            }
        });
    }

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        if (resizeTimer) cancelAnimationFrame(resizeTimer);
        resizeTimer = requestAnimationFrame(resizeAllCanvases);
    });


    // ==========================================================================
    // TAB 1: 돌림힘 기초 & 벡터 탐구 Engine
    // ==========================================================================
    const stateVector = {
        r: 2.0,           // meters (0.2 ~ 4.0)
        F: 10.0,          // Newtons (0 ~ 30)
        thetaDeg: 90,     // degrees (0 ~ 180)
        showComponents: false,
        showArm: true,
        isDraggingHandle: false,
        isDraggingForce: false
    };

    const sliderR = document.getElementById('slider-r');
    const sliderF = document.getElementById('slider-f');
    const sliderTheta = document.getElementById('slider-theta');
    const lblR = document.getElementById('lbl-r');
    const lblF = document.getElementById('lbl-f');
    const lblTheta = document.getElementById('lbl-theta');

    const btnResetVector = document.getElementById('btn-reset-vector');

    if (sliderR) sliderR.addEventListener('input', (e) => { stateVector.r = parseFloat(e.target.value); updateVectorUI(); });
    if (sliderF) sliderF.addEventListener('input', (e) => { stateVector.F = parseFloat(e.target.value); updateVectorUI(); });
    if (sliderTheta) sliderTheta.addEventListener('input', (e) => { stateVector.thetaDeg = parseFloat(e.target.value); updateVectorUI(); });

    if (btnResetVector) {
        btnResetVector.addEventListener('click', () => {
            sound.playClick();
            stateVector.r = 2.0;
            stateVector.F = 10.0;
            stateVector.thetaDeg = 90;
            if (sliderR) sliderR.value = 2.0;
            if (sliderF) sliderF.value = 10;
            if (sliderTheta) sliderTheta.value = 90;
            updateVectorUI();
        });
    }

    // Presets for Tab 1
    document.querySelectorAll('[data-preset]').forEach(btn => {
        btn.addEventListener('click', () => {
            sound.playClick();
            document.querySelectorAll('[data-preset]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const preset = btn.getAttribute('data-preset');
            if (preset === 'max-torque') { stateVector.r = 2.5; stateVector.F = 15.0; stateVector.thetaDeg = 90; }
            else if (preset === 'zero-torque') { stateVector.r = 2.0; stateVector.F = 15.0; stateVector.thetaDeg = 0; }
            else if (preset === 'angle-45') { stateVector.r = 2.0; stateVector.F = 15.0; stateVector.thetaDeg = 45; }
            else if (preset === 'angle-135') { stateVector.r = 2.0; stateVector.F = 15.0; stateVector.thetaDeg = 135; }
            if (sliderR) sliderR.value = stateVector.r;
            if (sliderF) sliderF.value = stateVector.F;
            if (sliderTheta) sliderTheta.value = stateVector.thetaDeg;
            updateVectorUI();
        });
    });

    function updateVectorUI() {
        if (lblR) lblR.textContent = `${stateVector.r.toFixed(1)} m`;
        if (lblF) lblF.textContent = `${stateVector.F.toFixed(1)} N`;
        if (lblTheta) lblTheta.textContent = `${stateVector.thetaDeg}°`;

        const thetaRad = stateVector.thetaDeg * Math.PI / 180;
        const d = stateVector.r * Math.sin(thetaRad);
        const torque = stateVector.r * stateVector.F * Math.sin(thetaRad);

        const valRDisp = document.getElementById('val-r-disp');
        const valFDisp = document.getElementById('val-f-disp');
        const valThetaDisp = document.getElementById('val-theta-disp');
        const valDDisp = document.getElementById('val-d-disp');
        const valTDisp = document.getElementById('val-t-disp');

        if (valRDisp) valRDisp.textContent = stateVector.r.toFixed(2);
        if (valFDisp) valFDisp.textContent = stateVector.F.toFixed(2);
        if (valThetaDisp) valThetaDisp.textContent = stateVector.thetaDeg;
        if (valDDisp) valDDisp.textContent = d.toFixed(2);
        if (valTDisp) valTDisp.textContent = torque.toFixed(2);

        const badgeDir = document.getElementById('vector-dir-badge');
        const badgeMag = document.getElementById('vector-mag-badge');

        const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
        if (badgeMag) badgeMag.textContent = isEn ? `Net Torque τ = ${torque.toFixed(1)} N·m` : `알짜 돌림힘 τ = ${torque.toFixed(1)} N·m`;
        if (badgeDir) {
            if (Math.abs(torque) < 0.01) {
                badgeDir.textContent = isEn ? 'No Rotation (Net Torque 0)' : '회전 없음 (알짜 돌림힘 0)';
                badgeDir.className = 'badge warning';
            } else {
                badgeDir.textContent = isEn ? 'Rotation: Counter-Clockwise (+)' : '회전 방향: 반시계 방향 (+)';
                badgeDir.className = 'badge purple';
            }
        }

        const formulaBreakdown = document.getElementById('formula-breakdown-1');
        if (formulaBreakdown) {
            formulaBreakdown.innerHTML = `
                τ = r × F × sin(θ) = F × d<br>
                τ = <span class="highlight-r">${stateVector.r.toFixed(2)} m</span> × <span class="highlight-f">${stateVector.F.toFixed(2)} N</span> × sin(<span class="highlight-d">${stateVector.thetaDeg}°</span>)<br>
                τ = <span class="highlight-r">${stateVector.r.toFixed(2)} m</span> × <span class="highlight-f">${stateVector.F.toFixed(2)} N</span> × ${Math.sin(thetaRad).toFixed(2)}<br>
                <strong>τ = <span class="highlight-t">${torque.toFixed(2)} N·m</span></strong>
            `;
        }

        const valArmCalc = document.getElementById('val-arm-calc');
        if (valArmCalc) valArmCalc.textContent = `${d.toFixed(2)} m`;
    }

    function getCanvasCoords(canvas, e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    function getVectorParams() {
        if (!canvasVector) return { pivotX: 0, pivotY: 0, scaleR: 100, scaleF: 10, dpr: 1 };
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = canvasVector.width;
        const h = canvasVector.height;
        const pivotX = w * 0.18;
        const pivotY = h * 0.60;
        const scaleR = Math.min((w * 0.58) / 4.0, h * 0.22);
        const scaleF = scaleR * 0.05;
        return { dpr, w, h, pivotX, pivotY, scaleR, scaleF };
    }

    if (canvasVector) {
        const onDown = (e) => {
            const pos = getCanvasCoords(canvasVector, e);
            const { dpr, pivotX, pivotY, scaleR, scaleF } = getVectorParams();

            const pX = pivotX + stateVector.r * scaleR;
            const pY = pivotY;

            const thetaRad = stateVector.thetaDeg * Math.PI / 180;
            const fX = pX + stateVector.F * scaleF * Math.cos(-thetaRad);
            const fY = pY + stateVector.F * scaleF * Math.sin(-thetaRad);

            const distP = Math.hypot(pos.x - pX, pos.y - pY);
            const distF = Math.hypot(pos.x - fX, pos.y - fY);

            if (distF < 30 * dpr) {
                stateVector.isDraggingForce = true;
            } else if (distP < 30 * dpr) {
                stateVector.isDraggingHandle = true;
            }
        };

        const onMove = (e) => {
            if (!stateVector.isDraggingHandle && !stateVector.isDraggingForce) return;
            const pos = getCanvasCoords(canvasVector, e);
            const { pivotX, pivotY, scaleR, scaleF } = getVectorParams();

            if (stateVector.isDraggingHandle) {
                let newR = (pos.x - pivotX) / scaleR;
                newR = Math.max(0.2, Math.min(4.0, newR));
                stateVector.r = newR;
                if (sliderR) sliderR.value = newR;
                updateVectorUI();
            } else if (stateVector.isDraggingForce) {
                const pX = pivotX + stateVector.r * scaleR;
                const pY = pivotY;
                const dx = pos.x - pX;
                const dy = pos.y - pY;
                let newF = Math.hypot(dx, dy) / scaleF;
                newF = Math.max(0, Math.min(30, newF));

                let angleRad = -Math.atan2(dy, dx);
                if (angleRad < 0) angleRad += Math.PI * 2;
                let angleDeg = Math.round(angleRad * 180 / Math.PI);
                if (angleDeg > 180) angleDeg = 180;

                stateVector.F = newF;
                stateVector.thetaDeg = angleDeg;
                if (sliderF) sliderF.value = newF;
                if (sliderTheta) sliderTheta.value = angleDeg;
                updateVectorUI();
            }
        };

        const onUp = () => {
            stateVector.isDraggingHandle = false;
            stateVector.isDraggingForce = false;
        };

        canvasVector.addEventListener('mousedown', onDown);
        canvasVector.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);

        canvasVector.addEventListener('touchstart', (e) => { onDown(e); if (e.cancelable) e.preventDefault(); }, { passive: false });
        canvasVector.addEventListener('touchmove', (e) => { onMove(e); if (e.cancelable) e.preventDefault(); }, { passive: false });
        window.addEventListener('touchend', onUp);
    }

    function renderVectorCanvas() {
        if (!ctxVector || !canvasVector) return;
        const { dpr, w, h, pivotX, pivotY, scaleR, scaleF } = getVectorParams();

        ctxVector.clearRect(0, 0, w, h);

        const thetaRad = stateVector.thetaDeg * Math.PI / 180;
        const pX = pivotX + stateVector.r * scaleR;
        const pY = pivotY;

        // Grid Lines
        ctxVector.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctxVector.lineWidth = 1 * dpr;
        const gridSize = 45 * dpr;
        for (let x = 0; x < w; x += gridSize) {
            ctxVector.beginPath(); ctxVector.moveTo(x, 0); ctxVector.lineTo(x, h); ctxVector.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
            ctxVector.beginPath(); ctxVector.moveTo(0, y); ctxVector.lineTo(w, y); ctxVector.stroke();
        }

        // Beam
        ctxVector.save();
        ctxVector.fillStyle = 'rgba(30, 41, 59, 0.95)';
        ctxVector.strokeStyle = 'rgba(148, 163, 184, 0.5)';
        ctxVector.lineWidth = 3 * dpr;
        ctxVector.beginPath();
        ctxVector.roundRect(pivotX - 20 * dpr, pivotY - 12 * dpr, (stateVector.r * scaleR) + 40 * dpr, 24 * dpr, 8 * dpr);
        ctxVector.fill();
        ctxVector.stroke();
        ctxVector.restore();

        // Distance Notches
        ctxVector.fillStyle = '#94a3b8';
        ctxVector.font = `bold ${12 * dpr}px JetBrains Mono`;
        ctxVector.textAlign = 'center';
        for (let m = 0.5; m <= 4.0; m += 0.5) {
            const nx = pivotX + m * scaleR;
            if (nx <= pX + 20 * dpr) {
                ctxVector.beginPath();
                ctxVector.moveTo(nx, pivotY - 12 * dpr);
                ctxVector.lineTo(nx, pivotY + 12 * dpr);
                ctxVector.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                ctxVector.stroke();
                if (Number.isInteger(m) || scaleR > 55 * dpr) {
                    ctxVector.fillText(`${m}m`, nx, pivotY + 30 * dpr);
                }
            }
        }

        // Position Vector r
        ctxVector.save();
        ctxVector.strokeStyle = '#38bdf8';
        ctxVector.lineWidth = 6 * dpr;
        ctxVector.shadowColor = 'rgba(56, 189, 248, 0.6)';
        ctxVector.shadowBlur = 12 * dpr;
        ctxVector.beginPath();
        ctxVector.moveTo(pivotX, pivotY);
        ctxVector.lineTo(pX, pY);
        ctxVector.stroke();
        ctxVector.restore();

        // Pivot Support O
        ctxVector.save();
        ctxVector.fillStyle = '#e2e8f0';
        ctxVector.strokeStyle = '#38bdf8';
        ctxVector.lineWidth = 4 * dpr;
        ctxVector.beginPath();
        ctxVector.moveTo(pivotX, pivotY - 14 * dpr);
        ctxVector.lineTo(pivotX - 22 * dpr, pivotY + 28 * dpr);
        ctxVector.lineTo(pivotX + 22 * dpr, pivotY + 28 * dpr);
        ctxVector.closePath();
        ctxVector.fill();
        ctxVector.stroke();

        ctxVector.fillStyle = '#0f172a';
        ctxVector.beginPath();
        ctxVector.arc(pivotX, pivotY, 6 * dpr, 0, Math.PI * 2);
        ctxVector.fill();
        ctxVector.restore();

        const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
        ctxVector.fillStyle = '#38bdf8';
        ctxVector.font = `bold ${14 * dpr}px Inter`;
        ctxVector.fillText(isEn ? 'Pivot O' : '회전축 O', pivotX, pivotY + 48 * dpr);

        // Action Point P
        ctxVector.save();
        ctxVector.fillStyle = '#38bdf8';
        ctxVector.beginPath();
        ctxVector.arc(pX, pY, 10 * dpr, 0, Math.PI * 2);
        ctxVector.fill();
        ctxVector.strokeStyle = '#ffffff';
        ctxVector.lineWidth = 3 * dpr;
        ctxVector.stroke();
        ctxVector.restore();

        ctxVector.fillStyle = '#f8fafc';
        ctxVector.font = `bold ${14 * dpr}px Inter`;
        ctxVector.fillText(isEn ? 'Point P' : '작용점 P', pX, pY + 48 * dpr);

        // Force Arrow Coordinates
        const fLength = stateVector.F * scaleF;
        const fX = pX + fLength * Math.cos(-thetaRad);
        const fY = pY + fLength * Math.sin(-thetaRad);

        // Angle Arc θ
        if (stateVector.F > 0) {
            ctxVector.save();
            ctxVector.strokeStyle = '#fbbf24';
            ctxVector.lineWidth = 3 * dpr;
            ctxVector.beginPath();
            ctxVector.arc(pX, pY, 45 * dpr, 0, -thetaRad, true);
            ctxVector.stroke();

            ctxVector.fillStyle = '#fbbf24';
            ctxVector.font = `bold ${14 * dpr}px JetBrains Mono`;
            ctxVector.fillText(`θ = ${stateVector.thetaDeg}°`, pX + 60 * dpr * Math.cos(-thetaRad / 2), pY + 60 * dpr * Math.sin(-thetaRad / 2));
            ctxVector.restore();
        }

        // Effective Lever Arm d (Always Visible!)
        if (stateVector.F > 0 && stateVector.thetaDeg > 0 && stateVector.thetaDeg < 180) {
            const dVal = stateVector.r * Math.sin(thetaRad);
            const perpAngle = -thetaRad + Math.PI / 2;
            const armEndX = pivotX + dVal * scaleR * Math.cos(perpAngle);
            const armEndY = pivotY + dVal * scaleR * Math.sin(perpAngle);

            ctxVector.save();
            ctxVector.strokeStyle = '#fbbf24';
            ctxVector.setLineDash([5 * dpr, 5 * dpr]);
            ctxVector.lineWidth = 3 * dpr;
            ctxVector.beginPath();
            ctxVector.moveTo(pivotX, pivotY);
            ctxVector.lineTo(armEndX, armEndY);
            ctxVector.stroke();

            ctxVector.strokeStyle = 'rgba(255, 82, 82, 0.35)';
            ctxVector.beginPath();
            ctxVector.moveTo(pX, pY);
            ctxVector.lineTo(armEndX, armEndY);
            ctxVector.stroke();

            ctxVector.fillStyle = '#fbbf24';
            ctxVector.font = `bold ${13 * dpr}px Inter`;
            ctxVector.fillText(isEn ? `Lever arm d = ${dVal.toFixed(2)}m` : `팔의 길이 d = ${dVal.toFixed(2)}m`, (pivotX + armEndX) / 2 - 12 * dpr, (pivotY + armEndY) / 2 - 12 * dpr);
            ctxVector.restore();
        }

        // Primary Force Vector F
        if (stateVector.F > 0) {
            ctxVector.save();
            ctxVector.strokeStyle = '#ff5252';
            ctxVector.fillStyle = '#ff5252';
            ctxVector.lineWidth = 6 * dpr;
            ctxVector.shadowColor = 'rgba(255, 82, 82, 0.7)';
            ctxVector.shadowBlur = 14 * dpr;

            ctxVector.beginPath();
            ctxVector.moveTo(pX, pY);
            ctxVector.lineTo(fX, fY);
            ctxVector.stroke();

            const headLen = 20 * dpr;
            const arrowAngle = Math.atan2(fY - pY, fX - pX);
            ctxVector.beginPath();
            ctxVector.moveTo(fX, fY);
            ctxVector.lineTo(fX - headLen * Math.cos(arrowAngle - Math.PI / 6), fY - headLen * Math.sin(arrowAngle - Math.PI / 6));
            ctxVector.lineTo(fX - headLen * Math.cos(arrowAngle + Math.PI / 6), fY - headLen * Math.sin(arrowAngle + Math.PI / 6));
            ctxVector.closePath();
            ctxVector.fill();
            ctxVector.font = `bold ${14 * dpr}px Inter`;
            const textString = `F = ${stateVector.F.toFixed(1)} N`;
            const textWidth = ctxVector.measureText(textString).width;
            let textX = fX + 10 * dpr;
            if (textX + textWidth > w - 10 * dpr) {
                textX = fX - textWidth - 10 * dpr;
            }
            ctxVector.fillText(textString, textX, fY - 5 * dpr);
            ctxVector.restore();
        }
    }


    // ==========================================================================
    // TAB 2: 강체의 역학적 평형 Engine (Overlap Prevention & Stacked Masses)
    // ==========================================================================
    const stateSeesaw = {
        beamLength: 10.0,
        beamMass: 2.0,
        supportMode: 2,
        suppAPos: -3.0,
        suppBPos: 3.0,
        activePivotPos: -3.0,
        angleRad: 0,
        angularVel: 0,
        showGrid: true,
        weights: [
            { id: 1, mass: 2, pos: -2.0 },
            { id: 2, mass: 4, pos: 1.0 }
        ]
    };

    function getSeesawParams() {
        if (!canvasSeesaw) return { centerX: 0, pivotY: 0, scaleM: 80, dpr: 1 };
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = canvasSeesaw.width;
        const h = canvasSeesaw.height;
        const centerX = w / 2;
        const pivotY = h * 0.50;
        const scaleM = Math.min(w / 11.5, h / 4.2);
        return { dpr, w, h, centerX, pivotY, scaleM };
    }

    const sliderBeamMass = document.getElementById('slider-beam-mass');
    const sliderSuppA = document.getElementById('slider-supp-a');
    const sliderSuppB = document.getElementById('slider-supp-b');
    const lblBeamMass = document.getElementById('lbl-beam-mass');
    const lblSuppA = document.getElementById('lbl-supp-a');
    const lblSuppB = document.getElementById('lbl-supp-b');

    const btnSupportsMode = document.getElementById('btn-supports-mode');
    const btnClearWeights = document.getElementById('btn-clear-weights');
    const btnAutoBalance = document.getElementById('btn-auto-balance');
    const btnToggleGrid = document.getElementById('btn-toggle-grid');
    const groupSuppB = document.getElementById('group-supp-b');

    if (sliderBeamMass) {
        sliderBeamMass.addEventListener('input', (e) => {
            stateSeesaw.beamMass = parseFloat(e.target.value);
            if (lblBeamMass) lblBeamMass.textContent = `${stateSeesaw.beamMass.toFixed(1)} kg`;
        });
    }

    if (sliderSuppA) {
        sliderSuppA.addEventListener('input', (e) => {
            let val = parseFloat(e.target.value);
            // Overlap prevention with Support B in 2-support mode
            if (stateSeesaw.supportMode === 2) {
                if (Math.abs(val - stateSeesaw.suppBPos) < 0.25) {
                    val = val < stateSeesaw.suppBPos ? stateSeesaw.suppBPos - 0.25 : stateSeesaw.suppBPos + 0.25;
                }
            }
            stateSeesaw.suppAPos = val;
            if (lblSuppA) lblSuppA.textContent = `${val >= 0 ? '+' : ''}${val.toFixed(1)} m`;
        });
    }

    if (sliderSuppB) {
        sliderSuppB.addEventListener('input', (e) => {
            let val = parseFloat(e.target.value);
            // Overlap prevention with Support A in 2-support mode
            if (stateSeesaw.supportMode === 2) {
                if (Math.abs(val - stateSeesaw.suppAPos) < 0.25) {
                    val = val < stateSeesaw.suppAPos ? stateSeesaw.suppAPos - 0.25 : stateSeesaw.suppAPos + 0.25;
                }
            }
            stateSeesaw.suppBPos = val;
            if (lblSuppB) lblSuppB.textContent = `${val >= 0 ? '+' : ''}${val.toFixed(1)} m`;
        });
    }

    const btnSupp1 = document.getElementById('btn-supp-1');
    const btnSupp2 = document.getElementById('btn-supp-2');

    function setSupportMode(mode) {
        stateSeesaw.supportMode = mode;
        const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
        if (btnSupp1) btnSupp1.classList.toggle('active', mode === 1);
        if (btnSupp2) btnSupp2.classList.toggle('active', mode === 2);
        if (btnSupportsMode) {
            btnSupportsMode.classList.toggle('active', mode === 2);
            btnSupportsMode.innerHTML = mode === 2 ?
                (isEn ? '<i class="fa-solid fa-bars-staggered"></i> Dual Support Mode' : '<i class="fa-solid fa-bars-staggered"></i> 받침대 2개 모드') :
                (isEn ? '<i class="fa-solid fa-caret-up"></i> Single Support (Seesaw) Mode' : '<i class="fa-solid fa-caret-up"></i> 받침대 1개 (시소) 모드');
        }
        if (groupSuppB) groupSuppB.style.display = mode === 2 ? 'flex' : 'none';
    }

    if (btnSupp1) {
        btnSupp1.addEventListener('click', () => {
            sound.playClick();
            setSupportMode(1);
        });
    }

    if (btnSupp2) {
        btnSupp2.addEventListener('click', () => {
            sound.playClick();
            setSupportMode(2);
        });
    }

    if (btnSupportsMode) {
        btnSupportsMode.addEventListener('click', () => {
            sound.playClick();
            const newMode = stateSeesaw.supportMode === 2 ? 1 : 2;
            setSupportMode(newMode);
        });
    }

    if (btnClearWeights) {
        btnClearWeights.addEventListener('click', () => {
            sound.playClick();
            stateSeesaw.weights = [];
        });
    }

    if (btnAutoBalance) {
        btnAutoBalance.addEventListener('click', () => {
            sound.playClick();
            const pivotRef = stateSeesaw.suppAPos;
            let netTorqueA = (0 - pivotRef) * (stateSeesaw.beamMass * 9.8);
            stateSeesaw.weights.forEach(w => {
                netTorqueA += (w.pos - pivotRef) * (w.mass * 9.8);
            });

            if (stateSeesaw.supportMode === 1) {
                const diff = netTorqueA;
                if (Math.abs(diff) > 0.01) {
                    const targetPos = pivotRef + 2.0;
                    const neededMass = Math.min(10, Math.max(1, +(Math.abs(diff) / (2.0 * 9.8)).toFixed(1)));
                    stateSeesaw.weights.push({ id: Date.now(), mass: neededMass, pos: Math.min(4.5, targetPos) });
                }
            }
        });
    }

    if (btnToggleGrid) {
        btnToggleGrid.addEventListener('click', () => {
            sound.playClick();
            stateSeesaw.showGrid = !stateSeesaw.showGrid;
            btnToggleGrid.classList.toggle('active', stateSeesaw.showGrid);
        });
    }

    document.querySelectorAll('.weight-item').forEach(item => {
        item.addEventListener('click', () => {
            sound.playClick();
            const mass = parseFloat(item.getAttribute('data-mass'));
            stateSeesaw.weights.push({ id: Date.now(), mass: mass, pos: 0.0 });
        });

        item.addEventListener('dragstart', (e) => {
            sound.playClick();
            const mass = parseFloat(item.getAttribute('data-mass'));
            e.dataTransfer.setData('text/plain', mass.toString());
        });
    });

    if (canvasSeesaw) {
        canvasSeesaw.addEventListener('dragover', (e) => e.preventDefault());
        canvasSeesaw.addEventListener('drop', (e) => {
            e.preventDefault();
            const massStr = e.dataTransfer.getData('text/plain');
            if (!massStr) return;
            const mass = parseFloat(massStr);
            const pos = getCanvasCoords(canvasSeesaw, e);
            const { centerX, scaleM } = getSeesawParams();

            let mPos = (pos.x - centerX) / scaleM;
            mPos = Math.round(mPos * 4) / 4;
            mPos = Math.max(-4.5, Math.min(4.5, mPos));

            stateSeesaw.weights.push({ id: Date.now(), mass: mass, pos: mPos });
        });

        let activeWeight = null;
        let activeSupport = null;

        const onSeesawDown = (e) => {
            const pos = getCanvasCoords(canvasSeesaw, e);
            const { dpr, centerX, pivotY, scaleM } = getSeesawParams();

            stateSeesaw.weights.forEach(w => {
                const wx = centerX + w.pos * scaleM;
                const wy = pivotY - (20 * dpr);
                if (Math.hypot(pos.x - wx, pos.y - wy) < 40 * dpr) {
                    activeWeight = w;
                }
            });

            if (!activeWeight) {
                const suppAx = centerX + stateSeesaw.suppAPos * scaleM;
                if (Math.hypot(pos.x - suppAx, pos.y - (pivotY + 20 * dpr)) < 45 * dpr) {
                    activeSupport = 'A';
                } else if (stateSeesaw.supportMode === 2) {
                    const suppBx = centerX + stateSeesaw.suppBPos * scaleM;
                    if (Math.hypot(pos.x - suppBx, pos.y - (pivotY + 20 * dpr)) < 45 * dpr) {
                        activeSupport = 'B';
                    }
                }
            }
        };

        const onSeesawMove = (e) => {
            if (!activeWeight && !activeSupport) return;
            const pos = getCanvasCoords(canvasSeesaw, e);
            const { centerX, scaleM } = getSeesawParams();

            let mPos = (pos.x - centerX) / scaleM;
            mPos = Math.round(mPos * 4) / 4;
            mPos = Math.max(-4.5, Math.min(4.5, mPos));

            if (activeWeight) {
                activeWeight.pos = mPos;
            } else if (activeSupport === 'A') {
                if (stateSeesaw.supportMode === 2 && Math.abs(mPos - stateSeesaw.suppBPos) < 0.25) {
                    mPos = mPos < stateSeesaw.suppBPos ? stateSeesaw.suppBPos - 0.25 : stateSeesaw.suppBPos + 0.25;
                }
                stateSeesaw.suppAPos = mPos;
                if (sliderSuppA) sliderSuppA.value = mPos;
                if (lblSuppA) lblSuppA.textContent = `${mPos >= 0 ? '+' : ''}${mPos.toFixed(1)} m`;
            } else if (activeSupport === 'B') {
                if (stateSeesaw.supportMode === 2 && Math.abs(mPos - stateSeesaw.suppAPos) < 0.25) {
                    mPos = mPos < stateSeesaw.suppAPos ? stateSeesaw.suppAPos - 0.25 : stateSeesaw.suppAPos + 0.25;
                }
                stateSeesaw.suppBPos = mPos;
                if (sliderSuppB) sliderSuppB.value = mPos;
                if (lblSuppB) lblSuppB.textContent = `${mPos >= 0 ? '+' : ''}${mPos.toFixed(1)} m`;
            }
        };

        const onSeesawUp = () => {
            activeWeight = null;
            activeSupport = null;
        };

        canvasSeesaw.addEventListener('mousedown', onSeesawDown);
        canvasSeesaw.addEventListener('mousemove', onSeesawMove);
        window.addEventListener('mouseup', onSeesawUp);

        canvasSeesaw.addEventListener('touchstart', (e) => { onSeesawDown(e); if (e.cancelable) e.preventDefault(); }, { passive: false });
        canvasSeesaw.addEventListener('touchmove', (e) => { onSeesawMove(e); if (e.cancelable) e.preventDefault(); }, { passive: false });
        window.addEventListener('touchend', onSeesawUp);
    }

    function updateSeesawPhysics(dt) {
        const g = 9.8;
        const { dpr, scaleM } = getSeesawParams();
        let totalMass = stateSeesaw.beamMass;
        stateSeesaw.weights.forEach(w => totalMass += w.mass);
        const totalWeight = totalMass * g;

        const pivotA = stateSeesaw.suppAPos;
        const pivotB = stateSeesaw.suppBPos;

        // Torques around Pivot A and Pivot B
        let torqueSumA = (0 - pivotA) * (stateSeesaw.beamMass * g);
        let torqueSumB = (0 - pivotB) * (stateSeesaw.beamMass * g);

        let sumCCW = 0;
        let sumCW = 0;

        stateSeesaw.weights.forEach(w => {
            const rA = w.pos - pivotA;
            const tValA = rA * (w.mass * g);
            torqueSumA += tValA;
            if (tValA < 0) sumCCW += Math.abs(tValA);
            else sumCW += tValA;

            const rB = w.pos - pivotB;
            torqueSumB += rB * (w.mass * g);
        });

        let Fn1 = 0;
        let Fn2 = 0;

        if (stateSeesaw.supportMode === 2) {
            const distAB = pivotB - pivotA;

            if (Math.abs(distAB) < 0.01) {
                Fn1 = totalWeight / 2;
                Fn2 = totalWeight / 2;
            } else if (pivotA < pivotB) {
                Fn2 = torqueSumA / distAB;
                Fn1 = totalWeight - Fn2;
            } else {
                Fn1 = torqueSumB / (pivotA - pivotB);
                Fn2 = totalWeight - Fn1;
            }

            if (Fn1 >= 0 && Fn2 >= 0) {
                stateSeesaw.angleRad = 0;
                stateSeesaw.angularVel = 0;
                stateSeesaw.activePivotPos = pivotA;
            } else {
                let tipPivot;
                if (pivotA < pivotB) {
                    tipPivot = Fn1 < 0 ? pivotB : pivotA;
                } else {
                    tipPivot = Fn2 < 0 ? pivotA : pivotB;
                }
                stateSeesaw.activePivotPos = tipPivot;

                let netTippingTorque = (0 - tipPivot) * (stateSeesaw.beamMass * g);
                stateSeesaw.weights.forEach(w => {
                    netTippingTorque += (w.pos - tipPivot) * (w.mass * g);
                });

                let I = (1 / 12) * stateSeesaw.beamMass * Math.pow(stateSeesaw.beamLength, 2);
                stateSeesaw.weights.forEach(w => {
                    I += w.mass * Math.pow(w.pos - tipPivot, 2);
                });

                const alpha = netTippingTorque / I;
                stateSeesaw.angularVel += alpha * dt;
                stateSeesaw.angularVel *= 0.95;
                stateSeesaw.angleRad += stateSeesaw.angularVel * dt;

                const distRight = (5.0 - tipPivot) * scaleM;
                const distLeft = (tipPivot - (-5.0)) * scaleM;
                const maxAngleRight = Math.atan2(26 * dpr, Math.max(1, distRight));
                const maxAngleLeft = Math.atan2(26 * dpr, Math.max(1, distLeft));

                if (stateSeesaw.angleRad > maxAngleRight) {
                    stateSeesaw.angleRad = maxAngleRight;
                    stateSeesaw.angularVel = 0;
                } else if (stateSeesaw.angleRad < -maxAngleLeft) {
                    stateSeesaw.angleRad = -maxAngleLeft;
                    stateSeesaw.angularVel = 0;
                }
            }
        } else {
            stateSeesaw.activePivotPos = pivotA;
            Fn1 = totalWeight;
            Fn2 = 0;

            let netTorqueSingle = (0 - pivotA) * (stateSeesaw.beamMass * g);
            stateSeesaw.weights.forEach(w => {
                netTorqueSingle += (w.pos - pivotA) * (w.mass * g);
            });

            let I = (1 / 12) * stateSeesaw.beamMass * Math.pow(stateSeesaw.beamLength, 2);
            stateSeesaw.weights.forEach(w => {
                I += w.mass * Math.pow(w.pos - pivotA, 2);
            });

            const alpha = netTorqueSingle / I;
            stateSeesaw.angularVel += alpha * dt;
            stateSeesaw.angularVel *= 0.95;
            stateSeesaw.angleRad += stateSeesaw.angularVel * dt;

            const distRight = (5.0 - pivotA) * scaleM;
            const distLeft = (pivotA - (-5.0)) * scaleM;
            const maxAngleRight = Math.atan2(26 * dpr, Math.max(1, distRight));
            const maxAngleLeft = Math.atan2(26 * dpr, Math.max(1, distLeft));

            if (stateSeesaw.angleRad > maxAngleRight) {
                stateSeesaw.angleRad = maxAngleRight;
                stateSeesaw.angularVel = 0;
            } else if (stateSeesaw.angleRad < -maxAngleLeft) {
                stateSeesaw.angleRad = -maxAngleLeft;
                stateSeesaw.angularVel = 0;
            }
        }

        const seesawStatusBadge = document.getElementById('seesaw-status-badge');
        const seesawNetBadge = document.getElementById('seesaw-net-badge');
        const valTotalWeightCalc = document.getElementById('val-total-weight-calc');
        const valTauCcw = document.getElementById('val-tau-ccw');
        const valTauCw = document.getElementById('val-tau-cw');
        const valTauNetSeesaw = document.getElementById('val-tau-net-seesaw');
        const valFn1Disp = document.getElementById('val-fn1-disp');
        const valFn2Disp = document.getElementById('val-fn2-disp');

        if (valTotalWeightCalc) valTotalWeightCalc.textContent = `${totalWeight.toFixed(1)} N`;
        if (valTauCcw) valTauCcw.textContent = `${sumCCW.toFixed(1)} N·m`;
        if (valTauCw) valTauCw.textContent = `${sumCW.toFixed(1)} N·m`;
        if (valTauNetSeesaw) valTauNetSeesaw.textContent = `${Math.abs(torqueSumA).toFixed(1)} N·m`;

        if (valFn1Disp) valFn1Disp.textContent = `${Math.max(0, Fn1).toFixed(1)} N`;
        if (valFn2Disp) valFn2Disp.textContent = `${Math.max(0, Fn2).toFixed(1)} N`;

        const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
        if (seesawNetBadge) seesawNetBadge.textContent = isEn ? `Torque rel. Support A: ${torqueSumA.toFixed(1)} N·m` : `받침점 A 기준 돌림힘: ${torqueSumA.toFixed(1)} N·m`;
        if (seesawStatusBadge) {
            if (stateSeesaw.supportMode === 2 && Fn1 >= 0 && Fn2 >= 0) {
                seesawStatusBadge.textContent = isEn ? 'Mechanical Equilibrium ∑F=0, ∑τ=0 ✓' : '역학적 평형 상태 ∑F=0, ∑τ=0 ✓';
                seesawStatusBadge.className = 'badge success';
            } else if (Math.abs(torqueSumA) < 0.1) {
                seesawStatusBadge.textContent = isEn ? 'Rotational Equilibrium Net Torque 0 ✓' : '회전 평형 상태 알짜 돌림힘 0 ✓';
                seesawStatusBadge.className = 'badge success';
            } else {
                seesawStatusBadge.textContent = isEn ? 'Unbalanced State' : '불평형 상태';
                seesawStatusBadge.className = 'badge warning';
            }
        }
    }

    function renderSeesawCanvas() {
        if (!ctxSeesaw || !canvasSeesaw) return;
        const { dpr, w, h, centerX, pivotY, scaleM } = getSeesawParams();

        ctxSeesaw.clearRect(0, 0, w, h);

        const suppAx = centerX + (stateSeesaw.suppAPos * scaleM);
        const suppBx = centerX + (stateSeesaw.suppBPos * scaleM);

        const activePivotPos = stateSeesaw.activePivotPos !== undefined ? stateSeesaw.activePivotPos : stateSeesaw.suppAPos;
        const pivotPxX = centerX + (activePivotPos * scaleM);

        // Ground Line
        const groundY = pivotY + 42 * dpr;
        ctxSeesaw.fillStyle = '#1e293b';
        ctxSeesaw.fillRect(0, groundY, w, h - groundY);
        ctxSeesaw.strokeStyle = '#334155';
        ctxSeesaw.lineWidth = 3 * dpr;
        ctxSeesaw.beginPath();
        ctxSeesaw.moveTo(0, groundY);
        ctxSeesaw.lineTo(w, groundY);
        ctxSeesaw.stroke();

        // Check if Support A and Support B text labels overlap
        const isSuppLabelClose = stateSeesaw.supportMode === 2 && Math.abs(suppAx - suppBx) < 70 * dpr;

        // Pillar / Support A (Red/Coral)
        const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
        ctxSeesaw.save();
        ctxSeesaw.fillStyle = '#475569';
        ctxSeesaw.strokeStyle = '#ff5252';
        ctxSeesaw.lineWidth = 4 * dpr;
        ctxSeesaw.beginPath();
        ctxSeesaw.moveTo(suppAx, pivotY);
        ctxSeesaw.lineTo(suppAx - 24 * dpr, groundY);
        ctxSeesaw.lineTo(suppAx + 24 * dpr, groundY);
        ctxSeesaw.closePath();
        ctxSeesaw.fill();
        ctxSeesaw.stroke();

        ctxSeesaw.fillStyle = '#ff5252';
        ctxSeesaw.font = `bold ${13 * dpr}px Inter`;
        ctxSeesaw.textAlign = 'center';
        const labelAY = isSuppLabelClose ? groundY + 16 * dpr : groundY + 18 * dpr;
        ctxSeesaw.fillText(isEn ? `Support A ${stateSeesaw.suppAPos >= 0 ? '+' : ''}${stateSeesaw.suppAPos.toFixed(1)}m` : `받침점 A ${stateSeesaw.suppAPos >= 0 ? '+' : ''}${stateSeesaw.suppAPos.toFixed(1)}m`, suppAx, labelAY);
        ctxSeesaw.restore();

        // Pillar / Support B (Amber Gold)
        if (stateSeesaw.supportMode === 2) {
            ctxSeesaw.save();
            ctxSeesaw.fillStyle = '#475569';
            ctxSeesaw.strokeStyle = '#fbbf24';
            ctxSeesaw.lineWidth = 4 * dpr;
            ctxSeesaw.beginPath();
            ctxSeesaw.moveTo(suppBx, pivotY);
            ctxSeesaw.lineTo(suppBx - 24 * dpr, groundY);
            ctxSeesaw.lineTo(suppBx + 24 * dpr, groundY);
            ctxSeesaw.closePath();
            ctxSeesaw.fill();
            ctxSeesaw.stroke();

            ctxSeesaw.fillStyle = '#fbbf24';
            ctxSeesaw.font = `bold ${13 * dpr}px Inter`;
            ctxSeesaw.textAlign = 'center';
            const labelBY = isSuppLabelClose ? groundY + 33 * dpr : groundY + 18 * dpr;
            ctxSeesaw.fillText(isEn ? `Support B ${stateSeesaw.suppBPos >= 0 ? '+' : ''}${stateSeesaw.suppBPos.toFixed(1)}m` : `받침점 B ${stateSeesaw.suppBPos >= 0 ? '+' : ''}${stateSeesaw.suppBPos.toFixed(1)}m`, suppBx, labelBY);
            ctxSeesaw.restore();
        }

        // Draw Rotating Beam ATTACHED to Active Pivot!
        ctxSeesaw.save();
        ctxSeesaw.translate(pivotPxX, pivotY);
        ctxSeesaw.rotate(stateSeesaw.angleRad);

        const beamPxLen = stateSeesaw.beamLength * scaleM;
        const beamCenterRelX = (0 - activePivotPos) * scaleM;

        ctxSeesaw.fillStyle = 'rgba(30, 41, 59, 0.95)';
        ctxSeesaw.strokeStyle = '#94a3b8';
        ctxSeesaw.lineWidth = 4 * dpr;
        ctxSeesaw.beginPath();
        ctxSeesaw.roundRect(beamCenterRelX - beamPxLen / 2, -14 * dpr, beamPxLen, 28 * dpr, 10 * dpr);
        ctxSeesaw.fill();
        ctxSeesaw.stroke();

        // Grid Notches on Beam (Drawn below beam: +26*dpr)
        if (stateSeesaw.showGrid) {
            ctxSeesaw.fillStyle = '#94a3b8';
            ctxSeesaw.font = `bold ${11 * dpr}px JetBrains Mono`;
            ctxSeesaw.textAlign = 'center';
            const step = scaleM < 45 * dpr ? 1.0 : 0.5;
            for (let m = -4.5; m <= 4.5; m += 0.5) {
                const markRelX = (m - activePivotPos) * scaleM;
                ctxSeesaw.beginPath();
                ctxSeesaw.moveTo(markRelX, -14 * dpr);
                ctxSeesaw.lineTo(markRelX, 14 * dpr);
                ctxSeesaw.strokeStyle = m === 0 ? '#38bdf8' : 'rgba(255,255,255,0.25)';
                ctxSeesaw.stroke();

                if (Math.abs(m % step) < 0.01) {
                    ctxSeesaw.fillText(`${m > 0 ? '+' : ''}${m}m`, markRelX, 26 * dpr);
                }
            }
        }

        // Beam CG Vector
        if (stateSeesaw.beamMass > 0) {
            ctxSeesaw.save();
            ctxSeesaw.translate(beamCenterRelX, 0);
            ctxSeesaw.rotate(-stateSeesaw.angleRad);

            ctxSeesaw.strokeStyle = 'rgba(56, 189, 248, 0.85)';
            ctxSeesaw.lineWidth = 3 * dpr;
            ctxSeesaw.beginPath();
            ctxSeesaw.moveTo(0, 0);
            ctxSeesaw.lineTo(0, 42 * dpr);
            ctxSeesaw.stroke();

            ctxSeesaw.fillStyle = '#38bdf8';
            ctxSeesaw.font = `bold ${11 * dpr}px Inter`;
            ctxSeesaw.textAlign = 'center';
            const cgPxX = centerX;
            const isNearSuppA = Math.abs(cgPxX - suppAx) < 35 * dpr;
            const isNearSuppB = stateSeesaw.supportMode === 2 && Math.abs(cgPxX - suppBx) < 35 * dpr;
            const cgTextY = (isNearSuppA || isNearSuppB) ? -22 * dpr : 38 * dpr;
            ctxSeesaw.fillText(`Mg = ${(stateSeesaw.beamMass * 9.8).toFixed(1)}N`, 0, cgTextY);
            ctxSeesaw.restore();
        }

        // Masses on Beam (Vertical Stacking to prevent 2D overlapping!)
        const posStackMap = {};

        stateSeesaw.weights.forEach(w => {
            const pKey = w.pos.toFixed(2);
            if (!posStackMap[pKey]) posStackMap[pKey] = 0;

            const wx = (w.pos - activePivotPos) * scaleM;
            const size = (32 + w.mass * 3.5) * dpr;

            const stackBottomY = -14 * dpr - posStackMap[pKey];
            const wy = stackBottomY - size;

            posStackMap[pKey] += size + 3 * dpr;

            ctxSeesaw.save();
            ctxSeesaw.fillStyle = w.mass >= 10 ? '#f43f5e' : w.mass >= 5 ? '#fb923c' : w.mass >= 2 ? '#34d399' : '#38bdf8';
            ctxSeesaw.strokeStyle = '#ffffff';
            ctxSeesaw.lineWidth = 3 * dpr;
            ctxSeesaw.beginPath();
            ctxSeesaw.roundRect(wx - size / 2, wy, size, size, 8 * dpr);
            ctxSeesaw.fill();
            ctxSeesaw.stroke();

            ctxSeesaw.fillStyle = '#0f172a';
            ctxSeesaw.font = `bold ${14 * dpr}px Inter`;
            ctxSeesaw.textAlign = 'center';
            ctxSeesaw.fillText(`${w.mass}kg`, wx, wy + size / 2 + 5 * dpr);

            ctxSeesaw.save();
            ctxSeesaw.translate(wx, stackBottomY);
            ctxSeesaw.rotate(-stateSeesaw.angleRad);
            ctxSeesaw.strokeStyle = 'rgba(255, 82, 82, 0.85)';
            ctxSeesaw.lineWidth = 3 * dpr;
            ctxSeesaw.beginPath();
            ctxSeesaw.moveTo(0, 0);
            ctxSeesaw.lineTo(0, 45 * dpr);
            ctxSeesaw.stroke();
            ctxSeesaw.restore();

            ctxSeesaw.restore();
        });

        ctxSeesaw.restore();
    }


    // ==========================================================================
    // Main 60FPS Simulation Loop
    // ==========================================================================
    let lastTime = performance.now();

    function animLoop(now) {
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        const activeTab = document.querySelector('.tab-pane.active');
        if (activeTab) {
            const id = activeTab.id;
            if (id === 'tab-vector') renderVectorCanvas();
            else if (id === 'tab-seesaw') {
                updateSeesawPhysics(dt);
                renderSeesawCanvas();
            }
        }

        requestAnimationFrame(animLoop);
    }

    resizeAllCanvases();
    updateVectorUI();
    requestAnimationFrame(animLoop);

});
