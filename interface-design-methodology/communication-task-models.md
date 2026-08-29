# Communication and Task Models

Models for **computer-mediated communication/collaboration** (groupware) and **task analysis** methods for understanding users' work.

---

## Communication and Collaboration Models

All computer systems have **group impact** — not just groupware. Ignoring this leads to system failure. We look at levels from face-to-face minutiae to large-scale context: face-to-face communication, conversation, text-based communication, group working.

### Face-to-Face Communication
- The most primitive **and** most subtle form of communication; often seen as the paradigm for computer-mediated communication.
- **Transfer effects**: we carry expectations from face-to-face into electronic media — sometimes disastrous (e.g. interpreting a media glitch as a colleague's rudeness). The "glass wall" effect of video can help.
- **Eye contact**: conveys interest and establishes social presence; poor-quality video is better than audio-only. But video may spoil direct eye contact.
- **Gestures and body language**: much communication is bodily; gesture (and eye gaze) used for **deictic reference**. Head-and-shoulders video loses body language. Trade-off: close focus for eye contact vs wide focus for body language.

### Back Channels
- Back-channel responses: nods, grimaces, shrugs, grunts, raised eyebrows — signals that maintain the conversation without taking the floor.
- **Media restrict back channels**:
  - video → loses body language
  - audio → loses facial expression
  - half-duplex → loses most voice back-channel
  - text → almost nothing left!
- **Turn-taking**: the speaker offers the floor (a fraction-of-a-second gap); the listener requests it (facial expression, small noise). Grunts/"um"s can claim (listener) or hold (speaker) the floor — but too quiet for half-duplex. Trans-continental conferences: lag can exceed the turn-taking gap ⇒ a **monologue**.

### Adjacency Pairs and Structure
- Smallest unit = the **utterance**; turn-taking makes utterances alternate.
- **Adjacency pairs**: simplest structure (e.g. request–promise–assert–declare). May nest for clarification. Example structure: B-x, A-y, B-y, A-z, B-z, A-x.
- **Context in conversation**: utterances are highly ambiguous; we use context to disambiguate.
  - **External context** — reference to the environment (pointing: "that post").
  - **Internal context** — reference to previous conversation ("the post you mentioned").
  - **Indexicals** (that/this/he/she/it) and **deictic reference** link to either; descriptive phrases can also specify.
- **Common ground**: resolving context depends on shared meaning ⇒ participants must share knowledge. Conversation constantly negotiates meaning via **grounding** — each utterance assumed *relevant* (furthers the topic) and *helpful* (comprehensible).
- **Focus and topic**: context resolved relative to current dialogue focus; tracing topics analyses conversation. Topic shifts can cause breakdown if not noticed.
- **Breakdown** happens at all levels (topic, indexicals, gesture). Redundancy makes detection easy and people are very good at **repair** — but electronic media loses redundancy ⇒ breakdowns more severe.

### Speech Act Theory
- A specific form of conversational analysis: utterances are characterised by what they *do* — they are **acts**.
- **Locutionary act** — the said utterance.
- **Illocutionary act** — the intended effect (promises, requests, declarations; the illocutionary *point*).
- **Perlocutionary act** — the actual result.
- Speech acts need not be spoken (silence often interpreted as acceptance).
- **Conversation for Action (CfA)**: generic patterns of acts; regarded as central. Basis for the groupware tool **Coordinator** (structured email forcing users into CfA structure) — powerful but **not liked by users**.

### Text-Based Communication
- Most common medium for asynchronous groupware (except voice mail). Familiar like paper letters, but electronic text may act as a speech substitute.
- **Types**: discrete directed messages (no structure); linear messages added in temporal order; non-linear hypertext linkages; spatial 2-D arrangement.
- **Problems**: no facial expression/body language ⇒ weak back channels; hard to convey affective state or illocutionary force. Participants compensate with **flaming** and **smileys** (`;-)`, `:-(`, `:-)`).
- **Grounding constraints** (often weaker in text): **cotemporality** (instant feedthrough), **simultaneity** (speaking together), **sequence** (utterances ordered). Loss of sequence (network delay, coarse granularity) ⇒ overlap and breakdown of turn-taking.
- **Maintaining context**: text loses external context (hence deixis), though linking to shared objects helps. Non-linear/threaded systems maintain parallel conversations better.

### Pace and Granularity
- Pace of conversation (rate of turn-taking): face-to-face (every few seconds) → telephone (½ minute) → email (hours/days). Face-to-face is highly interactive (vague initial utterance, feedback refines); lower pace ⇒ less feedback ⇒ less interactive.
- **Coping strategies** for slow communication (increase granularity): **eagerness** (look ahead in the conversation game); **multiplexing** (several topics in one utterance).

### The Conversation Game
- Conversation is like a game; linear text follows one path, hypertext can follow several at once. Participants choose the path by their utterances.

### Group Dynamics and Environment
- Work groups constantly change in **structure** and **size**; many groupware systems have explicit **roles**, but roles depend on context/time and may not reflect actual duties. Groups also fragment into sub-groups; new members must be able to "catch up."
- **Physical environment** affects face-to-face working: meeting-room layout (recessed terminals reduce visual impact; inward-facing encourages eye contact; power positions at the front/in reach of the whiteboard; augmented rooms with shared screens/keyboards).
- **Distributed cognition**: traditional cognitive psychology puts thinking "in the head"; distributed cognition looks to the *world* — thinking occurs in interaction with people and the physical environment. Implications: importance of mediating representations; group knowledge > sum of parts; design focus on external representation.

---

## Task Models

**Task analysis** = methods to analyse people's jobs: what they do, what they work with, what they must know.

### Approaches to Task Analysis
- **Task decomposition** — splitting a task into (ordered) subtasks.
- **Knowledge-based techniques** — what the user knows about the task and how it's organised.
- **Entity/object-based analysis** — relationships between objects, actions, and the people who perform them.
- Many notations/techniques exist. **General method**: observe → collect unstructured lists of words/actions → organise using notation or diagrams.

### Distinctions
- **Systems analysis** vs **task analysis**: system design focuses on the *system*; task analysis focuses on the *user*.
- **Cognitive models** vs **task analysis**: cognitive models focus on *internal mental state*; task analysis focuses on *external actions*.
- **Practiced unit task** vs **whole job**: task analysis spans the whole job.

### Hierarchical Task Analysis (HTA)
- **Aims**: describe the actions people do; structure them within a task/subtask hierarchy; describe the order of subtasks.
- Most common variant (others: CTT using LOTOS temporal operators).
- **Textual HTA** example (clean the house):
  ```
  0. in order to clean the house
  1. get the vacuum cleaner out
  2. get the appropriate attachment
  3. clean the rooms
     3.1 clean the hall
     3.2 clean the living rooms
     3.3 clean the bedrooms
  4. empty the dust bag
  5. put vacuum cleaner and attachments away
  Plan 0: do 1-2-3-5 in that order; when the dust bag gets full do 4
  Plan 3: do any of 3.1, 3.2, 3.3 in any order
  ```
  **Only the plans denote order.**
- **Stopping rules**: expand only relevant tasks; motor actions = lowest sensible level. Imagine asking the user "what are you doing now?" — the answer may range from "typing ctrl-B" to "preparing a legal case" (HTA as a grammar, lexical→syntax).
- **Refining**: heuristics — paired actions (where is "turn on gas"?), restructure ("make pot"), balance, generalise.
- **Types of plan**: fixed sequence; optional tasks; wait-for-event; cycles; time-sharing; discretionary; mixtures. Note: "waiting" may be a task (actively waiting) or part of a plan (end of delay is the event). TA is not an exact science.

### Knowledge-Based Analyses
- Focus: **Objects** used in the task; **Actions** performed; **Taxonomies** representing levels of abstraction.
- **Task Description Hierarchy (TDH)**: branch types —
  - **XOR** — object in one and only one branch (normal taxonomy).
  - **AND** — object must be in both (multiple classifications).
  - **OR** — weakest; can be in one, many, or none.
  - **Uniqueness rule**: the diagram must distinguish all objects. **Abstraction and cuts**: after detailed taxonomy, "cut" to ignore lower levels → terms in **Knowledge Representation Grammar (KRG)**.
- Actions have taxonomies too (e.g. kitchen job: preparation/cooking/dining).

### Entity-Relationship Techniques
- Similar to OO analysis but includes non-computer entities and emphasises domain understanding.
- **Objects & attributes**: concrete (spade, glasshouse), actors (human: Vera/Sam/Tony; non-human: irrigation controller), composite (the team = {Vera, Sam, Tony}; tuple: tractor = <Fergie, plough>). Attributes: e.g. Pump3 status {on/off/faulty}, capacity 100 L/min (need not be computationally complete).
- **Actions** with **agent** (who performs), **patient** (what is changed), **instrument** (what is used). Watch for implicit agents ("the field was ploughed" — by whom?), indirect agency ("Vera programmed the controller to irrigate"), messages ("Vera told Sam to…"), and **roles** (Vera as worker or manager).
- **Events**: performance of an action; spontaneous events ("the marrow seed germinated"); timed events ("at midnight the controller turns on").
- **Relationships**: object–object (social: Sam subordinate to Vera; spatial: pump3 in glasshouse); action–object (agent/patient/instrument); action–event (temporal and causal: "Sam digs the carrots because Vera told him"). Use HTA or dialogue notations for temporal relations and to show task sequence / object lifecycle.

### Sources of Information
- **Documentation** (manuals say what *should* happen; good for keywords/interview prompts), **Observation** (formal/informal, lab/field), **Interviews** (ask both manager and worker!).
- **Extraction from transcripts**: list nouns (objects) and verbs (actions); beware technical language and context ("the rain poured" vs "I poured the tea"). Sorting/classifying via cards or an outliner; rank objects/actions for relevance. Iterative — but costly, so use cheap sources where available.

### Outputs and Uses
- **Conceptual Manual** (from knowledge/entity–relation analysis) — good for open-ended tasks.
- **Procedural "How to do it" Manual** (from HTA) — good for novices; assumes all tasks known.
- **Uses — requirements & design**: lifts focus from system to use; suggests automation candidates; uncovers the user's conceptual model. Detailed interface design: taxonomies suggest menu layout; object/action lists suggest interface objects; task frequency guides defaults; existing sequences guide dialogue design.
- **Note**: task analysis is **never complete**; rigid task-based design ⇒ an inflexible system.

---

## Design Implications for Groupware

The communication analysis above yields concrete design guidance:

- **Preserve redundancy**: don't strip back channels; the more cues (text + audio + video + shared objects), the easier grounding and repair become.
- **Support grounding constraints**: provide cotemporality (live updates), sequence (clear ordering), and shared objects that carry external context (so deixis works).
- **Design for pace**: slower media need coping aids — eagerness (show upcoming context) and multiplexing (bundle topics); hypertext beats linear text for parallel conversations.
- **Model conversation explicitly**: speech acts / CfA help structure workflows, but respect that users resist over-constrained dialogue (the Coordinator lesson).
- **Accommodate changing groups**: allow new members to catch up; don't hard-wire roles that drift; support sub-groups.
- **Externalise cognition**: provide mediating representations and shared artefacts (distributed cognition) rather than forcing everything "in the head."

## Summary
- Communication models show that media constrain back channels, turn-taking, context, and grounding; breakdowns are normal but redundancy aids repair. Speech-act theory and CfA structure groupware; distributed cognition shifts design toward external representations.
- Task analysis (HTA, knowledge-based taxonomies, entity–relationship) describes what users do and why — feeding requirements, conceptual models, and concrete interface design, while staying flexible.
