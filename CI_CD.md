# CI/CD Pipeline Documentation

## Overview

The Digital Court System uses a comprehensive CI/CD pipeline powered by GitHub Actions to ensure code quality, automated testing, and deployment readiness.

## Table of Contents

1. [Workflow Overview](#workflow-overview)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Code Quality Checks](#code-quality-checks)
4. [Automated Testing](#automated-testing)
5. [Coverage Reporting](#coverage-reporting)
6. [Setup Instructions](#setup-instructions)
7. [Workflow Triggers](#workflow-triggers)
8. [Required Secrets](#required-secrets)

---

## Workflow Overview

Our CI/CD pipeline consists of three main workflows:

1. **Main CI/CD Pipeline** (`.github/workflows/main.yml`)
   - Comprehensive build and test across multiple environments
   - Code quality checks
   - Security audits
   - Deployment verification

2. **Test Suite** (`.github/workflows/test.yml`)
   - Dedicated testing workflow
   - Coverage reporting
   - Contract size checks
   - Gas usage analysis

3. **Pull Request Checks** (`.github/workflows/pull-request.yml`)
   - Pre-merge validation
   - Code quality enforcement
   - Security scanning
   - Documentation verification

---

## GitHub Actions Workflows

### Main CI/CD Pipeline

**File:** `.github/workflows/main.yml`

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### 1. Build and Test Matrix
- **Platforms:** Ubuntu, Windows
- **Node.js versions:** 18.x, 20.x
- **Steps:**
  - Checkout repository
  - Setup Node.js with caching
  - Install dependencies
  - Run Prettier checks (Ubuntu + Node 20.x only)
  - Run ESLint (Ubuntu + Node 20.x only)
  - Run Solhint (Ubuntu + Node 20.x only)
  - Compile smart contracts
  - Execute test suite
  - Generate coverage report (Ubuntu + Node 20.x only)
  - Upload coverage to Codecov

#### 2. Security Audit
- Run `npm audit` with moderate severity threshold
- Identify vulnerable dependencies
- Continue on error (non-blocking)

#### 3. Deployment Check
- Verify all deployment scripts exist
- Validate Hardhat configuration
- Ensure project structure integrity

### Test Suite Workflow

**File:** `.github/workflows/test.yml`

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Scheduled daily at 2:00 AM UTC

**Jobs:**

#### 1. Unit Tests
- Run on Node.js 18.x and 20.x
- Compile contracts
- Execute full test suite
- Run simulation script

#### 2. Coverage Report
- Generate comprehensive coverage report
- Upload to Codecov with token
- Store coverage artifacts

#### 3. Contract Size Check
- Verify contract bytecode size
- Ensure contracts fit within deployment limits

#### 4. Gas Report
- Generate detailed gas usage analysis
- Upload gas report as artifact
- Track gas optimization opportunities

### Pull Request Workflow

**File:** `.github/workflows/pull-request.yml`

**Triggers:**
- Pull request opened, synchronized, or reopened

**Jobs:**

#### 1. Code Quality Checks
- Prettier formatting validation
- ESLint JavaScript/TypeScript linting
- Solhint Solidity linting
- Check for console.log statements in contracts

#### 2. Build and Test
- Compile contracts
- Run test suite
- Execute simulation

#### 3. Security Scan
- Run npm audit (high severity)
- Check for hardcoded secrets
- Validate security best practices

#### 4. Deployment Verification
- Test deployment scripts
- Verify environment configuration
- Validate Hardhat setup

#### 5. Documentation Check
- Ensure README.md exists
- Validate DEPLOYMENT.md presence
- Verify documentation completeness

#### 6. PR Comment
- Post automated status comment
- Summarize check results
- Provide actionable feedback

---

## Code Quality Checks

### Solhint (Solidity Linter)

**Configuration:** `.solhint.json`

**Key Rules:**
- Code complexity limit: 10
- Compiler version: >=0.8.20
- Line length: 120 characters max
- Function visibility enforcement
- Naming conventions
- Security best practices

**Ignored Files:** `.solhintignore`
- Dependencies (MockFHEVM, TFHE, FHELib)
- Build artifacts
- Test files

**Usage:**
```bash
npm run lint:sol        # Run Solhint
npm run lint:sol --fix  # Auto-fix issues
```

### ESLint (JavaScript/TypeScript Linter)

**Configuration:** `.eslintrc.json`

**Key Rules:**
- TypeScript strict mode
- Unused variables detection
- No explicit any warnings
- Console.log warnings
- Prefer const over let
- No var declarations

**Usage:**
```bash
npm run lint:ts         # Run ESLint
npm run lint:ts --fix   # Auto-fix issues
```

### Prettier (Code Formatter)

**Configuration:** `.prettierrc.json`

**Settings:**
- Print width: 120 characters
- Tab width: 2 spaces
- Semicolons: required
- Single quotes: disabled
- Trailing commas: ES5
- Solidity-specific formatting

**Usage:**
```bash
npm run prettier:check  # Check formatting
npm run prettier:write  # Format all files
npm run format          # Alias for write
```

---

## Automated Testing

### Test Framework

- **Framework:** Hardhat + Mocha + Chai
- **Location:** `test/DigitalCourt.test.js`
- **Coverage Tool:** Solidity Coverage

### Test Suites

#### 1. Deployment Tests
- Contract initialization
- Owner assignment
- Constant values verification
- Initial state validation

#### 2. Juror Certification Tests
- Single juror certification
- Batch certification
- Event emission
- Access control

#### 3. Case Creation Tests
- Valid case creation
- Input validation
- Event emission
- Case information retrieval

#### 4. Juror Authorization Tests
- Single authorization
- Batch authorization
- Access control
- Certification verification

#### 5. Voting Tests
- Vote casting
- Double-vote prevention
- Authorization checks
- Invalid vote rejection
- Commitment validation

#### 6. Vote Ending Tests
- Judge-triggered ending
- Time-based ending
- Quorum-based ending

#### 7. Results Revelation Tests
- Correct revelation
- Access control
- Reputation updates
- Event emission

#### 8. View Function Tests
- Reputation queries
- Case listing
- Information retrieval

### Running Tests

```bash
# Run all tests
npm test

# Run tests with gas reporting
npm run test:gas

# Generate coverage report
npm run coverage

# Run simulation
npm run hardhat:simulate
```

---

## Coverage Reporting

### Codecov Integration

**Setup:**
1. Sign up at [codecov.io](https://codecov.io)
2. Add repository to Codecov
3. Obtain Codecov token
4. Add `CODECOV_TOKEN` to GitHub Secrets

**Coverage Reports:**
- Generated automatically on every push/PR
- Uploaded to Codecov
- Stored as GitHub artifacts
- Available at `coverage/` directory locally

**Viewing Coverage:**
```bash
# Generate and view locally
npm run coverage
# Open coverage/index.html in browser
```

**Codecov Dashboard:**
- View at: `https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO`
- Track coverage trends
- Identify uncovered code
- Set coverage thresholds

---

## Setup Instructions

### 1. Repository Setup

```bash
# Clone repository
git clone YOUR_REPO_URL
cd digital-court-system

# Install dependencies
npm install
```

### 2. Environment Configuration

Create `.env` file from template:
```bash
cp .env.example .env
```

Add required variables:
```env
SEPOLIA_RPC_URL=your_rpc_url
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_key
COINMARKETCAP_API_KEY=your_coinmarketcap_key  # Optional for gas reporter
```

### 3. GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

- `CODECOV_TOKEN` - Codecov upload token
- `SEPOLIA_RPC_URL` - (Optional) For testnet deployments
- `PRIVATE_KEY` - (Optional) For automated deployments
- `ETHERSCAN_API_KEY` - (Optional) For verification

### 4. Local Quality Checks

Before pushing code:

```bash
# Format code
npm run format

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Check coverage
npm run coverage
```

---

## Workflow Triggers

### Automatic Triggers

**Push Events:**
```yaml
on:
  push:
    branches:
      - main
      - develop
```

**Pull Request Events:**
```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
```

**Scheduled Events:**
```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
```

### Manual Triggers

Add workflow dispatch for manual runs:

```yaml
on:
  workflow_dispatch:
```

---

## Required Secrets

### GitHub Repository Secrets

| Secret Name | Description | Required | Usage |
|------------|-------------|----------|-------|
| `CODECOV_TOKEN` | Codecov upload token | Yes | Coverage reporting |
| `SEPOLIA_RPC_URL` | Sepolia RPC endpoint | No | Testnet deployments |
| `PRIVATE_KEY` | Deployment wallet key | No | Automated deployments |
| `ETHERSCAN_API_KEY` | Etherscan verification | No | Contract verification |
| `COINMARKETCAP_API_KEY` | CoinMarketCap API | No | Gas price in USD |

### Adding Secrets

1. Go to repository **Settings**
2. Click **Secrets and variables → Actions**
3. Click **New repository secret**
4. Enter name and value
5. Click **Add secret**

---

## CI/CD Best Practices

### 1. Code Quality
- ✅ Always run linters before committing
- ✅ Format code with Prettier
- ✅ Fix all linting errors
- ✅ Maintain test coverage above 80%

### 2. Testing
- ✅ Write tests for new features
- ✅ Update tests when modifying code
- ✅ Run full test suite locally
- ✅ Check gas usage for optimizations

### 3. Pull Requests
- ✅ Ensure all checks pass
- ✅ Review CI/CD feedback
- ✅ Update documentation
- ✅ Request code review

### 4. Security
- ✅ Never commit secrets
- ✅ Use environment variables
- ✅ Run security audits
- ✅ Keep dependencies updated

---

## Troubleshooting

### Common Issues

#### 1. Linting Failures

**Issue:** ESLint or Solhint errors

**Solution:**
```bash
npm run lint:fix  # Auto-fix most issues
```

#### 2. Test Failures

**Issue:** Tests failing in CI but passing locally

**Solution:**
- Ensure consistent Node.js version
- Clear cache: `npm run hardhat:clean`
- Check for timing issues in tests
- Review GitHub Actions logs

#### 3. Coverage Upload Failures

**Issue:** Codecov upload fails

**Solution:**
- Verify `CODECOV_TOKEN` is set correctly
- Check coverage file exists: `coverage/lcov.info`
- Review Codecov status page

#### 4. Dependency Issues

**Issue:** npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Monitoring and Badges

### Status Badges

Add to README.md:

```markdown
![CI/CD](https://github.com/USERNAME/REPO/actions/workflows/main.yml/badge.svg)
![Tests](https://github.com/USERNAME/REPO/actions/workflows/test.yml/badge.svg)
![Coverage](https://codecov.io/gh/USERNAME/REPO/branch/main/graph/badge.svg)
```

### Monitoring

- **GitHub Actions:** Check workflow runs in Actions tab
- **Codecov:** Monitor coverage at codecov.io
- **Dependencies:** Use Dependabot for updates

---

## Future Enhancements

- [ ] Add deployment workflow for mainnet
- [ ] Implement automated changelog generation
- [ ] Add performance benchmarking
- [ ] Integrate Slither security analysis
- [ ] Add contract upgrade testing
- [ ] Implement staging environment
- [ ] Add Discord/Slack notifications

---

## Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Hardhat Testing](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Codecov Documentation](https://docs.codecov.com/)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)

### Tools
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Codecov Dashboard](https://codecov.io)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [Prettier Playground](https://prettier.io/playground/)

---

**Last Updated:** October 30, 2025
**Version:** 1.0.0
**Maintained by:** Development Team
