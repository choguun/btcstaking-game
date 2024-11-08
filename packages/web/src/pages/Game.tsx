
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
import React, { useState } from "react";
import toast from "react-hot-toast";

import { contractAddress, gameLogicModule, satTokenModule, roochGasCoinType } from "../constants.ts";

import ConnectButton from "@/components/ConnectButton";
import { Button } from "@/components/ui/button";

function Game() {
    const wallets = useWallets();
    const currentAddress = useCurrentAddress();
    const {mutateAsync: connectWallet} = useConnectWallet();
  
    const {mutateAsync: createSessionKey} = useCreateSessionKey();
    const {mutateAsync: removeSessionKey} = useRemoveSession();
    const sessionKey = useCurrentSession();
    const {mutateAsync: signAndExecuteTransaction} = UseSignAndExecuteTransaction();

    const [totalChip, setTotalChip] = useState(10000);
    const [mintAmount, setMintAmount] = useState(0);
    const [betAmount, setBetAmount] = useState(0);
    const [battleRoomId, setBattleRoomId] = useState(0);
    const [, setTxnLoading] = useState(false);
    const [sessionLoading, setSessionLoading] = useState(false);

    const handlerCreateSessionKey = async () => {
        if (sessionLoading) {
            return;
        }
        setSessionLoading(true);
        const defaultScopes = [`${contractAddress}::*::*`];
        createSessionKey(
            {
                appName: "btcstaking",
                appUrl: "http://localhost:5173",
                maxInactiveInterval: 3600,
                scopes: defaultScopes,
            },
            {
                onSuccess: (result) => {
                    console.log("session key", result);
                },
                onError: (error) => {
                    if (String(error).includes("1004")) {
                        toast.error("Insufficient gas, please claim gas first");
                    } else {
                        toast.error(String(error));
                    }
                },
            }
        ).finally(() => setSessionLoading(false));
    };

    const {data: coins, refetch: coinsFetch} = useRoochClientQuery("executeViewFunction", {
        target: `0x3::account_coin_store::balance`,
        args: [Args.address(currentAddress?.genRoochAddress().toStr() || "")],
        typeArgs: [`${contractAddress}::${satTokenModule}::SAT<${roochGasCoinType}>`]
    });


  
    return (
      <>
        <nav className="w-full p-4 bg-orange-400 h-[65px]">
            <span className="font-bold mr-5"><a href="/">BTC STAKING IDLE BATTLE GAME</a></span>
            <div className="float-right">
                <ConnectButton />
            </div>
        </nav>
        <div className="flex flex-col items-center justify-center mb-10">
            <div className="mt-3">
              <a href={"https://btcstaking.testnet.babylonchain.io/"} className="text-xl underline text-blue-600" target="_blank">Stake more BTC(Babylon)</a>
            </div>
            <div className="mt-5">
                {!sessionKey ? (
                    <Button
                        onClick={() => {
                        handlerCreateSessionKey();
                        }}
                    >
                        Create Session Key
                    </Button>
                    ) : (
                    <Button
                        className="bg-red-500"
                        onClick={() => {
                        removeSessionKey({ authKey: sessionKey.getAuthKey() });
                        }}
                    >
                        Clear Session
                    </Button>
                )}
            </div>
            <div className="mt-3 mx-auto px-10 py-6 bg-orange-300 rounded-md">
                <div>
                    <span className="font-bold">Total Chips can mint</span>
                    <span className="font-bold">: </span>
                    <span className="font-bold">{totalChip.toLocaleString(undefined)}</span>
                </div>
                <div>
                    <span className="font-bold">Current Chips</span>
                    <span className="font-bold">: </span>
                    <span className="font-bold"> {(Number(Number(coins?.return_values?.[0].decoded_value.toString()))) || 0}</span>
                </div>
                <div>
                    <span></span>
                </div>
                <div>
                    <input className="p-1 border border-1 border-solid border-black border-round-md" type="number" onChange={(data) => setMintAmount(parseInt(data.target.value))}></input>
                    <Button className="ml-2" 
                        onClick={
                                async () => {
                                    try {
                                        setTxnLoading(true);
                                        const txn = new Transaction();
                                        txn.callFunction({
                                            address: contractAddress,
                                            module: gameLogicModule,
                                            function: "mint_chip",
                                            args: [
                                                // amount
                                                Args.u256(BigInt(mintAmount)),
                                            ],
                                            typeArgs: [roochGasCoinType]
                                        });
                                        const res = await signAndExecuteTransaction({transaction: txn});
                                        if (res.execution_info.status.type === "executed") {
                                            toast.success("mint success");
                                        } else if (res.execution_info.status.type === "moveabort") {
                                            toast.error("mint failed");
                                        }
                                        await Promise.all([coinsFetch()]);
                                    } catch (error) {
                                        console.error(String(error));
                                    } finally {
                                        setTxnLoading(false);
                                    }
                                }
                    }>
                        Mint Chips
                    </Button>
                </div>
            </div>

            <div className="mt-5 mx-auto px-10 py-4 bg-orange-300 rounded-md flex flex-col items-center justify-center w-[50%]">
                <div>
                    <span className="font-black text-xl">Betting!</span>
                </div>
                <div className="mt-3">
                    <span className="">Bet Amount: </span>
                    <input className="p-1 border border-1 border-solid border-black border-round-md" type="number" onChange={(data) => setBetAmount(parseInt(data.target.value))}></input>
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
                    <input className="p-1 border border-1 border-solid border-black border-round-md" type="number" onChange={(data) => setBattleRoomId(parseInt(data.target.value))}></input>
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

            <div className="mt-5 mx-auto px-10 py-4 bg-orange-300 rounded-md flex flex-col items-center justify-center w-[50%]">
                <div>
                    <span className="font-black text-xl">Result!</span>
                </div>
                <div className="mt-3 bg-orange-500 w-full p-2 text-center text-md">
                    <span className="font-black">You are: Winner</span><br/>
                    <hr className="mt-3 mb-3 border-black" />
                    <span>Round: 1: Win</span><br/>
                    <span>Round: 2: Lose</span><br/>
                    <span>Round: 2: Win</span>
                </div>
            </div>
        </div>
      </>
    )
  }
  
  export default Game