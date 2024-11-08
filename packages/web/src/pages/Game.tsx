
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
import React, {useState} from "react";
import {contractAddress, gameLogicModule, satTokenModule, roochGasCoinType} from "../constants.ts";

import ConnectButton from "@/components/ConnectButton";
import { Button } from "@/components/ui/button";

function Game() {
    const wallets = useWallets();
    const currentAddress = useCurrentAddress();
    const sessionKey = useCurrentSession();
    const connectionStatus = useWalletStore((state) => state.connectionStatus);
    const setWalletDisconnected = useWalletStore(
        (state) => state.setWalletDisconnected
    );
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
      <nav className="w-full p-4 bg-orange-400">
        <ConnectButton /> 
      </nav>
      <div className="flex flex-col items-center justify-center">
            <div className="mt-3">
              <a href={"https://btcstaking.testnet.babylonchain.io/"} className="text-xl underline text-blue-600" target="_blank">Stake more BTC(Babylon)</a>
            </div>
            <div className="mt-5 mx-auto p-10 bg-orange-300 rounded-md">
                <div>
                    <span>Total Chips can mint</span>
                    <span>: </span>
                    <span>0</span>
                </div>
                <div>
                    <span>Current Chips</span>
                    <span>: </span>
                    <span> 0</span>
                </div>
                <div>
                    <span></span>
                </div>
                <div>
                    <input></input>
                    <Button>Mint Chips</Button>
                </div>
            </div>

            <div className="mt-5 mx-auto p-10 bg-orange-300 rounded-md">
                <div>
                    <span>Create Room</span>
                </div>
            </div>
      </div>
      </>
    )
  }
  
  export default Game