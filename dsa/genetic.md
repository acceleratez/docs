# 遗传算法（Genetic Algorithm, GA）

## 算法思想

### 基本概念
- 遗传算法是一种**启发式搜索**算法，模仿生物进化过程中的**自然选择**和**遗传机制**。
- 通过**种群（population）**的迭代进化，逐步优化解的质量。
- 属于**元启发式算法**（metaheuristic），不保证找到最优解，但在可接受时间内通常能找到较好的解。

### 生物进化类比
| 生物概念 | 遗传算法对应 |
|---------|------------|
| 个体（Individual） | 问题的候选解 |
| 基因（Gene） | 解的某个特征/参数 |
| 染色体（Chromosome） | 解的编码（基因序列） |
| 适应度（Fitness） | 目标函数值 |
| 交叉（Crossover） | 组合两个解生成新解 |
| 变异（Mutation） | 随机改变解的部分基因 |
| 自然选择（Selection） | 选择较优个体进入下一代 |

### 算法流程
1. **初始化**：随机生成初始种群
2. **评估**：计算每个个体的适应度
3. **选择**：基于适应度选择父代个体
4. **交叉**：重组父代得到子代
5. **变异**：随机修改子代基因
6. **替换**：用子代替换部分或全部父代
7. **终止**：达到终止条件则输出最优解

## 基本实现

### 个体编码
```cpp
struct Individual {
    vector<int> genes;
    double fitness;
};

Individual::Individual(int geneCount) {
    genes.resize(geneCount);
    for (int i = 0; i < geneCount; i++)
        genes[i] = uniform_int_distribution<int>(0, 1)(rng);
    fitness = 0.0;
}
```

### 适应度函数
```cpp
double fitnessFunction(const vector<int>& genes) {
    double value = 0;
    for (int i = 0; i < genes.size(); i++)
        if (genes[i] == 1) value += itemValues[i];
    return value;
}
```

### 选择操作

#### 轮盘赌选择（Roulette Wheel Selection）
```cpp
Individual* rouletteSelection(const vector<Individual>& population, double totalFitness) {
    double r = uniform_real_distribution<double>(0.0, totalFitness)(rng);
    double cumFitness = 0.0;
    for (auto& ind : population) {
        cumFitness += ind.fitness;
        if (cumFitness >= r) return const_cast<Individual*>(&ind);
    }
    return &population.back();
}
```

#### 锦标赛选择（Tournament Selection）
```cpp
Individual* tournamentSelection(const vector<Individual>& population, int tournamentSize = 3) {
    Individual* best = nullptr;
    for (int i = 0; i < tournamentSize; i++) {
        Individual* candidate = &population[uniform_int_distribution<int>(0, population.size()-1)(rng)];
        if (!best || candidate->fitness > best->fitness) best = candidate;
    }
    return best;
}
```

#### 最优保留（Elitism）
```cpp
void preserveElite(vector<Individual>& population, vector<Individual>& newPopulation, int eliteCount) {
    sort(population.begin(), population.end(),
        [](const Individual& a, const Individual& b){ return a.fitness > b.fitness; });
    for (int i = 0; i < eliteCount; i++)
        newPopulation.push_back(population[i]);
}
```

### 交叉操作

#### 单点交叉（Single-Point Crossover）
```cpp
void singlePointCrossover(Individual& parent1, Individual& parent2) {
    int pos = uniform_int_distribution<int>(1, parent1.genes.size()-1)(rng);
    for (int i = pos; i < parent1.genes.size(); i++)
        swap(parent1.genes[i], parent2.genes[i]);
}
```

#### 两点交叉（Two-Point Crossover）
```cpp
void twoPointCrossover(Individual& p1, Individual& p2) {
    int size = p1.genes.size();
    int pos1 = uniform_int_distribution<int>(1, size-2)(rng);
    int pos2 = uniform_int_distribution<int>(pos1+1, size-1)(rng);
    for (int i = pos1; i <= pos2; i++)
        swap(p1.genes[i], p2.genes[i]);
}
```

#### 均匀交叉（Uniform Crossover）
```cpp
void uniformCrossover(Individual& p1, Individual& p2, double prob = 0.5) {
    for (int i = 0; i < p1.genes.size(); i++) {
        if (uniform_real_distribution<double>(0.0, 1.0)(rng) < prob)
            swap(p1.genes[i], p2.genes[i]);
    }
}
```

### 变异操作

#### 基本位变异（Bit Flip Mutation）
```cpp
void bitFlipMutation(Individual& ind, double mutationRate = 0.01) {
    for (int i = 0; i < ind.genes.size(); i++) {
        if (uniform_real_distribution<double>(0.0, 1.0)(rng) < mutationRate)
            ind.genes[i] = 1 - ind.genes[i];
    }
}
```

#### 逆序变异（Inversion Mutation）
```cpp
void inversionMutation(Individual& ind) {
    int i = uniform_int_distribution<int>(0, ind.genes.size()-2)(rng);
    int j = uniform_int_distribution<int>(i+1, ind.genes.size()-1)(rng);
    reverse(ind.genes.begin() + i, ind.genes.begin() + j + 1);
}
```

## 完整遗传算法框架

```cpp
class GeneticAlgorithm {
    int populationSize;
    double crossoverRate;
    double mutationRate;
    int maxGenerations;
    int geneCount;

public:
    GeneticAlgorithm(int popSize, double crossRate, double mutRate,
                     int maxGen, int geneCnt)
        : populationSize(popSize), crossoverRate(crossRate),
          mutationRate(mutRate), maxGenerations(maxGen), geneCount(geneCnt) {}

    Individual run() {
        vector<Individual> population;
        for (int i = 0; i < populationSize; i++)
            population.push_back(Individual(geneCount));

        Individual best;
        for (int gen = 0; gen < maxGenerations; gen++) {
            for (auto& ind : population)
                ind.fitness = fitnessFunction(ind.genes);

            for (auto& ind : population)
                if (ind.fitness > best.fitness) best = ind;

            vector<Individual> newPopulation;

            preserveElite(population, newPopulation, 2);

            while ((int)newPopulation.size() < populationSize) {
                Individual parent1 = *tournamentSelection(population);
                Individual parent2 = *tournamentSelection(population);

                Individual child1 = parent1;
                Individual child2 = parent2;

                if (uniform_real_distribution<double>(0.0, 1.0)(rng) < crossoverRate) {
                    singlePointCrossover(child1, child2);
                }

                bitFlipMutation(child1, mutationRate);
                bitFlipMutation(child2, mutationRate);

                child1.fitness = fitnessFunction(child1.genes);
                child2.fitness = fitnessFunction(child2.genes);

                newPopulation.push_back(child1);
                if ((int)newPopulation.size() < populationSize)
                    newPopulation.push_back(child2);
            }

            population = move(newPopulation);

            if (gen % 100 == 0)
                cout << "Generation " << gen << ": best fitness = " << best.fitness << endl;
        }
        return best;
    }
};
```

## 应用实例

### 1. 旅行商问题（TSP）

```cpp
struct TSPCrossover {
    void orderCrossover(const Individual& p1, const Individual& p2, Individual& c1, Individual& c2) {
        int n = p1.genes.size();
        int start = uniform_int_distribution<int>(0, n-1)(rng);
        int end = uniform_int_distribution<int>(start+1, n)(rng);

        vector<bool> used1(n, false), used2(n, false);
        for (int i = start; i < end; i++) {
            c1.genes[i] = p1.genes[i];
            c2.genes[i] = p2.genes[i];
            used1[p1.genes[i]] = true;
            used2[p2.genes[i]] = true;
        }

        for (int i = 0; i < n; i++) {
            if (i >= start && i < end) continue;
        }
    }
};

double tspFitness(const vector<int>& tour, const vector<vector<double>>& dist) {
    double total = 0;
    for (int i = 0; i < (int)tour.size() - 1; i++)
        total += dist[tour[i]][tour[i+1]];
    total += dist[tour.back()][tour[0]];
    return 1.0 / total;
}
```

### 2. 函数优化

```cpp
struct RealIndividual {
    vector<double> genes;
    double fitness;
};

double realFitness(const vector<double>& genes) {
    double x1 = genes[0], x2 = genes[1];
    double val = sin(x1) * sin(x2) * exp(fabs(x1)/10) * exp(fabs(x2)/10);
    return val;
}

void sbxCrossover(RealIndividual& p1, RealIndividual& p2, double eta = 20) {
    for (int i = 0; i < p1.genes.size(); i++) {
        if (uniform_real_distribution<double>(0.0, 1.0)(rng) < 0.5) {
            double beta = 0;
            double y1 = p1.genes[i], y2 = p2.genes[i];
            if (fabs(y1 - y2) > 1e-10) {
                double mu = uniform_real_distribution<double>(0.0, 1.0)(rng);
                if (mu <= 0.5)
                    beta = pow(2*mu, 1.0/(eta+1));
                else
                    beta = pow(2*(1-mu), -1.0/(eta+1));
            }
            p1.genes[i] = 0.5 * ((1+beta)*y1 + (1-beta)*y2);
            p2.genes[i] = 0.5 * ((1-beta)*y1 + (1+beta)*y2);
        }
    }
}
```

### 3. 0-1背包问题

```cpp
double knapsackFitness(const vector<int>& genes, const vector<int>& values,
                       const vector<int>& weights, int capacity) {
    int totalValue = 0, totalWeight = 0;
    for (int i = 0; i < genes.size(); i++) {
        if (genes[i]) {
            totalValue += values[i];
            totalWeight += weights[i];
        }
    }
    if (totalWeight > capacity) return 0;
    return totalValue;
}

double penaltyFitness(const vector<int>& genes, ...) {
    int totalWeight = ...;
    int totalValue = ...;
    double penalty = max(0.0, totalWeight - capacity) * penaltyFactor;
    return totalValue - penalty;
}
```

## 高级技术

### 1. 混合遗传算法（Memetic Algorithm）
```cpp
void localSearch(Individual& ind) {
    for (int i = 0; i < 100; i++) {
        Individual neighbor = ind;
        mutate(neighbor, 0.3);
        if (fitnessFunction(neighbor.genes) > ind.fitness)
            ind = neighbor;
    }
}
```

### 2. 多种群遗传算法
- 分离成多个子种群独立进化
- 定期交换优秀个体（迁移）

### 3. 自适应遗传算法
```cpp
void adaptiveGA() {
    double pc = 0.9 - 0.7 * (generation / maxGeneration);
    double pm = 0.01 + 0.1 * (generation / maxGeneration);
}
```

### 4. 约束处理

#### 惩罚函数法
```cpp
double constrainedFitness(const vector<int>& genes, double penalty = 1000) {
    double rawFitness = fitnessFunction(genes);
    double penaltyCost = 0;
    for (auto& c : constraints)
        if (!isSatisfied(genes, c))
            penaltyCost += penalty;
    return rawFitness - penaltyCost;
}
```

#### 修复法
```cpp
vector<int> repairSolution(vector<int> genes) {
    while (!isFeasible(genes)) {
        int worst = findWorstGene(genes);
        genes[worst] = 0;
    }
    return genes;
}
```

## 参数调优

### 关键参数
- **种群大小**：通常 100-500
- **交叉率**：通常 0.6-0.9
- **变异率**：通常 0.01-0.1
- **最大代数**：通常 100-1000

### 实验设计
使用正交实验或响应面分析方法进行参数优化。