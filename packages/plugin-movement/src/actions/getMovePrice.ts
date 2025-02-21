import type {
    ActionExample,
    IAgentRuntime,
    Memory,
    Action,
    State,
    HandlerCallback,
} from "@elizaos/core";

export const movePriceAction: Action = {
    name: "MOVE_PRICE",
    similes: ["MOVE_TOKEN_PRICE", "MOVEMENT_PRICE", "MOVEMENT_USDT_PRICE"],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    description:
        "Call this action to get the price of a movement token in USDT",
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _options: any,
        _callback: HandlerCallback
    ): Promise<boolean> => {
        const response = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=MOVEUSDT");
        if(!response.ok){
            _callback({
                text: `I'm sorry, I couldn't get the price of movement token.`,
                inReplyTo: _message.id,
            });
            return true;
        }
        const data = await response.json();
        const price = Number(data.price).toFixed(2);

        _callback({
            text: `The price of movement token is $${price}`,
            inReplyTo: _message.id,
        });

        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Get me the price of movement token" },
            },
            {
                user: "{{user2}}",
                content: { text: "", action: "MOVE_PRICE" },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: { text: "What is the price of movement token in USDT?" },
            },
            {
                user: "{{user2}}",
                content: { text: "", action: "MOVE_PRICE" },
            },
        ],
    ] as ActionExample[][],
} as Action;
