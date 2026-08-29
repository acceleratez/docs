# Design Rules and Usability Principles

Designing for **maximum usability** — the goal of interaction design. This chapter covers the engineering approach (usability engineering, iterative design, design rationale) and the rule systems that direct design: **principles, standards, guidelines, heuristics, and patterns**.

---

## HCI in the Software Process

- **Software engineering** studies the software *life cycle*. Designing for usability occurs at **all stages**, not as a single isolated activity.
- **The waterfall model** (requirements → architectural design → detailed design → coding/unit testing → integration/testing → operation/maintenance) is too linear for interactive systems — the life cycle for interactive systems has **lots of feedback**, not a straight line.
- **Verification** = building the product *right*; **Validation** = building the *right* product. The **formality gap** remains: validation will always rely to some extent on *subjective* means of proof.

---

## Usability Engineering

- The ultimate test of usability is **measurement of user experience**. Usability engineering demands that **specific usability measures be made explicit as requirements**.
- A **usability specification** records, per attribute:
  - **usability attribute/principle**
  - **measuring concept**
  - **measuring method**
  - **now / worst-case / planned / best-case levels**
- Example (VCR): *Backward recoverability* — measuring concept "undo an erroneous programming sequence"; method "number of explicit user actions to undo"; now-level "no product allows it"; worst "as many actions as it took to program in"; planned "≤2 actions"; best "one cancel action".
- **Problem**: a usability specification requires detail that may be impossible early in design; and *satisfying* a specification does not *necessarily* satisfy usability.

### ISO 9241 (Usability Standard)
Adopts the traditional usability categories:
- **Effectiveness** — can you achieve what you want? (suitability for task, learnability)
- **Efficiency** — can you do it without wasting effort? (relative efficiency, power features)
- **Satisfaction** — do you enjoy the process? (rating scales)

Metric examples from ISO 9241:
| Aspect | Objective measure | Subjective measure |
|---|---|---|
| Suitability for task | % of goals achieved | rating scale for suitability |
| Learnability | % of functions learned; time to learn | rating scale for ease of learning |
| Error tolerance | % of errors corrected successfully | rating scale for error handling |
| Efficiency | time to complete a task | rating scale vs expert user |

---

## Iterative Design and Prototyping

- Iterative design **overcomes the inherent problems of incomplete requirements**.
- **Prototypes** simulate/animate features of the intended system. Types:
  - **throw-away** — built to learn, then discarded.
  - **incremental** — add functionality piece by piece.
  - **evolutionary** — the prototype becomes the product.
- **Management issues**: time, planning, non-functional features, contracts.
- **Techniques**: storyboards (need not be computer-based, can be animated); limited-functionality simulations (some functionality provided by designers); Wizard of Oz (user thinks system is autonomous, designer simulates).
- **Warning**: **design inertia** — early bad decisions stay bad. Diagnose *real* usability problems, not just symptoms.

---

## Design Rationale

Design rationale = information explaining **why a system is the way it is**.
**Benefits**: communication throughout the life cycle; reuse of design knowledge across products; enforces design discipline; presents arguments for trade-offs; organises the large design space; captures contextual information.

- **Process-oriented** — preserves order of deliberation/decision-making.
- **Structure-oriented** — emphasises post-hoc structuring of considered alternatives.

### IBIS (Issue-Based Information System)
Basis for much design-rationale research; process-oriented. Elements:
- **issues** — hierarchical structure with one root issue.
- **positions** — potential resolutions of an issue.
- **arguments** — modify the relationship between positions and issues.
- **gIBIS** is the graphical version (responds-to, supports, objects-to, questions, generalizes, specializes).

### Design Space Analysis
Structure-oriented:
- **QOC** — hierarchical structure of **Questions** (major design issues) → **Options** (alternative solutions) → **Criteria** (means to assess options).
- **DRL** — similar to QOC with a larger language and more formal semantics.

### Psychological Design Rationale
Supports the **task–artefact cycle** (the systems we use change our tasks). Aims to make explicit the *consequences of design for users*: designers identify tasks the system supports, suggest scenarios to test them, observe users, and make psychological claims explicit — negative aspects feed the next iteration.

---

## Types of Design Rules

| Type | Authority | Generality | Notes |
|---|---|---|---|
| **Standards** | high | limited | set by bodies (ISO 9241); specific |
| **Guidelines** | lower | general | suggestive; style guides late in lifecycle |
| **Principles** | abstract | high | broad-brush; early lifecycle |

- Increasing authority ⇑ and increasing generality ⇑ are in tension.
- **Standards**: set by national/international bodies to ensure compliance; require sound underlying theory and slowly-changing technology; hardware standards more common than software.
- **Guidelines**: more suggestive/general; many textbooks full of them; abstract guidelines (principles) apply early, detailed guidelines (style guides) apply late. **Understanding the justification** for a guideline helps resolve conflicts between guidelines.

---

## Principles to Support Usability

### Principles of Learnability
- **Predictability** — determining the effect of future actions based on past interaction (operation visibility).
- **Synthesizability** — assessing the effect of past actions (immediate vs eventual honesty).
- **Familiarity** — how prior knowledge applies to the new system (guessability; affordance).
- **Generalizability** — extending specific interaction knowledge to new situations.
- **Consistency** — likeness in input/output behaviour arising from similar situations or task objectives.

### Principles of Flexibility
- **Dialogue initiative** — freedom from system-imposed constraints on input dialogue (system vs user pre-emptiveness).
- **Multithreading** — supporting user interaction for more than one task at a time (concurrent vs interleaving; multimodality).
- **Task migratability** — passing responsibility for task execution between user and system.
- **Substitutivity** — allowing equivalent values of input/output to be substituted (representation multiplicity; equal opportunity).
- **Customizability** — modifiability by the user (adaptability) or system (adaptivity).

### Principles of Robustness
- **Observability** — user can evaluate internal state from perceivable representation (browsability, defaults, reachability, persistence, operation visibility).
- **Recoverability** — user can take corrective action once an error is recognised (reachability; forward/backward recovery; commensurate effort).
- **Responsiveness** — how the user perceives the rate of communication (stability).
- **Task conformance** — degree to which system services support all of the user's tasks (task completeness; task adequacy).

---

## Heuristics and Golden Rules

### Shneiderman's 8 Golden Rules
1. Strive for **consistency**.
2. Enable frequent users to use **shortcuts**.
3. Offer **informative feedback**.
4. Design dialogs to yield **closure**.
5. Offer **error prevention** and simple error handling.
6. Permit **easy reversal** of actions.
7. Support **internal locus of control** (user is in charge).
8. Reduce **short-term-memory load**.

### Norman's 7 Principles
1. Use both **knowledge in the world** and **knowledge in the head**.
2. **Simplify the structure of tasks**.
3. **Make things visible** — bridge the Gulfs of Execution and Evaluation.
4. Get the **mappings** right.
5. Exploit the power of **constraints** (natural and artificial).
6. **Design for error**.
7. When all else fails, **standardise**.

> Nielsen's 10 Heuristics are covered in Ch5 (Heuristic Evaluation).

---

## Design Patterns

- An approach to **reusing knowledge** about successful design solutions.
- Originated in architecture (Christopher Alexander): *a pattern is an invariant solution to a recurrent problem within a specific context.*
- Examples: "Light on Two Sides of Every Room" (architecture); "Go back to a safe place" (HCI).
- Patterns do **not** exist in isolation — they link to other patterns in **pattern languages** that enable complete designs to be generated.
- **Characteristics of patterns**:
  - capture design *practice*, not theory;
  - capture the essential common properties of good examples;
  - represent design knowledge at varying levels (social, organisational, conceptual, detailed);
  - embody values and express what is humane in interface design;
  - intuitive and readable → usable for communication between all stakeholders;
  - a pattern language should be **generative** (help produce complete designs).

---

## Summary

- Repeatable usability design relies on **maximising the benefit of one good design** by abstracting its general properties.
- Success requires **both creative insight** (new paradigms) **and purposeful principled practice** (standards, guidelines, principles, heuristics, patterns).
- Usability engineering makes measures explicit; ISO 9241 defines effectiveness/efficiency/satisfaction; iterative prototyping and design rationale (IBIS, QOC) keep the process honest.
