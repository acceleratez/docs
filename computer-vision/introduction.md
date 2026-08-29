# Introduction to Computer Vision

> Source: CS1674 Introduction to Computer Vision, Dr. Yuqi Ouyang (SCUPI). Textbook: Szeliski, *Computer Vision: Algorithms and Applications* (2nd ed., 2022).

## What is Computer Vision?

**Computer vision (CV)** is the field that enables machines to *perceive* and *understand* the world from images and video. The informal goal is to perceive the "story" behind a picture — to recover the physical reality and semantic meaning that produced a 2D image.

Formally, CV spans a spectrum of tasks:

- **Low-level vision** — operate on raw pixels: filtering, resampling, denoising, edge/feature detection.
- **Mid-level vision** — geometry and structure: stereo, motion, homography, tracking.
- **High-level vision** — semantics: recognition, detection, segmentation, captioning, synthesis.

### An image as a function

A grayscale image is a 2D function of intensity:

$$f(x, y) : \mathbb{R}^2 \to \mathbb{R}, \qquad f(x,y) \in [0, 255]$$

A **digital image** is a *discrete, sampled, quantized* version of a continuous underlying signal. Color images extend this to 3 channels (e.g., RGB) or more (e.g., RGBA, hyperspectral). This sampling/quantization step is the root of many later problems (aliasing, etc.).

### Computer vision vs. human vision

| Aspect | Computers | Humans |
|---|---|---|
| Automation | Excellent at repetitive, fast tasks | Slow, fatigues |
| Complexity / difficulty | Historically weak, now strong via deep learning | Excellent intuition & generalization |
| Rate of improvement | Accelerating (deep learning era) | Fixed by biology |
| Needs | Large labeled data, compute | Prior knowledge, few examples |

Both are good at different points. The "difficulty" of problems keeps changing as methods improve — every time a task is solved, the frontier moves.

### Why study CV now?

- Deep learning (CNNs, Transformers, diffusion) has driven a decade of accelerating progress.
- Most modern applications are < 5 years old (generative AI, autonomous driving, medical AI).
- An active research area: many new apps appear every ~2 years.

---

## Goals of Computer Vision

The field pursues several inter-related goals:

1. **Compute the 3D shape of the world** — reconstruct geometry from one or more images (SfM, stereo, depth).
2. **Recognize objects and events** — classification, detection, activity recognition (e.g., *Terminator 2*, 1991 popularized the idea).
3. **Enhance images** — computational photography: super-resolution, low-light photography, depth-of-field control on cell phones, object removal.
4. **Forensics** — recover information not visible to the eye.
5. **Synthesize images** — GANs, diffusion models, sentence-to-image (DALL·E 2, Imagen).

### Representative application areas

- **OCR & document analysis** — digit recognition (AT&T labs, 1990s), license plate readers.
- **Face analysis** — real-time face detection in nearly all cameras; face unlock (iPhone X); vision-based biometrics (iris matching, e.g., the "Afghan Girl" identification).
- **Special effects & graphics** — movie VFX, motion capture (ILM, *Pirates of the Caribbean*).
- **Image synthesis & deepfakes** — Progressive GANs (Karras et al., ICLR 2018); deepfake detection (whichfaceisreal.com).
- **Sentence-to-image** — "An astronaut riding a horse" (DALL·E 2); "A Corgi riding a bike in Times Square wearing sunglasses" (Imagen).
- **Sports** — semi-automated offside (VAR-assisted systems).
- **Autonomous driving** — Tesla vision-only stack, real-time, camera-based, no lidar.
- **Robotics** — NASA Mars Curiosity rover; Amazon Prime Air.
- **Medical imaging** — 3D imaging (MRI, CT), skin cancer classification, surgical instrument segmentation.

---

## Why is Computer Vision Hard?

Perception is an *inherently ambiguous, inverse problem*: many 3D scenes can produce the same 2D image.

### Sources of difficulty

| Difficulty | Description |
|---|---|
| **Viewpoint variation** | Same object looks different from different angles. |
| **Illumination** | Lighting changes alter appearance dramatically. |
| **Scale** | Objects appear at vastly different sizes. |
| **Intra-class variation** | "Chair" can be a stool, office chair, throne — huge shape/appearance variety. |
| **Background clutter** | The object blends into a busy scene. |
| **Motion** | Moving objects, motion blur. |
| **Occlusion** | Parts of the object are hidden. |
| **Local ambiguity** | A small patch is meaningless without context (e.g., a single pixel of zebra stripe vs. noise). |

### The bottom line

- **Context is essential.** Human perception can be *misleading* yet we resolve ambiguity using prior knowledge of the world.
- **Machines need the same priors.** This is why modern CV leans on learned statistical priors (deep networks trained on massive datasets) rather than pure hand-crafted rules.

> "Human holds prior knowledge of the world — so should machines." — lecture slide

---

## Course Structure (CS1674)

The course is divided into **Low-Level Vision** and **Deep Learning / High-Level Vision**.

### Low-Level Vision
1. Introduction
2. Image Filtering
3. Image Resampling
4. Feature Detection
5. Feature Description and Matching
6. Homography and Projective Transformation
7. Stereo Vision
8. Motion Estimation
9. Tracking

### Deep Learning and High-Level Vision
10. Introduction to Deep Learning
11–12. Training Deep Learning Models
13. Encoder-Decoder for Latent Analysis
14. Convolutional & Recurrent Layers (CNNs, RNNs)
15. Vision Transformer
16. Generative Models: GANs and Diffusion
17. Object Recognition

### Logistics & policies
- **Textbook**: Szeliski 2nd ed. (2022); most content drawn from research papers.
- **Prerequisites**: CS 1501 (algorithms), ML basics, basic Python. No image/video experience required.
- **Assessment**: Attendance 10%; 4 coding assignments 40%; Final Exam *or* Project 50%.
  - Cheatsheet allowed for the final exam.
  - Project-over-exam limited to 3 groups (max 5 students); only publication-level (top-conference workshop) work earns the project grade.
- **Policies**: zero-tolerance plagiarism (both parties get 0); late-submission penalties (10% if on the due day after 00:00:00, then +2%/day); mitigate via department with valid proof.

---

## Key Takeaways

- CV turns images into *understanding*; it ranges from pixel-level filtering to 3D reconstruction and semantic recognition.
- The core challenge is ambiguity; solving it requires both geometric reasoning and learned priors.
- The field is rapidly evolving, powered by deep learning and generative models.

---

## Course Map: Low-Level → High-Level

| Stage | Chapters | Core idea |
|---|---|---|
| Image formation & processing | 2–3 | filtering, resampling, aliasing |
| Features & geometry | 4–7 | detection, description, homography, stereo |
| Motion | 8–9 | optical flow, tracking |
| Deep learning basics | 10–12 | MLPs, training, backprop |
| Representation & sequence | 13, 15 | autoencoders, RNNs |
| Backbones | 14, 16 | CNNs, Vision Transformers |
| Generative | 17–18 | GANs, Diffusion |
| Recognition | 19 | detection, segmentation |

---

## Traditional vs. Deep-Learning CV

- **Traditional (hand-crafted)**: SIFT/HOG features + SVM/DPM; explicit geometry (homography, epipolar); interpretable but brittle, plateaus (Pascal VOC ~41% mAP with DPM).
- **Deep learning**: learned features end-to-end; data-hungry but far more accurate and general (ImageNet top-5 error dropped from 26% to <3% in a few years).
- **Hybrid**: classical geometry (Ch.6–7) remains essential for 3D/mosaics; deep nets handle recognition.

---

## Key Datasets & Benchmarks

| Dataset | Task |
|---|---|
| ImageNet / ILSVRC | classification, detection |
| PASCAL VOC | detection, segmentation |
| COCO | detection, keypoints, segmentation, captioning |
| KITTI | stereo, flow, detection (driving) |
| Middlebury / Sintel | optical flow, stereo |
| LAION | web-scale image–text (for CLIP/SD) |

---

## Notation Used in This Course

- $f(x,y)$: image as function; $I, I_x, I_y, I_t$: image and its derivatives.
- $H, M$: homography / second-moment matrix.
- $G, D$: generator / discriminator (GAN).
- $x_t, \epsilon_\theta$: noisy sample / predicted noise (diffusion).
- $\mathbf{h}_t$: hidden state (RNN); $Q,K,V$: attention matrices.
- IoU, mAP: detection/segmentation metrics.

---

## Study Tips

1. **Do the math**: derive convolution, Harris $M$, Lucas–Kanade, backprop, attention — exams test derivations.
2. **Connect chapters**: filtering (2) → features (4) → matching (5) → stitching (6); gradient → optical flow (8) → tracking (9).
3. **Know the trade-offs**: why CNN vs. ViT, GAN vs. diffusion, R-CNN vs. YOLO.
4. Use the **cheatsheet** allowed in the final exam to summarize formulas above.

> Computer vision is a stack: pixels → features → geometry → learning → recognition → generation. Master the math at each layer and how they connect.
