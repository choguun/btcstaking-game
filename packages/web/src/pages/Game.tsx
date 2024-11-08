
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
        <button
          onClick={async () => {
              if (connectionStatus === "connected") {
                  setWalletDisconnected();
                  return;
              }
  
              await connectWallet({wallet: wallets[0]});
          }}
      >
          {connectionStatus === "connected"
              ? shortAddress(currentAddress?.toStr(), 8, 6) + " |" + (Number(BalanceResult?.balance) / (10 ** Number(BalanceResult?.decimals))).toFixed(2).toString() + BalanceResult?.symbol
              : "Connect Wallet"}
      </button>
      <div className="flex flex-col items-center justify-center">
            <div>
              <a href={"https://btcstaking.testnet.babylonchain.io/"} target="_blank">Stake more BTC</a>
            </div>
            <div>
                <span>Total Chips can mint</span>
                <span>0</span>
            </div>
            <div>
              <span>Current Chips</span>
              <span>0</span>
            </div>
            <div>
              <span></span>
            </div>
            <div>
              <input></input>
              <button>Mint Chips</button>
            </div>
            <div>
              <button>JOIN ROOM</button>
            </div>
      </div>
      </>
    )
  }
  
  export default Game