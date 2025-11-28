class PlinkoGame {
  constructor() {
    ((this.gameElement = document.getElementById('game')),
      (this.canvasElement = document.getElementById('game-canvas')),
      (this.canvasContainerElement = document.getElementById('game-canvas-container')),
      (this.gameWinBalanceElement = document.getElementById('game-win-balance')),
      (this.gameProgressРЎircleElement1 = document.getElementById('game-progress-circle-1')),
      (this.gameProgressРЎircleElement2 = document.getElementById('game-progress-circle-2')),
      (this.gameProgressElementDesktop = document.getElementById('game-progress-desktop')),
      (this.gameProgressElementMobile = document.getElementById('game-progress-mobile')),
      (this.modalElement = document.getElementById('modal')),
      (this.gameStartButtonElement = document.getElementById('go-btn')),
      (this.effectsContainer = document.getElementById('effects')),
      (this.effectsImage = document.getElementById('effects-image')),
      (this.winBtn = document.getElementById('win-button-modal')),
      (this.winBonusBtn = document.getElementById('win-bonus-button-modal')),
      (this.ctx = this.canvasElement.getContext('2d')),
      (this.canvasEmSize = this.getEmSize(this.canvasElement)),
      (this.winSoundPath = 'https://landix.group/assets/general/sound/plinko-win.mp3'),
      (this.clickSoundPath = 'https://landix.group/assets/general/sound/plinko-click.mp3'),
      (this.wheelSoundPath = 'https://landix.group/assets/general/sound/plinko-wheel.mp3'),
      (this.ballFallenSoundPath =
        'https://landix.group/assets/general/sound/plinko-ball-fallen.mp3'),
      (this.pegRadius = 0.8 * this.canvasEmSize),
      (this.ballRadius = this.canvasEmSize),
      (this.gravity = 0.4),
      (this.bounceDamping = 0.6),
      (this.pegColor = '#FFFFFF'),
      (this.ballColor = '#FFD400'),
      (this.slotHeight = 4 * this.canvasEmSize),
      (this.numberOfPegRows = 8),
      (this.startRowPegsMultiplier = 3),
      (this.pegStartingYMultiplier = 7),
      (this.ballDropOffset = 20),
      (this.initialBallVelocityMultiplier = 2),
      (this.numberOfBallsToDrop = 10),
      (this.numberBonusOfBallsToDrop = 10),
      (this.spinsCount = Number.parseInt(this.gameElement.dataset.spins)),
      (this.scoreValues = this.gameElement.dataset.list.split(',').map(Number)),
      (this.balanceMin = Number.parseFloat(this.gameElement.dataset.balancemin)),
      (this.balanceMax = Number.parseFloat(this.gameElement.dataset.balancemax)),
      (this.balls = []),
      (this.pegs = []),
      (this.slots = []),
      (this.winBalance = this.balanceMin),
      (this.spin = 0),
      (this.lastTime = 0),
      (this.activeBallsCount = 0),
      (this.ballsDroppedCount = 0),
      (this.currentProgressBarWidth = 0),
      (this.isBonusBallDropActive = !1),
      (this.circleProgressBarMaxOffset = 445),
      (this.circleProgressBarMinOffset = 230),
      (this.animationFrameId = null),
      (this.activeSounds = new Set()),
      (this.totalBallsAcrossAllSpins =
        this.spinsCount * this.numberOfBallsToDrop + this.numberBonusOfBallsToDrop),
      (this.balanceIncreasePerBall =
        (this.balanceMax - this.balanceMin) / this.totalBallsAcrossAllSpins),
      this.initGame());
  }
  initGame() {
    ([this.winBtn, this.winBonusBtn].forEach((t) => {
      t && this.calculateButtonScale(t);
    }),
      this.gameStartButtonElement.addEventListener('click', this.initSpin.bind(this)),
      window.addEventListener('resize', this.resizeCanvas.bind(this)),
      window.addEventListener('openBonusBox', () => this.stopGame()),
      window.addEventListener('placementOpenModal', () => this.showModal()),
      this.resizeCanvas(),
      this.gameLoop(),
      this.startFireflyAnimation(),
      this.updateCircleProgressBar(),
      (this.gameWinBalanceElement.innerText = Number(this.balanceMin.toFixed(2))));
  }
  initSpin() {
    (this.setGameDisable(),
      this.playSound(this.clickSoundPath),
      window.isMobile && window.pushPlacement && !window.firstClick && this.spin === 0
        ? window.dispatchEvent(
            new CustomEvent('placementFirstClick', { detail: [this.dropBall.bind(this)] })
          )
        : this.dropBall());
  }
  resizeCanvas() {
    ((this.canvasElement.width = this.canvasContainerElement.clientWidth),
      (this.canvasElement.height = this.canvasContainerElement.clientHeight),
      (this.canvasWidth = this.canvasElement.width),
      (this.canvasHeight = this.canvasElement.height),
      (this.pegs = []),
      (this.slots = []),
      this.populatePegs(),
      this.populateSlots(),
      this.draw());
  }
  populatePegs() {
    const t = this.canvasEmSize * this.pegStartingYMultiplier;
    const s = this.canvasWidth / (this.numberOfPegRows / 0.8);
    const e = this.canvasHeight / (this.numberOfPegRows / 0.8);
    for (let i = 0; i < this.numberOfPegRows; i++) {
      const a = i + this.startRowPegsMultiplier;
      const n = (this.canvasWidth - (a - 1) * s) / 2;
      for (let l = 0; l < a; l++) {
        const a = n + l * s;
        const h = t + i * e;
        this.pegs.push({ x: a, y: h, radius: this.pegRadius });
      }
    }
  }
  populateSlots() {
    const t = this.canvasWidth / this.scoreValues.length;
    for (let s = 0; s < this.scoreValues.length; s++)
      this.slots.push({
        x: s * t,
        y: this.canvasHeight - this.slotHeight,
        width: t,
        height: this.slotHeight
      });
  }
  drawCircle(t, s, e, i) {
    (this.ctx.beginPath(),
      this.ctx.arc(t, s, e, 0, 2 * Math.PI),
      (this.ctx.fillStyle = i),
      this.ctx.fill(),
      this.ctx.closePath());
  }
  drawRect(t, s, e, i, a) {
    ((this.ctx.fillStyle = a), this.ctx.fillRect(t, s, e, i));
  }
  draw() {
    (this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight),
      this.pegs.forEach((t) => {
        this.drawCircle(t.x, t.y, t.radius, this.pegColor);
      }),
      this.slots.forEach((t) => {
        this.drawRect(t.x, t.y, t.width, t.height, 'transparent');
      }),
      this.balls.forEach((t) => {
        this.drawCircle(t.x, t.y, t.radius, this.ballColor);
      }));
  }
  update(t) {
    const s = 60 * t;
    for (let t = this.balls.length - 1; t >= 0; t--) {
      let e = this.balls[t];
      if (
        ((e.vy += this.gravity * s),
        (e.x += e.vx * s),
        (e.y += e.vy * s),
        e.x - e.radius < 0
          ? ((e.x = e.radius), (e.vx *= -this.bounceDamping))
          : e.x + e.radius > this.canvasWidth &&
            ((e.x = this.canvasWidth - e.radius), (e.vx *= -this.bounceDamping)),
        this.pegs.forEach((t) => {
          const s = e.x - t.x;
          const i = e.y - t.y;
          const a = Math.sqrt(s * s + i * i);
          if (a < e.radius + t.radius) {
            const n = s / a;
            const l = i / a;
            const h = e.vx * n + e.vy * l;
            if (h < 0) {
              ((e.vx = (e.vx - 2 * h * n) * this.bounceDamping),
                (e.vy = (e.vy - 2 * h * l) * this.bounceDamping));
              const s = 0.5 * (e.radius + t.radius - a);
              ((e.x += n * s), (e.y += l * s));
            }
          }
        }),
        e.y + e.radius >= this.canvasHeight - this.slotHeight)
      ) {
        let s = !1;
        for (let t = 0; t < this.slots.length; t++) {
          const i = this.slots[t];
          if (e.x >= i.x && e.x < i.x + i.width) {
            (this.updateBalance(),
              this.playSound(this.ballFallenSoundPath),
              this.ballsDroppedCount++,
              (s = !0));
            break;
          }
        }
        (this.updateProgressBar(),
          this.updateCircleProgressBar(),
          this.balls.splice(t, 1),
          this.activeBallsCount--,
          this.activeBallsCount === 0 &&
            (this.isBonusBallDropActive
              ? setTimeout(() => {
                  (this.showEffects(0),
                    this.triggerShowModal(0),
                    this.gameElement.classList.add('is--win'),
                    this.playSound(this.winSoundPath),
                    (this.isBonusBallDropActive = !1));
                }, 500)
              : (this.resetGameEnable(),
                this.spin < this.spinsCount
                  ? setTimeout(() => {
                      this.resetProgressBar();
                    }, 200)
                  : setTimeout(() => {
                      (this.gameElement.classList.add('is--free'),
                        setTimeout(() => {
                          this.playSound(this.wheelSoundPath, 0, 3e3);
                        }, 500),
                        setTimeout(() => {
                          (this.gameElement.classList.remove('is--free'),
                            this.gameElement.classList.add('is--gates'),
                            setTimeout(() => {
                              (this.gameElement.classList.add('is--bonus'),
                                setTimeout(() => {
                                  ((this.isBonusBallDropActive = !0),
                                    this.dropBall(this.numberBonusOfBallsToDrop));
                                }, 1e3));
                            }, 500),
                            setTimeout(() => {
                              this.gameElement.classList.remove('is--gates');
                            }, 1e3));
                        }, 5e3));
                    }, 500))));
      }
    }
  }
  gameLoop(t) {
    this.lastTime || (this.lastTime = t);
    const s = (t - this.lastTime) / 1e3;
    (this.update(s),
      this.draw(),
      (this.lastTime = t),
      (this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this))));
  }
  dropBall(t = this.numberOfBallsToDrop) {
    this.balls = [];
    for (let s = 0; s < t; s++) {
      const t = this.canvasWidth / 2 + (Math.random() - 0.5) * this.ballDropOffset;
      this.balls.push({
        x: t,
        y: this.ballRadius,
        radius: this.ballRadius,
        vx: (Math.random() - 0.5) * this.initialBallVelocityMultiplier,
        vy: 0
      });
    }
    ((this.activeBallsCount = t), this.isBonusBallDropActive || this.spin++);
  }
  updateBalance() {
    ((this.winBalance += this.balanceIncreasePerBall),
      (this.winBalance = Math.min(this.winBalance, this.balanceMax)),
      (this.gameWinBalanceElement.innerText = this.winBalance.toFixed(0)));
  }
  updateProgressBar() {
    if (this.spin <= this.spinsCount) {
      const t = this.spinsCount * this.numberOfBallsToDrop;
      const s =
        (this.spin - 1) * this.numberOfBallsToDrop +
        (this.numberOfBallsToDrop - this.activeBallsCount);
      ((this.currentProgressBarWidth =
        s <= 0.75 * t ? (s / (0.75 * t)) * 75 : 75 + ((s - 0.75 * t) / (0.25 * t)) * 25),
        (this.currentProgressBarWidth = Math.min(this.currentProgressBarWidth, 100)));
    } else this.isBonusBallDropActive && (this.currentProgressBarWidth = 100);
    ((this.gameProgressElementDesktop.style.width = `${this.currentProgressBarWidth}%`),
      (this.gameProgressElementMobile.style.width = `${this.currentProgressBarWidth}%`));
  }
  resetProgressBar() {
    ((this.currentProgressBarWidth = 0),
      (this.gameProgressElementDesktop.style.width = '0%'),
      (this.gameProgressElementMobile.style.width = '0%'));
  }
  updateCircleProgressBar() {
    const t = (this.ballsDroppedCount / this.totalBallsAcrossAllSpins) * 100;
    const s = Math.max(0, Math.min(100, t));
    const e = this.circleProgressBarMaxOffset - this.circleProgressBarMinOffset;
    const i = this.circleProgressBarMaxOffset - (s / 100) * e;
    (this.gameProgressРЎircleElement1 &&
      (this.gameProgressРЎircleElement1.style.strokeDashoffset = i.toFixed(2)),
      this.gameProgressРЎircleElement2 &&
        (this.gameProgressРЎircleElement2.style.strokeDashoffset = i.toFixed(2)));
  }
  getEmSize(t) {
    return Number.parseFloat(window.getComputedStyle(t).fontSize);
  }
  setGameDisable() {
    this.gameElement.classList.add('is--disabled');
  }
  resetGameEnable() {
    this.spin < this.spinsCount &&
      !this.isBonusBallDropActive &&
      this.gameElement.classList.remove('is--disabled');
  }
  triggerShowModal(t = 0) {
    setTimeout(() => {
      window.dispatchEvent(new Event('placementOpenModal'));
    }, t);
  }
  showModal() {
    (document.body.classList.add('is--modal-open'), this.modalElement.classList.add('is--active'));
  }
  startFireflyAnimation() {
    const t = Array.from(document.querySelectorAll('.firefly'));
    for (let s = t.length - 1; s > 0; s--) {
      const e = Math.floor(Math.random() * (s + 1));
      [t[s], t[e]] = [t[e], t[s]];
    }
    let s = 1e3;
    t.forEach((t) => {
      setTimeout(
        () => {
          t.style.display = 'block';
        },
        (s += 250)
      );
    });
  }
  showEffects(t = 0, s = 1500) {
    (this.effectsContainer.classList.add('visible'),
      setTimeout(() => {
        const t = document.createElement('div');
        ((t.style.backgroundImage = `url(${this.effectsImage.src})`),
          t.classList.add('effects__block'),
          this.effectsContainer.appendChild(t),
          setTimeout(() => {
            (this.effectsContainer.classList.remove('visible'),
              this.effectsContainer.classList.add('hidden'));
          }, s));
      }));
  }
  playSound(t, s = 0, e = 0) {
    setTimeout(() => {
      const s = new Audio(t);
      ((s.muted = !1),
        this.activeSounds.add(s),
        s.play().catch((t) => {
          (console.error('Error playing audio:', t), this.activeSounds.delete(s));
        }),
        (s.onended = () => {
          this.activeSounds.delete(s);
        }),
        e > 0 &&
          setTimeout(() => {
            s.paused || (s.pause(), (s.currentTime = 0), this.activeSounds.delete(s));
          }, e));
    }, s);
  }
  stopAllSounds() {
    (this.activeSounds.forEach((t) => {
      (t.pause(), (t.currentTime = 0));
    }),
      this.activeSounds.clear());
  }
  stopGame() {
    (this.animationFrameId &&
      (cancelAnimationFrame(this.animationFrameId), (this.animationFrameId = null)),
      this.stopAllSounds(),
      setTimeout(() => {
        (this.showEffects(0),
          this.playSound(this.winSoundPath),
          this.gameElement.classList.add('is--win'),
          (this.isBonusBallDropActive = !1));
      }, 0));
  }
  calculateButtonScale(t, s = { min: 0.5, max: 1, step: 0.07 }) {
    if (!t) return;
    const e = t.getBoundingClientRect().width;
    const i = window.innerWidth;
    if (e <= i) return void (t.style.transform = `scale(${s.max})`);
    const a = e / i;
    const n = Math.max(s.max - (a - 1) * s.step * 10, s.min);
    const l = t.querySelectorAll('span');
    (l &&
      l.forEach((t) => {
        t.style.whiteSpace = 'nowrap';
      }),
      (t.parentElement.style.transform = `scale(${n})`),
      (t.parentElement.style.transformOrigin = 'center'));
  }
}
document.addEventListener('DOMContentLoaded', () => {
  new PlinkoGame();
});
