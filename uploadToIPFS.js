const crypto = require('crypto');
const fs = require('fs');

// Pinata API configuration
const PINATA_API_KEY = process.env.PINATA_API_KEY || 'YOUR_PINATA_API_KEY';
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY || 'YOUR_PINATA_SECRET_API_KEY';
const PINATA_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

if (PINATA_API_KEY === 'YOUR_PINATA_API_KEY' || PINATA_SECRET_API_KEY === 'YOUR_PINATA_SECRET_API_KEY') {
  throw new Error('Please set PINATA_API_KEY and PINATA_SECRET_API_KEY environment variables with your Pinata credentials.');
}
// Sample product passport JSON matching the data model Tianwei designed
const samplePassport = {
  productId:   "ECO-TX-2025-001",
  category:    "textile",
  brand:       "EcoWear GmbH",
  materials:   [
    { name: "Organic Cotton", percentage: 85, origin: "India", certified: "GOTS" },
    { name: "Recycled Polyester", percentage: 15, origin: "DE", certified: "GRS" }
  ],
  provenance: [
    { stage: "Raw material", location: "Tamil Nadu, IN", date: "2025-01-10" },
    { stage: "Spinning",     location: "Stuttgart, DE",  date: "2025-02-03" },
    { stage: "Assembly",     location: "Hamburg, DE",    date: "2025-02-28" }
  ],
  repairGuide: "https://ecowear.eu/repair/ECO-TX-2025-001",
  recycling:   "Drop-off at any H&M or Zalando return point (DE/AT/CH)"
};

async function uploadPassport(passportData) {
  const jsonStr = JSON.stringify(passportData, null, 2);

  // 1. Compute sha256 hash — this goes on-chain
  const metadataHash = '0x' + crypto
    .createHash('sha256')
    .update(jsonStr)
    .digest('hex');

  // 2. Upload to Pinata
  const response = await fetch(PINATA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_API_KEY
    },
    body: JSON.stringify({
      pinataContent: passportData,
      pinataMetadata: {
        name: `passport-${passportData.productId}.json`
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.statusText}`);
  }

  const result = await response.json();
  const cid = result.IpfsHash;

  console.log('✅  Uploaded to IPFS via Pinata');
  console.log('    CID          :', cid);
  console.log('    metadataHash :', metadataHash);
  console.log('    Verify at    : https://gateway.pinata.cloud/ipfs/' + cid);

  // Save for Hardhat deploy script
  fs.writeFileSync('upload-result.json', JSON.stringify({
    productId:    passportData.productId,
    ipfsCID:      cid.toString(),
    metadataHash: metadataHash
  }, null, 2));

  return { cid: cid.toString(), metadataHash };
}

// Call the function
uploadPassport(samplePassport);

uploadPassport(samplePassport).catch(console.error);