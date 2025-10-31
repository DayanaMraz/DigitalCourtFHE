const fs = require("fs");
const path = require("path");

console.log("=".repeat(60));
console.log("Security Audit - Automated Security Checks");
console.log("=".repeat(60));

let hasErrors = false;
let hasWarnings = false;

// Check 1: Environment File Security
console.log("\n1. Checking environment file security...");
const envExample = path.join(__dirname, "..", ".env.example");
const envFile = path.join(__dirname, "..", ".env");

if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, "utf8");

  // Check for hardcoded secrets
  if (envContent.includes("your_") || envContent.includes("YOUR_")) {
    console.log("  ⚠️  Warning: .env file may contain placeholder values");
    hasWarnings = true;
  }

  // Check for exposed private keys
  if (envContent.match(/PRIVATE_KEY=[0-9a-fA-F]{64}/)) {
    const privateKey = envContent.match(/PRIVATE_KEY=([0-9a-fA-F]{64})/)[1];
    if (privateKey !== "0".repeat(64)) {
      console.log("  ✅ Private key is configured (hidden for security)");
    }
  }
} else {
  console.log("  ⚠️  Warning: .env file not found - using defaults");
  hasWarnings = true;
}

// Check 2: Contract Security Patterns
console.log("\n2. Checking contract security patterns...");
const contractPath = path.join(__dirname, "..", "contracts", "DigitalCourt.sol");

if (fs.existsSync(contractPath)) {
  const contractContent = fs.readFileSync(contractPath, "utf8");

  // Check for ReentrancyGuard
  if (contractContent.includes("ReentrancyGuard")) {
    console.log("  ✅ ReentrancyGuard protection found");
  } else {
    console.log("  ❌ Error: No ReentrancyGuard protection found");
    hasErrors = true;
  }

  // Check for Ownable pattern
  if (contractContent.includes("Ownable")) {
    console.log("  ✅ Ownable access control found");
  } else {
    console.log("  ⚠️  Warning: No Ownable pattern found");
    hasWarnings = true;
  }

  // Check for unchecked external calls
  const uncheckedCalls = contractContent.match(/\.call\{/g);
  if (uncheckedCalls && uncheckedCalls.length > 0) {
    console.log(`  ⚠️  Warning: Found ${uncheckedCalls.length} external call(s) - verify safety`);
    hasWarnings = true;
  }

  // Check for selfdestruct
  if (contractContent.includes("selfdestruct")) {
    console.log("  ❌ Error: selfdestruct found - extremely dangerous");
    hasErrors = true;
  } else {
    console.log("  ✅ No selfdestruct calls found");
  }

  // Check for delegatecall
  if (contractContent.includes("delegatecall")) {
    console.log("  ⚠️  Warning: delegatecall found - verify proxy safety");
    hasWarnings = true;
  }

  // Check for tx.origin
  if (contractContent.includes("tx.origin")) {
    console.log("  ❌ Error: tx.origin usage found - use msg.sender instead");
    hasErrors = true;
  } else {
    console.log("  ✅ No tx.origin usage found");
  }

  // Check for block.timestamp usage (not-rely-on-time)
  const timestampUsage = contractContent.match(/block\.timestamp/g);
  if (timestampUsage && timestampUsage.length > 5) {
    console.log(`  ⚠️  Warning: Heavy block.timestamp usage (${timestampUsage.length} occurrences)`);
    hasWarnings = true;
  }
} else {
  console.log("  ❌ Error: Contract file not found");
  hasErrors = true;
}

// Check 3: Dependency Security
console.log("\n3. Checking dependency security...");
const packageJson = path.join(__dirname, "..", "package.json");

if (fs.existsSync(packageJson)) {
  const pkg = JSON.parse(fs.readFileSync(packageJson, "utf8"));

  // Check for OpenZeppelin
  if (pkg.devDependencies["@openzeppelin/contracts"]) {
    console.log("  ✅ OpenZeppelin contracts included");
  } else {
    console.log("  ⚠️  Warning: OpenZeppelin contracts not found");
    hasWarnings = true;
  }

  // Check for hardhat-verify
  if (pkg.devDependencies["@nomicfoundation/hardhat-verify"]) {
    console.log("  ✅ Contract verification tools available");
  }
}

// Check 4: Gas Limit Protection (DoS Prevention)
console.log("\n4. Checking DoS protection patterns...");
if (fs.existsSync(contractPath)) {
  const contractContent = fs.readFileSync(contractPath, "utf8");

  // Check for unbounded loops
  const forLoops = contractContent.match(/for\s*\(/g);
  if (forLoops && forLoops.length > 0) {
    console.log(`  ⚠️  Warning: Found ${forLoops.length} for loop(s) - verify gas limits`);
    hasWarnings = true;

    // Check if loops have upper bounds
    if (contractContent.includes("MAX_JURORS") || contractContent.includes("requiredJurors")) {
      console.log("  ✅ Loop bounds detected");
    }
  }

  // Check for array length limits
  if (contractContent.includes("MAX_") || contractContent.includes("MIN_")) {
    console.log("  ✅ Array/value limits defined");
  } else {
    console.log("  ⚠️  Warning: No explicit limits found - could lead to DoS");
    hasWarnings = true;
  }
}

// Check 5: Access Control
console.log("\n5. Checking access control...");
if (fs.existsSync(contractPath)) {
  const contractContent = fs.readFileSync(contractPath, "utf8");

  // Count modifiers
  const modifiers = contractContent.match(/modifier\s+\w+/g);
  if (modifiers && modifiers.length >= 3) {
    console.log(`  ✅ Found ${modifiers.length} access control modifiers`);
  } else {
    console.log("  ⚠️  Warning: Limited access control modifiers");
    hasWarnings = true;
  }

  // Check for onlyOwner pattern
  if (contractContent.includes("onlyOwner") || contractContent.includes("onlyJudge")) {
    console.log("  ✅ Role-based access control implemented");
  }
}

// Check 6: Test Coverage
console.log("\n6. Checking test coverage...");
const testDir = path.join(__dirname, "..", "test");
if (fs.existsSync(testDir)) {
  const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith(".test.js") || f.endsWith(".test.ts"));
  if (testFiles.length > 0) {
    console.log(`  ✅ Found ${testFiles.length} test file(s)`);
  } else {
    console.log("  ❌ Error: No test files found");
    hasErrors = true;
  }
} else {
  console.log("  ❌ Error: Test directory not found");
  hasErrors = true;
}

// Check 7: Hardhat Configuration Security
console.log("\n7. Checking Hardhat configuration...");
const hardhatConfig = path.join(__dirname, "..", "hardhat.config.js");
if (fs.existsSync(hardhatConfig)) {
  const configContent = fs.readFileSync(hardhatConfig, "utf8");

  // Check for optimizer
  if (configContent.includes("optimizer") && configContent.includes("enabled: true")) {
    console.log("  ✅ Solidity optimizer enabled");
  } else {
    console.log("  ⚠️  Warning: Optimizer not enabled");
    hasWarnings = true;
  }

  // Check for gas reporter
  if (configContent.includes("gasReporter")) {
    console.log("  ✅ Gas reporter configured");
  }

  // Check for environment variable usage
  if (configContent.includes("process.env") && configContent.includes("dotenv")) {
    console.log("  ✅ Environment variables properly loaded");
  }
}

// Check 8: Git Security
console.log("\n8. Checking Git security...");
const gitignore = path.join(__dirname, "..", ".gitignore");
if (fs.existsSync(gitignore)) {
  const gitignoreContent = fs.readFileSync(gitignore, "utf8");

  if (gitignoreContent.includes(".env")) {
    console.log("  ✅ .env files ignored in Git");
  } else {
    console.log("  ❌ Error: .env not in .gitignore");
    hasErrors = true;
  }

  if (gitignoreContent.includes("*.key") || gitignoreContent.includes("*.pem")) {
    console.log("  ✅ Private keys ignored in Git");
  }
}

// Summary
console.log("\n" + "=".repeat(60));
console.log("Security Audit Summary");
console.log("=".repeat(60));

if (hasErrors) {
  console.log("\n❌ FAILED: Critical security issues found");
  console.log("Please fix the errors above before committing.");
  process.exit(1);
} else if (hasWarnings) {
  console.log("\n⚠️  WARNINGS: Some security concerns detected");
  console.log("Review warnings above and consider improvements.");
  console.log("✅ No critical issues - proceeding...");
} else {
  console.log("\n✅ PASSED: All security checks passed");
}

console.log("\n" + "=".repeat(60) + "\n");
