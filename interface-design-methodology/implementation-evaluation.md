# Implementation and Evaluation

How interfaces are **built** (implementation support) and how their usability is **assessed** (evaluation techniques).

---

## Implementation Support

Advances in coding have elevated programming from hardware-specific to **interaction-technique-specific**. Levels of development tools:

1. **Windowing systems** — device independence + simultaneous user tasks.
2. **Interaction toolkits** — program with interaction objects/widgets; promote consistency (look & feel).
3. **UIMS** (User Interface Management Systems) — separate presentation from application semantics.

### Windowing Systems
- **Device independence**: programming the abstract terminal via device drivers; image models for output/input (pixels, PostScript, GKS, PHIGS).
- **Resource sharing**: achieving simultaneity of user tasks; the window system supports independent processes and isolates applications.
- **Architectures** (all assume a separate device driver; they differ in how multiple-application management is done):
  1. each application manages all processes (reduces portability);
  2. management inside the OS kernel (ties apps to OS);
  3. management as a separate application (maximum portability).
- **Client–server** (e.g. **X Windows**): pixel imaging + pointing; the X protocol defines server–client communication; a separate window manager enforces policies (input focus, tiled vs overlapping, inter-client transfer).

### Programming Paradigms
- **Read-evaluation loop**:
  ```
  repeat
    read-event(myEvent)
    case myEvent.type
      type_1: do type_1 processing
      ...
  end repeat
  ```
- **Notification-based** (callbacks): `menu.setAction("Save", mySave)` — the system calls your handler when the event occurs.
- **Going with the grain**: the system style affects the interface you can easily build.
  - **Modal dialog box**: easy with event-loop (extra read-event loop), hard with notification (need mode flags).
  - **Non-modal dialog box**: hard with event-loop (complicated main loop), easy with notification (just add a handler).
  - **Beware**: if you don't explicitly design, it will just happen — **implementation should not drive design**.

### Interaction Toolkits
- Toolkits provide **interaction objects** (widgets/gadgets) where input and output are intrinsically linked; they promote consistency and generalizability via similar look & feel, and suit object-oriented programming.
- Example: **Java AWT** (notification-based; subclassing → callback objects in 1.1+); **Swing** (built on AWT, higher-level, uses MVC).

### User Interface Management Systems (UIMS)
- Add a level above toolkits (toolkits too hard for non-programmers). Concerns: conceptual architecture, implementation techniques, support infrastructure. Non-UIMS terms: UIDS, UIDE (e.g. Visual Basic).
- **Separation** between application semantics and presentation improves: **portability, reusability, multiple interfaces, customizability**.
- **Seeheim model**: Presentation – Dialogue – Functional core, with linguistic layers (lexical/syntactic/semantic). Principal contribution is *conceptual* — these concepts are now "normal" UI language. Note the lower "switch" box needed for implementation but not conceptual.
- **Arch/Slinky**: more layers (lexical/physical/functional core/adaptor); like a slinky — different layers thicker in different systems/components.
- **Feedback levels**:
  - **lexical** — movement of the mouse.
  - **syntactic** — menu highlights.
  - **semantic** — the sum of numbers changes (often slower). Use rapid lexical/syntactic feedback, but sometimes rapid semantic feedback is needed (freehand drawing; highlight trash can when file dragged).
- **Monolithic vs components**: Seeheim has big components; object-oriented toolkits prefer smaller ones. Smalltalk used **MVC**.

### MVC and PAC
- **MVC (Model–View–Controller)**:
  - **model** — internal logical state.
  - **view** — how it is rendered.
  - **controller** — processes user input.
  - Largely a pipeline (input → control → model → view → output), but in practice the controller must "talk" to the view (input only has meaning in relation to output, e.g. a mouse click needs to know what was clicked) — separation is incomplete.
- **PAC (Presentation–Abstraction–Control)**:
  - **presentation** — manages input/output.
  - **abstraction** — logical state.
  - **control** — mediates; manages hierarchy and multiple views. PAC objects' control parts communicate.
  - PAC is cleaner in many ways and closer to Seeheim, **but MVC is used more in practice** (e.g. Java Swing).

### Dialogue Control Techniques
- Menu networks, state transition diagrams, grammar notations, event languages, declarative languages, **constraints** (say *what should be true*, not what happens — also used in groupware, e.g. ALV abstraction–link–view), graphical specification.
- **The drift of dialogue control**: internal control (read-eval loop) vs external control (independent of semantics/presentation) vs presentation control (graphical specification). Graphical specification is popular in practice (Visual Basic, Dreamweaver, Flash) but it's hard to "see" the paths through the system.

---

## Evaluation Techniques

**Evaluation** tests the usability and functionality of a system; occurs in laboratory, field, and/or with users; evaluates both design and implementation; should be considered at **all stages** of the life cycle.

**Goals of evaluation**: assess extent of system functionality; assess effect of interface on user; identify specific problems.

### Expert / Analytical Methods
- **Cognitive Walkthrough** (Polson et al.): evaluates how well the design supports the user in *learning* a task; usually performed by a cognitive-psychology expert who "walks through" the design using psychological principles and forms. For each task it considers: what impact will the interaction have on the user? what cognitive processes are required? what learning problems may occur? Focuses on goals/knowledge — does the design lead the user to generate the correct goals?
- **Heuristic Evaluation** (Nielsen & Molich): usability criteria (heuristics) identified; design examined by experts for violations (e.g. system behaviour is predictable/consistent; feedback is provided). "Debugs" the design. *(Nielsen's 10 Heuristics: visibility of system status; match between system and real world; user control and freedom; consistency and standards; error prevention; recognition rather than recall; flexibility and efficiency of use; aesthetic and minimalist design; help users recognise/diagnose/recover from errors; help and documentation.)*
- **Review-based evaluation**: use results from the literature to support/refute design parts (care needed — are they transferable?). **Model-based evaluation**: cognitive models filter options (e.g. GOMS prediction of performance). Design rationale also provides evaluation information.

### User Participation
- **Laboratory studies**: advantages — specialist equipment, uninterrupted environment; disadvantages — lack of context, hard to observe cooperation. Appropriate for controlled manipulation of use.
- **Field studies**: advantages — natural environment, context retained, longitudinal possible; disadvantages — distractions, noise. Appropriate where context is crucial.
- **Experimental evaluation**: controlled evaluation of specific interactive behaviour. The evaluator chooses a **hypothesis** to test; considers experimental **conditions** differing only in the value of a controlled variable; changes in a behavioural measure are attributed to the conditions.

### Experimental Factors
- **Subjects** — who (representative, sufficient sample).
- **Variables** — what to modify and measure.
  - **Independent variable (IV)** — characteristic changed to produce conditions (e.g. interface style, number of menu items).
  - **Dependent variable (DV)** — characteristic measured (e.g. time taken, number of errors).
- **Hypothesis** — prediction framed in terms of IV and DV (e.g. "error rate will increase as font size decreases"). The **null hypothesis** states *no difference* between conditions; the aim is to *disprove* it.
- **Experimental design**:
  - **Within-groups** — each subject performs under each condition. Transfer of learning possible; less costly; less subject variation.
  - **Between-groups** — each subject performs under only one condition. No transfer of learning; more users required; variation can bias results.

### Data Analysis
- Before statistics: **look at the data**; save original data.
- **Type of data**: discrete (finite values) vs continuous (any value).
- **Types of test**:
  - **Parametric** — assume normal distribution; robust; powerful.
  - **Non-parametric** — do not assume normal distribution; less powerful; more reliable.
  - **Contingency tables** — classify data by discrete attributes, count items per group.
- **Information required**: is there a difference? how big? how accurate is the estimate? (Parametric/non-parametric mainly address the first.)
- **Group experiments** are harder: subject groups (larger number ⇒ more expensive, longer to settle, more variation; often only 3–4 groups), task choice, data gathering, analysis. Solutions: within-groups, micro-analysis (gaps in speech), anecdotal/qualitative analysis. Controlled experiments may "waste" resources; field studies are more realistic (distributed cognition — work studied in context; situated action). Psychology = controlled experiment; sociology/anthropology = open study + rich data.

### Observational & Query Methods
- **Think Aloud**: user observed performing a task, narrates what they do/why/what they think is happening. *Advantages*: simple, useful insight, shows real use. *Disadvantages*: subjective, selective, describing may alter performance.
- **Cooperative evaluation**: variation on think-aloud; user and evaluator question each other throughout; less constrained, user encouraged to criticise, clarification possible.
- **Protocol analysis**: paper/pencil (cheap, limited to writing speed), audio (good for think-aloud, hard to match), video (accurate/realistic, obtrusive, special equipment), computer logging (automatic/unobtrusive, large/hard-to-analyse data), user notebooks (coarse/subjective, good for longitudinal). Mixed use; transcription is difficult.
- **Automated analysis (EVA)** and **post-task walkthroughs**: transcript replayed to the participant for comment — immediately (fresh) or delayed (evaluator has time to identify questions); useful to fill in intention; necessary when think-aloud is impossible.
- **Interviews**: analyst questions user one-to-one, usually from prepared questions; informal/subjective/cheap; can explore issues and elicit unanticipated problems; very subjective and time-consuming.
- **Questionnaires**: fixed questions to users. *Advantages*: quick, reach large groups, more rigorous analysis. *Disadvantages*: less flexible, less probing. Styles: general, open-ended, scalar, multi-choice, ranked. Need careful design (what info required? how analysed?).

### Physiological Methods
- **Eye tracking**: head/desk-mounted; eye movement reflects cognitive processing load.
  - **fixations** — stable position; number/duration indicate difficulty.
  - **saccades** — rapid movement between points of interest.
  - **scan paths** — straight-to-target with short fixation at target is optimal.
- **Physiological measurements**: emotional response linked to physical change — heart activity (blood pressure, volume, pulse), **GSR** (sweat glands), **EMG** (muscle), **EEG** (brain). Interpretation is difficult; more research needed.

### Choosing an Evaluation Method
Decide along several axes:
- **when in process**: design vs implementation.
- **style**: laboratory vs field.
- **objectivity**: subjective vs objective.
- **type of measures**: qualitative vs quantitative.
- **level of information**: high-level vs low-level.
- **level of interference**: obtrusive vs unobtrusive.
- **resources available**: time, subjects, equipment, expertise.

---

## Combining Methods — a Practical Plan

No single method is sufficient; mature projects mix them by life-cycle stage:

| Stage | Cheap/fast | Deeper/rigorous |
|---|---|---|
| Early design | heuristic evaluation, cognitive walkthrough | model-based (GOMS) prediction |
| Mid prototype | think-aloud, cooperative eval, interviews | lab experiment on key variables |
| Pre-release | questionnaires, field study | eye tracking / physiology for fine detail |
| Post-release | usage logging, questionnaires | longitudinal field study |

Rules of thumb: start **analytic** (cheap, finds obvious problems early), move to **empirical** as the design stabilises, and always pair **subjective** (satisfaction) with **objective** (time/errors) measures so you know not just *whether* users are happy but *why* they succeed or fail.

## Summary
- Implementation tools range from windowing systems (device independence, client–server) through toolkits (widgets) to UIMS (separation of presentation and semantics), realised via MVC/PAC and dialogue-control techniques.
- Evaluation is continuous: analytical (cognitive walkthrough, heuristic eval, model-based), empirical (lab/field/experimental), and observational/query (think-aloud, protocols, interviews, questionnaires, eye tracking, physiology). Choose by process stage, setting, objectivity, and resources.
