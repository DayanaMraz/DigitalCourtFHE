const fs = require("fs");
const path = require("path");

console.log("=".repeat(60));
console.log("Gas Optimization Analyzer");
console.log("=".repeat(60));

const contractPath = path.join(__dirname, "..", "contracts", "DigitalCourt.sol");

if (!fs.existsSync(contractPath)) {
  console.error("❌ Contract file not found");
  process.exit(1);
}

const contractContent = fs.readFileSync(contractPath, "utf8");

console.log("\n📊 Analyzing contract for gas optimization opportunities...\n");

let optimizationCount = 0;

// Check 1: State Variable Packing
console.log("1. State Variable Packing:");
const stateVars = contractContent.match(/uint256\s+public\s+\w+/g);
if (stateVars && stateVars.length > 0) {
  console.log(`   ℹ️  Found ${stateVars.length} uint256 state variables`);
  console.log("   💡 Consider using smaller types (uint8, uint16, uint32) where possible");
  console.log("   💡 Group smaller types together for storage packing");
  optimizationCount++;
}

// Check 2: Constant and Immutable Variables
console.log("\n2. Constant/Immutable Usage:");
const publicConstants = contractContent.match(/uint256\s+public\s+constant/g);
if (publicConstants) {
  console.log(`   ✅ Found ${publicConstants.length} constant variables`);
} else {
  console.log("   ⚠️  No constant variables found - consider marking unchanging values as constant");
  optimizationCount++;
}

// Check 3: Memory vs Storage
console.log("\n3. Memory vs Storage Usage:");
const memoryUsage = contractContent.match(/memory/g);
const storageUsage = contractContent.match(/storage/g);
if (memoryUsage) {
  console.log(`   ✅ Memory keyword used ${memoryUsage.length} times`);
}
if (storageUsage) {
  console.log(`   ℹ️  Storage keyword used ${storageUsage.length} times`);
  console.log("   💡 Verify storage is necessary - memory is cheaper for temporary data");
}

// Check 4: Loop Optimizations
console.log("\n4. Loop Optimizations:");
const forLoops = contractContent.match(/for\s*\([^)]*\)/g);
if (forLoops) {
  console.log(`   ℹ️  Found ${forLoops.length} for loops`);
  forLoops.forEach((loop, i) => {
    if (loop.includes(".length")) {
      console.log(`   💡 Loop ${i + 1}: Cache array length before loop`);
      optimizationCount++;
    }
    if (loop.includes("i++")) {
      console.log(`   💡 Loop ${i + 1}: Use unchecked{++i} for gas savings`);
      optimizationCount++;
    }
  });
}

// Check 5: External vs Public Functions
console.log("\n5. Function Visibility:");
const publicFunctions = contractContent.match(/function\s+\w+\([^)]*\)\s+external/g);
const externalFunctions = contractContent.match(/function\s+\w+\([^)]*\)\s+public/g);
if (publicFunctions) {
  console.log(`   ✅ External functions: ${publicFunctions.length}`);
}
if (externalFunctions) {
  console.log(`   ℹ️  Public functions: ${externalFunctions.length}`);
  console.log("   💡 Use 'external' instead of 'public' if not called internally");
  optimizationCount++;
}

// Check 6: String Usage
console.log("\n6. String Usage:");
const stringVars = contractContent.match(/string\s+(memory|storage)/g);
if (stringVars && stringVars.length > 5) {
  console.log(`   ⚠️  Heavy string usage detected (${stringVars.length} instances)`);
  console.log("   💡 Consider using bytes32 for fixed-length strings");
  console.log("   💡 Store large strings off-chain (IPFS) and reference by hash");
  optimizationCount++;
}

// Check 7: Event Usage
console.log("\n7. Event Emissions:");
const events = contractContent.match(/emit\s+\w+/g);
if (events) {
  console.log(`   ✅ Found ${events.length} event emissions`);
  console.log("   ℹ️  Events are cheaper than storage for logging");
}

// Check 8: Mapping vs Array
console.log("\n8. Data Structure Usage:");
const mappings = contractContent.match(/mapping\(/g);
const arrays = contractContent.match(/\[\]\s+(public|private|internal)/g);
if (mappings) {
  console.log(`   ✅ Mappings used: ${mappings.length} (efficient for lookups)`);
}
if (arrays && arrays.length > 3) {
  console.log(`   ℹ️  Arrays used: ${arrays.length}`);
  console.log("   💡 Verify arrays don't grow unbounded (DoS risk)");
  optimizationCount++;
}

// Check 9: Require Messages
console.log("\n9. Error Messages:");
const requireStatements = contractContent.match(/require\([^,)]+,\s*"[^"]+"/g);
if (requireStatements) {
  const longMessages = requireStatements.filter(r => {
    const match = r.match(/"([^"]+)"/);
    return match && match[1].length > 32;
  });
  if (longMessages.length > 0) {
    console.log(`   ⚠️  ${longMessages.length} require statements with long messages`);
    console.log("   💡 Keep error messages under 32 characters or use custom errors");
    optimizationCount++;
  } else {
    console.log(`   ✅ Error messages are reasonably sized`);
  }
}

// Check 10: Custom Errors (Solidity 0.8.4+)
console.log("\n10. Custom Errors:");
if (contractContent.includes("error ")) {
  console.log("   ✅ Custom errors defined (more gas efficient)");
} else {
  console.log("   💡 Consider using custom errors instead of require strings");
  console.log("   💡 Custom errors save ~50 gas per revert");
  optimizationCount++;
}

// Check 11: Unchecked Math
console.log("\n11. Unchecked Arithmetic:");
if (contractContent.includes("unchecked")) {
  console.log("   ✅ Unchecked blocks used for gas optimization");
} else {
  console.log("   💡 Use unchecked{} for safe arithmetic operations");
  console.log("   💡 Example: Loop counters, balances that can't overflow");
  optimizationCount++;
}

// Check 12: calldata vs memory
console.log("\n12. Calldata vs Memory:");
const calldataParams = contractContent.match(/calldata/g);
if (calldataParams && calldataParams.length > 0) {
  console.log(`   ✅ Calldata used ${calldataParams.length} times`);
  console.log("   ✅ Calldata is cheaper than memory for external function parameters");
} else {
  console.log("   💡 Use calldata for read-only external function parameters");
  optimizationCount++;
}

// Gas Optimization Summary
console.log("\n" + "=".repeat(60));
console.log("Gas Optimization Summary");
console.log("=".repeat(60));
console.log(`\nOptimization Opportunities Found: ${optimizationCount}`);

if (optimizationCount === 0) {
  console.log("\n✅ Excellent! Contract is well-optimized for gas usage.");
} else if (optimizationCount <= 5) {
  console.log("\n✅ Good! Minor optimizations available.");
} else if (optimizationCount <= 10) {
  console.log("\n⚠️  Moderate optimizations recommended.");
} else {
  console.log("\n⚠️  Significant gas optimization potential detected.");
}

// Best Practices Summary
console.log("\n" + "=".repeat(60));
console.log("Gas Optimization Best Practices");
console.log("=".repeat(60));
console.log(`
✅ DO:
   • Use 'calldata' for external function parameters
   • Pack state variables efficiently (uint8, uint16, uint32)
   • Mark constants with 'constant' or 'immutable'
   • Use 'external' instead of 'public' when possible
   • Cache array lengths in loops
   • Use unchecked{} for safe arithmetic
   • Use custom errors instead of require strings
   • Emit events instead of storing logs

❌ DON'T:
   • Use unbounded loops
   • Store large strings on-chain
   • Use public when external suffices
   • Forget to pack state variables
   • Use long error messages
   • Perform redundant storage reads
`);

console.log("=".repeat(60));
console.log("📚 For more: https://github.com/iskdrews/awesome-solidity-gas-optimization");
console.log("=".repeat(60) + "\n");
