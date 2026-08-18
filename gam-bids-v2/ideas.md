# GAM-BIDS Design Philosophy

## Design Approach: **Civic Modernism**

The GAM-BIDS platform is a **civic infrastructure tool**—it connects Gambian businesses, organizations, and citizens to procurement opportunities. The design reflects this mission through a **contemporary, accessible, and trustworthy aesthetic** that balances professionalism with warmth.

### Design Movement
**Civic Modernism** — a design language that combines the clarity and efficiency of modernist principles with the human warmth and cultural specificity of contemporary African design. Think institutional websites that feel alive, not sterile.

### Core Principles
1. **Clarity Over Decoration** — Information hierarchy is paramount. Every element serves a function.
2. **Accessibility as Foundation** — High contrast, readable typography, and keyboard navigation are non-negotiable.
3. **Cultural Grounding** — Color palette and motifs reference Gambian landscapes and heritage without pastiche.
4. **Efficiency & Trust** — Users should feel confident they're finding what they need quickly.

### Color Philosophy
- **Primary: River Blue** (`#1C4E63`) — Represents The Gambia's defining natural feature, the River Gambia. Conveys trust, stability, and institutional authority.
- **Accent: Laterite Red** (`#A63D2F`) — The color of Gambian earth and laterite cliffs. Adds warmth and urgency where needed (deadlines, CTAs).
- **Secondary: Groundnut Gold** (`#D99A3D`) — Gambia's agricultural heritage. Used for highlights and secondary actions.
- **Neutral: Ink & Paper** (`#221E19` on `#F3EEE2`) — Natural, warm neutrals inspired by paper and ink, not cold grays.

### Layout Paradigm
**Asymmetric Grid with Breathing Room** — The hero section uses a 1.15:0.85 ratio (content left, stats right). The tender results use a sidebar-plus-main layout with generous whitespace. No centered, monotonous grids.

### Signature Elements
1. **River Divider SVG** — A wavy divider that echoes the River Gambia, used between major sections to create visual flow.
2. **Deadline Stamp** — A rotated circular badge with days-to-deadline, styled like a postal stamp. Adds personality and urgency.
3. **Sector Icons with Color Tags** — Each sector (agriculture, energy, infrastructure, etc.) has a distinct emoji and color tag for quick visual scanning.

### Interaction Philosophy
- **Hover States** — Cards lift slightly and gain a subtle shadow. Links change color to River Blue. Buttons scale to 0.97 on click for tactile feedback.
- **Search & Filter** — Responsive and immediate. Quick tags for popular searches reduce friction.
- **Empty States** — Friendly, helpful messages when no results match filters—never a blank page.

### Animation
- **Entrance**: Subtle fade-in for cards and sections (150–200ms, ease-out).
- **Hover**: Smooth color transitions (150ms) and lift effects (8px shadow, 150ms).
- **Click**: Button scale (0.97, 100ms) for tactile confirmation.
- **Scroll**: Sticky filter panel and header for persistent navigation.
- **Respect `prefers-reduced-motion`**: All animations gated behind media query.

### Typography System
- **Display Font**: Fraunces (serif, bold) — Used for headings (h1, h2, h3). Conveys authority and cultural grounding.
- **Body Font**: Inter (sans-serif, 400–600) — Clean, readable, modern. Used for body text and UI labels.
- **Mono Font**: JetBrains Mono — Used for tender codes and technical details. Adds precision.

**Hierarchy:**
- h1: 44px, Fraunces 700, line-height 1.08
- h2: 24px, Fraunces 700
- Body: 15–16px, Inter 400–500
- Labels: 12–13px, Inter 600

### Brand Essence
**One-liner:** The trusted, transparent, and efficient gateway to every public and private procurement opportunity in The Gambia.

**Personality:** Professional yet approachable, institutional yet human, modern yet grounded in Gambian identity.

### Brand Voice
**Headlines & CTAs:**
- ✅ "Every Gambian tender, in one place."
- ✅ "Search 214 open tenders across The Gambia"
- ❌ ~~"Welcome to our website"~~ (generic)
- ❌ ~~"Get started today"~~ (cliché)

**Microcopy:**
- "No tenders match your filters. Try clearing a filter or searching a broader term." (helpful, not dismissive)
- "Closing within 7 days" (specific, actionable)

### Wordmark & Logo
**Mark:** "GB" in a rounded square with a gradient from Laterite Red to Groundnut Gold. Clean, modern, instantly recognizable.

**Wordmark:** "GAM-BIDS" in Fraunces Bold, with a small subtitle "Gambia Tender Search" in Inter.

### Signature Brand Color
**River Blue** (`#1C4E63`) — This is the ownable, unmistakable color of GAM-BIDS. Used in the header, links, buttons, and key accents throughout.

---

## Implementation Notes
- All color values use CSS variables defined in `client/src/index.css`.
- Tailwind utilities extend the design tokens for consistency.
- SVG dividers are optimized for performance and accessibility.
- The design is mobile-first, with responsive breakpoints at 560px and 980px.

## Style Decisions

- The GB mark must render as a recognizable rounded-square gradient badge from Laterite Red to Groundnut Gold, paired with the Fraunces GAM-BIDS wordmark and Inter subtitle wherever space allows.
- Deadline stamps use compact, human-readable urgency labels such as “6 days left” or “Closes soon”; raw timestamps and oversized numbers are not part of the public interface.
- Sector navigation uses consistent two-letter icon badges and palette-grounded color tags instead of default emoji-only tiles.
- Auth screens share the same River Blue, paper texture, logo lockup, and civic copy voice as the public homepage.
