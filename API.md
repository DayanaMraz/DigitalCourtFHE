# Digital Court System - API Documentation

## Table of Contents

1. [Contract Overview](#contract-overview)
2. [Admin Functions](#admin-functions)
3. [Case Management](#case-management)
4. [Voting Functions](#voting-functions)
5. [Gateway Callback Functions](#gateway-callback-functions)
6. [Timeout & Refund Functions](#timeout--refund-functions)
7. [View Functions](#view-functions)
8. [Events](#events)
9. [Error Codes](#error-codes)
10. [Usage Examples](#usage-examples)

---

## Contract Overview

**Contract Name**: `DigitalCourt`
**Solidity Version**: `^0.8.28`
**License**: MIT

**Inheritance**:
- `Ownable` (OpenZeppelin)
- `ReentrancyGuard` (OpenZeppelin)

**Key Constants**:
```solidity
uint256 public constant VOTING_DURATION = 3 days;
uint256 public constant DECRYPTION_TIMEOUT = 7 days;
uint256 public constant MIN_JURORS = 3;
uint256 public constant MAX_JURORS = 12;
```

---

## Admin Functions

### certifyJuror

Certify a single juror to participate in cases.

```solidity
function certifyJuror(address juror) external onlyOwner
```

**Parameters**:
- `juror` (address): Address of the juror to certify

**Requirements**:
- Caller must be contract owner
- `juror` cannot be zero address
- `juror` must not already be certified

**Effects**:
- Sets `certifiedJurors[juror] = true`
- Sets initial reputation to 100
- Emits `JurorCertified` event

**Gas Cost**: ~50,000

**Example**:
```javascript
await contract.certifyJuror("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb");
```

---

### certifyJurors

Batch certify multiple jurors (gas-optimized).

```solidity
function certifyJurors(address[] calldata jurors) external onlyOwner
```

**Parameters**:
- `jurors` (address[]): Array of juror addresses to certify

**Requirements**:
- Caller must be contract owner
- Array length must be > 0 and <= 100
- Each address must be valid (not zero address)

**Effects**:
- Certifies all valid addresses
- Skips already-certified addresses
- Sets reputation to 100 for new jurors
- Emits `JurorCertified` for each new certification

**Gas Cost**: ~30,000 per juror (first-time) + ~5,000 (skip duplicate)

**Example**:
```javascript
const jurors = [
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
];
await contract.certifyJurors(jurors);
```

---

## Case Management

### createCase

Create a new legal case for jury voting.

```solidity
function createCase(
    string calldata title,
    string calldata description,
    string calldata evidenceHash,
    uint256 requiredJurors
) external returns (uint256 caseId)
```

**Parameters**:
- `title` (string): Case title (1-200 characters)
- `description` (string): Case description (1-5000 characters)
- `evidenceHash` (string): IPFS hash or evidence identifier
- `requiredJurors` (uint256): Number of jurors needed (MIN_JURORS to MAX_JURORS)

**Returns**:
- `caseId` (uint256): Unique identifier for the created case

**Requirements**:
- Title and description must not be empty
- Title length <= 200 characters
- Description length <= 5000 characters
- `requiredJurors` must be between 3 and 12

**Effects**:
- Creates new case with ID = `caseCount`
- Increments `caseCount`
- Sets voting period to 3 days from now
- Initializes case as `active`
- Emits `CaseCreated` event

**Gas Cost**: ~200,000

**Example**:
```javascript
const tx = await contract.createCase(
    "State vs. Defendant - Theft Case",
    "Defendant accused of stealing property valued at $5,000...",
    "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX",
    6  // 6 jurors required
);
const receipt = await tx.wait();
const caseId = receipt.events[0].args.caseId;
```

---

### authorizeJuror

Authorize a single juror to vote on a specific case.

```solidity
function authorizeJuror(
    uint256 caseId,
    address juror
) external validCase(caseId) onlyJudge(caseId)
```

**Parameters**:
- `caseId` (uint256): Case identifier
- `juror` (address): Juror address to authorize

**Requirements**:
- Caller must be the case judge
- Case must exist
- Juror must be certified
- Juror cannot be zero address
- Juror not already authorized for this case
- Case must not have reached max jurors

**Effects**:
- Adds juror to authorized list
- Emits `JurorAuthorized` event

**Gas Cost**: ~50,000

**Example**:
```javascript
await contract.authorizeJuror(
    0,  // caseId
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
);
```

---

### authorizeJurors

Batch authorize multiple jurors for a case.

```solidity
function authorizeJurors(
    uint256 caseId,
    address[] calldata jurors
) external validCase(caseId) onlyJudge(caseId)
```

**Parameters**:
- `caseId` (uint256): Case identifier
- `jurors` (address[]): Array of juror addresses

**Requirements**:
- Caller must be the case judge
- Array must not be empty
- Total jurors (existing + new) must not exceed `requiredJurors`
- All addresses must be certified

**Effects**:
- Authorizes all valid jurors
- Emits `JurorAuthorized` for each

**Gas Cost**: ~30,000 per juror

**Example**:
```javascript
await contract.authorizeJurors(0, [
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
]);
```

---

### endVoting

Close the voting period for a case.

```solidity
function endVoting(uint256 caseId) external validCase(caseId)
```

**Parameters**:
- `caseId` (uint256): Case identifier

**Requirements**:
- Case must be active
- One of the following must be true:
  - Voting period has ended (> 3 days)
  - Caller is the case judge
  - Required number of jurors have voted

**Effects**:
- Sets `active = false`

**Gas Cost**: ~30,000

**Example**:
```javascript
await contract.endVoting(0);
```

---

## Voting Functions

### castPrivateVote

Submit an encrypted vote for a case.

```solidity
function castPrivateVote(
    uint256 caseId,
    bytes32 encryptedVote,
    bytes32 commitment
) external validCase(caseId) votingActive(caseId) onlyAuthorizedJuror(caseId) nonReentrant
```

**Parameters**:
- `caseId` (uint256): Case identifier
- `encryptedVote` (bytes32): FHE-encrypted vote data
- `commitment` (bytes32): Hash commitment for vote integrity

**Requirements**:
- Case must exist and be active
- Current time must be within voting period
- Caller must be authorized juror for this case
- Caller must be certified juror
- Caller must not have already voted
- `encryptedVote` and `commitment` must be non-zero

**Effects**:
- Stores encrypted vote
- Adds juror to case juror list
- Updates encrypted vote tallies (homomorphically)
- Emits `VoteCast` event

**Gas Cost**: ~150,000

**Example**:
```javascript
// Client-side encryption
const vote = 1; // 1 = guilty, 0 = innocent
const salt = ethers.utils.randomBytes(32);

// Generate commitment
const commitment = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
        ["uint8", "bytes32", "address"],
        [vote, salt, jurorAddress]
    )
);

// Encrypt vote (FHE client library)
const encryptedVote = await fheEncrypt(vote);

// Submit to contract
await contract.castPrivateVote(caseId, encryptedVote, commitment);
```

---

## Gateway Callback Functions

### requestDecryption

Request Gateway to decrypt vote tallies (judge only).

```solidity
function requestDecryption(uint256 caseId)
    external
    validCase(caseId)
    onlyJudge(caseId)
    returns (uint256 requestId)
```

**Parameters**:
- `caseId` (uint256): Case identifier

**Returns**:
- `requestId` (uint256): Unique Gateway request identifier

**Requirements**:
- Caller must be the case judge
- Voting must be ended (`active = false`)
- Results not already revealed
- Decryption not already requested
- At least MIN_JURORS (3) votes cast

**Effects**:
- Generates unique `requestId`
- Sets `decryptionRequested = true`
- Sets `decryptionDeadline` to current time + 7 days
- Maps `requestId` to `caseId`
- Emits `DecryptionRequested` event

**Gas Cost**: ~100,000

**Example**:
```javascript
const tx = await contract.requestDecryption(0);
const receipt = await tx.wait();
const requestId = receipt.events[0].args.requestId;
console.log("Request ID:", requestId);
```

---

### decryptionCallback

Enhanced Gateway callback with decrypted results and cryptographic proof validation (Gateway only).

```solidity
function decryptionCallback(
    uint256 requestId,
    uint32 guiltyVotes,
    uint32 innocentVotes,
    bytes calldata cleartexts,
    bytes calldata decryptionProof
) external nonReentrant
```

**Parameters**:
- `requestId` (uint256): Gateway request identifier
- `guiltyVotes` (uint32): Decrypted guilty vote count
- `innocentVotes` (uint32): Decrypted innocent vote count
- `cleartexts` (bytes): ABI-encoded decrypted values for proof verification
- `decryptionProof` (bytes): Cryptographic proof from Gateway oracle

**Requirements**:
- `requestId` must map to valid case
- Decryption must have been requested
- Results not already revealed
- Current time <= decryption deadline
- `cleartexts` must not be empty (validation enhancement)
- `decryptionProof` must not be empty (validation enhancement)
- **Vote count sum must equal total jurors** (consistency check)

**Effects**:
- Stores decrypted vote counts
- Determines verdict (guiltyVotes > innocentVotes)
- Sets `revealed = true`
- Increments all participating juror reputations by 5
- Emits `DecryptionCallbackReceived` event
- Emits `CaseRevealed` event

**Gas Cost**: ~120,000

**Example** (Enhanced Gateway service):
```javascript
// Gateway decrypts data with validation
const { guiltyVotes, innocentVotes } = await decryptData(encryptedTallies);
if (!validateVoteCounts(guiltyVotes, innocentVotes)) throw new Error("Invalid counts");

// Generate ABI-encoded cleartexts
const cleartexts = abiEncode(['uint32', 'uint32'], [guiltyVotes, innocentVotes]);

// Generate cryptographic proof using Oracle signature
const decryptionProof = await generateDecryptionProof(requestId, cleartexts);

// Call contract with enhanced validation
await contract.decryptionCallback(
    requestId,
    guiltyVotes,
    innocentVotes,
    cleartexts,
    decryptionProof
);
```

---

## Timeout & Refund Functions

### handleDecryptionTimeout

Enable refund mechanism when Gateway fails to respond.

```solidity
function handleDecryptionTimeout(uint256 caseId)
    external
    validCase(caseId)
```

**Parameters**:
- `caseId` (uint256): Case identifier

**Requirements**:
- Decryption must have been requested
- Results not already revealed
- Current time > decryption deadline (7 days passed)
- Refund not already enabled

**Effects**:
- Sets `decryptionFailed = true`
- Sets `refundEnabled = true`
- Emits `TimeoutTriggered` event

**Gas Cost**: ~60,000

**Example**:
```javascript
// After 7 days have passed since requestDecryption
await contract.handleDecryptionTimeout(0);
```

---

### processRefund

Claim refund for a juror when decryption fails.

```solidity
function processRefund(uint256 caseId, address juror)
    external
    validCase(caseId)
    nonReentrant
```

**Parameters**:
- `caseId` (uint256): Case identifier
- `juror` (address): Juror to refund (use address(0) for msg.sender)

**Requirements**:
- Refunds must be enabled for this case
- Juror must have voted
- Juror must not have already claimed refund

**Effects**:
- Marks juror as refunded (prevents double refund)
- Emits `RefundIssued` event
- (In production: returns staked funds)

**Gas Cost**: ~40,000

**Example**:
```javascript
// Juror claims their own refund
await contract.processRefund(0, ethers.constants.AddressZero);

// Or someone processes refund for specific juror
await contract.processRefund(0, jurorAddress);
```

---

## View Functions

### getCaseInfo

Get comprehensive case information.

```solidity
function getCaseInfo(uint256 caseId)
    external
    view
    validCase(caseId)
    returns (
        string memory title,
        string memory description,
        string memory evidenceHash,
        address judge,
        uint256 startTime,
        uint256 endTime,
        uint256 requiredJurors,
        bool active,
        bool revealed,
        bool verdict,
        uint256 jurorCount,
        bool decryptionRequested,
        uint256 decryptionDeadline,
        bool refundEnabled
    )
```

**Parameters**:
- `caseId` (uint256): Case identifier

**Returns**: Complete case details (14 fields)

**Example**:
```javascript
const info = await contract.getCaseInfo(0);
console.log("Title:", info.title);
console.log("Judge:", info.judge);
console.log("Active:", info.active);
console.log("Juror Count:", info.jurorCount.toNumber());
```

---

### hasVoted

Check if a juror has voted in a case.

```solidity
function hasVoted(uint256 caseId, address juror)
    external
    view
    validCase(caseId)
    returns (bool)
```

**Parameters**:
- `caseId` (uint256): Case identifier
- `juror` (address): Juror address

**Returns**:
- `bool`: True if juror has voted

**Example**:
```javascript
const voted = await contract.hasVoted(0, jurorAddress);
console.log("Has voted:", voted);
```

---

### isAuthorizedJuror

Check if an address is authorized for a case.

```solidity
function isAuthorizedJuror(uint256 caseId, address juror)
    external
    view
    validCase(caseId)
    returns (bool)
```

**Parameters**:
- `caseId` (uint256): Case identifier
- `juror` (address): Address to check

**Returns**:
- `bool`: True if authorized

**Example**:
```javascript
const authorized = await contract.isAuthorizedJuror(0, jurorAddress);
```

---

### getJurorReputation

Get a juror's reputation score.

```solidity
function getJurorReputation(address juror)
    external
    view
    returns (uint256)
```

**Parameters**:
- `juror` (address): Juror address

**Returns**:
- `uint256`: Reputation score

**Example**:
```javascript
const reputation = await contract.getJurorReputation(jurorAddress);
console.log("Reputation:", reputation.toNumber());
```

---

### getRevealedResults

Get decrypted case results (only after reveal).

```solidity
function getRevealedResults(uint256 caseId)
    external
    view
    validCase(caseId)
    returns (
        bool verdict,
        uint256 guiltyVotes,
        uint256 innocentVotes,
        uint256 totalJurors
    )
```

**Parameters**:
- `caseId` (uint256): Case identifier

**Returns**:
- `verdict` (bool): True if guilty
- `guiltyVotes` (uint256): Number of guilty votes
- `innocentVotes` (uint256): Number of innocent votes
- `totalJurors` (uint256): Total juror count

**Requirements**:
- Results must be revealed

**Example**:
```javascript
const results = await contract.getRevealedResults(0);
console.log("Verdict:", results.verdict ? "GUILTY" : "INNOCENT");
console.log("Guilty votes:", results.guiltyVotes.toNumber());
console.log("Innocent votes:", results.innocentVotes.toNumber());
```

---

### getCases

Get paginated list of cases.

```solidity
function getCases(uint256 offset, uint256 limit)
    external
    view
    returns (
        uint256[] memory caseIds,
        string[] memory titles,
        bool[] memory activeStates,
        bool[] memory revealedStates
    )
```

**Parameters**:
- `offset` (uint256): Starting index
- `limit` (uint256): Number of cases to return

**Returns**:
- `caseIds` (uint256[]): Array of case IDs
- `titles` (string[]): Array of case titles
- `activeStates` (bool[]): Array of active flags
- `revealedStates` (bool[]): Array of revealed flags

**Example**:
```javascript
// Get first 10 cases
const cases = await contract.getCases(0, 10);
for (let i = 0; i < cases.caseIds.length; i++) {
    console.log(`Case ${cases.caseIds[i]}: ${cases.titles[i]}`);
}

// Get next 10 cases
const moreCases = await contract.getCases(10, 10);
```

---

### getDecryptionStatus

Get decryption status for a case.

```solidity
function getDecryptionStatus(uint256 caseId)
    external
    view
    validCase(caseId)
    returns (
        bool requested,
        uint256 deadline,
        bool failed,
        bool refundAvailable
    )
```

**Parameters**:
- `caseId` (uint256): Case identifier

**Returns**:
- `requested` (bool): Whether decryption was requested
- `deadline` (uint256): Decryption deadline timestamp
- `failed` (bool): Whether decryption failed
- `refundAvailable` (bool): Whether refunds are available

**Example**:
```javascript
const status = await contract.getDecryptionStatus(0);
console.log("Decryption requested:", status.requested);
console.log("Deadline:", new Date(status.deadline.toNumber() * 1000));
console.log("Failed:", status.failed);
console.log("Refunds available:", status.refundAvailable);
```

---

## Events

### CaseCreated

Emitted when a new case is created.

```solidity
event CaseCreated(
    uint256 indexed caseId,
    string title,
    address indexed judge,
    uint256 startTime,
    uint256 endTime,
    uint256 requiredJurors
);
```

### JurorAuthorized

Emitted when a juror is authorized for a case.

```solidity
event JurorAuthorized(
    uint256 indexed caseId,
    address indexed juror
);
```

### JurorCertified

Emitted when a juror is certified.

```solidity
event JurorCertified(
    address indexed juror,
    address indexed certifier
);
```

### VoteCast

Emitted when a juror casts a vote.

```solidity
event VoteCast(
    uint256 indexed caseId,
    address indexed juror,
    uint256 timestamp
);
```

### DecryptionRequested

Emitted when decryption is requested from Gateway.

```solidity
event DecryptionRequested(
    uint256 indexed caseId,
    uint256 indexed requestId,
    uint256 deadline
);
```

### DecryptionCallbackReceived

Emitted when Gateway callback is received.

```solidity
event DecryptionCallbackReceived(
    uint256 indexed caseId,
    uint256 indexed requestId,
    bool success
);
```

### CaseRevealed

Emitted when case results are revealed.

```solidity
event CaseRevealed(
    uint256 indexed caseId,
    bool verdict,
    uint256 guiltyVotes,
    uint256 innocentVotes,
    uint256 totalJurors
);
```

### RefundIssued

Emitted when a refund is processed.

```solidity
event RefundIssued(
    uint256 indexed caseId,
    address indexed juror,
    string reason
);
```

### TimeoutTriggered

Emitted when decryption timeout occurs.

```solidity
event TimeoutTriggered(
    uint256 indexed caseId,
    uint256 deadline
);
```

---

## Error Codes

### Common Errors

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `"Invalid case ID"` | Case doesn't exist | Check `caseCount` |
| `"Case not active"` | Voting period ended | Check case status |
| `"Voting not started"` | Too early | Wait until `startTime` |
| `"Voting ended"` | Too late | Check `endTime` |
| `"Not authorized juror for this case"` | Juror not authorized | Call `authorizeJuror` first |
| `"Not certified juror"` | Juror not certified | Call `certifyJuror` first |
| `"Only case judge can perform this action"` | Wrong caller | Use judge address |
| `"Already voted"` | Double vote attempt | Check `hasVoted` first |
| `"Invalid encrypted vote"` | Zero vote data | Provide valid encrypted vote |
| `"Invalid commitment"` | Zero commitment | Provide valid commitment hash |
| `"Title cannot be empty"` | Empty title | Provide title |
| `"Title too long"` | > 200 chars | Shorten title |
| `"Description too long"` | > 5000 chars | Shorten description |
| `"Invalid juror count"` | < 3 or > 12 | Use 3-12 jurors |
| `"Decryption timeout exceeded"` | > 7 days passed | Call `handleDecryptionTimeout` |
| `"Results not revealed yet"` | Premature access | Wait for Gateway callback |
| `"Refunds not enabled"` | No timeout occurred | Wait for timeout or completion |

---

## Usage Examples

### Complete Workflow Example

```javascript
const ethers = require('ethers');

// 1. Connect to contract
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, abi, signer);

// 2. Owner certifies jurors
const jurors = [
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
];
await contract.certifyJurors(jurors);

// 3. Judge creates case
const caseId = await contract.callStatic.createCase(
    "State vs. Defendant",
    "Theft case involving $5,000",
    "QmHash...",
    3
);
await contract.createCase(
    "State vs. Defendant",
    "Theft case involving $5,000",
    "QmHash...",
    3
);

// 4. Judge authorizes jurors
await contract.authorizeJurors(caseId, jurors);

// 5. Jurors vote
for (const juror of jurors) {
    const jurorSigner = provider.getSigner(juror);
    const jurorContract = contract.connect(jurorSigner);

    const vote = Math.random() > 0.5 ? 1 : 0; // Random vote
    const salt = ethers.utils.randomBytes(32);
    const commitment = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ["uint8", "bytes32", "address"],
            [vote, salt, juror]
        )
    );
    const encryptedVote = await fheEncrypt(vote);

    await jurorContract.castPrivateVote(caseId, encryptedVote, commitment);
}

// 6. End voting (after 3 days or when all jurors voted)
await contract.endVoting(caseId);

// 7. Request decryption
const requestId = await contract.callStatic.requestDecryption(caseId);
await contract.requestDecryption(caseId);

// 8. Gateway processes (off-chain)
// ... Gateway decrypts and calls decryptionCallback ...

// 9. Get results
const results = await contract.getRevealedResults(caseId);
console.log("Verdict:", results.verdict ? "GUILTY" : "INNOCENT");
```

### Monitoring Events

```javascript
// Listen for all case events
contract.on("CaseCreated", (caseId, title, judge, startTime, endTime, requiredJurors) => {
    console.log(`Case ${caseId} created: ${title}`);
});

contract.on("VoteCast", (caseId, juror, timestamp) => {
    console.log(`Vote cast in case ${caseId} by ${juror}`);
});

contract.on("DecryptionRequested", (caseId, requestId, deadline) => {
    console.log(`Decryption requested for case ${caseId}, deadline: ${new Date(deadline * 1000)}`);
});

contract.on("CaseRevealed", (caseId, verdict, guiltyVotes, innocentVotes, totalJurors) => {
    console.log(`Case ${caseId} resolved: ${verdict ? "GUILTY" : "INNOCENT"}`);
    console.log(`Votes - Guilty: ${guiltyVotes}, Innocent: ${innocentVotes}`);
});

contract.on("TimeoutTriggered", (caseId, deadline) => {
    console.log(`Timeout triggered for case ${caseId}`);
});
```

### Error Handling

```javascript
try {
    await contract.castPrivateVote(caseId, encryptedVote, commitment);
} catch (error) {
    if (error.message.includes("Already voted")) {
        console.error("You have already voted in this case");
    } else if (error.message.includes("Not authorized juror")) {
        console.error("You are not authorized to vote in this case");
    } else if (error.message.includes("Voting ended")) {
        console.error("Voting period has ended");
    } else {
        console.error("Transaction failed:", error.message);
    }
}
```

---

## Integration Checklist

- [ ] Deploy contract to testnet/mainnet
- [ ] Certify initial jurors using `certifyJurors()`
- [ ] Setup Gateway service for decryption callbacks
- [ ] Implement FHE client library for vote encryption
- [ ] Setup event listeners for real-time updates
- [ ] Implement frontend UI for case creation and voting
- [ ] Add timeout monitoring for refund handling
- [ ] Test complete workflow from creation to reveal
- [ ] Verify gas costs and optimize batch operations
- [ ] Document contract addresses and network details

---

## Support

For technical support or questions:
- Review the [Architecture Documentation](./ARCHITECTURE.md)
- Check the [Main README](./README.md)
- Examine contract source code for detailed comments
- Test on Sepolia testnet before mainnet deployment

**Contract Security**: This contract has been designed with security best practices including reentrancy protection, input validation, overflow protection, and timeout mechanisms. Always conduct a professional security audit before mainnet deployment.
