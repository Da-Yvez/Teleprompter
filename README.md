# AhasaTV Teleprompter

Broadcast-grade studio teleprompter designed for news presenters, on-camera talent, and hardware teleprompter beam-splitter glass rigs.

![AhasaTV Teleprompter](logo.jpg)

---

## Key Features

- **Cinematic Broadcast Intro**: High-end studio title sequence with emblem scanline, kinetic typography, and aperture shutter reveal (instant skip enabled).
- **Smooth 60/120 FPS Sub-pixel Engine**: Ultra-fluid scrolling driven by `requestAnimationFrame` with delta-time synchronization across high-refresh monitors.
- **Scroll Speed Control**: Fine-tuned speed range from ultra-slow deliberate cadence (0.2 px/f) to high-speed skimming (25 px/f).
- **Dual Trigger Modes**:
  - **Toggle Mode**: Tap Spacebar or click anywhere to start / pause.
  - **Active Hold Mode**: Hold click / Spacebar to scroll; release immediately halts scrolling.
- **Hardware Beamsplitter Mirroring**:
  - **Flip Horizontal (Mirror X)**: For angled teleprompter reflection glass (`scaleX(-1)`).
  - **Flip Vertical (Mirror Y)**: For inverted or ceiling rigging setups.
- **Camera Sensor Eyeline Cue**:
  - Dual margin chevron pointers with an alignment beam positioned directly across the camera lens horizon.
  - Toggleable on/off in the configuration sidebar.
- **Reading Focus Mask**: Optional cinematic gradient mask that softly dims text above and below the active reading horizon.
- **Live Studio Telemetry**:
  - Real-time Words Per Minute (WPM) tracker.
  - Dynamic Estimated Time Remaining (ETR) based on current scroll velocity.
  - Elapsed broadcast timer and live ON AIR / STANDBY tally box.
- **Newsroom Script Manager**:
  - One-click `.txt` file loader button and native drag-and-drop support.
  - Live in-app script editor with live word count, character count, and Unicode / Sinhala (සිංහල) language support.
- **Full Typography & Palette Customization**:
  - Font selection: Inter, Noto Sans Sinhala, Outfit, Lexend, Cabinet Grotesk, Oswald, JetBrains Mono, Lora, or System Arial.
  - Text alignment: Left, Center, Right, Justify.
  - Sliders for font size, line spacing, letter spacing, and reading column width.
  - High-contrast color swatches (Pure White, Studio Yellow, Broadcast Cyan, Neon Green, Warm Amber, Pitch Black, Dark Obsidian, Slate, High-Key White) + custom color pickers.
- **Instant Auto-Hide**: Controls and HUD immediately fade out when scrolling starts for a clean, distraction-free presenter view.

---

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| <kbd>Space</kbd> | Play / Pause (Toggle Mode) or Hold-to-roll (Active Mode) |
| <kbd>↑</kbd> / <kbd>]</kbd> | Increase scroll speed |
| <kbd>↓</kbd> / <kbd>[</kbd> | Decrease scroll speed |
| <kbd>N</kbd> | Jump to **next** SLUG section |
| <kbd>B</kbd> | Jump to **previous** SLUG section |
| <kbd>F</kbd> / <kbd>F11</kbd> | Toggle true fullscreen |
| <kbd>M</kbd> | Toggle Horizontal Mirror (Prompter Glass) |
| <kbd>H</kbd> / <kbd>Esc</kbd> | Hide / Show HUD & dock controls |
| <kbd>R</kbd> | Rewind script to top |
| <kbd>E</kbd> | Open Script Manager / Editor drawer |
| <kbd>S</kbd> | Open Configuration drawer |

---

## Getting Started

### 1. Instant Desktop Launch (Zero Install)
Double-click `Launch-Prompter.bat` on Windows. It will open the application as a dedicated, frameless desktop window.

Alternatively, open `index.html` in any modern web browser (Edge, Chrome, Brave, Firefox).

### 2. Standalone Desktop `.exe` Packaging (Recommended)
The app is packaged into a **single lightweight portable `.exe` (~12 MB)** using **PyInstaller + pywebview**.
This is the preferred build method — no Electron required.

#### Prerequisites
```bash
pip install pywebview pyinstaller
```

#### Build
Double-click **`Build-EXE.bat`** in the project folder — it will automatically build and place the `.exe` in the `dist/` folder.

Or run manually:
```bash
pyinstaller --onefile --windowed --name "AhasaTV-Teleprompter" --icon=logo.ico ^
  --add-data "index.html;." ^
  --add-data "style.css;." ^
  --add-data "app.js;." ^
  --add-data "logo.jpg;." ^
  --add-data "logo.ico;." ^
  --add-data "sample_script.txt;." ^
  app.py
```

Output: `dist\AhasaTV-Teleprompter.exe`

#### Why PyInstaller + pywebview?
- ✅ **~12 MB** portable single file (vs ~180 MB with Electron)
- ✅ Uses the system's native WebView2 (Edge engine) — no bundled browser
- ✅ No installation required — just run the `.exe`
- ✅ `app.py` already handles PyInstaller's `_MEIPASS` asset paths

> **Note:** Electron (`npm install` / `npm run build`) is also configured in `package.json` but produces a much larger output (~180 MB). Use PyInstaller instead.

---

## Credits

Developed & Powered by [Yvexa](https://yvexa.dev).
