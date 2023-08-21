import { Contract, ethers } from "ethers";

import CONFIG from "../../config";
import { connectWallet } from "../../utils";
import BigNumber from "bignumber.js";

export const CreateRaffleContract = async (
	tokenContract: string,
	tokenId: number,
	ticketPrice: number,
	startDate: any,
	endDate: any,
	maxTicketAmount: any
) => {
	try {
		console.log(
			"bhaibhai : ",
			tokenContract,
			tokenId,
			ticketPrice * 10 ** 6,
			startDate,
			endDate,
			maxTicketAmount
		);
		const Provider: any = new ethers.providers.Web3Provider(
			window.ethereum
		);
		// await Provider.send("eth_requestAccounts", []);
		const signer = Provider.getSigner();
		const TokenContract = new Contract(
			tokenContract,
			CONFIG.TOKENERC721,
			signer
		);
		const approveTx = await TokenContract.approve(
			CONFIG.RAFFLE.CONTRACTADDRESS721,
			tokenId
		);
		await approveTx.wait();

		console.log(
			"ticketprice : ",
			ethers.utils.parseUnits(Number(ticketPrice).toString(), 6)
		);

		const raffleContract = new Contract(
			CONFIG.RAFFLE.CONTRACTADDRESS721,
			CONFIG.RAFFLE.ABI721,
			signer
		);
		const tx = await raffleContract.createRaffle(
			tokenContract,
			tokenId,
			ethers.utils.parseUnits(Number(ticketPrice).toString(), 6),
			startDate.toString(),
			endDate.toString(),
			maxTicketAmount.toString()
		);

		// bhaibhai :  0x5d666f215a85b87cb042d59662a7ecd2c8cc44e6
		// 19039686 10000 89 1692383940 1692470460
		// const tx = await raffleContract.createRaffle(
		// 	"0x5d666f215a85b87cb042d59662a7ecd2c8cc44e6",
		// 	"19039686",
		// 	"10000",
		// 	"1692467260",
		// 	"1692557660",
		// 	"50"
		// );

		await tx.wait();
		if (tx) {
			return true;
		}

		// return true;
	} catch (error) {
		console.log("error", error);
		return false;
	}
};

export const UpdateRaffleContract = async (
	itemId: number,
	ticketPrice: number,
	maxTicketAmount: number,
	startDate: any,
	endDate: any
) => {
	try {
		const Provider: any = new ethers.providers.Web3Provider(
			window.ethereum
		);
		const signer = Provider.getSigner();

		const raffleContract = new Contract(
			CONFIG.RAFFLE.CONTRACTADDRESS721,
			CONFIG.RAFFLE.ABI721,
			signer
		);

		const tx = await raffleContract.updateRaffle(
			itemId,
			ethers.utils.parseUnits(ticketPrice.toString()),
			maxTicketAmount,
			startDate,
			endDate
		);
		await tx.wait();
		if (tx) {
			return true;
		}
	} catch (error) {
		console.log("error", error);
		return false;
	}
};

export const FinishRaffleContract = async (itemId: number) => {
	try {
		const Provider: any = new ethers.providers.Web3Provider(
			window.ethereum
		);
		const signer = Provider.getSigner();

		const raffleContract = new Contract(
			CONFIG.RAFFLE.CONTRACTADDRESS721,
			CONFIG.RAFFLE.ABI721,
			signer
		);
		const tx = await raffleContract.completeRaffle(itemId);
		await tx.wait();
		if (tx) {
			return true;
		}
	} catch (error) {
		console.log("error", error);
		return false;
	}
};

export const CancelRaffleContract = async (itemId: any) => {
	try {
		const Provider: any = new ethers.providers.Web3Provider(
			window.ethereum
		);
		const signer = Provider.getSigner();

		const raffleContract = new Contract(
			CONFIG.RAFFLE.CONTRACTADDRESS721,
			CONFIG.RAFFLE.ABI721,
			signer
		);
		const tx = await raffleContract.cancelRaffle(itemId);

		await tx.wait();

		if (tx) {
			return true;
		}
	} catch (error) {
		console.log("error", error);
	}
};

export const buyTicket = async (
	itemId: number,
	ticketAmount: number,
	price: number
) => {
	try {
		const Provider: any = new ethers.providers.Web3Provider(
			window.ethereum
		);
		const signer = Provider.getSigner();

		const raffleContract = new Contract(
			CONFIG.RAFFLE.CONTRACTADDRESS721,
			CONFIG.RAFFLE.ABI721,
			signer
		);
		const res = await raffleContract.buyTicket(itemId, ticketAmount, {
			value: ethers.utils.parseUnits(price.toString()),
		});
		await res.wait();

		return res;
	} catch (error) {
		console.log("error", error);
	}
};

export const fetchRaffleLists = async () => {
	try {
		const Provider: any = new ethers.providers.Web3Provider(
			window.ethereum
		);
		const signer = Provider.getSigner();

		const raffleContract = new Contract(
			CONFIG.RAFFLE.CONTRACTADDRESS721,
			CONFIG.RAFFLE.ABI721,
			signer
		);
		const fetch_lists = await raffleContract.getAllRaffles();
		return fetch_lists;
	} catch (error) {
		console.log("error", error);
	}
};

export const fetchRaffleItems = async (
	tokenId: any,
	tokenAddress: any,
	startDate: any
) => {
	try {
		const Provider: any = new ethers.providers.Web3Provider(
			window.ethereum
		);
		const signer = Provider.getSigner();

		const raffleContract = new Contract(
			CONFIG.RAFFLE.CONTRACTADDRESS721,
			CONFIG.RAFFLE.ABI721,
			signer
		);
		const fetch_lists = await raffleContract.getAllRaffles();
		console.log("Change Contract", fetch_lists);

		const myWalletAddress: any = await connectWallet();

		console.log("fetch", fetch_lists);
		const filterWinner = fetch_lists.filter(
			(item: any) =>
				item.winner.toString().toLowerCase() === myWalletAddress.address
		);

		const itemId = fetch_lists.findIndex(
			(item: any) =>
				item.nftId === tokenId &&
				item.nftAddress.toString().toLowerCase() ===
					tokenAddress.toLowerCase() &&
				item.startTime === startDate
		);

		const getItem = fetch_lists.find(
			(item: any) =>
				item.nftId === tokenId &&
				item.nftAddress.toString().toLowerCase() ===
					tokenAddress.toLowerCase() &&
				item.startTime === startDate
		);
		console.log("Zindagi barbad", itemId);
		return {
			itemId,
			winner: getItem?.winner.toLowerCase(),
			price: Number(getItem?.price),
			winnerCount: filterWinner.length,
		};
	} catch (error) {
		console.log("error", error);
	}
};

export const fetchMyTickets = async (itemId: number) => {
	try {
		const Provider: any = new ethers.providers.Web3Provider(
			window.ethereum
		);
		const signer = Provider.getSigner();

		const raffleContract = new Contract(
			CONFIG.RAFFLE.CONTRACTADDRESS721,
			CONFIG.RAFFLE.ABI721,
			signer
		);

		const res = await raffleContract.getTicketsBought(itemId);
		return res;
	} catch (error) {
		console.log("error", error);
	}
};

export const fetchTicketItemsByID = async (itemId: number) => {
	try {
		const Provider: any = new ethers.providers.Web3Provider(
			window.ethereum
		);
		const signer = Provider.getSigner();

		const raffleContract = new Contract(
			CONFIG.RAFFLE.CONTRACTADDRESS721,
			CONFIG.RAFFLE.ABI721,
			signer
		);

		const res = await raffleContract.getTicketsBought(itemId);
		console.log("tickets by id", res);

		return res;
	} catch (error) {
		console.log("error", error);
	}
};

export const idToRaffleItem = async () => {
	try {
		const Provider: any = new ethers.providers.Web3Provider(
			window.ethereum
		);
		const signer = Provider.getSigner();
		const raffleContract = new Contract(
			CONFIG.RAFFLE.CONTRACTADDRESS721,
			CONFIG.RAFFLE.ABI721,
			signer
		);

		const itemId = await raffleContract.config();
		const num = itemId.raffleIndex;

		console.log(num);

		console.log("Raffle Index>>", Number(num.toString()));
		const RaffleIndex = Number(num.toString());

		let endRes = [];
		for (let i = 0; i <= RaffleIndex; i++) {
			const res = await raffleContract.idToRaffleItem(i);
			if (res.nftId !== 0) {
				endRes.push(res);
			}
		}
		console.log(endRes);

		console.log("endRes : ", endRes);
		return endRes;
	} catch (error) {
		console.log("error", error);
	}
};
	
export const idToRaffleItemBlock = async (itemId: number) => {
	try {
		const Provider: any = new ethers.providers.Web3Provider(
			window.ethereum
		);
		const signer = Provider.getSigner();
		const raffleContract = new Contract(
			CONFIG.RAFFLE.CONTRACTADDRESS721,
			CONFIG.RAFFLE.ABI721,
			signer
		);

		// const itemId = await raffleContract.config();
		// const num = itemId.raffleIndex;

		// console.log(num);

		// console.log("Raffle Index>>", Number(num.toString()));
		// const RaffleIndex = Number(num.toString());

		// let endRes = [];
		// for (let i = 0; i <= RaffleIndex; i++) {
			const res = await raffleContract.idToRaffleItem(itemId);
		// 	if (res.nftId !== 0) {
		// 		endRes.push(res);
		// 	}
		// }
		console.log(res);

		console.log("Result Raffle fron BLOCK : ", res);
		return res;
	} catch (error) {
		console.log("error", error);
	}
};



export const claimWinnings = async (itemId: any) => {
	try {
		const Provider: any = new ethers.providers.Web3Provider(
			window.ethereum
		);
		const signer = Provider.getSigner();

		const raffleContract = new Contract(
			CONFIG.RAFFLE.CONTRACTADDRESS721,
			CONFIG.RAFFLE.ABI721,
			signer
		);
		const tx = await raffleContract.claimWinnings(itemId);
		await tx.wait();
	} catch (error) {
		console.log("error", error);
	}
};

export const calculateWinner = async (itemId: any, randomIndex: any) => {
	try {
		const Provider: any = new ethers.providers.Web3Provider(
			window.ethereum
		);
		const signer = Provider.getSigner();

		const raffleContract = new Contract(
			CONFIG.RAFFLE.CONTRACTADDRESS721,
			CONFIG.RAFFLE.ABI721,
			signer
		);
		const res = await raffleContract.calculateWinner(itemId, randomIndex);
		return res;
	} catch (error) {
		console.log("error", error);
	}
};

export const initiateRaffleDrawing = async (itemId: any) => {
	try {
		const Provider: any = new ethers.providers.Web3Provider(
			window.ethereum
		);

		const signer = Provider.getSigner();
		const raffleContract = new Contract(
			CONFIG.RAFFLE.CONTRACTADDRESS721,
			CONFIG.RAFFLE.ABI721,
			signer
		);

		const singerAddr = await signer.getAddress();

		if (
			ethers.utils.getAddress(singerAddr) ===
			ethers.utils.getAddress(
				"0x9e5A4885A9E11B2Df94be59e7dDf71Eb1F670a52"
			)
		) {
			const tx = await raffleContract.initiateRaffleDrawing(itemId);
			await tx.wait();
		} else {
			console.log("Not allowed");
		}
	} catch (error) {
		console.log("error", error);
	}
};
