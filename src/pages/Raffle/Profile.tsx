import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import Navbar from "../../components/Navbar";
import TwitterBlack from "../../assets/twitter-profile.png";
import DiscordBlack from "../../assets/discord-profile.png";
import infoIconBlack from "../../assets/InfoIconBlack.png";
import {
  createUser,
  getUser,
  checkDiscordStatus,
  checkTwitterStatus,
  disconnectSocial,
  getProfile,
} from "../../services/api";
import RaffleRarticipant from "./RaffleParticipant";
import { toast } from "react-toastify";
import CONFIG from "../../config";
import { delay } from "../../utils";

const RaffleProfile = () => {
  const [isLoading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(``);
  const [participantLists, setParticipantLists] = useState<any[]>([]);
  const [purchasedRaffles, setPurchasedRaffles] = useState<any>([]);
  const [favouriteRaffles, setFavouriteRaffles] = useState<any>([]);
  const [followRaffles, setFollowRaffles] = useState<any>([]);

  const storeData: any = useSelector((status) => status);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [discord, setDiscord] = useState("");
  const [twitter, setTwitter] = useState("");
  const [social, setSocial] = useState(false);
  const [raffleStats, setRaffleStats] = useState({
    raffleCreated: 0,
    ticketsSold: 0,
    salesVolume: 0,
    raffleBought: 0,
    ticketBought: 0,
    raffleWon: 0,
    purchaseVolume: 0,
  });
  const [isCreated, setCreated] = useState(true);
  const [isFavourited, setFavourited] = useState(false);
  const [isPurchased, setPurchased] = useState(false);
  const [isFollowed, setFollowed] = useState(false);

  const handleConnectDiscord = async () => {
    try {
      if (discord) {
        // toast.error(`You have already Discord Account`);
        // return;
        console.log("ssssssssss", discord)
        setLoading(true);
        await disconnectSocial(storeData.address, "discord");
        setDiscord("");
      } else {
        if (storeData.wallet !== "connected") {
          toast.error("Connect your Wallet!");
          return;
        }
        setLoading(true);
        let user = await getUser(storeData.address);
        let signedMessage = null;
        if (!user) {
          signedMessage = await window.ethereum.request({
            method: "personal_sign",
            params: ["Sign Message", storeData.address],
          });
        }
        const verifyToken: any = await createUser(
          storeData.address,
          signedMessage
        );
        localStorage.setItem("token", JSON.stringify(verifyToken));
        if (verifyToken) {
          const res = window.open(
            CONFIG.Backend_URL + "/api/oauth/discord?token=" + verifyToken
          );
          if (res) {
            setTimeout(() => {
              toast.error(`It's time out to discord connecting`);
              setLoading(false);
              return;
            }, 300 * 1000);
            for (let i = 0; i < 1; ) {
              const user: any = await getUser(storeData.address);
              await delay(5 * 1000);
              if (user.discordName) {
                setDiscord(user.discordName);
                toast.success(`Successfully connected`);
                break;
              }
            }
          }
        }
      }
      setLoading(false);
    } catch (error) {
      console.log("error", error);
      setLoading(false);
    }
  };

  const handleConnectTwitter = async () => {
    try {
      if (twitter) {
        // toast.error(`You have already Twitter Account`);
        // return;
        setLoading(true);
        await disconnectSocial(storeData.address, "twitter");
        setTwitter("");
      } else {
        if (storeData.wallet !== `connected`) {
          toast.error("Connect your Wallet!");
          return;
        }
        let user = await getUser(storeData.address);
        let signedMessage = null;
        if (!user) {
          signedMessage = await window.ethereum.request({
            method: "personal_sign",
            params: ["Sign Message", storeData.address],
          });
        }
        const verifyToken: any = await createUser(
          storeData.address,
          signedMessage
        );
        localStorage.setItem("token", JSON.stringify(verifyToken));
        setToken(verifyToken);
        if (verifyToken) {
          window.open(
            CONFIG.Backend_URL + "/api/oauth/twitter?token=" + verifyToken
          );
          setSocial(!social);
        }
      }
      setLoading(false);
    } catch (error) {
      console.log("error", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (storeData.wallet !== "connected") return;
      const discord: any = await checkDiscordStatus(storeData.address);
      if (discord) setDiscord(discord);
      const twitter: any = await checkTwitterStatus(storeData.address);
      if (twitter) setTwitter(twitter);
    })();
  }, [storeData, token, social]);

  useEffect(() => {
    (async () => {
      try {
        if (storeData.wallet === "connected") {
          setLoading(true);
          setWalletAddress(storeData.address);
          const profile: any = await getProfile(storeData.address);
          setParticipantLists(profile.myRaffles);
          setFavouriteRaffles([...profile.favoriteRaffles]);
          setFollowRaffles([...profile.followedRaffles]);
          setPurchasedRaffles([...profile.purchasedRaffles]);
          setRaffleStats({
            ...raffleStats,
            raffleCreated: profile.raffleCreated,
            ticketsSold: profile.ticketsSold,
            salesVolume: profile.salesVolume,
            raffleBought: profile.raffleBought,
            ticketBought: profile.ticketBought,
            raffleWon: profile.raffleWon,
            purchaseVolume: profile.purchaseVolume,
          });

          setLoading(false);
        }
      } catch (error) {
        console.log("error", error);
        setLoading(false);
      }
    })();
  }, [storeData]);

  const handleCreateRaffle = () => {
    setCreated(true);
    setPurchased(false);
    setFavourited(false);
    setFollowed(false);
  };

  const handlePurchasedRaffle = () => {
    setCreated(false);
    setPurchased(true);
    setFavourited(false);
    setFollowed(false);
  };

  const handleFavouriteRaffle = () => {
    setCreated(false);
    setPurchased(false);
    setFavourited(true);
    setFollowed(false);
  };

  const handleFollowRaffle = () => {
    setCreated(false);
    setPurchased(false);
    setFavourited(false);
    setFollowed(true);
  };
  return (
    <>
      {isLoading ? (
        <div id="preloader"></div>
      ) : (
        <div id="preloader" style={{ display: "none" }}></div>
      )}
      <Navbar />
      <div className="md:flex gap-[32px] mt-4">
        <div className=" w-full md:w-[30%] border-white border-b-2 px-[16px] ">
          <div className=" py-5 px-4 rounded-[16px] border-[1px] border-[solid] border-[#ECECEC] navbar-shadow ">
            <div className=" text-[24px] text-[#8652FF]">
              {walletAddress?.substr(0, 6) +
                "..." +
                walletAddress?.substr(walletAddress.length - 4, 4)}
            </div>

            <div className="flex flex-col lg:flex-row items-center">
              <div className="flex flex-col items-center mb-4 sm:mb-0">
                <button
                  type="button"
                  className="py-3 px-4 bg-[#03A9F4] rounded-md flex items-center"
                  onClick={handleConnectTwitter}
                >
                  <img
                    src={TwitterBlack}
                    alt="TwitterBlack"
                    className="w-[25px]"
                  />
                  <span className="ml-3 text-white ">
                    {twitter ? twitter : "Link Twitter"}
                  </span>
                </button>

                {twitter ? (
                  <p className="text-red-500 mt-2">Disconnect</p>
                ) : (
                  <p
                    className={`text-red-500 mt-2 ${!twitter && "text-white"}`}
                  >
                    Disconnect
                  </p>
                )}
              </div>

              <div className="flex flex-col items-center">
                <button
                  type="button"
                  className="py-3 px-4 bg-[#5865F2] rounded-md flex items-center ml-4"
                  onClick={handleConnectDiscord}
                >
                  <img
                    src={DiscordBlack}
                    alt="TwitterBlack"
                    className="w-[25px]"
                  />
                  <span className="ml-3 text-white ">
                    {discord ? discord : "Link Discord"}
                  </span>
                </button>

                {discord ? (
                  <p className="text-red-500 mt-2">Disconnect</p>
                ) : (
                  <p
                    className={`text-red-500 mt-2 ${!discord && "text-white"}`}
                  >
                    Disconnect
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white p-[24px] rounded-[16px] border-[1px] border-[solid] border-[#ECECEC] navbar-shadow mt-[30px]">
            <div
              className={` ${
                isCreated ? `bg-[#8652FF60] ` : ``
              }  text-black py-[14px] px-[20px] cursor-pointer rounded-lg `}
              onClick={handleCreateRaffle}
            >
              Raffles Created
            </div>
            <div
              className={` ${
                isPurchased ? `bg-[#8652FF60]  ` : ``
              } text-black py-[14px] px-[20px] cursor-pointer rounded-lg `}
              onClick={handlePurchasedRaffle}
            >
              Raffles Purchased
            </div>
            <div
              className={` ${
                isFavourited ? `bg-[#8652FF60]  ` : ``
              } text-black py-[14px] px-[20px] cursor-pointer rounded-lg `}
              onClick={handleFavouriteRaffle}
            >
              Favorite Raffles
            </div>
            <div
              className={` ${
                isFollowed ? `bg-[#8652FF60]  ` : ``
              } text-black py-[14px] px-[20px] cursor-pointer rounded-lg `}
              onClick={handleFollowRaffle}
            >
              Followed Raffles
            </div>
          </div>

          <div className="flex flex-col gap-[25px] bg-white p-[24px] rounded-[16px] border-[1px] border-[solid] border-[#ECECEC] navbar-shadow mt-[30px]">
            <h2 className="text-[32px] font-medium text-[#1A1A1A] ">
              Raffle Stats
            </h2>
            <div className="flex flex-col gap-[8px]">
              <p className="text-[#1A1A1A] text-[24px]">Raffles Created</p>
              {/* <p className='text-[#8652FF] text-[26px] ' >{raffleStats.raffleBought}</p> */}
              <p className="text-[#8652FF] text-[26px]">
                {raffleStats.raffleCreated ? raffleStats?.raffleCreated : 0}{" "}
              </p>
            </div>
            <div className="flex flex-col gap-[8px]">
              <p className="text-[#1A1A1A] text-[24px]">Tickets Sold</p>
              {/* <p className='text-[#8652FF] text-[26px] ' >{raffleStats.raffleBought}</p> */}
              <p className="text-[#8652FF] text-[26px]">
                {raffleStats.ticketsSold}{" "}
              </p>
            </div>
            <div className="flex flex-col gap-[8px]">
              <p className="text-[#1A1A1A] text-[24px]">Sales Volume</p>
              {/* <p className='text-[#8652FF] text-[26px] ' >{raffleStats.raffleBought}</p> */}
              <p className="text-[#8652FF] text-[26px]">
                {raffleStats.salesVolume * 10 ** 12}
              </p>
            </div>
            <div className="flex flex-col gap-[8px]">
              <p className="text-[#1A1A1A] text-[24px]">Raffles Bought</p>
              {/* <p className='text-[#8652FF] text-[26px] ' >{raffleStats.raffleBought}</p> */}
              <p className="text-[#8652FF] text-[26px]">
                {raffleStats.raffleBought}
              </p>
            </div>
            <div className="flex flex-col gap-[8px]">
              <p className="text-[#1A1A1A] text-[24px]">Tickets Bought</p>
              <p className="text-[#8652FF] text-[26px]">
                {raffleStats.ticketBought ? raffleStats.ticketBought : 0}
              </p>
            </div>
            <div className="flex flex-col gap-[8px]">
              <p className="text-[#1A1A1A] text-[24px]">Raffles Won</p>
              <p className="text-[#8652FF] text-[26px]">
                {raffleStats.raffleWon}
              </p>
            </div>
            <div className="flex flex-col gap-[8px]">
              <p className="text-[#1A1A1A] text-[24px]">Purchase Volume</p>
              <p className="text-[#8652FF] text-[26px]">
                {raffleStats.purchaseVolume * 10 ** 12}
              </p>
            </div>
          </div>
        </div>

        <div className=" w-full md:w-[70%]">
          {isCreated &&
            (participantLists.length > 0 ? (
              participantLists.map((item: any, idx: any) => (
                <RaffleRarticipant item={item} idx={idx} key={idx} mode={1} />
              ))
            ) : isLoading ? (
              <></>
            ) : (
              <div className="max-w-[1280px] m-auto px-4">
                <div className="bg-white rounded-md py-8 px-8 flex items-center">
                  <img src={infoIconBlack} alt="infoIconBlack" />
                  <h1 className="xl:text-[3.2rem] lg:text-[2.5rem] md:text-[1.8rem] ml-10">
                    You haven’t created any Raffles!
                  </h1>
                </div>
              </div>
            ))}

          {isPurchased &&
            (purchasedRaffles.length > 0 ? (
              purchasedRaffles.map((item: any, idx: any) => (
                <RaffleRarticipant item={item} idx={idx} key={idx} />
              ))
            ) : isLoading ? (
              <></>
            ) : (
              <div className="max-w-[1280px] m-auto px-4">
                <div className="bg-white rounded-md py-8 px-8 flex items-center">
                  <img src={infoIconBlack} alt="infoIconBlack" />
                  <h1 className="xl:text-[3.2rem] lg:text-[2.5rem] md:text-[1.8rem] ml-10">
                    You haven’t participated in any Raffles!
                  </h1>
                </div>
              </div>
            ))}

          {isFavourited &&
            (favouriteRaffles.length > 0 ? (
              favouriteRaffles.map((item: any, idx: any) => (
                <RaffleRarticipant item={item} idx={idx} key={idx} />
              ))
            ) : isLoading ? (
              <></>
            ) : (
              <div className="max-w-[1280px] m-auto px-4">
                <div className="bg-white rounded-md py-8 px-8 flex items-center">
                  <img src={infoIconBlack} alt="infoIconBlack" />
                  <h1 className="xl:text-[3.2rem] lg:text-[2.5rem] md:text-[1.8rem] ml-10">
                    You don't have any favourite Raffles!
                  </h1>
                </div>
              </div>
            ))}

          {isFollowed &&
            (followRaffles.length > 0 ? (
              followRaffles.map((item: any, idx: any) => (
                <RaffleRarticipant item={item} idx={idx} key={idx} />
              ))
            ) : isLoading ? (
              <></>
            ) : (
              <div className="max-w-[1280px] m-auto px-4">
                <div className="bg-white rounded-md py-8 px-8 flex items-center">
                  <img src={infoIconBlack} alt="infoIconBlack" />
                  <h1 className="xl:text-[3.2rem] lg:text-[2.5rem] md:text-[1.8rem] ml-10">
                    You haven’t followed any Raffles!
                  </h1>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default RaffleProfile;
