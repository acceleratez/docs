# Interface Design Issues and UI Patterns

Concrete, reusable **UI patterns** and layout principles for building usable interfaces — the "vocabulary" an experienced designer draws on.

---

## UI Design Patterns — Overview

- **Design patterns** are recurring solutions that solve common design problems; they are standard reference points, provide a common language between designers, and let teams debate alternatives by name.
- Patterns apply at many levels: input controls, forms, navigation, icons, layout, feedback.

---

## Input Controls

### Checkboxes vs Radio Buttons
- **Radio buttons**: list of two or more **mutually exclusive** options; the user must select **exactly one**.
- **Checkboxes**: list of options; the user may select **any number** (zero, one, or several).
- A **stand-alone checkbox** = a single on/off option.

### Toggle-Switch
- Should take **immediate effect** and **not** require Save/Submit (unlike a single checkbox, which often needs an explicit apply).

### Input Steppers
- A two-segment control to incrementally increase/decrease a numeric value.
- Avoid for values with large variability, or when users don't know exact values (use a relative/slider control instead).

### Split Buttons
- A button with two parts: a **label** (selects a default action) and an **arrow** (opens a list of other actions).
- Efficient for accessing the most-commonly used tools.
- Do **not** use split buttons for website navigation menus.

---

## Forms and Wizards

### Web Form Design
- Keep it short; visually group related labels and fields.
- Use logical sequencing in a **single-column** layout.
- Match fields to the type and size of input.
- Explain any input/formatting requirements.
- **Avoid Reset and Clear buttons.**
- Provide highly visible, specific error messages.

### Wizard
- A step-by-step process where the user inputs information in a prescribed order; later steps may depend on earlier ones, and the system computes the appropriate path.
- **Dynamic form/wizard**: the distinction has become fuzzy.
- **Disadvantages of wizards**: higher interaction cost (more clicks); hard to transfer/compare info across steps; not gracefully interruptible; may block access to other parts; limit user control/creativity.
- **Designing usable wizards**: use for novice users or infrequent processes; enforce a clear sequential order; allow users to exit midway and **save state**, resuming later.

---

## Tooltips, Dialogs, Bottom Sheets

### Tooltips
- A brief, informative message appearing when the user interacts with a GUI element.
- **Tooltip vs Popup tip**:
  | | Tooltip | Popup tip |
  |---|---|---|
  | Type of site | Desktop | Any |
  | Initiated by | Hover (mouse/keyboard) | Touch/click |
  | Terminated when | User leaves area | User taps to close / clicks elsewhere |
  | Paired element | Icon, link, button, image | "?"/"i" icon |
- Provide tooltips for **unlabeled icons**; ensure moderate contrast against the background; position so they don't block related content.

### Modal Dialog
- A dialog on top of main content that moves the system into a special mode requiring user interaction; it **disables main content** until explicitly interacted with.
- Use for important warnings, to prevent/correct critical errors, or to request information critical to continuing; to fragment a complex workflow into simpler steps; to ask for info that lessens user work.
- **Avoid** modal dialogs for complex decision-making.

### Bottom Sheet
- An overlay anchored to the **bottom edge** of a mobile screen showing additional details/actions.
- Can be **modal** (blocks background interaction) or **nonmodal** (presents detail in parallel with main content).
- A mobile pattern for temporary contextual info while maintaining access to main content; for a few options/extra info, enables quick access to controls.

---

## Icons

Three kinds:
- **Resemblance icons** — depict the physical object (envelope for email). Highest usability, but can differ across countries (same thing looks different elsewhere).
- **Reference/symbolic/index icons** — depict something by analogy/reference.
- **Arbitrary icons** — meaning only by convention; hardest to learn unless widely standardised. Don't be the one to teach the world a new arbitrary icon — you'll likely fail.

General guidance:
- Resemblance icons usually have the best usability; an arbitrary icon can be great *if already standardised*.
- **Always present a text label alongside an icon** to clarify meaning.
- Benefits of icons in a GUI: good targets, save space, display many in small space, fast to recognise at a glance, no translation needed, visually pleasing, support a product family.

---

## Indicators and Feedback

- Users are ~**37% faster** at finding items when visual indicators vary in **both colour and icon** vs text alone; between colour or icon, icons with strong **information scent** beat colour alone.
- **Progress indicators** make a process more tolerable by reducing uncertainty; users report higher satisfaction and will wait longer with a dynamic progress indicator.
- **Always give immediate feedback.**

---

## Menu Design

Guidelines:
- Show navigation on larger screens; put menus in expected locations.
- Use link-text colours that contrast with the background.
- Don't cover the screen with the menu on larger screens.
- Indicate the user's current location in the menu.
- Provide local navigation menus for closely related content.
- Use visual cues (icons) for long menus.
- Clearly signify submenus with a caret/arrow icon.

### Contextual Menu
- Include only a focused set of actions/common options related to the task.
- Show visual elements indicating availability; limit submenus.
- Show keyboard shortcuts; limit items (<10–12); disable irrelevant ones.

### Expandable Menus
- **Pull-down**, **rectangular/mega** menus, **pie/radial** menus.
- Linear menus best for few options; as number grows, rectangular/mega menus fit better.
- **Pie menus** suit touchscreens and optimise reach time to options, but are only now becoming familiar via touch devices.

---

## Site Navigation Elements

### Breadcrumbs
- Support **wayfinding** — make users aware of their current location in the site hierarchy.
- Should **not** replace the global nav bar or local section nav.
- Display the **current location in the hierarchy**, not session history.
- The current page's breadcrumb should **not** be a link.
- Don't let breadcrumbs wrap to multiple lines.

### Accordion
- A header that reveals/hides associated content when clicked.
- **Pros**: reduces clutter, minimises scrolling, conveys page overview, improves scannability, gives direct access.
- **Cons**: fragmented access, increased interaction cost, hard to print.
- Use when: little info on page; logical step-by-step process; independent sections unlikely needed simultaneously; long content on a small window. Avoid for little content, deep hierarchies, or scattered content.

### Footers
- Found at the bottom of almost every page; a second chance to convince, a last resort for hard-to-find content.
- Elements: utility links, doormat navigation, secondary-task links, site map, testimonials/awards, brands, customer engagement (newsletters/social).
- **Pitfalls & fixes**: >2 hierarchy levels → reprioritise; unclear link names → use conventional terms; unclear structure → use grouping/visual hierarchy; hidden/illegible → legible font with decent contrast, avoid decorative fonts.

### Local Navigation
- Contextual to the user's current location in the IA; indicates "You are here"; links to other/deep parts.
- Should be visible but **less salient than global navigation**.

---

## Search

- **Visible and simple**: the user's lifeline for complex sites. Offer a simple box on the homepage; play down advanced search/scoping. Search lets users control their destiny and is an escape hatch when lost.
- Should be a type-in field (not a link), usually top-right, wide enough for a typical query.
- Most users **cannot** use advanced/Boolean syntax and **rarely look past the second page** of results.

### "No Results" Pages
High risk of abandonment, but good design turns it into discovery:
1. Clearly explain there are no matching results.
2. Offer starting points: restate the original query; provide a search box with the query still in it; suggest similar queries; spelling corrections; advice on modifying queries.
3. **Don't mock the user.**

### Enriched Site-Search Suggestions
- Expanded recommendations: popular/trending/frequently searched, historical (recent searches), featured results, related category links.
- Implementation: don't eliminate simple text autosuggestions; limit graphical/dynamic content (slower load, banner blindness); clearly label suggestion types; maintain dedicated spaces; don't assume regular users will learn them over time.

---

## Layout of Screen Elements

- **Layout** = the particular arrangement of elements (informational, functional, framing, decorative). Thoughtful placement guides users about relative importance.
- A clean layout follows **visual information hierarchy**, **visual flow**, **alignment through a grid**, and **Gestalt principles**.

### Gestalt Principles (Perceptual Organisation)
- **Proximity** — elements close together are perceived as related.
- **Similarity** — similar elements (colour/shape/size) are grouped.
- **Continuity** — the eye follows continuous lines/pathways.
- **Closure** — incomplete shapes are seen as whole.
- **Figure/Ground** — we separate foreground from background.
- **Symmetry / Common Fate** — symmetric or co-moving elements group.
- Example: typography obeys these laws (consistent type families read as coherent).

### Basics of Layout
- **Visual hierarchy**: most important content stands out most; least important stands out least. Driven by **size, position, colour, density, alignment, grid**. It tells users relationships and what to do next.
- **Visual flow**: the tracks the eye follows while scanning. Control it so readers follow the correct sequence; strong focal points can distract; use implied (curved/straight) lines to connect elements.
- **Dynamic displays**: scroll bars (viewport onto a large thing); **responsive enabling** (enable functionality only after a specific action); **progressive disclosure** (show info only after a specific action).
- **UI regions**: header/window title, menu/navigation, main content area, footers, panels.

### Layout Patterns (desktop/web)
- **Visual Framework**, **Center Stage** (with a panel), **Grid of Equals**. Choose driven by the content needed to achieve the user's objective.

### Chunking Information
- **Titled Sections** — separate sections with a strong title and visual separation.
- **Module Tabs** — tabbed areas showing one module at a time.
- **Accordion** — collinear stack of independently open/closeable panels.
- **Collapsible Panels** — secondary/optional content openable/closeable by the user.
- **Movable Panels** — boxes openable/closeable and freely arranged (e.g. Adobe Illustrator).

---

## Summary
- UI patterns (input controls, forms/wizards, tooltips, dialogs, bottom sheets, icons, menus, navigation, search, layout) are the reusable building blocks of usable design.
- Pair icons with text; give immediate feedback; respect Gestalt, visual hierarchy, and visual flow; chunk information to manage complexity.
