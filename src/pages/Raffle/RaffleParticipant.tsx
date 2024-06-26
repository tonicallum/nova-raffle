import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Countdown, { CountdownApi } from "react-countdown";

import VerificationIcon from "../../assets/Verification-icon-2.png";
import VeiwIcon from "../../assets/view_icon.svg";
import TimingIcon from "../../assets/Subtract-timing-icon.png";
import TicketIcon from "../../assets/Subtract-ticket-icon.png";
import BoughtIcon from "../../assets/Subtract-bought-icon.png";
import WinningIcon from "../../assets/Subtract-winning-icon.png";
import { getTicketsById } from "../../services/api";

const RaffleRarticipant = (props: any) => {
  const { item, idx, mode } = props;
  const storeData: any = useSelector((status) => status);
  const [sellAmount, setSellAmount] = useState(0);
  const [winningChance, setWinningChance] = useState(0);

  let startCountdownApi: CountdownApi | null = null;
  let endCountdownApi: CountdownApi | null = null;

  const setStartCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      startCountdownApi = countdown.getApi();
    }
  };

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
        date={item.end_date * 1000}
        zeroPadTime={3}
        renderer={endCountdownRenderer}
      />
    ) : (
      <div className="flex items-center gap-4 ">
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
      <div>
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

  useEffect(() => {
    (async () => {
      try {
        if (storeData.wallet !== "connected") return;

        const getTicketByID = (await getTicketsById(item._id)) as any[];
        let filter_TicketByID = getTicketByID.filter(
          (person: any, index: any) =>
            index ===
            getTicketByID.findIndex(
              (other: any) => person.buyer === other.buyer
            )
        );
        let totalAmount = 0;
        for (let i = 0; i < filter_TicketByID.length; i++) {
          totalAmount += filter_TicketByID[i].amount;
        }
        setSellAmount(totalAmount);

        const getTicketsOwned = filter_TicketByID.find(
          (item: any) =>
            item.buyer.toString().toLowerCase() ===
            storeData.address.toLowerCase()
        );
        console.log("getTicketsOwned", getTicketsOwned);
        const resTicketsOwned = getTicketsOwned?.amount
          ? getTicketsOwned?.amount
          : 0;
        const getWinningChance: any =
          totalAmount > 0 ? (100 * resTicketsOwned) / totalAmount : 0;
        setWinningChance(getWinningChance.toFixed(2));
      } catch (error) {
        console.log("error", error);
      }
    })();
  }, [storeData]);

  return (
    <div key={idx}>
      <div className="m-auto px-4">
  <div className="border-2 border-white bg-[#8652FF] rounded-md mb-4">
    <div className="flex flex-col p-4 sm:flex-row">
      <div className="flex basis-full sm:basis-[30%]">
        <div className="mr-2">
          <img
            src={item?.image ? item?.image : ''}
            alt="Coode"
            className="min-w-[110px] h-[110px] w-full object-cover rounded-[16px]"
          />
        </div>
        <div>
          <div className="flex flex-col gap-[15px] h-full">
            <div>
              <div className="flex items-center">
                <img src={VerificationIcon} alt="VerificationIcon" />
                <span className="text-lg text-white inline-block ml-1">
                  {item?.project}
                </span>
              </div>
              <h1 className="text-[16px] text-white mt-1">{item?.name}</h1>
            </div>
            <div>
              <Link
                to={`/raffle/detail/${item?._id}`}
                type="button"
                className="max-w-fit flex items-center bg-white rounded-[2.5px] px-[5px]"
              >
                <img src={VeiwIcon} alt="VeiwIcon" />
                <span className="ml-1">View Raffle</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row justify-around pt-2 w-full sm:basis-[70%]">
        <div className="text-center flex flex-col items-center">
                <img
                  src={TimingIcon}
                  alt="TimingIcon"
                  className="mb-2 w-[60px]"
                />
          <p className="text-white text-[15px]">
                {item?.start_date * 1000 > Date.now()
                  ? "Starts in"
                  : "Time remaining"}
              </p>
          <p className="text-white">
            <Countdown
              ref={setStartCountdownRef}
              date={item?.start_date ? item?.start_date * 1000 : 0}
              zeroPadTime={3}
              renderer={startCountdownRenderer}
            />
          </p>
        </div>
        <div className="text-center flex flex-col items-center">
                <img
                  src={TicketIcon}
                  alt="TimingIcon"
                  className="mb-2 w-[60px]"
                />
          <h1 className="text-[#fff]">Tickets Remaining</h1>
          <p className="text-white">{item?.total_tickets - sellAmount}</p>
        </div>
              {mode !== 1 && (
          <>
            <div className="text-center flex flex-col items-center">
                    <img
                      src={BoughtIcon}
                      alt="TimingIcon"
                      className="mb-2 w-[60px]"
                    />
              <h1 className="text-[#fff]">Tickets Bought</h1>
              <p className="text-white">{sellAmount}</p>
            </div>
            <div className="text-center flex flex-col items-center">
                    <img
                      src={WinningIcon}
                      alt="TimingIcon"
                      className="mb-2 w-[60px]"
                    />
              <h1 className="text-[#fff]">Winning Chance</h1>
              <p className="text-white">{winningChance}%</p>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
</div>

    </div>
  );
};

export default RaffleRarticipant;
