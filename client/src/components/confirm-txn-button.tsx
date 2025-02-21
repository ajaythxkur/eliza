import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useWallet } from "@/context/WalletProvider";

function isValidTxnPayload(text: string): boolean {
    try {
        const content = JSON.parse(text);
        return (
            typeof content === "object" &&
            content !== null &&
            "function" in content &&
            "typeArguments" in content &&
            "functionArguments" in content
        );
    } catch {
        return false; // Invalid JSON
    }
}

const ConfirmTxnButton = ({ text }: { text: string }) => {
    const { signAndSubmitTransaction } = useWallet()
    if(!isValidTxnPayload(text)) return null;
  
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    onClick={async()=>{
                        const data = JSON.parse(text);
                        await signAndSubmitTransaction(data);
                    }}
                    variant="ghost"
                    size="icon"
                    className="flex items-center space-x-2 text-muted-foreground"
                >
                    <Check className="size-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                <p>Confirm Transaction</p>
            </TooltipContent>
        </Tooltip>
    );
};

export default ConfirmTxnButton;
