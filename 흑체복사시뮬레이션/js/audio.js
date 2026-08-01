/* ==========================================================================
   별과 흑체 복사 - 웹 오디오 피드백 모듈 (Web Audio API)
   ========================================================================== */

class SoundController {
    constructor() {
        this.enabled = true;
        this.audioCtx = null;
        this.isUnlocked = false;

        // 브라우저 오디오 자동 재생 차단 해제 이벤트 바인딩
        const unlock = () => {
            this.init();
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            this.isUnlocked = true;
            window.removeEventListener('click', unlock);
            window.removeEventListener('touchstart', unlock);
            window.removeEventListener('keydown', unlock);
        };

        window.addEventListener('click', unlock);
        window.addEventListener('touchstart', unlock);
        window.addEventListener('keydown', unlock);
    }

    init() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // 일반 버튼 클릭음 (Pleasant Soft Click)
    playClick() {
        if (!this.enabled) return;
        this.init();
        if (!this.audioCtx) return;

        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            const now = this.audioCtx.currentTime;
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.04);
        } catch (e) {
            console.warn("Audio play error", e);
        }
    }

    // 탭 전환음
    playTabSound() {
        if (!this.enabled) return;
        this.init();
        if (!this.audioCtx) return;

        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'triangle';
            const now = this.audioCtx.currentTime;
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.08);
        } catch (e) {
            console.warn("Audio play error", e);
        }
    }

    // 온도 슬라이더 변환음 (온도가 올라갈수록 피치 상승: 1,000K -> 200Hz, 30,000K -> 880Hz)
    playTempSound(tempK) {
        if (!this.enabled) return;
        this.init();
        if (!this.audioCtx) return;

        try {
            const norm = Math.max(0, Math.min(1, (tempK - 1000) / 29000));
            const freq = 200 + norm * 680; // 200Hz ~ 880Hz

            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            const now = this.audioCtx.currentTime;
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.06);
        } catch (e) {
            console.warn("Audio play error", e);
        }
    }

    // 반지름 슬라이더 변환음 (반지름이 커질수록 묵직한 낮은 피치 음)
    playRadiusSound(relRadius) {
        if (!this.enabled) return;
        this.init();
        if (!this.audioCtx) return;

        try {
            const logR = Math.log10(relRadius); // -1 ~ 3
            const norm = Math.max(0, Math.min(1, (logR + 1) / 4));
            const freq = 450 - norm * 300; // 450Hz -> 150Hz (커질수록 묵직함)

            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            const now = this.audioCtx.currentTime;
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.09, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.06);
        } catch (e) {
            console.warn("Audio play error", e);
        }
    }
}

window.soundController = new SoundController();
