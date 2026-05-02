# Recurrent Neural Network

## Introduction

### Definition

Recurrent neural networks (RNNs) are a class of artificial neural network commonly used for sequential data processing. Unlike feedforward neural networks, which process data in a single pass, RNNs process data across multiple time steps, making them well-adapted for modelling and processing text, speech, and time series.

> A recurrent neural network (RNN), proposed by Rumelhart et al. in 1986, is a neural network model for modeling time series. RNNs provide a very powerful way of dealing with (time) sequential data. In traditional neural network models, operations go from the input layer to hidden layer to output layer. These layers are fully connected, and there is no connection between nodes of each layer. For tasks that involve sequential inputs, such as speech and language, it is often better to use RNNs.

### What Does "Recurrent" Mean?

The modern definition of "recurrent" was initially introduced by Jordan (1986):

> If a network has one or more cycles, that is, if it is possible to follow a path from a unit back to itself, then the network is referred to as recurrent. A nonrecurrent network has no cycles.

### Why RNNs?

In feedforward neural networks, information flows in a single direction. While this makes learning easier, it limits the network's modeling capability. A feedforward network can be seen as a complex function where each input is independent — the output depends only on the current input.

Many real-world problems involve data that changes over time. For example, a person's health varies with age, and yearly samples must be recorded in temporal order for prediction.

Feedforward networks struggle with sequential data like video, speech, and text. Sequential data often has variable length, while feedforward networks require fixed input and output dimensions. A more powerful model is needed for these tasks.

### RNN vs RecNN

Recurrent Neural Networks (RNNs) (Rumelhart et al., 1986) are chain-structured neural networks for processing sequential data.

Recursive Neural Networks (RecNNs) (Pollack, 1990) are tree-structured neural networks where nodes process input according to their connection order.

> Model Comparison:
>
> - Recurrent Neural Networks: Most cognitively plausible (reading from left to right), not usually the highest classification performance but lots of improvements with gates (GRUs, LSTMs, etc).
> - Recursive Neural Networks: Most linguistically plausible, interpretable, provide most important phrases, need parse trees.

> RecNNs generalize RNNs:
>
> Because of their tree structure, RecNNs can learn hierarchical models as opposed to RNNs that can handle only sequential data. The number of children for each node in the tree is fixed so that it can perform recursive operations and use the same weights across the steps.

### Brief History of RNNs

1. 1933: Reverberating Circuit Hypothesis — Spanish neurobiologist Rafael Lorente de Nó discovered that the cerebral cortex's anatomical structure allows stimuli to circulate in neural circuits, proposing the reverberating circuit hypothesis.
2. 1982: Hopfield Network — John Hopfield used binary nodes to build neural networks with content-addressable memory capabilities.
3. 1986: Jordan Network — Michael I. Jordan established a new recurrent neural network based on Hopfield's associative memory concept under distributed parallel processing theory.
4. 1990: Elman Network — Jeffrey Elman proposed the first fully connected recurrent neural network. Jordan and Elman networks, both derived from single-layer feedforward networks by adding recurrent connections, are known as Simple Recurrent Networks (SRNs).
5. 1991: Backpropagation Through Time — Paul Werbos proposed BPTT for recurrent neural networks, which remains the primary learning method for RNNs.
6. 1991: Long-Term Dependency Problem — Sepp Hochreiter discovered the long-term dependencies problem of RNNs.
7. 1991+: Optimizations and Improvements — Numerous optimization techniques have been introduced, including Neural History Compressor (NHC), Long Short-Term Memory (LSTM), Gated Recurrent Unit (GRU), Echo State Networks, and Independent RNNs.

### From Feedforward NNs to RNNs

Given a static input, a feedforward network processes it through a hidden layer to produce an output. Here the hidden layer is a fully connected or convolutional neural network, and the output is a classification or regression result.

When dealing with sequential data (e.g., with 3 time steps), we could build three separate feedforward networks to process respectively.

However, time steps are related, so we establish connections between hidden layers via a weight matrix.

Based on the sequential nature of the data, we can expand the number of time steps, with connections between each adjacent time step.

> - `U`: Weight matrix from input layer to hidden layer (input-hidden matrix).
> - `V`: Weight matrix from hidden layer to output layer (hidden-output matrix).
> - `W`: Weight matrix from the previous hidden state used as input for the current step (hidden-hidden matrix).

### Architecture Types

1. Vanilla neural networks (One-to-One).
2. One-to-Many.
3. Many-to-One.
4. Many-to-Many, Version 1.
5. Many-to-Many, Version 2.

RNNs offer great flexibility: they can handle image captioning (image to word sequence), sentiment classification (word sequence to sentiment), machine translation (word sequence to word sequence), and video classification at the frame level.

## Simple Recurrent Network

### Elman and Jordan Network

A Simple Recurrent Network (SRN) is a very basic RNN with a single hidden layer. In a two-layer feedforward network, connections exist only between adjacent layers, with no connections among hidden nodes. SRNs add feedback connections from hidden layer to hidden layer.

The SRN update equations at time with hidden state feedback (Elman Network):

$$
\begin{cases}
 \boldsymbol{s}_t=f(\boldsymbol{U}\boldsymbol{x}_t+\boldsymbol{W}\boldsymbol{s}_{t-1}+\boldsymbol{b}_t)\\
    \hat{\boldsymbol{y}}_t=\text{Output}(\boldsymbol{V}\boldsymbol{s}_t+\boldsymbol{c}_t)\\
    L_t(\boldsymbol{y}_t,\hat{\boldsymbol{y}}_t)=\text{Loss}(\boldsymbol{y}_t,\hat{\boldsymbol{y}}_t)
\end{cases}
$$

The SRN update equations at time with output state feedback (Jordan Network):

$$
\begin{cases}
\boldsymbol{s}_t=f(\boldsymbol{U}\boldsymbol{x}_t+\boldsymbol{W}\hat{\boldsymbol{y}}_{t-1}+\boldsymbol{b}_t)\\
\hat{\boldsymbol{y}}_t=\text{Output}(\boldsymbol{V}\boldsymbol{s}_t+\boldsymbol{c}_t)\\
L_t(\boldsymbol{y}_t,\hat{\boldsymbol{y}}_t)=\text{Loss}(\boldsymbol{y}_t,\hat{\boldsymbol{y}}_t)
\end{cases}
$$

> Difference:
>
> 1. Elman Network: The output of a recurrent layer, after a delay, serves as part of the input for the same layer at the next step. The recurrent layer's output is simultaneously fed to subsequent layers.
> 2. Jordan Network: The final network output (i.e., output layer output) is fed back to the network's input layer after a delay.

### The Vanilla RNN Cell

The Vanilla Recurrent Neural Network state consists of a single hidden vector :

$$
h_t = f_W(h_{t-1}, x_t)
$$

$$
h_t = \tanh(W_{hh} h_{t-1} + W_{xh} x_t + b_h)
$$

$$
y_t = \text{softmax}(W_{hy} h_t + b_y)
$$

Notice: the same function and the same set of parameters are used at every time step.

### Universal Approximation Theorem

Let be a non-constant, bounded, monotonically increasing, continuous function (activation function), and let be a D-dimensional real vector satisfying . Let denote the set of continuous functions defined on , i.e., functions taking as input a vector of length D with each dimension in .

For any given function , there exists a positive integer , a set of real numbers and real vectors such that the function

$$
	F(x) = \sum_{m=1}^{M} u_m \phi\left(w_m^{T} x + b_m\right)
$$

can approximate to arbitrary precision, i.e., for any arbitrarily small .

The universal approximation theorem also holds on bounded closed sets in .

RNNs also possess powerful fitting capabilities. A fully connected recurrent network is an approximator of any nonlinear dynamical system:

> A fully connected recurrent neural network with a sufficient number of sigmoid-type hidden neurons can approximate any nonlinear dynamical system with arbitrary accuracy:

$$
\begin{aligned}
		\boldsymbol{s}_t&=g(\boldsymbol{s}_{t-1},\boldsymbol{x}_t)\\
		\boldsymbol{y}_t&=o(\boldsymbol{s}_t),
	\end{aligned}
$$

where is the hidden state, is the external input, is a measurable state transition function, and is a continuous output function.

According to the universal approximation theorem, a two-layer feedforward network can approximate any continuous function on any bounded closed set. Therefore, both functions of the dynamical system can be approximated by two-layer fully connected feedforward networks.

### Turing Completeness

All Turing machines can be simulated by a fully connected recurrent network composed of neurons with sigmoid-type activation functions.

Therefore, a fully connected recurrent network can approximately solve all computable problems.

## Training RNNs: Backpropagation Through Time

### Gradient Descent for RNNs

Given a training sample , where is the input sequence and is the output sequence. For each time step , the loss function is , where is the network output at step and Loss is a differentiable loss function such as mean squared error or cross-entropy. The total loss for the sequence is:

$$
    L=\sum_{t=1}^{T}L_t.
$$

The gradient of the total sequence loss with respect to network parameters is the sum of the partial derivatives of at each time step:

$$
    \frac{\partial L}{\partial \boldsymbol{U}}=\sum_{t=1}^{T}\frac{\partial L_t}{\partial \boldsymbol{U}},\quad \frac{\partial L}{\partial \boldsymbol{V}}=\sum_{t=1}^{T}\frac{\partial L_t}{\partial \boldsymbol{V}},\quad \frac{\partial L}{\partial \boldsymbol{W}}=\sum_{t=1}^{T}\frac{\partial L_t}{\partial \boldsymbol{W}}.
$$

Since is called recursively, computing gradients requires specialized methods:

1. Backpropagation Through Time (BPTT)
2. Real-Time Recurrent Learning (RTRL)

BPTT unrolls the network into a feedforward network and applies standard backpropagation. The unrolled length depends on sequence length, so BPTT's computational complexity increases with sequence length. In the unrolled network, all layers share parameters, so gradients from all time steps must be summed.

Unlike standard BP, the optimization of weight matrices and requires tracing through previous historical data.

The BPTT algorithm for recurrent layers has three steps (same basic principles as BP):

1. Forward computation: compute the output of each neuron.
2. Backward computation of error terms , i.e., the partial derivative of the error function with respect to the weighted input of neuron .
3. Compute the gradient for each weight.

The gradient with respect to a repeated weight is the sum of the gradient with respect to each time it appears. This is computed via BPTT: backpropagate over timesteps , summing gradients as you go.

### BPTT Detailed Derivation

1. Forward computation:

$$
\boldsymbol{s}_t=f(\boldsymbol{Ux}_t+\boldsymbol{Ws}_{t-1})
$$

2. Error term computation:

   Denote the error term at layer at time as . It propagates along two directions:
   - Along the time axis back to the initial moment, obtaining — this only involves weight matrix .
   - Propagated to the previous layer, obtaining — this only involves weight matrix .

   Let denote the weighted input of a neuron at time : .

   Consider:

$$
\frac{\partial\text{net}_{t}}{\partial\text{net}_{t-1}}=\frac{\partial \text{net}_{t}}{\partial \boldsymbol{s}_{t-1}}\cdot\frac{\partial \boldsymbol{s}_{t-1}}{\partial \text{net}_{t-1}}
$$

   The right-hand side involves vector-to-vector differentiation:

$$
\frac{\partial \text{net}_{t}}{\partial \boldsymbol{s}_{t-1}}=\boldsymbol{W}, \frac{\partial \boldsymbol{s}_{t-1}}{\partial \text{net}_{t-1}}=\textbf{Diag}(f'(\text{net}_{t-1}))
$$

   The error term backpropagated through time is:

$$
\delta^L_k=\delta^L_t\prod_{i=k}^{t-1}\boldsymbol{W}\textbf{Diag}[f'(\text{net}_i)]
$$

   The recurrent layer propagates error terms to the previous layer, identical to a standard fully connected layer:

$$
\begin{aligned}
        \operatorname{net}_{t}^{l} & = \boldsymbol{U} \boldsymbol{a}_{t}^{l-1} + \boldsymbol{W} \boldsymbol{s}_{t-1} \\
        \boldsymbol{a}_{t}^{l-1} & = f^{l-1}\left(\operatorname{net}_{t}^{l-1}\right)
    \end{aligned}
$$

   Similarly:

$$
    (\delta_t^{l-1})^T=(\delta_t^l)^T\boldsymbol{U}\textbf{Diag}[f'^{l-1}(\text{net}_t^{l-1})]
$$

3. Computing gradients (scalar-to-matrix differentiation):

   Since

$$
\frac{\partial L}{\partial w_{ji}}= \frac{\partial L}{\partial \text{net}_{t,j}}\frac{\partial \text{net}_{t,j}}{\partial w_{ji}}
$$

   we have

$$
\nabla_{W_t} L =
    \begin{bmatrix}
        \delta_1^t s_1^{t-1} & \delta_1^t s_2^{t-1} & \cdots & \delta_1^t s_n^{t-1} \\
        \delta_2^t s_1^{t-1} & \delta_2^t s_2^{t-1} & \cdots & \delta_2^t s_n^{t-1} \\
        \vdots & \vdots & \ddots & \vdots \\
        \delta_n^t s_1^{t-1} & \delta_n^t s_2^{t-1} & \cdots & \delta_n^t s_n^{t-1}
    \end{bmatrix}
$$

   The final gradient is the sum of gradients at each time step:

$$
    \nabla_{W} L = \sum_{t=1}^{T} \nabla_{W_t} L
$$

   The matrix follows the same pattern.

4. For matrix , only the current state needs to be considered. Additionally, RNN loss accumulates over time, so we cannot compute the partial derivative at a single time step alone:

$$
\frac{\partial L}{\partial \boldsymbol{V}}=\sum_{t=1}^{T}\frac{\partial L_t}{\partial \text{output}_t}\frac{\partial \text{output}_t}{\partial \boldsymbol{V}}
$$

## Long-Term Dependencies

### Gradient Exploding and Vanishing

The error term backpropagated through time is:

$$
\delta^L_k=\delta^L_t\prod_{i=k}^{t-1}\boldsymbol{W}\textbf{Diag}[f'(\text{net}_i)]
$$

Note that due to the chain rule, a product term appears. If the activation function is a squashing type such as or sigmoid, their derivatives lie in . Consider :

1. If the value of is in the range , as increases, the product term approaches 0, and errors cannot propagate — this causes the vanishing gradient problem.
2. If is large, such that , then as increases, the product term grows exponentially toward infinity, causing gradient explosion.

Vanishing gradients prevent errors from reaching earlier time steps, weights cannot update, and the network stops learning. Exploding gradients make the network unstable with excessively large weight changes; in the worst case, overflow (NaN) errors prevent weight updates.

Some mitigation approaches:
- Use semi-linear activation functions like ReLU instead of squashing activations. ReLU has a constant derivative of 1 in the positive domain, helping alleviate vanishing gradients.
- Carefully initialize weights to make values close to 1, avoiding both vanishing and exploding gradients.

Both approaches have limitations: ReLU has its own drawbacks, and weight initialization strategies cannot withstand the exponential growth from repeated multiplication. To fundamentally solve the problem, the product term must be removed.

### Vanishing Gradient: Formal Proof Sketch

Recall the vanilla RNN recurrence:

$$
h_t = \tanh(W_{hh} h_{t-1} + W_{xh} x_t + b_h)
$$

By the chain rule, the Jacobian of the hidden state transition is:

$$
\frac{\partial h_t}{\partial h_{t-1}} = \text{Diag}(f'(W_{hh}h_{t-1} + W_{xh}x_t)) \cdot W_{hh}
$$

Consider the gradient of the loss on step with respect to the hidden state on some previous step :

$$
\frac{\partial L_i}{\partial h_j} = \frac{\partial L_i}{\partial h_i} \prod_{k=j+1}^{i} \frac{\partial h_k}{\partial h_{k-1}}
$$

Pascanu et al. (2013) showed that if the largest eigenvalue of is less than 1, the product of Jacobians shrinks exponentially, causing the gradient to vanish. Similarly, if the largest eigenvalue exceeds 1, gradients explode.

> Why is the vanishing gradient a problem? Gradient signal from far away is lost because it's much smaller than gradient signal from nearby. So model weights are only updated with respect to near effects, not long-term effects.

Example effect on an RNN Language Model: for the sentence "When she tried to print her _____, she found that the printer was out of toner. She went to the stationery store to buy more toner. It was very overpriced. After installing the toner into the printer, she finally printed her tickets," the RNN-LM needs to model the dependency between "tickets" on the 7th step and the target word at the end. With vanishing gradients, the model cannot learn this dependency.

Syntactic vs. sequential recency: for "The writer of the books," the correct continuation is "is" (syntactic agreement with "writer"). Due to vanishing gradients, RNN-LMs are better at learning sequential recency ("are," agreeing with the nearest word "books") rather than syntactic recency ("is"), leading to agreement errors [Linzen et al., 2016].

### Gradient Clipping

Gradient clipping is a solution for the exploding gradient problem. If the norm of the gradient exceeds some threshold, scale it down before applying the SGD update:

$$
\text{if } \|\hat{g}\| > \text{threshold}, \quad \hat{g} \leftarrow \frac{\text{threshold}}{\|\hat{g}\|} \hat{g}
$$

Intuition: take a step in the same direction, but a smaller step.

If the gradient becomes too big, the SGD update step becomes too large:

$$
\theta^{\text{new}} = \theta^{\text{old}} - \eta \cdot \nabla_{\theta}L
$$

This can cause bad updates: we take too large a step and reach a bad parameter configuration with large loss. In the worst case, this results in Inf or NaN.

> Vanishing/exploding gradients are not just an RNN problem. They can affect all neural architectures (including feedforward and convolutional), especially deep ones. Due to the chain rule and choice of nonlinearity, gradients can become vanishingly small as they backpropagate. Solutions include residual connections (ResNet) and dense connections (DenseNet).

## Gated Architectures: LSTM and GRU

### LSTM

Long Short-Term Memory (LSTM) networks were proposed by Hochreiter and Schmidhuber in 1997. The core design idea: the original RNN has only one hidden state which is sensitive to short-term input; LSTM adds another state to preserve long-term information. This new state is called the cell state.

At any time step , three questions must be addressed:

1. How much of the previous cell state should be preserved?
2. How much of the current input information should be passed to ?
3. What should the hidden layer output be?

LSTM uses gate structures to control information retention and discarding. There are three gates: forget gate, input gate, and output gate.

**Forget Gate:** The forget gate output uses a sigmoid activation function mapping output to . The previous cell state is multiplied by when passing through the forget gate, determining how much of enters the current state .

$$
f_t = \sigma(h_{t-1} \cdot W_f + x_t \cdot U_f + b_f)
$$

where is the sigmoid activation, is the previous hidden state (shape ), is the current input (shape ). Parameter matrices and have shapes and respectively, and is shape .

**Input Gate:** The input gate determines which input information is retained. Input information includes both the current input and previous hidden output, stored in the candidate cell state . The input gate also uses sigmoid activation, mapping output to . The candidate state is filtered through the input gate.

$$
i_t = \sigma(h_{t-1} \cdot W_i + x_t \cdot U_i + b_i)
$$

Candidate cell state:

$$
\tilde c_t = \tanh(h_{t-1} \cdot W_c + x_t \cdot U_c + b_c)
$$

Information retained from the previous step plus information retained from the current input together form the current cell state:

$$
c_t = f_t \circ c_{t-1}+i_t \circ \tilde{c}_t
$$

denotes the Hadamard product.

> The sigmoid function outputs values compressed to , suitable for representing gating probabilities — whether some information is "allowed through" or "forgotten." Meanwhile, as the candidate memory for the current time step, should contain both positive and negative information (increase or decrease). The and together control the flexibility and effectiveness of information flow: one controls the proportion of candidate information added, and the other generates the new candidate memory expressing how current input and past information affect the cell state. Without , candidate state information couldn't be selectively filtered — all input might directly affect the cell state.

**Output Gate:** Finally, the output gate determines which information from and will be output:

$$
o_t = \sigma(h_{t-1} \cdot W_o + x_t \cdot U_o + b_o)
$$

The cell state passes through a activation to compress to , then through the output gate to produce the current hidden state :

$$
h_t=o_t \circ \tanh(c_t)
$$

Finally, the predicted output at time is:

$$
a_t = \sigma(h_t \cdot V + b)
$$

where

$$
z_t = h_t \cdot V + b
$$

LSTM intuition: memory cells can keep information intact unless inputs make them forget it or overwrite it with new input. The cell can decide to output this information or just store it.

### GRU

The Gated Recurrent Unit (GRU) is a simpler alternative to LSTM proposed by Cho et al. in 2014.

Simplifications over LSTM:

1. GRU combines LSTM's three gates into two: reset gate and update gate .
   - In LSTM, the input gate and forget gate are complementary with some redundancy. GRU uses a single gate (update gate) to control the balance between input and forgetting.
   - The update gate controls how much information from the historical state is retained (without nonlinear transformation) and how much new information is accepted from the candidate state.
   - The reset gate controls whether the computation of candidate state depends on the previous state .
2. GRU does not maintain a separate cell state ; it only retains the hidden state as the cell output, making its structure consistent with traditional RNNs.

Update gate:

$$
z_t = \sigma(h_{t-1} \cdot W_z + x_t \cdot U_z)
$$

Reset gate:

$$
r_t = \sigma(h_{t-1} \cdot W_r + x_t \cdot U_r)
$$

Candidate hidden state:

$$
\tilde{h}_t = \tanh((r_t \circ h_{t-1}) \cdot W_h + x_t \cdot U_h)
$$

Hidden state:

$$
h_t = (1 - z_t) \circ h_{t-1} + z_t \circ \tilde{h}_t
$$

GRU uses the update gate and reset gate to control the forgetting and retention of long-term states, as well as the selection of current input information. Both gates use sigmoid functions to map input information to , implementing gating functionality.

First, the previous state passes through the reset gate, combined with current input information, to form the current candidate state , mapped to via .

Then, the update gate implements both forgetting and remembering. From the hidden state formula, selective forgetting and remembering are achieved through : when forgets more of the previous information, remembers more of the current information — implementing the functionality of LSTM's and in one mechanism.

If the reset gate is close to 0, the model ignores previous hidden state, dropping irrelevant information. If the update gate is close to 1, information can be copied through many time steps (copy-paste state), reducing vanishing gradients. Units with short-term dependencies often have highly active reset gates; those with long-term dependencies have active update gates.

### LSTM vs GRU

- Researchers have proposed many gated RNN variants, but LSTM and GRU are the most widely used.
- The biggest difference: GRU is quicker to compute and has fewer parameters.
- There is no conclusive evidence that one consistently performs better than the other.
- LSTM is a good default choice, especially if data has particularly long dependencies, or you have lots of training data.
- Rule of thumb: start with LSTM, but switch to GRU for more efficiency.

LSTMs achieved state-of-the-art results for sequence modeling in 2013-2015 across tasks including handwriting recognition, speech recognition, machine translation, parsing, and image captioning. Starting in 2019, Transformers became more dominant for certain NLP tasks. For example, in WMT 2016 the summary report contained "RNN" 44 times; in WMT 2018 it contained "RNN" 9 times and "Transformer" 63 times.

## Bidirectional RNNs

Standard RNNs produce contextual representations that only contain information about the left context. For sentiment classification, the word "terribly" in "the movie was terribly exciting" would have a negative connotation from left context alone, but the right context "exciting" modifies its meaning to positive.

Bidirectional RNNs solve this by running two separate RNNs:
- A forward RNN processes the sequence left to right.
- A backward RNN processes the sequence right to left.

On each timestep, the hidden states from both directions are concatenated:

$$
h_t^{\text{bi}} = [h_t^{\text{forward}}; h_t^{\text{backward}}]
$$

This concatenated hidden state contains information from both left and right context. These two RNNs generally have separate weights. The bidirectional layer can use any RNN variant (vanilla RNN, LSTM, or GRU).

## Multi-layer RNNs

Multi-layer RNNs stack multiple RNN layers, where the hidden states from RNN layer are the inputs to RNN layer :

$$
h_t^{(i+1)} = \text{RNN}^{(i+1)}(h_t^{(i)}, h_{t-1}^{(i+1)})
$$

Stacking allows higher layers to learn more abstract, higher-level representations of the sequence.

## Language Modeling

### What is Language Modeling?

Language Modeling is the task of predicting what word comes next. More formally: given a sequence of words , compute the probability distribution of the next word :

$$
P(w_{t+1} \mid w_1, \ldots, w_t)
$$

where can be any word in the vocabulary . A system that does this is called a Language Model.

### n-gram Language Models

The n-gram LM makes a simplifying assumption: depends only on the preceding words:

$$
P(w_{t+1} \mid w_1, \ldots, w_t) \approx P(w_{t+1} \mid w_{t-n+2}, \ldots, w_t)
$$

Probabilities are estimated by counting in a large text corpus:

$$
P(w_{t+1} \mid w_{t-n+2}, \ldots, w_t) = \frac{\text{count}(w_{t-n+2}, \ldots, w_t, w_{t+1})}{\text{count}(w_{t-n+2}, \ldots, w_t)}
$$

Sparsity problems with n-gram LMs:
- Sparsity Problem 1: What if a particular n-gram never occurred in data? Then probability is 0. Partial solution: add a small to every count (smoothing).
- Sparsity Problem 2: What if the (n-1)-gram context never occurred? Then we can't compute probability at all. Partial solution: condition on a shorter context instead (backoff).
- Increasing n makes sparsity problems worse. Typically, n cannot exceed 5.

### Fixed-Window Neural Language Model

A fixed-window neural LM improves over n-gram LMs:
- No sparsity problem.
- Don't need to store all observed n-grams.

Remaining problems:
- Fixed window is too small.
- Enlarging the window enlarges the parameter matrix .
- The window can never be large enough.
- Input words are multiplied by completely different weights — no symmetry in how inputs are processed.

We need a neural architecture that can process input of any length.

### RNN Language Model

An RNN Language Model applies the same weights at every timestep, processing sequences of any length:

RNN advantages:
- Can process any length input.
- Computation for step can (in theory) use information from many steps back.
- Model size doesn't increase for longer input.
- Same weights applied on every timestep, providing symmetry in input processing.

RNN disadvantages:
- Recurrent computation is slow.
- In practice, difficult to access information from many steps back.

## Training RNN Language Models

To train an RNN-LM:
- Get a big corpus of text (a sequence of words).
- Feed into RNN-LM; compute output distribution for every step .
- Predict probability distribution of every word, given words so far.
- Loss function on step is cross-entropy between predicted distribution and the true next word (one-hot):

$$
L_t = -\log P_{\text{model}}(w_{t+1} \mid w_1, \ldots, w_t; \theta)
$$

Average this to get overall loss for the entire training set:

$$
L = \frac{1}{T} \sum_{t=1}^{T} L_t = -\frac{1}{T} \sum_{t=1}^{T} \log P_{\text{model}}(w_{t+1} \mid w_1, \ldots, w_t; \theta)
$$

At each time step, the loss is the negative log probability of the actual next word. The total loss is the sum (or average) of losses across all time steps.

## Evaluating Language Models: Perplexity

The standard evaluation metric for Language Models is perplexity:

$$
\text{Perplexity} = \left( \prod_{t=1}^{T} \frac{1}{P_{\text{LM}}(w_{t+1} \mid w_1, \ldots, w_t)} \right)^{1/T}
$$

This equals the exponential of the cross-entropy loss:

$$
\text{Perplexity} = \exp\left( -\frac{1}{T} \sum_{t=1}^{T} \log P_{\text{LM}}(w_{t+1} \mid w_1, \ldots, w_t) \right)
$$

- Lower bound = 1 (perfect model assigns probability 1 to every next word).
- Upper bound = vocabulary size .
- Lower perplexity is better.

## Text Generation with RNNs

You can use an RNN Language Model to generate text by repeated sampling. The sampled output becomes the next step's input.

RNN-LMs can be trained on any kind of text and then generate text in that style:
- Obama speeches
- Harry Potter
- Paint color names (character-level RNN-LM)
- Poetry generation (improves with more training)
- Textbook generation
- C code generation

Character-level RNN-LMs predict what character comes next rather than what word comes next, allowing them to generate novel text at the character level.

### Applications of Language Modeling

Language Modeling is a benchmark task that helps measure progress on understanding language. It is a subcomponent of many NLP tasks:
- Predictive typing
- Speech recognition
- Handwriting recognition
- Spelling/grammar correction
- Authorship identification
- Machine translation
- Summarization
- Dialogue

## Neural Machine Translation

### Sequence-to-Sequence Model

Neural Machine Translation (NMT) uses a single neural network with a sequence-to-sequence (seq2seq) architecture involving two RNNs:

- Encoder RNN: produces an encoding of the source sentence, providing the initial hidden state for the Decoder RNN.
- Decoder RNN: a Language Model that generates the target sentence, conditioned on the encoding.

The encoding captures all information about the source sentence. At test time, the decoder output is fed in as the next step's input.

### Greedy Decoding

Greedy decoding takes the argmax (most probable word) on each step of the decoder:

Problem with greedy decoding: there is no way to undo decisions. If an early incorrect choice is made (e.g., "he hit a..." when the correct translation should be "he hit me..."), there's no going back.

### Exhaustive Search Decoding

Ideally, we want to find the length- translation that maximizes:

$$
P(y \mid x) = \prod_{t=1}^{T} P(y_t \mid y_1, \ldots, y_{t-1}, x)
$$

Computing all possible sequences would mean tracking possible partial translations on each step, where is vocabulary size. This complexity is far too expensive.

### Beam Search Decoding

Core idea: on each step of the decoder, keep track of the most probable partial translations (called hypotheses).

- is the beam size (in practice around 5 to 10).
- A hypothesis has a score equal to its log probability:

$$
\text{score}(y_1, \ldots, y_t) = \log P_{\text{LM}}(y_1, \ldots, y_t \mid x) = \sum_{i=1}^{t} \log P_{\text{LM}}(y_i \mid y_1, \ldots, y_{i-1}, x)
$$

Scores are all negative, and higher (closer to 0) is better.

Algorithm:
1. Start with the `START` token.
2. For each of the hypotheses, find the top next words and compute their scores.
3. Of these candidates, keep only the with the highest scores.
4. Repeat until stopping criterion.

Stopping criteria:
- When a hypothesis produces `END`, that hypothesis is complete — set it aside and continue exploring.
- Continue until reaching timestep (pre-defined cutoff), or having at least completed hypotheses.

Selection: longer hypotheses have lower (more negative) scores. Normalize by length to select the top one:

$$
\text{score}_{\text{norm}}(y) = \frac{1}{T} \sum_{t=1}^{T} \log P(y_t \mid y_1, \ldots, y_{t-1}, x)
$$

Beam search is not guaranteed to find the optimal solution, but is much more efficient than exhaustive search.

### BLEU Evaluation

BLEU (Bilingual Evaluation Understudy) compares machine-written translations to one or more human-written translations and computes a similarity score based on:
- n-gram precision (usually for 1, 2, 3, and 4-grams).
- A penalty for too-short system translations (brevity penalty).

BLEU is useful but imperfect:
- There are many valid ways to translate a sentence.
- A good translation can get a poor BLEU score because it has low n-gram overlap with the human reference.

NMT has been the biggest success story of NLP Deep Learning — going from a fringe research activity in 2014 to the leading standard method in 2016. Google Translate switched from SMT to NMT in 2016. SMT systems built by hundreds of engineers over many years were outperformed by NMT systems trained by a handful of engineers in a few months.

However, machine translation is not fully solved. Challenges remain:
- Out-of-vocabulary words
- Domain mismatch between train and test data
- Maintaining context over longer text
- Low-resource language pairs
- Common-sense reasoning
- Biases in training data

## Attention Mechanism

### The Bottleneck Problem

In the vanilla seq2seq model, the encoder must compress the entire source sentence into a single fixed-length vector. This creates an information bottleneck — it needs to capture all information about the source sentence, which becomes increasingly difficult for longer sentences.

### Sequence-to-Sequence with Attention

Attention provides a solution to the bottleneck problem. Core idea: on each step of the decoder, use a direct connection to the encoder to focus on a particular part of the source sequence.

At each decoder timestep:
1. Compute attention scores between the decoder hidden state and each encoder hidden state.
2. Apply softmax to obtain the attention distribution (a probability distribution summing to 1).
3. Compute the attention output as a weighted sum of encoder hidden states.
4. Concatenate the attention output with the decoder hidden state, then use this to compute the output distribution as before.

### Attention in Equations

Given encoder hidden states , on timestep with decoder hidden state :

Attention scores:

$$
e_{t,i} = \text{score}(h_t^{\text{dec}}, h_i^{\text{enc}})
$$

Common scoring functions include dot product:

$$
e_{t,i} = (h_t^{\text{dec}})^T h_i^{\text{enc}}
$$

Attention distribution (softmax):

$$
\alpha_{t,i} = \frac{\exp(e_{t,i})}{\sum_{j=1}^{N} \exp(e_{t,j})}
$$

where and .

Attention output (weighted sum):

$$
a_t = \sum_{i=1}^{N} \alpha_{t,i} h_i^{\text{enc}}
$$

Finally, concatenate with decoder hidden state and compute the output:

$$
[\tilde{h}_t^{\text{dec}}] = [h_t^{\text{dec}}; a_t]
$$

### Benefits of Attention

- Significantly improves NMT performance.
- Solves the bottleneck problem by allowing the decoder to look directly at the source.
- Helps with the vanishing gradient problem by providing shortcuts to faraway states.
- Provides some interpretability — by inspecting the attention distribution, we can see what the decoder was focusing on.
- We get (soft) alignment for free — the network learns alignment by itself without explicit alignment training.

### Attention as a General Deep Learning Technique

Attention is not limited to seq2seq for MT. More general definition: given a set of vector *values* and a vector *query*, attention computes a weighted sum of the values, dependent on the query. The query *attends* to the values. For example, in seq2seq + attention, each decoder hidden state (query) attends to all encoder hidden states (values).

## Image Captioning with RNNs

### Basic Image Captioning Model

Image captioning generates a text description from an image using a CNN-RNN architecture:
- A Convolutional Neural Network (CNN) extracts image features.
- A Recurrent Neural Network (RNN) generates the caption word by word.

The RNN formula is modified to include the image features as an additional input:

$$
h_t = \tanh(W_{xh} x_t + W_{hh} h_{t-1} + W_{ih} \cdot \text{im})
$$

where is the image feature vector extracted by the CNN. At each timestep, the model samples a word from the output distribution and feeds it back as input for the next step. Generation stops when an `<END>` token is produced.

### Image Captioning with Attention

The bottleneck problem also affects image captioning — the entire image must be encoded into a single context vector. Using attention, we can compute a new context vector at every time step, with each context vector attending to different image regions.

The image is processed by a CNN to extract spatial features of size , where and are the spatial dimensions and is the feature depth.

At each decoder timestep:
- Compute alignment scores for each spatial location using an MLP:

$$
e_{t,i,j} = f_{\text{att}}(h_{t-1}^{\text{dec}}, z_{i,j})
$$

- Softmax over all locations to get attention weights (sum to 1).
- Compute the context vector as a weighted sum:

$$
c_t = \sum_{i,j} \alpha_{t,i,j} z_{i,j}
$$

- Use this context vector in the decoder:

$$
y_t = g(y_{t-1}, h_{t-1}, c_t)
$$

This entire process is differentiable — the model chooses its own attention weights with no attention supervision required.

Attention can be soft (weighted sum over all locations) or hard (sampling one location, requiring reinforcement learning).

## Video Captioning

Video captioning extends image captioning to video by generating a feature representation of the video and decoding it into a sentence.

Approaches include:
- Mean pooling: extract CNN features from each frame and average them, then feed into an RNN decoder.
- Sequence-to-sequence for video (S2VT): use an LSTM encoder to encode frame features sequentially, then an LSTM decoder to generate the caption.

The key insight is to treat video captioning as a translation task: encode the visual sequence and decode it into a natural language sentence.

## References

1. [CS231n Lecture 7](https://cs231n.stanford.edu/slides/2024/lecture_7.pdf)
2. K. Cho, B. van Merrienboer, C. Gulcehre, D. Bahdanau, F. Bougares, H. Schwenk, and Y. Bengio. Learning phrase representations using RNN encoder-decoder for statistical machine translation, 2014. [arXiv:1406.1078](https://arxiv.org/abs/1406.1078).
3. J. Chung, C. Gulcehre, K. Cho, and Y. Bengio. Empirical evaluation of gated recurrent neural networks on sequence modeling, 2014. [arXiv:1412.3555](https://arxiv.org/abs/1412.3555).
4. J. L. Elman. Finding structure in time. Cognitive Science, 14(2):179–211, 1990.
5. K. Hornik, M. Stinchcombe, and H. White. Multilayer feedforward networks are universal approximators. Neural Networks, 2(5):359–366, 1989. ISSN 0893-6080.
6. M. Jordan. Serial order: a parallel distributed processing approach. Advances in Psychological Science, 121:471–495, 1986.
7. H. T. Siegelmann and E. D. Sontag. Turing computability with neural nets. Applied Mathematics Letters, 4(6):77–80, 1991. ISSN 0893-9659.
8. R. Pascanu, T. Mikolov, and Y. Bengio. On the difficulty of training recurrent neural networks, 2013. [PMLR](http://proceedings.mlr.press/v28/pascanu13.pdf).
9. I. Sutskever, O. Vinyals, and Q. V. Le. Sequence to sequence learning with neural networks, 2014. [arXiv:1409.3215](https://arxiv.org/abs/1409.3215).
10. D. Bahdanau, K. Cho, and Y. Bengio. Neural machine translation by jointly learning to align and translate, 2015. [arXiv:1409.0473](https://arxiv.org/abs/1409.0473).
11. K. Xu, J. Ba, R. Kiros, K. Cho, A. Courville, R. Salakhutdinov, R. Zemel, and Y. Bengio. Show, attend and tell: Neural image caption generation with visual attention, 2015. [arXiv:1502.03044](https://arxiv.org/abs/1502.03044).
12. A. Karpathy and L. Fei-Fei. Deep visual-semantic alignments for generating image descriptions, 2015. [arXiv:1412.2306](https://arxiv.org/abs/1412.2306).
13. O. Vinyals, A. Toshev, S. Bengio, and D. Erhan. Show and tell: A neural image caption generator, 2015. [arXiv:1411.4555](https://arxiv.org/abs/1411.4555).
14. S. Venugopalan, M. Rohrbach, J. Donahue, R. Mooney, T. Darrell, and K. Saenko. Sequence to sequence - video to text, 2015. [arXiv:1505.00487](https://arxiv.org/abs/1505.00487).
15. S. Venugopalan, H. Xu, J. Donahue, M. Rohrbach, R. Mooney, and K. Saenko. Translating videos to natural language using deep recurrent neural networks, 2015. [arXiv:1412.4729](https://arxiv.org/abs/1412.4729).
16. K. Papineni, S. Roukos, T. Ward, and W. Zhu. BLEU: a method for automatic evaluation of machine translation, 2002. [ACL](https://aclanthology.org/P02-1040/).
17. K. He, X. Zhang, S. Ren, and J. Sun. Deep residual learning for image recognition, 2015. [arXiv:1512.03385](https://arxiv.org/abs/1512.03385).
