
import {Args, Transaction} from "@roochnetwork/rooch-sdk";
import {
    UseSignAndExecuteTransaction,
    useConnectWallet,
    useCreateSessionKey,
    useCurrentAddress,
    useCurrentSession,
    useRemoveSession,
    useRoochClientQuery,
    useWalletStore,
    useWallets,
} from "@roochnetwork/rooch-sdk-kit";
import {enqueueSnackbar} from "notistack";
import React, {useState} from "react";
import {shortAddress} from "../utils";
import {contractAddress, puzzlefiCoinModule, puzzleGameModule, roochGasCoinType} from "../constants.ts";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/images/logos/btc-staking-logo.jpg";

import ConnectButton from "@/components/ConnectButton";

function Main() {
    const wallets = useWallets();
    const currentAddress = useCurrentAddress();
    const sessionKey = useCurrentSession();
    const connectionStatus = useWalletStore((state) => state.connectionStatus);
    const setWalletDisconnected = useWalletStore(
        (state) => state.setWalletDisconnected
    );
    const navigate = useNavigate();
    const {mutateAsync: connectWallet} = useConnectWallet();
  
    const {mutateAsync: createSessionKey} = useCreateSessionKey();
    const {mutateAsync: removeSessionKey} = useRemoveSession();
    const {mutateAsync: signAndExecuteTransaction} = UseSignAndExecuteTransaction();
  
    const {data: BalanceResult, refetch} = useRoochClientQuery("getBalance", {
      owner: currentAddress?.genRoochAddress().toStr() || "",
      coinType: roochGasCoinType
    })
  
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
                    className="p-4 bg-orange-400 text-white text-xl rounded-xl cursor-pointer mt-2"
                    onClick={() => navigate("/game")}
                >
                    PRESS START GAME
                </button>
                </>
                )}
            </div>
            <div className="relative z-10 mt-2 text-center">
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