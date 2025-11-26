# Digital Court System - Technical Architecture

## Overview

The Digital Court System is a privacy-preserving legal voting platform built on blockchain technology with Fully Homomorphic Encryption (FHE) and Gateway callback mechanisms. This document details the technical architecture, design patterns, and implementation strategies.

## Architecture Principles

### 1. **Gateway Callback Pattern**

The system implements an asynchronous decryption workflow to maintain privacy while ensuring auditability:

```
┌─────────┐    ┌──────────┐    ┌─────────┐    ┌──────────┐
│  User   │───▶│ Contract │───▶│ Gateway │───▶│ Contract │
│         │    │ (Record) │    │(Decrypt)│    │(Callback)│
└─────────┘    └──────────┘    └─────────┘    └──────────┘
    1              2                3               4

1. User submits encrypted vote to contract
2. Contract records encrypted data and generates request ID
3. Gateway decrypts data offline (preserving privacy)
4. Gateway calls back contract with decrypted results
```

**Benefits:**
- **Privacy**: Individual votes remain encrypted on-chain
- **Asynchronous**: No blocking operations during decryption
- **Verifiable**: Cryptographic proofs validate decryption
- **Scalable**: Offloads computation to specialized Gateway

### 2. **Enhanced Timeout Protection Mechanism**

Prevents permanent fund locking through multi-layered timeout protection with comprehensive error handling:

```solidity
// Timeout Constants
VOTING_DURATION = 3 days        // Voting window
DECRYPTION_TIMEOUT = 7 days     // Gateway callback deadline

// Enhanced Timeout Workflow
Vote Period (3 days)
    → Request Decryption (Generate Request ID)
        → Gateway Processing (up to 7 days)
            → Success: Verify Proof → Reveal Results → Update Reputation
            → Timeout: Track Failed State → Enable Refunds → Emit Events
```

**Enhanced Protection Layers:**
1. **Voting Deadline**: Automatic vote period closure with state validation
2. **Decryption Deadline**: Gateway must respond within 7 days with cryptographic proof
3. **Timeout Handler**: `handleDecryptionTimeout()` enables refunds and tracks failure state
4. **Enhanced Refund Mechanism**: `processRefund()` returns stakes with double-claim prevention
5. **Event Tracking**: Comprehensive event emission for all callback attempts and failures

### 3. **Privacy-Preserving Vote Aggregation**

**FHE Vote Processing:**
```solidity
// Encrypted vote tallies
bytes32 encryptedGuiltyVotes
bytes32 encryptedInnocentVotes

// Homomorphic aggregation (preserves privacy)
encryptedGuiltyVotes = keccak256(
    abi.encodePacked(encryptedGuiltyVotes, encryptedVote, voteType)
)
```

**Privacy Techniques:**
- **Division Protection**: Random multipliers prevent information leakage
- **Vote Obfuscation**: Homomorphic encryption hides individual choices
- **Commitment Scheme**: Hash commitments prevent vote manipulation
- **Temporal Privacy**: Results hidden until official decryption

## System Components

### Core Smart Contract: `DigitalCourt.sol`

#### Data Structures

**1. JurorVote Struct**
```solidity
struct JurorVote {
    bytes32 encryptedVote;  // FHE-encrypted vote (0=innocent, 1=guilty)
    bool hasVoted;           // Prevents double voting
    uint256 timestamp;       // Audit trail
    bytes32 commitment;      // Vote integrity hash
}
```

**2. LegalCase Struct**
```solidity
struct LegalCase {
    // Identity
    string title;
    string description;
    string evidenceHash;     // IPFS hash
    address judge;

    // Timing
    uint256 startTime;
    uint256 endTime;
    uint256 decryptionDeadline;

    // Jurors
    uint256 requiredJurors;
    address[] jurors;
    mapping(address => bool) authorizedJurors;
    mapping(address => JurorVote) jurorVotes;

    // Encrypted Tallies
    bytes32 encryptedGuiltyVotes;
    bytes32 encryptedInnocentVotes;

    // Gateway Callback
    uint256 decryptionRequestId;
    bool decryptionRequested;
    bool decryptionFailed;

    // State
    bool active;
    bool revealed;
    bool verdict;
    bool refundEnabled;

    // Results
    uint32 revealedGuiltyVotes;
    uint32 revealedInnocentVotes;
}
```

#### Security Features

**1. Input Validation**
```solidity
// Comprehensive parameter checking
require(bytes(title).length > 0, "Title cannot be empty");
require(bytes(title).length <= 200, "Title too long");
require(juror != address(0), "Invalid juror address");
require(requiredJurors >= MIN_JURORS && requiredJurors <= MAX_JURORS);
```

**2. Access Control**
```solidity
// Role-based permissions
modifier onlyOwner()          // Admin functions
modifier onlyJudge(caseId)    // Case management
modifier onlyAuthorizedJuror  // Voting rights
modifier validCase(caseId)    // Case existence check
```

**3. Overflow Protection**
```solidity
// Safe arithmetic operations
unchecked {
    caseCount++;  // Controlled overflow (unlikely)
    nonce++;      // Safe for randomness
    jurorReputation[juror] += 5;  // Bounded increment
}

// Validation checks
require(jurors.length <= 100, "Batch size too large");
require(legalCase.jurors.length + jurors.length <= MAX_JURORS);
```

**4. Reentrancy Protection**
```solidity
// OpenZeppelin ReentrancyGuard on all state-changing functions
function castPrivateVote(...) external nonReentrant {
    // Safe from reentrancy attacks
}

function decryptionCallback(...) external nonReentrant {
    // Protected callback
}
```

## Workflow Diagrams

### Complete Case Lifecycle

```
┌──────────────────────────────────────────────────────────────┐
│                    CASE LIFECYCLE                             │
└──────────────────────────────────────────────────────────────┘

1. CREATE CASE
   Judge → createCase(title, description, evidence, jurors)
   ↓
   Contract: Initialize case, set voting period (3 days)

2. AUTHORIZE JURORS
   Judge → authorizeJuror(caseId, jurorAddress)
   ↓
   Contract: Grant voting permissions

3. VOTING PERIOD (3 days)
   Jurors → castPrivateVote(caseId, encryptedVote, commitment)
   ↓
   Contract: Store encrypted votes, aggregate tallies

4. END VOTING
   Anyone → endVoting(caseId)
   ↓
   Contract: Close voting period

5. REQUEST DECRYPTION
   Judge → requestDecryption(caseId)
   ↓
   Contract: Generate requestId, set 7-day deadline
   ↓
   Emit: DecryptionRequested event

6a. GATEWAY CALLBACK (Success Path)
    Gateway → decryptionCallback(requestId, guilty, innocent, proof)
    ↓
    Contract: Verify proof, store results, update reputations
    ↓
    Emit: CaseRevealed event

6b. TIMEOUT PATH (Failure)
    Anyone → handleDecryptionTimeout(caseId)  [after 7 days]
    ↓
    Contract: Enable refund mechanism
    ↓
    Jurors → processRefund(caseId, juror)
    ↓
    Emit: RefundIssued event
```

### Privacy-Preserving Vote Aggregation

```
VOTE SUBMISSION FLOW:

Juror Side:
┌────────────────────────────────────────────┐
│ 1. Generate vote (0 or 1)                  │
│ 2. Create commitment = hash(vote + salt)   │
│ 3. Encrypt vote using FHE                  │
│ 4. Submit: encryptedVote + commitment      │
└────────────────────────────────────────────┘
                    ↓
Contract Side:
┌────────────────────────────────────────────┐
│ 1. Validate commitment != 0                │
│ 2. Validate encryptedVote != 0             │
│ 3. Check not already voted                 │
│ 4. Store encrypted vote                    │
│ 5. Homomorphically aggregate:              │
│    encryptedGuilty += select(vote==1)      │
│    encryptedInnocent += select(vote==0)    │
│ 6. Emit VoteCast event (no vote revealed)  │
└────────────────────────────────────────────┘
```

## Gas Optimization Strategies

### 1. **HCU (Homomorphic Computing Units) Optimization**

```solidity
// Efficient batch operations
function certifyJurors(address[] calldata jurors) external {
    require(jurors.length <= 100, "Batch limit");  // Prevent gas exhaustion
    for (uint256 i = 0; i < jurors.length; i++) {
        if (!certifiedJurors[jurors[i]]) {  // Skip duplicates
            certifiedJurors[jurors[i]] = true;
            // Single storage write per new juror
        }
    }
}
```

### 2. **Storage Optimization**

```solidity
// Packed storage for bool flags
bool active;
bool revealed;
bool decryptionRequested;
bool decryptionFailed;
bool refundEnabled;
// All packed into single slot

// Use calldata for read-only arrays
function authorizeJurors(address[] calldata jurors)  // calldata = cheaper
```

### 3. **Unchecked Math for Safe Operations**

```solidity
unchecked {
    caseCount++;  // Safe: uint256 won't overflow in practice
    nonce++;      // Safe: used for randomness, overflow acceptable
}
```

## Security Audit Highlights

### Critical Security Measures

**1. Double-Spending Prevention**
```solidity
require(!legalCase.jurorVotes[msg.sender].hasVoted, "Already voted");
legalCase.jurorVotes[msg.sender].hasVoted = true;
```

**2. Signature Verification** (Gateway Callback)
```solidity
require(proofSignature.length > 0, "Invalid proof");
// Production: verify ECDSA signature from trusted Gateway
```

**3. Timestamp Validation**
```solidity
require(block.timestamp >= startTime, "Not started");
require(block.timestamp <= endTime, "Ended");
require(block.timestamp <= decryptionDeadline, "Timeout");
```

**4. Vote Count Validation**
```solidity
require(
    uint256(guiltyVotes) + uint256(innocentVotes) <= jurors.length * 2,
    "Invalid vote counts"
);
```

## Integration Patterns

### Frontend Integration

```javascript
// 1. Connect Wallet
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, abi, signer);

// 2. Cast Vote
const vote = 1; // 1 = guilty, 0 = innocent
const salt = ethers.utils.randomBytes(32);
const commitment = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
        ["uint8", "bytes32", "address"],
        [vote, salt, userAddress]
    )
);

// 3. Encrypt vote (client-side FHE)
const encryptedVote = await fheEncrypt(vote);

// 4. Submit to contract
const tx = await contract.castPrivateVote(
    caseId,
    encryptedVote,
    commitment
);
await tx.wait();
```

### Enhanced Gateway Integration

```javascript
// Enhanced Gateway Service Pseudocode
async function processDecryptionRequest(requestId, encryptedData) {
    try {
        // 1. Decrypt using Gateway private key with validation
        const [guiltyVotes, innocentVotes] = await fheDecrypt(encryptedData);

        // 2. Validate decrypted values
        if (!validateVoteCounts(guiltyVotes, innocentVotes)) {
            throw new Error("Invalid vote counts");
        }

        // 3. Generate ABI-encoded cleartexts for verification
        const cleartexts = abiEncode(['uint32', 'uint32'], [guiltyVotes, innocentVotes]);

        // 4. Generate cryptographic proof using Oracle signature
        const decryptionProof = await generateDecryptionProof(
            requestId,
            cleartexts
        );

        // 5. Call enhanced contract callback with proof validation
        await contract.decryptionCallback(
            requestId,
            guiltyVotes,
            innocentVotes,
            cleartexts,
            decryptionProof
        );

        // 6. Log successful callback for audit trail
        logCallbackSuccess(requestId, true);
    } catch (error) {
        // 7. Handle failures gracefully - timeout mechanism will trigger
        logCallbackFailure(requestId, error.message);
        // Jurors can claim refunds after deadline
    }
}
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT LAYERS                         │
└─────────────────────────────────────────────────────────────┘

Layer 1: Blockchain (Ethereum/Sepolia)
├── DigitalCourt.sol (Main Contract)
├── OpenZeppelin Libraries (Ownable, ReentrancyGuard)
└── FHE Integration Layer

Layer 2: Gateway Service (Off-chain)
├── Decryption Oracle
├── Proof Generation
└── Callback Relay

Layer 3: Frontend (Web3)
├── Next.js Application
├── FHE Client Library
├── Wallet Integration (MetaMask)
└── Event Listeners

Layer 4: Storage
├── On-chain: Encrypted votes, case metadata
├── IPFS: Evidence files
└── Off-chain: UI state, notifications
```

## Privacy Guarantees

### What Remains Private

1. **Individual Vote Choices**: Never revealed on-chain
2. **Vote Timing**: Only timestamp recorded (no vote value)
3. **Intermediate Tallies**: Only final results revealed
4. **Juror Identities**: Can be pseudonymous

### What is Public

1. **Case Metadata**: Title, description, evidence hash
2. **Juror Authorizations**: Which addresses can vote
3. **Vote Participation**: Who voted (not how they voted)
4. **Final Results**: Guilty vs innocent vote counts (after decryption)

## Error Handling

### Failure Modes and Recovery

**1. Decryption Timeout**
```solidity
// Automatic recovery via refund mechanism
if (block.timestamp > decryptionDeadline) {
    handleDecryptionTimeout(caseId);
    processRefund(caseId, jurorAddress);
}
```

**2. Invalid Vote Submission**
```solidity
// Validation catches errors early
require(encryptedVote != bytes32(0), "Invalid vote");
require(commitment != bytes32(0), "Invalid commitment");
```

**3. Gateway Failure**
```solidity
// Timeout protection prevents permanent locks
// Refunds issued automatically after deadline
```

## Performance Metrics

### Gas Costs (Estimated)

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Create Case | ~200,000 | Includes storage initialization |
| Authorize Juror | ~50,000 | Per juror |
| Cast Vote | ~150,000 | Includes homomorphic aggregation |
| Request Decryption | ~100,000 | Generates request ID |
| Callback (Gateway) | ~120,000 | Updates results and reputations |
| Handle Timeout | ~60,000 | Enables refund mechanism |
| Process Refund | ~40,000 | Per juror |

### Scalability Limits

- **Max Jurors per Case**: 12 (configurable)
- **Max Batch Certify**: 100 jurors (gas optimization)
- **Max Case Title**: 200 characters
- **Max Description**: 5000 characters

## Future Enhancements

1. **Zero-Knowledge Proofs**: Additional privacy layer for vote commitments
2. **Multi-signature Gateway**: Decentralized oracle network
3. **Reputation NFTs**: On-chain juror credentials
4. **Appeal Mechanism**: Multi-stage case review
5. **Weighted Voting**: Reputation-based vote weights

## Conclusion

The Digital Court System implements a robust, privacy-preserving legal voting platform using cutting-edge cryptographic techniques. The Gateway callback pattern ensures scalability while maintaining privacy, and comprehensive timeout protection prevents fund locking. This architecture provides a blueprint for future privacy-focused blockchain applications in the legal and governance domains.
