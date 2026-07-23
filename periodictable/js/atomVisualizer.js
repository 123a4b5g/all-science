/**
 * Bohr Atom Model Canvas Visualizer
 * Simulates electron shell orbits, protons & neutrons in nucleus, and dynamic revolution
 */
class AtomVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.currentElement = null;
    this.animId = null;
    this.time = 0;
    this.speed = 1.0;
    this.isPlaying = true;

    // Resize initial check
    setTimeout(() => this.resizeCanvas(), 50);
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
    this.draw();
  }

  setElement(element) {
    this.currentElement = element;
    this.draw();
  }

  setSpeed(val) {
    this.speed = parseFloat(val);
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
  }

  startAnimation() {
    if (this.animId) cancelAnimationFrame(this.animId);
    const loop = () => {
      if (this.isPlaying) {
        this.time += 0.015 * this.speed;
      }
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  }

  stopAnimation() {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.animId = null;
  }

  draw() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.width / dpr || 400;
    const height = this.canvas.height / dpr || 400;

    this.ctx.clearRect(0, 0, width, height);

    if (!this.currentElement) {
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.font = '14px "Inter", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('원소를 선택하여 보어 원자 구조를 시뮬레이션하세요.', width / 2, height / 2);
      return;
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) - 25;

    const atomicNum = this.currentElement.number;
    const shells = this.currentElement.shells || [atomicNum];
    const totalShells = shells.length;

    const shellGap = Math.min(36, (maxRadius - 35) / totalShells);

    // 1. Draw Orbit Shells & Electrons
    shells.forEach((electronCount, sIndex) => {
      const radius = 35 + (sIndex + 1) * shellGap;

      // Orbit Line
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(56, 189, 248, ${0.3 + 0.1 * sIndex})`;
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([4, 4]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Shell Label (K, L, M, N...)
      const shellNames = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
      const shellName = shellNames[sIndex] || `n=${sIndex+1}`;
      this.ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      this.ctx.font = '11px "JetBrains Mono", monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`${shellName} (${electronCount}e⁻)`, centerX + radius + 6, centerY);

      // Orbiting Electrons
      const orbitDirection = sIndex % 2 === 0 ? 1 : -1;
      const speedMult = 1 / (1 + sIndex * 0.25);

      for (let e = 0; e < electronCount; e++) {
        const angle = (Math.PI * 2 / electronCount) * e + (this.time * orbitDirection * speedMult);
        const ex = centerX + Math.cos(angle) * radius;
        const ey = centerY + Math.sin(angle) * radius;

        // Electron Glow Gradient
        const gradient = this.ctx.createRadialGradient(ex, ey, 0, ex, ey, 9);
        gradient.addColorStop(0, '#00f2fe');
        gradient.addColorStop(0.5, 'rgba(0, 242, 254, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 242, 254, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(ex, ey, 9, 0, Math.PI * 2);
        this.ctx.fill();

        // Core Sphere
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    // 2. Draw Nucleus Cluster
    const pCount = atomicNum;
    const nCount = Math.round(this.currentElement.weight) - pCount;
    const nucleusRadius = Math.min(26, 12 + Math.cbrt(pCount + nCount) * 3.5);

    // Nucleus Outer Glow
    const nGlow = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, nucleusRadius * 1.8);
    nGlow.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
    nGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
    this.ctx.fillStyle = nGlow;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, nucleusRadius * 1.8, 0, Math.PI * 2);
    this.ctx.fill();

    // Nucleus Sphere Base
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, nucleusRadius, 0, Math.PI * 2);
    const nGradient = this.ctx.createRadialGradient(centerX - 3, centerY - 3, 2, centerX, centerY, nucleusRadius);
    nGradient.addColorStop(0, '#f87171');
    nGradient.addColorStop(0.6, '#dc2626');
    nGradient.addColorStop(1, '#991b1b');
    this.ctx.fillStyle = nGradient;
    this.ctx.fill();

    // Nucleus Labels
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 12px "Outfit", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(`${this.currentElement.symbol}`, centerX, centerY - 2);
    this.ctx.font = '9px "JetBrains Mono", monospace';
    this.ctx.fillText(`P:${pCount} N:${nCount}`, centerX, centerY + 9);
  }
}
