const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log("=".repeat(60));
  console.log("Digital Court System - Contract Interaction");
  console.log("=".repeat(60));

  const network = hre.network.name;
  console.log(`\nNetwork: ${network}`);

  // Load deployment information
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error(`\n❌ Error: Deployment file not found at ${deploymentFile}`);
    console.error("Please deploy the contract first using: npm run hardhat:deploy");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log(`Contract Address: ${contractAddress}`);

  // Connect to the contract
  const [owner, juror1, juror2, juror3] = await hre.ethers.getSigners();
  const DigitalCourt = await hre.ethers.getContractFactory("DigitalCourt");
  const contract = DigitalCourt.attach(contractAddress);

  console.log(`\nConnected as: ${owner.address}`);
  console.log(`Available accounts: ${[owner, juror1, juror2, juror3].map(s => s.address).join(", ")}`);

  // Interactive menu
  while (true) {
    console.log("\n" + "=".repeat(60));
    console.log("Interaction Menu");
    console.log("=".repeat(60));
    console.log("\n1. View Contract Information");
    console.log("2. Certify Jurors");
    console.log("3. Create New Legal Case");
    console.log("4. Authorize Jurors for Case");
    console.log("5. Cast Private Vote");
    console.log("6. End Voting");
    console.log("7. Reveal Results");
    console.log("8. View Case Information");
    console.log("9. View All Cases");
    console.log("10. Check Juror Status");
    console.log("0. Exit");

    const choice = await question("\nSelect an option: ");

    try {
      switch (choice.trim()) {
        case "1":
          await viewContractInfo(contract);
          break;

        case "2":
          await certifyJurors(contract, owner, [juror1, juror2, juror3]);
          break;

        case "3":
          await createCase(contract, owner);
          break;

        case "4":
          await authorizeJurors(contract, owner, [juror1, juror2, juror3]);
          break;

        case "5":
          await castVote(contract, [juror1, juror2, juror3]);
          break;

        case "6":
          await endVoting(contract, owner);
          break;

        case "7":
          await revealResults(contract, owner);
          break;

        case "8":
          await viewCaseInfo(contract);
          break;

        case "9":
          await viewAllCases(contract);
          break;

        case "10":
          await checkJurorStatus(contract, [juror1, juror2, juror3]);
          break;

        case "0":
          console.log("\nExiting...");
          rl.close();
          return;

        default:
          console.log("\n❌ Invalid option. Please try again.");
      }
    } catch (error) {
      console.error("\n❌ Error:", error.message);
    }
  }
}

async function viewContractInfo(contract) {
  console.log("\n" + "-".repeat(60));
  console.log("Contract Information");
  console.log("-".repeat(60));

  const owner = await contract.owner();
  const caseCount = await contract.caseCount();
  const votingDuration = await contract.VOTING_DURATION();
  const minJurors = await contract.MIN_JURORS();
  const maxJurors = await contract.MAX_JURORS();

  console.log(`\nOwner: ${owner}`);
  console.log(`Total Cases: ${caseCount.toString()}`);
  console.log(`Voting Duration: ${votingDuration.toString()} seconds (${Number(votingDuration) / 86400} days)`);
  console.log(`Min Jurors: ${minJurors.toString()}`);
  console.log(`Max Jurors: ${maxJurors.toString()}`);
}

async function certifyJurors(contract, owner, jurors) {
  console.log("\n" + "-".repeat(60));
  console.log("Certifying Jurors");
  console.log("-".repeat(60));

  const jurorAddresses = jurors.map(j => j.address);
  console.log(`\nCertifying ${jurorAddresses.length} jurors...`);

  const tx = await contract.connect(owner).certifyJurors(jurorAddresses);
  console.log(`Transaction Hash: ${tx.hash}`);
  await tx.wait();

  console.log("✓ Jurors certified successfully");

  for (const juror of jurors) {
    const isCertified = await contract.certifiedJurors(juror.address);
    const reputation = await contract.jurorReputation(juror.address);
    console.log(`  - ${juror.address}: Certified=${isCertified}, Reputation=${reputation.toString()}`);
  }
}

async function createCase(contract, owner) {
  console.log("\n" + "-".repeat(60));
  console.log("Create New Legal Case");
  console.log("-".repeat(60));

  const title = await question("\nCase Title: ");
  const description = await question("Case Description: ");
  const evidenceHash = await question("Evidence Hash (IPFS/URL): ");
  const requiredJurors = await question("Required Jurors (3-12): ");

  console.log("\nCreating case...");
  const tx = await contract.connect(owner).createCase(
    title,
    description,
    evidenceHash,
    parseInt(requiredJurors)
  );

  console.log(`Transaction Hash: ${tx.hash}`);
  const receipt = await tx.wait();

  const event = receipt.logs.find(log => {
    try {
      return contract.interface.parseLog(log).name === "CaseCreated";
    } catch {
      return false;
    }
  });

  if (event) {
    const parsedEvent = contract.interface.parseLog(event);
    console.log(`✓ Case created with ID: ${parsedEvent.args.caseId.toString()}`);
  }
}

async function authorizeJurors(contract, owner, jurors) {
  console.log("\n" + "-".repeat(60));
  console.log("Authorize Jurors for Case");
  console.log("-".repeat(60));

  const caseId = await question("\nCase ID: ");
  const jurorAddresses = jurors.map(j => j.address);

  console.log(`\nAuthorizing ${jurorAddresses.length} jurors for case ${caseId}...`);
  const tx = await contract.connect(owner).authorizeJurors(
    parseInt(caseId),
    jurorAddresses
  );

  console.log(`Transaction Hash: ${tx.hash}`);
  await tx.wait();
  console.log("✓ Jurors authorized successfully");
}

async function castVote(contract, jurors) {
  console.log("\n" + "-".repeat(60));
  console.log("Cast Private Vote");
  console.log("-".repeat(60));

  const caseId = await question("\nCase ID: ");
  const jurorIndex = await question(`Select Juror (0-${jurors.length - 1}): `);
  const vote = await question("Vote (0=Innocent, 1=Guilty): ");

  const juror = jurors[parseInt(jurorIndex)];
  const commitment = hre.ethers.id(`vote-${caseId}-${juror.address}-${Date.now()}`);

  console.log(`\nCasting vote as ${juror.address}...`);
  const tx = await contract.connect(juror).castPrivateVote(
    parseInt(caseId),
    parseInt(vote),
    commitment
  );

  console.log(`Transaction Hash: ${tx.hash}`);
  await tx.wait();
  console.log("✓ Vote cast successfully");
}

async function endVoting(contract, owner) {
  console.log("\n" + "-".repeat(60));
  console.log("End Voting");
  console.log("-".repeat(60));

  const caseId = await question("\nCase ID: ");

  console.log(`\nEnding voting for case ${caseId}...`);
  const tx = await contract.connect(owner).endVoting(parseInt(caseId));

  console.log(`Transaction Hash: ${tx.hash}`);
  await tx.wait();
  console.log("✓ Voting ended successfully");
}

async function revealResults(contract, owner) {
  console.log("\n" + "-".repeat(60));
  console.log("Reveal Results");
  console.log("-".repeat(60));

  const caseId = await question("\nCase ID: ");

  console.log(`\nRevealing results for case ${caseId}...`);
  const tx = await contract.connect(owner).revealResults(parseInt(caseId));

  console.log(`Transaction Hash: ${tx.hash}`);
  const receipt = await tx.wait();

  const event = receipt.logs.find(log => {
    try {
      return contract.interface.parseLog(log).name === "CaseRevealed";
    } catch {
      return false;
    }
  });

  if (event) {
    const parsedEvent = contract.interface.parseLog(event);
    console.log("\n✓ Results Revealed:");
    console.log(`  Verdict: ${parsedEvent.args.verdict ? "GUILTY" : "INNOCENT"}`);
    console.log(`  Guilty Votes: ${parsedEvent.args.guiltyVotes.toString()}`);
    console.log(`  Innocent Votes: ${parsedEvent.args.innocentVotes.toString()}`);
    console.log(`  Total Jurors: ${parsedEvent.args.totalJurors.toString()}`);
  }
}

async function viewCaseInfo(contract) {
  console.log("\n" + "-".repeat(60));
  console.log("View Case Information");
  console.log("-".repeat(60));

  const caseId = await question("\nCase ID: ");

  const caseInfo = await contract.getCaseInfo(parseInt(caseId));

  console.log("\nCase Details:");
  console.log(`  Title: ${caseInfo.title}`);
  console.log(`  Description: ${caseInfo.description}`);
  console.log(`  Evidence Hash: ${caseInfo.evidenceHash}`);
  console.log(`  Judge: ${caseInfo.judge}`);
  console.log(`  Start Time: ${new Date(Number(caseInfo.startTime) * 1000).toLocaleString()}`);
  console.log(`  End Time: ${new Date(Number(caseInfo.endTime) * 1000).toLocaleString()}`);
  console.log(`  Required Jurors: ${caseInfo.requiredJurors.toString()}`);
  console.log(`  Active: ${caseInfo.active}`);
  console.log(`  Revealed: ${caseInfo.revealed}`);
  console.log(`  Verdict: ${caseInfo.verdict ? "GUILTY" : "INNOCENT"}`);
  console.log(`  Juror Count: ${caseInfo.jurorCount.toString()}`);
}

async function viewAllCases(contract) {
  console.log("\n" + "-".repeat(60));
  console.log("All Cases");
  console.log("-".repeat(60));

  const caseCount = await contract.caseCount();
  console.log(`\nTotal Cases: ${caseCount.toString()}\n`);

  if (caseCount > 0) {
    const cases = await contract.getCases(0, caseCount);

    for (let i = 0; i < cases.caseIds.length; i++) {
      console.log(`Case ${cases.caseIds[i].toString()}:`);
      console.log(`  Title: ${cases.titles[i]}`);
      console.log(`  Active: ${cases.activeStates[i]}`);
      console.log(`  Revealed: ${cases.revealedStates[i]}`);
      console.log("");
    }
  }
}

async function checkJurorStatus(contract, jurors) {
  console.log("\n" + "-".repeat(60));
  console.log("Juror Status");
  console.log("-".repeat(60));

  for (const juror of jurors) {
    const isCertified = await contract.certifiedJurors(juror.address);
    const reputation = await contract.jurorReputation(juror.address);

    console.log(`\n${juror.address}:`);
    console.log(`  Certified: ${isCertified}`);
    console.log(`  Reputation: ${reputation.toString()}`);
  }
}

// Execute interaction
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Interaction script failed:");
    console.error(error);
    rl.close();
    process.exit(1);
  });
