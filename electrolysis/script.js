// Water Electrolysis Simulation JS Logic
document.addEventListener("DOMContentLoaded", () => {
    // 1. DOM Elements
    const btnBack = document.getElementById("btn-back");
    if (btnBack) {
        btnBack.addEventListener("click", () => {
            window.location.href = "../index.html";
        });
    }

    const canvas = document.getElementById("simCanvas");
    const ctx = canvas.getContext("2d");
    
    const voltageSlider = document.getElementById("voltage-slider");
    const voltageVal = document.getElementById("voltage-val");
    
    const concentrationSlider = document.getElementById("concentration-slider");
    const concentrationVal = document.getElementById("concentration-val");
    
    const btnInfo = document.getElementById("btn-info");
    const infoModal = document.getElementById("info-modal");
    const btnCloseModal = document.getElementById("btn-close-modal");
    
    const btnPlay = document.getElementById("sim-play");
    const btnReset = document.getElementById("sim-reset");
    const btnToggleMicro = document.getElementById("btn-toggle-micro");
    const btnToggleIons = document.getElementById("btn-toggle-ions");
    const btnTogglePanel = document.getElementById("btn-toggle-panel");
    const controlsPanel = document.querySelector(".controls-panel");
    
    const electrolyteLabel = document.getElementById("electrolyte-label");
    const electrolyteGroup = document.getElementById("electrolyte-group");
    const electrolyteBtns = electrolyteGroup.querySelectorAll(".radio-btn");
    
    const labelRatioTitle = document.getElementById("label-ratio-title");
    const labelRightGasTitle = document.getElementById("label-right-gas-title");
    const testRightName = document.getElementById("test-right-name");
    
    const btnTestH2 = document.getElementById("btn-test-h2");
    const btnTestO2 = document.getElementById("btn-test-o2");
    
    const valResistance = document.getElementById("val-resistance");
    const valCurrent = document.getElementById("val-current");
    const valRatio = document.getElementById("val-ratio");
    
    const valH2Vol = document.getElementById("val-h2-vol");
    const valO2Vol = document.getElementById("val-o2-vol");
    
    const barH2 = document.getElementById("bar-h2");
    const barO2 = document.getElementById("bar-o2");
    const cardO2 = document.querySelector(".val-card.card-o2");
    const unitRightGas = document.getElementById("unit-right-gas");
    
    const statusTxt = document.getElementById("status-txt");
    const testOverlay = document.getElementById("test-overlay");
    const testBalloonText = document.getElementById("test-balloon-text");

    // 2. Simulation State Variables
    let state = {
        voltage: 6.0,
        concentration: 5.0,
        distance: 7.0, // Fixed distance
        isPlay: true,
        showMicro: false,
        showIons: true, // Default to true
        microSize: 'small', // 'small' or 'large'
        electrolyte: 'NaOH', // 'NaOH', 'NaCl'
        h2Volume: 0.0,
        o2Volume: 0.0,
        maxVolume: 20.0, // max capacity in mL for hydrogen (oxygen caps at 10.0 mL, 2:1 ratio)
        resistance: 0,
        current: 0,
        diffusionRadius: 20, // starts small, grows with electrolysis
        timeAccumulator: 0,
        
        // Testing states
        testingH2: false,
        testingO2: false,
        testTimer: 0,
        testTargetX: 0,
        testTargetY: 0,
        stickX: 0,
        stickY: 0,
        flameOn: false,
        showTestText: "",
        testTextTimer: 0,
        testTextX: 0,
        testTextY: 0,
    };

    let width = 800;  // Logical canvas width
    let height = 600; // Logical canvas height

    function getBeakerDimensions() {
        const isMobile = width <= 600;
        const s = isMobile ? Math.min(width / 420, height / 370) : 1.0;
        
        const beakerX = isMobile ? width / 2 : width / 2.6;
        const beakerY = isMobile ? height * 0.28 : height * 0.45;
        const beakerW = 280 * s;
        const beakerH = 260 * s;
        const waterH = 200 * s;
        const leftElectrodeX = beakerX - state.distance * 14 * s;
        const rightElectrodeX = beakerX + state.distance * 14 * s;
        const electrodeTopY = beakerY + beakerH - 120 * s;
        const tubeY = beakerY + beakerH - 240 * s;
        const tubeH = 220 * s;
        return { beakerX, beakerY, beakerW, beakerH, waterH, leftElectrodeX, rightElectrodeX, electrodeTopY, tubeY, tubeH };
    }

    function getMagnifierCenter(mvR) {
        const isMobile = width <= 600;
        if (isMobile) {
            return {
                mvX: width / 2,
                mvY: height / 2
            };
        } else {
            return {
                mvX: width - mvR - 60,
                mvY: height - mvR - 60
            };
        }
    }

    // Synthesized Audio Controller using Web Audio API
    let audioCtx = null;
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playPopSound() {
        try {
            initAudio();
            if (!audioCtx) return;
            
            // Pop sound: Low pass sweep + noise decay
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(350, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.15);
            
            gain.gain.setValueAtTime(0.6, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
        } catch (e) {
            console.log("Audio play failed:", e);
        }
    }

    function playWhooshSound() {
        try {
            initAudio();
            if (!audioCtx) return;
            
            // Whoosh/ignition sound: filtered white noise or sine pitch sweep
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = "triangle";
            osc.frequency.setValueAtTime(80, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 0.4);
            
            gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.6);
        } catch (e) {
            console.log("Audio play failed:", e);
        }
    }

    // 3. Entity Classes
    
    // Gas Bubbles
    class Bubble {
        constructor(x, y, radius, isH2) {
            this.x = x + (Math.random() - 0.5) * 8;
            this.y = y;
            this.radius = radius + Math.random() * 0.8;
            this.isH2 = isH2;
            this.speed = 1.0 + Math.random() * 1.5;
            this.wiggleSpeed = 0.05 + Math.random() * 0.05;
            this.wiggleWidth = 1.5 + Math.random() * 1.5;
            this.angle = Math.random() * Math.PI * 2;
            this.opacity = 0.5 + Math.random() * 0.4;
        }

        update() {
            this.y -= this.speed;
            this.angle += this.wiggleSpeed;
            this.x += Math.sin(this.angle) * 0.15;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            if (this.isH2) {
                // H2 bubbles: cyan/blue glow
                ctx.fillStyle = "rgba(147, 197, 253, 0.4)";
                ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
            } else if (state.electrolyte === 'NaCl') {
                // Cl2 bubbles: yellowish-green glow
                ctx.fillStyle = "rgba(217, 249, 157, 0.4)";
                ctx.strokeStyle = "rgba(163, 230, 53, 0.8)";
            } else {
                // O2 bubbles: red/orange glow
                ctx.fillStyle = "rgba(252, 165, 165, 0.4)";
                ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
            }
            ctx.lineWidth = 1;
            ctx.fill();
            ctx.stroke();
            
            // Highlight spot inside bubble
            ctx.beginPath();
            ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            
            ctx.restore();
        }
    }

    // Flame Test Particles
    class Spark {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.radius = 2 + Math.random() * 3;
            this.color = color;
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - 1.5; // slight upward drift
            this.gravity = 0.08;
            this.life = 1.0;
            this.decay = 0.015 + Math.random() * 0.02;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.life -= this.decay;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.life;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.restore();
        }
    }

    // Floating Ions in beaker (Na+, OH-, H+, SO42-)
    class Ion {
        constructor(isPositive) {
            this.isPositive = isPositive; // positive ion drifts to cathode (-), negative ion to anode (+)
            this.reset();
        }

        reset() {
            const dims = getBeakerDimensions();
            // Constrain inside beaker width (water region)
            this.x = dims.beakerX - dims.beakerW / 2 + 15 + Math.random() * (dims.beakerW - 30);
            // Constrain inside water height
            this.y = dims.beakerY + dims.beakerH - dims.waterH + 10 + Math.random() * (dims.waterH - 20);
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            
            // Dynamic label and color depending on electrolyte selection
            if (state.electrolyte === 'NaOH') {
                this.label = this.isPositive ? "Na+" : "OH-";
                this.color = this.isPositive ? "#60a5fa" : "#f472b6";
            } else { // NaCl
                this.label = this.isPositive ? "Na+" : "Cl-";
                this.color = this.isPositive ? "#60a5fa" : "#84cc16";
            }
        }

        update(current, leftElectrodeX, rightElectrodeX) {
            // Drift velocity based on current and electrode polarity
            if (current > 0) {
                const driftStrength = 0.005 * current;
                if (this.isPositive) {
                    // Positive ions drift to cathode (-) on the left
                    const dx = leftElectrodeX - this.x;
                    this.speedX += Math.sign(dx) * driftStrength * 0.02;
                } else {
                    // Negative ions drift to anode (+) on the right
                    const dx = rightElectrodeX - this.x;
                    this.speedX += Math.sign(dx) * driftStrength * 0.02;
                }
            }

            // Cap speeds
            this.speedX = Math.max(-1.0, Math.min(1.0, this.speedX));
            this.speedY = Math.max(-0.5, Math.min(0.5, this.speedY));

            this.x += this.speedX;
            this.y += this.speedY;

            // Constrain strictly within beaker water bounds
            const dims = getBeakerDimensions();
            const beakerLeft = dims.beakerX - dims.beakerW / 2 + 15;
            const beakerRight = dims.beakerX + dims.beakerW / 2 - 15;
            const beakerTop = dims.beakerY + dims.beakerH - dims.waterH + 10;
            const beakerBottom = dims.beakerY + dims.beakerH - 10;

            if (this.x < beakerLeft || this.x > beakerRight || this.y < beakerTop || this.y > beakerBottom) {
                this.reset();
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.font = "bold 9px 'Outfit', sans-serif";
            ctx.fillStyle = this.color;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowBlur = 4;
            ctx.shadowColor = this.color;
            ctx.fillText(this.label, this.x, this.y);
            ctx.restore();
        }
    }

    // Microscopic view molecules (for magnifying glass)
    class MicroParticle {
        constructor(type, x, y) {
            this.type = type; // 'H2O', 'H2', 'O2', 'OH-', 'H+'
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.angle = Math.random() * Math.PI * 2;
            this.spin = (Math.random() - 0.5) * 0.03;
        }

        update(centerX, centerY, radius, side) {
            this.x += this.vx;
            this.y += this.vy;
            this.angle += this.spin;

            // Keep within magnifying circle bounds
            const dx = this.x - centerX;
            const dy = this.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Boundary collision
            if (dist > radius - 15) {
                const nx = dx / dist;
                const ny = dy / dist;
                this.x = centerX + nx * (radius - 16);
                this.y = centerY + ny * (radius - 16);
                
                // Reflect velocity
                const dot = this.vx * nx + this.vy * ny;
                this.vx = (this.vx - 2 * dot * nx) * 0.8;
                this.vy = (this.vy - 2 * dot * ny) * 0.8;
            }

            // Side constraint: left cathode view is left half, right anode view is right half
            if (side === 'left') {
                // Cathode: x must stay in [centerX - radius, centerX]
                if (this.x > centerX - 8) {
                    this.vx = -Math.abs(this.vx);
                    this.x = centerX - 9;
                }
            } else {
                // Anode: x must stay in [centerX, centerX + radius]
                if (this.x < centerX + 8) {
                    this.vx = Math.abs(this.vx);
                    this.x = centerX + 9;
                }
            }

            // H2, O2, Cl2 rise up
            if (this.type === 'H2' || this.type === 'O2' || this.type === 'Cl2') {
                this.vy -= 0.03;
                this.vy = Math.max(-1.5, this.vy);
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            if (this.type === 'H2O') {
                // Bent H2O molecule: 1 Red Oxygen, 2 White Hydrogens
                ctx.beginPath();
                ctx.arc(0, 0, 5, 0, Math.PI * 2);
                ctx.fillStyle = "#ef4444"; // Oxygen (Red)
                ctx.fill();

                // Hydrogen 1
                ctx.beginPath();
                ctx.arc(5, 4, 3, 0, Math.PI * 2);
                ctx.fillStyle = "#ffffff"; // Hydrogen (White)
                ctx.fill();

                // Hydrogen 2
                ctx.beginPath();
                ctx.arc(-5, 4, 3, 0, Math.PI * 2);
                ctx.fillStyle = "#ffffff";
                ctx.fill();
            } else if (this.type === 'H2') {
                // H2 molecule: 2 White Hydrogens bound
                ctx.beginPath();
                ctx.arc(-3, 0, 4, 0, Math.PI * 2);
                ctx.arc(3, 0, 4, 0, Math.PI * 2);
                ctx.fillStyle = "#93c5fd";
                ctx.fill();
                ctx.strokeStyle = "#3b82f6";
                ctx.lineWidth = 1;
                ctx.stroke();
            } else if (this.type === 'O2') {
                // O2 molecule: 2 Red Oxygens bound
                ctx.beginPath();
                ctx.arc(-4, 0, 5.5, 0, Math.PI * 2);
                ctx.arc(4, 0, 5.5, 0, Math.PI * 2);
                ctx.fillStyle = "#fca5a5";
                ctx.fill();
                ctx.strokeStyle = "#ef4444";
                ctx.lineWidth = 1;
                ctx.stroke();
            } else if (this.type === 'Cl2') {
                // Cl2 molecule: 2 Green circles bound
                ctx.beginPath();
                ctx.arc(-4, 0, 5, 0, Math.PI * 2);
                ctx.arc(4, 0, 5, 0, Math.PI * 2);
                ctx.fillStyle = "#bef264"; // Light green
                ctx.fill();
                ctx.strokeStyle = "#84cc16";
                ctx.lineWidth = 1;
                ctx.stroke();
            } else if (this.type === 'OH-') {
                // OH- ion: Oxygen + Hydrogen
                ctx.beginPath();
                ctx.arc(-2, 0, 5, 0, Math.PI * 2);
                ctx.fillStyle = "#f472b6";
                ctx.fill();
                ctx.beginPath();
                ctx.arc(4, 0, 3, 0, Math.PI * 2);
                ctx.fillStyle = "#ffffff";
                ctx.fill();
                
                // minus sign
                ctx.fillStyle = "#000000";
                ctx.font = "bold 6px sans-serif";
                ctx.fillText("-", -3, 2);
            } else if (this.type === 'H+') {
                // H+ ion: 1 Hydrogen
                ctx.beginPath();
                ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
                ctx.fillStyle = "#60a5fa";
                ctx.fill();
                
                // plus sign
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 6px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("+", 0, 0);
            } else if (this.type === 'Cl-') {
                // Cl- ion: 1 Green circle with minus sign
                ctx.beginPath();
                ctx.arc(0, 0, 5, 0, Math.PI * 2);
                ctx.fillStyle = "#84cc16"; // Green
                ctx.fill();
                
                // minus sign
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 7px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("-", 0, 0);
            }

            ctx.restore();
        }
    }

    // Arrays of entities
    let bubbles = [];
    let sparks = [];
    let ions = [];
    let microParticles = [];

    function initIons() {
        ions = [];
        for (let i = 0; i < 15; i++) {
            ions.push(new Ion(true));  // Na+
            ions.push(new Ion(false)); // OH-
        }
    }

    function initMicroParticles(centerX, centerY, radius) {
        microParticles = [];
        // Left cathode side particles (reduction of H2O)
        for (let i = 0; i < 12; i++) {
            microParticles.push(new MicroParticle('H2O', centerX - radius * 0.5 + (Math.random() - 0.5) * radius * 0.33, centerY + (Math.random() - 0.5) * radius * 0.67));
        }
        // Right anode side particles (oxidation of Cl- for NaCl, H2O for NaOH)
        const rightType = state.electrolyte === 'NaCl' ? 'Cl-' : 'H2O';
        for (let i = 0; i < 12; i++) {
            microParticles.push(new MicroParticle(rightType, centerX + radius * 0.5 + (Math.random() - 0.5) * radius * 0.33, centerY + (Math.random() - 0.5) * radius * 0.67));
        }
    }

    // 4. Calculations: Physics & Chemistry Formulae
    function calculatePhysics() {
        const V = state.voltage;
        const conc = state.concentration;
        const dist = state.distance;

        // 1. Calculate Resistance
        if (conc === 0) {
            state.resistance = 100000; // Extremely high resistance
            state.current = 0.0;
        } else {
            // Resistance is proportional to distance and inversely proportional to concentration
            // Adding a base internal resistance (electrode contact & wires) of 8 Ohms
            // Different electrolytes have different conductivities (NaOH >= NaCl)
            let condFactor = 1.0;
            if (state.electrolyte === 'NaCl') condFactor = 0.9;

            state.resistance = Math.round(8 + (dist * 22) / (conc * condFactor));
            
            // 2. Calculate Current (I = V / R)
            // convert to mA
            state.current = Number(((V / state.resistance) * 1000).toFixed(1));
        }

        // Update stats card UI
        valResistance.textContent = conc === 0 ? "∞" : state.resistance;
        valCurrent.textContent = state.current.toFixed(1);
    }

    function updateVolumes() {
        if (!state.isPlay) return;
        if (state.current <= 0) return;

        const is1to1 = state.electrolyte === 'NaCl';

        // Capping volume filling
        if (state.h2Volume >= state.maxVolume) {
            state.h2Volume = state.maxVolume;
            state.o2Volume = is1to1 ? state.maxVolume : state.maxVolume / 2.0;
            statusTxt.textContent = "수집 완료 (실험 가능)";
            statusTxt.style.color = "#00f2fe";
            return;
        }

        // Current determines rate of gas/solute generation
        const rateFactor = 0.00015; 
        const deltaH2 = state.current * rateFactor;
        const deltaO2 = is1to1 ? deltaH2 : deltaH2 / 2.0; // 1:1 for NaCl, 2:1 for others

        state.h2Volume += deltaH2;
        state.o2Volume += deltaO2;

        // Limit
        if (state.h2Volume > state.maxVolume) {
            state.h2Volume = state.maxVolume;
            state.o2Volume = is1to1 ? state.maxVolume : state.maxVolume / 2.0;
        }

        // Diffuse pH indicator radius over time based on reaction activity
        state.diffusionRadius = Math.min(180, state.diffusionRadius + state.current * 0.003);

        // Update Volumes UI
        valH2Vol.textContent = state.h2Volume.toFixed(2);
        valO2Vol.textContent = state.o2Volume.toFixed(2);
        
        // Progress Bars
        barH2.style.width = `${(state.h2Volume / state.maxVolume) * 100}%`;
        const maxRightVol = is1to1 ? state.maxVolume : state.maxVolume / 2.0;
        barO2.style.width = `${(state.o2Volume / maxRightVol) * 100}%`;

        // Ratio Display
        if (state.o2Volume > 0) {
            const ratio = (state.h2Volume / state.o2Volume).toFixed(2);
            valRatio.textContent = `${ratio} : 1.00`;
        } else {
            valRatio.textContent = is1to1 ? "1.00 : 1.00" : "2.00 : 1.00";
        }

        statusTxt.textContent = "전기분해 반응 중...";
        statusTxt.style.color = "#f472b6";
    }

    // 5. Canvas Drawing & Rendering

    function drawBeaker(w, h, beakerX, beakerY, beakerW, beakerH, waterH) {
        const isMobile = width <= 600;
        const s = isMobile ? Math.min(width / 420, height / 370) : 1.0;

        // Draw beaker shadow and glow
        ctx.save();
        ctx.shadowColor = "rgba(0, 242, 254, 0.1)";
        ctx.shadowBlur = 20 * s;

        // Beaker outer outline
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 4.5 * s;
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(beakerX - beakerW / 2, beakerY);
        ctx.lineTo(beakerX - beakerW / 2, beakerY + beakerH - 12 * s);
        
        // Rounded bottom corners
        ctx.quadraticCurveTo(beakerX - beakerW / 2, beakerY + beakerH, beakerX - beakerW / 2 + 12 * s, beakerY + beakerH);
        ctx.lineTo(beakerX + beakerW / 2 - 12 * s, beakerY + beakerH);
        ctx.quadraticCurveTo(beakerX + beakerW / 2, beakerY + beakerH, beakerX + beakerW / 2, beakerY + beakerH - 12 * s);
        ctx.lineTo(beakerX + beakerW / 2, beakerY);
        ctx.stroke();

        // Lip outline (top curve)
        ctx.lineWidth = 3.5 * s;
        ctx.beginPath();
        ctx.ellipse(beakerX, beakerY, beakerW / 2 + 5 * s, 6 * s, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Fill Beaker Solution (Water)
        ctx.save();
        // Set clipping path inside beaker
        ctx.beginPath();
        ctx.moveTo(beakerX - beakerW / 2 + 2 * s, beakerY + 6 * s);
        ctx.lineTo(beakerX - beakerW / 2 + 2 * s, beakerY + beakerH - 10 * s);
        ctx.quadraticCurveTo(beakerX - beakerW / 2 + 2 * s, beakerY + beakerH - 2 * s, beakerX - beakerW / 2 + 12 * s, beakerY + beakerH - 2 * s);
        ctx.lineTo(beakerX + beakerW / 2 - 12 * s, beakerY + beakerH - 2 * s);
        ctx.quadraticCurveTo(beakerX + beakerW / 2 - 2 * s, beakerY + beakerH - 2 * s, beakerX + beakerW / 2 - 2 * s, beakerY + beakerH - 10 * s);
        ctx.lineTo(beakerX + beakerW / 2 - 2 * s, beakerY + 6 * s);
        ctx.clip();

        // Simple clean water color
        ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
        ctx.fillRect(beakerX - beakerW / 2, beakerY + beakerH - waterH, beakerW, waterH);

        // Draw Water ripples/surface
        ctx.beginPath();
        ctx.ellipse(beakerX, beakerY + beakerH - waterH, beakerW / 2 - 2 * s, 5 * s, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.fill();

        ctx.restore();
    }

    function drawElectrodesAndTubes(beakerX, beakerY, beakerW, beakerH, waterH) {
        const isMobile = width <= 600;
        const s = isMobile ? Math.min(width / 420, height / 370) : 1.0;

        const leftElectrodeX = beakerX - state.distance * 14 * s;
        const rightElectrodeX = beakerX + state.distance * 14 * s;
        
        const tubeW = 40 * s;
        const tubeH = 220 * s;
        const tubeY = beakerY + beakerH - 240 * s; // floating inverted

        // 1. Draw Wires entering beaker bottom and electrodes
        // (-) Cathode: Blue/Cyan Wire and Electrode (Left)
        ctx.save();
        ctx.lineWidth = 4 * s;
        ctx.strokeStyle = "#3b82f6";
        ctx.shadowColor = "rgba(59, 130, 246, 0.5)";
        ctx.shadowBlur = 10 * s;
        ctx.beginPath();
        ctx.moveTo(leftElectrodeX, beakerY + beakerH + 30 * s);
        ctx.lineTo(leftElectrodeX, beakerY + beakerH - 40 * s);
        ctx.stroke();
        ctx.restore();

        // (+) Anode: Red Wire and Electrode (Right)
        ctx.save();
        ctx.lineWidth = 4 * s;
        ctx.strokeStyle = "#ef4444";
        ctx.shadowColor = "rgba(239, 68, 68, 0.5)";
        ctx.shadowBlur = 10 * s;
        ctx.beginPath();
        ctx.moveTo(rightElectrodeX, beakerY + beakerH + 30 * s);
        ctx.lineTo(rightElectrodeX, beakerY + beakerH - 40 * s);
        ctx.stroke();
        ctx.restore();

        // Electrodes inside the beaker (Rods: black carbon/platinum rods)
        ctx.save();
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 1.5 * s;
        // Left Electrode Rod
        ctx.fillRect(leftElectrodeX - 5 * s, beakerY + beakerH - 120 * s, 10 * s, 90 * s);
        ctx.strokeRect(leftElectrodeX - 5 * s, beakerY + beakerH - 120 * s, 10 * s, 90 * s);
        
        // Right Electrode Rod
        ctx.fillRect(rightElectrodeX - 5 * s, beakerY + beakerH - 120 * s, 10 * s, 90 * s);
        ctx.strokeRect(rightElectrodeX - 5 * s, beakerY + beakerH - 120 * s, 10 * s, 90 * s);
        ctx.restore();

        // 2. Draw Inverted Test Tubes & Gas Levels
        
        // Left Test Tube: H2 collection
        drawInvertedTube(leftElectrodeX, tubeY, tubeW, tubeH, state.h2Volume, state.maxVolume, true);
        
        // Right Test Tube: O2 collection
        // Note: For oxygen, maxVolume/2.0 is 10.0 mL, which fills the tube halfway
        // But the scale shows 0-20mL capacity. Oxygen should fill up to 10mL when Hydrogen is at 20mL.
        drawInvertedTube(rightElectrodeX, tubeY, tubeW, tubeH, state.o2Volume, state.maxVolume, false);
    }

    function drawInvertedTube(x, y, w, h, gasVolume, maxCapacity, isH2) {
        ctx.save();
        
        const isMobile = width <= 600;
        const s = isMobile ? Math.min(width / 420, height / 370) : 1.0;

        // Calculated water height inside the test tube
        // Gas fills the top. When gas volume is 0, tube is full of water.
        // When gas volume = maxCapacity, tube is full of gas, water level is at bottom.
        const gasFraction = gasVolume / maxCapacity;
        const waterHeightInTube = h * (1.0 - gasFraction);

        // 1. Draw collected Gas area (top of tube)
        if (waterHeightInTube < h) {
            ctx.beginPath();
            ctx.moveTo(x - w / 2, y + h - waterHeightInTube);
            ctx.lineTo(x - w / 2, y + w / 2); // curve start
            // Top dome of inverted tube
            ctx.quadraticCurveTo(x - w / 2, y, x, y);
            ctx.quadraticCurveTo(x + w / 2, y, x + w / 2, y + w / 2);
            ctx.lineTo(x + w / 2, y + h - waterHeightInTube);
            ctx.closePath();
            
            // Draw a rich gradient representing the collected gas (strong at top, slightly fading at water boundary)
            const gasGrad = ctx.createLinearGradient(x, y, x, y + h - waterHeightInTube);
            if (isH2) {
                gasGrad.addColorStop(0, "rgba(59, 130, 246, 0.5)"); // Glowing H2 gas
                gasGrad.addColorStop(0.6, "rgba(96, 165, 250, 0.35)");
                gasGrad.addColorStop(1, "rgba(147, 197, 253, 0.15)");
            } else if (state.electrolyte === 'NaCl') {
                gasGrad.addColorStop(0, "rgba(163, 230, 53, 0.6)"); // Yellow-green Cl2 gas
                gasGrad.addColorStop(0.6, "rgba(190, 242, 100, 0.4)");
                gasGrad.addColorStop(1, "rgba(217, 249, 157, 0.15)");
            } else {
                gasGrad.addColorStop(0, "rgba(239, 68, 68, 0.5)"); // Glowing O2 gas
                gasGrad.addColorStop(0.6, "rgba(248, 113, 113, 0.35)");
                gasGrad.addColorStop(1, "rgba(252, 165, 165, 0.15)");
            }
            ctx.fillStyle = gasGrad;
            ctx.fill();
        }

        // 2. Draw Water inside the tube (bottom portion of tube)
        if (waterHeightInTube > 0) {
            ctx.beginPath();
            ctx.moveTo(x - w / 2 + 1.5 * s, y + h);
            ctx.lineTo(x - w / 2 + 1.5 * s, y + h - waterHeightInTube);
            ctx.lineTo(x + w / 2 - 1.5 * s, y + h - waterHeightInTube);
            ctx.lineTo(x + w / 2 - 1.5 * s, y + h);
            ctx.closePath();
            ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
            ctx.fill();
        }

        // 3. Draw Water surface curve inside the tube
        if (waterHeightInTube > 0 && waterHeightInTube < h) {
            ctx.beginPath();
            ctx.ellipse(x, y + h - waterHeightInTube, w / 2 - 1.5 * s, 4 * s, 0, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
            ctx.fill();
        }

        // 4. Glass Tube outline
        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        ctx.lineWidth = 3 * s;
        ctx.beginPath();
        ctx.moveTo(x - w / 2, y + h);
        ctx.lineTo(x - w / 2, y + w / 2);
        ctx.quadraticCurveTo(x - w / 2, y, x, y);
        ctx.quadraticCurveTo(x + w / 2, y, x + w / 2, y + w / 2);
        ctx.lineTo(x + w / 2, y + h);
        ctx.stroke();

        // Lip border at bottom of inverted test tube
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 2.5 * s;
        ctx.beginPath();
        ctx.ellipse(x, y + h, w / 2 + 2 * s, 3 * s, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 5. Draw Graduation scale (눈금)
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.font = `${7 * s}px monospace`;
        ctx.textAlign = isH2 ? "right" : "left";
        ctx.textBaseline = "middle";
        
        const tickStep = 2.0; // every 2 mL
        for (let vol = 0; vol <= maxCapacity; vol += tickStep) {
            const frac = vol / maxCapacity;
            const tickY = y + 24 * s + (h - 32 * s) * frac;
            
            ctx.beginPath();
            if (isH2) {
                ctx.moveTo(x - w / 2, tickY);
                ctx.lineTo(x - w / 2 + 5 * s, tickY);
                if (vol % 4 === 0) {
                    ctx.fillText(vol, x - w / 2 - 4 * s, tickY);
                    ctx.lineTo(x - w / 2 + 8 * s, tickY);
                }
            } else {
                ctx.moveTo(x + w / 2, tickY);
                ctx.lineTo(x + w / 2 - 5 * s, tickY);
                if (vol % 4 === 0) {
                    ctx.fillText(vol, x + w / 2 + 4 * s, tickY);
                    ctx.lineTo(x + w / 2 - 8 * s, tickY);
                }
            }
            ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            ctx.lineWidth = 1 * s;
            ctx.stroke();
        }

        // Label on top of tube
        ctx.fillStyle = isH2 ? "#93c5fd" : (state.electrolyte === 'NaCl' ? "#bef264" : "#fca5a5");
        ctx.font = `bold ${Math.round(9 * s)}px 'Outfit', sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(isH2 ? "H₂ (수소)" : (state.electrolyte === 'NaCl' ? "Cl₂ (염소)" : "O₂ (산소)"), x, y - 10 * s);

        ctx.restore();
    }

    function drawCircuitAndElectronics(beakerX, beakerY, beakerW, beakerH) {
        const isMobile = width <= 600;
        const s = isMobile ? Math.min(width / 420, height / 370) : 1.0;

        // Battery/Power Source Box
        const pboxX = beakerX - 10 * s;
        const pboxY = beakerY - 110 * s;
        const pboxW = 120 * s;
        const pboxH = 65 * s;

        // Draw Power Supply Box
        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 2.5 * s;
        ctx.shadowBlur = 15 * s;
        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.beginPath();
        ctx.roundRect(pboxX - pboxW / 2, pboxY, pboxW, pboxH, 12 * s);
        ctx.fill();
        ctx.stroke();

        // Screen Glow depending on status
        ctx.beginPath();
        ctx.roundRect(pboxX - pboxW / 2 + 10 * s, pboxY + 10 * s, pboxW - 20 * s, 25 * s, 6 * s);
        ctx.fillStyle = "rgba(10, 15, 30, 0.95)";
        ctx.fill();
        ctx.strokeStyle = state.current > 0 ? "rgba(0, 242, 254, 0.3)" : "rgba(255, 255, 255, 0.05)";
        ctx.stroke();

        // Screen text
        ctx.fillStyle = state.current > 0 ? "#00f2fe" : "#64748b";
        ctx.font = `bold ${Math.round(11 * s)}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`DC Power: ${state.voltage.toFixed(1)}V`, pboxX, pboxY + 22.5 * s);

        // Terminals
        const termLeftX = pboxX - pboxW / 3;
        const termRightX = pboxX + pboxW / 3;
        const termY = pboxY + pboxH;

        // Left (-) Terminal
        ctx.beginPath();
        ctx.arc(termLeftX, termY, 6 * s, 0, Math.PI * 2);
        ctx.fillStyle = "#3b82f6";
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.round(8 * s)}px monospace`;
        ctx.fillText("-", termLeftX, termY);

        // Right (+) Terminal
        ctx.beginPath();
        ctx.arc(termRightX, termY, 6 * s, 0, Math.PI * 2);
        ctx.fillStyle = "#ef4444";
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.round(8 * s)}px monospace`;
        ctx.fillText("+", termRightX, termY);

        // 2. Draw connections (Wires) from Power supply down and around the beaker
        const leftElectrodeX = beakerX - state.distance * 14 * s;
        const rightElectrodeX = beakerX + state.distance * 14 * s;
        const wireEndY = beakerY + beakerH + 30 * s;

        ctx.lineWidth = 3 * s;
        
        // (-) Cathode Wire (Blue)
        ctx.strokeStyle = "#3b82f6";
        ctx.beginPath();
        ctx.moveTo(termLeftX, termY);
        // routing wire around
        ctx.lineTo(termLeftX, beakerY + beakerH + 50 * s);
        ctx.lineTo(leftElectrodeX, beakerY + beakerH + 50 * s);
        ctx.lineTo(leftElectrodeX, wireEndY);
        ctx.stroke();

        // (+) Anode Wire (Red)
        ctx.strokeStyle = "#ef4444";
        ctx.beginPath();
        ctx.moveTo(termRightX, termY);
        ctx.lineTo(termRightX, beakerY + beakerH + 60 * s);
        ctx.lineTo(rightElectrodeX, beakerY + beakerH + 60 * s);
        ctx.lineTo(rightElectrodeX, wireEndY);
        ctx.stroke();

        // 3. Electron Flow Dots Animation (e-)
        // Electrons travel from Battery (-) terminal -> left electrode
        // And from right electrode -> Battery (+) terminal
        if (state.isPlay && state.current > 0) {
            state.timeAccumulator += 0.05 + (state.current * 0.0005);
            const electronSpeed = 15; // px per tick
            
            ctx.save();
            ctx.fillStyle = "#eab308"; // Glowing yellow electrons
            ctx.shadowBlur = 8 * s;
            ctx.shadowColor = "#eab308";

            // Cathode wire electron positions (battery -> cathode)
            const path1 = [
                {x: termLeftX, y: termY},
                {x: termLeftX, y: beakerY + beakerH + 50 * s},
                {x: leftElectrodeX, y: beakerY + beakerH + 50 * s},
                {x: leftElectrodeX, y: beakerY + beakerH - 40 * s}
            ];
            animateDotsOnPath(path1, state.timeAccumulator, true);

            // Anode wire electron positions (anode -> battery)
            const path2 = [
                {x: rightElectrodeX, y: beakerY + beakerH - 40 * s},
                {x: rightElectrodeX, y: beakerY + beakerH + 60 * s},
                {x: termRightX, y: beakerY + beakerH + 60 * s},
                {x: termRightX, y: termY}
            ];
            animateDotsOnPath(path2, state.timeAccumulator, false);

            ctx.restore();
        }

        ctx.restore();
    }

    function animateDotsOnPath(points, time, isDown) {
        // Calculate total path length
        let lengths = [];
        let totalLen = 0;
        for (let i = 0; i < points.length - 1; i++) {
            const dx = points[i+1].x - points[i].x;
            const dy = points[i+1].y - points[i].y;
            const len = Math.sqrt(dx*dx + dy*dy);
            lengths.push(len);
            totalLen += len;
        }

        // Draw multiple dots spaced evenly along the path
        const dotSpacing = 35; // px
        const offset = (time * 15) % dotSpacing;

        for (let dist = offset; dist < totalLen; dist += dotSpacing) {
            let tempDist = dist;
            if (!isDown) tempDist = totalLen - dist; // reverse flow direction for anode

            // Interpolate position along segments
            let accumulated = 0;
            let pt = points[0];
            for (let i = 0; i < lengths.length; i++) {
                if (accumulated + lengths[i] >= tempDist) {
                    const ratio = (tempDist - accumulated) / lengths[i];
                    pt = {
                        x: points[i].x + (points[i+1].x - points[i].x) * ratio,
                        y: points[i].y + (points[i+1].y - points[i].y) * ratio
                    };
                    break;
                }
                accumulated += lengths[i];
            }

            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Draw the zoomed-in Microscopic Molecular View Circular Frame
    function drawMicroscopicView(beakerX, beakerY) {
        const mvR = state.microSize === 'large' ? 180 : 90; // radius of magnifier
        const center = getMagnifierCenter(mvR);
        const mvX = center.mvX;
        const mvY = center.mvY;

        ctx.save();

        // Circular background and glass shadow
        ctx.beginPath();
        ctx.arc(mvX, mvY, mvR, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(10, 14, 28, 0.95)";
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 30;
        ctx.fill();

        // Split-screen divider (Electrode barrier representation)
        ctx.beginPath();
        ctx.rect(mvX - mvR, mvY - mvR, mvR * 2, mvR * 2);
        ctx.clip();

        // 1. Draw Grid on micro-view background
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.lineWidth = 1;
        for (let g = mvX - mvR; g <= mvX + mvR; g += 15) {
            ctx.beginPath(); ctx.moveTo(g, mvY - mvR); ctx.lineTo(g, mvY + mvR); ctx.stroke();
        }
        for (let g = mvY - mvR; g <= mvY + mvR; g += 15) {
            ctx.beginPath(); ctx.moveTo(mvX - mvR, g); ctx.lineTo(mvX + mvR, g); ctx.stroke();
        }

        // 2. Draw Left Electrode Surface (-) - Scaled with mvR
        ctx.fillStyle = "#475569";
        ctx.fillRect(mvX - mvR * 0.5, mvY - mvR, mvR * 0.16, mvR * 2);
        // Draw minus symbols on it
        ctx.fillStyle = "#60a5fa";
        ctx.font = `bold ${Math.round(mvR * 0.13)}px monospace`;
        ctx.textAlign = "center";
        const symbolStep = mvR * 0.33;
        for (let i = -mvR + symbolStep/2; i < mvR; i += symbolStep) {
            ctx.fillText("-", mvX - mvR * 0.42, mvY + i);
        }

        // 3. Draw Right Electrode Surface (+) - Scaled with mvR
        ctx.fillStyle = "#475569";
        ctx.fillRect(mvX + mvR * 0.33, mvY - mvR, mvR * 0.16, mvR * 2);
        // Draw plus symbols on it
        ctx.fillStyle = "#f87171";
        ctx.font = `bold ${Math.round(mvR * 0.11)}px monospace`;
        ctx.textAlign = "center";
        for (let i = -mvR + symbolStep/2; i < mvR; i += symbolStep) {
            ctx.fillText("+", mvX + mvR * 0.42, mvY + i);
        }

        // 4. Update and Draw Microscopic Particles
        microParticles.forEach(p => {
            const side = p.x < mvX ? 'left' : 'right';
            if (state.isPlay && state.current > 0) {
                p.update(mvX, mvY, mvR, side);

                // Electrolysis transformation reactions at the surface - Scaled with mvR
                if (side === 'left') {
                    // Cathode (-) electrode interface: H2O -> H2 + OH-
                    const distToElectrode = Math.abs(p.x - (mvX - mvR * 0.34));
                    if (p.type === 'H2O' && distToElectrode < mvR * 0.13 && Math.random() < 0.015) {
                        // split!
                        p.type = 'H2';
                        p.vx = -1.0 - Math.random();
                        p.vy = -0.5 - Math.random() * 0.5;
                        
                        // spawn OH-
                        microParticles.push(new MicroParticle('OH-', mvX - mvR * 0.28, p.y + (Math.random() - 0.5) * 15));
                        
                        // Spawn electron transfer dot animation
                        sparks.push(new Spark(mvX - mvR * 0.34, p.y, "#eab308"));
                    }
                } else {
                    // Anode (+) electrode interface: H2O -> O2 + H+ (or Cl- -> Cl2 for NaCl)
                    const distToElectrode = Math.abs(p.x - (mvX + mvR * 0.34));
                    if (state.electrolyte === 'NaCl') {
                        if (p.type === 'Cl-' && distToElectrode < mvR * 0.13 && Math.random() < 0.015) {
                            // Cl- oxidized to Cl2
                            p.type = 'Cl2';
                            p.vx = 1.0 + Math.random();
                            p.vy = -0.5 - Math.random() * 0.5;
                            sparks.push(new Spark(mvX + mvR * 0.34, p.y, "#eab308"));
                        }
                    } else {
                        if (p.type === 'H2O' && distToElectrode < mvR * 0.13 && Math.random() < 0.008) {
                            // H2O oxidized to O2 + H+
                            p.type = 'O2';
                            p.vx = 1.0 + Math.random();
                            p.vy = -0.5 - Math.random() * 0.5;

                            // spawn H+
                            microParticles.push(new MicroParticle('H+', mvX + mvR * 0.28, p.y + (Math.random() - 0.5) * 15));
                            
                            // Spawn electron transfer dot animation (electron enters electrode)
                            sparks.push(new Spark(mvX + mvR * 0.34, p.y, "#eab308"));
                        }
                    }
                }
            }
            p.draw(ctx);
        });

        // Clear excess molecules that floated out of the view or got split
        if (microParticles.length > 50) {
            microParticles = microParticles.filter(p => {
                if (p.type === 'H2' && p.y < mvY - mvR + 10) return false;
                if (p.type === 'O2' && p.y < mvY - mvR + 10) return false;
                if (p.type === 'Cl2' && p.y < mvY - mvR + 10) return false;
                if (p.type === 'OH-' && p.x < mvX - mvR + 10) return false;
                if (p.type === 'H+' && p.x > mvX + mvR - 10) return false;
                if (p.type === 'Cl-' && p.x > mvX + mvR - 10) return false;
                return true;
            });
        }
        
        // Auto-replenish H2O / Cl- molecules
        const rightType = state.electrolyte === 'NaCl' ? 'Cl-' : 'H2O';
        let h2oCountLeft = microParticles.filter(p => p.type === 'H2O' && p.x < mvX).length;
        let rightCount = microParticles.filter(p => p.type === rightType && p.x >= mvX).length;
        if (h2oCountLeft < 8) {
            microParticles.push(new MicroParticle('H2O', mvX - mvR * 0.7, mvY + (Math.random() - 0.5) * mvR * 0.9));
        }
        if (rightCount < 8) {
            microParticles.push(new MicroParticle(rightType, mvX + mvR * 0.7, mvY + (Math.random() - 0.5) * mvR * 0.9));
        }

        // Draw Magnifying Glass Frame Border
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(0, 242, 254, 0.5)";
        ctx.beginPath();
        ctx.arc(mvX, mvY, mvR + 1, 0, Math.PI * 2);
        ctx.stroke();

        // Drawing title banner
        ctx.fillStyle = "rgba(10, 15, 30, 0.85)";
        ctx.beginPath();
        ctx.roundRect(mvX - 55, mvY + mvR - 10, 110, 18, 5);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.stroke();
        
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "bold 8px 'Outfit', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("미시적 분자 반응", mvX, mvY + mvR + 2);

        // 6. Draw Resize Button on top-right quadrant inside the magnifier
        const btnX = mvX + mvR * 0.65;
        const btnY = mvY - mvR * 0.65;
        const btnRad = 11;

        ctx.beginPath();
        ctx.arc(btnX, btnY, btnRad, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();

        // Icon inside button (+ or -)
        ctx.strokeStyle = "#00f2fe";
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (state.microSize === 'large') {
            // Draw '-' minus (zoom out / shrink)
            ctx.moveTo(btnX - 5, btnY);
            ctx.lineTo(btnX + 5, btnY);
        } else {
            // Draw '+' plus (zoom in / enlarge)
            ctx.moveTo(btnX - 5, btnY);
            ctx.lineTo(btnX + 5, btnY);
            ctx.moveTo(btnX, btnY - 5);
            ctx.lineTo(btnX, btnY + 5);
        }
        ctx.stroke();

        ctx.restore();
    }

    // 6. Gas Flame Test Animation Logic
    
    function startTestH2() {
        if (state.h2Volume < 2.0) return; // not enough gas
        state.isPlay = false;
        btnPlay.textContent = "▶ 재생";
        btnPlay.classList.add("paused");
        
        state.testingH2 = true;
        state.testingO2 = false;
        state.testTimer = 0;
        
        const dims = getBeakerDimensions();

        // Stick starts outside top-left
        state.stickX = -50;
        state.stickY = 100;
        state.testTargetX = dims.leftElectrodeX;
        state.testTargetY = dims.tubeY;
        state.flameOn = true; // match is lit
        
        statusTxt.textContent = "(-)극 수소 확인 성냥 테스트 진행 중...";
        statusTxt.style.color = "#3b82f6";
    }

    function startTestO2() {
        if (state.o2Volume < 1.0) return; // not enough gas
        state.isPlay = false;
        btnPlay.textContent = "▶ 재생";
        btnPlay.classList.add("paused");
        
        state.testingO2 = true;
        state.testingH2 = false;
        state.testTimer = 0;
        
        const dims = getBeakerDimensions();

        // Stick starts outside top-right
        state.stickX = width + 50;
        state.stickY = 100;
        state.testTargetX = dims.rightElectrodeX;
        state.testTargetY = dims.tubeY;
        state.flameOn = false; // splint is just glowing, not flaring yet
        
        if (state.electrolyte === 'NaCl') {
            statusTxt.textContent = "(+)극 염소 기체 확인 리트머스 테스트 진행 중...";
            statusTxt.style.color = "#a3e635";
        } else {
            statusTxt.textContent = "(+)극 산소 기체 확인 향불 테스트 진행 중...";
            statusTxt.style.color = "#ef4444";
        }
    }

    function handleFlameTestsUpdate() {
        if (state.testingH2) {
            state.testTimer++;
            // Slide stick to target top of left test tube
            const dx = state.testTargetX - state.stickX;
            const dy = state.testTargetY - state.stickY;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist > 6) {
                state.stickX += dx * 0.08;
                state.stickY += dy * 0.08;
            } else {
                // Arrived! Trigger "POP!" explosion
                playPopSound();
                
                // Explode particles
                const particleCount = Math.min(45, 15 + Math.round(state.h2Volume * 1.5));
                for (let i = 0; i < particleCount; i++) {
                    sparks.push(new Spark(state.stickX, state.stickY, Math.random() < 0.5 ? "#3b82f6" : "#60a5fa"));
                    // orange sparks too
                    if (Math.random() < 0.4) sparks.push(new Spark(state.stickX, state.stickY, "#f97316"));
                }

                // Show exploding text overlay
                state.showTestText = "POP! (퍽!)";
                state.testTextTimer = 40;
                state.testTextX = state.stickX;
                state.testTextY = state.stickY - 30;

                // Balloon Pop banner animation
                testBalloonText.textContent = "POP! 퍽!";
                testBalloonText.style.color = "#3b82f6";
                testBalloonText.style.textShadow = "0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px #60a5fa";
                testOverlay.classList.remove("hidden");
                setTimeout(() => testOverlay.classList.add("hidden"), 800);

                // Release Hydrogen gas and reset volume
                state.h2Volume = 0;
                valH2Vol.textContent = "0.00";
                barH2.style.width = "0%";
                valRatio.textContent = "2.00 : 1.00";

                state.flameOn = false; // match goes out
                state.testingH2 = false; // end test state
                
                statusTxt.textContent = "수소 기체 확인 완료 (폭발성 확인)";
                statusTxt.style.color = "#60a5fa";
            }
        }

        if (state.testingO2) {
            state.testTimer++;
            const dx = state.testTargetX - state.stickX;
            const dy = state.testTargetY - state.stickY;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist > 6) {
                state.stickX += dx * 0.08;
                state.stickY += dy * 0.08;
            } else {
                if (state.electrolyte === 'NaCl') {
                    // Chlorine test: Bleaching blue litmus paper
                    playWhooshSound(); // soft hiss/whoosh
                    state.flameOn = true; // bleached
                    
                    // Explode white bleaching particles
                    const particleCount = Math.min(30, 10 + Math.round(state.o2Volume * 1.5));
                    for (let i = 0; i < particleCount; i++) {
                        sparks.push(new Spark(state.stickX, state.stickY, Math.random() < 0.5 ? "#ffffff" : "#a3e635"));
                    }

                    // Show bleaching text
                    state.showTestText = "탈색! (Bleached)";
                    state.testTextTimer = 60;
                    state.testTextX = state.stickX;
                    state.testTextY = state.stickY - 30;

                    testBalloonText.textContent = "탈색! Bleached";
                    testBalloonText.style.color = "#a3e635";
                    testBalloonText.style.textShadow = "0 0 20px rgba(163, 230, 53, 0.8), 0 0 40px #ffffff";
                    testOverlay.classList.remove("hidden");
                    setTimeout(() => testOverlay.classList.add("hidden"), 1000);

                    // Release Chlorine gas
                    state.o2Volume = 0;
                    valO2Vol.textContent = "0.00";
                    barO2.style.width = "0%";
                    
                    state.testingO2 = false;
                    statusTxt.textContent = "염소 기체 확인 완료 (리트머스 종이 탈색)";
                    statusTxt.style.color = "#a3e635";
                } else {
                    // Oxygen test: Flare-up splint
                    playWhooshSound();
                    state.flameOn = true; // ignite!
                    
                    // Explode spark embers
                    const particleCount = Math.min(30, 10 + Math.round(state.o2Volume * 1.5));
                    for (let i = 0; i < particleCount; i++) {
                        sparks.push(new Spark(state.stickX, state.stickY, Math.random() < 0.6 ? "#ef4444" : "#fca5a5"));
                        if (Math.random() < 0.5) sparks.push(new Spark(state.stickX, state.stickY, "#f59e0b")); // golden flames
                    }

                    // Show rekindling text
                    state.showTestText = "활활! (Rekindle)";
                    state.testTextTimer = 50;
                    state.testTextX = state.stickX;
                    state.testTextY = state.stickY - 30;

                    testBalloonText.textContent = "활활! Rekindle";
                    testBalloonText.style.color = "#ef4444";
                    testBalloonText.style.textShadow = "0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px #fca5a5";
                    testOverlay.classList.remove("hidden");
                    setTimeout(() => testOverlay.classList.add("hidden"), 1000);

                    // Release Oxygen gas and reset volume
                    state.o2Volume = 0;
                    valO2Vol.textContent = "0.00";
                    barO2.style.width = "0%";

                    state.testingO2 = false;
                    statusTxt.textContent = "산소 기체 확인 완료 (조연성 확인)";
                    statusTxt.style.color = "#f87171";
                }
                
                // Recalculate ratio
                valRatio.textContent = state.electrolyte === 'NaCl' ? "1.00 : 1.00" : "2.00 : 1.00";
            }
        }

        // Handle fading text overlays inside canvas
        if (state.testTextTimer > 0) {
            state.testTextTimer--;
            state.testTextY -= 0.3; // float up
            if (state.testTextTimer === 0) {
                state.showTestText = "";
                state.flameOn = false;
            }
        }
    }

    function drawGasTestTools() {
        // Draw matchstick or splint stick if tests are happening or just finished
        if (state.testingH2 || (state.showTestText === "POP! (퍽!)" && state.testTextTimer > 0)) {
            // H2 Match stick
            ctx.save();
            ctx.lineWidth = 6;
            ctx.strokeStyle = "#b45309"; // Wooden stick (brown)
            ctx.beginPath();
            ctx.moveTo(state.stickX, state.stickY);
            ctx.lineTo(state.stickX - 50, state.stickY - 25);
            ctx.stroke();

            // Match head (red)
            ctx.fillStyle = state.flameOn ? "#475569" : "#dc2626";
            ctx.beginPath();
            ctx.arc(state.stickX, state.stickY, 4, 0, Math.PI * 2);
            ctx.fill();

            if (state.flameOn) {
                // Match flame
                ctx.fillStyle = "#eab308";
                ctx.shadowColor = "#f97316";
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.ellipse(state.stickX, state.stickY - 6, 4, 8, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#ef4444";
                ctx.beginPath();
                ctx.ellipse(state.stickX, state.stickY - 5, 2.5, 5, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (state.showTestText === "POP! (퍽!)") {
                // Smoke trail
                ctx.fillStyle = "rgba(100, 116, 139, 0.4)";
                ctx.beginPath();
                ctx.arc(state.stickX + (Math.random() - 0.5) * 4, state.stickY - 10 - (40 - state.testTextTimer), 5 - (state.testTextTimer * 0.1), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        if (state.testingO2 || (state.showTestText && (state.showTestText.includes("활활") || state.showTestText.includes("탈색")) && state.testTextTimer > 0)) {
            ctx.save();
            if (state.electrolyte === 'NaCl') {
                // Litmus Paper Strip (blue rectangle)
                const paperW = 10;
                const paperH = 35;
                const paperX = state.stickX - paperW / 2;
                const paperY = state.stickY - paperH;

                ctx.save();
                ctx.lineWidth = 1;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
                
                // Render paper based on whether it has touched the anode (state.flameOn)
                if (!state.flameOn) {
                    // 1. Dry/Unreacted state: Paper remains purely blue as it moves
                    const paperGrad = ctx.createLinearGradient(paperX, paperY, paperX, paperY + paperH);
                    paperGrad.addColorStop(0, "#2563eb"); // Blue
                    paperGrad.addColorStop(1, "#3b82f6"); // Damp Blue
                    ctx.fillStyle = paperGrad;
                    
                    ctx.beginPath();
                    ctx.roundRect(paperX, paperY, paperW, paperH, 2);
                    ctx.fill();
                    ctx.stroke();
                } else {
                    // 2. Reacted state (state.flameOn === true): Reaction occurs sequentially over 60 frames
                    if (state.testTextTimer > 36) {
                        // Phase 1 (timer 60 -> 36): Red color creeps up from bottom representing acidic reaction
                        const progress = (60 - state.testTextTimer) / 24; // 0 to 1
                        const redStop = 1.0 - progress; // creeps up from 1.0 to 0.0
                        
                        const paperGrad = ctx.createLinearGradient(paperX, paperY, paperX, paperY + paperH);
                        paperGrad.addColorStop(0, "#2563eb");
                        if (redStop > 0.0) {
                            paperGrad.addColorStop(redStop, "#3b82f6");
                        }
                        paperGrad.addColorStop(Math.min(1.0, redStop + 0.2), "#ef4444"); // Turns red
                        paperGrad.addColorStop(1, "#fca5a5");
                        ctx.fillStyle = paperGrad;
                        
                        ctx.beginPath();
                        ctx.roundRect(paperX, paperY, paperW, paperH, 2);
                        ctx.fill();
                        ctx.stroke();
                    } else {
                        // Phase 2 (timer 36 -> 0): Red paper bleaches smoothly to white
                        const paperGrad = ctx.createLinearGradient(paperX, paperY, paperX, paperY + paperH);
                        paperGrad.addColorStop(0, "#ef4444");
                        paperGrad.addColorStop(1, "#fca5a5");
                        ctx.fillStyle = paperGrad;
                        
                        ctx.beginPath();
                        ctx.roundRect(paperX, paperY, paperW, paperH, 2);
                        ctx.fill();
                        ctx.stroke();
                        
                        const bleachProgress = Math.min(1.0, (36 - state.testTextTimer) / 36);
                        ctx.fillStyle = `rgba(255, 255, 255, ${bleachProgress})`;
                        ctx.beginPath();
                        ctx.roundRect(paperX, paperY, paperW, paperH, 2);
                        ctx.fill();
                        ctx.stroke();
                    }
                }
                
                ctx.restore();
            } else {
                // O2 Glowing splint stick
                ctx.lineWidth = 5;
                ctx.strokeStyle = "#d97706"; // Wood splint
                ctx.beginPath();
                ctx.moveTo(state.stickX, state.stickY);
                ctx.lineTo(state.stickX + 60, state.stickY - 20);
                ctx.stroke();

                if (state.flameOn) {
                    // flared-up active oxygen fire
                    ctx.fillStyle = "#fffbeb";
                    ctx.shadowColor = "#f59e0b";
                    ctx.shadowBlur = 20;
                    ctx.beginPath();
                    ctx.ellipse(state.stickX, state.stickY - 10, 8, 14, 0, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = "#ea580c";
                    ctx.beginPath();
                    ctx.ellipse(state.stickX, state.stickY - 7, 5, 9, 0, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Glowing ember (just a red dot)
                    ctx.fillStyle = "#ef4444";
                    ctx.shadowColor = "#ef4444";
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(state.stickX, state.stickY, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();
        }

        // Draw overlay text inside canvas
        if (state.showTestText) {
            ctx.save();
            ctx.fillStyle = state.showTestText.includes("POP") ? "#60a5fa" : 
                            (state.showTestText.includes("탈색") ? "#a3e635" : "#f87171");
            ctx.font = "bold 15px 'Outfit', sans-serif";
            ctx.textAlign = "center";
            ctx.shadowBlur = 10;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fillText(state.showTestText, state.testTextX, state.testTextY);
            ctx.restore();
        }
    }

    // 7. Core Main Loop
    
    function animate() {
        // Clear canvas
        ctx.fillStyle = "#07080d";
        ctx.fillRect(0, 0, width, height);

        // Grid overlay
        ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }

        // Setup dimensional variables relative to responsive screen size
        const dims = getBeakerDimensions();
        const beakerX = dims.beakerX;
        const beakerY = dims.beakerY;
        const beakerW = dims.beakerW;
        const beakerH = dims.beakerH;
        const waterH = dims.waterH;

        const leftElectrodeX = dims.leftElectrodeX;
        const rightElectrodeX = dims.rightElectrodeX;
        const electrodeTopY = dims.electrodeTopY;
        const tubeY = dims.tubeY;
        const tubeH = dims.tubeH;

        // Calculate bubble emission heights based on current water level
        const leftGasFrac = state.h2Volume / state.maxVolume;
        const rightGasFrac = state.o2Volume / state.maxVolume; // out of 20 max capacity
        const leftWaterYInTube = tubeY + tubeH * (1.0 - leftGasFrac);
        const rightWaterYInTube = tubeY + tubeH * (1.0 - rightGasFrac);

        // A. Generate bubbles at electrode surface if simulation is playing
        if (state.isPlay && state.current > 0) {
            const isMobile = width <= 600;
            const s = isMobile ? Math.min(width / 420, height / 370) : 1.0;

            // Hydrogen (-) Cathode bubbles (Frequent, small) - Capped to prevent lag at high current
            const h2Count = Math.min(4, Math.round(state.current * 0.04));
            for (let i = 0; i < h2Count; i++) {
                if (Math.random() < 0.6 && state.h2Volume < state.maxVolume) {
                    bubbles.push(new Bubble(leftElectrodeX, electrodeTopY, 1.2 * s, true));
                }
            }

            // Oxygen (+) Anode bubbles (Slower rate, slightly larger) - Capped to prevent lag at high current
            const o2Count = Math.min(2, Math.round(state.current * 0.02));
            for (let i = 0; i < o2Count; i++) {
                if (Math.random() < 0.5 && state.h2Volume < state.maxVolume) {
                    bubbles.push(new Bubble(rightElectrodeX, electrodeTopY, 2.5 * s, false));
                }
            }

            // Keep bubbles array capped to avoid performance issues
            if (bubbles.length > 200) {
                bubbles.splice(0, bubbles.length - 200);
            }
        }

        // B. Update & Draw Beaker Liquid (under-layer)
        drawBeaker(width, height, beakerX, beakerY, beakerW, beakerH, waterH);

        // C. Update & Draw Ions drifting in water
        if (state.concentration > 0 && state.showIons) {
            ions.forEach(ion => {
                if (state.isPlay) ion.update(state.current, leftElectrodeX, rightElectrodeX);
                ion.draw(ctx);
            });
        }

        // D. Update & Draw Wires, Electrodes, Glass Tubes, Gas Volume levels
        drawElectrodesAndTubes(beakerX, beakerY, beakerW, beakerH, waterH);

        // E. Update & Draw Bubbles floating upwards inside tubes (Using filter for safety and performance)
        bubbles = bubbles.filter(b => {
            if (state.isPlay) b.update();
            b.draw(ctx);

            // Collision check with water surface inside tube
            const waterLevelLimit = b.isH2 ? leftWaterYInTube : rightWaterYInTube;
            return b.y > waterLevelLimit + 2;
        });

        // F. Draw battery wires and animated electron flow dots
        drawCircuitAndElectronics(beakerX, beakerY, beakerW, beakerH);

        // G. Update and draw Flame Tests (Matchstick / Splint flame animations)
        handleFlameTestsUpdate();
        drawGasTestTools();

        // H. Update and draw Sparks/Ember Particles from explosions (Using filter for safety and performance)
        sparks = sparks.filter(s => {
            s.update();
            s.draw(ctx);
            return s.life > 0;
        });

        // I. Draw the Circular Microscopic Magnified Panel
        if (state.showMicro) {
            drawMicroscopicView(beakerX, beakerY);
        }

        // Update button states (disable/enable gas testing)
        // Enable testing if collected gas is above 2.0 mL H2 and 1.0 mL O2
        if (state.h2Volume >= 2.0 && !state.testingH2 && !state.testingO2) {
            btnTestH2.disabled = false;
        } else {
            btnTestH2.disabled = true;
        }

        if (state.o2Volume >= 1.0 && !state.testingH2 && !state.testingO2) {
            btnTestO2.disabled = false;
        } else {
            btnTestO2.disabled = true;
        }

        // Physics solver updates
        updateVolumes();

        requestAnimationFrame(animate);
    }

    // 8. Event Listeners & UI Handlers

    // Resizing the canvas dynamically
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        width = rect.width;
        height = rect.height;
        ctx.scale(dpr, dpr);
        
        if (state.showMicro) {
            const mvR = state.microSize === 'large' ? 180 : 90;
            const center = getMagnifierCenter(mvR);
            initMicroParticles(center.mvX, center.mvY, mvR);
        }
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas(); // initial call

    // Inputs updates
    const onVoltageChange = (e) => {
        state.voltage = parseFloat(e.target.value);
        voltageVal.textContent = state.voltage.toFixed(1);
        calculatePhysics();
    };
    voltageSlider.addEventListener("input", onVoltageChange);
    voltageSlider.addEventListener("change", onVoltageChange);

    const onConcentrationChange = (e) => {
        state.concentration = parseFloat(e.target.value);
        concentrationVal.textContent = state.concentration.toFixed(1);
        calculatePhysics();
        if (state.concentration === 0) {
            statusTxt.textContent = "전류 차단됨 (순수한 물)";
            statusTxt.style.color = "#94a3b8";
        }
    };
    concentrationSlider.addEventListener("input", onConcentrationChange);
    concentrationSlider.addEventListener("change", onConcentrationChange);

    // (Electrode distance and indicators removed)

    // Modal Control
    btnInfo.addEventListener("click", () => {
        infoModal.classList.remove("hidden");
    });

    btnCloseModal.addEventListener("click", () => {
        infoModal.classList.add("hidden");
    });

    infoModal.addEventListener("click", (e) => {
        if (e.target === infoModal) infoModal.classList.add("hidden");
    });

    // Action Controls
    btnPlay.addEventListener("click", () => {
        state.isPlay = !state.isPlay;
        if (state.isPlay) {
            btnPlay.textContent = "⏸ 일시정지";
            btnPlay.classList.remove("paused");
        } else {
            btnPlay.textContent = "▶ 재생";
            btnPlay.classList.add("paused");
        }
    });

    if (btnTogglePanel && controlsPanel) {
        btnTogglePanel.addEventListener("click", () => {
            const isCollapsed = controlsPanel.classList.toggle("collapsed");
            btnTogglePanel.textContent = isCollapsed ? "열기 ☰" : "접기 ✕";
        });
    }

    function updateIonToggleButtonText() {
        const cationSymbol = 'Na+';
        const anionSymbol = state.electrolyte === 'NaOH' ? 'OH-' : 'Cl-';
        if (state.showIons) {
            btnToggleIons.textContent = `🔋 이온(${cationSymbol}, ${anionSymbol}) 표시`;
            btnToggleIons.classList.add("active");
        } else {
            btnToggleIons.textContent = `🔋 이온(${cationSymbol}, ${anionSymbol}) 숨김`;
            btnToggleIons.classList.remove("active");
        }
    }

    btnReset.addEventListener("click", () => {
        state.h2Volume = 0;
        state.o2Volume = 0;
        state.diffusionRadius = 20;
        bubbles = [];
        sparks = [];
        
        valH2Vol.textContent = "0.00";
        valO2Vol.textContent = "0.00";
        barH2.style.width = "0%";
        barO2.style.width = "0%";
        valRatio.textContent = state.electrolyte === 'NaCl' ? "1.00 : 1.00" : "2.00 : 1.00";
        
        state.testingH2 = false;
        state.testingO2 = false;
        state.flameOn = false;
        state.showTestText = "";
        
        // Reset ions visibility
        state.showIons = true;
        updateIonToggleButtonText();
        
        // Reset micro size
        state.microSize = 'small';
        
        statusTxt.textContent = "초기화됨 (반응 전)";
        statusTxt.style.color = "#cbd5e1";
        
        initIons();
        const mvR = state.microSize === 'large' ? 180 : 90;
        const center = getMagnifierCenter(mvR);
        initMicroParticles(center.mvX, center.mvY, mvR);
    });

    btnToggleMicro.addEventListener("click", () => {
        state.showMicro = !state.showMicro;
        if (state.showMicro) {
            btnToggleMicro.textContent = "🔍 미시적(분자) 관찰";
            btnToggleMicro.classList.add("active");
            const tempMvR = state.microSize === 'large' ? 180 : 90;
            const center = getMagnifierCenter(tempMvR);
            initMicroParticles(center.mvX, center.mvY, tempMvR);
        } else {
            btnToggleMicro.textContent = "🔍 미시적(분자) 관찰";
            btnToggleMicro.classList.remove("active");
        }
    });

    btnToggleIons.addEventListener("click", () => {
        state.showIons = !state.showIons;
        updateIonToggleButtonText();
    });

    btnTestH2.addEventListener("click", startTestH2);
    btnTestO2.addEventListener("click", startTestO2);

    // Electrolyte radio button change handlers
    electrolyteBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active class from all buttons
            electrolyteBtns.forEach(b => b.classList.remove("active"));
            // Add active class to clicked button
            btn.classList.add("active");
            
            // Update state and UI
            state.electrolyte = btn.getAttribute("data-value");
            
            // Display formatted name/formula
            let labelText = "NaOH";
            if (state.electrolyte === "NaCl") labelText = "NaCl";
            
            electrolyteLabel.textContent = labelText;

            // Dynamic UI updates based on electrolyte (NaCl vs NaOH)
            barO2.classList.remove("o2-color", "cl2-color");

            if (state.electrolyte === "NaCl") {
                labelRatioTitle.textContent = "기체 부피 비 (H₂ : Cl₂)";
                labelRightGasTitle.textContent = "(+)극 염소 기체 (Cl₂)";
                testRightName.textContent = "리트머스 종이";
                barO2.classList.add("cl2-color");
                if (cardO2) cardO2.style.borderLeftColor = "#a3e635";
            } else {
                labelRatioTitle.textContent = "기체 부피 비 (H₂ : O₂)";
                labelRightGasTitle.textContent = "(+)극 산소 기체 (O₂)";
                testRightName.textContent = "향불";
                barO2.classList.add("o2-color");
                if (cardO2) cardO2.style.borderLeftColor = "var(--anode)";
            }
            if (unitRightGas) unitRightGas.textContent = " mL";

            // Reset labels on btnToggleIons based on current electrolyte
            updateIonToggleButtonText();

            // Reset gas volumes so ratio doesn't look weird when changing mid-simulation
            state.h2Volume = 0;
            state.o2Volume = 0;
            valH2Vol.textContent = "0.00";
            valO2Vol.textContent = "0.00";
            barH2.style.width = "0%";
            barO2.style.width = "0%";
            valRatio.textContent = state.electrolyte === 'NaCl' ? "1.00 : 1.00" : "2.00 : 1.00";
            
            // Re-initialize physical resistance/current and floating ions
            calculatePhysics();
            initIons();
        });
    });

    // Canvas click event to resize the micro view magnifier
    canvas.addEventListener("click", (e) => {
        if (!state.showMicro) return;
        
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) * (width / rect.width);
        const clickY = (e.clientY - rect.top) * (height / rect.height);
        
        const mvR = state.microSize === 'large' ? 180 : 90;
        const center = getMagnifierCenter(mvR);
        const mvX = center.mvX;
        const mvY = center.mvY;
        
        const btnX = mvX + mvR * 0.65;
        const btnY = mvY - mvR * 0.65;
        const btnRad = 11;
        
        const dist = Math.sqrt((clickX - btnX) * (clickX - btnX) + (clickY - btnY) * (clickY - btnY));
        if (dist <= btnRad + 5) {
            state.microSize = state.microSize === 'large' ? 'small' : 'large';
            
            // Recalculate coordinates and reinitialize particles to fill the new size area
            const newMvR = state.microSize === 'large' ? 180 : 90;
            const newCenter = getMagnifierCenter(newMvR);
            initMicroParticles(newCenter.mvX, newCenter.mvY, newMvR);
            playWhooshSound();
        }
    });

    // Canvas mousemove to change cursor over resize button
    canvas.addEventListener("mousemove", (e) => {
        if (!state.showMicro) return;
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * (width / rect.width);
        const mouseY = (e.clientY - rect.top) * (height / rect.height);
        
        const mvR = state.microSize === 'large' ? 180 : 90;
        const center = getMagnifierCenter(mvR);
        const mvX = center.mvX;
        const mvY = center.mvY;
        
        const btnX = mvX + mvR * 0.65;
        const btnY = mvY - mvR * 0.65;
        const btnRad = 11;
        
        const dist = Math.sqrt((mouseX - btnX) * (mouseX - btnX) + (mouseY - btnY) * (mouseY - btnY));
        if (dist <= btnRad + 5) {
            canvas.style.cursor = "pointer";
        } else {
            canvas.style.cursor = "default";
        }
    });

    // Initializations
    calculatePhysics();
    initIons();
    
    // Start animation loop
    animate();
});
