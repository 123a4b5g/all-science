/* ==========================================================================
   별과 흑체 복사 - 유명 항성 탐구 & 2체 비교 모듈
   ========================================================================== */

class StarComparisonSim {
    constructor() {
        this.canvas = document.getElementById('compCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 유명 실측 항성 정밀 데이터베이스
        this.starsData = {
            sun: {
                name: '태양 (Sun)',
                type: '황색 주계열성 (G2V)',
                temp: 5778,
                radius: 1.0,
                lum: 1.0,
                mag: 4.83
            },
            betelgeuse: {
                name: '베텔게우스 (Betelgeuse)',
                type: '붉은색 초거성 (M1Ia-ab)',
                temp: 3500,
                radius: 764.0,
                lum: 126000.0,
                mag: -5.85
            },
            rigel: {
                name: '리겔 (Rigel)',
                type: '청백색 초거성 (B8Ia)',
                temp: 12100,
                radius: 78.9,
                lum: 120000.0,
                mag: -7.84
            },
            siriusA: {
                name: '시리우스 A (Sirius A)',
                type: '백색 주계열성 (A1V)',
                temp: 9940,
                radius: 1.71,
                lum: 25.4,
                mag: 1.42
            },
            siriusB: {
                name: '시리우스 B (Sirius B)',
                type: '백색왜성 (DA2)',
                temp: 25200,
                radius: 0.0084,
                lum: 0.056,
                mag: 11.18
            },
            aldebaran: {
                name: '알데바란 (Aldebaran)',
                type: '주황색/적색 거성 (K5III)',
                temp: 3900,
                radius: 44.1,
                lum: 439.0,
                mag: -0.63
            },
            spica: {
                name: '스피카 (Spica)',
                type: '청색 거성 (B1III-IV)',
                temp: 25300,
                radius: 7.47,
                lum: 20500.0,
                mag: -3.55
            },
            proxima: {
                name: '프록시마 센타우리',
                type: '적색 왜성 (M5.5Ve)',
                temp: 3042,
                radius: 0.15,
                lum: 0.0017,
                mag: 15.6
            }
        };

        this.starAKey = 'sun';
        this.starBKey = 'rigel';

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const box = this.canvas.parentElement;
        this.canvas.width = box.clientWidth;
        this.canvas.height = box.clientHeight;
        this.render();
    }

    setStarA(key) {
        if (this.starsData[key]) {
            this.starAKey = key;
            this.updateUI();
            this.render();
        }
    }

    setStarB(key) {
        if (this.starsData[key]) {
            this.starBKey = key;
            this.updateUI();
            this.render();
        }
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

    calcIntensity(lambdaNm, tempK) {
        if (lambdaNm <= 0) return 0;
        const x = 14387.77 / (lambdaNm * (tempK / 1000));
        if (x > 700) return 0;
        return 1.0 / (Math.pow(lambdaNm, 5) * (Math.exp(x) - 1));
    }

    calcWienPeak(tempK) {
        return 2897772 / tempK;
    }

    render() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, width, height);

        const starA = this.starsData[this.starAKey];
        const starB = this.starsData[this.starBKey];

        const padding = { top: 35, right: 25, bottom: 40, left: 50 };
        const graphW = width - padding.left - padding.right;
        const graphH = height - padding.top - padding.bottom;

        const maxLambda = 3000;

        const lambdaToX = (lam) => padding.left + (lam / maxLambda) * graphW;
        const xToLambda = (x) => ((x - padding.left) / graphW) * maxLambda;

        // 가시광선 영역 스펙트럼 밴드
        const visX1 = lambdaToX(400);
        const visX2 = lambdaToX(700);

        const visGrad = ctx.createLinearGradient(visX1, 0, visX2, 0);
        visGrad.addColorStop(0, 'rgba(147, 51, 234, 0.12)');
        visGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.12)');
        visGrad.addColorStop(1, 'rgba(239, 68, 68, 0.12)');
        ctx.fillStyle = visGrad;
        ctx.fillRect(visX1, padding.top, visX2 - visX1, graphH);

        // 그리드 라인
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.font = '11px "Noto Sans KR", sans-serif';
        ctx.fillStyle = '#94a3b8';
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
        ctx.fillText(isEn ? 'Wavelength (nm)' : '파장 (nm)', padding.left + graphW / 2, padding.top + graphH + 32);

        // 피크 높이 스케일링
        const peakIntA = this.calcIntensity(this.calcWienPeak(starA.temp), starA.temp);
        const peakIntB = this.calcIntensity(this.calcWienPeak(starB.temp), starB.temp);
        const maxPeak = Math.max(peakIntA, peakIntB);

        const intensityToY = (val) => {
            const ratio = val / (maxPeak * 1.15);
            return padding.top + graphH - Math.min(graphH, ratio * graphH);
        };

        // 1. Star A 곡선 (Cyan)
        ctx.beginPath();
        for (let xPixel = 0; xPixel <= graphW; xPixel += 2) {
            const lam = xToLambda(padding.left + xPixel);
            const intensity = this.calcIntensity(lam, starA.temp);
            const yPixel = intensityToY(intensity);

            if (xPixel === 0) ctx.moveTo(padding.left + xPixel, yPixel);
            else ctx.lineTo(padding.left + xPixel, yPixel);
        }
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#22d3ee';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 2. Star B 곡선 (Rose)
        ctx.beginPath();
        for (let xPixel = 0; xPixel <= graphW; xPixel += 2) {
            const lam = xToLambda(padding.left + xPixel);
            const intensity = this.calcIntensity(lam, starB.temp);
            const yPixel = intensityToY(intensity);

            if (xPixel === 0) ctx.moveTo(padding.left + xPixel, yPixel);
            else ctx.lineTo(padding.left + xPixel, yPixel);
        }
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 범례
        ctx.font = 'bold 12px "Noto Sans KR", sans-serif';
        ctx.textAlign = 'left';

        const nameAStr = isEn ? (starA.name.includes('(') ? starA.name.split('(')[1].replace(')', '').trim() : starA.name) : starA.name;
        const nameBStr = isEn ? (starB.name.includes('(') ? starB.name.split('(')[1].replace(')', '').trim() : starB.name) : starB.name;

        // Star A
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(padding.left + 15, padding.top + 15, 12, 12);
        ctx.fillText(`${nameAStr} (${starA.temp.toLocaleString()}K)`, padding.left + 34, padding.top + 25);

        // Star B
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(padding.left + 15, padding.top + 35, 12, 12);
        ctx.fillText(`${nameBStr} (${starB.temp.toLocaleString()}K)`, padding.left + 34, padding.top + 45);
    }

    updateUI() {
        const isEn = (localStorage.getItem('sci-lab-lang') === 'en');
        const starA = this.starsData[this.starAKey];
        const starB = this.starsData[this.starBKey];

        const rgbA = this.kelvinToRGB(starA.temp);
        const rgbB = this.kelvinToRGB(starB.temp);

        const formatValue = (num) => {
            if (isEn) {
                if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
                if (num >= 10000) return `${(num / 1000).toFixed(1)}k`;
                if (num >= 100) return `${num.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
                if (num >= 1) return `${num.toFixed(2)}`;
                return `${num.toFixed(3)}`;
            } else {
                if (num >= 100000) return `${(num / 10000).toLocaleString(undefined, {maximumFractionDigits: 0})}만`;
                if (num >= 10000) return `${(num / 10000).toFixed(1)}만`;
                if (num >= 100) return `${num.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
                if (num >= 1) return `${num.toFixed(2)}`;
                return `${num.toFixed(3)}`;
            }
        };

        const translateType = (typeStr) => {
            if (!isEn) return typeStr;
            return typeStr.replace('황색 주계열성', 'Yellow Main Sequence')
                          .replace('붉은색 초거성', 'Red Supergiant')
                          .replace('청백색 초거성', 'Blue-White Supergiant')
                          .replace('백색 주계열성', 'White Main Sequence')
                          .replace('백색왜성', 'White Dwarf')
                          .replace('주황색/적색 거성', 'Orange/Red Giant')
                          .replace('청색 거성', 'Blue Giant')
                          .replace('적색 왜성', 'Red Dwarf');
        };

        const nameAStr = isEn ? (starA.name.includes('(') ? starA.name.split('(')[1].replace(')', '').trim() : starA.name) : starA.name;
        const nameBStr = isEn ? (starB.name.includes('(') ? starB.name.split('(')[1].replace(')', '').trim() : starB.name) : starB.name;

        // Star A UI
        document.getElementById('nameA').innerText = nameAStr;
        document.getElementById('typeA').innerText = translateType(starA.type);
        document.getElementById('tempA').innerText = `${starA.temp.toLocaleString()} K`;
        document.getElementById('radA').innerHTML = `${starA.radius.toFixed(2)} R<sub>☉</sub>`;
        document.getElementById('lambdaA').innerText = `${this.calcWienPeak(starA.temp).toFixed(1)} nm`;

        const energyRelA = Math.pow(starA.temp / 5778, 4);
        document.getElementById('energyA').innerHTML = `${formatValue(energyRelA)} E<sub>☉</sub>`;
        document.getElementById('lumA').innerHTML = `${formatValue(starA.lum)} L<sub>☉</sub>`;

        const coreA = document.getElementById('coreA');
        const glowA = document.getElementById('glowA');
        if (coreA) coreA.style.backgroundColor = `rgb(${rgbA.r}, ${rgbA.g}, ${rgbA.b})`;
        if (glowA) glowA.style.boxShadow = `0 0 20px rgb(${rgbA.r}, ${rgbA.g}, ${rgbA.b})`;

        // Star B UI
        document.getElementById('nameB').innerText = nameBStr;
        document.getElementById('typeB').innerText = translateType(starB.type);
        document.getElementById('tempB').innerText = `${starB.temp.toLocaleString()} K`;
        document.getElementById('radB').innerHTML = `${starB.radius.toFixed(2)} R<sub>☉</sub>`;
        document.getElementById('lambdaB').innerText = `${this.calcWienPeak(starB.temp).toFixed(1)} nm`;

        const energyRelB = Math.pow(starB.temp / 5778, 4);
        document.getElementById('energyB').innerHTML = `${formatValue(energyRelB)} E<sub>☉</sub>`;
        document.getElementById('lumB').innerHTML = `${formatValue(starB.lum)} L<sub>☉</sub>`;

        const coreB = document.getElementById('coreB');
        const glowB = document.getElementById('glowB');
        if (coreB) coreB.style.backgroundColor = `rgb(${rgbB.r}, ${rgbB.g}, ${rgbB.b})`;
        if (glowB) glowB.style.boxShadow = `0 0 20px rgb(${rgbB.r}, ${rgbB.g}, ${rgbB.b})`;

        // 상대 비율 연산 (Star B / Star A)
        const ratioT = starB.temp / starA.temp;
        const ratioR = starB.radius / starA.radius;
        const ratioE = energyRelB / energyRelA;
        const ratioL = starB.lum / starA.lum;

        const formatRatioText = (val) => {
            if (isEn) {
                if (val >= 1000000) return `~${(val / 1000000).toFixed(1)}M x`;
                if (val >= 10000) return `~${(val / 1000).toFixed(1)}k x`;
                if (val >= 10) return `${val.toFixed(1)} x`;
                if (val >= 1) return `${val.toFixed(2)} x`;
                return `${val.toFixed(3)} x`;
            } else {
                if (val >= 100000) return `약 ${(val / 10000).toLocaleString(undefined, {maximumFractionDigits: 0})}만 배`;
                if (val >= 10000) return `약 ${(val / 10000).toFixed(1)}만 배`;
                if (val >= 10) return `${val.toFixed(1)} 배`;
                if (val >= 1) return `${val.toFixed(2)} 배`;
                return `${val.toFixed(3)} 배`;
            }
        };

        document.getElementById('ratioTemp').innerText = formatRatioText(ratioT);
        document.getElementById('ratioRad').innerText = formatRatioText(ratioR);
        document.getElementById('ratioEnergy').innerText = formatRatioText(ratioE);
        document.getElementById('ratioLum').innerText = formatRatioText(ratioL);
    }
}

window.StarComparisonSim = StarComparisonSim;
