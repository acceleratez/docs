# Interaction Design Basics

The design process and the practical basics of structuring usable interactions — what design *is*, the process, knowing your user, scenarios, navigation, screen layout, affordances, and prototyping.

---

## What is Design?

Design = **achieving goals within constraints**.
- **Goals** — purpose: who is it for, why do they want it.
- **Constraints** — materials, platforms.
- **Trade-offs** — balancing conflicting requirements.
- **Golden rule**: **understand your materials** — for HCI this means:
  - understand **computers** (limitations, capacities, tools, platforms);
  - understand **people** (psychological, social aspects, human error);
  - and understand **their interaction**.

### Human "Error" is Normal
Accident reports often blame "human error," but consider: a concrete lintel breaks under too much weight and we blame *design*, not the lintel. We *know* how concrete behaves under stress. **Human error is equally normal** — we know how users behave under stress, so **design for it**. Treat the user at least as well as physical materials.

---

## The Process of Design

```
        ┌─────────────── evaluation ───────────────┐
        │                                          │
 requirements → analysis → design → prototype → implement & deploy
   (interviews,        (principles,      (iteration)
    ethnography)        guidelines,
                       dialogues,
                       notations)
```

- **Steps**: requirements (what is there & what is wanted) → analysis (ordering/understanding) → design (what to do & how to decide) → iteration/prototyping (getting it right & finding what is really needed) → implementation & deployment.
- **Limited time ⇒ trade-offs**: usability vs feature completeness; finding and fixing problems; deciding *what* to fix. **"A perfect system is badly designed"** — too much effort spent perfecting is itself a design failure.

---

## User Focus

You are **probably not like your users** — talk to them, watch them, use your imagination.

### Persona
- A description of an *example* user; **not necessarily a real person**; used as a **surrogate** ("what would Betty think?").
- **Details matter** — they make the persona "real" and keep design grounded.
- Example: *Betty, 37, Warehouse Manager for 5 years, no university but evening business diploma, two children, slightly restricted right-hand movement after an accident, enthusiastic but threatened by yet another new system.* A persona like this surfaces accessibility, training, and motivation issues that abstract "the user" hides.

### Scenarios
- **Stories for design**: rich, step-by-step walkthroughs of what users want to do — what they see (sketches/screenshots), what they do (keyboard/mouse), what they think.
- **Purposes**: communicate with others (designers, clients, users); validate other models (play the scenario against them); express dynamics (appearance + behaviour).
- **Linearity — pros & cons**:
  - *Pros*: life/time are linear; natural and easy to understand; concrete (fewer errors).
  - *Cons*: no choice, no branches, no special conditions; misses the unintended.
  - **So**: use *several* scenarios and *several* methods.
- Scenarios **explore depth**: interaction (what happens when), cognition (what the user is thinking), architecture (what is happening inside).

---

## Navigation Design

### Levels of Navigation
1. **Widget choice** — menus, buttons, etc.
2. **Screen design** — within a screen.
3. **Application navigation design** — movement between screens.
4. **Environment** — relationship to other apps / OS / the web.

### Think Structurally
- **Local**: from one screen looking *out* (goal-seeking with local knowledge).
- **Global**: between screens within the application (hierarchical diagrams of functional separation).
- **Wider still**: relationship with other applications / the web / external links.

### Four Golden Rules of Navigation
1. Know **where you are**.
2. Know **what you can do**.
3. Know **where you are going** (or what will happen).
4. Know **where you have been** (or what you have done).

### Navigation Aids
- **Breadcrumbs**: show path through the site hierarchy; current page is *not* a link; live links go to higher levels. *Beware the "big button trap"* — large buttons whose destination is unclear.
- **Hierarchies**: deep is difficult; misuse of Miller's 7±2 (that is about *STM*, not menu size); better to have many items per screen but structured *within* the screen.
- **Network diagrams**: show different paths/branches (e.g. main screen → add user → confirm), more task-oriented than hierarchy.
- **Dialogue** (computer "dialogue" = pattern of interaction between user and system, like the marriage-service script — generic flow with blanks filled per instance).

---

## Screen Design and Layout

### Available Tools
- **Grouping** of items
- **Order** of items
- **Decoration** — fonts, boxes
- **Alignment** of items
- **White space** between items

### Grouping and Structure
- Logically related items ⇒ physically grouped. Example: *Billing details* (Name, Address, Credit card no) vs *Delivery details* (Name, Address, Delivery time, Order details). Put them in separate boxes.
- **Order of groups and items**: think about natural order (should match screen order); use boxes/space; set **tab order** right; beware the "cake-recipe syndrome" (instructions in the wrong order, e.g. "mix milk and flour, after beating them add the fruit").

### Decoration
- Use fonts for emphasis/headings — **but not too many**.

### Alignment
- **Text**: left-align (for LTR languages) — easier to scan than centred special effects.
- **Names**: scanning for surnames ⇒ `Dix, Alan` (surname first) reads better than `Alan Dix`.
- **Numbers**: think about purpose — *visually, long number = big number* is a false cue. **Align decimals** or **right-align integers** so magnitude is comparable.
- **Multiple columns**: scanning across gaps is hard; use **leaders** or **greying** (vertical too) to aid grouping.

### Space Layout
- Space to **separate**, to **structure**, and to **highlight**.

### Physical Controls
- Same principles apply: grouping, order, decoration (e.g. different colours for functions; lines around related buttons like temp up/down), alignment (centred text in buttons is *harder to scan*).

### User Action and Control
- **Knowing what to do**: what is active vs passive, where to click/type; consistent style helps (underlined links, bold = current state/action); standards for common actions; clear labels and icons.
- **Affordances**: a psychological term for physical objects — shape/size suggest actions (a mug handle "affords" grasping; a button "affords" pushing). For screen objects: a button-like object affords a mouse click; icons afford clicking (or even double-clicking — a computer-use convention, not like real buttons). Affordance is **cultural + learned**.

### Appropriate Appearance
- **Aesthetics and utility**: aesthetically pleasing designs increase satisfaction *and* productivity — but beauty and utility may conflict. Mixed-up visual styles make items easy to distinguish; an all-clean design with little differentiation can be confusing. Backgrounds behind text look good but hurt readability. In consumer products, aesthetics are a key differentiator (e.g. iMac).
- **Colour and 3D**: both often used badly. Colour: use **sparingly to reinforce** other information; beware colour-blindness. 3D: good for physical information and some graphs, bad for text in perspective or 3D pie charts.
- **Localisation / internationalisation**: changing interfaces for cultures/languages. **Globalisation**: choose symbols that work everywhere (use a resource database instead of literal text — but this changes sizes and LTR/RTL order). Deeper: cultural assumptions — e.g. tick/cross mean +/− in some cultures but "mark this" in others.

---

## Prototyping

- **Cycle**: prototype → evaluate → (re)design → … → done. You **never get it right first time**.
- **Pitfalls**: moving little by little without knowing *where* you're going (Malverns or the Matterhorn?) — you need (1) a good start point and (2) understanding of what is wrong.
- **Design inertia**: early bad decisions persist; diagnose **real problems, not symptoms**.
- Types and techniques (see Ch4 for fuller treatment): **throw-away, incremental, evolutionary** prototypes; **storyboards** (need not be computer-based, can be animated); **limited-functionality simulations**; **Wizard of Oz** (designer simulates system behaviour behind the scenes).

---

## Design Trade-offs in Practice

Good interaction design is mostly the management of competing goals. Common tensions:

| Tension | One extreme | The other | Typical resolution |
|---|---|---|---|
| Learnability vs efficiency | verbose prompts/guidance | expert shortcuts | support both: visible-by-default, accelerators for experts |
| Consistency vs novelty | familiar, predictable | distinctive, delightful | novelty only where it doesn't break learned behaviour |
| Flexibility vs simplicity | many options/paths | minimal, guided | sensible defaults + advanced mode |
| Control vs automation | user in charge | system does it for you | user-initiated automation with undo |
| Standardisation vs context | one rule everywhere | adapt to culture/device | resource-based localisation (Ch3) |

These trade-offs recur in every chapter that follows — principles (Ch4), evaluation (Ch5), and patterns (Ch9) are all tools for resolving them deliberately rather than by accident.

## Summary
- Design is goal-directed work under constraints; the golden rule is to understand both computers and people.
- Use **personas** and **scenarios** to keep the real user present; navigate with explicit local/global structure and the four golden rules.
- Layout is grouping + order + decoration + alignment + white space; affordances and aesthetics matter but must serve usability.
- **Prototype and iterate** — but guard against design inertia and symptom-chasing.
