"use client";

import { useEffect, useMemo, useState } from "react";
import { Address as AddressDisplay } from "@scaffold-ui/components";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { WrongNetworkDropdown } from "~~/components/scaffold-eth/RainbowKitCustomConnectButton/WrongNetworkDropdown";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

/**
 * Minimal MetaMask-only connect button for the course project.
 */
export const RainbowKitCustomConnectButton = () => {
  const { address, chain, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { targetNetwork } = useTargetNetwork();
  const [hasMetaMask, setHasMetaMask] = useState(false);

  useEffect(() => {
    setHasMetaMask(Boolean((window as any).ethereum?.isMetaMask));
  }, []);

  const metaMaskConnector = useMemo(
    () => connectors.find(connector => connector.name.toLowerCase().includes("metamask")) ?? connectors[0],
    [connectors],
  );

  if (isConnected && chain && chain.id !== targetNetwork.id) {
    return <WrongNetworkDropdown />;
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <AddressDisplay address={address} chain={targetNetwork} />
        <button className="btn btn-outline btn-sm" onClick={() => disconnect()} type="button">
          Отключить
        </button>
      </div>
    );
  }

  if (!hasMetaMask) {
    return <div className="badge badge-outline badge-lg">MetaMask не найден</div>;
  }

  return (
    <button
      className="btn btn-primary btn-sm"
      disabled={!metaMaskConnector || isPending}
      onClick={() => metaMaskConnector && connect({ connector: metaMaskConnector })}
      type="button"
    >
      {isPending ? "Подключение..." : "Подключить MetaMask"}
    </button>
  );
};
