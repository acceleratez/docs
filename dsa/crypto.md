# 密码学算法（Cryptographic Algorithms）

## 密码学基础

### 基本概念

- **明文（Plaintext）**：原始消息
- **密文（Ciphertext）**：加密后的消息
- **加密（Encryption）**：将明文转换为密文的过程
- **解密（Decryption）**：将密文还原为明文的过程
- **密钥（Key）**：加密/解密使用的参数

### 密码系统分类

1. **对称加密（Symmetric）**：加密解密使用相同密钥
2. **非对称加密（Asymmetric）**：加密和解密使用不同密钥（公钥/私钥）
3. **哈希函数（Hash Function）**：单向函数，不可逆

### 安全目标

- **机密性（Confidentiality）**：只有授权者能读取
- **完整性（Integrity）**：消息未被篡改
- **认证（Authentication）**：验证发送者身份
- **不可抵赖性（Non-repudiation）**：发送者不能否认发送

## 对称加密

### 凯撒密码（Caesar Cipher）

```cpp
string caesarEncrypt(string plaintext, int k) {
    string ciphertext;
    for (char c : plaintext) {
        if (isalpha(c))
            ciphertext += (c - 'A' + k) % 26 + 'A';
        else ciphertext += c;
    }
    return ciphertext;
}
```

密钥空间：$26$（容易被暴力破解）

### 维吉尼亚密码（Vigenère Cipher）

```cpp
string vigenereEncrypt(string plaintext, string key) {
    string ciphertext;
    int j = 0;
    for (char c : plaintext) {
        if (isalpha(c)) {
            int shift = key[j % key.length()] - 'A';
            ciphertext += (c - 'A' + shift) % 26 + 'A';
            j++;
        } else ciphertext += c;
    }
    return ciphertext;
}
```

密钥长度等于密钥字符串长度。

### 现代对称加密

#### 置换密码（Permutation Cipher）

```cpp
string permEncrypt(string text, vector<int>& key) {
    string ciphertext;
    int blockSize = key.size();
    for (size_t i = 0; i < text.length(); i += blockSize) {
        string block = text.substr(i, min(blockSize, (int)text.length() - i));
        block += string(blockSize - block.size(), 'X');
        for (int j = 0; j < blockSize; j++)
            ciphertext += block[key[j] - 1];
    }
    return ciphertext;
}
```

#### AES（Advanced Encryption Standard）

```cpp
struct AESKey {
    vector<vector<byte>> roundKey;
    int keySize;
    int rounds;
};

void keyExpansion(const vector<byte>& key, AESKey& aesKey) {
    aesKey.keySize = key.size() * 8;
    aesKey.rounds = (key.size() == 16) ? 10 : (key.size() == 24) ? 12 : 14;
    aesKey.roundKey.resize(aesKey.rounds + 1);
    aesKey.roundKey[0] = toMatrix(key);
    for (int i = 1; i <= aesKey.rounds; i++) {
        vector<byte> temp = aesKey.roundKey[i-1];
        if (key.size() == 16) {
            if (i % 4 == 0) temp = subWord(rotWord(temp));
            temp = aesKey.roundKey[i-1][0];
            for (int j = 0; j < 4; j++)
                temp[j] ^= Rcon[i/4][j];
        }
        for (int j = 0; j < 4; j++)
            aesKey.roundKey[i][j] = aesKey.roundKey[i-1][j] ^ temp;
    }
}

void aesEncryptBlock(vector<byte>& block, const AESKey& key) {
    addRoundKey(block, key.roundKey[0]);
    for (int r = 1; r < key.rounds; r++) {
        subBytes(block);
        shiftRows(block);
        mixColumns(block);
        addRoundKey(block, key.roundKey[r]);
    }
    subBytes(block);
    shiftRows(block);
    addRoundKey(block, key.roundKey[key.rounds]);
}

void aesDecryptBlock(vector<byte>& block, const AESKey& key) {
    addRoundKey(block, key.roundKey[key.rounds]);
    for (int r = key.rounds - 1; r >= 1; r--) {
        invShiftRows(block);
        invSubBytes(block);
        addRoundKey(block, key.roundKey[r]);
        invMixColumns(block);
    }
    invShiftRows(block);
    invSubBytes(block);
    addRoundKey(block, key.roundKey[0]);
}
```

AES 支持 $128/192/256$ 位密钥，安全性基于**替换-置换网络**结构。

## 非对称加密

### RSA算法

#### 密钥生成

```cpp
struct RSAKey {
    long long n;
    long long e;
    long long d;
};

long long modPow(long long a, long long e, long long mod) {
    long long res = 1;
    while (e > 0) {
        if (e & 1) res = (__int128)res * a % mod;
        a = (__int128)a * a % mod;
        e >>= 1;
    }
    return res;
}

long long gcdExtended(long long a, long long b, long long& x, long long& y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = gcdExtended(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

long long modInverse(long long a, long long m) {
    long long x, y;
    long long g = gcdExtended(a, m, x, y);
    if (g != 1) return -1;
    return (x % m + m) % m;
}

pair<RSAKey, RSAKey> generateRSAKey(long long p, long long q) {
    long long n = p * q;
    long long phi = (p - 1) * (q - 1);
    long long e = 65537;
    if (e >= phi) e = 3;
    long long d = modInverse(e, phi);
    RSAKey pubKey = {n, e, 0};
    RSAKey priKey = {n, e, d};
    return {pubKey, priKey};
}
```

#### 加密和解密

```cpp
long long rsaEncrypt(long long plaintext, const RSAKey& pubKey) {
    return modPow(plaintext, pubKey.e, pubKey.n);
}

long long rsaDecrypt(long long ciphertext, const RSAKey& priKey) {
    return modPow(ciphertext, priKey.d, priKey.n);
}
```

RSA 安全性基于：大整数分解的困难性。

给定 $n = pq$，其中 $p$ 和 $q$ 为大素数，求解 $p$ 和 $q$ 在计算上不可行。

### ElGamal密码系统

```cpp
struct ElGamalKey {
    long long p;
    long long g;
    long long y;
    long long x;
};

long long findPrimitiveRoot(long long p) {
    long long phi = p - 1;
    vector<long long> factors;
    long long n = phi;
    for (long long i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            factors.push_back(i);
            while (n % i == 0) n /= i;
        }
    }
    if (n > 1) factors.push_back(n);
    for (long long g = 2; g < p; g++) {
        bool valid = true;
        for (long long q : factors) {
            if (modPow(g, phi / q, p) == 1) {
                valid = false;
                break;
            }
        }
        if (valid) return g;
    }
    return -1;
}

pair<long long, long long> elgamalEncrypt(long long m, const ElGamalKey& key) {
    long long k = rand() % (key.p - 2) + 1;
    long long c1 = modPow(key.g, k, key.p);
    long long c2 = (m * modPow(key.y, k, key.p)) % key.p;
    return {c1, c2};
}

long long elgamalDecrypt(long long c1, long long c2, const ElGamalKey& key) {
    long long s = modPow(c1, key.x, key.p);
    long long m = (c2 * modInverse(s, key.p)) % key.p;
    return m;
}
```

ElGamal 安全性基于：**离散对数问题**。

给定 $y = g^x \mod p$，求 $x$ 在计算上不可行。

### 椭圆曲线密码学（ECC）

```cpp
struct ECCPoint {
    long long x, y;
    bool infinity;
};

struct ECCKey {
    long long p;
    long long a, b;
    ECCPoint G;
    long long n;
    long long h;
    long long d;
    ECCPoint Q;
};

ECCPoint eccAdd(const ECCPoint& P, const ECCPoint& Q, long long a, long long p) {
    if (Q.infinity) return P;
    if (P.infinity) return Q;
    if (P.x == Q.x) {
        if (P.y == Q.y) {
            long long lambda = (3 * P.x * P.x + a) * modInverse(2 * P.y, p) % p;
            long long x = (lambda * lambda - 2 * P.x) % p;
            long long y = (lambda * (P.x - x) - P.y) % p;
            return {x, y, false};
        }
        return {0, 0, true};
    }
    long long lambda = (Q.y - P.y) * modInverse(Q.x - P.x, p) % p;
    long long x = (lambda * lambda - P.x - Q.x) % p;
    long long y = (lambda * (P.x - x) - P.y) % p;
    return {x, y, false};
}

ECCPoint eccMul(long long k, const ECCPoint& P, long long a, long long p) {
    ECCPoint result = {0, 0, true};
    ECCPoint base = P;
    while (k > 0) {
        if (k & 1) result = eccAdd(result, base, a, p);
        base = eccAdd(base, base, a, p);
        k >>= 1;
    }
    return result;
}

pair<ECCKey, ECCPoint> generateECCKey(long long p, long long a, long long b, const ECCPoint& G) {
    ECCKey key;
    key.p = p;
    key.a = a;
    key.b = b;
    key.G = G;
    key.d = rand() % (key.n - 1) + 1;
    key.Q = eccMul(key.d, G, a, p);
    return {key, key.Q};
}
```

ECC 安全性基于：**椭圆曲线离散对数问题（ECDLP）**。

## 哈希函数

### 基本要求

1. **单向性**：给定 $h$，难以找到 $m$ 使得 $H(m) = h$
2. **抗碰撞**：难以找到 $m_1 \neq m_2$ 使得 $H(m_1) = H(m_2)$
3. **雪崩效应**：输入微小变化导致输出巨大变化

### 简单哈希实现

#### 除法哈希

```cpp
int hashDiv(int key, int tableSize) {
    return key % tableSize;
}
```

#### 乘法哈希

```cpp
int hashMult(int key, double A = 0.6180339887, int tableSize = 1000) {
    double x = key * A;
    return (int)(tableSize * (x - floor(x)));
}
```

### 密码学哈希函数

#### MD5

```cpp
string md5(const string& input) {
    vector<unsigned char> msg(input.begin(), input.end());
    unsigned int h[4] = {0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476};
    unsigned char* msgBytes = msg.data();
    size_t msgLen = msg.size();
    uint64_t bitLen = msgLen * 8;
    msg.push_back(0x80);
    while ((msg.size() % 64) != 56) msg.push_back(0x00);
    for (int i = 0; i < 8; i++) msg.push_back((bitLen >> (i * 8)) & 0xff);
    for (size_t i = 0; i < msgLen + 9; i += 64) {
        unsigned int X[16];
        for (int j = 0; j < 16; j++)
            X[j] = msg[i + j * 4] | (msg[i + j * 4 + 1] << 8) |
                   (msg[i + j * 4 + 2] << 16) | (msg[i + j * 4 + 3] << 24);
        unsigned int A = h[0], B = h[1], C = h[2], D = h[3];
        for (int j = 0; j < 64; j++) {
            unsigned int F, g;
            if (j < 16) {
                F = (B & C) | ((~B) & D);
                g = j;
            } else if (j < 32) {
                F = (D & B) | ((~D) & C);
                g = (5 * j + 1) % 16;
            } else if (j < 48) {
                F = (B ^ C ^ D);
                g = (3 * j + 5) % 16;
            } else {
                F = (C ^ (B | (~D)));
                g = (7 * j) % 16;
            }
            F = (F + A + X[g] + T[j]) & 0xffffffff;
            A = D;
            D = C;
            C = B;
            B = (B + ((F << s[j]) | (F >> (32 - s[j])))) & 0xffffffff;
            A = (A + F) & 0xffffffff;
        }
        h[0] = (h[0] + A) & 0xffffffff;
        h[1] = (h[1] + B) & 0xffffffff;
        h[2] = (h[2] + C) & 0xffffffff;
        h[3] = (h[3] + D) & 0xffffffff;
    }
    char buf[33];
    sprintf(buf, "%08x%08x%08x%08x", h[0], h[1], h[2], h[3]);
    return string(buf);
}
```

MD5 产生 $128$ 位（$16$ 字节）哈希值。

**注意**：MD5 已不安全，不应用于安全目的。

#### SHA-256

```cpp
uint32_t rotr(uint32_t x, int n) { return (x >> n) | (x << (32 - n)); }
uint32_t ch(uint32_t x, uint32_t y, uint32_t z) { return (x & y) ^ (~x & z); }
uint32_t maj(uint32_t x, uint32_t y, uint32_t z) { return (x & y) ^ (x & z) ^ (y & z); }
uint32_t sigma0(uint32_t x) { return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22); }
uint32_t sigma1(uint32_t x) { return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25); }
uint32_t gamma0(uint32_t x) { return rotr(x, 7) ^ rotr(x, 18) ^ (x >> 3); }
uint32_t gamma1(uint32_t x) { return rotr(x, 17) ^ rotr(x, 19) ^ (x >> 10); }

string sha256(const string& input) {
    uint32_t h[8] = {0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
                     0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19};
    uint32_t k[64] = {0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
                      0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5};
    vector<unsigned char> msg(input.begin(), input.end());
    uint64_t origLen = msg.size() * 8;
    msg.push_back(0x80);
    while ((msg.size() % 64) != 56) msg.push_back(0x00);
    for (int i = 0; i < 8; i++) msg.push_back((origLen >> (56 - i * 8)) & 0xff);
    for (size_t i = 0; i < msg.size(); i += 64) {
        uint32_t w[64];
        for (int j = 0; j < 16; j++)
            w[j] = (msg[i + j * 4] << 24) | (msg[i + j * 4 + 1] << 16) |
                   (msg[i + j * 4 + 2] << 8) | msg[i + j * 4 + 3];
        for (int j = 16; j < 64; j++)
            w[j] = gamma1(w[j-2]) + w[j-7] + gamma0(w[j-15]) + w[j-16];
        uint32_t a = h[0], b = h[1], c = h[2], d = h[3];
        uint32_t e = h[4], f = h[5], g = h[6], hh = h[7];
        for (int j = 0; j < 64; j++) {
            uint32_t t1 = hh + sigma1(e) + ch(e, f, g) + k[j] + w[j];
            uint32_t t2 = sigma0(a) + maj(a, b, c);
            hh = g; g = f; f = e; e = d + t1;
            d = c; c = b; b = a; a = t1 + t2;
        }
        h[0] += a; h[1] += b; h[2] += c; h[3] += d;
        h[4] += e; h[5] += f; h[6] += g; h[7] += hh;
    }
    char buf[65];
    for (int i = 0; i < 8; i++) sprintf(buf + i * 8, "%08x", h[i]);
    return string(buf, 64);
}
```

SHA-256 产生 $256$ 位（$32$ 字节）哈希值。

### 哈希表中的哈希函数

```cpp
int stringHash(const string& s, int tableSize = 1000) {
    int hash = 0;
    for (char c : s) hash = (hash * 31 + c) % tableSize;
    return hash;
}

int rollingHash(const string& s, int base = 31, int mod = 1000000007) {
    int hash = 0;
    for (char c : s) hash = (1LL * hash * base + c) % mod;
    return hash;
}

int djb2(const string& s) {
    int hash = 5381;
    for (char c : s) hash = ((hash << 5) + hash) + c;
    return hash;
}
```

## 消息认证码（MAC）

### HMAC

```cpp
string hmacSha256(const string& key, const string& message) {
    const int blockSize = 64;
    string k = key;
    if (k.length() > blockSize) k = sha256(k);
    k = k + string(blockSize - k.length(), '\0');
    string innerPad(blockSize, '\x36');
    string outerPad(blockSize, '\x5c');
    for (int i = 0; i < blockSize; i++) {
        innerPad[i] ^= k[i];
        outerPad[i] ^= k[i];
    }
    string innerHash = sha256(innerPad + message);
    return sha256(outerPad + innerHash);
}
```

HMAC 提供消息完整性和 authenticity 验证。

形式化定义：$\text{HMAC}(K, m) = H((K' \oplus opad) || H((K' \oplus ipad) || m))$

## 数字签名

### RSA签名

```cpp
string rsaSign(const string& message, const RSAKey& priKey) {
    string hash = sha256(message);
    long long hashNum = 0;
    for (char c : hash) hashNum = (hashNum * 256 + c) % priKey.n;
    long long signature = modPow(hashNum, priKey.d, priKey.n);
    string sigHex;
    while (signature > 0) {
        sigHex = "0123456789abcdef"[signature % 16] + sigHex;
        signature /= 16;
    }
    return sigHex;
}

bool rsaVerify(const string& message, const string& signature, const RSAKey& pubKey) {
    string hash = sha256(message);
    long long hashNum = 0;
    for (char c : hash) hashNum = (hashNum * 256 + c) % pubKey.n;
    long long sigNum = 0;
    for (char c : signature) {
        if (c >= '0' && c <= '9') sigNum = sigNum * 16 + (c - '0');
        else sigNum = sigNum * 16 + (c - 'a' + 10);
    }
    long long decryptedHash = modPow(sigNum, pubKey.e, pubKey.n);
    return hashNum == decryptedHash;
}
```

### DSA（Digital Signature Algorithm）

```cpp
struct DSAKey {
    long long p, q, g;
    long long y, x;
};

long long hashMessage(const string& msg) {
    string hash = sha256(msg);
    long long mHash = 0;
    for (char c : hash) mHash = (mHash * 256 + c) % 1000000007;
    return mHash;
}

long long modInverse(long long a, long long m) {
    long long x, y;
    long long g = gcdExtended(a, m, x, y);
    if (g != 1) return -1;
    return (x % m + m) % m;
}

pair<long long, long long> dsaSign(const string& message, const DSAKey& key) {
    long long mHash = hashMessage(message);
    long long k;
    do {
        k = rand() % (key.q - 2) + 1;
    } while (gcd(k, key.q) != 1);
    long long r = modPow(key.g, k, key.p) % key.q;
    long long s = (modInverse(k, key.q) * (mHash + key.x * r)) % key.q;
    return {r, s};
}

bool dsaVerify(const string& message, long long r, long long s, const DSAKey& key) {
    if (r <= 0 || r >= key.q || s <= 0 || s >= key.q) return false;
    long long mHash = hashMessage(message);
    long long w = modInverse(s, key.q);
    long long u1 = (mHash * w) % key.q;
    long long u2 = (r * w) % key.q;
    long long v = ((modPow(key.g, u1, key.p) * modPow(key.y, u2, key.p)) % key.p) % key.q;
    return v == r;
}
```

DSA 签名具有**不可否认性**，发送者无法否认其发送的消息。

## 密钥交换协议

### Diffie-Hellman

```cpp
struct DHParams {
    long long p;
    long long g;
};

pair<long long, long long> dhKeyExchange(const DHParams& params, long long privateKey) {
    long long publicKey = modPow(params.g, privateKey, params.p);
    return {publicKey, privateKey};
}

long long dhDeriveKey(long long otherPublicKey, long long privateKey, long long p) {
    return modPow(otherPublicKey, privateKey, p);
}
```

数学原理：$g^{ab} \mod p = (g^a)^b \mod p = (g^b)^a \mod p$

安全性基于：**离散对数问题**。

### ECDH（Elliptic Curve Diffie-Hellman）

```cpp
ECCPoint ecdhDeriveKey(const ECCPoint& peerPublicKey, long long privateKey, long long a, long long p) {
    return eccMul(privateKey, peerPublicKey, a, p);
}
```

ECDH 效率高于传统 DH，在相同安全级别下需要更短的密钥。

## 实际应用中的密码学

### HTTPS的工作原理

1. 客户端发送支持的加密算法列表（ClientHello）
2. 服务器选择算法，返回证书（含公钥 ServerHello）
3. 客户端验证证书（信任链 CA -> 根证书）
4. 客户端生成随机数（PreMasterSecret），用公钥加密发送给服务器
5. 双方用 PreMasterSecret + ClientHello.random + ServerHello.random 生成主密钥
6. 后续通信使用对称加密（AES）

TLS 握手过程：
```
Client                                       Server
  |                                             |
  |--- ClientHello (cipher suites) ------------->|
  |<-- ServerHello (chosen cipher) --------------|
  |<-- Certificate (server pubkey) -------------|
  |<-- ServerKeyExchange (DH params) -----------|
  |<-- CertificateRequest (optional) -----------|
  |<-- ServerHelloDone --------------------------|
  |--- ClientKeyExchange (encrypted PMS) ------>|
  |--- CertificateVerify (if requested) -------->|
  |--- ChangeCipherSpec ------------------------>|
  |--- Finished (encrypted) ------------------->|
  |<-- ChangeCipherSpec ------------------------|
  |<-- Finished (encrypted) --------------------|
  |                                             |
  |=========== 加密数据传输 ============>>>>>>>|
```

### 密码存储

```cpp
string hashPassword(const string& password, const string& salt) {
    string combined = password + salt;
    string hash1 = sha256(combined);
    string hash2 = sha256(hash1 + salt);
    return salt + ":" + hash2;
}

bool verifyPassword(const string& password, const string& salt, const string& storedHash) {
    string combined = password + salt;
    string hash1 = sha256(combined);
    string hash2 = sha256(hash1 + salt);
    return hash2 == storedHash;
}

string bcryptHash(const string& password, int cost = 12) {
    string salt = generateRandomString(16);
    string hash = bcrypt(password, salt, cost);
    return salt + "$" + hash;
}

string pbkdf2(const string& password, const string& salt, int iterations = 100000, int keyLen = 32) {
    vector<unsigned char> dk(keyLen);
    vector<unsigned char> U(32), T;
    vector<unsigned char> S(salt.begin(), salt.end());
    for (int i = 1; i <= (keyLen + 31) / 32; i++) {
        vector<unsigned char> T_i(32, 0);
        vector<unsigned char> U_prev(salt.begin(), salt.end());
        U_prev.resize(salt.size() + 4);
        U_prev[salt.size()] = (i >> 24) & 0xff;
        U_prev[salt.size() + 1] = (i >> 16) & 0xff;
        U_prev[salt.size() + 2] = (i >> 8) & 0xff;
        U_prev[salt.size() + 3] = i & 0xff;
        for (int j = 0; j < iterations; j++) {
            U = hmacSha256_vec(password, U_prev);
            for (int k = 0; k < 32; k++) T_i[k] ^= U[k];
            U_prev = U;
        }
        T.insert(T.end(), T_i.begin(), T_i.end());
    }
    dk.assign(T.begin(), T.begin() + keyLen);
    return bytesToHex(dk);
}
```

### 安全通信示例

```cpp
class SecureChannel {
    RSAKey rsaKey;
    string sessionKey;
    AESKey aesKey;
public:
    SecureChannel(const RSAKey& rsaKey) : rsaKey(rsaKey) {}
    
    string establish(const string& serverPubKeyHex) {
        string randomKey = generateRandomString(32);
        long long pubKeyNum = hexToNumber(serverPubKeyHex);
        string encryptedKey = numberToHex(rsaEncrypt(stoll(randomKey), rsaKey));
        sessionKey = randomKey;
        return encryptedKey;
    }
    
    string send(const string& message) {
        string iv = generateRandomString(16);
        vector<byte> block(message.begin(), message.end());
        padPKCS7(block, 16);
        aesEncryptBlock(block, aesKey);
        return iv + aesEncrypt(block, sessionKey);
    }
    
    string receive(const string& data) {
        string iv = data.substr(0, 16);
        string ciphertext = data.substr(16);
        vector<byte> block = aesDecrypt(ciphertext, sessionKey);
        unpadPKCS7(block);
        return string(block.begin(), block.end());
    }
};
```

## 常见攻击

### 1. 暴力攻击（Brute Force）

- 遍历所有可能的密钥
- 防御：使用足够长的密钥（AES-256 提供 $2^{256}$ 密钥空间）
- 复杂度：$O(2^n)$，其中 $n$ 为密钥长度

### 2. 字典攻击/彩虹表

- 预计算常见密码的哈希值表
- 防御：加盐（salt）、使用慢哈希（bcrypt, Argon2）
- 彩虹表大小：$|\text{Table}| = \frac{m \cdot t}{s}$，其中 $m$ 为链长，$t$ 为链数，$s$ 为步长

### 3. 中间人攻击（MITM）

- 在通信双方之间拦截和修改消息
- 防御：使用证书认证、PKI 信任链、证书 pinning

### 4. 选择明文攻击（CPA）

- 攻击者选择明文并获取对应的密文
- 防御：使用随机IV、语义安全（IND-CPA）

### 5. 选择密文攻击（CCA）

- 攻击者选择密文并获取对应的明文
- 防御：使用认证加密（AEAD）、padding oracle 防护

### 6. 侧信道攻击

- 利用加密实现的时间、功耗、电磁辐射等信息
- 防御：恒定时间实现、掩码（masking）、抗侧信道设计

### 7. 生日攻击

- 寻找哈希碰撞，复杂度 $O(2^{n/2})$
- 防御：使用输出长度足够长的哈希函数（SHA-256 输出 256 位）

## 量子密码学威胁

量子计算机对现有公钥密码学的威胁：

| 算法 | 量子攻击复杂度 | 防御策略 |
|------|---------------|----------|
| RSA-2048 | $O(\log N)$（Shor算法） | 迁移到后量子密码学 |
| ECC-256 | $O(\log N)$（Shor算法） | 迁移到后量子密码学 |
| AES-128 | $2^{64}$（Grover算法） | 使用 AES-256 |
| SHA-256 | $2^{128}$（Grover算法） | 使用 SHA-384 |

### 后量子密码学候选算法

```cpp
struct LatticeKey {
    vector<vector<long long>> A;
    vector<long long> s;
    vector<long long> t;
};

long long modNormalize(long long x, long long q) {
    x %= q;
    if (x < 0) x += q;
    return x;
}

pair<LatticeKey, vector<long long>> latticeKeyGen(int n, int m, long long q) {
    LatticeKey key;
    key.A.resize(m, vector<long long>(n));
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            key.A[i][j] = rand() % q;
    key.s.resize(n);
    for (int i = 0; i < n; i++) key.s[i] = (rand() % q + q) % q;
    key.t.resize(m);
    for (int i = 0; i < m; i++) {
        long long sum = 0;
        for (int j = 0; j < n; j++)
            sum = (sum + key.A[i][j] * key.s[j]) % q;
        key.t[i] = sum;
    }
    vector<long long> pubKey = key.t;
    return {key, pubKey};
}

vector<long long> latticeEncrypt(const vector<long long>& msg, const vector<vector<long long>>& A, long long q) {
    int m = A.size();
    int n = A[0].size();
    vector<long long> e(m);
    for (int i = 0; i < m; i++) e[i] = (rand() % 3) - 1;
    vector<long long> c(m);
    for (int i = 0; i < m; i++) {
        c[i] = 0;
        for (int j = 0; j < n; j++)
            c[i] = (c[i] + A[i][j] * msg[j]) % q;
        c[i] = (c[i] + e[i]) % q;
    }
    return c;
}

vector<long long> latticeDecrypt(const vector<long long>& c, const LatticeKey& key, long long q) {
    int n = key.s.size();
    long long threshold = q / 4;
    vector<long long> msg(n);
    for (int i = 0; i < n; i++) {
        long long sum = 0;
        for (int j = 0; j < (int)c.size(); j++)
            sum = (sum + key.A[j][i] * c[j]) % q;
        long long diff = modNormalize(sum - key.t[i], q);
        if (diff > threshold && diff < q - threshold) msg[i] = 1;
        else if (diff > q - threshold) msg[i] = 2;
        else msg[i] = 0;
    }
    return msg;
}
```

基于 Lattice 的密码学（如 NTRU、Ring-LWE）被认为是抗量子攻击的。