import { expect } from "chai";
import hre from "hardhat";

describe("PassportRegistry Smart Contract", function () {
  it("Should deploy the contract successfully", async function () {
    // 1. Get the compiled contract
    const ContractFactory = await hre.ethers.getContractFactory("PassportRegistry");
    
    // 2. Deploy the contract
    const contract = await ContractFactory.deploy();
    
    // 3. Verify that the contract has a valid deployment address
    expect(contract.target).to.not.be.undefined;
    
    console.log("Success! Contract deployed to:", contract.target);
  });
});