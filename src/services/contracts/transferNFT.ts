import { ethers, Contract } from "ethers";
import CONFIG from "../../config";

export const TransferNFT721 = async (setLoading: any) => {
  try {
    setLoading(true)
    const mywallet = '0x45b07A8080Ed16E7F43e2680542519b60B1c7F4f'
    const tokenContract = '0xe81788Ee64B306E30b3B15492DD6FBC0C0fcCc7f'
    const tokenId = 30
    const receiver = '0x91e71EbcF38b82e4d3084219f97f617022Af4de9'

    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();
    const TokenContract = new Contract(tokenContract, CONFIG.TOKENERC721, signer)
    const approveTx = await TokenContract.approve(receiver, tokenId)
    await approveTx.wait()

    const tx = await TokenContract.transferFrom(mywallet, receiver, tokenId)
    await tx.wait()


    setLoading(false)

  } catch (error) {
    console.log('error', error)
    setLoading(false)

  }
}

