# Notations and System Models

Formal and semi-formal ways to describe and **analyse the dialogue** (the structure of user–system interaction) and the **system** behind it.

---

## Dialogue Notations and Design

- **Dialogue** = the "conversation" between user and system — the *structure* of interaction at the **syntactic** level. Levels:
  - **lexical** — shape of icons, actual keys pressed.
  - **syntactic** — order of inputs and outputs.
  - **semantic** — effect on internal application/data.
- Dialogue is linked to **semantics** (what it does) and **presentation** (how it looks).
- Formal descriptions can be **analysed before building** for: inconsistent actions, hard-to-reverse actions, missing actions, potential miskeying errors.
- Lesson from structured human dialogue (e.g. the wedding service, the trial): real dialogues have alternatives; focus on *normative* responses but handle the unexpected (user "standing on the keyboard"). Syntax ≠ semantics (saying the words doesn't make you married).

### Diagrammatic Notations
- **State Transition Networks (STN)**: circles = **states**, arcs = **actions/events**. "State-heavy" — events need the most detail, states hard to name but easy to visualise. Supports **hierarchical STNs** (named sub-dialogues), **concurrent dialogues** (individual toggles; combined ⇒ combinatorial explosion), **escapes** (back/web/Esc — beware spaghetti of identical behaviours; specify a separate escape arc active "everywhere"), and **help menus** (usually added at a meta level returning to the same point).
- **Petri nets**: one of the oldest notations. **Places** (like STN states) + **transitions** (like arcs) + **counters** sitting on places (current state). Several counters allow concurrent dialogue states. Tool support: Petshop. A transition "fires" when all input places have counters.
- **Statecharts** (UML): extension of STN with **hierarchy**, **concurrent sub-nets**, **escapes**, **history** (link marked H returns to last state on re-entering a subdialogue), and always-active OFF states.
- **Flowcharts**: familiar to programmers; boxes = process/event (not state). Used for dialogue (not internal algorithm).
- **JSD diagrams** (Jackson System Development): for tree-structured dialogues; less expressive but greater clarity.

### Textual Notations
- **Grammars**:
  - **Regular expressions** (e.g. `sel-line click click* dbl-click`) — same computational model as JSD.
  - **BNF**: `expr ::= empty | atom expr | '(' expr ')' expr` — more powerful than regular expressions or STNs, but still **no concurrency**.
- **Production rules**: an unordered list `if condition then action`; every rule always potentially active.
  - **Event-based**: good for concurrency, bad for sequence (events added to a pending list; "first"/"rest" are internally generated events).
  - **State-based (prepositional)**: attributes + rules; good for state, bad for events.
- **CSP / process algebras** (Communicating Sequential Processes): good for sequential *and* concurrent dialogue. Example:
  ```
  Bold-tog   = select-bold? -> bold-on -> select-bold? -> bold-off -> Bold-tog
  Dialogue-box = Bold-tog || Italic-tog || Under-tog
  ```
  Causality is less clear.

### Semantics
- **Alexander's SPI**: two-part specification — **EventCSP** (pure dialogue order) + **EventISL** (target-dependent semantics). Centralised dialogue description; tolerable syntactic/semantic trade-off.
- **Raw code**: an event-loop for a word processor scatters the dialogue description (very distributed) — terrible syntactic/semantic trade-off.

### Action and State Properties
- **Action properties**:
  - **Completeness** — missed arcs / unforeseen circumstances.
  - **Determinism** — several arcs for one action (deliberate application decision vs accidental in production rules); nested escapes.
  - **Consistency** — same action, same effect?
  - **Modes and visibility**.
- **State properties**:
  - **Reachability** — can you get anywhere from anywhere, and how easily?
  - **Reversibility** — can you get to the previous state? (**NOT** undo — reversing `select line` takes 3 actions).
  - **Dangerous states** — states you don't want to reach (e.g. exit with/without save via F1–F2 vs F1–Esc–F2; duplicate states with semantic distinction).
- **Lexical issues**: visibility (differentiate modes/states); **style** (command = verb–noun; mouse = noun–verb); **layout** matters — a redesigned keyboard where a finger catches Esc between F1–F2 turns "save" into "no-save disaster." Example: digital watch — dangerous states guarded by a 2-second hold on button A; completeness requires distinguishing depress-A vs release-A in all modes.

### Dialogue Analysis Summary
- Semantics and dialogue: attaching semantics (distributed/centralised dialogue description; maximising syntactic description).
- Properties of dialogue: action (completeness, determinism, consistency); state (reachability, reversibility, dangerous states).
- Presentation and lexical issues (visibility, style, layout) are **not independent** of dialogue.

---

## Models of the System

Types of system model:
- **Dialogue modelling** — main modes; full state definition; abstract interaction model.
- **Standard formalisms** — SE notations specifying required behaviour of specific interactive systems.
- **Interaction models** — special-purpose mathematical models describing usability properties at a generic level.
- **Continuous behaviour** — activity between events; objects with continuous motion; models of time.

**Relationship with dialogue**: system semantics affects dialogue structure, but the bias differs — rather than dictate legal actions, these formalisms tell what each action *does* to the system. **Irony**: formal techniques are well accepted for cognitive models of the user and the dialogue (what the user should do), but **not yet** for dictating what the system should do for the user.

### Standard Formalisms (Software Engineering)
Referred to as **formal methods**:
- **Model-based** — describe system states and operations (Z, VDM).
- **Algebraic** — describe effects of sequences of actions (OBJ, Larch, ACT-ONE).
- **Extended logics** — describe *when* things happen and *who* is responsible (temporal and deontic logics).

**Uses**: communication (common language, remove ambiguity), succinctness, analysis (internal consistency; external consistency with the eventual program and with requirements like safety/security/HCI).

#### Model-Based Methods
- Use general mathematics (numbers, sets, functions) to define **state** and **operations on state**.
- Variable types: basic type `x: Nat`; individual item from a set `shape type: {line, ellipse, rectangle}`; subset `selection: set Nat`; function `objects: Nat → Shape Type`.
- Example (graphics package): `Point == Nat × Nat`; `Shape == [shape: {line,ellipse,rectangle}; x,y: Point; wid,ht: Nat]`; `Shape_Dict == Id → Shape`.
- Define state with **invariants** (always true, preserved by every operation) and **initial state**.
- Operations defined as before/after state (`State` and `State'`):
  ```
  unselect: selection' = {}
  delete:   dom shapes' = dom shapes - selection; ∀id∈dom shapes' shapes'(id)=shapes(id); selection' = {}
  ```
- **Interface issues**: the **framing problem** (everything else stays the same — complicated with invariants); internal consistency (do operations define legal transitions?); external consistency (formulated as theorems to prove); separation (functionality vs presentation not explicit).
- Mathematics ↔ programs: types↔sets, records↔tuples, lists↔sequences, functions↔functions, procedures↔relations.

#### Algebraic Notations
- Emphasise an explicit representation of state (model-based) vs provide only **implicit** state info (algebraic). Algebraic operations defined by their **relationship with other operations** (axioms).
- Example: `delete(make_ellipse(st)) = unselect(st)`; `unselect(unselect(st)) = unselect(st)`; `move(p; unselect(st)) = unselect(st)`.
- Issues: ease of use (different way of thinking); internal consistency (contradictory axioms?); external consistency (with executable system less clear; with requirements made explicit and automatable); completeness (every operation fully defined?).

#### Extended Logics
- Model-based/algebraic notations use propositional and predicate logic heavily.
- **Temporal logics**: time as a succession of events. Operators: **□ always**, **◇ eventually**, **¬◇ never**; bounded operators `p until q`, `p before q`. Explicit time is absent (some requirements unexpressible); gradual degradation often more important than time-criticality ("myth of the infinitely fast machine").
- **Deontic logics**: express responsibility/obligation between agents (human, organisation, computer): **per** (permission), **obl** (obligation). Example: `owns(Jane, file 'fred') ⇒ per(Jane, request('print fred'))`; `performs(Jane, request(...)) ⇒ obl(lp3, print(file 'fred'))`.
- Issues: safety properties (bad things don't happen) vs liveness (good things do); executability vs expressiveness (easy to specify impossible situations); group issues (obligations in single-user systems have personal impact; in groupware consider other users).

### Interaction Models
General computational models weren't designed with the user in mind; we need models between SE formalisms and HCI understanding:
- **formal** — the **PIE model** for general interactive properties supporting usability.
- **informal** — interactive architectures (MVC, PAC, ALV) motivating separation/modularisation.
- **semi-formal** — status–event analysis spanning several layers.

#### The PIE Model
A "minimal" black-box model focused on **external observable** interaction.
- **P** (user input): a sequence of commands `C` (keyboard, mouse movement, click). `P = seq C`.
- **E** (system response / effect): composed of **ephemeral display** + **final result** (printout, changed file). Set of effects = `E`.
- **I** (interpretation): given any history of commands `P`, there is a current effect. `I : P → E`.
- Formally: `[C; E; D; R]` with `P == seq C`, `I : P → E`, `display : E → D`, `result : E → R`. A state-transition function can be derived: `doit : E × P → E` where `doit(I(p), q) = I(p q)` and `doit(doit(e,p), q) = doit(e, p q)`.

**Expressing properties**:
- **Observability** — what you can tell about current state from the display.
- **Predictability** — what you can tell about future behaviour. Predictability is a special case of observability.
- **WYSIWYG** has two readings: what you see is what you **will get at the printer**, or what you **have got in the system**. Formalised via a `predict`/`predictE` function linking display to result/effect.
- **Reachability** — getting from one state to another (`∀e,e' ∃p: doit(e,p)=e'`) — too weak alone.
- **Undo** — reachability between current and last state. As a literal command it's **impossible except for trivial 2-state systems**; better modelled as a **special meta-command** (like browser back/forward, history window). *Lesson: undo is no ordinary command.*

**Issues for PIE**: insufficient (necessary but not sufficient for usability); generic (any system); proof obligations (for SE-defined systems); scale (proving many properties of large systems); scope (limiting applicability); insight (abstraction is reusable).

#### Continuous Behaviour / Status–Event
- The mouse always has a location (a **status value**), not just a sequence of events: `doit : E × C × M → E`; `display : E × M → D` (e.g. dragging a window).
- **Events** occur at specific moments (keystrokes, beeps, stroke of midnight). **Status** is a value over a period (current display, mouse location, internal state, weather).
- **Interstitial behaviour**: what happens *between* events — in GUIs this is "the feel" (dragging, scrolling); in rich media it's the main purpose. Formalised as: `action: user-event × input-status × state → response-event × new state`; current input-status ⇒ trajectory-independent; history of input-status ⇒ freehand drawing etc.
- **Status–change events**: some status changes are meaningful events (bank balance < $100 ⇒ do more work; time = 12:30 ⇒ eat lunch) but not all (every second is a time change).
- **Making everything continuous**: physics/engineering model `state_t = φ(t, t0, state_t0, inputs during [t0,t))`, `output_t = η(state_t)` — like interstitial behaviour but clumsy for events; in practice need both.
- **Hybrid models** (computing "hybrid systems"): physical world as differential equations, computer as discrete events (industrial control, fly-by-wire; TACIT project; Hybrid Petri Nets, continuous interactors).
- **Granularity and temporal Gestalt**: "do it today" — next 24h, before 5pm, before midnight? Two timing (infinitely fast computer calc vs interaction time). Temporal Gestalt: words/gestures — where do they start; the *whole* matters.

---

## Choosing a Notation / Model

Different notations trade power for clarity and suit different purposes:

| Need | Prefer | Avoid |
|---|---|---|
| Visualise a simple flow | STN / flowchart | Petri net (overkill) |
| Model concurrency | Petri net / statechart / CSP | plain BNF / STN |
| Sequence + hierarchy | JSD / hierarchical STN | flat STN |
| Make consistency explicit | TAG (semantic features) | plain BNF |
| Concurrency + causality | CSP / production rules | BNF |
| Prove state properties | model-based (Z/VDM) | grammars |
| Generic usability reasoning | PIE model | heavy SE formalism |

General guidance: start with the **least powerful notation that suffices** (clearer, faster), escalate only when concurrency, rigorous proof, or subtle consistency demands it. Dialogue notations answer "what actions are legal?"; system models answer "what does each action do?" — use both.

## Summary
- Dialogue notations (STN, Petri nets, statecharts, flowcharts, JSD; grammars, production rules, CSP) let us analyse completeness, determinism, consistency, reachability, reversibility, and dangerous states *before* building.
- System models range from SE formalisms (model-based Z/VDM, algebraic OBJ/Larch, temporal/deontic logics) to interaction models (PIE, continuous status–event, hybrid) that bridge formal methods and HCI usability.
