# Design Guidelines: Goal Visualization & New Year Countdown App

## Design Approach
**Design System:** Material Design-inspired with influences from Notion and Linear for clean productivity aesthetics. This utility-focused app prioritizes clarity, usability, and visual organization over decorative elements.

## Core Design Principles
1. **Clarity First:** Information hierarchy guides the eye from countdown → yearly goals → monthly → weekly → daily
2. **Color as Function:** Each goal type has a distinct color that serves as a visual categorization system
3. **Breathing Room:** Generous spacing prevents overwhelming the user with too much information
4. **Calendar Context:** Visual structure anchored by calendar metaphor for temporal understanding

## Typography System
- **Font Family:** Inter (primary) via Google Fonts CDN
- **Hierarchy:**
  - Countdown: text-6xl font-bold (hero moment)
  - Section Headers: text-2xl font-semibold
  - Goal Titles: text-lg font-medium
  - Body Text: text-base font-normal
  - Labels: text-sm font-medium uppercase tracking-wide

## Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Consistent padding: p-6 for cards, p-8 for main sections
- Gap spacing: gap-4 between related items, gap-8 between sections
- Container: max-w-7xl mx-auto px-8

**Grid Structure:**
- Desktop: 4-column grid for goal categories (grid-cols-4)
- Tablet: 2-column layout (md:grid-cols-2)
- Mobile: Single column stack (grid-cols-1)

## Color-Coding System
Define 4 distinct, accessible color families (do NOT specify exact colors - engineer will implement):
- **Daily Routines:** Warm accent (indicates immediate/present)
- **Weekly Goals:** Cool accent (short-term planning)
- **Monthly Goals:** Neutral accent (mid-range planning)
- **Yearly Goals:** Bold accent (long-term vision)

Use color consistently in: border accents (border-l-4), background tints (bg-opacity-10), and text highlights.

## Component Library

### 1. Countdown Display (Top Priority)
- Large, centered countdown with days remaining
- Include hours and minutes in smaller text below
- Subtle animation on number changes
- Card container with subtle elevation

### 2. Goal Input Forms
- Separate form sections for each goal type
- Simple text input fields with labels
- "Add" button for each category (icon: plus from Heroicons)
- Clear visual separation between input and visualization areas

### 3. Goal Visualization Cards
- Clean card design with left border accent (color-coded)
- Goal text with adequate padding
- Stacked vertically within category columns
- Subtle shadow for depth
- NO checkboxes or completion indicators

### 4. Calendar Integration
- Month view showing current month
- Visual dots/indicators on dates with associated goals
- Color-coded to match goal categories
- Compact, reference-style calendar (not full-screen)

### 5. Navigation
- Minimal top bar with app title
- Optional settings icon (gear from Heroicons)
- No complex navigation needed

## Layout Structure

**Top Section:**
- Countdown timer (centered, prominent)
- Current date display below countdown

**Main Content Area:**
- 4-column grid for goal categories
- Each column contains:
  - Category header with color indicator
  - Input form at top
  - Visualized goals stacked below

**Side/Bottom Panel:**
- Compact calendar view
- Shows temporal context for all goals

## Icons
Use **Heroicons** (outline style) via CDN:
- Plus icon for add buttons
- Calendar icon for date references
- Clock icon for countdown
- Target icon for goals

## Interaction Patterns
- Form submission adds goals immediately to visualization
- Minimal hover states on cards (slight elevation increase)
- NO drag-and-drop, sorting, or reordering (visualization only)
- NO completion checkboxes or progress tracking

## Accessibility
- Clear focus indicators on all interactive elements
- Semantic HTML structure (header, main, section)
- ARIA labels for icon-only buttons
- Sufficient contrast ratios between text and backgrounds
- Form labels properly associated with inputs

## Images
**No images required** - This is a utility application focused on text-based goal visualization. The visual interest comes from color-coding, layout, and typography hierarchy.

## Animations
Use sparingly:
- Countdown number transitions (smooth)
- Card entrance on goal addition (subtle fade-in)
- NO scroll animations or decorative effects

## Key Constraints
- Single-page application (no routing needed)
- Focus on visualization, not task completion
- Clean, uncluttered interface
- Responsive across all devices
- Fast loading with minimal dependencies