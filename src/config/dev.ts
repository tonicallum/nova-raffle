import Raffle721Abi from "../constants/Raffle/RaffleErc721.json";
import TokenErc721 from "../constants/Token/Erc721Token.json";

export const Backend_URL = "https://novaraffle-b98cb5f11cc1.herokuapp.com";
// export const Backend_URL = 'http://localhost:5000'

export const API_URL = `${Backend_URL}/api`;

export const RAFFLE = {
	CONTRACTADDRESS721: `0xC30B7F9a1CaEb1FbfCBb948aaa66b780678B518c`,
	ABI721: Raffle721Abi,
};

export const AUCTION = {
	CONTRACTADDRESS721: `0x2F65d49b83bB2AD6bf32aadDc0F9B17167d09E9c`,
	CONTRACTADDRESS1155: `0xDa2c07fa6A7B093893a1eb6D701Cf54C2c07b06F`,
};

export const TOKENERC721 = TokenErc721;

export const TOAST_TIME_OUT = 2000;
export const INTERVAL = 6 * 1000;
export const DECIMAL = 1000000;
// export const CHAINID = '0x5' //Goerli
export const CHAINID = "0x89"; //Polygon mainnet
// export const CHAINID = "0x13881"; //polygon testnet

export const WALLET_STATUS_LOCALSTORAGE = "wallet";
export const WALLET_ADRESS_LOCALSTORAGE = "wallet_address";
export const DEFAUL_NONE_WINNER = "0x0000000000000000000000000000000000000000";
export const SIGN_KEY = "VERIFY WALLET";
