# Convolutional Neural Networks

## Motivation

Traditional fully connected neural networks can recognize patterns in data, but they have a fundamental limitation: they are not **shift invariant**. A network that detects a specific pattern at one location in the input will fail to detect the same pattern shifted to a different location, unless it has been explicitly trained with examples covering that exact shift. This demands very large networks and massive training datasets.

> **Shift invariance** is the property that a model's output does not depend on the precise location of a pattern within the input — only its presence matters.

The solution is to **scan** the input with a small detector, applying the same set of weights across all spatial positions. At each location, the local region of the input is processed through an identical subnetwork. The outputs from all positions are then aggregated (e.g., via a maximum or logical OR operation) to determine whether the pattern exists anywhere in the input.

This scanning approach naturally leads to **shared parameter networks**, where:

- Each neuron connects only to a local subset of neurons in the previous layer.
- The weight matrix is sparse and block-structured with identical blocks.
- Any parameter update to one copy of the subnet must equally update all copies.

Convolutional Neural Networks formalize this idea and extend it into a hierarchical feature extraction pipeline.

---

## Image Filtering Fundamentals

Before diving into convolutional layers, it is essential to understand the image filtering operations that inspire them.

### Correlation Filtering

Image filtering computes a function of the local neighborhood at each pixel. A **filter** (also called a *kernel* or *mask*) specifies how to combine values from neighboring pixels via element-wise multiplication and summation.

For a filter $H$ of size $(2k+1) \times (2k+1)$ and an image $F$, correlation filtering at position $(i,j)$ is defined as:

$$G[i,j] = \sum_{u=-k}^{k} \sum_{v=-k}^{k} H[u,v] \cdot F[i+u, j+v]$$

This is known as **cross-correlation**, denoted $G = H \otimes F$. Each output pixel is a linear combination of its neighbors, weighted by the filter values.

### Common Filters

**Box (Averaging) Filter**: A uniform kernel where all entries are equal (e.g., a $3 \times 3$ kernel where every element is $1$). Applied to an image, this produces a moving-average blur effect. Larger kernels produce stronger smoothing.

**Gaussian Filter**: In many applications, nearest neighboring pixels should have more influence than distant ones. A Gaussian kernel approximates a 2D Gaussian function, placing higher weights near the center:

$$
\begin{bmatrix}
1 & 2 & 1 \\
2 & 4 & 2 \\
1 & 2 & 1
\end{bmatrix}
$$

This produces a smoother, more natural blur than a box filter.

**Sharpening Filter**: Accentuates differences between a pixel and its local average. A common kernel subtracts a blurred version from the original:

$$
\begin{bmatrix}
0 & 0 & 0 \\
0 & 2 & 0 \\
0 & 0 & 0
\end{bmatrix} -
\begin{bmatrix}
1 & 1 & 1 \\
1 & 1 & 1 \\
1 & 1 & 1
\end{bmatrix}
$$

**Edge Detection (Gradient) Filters**: The Sobel filter is a classic example that computes image gradients:

$$
G_x =
\begin{bmatrix}
1 & 0 & -1 \\
2 & 0 & -2 \\
1 & 0 & -1
\end{bmatrix}
$$

These filters detect horizontal and vertical edges by measuring intensity differences.

### Convolution vs. Correlation

**Convolution** is closely related to correlation but with one key difference: the filter is flipped in both dimensions (bottom-to-top, right-to-left) before the sliding operation:

$$G[i,j] = \sum_{u=-k}^{k} \sum_{v=-k}^{k} H[u,v] \cdot F[i-u, j-v]$$

Notation: $G = H \ast F$

> For symmetric filters such as Gaussian or box filters, convolution and correlation produce identical results.

In deep learning, the operation performed in a "convolutional layer" is technically cross-correlation, but the term *convolution* is universally used.

---

## Convolution Layer

A convolution layer applies a set of learned filters to the input volume. Each filter slides spatially across the input, computing dot products at every position to produce a 2D **activation map** (or **feature map**).

### How It Works

Given an input volume of size $W_1 \times H_1 \times D_1$ and $K$ filters of size $F \times F \times D_1$:

1. Each filter is convolved across the spatial dimensions of the input.
2. At each spatial position, a dot product is computed between the filter weights and the corresponding $F \times F \times D_1$ input patch, plus a bias term.
3. The result is a single scalar value in the output activation map.
4. With $K$ filters, we obtain $K$ separate activation maps, stacked into an output volume of $W_2 \times H_2 \times K$.

The depth of the output volume equals the number of filters used.

### Stride

**Stride** controls how many pixels the filter advances at each step. A stride of $S = 2$ means the filter jumps two pixels at a time, producing a smaller output but reducing computation and memory:

$$\text{Output size} = \frac{N - F}{S} + 1$$

where $N$ is the input spatial dimension and $F$ is the filter size. The stride must be chosen so that the filter "fits" cleanly within the input width — the result must be an integer.

### Padding

To control the output spatial dimensions and prevent information loss at borders, **zero padding** adds a border of zeros around the input. With padding $P$, the output size becomes:

$$\text{Output size} = \frac{N + 2P - F}{S} + 1$$

A common configuration uses stride $1$, filter size $F \times F$, and padding $P = \frac{F-1}{2}$, which preserves the spatial dimensions (output size equals input size).

**Example**: Input $32 \times 32 \times 3$, 10 filters of $5 \times 5 \times 3$, stride 1, pad 2:
- Output size: $(32 + 4 - 5)/1 + 1 = 32$ spatially, producing $32 \times 32 \times 10$.
- Parameters per filter: $5 \times 5 \times 3 + 1 = 76$ (including bias). Total: $76 \times 10 = 760$.

### Non-Linearity

After convolution, a non-linear activation function is applied element-wise. Common choices include:

- **Tanh**: Smooth saturating nonlinearity.
- **Sigmoid**: $\sigma(x) = 1/(1 + e^{-x})$.
- **ReLU (Rectified Linear Unit)**: $f(x) = \max(0, x)$ — avoids saturation issues and has become the standard choice.

---

## Pooling Layers

Pooling layers downsample the spatial dimensions of feature maps, providing:

- **Invariance to small transformations**: Small translations in the input produce similar pooled outputs.
- **Larger receptive fields**: Neurons in deeper layers see broader regions of the input.
- **Reduced computation**: Smaller feature maps mean fewer parameters downstream.

### Max Pooling

The most common pooling operation takes the maximum value within each pooling window. Given a $2 \times 2$ pooling window with stride $2$, the output discards positional details and retains only the strongest activation in each region.

### Average Pooling

Takes the mean value within each pooling window. Less commonly used in modern architectures compared to max pooling.

---

## Normalization

Normalization layers stabilize and accelerate training. In early architectures like AlexNet, local response normalization (LRN) was applied across feature maps. In modern networks, **batch normalization** has largely replaced LRN, normalizing activations across a mini-batch to have zero mean and unit variance.

---

## CNN Architectures

The evolution of CNN architectures follows a trend towards deeper networks with more sophisticated connectivity patterns.

### LeNet

The pioneering CNN architecture by LeCun et al. (1998), designed for handwritten digit recognition. It established the core CNN design pattern: convolution followed by spatial pooling, stacked multiple times, with a classification layer at the end.

### AlexNet

Krizhevsky et al. (2012) revived interest in CNNs by winning the ImageNet ILSVRC competition by a large margin. Architecture highlights:

| Layer | Type | Filters | Size/Stride | Output |
|-------|------|---------|-------------|--------|
| CONV1 | Conv | 96 | 11×11, stride 4 | 55×55×96 |
| POOL1 | Max Pool | - | 3×3, stride 2 | 27×27×96 |
| NORM1 | LRN | - | - | 27×27×96 |
| CONV2 | Conv | 256 | 5×5, pad 2 | 27×27×256 |
| POOL2 | Max Pool | - | 3×3, stride 2 | 13×13×256 |
| NORM2 | LRN | - | - | 13×13×256 |
| CONV3 | Conv | 384 | 3×3, pad 1 | 13×13×384 |
| CONV4 | Conv | 384 | 3×3, pad 1 | 13×13×384 |
| CONV5 | Conv | 256 | 3×3, pad 1 | 13×13×256 |
| POOL3 | Max Pool | - | 3×3, stride 2 | 6×6×256 |
| FC6 | FC | 4096 | - | 4096 |
| FC7 | FC | 4096 | - | 4096 |
| FC8 | FC | 1000 | - | 1000 |

Key innovations included:

- First use of ReLU activation in a large-scale CNN.
- Dropout (0.5) for regularization.
- Heavy data augmentation.
- Training on dual GPUs.

### VGGNet

Simonyan and Zisserman (2014) demonstrated that deeper networks with smaller filters yield better results. VGG16 and VGG19 use exclusively $3 \times 3$ convolutions (stride 1, pad 1) and $2 \times 2$ max pooling (stride 2).

> **Why $3 \times 3$ filters?** A stack of three $3 \times 3$ conv layers has the same effective receptive field as one $7 \times 7$ conv layer, but is deeper (more non-linearities) and has fewer parameters: $3 \times (3^2 C^2)$ vs. $7^2 C^2$.

Key observations from VGGNet:

- Most memory consumption occurs in early conv layers (large spatial dimensions).
- Most parameters reside in late fully connected layers (VGG16 has ~138M total parameters).
- A single forward pass through VGG16 consumes approximately 96MB per image.

### GoogLeNet / Inception

Szegedy et al. (2014) introduced the **Inception module**, which applies multiple filter sizes in parallel on the same input:

- $1 \times 1$, $3 \times 3$, and $5 \times 5$ convolutions.
- $3 \times 3$ max pooling.

All outputs are concatenated depth-wise. A naive implementation would be prohibitively expensive (e.g., 854M operations for a single module). The solution is **bottleneck layers** — $1 \times 1$ convolutions that reduce feature depth before expensive operations.

> A **$1 \times 1$ convolution** performs a dot product across feature channels at each spatial position. It preserves spatial dimensions while reducing depth, acting as a learned dimensionality reduction.

GoogLeNet has 22 layers but only 5 million parameters (12× fewer than AlexNet), using global average pooling instead of fully connected layers at the end. It won ILSVRC 2014 classification with 6.7% top-5 error.

### ResNet

He et al. (2016) observed that simply stacking more layers on a plain CNN eventually degrades both training and test performance — a phenomenon caused by optimization difficulties, not overfitting. The insight: a deeper model should be able to perform at least as well as a shallower one by simply copying the shallow layers and setting additional layers to identity.

This led to **residual connections**, where layers learn a residual mapping $F(x)$ rather than the desired underlying mapping $H(x)$ directly:

$$H(x) = F(x) + x$$

The residual block structure:

1. Input $x$ passes through two $3 \times 3$ conv layers with ReLU to produce $F(x)$.
2. The original input $x$ is added via a skip connection (identity mapping).
3. A final ReLU is applied to $F(x) + x$.

ResNet-152 won ILSVRC 2015 with 3.57% top-5 error and swept all classification and detection competitions in both ILSVRC 2015 and COCO 2015.

### ResNeXt

Xie et al. (2016) extended ResNet by increasing the **cardinality** — the number of parallel pathways within each residual block. Multiple parallel branches (each a small transform) are aggregated, similar in spirit to the Inception module. This increases representational capacity more efficiently than increasing depth alone.

### Wide ResNet

Zagoruyko et al. (2016) argued that residual connections, not extreme depth, are the key factor in ResNet's success. They used wider residual blocks (more filters per layer) and showed that a 50-layer Wide ResNet can outperform the 152-layer original ResNet while being more computationally efficient due to better parallelization.

### DenseNet

Huang et al. (2017) introduced **dense blocks** where each layer is connected to every preceding layer in a feedforward fashion. This dense connectivity:

- Alleviates the vanishing gradient problem.
- Strengthens feature propagation.
- Encourages feature reuse.
- Reduces the total number of parameters.

### Architecture Trends Summary

- VGG, GoogLeNet, and ResNet are all widely used and available in model zoos.
- The trend points toward extremely deep networks, with significant research focusing on skip connections and improving gradient flow.
- There is ongoing investigation into the trade-off between depth and width.
- Recent efforts explore meta-learning to automatically discover architectures.

---

## Understanding and Visualizing CNNs

CNNs are often criticized as "black boxes." Several techniques have been developed to interpret what these networks learn.

### Feature Visualization

Zeiler and Fergus (2014) used **deconvolution** to project activations from intermediate layers back to pixel space, revealing what patterns each feature map responds to. Observations:

- **Layer 1**: Simple edges, colors, and oriented gratings.
- **Layer 2**: Textures, corners, and simple patterns.
- **Layer 3**: More complex textures, mesh patterns, and object parts.
- **Layer 4 and 5**: Entire object parts and class-specific patterns (e.g., dog faces, wheels, text).

Patches from validation images that maximally activate a given feature map also reveal its semantic meaning: early features detect generic patterns while deeper features become increasingly class-specific.

### Activation Maximization

To find what image maximizes a given class score, an iterative optimization is performed:

1. Forward pass an image.
2. Set all activations in the layer of interest to zero, except for the target neuron (set to 1.0).
3. Backpropagate to the image.
4. Update the image to increase the target activation.

Repeating this process produces synthetic images that maximally excite specific neurons or classes, revealing the visual concepts the network has learned.

### Occlusion Experiments

By systematically occluding regions of the input image with a gray square and measuring the drop in classification probability, one can map which image regions are most important for the network's decision. The resulting heatmap shows that the network genuinely focuses on the object of interest rather than spurious background features.

### GradCAM

Gradient-weighted Class Activation Mapping (Selvaraju et al., 2017) produces visual explanations by:

1. Computing the gradient of the target class score with respect to the feature maps of a chosen convolutional layer.
2. Global-average-pooling these gradients to obtain importance weights for each feature map.
3. Computing a weighted combination of the feature maps, followed by ReLU.

This produces a coarse heatmap highlighting the discriminative image regions used by the CNN for a particular prediction, without requiring architectural changes or re-training.

---

## Adversarial Examples

CNNs, despite their impressive performance, can be easily fooled. Szegedy et al. (2014) discovered that applying small, imperceptible perturbations to an image can cause a network to misclassify it with high confidence. These **adversarial examples** reveal that CNNs do not perceive images the way humans do.

Nguyen et al. (2015) further showed that CNNs can produce high-confidence predictions for images that appear as random noise to humans, indicating that the decision boundaries learned by deep networks are not aligned with human visual semantics.

---

## Object Detection

Object detection extends classification to answer *what* objects exist *where* in the image.

### Classification + Localization

A straightforward extension of image classification adds a regression head that predicts bounding box coordinates $(x, y, w, h)$ alongside the class scores. The loss function combines softmax classification loss with L2 regression loss on the box coordinates. This approach works for single-object localization but does not scale to multiple objects, since the number of outputs varies per image.

### Sliding Window Detection

A CNN is applied to many overlapping image crops, classifying each as object or background. While conceptually simple, this requires running the CNN on an enormous number of locations and scales, making it computationally prohibitive.

### Region Proposals

To avoid exhaustive scanning, **region proposal** algorithms (e.g., Selective Search) quickly generate ~1000 candidate regions likely to contain objects by identifying "blobby" image regions based on color, texture, and edge cues.

### R-CNN

Girshick et al. (2014) combined region proposals with CNNs:

1. Generate ~2000 region proposals per image.
2. Warp each region to a fixed size.
3. Run each region through a pre-trained CNN to extract features.
4. Classify each region with post-hoc linear SVMs.
5. Refine bounding boxes with a post-hoc regression model.

R-CNN achieved 31.4% mAP on the ILSVRC 2013 detection benchmark, significantly outperforming previous methods. However, it has major drawbacks:

- **Slow training** (84 hours): separate stages for fine-tuning, SVM training, and box regression.
- **Slow inference** (47 seconds per image): ~2000 CNN forward passes.
- **High disk usage**: features for all proposals must be cached.

### Fast R-CNN

Girshick (2015) addressed R-CNN's inefficiencies by sharing computation across proposals:

1. The entire image is processed through a CNN to produce a feature map.
2. Region proposals are projected onto this feature map.
3. **RoI Pooling** extracts a fixed-size feature vector for each region, regardless of its size.
4. These features are passed through fully connected layers that jointly predict class scores and refined box coordinates.

The entire network is trained in a single stage with a multi-task loss. Fast R-CNN achieves:

- Training time: 9.5 hours (8.8× speedup).
- Inference: 0.32 seconds per image (146× speedup).
- mAP: 66.9% (up from 66.0%).

#### RoI Pooling

Given a region proposal and a CNN feature map:

1. Project the proposal coordinates onto the feature map (scaling down by the stride).
2. Snap the projected region to a grid.
3. Divide the region into equally sized subregions (e.g., $7 \times 7$).
4. Max-pool within each subregion to produce a fixed-size output.

The "snapping" step introduces slight misalignment between the proposal and the extracted features.

#### RoI Align

Mask R-CNN (He et al., 2017) replaced RoI Pooling with **RoI Align**, which eliminates the quantization step:

1. Project the proposal onto features without snapping to grid cells.
2. Sample at regular points within each subregion using **bilinear interpolation**.
3. Max-pool (or average-pool) the interpolated values.

This pixel-accurate alignment is crucial for pixel-level tasks like instance segmentation.

### Faster R-CNN

Ren et al. (2015) eliminated the need for external region proposal algorithms by introducing a **Region Proposal Network (RPN)** that shares features with the detection network:

1. The CNN produces a feature map of the entire image.
2. At each spatial position in the feature map, the RPN considers $K$ **anchor boxes** of different scales and aspect ratios.
3. For each anchor, the RPN predicts: (a) whether it contains an object (binary classification), and (b) a 4-coordinate box transformation to refine its position.
4. The top-scoring proposals (~300) are passed to the downstream Fast R-CNN-style detection head.

The entire system is trained jointly with four losses:

1. RPN object/not-object classification loss.
2. RPN box coordinate regression loss.
3. Final object class classification loss.
4. Final box coordinate regression loss.

### YOLO

Redmon et al. (2016) proposed **You Only Look Once (YOLO)**, a unified detection approach that completely avoids a separate proposal stage:

1. The input image is divided into an $S \times S$ grid (e.g., $7 \times 7$).
2. Each grid cell predicts $B$ bounding boxes (each with 5 values: $dx, dy, dh, dw, \text{confidence}$) and $C$ class probabilities $P(\text{Class} \mid \text{Object})$.
3. The output is a fixed-size tensor of $S \times S \times (5B + C)$.

For Pascal VOC ($S=7, B=2, C=20$), the output is a $7 \times 7 \times 30$ tensor (1470 outputs). At inference time, box predictions are combined with class probabilities, and non-maximum suppression (NMS) is applied to produce final detections.

YOLO's advantages:

- Extremely fast (real-time capable).
- Reasons globally about the image, making fewer background false positives.
- Generalizes well to new domains.

---

## Semantic Segmentation

Semantic segmentation assigns a class label to every pixel in the image, without differentiating between instances of the same class.

### Sliding Window Approach

A naive approach extracts a patch around each pixel, classifies the center pixel with a CNN, and repeats for all pixels. This is prohibitively slow and fails to reuse shared features between overlapping patches.

### Fully Convolutional Networks

Fully Convolutional Networks (FCNs) replace the fully connected layers of a classification CNN with $1 \times 1$ convolutions, enabling dense pixel-wise predictions in a single forward pass:

- The input image ($3 \times H \times W$) passes through convolutional layers producing feature maps ($D \times H \times W$).
- A $1 \times 1$ convolution produces class scores ($C \times H \times W$).
- An argmax over the class dimension yields the per-pixel prediction ($H \times W$).

However, running convolutions at full input resolution is computationally expensive. The solution is an encoder-decoder architecture with downsampling and upsampling inside the network:

- **Downsampling**: Pooling or strided convolution reduces spatial dimensions while increasing feature depth.
- **Bottleneck**: Low-resolution, high-depth feature maps capture global context.
- **Upsampling**: Restores spatial resolution for pixel-level predictions.

### Unpooling

To increase spatial resolution, unpooling operations are used:

- **Nearest Neighbor Unpooling ("Bed of Nails")**: Repeats each input value into a larger region. For example, a $2 \times 2$ input becomes $4 \times 4$ by duplicating each value.
- **Max Unpooling**: Records the positions of maxima during the corresponding max pooling operation, then places values back into those exact positions during unpooling, filling other positions with zeros. This produces sparser but more structured outputs.

### Transpose Convolution

**Transpose convolution** (also called deconvolution or fractionally-strided convolution) is a learnable upsampling operation. Conceptually:

1. Each input value scales the entire filter (producing a copy weighted by the input value).
2. These scaled copies are placed at positions determined by the stride, summing where they overlap.
3. Padding removes a border from the output.

The output size is given by:

$$\text{Output size} = (\text{Input size} - 1) \times \text{stride} + \text{Kernel size} - 2 \times \text{Padding}$$

Transpose convolution with stride $>1$ increases spatial dimensions, making it the standard learnable upsampling method in FCNs.

---

## Instance Segmentation

Instance segmentation combines object detection and semantic segmentation: it detects each object instance and produces a pixel-level mask for each one, differentiating between individual instances of the same class.

### Mask R-CNN

He et al. (2017) extended Faster R-CNN by adding a mask prediction branch:

1. A CNN backbone extracts features from the input image.
2. The Region Proposal Network generates candidate object regions.
3. **RoI Align** extracts precisely aligned features for each proposal.
4. In parallel, three heads make predictions:
   - **Classification head**: $C$ class scores.
   - **Box regression head**: $4C$ coordinate offsets (per-class boxes).
   - **Mask head**: A binary mask of size $m \times m$ for each of the $C$ classes.

The mask branch is a small fully convolutional network applied to each RoI, predicting masks at $28 \times 28$ resolution. This architecture is simple to train and adds only a small overhead to Faster R-CNN, while achieving state-of-the-art instance segmentation results.

---

## Vision-Language Models

Vision-Language Models (VLMs) bridge the gap between visual and textual understanding by learning joint representations from image-text pairs.

### Learning from Noisy Web Data

The key insight behind modern VLMs is that the internet contains billions of images with associated text (alt text, captions, surrounding content). These image-text pairs provide a weak supervisory signal: co-occurring images and text are assumed to be related. By training models to bring matching image-text pairs closer in a shared embedding space while pushing mismatched pairs apart, strong visual representations can be learned at very low annotation cost — the data already existed.

### CLIP

Radford et al. (2021) introduced **Contrastive Language-Image Pretraining (CLIP)**, which trains an image encoder and a text encoder simultaneously on 400 million image-text pairs collected from the web. The training objective is a contrastive loss: given a batch of $N$ (image, text) pairs, the model maximizes the cosine similarity between the $N$ correct pairings while minimizing it for the $N^2 - N$ incorrect pairings.

#### Zero-Shot Recognition with CLIP

At inference time, CLIP can classify images without any task-specific training:

1. For each target class, construct a text prompt such as "A photo of a [class]."
2. Encode all prompts with the text encoder.
3. Encode the input image with the image encoder.
4. Compute the cosine similarity (dot product) between the image embedding and each prompt embedding.
5. Return the class with the highest similarity.

CLIP's zero-shot performance on ImageNet matched that of a fully supervised ResNet-50, demonstrating that natural language can serve as a powerful supervisory signal for visual learning. The approach has been extended to:

- **Prompt engineering**: Carefully designing text prompts to improve accuracy (e.g., "A photo of a [class], a type of [category]").
- **Prompt tuning**: Learning optimal prompt embeddings in continuous space (CoOp, CoCoOp).
- **Open-vocabulary object detection**: Extending detection models to recognize objects described by arbitrary text, not just a fixed set of classes (ViLD).
- **Segmentation**: The Segment Anything Model (SAM) and similar approaches leverage these ideas for promptable segmentation.

---

## Summary

Convolutional Neural Networks transformed computer vision by introducing architectural priors — local connectivity, weight sharing, and spatial pooling — that are well-suited to the structure of visual data. Key developments include:

- **Shift invariance** through scanning and weight sharing.
- **Hierarchical feature learning** from edges and textures to object parts and whole objects.
- **Architectural innovations**: Inception modules, residual connections, dense connectivity.
- **Interpretability techniques**: Feature visualization, occlusion analysis, GradCAM.
- **Detection pipelines**: R-CNN to Faster R-CNN and real-time YOLO systems.
- **Dense prediction**: Fully convolutional networks with transpose convolutions for segmentation.
- **Vision-language integration**: Contrastive pretraining connecting images and text.
