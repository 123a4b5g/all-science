/* ==========================================================================
   부력과 아르키메데스 원리 Interactive Physics Engine (script.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Modal Control
    const btnInfo = document.getElementById('btn-info');
    const modalInfo = document.getElementById('modal-info');
    const btnCloseModal = document.getElementById('btn-close-modal');

    if (btnInfo && modalInfo && btnCloseModal) {
        btnInfo.addEventListener('click', () => {
            modalInfo.classList.remove('hidden');
        });
        btnCloseModal.addEventListener('click', () => {
            modalInfo.classList.add('hidden');
        });
        modalInfo.addEventListener('click', (e) => {
            if (e.target === modalInfo) modalInfo.classList.add('hidden');
        });
    }

    // Navigation Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const activePane = document.getElementById(targetTab);
            if (activePane) activePane.classList.add('active');

            // Trigger canvas resize
            window.dispatchEvent(new Event('resize'));
        });
    });

    // ==========================================================================
    // 1. Tab 1 Physics Simulation: Archimedes' Principle & Force Vectors
    // ==========================================================================
    const canvasArch = document.getElementById('canvas-archimedes');
    const ctxArch = canvasArch ? canvasArch.getContext('2d') : null;

    // Simulation Physical Parameters
    const stateArch = {
        objDensity: 0.92, // g/cm³
        objVolume: 500,   // cm³
        fluidDensity: 1.00, // g/cm³
        gravity: 9.80,    // m/s²
        showVectors: true,

        // Object dynamic state (canvas coordinates)
        posY: 180,
        velY: 0,
        isDragging: false,
        dragOffsetY: 0,

        // Liquid Tank bounds (computed on resize)
        tankX: 0,
        tankY: 0,
        tankW: 0,
        tankH: 0,
        fluidLevelY: 0,

        // Particle ripples & bubbles
        ripples: [],
        bubbles: []
    };

    // DOM UI Elements for Tab 1
    const sliderObjDensity = document.getElementById('slider-obj-density');
    const valObjDensity = document.getElementById('val-obj-density');
    const sliderObjVolume = document.getElementById('slider-obj-volume');
    const valObjVolume = document.getElementById('val-obj-volume');

    const sliderFluidDensity = document.getElementById('slider-fluid-density');
    const valFluidDensity = document.getElementById('val-fluid-density');
    const sliderGravity = document.getElementById('slider-gravity');
    const valGravity = document.getElementById('val-gravity');

    const btnToggleVectors = document.getElementById('btn-toggle-vectors');

    // Preset Buttons
    const objPresets = document.querySelectorAll('#object-presets .preset-btn');
    const fluidPresets = document.querySelectorAll('#fluid-presets .preset-btn');

    // Real-time Display Overlay Chips
    const stateBadge = document.getElementById('state-badge');
    const submergedRatioBadge = document.getElementById('submerged-ratio-badge');
    const valFgDisplay = document.getElementById('val-fg-display');
    const valFbDisplay = document.getElementById('val-fb-display');
    const valScaleDisplay = document.getElementById('val-scale-display');
    const valApparentMass = document.getElementById('val-apparent-mass');

    const resMassFg = document.getElementById('res-mass-fg');
    const resDisplacedInfo = document.getElementById('res-displaced-info');
    const resApparentWeight = document.getElementById('res-apparent-weight');

    // Bind Controls
    if (sliderObjDensity) {
        sliderObjDensity.addEventListener('input', (e) => {
            stateArch.objDensity = parseFloat(e.target.value);
            if (valObjDensity) valObjDensity.textContent = stateArch.objDensity.toFixed(2) + ' g/cm³';
            updatePresetActive(objPresets, stateArch.objDensity);
        });
    }

    if (sliderObjVolume) {
        sliderObjVolume.addEventListener('input', (e) => {
            stateArch.objVolume = parseFloat(e.target.value);
            if (valObjVolume) valObjVolume.textContent = Math.round(stateArch.objVolume) + ' cm³';
        });
    }

    if (sliderFluidDensity) {
        sliderFluidDensity.addEventListener('input', (e) => {
            stateArch.fluidDensity = parseFloat(e.target.value);
            if (valFluidDensity) valFluidDensity.textContent = stateArch.fluidDensity.toFixed(2) + ' g/cm³';
            updatePresetActive(fluidPresets, stateArch.fluidDensity);
        });
    }

    if (sliderGravity) {
        sliderGravity.addEventListener('input', (e) => {
            stateArch.gravity = parseFloat(e.target.value);
            if (valGravity) {
                const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
                let planet = isEn ? 'Custom' : '사용자 지정';
                if (Math.abs(stateArch.gravity - 9.8) < 0.2) planet = isEn ? 'Earth' : '지구';
                else if (Math.abs(stateArch.gravity - 1.62) < 0.2) planet = isEn ? 'Moon' : '달';
                else if (Math.abs(stateArch.gravity - 3.71) < 0.2) planet = isEn ? 'Mars' : '화성';
                else if (Math.abs(stateArch.gravity - 24.8) < 0.5) planet = isEn ? 'Jupiter' : '목성';
                else if (stateArch.gravity === 0) planet = isEn ? 'Zero Gravity' : '무중력';
                valGravity.textContent = `${stateArch.gravity.toFixed(2)} m/s² (${planet})`;
            }
        });
    }

    function updatePresetActive(presetList, value) {
        presetList.forEach(btn => {
            const btnVal = parseFloat(btn.getAttribute('data-density'));
            if (Math.abs(btnVal - value) < 0.01) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    objPresets.forEach(btn => {
        btn.addEventListener('click', () => {
            const density = parseFloat(btn.getAttribute('data-density'));
            stateArch.objDensity = density;
            if (sliderObjDensity) sliderObjDensity.value = density;
            if (valObjDensity) valObjDensity.textContent = density.toFixed(2) + ' g/cm³';
            updatePresetActive(objPresets, density);
        });
    });

    fluidPresets.forEach(btn => {
        btn.addEventListener('click', () => {
            const density = parseFloat(btn.getAttribute('data-density'));
            stateArch.fluidDensity = density;
            if (sliderFluidDensity) sliderFluidDensity.value = density;
            if (valFluidDensity) valFluidDensity.textContent = density.toFixed(2) + ' g/cm³';
            updatePresetActive(fluidPresets, density);
        });
    });





    if (btnToggleVectors) {
        btnToggleVectors.addEventListener('click', () => {
            stateArch.showVectors = !stateArch.showVectors;
            btnToggleVectors.classList.toggle('active', stateArch.showVectors);
        });
    }

    // Resize Canvas Handler
    function resizeCanvases() {
        if (canvasArch) {
            const rect = canvasArch.parentElement.getBoundingClientRect();
            canvasArch.width = rect.width;
            canvasArch.height = rect.height;

            stateArch.tankW = Math.min(rect.width * 0.5, 340);
            stateArch.tankH = rect.height * 0.58;
            stateArch.tankX = (rect.width * 0.42) - (stateArch.tankW / 2);
            stateArch.tankY = rect.height - stateArch.tankH - 30;
            stateArch.fluidLevelY = stateArch.tankY + 50; // Fluid surface
        }

        const canvasShip = document.getElementById('canvas-ship');
        if (canvasShip) {
            const r = canvasShip.parentElement.getBoundingClientRect();
            canvasShip.width = r.width;
            canvasShip.height = r.height;
        }

        const canvasBalloon = document.getElementById('canvas-balloon');
        if (canvasBalloon) {
            const r = canvasBalloon.parentElement.getBoundingClientRect();
            canvasBalloon.width = r.width;
            canvasBalloon.height = r.height;
        }

    }

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        if (resizeTimer) cancelAnimationFrame(resizeTimer);
        resizeTimer = requestAnimationFrame(resizeCanvases);
    });
    resizeCanvases();

    // Helper to calculate canvas coordinates from mouse/touch event
    function getCanvasCoords(e, canvas) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    // Helper to get strict beaker Y boundaries (prevents penetrating beaker floor)
    function getTankBounds(objSize) {
        const minY = 60; // Top air boundary
        const maxY = stateArch.tankY + stateArch.tankH - objSize - 6; // Beaker bottom inside line
        return { minY, maxY: Math.max(minY, maxY) };
    }

    if (canvasArch) {
        const startDrag = (e) => {
            const pos = getCanvasCoords(e, canvasArch);
            const objSize = Math.sqrt(stateArch.objVolume) * 2.8;
            const objX = stateArch.tankX + (stateArch.tankW / 2) - (objSize / 2);
            const objY = stateArch.posY;

            if (pos.x >= objX && pos.x <= objX + objSize &&
                pos.y >= objY && pos.y <= objY + objSize) {
                stateArch.isDragging = true;
                stateArch.dragOffsetY = pos.y - stateArch.posY;
                stateArch.velY = 0;
                if (e.cancelable) e.preventDefault();
            }
        };

        const moveDrag = (e) => {
            if (stateArch.isDragging) {
                if (e.cancelable) e.preventDefault();
                const pos = getCanvasCoords(e, canvasArch);
                const objSize = Math.sqrt(stateArch.objVolume) * 2.8;
                const { minY, maxY } = getTankBounds(objSize);
                const targetY = pos.y - stateArch.dragOffsetY;

                // Clamp strictly within beaker
                stateArch.posY = Math.max(minY, Math.min(maxY, targetY));
                stateArch.velY = 0;
            }
        };

        const endDrag = () => {
            if (stateArch.isDragging) {
                stateArch.isDragging = false;
                // Add splash ripple
                stateArch.ripples.push({
                    x: stateArch.tankX + (stateArch.tankW / 2),
                    y: stateArch.fluidLevelY,
                    r: 5,
                    alpha: 1
                });
            }
        };

        canvasArch.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', moveDrag);
        window.addEventListener('mouseup', endDrag);

        canvasArch.addEventListener('touchstart', startDrag, { passive: false });
        window.addEventListener('touchmove', moveDrag, { passive: false });
        window.addEventListener('touchend', endDrag);
    }

    // Main Physics Loop for Tab 1
    function updatePhysicsTab1() {
        if (!ctxArch) return;

        const objSize = Math.sqrt(stateArch.objVolume) * 2.8; // Visual scale
        const { minY, maxY } = getTankBounds(objSize);

        const objTopY = stateArch.posY;
        const objBottomY = stateArch.posY + objSize;
        const fluidSurfaceY = stateArch.fluidLevelY;

        // Calculate Submerged Fraction (0.0 ~ 1.0)
        let submergedFraction = 0;
        if (objBottomY <= fluidSurfaceY) {
            submergedFraction = 0; // Completely in air
        } else if (objTopY >= fluidSurfaceY) {
            submergedFraction = 1; // Fully submerged
        } else {
            submergedFraction = (objBottomY - fluidSurfaceY) / objSize;
        }

        // Real Physics Calculations
        // Mass = density * volume (g)
        const massGram = stateArch.objDensity * stateArch.objVolume;
        const massKg = massGram / 1000;
        const gravityForce = massKg * stateArch.gravity; // Newton (Fg)

        const submergedVolume = stateArch.objVolume * submergedFraction; // cm³
        const displacedMassKg = (stateArch.fluidDensity * submergedVolume) / 1000;
        const buoyantForce = displacedMassKg * stateArch.gravity; // Newton (Fb)

        let netForce = gravityForce - buoyantForce; // Positive downward
        let apparentWeight = Math.max(0, netForce); // Scale tension in N

        // State & Physics updates
        if (!stateArch.isDragging) {
            // Free Motion Physics Mode (Natural Damped Oscillations & Smooth Fluid Drag)
            const waterDamping = submergedFraction > 0 ? 0.91 : 0.98;
            const accelY = (netForce / (massKg || 1)) * 0.12;

            stateArch.velY = (stateArch.velY + accelY) * waterDamping;
            stateArch.posY += stateArch.velY;

            // Tank Floor boundary collision (Prevents penetrating beaker bottom!)
            if (stateArch.posY >= maxY) {
                stateArch.posY = maxY;
                stateArch.velY = -stateArch.velY * 0.2; // Gentle realistic bounce
                if (Math.abs(stateArch.velY) < 0.1) stateArch.velY = 0;
            }

            // Air top boundary collision
            if (stateArch.posY <= minY) {
                stateArch.posY = minY;
                stateArch.velY = 0;
            }
        } else {
            // Enforce strict beaker boundary during drag
            stateArch.posY = Math.max(minY, Math.min(maxY, stateArch.posY));
        }

        // UI Realtime Text Updates
        if (valFgDisplay) valFgDisplay.textContent = gravityForce.toFixed(2);
        if (valFbDisplay) valFbDisplay.textContent = buoyantForce.toFixed(2);

        if (resMassFg) resMassFg.textContent = `${massGram.toFixed(1)} g / ${gravityForce.toFixed(2)} N`;
        if (resDisplacedInfo) resDisplacedInfo.textContent = `${submergedVolume.toFixed(1)} cm³ / ${buoyantForce.toFixed(2)} N`;

        const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
        if (submergedRatioBadge) {
            submergedRatioBadge.textContent = isEn ? `Submerged: ${Math.round(submergedFraction * 100)}%` : `잠긴 부피: ${Math.round(submergedFraction * 100)}%`;
        }

        if (stateBadge) {
            if (stateArch.objDensity < stateArch.fluidDensity) {
                stateBadge.className = 'badge';
                stateBadge.textContent = isEn ? 'Status: Floating' : '상태: 떠오름';
            } else if (Math.abs(stateArch.objDensity - stateArch.fluidDensity) < 0.02) {
                stateBadge.className = 'badge secondary';
                stateBadge.textContent = isEn ? 'Status: Neutral Buoyancy' : '상태: 중성 부력';
            } else {
                stateBadge.className = 'badge danger';
                stateBadge.textContent = isEn ? 'Status: Sinking' : '상태: 가라앉음';
            }
        }

        // Render Canvas
        renderTab1Canvas(submergedFraction, gravityForce, buoyantForce, apparentWeight, objSize);
    }

    function renderTab1Canvas(submergedFraction, Fg, Fb, ScaleForce, objSize) {
        const w = canvasArch.width;
        const h = canvasArch.height;
        ctxArch.clearRect(0, 0, w, h);

        const tx = stateArch.tankX;
        const ty = stateArch.tankY;
        const tw = stateArch.tankW;
        const th = stateArch.tankH;
        const fluidY = stateArch.fluidLevelY;

        // Dynamic Fluid surface height displacement based on submerged volume
        const displacementRise = (submergedFraction * stateArch.objVolume) / 100;
        const currentFluidY = stateArch.fluidLevelY - displacementRise;

        // 2. Draw Main Fluid Tank (Glass Vessel)
        // Fluid Gradient
        let fluidColor = 'rgba(56, 189, 248, 0.35)'; // Water default (1.00)
        if (stateArch.fluidDensity > 12) fluidColor = 'rgba(148, 163, 184, 0.8)'; // Mercury (13.6)
        else if (stateArch.fluidDensity < 0.85) fluidColor = 'rgba(168, 85, 247, 0.3)'; // Ethanol (0.79)
        else if (Math.abs(stateArch.fluidDensity - 0.92) < 0.02) fluidColor = 'rgba(234, 179, 8, 0.35)'; // Oil (0.92)
        else if (Math.abs(stateArch.fluidDensity - 1.03) < 0.02) fluidColor = 'rgba(2, 132, 199, 0.5)'; // Sea Water (1.03)
        else if (Math.abs(stateArch.fluidDensity - 1.24) < 0.02) fluidColor = 'rgba(14, 116, 144, 0.5)'; // Dead Sea (1.24)

        const fluidGrad = ctxArch.createLinearGradient(tx, currentFluidY, tx, ty + th);
        fluidGrad.addColorStop(0, fluidColor);
        fluidGrad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');

        ctxArch.fillStyle = fluidGrad;
        ctxArch.fillRect(tx + 4, currentFluidY, tw - 8, ty + th - currentFluidY - 4);

        // Water Wave Surface Line
        ctxArch.strokeStyle = '#38BDF8';
        ctxArch.lineWidth = 3;
        ctxArch.beginPath();
        const time = Date.now() * 0.003;
        for (let x = tx + 4; x <= tx + tw - 4; x += 5) {
            const waveY = currentFluidY + Math.sin(x * 0.05 + time) * 2;
            if (x === tx + 4) ctxArch.moveTo(x, waveY);
            else ctxArch.lineTo(x, waveY);
        }
        ctxArch.stroke();

        // Overflow Spout & Measuring Beaker
        const spoutX = tx + tw;
        const spoutY = ty + 65;
        ctxArch.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctxArch.beginPath();
        ctxArch.moveTo(spoutX, spoutY);
        ctxArch.lineTo(spoutX + 30, spoutY + 15);
        ctxArch.lineTo(spoutX + 30, spoutY + 22);
        ctxArch.lineTo(spoutX, spoutY + 8);
        ctxArch.closePath();
        ctxArch.fill();

        // Displaced Water Beaker on right
        const beakerX = spoutX + 25;
        const beakerY = ty + th - 100;
        ctxArch.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctxArch.lineWidth = 2;
        ctxArch.strokeRect(beakerX, beakerY, 50, 100);

        // Water level in overflow beaker proportional to displaced volume
        const maxDispHeight = 90;
        const dispFillH = (submergedFraction * stateArch.objVolume / 2000) * maxDispHeight;
        if (dispFillH > 0) {
            ctxArch.fillStyle = fluidColor;
            ctxArch.fillRect(beakerX + 2, beakerY + 100 - dispFillH, 46, dispFillH);

            // Water stream drop animation if submerged > 0
            ctxArch.fillStyle = '#38BDF8';
            ctxArch.fillRect(spoutX + 26, spoutY + 18, 3, beakerY - spoutY - 10);
        }

        // Tank Glass Outline
        ctxArch.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctxArch.lineWidth = 4;
        ctxArch.beginPath();
        ctxArch.moveTo(tx, ty);
        ctxArch.lineTo(tx, ty + th);
        ctxArch.lineTo(tx + tw, ty + th);
        ctxArch.lineTo(tx + tw, ty);
        ctxArch.stroke();

        // 3. Draw Submerged Block Object
        const objX = tx + (tw / 2) - (objSize / 2);
        const objY = stateArch.posY;

        // Block Color by Density Preset
        let objColor = '#F59E0B'; // Ice/Wood default gold
        if (stateArch.objDensity > 15) objColor = '#FACC15'; // Gold
        else if (stateArch.objDensity > 6) objColor = '#94A3B8'; // Iron
        else if (stateArch.objDensity > 2) objColor = '#CBD5E1'; // Aluminum
        else if (stateArch.objDensity < 0.7) objColor = '#D97706'; // Wood

        ctxArch.fillStyle = objColor;
        ctxArch.shadowColor = 'rgba(0,0,0,0.5)';
        ctxArch.shadowBlur = 10;
        ctxArch.fillRect(objX, objY, objSize, objSize);
        ctxArch.shadowBlur = 0;

        ctxArch.strokeStyle = '#FFFFFF';
        ctxArch.lineWidth = 2;
        ctxArch.strokeRect(objX, objY, objSize, objSize);

        // Waterline on object if submerged
        if (submergedFraction > 0 && submergedFraction < 1) {
            ctxArch.strokeStyle = 'rgba(56, 189, 248, 0.8)';
            ctxArch.lineWidth = 2;
            ctxArch.setLineDash([4, 4]);
            ctxArch.beginPath();
            ctxArch.moveTo(objX - 5, currentFluidY);
            ctxArch.lineTo(objX + objSize + 5, currentFluidY);
            ctxArch.stroke();
            ctxArch.setLineDash([]);
        }

        // Object Label text
        ctxArch.fillStyle = '#0F172A';
        ctxArch.font = '700 12px Inter';
        ctxArch.textAlign = 'center';
        ctxArch.fillText(`${stateArch.objDensity.toFixed(2)}g/cm³`, objX + objSize / 2, objY + objSize / 2 + 4);

        // 4. Draw Force Vectors (Gravity vs Buoyancy Arrows)
        if (stateArch.showVectors) {
            const centerX = objX + objSize / 2;
            const centerY = objY + objSize / 2;

            // Scale arrow length
            const arrowScale = 8;
            const gravityArrowLen = Fg * arrowScale;
            const buoyantArrowLen = Fb * arrowScale;

            // Gravity Vector Arrow (Red - Downward)
            if (Fg > 0) {
                drawArrow(ctxArch, centerX, centerY, centerX, centerY + gravityArrowLen, '#EF4444', 4, `Fg = ${Fg.toFixed(2)}N`);
            }

            // Buoyancy Vector Arrow (Green - Upward)
            if (Fb > 0) {
                drawArrow(ctxArch, centerX, centerY, centerX, centerY - buoyantArrowLen, '#10B981', 4, `Fb = ${Fb.toFixed(2)}N`);
            }
        }
    }

    function drawArrow(ctx, fromX, fromY, toX, toY, color, width, label) {
        const headlen = 10;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = width;

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        if (label) {
            ctx.font = '600 11px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText(label, toX + 10, toY + (dy > 0 ? 0 : -5));
        }
    }

    // ==========================================================================
    // 2. Tab 2 Simulation: Ship Cargo & Submarine Ballast Tank
    // ==========================================================================
    const canvasShip = document.getElementById('canvas-ship');
    const ctxShip = canvasShip ? canvasShip.getContext('2d') : null;

    const stateShip = {
        mode: 'ship', // 'ship' or 'sub'
        cargoCount: 2,
        hullVolume: 1500,
        ballastWaterPercent: 50,
        shipY: 200,
        subY: 250
    };

    const btnModeShip = document.getElementById('btn-mode-ship');
    const btnModeSub = document.getElementById('btn-mode-sub');
    const cardShipControls = document.getElementById('card-ship-controls');
    const cardSubControls = document.getElementById('card-sub-controls');

    const sliderCargo = document.getElementById('slider-cargo');
    const valCargoCount = document.getElementById('val-cargo-count');
    const sliderHullVolume = document.getElementById('slider-hull-volume');
    const valHullVolume = document.getElementById('val-hull-volume');

    const sliderBallast = document.getElementById('slider-ballast');
    const valBallastWater = document.getElementById('val-ballast-water');
    const btnSubSurpass = document.getElementById('btn-sub-surpass');
    const btnSubHover = document.getElementById('btn-sub-hover');
    const btnSubDive = document.getElementById('btn-sub-dive');

    const shipStateBadge = document.getElementById('ship-state-badge');
    const shipDraftBadge = document.getElementById('ship-draft-badge');
    const shipTipText = document.getElementById('ship-tip-text');

    if (btnModeShip && btnModeSub) {
        btnModeShip.addEventListener('click', () => {
            const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
            stateShip.mode = 'ship';
            btnModeShip.classList.add('active');
            btnModeSub.classList.remove('active');
            cardShipControls.classList.remove('hidden');
            cardSubControls.classList.add('hidden');
            if (shipTipText) shipTipText.textContent = isEn ? 'Add cargo weight to observe draft line sinking level and ship buoyancy!' : '화물 무게를 추가해 흘수선(만재흘수선) 침강 수준과 선박 부력을 관찰해보세요!';
        });

        btnModeSub.addEventListener('click', () => {
            const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
            stateShip.mode = 'sub';
            btnModeSub.classList.add('active');
            btnModeShip.classList.remove('active');
            cardSubControls.classList.remove('hidden');
            cardShipControls.classList.add('hidden');
            if (shipTipText) shipTipText.textContent = isEn ? 'Adjust the water/air ratio in the ballast tank to achieve neutral buoyancy hovering!' : '잠수함 바수조(Ballast Tank)의 물/공기 주입 비율을 조절하여 호버링(중성 부력)을 맞춰보세요!';
        });
    }

    if (sliderCargo) {
        sliderCargo.addEventListener('input', (e) => {
            const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
            stateShip.cargoCount = parseInt(e.target.value);
            if (valCargoCount) valCargoCount.textContent = isEn ? `${stateShip.cargoCount} pcs (Total ${stateShip.cargoCount * 100}kg)` : `${stateShip.cargoCount} 개 (총 ${stateShip.cargoCount * 100}kg)`;
        });
    }

    if (sliderHullVolume) {
        sliderHullVolume.addEventListener('input', (e) => {
            stateShip.hullVolume = parseInt(e.target.value);
            if (valHullVolume) valHullVolume.textContent = `${stateShip.hullVolume} cm³`;
        });
    }

    if (sliderBallast) {
        sliderBallast.addEventListener('input', (e) => {
            stateShip.ballastWaterPercent = parseInt(e.target.value);
            updateBallastText();
        });
    }

    function updateBallastText() {
        if (valBallastWater) {
            const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
            let status = isEn ? 'Neutral Hovering' : '중성 부력';
            if (stateShip.ballastWaterPercent < 45) status = isEn ? 'Surfacing (Positive)' : '부상 (Positive)';
            else if (stateShip.ballastWaterPercent > 55) status = isEn ? 'Diving (Negative)' : '잠수 (Negative)';
            valBallastWater.textContent = `${stateShip.ballastWaterPercent}% (${status})`;
        }
    }

    if (btnSubSurpass) {
        btnSubSurpass.addEventListener('click', () => {
            stateShip.ballastWaterPercent = 10;
            if (sliderBallast) sliderBallast.value = 10;
            updateBallastText();
        });
    }
    if (btnSubHover) {
        btnSubHover.addEventListener('click', () => {
            stateShip.ballastWaterPercent = 50;
            if (sliderBallast) sliderBallast.value = 50;
            updateBallastText();
        });
    }
    if (btnSubDive) {
        btnSubDive.addEventListener('click', () => {
            stateShip.ballastWaterPercent = 90;
            if (sliderBallast) sliderBallast.value = 90;
            updateBallastText();
        });
    }

    function updatePhysicsTab2() {
        if (!ctxShip) return;

        const w = canvasShip.width;
        const h = canvasShip.height;
        ctxShip.clearRect(0, 0, w, h);

        const waterLevelY = h * 0.4;

        if (stateShip.mode === 'ship') {
            // Ship Physics
            const shipBaseMass = 400; // kg
            const cargoMass = stateShip.cargoCount * 100; // kg
            const totalMass = shipBaseMass + cargoMass; // kg
            
            // Average density = Mass / Hull Volume
            const avgDensity = totalMass / stateShip.hullVolume; // g/cm³ equivalent ratio

            const targetDraftPercent = Math.min(1.2, avgDensity); // Submerged fraction
            const shipHeight = 100;
            const submergedH = shipHeight * targetDraftPercent;

            const targetShipY = waterLevelY - shipHeight + submergedH;
            stateShip.shipY += (targetShipY - stateShip.shipY) * 0.08;

            // Render Water
            ctxShip.fillStyle = 'rgba(56, 189, 248, 0.35)';
            ctxShip.fillRect(0, waterLevelY, w, h - waterLevelY);

            // Render Ship Hull
            const shipX = w / 2 - 120;
            const sy = stateShip.shipY;

            ctxShip.fillStyle = '#475569';
            ctxShip.beginPath();
            ctxShip.moveTo(shipX, sy);
            ctxShip.lineTo(shipX + 240, sy);
            ctxShip.lineTo(shipX + 200, sy + shipHeight);
            ctxShip.lineTo(shipX + 40, sy + shipHeight);
            ctxShip.closePath();
            ctxShip.fill();
            ctxShip.strokeStyle = '#38BDF8';
            ctxShip.lineWidth = 3;
            ctxShip.stroke();

            // Load Line (만재흘수선 / Plimsoll line)
            const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
            const draftLineY = sy + shipHeight * 0.7;
            ctxShip.strokeStyle = '#EF4444';
            ctxShip.lineWidth = 2;
            ctxShip.beginPath();
            ctxShip.moveTo(shipX + 10, draftLineY);
            ctxShip.lineTo(shipX + 230, draftLineY);
            ctxShip.stroke();
            ctxShip.fillStyle = '#EF4444';
            ctxShip.font = '600 11px Inter';
            ctxShip.fillText(isEn ? 'Draft Limit' : '만재흘수선 (Draft Limit)', shipX + 235, draftLineY + 4);

            // Draw Cargo Boxes on Deck
            for (let i = 0; i < stateShip.cargoCount; i++) {
                const boxX = shipX + 30 + (i % 5) * 38;
                const boxY = sy - 25 - Math.floor(i / 5) * 26;
                ctxShip.fillStyle = '#F59E0B';
                ctxShip.fillRect(boxX, boxY, 32, 24);
                ctxShip.strokeStyle = '#FFFFFF';
                ctxShip.strokeRect(boxX, boxY, 32, 24);
            }

            // Badges update
            if (shipStateBadge) {
                if (targetDraftPercent > 1.0) {
                    shipStateBadge.className = 'badge danger';
                    shipStateBadge.textContent = isEn ? 'Ship Sinking Risk! (Overloaded)' : '선박 침몰 위험! (과적)';
                } else {
                    shipStateBadge.className = 'badge';
                    shipStateBadge.textContent = isEn ? `Avg Density: ${avgDensity.toFixed(2)} g/cm³` : `평균 밀도: ${avgDensity.toFixed(2)} g/cm³`;
                }
            }
            if (shipDraftBadge) {
                shipDraftBadge.textContent = isEn ? `Draft Depth: ${Math.round(targetDraftPercent * 100)}%` : `흘수선 깊이: ${Math.round(targetDraftPercent * 100)}%`;
            }

        } else {
            // Submarine Physics
            const targetSubY = waterLevelY + (stateShip.ballastWaterPercent / 100) * (h - waterLevelY - 140) + 20;
            stateShip.subY += (targetSubY - stateShip.subY) * 0.05;

            // Render Water
            ctxShip.fillStyle = 'rgba(2, 132, 199, 0.45)';
            ctxShip.fillRect(0, waterLevelY, w, h - waterLevelY);

            const subX = w / 2 - 140;
            const subY = stateShip.subY;

            // Submarine Hull
            ctxShip.fillStyle = '#334155';
            ctxShip.beginPath();
            ctxShip.roundRect(subX, subY, 280, 80, 40);
            ctxShip.fill();
            ctxShip.strokeStyle = '#06B6D4';
            ctxShip.lineWidth = 3;
            ctxShip.stroke();

            // Periscope Conning Tower
            ctxShip.fillRect(subX + 110, subY - 30, 40, 30);
            ctxShip.strokeRect(subX + 110, subY - 30, 40, 30);

            // Ballast Tanks inside submarine (Left & Right)
            const tankW = 60;
            const tankH = 50;
            const waterH = (stateShip.ballastWaterPercent / 100) * tankH;

            // Left Ballast Tank
            ctxShip.strokeStyle = '#FFFFFF';
            ctxShip.strokeRect(subX + 30, subY + 15, tankW, tankH);
            ctxShip.fillStyle = '#0284C7';
            ctxShip.fillRect(subX + 30, subY + 15 + (tankH - waterH), tankW, waterH);

            // Right Ballast Tank
            ctxShip.strokeRect(subX + 190, subY + 15, tankW, tankH);
            ctxShip.fillRect(subX + 190, subY + 15 + (tankH - waterH), tankW, waterH);

            // Tank Labels
            const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
            ctxShip.fillStyle = '#FFFFFF';
            ctxShip.font = '600 10px Inter';
            ctxShip.textAlign = 'center';
            ctxShip.fillText(isEn ? `Water ${stateShip.ballastWaterPercent}%` : `물 ${stateShip.ballastWaterPercent}%`, subX + 60, subY + 45);
            ctxShip.fillText(isEn ? `Water ${stateShip.ballastWaterPercent}%` : `물 ${stateShip.ballastWaterPercent}%`, subX + 220, subY + 45);

            // Badges update
            if (shipStateBadge) {
                if (stateShip.ballastWaterPercent < 45) {
                    shipStateBadge.className = 'badge';
                    shipStateBadge.textContent = isEn ? 'Status: Surfacing' : '상태: 부상 중';
                } else if (stateShip.ballastWaterPercent > 55) {
                    shipStateBadge.className = 'badge danger';
                    shipStateBadge.textContent = isEn ? 'Status: Diving' : '상태: 잠수 중';
                } else {
                    shipStateBadge.className = 'badge secondary';
                    shipStateBadge.textContent = isEn ? 'Status: Neutral Hovering' : '상태: 중성 부력 유지';
                }
            }
            if (shipDraftBadge) {
                shipDraftBadge.textContent = isEn ? `Depth: ${Math.round(subY - waterLevelY)} m` : `수심: ${Math.round(subY - waterLevelY)} m`;
            }
        }
    }

    // ==========================================================================
    // 3. Tab 3 Simulation: Hot Air Balloon Atmospheric Buoyancy
    // ==========================================================================
    const canvasBalloon = document.getElementById('canvas-balloon');
    const ctxBalloon = canvasBalloon ? canvasBalloon.getContext('2d') : null;

    const stateBalloon = {
        burnerPower: 50,
        loadKg: 250,
        tempC: 65,
        altitudeM: 120,
        posY: 300,
        velY: 0
    };

    const sliderBurner = document.getElementById('slider-burner');
    const valBurnerPower = document.getElementById('val-burner-power');
    const valAirTemp = document.getElementById('val-air-temp');
    const tempFillBar = document.getElementById('temp-fill-bar');
    const sliderBalloonLoad = document.getElementById('slider-balloon-load');
    const valBalloonLoad = document.getElementById('val-balloon-load');

    const balloonStatus = document.getElementById('balloon-status');
    const balloonAltitude = document.getElementById('balloon-altitude');

    const valBalloonFb = document.getElementById('val-balloon-fb');
    const valBalloonFg = document.getElementById('val-balloon-fg');

    if (sliderBurner) {
        sliderBurner.addEventListener('input', (e) => {
            stateBalloon.burnerPower = parseInt(e.target.value);
            if (valBurnerPower) valBurnerPower.textContent = `${stateBalloon.burnerPower} %`;
        });
    }

    if (sliderBalloonLoad) {
        sliderBalloonLoad.addEventListener('input', (e) => {
            stateBalloon.loadKg = parseInt(e.target.value);
            if (valBalloonLoad) valBalloonLoad.textContent = `${stateBalloon.loadKg} kg`;
        });
    }

    // Clouds for sky rendering
    const clouds = [
        { x: 80, alt: 150, scale: 0.8 },
        { x: 300, alt: 350, scale: 1.2 },
        { x: 500, alt: 600, scale: 1.0 },
        { x: 200, alt: 800, scale: 0.9 }
    ];

    function updatePhysicsTab3() {
        if (!ctxBalloon) return;

        // Temperature physics: Target temp = 20°C (ambient) + power * 1.1 (max 130°C)
        const targetTemp = 20 + (stateBalloon.burnerPower * 1.1);
        stateBalloon.tempC += (targetTemp - stateBalloon.tempC) * 0.04;

        if (valAirTemp) valAirTemp.textContent = `${Math.round(stateBalloon.tempC)} °C`;
        if (tempFillBar) tempFillBar.style.width = `${Math.min(100, Math.max(0, (stateBalloon.tempC - 20) / 110 * 100))}%`;

        // Atmospheric density calculation: rho = rho0 * exp(-alt / 8000)
        const rhoOutside = 1.225 * Math.exp(-stateBalloon.altitudeM / 8000); // kg/m³
        const rhoInside = 1.225 * (293 / (273 + stateBalloon.tempC)); // Ideal gas law density

        const balloonVolume = 2800; // m³
        const buoyantForce = Math.max(0, (rhoOutside - rhoInside) * balloonVolume * 9.8); // Newton (Fb)
        const totalMassKg = stateBalloon.loadKg + 320; // Base envelope & basket (320kg) + passengers
        const gravityForce = totalMassKg * 9.8; // Newton (Fg)

        const netForceY = buoyantForce - gravityForce; // Positive upward
        const accelY = (netForceY / totalMassKg) * 0.4;

        stateBalloon.velY = (stateBalloon.velY + accelY) * 0.94; // Air resistance damping
        stateBalloon.altitudeM += stateBalloon.velY;

        // Ground landing collision
        if (stateBalloon.altitudeM <= 0) {
            stateBalloon.altitudeM = 0;
            stateBalloon.velY = 0;
        }

        // Ceiling altitude limit
        if (stateBalloon.altitudeM >= 1000) {
            stateBalloon.altitudeM = 1000;
            stateBalloon.velY = Math.min(0, stateBalloon.velY);
        }

        // UI Realtime Text Updates
        if (valBalloonFb) valBalloonFb.textContent = buoyantForce.toFixed(0);
        if (valBalloonFg) valBalloonFg.textContent = gravityForce.toFixed(0);

        // Render Canvas
        const w = canvasBalloon.width;
        const h = canvasBalloon.height;
        ctxBalloon.clearRect(0, 0, w, h);

        // 1. Sky Gradient based on altitude
        const skyGrad = ctxBalloon.createLinearGradient(0, 0, 0, h);
        if (stateBalloon.altitudeM > 600) {
            skyGrad.addColorStop(0, '#090D16'); // Near space / stratosphere
            skyGrad.addColorStop(1, '#1E293B');
        } else if (stateBalloon.altitudeM > 250) {
            skyGrad.addColorStop(0, '#0F172A');
            skyGrad.addColorStop(1, '#0284C7');
        } else {
            skyGrad.addColorStop(0, '#1E3A8A'); // Atmospheric blue
            skyGrad.addColorStop(1, '#38BDF8');
        }
        ctxBalloon.fillStyle = skyGrad;
        ctxBalloon.fillRect(0, 0, w, h);

        // 2. Calculate Hot Air Balloon & Ground Screen Position
        const bx = w / 2;
        const basketH = 26;
        const balloonRadius = 55;
        const balloonBottomOffset = balloonRadius + 30 + basketH; // 111px from center to bottom of basket
        const groundHeightOnScreen = 50;

        // Landing Y (Balloon center Y when resting directly on ground)
        const landingY = h - groundHeightOnScreen - balloonBottomOffset;
        const physicalFlightY = landingY - (stateBalloon.altitudeM * 1.5);

        let by, groundY;
        if (physicalFlightY >= 120) {
            // Stage 1 (0m ~ 200m): Balloon physically rises & moves UP on screen while ground stays at bottom
            by = physicalFlightY;
            groundY = h - groundHeightOnScreen;
        } else {
            // Stage 2 (High Altitude): Balloon locks at upper sky (Y=120), ground and clouds scroll down
            by = 120;
            groundY = (h - groundHeightOnScreen) + (120 - physicalFlightY);
        }

        // 3. Render Ground Plane at relative groundY
        if (groundY < h + 100) {
            ctxBalloon.fillStyle = '#059669';
            ctxBalloon.fillRect(0, groundY, w, h - groundY + 100);

            // Ground Grass details
            ctxBalloon.fillStyle = '#047857';
            ctxBalloon.fillRect(0, groundY, w, 8);
        }

        // 4. Render Clouds in Sky (Strictly clipped above ground level)
        clouds.forEach(c => {
            // Gentle wind drift
            c.x += 0.25;
            if (c.x > w + 80) c.x = -80;

            // Cloud Y position relative to balloon & altitude
            const cloudY = by - ((c.alt - stateBalloon.altitudeM) * 1.1);

            // Strictly check that cloud is above ground plane (groundY - 35)
            if (cloudY > -60 && cloudY < groundY - 35) {
                ctxBalloon.fillStyle = 'rgba(255, 255, 255, 0.45)';
                ctxBalloon.beginPath();
                ctxBalloon.arc(c.x, cloudY, 24 * c.scale, 0, Math.PI * 2);
                ctxBalloon.arc(c.x + 18 * c.scale, cloudY - 9 * c.scale, 19 * c.scale, 0, Math.PI * 2);
                ctxBalloon.arc(c.x + 36 * c.scale, cloudY, 21 * c.scale, 0, Math.PI * 2);
                ctxBalloon.fill();
            }
        });

        // Flame Animation under burner
        if (stateBalloon.burnerPower > 0) {
            const flameIntensity = stateBalloon.burnerPower / 100;
            ctxBalloon.fillStyle = '#EF4444';
            ctxBalloon.beginPath();
            ctxBalloon.arc(bx, by + 42, 10 + flameIntensity * 12 + Math.random() * 4, 0, Math.PI * 2);
            ctxBalloon.fill();

            ctxBalloon.fillStyle = '#F59E0B';
            ctxBalloon.beginPath();
            ctxBalloon.arc(bx, by + 38, 6 + flameIntensity * 8 + Math.random() * 3, 0, Math.PI * 2);
            ctxBalloon.fill();
        }

        // Balloon Envelope (Dome)
        const envelopeHeatAlpha = Math.min(0.8, (stateBalloon.tempC - 20) / 100);
        const balloonGrad = ctxBalloon.createRadialGradient(bx - 15, by - 15, 10, bx, by, balloonRadius);
        balloonGrad.addColorStop(0, `rgba(245, 158, 11, ${0.4 + envelopeHeatAlpha * 0.6})`);
        balloonGrad.addColorStop(0.6, '#EF4444');
        balloonGrad.addColorStop(1, '#991B1B');

        ctxBalloon.fillStyle = balloonGrad;
        ctxBalloon.beginPath();
        ctxBalloon.arc(bx, by, balloonRadius, 0, Math.PI * 2);
        ctxBalloon.fill();
        ctxBalloon.strokeStyle = '#FFFFFF';
        ctxBalloon.lineWidth = 2.5;
        ctxBalloon.stroke();

        // Envelope Pattern Stripes
        ctxBalloon.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctxBalloon.beginPath();
        ctxBalloon.arc(bx, by, balloonRadius, Math.PI * 0.2, Math.PI * 0.8);
        ctxBalloon.stroke();

        // Ropes connecting envelope to basket
        const basketY = by + balloonRadius + 30;
        ctxBalloon.strokeStyle = '#CBD5E1';
        ctxBalloon.lineWidth = 2;
        ctxBalloon.beginPath();
        ctxBalloon.moveTo(bx - 28, by + balloonRadius - 10);
        ctxBalloon.lineTo(bx - 18, basketY);
        ctxBalloon.moveTo(bx + 28, by + balloonRadius - 10);
        ctxBalloon.lineTo(bx + 18, basketY);
        ctxBalloon.stroke();

        // Passenger Basket
        ctxBalloon.fillStyle = '#78350F';
        ctxBalloon.fillRect(bx - 20, basketY, 40, basketH);
        ctxBalloon.strokeStyle = '#F59E0B';
        ctxBalloon.lineWidth = 2;
        ctxBalloon.strokeRect(bx - 20, basketY, 40, basketH);

        // Passengers representation inside basket
        ctxBalloon.fillStyle = '#F8FAFC';
        ctxBalloon.beginPath();
        ctxBalloon.arc(bx - 8, basketY - 4, 5, 0, Math.PI * 2);
        ctxBalloon.arc(bx + 8, basketY - 4, 5, 0, Math.PI * 2);
        ctxBalloon.fill();

        // 5. Force Vectors (Buoyancy vs Gravity Arrows)
        const arrowScale = 0.04;
        const fbArrowLen = buoyantForce * arrowScale;
        const fgArrowLen = gravityForce * arrowScale;

        // Upward Buoyancy Vector (Green)
        if (buoyantForce > 0) {
            drawArrow(ctxBalloon, bx, by - balloonRadius, bx, by - balloonRadius - fbArrowLen, '#10B981', 4, `Fb = ${Math.round(buoyantForce)}N`);
        }

        // Downward Gravity Vector (Red)
        if (gravityForce > 0) {
            drawArrow(ctxBalloon, bx, basketY + basketH, bx, basketY + basketH + fgArrowLen, '#EF4444', 4, `Fg = ${Math.round(gravityForce)}N`);
        }

        // 6. Altitude Scale Ruler on Right Side
        const rulerX = w - 40;
        ctxBalloon.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctxBalloon.lineWidth = 2;
        ctxBalloon.beginPath();
        ctxBalloon.moveTo(rulerX, 40);
        ctxBalloon.lineTo(rulerX, h - 40);
        ctxBalloon.stroke();

        // Ruler Altitude Marker
        const maxRulerAlt = 1000;
        const pointerY = (h - 40) - (stateBalloon.altitudeM / maxRulerAlt) * (h - 80);
        ctxBalloon.fillStyle = '#38BDF8';
        ctxBalloon.beginPath();
        ctxBalloon.moveTo(rulerX - 10, pointerY);
        ctxBalloon.lineTo(rulerX, pointerY - 6);
        ctxBalloon.lineTo(rulerX, pointerY + 6);
        ctxBalloon.closePath();
        ctxBalloon.fill();

        ctxBalloon.fillStyle = '#FFFFFF';
        ctxBalloon.font = '600 11px JetBrains Mono';
        ctxBalloon.textAlign = 'right';
        ctxBalloon.fillText(`${Math.round(stateBalloon.altitudeM)}m`, rulerX - 14, pointerY + 4);

        // Status update
        const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
        if (balloonStatus) {
            if (stateBalloon.altitudeM === 0) {
                balloonStatus.className = 'badge secondary';
                balloonStatus.textContent = isEn ? 'Status: Landed' : '상태: 지상 착륙';
            } else if (stateBalloon.velY > 0.15) {
                balloonStatus.className = 'badge';
                balloonStatus.textContent = isEn ? 'Status: Ascending' : '상태: 상승 중';
            } else if (stateBalloon.velY < -0.15) {
                balloonStatus.className = 'badge danger';
                balloonStatus.textContent = isEn ? 'Status: Descending' : '상태: 하강 중';
            } else {
                balloonStatus.className = 'badge secondary';
                balloonStatus.textContent = isEn ? 'Status: Hovering' : '상태: 고도 평형 유지';
            }
        }
        if (balloonAltitude) {
            balloonAltitude.textContent = isEn ? `Current Altitude: ${Math.round(stateBalloon.altitudeM)} m` : `현재 고도: ${Math.round(stateBalloon.altitudeM)} m`;
        }
    }

    // Master Animation Loop
    function mainLoop() {
        updatePhysicsTab1();
        updatePhysicsTab2();
        updatePhysicsTab3();
        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);
});
