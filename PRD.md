# CosmicVibes Product Requirements & Design System (PRD)

This document serves as the absolute source of truth for the application's UI components, behavior, and design system. 
It establishes a strict set of rules to ensure visual consistency and pixel-perfect attention to detail across the app.

## 1. Core Architecture & Philosophy
- **Vibe:** "Apple Magic" meets cosmic aesthetics. The design must feel expensive, quiet, and profound. No loud colors or blocky shapes.
- **Scroll Logic:** Ensure all scrolling flows completely through the app's single `<main>` element to guarantee zero double scrollbars on any device.
- **Attention to Detail:** UI elements performing the same function (e.g., interactive lists or tiles) MUST share an identical foundational layout and structure, ensuring the user gets a seamless and continuous experience.

## 2. Global Component Standards

### 2.1 The "Flip Tile" Component (Interactive Details)
Used for rendering rows/cards that flip to reveal text upon click (e.g., "Celestial Structure", "Connection Architecture").
- **Dimensions & Wrapper:** 
  - `h-[64px] md:h-[72px]`
  - `rounded-2xl border border-white/5 bg-white/[0.02]`
  - `transition-all hover:border-white/20 hover:bg-white/[0.05] cursor-pointer relative overflow-hidden`
- **Icon / Symbol Container:**
  - MUST be a perfect geometric circle. 
  - Uses fixed width and height with centering to prevent oval-distortion: `w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.02] border border-white/5 shrink-0`.
- **Primary Label (Front):**
  - Text style: `text-[10px] md:text-xs font-semibold text-gray-300 uppercase tracking-widest truncate`.
- **Value / Score (Front):**
  - Numbers: `text-xl md:text-2xl font-light text-white leading-none`.
  - Symbols/Words: `text-sm md:text-base font-light text-gold tracking-tight`.
- **Hidden Text (Back):**
  - Must be centered perfectly: `absolute inset-0 flex flex-col items-center justify-center text-center px-4 bg-white/[0.02]`.
  - Text style: `text-[9px] md:text-[10px] uppercase font-light tracking-[0.2em] opacity-80 leading-relaxed px-2 text-gold` (or context color).
- **Animation:**
  - Avoid heavy 3D flip animations; prefer immediate direct substitution (using conditional rendering like `{!isFlipped ? (...) : (...)}`) for a snappier, instant "card flip" sensation that mirrors high-end native iOS patterns.

### 2.2 Background Artifacts & Auras
- **Zodiac Wheels / Cosmic Assets:** Should fade quietly into the background. Set opacity to `50%` or use `opacity-50 mix-blend-screen overflow-hidden` to avoid dominating the foreground.
- **Glows:** Never use solid background spheres. Always use `blur-3xl` or `blur-[100px]` with minimal opacity (`purple-500/10` or `gold/5`). 

### 2.3 Typography & Headers
- **Signatures:** Ultra-wide tracking (`tracking-[0.2em]` to `tracking-[0.5em]`).
- **Main Titles/Results:** `font-light` or `font-medium text-transparent bg-clip-text bg-gradient-to-r`.

## 3. Best Practices for Developers
- **Check Your Work:** When copying an existing UI component pattern for a new page, look closely at the paddings, dimensions, flexbox directives, and shapes. If an icon circle is perfectly round in one view, ensure it is perfectly round in all views.
- **Consistency is King:** We prefer identical component architecture across the board rather than unique custom designs for similar data types.
