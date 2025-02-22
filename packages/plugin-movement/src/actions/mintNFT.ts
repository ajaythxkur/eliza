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
    generateImage,
} from "@elizaos/core";
import { getFileUrl, uploadFileToIpfs } from "../misc/pinata";

export async function uploadBase64ToIpfs(base64String: string, fileName: string) {
    // Convert Base64 to Blob
    const byteCharacters = atob(base64String.split(',')[1]);
    const byteNumbers = new Uint8Array(byteCharacters.length).map((_, i) => byteCharacters.charCodeAt(i));
    const blob = new Blob([byteNumbers], { type: "image/jpeg" }); // Change type accordingly

    // Create File object
    const file = new File([blob], fileName, { type: "image/jpeg" });

    // Upload to IPFS using Pinata
    const pinResponse = await uploadFileToIpfs(file);
    const url =await getFileUrl(pinResponse.IpfsHash);
    return url;
}
const NFT_MODULE = `d3bccb5a984ac81e49868fc82056c523ccfbad7f75c80ce6a2a832b4b3b386ec::NFT`;
export interface PromptContent extends Content {
    recipient: string;
    amount: string | number;
}
function isPromptContent(content: any): content is PromptContent {
    elizaLogger.debug("Validating prompt content:", content);
    return (
        typeof content.prompt === "string"
    );
}

const promptTemplate = `You are processing a prompt for image generate request request. Extract the prompt for image from the message.

Example request 1: "i want to mint and nft of a cat"
Example response 1:
\`\`\`json
{
    "prompt": "cat",
}
\`\`\`

Example request 2: "generate me an image of cat"
Example response 2:
\`\`\`json
{
    "prompt": "cat",
}
\`\`\`

Rules:
1. Return exact values found in the message

Recent messages:
{{recentMessages}}

Extract and return ONLY the following in a JSON block:
- prompt: The prompt for image generation

Return ONLY the JSON block with this one field.`
const prefix =
    "A highly detailed character illustration in a [specific style, e.g., '70s retro, cyberpunk, anime, comic book'] style, featuring a vibrant color palette, expressive facial details, and dynamic lighting. The character should have a distinct personality, with well-defined clothing textures, accessories, and background elements that complement the theme. The artwork should maintain a cohesive aesthetic with a balance of realism and stylization.";
export const mintNFTAction: Action = {
    name: "MINT_NFT",
    similes: [
        "IMAGE_GENERATION",
        "GENERATE_IMAGE",
        "GET_IMAGE",
        "IMAGE",
    ],
    triggers: [
        "mint an nft",
        "generate an image",
        "can you generate an image",
        "i want an image",
        "image"
    ],
    shouldHandle: (message: Memory) => {
        const text = message.content?.text?.toLowerCase() || "";
        return text.includes("image");
    },
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        elizaLogger.debug("Starting transfer validation for user:", _message.userId);
        elizaLogger.debug("Message text:", _message.content?.text);
        return true;
    },
    priority: 1000,
    description:
        "Generate an image based on the prompt and mint it as an nft",
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
            template: promptTemplate,
        }); 

        // Generate transfer content
        const content = await generateObjectDeprecated({
            runtime,
            context: transferContext,
            modelClass: ModelClass.SMALL,
        });
        if (!isPromptContent(content)) {
            console.error("Invalid content for MINT_NFT action.");
            if (callback) {
                callback({
                    text: "Unable to process image request. Invalid content provided.",
                    content: { error: "Invalid prompt content" },
                });
            }
            return false;
        }
        let fullPrompt = `${prefix}\n${content.prompt}`
        const image = await generateImage({
            prompt: fullPrompt,
            height: 250,
            width: 250,
        }, runtime);
        const imageUrl = await uploadBase64ToIpfs(image.data[0], `image-${Date.now()}.jpg`);
        const responseText = JSON.stringify({
            function: `${NFT_MODULE}::mint`,
            typeArguments: [],
            functionArguments: [
                imageUrl,
            ],
        });

        if (callback) {
            callback({
                text: responseText,
                content: { text: responseText },
                inReplyTo: message.id,
                attachments: [
                    {
                        id: Math.random().toString(),
                        url: image.data[0],
                        title: "NFT Image",
                        source: "NFT",
                        description: "NFT Image",
                        text: "NFT Image",
                    }
                ],
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
