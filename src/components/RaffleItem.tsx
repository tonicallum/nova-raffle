import { useState, useEffect } from "react";
import Countdown, { CountdownApi } from "react-countdown";
import { Link } from "react-router-dom";
import axios from "axios";
import VerificationIcon from "../assets/verification-icon.svg";
import { API_URL } from "../config/dev";
import RedFavouriteIcon from "../assets/fav-icon.svg";
import GreyFavouriteIcon from "../assets/grey-fav-icon.svg";
import { getUser } from "../services/api";
import { useSelector } from "react-redux";

const RaffleItem = (props: any) => {
  const { item } = props;
  const [raffle, setRaffle] = useState({ ...item });
  const [sellAmount, setSellAmount] = useState(0);
  const [ShowCreator, setShowCreator] = useState("");
  const storeData: any = useSelector((status) => status);

  let startCountdownApi: CountdownApi | null = null;
  let endCountdownApi: CountdownApi | null = null;

  function formatAddress(address: string): string {
    const firstChars = address.slice(0, 3);
    const lastChars = address.slice(-4);
    return `${firstChars}...${lastChars}`;
  }

  const setStartCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      startCountdownApi = countdown.getApi();
    }
  };

  // const fetchRaffleRank = async () => {
  //   try {
  //     // let api_url = `${API_URL}/raffle/rank/${item?.tokenAddress}/${item?.tokenId}`;
  //     let api_url = `${API_URL}/raffle/rank/0xED5AF388653567Af2F388E6224dC7C4b3241C544/3427`;
  //     const res = await axios.get(api_url);
  //   } catch (error) {
  //     console.log("error", error);
  //   }
  // };

  // const fetchRaffleRank = async () => {
  //   try{

  //     let api_url = `https://api.opensea.io/api/v1/assets?order_direction=desc&offset=0&limit=50&asset_contract_address=${item.tokenAddress}&token_ids=${item.tokenId}`
  //     const res = await fetch(api_url);
  //   }catch(error){
  //     console.log("error", error);
  //   }
  // }

  const setEndCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      endCountdownApi = countdown.getApi();
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
        date={raffle.end_date * 1000}
        zeroPadTime={3}
        renderer={endCountdownRenderer}
      />
    ) : (
      <div className="flex gap-1">
        {/* <p>Starts In</p> */}
        <p>
          {days.toString().length === 1 ? `0${days}` : days}:
          {hours.toString().length === 1 ? `0${hours}` : hours}:
          {minutes.toString().length === 1 ? `0${minutes}` : minutes}:
          {seconds.toString().length === 1 ? `0${seconds}` : seconds}
        </p>
      </div>
    );
  };

  const endCountdownRenderer = ({
    api,
    days,
    hours,
    minutes,
    seconds,
    completed,
  }: any) => {
    if (api.isPaused()) api.start();
    return completed ? (
      <p>Ended</p>
    ) : (
      <div className="flex gap-1">
        {/* <p>End in</p> */}
        <p>
          {days.toString().length === 1 ? `0${days}` : days}:
          {hours.toString().length === 1 ? `0${hours}` : hours}:
          {minutes.toString().length === 1 ? `0${minutes}` : minutes}:
          {seconds.toString().length === 1 ? `0${seconds}` : seconds}
        </p>
      </div>
    );
  };

  const handleFavourite = async (id: any, favourite: boolean) => {
    try {
      const res = await axios.post(`${API_URL}/raffle/updateUserFavourite`, {
        id: id,
        favourite: favourite,
        walletAddress: storeData.address,
      });
      setRaffle({ ...raffle, favourite: favourite });
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setSellAmount(raffle.sold_tickets);
        setRaffle({
          ...item,
          favourited: raffle.favourite.includes(
            storeData.address.toLowerCase()
          ),
        });
        const user: any = await getUser(item.walletAddress);
        console.log('user joined ',user);
        if (user) {
          if (user.twitterName) {
            setShowCreator(user.twitterName);
          } else if (user.discordName) {
            setShowCreator(user.discordName);
          } else {
            setShowCreator(formatAddress(item.walletAddress));
          }
        } else {
          setShowCreator(formatAddress(item.walletAddress));
        }
        // const floorPrice = await getFloorPrice(item.name);
        // console.log('floor price aa raha hai??',floorPrice)
      } catch (error) {
        console.log("error", error);
      }
    })();
  }, [item]);

  // useEffect(() => {
  //   fetchRaffleRank();
  // });

  return (
    <div
      className="xl:basis-[32%] lg:basis-[32%] md:basis-[32%] sm:basis-[32%] basis-[100%] nftItem-hover cursor-pointer "
      style={{ maxWidth: "300px" }}
      key={raffle._id}
    >
      <div className="rounded-[0.9rem] overflow-hidden nftItem-shadow  ">
        <div className="relative">
          <img
            src={raffle.image}
            alt="CoodeImage"
            loading="lazy"
            className="min-h-[360px] object-contain"
          />

          {raffle?.favourited ? (
            <div
              className="absolute top-2 right-2 bg-white p-[8px] cursor-pointer rounded-[6px]"
              onClick={() => handleFavourite(raffle._id, false)}
            >
              <img src={RedFavouriteIcon} />
            </div>
          ) : (
            <div
              className="absolute top-2 right-2 bg-white p-[8px] cursor-pointer rounded-[6px]"
              onClick={() => handleFavourite(raffle._id, true)}
            >
              <img src={GreyFavouriteIcon} />
            </div>
          )}

          <div className=" absolute bottom-2 right-2 bg-[#8652FF]  flex overflow-hidden rounded-[4px] ">
            <p className="bg-white text-base text-center basis-[70%]  pl-2 pr-4 para-clip text-[10px]">
              TTV:{" "}
              {(raffle.price * (raffle.total_tickets - sellAmount)).toFixed(3)}
            </p>
            <p className="flex  text-center px-2 text-base basis-[30%] bg-[#8652FF]  text-white text-[10px] ">
              <span>FP:</span>
              <span>2.55</span>
            </p>
          </div>
        </div>
        <div className=" flex flex-col gap-[8px] bg-white p-[18px]  ">
          {/* {raffle.end_date * 1000 > Date.now() ? ( */}
            {/* <> */}
              <div>
                <div className="flex items-center">
                  {/* <span className="leading-none inline-block text-[20px] ">
                {raffle.project}
              </span> */}
                  <img
                    src={VerificationIcon}
                    alt="VerificationIcon"
                    style={{ width: "16px" }}
                    className="ml-1"
                  />
                </div>
                <h1 className="text-[16px]">{raffle.name}</h1>
                <a href={`/profile/raffle/${item.walletAddress}`}>
                  <p className="text-[#1A1A1A] text-[16px] "> {ShowCreator}</p>
                </a>
              </div>
              <div className="border-[1px] border-dashed border-[grey] rounded-[8px] p-[10px] flex flex-col gap-[10px] ">
                <div className="flex justify-between items-center">
                  <p className=" text-[#1A1A1A] text-[15px]">Ticket Price</p>
                  <p className="text-sm text-[#8652FF] font-medium ">
                    <span className="text-[12px]">{raffle.price}</span> MATIC
                  </p>
                </div>
                <div className="flex justify-between items-center ">
                  <p className=" text-[#1A1A1A] text-[15px]">
                    Tickets Remaining
                  </p>
                  <p className="text-sm text-[#8652FF] font-medium ">
                    <span className="text-[12px]">
                      {" "}
                      {raffle.total_tickets - sellAmount}{" "}
                    </span>{" "}
                    /{raffle.total_tickets}
                  </p>
                </div>
                <div className="flex justify-between items-center ">
                  <p className="text-[#1A1A1A] text-[15px]">
                    {raffle.start_date * 1000 > Date.now()
                      ? "Starts in"
                      : "Time remaining"}
                  </p>
                  <div className="text-sm text-[#8652FF] font-medium ">
                    <Countdown
                      ref={setStartCountdownRef}
                      date={raffle.start_date * 1000}
                      zeroPadTime={3}
                      // onComplete={() => setShowEdit(false)}
                      renderer={startCountdownRenderer}
                    />
                  </div>
                </div>
              </div>
            {/* </>
          ) : (
            <div className="flex justify-center flex-col">
              <p>Raffle Winner</p>
              <p>
                {item?.winnerAddress?.toLowerCase() ==
                storeData.address.toString().toLowerCase()
                  ? "You win!"
                  : item.winnerAddress
                  ? item.winnerAddress?.substr(0, 6) +
                    "..." +
                    item.winnerAddress?.substr(storeData?.address.length - 4, 4)
                  : ``}
              </p>
            </div>
          )} */}

          <div className="text-center mt-4 ">
            <Link
              to={`/raffle/detail/${raffle._id}`}
              className="bg-[#8652FF] text-white rounded-[4px] py-[10px] px-[10px] md:px-[80px] button-hover"
            >
              View Raffle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaffleItem;
