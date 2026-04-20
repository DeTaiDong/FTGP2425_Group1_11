const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

const result = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'upload-result.json'), 'utf8'));

async function main() {
  const Registry = await hre.ethers.getContractFactory('PassportRegistry');
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log('Contract deployed to:', contractAddress);

  // Write frontend env file so the React app can connect to this contract
  const frontendEnv = `VITE_CONTRACT_ADDRESS=${contractAddress}\n`;
  fs.writeFileSync(path.join(__dirname, '..', 'frontend', '.env'), frontendEnv, 'utf8');
  console.log('Updated frontend/.env with the deployed contract address');

  // Register the passport we just uploaded to IPFS
  const tx = await registry.registerPassport(
    result.productId,
    result.ipfsCID,
    result.metadataHash
  );
  await tx.wait();
  console.log('Passport registered on-chain. Tx hash:', tx.hash);

  // Verify round-trip read
  const [cid, hash, issuer, ts] = await registry.getPassport(result.productId);
  console.log('\nOn-chain record:');
  console.log('  CID    :', cid);
  console.log('  Hash   :', hash);
  console.log('  Issuer :', issuer);
  console.log('  Time   :', new Date(Number(ts) * 1000).toISOString());
}

main().catch(e => { console.error(e); process.exit(1); });