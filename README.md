# 🔴 Neon Plinko Simulation

A high-performance, interactive Plinko physics simulation built exclusively with **Vanilla JavaScript, HTML, and CSS**. No external physics engines or libraries were used.


## 🚀 Features

### 🎮 Gameplay
- **Dynamic Spawning:** Drop 1, 10, 50, or 100 balls instantly into the simulation.
- **Physics Engine:** Realistic gravity, restitution (bounciness), and velocity damping.
- **Complex Collisions:** 
  - Ball-to-Peg elastic collisions.
  - Ball-to-Ball impulse-based collisions.
  - Ball-to-Wall reflections.
- **Performance Optimization:** Ball-to-ball collisions are automatically disabled when more than 50 balls are active to maintain 60 FPS.

### 🎨 Visuals & UI
- **Neon Aesthetic:** Dark mode theme with a cyan accent (`#00f0ff`) and glowing elements.
- **Animated Background:** A procedural "doodle" background featuring a technical grid and gliding neon light trails.
- **Real-time Stats:** 
  - Localized score formatting.
  - Active ball counter.
  - Distribution grid tracking how many balls landed in each scoring slot.
- **Simulation Control:** Play, Pause, and Reset functionality.

### 🔊 Procedural Audio
- **Web Audio API:** No external `.mp3` or `.wav` files. All sounds are generated in real-time.
- **Dynamic SFX:** 
  - High-pitched "pops" for peg collisions.
  - Pitch-shifted "chimes" for scoring (higher points = higher pitch).
- **Volume Control:** Integrated volume slider to adjust sound effects.

## 🛠️ Technical Specifications

| Parameter | Value |
|-----------|-------|
| Canvas Size | 600 $\times$ 750 px |
| Gravity | 980 px/s² |
| Peg Rows | 13 (Pyramid) |
| Restitution | 0.55 |
| Tech Stack | HTML5 Canvas, CSS3, Vanilla JS |

## 📦 Installation & Usage

No installation required. Since this is a vanilla frontend project, you can run it directly in any modern web browser.

1. Clone the repository:
   ```bash
   git clone https://github.com/davidrodcruz/Plinko-local-LLM-Benchmark.git
   ```
2. Open `index.html` in your favorite browser.
3. **Note:** Click anywhere on the page first to enable the Web Audio API sound effects.

## 📂 Project Structure

- `index.html` - The structure and UI layout.
- `styles.css` - Neon styling, animations, and layout.
- `script.js` - The physics engine, rendering loop, and procedural audio logic.

---
Built with ⚡ and Vanilla JS.
