import { BrowserRouter, Routes, Route } from "react-router-dom";

import Raffle from "./pages/Raffle/Raffle";
import CreateRaffle from "./pages/Raffle/CreateRaffle";
import DetailRaffle from "./pages/Raffle/DetailRaffle";
import DetailRaffle1155 from "./pages/Raffle/DetailRaffle1155";
import EditRaffle from "./pages/Raffle/EditRaffle";
import RaffleProfile from "./pages/Raffle/Profile";
import RaffleOtherProfile from "./pages/Raffle/OtherProfile";

import "./App.css";
import LeaderBoard from "./pages/LeaderBoard/LeaderBoard";

import { WagmiConfig, createConfig, configureChains, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

const App = () => {
  return (
    <WagmiConfig config={config}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Raffle />} />
          <Route path="/raffle/create" element={<CreateRaffle />} />
          <Route path="/leaderboard" element={<LeaderBoard />} />
          <Route path="raffle/:id" element={<EditRaffle />} />
          <Route path="/raffle/detail/:id" element={<DetailRaffle />} />
          <Route path="/profile/raffle/" element={<RaffleProfile />} />
          <Route path="/profile/raffle/:id" element={<RaffleOtherProfile />} />
          <Route path="/raffle1155/detail/:id" element={<DetailRaffle1155 />} />
        </Routes>
      </BrowserRouter>
    </WagmiConfig>
  );
};

export default App;
