
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
import { Input } from "@/components/ui/input";

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
  
    return (
      <>
        <nav className="w-full p-4 bg-orange-400">
            <ConnectButton /> 
        </nav>
        <div className="flex flex-col items-center justify-center mb-10">
            <div className="mt-3">
              <a href={"https://btcstaking.testnet.babylonchain.io/"} className="text-xl underline text-blue-600" target="_blank">Stake more BTC(Babylon)</a>
            </div>
            <div className="mt-5 mx-auto p-10 bg-orange-300 rounded-md">
                <div>
                    <span className="font-bold">Total Chips can mint</span>
                    <span className="font-bold">: </span>
                    <span className="font-bold">0</span>
                </div>
                <div>
                    <span className="font-bold">Current Chips</span>
                    <span className="font-bold">: </span>
                    <span className="font-bold"> 0</span>
                </div>
                <div>
                    <span></span>
                </div>
                <div>
                    <input className="p-1 border border-1 border-solid border-black border-round-md" type="number"></input>
                    <Button className="ml-2">Mint Chips</Button>
                </div>
            </div>

            <div className="mt-5 mx-auto px-10 py-4 bg-orange-300 rounded-md flex flex-col items-center justify-center w-[50%]">
                <div>
                    <span className="font-black text-xl">Betting!</span>
                </div>
                <div className="mt-3">
                    <span className="">Bet Amount: </span>
                    <input className="p-1 border border-1 border-solid border-black border-round-md" type="number"></input>
                </div>
                <div className="mt-5">
                    <Button>
                        Create Battle Room
                    </Button>
                </div>
            </div>

            <div className="mt-5 mx-auto px-10 py-4 bg-orange-300 rounded-md flex flex-col items-center justify-center w-[50%]">
                <div>
                    <span className="font-black text-xl">Battle!</span>
                </div>
                <div className="mt-3 bg-orange-500 w-full p-2">
                    <span>Battle Room ID: </span><br/>
                    <span>Opponet Bet Chip: </span>
                </div>
                <div className="mt-3">
                    <span className="">Battle Room ID: </span>
                    <input className="p-1 border border-1 border-solid border-black border-round-md" type="number"></input>
                </div>
                <div className="mt-3">
                    <span className="">Bet Amount: </span>
                    <input className="p-1 border border-1 border-solid border-black border-round-md" type="number"></input>
                </div>
                <div className="mt-5">
                    <Button>
                        Battle
                    </Button>
                </div>
            </div>
        </div>
      </>
    )
  }
  
  export default Game