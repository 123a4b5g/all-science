/**
 * H-R도표 및 별의 진화 시뮬레이터 - 진화 타임라인 및 엔진 제어 모듈
 */

class EvolutionEngine {
    constructor(hrRenderer, starVisualizer, audioManager) {
        this.hrRenderer = hrRenderer;
        this.starVisualizer = starVisualizer;
        this.audioManager = audioManager;

        this.mass = 1.0; // 기본 태양 질량 1.0 M_sun
        this.progress = 0; // 0.0 ~ 1.0
        this.isPlaying = false;
        this.speed = 1.0; // 배속 (1x, 2x, 5x, 10x)

        this.currentTrack = null;
        this.lastEffectTriggered = null;

        this.onUpdateCallback = null;

        this.setMass(1.0);
    }

    setMass(newMass) {
        this.mass = Math.max(0.1, Math.min(50.0, newMass));
        this.currentTrack = HR_DATA.getEvolutionTrack(this.mass);
        this.progress = 0;
        this.lastEffectTriggered = null;

        this.hrRenderer.setEvolutionTrack(this.currentTrack, this.progress);
        this.syncState();
    }

    setSpeed(speedMultiplier) {
        this.speed = speedMultiplier;
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.lastTimestamp = performance.now();
        this.tick();
    }

    pause() {
        this.isPlaying = false;
    }

    reset() {
        this.pause();
        this.progress = 0;
        this.lastEffectTriggered = null;
        this.syncState();
    }

    setProgress(p) {
        this.progress = Math.max(0, Math.min(1, p));
        this.syncState();
    }

    tick() {
        if (!this.isPlaying) return;

        const now = performance.now();
        const dt = (now - this.lastTimestamp) / 1000; // 초 단위
        this.lastTimestamp = now;

        // 전체 진화 애니메이션 1주기를 약 25초 기준 (배속 적용)
        const durationSeconds = 25 / this.speed;
        this.progress += dt / durationSeconds;

        if (this.progress >= 1.0) {
            this.progress = 1.0;
            this.pause();
        }

        this.syncState();

        if (this.isPlaying) {
            requestAnimationFrame(() => this.tick());
        }
    }

    syncState() {
        // H-R 도표 상 궤적 진행도 업데이트
        this.hrRenderer.setEvolutionTrack(this.currentTrack, this.progress);

        // 현재 진행도 시점의 온도, 광도, 반경 및 설명 가져오기
        const currentPt = this.hrRenderer.getCurrentTrackPoint(this.progress);
        if (currentPt) {
            this.starVisualizer.updateState({
                temp: currentPt.temp,
                lum: currentPt.lum,
                rRatio: currentPt.rRatio,
                name: currentPt.name,
                core: currentPt.core,
                effect: currentPt.effect,
                finalState: currentPt.finalState,
                mass: this.mass
            });

            // 특수 이펙트 효과음 재생 트리거
            if (this.audioManager && currentPt.effect && currentPt.effect !== this.lastEffectTriggered) {
                this.lastEffectTriggered = currentPt.effect;
                if (currentPt.effect === 'supernova' || currentPt.effect === 'hypernova') {
                    this.audioManager.playSupernovaSound();
                } else if (currentPt.effect === 'planetaryNebula') {
                    this.audioManager.playNebulaSound();
                }
            }

            if (this.onUpdateCallback) {
                this.onUpdateCallback({
                    progress: this.progress,
                    trackName: this.currentTrack.name,
                    finalOutcome: this.currentTrack.finalOutcome,
                    lifetime: this.currentTrack.lifetimeYrs,
                    currentPt: currentPt
                });
            }
        }
    }
}

if (typeof window !== 'undefined') {
    window.EvolutionEngine = EvolutionEngine;
}
