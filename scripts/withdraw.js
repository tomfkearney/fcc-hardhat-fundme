const {getNamedAccounts, ethers} = require("hardhat")

async function main (){

    // deployer = (await getNamedAccounts()).deployer -- maybe
    const {deployer} = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("funding contract ... .")
    const transactionResponse = await fundMe.withdraw()
    const transactionReceipt = await transactionResponse.wait(1);
    console.log("got it back")
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });