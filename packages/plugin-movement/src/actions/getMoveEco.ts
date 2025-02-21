import type {
    ActionExample,
    IAgentRuntime,
    Memory,
    Action,
    State,
    HandlerCallback,
} from "@elizaos/core";

export const moveEcoAction: Action = {
    name: "MOVE_ECO",
    similes: ["MOVEMENT_ECOSYSTEM", "MOVE_ECOSYSTEM"],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    description:
        "Call this action to get the information on movement labs and its ecosystem",
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _options: any,
        _callback: HandlerCallback
    ): Promise<boolean> => {
        _callback({
            text: "You can find the information on movement labs and its ecosystem here: https://www.movementnetwork.xyz/",
            inReplyTo: _message.id,
        });
        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "What is cornucopia program?" },
            },
            {
                user: "{{user2}}",
                content: { text: "Cornucopia has numerous vaults grouped under 4 categories: BTC, ETH, stablecoin, and MOVE vaults. Concrete and Veda manage the vaults. Users can deposit compatible assets to these vaults. After an 8-week lockup period, assets unlock and flow back to users through Movement apps on Movement Public Mainnet Beta (coming soon). You can find more info here: https://www.movementnetwork.xyz/article/cornucopia-movement-defi-program", },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: { text: "Where can i find move developer docs?" },
            },
            {
                user: "{{user2}}",
                content: { text: "You can find the developer docs here: https://developer.movementnetwork.xyz/", },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: { text: "What apps are in movement ecosystem?" },
            },
            {
                user: "{{user2}}",
                content: { text: "You can find the list of apps in the movement ecosystem here: https://www.movementnetwork.xyz/ecosystem", },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: { text: "Give me whitepaper of movement labs?" },
            },
            {
                user: "{{user2}}",
                content: { text: "You can find the whitepaper of movement labs here: https://www.movementnetwork.xyz/whitepaper/movement-whitepaper_en.pdf", },
            },
        ],
    ] as ActionExample[][],
} as Action;
