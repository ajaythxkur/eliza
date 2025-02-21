import { AccountInfo, NetworkInfo, UserResponseStatus } from "@aptos-labs/wallet-standard";
import { NightlyConnectAptosAdapter } from "@nightlylabs/wallet-selector-aptos";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { NETWORK_MAP } from "../misc/utils";
import { toast } from "sonner"
import { getAdapter } from "../misc/adapter";
import { InputGenerateTransactionPayloadData, Signature } from "@aptos-labs/ts-sdk";
import ConnectWallet from "@/components/connect-wallet";
interface WalletContextType {
    userAccount: AccountInfo;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    signMessage: () => Promise<AptosSignMessageOutput | undefined>;
    signAndSubmitTransaction: (payload: InputGenerateTransactionPayloadData) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);
const MOVEMENT_CHAIN_IDS = [27, 177, 250, 126];
const REQUESTED_NETWORK = NETWORK_MAP["250"];

type AptosSignMessageOutput = {
    address?: string;
    application?: string;
    chainId?: number;
    fullMessage: string;
    message: string;
    nonce: string;
    prefix: 'APTOS';
    signature: Signature;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [userAccount, setUserAccount] = useState<AccountInfo>()
    const changeNetworkBeforeAction = useCallback(
        async (network: NetworkInfo, adapter: NightlyConnectAptosAdapter) => {
            if (!MOVEMENT_CHAIN_IDS.includes(network.chainId)) {
                const changeNetworkResponse = await adapter.changeNetwork(
                    REQUESTED_NETWORK
                );
                if (
                    changeNetworkResponse &&
                    changeNetworkResponse.status === UserResponseStatus.APPROVED
                ) {
                    toast.success("Network changed!");
                } else {
                    toast.error("User rejected network change");
                    throw new Error("Couldn't change network");
                }
            }
        },
        []
    );
    const connect = async () => {
        const adapter = await getAdapter();
        try {
            const response = await adapter.connect(
                undefined,
                REQUESTED_NETWORK
            );
            if (response.status === UserResponseStatus.APPROVED) {
                setUserAccount(response.args);
                // const network = await adapter.network();

                toast.success("Wallet connected!");
            } else {
                toast.error("User rejected connection");
                return;
            }
        } catch (error) {
            toast.error("Wallet connection failed!");
            // If error, disconnect ignore error
            await adapter.disconnect().catch(() => { });
            return;
        }
        try {
            // Check chainId
            const chainId = await adapter.network();
            await changeNetworkBeforeAction(chainId, adapter);
        } catch (error) {
            console.log(error);
        }
    }
    const disconnect = async () => {
        try {
            console.log("start");
            const adapter = await getAdapter();
            console.log(adapter);
            await adapter.disconnect();
            console.log("done");
            setUserAccount(undefined);
        } catch (error) {
            console.log(error);
        }
    }
    const signMessage = async () => {
        let response: AptosSignMessageOutput | undefined = undefined;
        const signMessage = async () => {
            const adapter = await getAdapter();
            let network = await adapter.network();
            await changeNetworkBeforeAction(network, adapter);
            const userResponse = await adapter.signMessage({
                message: "I love Nightly",
                address: true,
                nonce: "YOLO",
            });
            if (userResponse.status === UserResponseStatus.APPROVED) {
                response = userResponse.args
            }
        };
        toast.promise(signMessage, {
            loading: "Signing message...",
            success: (_) => {
                return `Message signed!`;
            },
            error: "Operation has been rejected!",
        });
        return response;
    }

    const signAndSubmitTransaction = async (payload: InputGenerateTransactionPayloadData) => {
        const signingToast = toast.info("Signing Transaction...");
        const adapter = await getAdapter();
        try {
            // we have to change the network to movement if we are on aptos
            let network = await adapter.network();
            // we have to do it here because the flow on mobile is different
            await changeNetworkBeforeAction(network, adapter);
            network = await adapter.network();

            const signedTx = await adapter.signAndSubmitTransaction({
                payload,
            });

            toast.dismiss(signingToast);

            if (signedTx.status !== UserResponseStatus.APPROVED) {
                throw new Error("Transaction rejected");
            }
            toast.success("Transaction signed and submitted!", {
                action: {
                    label: "View on Explorer",
                    onClick: () => {
                        window.open(
                            `https://explorer.movementlabs.xyz/txn/${signedTx.args.hash}?network=testnet`,
                            "_blank"
                        );
                    },
                },
            });
        } catch (error) {
            toast.error("Transaction rejected");
            toast.dismiss(signingToast);
            return;
        }
    }
    useEffect(() => {
        const init = async () => {
            const adapter = await getAdapter();
            if (await adapter.canEagerConnect()) {
                try {
                    const response = await adapter.connect();
                    if (response.status === UserResponseStatus.APPROVED) {
                        setUserAccount(response.args);
                        // const network = await adapter.network();
                    }
                } catch (error) {
                    await adapter.disconnect().catch(() => { });
                    console.log(error);
                }
            }
            // Events
            adapter.on("connect", (accInfo) => {
                if (accInfo && "address" in accInfo) {
                    setUserAccount(accInfo);
                }
            });

            adapter.on("disconnect", () => {
                setUserAccount(undefined);
                console.log("adapter disconnected");
            });

            adapter.on("accountChange", (accInfo) => {
                if (accInfo && "address" in accInfo) {
                    setUserAccount(accInfo);
                }
            });
        };
        init();
        // Try eagerly connect
    }, []);
    if(!userAccount) return <ConnectWallet connect={connect}/>
    return (
        <WalletContext.Provider value={{
            userAccount,
            connect,
            disconnect,
            signMessage,
            signAndSubmitTransaction,
        }}>
            {children}
        </WalletContext.Provider>
    )
}

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}