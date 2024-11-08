import {
    useConnectWallet,
    useCurrentAddress,
    useRoochClientQuery,
    useWalletStore,
    useWallets,
} from "@roochnetwork/rooch-sdk-kit";
import { shortAddress } from "../utils";
import { roochGasCoinType } from "../constants.ts";
import { Button } from "@/components/ui/button";

const ConnectButton = () => {
    const wallets = useWallets();
    const currentAddress = useCurrentAddress();
    const connectionStatus = useWalletStore((state) => state.connectionStatus);
    const setWalletDisconnected = useWalletStore(
        (state) => state.setWalletDisconnected
    );
    const {mutateAsync: connectWallet} = useConnectWallet();
  
    const {data: BalanceResult, refetch} = useRoochClientQuery("getBalance", {
      owner: currentAddress?.genRoochAddress().toStr() || "",
      coinType: roochGasCoinType
    })
  
    return (
      <Button
        onClick={async () => {
            if (connectionStatus === "connected") {
                setWalletDisconnected();
                return;
            }
  
            await connectWallet({wallet: wallets[0]});
        }}
    >
        {connectionStatus === "connected"
            ? shortAddress(currentAddress?.toStr(), 8, 6) + " | " + (Number(BalanceResult?.balance) / (10 ** Number(BalanceResult?.decimals))).toFixed(2).toString() + BalanceResult?.symbol
            : "Connect Wallet"}
    </Button>
    )
}

export default ConnectButton;