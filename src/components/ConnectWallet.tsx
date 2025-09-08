import { Button } from "./ui/button";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "@wagmi/connectors";

export function ConnectWallet() {
  const { isConnected, address } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono">{address?.slice(0,6)}…{address?.slice(-4)}</span>
        <Button onClick={() => disconnect()}>Disconnect</Button>
      </div>
    );
  }
  return <Button onClick={() => connect({ connector: injected() })} disabled={isPending}>Connect Wallet</Button>;
}
