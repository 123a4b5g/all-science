/* ==========================================================================
   별과 흑체 복사 - 슈테판-볼츠만 법칙 & 광도/반지름 시뮬레이터
   ========================================================================== */

class LuminositySim {
    constructor() {
        this.canvas = document.getElementById('lumCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.radiusRel = 1.0; // R / R_sun
        this.temperature = 5778; // T (K)

        this.showParticles = true;
        this.showScaleRef = true;

        this.particles = [];
        this.animId = null;

        this.init();
    }

    init() {
        this.resize();
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            if (resizeTimer) cancelAnimationFrame(resizeTimer);
            resizeTimer = requestAnimationFrame(() => this.resize());
        });
        this.startAnim();
    }

    resize() {
        const box = this.canvas.parentElement;
        this.canvas.width = box.clientWidth;
        this.canvas.height = box.clientHeight;
    }

    setRadius(rRel) {
        this.radiusRel = Math.max(0.01, Math.min(1000, rRel));
        this.updateUI();
    }

    setTemperature(temp) {
        this.temperature = Math.max(2000, Math.min(40000, temp));
        this.updateUI();
    }

    kelvinToRGB(kelvin) {
        let temp = kelvin / 100;
        let r, g, b;

        if (temp <= 66) {
            r = 255;
            g = temp <= 0 ? 0 : 99.4708025861 * Math.log(temp) - 161.1195681661;
            b = temp <= 19 ? 0 : 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
        } else {
            r = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
            g = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
            b = 255;
        }

        return {
            r: Math.round(Math.max(0, Math.min(255, r))),
            g: Math.round(Math.max(0, Math.min(255, g))),
            b: Math.round(Math.max(0, Math.min(255, b)))
        };
    }

    startAnim() {
        const loop = () => {
            this.render();
            this.animId = requestAnimationFrame(loop);
        };
        loop();
    }

    render() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;

        // 캔버스 크기에 따른 비주얼 별 반지름 연산
        const baseRadiusPx = Math.min(width, height) * 0.22;
        const logR = Math.log10(this.radiusRel);
        const visualRadius = Math.max(15, Math.min(Math.min(width, height) * 0.42, baseRadiusPx * (1 + logR * 0.3)));

        const rgb = this.kelvinToRGB(this.temperature);
        const starColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        const isEn = (localStorage.getItem('sci-lab-lang') === 'en');

        // 1. 태양 기준 크기 서클 (Scale Reference Circle)
        if (this.showScaleRef) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadiusPx, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
            ctx.font = 'bold 12px "Noto Sans KR", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(isEn ? '1.0 R☉ (Sun Reference Scale)' : '1.0 R☉ (태양 기준 크기)', centerX, centerY - baseRadiusPx - 8);
        }

        // 2. 광자 방출 입자 시뮬레이션 (기존의 10% 양으로 은은하게 제한)
        if (this.showParticles) {
            const relE = Math.pow(this.temperature / 5778, 4);
            const particleSpeed = 1.0 + (this.temperature / 8000) * 1.2;
            // 10% 수준 입자 생성 (최대 2개 이하)
            const spawnProb = Math.min(0.3, 0.05 * Math.sqrt(relE));

            if (Math.random() < spawnProb && this.particles.length < 25) {
                const angle = Math.random() * Math.PI * 2;
                this.particles.push({
                    x: centerX + Math.cos(angle) * visualRadius,
                    y: centerY + Math.sin(angle) * visualRadius,
                    vx: Math.cos(angle) * particleSpeed,
                    vy: Math.sin(angle) * particleSpeed,
                    dist: 0,
                    maxDist: 60 + Math.random() * 80,
                    size: 1.2 + Math.random() * 1.8,
                    opacity: 0.8
                });
            }

            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.dist += particleSpeed;
                p.opacity = 0.8 * (1.0 - (p.dist / p.maxDist));

                if (p.opacity <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
                    this.particles.splice(i, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.opacity})`;
                ctx.shadowColor = starColor;
                ctx.shadowBlur = 6;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        // 3. 별 코로나 글로우
        const glowGrad = ctx.createRadialGradient(centerX, centerY, visualRadius * 0.8, centerX, centerY, visualRadius * 1.6);
        glowGrad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
        glowGrad.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`);
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(centerX, centerY, visualRadius * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // 4. 별 본체 구체
        const coreGrad = ctx.createRadialGradient(
            centerX - visualRadius * 0.3,
            centerY - visualRadius * 0.3,
            visualRadius * 0.1,
            centerX,
            centerY,
            visualRadius
        );
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.3, `rgb(${Math.min(255, rgb.r + 30)}, ${Math.min(255, rgb.g + 30)}, ${Math.min(255, rgb.b + 30)})`);
        coreGrad.addColorStop(0.8, starColor);
        coreGrad.addColorStop(1, `rgb(${Math.floor(rgb.r * 0.6)}, ${Math.floor(rgb.g * 0.6)}, ${Math.floor(rgb.b * 0.6)})`);

        ctx.beginPath();
        ctx.arc(centerX, centerY, visualRadius, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.shadowColor = starColor;
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;

        // 5. 중앙 라벨
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px "Noto Sans KR", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(isEn ? `Radius R = ${this.radiusRel.toFixed(2)} R☉` : `반지름 R = ${this.radiusRel.toFixed(2)} R☉`, centerX, centerY - 6);
        ctx.fillText(isEn ? `Surface Temp T = ${this.temperature.toLocaleString()} K` : `표면 온도 T = ${this.temperature.toLocaleString()} K`, centerX, centerY + 14);
        ctx.shadowBlur = 0;
    }

    updateUI() {
        const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
        const R_ratio = this.radiusRel;
        const T_ratio = this.temperature / 5778;

        const surfaceAreaRel = Math.pow(R_ratio, 2);
        const unitEnergyRel = Math.pow(T_ratio, 4);
        const lumRel = surfaceAreaRel * unitEnergyRel;

        const radiusValueBadge = document.getElementById('radiusValueBadge');
        const lumTempValueBadge = document.getElementById('lumTempValueBadge');
        const lumValue = document.getElementById('lumValue');
        const unitEnergyValue = document.getElementById('unitEnergyValue');
        const surfaceAreaValue = document.getElementById('surfaceAreaValue');
        const lumScaleTag = document.getElementById('lumScaleTag');

        if (radiusValueBadge) radiusValueBadge.innerHTML = `${R_ratio.toFixed(2)} R<sub>☉</sub>`;
        if (lumTempValueBadge) lumTempValueBadge.innerText = `${this.temperature.toLocaleString()} K`;

        const formatValue = (num) => {
            if (isEn) {
                if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
                if (num >= 10000) return `${(num / 1000).toFixed(1)}k`;
                if (num >= 100) return `${num.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
                if (num >= 10) return `${num.toFixed(1)}`;
                if (num >= 1) return `${num.toFixed(2)}`;
                return `${num.toFixed(3)}`;
            } else {
                if (num >= 1000000) return `${(num / 10000).toLocaleString(undefined, {maximumFractionDigits: 0})}만`;
                if (num >= 10000) return `${(num / 10000).toFixed(1)}만`;
                if (num >= 100) return `${num.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
                if (num >= 10) return `${num.toFixed(1)}`;
                if (num >= 1) return `${num.toFixed(2)}`;
                return `${num.toFixed(3)}`;
            }
        };

        const sunMultiple = isEn ? 'x Sun' : '배';
        const prefixSun = isEn ? '' : '태양의 ';
        if (lumValue) lumValue.innerHTML = `${formatValue(lumRel)} L<sub>☉</sub> (${prefixSun}${formatValue(lumRel)}${sunMultiple})`;
        if (unitEnergyValue) unitEnergyValue.innerHTML = `${formatValue(unitEnergyRel)} E<sub>☉</sub> (${prefixSun}${formatValue(unitEnergyRel)}${sunMultiple})`;
        if (surfaceAreaValue) surfaceAreaValue.innerHTML = `${formatValue(surfaceAreaRel)} S<sub>☉</sub> (${prefixSun}${formatValue(surfaceAreaRel)}${sunMultiple})`;

        if (lumScaleTag) lumScaleTag.innerHTML = isEn ? `Radius = ${R_ratio.toFixed(2)} R<sub>☉</sub> | Temp = ${this.temperature.toLocaleString()} K` : `반지름 = ${R_ratio.toFixed(2)} R<sub>☉</sub> | 온도 = ${this.temperature.toLocaleString()} K`;
    }
}

window.LuminositySim = LuminositySim;
