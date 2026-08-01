/* ==========================================================================
   별과 흑체 복사 - 플랑크 곡선 & 별의 색상 모듈 (Mobile & Touch Support)
   ========================================================================== */

class PlanckCurveSim {
    constructor() {
        this.canvas = document.getElementById('planckCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.tooltip = document.getElementById('planckTooltip');

        this.temperature = 5778; // 태양 표면 온도 (K)

        this.mouseX = -1;
        this.mouseY = -1;

        this.init();
    }

    init() {
        this.resize();
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            if (resizeTimer) cancelAnimationFrame(resizeTimer);
            resizeTimer = requestAnimationFrame(() => this.resize());
        });

        // 마우스 호버 이벤트
        const handleMove = (clientX, clientY) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = clientX - rect.left;
            this.mouseY = clientY - rect.top;
            this.render();
        };

        this.canvas.addEventListener('mousemove', (e) => {
            handleMove(e.clientX, e.clientY);
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouseX = -1;
            this.mouseY = -1;
            if (this.tooltip) this.tooltip.style.display = 'none';
            this.render();
        });

        // 터치 이벤트 지원 (모바일 드래그 호버)
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        this.canvas.addEventListener('touchend', () => {
            this.mouseX = -1;
            this.mouseY = -1;
            if (this.tooltip) this.tooltip.style.display = 'none';
            this.render();
        });
    }

    resize() {
        const box = this.canvas.parentElement;
        this.canvas.width = box.clientWidth;
        this.canvas.height = box.clientHeight;
        this.render();
    }

    setTemperature(temp) {
        this.temperature = Math.max(1000, Math.min(30000, temp));
        this.render();
        this.updateUI();
    }

    // 플랑크 상대 세기 연산 함수 I(lambda, T)
    calcIntensity(lambdaNm, tempK) {
        if (lambdaNm <= 0) return 0;
        const x = 14387.77 / (lambdaNm * (tempK / 1000));
        if (x > 700) return 0;
        const intensity = 1.0 / (Math.pow(lambdaNm, 5) * (Math.exp(x) - 1));
        return intensity;
    }

    // 최대 방출 세기 파장 (nm)
    calcPeakLambda(tempK) {
        return 2897772 / tempK;
    }

    // 켈빈 온도를 RGB 색상으로 변환
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

    render() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, width, height);

        const padding = { top: 35, right: 18, bottom: 42, left: 42 };
        const graphW = width - padding.left - padding.right;
        const graphH = height - padding.top - padding.bottom;

        const maxLambda = 3000;

        const lambdaToX = (lam) => padding.left + (lam / maxLambda) * graphW;
        const xToLambda = (x) => ((x - padding.left) / graphW) * maxLambda;

        // 1. 가시광선 무지개 배경 밴드 & 영역 구분
        const visX1 = lambdaToX(400);
        const visX2 = lambdaToX(700);

        ctx.fillStyle = 'rgba(168, 85, 247, 0.05)';
        ctx.fillRect(padding.left, padding.top, visX1 - padding.left, graphH);

        const visGrad = ctx.createLinearGradient(visX1, 0, visX2, 0);
        visGrad.addColorStop(0.00, 'rgba(147, 51, 234, 0.18)');
        visGrad.addColorStop(0.20, 'rgba(59, 130, 246, 0.18)');
        visGrad.addColorStop(0.40, 'rgba(16, 185, 129, 0.18)');
        visGrad.addColorStop(0.65, 'rgba(234, 179, 8, 0.18)');
        visGrad.addColorStop(1.00, 'rgba(239, 68, 68, 0.18)');
        ctx.fillStyle = visGrad;
        ctx.fillRect(visX1, padding.top, visX2 - visX1, graphH);

        ctx.fillStyle = 'rgba(244, 63, 94, 0.05)';
        ctx.fillRect(visX2, padding.top, padding.left + graphW - visX2, graphH);

        // 2. 그리드 선 & 라벨
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px "Noto Sans KR", sans-serif';
        ctx.textAlign = 'center';

        const ticksX = [0, 400, 700, 1000, 1500, 2000, 2500, 3000];
        ticksX.forEach(lam => {
            const x = lambdaToX(lam);
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, padding.top + graphH);
            ctx.stroke();

            ctx.fillText(`${lam}`, x, padding.top + graphH + 16);
        });

        const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
        ctx.fillText(isEn ? 'Wavelength (nm)' : '파장 (nm)', padding.left + graphW / 2, padding.top + graphH + 34);

        ctx.save();
        ctx.translate(12, padding.top + graphH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(isEn ? 'Relative Intensity' : '상대 세기', 0, 0);
        ctx.restore();

        // 3. 곡선 스케일링 스케일 파라미터 계산
        const curPeakLambda = this.calcPeakLambda(this.temperature);
        const curPeakIntensity = this.calcIntensity(curPeakLambda, this.temperature);

        let scaleMaxInt = this.calcIntensity(this.calcPeakLambda(5778), 5778) * 3.5;
        if (this.temperature > 8000) {
            scaleMaxInt = curPeakIntensity * 1.25;
        }

        const intensityToY = (val) => {
            const ratio = val / scaleMaxInt;
            return padding.top + graphH - Math.min(graphH, ratio * graphH);
        };

        // 4. 현재 온도 플랑크 곡선 렌더링
        const curRgb = this.kelvinToRGB(this.temperature);
        const curveColor = `rgb(${curRgb.r}, ${curRgb.g}, ${curRgb.b})`;

        const fillGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + graphH);
        fillGrad.addColorStop(0, `rgba(${curRgb.r}, ${curRgb.g}, ${curRgb.b}, 0.35)`);
        fillGrad.addColorStop(1, `rgba(${curRgb.r}, ${curRgb.g}, ${curRgb.b}, 0.02)`);

        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top + graphH);

        for (let xPixel = 0; xPixel <= graphW; xPixel += 2) {
            const lam = xToLambda(padding.left + xPixel);
            const intensity = this.calcIntensity(lam, this.temperature);
            const yPixel = intensityToY(intensity);
            ctx.lineTo(padding.left + xPixel, yPixel);
        }
        ctx.lineTo(padding.left + graphW, padding.top + graphH);
        ctx.closePath();
        ctx.fillStyle = fillGrad;
        ctx.fill();

        ctx.beginPath();
        for (let xPixel = 0; xPixel <= graphW; xPixel += 2) {
            const lam = xToLambda(padding.left + xPixel);
            const intensity = this.calcIntensity(lam, this.temperature);
            const yPixel = intensityToY(intensity);

            if (xPixel === 0) ctx.moveTo(padding.left + xPixel, yPixel);
            else ctx.lineTo(padding.left + xPixel, yPixel);
        }
        ctx.lineWidth = 3;
        ctx.strokeStyle = curveColor;
        ctx.shadowColor = curveColor;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 5. 최대 방출 파장 피크 마커 (캔버스 좌우 경계 넘침 방지 바운딩)
        const peakX = lambdaToX(curPeakLambda);
        const peakY = intensityToY(curPeakIntensity);

        if (peakX >= padding.left && peakX <= padding.left + graphW) {
            ctx.beginPath();
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.moveTo(peakX, padding.top + graphH);
            ctx.lineTo(peakX, peakY);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.arc(peakX, peakY, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = curveColor;
            ctx.stroke();

            // 텍스트 위치를 캔버스 안으로 제한 (Clamping)
            const textStr = `λmax = ${curPeakLambda.toFixed(1)} nm (${this.temperature.toLocaleString()}K)`;
            ctx.font = 'bold 11px "Noto Sans KR", sans-serif';
            const textWidth = ctx.measureText(textStr).width;
            
            const clampedTextX = Math.max(padding.left + textWidth / 2 + 5, Math.min(width - padding.right - textWidth / 2 - 5, peakX));
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            const tagY = Math.max(padding.top + 14, peakY - 12);
            ctx.fillText(textStr, clampedTextX, tagY);
        }

        // 6. 호버 가이드 (터치 포함)
        if (this.mouseX >= padding.left && this.mouseX <= padding.left + graphW &&
            this.mouseY >= padding.top && this.mouseY <= padding.top + graphH) {

            const hoverLam = xToLambda(this.mouseX);
            const hoverIntensity = this.calcIntensity(hoverLam, this.temperature);
            const hoverY = intensityToY(hoverIntensity);

            ctx.beginPath();
            ctx.strokeStyle = 'rgba(34, 211, 238, 0.7)';
            ctx.setLineDash([2, 2]);
            ctx.moveTo(this.mouseX, padding.top);
            ctx.lineTo(this.mouseX, padding.top + graphH);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.arc(this.mouseX, hoverY, 4, 0, Math.PI * 2);
            ctx.fillStyle = 'var(--accent-cyan)';
            ctx.fill();

            const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
            const region = hoverLam < 400 ? '자외선(UV)' : (hoverLam > 700 ? '적외선(IR)' : '가시광선');
            if (this.tooltip) {
                const regStr = isEn ? (hoverLam < 400 ? 'UV' : (hoverLam > 700 ? 'IR' : 'Visible')) : region;
                const waveLbl = isEn ? 'Wavelength' : '파장';
                const regLbl = isEn ? 'Region' : '영역';
                this.tooltip.style.display = 'block';
                this.tooltip.style.left = `${Math.min(width - 120, Math.max(10, this.mouseX + 10))}px`;
                this.tooltip.style.top = `${Math.max(10, this.mouseY - 35)}px`;
                this.tooltip.innerHTML = `${waveLbl}: <strong>${hoverLam.toFixed(1)} nm</strong><br>${regLbl}: ${regStr}`;
            }
        }
    }

    updateUI() {
        const peakLam = this.calcPeakLambda(this.temperature);
        const rgb = this.kelvinToRGB(this.temperature);

        const lambdaBadge = document.getElementById('wienLambdaVal');
        const regionBadge = document.getElementById('wienRegion');
        const starCore = document.getElementById('starCore');
        const starGlowRing = document.getElementById('starGlowRing');
        const starColorName = document.getElementById('starColorName');
        const starSpectralType = document.getElementById('starSpectralType');
        const planckEVal = document.getElementById('planckEVal');

        if (lambdaBadge) lambdaBadge.innerText = `${peakLam.toFixed(1)} nm`;

        const isEn = (localStorage.getItem('sci-lab-lang') === 'en');

        let regionTxt = isEn ? 'Visible Light' : '가시광선';
        if (peakLam < 400) regionTxt = isEn ? 'Ultraviolet (UV)' : '자외선 (UV)';
        else if (peakLam > 700) regionTxt = isEn ? 'Infrared (IR)' : '적외선 (IR)';
        else {
            if (peakLam < 450) regionTxt = isEn ? 'Visible (Violet/Blue)' : '가시광선 (보라/파랑)';
            else if (peakLam < 520) regionTxt = isEn ? 'Visible (Cyan/Green)' : '가시광선 (청록/녹색)';
            else if (peakLam < 600) regionTxt = isEn ? 'Visible (Yellow/Orange)' : '가시광선 (노랑/주황)';
            else regionTxt = isEn ? 'Visible (Red)' : '가시광선 (빨강)';
        }
        if (regionBadge) regionBadge.innerText = regionTxt;

        const colorStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        if (starCore) starCore.style.backgroundColor = colorStr;
        if (starGlowRing) {
            starGlowRing.style.boxShadow = `0 0 25px ${colorStr}`;
            starGlowRing.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
        }

        let specType = isEn ? 'Type O (Ultra-hot)' : 'O형 (극고온 별)';
        let colorName = isEn ? 'Blue Star' : '청색 별';
        if (this.temperature < 3700) { specType = isEn ? 'Type M (Red Giant/Dwarf)' : 'M형 (적색 거성/왜성)'; colorName = isEn ? 'Red Star' : '붉은색 별'; }
        else if (this.temperature < 5200) { specType = isEn ? 'Type K Star' : 'K형 별'; colorName = isEn ? 'Orange Star' : '주황색 별'; }
        else if (this.temperature < 6000) { specType = isEn ? 'Type G (Sun)' : 'G형 (태양)'; colorName = isEn ? 'Yellow Star' : '황색 별'; }
        else if (this.temperature < 7500) { specType = isEn ? 'Type F Star' : 'F형 별'; colorName = isEn ? 'Yellow-White Star' : '황백색 별'; }
        else if (this.temperature < 10000) { specType = isEn ? 'Type A Star' : 'A형 별'; colorName = isEn ? 'White Star' : '백색 별'; }
        else if (this.temperature < 30000) { specType = isEn ? 'Type B (Rigel-class)' : 'B형 (리겔급)'; colorName = isEn ? 'Blue-White Star' : '청백색 별'; }

        if (starColorName) starColorName.innerText = colorName;
        if (starSpectralType) starSpectralType.innerText = isEn ? `Spectral Class ${specType}` : `분광형 ${specType}`;

        const relE = Math.pow(this.temperature / 5778, 4);
        if (planckEVal) {
            if (relE >= 10000) planckEVal.innerHTML = isEn ? `${(relE / 10000).toFixed(1)}0k E<sub>☉</sub>` : `${(relE / 10000).toFixed(1)}만 E<sub>☉</sub>`;
            else planckEVal.innerHTML = `${relE < 100 ? relE.toFixed(2) : relE.toFixed(0)} E<sub>☉</sub>`;
        }
    }
}

window.PlanckCurveSim = PlanckCurveSim;
