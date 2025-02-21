import { Network, Aptos, AptosConfig } from "@aptos-labs/ts-sdk"
import { AptosChangeNetworkInput } from "@aptos-labs/wallet-standard"
const NETWORK_MAP: Record<string, AptosChangeNetworkInput> = {
    "27": {
        chainId: 27,
        name: Network.CUSTOM,
        url: "https://aptos.testnet.suzuka.movementlabs.xyz/v1",
    },
    "177": {
        chainId: 177,
        name: Network.CUSTOM,
        url: "https://aptos.testnet.porto.movementlabs.xyz/v1",
    },
    "250": {
        chainId: 250,
        name: Network.CUSTOM,
        url: "https://aptos.testnet.bardock.movementlabs.xyz/v1",
    },
    "126": {
        chainId: 126,
        name: Network.CUSTOM,
        url: "https://mainnet.movementnetwork.xyz/v1",
    },
};
const chainId = "250";
function getAptosClient() {
    const network = NETWORK_MAP[chainId];
    if (!network) {
        throw new Error(`Unsupported chainId: ${chainId}`);
    }
    return new Aptos(
        new AptosConfig({
            network: Network.CUSTOM,
            fullnode: network.url,
        })
    );
}

export const aptosClient = getAptosClient();

