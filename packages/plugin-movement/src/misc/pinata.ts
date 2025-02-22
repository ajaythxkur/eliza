import { PinataSDK } from "pinata-web3";
import { pinataJWT } from "./env";
const pinataGateway = "moccasin-ytterbic-prawn-373.mypinata.cloud"
const pinata = new PinataSDK({
    pinataJwt: pinataJWT,
    pinataGateway,
});

export async function uploadFileToIpfs(file: File) {
    return (await pinata.upload.file(file))
}
export async function getFileUrl(ipfsHash: string){
    // return (await pinata.gateways.get(ipfsHash))
    return `https://${pinataGateway}/ipfs/${ipfsHash}`

} 