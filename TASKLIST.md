# 3Blue1Brown x CS1.6 Portfolio Project - Comprehensive Tasklist

This document serves as the master tasklist and historical log for the project, tracking every feature implemented and all planned future integrations.

## Phase 1: CS 1.6 Themed Base (Historical - Roman Mendaliev's Commits)
*Initial foundation establishing the CS 1.6 theme, basic UI responsiveness, and core dialog systems.*

- [x] **Core Architecture & UI**
  - Initialized base project structure (`index.html`, `script.js`, `styles.css`).
  - Set up base CS 1.6 themed UI elements (menus, interactive dialogs, strange boxes).
  - Improved mobile responsiveness (adjusted margins, menu placement, and dialog scaling for mobile devices).
  - Added visual sprayprint image filters and corrected CSS color inconsistencies.
  - Implemented the "New Game" and "Options" interactive dialogs with styling.
- [x] **Interactions & Media**
  - Replaced the initial GIF intro with a high-performance WebM format.
  - Added preloading functionality for background images, intro videos, and UI assets to prevent flickering.
  - Integrated immersive audio: sounds for menu clicks, dialog closing, CS "Go" sound on start, and chicken kill sounds on specific picture clicks.
- [x] **Server List Simulation**
  - Implemented the "Servers" dialog simulating a classic server browser for project links.
  - Created a dynamic server refreshing simulation.
  - Registered links and servers (e.g., suickage, codemagics/kodifix, asd.lol).
- [x] **Repository Maintenance**
  - Generated `README.md`, added copyright notices, and applied an MIT `LICENSE`.

---

## Phase 2: Node-Based Portfolio Evolution (Wahab's Commits)
*Massive refactoring to convert the CS 1.6 base into an interactive, node-based portfolio web.*

- [x] **Node Engine & Navigation (Commits `eba1380` - `51e9bbb`)**
  - Transitioned the entire UI to a node-based visual mapping system connecting parent and child nodes.
  - Built a robust dialog management system and interactive modal systems.
  - Implemented a viewport pan and zoom controller for navigating the expansive node web.
  - Visual mapping lines dynamically connect child nodes to their respective parent hubs.
- [x] **Visual Enhancements & Interactivity (Commit `3577205` & `ea6b51c`)**
  - Engineered an interactive click-highlight effect where nodes light up upon interaction.
  - Recalculated node spacing to ensure sprawling web layouts don't overlap visually.
  - Fixed horizontal and vertical scaling algorithms to expand the left-side layout for maximum spaciousness.
- [x] **Personalization & Custom Logic (Commit `1aa1047` - 12 files changed, 935 insertions)**
  - Added extensive node subclasses.
  - Integrated extensive personal imagery (Dusty, Misty, long hair mode, buzz cut mode, hat mode).
  - Passed deep context to AI models by updating `notepad.txt` and integrating custom AI agent skills (`ponytail/SKILL.md` and `AGENTS.md`).
- [x] **Content Expansion (Commit `4ed88e8` - 4 files changed, 350 insertions)**
  - Embedded a Spotify playlist widget directly adjacent to the Options dialog.
  - Added live contribution metrics (GitHub, LeetCode) and updated their UI color schemes.
- [x] **Architecture Refinements & Bug Fixes (Commit `a11b1b2`)**
  - Refactored layout grids heavily, moving from a 1x9 to a 4x4 line layout in `script.js` (31 insertions, 3 deletions).
  - Addressed memory usage and layout rendering speeds.
- [x] **Production Optimization & CI/CD (Commits `633a057`, `7093800`, `8a6cca2`, `70b9192`)**
  - **Performance:** Reduced live API call frequency to drop latency significantly (from ~5s to ~1s). Applied heavy optimization techniques across the codebase.
  - **Linting:** Set up continuous integration using a Deno workflow (`.github/workflows/deno.yml`) for automated linting and testing.
  - **Deployment:** Created a GitHub Actions workflow (`.github/workflows/deploy.yml`) to automatically deploy to GitHub Pages on push.
  - **Analytics:** Implemented Cloudflare Web Analytics in `index.html` to track live portfolio visitor metrics.

---

## Phase 3: "Crazy Good" Future Integrations (Pending Development)
*Upcoming features targeting extreme interactivity and advanced functionality.*

- [x] **3Blue1Brown Engine Integration**
  - [x] Investigated Manim / web canvas equivalents for browser-native math animation.
  - [x] Built a self-contained Canvas 2D mini-engine (`injectMathCanvas()`) with three animation phases: bezier path tracer (matching existing wire aesthetic), typewriter equation writer, and superellipse morph (square ↔ circle). Zero dependencies — vanilla Canvas 2D + rAF only.
  - [x] Added `hub-math` standalone node to the viewport graph, floating above center. Wired with a violet Bezier wire (matching the gold/steel-blue system for other hubs).
  - [x] API hook built in: `window._mathResult = { text: '...' }` replaces the equation in the typewriter phase. Drop any API response into it and the canvas transitions to show the result.
  - [x] RAF loop is stopped cleanly on `exitWorkingsMode()`.

- [ ] **Voice Recognition Integration**
  - [ ] Request and manage microphone permissions via browser APIs.
  - [ ] Integrate Web Speech API (or a robust external STT model).
  - [ ] Map specific vocal commands (e.g., "Open Options", "Zoom In", "Go to Projects") directly to UI functions and node navigation.
- [ ] **Face Tracking Integration**
  - [ ] Set up webcam permission and invisible video streaming elements.
  - [ ] Integrate a face tracking library (e.g., MediaPipe Face Mesh or tracking.js).
  - [ ] Map facial movements (e.g., head tilt, eye gaze) to viewport panning, allowing the user to explore the node web just by moving their head.
- [ ] **Certifications Node Expansion**
  - [ ] Gather all certification images, PDFs, and verification links.
  - [ ] Create a new high-level parent node specifically labeled "Certifications".
  - [ ] Populate the cluster with stylized sub-nodes for each individual certificate, opening rich dialogs upon click.
- [ ] **Tachiyomi Integration**
  - [ ] Investigate Tachiyomi extension mechanics to parse and integrate manga reading/tracking into the portfolio.
  - [ ] Build a dedicated node/UI to display live scraped content or personal reading lists.
- [ ] **Live Projects Demo Showcase**
  - [ ] Set up interactive environments or iframes for live project demonstrations.
  - [ ] Link live demos seamlessly to their respective project nodes in the web.
- [x] **Spotify Widget Cleanup**
  - [x] Fixed Spotify popup clipping bug — popup now appends to `document.body` with `position:fixed`, escaping all `overflow:hidden` ancestors in the node layer.
  - [x] Fixed re-entry bug — `data-part` attribute no longer mutated on Spotify nodes, so exiting and re-entering Workings Mode works correctly. URL key stored in `data-spotify-key` instead.
  - [x] Popup closes on click-outside (delegated listener, auto-removed).
  - [x] Disc spin animation matches theme. Audio player scales correctly within the CS 1.6 aesthetic.
- [x] **Mobile Interface Overhaul**
  - [x] Added `@media (max-width: 480px)` rules: menu scales to `26px`, dialogs fill viewport width, servers table collapses description column on tiny screens.
  - [x] "See The Workings" menu item hidden on phones — node graph is not usable at mobile scale.
  - [x] Dialogs capped at `92dvh` with `overflow-y: auto` to prevent off-screen overflow.
- [x] **Voice Recognition Integration**
  - [x] Integrated native Web Speech API (zero dependencies).
  - [x] Microphone button (🎙) fixed bottom-right; pulses red while listening; hidden if browser unsupported.
  - [x] Commands: "open options", "open new game", "open servers", "quit", "close", "workings", "see the workings", "zoom in", "zoom out".
  - [x] Toast notification shows recognised transcript (✓ matched, ? unmatched).
- [ ] **LCD Stats Hub Node**
  - *Visible only in Workings Mode. A new top-level standalone hub node (same tier as `hub-math`) wired in with its own Bezier wire color.*
  - [ ] Add `hub-lcd` DOM node to `index.html` following the `hub-math` pattern (`data-part="lcd-stats"`).
  - [ ] Wire `hub-lcd` into `hubTargets` in `script.js` with a fixed floating position (e.g., bottom-left of viewport).
  - [ ] Assign a unique wire color for `hub-lcd` in `drawWires()` (do NOT invent — match real LCD blue backlight: `rgba(100,180,255,0.8)`).
  - [ ] Add `#hub-lcd` CSS block in `styles.css`: LCD aesthetic blended with CS 1.6 UI — dark screen, blue backlight glow, dot-matrix / monospace font, green PCB-style border.
  - [ ] Implement `injectLcdStats()` in `script.js`: renders stats screen inside the node body. Auto-cycles through stat screens on a timer (like a real LCD rotating display). Click manually advances to next screen. Hover shows tooltip with extra detail.
  - [ ] **Stat screens (working model — real data wired in later):**
    - Screen 1 — Visitors: `VISITORS` / `SESSIONS` (placeholder `0` until Cloudflare proxy is set up)
    - Screen 2 — Performance: page load time + Time to First Byte from `performance.getEntriesByType('navigation')[0]`
    - Screen 3 — Memory: `performance.memory.usedJSHeapSize` (Chrome only, graceful fallback)
    - Screen 4 — Uptime / Timestamp: current date + time rendered in real-time
  - [ ] Stop/clear the LCD timer in `exitWorkingsMode()` (same cleanup pattern as RAF loop for `hub-math`).
  - [ ] **Cloudflare data (deferred):** Visitor/session counts are `0` placeholders. Real data requires a serverless proxy (Cloudflare Worker or Vercel function) to safely call the Cloudflare Analytics API — build this separately once working model is confirmed.
