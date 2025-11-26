# Digital Court System - Privacy-Preserving Legal Voting Platform

A revolutionary blockchain-powered jury decision system that enables secure, private, and transparent legal case voting using advanced Fully Homomorphic Encryption (FHE) technology and innovative Gateway callback mechanisms.

## Live Demo

Experience the future of legal technology:

**Website**: [https://digital-court-fhe.vercel.app/](https://digital-court-fhe.vercel.app/)

## Smart Contract Details

**Contract Address**: `0x6af32dc352959fDf6C19C8Cf4f128dcCe0086b51`

**Network**: Sepolia Testnet

**Blockchain Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0x6af32dc352959fDf6C19C8Cf4f128dcCe0086b51)

## Demo Video

Watch our comprehensive demonstration showcasing the complete jury voting process:

DigitalCourt.mp4

---

## Overview

Digital Court transforms traditional jury systems by leveraging blockchain technology and privacy-preserving cryptography. The platform enables legal professionals and certified jurors to participate in case deliberations with complete anonymity while maintaining the integrity and transparency that blockchain provides.

### What Makes This Different

This implementation features cutting-edge **Gateway callback pattern** architecture that solves the fundamental challenge of privacy-preserving computation on blockchain:

- **Asynchronous Decryption**: Votes remain encrypted on-chain until decryption is needed
- **Timeout Protection**: Automatic refund mechanisms prevent permanent fund locking
- **Privacy Guarantees**: Individual votes never revealed, only aggregate results
- **Gas Optimized**: Efficient HCU (Homomorphic Computing Units) usage

---

## Core Features

### Privacy-Preserving Voting

- **FHE (Fully Homomorphic Encryption)**: Industry-leading privacy technology
- **Gateway Callback Pattern**: Asynchronous decryption workflow
- **Vote Obfuscation**: Individual votes remain encrypted throughout
- **Commitment Schemes**: Cryptographic commitments prevent manipulation
- **Zero-Knowledge Tallies**: Aggregate results without revealing individual choices
- **Random Multipliers**: Division operations protected from information leakage

### Advanced Security Features

**Input Validation**
- Comprehensive parameter validation on all functions
- Length limits prevent storage bloat (title ≤ 200, description ≤ 5000 chars)
- Address validation (no zero addresses)
- Bounds checking (3-12 jurors required)

**Access Control**
- Role-based permissions (Owner, Judge, Juror)
- Modifier-based authorization checks
- Per-case juror authorization
- Certification requirements

**Overflow Protection**
- Safe arithmetic operations
- Unchecked math only where provably safe
- Batch size limits (≤ 100 jurors)
- Vote count validation

**Audit Trail**
- Comprehensive event logging
- Timestamp recording for all actions
- Immutable on-chain history
- Cryptographic proof verification

### Timeout & Refund Mechanisms

**Decryption Timeout Protection** (NEW)
- 7-day deadline for Gateway callback responses
- Automatic refund enablement on timeout
- Prevents permanent fund locking
- Handles decryption failures gracefully

**Refund Processing**
- Individual juror refund claims
- Double-refund prevention
- Event-based refund tracking
- (Production-ready for staking systems)

### Legal Case Management

- Comprehensive case creation and management
- Evidence tracking through IPFS hashes
- Automated jury selection and authorization
- Flexible voting period configuration (3-day default)
- Batch operations for gas optimization

### Court System Integration

- Judge role assignment and case oversight
- Juror certification and reputation system
- Vote casting with encrypted commitments
- Gateway-based automated verdict calculation
- Timeout-protected result revelation

### Transparent Results

- Cryptographic proof of fair vote counting
- Immutable verdict recording on blockchain
- Public audit trail for all proceedings
- Reputation-based incentive system
- Decryption status monitoring

---

## Technology Stack

- **Smart Contracts**: Solidity 0.8.28
- **Development Framework**: Hardhat 2.19.0
- **Testing Network**: Ethereum Sepolia Testnet
- **Security**: OpenZeppelin Contracts 5.0.0
  - Ownable (access control)
  - ReentrancyGuard (reentrancy protection)
- **Web3 Library**: Ethers.js 6.8.0
- **Frontend**: Next.js 14, React 18
- **Privacy Layer**: Fully Homomorphic Encryption (FHE)
- **Architecture**: Gateway Callback Pattern
- **Verification**: Etherscan API integration

---

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Ethereum wallet with Sepolia testnet ETH
- Alchemy or Infura API key (for RPC)
- Etherscan API key (for verification)

### Installation

1. **Clone and navigate to project:**
```bash
git clone <repository-url>
cd digital-court-system
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
PRIVATE_KEY=your_private_key_without_0x
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Development Workflow

#### Compile Contracts
```bash
npm run compile
```

#### Run Tests
```bash
npm test
```

#### Deploy to Sepolia
```bash
npm run deploy
```

#### Verify on Etherscan
```bash
npm run verify
```

#### Interactive Contract Interface
```bash
npm run interact
```

---

## Smart Contract Architecture

### DigitalCourt Contract

**Key Parameters:**
- Voting Duration: 3 days (259,200 seconds)
- Decryption Timeout: 7 days (604,800 seconds) **NEW**
- Minimum Jurors: 3
- Maximum Jurors: 12
- Initial Reputation: 100 points
- Vote Participation Reward: +5 reputation

**Main Functions:**

#### Admin Functions
- `certifyJuror(address)` - Certify individual juror
- `certifyJurors(address[])` - Batch certify jurors (up to 100)

#### Judge Functions
- `createCase(title, description, evidenceHash, requiredJurors)` - Create new case
- `authorizeJuror(caseId, juror)` - Authorize juror for specific case
- `authorizeJurors(caseId, jurors[])` - Batch authorize jurors
- `endVoting(caseId)` - Close voting period
- `requestDecryption(caseId)` - Request Gateway decryption **NEW**

#### Juror Functions
- `castPrivateVote(caseId, encryptedVote, commitment)` - Submit encrypted vote

#### Gateway Functions **NEW**
- `decryptionCallback(requestId, guiltyVotes, innocentVotes, proof)` - Gateway callback
- `handleDecryptionTimeout(caseId)` - Enable refunds on timeout
- `processRefund(caseId, juror)` - Claim refund for failed decryption

#### View Functions
- `getCaseInfo(caseId)` - Retrieve comprehensive case details
- `hasVoted(caseId, juror)` - Check voting status
- `isAuthorizedJuror(caseId, juror)` - Verify authorization
- `getJurorReputation(juror)` - Query reputation score
- `getCases(offset, limit)` - List all cases with pagination
- `getRevealedResults(caseId)` - Get decrypted vote counts **NEW**
- `getDecryptionStatus(caseId)` - Check decryption state **NEW**

---

## Innovative Architecture

### Gateway Callback Pattern

```
User → Submit Encrypted Request → Contract Records → Gateway Decrypts → Callback Completes
```

**Benefits:**
1. **Privacy**: Votes remain encrypted on-chain
2. **Scalability**: Offloads decryption computation
3. **Asynchronous**: Non-blocking operations
4. **Verifiable**: Cryptographic proofs validate results

### Workflow

1. **Vote Period (3 days)**: Jurors submit encrypted votes
2. **Request Decryption**: Judge requests Gateway processing
3. **Gateway Processing (up to 7 days)**: Off-chain decryption
4. **Callback**: Gateway returns decrypted results with proof
5. **Timeout Protection**: Refunds enabled if Gateway fails

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical documentation.

---

## Security Features

### Multi-Layer Security

**Privacy Protection:**
- Fully Homomorphic Encryption for vote data
- Commitment schemes prevent vote manipulation
- Random multipliers protect division operations
- Price/vote obfuscation techniques
- Temporal privacy (results hidden until reveal)

**Smart Contract Security:**
- Reentrancy protection (OpenZeppelin ReentrancyGuard)
- Access control (role-based permissions)
- Input validation (comprehensive parameter checking)
- Overflow protection (checked arithmetic)
- Timeout mechanisms (prevents permanent locks)

**Audit Trail:**
- Complete on-chain transaction history
- Cryptographic proofs for all decryptions
- Event logging for all state changes
- Immutable verdict recording

**Unique Security Innovation:**
- **Timeout-based refund mechanism**: Prevents funds from being locked forever if Gateway fails
- **Division privacy protection**: Random multipliers prevent information leakage during calculations
- **Gateway callback validation**: Cryptographic proof verification for all decrypted results

---

## Documentation

### Comprehensive Documentation Suite

- **[README.md](./README.md)** - Quick start and overview (this file)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture and design patterns **NEW**
- **[API.md](./API.md)** - Complete API reference with examples **NEW**
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide with troubleshooting
- **Inline Code Comments** - Detailed NatSpec documentation in contracts

---

## Project Structure

```
digital-court-system/
├── contracts/              # Smart contract source files
│   └── DigitalCourt.sol   # Main contract with Gateway callback pattern
├── scripts/               # Deployment and interaction scripts
│   ├── deploy.js          # Deployment script
│   ├── verify.js          # Etherscan verification
│   ├── interact.js        # Interactive CLI
│   └── simulate.js        # Full workflow simulation
├── deployments/           # Deployment artifacts (auto-generated)
│   ├── sepolia-deployment.json
│   └── sepolia-abi.json
├── pages/                 # Next.js frontend pages
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md    # Technical architecture
│   └── API.md            # API reference
├── hardhat.config.js      # Hardhat configuration
├── package.json           # Project dependencies
├── .env.example           # Environment template
└── README.md             # This file
```

---

## Available Scripts

### Hardhat Commands

```bash
npm run compile          # Compile smart contracts
npm run test            # Run test suite
npm run deploy          # Deploy to Sepolia
npm run verify          # Verify on Etherscan
npm run interact        # Interactive contract CLI
npm run simulate        # Run full workflow simulation
npm run node            # Start local Hardhat node
npm run clean           # Clean artifacts and cache
```

### Frontend Commands

```bash
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run typecheck       # Run TypeScript checks
```

---

## Deployment Information

### Network: Sepolia Testnet

- **Chain ID:** 11155111
- **Block Explorer:** https://sepolia.etherscan.io
- **RPC Endpoint:** Multiple providers available (Alchemy, Infura, Public)

### Get Testnet ETH

- Alchemy Faucet: https://sepoliafaucet.com/
- Infura Faucet: https://www.infura.io/faucet/sepolia
- QuickNode Faucet: https://faucet.quicknode.com/ethereum/sepolia

### Contract Verification

After deployment, contracts are automatically saved to `deployments/` directory with:
- Contract address
- Deployment transaction hash
- Block number and timestamp
- Network information
- Etherscan URLs
- Contract ABI

---

## Use Cases

### Criminal Cases
- Theft and property crimes
- Assault and battery cases
- Drug-related offenses
- Domestic violence proceedings

### Federal Cases
- Embezzlement and financial crimes
- Cybercrime and identity theft
- Wire fraud and deception

### Civil Cases
- Contract disputes
- Property conflicts
- Personal injury claims

### Additional Applications
- **Corporate Governance**: Private board voting
- **DAO Decision-Making**: Confidential proposals
- **Academic Peer Review**: Anonymous expert assessments
- **Arbitration**: Privacy-preserving dispute resolution

---

## Technical Innovations

### 1. Gateway Callback Pattern

**Traditional Approach**: Synchronous decryption blocks blockchain
**Our Solution**: Asynchronous Gateway processing

Benefits:
- Non-blocking operations
- Scalable decryption
- Privacy-preserving
- Gas-efficient

### 2. Enhanced Timeout Protection Mechanism

**Problem**: What if Gateway never responds?
**Solution**: 7-day timeout → automatic refund enablement with comprehensive failure tracking

Features:
- **Timeout Tracking**: Automatic state marking when deadline passes
- **Refund Enablement**: Jurors can claim refunds after timeout
- **Failure State**: `decryptionFailed` flag for audit trail
- **Event Logging**: Complete event emission for timeout scenarios

Prevents:
- Permanent fund locking
- Stuck case states
- Lost reputation points
- Silent failures without evidence

### 3. Division Privacy Protection

**Issue**: Division operations can leak information
**Solution**: Random multipliers obfuscate values

```solidity
// Random nonce updated with each decryption request
nonce = keccak256(block.timestamp, block.prevrandao, caseId)
```

### 3.5. Enhanced Gateway Callback Validation

**Innovation**: Cryptographic proof verification in callback mechanism

Enhancements:
- **Cleartexts Validation**: ABI-encoded decrypted values for proof verification
- **Proof Signature**: Cryptographic proof from Gateway oracle
- **Vote Count Consistency**: Sum must equal total jurors (prevents tampering)
- **Proof Length Validation**: Ensures Gateway provides valid cryptographic evidence
- **Event Tracking**: Emits `CallbackAttempted` events for audit trail

Benefits:
- Prevents invalid decryption results
- Detects tampering attempts
- Provides cryptographic guarantees
- Supports audit and compliance

### 4. Gas Optimization (HCU)

**HCU**: Homomorphic Computing Units
**Optimizations**:
- Batch operations (certify/authorize multiple jurors)
- Unchecked math where safe
- Storage packing (bool flags)
- Calldata for read-only arrays
- Enhanced validation without redundant checks

---

## Testing

### Comprehensive Test Coverage

The system provides complete test coverage for:

1. **Contract Deployment**: Proper initialization
2. **Juror Certification**: Single and batch operations
3. **Case Creation**: Input validation and state setup
4. **Vote Casting**: Encryption and aggregation
5. **Gateway Callback**: Decryption and reveal
6. **Timeout Handling**: Refund mechanisms
7. **Edge Cases**: Zero values, max limits, failures

Run tests:
```bash
npm test
```

### Simulation Script

Full end-to-end workflow simulation:

1. Deploy contract to local network
2. Certify 4 jurors
3. Create a legal case
4. Authorize all jurors
5. Cast encrypted votes (3 guilty, 1 innocent)
6. End voting period
7. Request decryption
8. Simulate Gateway callback
9. Verify results and reputation updates
10. Test timeout scenario

```bash
npm run simulate
```

---

## Gas Costs (Estimated)

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Create Case | ~200,000 | Includes initialization |
| Certify Juror | ~50,000 | Per juror |
| Certify Jurors (batch) | ~30,000 | Per juror (savings!) |
| Authorize Juror | ~50,000 | Per juror |
| Cast Vote | ~150,000 | Includes FHE aggregation |
| Request Decryption | ~100,000 | Generate request ID |
| Gateway Callback | ~120,000 | Update results |
| Handle Timeout | ~60,000 | Enable refunds |
| Process Refund | ~40,000 | Per juror |

**Gas Optimization Tips**:
- Use batch operations when possible
- Certify all jurors at once: `certifyJurors()`
- Authorize multiple jurors: `authorizeJurors()`

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Update documentation
6. Submit a pull request

### Development Guidelines

- Follow Solidity best practices
- Maintain comprehensive NatSpec comments
- Add tests for all new features
- Update architecture docs for major changes
- Ensure gas efficiency

---

## License

This project is licensed under the MIT License.

---

## Legal Disclaimer

This platform is designed for demonstration and educational purposes. Real legal proceedings should always follow established judicial procedures and local regulations. This system should not be used as a replacement for official legal processes without proper legal review and approval.

**Privacy Notice**: While this system implements state-of-the-art privacy-preserving technology, users should be aware that no system is 100% secure. Always consult with legal and security professionals before deploying in production environments.

---

## Support

For questions or issues:

1. Review the [Architecture Documentation](./ARCHITECTURE.md)
2. Check the [API Reference](./API.md)
3. Consult the [Deployment Guide](./DEPLOYMENT.md)
4. Review Hardhat documentation
5. Search existing GitHub issues
6. Create a new issue with detailed information

---

## Resources

### Official Documentation
- Hardhat: https://hardhat.org/docs
- Ethers.js: https://docs.ethers.org
- OpenZeppelin: https://docs.openzeppelin.com
- Solidity: https://docs.soliditylang.org

### Privacy & FHE
- Fully Homomorphic Encryption: https://en.wikipedia.org/wiki/Homomorphic_encryption
- ZAMA FHE: https://docs.zama.ai/

### Network Resources
- Sepolia Explorer: https://sepolia.etherscan.io
- Ethereum Docs: https://ethereum.org/en/developers/docs
- Chainlist: https://chainlist.org

### Tools
- Remix IDE: https://remix.ethereum.org
- Hardhat: https://hardhat.org
- MetaMask: https://metamask.io

---

## Roadmap

### Phase 1 (Current)
- ✅ Privacy-preserving voting with FHE
- ✅ Gateway callback pattern implementation
- ✅ Timeout protection and refund mechanisms
- ✅ Comprehensive documentation

### Phase 2 (Upcoming)
- [ ] Multi-signature Gateway oracle
- [ ] Zero-knowledge proof integration
- [ ] Reputation NFT system
- [ ] Appeal mechanism

### Phase 3 (Future)
- [ ] Cross-chain deployment
- [ ] DAO governance integration
- [ ] Mobile application
- [ ] AI-assisted evidence analysis

---

## Acknowledgments

- **OpenZeppelin** for battle-tested smart contract libraries
- **Hardhat** for excellent development framework
- **Ethereum Foundation** for Sepolia testnet
- **FHE Community** for privacy-preserving cryptography research

---

**Empowering Justice Through Blockchain Technology**

*Digital Court - Where Privacy Meets Transparency in Legal Decision Making*

**Version:** 2.0.0
**Last Updated:** 2025
**Network:** Ethereum Sepolia Testnet
**Architecture:** Gateway Callback Pattern with Timeout Protection
