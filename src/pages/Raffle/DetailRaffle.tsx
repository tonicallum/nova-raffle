import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Countdown, { CountdownApi } from "react-countdown";

import Navbar from "../../components/Navbar";
import {
  createTicketTransaction,
  deleteRaffle,
  getRaffleById,
  getTicketsById,
  getUser,
} from "../../services/api";

import ReturnIcon from "../../assets/detailpage/return-icon.svg";
import ShareIcon from "../../assets/Share-icon.png";
import PricetagIcon from "../../assets/detailpage/per-ticket.svg";
import VerificationIcon from "../../assets/verification-icon.svg";

import TimingIcon from "../../assets/detailpage/time-icon.svg";
import TicketIcon from "../../assets/detailpage/ticketSelling-icon.svg";
import DateIcon from "../../assets/detailpage/startDate-icon.svg";
import WinningIcon from "../../assets/detailpage/winning-icon.svg";
import TicketOwnedIcon from "../../assets/detailpage/ticketsOwned-icon.svg";
import HoldersIcon from "../../assets/detailpage/holder-icon.svg";

import OpenSeaIcon from "../../assets/opensea-icon.svg";
import MagicEdenIcon from "../../assets/magic-icon.png";
import PolygonIcon from "../../assets/polygon-icon.svg";
import IdCardIcon from "../../assets/idcard.svg";
import DiscordIcon from "../../assets/discord.svg";
import TwitterIcon from "../../assets/twitter.svg";

import {
  buyTicket,
  claimWinnings,
  CancelRaffleContract,
} from "../../services/contracts/raffle";
import { connectedChain, getBalance } from "../../utils";
import { API_URL, TOAST_TIME_OUT } from "../../config/dev";
import axios from "axios";

const DetailRaffle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const storeData: any = useSelector((status) => status);
  const [isLoading, setLoading] = useState(false);
  const [nftInfo, setNftInfo] = useState<any>([]);
  const [amount, setAmount] = useState(0);
  const [raffleStatus, setRaffleStatus] = useState(0);
  const [buyStatus, setBuyStatus] = useState(0);
  const [raffleInfo, showraffleInfo] = React.useState<string>("raffleinfo");
  const [currentBuyTicket, setCurrnetBuyTicket] = useState(0);
  const [isWinner, setWinner] = useState(false);
  const [winnerAddress, setWinnerAddress] = useState("");
  const [isclaimWinnings, setClaimWinning] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [ticketsOwned, setTicketsOwned] = useState(0);
  const [ticketBuyerLists, setTicketBuyerLists] = useState<any>([]);
  const [ticketHolder, setTicketHolder] = useState(0);
  const [winningChance, setWinningChance] = useState(0);
  const [ShowCreator, setShowCreator] = useState("");
  const [isDiscord, setDiscord] = useState(false);
  const [isTwitter, setTwitter] = useState(false);

  let startCountdownApi: CountdownApi | null = null;
  let countdownEndApi: CountdownApi | null = null;

  const setStartCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      startCountdownApi = countdown.getApi();
    }
  };

  const handleFollow = async (id: any, follow: boolean) => {
    try {
      const res = await axios.post(`${API_URL}/raffle/updateUserFollow`, {
        id: id,
        follow: follow,
        walletAddress: storeData.address,
      });
      setNftInfo({ ...nftInfo, followed: follow });
    } catch (error) {
      console.log("error", error);
    }
  };

  const setEndCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      countdownEndApi = countdown.getApi();
    }
  };

  const startCountdownRenderer = ({
    api,
    days,
    hours,
    minutes,
    seconds,
    completed,
  }: any) => {
    if (api.isPaused()) api.start();
    return completed ? (
      <Countdown
        ref={setEndCountdownRef}
        date={nftInfo.end_date * 1000}
        zeroPadTime={3}
        onComplete={handleTickedEndedTime}
        renderer={countdownEndRenderer}
      />
    ) : (
      <div className="flex  justify-center gap-1 text-white text-[15px] sm:text-[18px] font-semibold">
        {nftInfo ? (
          <>
            <p>Starts In</p>
            <p>
              {days.toString().length === 1 ? `0${days}` : days}:
              {hours.toString().length === 1 ? `0${hours}` : hours}:
              {minutes.toString().length === 1 ? `0${minutes}` : minutes}:
              {seconds.toString().length === 1 ? `0${seconds}` : seconds}
            </p>
          </>
        ) : (
          <p>loading...</p>
        )}
      </div>
    );
  };

  const countdownEndRenderer = ({
    api,
    days,
    hours,
    minutes,
    seconds,
    completed,
  }: any) => {
    if (api.isPaused()) api.start();
    return completed ? (
      <p className="text-[15px] sm:text-[18px] font-semibold">
        {nftInfo.end_date ? ` ENDED` : `loading...`}
      </p>
    ) : (
      <div className="flex  justify-center gap-1 text-white text-[15px] sm:text-[18px] font-semibold">
        <p>End in</p>
        <p>
          {days.toString().length === 1 ? `0${days}` : days}:
          {hours.toString().length === 1 ? `0${hours}` : hours}:
          {minutes.toString().length === 1 ? `0${minutes}` : minutes}:
          {seconds.toString().length === 1 ? `0${seconds}` : seconds}
        </p>
      </div>
    );
  };

  const handleBuyTicket = async () => {
    try {
      const chainStatus = await connectedChain();
      if (!chainStatus) return;

      if (raffleStatus === 2 || raffleStatus === 0) {
        toast.error(`You can not buy ticket now`);
        return;
      }

      if (storeData.wallet !== "connected") {
        toast.error(`Please connect your wallet`);
        return;
      }

      if (nftInfo.walletAddress === storeData.address) {
        toast.error("You cannot Buy The Raffle Which You Created");
        return;
      }

      const walletBalance: any = await getBalance();
      if (walletBalance < nftInfo.price * amount) {
        toast.error(`Wallet Balance must bigger than buy price`);
        return;
      }

      if (amount > nftInfo.total_tickets - currentBuyTicket) {
        toast.error(`Amount must be smaller than Max Amount`);
        return;
      }

      if (amount <= 0) {
        toast.error(`Amount must be bigger than 0`);
        return;
      }

      setLoading(true);

      const buyTicketTx = await buyTicket(
        nftInfo.raffleId,
        amount,
        nftInfo.price * amount
      );

      if (buyTicketTx) {
        const payload: any = {
          raffle_id: id,
          amount: amount,
          buyer: storeData.address.toLowerCase(),
          token_address: nftInfo.tokenAddress.toLowerCase(),
          token_id: nftInfo.tokenId,
        };
        console.log("payload", payload);
        const res = await createTicketTransaction(payload);
        if (res) {
          toast.success(`Success In Buying Ticket `);
          setCurrnetBuyTicket(currentBuyTicket + amount);
          setTicketsOwned(ticketsOwned + amount);
          if (!ticketBuyerLists.includes(storeData.address.toLowerCase())) {
            setTicketHolder(ticketHolder + 1);
          }
          const getWinningChance =
            (100 * (ticketsOwned + amount)) / (nftInfo.sold_tickets + amount);
          setWinningChance(getWinningChance);
          setBuyStatus(1);
          if (buyStatus === 0) {
            const findIdx = ticketBuyerLists.findIndex(
              (item: any) =>
                item?.buyer.toString().toLowerCase() ===
                storeData.address.toLowerCase()
            );

            if (findIdx === -1) {
              setTicketBuyerLists([
                ...ticketBuyerLists,
                {
                  buyer: storeData.address,
                  amount: amount,
                },
              ]);
            } else {
              const new_buyerLists = ticketBuyerLists.map(
                (item: any, idx: any) => {
                  return idx === findIdx
                    ? {
                        ...ticketBuyerLists[findIdx],
                        amount: item.amount + Number(amount),
                      }
                    : item;
                }
              );
              setTicketBuyerLists(new_buyerLists);
            }
          } else if (buyStatus === 1) {
            const findIdx = ticketBuyerLists.findIndex(
              (item: any) =>
                item?.buyer.toString().toLowerCase() ===
                storeData.address.toLowerCase()
            );

            const new_buyerLists = ticketBuyerLists.map(
              (item: any, idx: any) => {
                return idx === findIdx
                  ? {
                      ...ticketBuyerLists[findIdx],
                      amount: item.amount + Number(amount),
                    }
                  : item;
              }
            );
            setTicketBuyerLists(new_buyerLists);
          }
        } else {
          toast.error(`Error In Buying Ticket`);
        }
      }
      setLoading(false);
    } catch (error) {
      console.log("error", error);
      toast.error(`Error In Buying Ticket`);
      setLoading(false);
    }
  };

  const getRaffleStatus = (nftInfo: any) => {
    const currentTime = Math.floor(Date.now() / 1000);
    let status = 0;
    if (currentTime > nftInfo.end_date) {
      status = 2;
    } else if (currentTime >= nftInfo.start_date) {
      status = 1;
    }
    setRaffleStatus(status);
  };

  const handleTickedEndedTime = async () => {
    try {
      console.log("handleTickedEndedTime");
      setLoading(true);
      const nftInfoById: any = await getRaffleById(id); //data base se araha
      setWinnerAddress(nftInfoById.winnerAddress);
      if (
        nftInfoById.winnerAddress.toLowerCase() ===
        storeData.address.toString().toLowerCase()
      ) {
        setWinner(true);
      }
      setRaffleStatus(2);
      setLoading(false);
    } catch (error) {
      console.log("error", error);
      setLoading(false);
    }
  };

  const BuyStatus = () => {
    return (
      <>
        {raffleStatus === 0 && (
          <p className="text-black text-[1.25rem] text-center"></p>
        )}

        {raffleStatus === 1 && buyStatus === 0 && (
          <p className="text-black text-[1.25rem] text-center"></p>
        )}

        {raffleStatus === 1 && buyStatus === 1 && (
          <p className="text-black text-[1.25rem] text-center"></p>
        )}

        {raffleStatus === 2 && (
          <div className="flex flex-col gap-2">
            {storeData.address.toLowerCase() === winnerAddress.toLowerCase() ? (
              <p className="text-[#8652FF] text-xl text-center font-bold">
                You Won!
              </p>
            ) : (
              <>
                <p className="text-[#8652FF] text-[0.75rem] text-center">
                  Raffle Winner
                </p>
                <a href={`/profile/raffle/${winnerAddress}`}>
                  <p className="text-[#8652FF] text-[1.25rem] text-center">
                    {winnerAddress
                      ? winnerAddress?.substr(0, 6) +
                        "..." +
                        winnerAddress?.substr(storeData?.address.length - 4, 4)
                      : ``}
                  </p>
                </a>
              </>
            )}
            {isWinner && (
              <button className="w-[60%] rounder-[14px] mx-auto text-white bg-[#8652FF] rounded-[0.7rem] py-3 sm:px-5 button-hover">
                Claim Winnings
              </button>
            )}
          </div>
        )}
      </>
    );
  };

  const handleclaimWinnings = async () => {
    console.log("type of winner Address", winnerAddress);
    console.log("type of storage wallet", storeData.address);

    const tx = await claimWinnings(nftInfo.raffleId);
    if (tx) {
      setClaimWinning(true);
      toast.success("Reward Claiming Successfull");
    } else {
      toast.error("Error In Reward Claiming");
    }
  };

  const handleRaffleDeleteBtn = async () => {
    try {
      const chainStatus = await connectedChain();
      if (!chainStatus) return;

      setLoading(true);

      let raffleDeleteTx;
      raffleDeleteTx = await CancelRaffleContract(nftInfo.raffleId);
      if (raffleDeleteTx) {
        const res = await deleteRaffle(id);
        if (res) {
          toast.success("Raffle Deleted Successfully", {
            onClose: () => {
              setTimeout(() => {
                navigate("/");
              }, TOAST_TIME_OUT);
            },
          });
        } else {
          toast.error("Error in Delete Raffle");
        }
      }

      setLoading(false);
    } catch (error) {
      console.log("error", error);
      setLoading(false);
      toast.error("Error in delete raffle");
    }
  };

  function formatAddress(address: string): string {
    const firstChars = address.slice(0, 3);
    const lastChars = address.slice(-4);
    return `${firstChars}...${lastChars}`;
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        console.log("win status", isclaimWinnings);
        const nftInfoById: any = await getRaffleById(id); //data base se araha
        console.log("from db : ", nftInfoById);
        const dateFormat = new Date(nftInfoById.start_date * 1000);
        const result_date =
          dateFormat.getMonth() +
          1 +
          "/" +
          dateFormat.getDate() +
          "/" +
          dateFormat.getFullYear() +
          " " +
          dateFormat.getHours() +
          ":" +
          dateFormat.getMinutes();

        setNftInfo({
          ...nftInfoById,
          followed: nftInfoById.follow.includes(
            storeData.address.toLowerCase()
          ),
          _id: nftInfoById._id,
          project: nftInfoById.project,
          price: nftInfoById.price,
          tokenAddress: nftInfoById.tokenAddress,
          tokenId: nftInfoById.tokenId,
          start: result_date,
          state: nftInfoById.state,
          nftName: nftInfoById.name,
        });
        getRaffleStatus(nftInfoById);
        setCurrnetBuyTicket(nftInfoById.sold_tickets);

        const getWalletBalance: any = await getBalance();
        setWalletBalance(getWalletBalance);

        if (
          nftInfoById.start_date * 1000 > Date.now() &&
          nftInfoById.walletAddress.toString().toLowerCase() ===
            storeData.address.toLowerCase()
        ) {
          setShowEdit(true);
        }

        const getTicketByID: any = await getTicketsById(nftInfoById._id);
        const filter_myTickets = getTicketByID.find(
          (item: any) =>
            item.buyer.toString().toLowerCase() ===
            storeData.address.toLowerCase()
        );
        const resTicketsOwned = filter_myTickets?.amount
          ? filter_myTickets?.amount
          : 0;

        if (resTicketsOwned > 0) {
          setBuyStatus(1);
        } else {
          setBuyStatus(0);
        }
        const getWinningChance =
          (100 * resTicketsOwned) / nftInfoById.sold_tickets;
        setWinningChance(getWinningChance);
        setTicketsOwned(resTicketsOwned);
        setTicketHolder(getTicketByID.length);
        setTicketBuyerLists(getTicketByID);
        console.log("winner : ", nftInfoById.winnerAddress);
        setWinnerAddress(nftInfoById.winnerAddress);

        const user: any = await getUser(nftInfoById.walletAddress);
        console.log("user data", user);

        if (user) {
          if (user.discordName) {
            setDiscord(true);
          }

          if (user.twitterName) {
            setTwitter(true);
            setShowCreator(user.twitterName);
          } else if (user.discordName) {
            setDiscord(true);
            setShowCreator(user.discordName);
          } else {
            setShowCreator(formatAddress(nftInfoById.walletAddress));
          }
        } else {
          setShowCreator(formatAddress(nftInfoById.walletAddress));
        }
        setLoading(false);
      } catch (error) {
        console.log("error", error);
        setLoading(false);
      }
    })();
  }, [storeData, raffleInfo, id,isclaimWinnings]);

  

  return (
    <div>
      {isLoading ? (
        <div id="preloader"></div>
      ) : (
        <div id="preloader" style={{ display: "none" }}></div>
      )}
      <div className="bg-white">
        <Navbar />
        <div className="max-w-[1240px] m-auto pt-8 pb-16 px-4">
          <div className="xl:flex justify-between block">
            {/* Info Left  */}
            <div className="xl:basis-[35%] max-w-[450px] m-auto xl:max-w-auto xl:m-0 pb-6 xl:pb-0">
              <div className="rounded-[0.9rem] overflow-hidden border-4 border-[white] nftItem-shadow">
                <div className="relative">
                  <img
                    src={nftInfo.image}
                    alt="CoodeImage"
                    className="min-h-[360px] object-cover"
                  />
                </div>
                <div className="p-3">
                  <div className="flex flex-col gap-[16px] bg-white p-[18px] ">
                    <button
                      type="button"
                      className="bg-white-500 shadow-lg shadow-white-500/50 text-black bg-white rounded-[0.7rem] flex items-center py-3 px-5 "
                    >
                      <img
                        src={PricetagIcon}
                        alt="Pricetag-icon"
                        className="w-[22px]"
                      />

                      <span className=" flex items-center gap-1 ml-3 text-lg">
                        <span>Price:</span>
                        <span className="font-medium">
                          {nftInfo.price} MATIC
                        </span>
                        <span>per Ticket</span>
                      </span>
                    </button>

                    {raffleStatus !== 2 && (
                      <div className="relative">
                        <div className="flex items-center justify-between gap-[8px] ">
                          <input
                            type="text"
                            name="solValue"
                            value={amount}
                            placeholder="QTY"
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              const maxAllowed =
                                nftInfo.total_tickets - currentBuyTicket; // Replace with actual property name
                              if (
                                Number(inputValue) >= 0 &&
                                Number(inputValue) <= maxAllowed
                              ) {
                                setAmount(Number(inputValue));
                              }
                            }}
                            className="w-[20%] block text-[#000] text-base text-center outline-none bg-[#82828240] border border-[#ECECEC] rounded-[0.7rem] py-3 px-5"
                            disabled={raffleStatus !== 1}
                          />
                          <button
                            type="button"
                            onClick={handleBuyTicket}
                            className="w-[60%] rounder-[14px] text-white bg-[#8652FF] rounded-[0.7rem] py-3 sm:px-5 button-hover "
                          >
                            <span className="text-center sm:text-lg text-sm text-white">
                              Buy for {(amount * nftInfo.price).toFixed(2)}{" "}
                              MATIC
                            </span>
                          </button>
                          <button
                            type="button"
                            className="text-black bg-white rounded-[0.7rem] flex items-center justify-center py-3 px-5 nftItem-shadow"
                          >
                            <img
                              src={ShareIcon}
                              alt="Pricetag-icon"
                              className="w-[22px]"
                            />
                          </button>
                        </div>

                        <div className="relative">
                          <p className="text-[#8652FF] text-center mt-2 ">
                            You have:{" "}
                            {walletBalance
                              ? (
                                  walletBalance -
                                  amount * nftInfo.price
                                ).toFixed(2)
                              : 0}{" "}
                            MATIC{" "}
                          </p>
                        </div>
                      </div>
                    )}

                    {isWinner === true ? (
                      // <p className="text-[#8652FF] text-[1.25rem] text-center">Win</p>
                      <div className="flex flex-col gap-2">
                        {storeData.address.toLowerCase() ===
                        winnerAddress.toLowerCase() ? (
                          <p className="text-[#8652FF] text-xl text-center font-bold">
                            You Won!
                          </p>
                        ) : (
                          <>
                            <p className="text-[#8652FF] text-[0.75rem] text-center">
                              Raffle Winner
                            </p>
                            <a href={`/profile/raffle/${winnerAddress}`}>
                              <p className="text-[#8652FF] text-[1.25rem] text-center">
                                {winnerAddress
                                  ? winnerAddress?.substr(0, 6) +
                                    "..." +
                                    winnerAddress?.substr(
                                      storeData?.address.length - 4,
                                      4
                                    )
                                  : ``}
                              </p>
                            </a>
                          </>
                        )}

                        {nftInfo.state!=4 && //added this beacause button was visible even after claiming 
                          storeData.address.toLowerCase() ===
                            winnerAddress.toLowerCase() && (
                            <button
                              className="w-[60%] rounder-[14px] mx-auto text-white bg-[#8652FF] rounded-[0.7rem] py-3 sm:px-5 button-hover"
                              onClick={handleclaimWinnings}
                            >
                              Claim Winnings
                            </button>
                          )}
                      </div>
                    ) : raffleStatus === 0 ? (
                      <p className="text-black text-[1.25rem] text-center"></p>
                    ) : (
                      <BuyStatus />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Right  */}
            <div className="basis-[63%]">
              <div className="border-4 border-[white] rounded-[0.9rem]  nftItem-shadow">
                <div className="flex justify-between p-4">
                  <div>
                    <div className="flex items-center">
                      <p className="text-[#1A1A1A]">{nftInfo.project}</p>
                      <img
                        src={VerificationIcon}
                        alt="VerificationIcon"
                        className="w-[20px] ml-1"
                      />
                    </div>
                    <h1 className="text-[24px] text-[#1A1A1A] mt-1">
                      {nftInfo.nftName}
                    </h1>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://opensea.io/assets/ethereum/${nftInfo.tokenAddress}/${nftInfo.tokenId}`}
                        target="_blank"
                      >
                        <img src={OpenSeaIcon} className="w-[25px]" />
                      </a>
                      <a
                        href={`https://magiceden.io/item-details/polygon/${nftInfo.tokenAddress}/${nftInfo.tokenId}`}
                        target="_blank"
                      >
                        <img src={MagicEdenIcon} className="w-[25px]" />
                      </a>
                      <a
                        href={`https://mumbai.polygonscan.com/token/${nftInfo.tokenAddress}?a=${nftInfo.tokenId}}#inventory`}
                        target="_blank"
                      >
                        <img src={PolygonIcon} className="w-[25px]" />
                      </a>
                    </div>
                    <div className="flex items-center mt-4">
                      <button
                        type="button"
                        className={`${
                          raffleInfo === "raffleinfo"
                            ? "border border-white bg-[#8652FF] text-white py-2 rounded-[0.6rem] sm:px-4 px-2 text-sm sm:text-base"
                            : "text-[#666666]  sm:px-4 hover:rounded-[0.6rem] hover:text-[#8652FF] hover:py-[8px] hover:border-[1px] hover:border-solid hover:border-[#8652FF]"
                        } `}
                        onClick={() => showraffleInfo("raffleinfo")}
                      >
                        Raffle Info
                      </button>
                      <button
                        type="button"
                        onClick={() => showraffleInfo("participants")}
                        // className="ml-3 text-white py-2 rounded-[0.6rem] px-4"
                        className={`${
                          raffleInfo === "participants"
                            ? "border border-white bg-[#8652FF] text-white py-2 rounded-[0.6rem] sm:px-4 px-2 text-sm sm:text-base"
                            : "text-[#666666]  sm:px-4 px-2 hover:rounded-[0.6rem]  hover:text-[#8652FF] hover:py-[8px]  hover:border-[1px] hover:border-solid hover:border-[#8652FF]"
                        } `}
                      >
                        Participants
                      </button>
                    </div>
                  </div>
                  <div>
                    <Link to="/">
                      <div className="flex items-center mb-2">
                        <img src={ReturnIcon} alt="ReturnIcon" />
                        <span className="text-[black] inline-block ml-1 font-medium ">
                          Return
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
                <div className="h-[2px] w-[95%] m-auto bg-[#606060]"></div>
                {raffleInfo === "raffleinfo" && (
                  <div className="bg-[#8652FF] rounded-[16px] py-4 px-4 sm:px-0 mt-4">
                    <div className="relative flex  justify-between  sm:w-[85%] m-auto">
                      <div className="text-center w-[150px] sm:w-[180px] min-h-[110px] items-center">
                        <img
                          src={TimingIcon}
                          alt="TimingIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[white] invisible ">Time Remaining</p>
                        <p className="text-white ">
                          {nftInfo?.end_date && (
                            <Countdown
                              ref={setStartCountdownRef}
                              date={nftInfo?.start_date * 1000}
                              zeroPadTime={3}
                              renderer={startCountdownRenderer}
                              onComplete={() => {
                                setRaffleStatus(1);
                                setShowEdit(false);
                              }}
                            />
                          )}
                        </p>
                      </div>
                      <div
                        className={`
                        absolute left-[50%] translate-x-[-50%]
                        text-center
                        `}
                      >
                        <img
                          src={TicketIcon}
                          alt="TimingIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[white]">Tickets Remaining</p>
                        <p className="text-white text-[15px] sm:text-[18px] font-semibold ">
                          {nftInfo.total_tickets
                            ? nftInfo.total_tickets - currentBuyTicket
                            : 0}
                          /{nftInfo.total_tickets}
                        </p>
                      </div>
                      <div
                        className={`
                        absolute w-[150px] sm:w-[200px] left-[49%] sm:left-[52%] translate-x-[63%] text-center
                        `}
                      >
                        <img
                          src={TicketOwnedIcon}
                          alt="TimingIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[white]">Tickets Owned</p>
                        <p className="text-white text-[15px] sm:text-[18px] font-semibold">
                          {ticketsOwned}
                        </p>
                      </div>

                      <div className="absolute left-[33%] md: border-l-[1px] bg-[transparent] w-2 border-dashed h-[108px] border-white  " />
                      <div className="absolute left-[66%] md: border-l-[1px] bg-[transparent] w-2 border-dashed h-[108px] border-white  " />
                    </div>

                    <div className="relative  flex justify-between sm:w-[85%] m-auto mt-6 ">
                      <div className="text-center w-[150px] sm:w-[180px] min-h-[110px] ">
                        <img
                          src={DateIcon}
                          alt="TimingIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[white]">Start Date</p>
                        <p className="text-white text-[15px] sm:text-[18px] font-semibold">
                          {nftInfo?.start}
                        </p>
                      </div>

                      <div
                        className="absolute left-[50%] translate-x-[-50%]
                        text-center"
                      >
                        <img
                          src={HoldersIcon}
                          alt="TimingIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[white] text-[15px] sm:text-[16px]">Unique Ticket Holders</p>
                        <p className="text-white text-[15px] sm:text-[18px] font-semibold">
                          {ticketHolder}
                        </p>
                      </div>
                      <div className="  absolute  w-[150px] sm:w-[200px] left-[49%] sm:left-[52%] translate-x-[63%] text-center">
                        <img
                          src={WinningIcon}
                          alt="TimingIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[white]">Winning Chance</p>
                        <p className="text-white text-[15px] sm:text-[18px] font-semibold">
                          {winningChance ? winningChance.toFixed(2) : 0}%
                        </p>
                      </div>
                      <div className="absolute left-[33%] md: border-l-[1px] bg-[transparent] w-2 border-dashed h-[108px] border-white  " />
                      <div className="absolute left-[66%] md: border-l-[1px] bg-[transparent] w-2 border-dashed h-[108px] border-white  " />
                    </div>
                  </div>
                )}

                {raffleInfo === "participants" && (
                  <div
                    className="text-white max-h-[447px] overflow-y-auto bg-[#ECECEC] mt-4 "
                    id="wallet-list"
                  >
                    <ul className="py-3 px-4 w-full flex justify-between">
                      <li className="basis-[50%] text-[24px] text-[#1A1A1A] ">
                        User
                      </li>
                      <li className="basis-[50%] text-[24px] text-[#1A1A1A] text-center">
                        Tickets Bought
                      </li>
                    </ul>
                    {ticketBuyerLists.map((item: any, idx: any) => {
                      return (
                        <ul
                          key={idx}
                          className={`px-4 w-full flex justify-between pt-0 ${
                            idx % 2 === 0 ? "bg-[#CCCBD2]" : ""
                          } `}
                        >
                          <li className="basis-[50%] text-[#666] text-[14px]">
                            {item?.buyer.substr(0, 6) +
                              "..." +
                              item?.buyer.substr(item?.buyer.length - 4, 4)}
                          </li>
                          <li className="basis-[50%] text-[#666] text-[14px] text-center">
                            {item?.amount}
                          </li>
                        </ul>
                      );
                    })}
                  </div>
                )}
                <div className=" flex flex-col gap-2 p-4">
                  <p className="text-[#8652FF] text-[24px] ">Raffler</p>
                  <div className="flex items-center gap-2 ">
                    <a href={`/profile/raffle/${nftInfo.walletAddress}`}>
                      <p>{ShowCreator}</p>
                    </a>

                    <img src={IdCardIcon} />
                    {isTwitter && <img src={TwitterIcon} />}
                    {isDiscord && <img src={DiscordIcon} />}
                  </div>
                  {!nftInfo?.followed ? (
                    <button
                      className="bg-[#8652FF] max-w-fit rounded-[4px] py-[6px] px-[25px] text-white "
                      onClick={() => handleFollow(nftInfo._id, true)}
                    >
                      Follow
                    </button>
                  ) : (
                    <button
                      className="bg-[#8652FF] max-w-fit rounded-[4px] py-[6px] px-[25px] text-white "
                      onClick={() => handleFollow(nftInfo._id, false)}
                    >
                      Unfollow
                    </button>
                  )}
                </div>
                <div className="p-4">
                  <h1 className="text-2xl text-[##666666]">
                    Terms & Conditions
                  </h1>
                  <ul className="text-[##666666] mt-2 text-base list-decimal px-5">
                    <li>
                      All NFT prizes are held by raffle in escrow and can be
                      claimed by the winner or creator once the draw is done.
                    </li>
                    <li>Raffle tickets cannot be refunded once bought.</li>
                    <li>
                      Raffle tickets will not be refunded if you did not win the
                      raffle.
                    </li>
                    <li>You can only buy 20% of total tickets.</li>
                    <li>
                      You'll be charged 1% fees for swapping through Jupiter.
                    </li>
                    <li>
                      FFF receives a portion of the fees generated for anyone
                      utilizing the Raven services through our website.
                    </li>
                  </ul>
                </div>
              </div>

              {showEdit && (
                <button
                  type="button"
                  onClick={handleRaffleDeleteBtn}
                  className="bg-white-500 shadow-lg shadow-white-500/50 text-black bg-white rounded-[0.7rem] flex items-center py-3 px-5 mt-5 ml-[auto]"
                >
                  <p>Delete Raffle</p>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};
export default DetailRaffle;
