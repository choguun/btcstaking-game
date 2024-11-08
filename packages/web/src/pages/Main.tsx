
import {
    useWalletStore,
} from "@roochnetwork/rooch-sdk-kit";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/images/logos/btc-staking-logo.jpg";

import ConnectButton from "@/components/ConnectButton";

function Main() {
    const connectionStatus = useWalletStore((state) => state.connectionStatus);
    const navigate = useNavigate();
  
    return (
      <>
        <div className="flex flex-col items-center justify-center h-screen relative">
        {/* Background Layer */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-no-repeat bg-right"
                style={{
                backgroundImage: "url(assets/images/bg/mainpage_bg.webp)",
                filter: "brightness(50%)", // Use filter to adjust transparency
                opacity: 0.6,
                }}
            />
            {/* Content */}
            <div className="relative z-10 -mt-10 mb-5">
                <img
                src={Logo}
                className="w-[15vw] -mt-10"
                alt="logo"
                />
            </div>
            <div className="relative z-10">
                <ConnectButton />
                {connectionStatus === "connected" && (
                    <>
                    <br/>
                <button
                    className="p-4 bg-orange-400 text-white text-lg rounded-xl cursor-pointer mt-2"
                    onClick={() => navigate("/game")}
                >
                    PRESS START GAME
                </button>
                </>
                )}
            </div>
            <div className="relative z-10 mt-2 text-center underline">
                <a href={"https://test-portal.rooch.network/faucet/"} target="_blank">
                <span>FAUCET</span>
                </a>
            </div>
            <div className="relative z-10 mt-2 text-center">
                <span>Lived on Rooch Testnet</span>
                <br />
                {/* <span>Plan to deploy {NEXT_CHAIN_NAME}</span> */}
            </div>
            <div className="relative z-10 mt-2 text-center bg-red-700 p-7">
                <span className="text-red text-xl font-black">Please using Unisat / Bitget wallet</span>
            </div>
        </div>
      </>
    )
  }
  
  export default Main