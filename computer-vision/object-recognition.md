# Object Recognition

> Source: CS1674 Ch.19. The family of recognition tasks, classic detectors (HOG, DPM), the deep R-CNN family, YOLO/SSD, semantic/instance segmentation (FCN, Mask R-CNN), and modern web-scale / CLIP recognition.

## 1. Flavors of Object Recognition

| Task | Output | Example |
|---|---|---|
| **Classification** | one label per image | "cat" |
| **Classification + Localization** | label + 1 box | "cat" + (x,y,w,h) |
| **Object Detection** | multiple boxes + labels | "dog, dog, cat" with boxes |
| **Semantic Segmentation** | class label per pixel (no instances) | GRASS, CAT, TREE, SKY |
| **Instance Segmentation** | mask per object instance | DOG, DOG, CAT masks |

---

## 2. Detection Framework (Classic)

1. Build/train an **object model** (representation + classifier).
2. **Generate candidate regions** in the new image.
3. **Score** the candidates.

### 2.1 Window-template models
- Train a binary classifier (e.g., car / non-car) on features extracted from a sliding window.
- At test time: **slide the window** over positions/scales, score each by the classifier.
- Problem: huge number of locations/scales → very expensive.

### 2.2 Evaluation: IoU, TP, FP
- **True Positive** (for class $c$): predicted box `pred_bb`, ground-truth `gt_bb` of class $c$, and $\mathrm{IoU}(\text{pred\_bb}, \text{gt\_bb}) \ge 0.5$.
- **False Positive**: a `pred_bb` for class $c$ with no matching `gt_bb`, or IoU < 0.5.
- IoU = $\frac{|A\cap B|}{|A\cup B|}$.

---

## 3. HOG + SVM Pedestrian Detector (Dalal & Triggs, CVPR 2005)

1. Extract a fixed **64×128** window at multiple positions and scales.
2. Compute **HOG (Histogram of Oriented Gradients)** features.
3. Score the window with a **linear SVM**.
4. Apply **non-maximum suppression (NMS)** to remove overlapping lower-scoring detections.

### HOG details
- Divide image into **blocks** of cells.
- **9 orientation bins** (unsigned angles $0^\circ$–$180^\circ$).
- Votes weighted by gradient **magnitude**.
- One histogram per **8×8 pixel cell**; histograms in a block are concatenated and **normalized**.

### Non-max suppression
Keep the highest-scoring box; suppress other boxes overlapping it (by IoU) with lower scores.

---

## 4. Parts-Based & Deformable Part Models

### Why parts?
Many objects are articulated; appearance varies by viewpoint/instance. Model an object as a collection of **parts** with appearance + spatial configuration.

- **Fixed template**: score = sum of fixed-position feature scores (rigid).
- **Bag of words**: ignore spatial layout entirely.
- **Articulated parts**: each part detectable and movable.

### Deformable Part Model — DPM (Felzenszwalb et al., PAMI 2010)
- **Root filter** + multiple **part filters** + **deformation weights**.
- Score of a hypothesis = (sum of part appearance scores) − (sum of deformation costs):

$$\text{score} = \sum_i \text{appearance}(p_i) - \sum_i \text{deformCost}(p_i)$$

where deformation cost penalizes each part $p_i$ for moving from its expected **anchor** location by displacement $(dx,dy)$.

- Pascal VOC mAP plateaued around **41%** (VOC'07) — complexity rose but accuracy plateaued → deep learning was the breakthrough.

---

## 5. Deep Learning: Classification + Localization

- Treat **localization as regression**: predict 4 numbers $(x,y,w,h)$.
- Problem for detection: each image needs a **different number of outputs** (variable object count) → can't fix the network output size directly.

### Sliding-window CNN?
Apply a CNN to many crops, classify each as object/background. Too slow (huge locations/scales).

---

## 6. Region-Proposal Methods

Find "blobby" regions likely to contain objects (high **objectness**), restricting the windows passed to the classifier:
- **Selective Search** (~2000 proposals in a few seconds on CPU)
- Objectness (Alexe et al.), Edge Boxes, BING (300 fps).

---

## 7. The R-CNN Family

### R-CNN (Girshick et al., CVPR 2014)
1. Extract region proposals (~2000/image).
2. Warp each to 227×227, forward through a **CNN** → 4096-d `fc7` features.
3. Classify regions with **linear SVMs**.
4. **Bounding-box regression** refines proposals.
- Slow: 84h training, **47s/image** inference (VGG16); many post-hoc components.

### Fast R-CNN (Girshick, ICCV 2015)
- Run the CNN **once** on the whole image; use **RoI pooling** to extract per-region features → end-to-end training.
- Timings (VGG16): 9.5h train, **0.32s/image**, mAP 66.9% (vs. R-CNN 84h/47s/66.0%). ~8.8× train, 146× test speedup.

### Faster R-CNN (Ren et al., NIPS 2015)
- Make the CNN **produce its own proposals** via a **Region Proposal Network (RPN)**.
- Jointly train with **4 losses**: RPN object/not-object, RPN box regression, final classification, final box coordinates.
- ~**7 FPS**, mAP 73.2% (vs. Fast R-CNN 0.5 FPS). Real-time-ish, high accuracy.

---

## 8. Detection Without Proposals: YOLO & SSD

### YOLO — You Only Look Once (Redmon et al., CVPR 2016)
- Divide image into a **7×7 grid**.
- Each cell predicts **B** boxes, each with 5 numbers: $(d_x, d_y, d_w, d_h, \text{confidence})$, plus **C** class probabilities.
- Output tensor: $7\times7\times(5B + C)$. For Pascal VOC: $7\times7\times(2\cdot5+20)=7\times7\times30 = 1470$ outputs.
- Combine box + class predictions, then **NMS + threshold**.
- **45 FPS / 22 ms** at 69.0 mAP (vs. Faster R-CNN 7 FPS / 73.2 mAP) — unified, real-time.

### SSD — Single Shot MultiBox Detector (Liu et al., ECCV 2016)
- Single forward pass; detect at **multiple feature-map scales** for multi-scale objects.

| Method | mAP (VOC07) | Speed |
|---|---|---|
| DPM v5 | 33.7 | 14 s/img (0.07 FPS) |
| R-CNN | 66.0 | 20 s/img |
| Fast R-CNN | 70.0 | 2 s/img |
| Faster R-CNN | 73.2 | 140 ms/img (7 FPS) |
| YOLO | 69.0 | 22 ms/img (45 FPS) |

---

## 9. Semantic Segmentation

Label **every pixel** with a category; do **not** separate instances.

- **Sliding-window** pixel classification is inefficient (no feature reuse).
- **Fully Convolutional Network — FCN** (Long, Shelhamer & Darrell, CVPR 2015): pass the image through conv layers producing **C×H×W** score maps, `argmax` per pixel → H×W labels. Full-res convs are expensive.
- **Downsample then upsample** inside the network:
  - Downsampling: pooling, strided convolution.
  - Upsampling:
    - **Unpooling / nearest-neighbor**: copy values.
    - **Max unpooling**: use recorded pooling-switch positions.
    - **Transpose convolution** (learnable upsampling): a 3×3 transpose conv, stride 2, pad 1 maps 2×2 → 4×4; output contains filter copies weighted by input, summed at overlaps. Stride sets the input→output movement ratio.

---

## 10. Instance Segmentation: Mask R-CNN (He et al., ICCV 2017)

Extends Faster R-CNN with a **mask branch**:
- **RoI Align** (better than RoI pooling) extracts features.
- Predicts, per class $C$: a **mask**, **box coordinates (4C)**, and **classification scores (C)**.
- Gives a per-instance segmentation mask.

### SAM / SAM2 (Kirillov 2023; Ravi 2025)
Promptable segmentation transformers — segment any object given a point/box/mask prompt; SAM2 extends to video.

---

## 11. Learning from Noisy Web Data & CLIP

- Massive **image–text pairs** from the web; assume co-occurring text describes the image.
- Train image and text encoders with a **contrastive objective**: matched pairs more similar than mismatched ones.

### CLIP (Radford et al., ICML 2021)
- In a batch of $N$ pairs, classify each text to the correct image and vice versa.
- **Zero-shot recognition**: compute dot product of image embedding with prompt embeddings (e.g., "A photo of a dog"); return the highest-scoring class. Prompts can be hand-tuned or learned; extendable to detection.

---

## 12. Summary

- Recognition spans classification → detection → semantic/instance segmentation.
- Classic: **HOG+SVM** sliding window + NMS; **DPM** adds deformable parts (plateaued ~41% mAP).
- Deep: **R-CNN → Fast → Faster** (RoI pooling → RPN); **YOLO/SSD** drop proposals for real-time.
- Segmentation: **FCN** (transpose conv / unpooling upsampling); **Mask R-CNN** adds mask branch (RoI Align).
- Modern: **CLIP** enables web-scale, zero-shot recognition; **SAM/SAM2** promptable segmentation.
