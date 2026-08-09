/**
 * H-R도표 및 별의 진화 시뮬레이터 - 항성 상대적 크기 비교 샌드박스
 */

class StarScaleVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // 비교 대상 기본 세트 (반경 단위: R_sun, 지구는 ~0.00915 R_sun)
        this.bodies = [
            { name: '지구 (Earth)', rRatio: 0.00915, color: '#38bdf8', icon: '🌍' },
            { name: '태양 (Sun)', rRatio: 1.0, color: '#fff4ea', icon: '☀️' },
            { name: '시리우스 A', rRatio: 1.71, color: '#cad7ff', icon: '⭐' },
            { name: '알데바란', rRatio: 44.1, color: '#ffaa66', icon: '🟠' },
            { name: '리겔', rRatio: 78.9, color: '#9bb0ff', icon: '🔵' },
            { name: '베텔게우스', rRatio: 764.0, color: '#ff7755', icon: '🔴' }
        ];

        this.zoomLevel = 1.0; // Zoom multiplier (0.1x ~ 100x)

        this.initResize();
    }

    initResize() {
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

        window.addEventListener('resize', resize);
        setTimeout(resize, 50);
    }

    setZoom(zoom) {
        this.zoomLevel = zoom;
        this.render();
    }

    render() {
        if (!this.cssWidth || !this.cssHeight) return;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);

        const cy = this.cssHeight * 0.55;
        const totalCount = this.bodies.length;
        const spacing = this.cssWidth / (totalCount + 1);

        // 가장 큰 비교 대상 기준 자동 픽셀 스케일 계산
        const maxR = Math.max(...this.bodies.map(b => b.rRatio));
        const maxAllowedPx = Math.min(this.cssWidth * 0.35, this.cssHeight * 0.45);
        const basePxPerR = (maxAllowedPx / maxR) * this.zoomLevel;

        ctx.save();
        ctx.textAlign = 'center';

        this.bodies.forEach((b, i) => {
            const cx = spacing * (i + 1);
            
            // 그리기 반경 계산 (최소 1.5px 표시 보장)
            const drawR = Math.max(1.5, b.rRatio * basePxPerR);

            // 후광 글로우
            if (drawR > 3) {
                const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, drawR * 1.6);
                glowGrad.addColorStop(0, b.color);
                glowGrad.addColorStop(0.5, b.color);
                glowGrad.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.fillStyle = glowGrad;
                ctx.beginPath();
                ctx.arc(cx, cy, drawR * 1.6, 0, Math.PI * 2);
                ctx.fill();
            }

            // 본체
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(cx, cy, drawR, 0, Math.PI * 2);
            ctx.fill();

            // 라벨 및 수치
            ctx.font = 'bold 12px "Outfit", "Noto Sans KR", sans-serif';
            ctx.fillStyle = '#f8fafc';
            ctx.fillText(b.name, cx, cy - drawR - 18);

            ctx.font = '11px "Inter", sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`R = ${b.rRatio >= 1 ? b.rRatio.toLocaleString() : b.rRatio} R☉`, cx, cy - drawR - 4);
        });

        ctx.restore();
    }
}

if (typeof window !== 'undefined') {
    window.StarScaleVisualizer = StarScaleVisualizer;
}
