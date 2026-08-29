# Interaction: Models, Ergonomics and Styles

How the user and the system **communicate**, plus the physical/contextual factors that shape that interaction.

---

## What is Interaction?

Interaction is **communication**: user ⇄ system. Key terminology (note: usage of these terms varies widely in the literature):

- **domain** — the area of work under study (e.g. graphic design).
- **goal** — what you want to achieve (e.g. create a solid red triangle).
- **task** — how you go about doing it, ultimately in terms of operations/actions (e.g. select fill tool, click over triangle).

Interaction also depends on **context**: social, organisational, and motivational factors.

---

## Interaction Models

### Norman's Seven Stages (Execution / Evaluation Loop)
The user:
1. establishes the **goal**
2. formulates the **intention**
3. specifies **actions** at the interface
4. **executes** the action
5. **perceives** the system state
6. **interprets** the system state
7. **evaluates** the state with respect to the goal

Two critical mismatches:
- **Gulf of Execution** — the user's formulation of actions ≠ the actions the system allows.
- **Gulf of Evaluation** — the user's expectation of the changed state ≠ the actual presentation of that state.

Good design **minimises both gulfs** (e.g. via visibility, feedback, mapping, consistency — see Ch4).

### Human Error in Norman's Model
- **Slip**: understands the system and goal, formulates the correct action, but executes it wrongly → *better interface design* can fix it (e.g. confirm destructive actions).
- **Mistake**: may not even have the right goal → requires *better understanding of the system* (better mental models, documentation, affordances).

### Abowd and Beale Framework
An extension of Norman with **four parts**, each with its own "language":
```
  U (user) ──input──▶ I ──▶ core (system / S) ──▶ O (output) ──▶ U
```
- Interaction ⇒ **translation between languages** (user intentions → actions at interface → alterations of system state → output display → interpretation by user).
- **Problems in interaction = problems in translation.**
- A **general framework**, not restricted to electronic computers; allows comparative assessment of systems; an abstraction of all major components.

---

## Ergonomics

- The study of the **physical characteristics of interaction** (also called *human factors*, though that term can mean much of HCI).
- Good at defining **standards and guidelines** that constrain design of certain aspects.
- **Examples**:
  - Arrangement of **controls and displays** — grouped by function, by frequency of use, or sequentially.
  - **Surrounding environment** — seating adaptable to all user sizes.
  - **Health issues** — posture, environmental conditions (temperature, humidity), lighting, noise.
  - **Use of colour** — red for warning, green for okay; awareness of colour-blindness.
- **Office vs industrial interface**: different data types (textual vs numeric), rates of change (slow vs fast), environments (clean vs dirty — "the oil-soaked mouse"). **Context matters.**
- **Glass interfaces** (screens/keypads replacing dials/knobs):
  - *Advantages*: cheaper, more flexible, multiple representations, precise values.
  - *Disadvantages*: not physically located, loss of context, complex interfaces. → Often you need **both**.
- **Direct vs indirect manipulation**: office = direct (user interacts with an artificial world); industrial = indirect (user interacts with the real world through the interface). Raises issues of **feedback** and **delays** (system → interface → plant → immediate feedback → instruments).

---

## Interaction Styles

| Style | Nature of the dialog | When used / notes |
|---|---|---|
| **Command line interface (CLI)** | Direct expression of instructions (function keys, abbreviations, words) | Repetitive tasks; expert-oriented; single-word meaningful names; e.g. Unix |
| **Menus** | Set of options displayed; selection by number/letter/arrow/mouse | Options visible ⇒ relies on *recognition*; hierarchically grouped |
| **Natural language** | Typed or spoken NL | Familiar but vague/ambiguous; hard to do well; subset/keyword approaches |
| **Query (Q/A, SQL)** | User led through questions (Q/A); or query languages (SQL) | Q/A: novice but restricted; SQL: needs expertise |
| **Form-fills / spreadsheets** | Screen like a paper form; data in place | Data entry/retrieval; consistency maintained (spreadsheet formula cells) |
| **WIMP** (Windows, Icons, Menus, Pointers) | Default desktop style | Most interactive systems (PCs) |
| **Point-and-click** | Just click something (icons, links, map) | Web, hypertext, multimedia; minimal typing |
| **3D interfaces** | VR, highlighting, depth via light/occlusion | Powerful but indiscriminate use is just confusing |

### WIMP Elements
- **Windows**: areas behaving as independent; can contain text/graphics; movable/resizable; can overlap (tiled vs overlapping); **scrollbars**; **title bars**.
- **Icons**: small pictures representing objects/actions (e.g. a window can be iconised); highly stylised or realistic.
- **Pointers**: rely on pointing/selecting; mouse, trackpad, joystick, trackball, cursor keys, keyboard shortcuts.
- **Menus**: choice of operations on screen; selected with pointer. Problem: take screen space → **pop-up** menus appear when needed.

### Kinds of Menus
- **Menu bar** (top of screen) with **pull-down** (hold + drag), **drop-down** (click reveals), **fall-down** (hover).
- **Contextual** (appear where you are), **pop-up** (actions for selected object), **pie/radial** (circular; larger target area, quicker equal-distance reach — but not widely used).
- **Cascading** hierarchical menus; **keyboard accelerators** (active when open = usually first letter; active when closed = usually Ctrl+letter — usually *different*).
- Design questions: which kind, what to include, words (action vs description), grouping, accelerator choice.

### Other WIMP Widgets
- **Buttons**: isolated regions that invoke an action. **Radio buttons** (mutually exclusive) vs **check boxes** (non-exclusive) — see Ch9.
- **Toolbars**: fast access to common actions; often customisable.
- **Palettes and tear-off menus**: little windows of actions, shown/hidden via a menu option; "tear off" to become a palette.
- **Dialogue boxes**: pop up to inform of an event or request info (e.g. save dialog). **Modal** vs **modeless** (see Ch8/Ch9).

### Speech-driven Interfaces
Rapidly improving but still inaccurate. Robust dialogue uses interaction — e.g. airline booking with reliable "yes/no" plus **system reflects back its understanding** ("you want a ticket from New York to Boston?").

---

## Interactivity

- **Look and feel** = appearance + behaviour (e.g. MacOS vs Windows menus). Same elements, different behaviour.
- **Initiative** — who has the initiative?
  - Old **Q/A** = computer has initiative.
  - **WIMP** = user has initiative.
  - Exceptions: **pre-emptive** parts of the interface — **modal dialog boxes** (come and won't go away; good for errors / essential steps, but use with care).
- **Error and repair**: can't always avoid errors, but can put them right — make errors *easy to detect*, then *easy to repair*.
- **Context**: interaction is strongly affected by social/organisational context — other people, desire to impress, competition, fear of failure; motivation (fear, allegiance, ambition); inadequate systems cause frustration and loss of motivation.

---

## Physical Design and Trade-offs

- Many **constraints**, often conflicting:
  - ergonomic (minimum button size)
  - physical (high-voltage switches must be big)
  - legal/safety (cooker controls placed high)
  - context/environment (easy to clean)
  - aesthetic (must look good)
  - economic (not cost too much)
- **Trade-offs** are unavoidable: within a category (safety: front panel safer for adult, rear safer for child) and between categories (ergonomics vs physical — MiniDisc remote: ergonomics wants bigger controls, physical has no room ⇒ multifunction controls + reduced functionality).
- **Fluidity**: do external physical aspects reflect the logical effect? Related to **affordance** (Ch3). Does the logical state show in the physical state (on/off buttons)? Do inverse actions produce inverse effects (arrow buttons, twist controls)?
- **Physical layout**: logical relationship ~ spatial grouping. Compliant interaction: state evident in mechanical buttons / rotary knobs that reveal internal state and can be controlled by both user and machine.

---

## Managing Value

People use something **only if** perceived value > cost (with exceptions like habit; value need not be personal gain or money). **General lesson**: if you want someone to do something, make it easy for them and understand their values. (This underlies the course project — a Booking Travel Mobile App — where perceived value, ease, and personalisation drive adoption.)

---

## Key Takeaways
- Interaction is communication governed by models (Norman's gulfs, Abowd & Beale's translation).
- Style choice (CLI, WIMP, NLP, 3D…) trades expertise vs learnability, recognition vs recall, context vs flexibility.
- Ergonomics and physical design impose real, often conflicting constraints — design is the art of the trade-off.
