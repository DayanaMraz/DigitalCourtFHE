const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=".repeat(60));
  console.log("Digital Court System - Deployment Script");
  console.log("=".repeat(60));

  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log(`\nDeployment Information:`);
  console.log(`- Network: ${network}`);
  console.log(`- Deployer Address: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`- Deployer Balance: ${hre.ethers.formatEther(balance)} ETH`);

  // Verify sufficient balance
  if (balance < hre.ethers.parseEther("0.01")) {
    console.warn("\n⚠ Warning: Low balance. Deployment may fail.");
  }

  console.log("\n" + "-".repeat(60));
  console.log("Starting Contract Deployment...");
  console.log("-".repeat(60));

  // Deploy DigitalCourt contract
  console.log("\n1. Deploying DigitalCourt contract...");
  const DigitalCourt = await hre.ethers.getContractFactory("DigitalCourt");

  console.log("   - Estimating deployment gas...");
  const digitalCourt = await DigitalCourt.deploy();

  console.log("   - Transaction submitted. Waiting for confirmation...");
  await digitalCourt.waitForDeployment();

  const contractAddress = await digitalCourt.getAddress();
  console.log(`   ✓ DigitalCourt deployed to: ${contractAddress}`);

  // Get deployment transaction details
  const deployTx = digitalCourt.deploymentTransaction();
  console.log(`   - Transaction Hash: ${deployTx.hash}`);
  console.log(`   - Block Number: ${deployTx.blockNumber}`);

  if (deployTx.gasPrice) {
    console.log(`   - Gas Price: ${hre.ethers.formatUnits(deployTx.gasPrice, "gwei")} gwei`);
  }

  // Get contract constants
  console.log("\n2. Verifying Contract Configuration...");
  const votingDuration = await digitalCourt.VOTING_DURATION();
  const minJurors = await digitalCourt.MIN_JURORS();
  const maxJurors = await digitalCourt.MAX_JURORS();

  console.log(`   - Voting Duration: ${votingDuration.toString()} seconds (${Number(votingDuration) / 86400} days)`);
  console.log(`   - Minimum Jurors: ${minJurors.toString()}`);
  console.log(`   - Maximum Jurors: ${maxJurors.toString()}`);
  console.log(`   - Owner: ${await digitalCourt.owner()}`);

  // Save deployment information
  console.log("\n3. Saving Deployment Information...");
  const deploymentInfo = {
    network: network,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    contractName: "DigitalCourt",
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTransaction: deployTx.hash,
    blockNumber: deployTx.blockNumber,
    timestamp: new Date().toISOString(),
    votingDuration: votingDuration.toString(),
    minJurors: minJurors.toString(),
    maxJurors: maxJurors.toString(),
    etherscanUrl: network === "sepolia"
      ? `https://sepolia.etherscan.io/address/${contractAddress}`
      : `https://etherscan.io/address/${contractAddress}`
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`   ✓ Deployment info saved to: ${deploymentFile}`);

  // Save ABI
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "DigitalCourt.sol", "DigitalCourt.json");
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiFile = path.join(deploymentsDir, `${network}-abi.json`);
    fs.writeFileSync(abiFile, JSON.stringify(artifact.abi, null, 2));
    console.log(`   ✓ Contract ABI saved to: ${abiFile}`);
  }

  // Display summary
  console.log("\n" + "=".repeat(60));
  console.log("Deployment Summary");
  console.log("=".repeat(60));
  console.log(`\nContract Address: ${contractAddress}`);
  console.log(`Network: ${network}`);
  console.log(`Deployer: ${deployer.address}`);

  if (network === "sepolia") {
    console.log(`\nEtherscan URL: ${deploymentInfo.etherscanUrl}`);
    console.log(`\nNext Steps:`);
    console.log(`1. Verify the contract on Etherscan:`);
    console.log(`   npm run hardhat:verify`);
    console.log(`\n2. Interact with the deployed contract:`);
    console.log(`   npm run hardhat:interact`);
  } else {
    console.log(`\nNote: Contract deployed to local/test network`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("Deployment Complete!");
  console.log("=".repeat(60) + "\n");

  return {
    contractAddress,
    deploymentInfo
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment Failed:");
    console.error(error);
    process.exit(1);
  });
