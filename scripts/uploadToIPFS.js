import crypto from 'crypto'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { products } from './productsData.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PINATA_API_KEY = process.env.PINATA_API_KEY
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY
const PINATA_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'

if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
  throw new Error('Please set PINATA_API_KEY and PINATA_SECRET_API_KEY')
}

async function uploadPassport(passportData) {
  const jsonStr = JSON.stringify(passportData, null, 2)
  const metadataHash = '0x' + crypto.createHash('sha256').update(jsonStr).digest('hex')

  const response = await fetch(PINATA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_API_KEY
    },
    body: JSON.stringify({
      pinataContent: passportData,
      pinataMetadata: { name: `passport-${passportData.productId}.json` }
    })
  })

  if (!response.ok) throw new Error(`Pinata upload failed: ${response.statusText}`)

  const result = await response.json()
  const cid = result.IpfsHash

  console.log(`✅ ${passportData.productId}`)
  console.log(`   CID: ${cid}`)
  console.log(`   Hash: ${metadataHash}`)
  console.log(`   View: https://gateway.pinata.cloud/ipfs/${cid}`)
  console.log('')

  return { productId: passportData.productId, ipfsCID: cid, metadataHash }
}

async function uploadAll() {
  console.log(`Uploading ${products.length} products to IPFS...\n`)
  const results = []
  for (const product of products) {
    const result = await uploadPassport(product)
    results.push(result)
  }
  fs.writeFileSync(
    join(__dirname, '..', 'upload-result.json'),
    JSON.stringify(results, null, 2)
  )
  console.log('All done! Results saved to upload-result.json')
}

uploadAll().catch(console.error)