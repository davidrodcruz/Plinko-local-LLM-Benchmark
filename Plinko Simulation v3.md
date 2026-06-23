# Plinko Simulation — Prompt v3 (Complete Edition)

Act as an Expert Frontend Software Engineer specialized in interactive physics simulations and high-performance browser rendering. Your task is to generate the complete, production-ready code for a "Plinko" game simulation using **exclusively HTML, CSS, and Vanilla JavaScript**. Do not use any external libraries or physics engines (such as Matter.js, Box2D, or Phaser).

Please provide the solution in three distinct code blocks (`index.html`, `styles.css`, and `script.js`).

---

## 1. Canvas & Layout

- **Canvas size:** Fixed `600 × 750` pixels. Do not make it responsive or resize it.
- **Canvas border:** `3px solid #00f0ff` with a `box-shadow` of `0 0 15px rgba(0, 240, 255, 0.3)`.
- **Canvas position:** Centered horizontally on the page, with a control panel to the left.
- **Control panel:** A vertical sidebar to the left of the canvas containing all buttons and displays.
- **Dark Mode Theme:** 
    - Background: `#0a0a0f`
    - Canvas background: `#0d0d14`
    - Text: `#e0e0e0`
    - Accent color: `#00f0ff` (cyan)
- **Animated Background:** 
    - Implement a technical grid using `linear-gradient` (40px spacing, rgba(255,255,255,0.02)).
    - Add soft radial glows in the background corners.
    - **Neon Lines:** Procedurally generate small neon lines (blue, pink, yellow, green) that spawn at random positions, glide linearly in random directions, and fade out over 2-5 seconds.

## 2. User Interface & Controls

All controls are **outside** the canvas, in the sidebar.

### Launch Buttons (top of sidebar)
Four buttons labeled `1`, `10`, `50`, `100`. Each drops that number of balls from the **top-center** of the canvas.
- Spawn X range: `canvas_width / 2 ± 30px` (random uniform).
- Spawn Y range: `10px to 40px` (random uniform).
- Initial velocity: `vx = random(-15, 15)`, `vy = random(0, 20)`.
- Do NOT use a drop delay — spawn all balls in the same frame.

### Simulation Controls (below launch buttons)
- **Play** button: Resumes the simulation.
- **Pause** button: Freezes all balls in place. The `requestAnimationFrame` loop continues running, but physics updates stop.
- **Reset Stats** button: Resets total score to 0, clears the distribution counts, and removes all active balls from the screen.

### Volume Control (below simulation controls)
- A label "VOLUME" and an `<input type="range">` (min 0, max 1, step 0.01, default 0.5).
- Use the accent color `#00f0ff` for the slider.

### Scoreboard & Stats (bottom of sidebar)
- **Score:** Label "SCORE" in small caps, value below in large monospace font. Format with locale separators.
- **Active Balls:** Label "ACTIVE BALLS" and its current count.
- **Distribution Grid:** Label "DISTRIBUTION". A grid displaying each possible slot value and the number of balls that have landed in it (e.g., `500: 2`).

## 3. Peg Grid (Pyramid)

Generate a **triangular pyramid** of static circular pegs:

| Parameter | Value |
|-----------|-------|
| Rows | 13 |
| Pegs per row | `row_index + 1` |
| Horizontal spacing | 38px between peg centers |
| Vertical spacing | 34px between row centers |
| First row Y position | 260px from canvas top |
| Peg radius | 7px |
| Perfect Centering | `x = (canvas_width / 2) + (j - i / 2) * horizontal_spacing` |

Pegs are static circles drawn with a radial gradient (`#4a4a6a` to `#2a2a3a`) and a small highlight dot for depth.

## 4. Physics Engine

### Constants
| Constant | Value |
|----------|-------|
| Gravity | 980 px/s² (downward) |
| Ball radius | 5px |
| Restitution | 0.55 |
| Velocity damping per frame | 0.998 |
| Max dt cap | 32ms |

### Ball-to-Peg Collision
Circle-vs-circle elastic collision. 
1. Compute distance vector `d = ball.pos - peg.pos`.
2. If `|d| < ball.r + peg.r`, reflect velocity based on the normal vector `n = d / |d|` and the restitution.
3. Resolve overlap immediately to prevent sticking.

### Ball-to-Ball Collision
Impulse-based elastic collision.
- Only resolve if circles are approaching (`dot(dv, n) > 0`).
- **Performance:** Disable ball-to-ball checks if ball count > 50.

### Ball-to-Wall Collision
- Left/Right walls: Reflect `vx` with restitution and clamp position to radius.

## 5. Scoring Slots

At the bottom (Y = 690px to 750px), 7 slots with values: `[10, 50, 100, 500, 100, 50, 10]`.
- Width per slot: `canvas_width / 7`.
- **Detection:** When `ball.y >= 685`, determine slot index and apply points.
- **Neon Glow:** On score, set `slot_glow = 1.0` and fade it (`glow -= dt * 3.0`). Draw slot fill and text with `shadowBlur = 30 * glow` and `shadowColor = '#00f0ff'`.

## 6. Audio Engine (Procedural SFX)

Use the **Web Audio API** (no external files). Initialize the `AudioContext` on the first user interaction (e.g., `mousedown`).

- **Peg Hit Sound:** A short sine wave "pop" (400-600Hz) with fast exponential decay.
- **Score Sound:** A square wave "chime" where the frequency is proportional to the score value (higher points = higher pitch), with a slight upward frequency ramp.
- **Volume Control:** All SFX must be scaled by the value of the volume slider.

## 7. Rendering & Loop

- **Balls:** Radial gradient center `#ff6699` → edge `#cc1144` with `shadowBlur = 8`.
- **Loop:** `requestAnimationFrame(gameLoop)`. Calculate `dt`, cap it at 32ms. Update physics only if `!isPaused`.

## 8. Code Quality
- Wrap in an IIFE.
- Functional style (no classes).
- Group code into sections: `// ── Canvas Setup ──`, `// ── Audio Engine ──`, etc.

---

## Evaluation Criteria

- [ ] Canvas exactly 600×750 with 3px cyan border and glow.
- [ ] Animated background with technical grid and gliding neon lines.
- [ ] 13 rows of pegs centered correctly.
- [ ] Distribution grid, Volume slider, and Reset button functioning in sidebar.
- [ ] Procedural SFX for hits and scoring, scaled by volume slider.
- [ ] Ball-to-ball collisions disabled when count > 50.
- [ ] Score format uses locale separators.
- [ ] Pause freezes physics but keeps rendering.
