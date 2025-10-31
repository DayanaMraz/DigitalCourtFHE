# Digital Court System - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying, verifying, and interacting with the Digital Court System smart contract on Ethereum Sepolia testnet.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Compilation](#compilation)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Verification](#verification)
9. [Interaction](#interaction)
10. [Network Information](#network-information)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying the Digital Court System, ensure you have:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Git**: For version control
- **Ethereum Wallet**: With private key for deployment
- **Sepolia ETH**: For deployment gas fees (get from [Sepolia Faucet](https://sepoliafaucet.com/))
- **Etherscan API Key**: For contract verification (get from [Etherscan](https://etherscan.io/apis))
- **Alchemy/Infura Account**: For RPC endpoint (optional but recommended)

---

## Environment Setup

### 1. Clone the Repository

```bash
cd D:\
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Hardhat and Hardhat Toolbox
- Ethers.js v6
- OpenZeppelin Contracts
- Verification plugins

---

## Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` and add your credentials:

```env
# Network RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-ALCHEMY-API-KEY

# Deployer Private Key (NEVER commit this!)
PRIVATE_KEY=your_private_key_here

# Etherscan API Key for verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**Security Notes:**
- Never commit `.env` file to version control
- Use a dedicated deployment wallet with limited funds
- Keep private keys secure and backed up

### 3. Verify Configuration

Check your Hardhat configuration:

```bash
npx hardhat --version
```

---

## Compilation

Compile the smart contracts:

```bash
npm run hardhat:compile
```

Or using Hardhat directly:

```bash
npx hardhat compile
```

**Expected Output:**
- Compiled contract artifacts in `artifacts/` directory
- Contract ABIs and bytecode generated
- No compilation errors

---

## Testing

### Run Local Tests

Start a local Hardhat node:

```bash
npm run hardhat:node
```

In a new terminal, run tests:

```bash
npm run hardhat:test
```

### Run Simulation

Test the complete workflow locally:

```bash
npm run hardhat:simulate
```

This will:
1. Deploy the contract locally
2. Certify jurors
3. Create a legal case
4. Authorize jurors
5. Cast private votes
6. End voting
7. Reveal results

---

## Deployment

### Deploy to Sepolia Testnet

1. **Ensure you have Sepolia ETH:**
   - Get testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
   - Minimum recommended: 0.05 ETH

2. **Run deployment script:**

```bash
npm run hardhat:deploy
```

Or:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

3. **Deployment Output:**

The script will display:
- Deployer address and balance
- Contract deployment address
- Transaction hash and block number
- Gas costs
- Contract configuration (voting duration, juror limits)
- Etherscan URL for verification

4. **Save Deployment Information:**

Deployment details are automatically saved to:
- `deployments/sepolia-deployment.json` - Full deployment info
- `deployments/sepolia-abi.json` - Contract ABI

**Example deployment.json:**
```json
{
  "network": "sepolia",
  "chainId": "11155111",
  "contractName": "DigitalCourt",
  "contractAddress": "0x1234567890123456789012345678901234567890",
  "deployer": "0xYourDeployerAddress",
  "deploymentTransaction": "0xTransactionHash",
  "blockNumber": 123456,
  "timestamp": "2025-10-30T00:00:00.000Z",
  "etherscanUrl": "https://sepolia.etherscan.io/address/0x..."
}
```

---

## Verification

Verify your deployed contract on Etherscan:

```bash
npm run hardhat:verify
```

Or:

```bash
npx hardhat run scripts/verify.js --network sepolia
```

**Verification Process:**
1. Reads deployment information
2. Waits for block confirmations
3. Submits contract source code to Etherscan
4. Verifies constructor arguments
5. Updates deployment info with verification status

**Verification URL:**
After successful verification, view your contract at:
```
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS#code
```

---

## Interaction

### Interactive CLI

Use the interactive script to interact with deployed contract:

```bash
npm run hardhat:interact
```

**Available Operations:**

1. **View Contract Information**
   - Check contract owner
   - View total cases
   - See configuration parameters

2. **Certify Jurors**
   - Add certified jurors to the system
   - Set initial reputation scores

3. **Create New Legal Case**
   - Input case details
   - Set required juror count
   - Define voting period

4. **Authorize Jurors for Case**
   - Select specific jurors for a case
   - Grant voting permissions

5. **Cast Private Vote**
   - Submit encrypted votes
   - Maintain voting privacy

6. **End Voting**
   - Close voting period
   - Prepare for result revelation

7. **Reveal Results**
   - Decrypt vote tallies
   - Announce final verdict

8. **View Case Information**
   - Check case details
   - View voting status

9. **View All Cases**
   - List all cases in system
   - See case statuses

10. **Check Juror Status**
    - View certification status
    - Check reputation scores

---

## Network Information

### Sepolia Testnet

- **Network Name:** Sepolia
- **Chain ID:** 11155111
- **Currency Symbol:** SepoliaETH
- **Block Explorer:** https://sepolia.etherscan.io
- **RPC Endpoints:**
  - Alchemy: `https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY`
  - Infura: `https://sepolia.infura.io/v3/YOUR-API-KEY`
  - Public: `https://rpc.sepolia.org`

### Getting Testnet ETH

- **Alchemy Faucet:** https://sepoliafaucet.com/
- **Infura Faucet:** https://www.infura.io/faucet/sepolia
- **QuickNode Faucet:** https://faucet.quicknode.com/ethereum/sepolia

---

## Contract Details

### Contract Address

After deployment, your contract will be available at an address like:
```
0x1234567890123456789012345678901234567890
```

### Contract Parameters

- **Voting Duration:** 3 days (259,200 seconds)
- **Minimum Jurors:** 3
- **Maximum Jurors:** 12
- **Initial Juror Reputation:** 100
- **Vote Participation Reward:** +5 reputation

### Key Functions

**Admin Functions:**
- `certifyJuror(address)` - Certify a single juror
- `certifyJurors(address[])` - Certify multiple jurors

**Judge Functions:**
- `createCase(...)` - Create new legal case
- `authorizeJuror(caseId, juror)` - Authorize juror for case
- `authorizeJurors(caseId, jurors[])` - Authorize multiple jurors
- `endVoting(caseId)` - End voting period
- `revealResults(caseId)` - Decrypt and reveal votes

**Juror Functions:**
- `castPrivateVote(caseId, vote, commitment)` - Submit encrypted vote

**View Functions:**
- `getCaseInfo(caseId)` - Get case details
- `hasVoted(caseId, juror)` - Check if juror voted
- `isAuthorizedJuror(caseId, juror)` - Check authorization
- `getJurorReputation(juror)` - Get reputation score
- `getCases(offset, limit)` - List cases with pagination

---

## Etherscan Integration

### View Contract on Etherscan

After deployment, access your contract:

```
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
```

### Available Tabs

- **Transactions:** View all contract interactions
- **Contract:** Read verified source code
- **Read Contract:** Query contract state
- **Write Contract:** Execute transactions (connect wallet)
- **Events:** View emitted events

### Reading Contract Data

1. Go to "Read Contract" tab
2. No wallet connection needed
3. Query any public/view function

### Writing to Contract

1. Go to "Write Contract" tab
2. Click "Connect to Web3"
3. Connect your wallet
4. Execute functions with proper parameters

---

## Deployment Checklist

- [ ] Install all dependencies
- [ ] Configure `.env` file with credentials
- [ ] Obtain Sepolia testnet ETH
- [ ] Compile contracts successfully
- [ ] Run local tests
- [ ] Deploy to Sepolia testnet
- [ ] Save deployment address
- [ ] Verify contract on Etherscan
- [ ] Test basic interactions
- [ ] Document contract address for frontend
- [ ] Back up deployment files

---

## Troubleshooting

### Common Issues

#### 1. Insufficient Funds Error

**Error:** "insufficient funds for gas * price + value"

**Solution:**
- Get more Sepolia ETH from faucets
- Check deployer wallet balance
- Verify correct network configuration

#### 2. Nonce Too Low/High

**Error:** "nonce too low" or "nonce too high"

**Solution:**
```bash
# Reset account nonce
npx hardhat run scripts/reset-nonce.js --network sepolia
```

#### 3. Verification Failed

**Error:** "Already Verified" or verification timeout

**Solution:**
- Contract may already be verified - check Etherscan
- Wait a few blocks and retry
- Verify Etherscan API key is correct

#### 4. RPC Connection Error

**Error:** "could not connect to RPC endpoint"

**Solution:**
- Check RPC URL in `.env`
- Verify API key is active
- Try alternative RPC endpoint
- Check internet connection

#### 5. Contract Size Too Large

**Error:** "contract code size exceeds maximum"

**Solution:**
- Already optimized with `viaIR: true`
- Consider splitting into multiple contracts if needed

### Getting Help

If you encounter issues:

1. Check the [Hardhat Documentation](https://hardhat.org/docs)
2. Review [Ethers.js Documentation](https://docs.ethers.org/)
3. Search [Ethereum Stack Exchange](https://ethereum.stackexchange.com/)
4. Check project GitHub issues

---

## Security Considerations

### Before Mainnet Deployment

- [ ] Complete professional security audit
- [ ] Conduct extensive testing on testnet
- [ ] Review all admin functions and access controls
- [ ] Test emergency pause/upgrade mechanisms
- [ ] Verify FHE encryption implementation
- [ ] Document all risks and limitations
- [ ] Implement monitoring and alerting
- [ ] Prepare incident response plan

### Best Practices

1. **Never share private keys**
2. **Use hardware wallets for mainnet**
3. **Test thoroughly on testnet first**
4. **Monitor contract activity**
5. **Keep dependencies updated**
6. **Document all deployment parameters**
7. **Back up all configuration files**
8. **Use multi-sig for contract ownership**

---

## Next Steps

After successful deployment:

1. **Frontend Integration:**
   - Update frontend with contract address
   - Configure web3 provider for Sepolia
   - Test all user flows

2. **User Testing:**
   - Invite beta testers
   - Gather feedback on UI/UX
   - Monitor gas costs

3. **Documentation:**
   - Create user guides
   - Write API documentation
   - Prepare demo materials

4. **Monitoring:**
   - Set up contract monitoring
   - Track transaction activity
   - Monitor gas usage

---

## Resources

### Official Links

- **Hardhat:** https://hardhat.org
- **Ethers.js:** https://docs.ethers.org
- **OpenZeppelin:** https://docs.openzeppelin.com
- **Ethereum:** https://ethereum.org

### Sepolia Resources

- **Sepolia Explorer:** https://sepolia.etherscan.io
- **Sepolia Faucet:** https://sepoliafaucet.com
- **Chainlist:** https://chainlist.org/?search=sepolia

### Developer Tools

- **Remix IDE:** https://remix.ethereum.org
- **Tenderly:** https://tenderly.co
- **Defender:** https://defender.openzeppelin.com

---

## Support

For questions or issues:

- Create an issue in the project repository
- Consult the project documentation
- Review existing solutions in troubleshooting section

---

**Last Updated:** October 30, 2025
**Version:** 1.0.0
**Network:** Ethereum Sepolia Testnet
