# Self-Supervised Learning

Self-supervised learning (SSL) is a paradigm that aims to learn useful representations from data without relying on manually annotated labels. Instead of requiring human supervision, SSL methods formulate **pretext tasks** where the labels are generated automatically from the structure inherent in the data itself.

> **Jitendra Malik:** "Supervision is the opium of the AI researcher."

> **Alyosha Efros:** "The AI revolution will not be supervised."

> **Yann LeCun:** "Self-supervised learning is the cake, supervised learning is the icing on the cake, reinforcement learning is the cherry on the cake."

## What Is Self-Supervised Learning?

Self-supervised learning bridges the gap between supervised and unsupervised learning. It uses supervised learning objectives (classification, regression) but generates the labels automatically from the raw data, without human annotation. The central idea is that by solving a well-designed pretext task, the model is forced to learn semantically meaningful features that generalize to downstream tasks.

> **Self-supervised learning** aims to learn from data without manual label annotation. It solves pretext tasks that produce good features for downstream tasks, using supervised objectives where labels are generated automatically.

The key insight is that we do not care about performance on the pretext task itself. For example, a model that perfectly predicts image rotation has not achieved anything useful in itself. What matters is whether the feature representations learned along the way transfer effectively to tasks like classification, detection, or segmentation.

## Pretext Tasks from Image Transformations

Pretext tasks are the engine of self-supervised learning. They are designed to force the model to develop "visual common sense" — an understanding of what objects look like, how they are composed, and how they relate to their surroundings.

Common pretext tasks include:

- **Rotation prediction**: classify which of four rotations (0°, 90°, 180°, 270°) was applied to an image.
- **Relative patch location (context prediction)**: predict the spatial relationship between two image patches.
- **Jigsaw puzzles**: predict the correct permutation of shuffled image patches.
- **Inpainting**: predict missing pixels in a corrupted image.
- **Colorization**: predict the color channels of an image given only its luminance.

### Rotation Prediction

The rotation prediction task is based on a simple hypothesis: a model can recognize the correct orientation of an object only if it possesses visual common sense about what that object should look like unperturbed.

In practice, the entire input image is rotated by a randomly selected angle from the set {0°, 90°, 180°, 270°}, and the model is trained as a 4-way classifier to predict which rotation was applied. This forces the convnet to learn features that capture object shape, canonical orientation, and category-level semantics.

Empirically, features learned through rotation prediction transfer well. When pretrained on ImageNet without labels and evaluated on Pascal VOC 2007 classification, rotation-based SSL achieves performance between no pretraining and full ImageNet supervision, demonstrating that meaningful visual features can be learned without manual labels.

### Context Prediction: Relative Patch Locations

One of the earliest and most influential pretext tasks for vision is context prediction, introduced by Doersch et al. (ICCV 2015). The task is: given two patches sampled from an image, predict their relative spatial position.

The architecture uses a siamese network with tied weights: two patches are each fed through a shared CNN, and the resulting feature representations are concatenated and passed to a classifier that predicts one of 8 possible spatial configurations. The network must learn what objects and parts look like and how they are spatially arranged to solve this seemingly non-semantic task.

Surprisingly, solving this task yields features that capture high-level semantic information. Nearest-neighbor retrievals in the learned feature space connect across object instances, showing that the representation has implicitly discovered object categories. When used as pretraining for R-CNN on Pascal VOC 2007, features from the relative position task reach 46.3% mAP, substantially outperforming no pretraining (40.7%) and approaching supervised ImageNet pretraining (54.2%).

### Jigsaw Puzzles

The jigsaw puzzle pretext task, proposed by Noroozi and Favaro (2016), takes the context prediction idea further. An image is divided into a grid of patches, the patches are shuffled, and the model must predict the correct permutation. This forces the model to learn both the appearance of individual patches and their spatial relationships, building a rich representation of object parts and scene layout.

Compared to the relative patch location approach, jigsaw puzzle features yield improved performance on transfer learning benchmarks, suggesting that more challenging spatial reasoning tasks produce better representations.

### Inpainting

Inpainting asks the model to predict missing pixels in a corrupted image (Pathak et al., 2016). The model must understand image statistics, object shapes, and scene context to plausibly fill in the missing region. This requires both low-level texture understanding and high-level semantic knowledge.

### Colorization and the Split-Brain Autoencoder

Colorization as a pretext task is elegantly formulated through the **split-brain autoencoder** (Zhang et al., 2017). The key idea is to split the color information of an image into separate channels (e.g., Lab color space) and train the network to predict one channel from another.

Specifically, the architecture uses two subnetworks:

- **F₁** takes the L (luminance) channel and predicts the a and b color channels.
- **F₂** takes the a and b channels and predicts the L channel.

During training, both paths are optimized jointly. The resulting features from F₁ and F₂ are concatenated to form the final representation. This self-supervised objective forces the network to learn about object semantics, textures, and scene composition, as correct colorization requires understanding what objects are present and what colors they should have.

When transferred to scene classification on the Places dataset, split-brain autoencoder features show competitive performance, demonstrating that colorization is a rich source of self-supervision.

## Evaluation of Self-Supervised Methods

Since the pretext task performance is not the goal, evaluating self-supervised learning requires a different approach. The standard protocol involves two stages:

1. **Pretraining**: Learn a feature extractor (e.g., a convnet) using the self-supervised pretext task on a large corpus of unlabeled data.
2. **Evaluation**: Attach a shallow network or linear classifier on top of the frozen (or fine-tuned) feature extractor and train it on the target task using a small amount of labeled data.

### Linear Evaluation

In linear evaluation, the pretrained feature encoder is frozen, and a linear classifier is trained on top using labeled data from the target task. The resulting accuracy directly measures the quality of the learned representations — higher accuracy indicates that the features are more linearly separable and thus more semantically meaningful.

### Semi-Supervised Learning Evaluation

A more practical evaluation simulates the semi-supervised scenario: the feature extractor is pretrained on the full unlabeled dataset, and then the entire model (or a subset of layers) is fine-tuned using only a small fraction of labeled data. For instance, on CIFAR-10, early layers (conv1 and conv2) trained via rotation prediction can be frozen while later layers (conv3 and the linear classifier) are trained with a limited labeled subset.

### Transfer Learning Evaluation

Transfer learning evaluation tests whether features learned on one dataset transfer to a different downstream task. A common benchmark is to pretrain on ImageNet without labels and then fine-tune on Pascal VOC 2007 classification or detection. This measures the generality of the learned representations.

## Temporal Order Verification

Moving beyond static images, video provides a natural source of self-supervision through temporal structure. The **temporal order verification** task (Misra et al., ECCV 2016) asks the model to determine whether a sequence of video frames is in the correct temporal order or has been shuffled.

- Three frames are sampled from a video.
- The model must classify whether they appear in the correct chronological order.
- To solve this task, the network must learn about motion dynamics, object permanence, and action progression.

This leverages the fact that real-world events have a natural causal structure — frames are not randomly ordered — and a model that understands this structure has learned something meaningful about the visual world.

## Ego-Motion Equivariant Feature Learning

Inspired by the classic "kitten carousel" experiment (Held & Hein, 1963), which showed that self-generated motion coupled with visual feedback is key to perceptual development, Jayaraman and Grauman (ICCV 2015) proposed learning visual representations tied to ego-motion.

### Motivation

Traditional visual learning treats images as a disembodied bag of labeled snapshots. In contrast, biological vision develops through active exploration — we move through the world and observe how our visual surroundings change as a consequence of our actions.

### Ego-Motion Vision

The core idea is to teach a computer vision system the connection between "how I move" and "how my visual surroundings change":

- Input: unlabeled egocentric video paired with motor signals (e.g., from a car or robot).
- Goal: learn image features that are **equivariant** to ego-motion.

### Invariance vs. Equivariance

> **Invariant features** are unresponsive to a class of transformations: $\mathbf{z}(g\mathbf{x}) \approx \mathbf{z}(\mathbf{x})$

> **Equivariant features** respond predictably to transformations through a simple mapping: $\mathbf{z}(g\mathbf{x}) \approx M_g \mathbf{z}(\mathbf{x})$

Invariance discards information; equivariance organizes it. For ego-motion, pairs of frames related by similar ego-motion (e.g., left turn, right turn, forward) should be related by the same feature transformation $M_g$.

### Training

The training process involves:

1. **Mining frame pairs** from video, grouped into ego-motion clusters (left turn, right turn, forward, etc.) based on motor signals.
2. **Learning ego-motion-equivariant features** by minimizing the prediction error: $\lVert M_g \mathbf{z}_{\theta}(\mathbf{x}_i) - \mathbf{z}_{\theta}(g\mathbf{x}_i) \rVert_2$ for all motion clusters $g$ and all images $\mathbf{x}$.
3. **Joint training** with a supervised recognition objective when labeled data is available.

### Results

When trained on unlabeled car video (KITTI) and transferred to static scene classification (SUN, 397 classes), ego-motion equivariant features achieve up to 30% accuracy improvement over invariance-based baselines, particularly in the low-data regime (as few as 6 labeled examples per class).

## Representations via Physical Interactions

Taking embodiment further, **The Curious Robot** (Pinto et al., ECCV 2016) explores whether physical interaction with objects can serve as a supervisory signal for visual representation learning. The robot performs three types of interactions:

- **Grasping**: The robot attempts to grasp objects and records the visual outcome.
- **Pushing**: The robot pushes objects and observes how they move.
- **Poking**: The robot pokes objects and records the resulting deformations or displacements.

The key insight is that interaction outcomes are a rich source of self-supervision: the visual consequence of an action reveals physical properties of the object (mass, friction, deformability, etc.), and learning to predict these outcomes forces the model to build representations that encode object identity, material properties, and 3D structure.

Features learned through physical interaction improve classification and retrieval performance on standard benchmarks, demonstrating that embodiment — learning in the context of acting in the world — is a viable path toward robust visual representations.

## Summary: Limitations of Hand-Crafted Pretext Tasks

While pretext tasks based on image transformations (rotation, jigsaw, colorization, inpainting) have been successful, they have notable limitations:

- **Tedious design**: Each pretext task must be individually engineered and tuned.
- **Task-specific representations**: The learned features may be specialized to the particular pretext task and not fully general.
- **Limited scope**: Individual tasks capture only one aspect of visual understanding.

These limitations motivate the search for a more general and principled formulation, which led to **contrastive learning**.

## Contrastive Representation Learning

Contrastive learning reformulates the self-supervised objective in a more general way. Instead of designing a specific pretext task, the goal is simply to make representations of similar (positive) samples close together and representations of dissimilar (negative) samples far apart.

> **Contrastive learning** aims to learn an encoder $f$ that yields a high score for positive pairs $(x, x^+)$ and low scores for negative pairs $(x, x^-)$.

### The InfoNCE Loss

Given a reference sample $x$, one positive sample $x^+$, and $N-1$ negative samples $x^-$, the contrastive loss is formulated as:

$$L = -\log \frac{\exp(\text{score}(f(x), f(x^+)))}{\exp(\text{score}(f(x), f(x^+))) + \sum_{i=1}^{N-1} \exp(\text{score}(f(x), f(x_i^-)))}$$

This is commonly known as the **InfoNCE loss** (van den Oord et al., 2018) and can be interpreted as:

- A cross-entropy loss for an N-way softmax classifier where the model must identify the positive sample among all N samples.
- A lower bound on the mutual information between $f(x)$ and $f(x^+)$.
- The bound becomes tighter as the number of negative samples $N$ increases.

### SimCLR

SimCLR (Chen et al., 2020) is a simple and effective framework for contrastive learning of visual representations. Its key design elements are:

- **Score function**: Cosine similarity between projected features.
- **Projection head**: A small MLP $g(\cdot)$ that projects features to a space where contrastive learning is applied. The projection head is used only during pretraining and discarded for downstream tasks.
- **Positive samples**: Generated through stochastic data augmentation — random cropping, random color distortion, and random blur. Two augmented views of the same image form a positive pair, while views from different images are negatives.
- **Training**: Features are learned on ImageNet (entire training set, no labels), and then evaluated by training a linear classifier on top of the frozen encoder.

**Semi-supervised evaluation**: After SimCLR pretraining, the encoder can be fine-tuned with only 1% or 10% of ImageNet labels, achieving strong performance that rivals fully supervised methods trained on the entire labeled dataset.

### The Importance of Large Batch Size

Large batch size is crucial for SimCLR's performance. A larger batch means more negative samples are available per update, which tightens the InfoNCE lower bound and improves representation quality. However, large batch sizes cause substantial memory footprint during backpropagation, often requiring distributed training across multiple accelerators (TPUs for the original ImageNet experiments).

### MoCo: Momentum Contrastive Learning

MoCo (He et al., CVPR 2020) addresses the memory bottleneck of large-batch contrastive learning through a different architecture:

- **Queue of keys**: Maintains a running queue of encoded negative samples, decoupling the number of negatives from the mini-batch size. This enables support for a very large number of negative samples without requiring massive batch sizes.
- **Momentum encoder**: The key encoder is a slowly progressing copy of the query encoder, updated via momentum: $\theta_k \leftarrow m\theta_k + (1-m)\theta_q$. This ensures consistency of the keys in the queue over time.
- **Gradient isolation**: Gradients are computed only through the query encoder, not the key encoder. The key encoder is updated exclusively through momentum.

This design allows MoCo to scale to very large datasets (e.g., 1 billion images from Instagram), producing features that transfer exceptionally well to downstream tasks.

## Transfer to Downstream Tasks

The ultimate test of self-supervised representations is their performance on downstream tasks that the model was not explicitly trained for. Common transfer benchmarks include:

- **Image classification** (ImageNet, Places, SUN): Evaluated via linear probing or fine-tuning.
- **Object detection**: Pascal VOC 2007 detection using Faster R-CNN with a ResNet-50 backbone. MoCo features transferred from self-supervised pretraining on 1 billion images achieve strong detection performance.
- **Segmentation and depth estimation**: Features from context prediction, colorization, and contrastive methods have been shown to transfer to these tasks as well.

The consistent finding across all self-supervised methods is that representations learned without labels can approach and sometimes match the quality of fully supervised pretraining, especially when large amounts of unlabeled data are available. Contrastive methods like MoCo and SimCLR have narrowed the gap to supervised pretraining significantly, establishing self-supervised learning as a foundational paradigm for representation learning.
