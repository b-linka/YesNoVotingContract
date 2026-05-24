import { metaMask } from "wagmi/connectors";

/**
 * Wagmi connectors for the project.
 * The app intentionally supports only MetaMask.
 */
export const wagmiConnectors = () => {
  if (typeof window === "undefined") {
    return [];
  }

  return [
    metaMask({
      dappMetadata: {
        name: "YesNoVoting",
      },
    }),
  ];
};
