# Universal Design and User Support

Designing for the **widest range of users** (including disabilities and special needs) and providing **effective help**, plus **cognitive models** of the user that predict and explain performance.

---

## Universal Design Principles

Universal design = designing products usable by the widest possible population, to the greatest extent possible, without specialised adaptation.

1. **Equitable use** — useful and marketable to people with diverse abilities.
2. **Flexibility in use** — accommodates a wide range of preferences and abilities.
3. **Simple and intuitive** — easy to understand regardless of experience, literacy, language.
4. **Perceptible information** — communicates necessary information regardless of ambient conditions or sensory abilities.
5. **Tolerance for error** — minimises hazards and adverse consequences of accidental/unintended actions.
6. **Low physical effort** — can be used efficiently and comfortably with minimum fatigue.
7. **Size and space for approach and use** — appropriate size/space for reach, manipulation, and use regardless of body size/posture.

---

## Multi-Sensory Systems

- The 5 senses (sight, sound, touch, taste, smell) give a fuller interaction with the natural world, but **computers rarely offer such richness**.
- **Usable today**: sight, sound, touch (sometimes). **Not yet**: taste, smell.
- **Multi-modal** vs **multi-media**:
  - *Multi-modal* = more than one **sense/mode** of interaction (e.g. a text processor speaks words *and* echoes them to the screen).
  - *Multi-media* = several **media** to communicate information, possibly using the *same* mode (video + animation + text + still images all use the visual mode; plus speech/non-speech sound = two more media, a different mode).

### Speech
- **Structure of speech**: phonemes (basic atomic units; sound varies with context) → allophones (all sounds in the language) via **co-articulation** (context transforms phonemes) → morphemes (smallest meaningful unit); plus **syntax** (sentence structure) and **semantics** (meaning).
- **Speech recognition problems**: different speakers (accent, intonation, stress, idiom, volume); syntax of similar sentences varies; background noise; "um/err" filler; words alone insufficient — semantics/context needed; requires intelligence to understand.
- **The Phonetic Typewriter** (Finnish, phonetic language): trained on one speaker, generalises; a neural network clusters similar sounds labelled with characters; needs a large dictionary of minor variations; poorer on untrained speakers.
- **When speech works**: single-user / limited-vocabulary (dictation, voice-activated phone systems); hands occupied (driving, manufacturing); physical disabilities; lightweight mobile devices. General wide-vocabulary open use remains problematic.
- **Speech synthesis** (generation): natural/familiar but **intrusive** (needs headphones / creates workplace noise) and **transient** (harder to review/browse). Successful in constrained, motivated contexts — **screen readers** for visually impaired; **warning signals** for pilots whose visual/haptic channels are full.

### Non-Speech Sounds
- Boings, bangs, squeaks, clicks — commonly used for warnings/alarms; evidence they help (fewer typing mistakes with key clicks; video games harder without sound); **language/culture independent** (unlike speech).
- **Dual-mode displays**: information presented along two sensory channels — redundant presentation resolves ambiguity in one mode through another.
- **Auditory icons**: natural sounds mapped to object/action meanings (e.g. smashing glass ≈ throwing something away). Problem: not everything has an associated natural meaning.
- **SonicFinder (Mac)**: folders = papery noise; moving = dragging sound; copying = liquid-pour sound with rising pitch for progress; bigger files = louder.
- **Earcons**: synthetic structured sounds (motives) representing actions/objects; **family earcons** group similar classes (e.g. "errors" family contains syntax + OS errors). Easy to group/refine due to compositional/hierarchical nature, but **harder to associate with interface tasks** (no natural mapping).

### Touch, Handwriting, Gesture
- **Touch / haptic**: cutaneous perception (tactile, vibrations) + kinesthetics (movement/position, force feedback). Gives info on shape, texture, resistance, temperature, spatial factors. Technologies: electronic Braille displays, force-feedback devices (e.g. Phantom).
- **Handwriting recognition**: complex strokes captured by digitising tablet → sequence of dots; breakthroughs via stroke (not bitmap) analysis and special alphabets (Graffiti on PalmOS); usable even without training, but many still prefer keyboards.
- **Gesture**: gestural input ("put that there"), sign language; technology: data gloves, position sensing (MIT Media Room). Natural for pointing; enhances communication between signing and non-signing users; but user-dependent/variable and suffers co-articulation issues.

### Users with Disabilities and Differences
| Impairment | Support techniques |
|---|---|
| Visual | screen readers, SonicFinder, auditory icons |
| Hearing | text communication, gesture, captions |
| Physical | speech I/O, eyegaze, gesture, predictive systems (Reactive keyboard) |
| Speech | speech synthesis, text communication |
| Dyslexia | speech input/output |
| Autism | communication, education |

- **Age groups**: older people (disability/memory aids, communication tools against social isolation); children (appropriate devices, involvement in design).
- **Cultural differences**: nationality, generation, gender, race, class, religion, etc. affect interpretation of language, symbols, gesture, and colour.

---

## User Support

- **Types of support** at different times: quick reference, task-specific help, full explanation, tutorial.
- **Help vs documentation**: help is *problem-oriented and specific*; documentation is *system-oriented and general*. Same design principles apply to both.
- **Requirements** for good support: **availability** (continuous, concurrent with the main app), **accuracy/completeness** (matches actual behaviour), **consistency** (within help and with docs), **robustness** (error handling, predictable), **flexibility** (suits experience/task), **unobtrusiveness** (doesn't block work).

### Approaches to User Support
- **Command assistance** (UNIX `man`, DOS `help`) — good for quick reference; assumes the user knows what to look for.
- **Command prompts** — info on correct usage when an error occurs; good for simple syntactic errors; still assumes command knowledge.
- **Context-sensitive help** — request interpreted by context (e.g. tooltips).
- **On-line tutorials** — work through basics in a test environment; useful but often inflexible.
- **On-line documentation** — paper docs on computer; continually available; hard to browse → hypertext helps.
- **Wizards** — task-specific tool leads the user step-by-step using answers; good for safe completion of complex/infrequent tasks; constrained (limited flexibility); **must allow going back**.
- **Assistants** — monitor behaviour and offer contextual advice (e.g. MS paperclip); can be irritating; **must be under user control** (e.g. XP smart tags).

### Adaptive Help Systems
Use knowledge of context, individual user, task, domain, and instruction to adapt help. Problems: large knowledge requirements; who controls the interaction; what/how much to adapt; scope of adaptation.

- **User modelling**:
  - single generic user (non-intelligent);
  - user-configured model (adaptable);
  - system-configured model (adaptive).
- **Knowledge representation**:
  - **quantification** — user moves between expertise levels (numeric measure of what they know);
  - **stereotypes** — user classified into a category;
  - **overlay** — idealised expert model constructed, actual use compared to ideal (model holds commonality or difference; special case: behaviour compared to a known error catalogue).
- **Domain/task modelling**: common errors/tasks, current task; usually via command-sequence analysis; problems: representing tasks, interleaved tasks, user intention.
- **Advisory strategy**: choosing the right style of advice (reminder, tutorial, …) for a situation.
- **Techniques**: rule-based (logic/production rules; large domains), frame-based (semantic networks; small domains), network-based (relationships between facts), example-based (implicit in decision structure; trained, little knowledge acquisition).
- **Issues in adaptive help**: initiative (user vs system control; can system interrupt?); effect (what is adapted; model only what is needed); scope (application vs system level — latter more complex).

### Designing User Support
- User support is **not an "add-on"** — design it integrally with the system; concentrate on *content and context*, not technology.
- **Presentation**: how help is requested (command/button/function/separate app) and displayed (new window/whole screen/split/pop-up/hint icons); use clear, familiar, consistent language; instructional (not descriptive); avoid text blocks; indicate summary vs example.
- **Implementation**: is help an OS command, a meta command, or an application? Structure of help data (single file / hierarchy / database)? Resources (screen space, memory, speed)? Flexibility/extensibility, hard copy, browsing.

---

## Cognitive Models

Cognitive models represent aspects of the user: understanding, knowledge, intentions, processing. Common categorisation: **competence vs performance**; computational flavour; no clear divide.

### Goal and Task Hierarchies
- **Goals** = intentions (what you'd like to be true); **tasks** = actions (how to achieve it).
- **GOMS** (Goals, Operators, Methods, Selection) — goals are internal; models *routine learned behaviour*, not problem solving.
- **HTA** (Hierarchical Task Analysis) — actions are external; tasks are abstractions (covered in Ch7).
- Example GOMS (close window):
  ```
  GOAL: CLOSE-WINDOW
    [select GOAL: USE-MENU-METHOD
       MOVE-MOUSE-TO-FILE-MENU
       PULL-DOWN-FILE-MENU
       CLICK-OVER-CLOSE-OPTION
     GOAL: USE-CTRL-W-METHOD
       PRESS-CONTROL-W-KEYS]
  Rule 1: Select USE-MENU-METHOD unless another rule applies
  Rule 2: If application is GAME, select CTRL-W-METHOD
  ```
- **Issues for goal hierarchies**: granularity (where to start/stop); routine learned behaviour; the **unit task**; conflict (multiple ways to a goal); error.

### Cognitive Complexity Theory (CCT)
- Parallel description: user **production rules** + device **generalised transition networks**.
- Production rules: `if condition then action`; stored in LTM. Working memory modelled as an **attribute–value** mapping; rules pattern-matched to working memory.
- Models **novice vs expert** style rules; error behaviour can be represented.
- **Measures**: depth of goal structure; number of rules; comparison with device description.

### Linguistic Notations
- **BNF** (Backus–Naur Form): a syntactic view of dialogue.
  ```
  nonterminal ::= expression   (expression = terminals + nonterminals, + for sequence, | for alternatives)
  draw line ::= select line + choose points + last point
  ```
  Measurements: number of rules, number of `+`/`|` operators. Complications: same syntax for different semantics; no reflection of user perception; minimal consistency checking.
- **TAG** (Task–Action Grammar): makes consistency explicit via **semantic features/parameters**. Example — consistency of argument order made explicit:
  ```
  file-op[Op] ::= command[Op] + filename + filename | command[Op] + filenames + directory
  command[Op = copy] ::= cp ; command[Op = move] ::= mv ; command[Op = link] ::= ln
  ```
  Also models user's world knowledge and congruence between features/commands (derived rules).

### Physical and Device Models
- **KLM (Keystroke Level Model)**: the lowest level of (original) GOMS. Six execution-phase operators:
  - **K** keystroking, **P** pointing, **H** homing, **D** drawing (physical/motor);
  - **M** mental preparation;
  - **R** system response.
  - `T_execute = T_K + T_P + T_H + T_D + T_M + T_R` (times empirically determined).
  - Complementary with goal hierarchies; used to **compare alternatives** (e.g. Ctrl-W method ≈ 2.03 s vs menu method ≈ 3.75 s, starting hand on mouse).
- **Buxton's 3-state model**: a descriptive model of GUI interaction in three states — State 0 (out of range), State 1 (tracking), State 2 (dragging).

### Architectural Models
- All cognitive models make assumptions about mind architecture: LTM/STM, problem spaces, interacting cognitive subsystems, connectionist models.
- Most models **do not handle perception/observation** well; some extended (BNF with sensing terminals, Display-TAG) but problems persist. **Display-based interaction** distinguishes exploratory interaction vs planning.

---

## Summary
- Universal design principles push interfaces toward equitable, flexible, simple, perceptible, error-tolerant, low-effort, accessible designs.
- Multi-sensory and alternative inputs (speech, sound, touch, handwriting, gesture) extend access, especially for disabilities.
- User support must be integral, with help/documentation, wizards, assistants, and adaptive help built on user/domain models.
- Cognitive models (GOMS, CCT, BNF/TAG, KLM, Buxton) let us predict performance and diagnose interaction difficulty before building.
