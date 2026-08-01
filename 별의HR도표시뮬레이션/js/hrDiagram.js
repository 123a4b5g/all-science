/**
 * H-R도표 및 별의 진화 시뮬레이터 - H-R Diagram Canvas 렌더러
 */

class HRDiagramRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // 그래프축 범위 정의 (대수축)
        this.minTemp = 2000;    // K (오른쪽)
        this.maxTemp = 45000;   // K (왼쪽 - 대수 역축)
        this.minLum = 0.00001;  // L_sun (아래)
        this.maxLum = 1000000;  // L_sun (위)

        this.margin = { top: 40, right: 60, bottom: 65, left: 75 };
        
        // 별 데이터 및 필터 목록
        this.starNodes = [];
        this.activeStars = HR_DATA.famousStars;
        this.hoveredNode = null;
        this.selectedNode = null;

        // 등반경선 비활성화 (사용자 요청)
        this.showIsoradius = false;

        // 진화 트랙 데이터
        this.activeTrack = null;
        this.currentStagePoint = null;
        this.trackProgress = 0; // 0 ~ 1

        this.onStarSelectCallback = null;

        this.initResize();
        this.bindEvents();
    }

    initResize() {
        let resizeTimer = null;
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.cssWidth = rect.width;
            this.cssHeight = rect.height;
            this.render();
        };

        window.addEventListener('resize', () => {
            if (resizeTimer) cancelAnimationFrame(resizeTimer);
            resizeTimer = requestAnimationFrame(resize);
        });
        setTimeout(resize, 50);
    }

    setFilteredStars(stars) {
        this.activeStars = stars;
        this.render();
    }

    // 좌표 변환: 온도는 왼쪽이 고온(maxTemp), 오른쪽이 저온(minTemp)
    tempToX(temp) {
        const plotWidth = this.cssWidth - this.margin.left - this.margin.right;
        const logMin = Math.log10(this.minTemp);
        const logMax = Math.log10(this.maxTemp);
        const logT = Math.log10(Math.max(this.minTemp, Math.min(this.maxTemp, temp)));
        return this.margin.left + (1 - (logT - logMin) / (logMax - logMin)) * plotWidth;
    }

    // 좌표 변환: 광도는 아래가 low, 위가 high
    lumToY(lum) {
        const plotHeight = this.cssHeight - this.margin.top - this.margin.bottom;
        const logMin = Math.log10(this.minLum);
        const logMax = Math.log10(this.maxLum);
        const logL = Math.log10(Math.max(this.minLum, Math.min(this.maxLum, lum)));

        return this.cssHeight - this.margin.bottom - ((logL - logMin) / (logMax - logMin)) * plotHeight;
    }

    render() {
        if (!this.cssWidth || !this.cssHeight) return;

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);

        // 1. 배경 영역 하이라이트 (주계열, 적색거성, 백색왜성 구역)
        this.drawBackgroundRegions(ctx);

        // 2. 축 및 눈금, 분광형 색상 밴드 렌더링
        this.drawAxes(ctx);

        // 3. 유명 관측 별 렌더링
        this.drawFamousStars(ctx);

        // 4. 활성화된 진화 궤적 (Evolution Track) 렌더링
        this.drawEvolutionTrack(ctx);

        // 5. 툴팁 & 호버 디스플레이
        this.drawHoverTooltip(ctx);
    }

    drawBackgroundRegions(ctx) {
        ctx.save();
        ctx.beginPath();
        const msPoints = [
            { t: 40000, l: 300000 },
            { t: 30000, l: 50000 },
            { t: 15000, l: 600 },
            { t: 9500,  l: 35 },
            { t: 6000,  l: 1.2 },
            { t: 3800,  l: 0.03 },
            { t: 2600,  l: 0.0008 },
            { t: 2400,  l: 0.0001 },
            { t: 3500,  l: 0.005 },
            { t: 5500,  l: 0.4 },
            { t: 8500,  l: 10 },
            { t: 14000, l: 150 },
            { t: 28000, l: 10000 },
            { t: 38000, l: 80000 }
        ];

        ctx.moveTo(this.tempToX(msPoints[0].t), this.lumToY(msPoints[0].l));
        for (let i = 1; i < msPoints.length; i++) {
            ctx.lineTo(this.tempToX(msPoints[i].t), this.lumToY(msPoints[i].l));
        }
        ctx.closePath();
        
        const msGrad = ctx.createLinearGradient(
            this.tempToX(35000), this.lumToY(100000),
            this.tempToX(3000), this.lumToY(0.001)
        );
        msGrad.addColorStop(0, 'rgba(155, 176, 255, 0.15)');
        msGrad.addColorStop(0.5, 'rgba(255, 244, 234, 0.15)');
        msGrad.addColorStop(1, 'rgba(255, 153, 102, 0.15)');
        ctx.fillStyle = msGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = '12px "Outfit", sans-serif';
        ctx.fillStyle = 'rgba(255, 120, 102, 0.4)';
        ctx.fillText('적색 초거성 (Red Supergiants)', this.tempToX(4200), this.lumToY(150000));
        ctx.fillText('적색 거성 (Red Giants)', this.tempToX(4000), this.lumToY(500));
        
        ctx.fillStyle = 'rgba(150, 180, 255, 0.4)';
        ctx.fillText('백색 왜성 (White Dwarfs)', this.tempToX(22000), this.lumToY(0.0003));
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillText('주계열성 (Main Sequence)', this.tempToX(8000), this.lumToY(8));
        ctx.restore();
    }

    drawAxes(ctx) {
        const plotWidth = this.cssWidth - this.margin.left - this.margin.right;
        const plotHeight = this.cssHeight - this.margin.top - this.margin.bottom;
        const leftX = this.margin.left;
        const rightX = this.cssWidth - this.margin.right;
        const topY = this.margin.top;
        const bottomY = this.cssHeight - this.margin.bottom;

        ctx.save();

        const bandY = bottomY + 28;
        const bandHeight = 8;
        const specGrad = ctx.createLinearGradient(leftX, 0, rightX, 0);
        specGrad.addColorStop(0.00, '#9bb0ff');
        specGrad.addColorStop(0.20, '#aabfff');
        specGrad.addColorStop(0.40, '#cad7ff');
        specGrad.addColorStop(0.55, '#f8f7ff');
        specGrad.addColorStop(0.70, '#fff4ea');
        specGrad.addColorStop(0.85, '#ffd2a1');
        specGrad.addColorStop(1.00, '#ff9966');
        
        ctx.fillStyle = specGrad;
        ctx.fillRect(leftX, bandY, plotWidth, bandHeight);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.strokeRect(leftX, bandY, plotWidth, bandHeight);

        ctx.font = 'bold 12px "Outfit", sans-serif';
        HR_DATA.spectralTypes.forEach(st => {
            const midTemp = Math.sqrt(st.minTemp * st.maxTemp);
            const sx = this.tempToX(midTemp);
            if (sx >= leftX && sx <= rightX) {
                ctx.fillStyle = st.color;
                ctx.fillText(st.type, sx - 4, bandY + 22);
            }
        });

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.strokeRect(leftX, topY, plotWidth, plotHeight);

        ctx.font = '11px "Inter", sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'center';

        const tempTicks = [40000, 30000, 20000, 10000, 7500, 6000, 5000, 4000, 3000];
        tempTicks.forEach(t => {
            const tx = this.tempToX(t);
            if (tx >= leftX && tx <= rightX) {
                ctx.beginPath();
                ctx.moveTo(tx, bottomY);
                ctx.lineTo(tx, bottomY + 5);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.stroke();

                ctx.fillText(t.toLocaleString(), tx, bottomY + 18);

                ctx.beginPath();
                ctx.moveTo(tx, topY);
                ctx.lineTo(tx, bottomY);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.stroke();
            }
        });

        ctx.font = 'bold 13px "Outfit", sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('← 표면 온도 T (Kelvin, 대수 역축)', leftX + plotWidth / 2, bottomY + 55);

        ctx.textAlign = 'right';
        ctx.font = '11px "Inter", sans-serif';

        const lumTicks = [1000000, 10000, 100, 1, 0.01, 0.0001, 0.00001];
        lumTicks.forEach(l => {
            const ly = this.lumToY(l);
            if (ly >= topY && ly <= bottomY) {
                ctx.beginPath();
                ctx.moveTo(leftX - 5, ly);
                ctx.lineTo(leftX, ly);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.stroke();

                let labelStr = l >= 1 ? `10^${Math.log10(l)}` : `10^${Math.log10(l)}`;
                if (l === 1) labelStr = '1 (태양)';
                ctx.fillText(labelStr, leftX - 10, ly + 4);

                ctx.beginPath();
                ctx.moveTo(leftX, ly);
                ctx.lineTo(rightX, ly);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.stroke();
            }
        });

        ctx.save();
        ctx.translate(leftX - 52, topY + plotHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.font = 'bold 13px "Outfit", sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('광도 L / L☉ (대수 축)', 0, 0);
        ctx.restore();

        ctx.textAlign = 'left';
        const magTicks = [-10, -5, 0, 5, 10, 15];
        magTicks.forEach(mag => {
            const logL = (4.83 - mag) / 2.5;
            const l = Math.pow(10, logL);
            const my = this.lumToY(l);
            if (my >= topY && my <= bottomY) {
                ctx.beginPath();
                ctx.moveTo(rightX, my);
                ctx.lineTo(rightX + 5, my);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.stroke();

                ctx.fillText(`${mag > 0 ? '+' : ''}${mag}`, rightX + 10, my + 4);
            }
        });

        ctx.save();
        ctx.translate(rightX + 45, topY + plotHeight / 2);
        ctx.rotate(Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.font = 'bold 12px "Outfit", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('절대 등급 (M_v)', 0, 0);
        ctx.restore();

        ctx.restore();
    }

    drawFamousStars(ctx) {
        this.starNodes = [];

        (this.activeStars || HR_DATA.famousStars).forEach(star => {
            const x = this.tempToX(star.temp);
            const y = this.lumToY(star.luminosity);

            const r = Math.max(4, Math.min(14, 4 + Math.log10(star.radius + 1) * 3));

            this.starNodes.push({
                x, y, r, star
            });

            ctx.save();
            
            const isHovered = (this.hoveredNode && this.hoveredNode.star === star);
            const isSelected = (this.selectedNode && this.selectedNode.star === star);

            const glowR = isHovered || isSelected ? r * 2.5 : r * 1.5;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, glowR);
            grad.addColorStop(0, star.color);
            grad.addColorStop(0.4, star.color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, glowR, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, Math.max(2, r * 0.4), 0, Math.PI * 2);
            ctx.fill();

            if (isSelected) {
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.arc(x, y, r + 5, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.restore();
        });
    }

    setEvolutionTrack(track, progress = 0) {
        this.activeTrack = track;
        this.trackProgress = progress;
        this.render();
    }

    drawEvolutionTrack(ctx) {
        if (!this.activeTrack || !this.activeTrack.stages || this.activeTrack.stages.length < 2) return;

        ctx.save();
        const stages = this.activeTrack.stages;

        ctx.beginPath();
        const startX = this.tempToX(stages[0].temp);
        const startY = this.lumToY(stages[0].lum);
        ctx.moveTo(startX, startY);

        for (let i = 1; i < stages.length; i++) {
            const sx = this.tempToX(stages[i].temp);
            const sy = this.lumToY(stages[i].lum);
            ctx.lineTo(sx, sy);
        }

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        stages.forEach((stg, idx) => {
            const nx = this.tempToX(stg.temp);
            const ny = this.lumToY(stg.lum);

            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(nx, ny, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = '10px "Outfit", sans-serif';
            ctx.fillStyle = '#93c5fd';
            ctx.fillText(`${idx + 1}. ${stg.name.split(' ')[0]}`, nx + 6, ny - 6);
        });

        const curr = this.getCurrentTrackPoint(this.trackProgress);
        if (curr) {
            const cx = curr.x !== undefined ? curr.x : this.tempToX(curr.temp);
            const cy = curr.y !== undefined ? curr.y : this.lumToY(curr.lum);
            this.currentStagePoint = { ...curr, x: cx, y: cy };

            const pGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
            pGrad.addColorStop(0, '#ffffff');
            pGrad.addColorStop(0.3, '#f59e0b');
            pGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.5)');
            pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, 18, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, 10 + Math.sin(Date.now() / 150) * 3, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    getCurrentTrackPoint(progress) {
        if (!this.activeTrack) return null;
        const stages = this.activeTrack.stages;
        
        if (progress <= 0) {
            const s0 = stages[0];
            return { ...s0, x: this.tempToX(s0.temp), y: this.lumToY(s0.lum) };
        }
        if (progress >= 1) {
            const sLast = stages[stages.length - 1];
            return { ...sLast, x: this.tempToX(sLast.temp), y: this.lumToY(sLast.lum) };
        }

        for (let i = 0; i < stages.length - 1; i++) {
            const s1 = stages[i];
            const s2 = stages[i + 1];
            if (progress >= s1.timeRatio && progress <= s2.timeRatio) {
                const segRatio = (progress - s1.timeRatio) / (s2.timeRatio - s1.timeRatio || 0.0001);
                
                const logT1 = Math.log10(s1.temp);
                const logT2 = Math.log10(s2.temp);
                const logTemp = logT1 + segRatio * (logT2 - logT1);

                const logL1 = Math.log10(s1.lum);
                const logL2 = Math.log10(s2.lum);
                const logLum = logL1 + segRatio * (logL2 - logL1);

                const rRatio = s1.rRatio + segRatio * (s2.rRatio - s1.rRatio);

                // 캔버스 점선(선분) 상의 픽셀 좌표를 직접 보간하여 오차/이탈 현상 완벽 방지
                const x1 = this.tempToX(s1.temp);
                const y1 = this.lumToY(s1.lum);
                const x2 = this.tempToX(s2.temp);
                const y2 = this.lumToY(s2.lum);

                const cx = x1 + segRatio * (x2 - x1);
                const cy = y1 + segRatio * (y2 - y1);

                return {
                    x: cx,
                    y: cy,
                    temp: Math.pow(10, logTemp),
                    lum: Math.pow(10, logLum),
                    name: s2.name,
                    core: s2.core,
                    rRatio: rRatio,
                    desc: s2.desc,
                    effect: s2.effect || s1.effect,
                    finalState: s2.finalState
                };
            }
        }
        const sLast = stages[stages.length - 1];
        return { ...sLast, x: this.tempToX(sLast.temp), y: this.lumToY(sLast.lum) };
    }

    drawHoverTooltip(ctx) {
        if (!this.hoveredNode) return;
        const node = this.hoveredNode;
        const star = node.star;

        ctx.save();
        const boxWidth = 220;
        const boxHeight = 115;
        let bx = node.x + 15;
        let by = node.y - 40;

        if (bx + boxWidth > this.cssWidth - 10) bx = node.x - boxWidth - 15;
        if (by + boxHeight > this.cssHeight - 10) by = this.cssHeight - boxHeight - 10;
        if (by < 10) by = 10;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.roundRect(bx, by, boxWidth, boxHeight, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 13px "Outfit", sans-serif';
        ctx.fillText(star.name, bx + 12, by + 22);

        ctx.font = '11px "Inter", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`분류: ${star.category} (${star.spectral})`, bx + 12, by + 40);

        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`표면 온도: ${star.temp.toLocaleString()} K`, bx + 12, by + 58);
        ctx.fillText(`광도: ${star.luminosity} L☉ | 절대등급: ${star.absMag}`, bx + 12, by + 74);
        ctx.fillText(`반경: ${star.radius} R☉ | 질량: ${star.mass} M☉`, bx + 12, by + 90);

        ctx.restore();
    }

    bindEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            let found = null;
            for (const node of this.starNodes) {
                const dist = Math.hypot(mouseX - node.x, mouseY - node.y);
                if (dist <= node.r + 6) {
                    found = node;
                    break;
                }
            }

            if (this.hoveredNode !== found) {
                this.hoveredNode = found;
                this.canvas.style.cursor = found ? 'pointer' : 'default';
                this.render();
            }
        });

        this.canvas.addEventListener('click', () => {
            if (this.hoveredNode) {
                this.selectedNode = this.hoveredNode;
                this.render();
                if (this.onStarSelectCallback) {
                    this.onStarSelectCallback(this.hoveredNode.star);
                }
            }
        });
    }
}

if (typeof window !== 'undefined') {
    window.HRDiagramRenderer = HRDiagramRenderer;
}
