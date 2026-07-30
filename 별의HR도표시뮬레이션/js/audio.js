/**
 * H-R도표 및 별의 진화 시뮬레이터 - Web Audio API 사운드 모듈
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.isMuted = true;
        this.ambientOsc = null;
    }

    initCtx() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.initCtx();
        this.isMuted = !this.isMuted;
        if (!this.isMuted) {
            this.startAmbientHum();
        } else {
            this.stopAmbientHum();
        }
        return this.isMuted;
    }

    playClickSound() {
        if (this.isMuted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.05);

            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.05);
        } catch (e) {}
    }

    playSupernovaSound() {
        if (this.isMuted || !this.ctx) return;
        try {
            // 노이즈 버스트 기반 폭발음 합성
            const bufferSize = this.ctx.sampleRate * 2.0;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 1.8);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.8);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start();
        } catch (e) {}
    }

    playNebulaSound() {
        if (this.isMuted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 1.0);
            osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 2.5);

            gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 1.0);
            gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 2.5);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 2.5);
        } catch (e) {}
    }

    startAmbientHum() {
        if (!this.ctx) return;
        try {
            this.ambientOsc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            this.ambientOsc.type = 'sine';
            this.ambientOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // 저음 우주 hum

            gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
            this.ambientOsc.connect(gain);
            gain.connect(this.ctx.destination);
            this.ambientOsc.start();
        } catch (e) {}
    }

    stopAmbientHum() {
        if (this.ambientOsc) {
            try {
                this.ambientOsc.stop();
                this.ambientOsc = null;
            } catch (e) {}
        }
    }
}

if (typeof window !== 'undefined') {
    window.AudioManager = AudioManager;
}
