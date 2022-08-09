const { deployments, ethers, getNamedAccounts } = require("hardhat")
const {deploy } = deployments
const {assert, expect } = require ("chai")
const {developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) 
? describe.skip 
: describe("FundMe", async function() {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1");
    beforeEach( async function () {
        // const accounts = await ethers.getSigners()
        // const accountZero =  accounts[0]
        // another way to get a named account to be the deployer ^^
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all", "fundme"])
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
        fundMe = await ethers.getContract("FundMe", deployer)

    })

    describe("constructor", async function() {
        it("sets the aggregator address correctly", async function () {
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", async function() {
        it("fails with not enough eth sent ", async function() {
            await expect(fundMe.fund()).to.be.reverted
        })
        it("updated the amount funded structure", async function() {
            await fundMe.fund({value: sendValue})
            const response = await fundMe.addressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })
        it("adds funder to array of s_funders", async function() {
            await fundMe.fund({value: sendValue})
            const funder = await (fundMe.s_funders(0))
            assert.equal(funder, deployer)
        })
    })

    describe("withdraw", async function() {
        beforeEach(async function() {
            await fundMe.fund({value: sendValue})
        })

        it("withdraw ETH from a single funder", async function(){
            //arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
            //act 
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const {gasUsed,effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul( effectiveGasPrice)
            
            //assert
            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(), 
                endingDeployerBalance.add(gasCost).toString())
        })

        it( "allows withdrawal with multiple s_funders", async function()  {
            //arrange
            const accounts = await ethers.getSigners()
            for(let i =1; i<6; i++) {
                const fundMeConnectedContract = fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue})
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            //act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const {gasUsed,effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul( effectiveGasPrice)

            //assert
            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(), 
                endingDeployerBalance.add(gasCost).toString())
            
            //s_funders array will get reset on withdraw() call
            await expect(fundMe.s_funders(0)).to.be.reverted

            //mappings should all be set to 0
            for(i=1;i<6;i++) {
                assert.equal( await fundMe.addressToAmountFunded(accounts[i].address), 0)
            }
        })

        it("only allows owner to withdraw", async function (){
            const accounts = await ethers.getSigners();
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect( attacker)
            await expect(attackerConnectedContract.withdraw()).to.be.reverted
        })

        it( "cheaper withdraw testing multiple s_funders", async function()  {
            //arrange
            const accounts = await ethers.getSigners()
            for(let i =1; i<6; i++) {
                const fundMeConnectedContract = fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue})
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            //act
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const {gasUsed,effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul( effectiveGasPrice)

            //assert
            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(), 
                endingDeployerBalance.add(gasCost).toString())
            
            //s_funders array will get reset on withdraw() call
            await expect(fundMe.s_funders(0)).to.be.reverted

            //mappings should all be set to 0
            for(i=1;i<6;i++) {
                assert.equal( await fundMe.addressToAmountFunded(accounts[i].address), 0)
            }
        })
    })


})