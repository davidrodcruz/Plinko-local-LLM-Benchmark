(() => {
    // ── Canvas Setup ──
    const canvas = document.getElementById('plinkoCanvas');
    const ctx = canvas.getContext('2d');
    const canvasW = canvas.width;
    const canvasH = canvas.height;

    // ── UI Elements ──
    const scoreEl = document.getElementById('scoreValue');
    const ballCountEl = document.getElementById('ballCount');
    const distroEl = document.getElementById('distro');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const volumeSlider = document.getElementById('volumeSlider');

    // ── Physics Constants ──
    const GRAVITY = 980;
    const BALL_RADIUS = 5;
    const PEG_RADIUS = 7;
    const RESTITUTION = 0.55;
    const DAMPING = 0.998;
    const MAX_DT = 0.032;
    const PEG_ROWS = 13;
    const PEG_H_SPACING = 38;
    const PEG_V_SPACING = 34;
    const PEG_START_Y = 260;
    const SLOT_Y_START = 690;
    const SLOT_Y_END = 750;
    const SLOT_VALUES = [10, 50, 100, 500, 100, 50, 10];
    const SLOT_COUNT = SLOT_VALUES.length;
    const SLOT_WIDTH = canvasW / SLOT_COUNT;

    // ── State ──
    let score = 0;
    let balls = [];
    let pegs = [];
    let slotGlows = new Array(SLOT_COUNT).fill(0);
    let slotCounts = new Array(SLOT_COUNT).fill(0);
    let isPaused = false;
    let lastTime = 0;

    // ── Audio Engine ──
    let audioCtx = null;
    let sfxVolume = 0.5;
    
    const initAudio = () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    };

    const playHitSound = () => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400 + Math.random() * 200, audioCtx.currentTime);
        g.gain.setValueAtTime(sfxVolume * 0.1, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    };

    const playScoreSound = (value) => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'square';
        const freq = 500 + (value * 2); 
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.1);
        g.gain.setValueAtTime(sfxVolume * 0.1, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    };

    // ── Initialization ──

    const initBackgroundAnimation = () => {
        const body = document.getElementById('gameBody');
        const colors = ['#00f0ff', '#ff6699', '#ffff00', '#00ff00'];
        
        setInterval(() => {
            const line = document.createElement('div');
            line.className = 'neon-line';
            const color = colors[Math.floor(Math.random() * colors.length)];
            const isHorizontal = Math.random() > 0.5;
            
            line.style.setProperty('--neon-color', color);
            
            const startX = Math.random() * window.innerWidth;
            const startY = Math.random() * window.innerHeight;
            line.style.left = startX + 'px';
            line.style.top = startY + 'px';
            
            if (isHorizontal) {
                line.style.width = '150px';
                line.style.height = '2px';
                line.style.setProperty('--tx', (Math.random() > 0.5 ? 200 : -200) + 'px');
                line.style.setProperty('--ty', '0px');
            } else {
                line.style.width = '2px';
                line.style.height = '150px';
                line.style.setProperty('--tx', '0px');
                line.style.setProperty('--ty', (Math.random() > 0.5 ? 200 : -200) + 'px');
            }
            
            line.style.animation = `flow ${2 + Math.random() * 3}s linear`;
            body.appendChild(line);
            
            setTimeout(() => line.remove(), 5000);
        }, 300);
    };

    const initPegs = () => {

        for (let i = 0; i < PEG_ROWS; i++) {
            const rowPegs = i + 1;
            for (let j = 0; j < rowPegs; j++) {
                const x = (canvasW / 2) + (j - i / 2) * PEG_H_SPACING;
                const y = PEG_START_Y + i * PEG_V_SPACING;
                pegs.push({ x, y, r: PEG_RADIUS });
            }
        }
    };

    const spawnBalls = (count) => {
        for (let i = 0; i < count; i++) {
            balls.push({
                x: (canvasW / 2) + (Math.random() * 60 - 30),
                y: 10 + Math.random() * 30,
                vx: Math.random() * 30 - 15,
                vy: Math.random() * 20,
                r: BALL_RADIUS
            });
        }
    };

    // ── Math Helpers ──
    const dot = (v1, v2) => v1.x * v2.x + v1.y * v2.y;

    // ── Physics ──
    const updatePhysics = (dt) => {
        for (let i = 0; i < balls.length; i++) {
            const b = balls[i];

            // Apply Gravity
            b.vy += GRAVITY * dt;
            b.vx *= DAMPING;
            b.vy *= DAMPING;

            // Update Position
            b.x += b.vx * dt;
            b.y += b.vy * dt;

            // Wall Collisions
            if (b.x < b.r) {
                b.x = b.r;
                b.vx = -b.vx * RESTITUTION;
            } else if (b.x > canvasW - b.r) {
                b.x = canvasW - b.r;
                b.vx = -b.vx * RESTITUTION;
            }

            // Peg Collisions
            for (let p of pegs) {
                const dx = b.x - p.x;
                const dy = b.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < b.r + p.r) {
                    // Normal vector
                    const nx = dx / dist;
                    const ny = dy / dist;
                    // Velocity along normal
                    const vDotN = b.vx * nx + b.vy * ny;

                    if (vDotN < 0) {
                        // Reflect velocity
                        b.vx -= (1 + RESTITUTION) * vDotN * nx;
                        b.vy -= (1 + RESTITUTION) * vDotN * ny;
                        playHitSound();
                    }
                    // Separate overlap
                    const overlap = (b.r + p.r) - dist;
                    b.x += overlap * nx;
                    b.y += overlap * ny;
                }
            }

            // Ball-to-Ball Collisions (Disabled if > 50 balls)
            if (balls.length <= 50) {
                for (let j = i + 1; j < balls.length; j++) {
                    const b2 = balls[j];
                    const dx = b.x - b2.x;
                    const dy = b.y - b2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < b.r + b2.r) {
                        const nx = dx / dist;
                        const ny = dy / dist;
                        const dvx = b.vx - b2.vx;
                        const dvy = b.vy - b2.vy;
                        const dvDotN = dvx * nx + dvy * ny;

                        if (dvDotN > 0) {
                            // Impulse scalar (simplified for equal mass)
                            const jImpulse = -(1 + RESTITUTION) * dvDotN * 0.5;
                            b.vx += jImpulse * nx;
                            b.vy += jImpulse * ny;
                            b2.vx -= jImpulse * nx;
                            b2.vy -= jImpulse * ny;
                        }
                    }
                }
            }

            // Scoring Detection
            if (b.y >= 685) {
                const slotIndex = Math.max(0, Math.min(SLOT_COUNT - 1, Math.floor(b.x / SLOT_WIDTH)));
                const points = SLOT_VALUES[slotIndex];
                score += points;
                slotGlows[slotIndex] = 1.0;
                slotCounts[slotIndex]++;
                playScoreSound(points);
                balls.splice(i, 1);
                i--;
            }
        }
    };

    // ── Rendering ──
    const render = () => {
        ctx.clearRect(0, 0, canvasW, canvasH);

        // Slots
        for (let i = 0; i < SLOT_COUNT; i++) {
            const x = i * SLOT_WIDTH;
            const glow = slotGlows[i];
            
            ctx.save();
            if (glow > 0) {
                ctx.shadowBlur = 30 * glow;
                ctx.shadowColor = '#00f0ff';
                ctx.fillStyle = `rgba(0, 240, 255, ${glow * 0.2})`;
                ctx.fillRect(x, SLOT_Y_START, SLOT_WIDTH, SLOT_Y_END - SLOT_Y_START);
            }

            // Divider
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, SLOT_Y_START);
            ctx.lineTo(x, SLOT_Y_END);
            ctx.stroke();

            // Text
            ctx.fillStyle = '#e0e0e0';
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            if (glow > 0) {
                ctx.shadowBlur = 30 * glow;
                ctx.shadowColor = '#00f0ff';
            }
            ctx.fillText(SLOT_VALUES[i], x + SLOT_WIDTH / 2, (SLOT_Y_START + SLOT_Y_END) / 2 + 5);
            ctx.restore();
        }
        // Last divider
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(canvasW, SLOT_Y_START);
        ctx.lineTo(canvasW, SLOT_Y_END);
        ctx.stroke();

        // Pegs
        for (let p of pegs) {
            const grad = ctx.createRadialGradient(p.x - 1, p.y - 1, 1, p.x, p.y, p.r);
            grad.addColorStop(0, '#4a4a6a');
            grad.addColorStop(1, '#2a2a3a');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#6a6a8a';
            ctx.beginPath();
            ctx.arc(p.x - 2, p.y - 2, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Balls
        for (let b of balls) {
            ctx.save();
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ff3366';
            const grad = ctx.createRadialGradient(b.x - 1, b.y - 1, 1, b.x, b.y, b.r);
            grad.addColorStop(0, '#ff6699');
            grad.addColorStop(1, '#cc1144');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Update Glows
        const currentDt = (lastTime > 0) ? (performance.now() - lastTime) / 1000 : 0;
        for (let i = 0; i < SLOT_COUNT; i++) {
            slotGlows[i] = Math.max(0, slotGlows[i] - (currentDt || 0.016) * 3.0);
        }

        // Update UI
        scoreEl.textContent = score.toLocaleString();
        ballCountEl.textContent = balls.length;

        let distroHtml = '';
        for (let i = 0; i < SLOT_COUNT; i++) {
            distroHtml += `<div class="distro-item"><span>${SLOT_VALUES[i]}</span><span class="distro-val">${slotCounts[i]}</span></div>`;
        }
        distroEl.innerHTML = distroHtml;
    };

    const gameLoop = (timestamp) => {
        if (!lastTime) lastTime = timestamp;
        let dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;
        dt = Math.min(dt, MAX_DT);

        if (!isPaused) {
            updatePhysics(dt);
        }

        render();
        requestAnimationFrame(gameLoop);
    };

    // ── Event Listeners ──
    document.querySelectorAll('.btn-group button').forEach(btn => {
        btn.addEventListener('click', () => spawnBalls(parseInt(btn.dataset.count)));
    });

    playBtn.addEventListener('click', () => isPaused = false);
    pauseBtn.addEventListener('click', () => isPaused = true);
    resetBtn.addEventListener('click', () => {
        score = 0;
        slotCounts.fill(0);
        balls = [];
    });

    volumeSlider.addEventListener('input', (e) => {
        sfxVolume = parseFloat(e.target.value);
    });

    // Initialize audio on first interaction
    window.addEventListener('mousedown', initAudio, { once: true });


    // ── Start ──
    initPegs();
    initBackgroundAnimation();
    requestAnimationFrame(gameLoop);
})();
