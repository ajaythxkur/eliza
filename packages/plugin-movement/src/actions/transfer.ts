import {
    type ActionExample,
    type IAgentRuntime,
    type Memory,
    type Action,
    type State,
    type HandlerCallback,
    elizaLogger,
    composeContext,
    generateObjectDeprecated,
    ModelClass,
    Content,
} from "@elizaos/core";
const MOVE_DECIMALS = 8;
export interface TransferContent extends Content {
    recipient: string;
    amount: string | number;
}
function isTransferContent(content: any): content is TransferContent {
    elizaLogger.debug("Validating transfer content:", content);
    return (
        typeof content.recipient === "string" &&
        (typeof content.amount === "string" ||
            typeof content.amount === "number")
    );
}
const transferTemplate = `You are processing a token transfer request. Extract the recipient address and amount from the message.

Example request: "can you send 1 move to 0x123..."
Example response:
\`\`\`json
{
    "recipient": "0x123...",
    "amount": "1"
}
\`\`\`

Rules:
1. The recipient address always starts with "0x"
2. The amount is typically a number less
3. Return exact values found in the message

Recent messages:
{{recentMessages}}

Extract and return ONLY the following in a JSON block:
- recipient: The wallet address starting with 0x
- amount: The number of tokens to send

Return ONLY the JSON block with these two fields.`;
export const transferAction: Action = {
    name: "MOVE_TRANSFER",
    similes: [
        "SEND_TOKEN",
        "TRANSFER_TOKEN",
        "TRANSFER_TOKENS",
        "SEND_TOKENS",
        "SEND_MOVE",
        "PAY",
    ],
    triggers: [
        "send move",
        "send 1 move",
        "transfer move",
        "send token",
        "transfer token",
        "can you send",
        "please send",
        "send"
    ],
    shouldHandle: (message: Memory) => {
        const text = message.content?.text?.toLowerCase() || "";
        return text.includes("send") && text.includes("move") && text.includes("0x");
    },
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        elizaLogger.debug("Starting transfer validation for user:", _message.userId);
        elizaLogger.debug("Message text:", _message.content?.text);
        return true;
    },
    priority: 1000,
    description:
        "Generate a transaction to transfer move tokens to a specified address",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: any,
        callback: HandlerCallback
    ): Promise<boolean> => {
         // Initialize or update state
         if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

         // Compose transfer context
         const transferContext = composeContext({
            state,
            template: transferTemplate,
        });

        // Generate transfer content
        const content = await generateObjectDeprecated({
            runtime,
            context: transferContext,
            modelClass: ModelClass.SMALL,
        });

        if (!isTransferContent(content)) {
            console.error("Invalid content for TRANSFER_TOKEN action.");
            if (callback) {
                callback({
                    text: "Unable to process transfer request. Invalid content provided.",
                    content: { error: "Invalid transfer content" },
                });
            }
            return false;
        }

        const adjustedAmount = 
            Number(content.amount) * Math.pow(10, MOVE_DECIMALS)

        const responseText = JSON.stringify({
            function: "0x1::aptos_account::transfer",
            typeArguments: [],
            functionArguments: [content.recipient, adjustedAmount],
        });

        if (callback) {
            callback({
                text: responseText,
                content: { text: "Sure, processing the transfer..." },
                inReplyTo: message.id,
            });
            callback({
                text: responseText,
                content: { text: responseText },
                inReplyTo: message.id,
                action: "TRANSACTION"
            });
        }
        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "I want to transfer {{amount}} move to {{address}}" },
            },
            {
                user: "{{user2}}",
                content: { text: "", action: "MOVE_TRANSFER" },
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
