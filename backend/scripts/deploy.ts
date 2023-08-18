import { ethers } from "hardhat";
// 0x1bc79d67012282885Dd00b9735cf2020555D063a
// mumbai :0x5C9b1BE6ce57d85e885934A517736413847b8A19
const vrfDataMain = {
	vrfCoordinatorV2: "0xae975071be8f8ee67addbc1a82488f1c24858067",
	keyhash:
		"0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd",
	subscriptionId: "915", // vrf.chain.link
};

// const vrfTestNet = {
// 	subscriptionId: "5747",
// 	keyhash:
// 		"0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
// 	vrfCoordinatorV2: "0x7a1bac17ccc5b313516c5e16fb24f7659aa5ebed",
// };
async function main() {
	const raffle721 = await ethers.deployContract("NFT721Raffle", [
		vrfDataMain.subscriptionId,
		vrfDataMain.vrfCoordinatorV2,
		vrfDataMain.keyhash,
	]);
	await raffle721.waitForDeployment();
	console.log("raffle721 deployed to:", raffle721.target);

	// const raffle1155 = await ethers.deployContract("nft1155Raffle");
	// await raffle1155.waitForDeployment();
	// console.log("raffle1155 deployed to:", raffle1155.target);

	// const auction721 = await ethers.deployContract("nft721Auction");
	// await auction721.waitForDeployment();
	// console.log("auction721 deployed to:", auction721.target);

	// const auction1155 = await ethers.deployContract("nft1155Auction");
	// await auction1155.waitForDeployment();
	// console.log("auction1155 deployed to:", auction1155.target);

	// await raffle1155.transferOwnership("0x398818ca588209Fec5348e6CA901629C553c902E");
	// await auction721.transferOwnership("0x398818ca588209Fec5348e6CA901629C553c902E");
	// await auction1155.transferOwnership("0x398818ca588209Fec5348e6CA901629C553c902E");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
