/**
 * H-R도표 및 별의 진화 시뮬레이터 - 별 실시각화 Canvas & 핵융합 구조 모듈
 */

class StarVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.starState = {
            temp: 5778,
            lum: 1.0,
            rRatio: 1.0,
            name: '태양 (Sun)',
            core: '수소 핵융합 (p-p chain)',
            effect: null,
            finalState: null
        };

        this.particles = [];
        this.nebulaGas = [];
        this.animFrameId = null;
        this.rotationAngle = 0;

        this.showInternalCrossSection = false; // 내부 구조 보기 모드

        this.initResize();
        this.initParticles();
        this.startLoop();
    }

    initResize() {
        const resize = () => {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width * (window.devicePixelRatio || 1);
            this.canvas.height = rect.height * (window.devicePixelRatio || 1);
            this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
            this.cssWidth = rect.width;
            this.cssHeight = rect.height;
        };

        window.addEventListener('resize', resize);
        setTimeout(resize, 50);
    }

    initParticles() {
        // 항성 대기 및 성운 파티클 초기화
        this.particles = [];
        for (let i = 0; i < 60; i++) {
            this.particles.push({
                angle: Math.random() * Math.PI * 2,
                dist: Math.random() * 0.5 + 1.0,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 0.02 + 0.005,
                alpha: Math.random() * 0.7 + 0.3
            });
        }
    }

    updateState(newState) {
        this.starState = { ...this.starState, ...newState };
    }

    setInternalView(show) {
        this.showInternalCrossSection = show;
    }

    startLoop() {
        const render = () => {
            this.rotationAngle += 0.01;
            this.draw();
            this.animFrameId = requestAnimationFrame(render);
        };
        render();
    }

    tempToRGB(temp) {
        // 물리적 별 표면 온도에 따른 RGB 색상 계산
        let r, g, b;
        if (temp >= 20000) {
            r = 150; g = 180; b = 255;
        } else if (temp >= 10000) {
            r = 180; g = 210; b = 255;
        } else if (temp >= 7500) {
            r = 220; g = 230; b = 255;
        } else if (temp >= 6000) {
            r = 255; g = 250; b = 240;
        } else if (temp >= 5000) {
            r = 255; g = 230; b = 180;
        } else if (temp >= 3500) {
            r = 255; g = 170; b = 100;
        } else {
            r = 255; g = 100; b = 60;
        }
        return { r, g, b, hex: `rgb(${r},${g},${b})` };
    }

    draw() {
        if (!this.cssWidth || !this.cssHeight) return;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);

        const cx = this.cssWidth / 2;
        const cy = this.cssHeight / 2;

        // 1. 특수 상태 체크 (블랙홀, 중성자별, 초신성 폭발, 행성상 성운)
        if (this.starState.finalState === 'blackHole') {
            this.drawBlackHole(ctx, cx, cy);
            return;
        }

        if (this.starState.finalState === 'neutronStar') {
            this.drawPulsar(ctx, cx, cy);
            return;
        }

        if (this.starState.effect === 'supernova' || this.starState.effect === 'hypernova') {
            this.drawSupernova(ctx, cx, cy);
            return;
        }

        if (this.starState.effect === 'planetaryNebula') {
            this.drawPlanetaryNebula(ctx, cx, cy);
        }

        // 2. 내부 양파 껍질 구조 뷰어
        if (this.showInternalCrossSection) {
            this.drawInternalStructure(ctx, cx, cy);
            return;
        }

        // 3. 일반 항성 렌더링
        this.drawNormalStar(ctx, cx, cy);
    }

    drawNormalStar(ctx, cx, cy) {
        const temp = this.starState.temp;
        const rgb = this.tempToRGB(temp);
        
        // 반경 화면 스케일 계산 (최소 25px, 최대 140px)
        const baseR = Math.max(25, Math.min(140, 35 * Math.pow(this.starState.rRatio, 0.25)));

        ctx.save();

        // 외곽 코로나 / 플레어 분출 이펙트
        for (const p of this.particles) {
            p.angle += p.speed;
            const px = cx + Math.cos(p.angle) * baseR * p.dist;
            const py = cy + Math.sin(p.angle) * baseR * p.dist;

            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.alpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // 대기 후광 글로우 (Outer Glow)
        const glowGrad = ctx.createRadialGradient(cx, cy, baseR * 0.8, cx, cy, baseR * 2.2);
        glowGrad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
        glowGrad.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`);
        glowGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // 항성 구체 구배 (Body Gradient)
        const bodyGrad = ctx.createRadialGradient(
            cx - baseR * 0.3, cy - baseR * 0.3, baseR * 0.1,
            cx, cy, baseR
        );
        bodyGrad.addColorStop(0, '#ffffff');
        bodyGrad.addColorStop(0.4, `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
        bodyGrad.addColorStop(0.85, `rgb(${Math.floor(rgb.r * 0.7)}, ${Math.floor(rgb.g * 0.7)}, ${Math.floor(rgb.b * 0.7)})`);
        bodyGrad.addColorStop(1, `rgb(${Math.floor(rgb.r * 0.3)}, ${Math.floor(rgb.g * 0.3)}, ${Math.floor(rgb.b * 0.3)})`);

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
        ctx.fill();

        // 흑점 및 표면 대류 셀 무늬 (Convection cells)
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let i = 0; i < 5; i++) {
            const spotAngle = this.rotationAngle + (i * Math.PI * 2 / 5);
            const sx = cx + Math.cos(spotAngle) * baseR * 0.5;
            const sy = cy + Math.sin(spotAngle * 0.7) * baseR * 0.5;
            ctx.beginPath();
            ctx.ellipse(sx, sy, baseR * 0.12, baseR * 0.08, spotAngle, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';

        ctx.restore();
    }

    drawInternalStructure(ctx, cx, cy) {
        const baseR = 120;
        const mass = this.starState.mass || 1.0;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = 'bold 12px "Outfit", sans-serif';

        // 질량에 따른 양파 껍질 구조 레이어
        let layers = [];
        if (mass >= 8.0) {
            layers = [
                { name: '수소 (H) 외층', color: '#ff7766', r: baseR },
                { name: '헬륨 (He) 껍질', color: '#ffb74d', r: baseR * 0.82 },
                { name: '탄소 (C) 껍질', color: '#81c784', r: baseR * 0.68 },
                { name: '산소 (O) 껍질', color: '#4dd0e1', r: baseR * 0.54 },
                { name: '네온/규소 (Ne/Si)', color: '#ba68c8', r: baseR * 0.38 },
                { name: '철 (Fe) 코어 (붕괴 임계)', color: '#ef5350', r: baseR * 0.22 }
            ];
        } else if (mass >= 0.8) {
            layers = [
                { name: '수소 (H) 대기', color: '#ff8a65', r: baseR },
                { name: '수소 껍질 융합층', color: '#ffd54f', r: baseR * 0.7 },
                { name: '탄소-산소 (C-O) 코어', color: '#90caf9', r: baseR * 0.38 }
            ];
        } else {
            layers = [
                { name: '수소 (H) 전체 대류층', color: '#ff8a65', r: baseR },
                { name: '헬륨 (He) 중심부', color: '#ffe082', r: baseR * 0.45 }
            ];
        }

        layers.forEach((l) => {
            ctx.fillStyle = l.color;
            ctx.beginPath();
            ctx.arc(cx, cy, l.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 껍질 이름 텍스트
            ctx.fillStyle = '#0f172a';
            ctx.fillText(l.name, cx, cy - l.r + 14);
        });

        // 중심 반응 라벨
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px "Outfit", sans-serif';
        ctx.fillText(`[핵 반응: ${this.starState.core}]`, cx, cy + baseR + 25);

        ctx.restore();
    }

    drawPlanetaryNebula(ctx, cx, cy) {
        ctx.save();
        // 팽창하는 무지개 빛깔 성운 고리
        const rRing = 130 + Math.sin(Date.now() / 300) * 10;
        
        const nebGrad = ctx.createRadialGradient(cx, cy, 15, cx, cy, rRing);
        nebGrad.addColorStop(0, '#ffffff');
        nebGrad.addColorStop(0.15, 'rgba(56, 189, 248, 0.9)');
        nebGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.5)');
        nebGrad.addColorStop(0.85, 'rgba(236, 72, 153, 0.3)');
        nebGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = nebGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, rRing, 0, Math.PI * 2);
        ctx.fill();

        // 중심 백색왜성
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawSupernova(ctx, cx, cy) {
        ctx.save();
        const pulse = (Date.now() % 1000) / 1000;
        const blastR = 60 + pulse * 120;

        // 초신성 폭발 렌즈 플레어 및 방사상 충격파
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, blastR);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, '#fef08a');
        grad.addColorStop(0.5, '#f97316');
        grad.addColorStop(0.8, '#dc2626');
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, blastR, 0, Math.PI * 2);
        ctx.fill();

        // 섬광 스파이크 빔
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
            const ang = (i * Math.PI / 4) + this.rotationAngle * 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(ang) * (blastR * 1.3), cy + Math.sin(ang) * (blastR * 1.3));
            ctx.stroke();
        }

        ctx.restore();
    }

    drawPulsar(ctx, cx, cy) {
        ctx.save();

        // 강한 자기장 빔 사출 애니메이션
        const beamLen = 160;
        const angle = this.rotationAngle * 5; // 고속 자전

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        const beamGrad = ctx.createLinearGradient(0, -beamLen, 0, beamLen);
        beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        beamGrad.addColorStop(0.2, 'rgba(56, 189, 248, 0.9)');
        beamGrad.addColorStop(0.5, '#ffffff');
        beamGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.9)');
        beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(-12, -beamLen);
        ctx.lineTo(12, -beamLen);
        ctx.lineTo(3, 0);
        ctx.lineTo(-3, 0);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-12, beamLen);
        ctx.lineTo(12, beamLen);
        ctx.lineTo(3, 0);
        ctx.lineTo(-3, 0);
        ctx.fill();

        ctx.restore();

        // 중심 중성자별 구체
        const nsGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
        nsGrad.addColorStop(0, '#ffffff');
        nsGrad.addColorStop(0.6, '#38bdf8');
        nsGrad.addColorStop(1, '#0284c7');

        ctx.fillStyle = nsGrad;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawBlackHole(ctx, cx, cy) {
        ctx.save();

        // 1. 중력 렌즈 효과 빛 왜곡 링
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, 75, 0, Math.PI * 2);
        ctx.stroke();

        // 2. 강착 원반 (Accretion Disk) - 타원형 회전
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(0.3);
        ctx.scale(1, 0.35);

        const diskGrad = ctx.createRadialGradient(0, 0, 30, 0, 0, 110);
        diskGrad.addColorStop(0, 'rgba(0,0,0,0)');
        diskGrad.addColorStop(0.2, '#ffffff');
        diskGrad.addColorStop(0.4, '#f59e0b');
        diskGrad.addColorStop(0.7, '#ef4444');
        diskGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = diskGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 110, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // 3. 사건의 지평선 (Event Horizon - 칠흑 같은 원)
        ctx.fillStyle = '#000000';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(cx, cy, 32, 0, Math.PI * 2);
        ctx.fill();

        // 사건의 지평선 테두리 경계 광선
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 32.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}

if (typeof window !== 'undefined') {
    window.StarVisualizer = StarVisualizer;
}
