import { expect } from "chai";
import hre from "hardhat";

describe("PassportRegistry Smart Contract", function () {
  let contract;
  let owner;
  let addr1;

  const PRODUCT_ID = "ECO-TX-2025-001";
  const IPFS_CID   = "QmTestCID123456789";
  const META_HASH  = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test-metadata"));

  beforeEach(async function () {
    [owner, addr1] = await hre.ethers.getSigners();
    const Factory = await hre.ethers.getContractFactory("PassportRegistry");
    contract = await Factory.deploy();
  });

  // ────────────────────────────────────────────
  // 1. Deployment
  // ────────────────────────────────────────────
  describe("Deployment", function () {
    it("should deploy with a valid contract address", async function () {
      expect(contract.target).to.be.a("string");
      expect(contract.target).to.match(/^0x[0-9a-fA-F]{40}$/);
    });
  });

  // ────────────────────────────────────────────
  // 2. registerPassport
  // ────────────────────────────────────────────
  describe("registerPassport", function () {
    it("should register a new passport successfully", async function () {
      await expect(
        contract.registerPassport(PRODUCT_ID, IPFS_CID, META_HASH)
      ).to.emit(contract, "PassportIssued");
    });

    it("should store the correct issuer address", async function () {
      await contract.registerPassport(PRODUCT_ID, IPFS_CID, META_HASH);
      const [, , issuer] = await contract.getPassport(PRODUCT_ID);
      expect(issuer).to.equal(owner.address);
    });

    it("should store the correct IPFS CID and metadata hash", async function () {
      await contract.registerPassport(PRODUCT_ID, IPFS_CID, META_HASH);
      const [cid, hash] = await contract.getPassport(PRODUCT_ID);
      expect(cid).to.equal(IPFS_CID);
      expect(hash).to.equal(META_HASH);
    });

    it("should record a non-zero timestamp", async function () {
      await contract.registerPassport(PRODUCT_ID, IPFS_CID, META_HASH);
      const [, , , timestamp] = await contract.getPassport(PRODUCT_ID);
      expect(Number(timestamp)).to.be.greaterThan(0);
    });

    it("should revert when registering a duplicate product ID", async function () {
      await contract.registerPassport(PRODUCT_ID, IPFS_CID, META_HASH);
      await expect(
        contract.registerPassport(PRODUCT_ID, IPFS_CID, META_HASH)
      ).to.be.revertedWith("Passport already exists");
    });

    it("should allow different accounts to register different products", async function () {
      await contract.connect(owner).registerPassport("PROD-001", IPFS_CID, META_HASH);
      await contract.connect(addr1).registerPassport("PROD-002", IPFS_CID, META_HASH);

      const [, , issuer1] = await contract.getPassport("PROD-001");
      const [, , issuer2] = await contract.getPassport("PROD-002");
      expect(issuer1).to.equal(owner.address);
      expect(issuer2).to.equal(addr1.address);
    });
  });

  // ──────────────────────────────────────────────
  // 3. passportExists
  // ──────────────────────────────────────────────
  describe("passportExists", function () {
    it("should return false for an unregistered product", async function () {
      expect(await contract.passportExists("NONEXISTENT-ID")).to.equal(false);
    });

    it("should return true after registration", async function () {
      await contract.registerPassport(PRODUCT_ID, IPFS_CID, META_HASH);
      expect(await contract.passportExists(PRODUCT_ID)).to.equal(true);
    });
  });

  // ──────────────────────────────────────────────
  // 4. getPassport
  // ──────────────────────────────────────────────
  describe("getPassport", function () {
    it("should revert when querying a non-existent product", async function () {
      await expect(
        contract.getPassport("NO-SUCH-PRODUCT")
      ).to.be.revertedWith("Passport not found");
    });

    it("should return all four fields correctly", async function () {
      await contract.registerPassport(PRODUCT_ID, IPFS_CID, META_HASH);
      const [cid, hash, issuer, timestamp] = await contract.getPassport(PRODUCT_ID);
      expect(cid).to.equal(IPFS_CID);
      expect(hash).to.equal(META_HASH);
      expect(issuer).to.equal(owner.address);
      expect(Number(timestamp)).to.be.greaterThan(0);
    });
  });

  // ──────────────────────────────────────────────
  // 5. batchRegisterPassports
  // ──────────────────────────────────────────────
  describe("batchRegisterPassports", function () {
    const ids    = ["BATCH-001", "BATCH-002", "BATCH-003"];
    const cids   = ["QmCID1", "QmCID2", "QmCID3"];
    const hashes = [
      hre.ethers.keccak256(hre.ethers.toUtf8Bytes("hash1")),
      hre.ethers.keccak256(hre.ethers.toUtf8Bytes("hash2")),
      hre.ethers.keccak256(hre.ethers.toUtf8Bytes("hash3")),
    ];

    it("should register multiple products in one transaction", async function () {
      await contract.batchRegisterPassports(ids, cids, hashes);
      for (const id of ids) {
        expect(await contract.passportExists(id)).to.equal(true);
      }
    });

    it("should emit PassportIssued for each new product", async function () {
      const tx = await contract.batchRegisterPassports(ids, cids, hashes);
      const receipt = await tx.wait();
      const events = receipt.logs.filter(
        log => log.fragment && log.fragment.name === "PassportIssued"
      );
      expect(events.length).to.equal(ids.length);
    });

    it("should revert when array lengths do not match", async function () {
      await expect(
        contract.batchRegisterPassports(["ID-1"], ["CID-1", "CID-2"], [hashes[0]])
      ).to.be.revertedWith("Array length mismatch");
    });

    it("should silently skip already-registered products in a batch", async function () {
      await contract.registerPassport(ids[0], cids[0], hashes[0]);
      await expect(
        contract.batchRegisterPassports(ids, cids, hashes)
      ).to.not.be.reverted;
      expect(await contract.passportExists(ids[1])).to.equal(true);
      expect(await contract.passportExists(ids[2])).to.equal(true);
    });

    it("should store correct data for each batch item", async function () {
      await contract.batchRegisterPassports(ids, cids, hashes);
      for (let i = 0; i < ids.length; i++) {
        const [cid, hash] = await contract.getPassport(ids[i]);
        expect(cid).to.equal(cids[i]);
        expect(hash).to.equal(hashes[i]);
      }
    });
  });

  // ──────────────────────────────────────────────
  // 6. PassportIssued event
  // ──────────────────────────────────────────────
  describe("PassportIssued event", function () {
    it("should emit correct values on single registration", async function () {
      await expect(
        contract.registerPassport(PRODUCT_ID, IPFS_CID, META_HASH)
      )
        .to.emit(contract, "PassportIssued")
        .withArgs(
          PRODUCT_ID,
          IPFS_CID,
          META_HASH,
          owner.address,
          (ts) => Number(ts) > 0
        );
    });
  });
});
