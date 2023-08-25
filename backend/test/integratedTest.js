const { expect, assert } = require("chai");
const { ethers, network } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const BN = require("bignumber.js");

const TicketPrice = "10000"; // Use BN constructor
const MaxTicketPrice = new BN(ethers.parseEther("30", "6"));

// vrf data
const baseFee = "250000000000000000"; // 0.25 is this the premium in LINK?
const gasPriceLink = 1e9; // link per gas, is this the gas lane? // 0.000000001 LINK per gas
const vrfSubFundAmount = ethers.parseEther("1", "6");

const vrfData = {
	vrfCoordinatorV2: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
	gasLane:
		"0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
	callbackGasLimit: "500000",
};

describe("Raffle721", function () {
	let accounts, raffle721, nft, vrfCoordinatorV2Mock, subscriptionId;
	beforeEach(async () => {
		accounts = await ethers.getSigners();

		//vrfcoordinatorv2mock
		// deploy VRFCoordinatorV2Mock
		vrfCoordinatorV2Mock = await ethers.deployContract(
			"VRFCoordinatorV2Mock",
			[baseFee, gasPriceLink]
		);
		await vrfCoordinatorV2Mock.waitForDeployment();

		// for subscritpion id
		const tx = await vrfCoordinatorV2Mock.createSubscription();
		const txRec = await tx.wait();
		subscriptionId = txRec.logs[0].args[0].toString();

		// we have the subscription, now fund the subscription
		await vrfCoordinatorV2Mock.fundSubscription(
			subscriptionId,
			vrfSubFundAmount
		);

		// raffle721
		raffle721 = await ethers.deployContract("NFT721Raffle", [
			subscriptionId,
			vrfCoordinatorV2Mock.target,
			vrfData.gasLane,
		]);
		await raffle721.waitForDeployment();

		// add customer to vrf
		await vrfCoordinatorV2Mock.addConsumer(
			subscriptionId,
			raffle721.target
		);

		//nft
		nft = await ethers.deployContract("NFTContract", []);
		await nft.waitForDeployment();
	});

	it("integrated test", async () => {
		const tx = await nft.mintNFT("Vishal1");
		const txRec = await tx.wait();

		const tokenId = txRec.logs[0].args[2].toString();

		await nft.approve(raffle721.target, tokenId);

		// create rafle
		let startTimeStamp = await time.latest();
		await raffle721.createRaffle(
			nft.target,
			tokenId,
			10000,
			startTimeStamp + 100,
			startTimeStamp + 600,
			"30"
		);

		const ticketsToBuy = [100, 10, 10, 20, 20, 50];

		await network.provider.send("evm_increaseTime", [200]);
		await network.provider.send("evm_mine", []);

		// for (let i = 0; i < ticketsToBuy.length; i++) {
		// 	const totalPrice = TicketPrice * ticketsToBuy[i]; // Use multipliedBy() method

		// 	expect(
		// 		await raffle721
		// 			.connect(accounts[i + 1])
		// 			.buyTicket(1, ticketsToBuy[i], {
		// 				value: totalPrice.toFixed(),
		// 			})
		// 	).to.emit(raffle721, "TicketBought");
		// }

		expect(
			await raffle721
				.connect(accounts[1])
				.buyTicket("1", "1", { value: ethers.parseEther("0.01") })
		);

		await network.provider.send("evm_increaseTime", [1000]);
		await network.provider.send("evm_mine", []);

		const { upKeepNeeded, performData } = await raffle721.checkUpkeep("0x");

		console.log(upKeepNeeded, performData);
		await raffle721.performUpkeep(performData);

		// // const requestId = await raffle721.getReqId();

		// // call fulfilrandomword
		expect(
			await vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle721.target)
		);

		const data = await raffle721.idToRaffleItem(1);

		console.log("data : ", data);

		// // const raffleItem = await raffle721.fetchRaffleItems();
		// // console.log(raffleItem);

		// const i = await raffle721.connect(accounts[4]).fetchMyTicketItems();

		// console.log(i);
	});
});
