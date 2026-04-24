# CosmicVibes Design & Architecture Standards (AGENTS)

**CRITICAL DIRECTIVE**: You are building "CosmicVibes" – a premium, esoteric web app (Astrology + Personality Types). This file defines the absolute source of truth for UI, layout, colors, and architecture. If you deviate from this, the app will break, double scrollbars will appear, or the aesthetic will look cheap. Adhere strictly to these rules in all future generations.

## 1. Concept & Tone
- **Vibe**: "Apple Magic" meets deep space and astrology. Mystical, profound, supportive, aesthetic, and expensive.
- **Audience**: Modern seekers, young women interested in tarot/astrology, appreciating deep aesthetics over flashy UI. 
- **Dark Mode Only**: The application exists entirely in a dark interface (pure black `bg-black` or `bg-[#050505]`).

## 2. Layout & Scroll Architecture (CRITICAL: ZERO DOUBLE SCROLLBARS)
- **Single Source of Scroll**: Do **NOT** add `overflow-y-auto`, `min-h-screen`, or scrollbars to individual components or pages (like `ExperienceFlow.tsx` or `SynastryResult.tsx`). The *only* element that should ever scroll is the `<main>` tag in `App.tsx`.
- **Flex Constraints**: Use `flex-1 min-h-0 overflow-y-auto overflow-x-hidden` on the main wrapper. `min-h-0` is mandatory. It prevents flex layout sub-containers from blowing out the viewport height and causing phantom double-scrollbars on mobile.
- **Page Sizing**: Let the parent container dictate sizing. Inner components should just be `w-full relative`. Do not use static heights that force overflows.
- **Header Pattern**: The `<header>` is "ghosted". It is `fixed`, `z-50`, and `pointer-events-none` (so it doesn't block scroll clicks on the page). Its inner content (buttons, logo) is `pointer-events-auto`. 
- **Content Padding**: Because the header floats, the `<main>` container must have top padding (`pt-16 md:pt-20`) to prevent content from hiding underneath the buttons.

## 3. Color Palette & Aesthetics
- **Muted, Deep, Romantic (NO ACID/PASTEL)**: NEVER use pastel 200/300/400 colors (e.g., `text-amber-200`, `text-purple-300`). They contrast poorly and look acidic against black.
- **The Core Palette**: Rely strictly on Tailwind `500` tones for saturation without blinding brightness:
  - Base/Brand: `purple-500`
  - Archetypes/Core: `emerald-500`
  - Accents: `amber-500` (soils/gold), `rose-500` (emotions), `sky-500` (soul/moon), `red-500` (passion), `teal-500` (intellect/mind).
- **Hex Codes**: Stop using raw hex codes like `#ba76ff` unless specifically required by SVGs. Rely on semantic Tailwind classes (`text-purple-500`) for universal consistency.
- **Backgrounds**: Pure black (`bg-black`) with subtle glassmorphism on UI cards (`bg-white/5 border border-white/10 backdrop-blur-3xl`).
- **Auras & Glows**: Create cosmic auras using absolutely positioned empty `div`s with heavy blurs behind elements: `bg-purple-500/10 blur-[120px] mix-blend-screen rounded-full`.

## 4. Typography
- **Font Selection**: `font-sans` (Inter).
- **Signatures & Labels**: Extreme letter spacing (`uppercase tracking-widest`, `tracking-[0.2em]`, `tracking-[0.4em]`) combined with `font-light` or `text-[10px]` for subheaders, labels, categories, and tags. 
- **Headings & Data**: For scores or main titles, use `font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-600` or `font-light text-[64px]` to create Apple-like premium contrast. Avoid standard `font-bold` for large elements; go either extremely light or extremely black.

## 5. UI Elements & Shapes
- **Corner Radii**: Aggressive rounding to feel modern and non-boxy. `rounded-2xl` is the absolute minimum. Use `rounded-[2rem]`, `rounded-[3rem]`, or `rounded-[4rem]` and `rounded-full` for major UI cards.
- **Borders**: Thin, barely visible borders on cards (`border-white/5` or `border-purple-500/20`). Do not use opaque borders.

## 6. Animations (Framer Motion)
- Use standard, fluid ease transitions (e.g., `transition={{ duration: 0.4, ease: "easeOut" }}`).
- Use `<AnimatePresence mode="wait">` for route/page transitions to prevent DOM elements from stacking and expanding the page layout during mount/unmount phases.
- Do NOT use harsh `animate-pulse` classes for stars or auras. Prefer smooth CSS like `animate-spin-slow` (duration 3-10s) or controlled `motion/react` keyframes with long durations (`duration: 4, repeat: Infinity, ease: 'linear'`).

## 7. Interaction & UX
- **Haptics**: Always trigger `navigator.vibrate` (via standard utility) or `feedback.light/medium/heavy()` from `../lib/haptics` on major button clicks or flow completions. 
- **Tactile UI**: `active:scale-95` on standard buttons to give a physical push feel.
- **Empty States / Share Cards**: Follow the established `[Entity]Share.tsx` logic using hidden large `div`s (e.g., 1080x1920) rendered with `html-to-image` for pixel-perfect Instagram/Telegram sharing.
