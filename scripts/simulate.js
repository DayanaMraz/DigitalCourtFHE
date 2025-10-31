const hre = require("hardhat");

async function main() {
  console.log("=".repeat(60));
  console.log("Digital Court System - Full Workflow Simulation");
  console.log("=".repeat(60));

  const network = hre.network.name;
  console.log(`\nNetwork: ${network}`);

  // Get signers
  const [owner, judge, juror1, juror2, juror3, juror4] = await hre.ethers.getSigners();

  console.log("\nSimulation Accounts:");
  console.log(`  Owner:  ${owner.address}`);
  console.log(`  Judge:  ${judge.address}`);
  console.log(`  Juror1: ${juror1.address}`);
  console.log(`  Juror2: ${juror2.address}`);
  console.log(`  Juror3: ${juror3.address}`);
  console.log(`  Juror4: ${juror4.address}`);

  // Step 1: Deploy Contract
  console.log("\n" + "=".repeat(60));
  console.log("Step 1: Deploying DigitalCourt Contract");
  console.log("=".repeat(60));

  const DigitalCourt = await hre.ethers.getContractFactory("DigitalCourt");
  const digitalCourt = await DigitalCourt.deploy();
  await digitalCourt.waitForDeployment();

  const contractAddress = await digitalCourt.getAddress();
  console.log(`\n✓ Contract deployed at: ${contractAddress}`);

  // Step 2: Certify Jurors
  console.log("\n" + "=".repeat(60));
  console.log("Step 2: Certifying Jurors");
  console.log("=".repeat(60));

  const jurorAddresses = [juror1.address, juror2.address, juror3.address, juror4.address];
  console.log(`\nCertifying ${jurorAddresses.length} jurors...`);

  const certifyTx = await digitalCourt.connect(owner).certifyJurors(jurorAddresses);
  await certifyTx.wait();
  console.log("✓ Jurors certified");

  for (let i = 0; i < jurorAddresses.length; i++) {
    const reputation = await digitalCourt.jurorReputation(jurorAddresses[i]);
    console.log(`  Juror ${i + 1}: Reputation = ${reputation.toString()}`);
  }

  // Step 3: Create Legal Case
  console.log("\n" + "=".repeat(60));
  console.log("Step 3: Creating Legal Case");
  console.log("=".repeat(60));

  const caseTitle = "State vs. Digital Fraud Suspect";
  const caseDescription = "Suspected of conducting fraudulent cryptocurrency transactions and identity theft";
  const evidenceHash = "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX";
  const requiredJurors = 4;

  console.log(`\nCase Details:`);
  console.log(`  Title: ${caseTitle}`);
  console.log(`  Description: ${caseDescription}`);
  console.log(`  Evidence Hash: ${evidenceHash}`);
  console.log(`  Required Jurors: ${requiredJurors}`);

  const createCaseTx = await digitalCourt.connect(judge).createCase(
    caseTitle,
    caseDescription,
    evidenceHash,
    requiredJurors
  );

  const createReceipt = await createCaseTx.wait();
  const createEvent = createReceipt.logs.find(log => {
    try {
      return digitalCourt.interface.parseLog(log).name === "CaseCreated";
    } catch {
      return false;
    }
  });

  const caseId = createEvent ? digitalCourt.interface.parseLog(createEvent).args.caseId : 0n;
  console.log(`\n✓ Case created with ID: ${caseId.toString()}`);

  // Step 4: Authorize Jurors
  console.log("\n" + "=".repeat(60));
  console.log("Step 4: Authorizing Jurors for Case");
  console.log("=".repeat(60));

  console.log(`\nAuthorizing ${jurorAddresses.length} jurors for case ${caseId}...`);
  const authorizeTx = await digitalCourt.connect(judge).authorizeJurors(caseId, jurorAddresses);
  await authorizeTx.wait();
  console.log("✓ Jurors authorized");

  // Step 5: Cast Votes
  console.log("\n" + "=".repeat(60));
  console.log("Step 5: Jurors Casting Private Votes");
  console.log("=".repeat(60));

  const votes = [1, 1, 0, 1]; // 3 guilty, 1 innocent
  const jurors = [juror1, juror2, juror3, juror4];

  console.log("\nVoting in progress...");
  for (let i = 0; i < jurors.length; i++) {
    const commitment = hre.ethers.id(`vote-${caseId}-${jurors[i].address}-${Date.now()}-${i}`);

    console.log(`\n  Juror ${i + 1} (${jurors[i].address}):`);
    console.log(`    Vote: ${votes[i] === 1 ? "GUILTY" : "INNOCENT"} (encrypted)`);

    const voteTx = await digitalCourt.connect(jurors[i]).castPrivateVote(
      caseId,
      votes[i],
      commitment
    );
    await voteTx.wait();
    console.log(`    ✓ Vote recorded`);

    // Verify vote was recorded
    const hasVoted = await digitalCourt.hasVoted(caseId, jurors[i].address);
    console.log(`    Verified: ${hasVoted}`);
  }

  // Step 6: Check Case Status
  console.log("\n" + "=".repeat(60));
  console.log("Step 6: Checking Case Status");
  console.log("=".repeat(60));

  const caseInfo = await digitalCourt.getCaseInfo(caseId);
  console.log("\nCurrent Case Status:");
  console.log(`  Title: ${caseInfo.title}`);
  console.log(`  Judge: ${caseInfo.judge}`);
  console.log(`  Required Jurors: ${caseInfo.requiredJurors.toString()}`);
  console.log(`  Current Juror Count: ${caseInfo.jurorCount.toString()}`);
  console.log(`  Active: ${caseInfo.active}`);
  console.log(`  Revealed: ${caseInfo.revealed}`);

  // Step 7: End Voting
  console.log("\n" + "=".repeat(60));
  console.log("Step 7: Ending Voting Period");
  console.log("=".repeat(60));

  console.log("\nEnding voting...");
  const endVotingTx = await digitalCourt.connect(judge).endVoting(caseId);
  await endVotingTx.wait();
  console.log("✓ Voting period ended");

  // Step 8: Reveal Results
  console.log("\n" + "=".repeat(60));
  console.log("Step 8: Revealing Vote Results");
  console.log("=".repeat(60));

  console.log("\nRevealing encrypted votes...");
  const revealTx = await digitalCourt.connect(judge).revealResults(caseId);
  const revealReceipt = await revealTx.wait();

  const revealEvent = revealReceipt.logs.find(log => {
    try {
      return digitalCourt.interface.parseLog(log).name === "CaseRevealed";
    } catch {
      return false;
    }
  });

  if (revealEvent) {
    const parsedEvent = digitalCourt.interface.parseLog(revealEvent);
    console.log("\n" + "=".repeat(60));
    console.log("FINAL VERDICT");
    console.log("=".repeat(60));
    console.log(`\nCase: ${caseTitle}`);
    console.log(`\nVoting Results:`);
    console.log(`  Guilty Votes: ${parsedEvent.args.guiltyVotes.toString()}`);
    console.log(`  Innocent Votes: ${parsedEvent.args.innocentVotes.toString()}`);
    console.log(`  Total Jurors: ${parsedEvent.args.totalJurors.toString()}`);
    console.log(`\nFinal Verdict: ${parsedEvent.args.verdict ? "GUILTY ⚖️" : "INNOCENT ✓"}`);
  }

  // Step 9: Check Updated Juror Reputations
  console.log("\n" + "=".repeat(60));
  console.log("Step 9: Updated Juror Reputations");
  console.log("=".repeat(60));

  console.log("\nJuror reputation scores after case completion:");
  for (let i = 0; i < jurorAddresses.length; i++) {
    const reputation = await digitalCourt.jurorReputation(jurorAddresses[i]);
    console.log(`  Juror ${i + 1}: ${reputation.toString()} (+5 for participation)`);
  }

  // Step 10: Summary
  console.log("\n" + "=".repeat(60));
  console.log("Simulation Summary");
  console.log("=".repeat(60));

  const totalCases = await digitalCourt.caseCount();
  console.log(`\nTotal Cases in System: ${totalCases.toString()}`);
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: ${network}`);

  console.log("\n✓ Full workflow simulation completed successfully!");
  console.log("\nKey Features Demonstrated:");
  console.log("  ✓ Contract deployment");
  console.log("  ✓ Juror certification");
  console.log("  ✓ Case creation");
  console.log("  ✓ Juror authorization");
  console.log("  ✓ Private voting with FHE encryption");
  console.log("  ✓ Vote tallying");
  console.log("  ✓ Result revelation");
  console.log("  ✓ Reputation system");

  console.log("\n" + "=".repeat(60) + "\n");
}

// Execute simulation
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Simulation Failed:");
    console.error(error);
    process.exit(1);
  });
