# The Human and the Computer

Foundations of HCI: understanding **human information-processing capabilities** (vision, hearing, touch, memory, reasoning, emotion) and **computer characteristics** (devices, memory, processing, networks) in order to design usable, effective interactive systems. The central idea (the "golden rule of design") is: **understand your materials** — both the machine and the person.

---

## The Human

We must understand the human as an information-processing system: stimuli are received through the senses, held and processed in memory, and acted upon through reasoning and motor response. Emotion and individual differences modulate every stage.

### Vision
- **Two stages of visual processing**:
  1. **Physical reception** of the stimulus — light reflects from objects, is focused (upside-down) on the retina. The retina contains **rods** (low-light / monochrome vision) and **cones** (colour vision); **ganglion cells** in the brain detect pattern and movement.
  2. **Processing and interpretation** of the stimulus — the visual system resolves ambiguity using context.
- **Visual angle** indicates how much of the view an object occupies (a function of its *size* and *distance* from the eye). **Visual acuity** (ability to perceive detail) is limited and *increases with luminance*; flicker perception also improves with luminance.
- **Perceived size constancy**: familiar objects are perceived as constant size despite changes in visual angle with distance. Cues such as overlapping help perception of size and depth.
- **Colour** = **hue + intensity + saturation**. Cones are sensitive to colour wavelengths, but **blue acuity is lowest**. About **8% of males and 1% of females are colour-blind** → never use blue for important detail, and never rely on colour alone (combine with shape/text).
- The visual system compensates automatically for movement and changes in luminance. **Optical illusions** (Ponzo, Müller-Lyer) arise from over-compensation; context resolves ambiguity.
- **Reading**: involves **saccades** (rapid eye jumps) and **fixations** (where perception occurs). Word *shape* matters for recognition. **Negative contrast** (light text on dark background) improves reading from a computer screen.

### Hearing
- **Physical apparatus**: outer ear (protects and amplifies) → middle ear (transmits sound as vibrations) → inner ear (chemical transmitters released → impulses in auditory nerve).
- Sound parameters: **pitch** (frequency), **loudness** (amplitude), **timbre** (quality/type).
- Humans hear roughly **20 Hz–15 kHz**, and are **less accurate at distinguishing high frequencies** than low.
- The auditory system **filters sounds** to attend to one over background noise — the **cocktail party phenomenon**.

### Touch and Movement
- **Skin receptors**: **thermoreceptors** (heat/cold), **nociceptors** (pain), **mechanoreceptors** (pressure — some instant, some continuous). Some body areas (e.g. fingers) are far more sensitive.
- **Kinesthesia** = awareness of body position; affects comfort and performance.
- **Reaction time** (response to stimulus) + **movement time** (depends on age/fitness):
  | Stimulus | Approx. reaction time |
  |---|---|
  | Visual | ~200 ms |
  | Auditory | ~150 ms |
  | Pain | ~700 ms |
  - Increasing reaction time **decreases accuracy for unskilled operators but not for skilled ones** (skill absorbs the cost).
- **Fitts' Law** — time to hit a screen target:
  ```
  Mt = a + b · log₂(D / S + 1)
  ```
  where `Mt` = movement time, `D` = distance to target, `S` = size of target, and `a`, `b` are empirically determined constants. **Design implication**: make targets as large as possible and distances as small as possible (large buttons, short travel).

### Memory
Three functional memory systems; selection of stimuli is governed by **level of arousal** (attention).

| Type | Capacity | Access | Decay |
|---|---|---|---|
| **Sensory** (iconic/echoic/haptic) | Buffer for stimuli | — | Continuously overwritten |
| **Short-term / working (STM)** | 7 ± 2 chunks | ~70 ms | ~200 ms |
| **Long-term (LTM)** | Huge / unlimited | ~0.1 s | Very slow (if at all) |

- **Sensory memory**: buffers — iconic (visual), echoic (aural), haptic (tactile). Examples: the "sparkler" trail, stereo sound. Continuously overwritten.
- **STM / working memory**: a scratch-pad for temporary recall (e.g. a phone number). Capacity **7 ± 2 chunks** — a chunk can be a digit, a word, or a meaningful group. This is why menu/option groupings matter (and why Miller's 7±2 is about STM, *not* menu size).
- **LTM**: repository for all knowledge. Two types:
  - **Episodic** — serial memory of events.
  - **Semantic** — structured memory of facts, concepts, skills (semantic is derived from episodic).
- **LTM models of structure**:
  - **Semantic networks** — nodes with **inheritance** (child nodes inherit parent properties); explicit relationships; inference through inheritance.
  - **Frames** — data structures with slots: *fixed* (legs: 4 for DOG), *default* (diet: carnivorous), *variable* (size/colour). Type–subtype relationships.
  - **Scripts** — stereotypical information to interpret a situation (entry conditions, results, props, roles, scenes, tracks), e.g. a visit to the vet.
  - **Production rules** — condition → action (`IF dog wagging tail THEN pat dog`; `IF growling THEN run away`).
- **Storage**: **rehearsal** moves info STM→LTM; **total-time hypothesis** (retention ∝ rehearsal time); **distribution-of-practice effect** (spread learning over time); structure/meaning/familiarity aid recall.
- **Forgetting**: **decay** (gradual, very slow) and **interference** — *retroactive* (new replaces old) and *proactive* (old interferes with new). Retrieval: **recall** (reproduce, cue-assisted) vs **recognition** (knowing it was seen — simpler, because the item itself is the cue). Emotion can make us "choose" to forget.

### Reasoning and Problem Solving
- **Deductive** reasoning: derive the logically necessary conclusion from given premises. Conclusion may be logically valid yet factually false (premises can be wrong).
- **Inductive** reasoning: generalise from seen cases to unseen. **Unreliable** (can only be *proven false*, never proven true) — but useful. Humans are poor at using negative evidence.
- **Abductive** reasoning: from event to cause (e.g. "Sam drives fast when drunk → he must be drunk"). **Unreliable** (false explanations possible). These three — deduction, induction, abduction — are the classic modes of human inference.
- **Problem-space theory**: problem solving = generating states via legal operators within a problem space; **heuristics** (e.g. **means-ends analysis**) select operators. Operates within human information-processing limits (e.g. STM). Best applied to well-defined (puzzle-like) domains.
- **Analogy / analogical mapping**: use knowledge of a similar problem from a similar domain; difficult when domains are semantically different.
- **Skill acquisition**: characterised by **chunking** — grouping information to optimise STM; conceptual rather than superficial grouping; information structured more effectively.

### Errors and Mental Models
- **Slips**: right intention, wrong execution (poor physical skill, inattention, change to skilled behaviour). → *Better interface design* fixes these.
- **Mistakes**: wrong intention (incorrect understanding). Humans build **mental models** to explain behaviour; if the model is wrong (differs from the actual system) errors occur. → Requires *better user understanding* of the system.
- Design must anticipate both: make correct actions easy and obvious, and make the system's true behaviour legible.

### Emotion
- Theories: **James–Lange** (emotion = interpretation of physiological response), **Cannon** (emotional psychological response to stimulus), **Schacter–Singer** (emotion = evaluation of physiological response in light of the whole situation). Emotion involves *both* cognitive and physical responses; the biological response is called **affect**.
- **Affect influences response**: positive → creative problem solving; negative → narrow thinking. **Implications**: stress increases problem-solving difficulty; relaxed users are more forgiving; aesthetically pleasing/rewarding interfaces increase positive affect.

### Individual Differences
- **Long-term**: sex, physical and intellectual abilities.
- **Short-term**: stress, fatigue.
- **Changing**: age.
- Ask: *will this design decision exclude some section of the user population?* (see Universal Design, Ch6).

---

## The Computer

A computer system is made of elements — input devices, output devices, virtual reality, physical interaction, paper, memory, processing, networks — each of which affects the interaction. To understand HCI, you must understand the computer.

### Input / Output Devices
- **Typical system**: screen/monitor, keyboard, mouse/trackpad; variations: desktop, laptop, PDA. The devices dictate the supported **interaction style**.
- **Handwriting recognition**: natural, but technical problems (capturing stroke path/pressure, segmenting joined writing, interpreting letters, coping with styles). Used in PDAs/tablets.
- **Speech recognition**: improving rapidly; most successful for **single-user** (trained) or **limited-vocabulary** systems; problems with noise, imprecision, large vocabularies, different speakers.
- **Eye gaze**: control interface by looking (e.g. look at a menu item to select). Uses low-power laser reflected off retina; mainly used for *evaluation*; potential for hands-free control; high accuracy needs a headset.
- **3D displays**: desktop VR (perspective + motion), stereoscopic vision, VR helmets, shuttered specs.
- **3D interaction**: cockpit/virtual controls, the 3D mouse (six degrees: x,y,z + roll,pitch,yaw), data gloves (fibre optics detect finger position), whole-body tracking (accelerometers / reflective dots + video).
- **VR motion sickness**: caused by conflicting cues — time delay (head moves, display lags); depth perception conflict (headset gives different stereo distance, but all focused in same plane) → conflict between eye *angle* and *focus* ⇒ sickness. Drives technology improvement.
- **Simulators and VR caves**: scenes projected on walls, realistic environments, hydraulic controls, other people.
- **Physical controls, sound, touch**: beeps/bongs/clonks for errors and confirmations; **haptic devices** (vibration, force feedback) in games and simulation (e.g. feel of surgical instruments). Texture/smell/taste technology is very limited.
- **Environment and bio-sensing**: ubiquitous sensors (door switches, ultrasound, RFID); body sensors — iris scanners, body temperature, heart rate, **galvanic skin response (GSR)**, blink rate.
- **Fonts**: serif vs sans-serif; fixed-pitch (Courier) vs variable-pitch (Times). **OCR** converts bitmaps back to text (harder with varied fonts and page layout).
- **Paper-based interaction**: usually output, but also input (OCR, scanning, glyphs, annotated paper with special pens).

### Memory and Processing
- **RAM** ≈ 100 ns access (volatile); **disks** (magnetic/optical) for persistent storage; **flash** for portable/non-volatile.
- **Finite processing speed** causes problems: cursor overshoot (buffered keypresses), "icon wars" (user clicks icon, nothing happens, clicks another, then everything responds and windows fly). *Too fast* is also bad — help screens may scroll too fast to read.
- **Performance bottlenecks**:
  - **Computation-bound** — computation takes ages, frustrating.
  - **Storage-channel-bound** — data transfer disk→memory.
  - **Graphics-bound** — updating displays; sometimes helped by a graphics co-processor.
  - **Network capacity** — shared resources, but slow networks reduce interactive performance.

### Networked Computing
- Networks give access to large memory/processing, other people (groupware, email), and shared resources (especially the web).
- Issues: **network delays** (slow feedback), **conflicts** (many people update data), **unpredictability**.

---

## Psychology and Design — Distilled

The psychology above is distilled into actionable knowledge throughout the course:
- **Guidelines and standards** (Ch4) — e.g. blue acuity ⇒ don't use blue for detail.
- **Cognitive models** (Ch6/Ch8) — GOMS, HTA, KLM predict performance.
- **Evaluation techniques** (Ch5) — experimental and analytic methods to test designs.
- **Golden rule**: **understand your materials** — both computers and people. A design that ignores human capabilities (limited STM, Fitts' law, colour blindness, error-proneness) will fail no matter how powerful the machine.

## Human Capabilities — Design Cheat Sheet

A compact reference linking human limits to concrete design consequences:

| Human capability | Key limit | Design consequence |
|---|---|---|
| Vision | blue acuity lowest; ~8% M / 1% F colour-blind | never rely on colour alone; pair with shape/text |
| Vision | acuity ↑ with luminance | ensure adequate contrast/brightness |
| Hearing | 20 Hz–15 kHz; poorer at high freq | don't depend on high-frequency cues |
| Reaction | visual ~200 ms, auditory ~150 ms | give prompt feedback; avoid waiting |
| Movement | Fitts' law `Mt = a + b·log₂(D/S+1)` | large targets, short distances |
| STM | 7 ± 2 chunks, ~200 ms decay | group options; don't overload screens |
| LTM | huge, slow access | support recognition over recall |
| Reasoning | induction/abduction unreliable | confirm, don't assume inference |
| Errors | slips vs mistakes | prevent (slips) + educate (mistakes) |
| Emotion | positive→creative, negative→narrow | aesthetically pleasing, low-stress UIs |
| Individual diff. | age, ability, fatigue | universal/inclusive design (Ch6) |

This table is the practical bridge from psychology to the guidelines, models, and evaluation methods covered in later chapters.
