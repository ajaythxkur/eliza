import type { Plugin } from "@elizaos/core";
export * as actions from "./actions/index.ts";
export * as evaluators from "./evaluators/index.ts";
export * as providers from "./providers/index.ts";
import { movePriceAction } from "./actions/getMovePrice.ts";
import { moveEcoAction } from "./actions/getMoveEco.ts";
import { transferAction } from "./actions/transfer.ts";
import { mintNFTAction } from "./actions/mintNFT.ts";
export const movementPlugin: Plugin = {
    name: "movement",
    description: "Agent movement plugin with knowledge of aptos move and aptos labs sdk",
    actions: [
        movePriceAction,
        moveEcoAction,
        transferAction,
        mintNFTAction,
    ],
    evaluators: [],
    providers: [],
};
export default movementPlugin;
