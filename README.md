# Digital Court System - Blockchain-Based Jury Decision Platform

A revolutionary blockchain-powered jury decision system that enables secure, private, and transparent legal case voting using advanced cryptographic technology.

## 🚀 Live Demo

Experience the future of legal technology:

**🌐 Website**: [https://digital-court.vercel.app/](https://digital-court.vercel.app/)

## 🔗 Smart Contract Details

**Contract Address**: `0x6af32dc352959fDf6C19C8Cf4f128dcCe0086b51`

**Network**: Sepolia Testnet

**Blockchain Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0x6af32dc352959fDf6C19C8Cf4f128dcCe0086b51)

## 🎬 Demo Video

Watch our comprehensive demonstration showcasing the complete jury voting process:

DigitalCourt.mp4

## Overview

Digital Court transforms traditional jury systems by leveraging blockchain technology and privacy-preserving cryptography. The platform enables legal professionals and certified jurors to participate in case deliberations with complete anonymity while maintaining the integrity and transparency that blockchain provides.

## Features

### Privacy-Preserving Voting
- Advanced cryptographic commitment schemes protect vote privacy
- FHE (Fully Homomorphic Encryption) implementation for secure voting
- Vote aggregation without revealing individual choices
- Complete juror anonymity throughout the process

### Legal Case Management
- Comprehensive case creation and management system
- Evidence tracking through IPFS hashes
- Automated jury selection and authorization
- Flexible voting period configuration (default: 3 days)

### Court System Integration
- Judge role assignment and case oversight
- Juror certification and reputation system
- Vote casting with encrypted commitment hashes
- Automated verdict calculation and revelation

### Transparent Results
- Cryptographic proof of fair vote counting
- Immutable verdict recording on blockchain
- Public audit trail for all proceedings
- Reputation-based incentive system

## Technology Stack

- **Smart Contracts**: Solidity 0.8.28
- **Development Framework**: Hardhat 2.19.0
- **Testing Network**: Ethereum Sepolia Testnet
- **Security**: OpenZeppelin Contracts 5.0.0
- **Web3 Library**: Ethers.js 6.8.0
- **Frontend**: Next.js 14, React 18
- **Verification**: Etherscan API integration

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
cd D:\
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
npm run hardhat:compile
```

#### Run Local Simulation
```bash
npm run hardhat:simulate
```

This simulates a complete workflow:
- Contract deployment
- Juror certification
- Case creation
- Vote casting
- Result revelation

#### Deploy to Sepolia
```bash
npm run hardhat:deploy
```

#### Verify on Etherscan
```bash
npm run hardhat:verify
```

#### Interactive Contract Interface
```bash
npm run hardhat:interact
```

## Smart Contract Architecture

### DigitalCourt Contract

**Key Parameters:**
- Voting Duration: 3 days (259,200 seconds)
- Minimum Jurors: 3
- Maximum Jurors: 12
- Initial Reputation: 100 points
- Vote Participation Reward: +5 reputation

**Main Functions:**

**Admin Functions:**
- `certifyJuror(address)` - Certify individual juror
- `certifyJurors(address[])` - Batch certify jurors

**Judge Functions:**
- `createCase(title, description, evidenceHash, requiredJurors)` - Create new case
- `authorizeJuror(caseId, juror)` - Authorize juror for specific case
- `authorizeJurors(caseId, jurors[])` - Batch authorize jurors
- `endVoting(caseId)` - Close voting period
- `revealResults(caseId)` - Decrypt and reveal final verdict

**Juror Functions:**
- `castPrivateVote(caseId, vote, commitment)` - Submit encrypted vote

**View Functions:**
- `getCaseInfo(caseId)` - Retrieve case details
- `hasVoted(caseId, juror)` - Check voting status
- `isAuthorizedJuror(caseId, juror)` - Verify authorization
- `getJurorReputation(juror)` - Query reputation score
- `getCases(offset, limit)` - List all cases with pagination

## Project Structure

```
digital-court-system/
├── contracts/              # Smart contract source files
│   ├── DigitalCourt.sol   # Main contract
│   ├── FHELib.sol         # FHE library
│   ├── TFHE.sol           # TFHE operations
│   ├── IFHEVM.sol         # FHE interface
│   └── MockFHEVM.sol      # Mock FHE for testing
├── scripts/               # Deployment and interaction scripts
│   ├── deploy.js          # Deployment script
│   ├── verify.js          # Etherscan verification
│   ├── interact.js        # Interactive CLI
│   └── simulate.js        # Full workflow simulation
├── deployments/           # Deployment artifacts (auto-generated)
│   ├── sepolia-deployment.json
│   └── sepolia-abi.json
├── pages/                 # Next.js frontend pages
├── hardhat.config.js      # Hardhat configuration
├── package.json           # Project dependencies
├── .env.example           # Environment template
├── DEPLOYMENT.md          # Comprehensive deployment guide
└── README.md             # This file
```

## Available Scripts

### Hardhat Commands

```bash
npm run hardhat:compile   # Compile smart contracts
npm run hardhat:test      # Run test suite
npm run hardhat:deploy    # Deploy to Sepolia
npm run hardhat:verify    # Verify on Etherscan
npm run hardhat:interact  # Interactive contract CLI
npm run hardhat:simulate  # Run full workflow simulation
npm run hardhat:node      # Start local Hardhat node
npm run hardhat:clean     # Clean artifacts and cache
```

### Frontend Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run typecheck        # Run TypeScript checks
```

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

## Security Features

- **Multi-layer Privacy:** Commitment schemes with FHE encryption
- **Reentrancy Protection:** OpenZeppelin ReentrancyGuard
- **Access Control:** Role-based permissions (Owner, Judge, Juror)
- **Vote Integrity:** Cryptographic commitments prevent tampering
- **Audit Trail:** Complete on-chain transaction history
- **Ownable Pattern:** Secure admin function access

## Documentation

- **README.md** - Quick start and overview (this file)
- **DEPLOYMENT.md** - Comprehensive deployment guide with troubleshooting
- **Inline Comments** - Detailed contract documentation

## Testing

The simulation script provides a complete test workflow:

1. Deploy contract to local network
2. Certify 4 jurors
3. Create a legal case
4. Authorize all jurors
5. Cast encrypted votes (3 guilty, 1 innocent)
6. End voting period
7. Reveal results
8. Verify reputation updates

Run simulation:
```bash
npm run hardhat:simulate
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Legal Disclaimer

This platform is designed for demonstration and educational purposes. Real legal proceedings should always follow established judicial procedures and local regulations. This system should not be used as a replacement for official legal processes without proper legal review and approval.

## Support

For questions or issues:

1. Check the DEPLOYMENT.md guide
2. Review Hardhat documentation
3. Search existing GitHub issues
4. Create a new issue with detailed information

## Resources

### Official Documentation
- Hardhat: https://hardhat.org/docs
- Ethers.js: https://docs.ethers.org
- OpenZeppelin: https://docs.openzeppelin.com
- Solidity: https://docs.soliditylang.org

### Network Resources
- Sepolia Explorer: https://sepolia.etherscan.io
- Ethereum Docs: https://ethereum.org/en/developers/docs
- Chainlist: https://chainlist.org

### Tools
- Remix IDE: https://remix.ethereum.org
- Hardhat: https://hardhat.org
- MetaMask: https://metamask.io

---

**Empowering Justice Through Blockchain Technology**

*Digital Court - Where Privacy Meets Transparency in Legal Decision Making*

**Version:** 1.0.0
**Last Updated:** October 30, 2025
**Network:** Ethereum Sepolia Testnet
