# Computer Vision

Notes based on lectures by Dr. Yuqi Ouyang (SCUPI), CS1674 Introduction to Computer Vision.

Computer vision teaches machines to perceive and understand the world from images and video — from low-level image processing (filtering, resampling, features) through geometry-based vision (homography, stereo, motion, tracking) to modern deep learning (CNNs, RNNs, vision transformers, generative models) and high-level recognition.

## Chapters

- [**Chapter 1: Introduction**](./introduction) — What CV is, goals, applications, and why it is hard (variation, ambiguity, context)
- [**Chapter 2: Image Filtering**](./image-filtering) — Images as functions, convolution/correlation, mean/median/Gaussian filters, noise
- [**Chapter 3: Image Resampling**](./image-resampling) — Aliasing, Nyquist theorem, Gaussian prefiltering, pyramids, interpolation/upsampling
- [**Chapter 4: Feature Detection**](./feature-detection) — Edges, Sobel, Canny, line/circle fitting, Hough transform, RANSAC, Harris corners
- [**Chapter 5: Feature Description and Matching**](./feature-description-matching) — SIFT descriptors, invariance, matching, ratio test, visual words / bag-of-words
- [**Chapter 6: Homography and Projective Transformation**](./homography-projective) — 2D transforms, homogeneous coords, homography, panorama stitching
- [**Chapter 7: Stereo Vision**](./stereo-vision) — Epipolar geometry, rectified stereo, disparity and depth
- [**Chapter 8: Motion Estimation**](./motion-estimation) — Optical flow, Lucas-Kanade, brightness constancy, coarse-to-fine
- [**Chapter 9: Tracking**](./tracking) — KLT tracking, mean-shift, Kalman filtering
- [**Chapter 10: Introduction to Deep Learning**](./intro-deep-learning) — MLPs, activation functions, universality of ReLU networks
- [**Chapter 11–12: Training Deep Learning Models**](./training-dl-models) — Gradient descent, SGD, backprop, optimizers (momentum, RMSProp, Adam), regularization, LR decay, early stopping
- [**Chapter 13: Encoder-Decoder for Latent Analysis**](./encoder-decoder) — Representation learning, autoencoders, bottleneck, sparse/contractive AEs
- [**Chapter 14: Convolutional Neural Networks**](./cnns) — Convolutions, pooling, 1×1/depthwise, backprop, AlexNet/VGG/GoogLeNet/ResNet
- [**Chapter 15: Recurrent Neural Networks**](./rnns) — Sequence models, vanilla RNN, BPTT, LSTM/GRU, image captioning
- [**Chapter 16: Vision Transformer**](./vision-transformer) — Attention, transformers, ViT, Swin, DINO, MAE, SAM
- [**Chapter 17: GANs**](./gans) — GAN objective, DCGAN, evaluation (IS/FID), pix2pix, CycleGAN
- [**Chapter 18: Diffusion Models**](./diffusion-models) — DDPM, score-based, classifier-free guidance, latent diffusion, DDIM, SDXL, LCM
- [**Chapter 19: Object Recognition**](./object-recognition) — Detection/segmentation tasks, HOG, DPM, R-CNN family, YOLO, FCN, Mask R-CNN, CLIP
