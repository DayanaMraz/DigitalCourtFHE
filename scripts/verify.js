const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=".repeat(60));
  console.log("Digital Court System - Contract Verification");
  console.log("=".repeat(60));

  const network = hre.network.name;
  console.log(`\nNetwork: ${network}`);

  // Check if we're on a supported network
  if (network === "hardhat" || network === "localhost") {
    console.log("\n⚠ Contract verification is not needed for local networks.");
    console.log("Verification is only available for public networks like Sepolia.");
    return;
  }

  // Load deployment information
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error(`\n❌ Error: Deployment file not found at ${deploymentFile}`);
    console.error("Please deploy the contract first using: npm run hardhat:deploy");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log(`\nContract Address: ${contractAddress}`);
  console.log(`Deployed at block: ${deploymentInfo.blockNumber}`);

  // Wait for a few block confirmations before verification
  console.log("\nWaiting for block confirmations...");
  const confirmations = 5;
  let currentBlock = await hre.ethers.provider.getBlockNumber();
  const targetBlock = deploymentInfo.blockNumber + confirmations;

  if (currentBlock < targetBlock) {
    console.log(`Current block: ${currentBlock}, Target block: ${targetBlock}`);
    console.log(`Waiting for ${targetBlock - currentBlock} more blocks...`);

    while (currentBlock < targetBlock) {
      await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds
      currentBlock = await hre.ethers.provider.getBlockNumber();
      console.log(`Current block: ${currentBlock}`);
    }
  }

  console.log("✓ Sufficient confirmations received");

  // Verify the contract
  console.log("\n" + "-".repeat(60));
  console.log("Starting Contract Verification on Etherscan...");
  console.log("-".repeat(60));

  try {
    console.log("\nVerifying DigitalCourt contract...");
    console.log(`Address: ${contractAddress}`);

    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // DigitalCourt has no constructor arguments
      contract: "contracts/DigitalCourt.sol:DigitalCourt",
    });

    console.log("\n✓ Contract verified successfully!");

    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verifiedAt = new Date().toISOString();
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✓ Contract is already verified on Etherscan");

      // Update deployment info
      deploymentInfo.verified = true;
      deploymentInfo.verifiedAt = new Date().toISOString();
      fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

    } else {
      console.error("\n❌ Verification failed:");
      console.error(error.message);
      process.exit(1);
    }
  }

  // Display verification info
  console.log("\n" + "=".repeat(60));
  console.log("Verification Summary");
  console.log("=".repeat(60));
  console.log(`\nContract: DigitalCourt`);
  console.log(`Address: ${contractAddress}`);
  console.log(`Network: ${network}`);

  if (network === "sepolia") {
    console.log(`\nEtherscan Contract Page:`);
    console.log(`${deploymentInfo.etherscanUrl}`);
    console.log(`\nEtherscan Verification Page:`);
    console.log(`${deploymentInfo.etherscanUrl}#code`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("Verification Complete!");
  console.log("=".repeat(60) + "\n");
}

// Execute verification
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Verification script failed:");
    console.error(error);
    process.exit(1);
  });
