import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { connectedChain, datetimeLocal } from "../../utils";
import CONFIG from "../../config";
import NFTModal from "../../components/NFTModal";
import Navbar from "../../components/Navbar";
import SelectNFTIcon from "../../assets/Select-NFT-Icon.png";
import { getRaffleById, updateRaffle, deleteRaffle } from "../../services/api";
import { CancelRaffleContract } from "../../services/contracts/raffle";

const { TOAST_TIME_OUT } = CONFIG;

const EditRaffle = () => {
  const navigate = useNavigate();
  const storeData: any = useSelector((status) => status);
  const { id } = useParams();
  const [isLoading, setLoading] = useState(false);
  const [isModal, setModal] = useState(false);
  const [updateBtnActive, setUpdateBtnActive] = useState(false);
  const [nftName, setNftName] = useState("Select Nft");
  const [contractType, setContractType] = useState(``);

  const [raffleValue, setRaffleValue] = useState<any>({
    id: 0,
    project: ``,
    description: ``,
    image: ``,
    imageFile: "",
    discord: ``,
    twitter: ``,
    total_tickets: `0`,
    price: `0`,
    start_date: new Date(),
    end_date: new Date(),
    mint: ``,
  });

  const handleRaffleDeleteBtn = async () => {
    try {
      const chainStatus = await connectedChain();
      if (!chainStatus) return;

      if (!updateBtnActive) {
        toast.error(`You can't delete`);
        return;
      }

      setLoading(true);

      let raffleDeleteTx;

      raffleDeleteTx = await CancelRaffleContract(raffleValue.raffleId);

      if (raffleDeleteTx) {
        const res = await deleteRaffle(id);
        if (res) {
          toast("Success in delete raffle", {
            onClose: () => {
              setTimeout(() => {
                navigate("/");
              }, TOAST_TIME_OUT);
            },
          });
        } else {
          toast("Error in delete raffle");
        }
      }

      setLoading(false);
    } catch (error) {
      console.log("error", error);
      setLoading(false);
      toast("Error in delete raffle");
    }
  };

  const handleClickModal = () => {
    toast.error(`NFT can't update`);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (id) {
          const nftInfoById: any = await getRaffleById(id);
          setRaffleValue({
            ...nftInfoById,
            start_date: new Date(nftInfoById.start_date * 1000),
            end_date: new Date(nftInfoById.end_date * 1000),
          });
          setNftName(nftInfoById.name);
          setContractType(nftInfoById.type);
          if (nftInfoById.start_date * 1000 > Date.now()) {
            setUpdateBtnActive(true);
          }
        }
      } catch (error) {
        console.log("error", error);
      }
      setLoading(false);
    })();
  }, [id]);

  return (
    <div>
      {isLoading ? (
        <div id="preloader"></div>
      ) : (
        <div id="preloader" style={{ display: "none" }}></div>
      )}
      <div className="bg-white">
        <Navbar />
        <div className="max-w-[768px] m-auto pt-20 pb-16 px-4 md:px-0">
          <h1 className="text-center text-black text-4xl">Edit NFT Raffle</h1>
          <div className="mt-6 md:px-8 px-4 pt-8 pb-8  rounded-[0.7rem] nftItem-shadow bg-white border-[none]">
            <div className="md:flex block justify-center items-center">
              {/* <label
								htmlFor="profilePic"
								className="text-[#fff] border-2 md:mb-0 mb-4 min-h-[295px] basis-[46%] flex items-center justify-center flex-col p-8  bg-[#8652FF] rounded-[0.7rem] cursor-pointer"
								onClick={handleClickModal}
							>
								<img
									src={
										raffleValue?.image
											? raffleValue?.image
											: SelectNFTIcon
									}
									alt="SelectNFTIcon"
								/>

								<span className="text-[fff] text-xl mt-3">
									{" "}
									{nftName}
								</span>

								<span className="text-[fff] text-md mt-2">
									{" "}
									{contractType}
								</span>
							</label> */}
              <div className="basis-[48%]">
                <label
                  htmlFor="profilePic"
                  className="text-[#fff] border-2 md:mb-0 mb-4 min-h-[295px] basis-[46%] flex items-center justify-center flex-col p-8  bg-[#8652FF] rounded-[0.7rem] cursor-pointer"
                  onClick={handleClickModal}
                >
                  <img
                    src={
                      raffleValue?.image ? raffleValue?.image : SelectNFTIcon
                    }
                    alt="SelectNFTIcon"
                  />

                  <span className="text-[fff] text-xl mt-3"> {nftName}</span>

                  <span className="text-[fff] text-md mt-2">
                    {" "}
                    {contractType}
                  </span>
                </label>
                {/* <div className="mb-5">
									<label
										className="text-[#1A1A1A] text-lg inline-block mb-1"
										htmlFor="project"
									>
										Project
									</label>
									<div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
										<input
											id="project"
											name="project"
											placeholder="Project"
											value={raffleValue.project}
											onChange={(e) =>
												setRaffleValue({
													...raffleValue,
													project: e.target.value,
												})
											}
											className="bg-white w-full text-[#1A1A1A] placeholder:text-[#606060] p-3 outline-none"
										/>
									</div>
								</div> */}
                {/*<div className="mb-5">
									<label
										className="text-[#1A1A1A] text-lg inline-block mb-1"
										htmlFor="ticketprice"
									>
										Ticket Price
									</label>
									<div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
										<input
											type="number"
											id="ticketprice"
											name="ticketprice"
											placeholder="1.00"
											value={raffleValue.price}
											onChange={(e) =>
												setRaffleValue({
													...raffleValue,
													price: Number(
														e.target.value
													),
												})
											}
											className="bg-white w-full text-[#1A1A1A] placeholder:text-[#606060] p-3 outline-none"
										/>
									</div>
								</div> */}
                {/*<div className="mb-5">
									<label
										className="text-[#1A1A1A] text-lg inline-block mb-1"
										htmlFor="startdate"
									>
										Start Date
									</label>
									<div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
										<input
											type="datetime-local"
											id="startdate"
											name="startdate"
											value={datetimeLocal(
												raffleValue.start_date
											)}
											onChange={(e) =>
												setRaffleValue({
													...raffleValue,
													start_date: new Date(
														e.target.value
													),
												})
											}
											className="bg-white w-full text-[#1A1A1A] placeholder:text-[#606060] p-3 outline-none"
										/>
									</div>
								</div> */}
                {/*<div className="mb-5">
									<label
										className="text-[#1A1A1A] text-lg inline-block mb-1"
										htmlFor="enddate"
									>
										End Date
									</label>
									<div className="relative border-2 border-[#1A1A1A] rounded-[0.5rem] overflow-hidden">
										<input
											type="datetime-local"
											id="enddate"
											name="enddate"
											value={datetimeLocal(
												raffleValue.end_date
											)}
											onChange={(e) =>
												setRaffleValue({
													...raffleValue,
													end_date: new Date(
														e.target.value
													),
												})
											}
											className="bg-white w-full text-[#1A1A1A] placeholder:text-[#606060] p-3 outline-none"
										/>
									</div>
								</div> */}
                {/*<div className="mb-5">
									<label
										className="text-[#1A1A1A] text-lg inline-block mb-1"
										htmlFor="ticketsupply"
									>
										Total Ticket Supply
									</label>
									<div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
										<input
											type="number"
											pattern="[0-9]*"
											id="ticketsupply"
											name="ticketsupply"
											placeholder="2-10000"
											className="bg-white w-full text-[#1A1A1A] placeholder:text-[#606060] p-3 outline-none"
											value={raffleValue.total_tickets}
											onChange={(e) =>
												setRaffleValue({
													...raffleValue,
													total_tickets:
														e.target.value,
												})
											}
										/>
									</div>
								</div> */}
                {/* <div className="mb-5">
                  <label
                    className="text-[#1A1A1A] text-lg inline-block mb-1"
                    htmlFor="twitterlink"
                  >
                    Twitter Link
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      type="text"
                      id="twitterlink"
                      name="twitterlink"
                      placeholder="https://twitter.com/xxxxxx"
                      value={raffleValue.twitter}
                      onChange={(e) =>
                        setRaffleValue({
                          ...raffleValue,
                          twitter: e.target.value,
                        })
                      }
                      className="bg-white w-full text-[#1A1A1A] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label
                    className="text-[#1A1A1A] text-lg inline-block mb-1"
                    htmlFor="discordlink"
                  >
                    Discord Link
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      type="text"
                      id="twitterlink"
                      name="twitterlink"
                      placeholder="https://discord.com/xxxxxx"
                      value={raffleValue.discord}
                      onChange={(e) =>
                        setRaffleValue({
                          ...raffleValue,
                          discord: e.target.value,
                        })
                      }
                      className="bg-white w-full text-[#1A1A1A] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label
                    className="text-[#1A1A1A] text-lg inline-block mb-1"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <div className="relative  overflow-hidden">
                    <textarea
                      rows={3}
                      value={raffleValue.description}
                      onChange={(e) =>
                        setRaffleValue({
                          ...raffleValue,
                          description: e.target.value,
                        })
                      }
                      placeholder="description"
                      className="bg-white border-2 border-[#606060] rounded-[0.5rem] w-full text-[#1A1A1A] placeholder:text-[#606060] p-3 outline-none resize-none h-full"
                    />
                  </div>
                </div> */}
              </div>
            </div>
            <div className="flex justify-center gap-[16px] mt-8 ">
              {/* <div className="flex justify-center -mt-6">
								<p
									onClick={handleRaffleUpdateBtn}
									className={`cursor-pointer text-white bg-[#8652FF] rounded-[0.5rem] flex items-center py-3 px-5 mt-8 `}
								>
									Update Raffle
								</p>
							</div> */}
              {/* <div className="flex justify-center -mt-6">
								<p
									onClick={handleRaffleFinishBtn}
									className={`cursor-pointer text-white bg-[#8652FF] rounded-[0.5rem] flex items-center py-3 px-5 mt-8 `}
								>
									Finish Raffle
								</p>
							</div> */}
              <div className="flex justify-center -mt-6">
                <p
                  onClick={handleRaffleDeleteBtn}
                  className={`cursor-pointer text-white bg-[#8652FF] rounded-[0.5rem] flex items-center py-3 px-5 mt-8 `}
                >
                  Delete Raffle
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NFTModal
        title="Select an NFT to raffle!"
        show={isModal}
        setNftName={setNftName}
        onCancel={() => setModal(false)}
        raffleValue={raffleValue}
        setRaffleValue={setRaffleValue}
        setContractType={setContractType}
      />
      <ToastContainer />
    </div>
  );
};

export default EditRaffle;
