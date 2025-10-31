const hre = require("hardhat");

console.log("=".repeat(60));
console.log("Performance Testing Suite");
console.log("=".repeat(60));

async function main() {
  const startTime = Date.now();

  // Deploy contract
  console.log("\n1. Deploying contract for performance testing...");
  const DigitalCourt = await hre.ethers.getContractFactory("DigitalCourt");
  const deployStart = Date.now();
  const digitalCourt = await DigitalCourt.deploy();
  await digitalCourt.waitForDeployment();
  const deployTime = Date.now() - deployStart;
  console.log(`   ✓ Deployment time: ${deployTime}ms`);

  const [owner, judge, ...jurors] = await hre.ethers.getSigners();

  // Performance Test 1: Batch Juror Certification
  console.log("\n2. Testing batch juror certification performance...");
  const certifyStart = Date.now();
  const jurorAddresses = jurors.slice(0, 10).map(j => j.address);
  const certifyTx = await digitalCourt.certifyJurors(jurorAddresses);
  await certifyTx.wait();
  const certifyTime = Date.now() - certifyStart;
  console.log(`   ✓ Certified ${jurorAddresses.length} jurors in ${certifyTime}ms`);
  console.log(`   ✓ Average: ${(certifyTime / jurorAddresses.length).toFixed(2)}ms per juror`);

  // Performance Test 2: Case Creation
  console.log("\n3. Testing case creation performance...");
  const createStart = Date.now();
  const tx = await digitalCourt.connect(judge).createCase(
    "Performance Test Case",
    "Testing case creation performance with moderately long description text",
    "QmPerformanceTestHash123456789",
    5
  );
  await tx.wait();
  const createTime = Date.now() - createStart;
  console.log(`   ✓ Case created in ${createTime}ms`);

  // Performance Test 3: Batch Authorization
  console.log("\n4. Testing batch authorization performance...");
  const authStart = Date.now();
  const authTx = await digitalCourt.connect(judge).authorizeJurors(0, jurorAddresses.slice(0, 5));
  await authTx.wait();
  const authTime = Date.now() - authStart;
  console.log(`   ✓ Authorized 5 jurors in ${authTime}ms`);
  console.log(`   ✓ Average: ${(authTime / 5).toFixed(2)}ms per authorization`);

  // Performance Test 4: Voting Performance
  console.log("\n5. Testing voting performance...");
  const voteStart = Date.now();
  const votePromises = [];

  for (let i = 0; i < 5; i++) {
    const commitment = hre.ethers.id(`vote-${i}-${Date.now()}`);
    const voteTx = digitalCourt.connect(jurors[i]).castPrivateVote(0, i % 2, commitment);
    votePromises.push(voteTx);
  }

  await Promise.all(votePromises.map(p => p.then(tx => tx.wait())));
  const voteTime = Date.now() - voteStart;
  console.log(`   ✓ 5 votes cast in ${voteTime}ms`);
  console.log(`   ✓ Average: ${(voteTime / 5).toFixed(2)}ms per vote`);

  // Performance Test 5: Result Revelation
  console.log("\n6. Testing result revelation performance...");
  await digitalCourt.connect(judge).endVoting(0);
  const revealStart = Date.now();
  const revealTx = await digitalCourt.connect(judge).revealResults(0);
  await revealTx.wait();
  const revealTime = Date.now() - revealStart;
  console.log(`   ✓ Results revealed in ${revealTime}ms`);

  // Performance Test 6: View Function Performance
  console.log("\n7. Testing view function performance...");
  const viewStart = Date.now();
  await digitalCourt.getCaseInfo(0);
  await digitalCourt.getJurorReputation(jurors[0].address);
  await digitalCourt.hasVoted(0, jurors[0].address);
  await digitalCourt.isAuthorizedJuror(0, jurors[0].address);
  const viewTime = Date.now() - viewStart;
  console.log(`   ✓ 4 view functions called in ${viewTime}ms`);

  // Gas Usage Analysis
  console.log("\n8. Gas Usage Analysis...");
  const receipt = await hre.ethers.provider.getTransactionReceipt(tx.hash);
  console.log(`   ✓ Case creation gas used: ${receipt.gasUsed.toString()}`);

  // Calculate total test time
  const totalTime = Date.now() - startTime;

  // Performance Summary
  console.log("\n" + "=".repeat(60));
  console.log("Performance Summary");
  console.log("=".repeat(60));
  console.log(`\nTotal Test Time: ${totalTime}ms`);
  console.log(`\nBreakdown:`);
  console.log(`  - Contract Deployment: ${deployTime}ms (${((deployTime / totalTime) * 100).toFixed(1)}%)`);
  console.log(`  - Juror Certification: ${certifyTime}ms (${((certifyTime / totalTime) * 100).toFixed(1)}%)`);
  console.log(`  - Case Creation: ${createTime}ms (${((createTime / totalTime) * 100).toFixed(1)}%)`);
  console.log(`  - Authorization: ${authTime}ms (${((authTime / totalTime) * 100).toFixed(1)}%)`);
  console.log(`  - Voting: ${voteTime}ms (${((voteTime / totalTime) * 100).toFixed(1)}%)`);
  console.log(`  - Result Revelation: ${revealTime}ms (${((revealTime / totalTime) * 100).toFixed(1)}%)`);
  console.log(`  - View Functions: ${viewTime}ms (${((viewTime / totalTime) * 100).toFixed(1)}%)`);

  // Performance Recommendations
  console.log("\n" + "=".repeat(60));
  console.log("Performance Recommendations");
  console.log("=".repeat(60));

  if (certifyTime / jurorAddresses.length > 100) {
    console.log("⚠️  Juror certification could be optimized");
  } else {
    console.log("✅ Juror certification performance is good");
  }

  if (voteTime / 5 > 200) {
    console.log("⚠️  Voting performance could be improved");
  } else {
    console.log("✅ Voting performance is acceptable");
  }

  if (createTime > 500) {
    console.log("⚠️  Case creation time is high");
  } else {
    console.log("✅ Case creation performance is good");
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Performance tests completed successfully!");
  console.log("=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Performance tests failed:");
    console.error(error);
    process.exit(1);
  });
