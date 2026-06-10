---
name: Doping Notebook
colors:
  surface: '#141218'
  surface-dim: '#141218'
  surface-bright: '#3b383e'
  surface-container-lowest: '#0f0d13'
  surface-container-low: '#1d1b20'
  surface-container: '#211f24'
  surface-container-high: '#2b292f'
  surface-container-highest: '#36343a'
  on-surface: '#e6e0e9'
  on-surface-variant: '#cbc4d2'
  inverse-surface: '#e6e0e9'
  inverse-on-surface: '#322f35'
  outline: '#948e9c'
  outline-variant: '#494551'
  surface-tint: '#cfbcff'
  primary: '#cfbcff'
  on-primary: '#381e72'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#6750a4'
  secondary: '#cdc0e9'
  on-secondary: '#342b4b'
  secondary-container: '#4d4465'
  on-secondary-container: '#bfb2da'
  tertiary: '#e7c365'
  on-tertiary: '#3e2e00'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#141218'
  on-background: '#e6e0e9'
  surface-variant: '#36343a'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
  max-width: 1280px
---

## Brand & Style

The design system establishes a professional, calm, and highly analytical environment tailored for athletes and sports medical staff. It prioritizes information density and clarity while maintaining a sophisticated dashboard aesthetic. The personality is defined as a "vigilant companion"—reliable and precise without being alarmist.

The visual style is a blend of **Corporate Modern** and **Glassmorphism**. It utilizes a deep, multi-layered dark theme to reduce eye strain during intensive data review. By using soft ambient glows and vibrant gradients against a charcoal base, the system creates a high-tech "command center" feel that evokes trust and technical superiority. Key to this brand is the avoidance of binary "Safe" vs "Banned" language; the UI instead facilitates risk management and informed decision-making through nuanced status levels.

## Colors

The palette is anchored by a sophisticated **Charcoal-Navy base (#26313A)**, providing a low-contrast foundation for data visualization. Primary actions are driven by a dynamic **Coral-to-Violet gradient**, which serves as the signature brand element and high-priority call-to-action color.

Status colors are meticulously chosen to provide clear guidance without clinical harshness:
- **Confirmation (Teal):** Used for items identified in databases that match current search criteria.
- **Review (Amber):** Signals ingredients requiring closer inspection or manual verification.
- **High Risk (Coral/Red):** Highlights substances explicitly prohibited or high-probability matches for banned ingredients.
- **Indeterminable (Gray/Violet):** Reserved for items with insufficient data, emphasizing the need for caution.

## Typography

This design system utilizes **Hanken Grotesk** as the primary typeface for its sharp, contemporary geometry and exceptional readability in technical dashboards. It balances the warmth required for a personal "notebook" with the precision of a medical tool.

For secondary metadata, ingredient codes, and status tags, **JetBrains Mono** is employed. This monospaced font introduces a technical, data-driven feel that distinguishes raw information from UI instructions. 

**Responsive Scaling:** On mobile devices, `headline-xl` should scale down to 32px (matching `headline-lg`) and `headline-lg` should scale to 24px to ensure headers do not break into excessive lines in narrow viewports.

## Layout & Spacing

The layout follows a **12-column fluid grid** for desktop and a **4-column grid** for mobile. A strict 8px spacing scale (8, 16, 24, 32, 48, 64) ensures rhythmic consistency across all dashboard modules.

Content is organized into "widgets" or "cards." On desktop, these cards span variables of 3, 4, 6, or 12 columns depending on information complexity. On mobile, all cards reflow to a single column stack with 16px horizontal margins. The layout prioritizes a "Safe Area" for critical actions, keeping navigation easily accessible at the bottom on mobile devices and via a persistent sidebar on desktop.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** supplemented by subtle ambient shadows. 
1. **Base Level:** The background (#26313A) represents the lowest depth.
2. **Surface Level:** Elevated cards use #303B45. These are rendered with a 24px corner radius and a soft, 15% opacity black shadow with a 20px blur to create a "floating" effect.
3. **Interactive Level:** Hover states on cards should slightly lighten the surface color or add a thin 1px border using the primary gradient at 30% opacity.
4. **Overlays:** Modals and dropdowns use the same surface color but include a backdrop blur (12px) to the layers beneath them, reinforcing the glassmorphism aesthetic.

## Shapes

The design system uses a pronounced **Rounded** language to soften the technical nature of the content. 
- **Large Components (Cards, Modals):** 24px radius (`rounded-xl` / 1.5rem).
- **Standard Components (Buttons, Inputs):** 8px radius (`rounded-md` / 0.5rem).
- **Small Components (Chips, Tags):** Full pill-shape for status indicators.

Thin-line iconography (2px stroke) with slightly rounded terminals should be used to match the soft-geometric feel of the containers.

## Components

### Buttons & CTA
- **Primary CTA:** Uses the signature gradient with white text. On hover, apply a subtle outer glow using the violet end of the gradient.
- **Secondary CTA:** Transparent background with a 1px gradient border.
- **Ghost Actions:** Text-only with a subtle violet tint on hover.

### Form Elements
- **Inputs:** Dark background (#1E262D), 1px border (#3D4A56). On focus, the border transitions to the Violet (#7C4DFF) with a soft 4px outer glow.
- **Dropdowns:** Use the surface-elevated color with a search-input field at the top for filtering substances.

### Status Chips
- Small, pill-shaped tags using the status colors. For accessibility, pair the color with a secondary indicator (e.g., a small dot or specific icon) to ensure clarity for colorblind users.

### Cards
- Standard containers for drug information. Every card must have a consistent header area for the substance name and a footer area for the "Last Updated" timestamp or risk source.
- Use a 24px radius to maintain the established shape language.

### Lists
- Tabular data should be grouped within cards. Use 1px dividers (#3D4A56) and ensure ample vertical padding (16px) between rows for readability on high-resolution displays.