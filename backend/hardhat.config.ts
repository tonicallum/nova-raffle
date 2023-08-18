import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
	// defaultNetwork: "polygon_mumbai",
	networks: {
		hardhat: {},
		polygon_mumbai: {
			url: "https://rpc-mumbai.maticvigil.com",
			accounts: [process.env.PRIVATE_KEY ?? ""],
		},
		polygon_mainnet: {
			url: "https://polygon-rpc.com",
			accounts: [process.env.PRIVATE_KEY_MAINNET ?? ""],
		},
	},
	solidity: {
		version: "0.8.15",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	etherscan: {
		apiKey: process.env.POLYGONSCAN_API_KEY,
	},
};

export default config;
