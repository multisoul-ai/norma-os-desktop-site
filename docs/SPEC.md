# Norma OS Website Refactor SPEC

## 1. Background and goal

The current website has a strong visual identity but explains the product mainly through static screenshots and several equally weighted concept sections. The refactor will make Norma OS immediately understandable as the command center from which a user directs multiple Coding Agents.

The primary conversion is a direct download of the latest Apple Silicon DMG.

## 2. Scope

### In scope

- English homepage at `/`
- Chinese homepage at `/zh-cn`
- URL-based language switching
- A desktop split hero with copy on the left and a Liquid Glass product stage on the right
- A desktop sticky story stage with four product chapters
- A non-sticky mobile story layout
- A compact capability grid, product trust section, FAQ, final download CTA, and footer
- Temporary video media derived from `/Users/alan/Documents/壁纸/mut`
- Responsive, accessible, reduced-motion, and performance-aware behavior

### Out of scope

- Docs, blog, changelog, enterprise, and solutions sub-sites
- Competitor comparison tables
- Analytics SDKs
- A long-form product demo before a real narrated asset exists
- Permanent use of the placeholder videos

## 3. Product language

The canonical glossary is maintained in `CONTEXT.md`.

- Norma OS is a **Command Center**, not a generic AI desktop or window manager.
- Norma AI coordinates Coding Agents; it does not replace them.
- Liquid Glass is color-neutral and must not depend on purple gradients.

## 4. Information architecture

1. Floating Liquid Glass navigation
2. Split hero
3. Agent compatibility strip
4. Four-part sticky product story
5. Six-item capability grid
6. Local-first trust section
7. FAQ
8. Final download CTA and footer

The old standalone Product Intro, Status Language, Voice, Principles, and AI Soul sections are removed.

## 5. Hero

- Left: short positioning statement, concise body copy, and two actions
- Primary action: transparent Liquid Glass `Download for Mac` link to the latest DMG
- Secondary action: `See it in action`, linking to the four-part story
- Right: a large, neutral Liquid Glass Norma OS shell containing a short looping video
- The hero must not use the old purple optical images or centered oversized composition

## 6. Product story

Desktop uses one sticky product stage. The active stage changes as the user scrolls through:

1. **One canvas, every agent**
2. **Work stays alive**
3. **Steer through Norma**
4. **Leave. Return. Continue.**

Mobile renders the matching media beneath each chapter and does not use sticky or scroll-jacking behavior.

## 7. Visual system

- Warm white, graphite, transparent glass, and content-derived colors
- Purple is not a brand accent
- Liquid Glass uses translucency, edge refraction, highlights, and layered depth
- Download buttons are transparent glass, not solid color
- Norma appears only as a functional coordination interface in the third story chapter
- Reference the composition and rhythm of Ego Lite without copying its assets, browser mockups, exact typography, or text

## 8. Motion and media

- Native browser scrolling; no scroll hijacking or forced snapping
- Subtle crossfades, small translations, and glass highlight changes
- Short silent loops explain one capability each
- Only visible media plays; inactive media pauses
- Reduced-motion users receive static posters and no transition animation
- Placeholder videos use only the Agent-work scenes from `mut`; unrelated anime and scenery clips are excluded from the main story

## 9. Performance

- Desktop video maximum: 1080p
- Mobile video maximum: 720p
- Target encoded size per loop: approximately 3–5 MB
- Hero poster is visible before video playback
- Below-fold media uses lazy loading
- Only one desktop story video decodes and plays at a time
- Original 4K assets are transcode sources, not production downloads

## 10. Localization and SEO

- `/` is canonical English
- `/zh-cn` is canonical Simplified Chinese
- The two routes share structure and media but maintain independently authored copy
- Language links change URL rather than browser storage
- Each route exposes appropriate title, description, alternate language metadata, and page language

## 11. Acceptance criteria

- A first-time visitor can identify Norma OS as a command center for multiple Coding Agents from the hero
- The primary CTA directly downloads the latest Apple Silicon DMG
- The four story chapters are visible in the agreed order
- Desktop shows one sticky stage; mobile shows inline story media
- Purple concept artwork and the old standalone sections are absent
- English and Chinese routes render independently and link to one another
- Media respects reduced motion and pauses when inactive
- The site passes tests, type checking, lint, and production build
